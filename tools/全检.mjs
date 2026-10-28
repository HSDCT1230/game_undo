/**
 * 全量检验（不抽查）。在仓库根目录运行：
 *   node tools/全检.mjs
 * 有 ERROR 时退出码为 1；WARN 只提示，需人工逐条看完。
 */
import fs from "fs";
import path from "path";
import vm from "vm";
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
// 图库一律 .jpg（游戏只读 .jpg，见 pics.js 的 PIC_EXT）。这里顺手查两件事：
// 有没有人往图库里又丢回 .png（忘了跑 tools/压图.py），以及同一张图是不是两种格式并存。
const havePng = new Set();
const strayPng = [];
(function walk(d, rel) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const r = rel ? rel + "/" + f : f;
    if (fs.statSync(p).isDirectory()) walk(p, r);
    else if (/\.jpe?g$/i.test(f)) havePng.add(r.replace(/\.jpe?g$/i, ""));
    else if (/\.png$/i.test(f)) strayPng.push(r);
  }
})(imgRoot, "");
for (const r of strayPng) {
  const key = r.replace(/\.png$/i, "");
  if (havePng.has(key)) err(`图库里同一张图两种格式并存：${r}（删掉 .png，保留 .jpg）`);
  else err(`图库里有未转换的 PNG：${r}（跑 python tools/压图.py）`);
}
// 图/游戏/README.md 里标了「（待补）」的图：缺了只提示，不算错
const pendingPng = new Set();
{
  let dir = "";
  for (const ln of read(path.join(imgRoot, "README.md")).split(/\r?\n/)) {
    const d = ln.match(/^`([^`]+)\/`/);
    if (d) dir = d[1];
    const r = ln.match(/^\|\s*`([^`]+)\.(?:png|jpe?g)`（待补）/);
    if (r && dir) pendingPng.add(dir + "/" + r[1]);
  }
}
const missSeen = new Set();
const missPic = (key) => {
  if (missSeen.has(key)) return;
  missSeen.add(key);
  if (pendingPng.has(key)) warn(`待补图（已登记）：图/游戏/${key}.jpg`);
  else err(`缺图：图/游戏/${key}.jpg`);
};
const picLv = [...src["pics.js"].matchAll(/^\s*"([^"]*)",?\s*$/gm)].map((m) => m[1]);
const mapPic = (src["pics.js"].match(/const MAP_PIC\s*=\s*"([^"]+)"/) || [])[1] || "00-地图/";
const allSrc = loadedJs.map((f) => src[f] || "").join("\n");
let picCount = 0;
for (const m of allSrc.matchAll(/\bpic\(\s*(\d+)\s*,\s*"([^"]+)"\s*\)/g)) {
  picCount++;
  const key = picLv[+m[1]] + "/" + m[2];
  if (!havePng.has(key)) missPic(key);
}
for (const m of allSrc.matchAll(/MAP_PIC\s*\+\s*"([^"]+)"/g)) {
  picCount++;
  if (!havePng.has(mapPic + m[1])) err(`缺图：图/游戏/${mapPic}${m[1]}.jpg`);
}
for (const m of allSrc.matchAll(/"(00-[^"/]+\/[^"]+)"/g)) {
  picCount++;
  if (!havePng.has(m[1])) err(`缺图：图/游戏/${m[1]}.jpg`);
}
const lvNames = new Set([...allSrc.matchAll(/\blvPic\(\s*"([^"]+)"\s*\)/g)].map((m) => m[1]));
// pics.js 的 LV_HAVE 登记每张 lvPic 图在哪几关有；lvPic 靠它就近借图，所以必须和磁盘一模一样
const lvHave = {};
for (const m of src["pics.js"].matchAll(/^\s*"([^"]+)":\s*\[([\d,\s]*)\],?\s*$/gm)) {
  lvHave[m[1]] = m[2].split(",").map((x) => +x.trim()).filter(Boolean);
}
for (const name of lvNames) {
  const disk = picLv.map((d, i) => (d && havePng.has(d + "/" + name) ? i : 0)).filter(Boolean);
  if (!disk.length) err(`lvPic("${name}") 在任何关卡文件夹都没有`);
  else if (!lvHave[name]) err(`lvPic("${name}") 没登记进 pics.js 的 LV_HAVE（磁盘上有：${disk.join(", ")}）`);
  else if (lvHave[name].join(",") !== disk.join(",")) err(`pics.js LV_HAVE「${name}」写的是 ${lvHave[name].join(", ")}，磁盘上是 ${disk.join(", ")}`);
}
// map.js 写成 M + "…"（const M = MAP_PIC）
for (const m of (src["map.js"] || "").matchAll(/\bM\s*\+\s*"([^"]+)"/g)) {
  picCount++;
  if (!havePng.has(mapPic + m[1])) err(`缺图：图/游戏/${mapPic}${m[1]}.jpg（map.js 地图）`);
}
// 变量传进 pic() 的图名（日历小图等）：凡是「示意-／场景-／证据-」开头的字面量，至少要在一个关卡文件夹里有
const loneNames = new Set([...allSrc.matchAll(/"((?:示意|场景|证据)-[^"\n]+)"/g)].map((m) => m[1]));
for (const name of loneNames) {
  if (picLv.some((d) => d && havePng.has(d + "/" + name))) continue;
  const pend = picLv.find((d) => d && pendingPng.has(d + "/" + name));
  if (pend) missPic(pend + "/" + name);
  else err(`图名「${name}」在任何关卡文件夹都没有`);
}
// 每关字幕卡底图：按 levels.js 的 cardBg(n) 逐关算出来再核对
{
  const lv = src["levels.js"] || "";
  const grab = (re) => (lv.match(re) || [])[0] || "";
  const code = [
    grab(/const CARD_NIGHT = \[[^\]]*\];/),
    grab(/const CARD_NIGHT_OWN = \[[^\]]*\];/),
    grab(/function cardBgName\(n\) \{[\s\S]*?\n\}/),
    grab(/function cardBg\(n\) \{[\s\S]*?\n\}/),
  ];
  if (code.some((c) => !c)) warn("字幕卡底图：levels.js 里 cardBg／cardBgName 的写法变了，没法逐关核对");
  else {
    const box = { pic: (n, name) => picLv[n] + "/" + name, out: [] };
    vm.runInNewContext(code.join("\n") + "\nfor (let n = 1; n <= 16; n++) out.push(cardBg(n));", box);
    box.out.forEach((key) => { if (key) { picCount++; if (!havePng.has(key)) missPic(key); } });
  }
}
// 放大图配字：每张 示意-／证据- 图都要有名称（pics.js PIC_CAP 或日记簿 ITEMS），名称不许漏文件名
let capCount = 0;
{
  const ps = src["pics.js"] || "";
  const items = {};
  for (const m of (src["diary.js"] || "").matchAll(/^\s*"([^"]+)":\s*\{[^\n]*title: "([^"]+)", time: "([^"]*)"[^\n]*img: pic\((\d+), "([^"]+)"\)/gm)) {
    items[m[1]] = { title: m[2], time: m[3], img: picLv[+m[4]] + "/" + m[5] };
  }
  const box = { ITEMS: items, out: null };
  try {
    vm.runInNewContext(ps + "\nout = { picCap, PIC_CAP, PIC_LV };", box);
  } catch (e) {
    err("pics.js 跑不起来，配字没法核对：" + e.message);
  }
  if (box.out) {
    const { picCap, PIC_CAP, PIC_LV } = box.out;
    const want = [...havePng, ...pendingPng].filter((k) => /^(\d\d-[^/]+)\/(示意|证据)-/.test(k) && !k.startsWith(mapPic));
    for (const key of new Set(want)) {
      const cap = picCap(key);
      if (!cap || !cap.name) { err(`配字：图/游戏/${key}.jpg 没有名称（pics.js PIC_CAP 补一行）`); continue; }
      capCount++;
      if (/[-0-9A-Za-z]/.test(cap.name)) err(`配字：图/游戏/${key}.jpg 的名称「${cap.name}」带了连字符或编号`);
    }
    for (const [n, lv] of Object.entries(PIC_CAP)) {
      const dir = +n === 0 ? "00-通用" : PIC_LV[+n];
      for (const name of Object.keys(lv)) {
        if (name === "time") continue;
        const key = dir + "/" + name;
        if (!havePng.has(key) && !pendingPng.has(key)) warn(`配字：PIC_CAP 写了 ${key}，磁盘上没有这张图`);
      }
    }
  }
}
info.push(`图片：仓库 ${havePng.size} 张；代码固定引用 ${picCount} 处，随关底图 ${lvNames.size} 种，散名 ${loneNames.size} 个；放大配字 ${capCount} 张`);

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
      if (f === "node_modules" || f === "_导出" || f === "_bin") continue;
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
  // s2hk 字表必含简体键与罕用字，不作乱码／替换符检查
  if (/(^|[\\/])s2hk\.js$/i.test(rel)) continue;
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

/* ---------- 9. Ink 写稿（inklecate 编译＋三结局对账） ---------- */
{
  const inkCheck = path.join(root, "tools", "ink-check.mjs");
  if (!fs.existsSync(inkCheck)) {
    warn("缺 tools/ink-check.mjs，跳过 Ink 检");
  } else {
    try {
      execFileSync(process.execPath, [inkCheck], {
        cwd: root,
        stdio: ["ignore", "pipe", "pipe"],
        encoding: "utf8",
        env: process.env,
      });
      info.push("Ink 检：通过（inklecate＋对账）");
    } catch (e) {
      const out = String(e.stdout || "") + String(e.stderr || "");
      err("Ink 检失败（详见 tools/ink-check.mjs）");
      out
        .split(/\r?\n/)
        .filter((ln) => /^ERROR /.test(ln) || /inklecate|结局|缺 knot|note:/.test(ln))
        .slice(0, 40)
        .forEach((ln) => err("  " + ln.replace(/^ERROR /, "")));
    }
  }
}

/* ---------- 10. 测试入口（测试入口/*.url） ----------
   这一类坏了最难发现：双击进去照样有画面，只是落在开场／存档，
   看着像「单关打不开」。所以三样都要核：网址指向的文件在不在、
   ?level=N 的 N 对不对得上关卡表、?test 有没有真的走测试目录。 */
{
  const dir = path.join(root, "测试入口");
  if (!fs.existsSync(dir)) {
    err("缺 测试入口/ 目录（跑 node tools/做入口.mjs）");
  } else {
    const levelTitles = [
      ...fs
        .readFileSync(path.join(assets, "levels.js"), "utf8")
        .matchAll(/^ {2}\{\s*\n\s*part: \d, title: "([^"]+)"/gm),
    ].map((m) => m[1]);
    const urls = fs.readdirSync(dir).filter((f) => f.endsWith(".url"));
    if (!urls.length) err("测试入口/ 里一个 .url 都没有（跑 node tools/做入口.mjs）");
    const bad0 = errors.length;
    let checked = 0;
    for (const f of urls) {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const line = (raw.match(/^URL=(.+)$/m) || [])[1];
      if (!line) {
        err(`测试入口/${f} 没有 URL= 一行`);
        continue;
      }
      checked++;
      let u;
      try {
        u = new URL(line.trim());
      } catch {
        err(`测试入口/${f} 的网址不合法：${line.trim().slice(0, 80)}`);
        continue;
      }
      // 1) 指向的文件必须真的在，而且必须是游戏本体、不是根目录那块跳板。
      //    跳板有两条跳转路，meta refresh 那条不带查询串，抢到就把 ?level 丢了。
      const target = fileURLToPath(u.href.replace(u.search, "").replace(u.hash, ""));
      if (!fs.existsSync(target)) {
        err(`测试入口/${f} 指向的文件不存在：${target}`);
      } else if (path.resolve(target) !== path.resolve(game, "index.html")) {
        err(`测试入口/${f} 没直指 游戏/index.html（现在是 ${path.relative(root, target)}）：中间多一跳就可能丢掉 ?level，重跑 node tools/做入口.mjs`);
      }
      // 2) 关号对不对
      const n = u.searchParams.get("level");
      if (n === null) continue;
      const idx = Number(n);
      if (!Number.isInteger(idx) || idx < 1 || idx > levelTitles.length) {
        err(`测试入口/${f} 的关号 ${n} 超出 1..${levelTitles.length}`);
        continue;
      }
      // 文件名前缀就是关号：03-唐楼后座.url 必须开第 3 关
      const head = f.match(/^(\d\d)-/);
      if (head && Number(head[1]) !== idx) err(`测试入口/${f} 名字说第 ${head[1]} 关，网址却是 level=${idx}`);
      // 标题也要对得上（关卡改名后忘了重跑，名字就会留旧的一套）
      const title = levelTitles[idx - 1];
      if (title && !f.includes(title)) warns.push(`测试入口/${f} 名字里没有「${title}」（第 ${idx} 关改名了？跑 node tools/做入口.mjs）`);
    }
    const hasTest = urls.some((f) => /URL=.*\?test\b/.test(fs.readFileSync(path.join(dir, f), "utf8")));
    if (!hasTest) err("测试入口/ 里没有 ?test 那一格（分段目录）");
    info.push(
      errors.length > bad0
        ? `测试入口：${checked} 个 .url，有问题（见下）`
        : `测试入口：${checked} 个 .url，指向的文件都在，关号对得上关卡表（${levelTitles.length} 关）`,
    );
  }
}

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
