/**
 * 文风检（2.x / 3.x / 4.x 的可机检部分）。在仓库根目录运行：
 *   node tools/文风检.mjs
 *
 * 定位：全检.mjs 管「两轨有没有漏、Flag 对不对、图在不在」；
 * 这一支管「句子像不像人说的」。ERROR 是硬规则，WARN 是候选（要人读，不自动判罪）。
 * 判据写在 `策划/文字规范.md` 2.2 / 2.6 / 2.7 / 4.2 / 4.15。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const assets = path.join(root, "游戏", "assets");

const FILES = ["story-early.js", "story-clinic.js", "story-late.js", "levels.js"];

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

/* ---------- 抽对白 ---------- */
// line("谁", "粤语", { zh: "普通话" })：说话人为空串＝旁白。
const rows = [];
for (const f of FILES) {
  const abs = path.join(assets, f);
  if (!fs.existsSync(abs)) {
    err(`缺文件 ${f}`);
    continue;
  }
  const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/);
  lines.forEach((ln, i) => {
    const m = ln.match(/line\(\s*"([^"]*)",\s*"((?:[^"\\]|\\.)*)"/);
    if (!m) return;
    const zh = ln.match(/\bzh:\s*"((?:[^"\\]|\\.)*)"/);
    rows.push({
      f,
      ln: i + 1,
      who: m[1] || "",
      text: m[2].replace(/\\"/g, '"'),
      zh: zh ? zh[1].replace(/\\"/g, '"') : null,
    });
  });
}
if (!rows.length) {
  console.error("没有抽到对白，检查 line() 的写法是否变了。");
  process.exit(1);
}

const tag = (r) => `${r.f.replace(".js", "")}:${r.ln}`;
const say = (r) => (r.who || "旁白") + "｜" + r.text;

/* ---------- 1. 旁白人称（2.6） ---------- */
// 旁白＝章慧琪的视点，只有「你」。引号里的引语豁免。
// 过场卡允许第三人称（别人视角），按句首特征白名单。
const CARD_OK = /^(她|他)(是|不是).{0,6}(病人|名单)/;
for (const r of rows) {
  if (r.who) continue;
  const bare = r.text.replace(/「[^」]*」/g, "").replace(/[“”][^“”]*[“”]/g, "");
  if (/她/.test(bare) && !CARD_OK.test(bare)) {
    err(`旁白里的第三人称「她」：${tag(r)} ${r.text}`);
  }
  // 冒号后面是引语（日记／纸上写的话／短信内容），「我」允许。
  const own = bare.split(/[：:]/)[0];
  if (/我/.test(own) && !/^[^。]{0,4}(我写|我讲|我记)/.test(own)) {
    warn(`旁白里出现「我」（引语外）：${tag(r)} ${r.text}`);
  }
}

/* ---------- 2. 否定式禁语（2.2） ---------- */
for (const r of rows) {
  if (/(他|她)没有(接|接话|动|说话|反应|回答)/.test(r.text)) {
    err(`禁语「没有X」：${tag(r)} ${say(r)}`);
  }
  if (/他整个人僵住|她整个人僵住|浅浅地笑|视线在.{0,12}停了一下/.test(r.text)) {
    err(`禁语（2.2 表）：${tag(r)} ${say(r)}`);
  }
}

/* ---------- 3. 「停」当万能动词（2.7） ---------- */
// 物理停止留：车停／水声停／摆杆停／笔尖停／钟停／脚印停住。
const STOP_OK = /(车|水声|水喉|滴|摆杆|笔尖|纸边|钟|脚印|雨|风|脚步|声音|声)(.{0,6})停/;
for (const r of rows) {
  if (/停手/.test(r.text)) {
    warn(`「停」当万能动词（停手）：${tag(r)} ${say(r)}`);
    continue;
  }
  if (/停喺/.test(r.text)) {
    warn(`「停」当万能动词（停喺）：${tag(r)} ${say(r)}`);
    continue;
  }
  if (/停咗|停了/.test(r.text) && !STOP_OK.test(r.text)) {
    warn(`「停」当万能动词：${tag(r)} ${say(r)}`);
  }
}

/* ---------- 4. 破折号（2.4） ---------- */
for (const r of rows) {
  const n = (r.text.match(/——/g) || []).length;
  // 喊话（带！）的连续破折号是喝止节奏，不算补白。
  if (n >= 2 && !r.text.includes("！")) warn(`同一句两个以上破折号：${tag(r)} ${say(r)}`);
}

/* ---------- 5. 自我注解（4.15） ---------- */
// A 型（泛指／归类／机制）机检抓得到；B/C/D 型只能人读，这里不假装能抓。
const SELF_NOTE = [
  ["对偶概括", /我(讲嘢|讲话|做人|这个人|呢个人).{0,10}(一系|要么|一就)/],
  ["泛指句式", /我(一向|从来|不嬲|总是|永世|永远|通常|每次都)/],
  ["机制自陈", /(一|每)(坐|讲|开|问|听|见|郁|行|想).{0,12}就(想|会|要|忍唔住)/],
  ["归类", /我(呢种人|呢类人|呢款人|这种人|这类人|系一个.{0,8}嘅人|是一个.{0,8}的人)/],
  ["自我归因", /(我|我嘅|我的)(问题|毛病|性格|脾气)(系|就系|是)/],
  // 4.18「事后澄清动机」：先说完，再补一句「我不是那个意思」。
  // 只报候选——对方真的误会过的话，这句是人物该说的（罗启明就有这个习惯：先把界限讲清）。
  ["事后澄清", /(我唔系嚟|我不是来|唔好当我|冇第二样意思|没有别的意思|唔等于|不等于)/],
];
for (const r of rows) {
  for (const [kind, re] of SELF_NOTE) {
    if (re.test(r.text)) {
      warn(`自我注解·${kind}：${tag(r)} ${say(r)}`);
      break;
    }
  }
}

/* ---------- 6. 每人句长与口癖（3.8） ---------- */
const HABITS = {
  章慧琪: ["……", "你当我", "唔知", "惊"],
  罗启明: ["讲白啲", "定唔到", "嗯", "我听完"],
  "周": ["你安心", "唔使", "得喇", "糖水"],
  陈家豪: ["食咗未", "路过", "唔好", "我担心"],
  陈美娟: ["食咗未", "锁好门", "汤", "唔好死顶"],
};
const byWho = {};
for (const r of rows) if (r.who) (byWho[r.who] ||= []).push(r);

const stats = [];
for (const [who, list] of Object.entries(byWho)) {
  const lens = list.map((r) => r.text.replace(/[，。！？、…—「」：；\s]/g, "").length);
  const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
  const habit = (HABITS[who] || []).map((h) => `${h}×${list.filter((r) => r.text.includes(h)).length}`);
  stats.push(`${who}：${list.length} 句，均长 ${avg.toFixed(1)} 字｜${habit.join(" ")}`);
}

/* ---------- 7. 一句里三个以上否定（4.3） ---------- */
for (const r of rows) {
  const n = (r.text.match(/唔|没|冇|未/g) || []).length;
  if (n >= 3 && r.text.split(/[。！？]/).length <= 3) {
    warn(`疑似否定排比（一句 ${n} 个否定）：${tag(r)} ${say(r)}`);
  }
}

/* ---------- 输出 ---------- */
console.log("文风检 · 对白 " + rows.length + " 句（" + FILES.join(" ") + "）\n");
console.log("每人句长与口癖：");
for (const s of stats) console.log("  " + s);

if (warns.length) {
  console.log(`\nWARN（候选，逐条人读）${warns.length} 条：`);
  for (const w of warns) console.log("  · " + w);
}
if (errors.length) {
  console.log(`\nERROR（硬规则）${errors.length} 条：`);
  for (const e of errors) console.log("  × " + e);
  process.exit(1);
}
console.log(`\n没有 ERROR。WARN ${warns.length} 条。`);
