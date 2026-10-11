/**
 * Export character dialogue from 游戏/assets/story*.js
 * Run from repo root:
 *   node tools/导出对白.mjs
 * Writes UTF-8 Markdown under 策划/剧本/_导出/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assets = path.join(root, "游戏", "assets");
const outDir = path.join(root, "策划", "剧本", "_导出");

let storyFiles = fs
  .readdirSync(assets)
  .filter((f) => /^story(-[a-z]+)?\.js$/i.test(f));
// Prefer split parts; ignore stub story.js when parts exist
if (storyFiles.some((f) => f.startsWith("story-"))) {
  storyFiles = storyFiles.filter((f) => f !== "story.js");
}
storyFiles.sort((a, b) => {
  const order = ["story-early.js", "story-clinic.js", "story-late.js", "story.js"];
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  return a.localeCompare(b);
});

/** @type {{ file: string, fn: string, who: string, text: string, zh: string, line: number }[]} */
const rows = [];

const fnRe = /^function\s+([A-Za-z0-9_]+)\s*\(/;
const lineRe =
  /line\(\s*"([^"]*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/;

function unescapeJs(s) {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function extractZh(extra) {
  if (!extra) return "";
  const m = extra.match(/zh:\s*"((?:\\.|[^"\\])*)"/);
  return m ? unescapeJs(m[1]) : "";
}

function escCell(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, "↵");
}

function scanFile(fileName) {
  const src = fs.readFileSync(path.join(assets, fileName), "utf8");
  const lines = src.split(/\r?\n/);
  let currentFn = "(top)";
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const fm = raw.match(fnRe);
    if (fm) currentFn = fm[1];
    if (!raw.includes("line(")) continue;
    let m = raw.match(lineRe);
    if (m) {
      const who = m[1];
      if (!who) continue;
      rows.push({
        file: fileName,
        fn: currentFn,
        who,
        text: unescapeJs(m[2]),
        zh: extractZh(m[3] || ""),
        line: i + 1,
      });
      continue;
    }
    if (/line\(\s*"/.test(raw) && !raw.includes("})")) {
      let block = raw;
      let j = i;
      while (j + 1 < lines.length && !/\}\)\s*,?\s*$/.test(block) && j - i < 12) {
        j++;
        block += "\n" + lines[j];
      }
      const whoM = block.match(/line\(\s*"([^"]*)"/);
      if (!whoM || !whoM[1]) continue;
      const texts = [...block.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
        unescapeJs(x[1])
      );
      const zhAll = [...block.matchAll(/zh:\s*"((?:\\.|[^"\\])*)"/g)].map((x) =>
        unescapeJs(x[1])
      );
      const yueCandidates = texts.slice(1).filter((t) => !zhAll.includes(t));
      if (yueCandidates.length && zhAll.length) {
        const n = Math.min(yueCandidates.length, zhAll.length);
        for (let k = 0; k < n; k++) {
          rows.push({
            file: fileName,
            fn: currentFn,
            who: whoM[1],
            text: yueCandidates[k],
            zh: zhAll[k],
            line: i + 1,
          });
        }
      } else if (yueCandidates.length) {
        for (const t of yueCandidates) {
          rows.push({
            file: fileName,
            fn: currentFn,
            who: whoM[1],
            text: t,
            zh: "",
            line: i + 1,
          });
        }
      }
      i = j;
    }
  }
}

if (!storyFiles.length) {
  console.error("No story*.js under 游戏/assets");
  process.exit(1);
}
for (const f of storyFiles) scanFile(f);

fs.mkdirSync(outDir, { recursive: true });

const byFn = new Map();
for (const r of rows) {
  const key = r.fn;
  if (!byFn.has(key)) byFn.set(key, []);
  byFn.get(key).push(r);
}

let mdFn = [];
mdFn.push("# 对白导出 · 按函数");
mdFn.push("");
mdFn.push(
  `源：\`${storyFiles.map((f) => "游戏/assets/" + f).join("` · `")}\` · 条数：${rows.length}`
);
mdFn.push("");
mdFn.push("全量检验见 [改对话-口吻与全检.md](../改对话/改对话-口吻与全检.md)（或旧路径跳转页）。");
mdFn.push("");
for (const [fn, list] of byFn) {
  mdFn.push(`## ${fn}`);
  mdFn.push("");
  mdFn.push("| # | 文件 | 行号 | 谁 | 粤语 text | 普通话 zh |");
  mdFn.push("| --- | --- | --- | --- | --- | --- |");
  list.forEach((r, idx) => {
    mdFn.push(
      `| ${idx + 1} | ${r.file} | ${r.line} | ${escCell(r.who)} | ${escCell(r.text)} | ${escCell(r.zh)} |`
    );
  });
  mdFn.push("");
}
fs.writeFileSync(path.join(outDir, "对白-按函数.md"), mdFn.join("\n"), "utf8");

let mdTable = [];
mdTable.push("# 对白导出 · 总表");
mdTable.push("");
mdTable.push(`条数：${rows.length}`);
mdTable.push("");
mdTable.push("| 文件 | 函数 | 行号 | 谁 | 粤语 text | 普通话 zh |");
mdTable.push("| --- | --- | --- | --- | --- | --- |");
for (const r of rows) {
  mdTable.push(
    `| ${r.file} | ${r.fn} | ${r.line} | ${escCell(r.who)} | ${escCell(r.text)} | ${escCell(r.zh)} |`
  );
}
mdTable.push("");
fs.writeFileSync(path.join(outDir, "对白-表格.md"), mdTable.join("\n"), "utf8");

const clinicFns = [
  "clinic1Intro",
  "clinic1Present",
  "clinic1Support",
  "clinic1House",
  "clinicTalk",
  "clinicRest",
  "clinic2Life",
  "clinic2",
  "clinicDoorChen",
  "clinic3",
  "clinic3Break",
  "clinic4Talk",
  "meiPhone1",
].filter((f) => byFn.has(f));
let mdClinic = [];
mdClinic.push("# 对白导出 · 诊所相关函数");
mdClinic.push("");
for (const fn of clinicFns) {
  const list = byFn.get(fn) || [];
  mdClinic.push(`## ${fn}`);
  mdClinic.push("");
  mdClinic.push("| # | 谁 | 粤语 | 普通话 |");
  mdClinic.push("| --- | --- | --- | --- |");
  list.forEach((r, idx) => {
    mdClinic.push(
      `| ${idx + 1} | ${escCell(r.who)} | ${escCell(r.text)} | ${escCell(r.zh)} |`
    );
  });
  mdClinic.push("");
}
fs.writeFileSync(path.join(outDir, "对白-诊所.md"), mdClinic.join("\n"), "utf8");

console.log(
  "exported " + rows.length + " lines from [" + storyFiles.join(", ") + "] -> " + path.relative(root, outDir)
);
