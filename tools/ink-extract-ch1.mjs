/**
 * One-shot: story-*.js talk beats → 策划/剧本/ink/ch1/*.ink scaffold.
 * Ink is authoring-only; runtime stays story-*.js.
 */
import fs from "fs";
import path from "path";

const root = path.resolve("游戏/assets");
const destDir = path.resolve("策划/剧本/ink/ch1");
fs.mkdirSync(destDir, { recursive: true });

function extract(file) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  const out = [];
  out.push(`// Auto-scaffold from ${file}`);
  out.push("// Authoring only (no inkjs). Tags: # flag:xxx  # note:id=text  # zh:…");
  out.push("// Hub / web / diary scenes stay in JS; knots below mirror startTalk beats.");
  out.push("");

  const re =
    /function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)(?=\nfunction\s+|\n\/\/ 第|\nconst CH2|$)/g;
  let m;
  let n = 0;
  while ((m = re.exec(src))) {
    const name = m[1];
    const body = m[2];
    if (!/startTalk\s*\(/.test(body) && !/\bline\s*\(/.test(body)) continue;
    n++;
    out.push(`=== ${name} ===`);

    const lineRe =
      /line\(\s*(?:"([^"]*)"|'([^']*)')\s*,\s*(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)')\s*(?:,\s*\{([^}]*)\})?\s*\)/g;
    let lm;
    let count = 0;
    while ((lm = lineRe.exec(body))) {
      count++;
      const who = lm[1] || lm[2] || "";
      let text = lm[3] || lm[4] || "";
      text = text
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
      const meta = lm[5] || "";
      const zhM = meta.match(/zh:\s*(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)')/);
      const flagM = meta.match(/flag:\s*["']([^"']+)["']/);
      const noteM = meta.match(
        /note:\s*\[\s*["']([^"']+)["']\s*,\s*["']((?:\\.|[^"'])*)["']/
      );
      let tags = "";
      if (zhM) {
        const zh = (zhM[1] || zhM[2] || "").replace(/\\"/g, '"');
        tags += ` # zh:${zh}`;
      }
      if (flagM) tags += ` # flag:${flagM[1]}`;
      if (noteM) tags += ` # note:${noteM[1]}=${noteM[2].replace(/\\"/g, '"')}`;
      if (who) out.push(`${who}：${text}${tags}`);
      else out.push(`${text}${tags}`);
    }

    const choiceRe =
      /label:\s*["']([^"']+)["'][\s\S]*?(?:flag:\s*["']([^"']+)["'])?/g;
    const labels = [];
    let cm;
    const choiceBlock = body.match(/choices:\s*\[([\s\S]*?)\]\s*,?\s*\}/);
    if (choiceBlock) {
      const parts = choiceBlock[1].split(/\{\s*label:/).slice(1);
      for (const p of parts) {
        const lab = p.match(/^\s*["']([^"']+)["']/);
        const fl = p.match(/flag:\s*["']([^"']+)["']/);
        if (lab) labels.push({ label: lab[1], flag: fl ? fl[1] : null });
      }
    } else {
      while ((cm = choiceRe.exec(body))) {
        labels.push({ label: cm[1], flag: cm[2] || null });
      }
    }
    if (labels.length) {
      out.push("");
      for (const c of labels) {
        out.push(`* [${c.label}]`);
        if (c.flag) out.push(`  ~ ${c.flag} = true`);
        out.push(`  -> ${name}_cont`);
      }
      out.push("");
      out.push(`= ${name}_cont`);
    }

    if (count === 0 && !labels.length) out.push("// (hub/UI-heavy — keep in JS)");
    out.push("-> DONE");
    out.push("");
  }
  // DONE 只放 late.ink 末尾一份，避免三文件重名导致 inklecate 失败
  if (file === "story-late.js") {
    out.push("=== DONE ===");
    out.push("-> END");
    out.push("");
  }
  return { text: out.join("\n"), n };
}

for (const f of ["story-early.js", "story-clinic.js", "story-late.js"]) {
  const { text, n } = extract(f);
  const dest = path.join(destDir, f.replace("story-", "").replace(".js", ".ink"));
  fs.writeFileSync(dest, text, "utf8");
  console.log(f, "->", path.relative(process.cwd(), dest), "knots", n, "chars", text.length);
}
