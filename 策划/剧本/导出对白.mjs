/**
 * Export character dialogue lines from 游戏/assets/story.js
 * for hand-edit / DeepSeek. Run from repo root:
 *   node 策划/剧本/导出对白.mjs
 * Writes UTF-8 Markdown under 策划/剧本/_导出/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const storyPath = path.join(root, "游戏", "assets", "story.js");
const outDir = path.join(__dirname, "_导出");

const src = fs.readFileSync(storyPath, "utf8");

/** @type {{ fn: string, who: string, text: string, zh: string, line: number }[]} */
const rows = [];

const lines = src.split(/\r?\n/);
let currentFn = "(top)";
const fnRe = /^function\s+([A-Za-z0-9_]+)\s*\(/;
const lineRe =
  /line\(\s*"([^"]*)"\s*,\s*"((?:\\.|[^"\\])*)"\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/;

for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const fm = raw.match(fnRe);
  if (fm) currentFn = fm[1];

  // Skip pure narration who=""
  if (!raw.includes("line(")) continue;

  // One-line form
  let m = raw.match(lineRe);
  if (m) {
    const who = m[1];
    if (!who) continue;
    const text = unescapeJs(m[2]);
    const zh = extractZh(m[3] || "");
    rows.push({ fn: currentFn, who, text, zh, line: i + 1 });
    continue;
  }

  // Multi-line: line("who", "text", { zh: "..." }) spanning lines — rare; also flag ternary
  if (/line\(\s*"/.test(raw) && !raw.includes("})")) {
    let block = raw;
    let j = i;
    while (j + 1 < lines.length && !/\}\)\s*,?\s*$/.test(block) && j - i < 12) {
      j++;
      block += "\n" + lines[j];
    }
    const whoM = block.match(/line\(\s*"([^"]*)"/);
    if (!whoM || !whoM[1]) continue;
    // Ternary / complex: dump raw text snippets
    const texts = [...block.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
      unescapeJs(x[1])
    );
    // texts[0]=who, then alternating possible; extract zh fields
    const zhAll = [...block.matchAll(/zh:\s*"((?:\\.|[^"\\])*)"/g)].map((x) =>
      unescapeJs(x[1])
    );
    const yueCandidates = texts.slice(1).filter((t) => !zhAll.includes(t));
    if (yueCandidates.length && zhAll.length) {
      const n = Math.min(yueCandidates.length, zhAll.length);
      for (let k = 0; k < n; k++) {
        rows.push({
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

fs.mkdirSync(outDir, { recursive: true });

// --- by function ---
const byFn = new Map();
for (const r of rows) {
  if (!byFn.has(r.fn)) byFn.set(r.fn, []);
  byFn.get(r.fn).push(r);
}

let mdFn = [];
mdFn.push("# 对白导出 · 按函数");
mdFn.push("");
mdFn.push(`源文件：\`游戏/assets/story.js\` · 导出条数：${rows.length} · 角色话（who 非空）`);
mdFn.push("");
mdFn.push("改完写回同函数。全量检验见 [改对话-口吻与全检.md](../改对话-口吻与全检.md)。");
mdFn.push("");

for (const [fn, list] of byFn) {
  mdFn.push(`## ${fn}`);
  mdFn.push("");
  mdFn.push("| # | 行号 | 谁 | 粤语 text | 普通话 zh |");
  mdFn.push("| --- | --- | --- | --- | --- |");
  list.forEach((r, idx) => {
    mdFn.push(
      `| ${idx + 1} | ${r.line} | ${escCell(r.who)} | ${escCell(r.text)} | ${escCell(r.zh)} |`
    );
  });
  mdFn.push("");
}

fs.writeFileSync(path.join(outDir, "对白-按函数.md"), mdFn.join("\n"), "utf8");

// --- flat table ---
let mdTable = [];
mdTable.push("# 对白导出 · 总表");
mdTable.push("");
mdTable.push(`条数：${rows.length}`);
mdTable.push("");
mdTable.push("| 函数 | 行号 | 谁 | 粤语 text | 普通话 zh |");
mdTable.push("| --- | --- | --- | --- | --- |");
for (const r of rows) {
  mdTable.push(
    `| ${r.fn} | ${r.line} | ${escCell(r.who)} | ${escCell(r.text)} | ${escCell(r.zh)} |`
  );
}
mdTable.push("");
fs.writeFileSync(path.join(outDir, "对白-表格.md"), mdTable.join("\n"), "utf8");

// clinic-focused slice for convenience
const clinicFns = new Set(
  [
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
  ].filter((f) => byFn.has(f))
);
let mdClinic = [];
mdClinic.push("# 对白导出 · 诊所相关函数");
mdClinic.push("");
mdClinic.push("便于诊所弧整段丢给 DeepSeek。");
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
  "exported " +
    rows.length +
    " lines -> " +
    path.relative(root, outDir) +
    " (按函数 / 表格 / 诊所)"
);
