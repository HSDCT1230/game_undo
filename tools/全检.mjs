/**
 * 全量检验（不抽查）。在仓库根目录运行：
 *   node tools/全检.mjs
 * 有 ERROR 时退出码为 1；WARN 只提示，需人工逐条看完。
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const game = path.join(root, "游戏");
const assets = path.join(game, "assets");
const imgRoot = path.join(root, "图", "游戏");

const errors = [];
const warns = [];
const info = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const read = (p) => fs.readFileSync(p, "utf8");
const jsFiles = fs.readdirSync(assets).filter((f) => f.endsWith(".js")).sort();
const src = Object.fromEntries(jsFiles.map((f) => [f, read(path.join(assets, f))]));

/* ---------- 1. 语法 ---------- */
for (const f of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", path.join(assets, f)], { stdio: "pipe" });
  } catch (e) {
    err(`语法错误 ${f}: ${String(e.stderr || e.message).split("\n").slice(0, 4).join(" ")}`);
  }
}
info.push(`JS 语法：${jsFiles.length} 个文件已检查`);

/* ---------- 2. index.html ---------- */
const indexPath = path.join(game, "index.html");
const index = read(indexPath);
if (/[^\x00-\x7f]/.test(index)) err("index.html 含非 ASCII 字符（中文须由 core.js 的 fillShellChrome() 写入）");
const loaded = [...index.matchAll(/(?:src|href)="(assets\/[^"?]+)(\?v=[^"]+)?"/g)];
for (const [, rel, ver] of loaded) {
  if (!fs.existsSync(path.join(game, rel))) err(`index.html 引用的文件不存在：${rel}`);
  if (!ver) err(`index.html 引用缺 ?v=：${rel}`);
}
for (const stub of ["assets/story.js", "assets/web.js", "assets/style.css"]) {
  if (loaded.some(([, rel]) => rel === stub)) err(`index.html 仍在加载空壳 ${stub}`);
}
const loadedJs = loaded.map(([, rel]) => path.basename(rel)).filter((f) => f.endsWith(".js"));
info.push(`index.html：加载 ${loaded.length} 个资源，脚本 ${loadedJs.length} 个`);

/* ---------- 3. 重名函数 ---------- */
const fnOwner = {};
for (const f of loadedJs) {
  for (const m of (src[f] || "").matchAll(/^function\s+([A-Za-z0-9_$]+)\s*\(/gm)) {
    if (fnOwner[m[1]] && fnOwner[m[1]] !== f) err(`函数重名：${m[1]} 同时在 ${fnOwner[m[1]]} 和 ${f}`);
    else fnOwner[m[1]] = f;
  }
}

/* ---------- 4. 图片 ---------- */
const havePng = new Set();
(function walk(d, rel) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const r = rel ? rel + "/" + f : f;
    if (fs.statSync(p).isDirectory()) walk(p, r);
    else if (/\.png$/i.test(f)) havePng.add(r.replace(/\.png$/i, ""));
  }
})(imgRoot, "");
const picLv = [...src["pics.js"].matchAll(/^\s*"([^"]*)",?\s*$/gm)].map((m) => m[1]);
const mapPic = (src["pics.js"].match(/const MAP_PIC\s*=\s*"([^"]+)"/) || [])[1] || "00-地图/";
const allSrc = loadedJs.map((f) => src[f] || "").join("\n");
let picCount = 0;
for (const m of allSrc.matchAll(/\bpic\(\s*(\d+)\s*,\s*"([^"]+)"\s*\)/g)) {
  picCount++;
  const key = picLv[+m[1]] + "/" + m[2];
  if (!havePng.has(key)) err(`缺图：图/游戏/${key}.png`);
}
for (const m of allSrc.matchAll(/MAP_PIC\s*\+\s*"([^"]+)"/g)) {
  picCount++;
  if (!havePng.has(mapPic + m[1])) err(`缺图：图/游戏/${mapPic}${m[1]}.png`);
}
for (const m of allSrc.matchAll(/"(00-[^"/]+\/[^"]+)"/g)) {
  picCount++;
  if (!havePng.has(m[1])) err(`缺图：图/游戏/${m[1]}.png`);
}
const lvNames = new Set([...allSrc.matchAll(/\blvPic\(\s*"([^"]+)"\s*\)/g)].map((m) => m[1]));
for (const name of lvNames) {
  if (!picLv.some((d) => d && havePng.has(d + "/" + name))) err(`lvPic("${name}") 在任何关卡文件夹都没有`);
}
info.push(`图片：仓库 ${havePng.size} 张；代码固定引用 ${picCount} 处，随关底图 ${lvNames.size} 种`);

/* ---------- 5. 音效 ---------- */
const sfxDir = path.join(assets, "sfx");
for (const block of ["SFX_FILES", "AMB_FILES"]) {
  const body = (src["sfx.js"].match(new RegExp("const " + block + "\\s*=\\s*\\{([\\s\\S]*?)\\n\\};")) || [])[1] || "";
  for (const m of body.matchAll(/:\s*"([^"]+)"/g)) {
    if (!fs.existsSync(path.join(sfxDir, m[1] + ".mp3"))) err(`缺音效：游戏/assets/sfx/${m[1]}.mp3`);
  }
}

/* ---------- 6. 对白：每句角色话都有 zh；粤普不串 ---------- */
function splitTopArgs(s) {
  const out = [];
  let depth = 0, cur = "", q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      cur += c;
      if (c === "\\") { cur += s[++i]; continue; }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { q = c; cur += c; continue; }
    if ("([{".includes(c)) depth++;
    if (")]}".includes(c)) depth--;
    if (c === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out;
}
function callAt(s, start) {
  let depth = 0, q = null;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === "\\") { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if (c === "(") depth++;
    if (c === ")") { depth--; if (depth === 0) return s.slice(start + 1, i); }
  }
  return null;
}
const lits = (s) => [...s.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]);
function zhExpr(extra) {
  const i = extra.search(/\bzh\s*:/);
  if (i < 0) return null;
  const rest = extra.slice(i).replace(/^zh\s*:/, "");
  return splitTopArgs(rest.replace(/\}\s*$/, ""))[0];
}

// 粤语行里不该出现的普通话写法（白名单词先剔掉再查）
const YUE_OK = /鉴别|为了|算了|了解|了结|受不了|不如|不过|不可|非讲不可|不论|实在|存在|自在|但是|于是|总是|特别|分别|其他|说话|还债|还生活|还完|还返|睡衣|社会学|目的|的士|知情同意|现实检验|过度警觉|安全行为|减少暴露/g;
const YUE_BAD = /[的了们这那没他她吗在是不说看给吃睡还别係鬆們說這嗎沒個問題]|什么|怎么|东西|一起|刚才|就是/g;
// 普通话行里不该出现的粤语字
const ZH_BAD = /[喺冇嘅咗佢唔嚟啲嗰咩乜睇搵攞瞓攰哋嘢喇噉咁揾嘢俾嚿啱掂]|琴日|头先|留低|收线|梳化|晏昼/g;

const rows = [];
for (const f of ["story-early.js", "story-clinic.js", "story-late.js"]) {
  const s = src[f];
  if (!s) { err(`缺 ${f}`); continue; }
  let fn = "(top)";
  const fnAt = [...s.matchAll(/^function\s+([A-Za-z0-9_]+)/gm)].map((m) => [m.index, m[1]]);
  for (const m of s.matchAll(/\bline\(/g)) {
    const body = callAt(s, m.index + 4);
    if (!body) continue;
    const args = splitTopArgs(body);
    const who = (args[0] || "").trim().replace(/^"|"$/g, "");
    if (!who) continue;
    for (const [at, name] of fnAt) if (at < m.index) fn = name;
    const lineNo = s.slice(0, m.index).split("\n").length;
    const yue = lits(args[1] || "");
    const ze = args[2] ? zhExpr(args[2]) : null;
    rows.push({ f, fn, lineNo, who, yue, zh: ze ? lits(ze) : null });
  }
  // 不经 line() 的裸对象：{ note: [...], who: "周", text: "..." }
  for (const m of s.matchAll(/\{[^{}]*?\bwho\s*:\s*"([^"]+)"[^{}]*?\}/g)) {
    const body = m[0];
    const t = body.match(/\btext\s*:\s*"((?:\\.|[^"\\])*)"/);
    if (!t) continue;
    let fnName = "(top)";
    for (const [at, name] of fnAt) if (at < m.index) fnName = name;
    const z = body.match(/\bzh\s*:\s*"((?:\\.|[^"\\])*)"/);
    rows.push({ f, fn: fnName, lineNo: s.slice(0, m.index).split("\n").length, who: m[1], yue: [t[1]], zh: z ? [z[1]] : null });
  }
}
let yueHits = 0, zhHits = 0;
for (const r of rows) {
  const where = `${r.f}:${r.lineNo} ${r.fn} ${r.who}`;
  if (!r.zh || !r.zh.length) { err(`缺普通话 zh：${where}「${r.yue.join("／")}」`); continue; }
  for (const t of r.yue) {
    const bad = t.replace(YUE_OK, "").match(YUE_BAD);
    if (bad) { yueHits++; warn(`粤语行夹普通话 [${[...new Set(bad)].join("")}]：${where}「${t}」`); }
  }
  for (const t of r.zh) {
    const bad = t.match(ZH_BAD);
    if (bad) { zhHits++; warn(`普通话行夹粤语 [${[...new Set(bad)].join("")}]：${where}「${t}」`); }
  }
}
info.push(`对白：角色话 ${rows.length} 句（粤语疑似夹普 ${yueHits}，普通话疑似夹粤 ${zhHits}）`);

/* ---------- 7. Flag 设了有没有人读 ---------- */
const flagSet = new Set([
  ...[...allSrc.matchAll(/\bflag\(\s*"([A-Za-z0-9_]+)"\s*,/g)].map((m) => m[1]),
  ...[...allSrc.matchAll(/\bflag\s*:\s*"([A-Za-z0-9_]+)"/g)].map((m) => m[1]),
]);
const flagRead = new Set([...allSrc.matchAll(/\bflag\(\s*"([A-Za-z0-9_]+)"\s*\)/g)].map((m) => m[1]));
// 也算「读」：名字作为普通字符串传给别的函数（如 fresh("wk1", "serial1", "sawWk1")）
for (const k of flagSet) {
  const all = (allSrc.match(new RegExp('"' + k + '"', "g")) || []).length;
  const sets = (allSrc.match(new RegExp('(\\bflag\\(\\s*"' + k + '"\\s*,|\\bflag\\s*:\\s*"' + k + '")', "g")) || []).length;
  if (all > sets) flagRead.add(k);
}
// 玩家选择留下的 Flag：必须有后果
const MUST_ECHO = ["meiStay", "keptMing", "gaveRoofKey", "keptRoofKey", "showedDirt", "calledName", "grabbed"];
for (const k of flagSet) {
  if (flagRead.has(k)) continue;
  if (MUST_ECHO.includes(k)) err(`选择没有后果（Flag 设了没人读）：${k}`);
  else warn(`Flag 设了没人读：${k}`);
}
for (const k of flagRead) if (!flagSet.has(k)) warn(`Flag 有人读但没地方设：${k}`);
info.push(`Flag：设置 ${flagSet.size} 个，读取 ${flagRead.size} 个`);

/* ---------- 8. 禁写与坏字 ---------- */
const textExt = /\.(md|mdc|js|mjs|css|html|json)$/i;
const scanDirs = [game, path.join(root, "策划"), path.join(root, ".cursor"), path.join(root, "tools"), path.join(root, "README.md")];
const files = [];
for (const d of scanDirs) {
  if (!fs.existsSync(d)) continue;
  if (fs.statSync(d).isFile()) { files.push(d); continue; }
  (function walk(p) {
    for (const f of fs.readdirSync(p)) {
      if (f === "node_modules" || f === "_导出") continue;
      const q = path.join(p, f);
      if (fs.statSync(q).isDirectory()) walk(q);
      else if (textExt.test(f)) files.push(q);
    }
  })(d);
}
const self = fileURLToPath(import.meta.url);
for (const p of files) {
  if (p === self) continue;
  const t = read(p);
  const rel = path.relative(root, p);
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(t)) err(`控制字符（坏字）：${rel}`);
  if (t.includes("\uFFFD")) err(`替换符 U+FFFD（坏字）：${rel}`);
  const moji = t.match(/锟斤拷|銆|锛|鈥|鍙|鐨|浠|涓€/);
  if (moji) err(`疑似 GBK／UTF-8 乱码「${moji[0]}」：${rel}`);
  if (/[\u4e00-\u9fff]\?\?|\?\?[\u4e00-\u9fff]/.test(t)) warn(`中文旁有「??」，可能是写坏的中文：${rel}`);
  t.split(/\r?\n/).forEach((ln, i) => {
    if (/禁止|不许|不要|勿|别写|一律|无「/.test(ln)) return;
    if (ln.includes("大角嘴")) err(`写成了「大角嘴」：${rel}:${i + 1}`);
    if (ln.includes("陈嘉豪")) err(`写成了「陈嘉豪」：${rel}:${i + 1}`);
  });
}
info.push(`禁写／坏字：扫描 ${files.length} 个文本文件`);

/* ---------- 输出 ---------- */
console.log("== 全检 ==");
info.forEach((m) => console.log("  " + m));
if (warns.length) {
  console.log(`\n-- WARN ${warns.length} 条（逐条人工看完） --`);
  warns.forEach((m) => console.log("WARN " + m));
}
if (errors.length) {
  console.log(`\n-- ERROR ${errors.length} 条 --`);
  errors.forEach((m) => console.log("ERROR " + m));
  process.exitCode = 1;
} else {
  console.log("\n没有 ERROR。");
}
