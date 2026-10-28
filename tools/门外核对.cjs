// 诊室门外那几分钟（CLINIC_WAIT）的核對：第二／三／四次各自落在候诊／走廊／前台，
// 三个看点都在、都能记进日记簿、「入去」能把人送进诊室，读档兜底不会卡在门口。
//
// 用 jsdom 直接跑游戏脚本（不开 Chrome），所以只看结构与状态，不看像素。
//
// 用法（在仓库根目录）：
//   NODE_PATH=C:/Users/11356/.workbuddy/binaries/node/workspace/node_modules \
//     node tools/门外核对.cjs
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "游戏");
const html = fs.readFileSync(path.join(GAME, "index.html"), "utf8");

// 抽出 <script src>，把脚本去掉后自己按顺序 eval——jsdom 走 file:// 读子资源不稳，
// 这样出错也容易定位到是哪个文件。
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const clean = html.replace(/<script src="[^"]+"><\/script>\s*/g, "");

const dom = new JSDOM(clean, {
  url: "http://localhost/?test=1",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
const { window } = dom;
const doc = window.document;

const errors = [];
window.addEventListener("error", (e) => errors.push(String(e.error || e.message)));

// jsdom 缺的几个浏览器物件：音效与录音走不到，但不该在装脚本这一步就炸掉
window.URL.createObjectURL = () => "blob:stub";
window.URL.revokeObjectURL = () => {};
if (!window.AudioContext) window.AudioContext = window.webkitAudioContext = function () {
  return { state: "suspended", resume() {}, suspend() {}, close() {}, currentTime: 0,
    createOscillator: () => ({ connect() {}, start() {}, stop() {}, frequency: {}, type: "" }),
    createGain: () => ({ connect() {}, gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } }),
    destination: {}, createBuffer: () => ({ getChannelData: () => new Float32Array(1) }) };
};

// 关键：用 <script> 元素注入，而不是 window.eval。indirect eval 里的 const／let 只活在
// 那一次 eval 的声明环境里，出不来；真脚本的顶层 const 才进全局词法环境，后面的文件才看得见。
for (const s of srcs) {
  const p = path.join(GAME, s.split("?")[0]);
  const code = fs.readFileSync(p, "utf8");
  const tag = doc.createElement("script");
  tag.textContent = code + "\n//# sourceURL=" + s.split("?")[0];
  try {
    doc.body.append(tag);
  } catch (e) {
    errors.push(path.basename(p) + ": " + e.message);
  }
}

// 顶层 const／let 不会挂到 window 上，只能借全局 eval 拿（间接 eval 看得见全局词法声明）
const G = (n) => window.eval(n);
const S = G("typeof S !== 'undefined' ? S : null");
if (!S) {
  console.error("S 没起来，脚本没装好。已捕获的报错：");
  errors.forEach((e) => console.error("  ! " + e));
  process.exit(2);
}
const el$ = (q) => doc.querySelector(q);
const all = (q) => [...doc.querySelectorAll(q)];
const txt = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
// 游戏默认「粤＋普」并排，界面文字走香港繁体；期望值也过一遍同一个转换再比。
const hk = G('typeof toHkTrad === "function" ? toHkTrad : null');
const W = (s) => (hk ? hk(s) : s);
const srcOf = (n) => (n ? decodeURIComponent(n.getAttribute("src") || "") : "");

let pass = 0;
const fails = [];
const ok = (cond, label) => {
  if (cond) pass++;
  else fails.push(label);
};

// 把一段对话一口气推到底（碰到 goto 就让它触发）
function fastForward(limit = 80) {
  for (let k = 0; k < limit; k++) {
    if (S.mode !== "talk" || !S.talk) return true;
    const b = S.talk.beats[S.talk.i];
    if (!b) return true;
    if (b.choices) return false; // 卡在选择上，说明流程和预期不符
    if (b.goto) {
      window.drawTalk();
      continue;
    }
    window.advanceBeat(b);
  }
  return false;
}

function reset(level) {
  S.mode = "clinic";
  S.level = level;
  S.notes = [];
  S.clinic = null;
  S.clinicLooked = {};
  S.hotClicked = {};
  S.hotSig = {};
  window.clearStage();
}

const WANT = [
  { visit: 2, level: 8, name: "澄心候诊", img: "场景-候诊", spots: ["阿文坐过的那张椅", "茶几上的杂志", "诊室的门"] },
  { visit: 3, level: 10, name: "澄心走廊", img: "场景-诊所走廊", spots: ["洗手间的门", "墙上那块牌子", "走廊尽头"] },
  { visit: 4, level: 12, name: "澄心前台", img: "场景-前台", spots: ["预约表", "搁在前台的杂志", "前台姑娘"] },
];

// 看点的标题是 .hot-copy 的第一个文本节点（后面紧跟 <small> 副题）
const hotTitle = (h) => {
  const c = h.querySelector(".hot-copy");
  return c && c.firstChild ? String(c.firstChild.nodeValue).trim() : txt(c);
};

// ---------- 1. 三次门外：过场之后落在哪、有几个看点 ----------
for (const w of WANT) {
  reset(w.level);
  let entered = 0;
  window.clinicArrival(w.visit, () => { entered++; });

  ok(S.mode === "talk", `visit${w.visit} 过场应当先是 talk，实际 ${S.mode}`);
  const ff = fastForward();
  ok(ff, `visit${w.visit} 过场推到底不应卡在选择上`);
  ok(S.mode === "clinic", `visit${w.visit} 过场之后应进 clinic，实际 ${S.mode}`);
  ok(S.clinic && S.clinic.wait === true, `visit${w.visit} 应停在门外（S.clinic.wait）`);
  ok(S.clinic && S.clinic.visit === w.visit, `visit${w.visit} 的 S.clinic.visit 不对`);
  ok(!!el$(".room.scene-fit"), `visit${w.visit} 门外没有铺底景`);

  const bgSrc = srcOf(el$(".room-bg img"));
  ok(bgSrc.includes(w.img) && bgSrc.includes(w.level < 10 ? "0" + w.level : String(w.level)),
    `visit${w.visit} 底图不是第 ${w.level} 关的 ${w.img}（${bgSrc.slice(-60)}）`);

  const hots = all(".room-map .hot");
  ok(hots.length === 3, `visit${w.visit} 应有 3 个看点，实际 ${hots.length}`);
  // 三个看点都要有缩图：门外这三段曾经只有文字卡片，缩图位置空着
  const poke = all(".room-map .hot .hot-img img");
  ok(poke.length === 3 && poke.every((i) => (i.getAttribute("src") || "").length > 20),
    `visit${w.visit} 三个看点应都有缩图，实际 ${poke.length} 张`);
  const got = hots.map(hotTitle);
  for (const st of w.spots) ok(got.includes(W(st)), `visit${w.visit} 缺少看点「${st}」（实得 ${got.join("／")}）`);

  const go = all(".hub-acts .scene-act.primary");
  ok(go.length === 1 && (go[0].getAttribute("aria-label") || "").endsWith("入去"),
    `visit${w.visit} 没有「入去」按钮（${go.length} 个，aria=${go[0] && go[0].getAttribute("aria-label")}）`);
  const hint = txt(el$(".hub-acts .hub-hint"));
  ok(hint.length > 4, `visit${w.visit} 门外缺少提示文案`);

  // 看点：点开 → 弹窗 → 记进日记 → 关掉回到门外
  for (const h of hots) {
    const t = hotTitle(h);
    const before = S.notes.length;
    h.click();
    ok(S.notes.length === before + 1, `visit${w.visit}「${t}」点了没记进日记`);
    ok(!!el$("#game-modal"), `visit${w.visit}「${t}」点了没弹窗`);
    ok(!!all("#game-modal .clue-body, #game-modal .talk-text").length, `visit${w.visit}「${t}」弹窗里没有正文`);
    const closeBtn = all("#game-modal button").pop();
    if (closeBtn) closeBtn.click();
    ok(!el$("#game-modal"), `visit${w.visit}「${t}」弹窗关不掉`);
    ok(S.mode === "clinic" && S.clinic.wait === true,
      `visit${w.visit}「${t}」关掉弹窗后没回到门外（${S.mode}/${S.clinic && S.clinic.wait}）`);
    ok(all(".room-map .hot").length === 3, `visit${w.visit}「${t}」关掉弹窗后看点丢了`);
  }

  // 「入去」→ 交给 next，门外的状态要清掉
  entered = 0;
  const goBtn = all(".hub-acts .scene-act.primary")[0];
  goBtn.click();
  ok(entered === 1, `visit${w.visit}「入去」没走到 next（entered=${entered}）`);
  ok(S.clinic && S.clinic.wait !== true, `visit${w.visit}「入去」之后 S.clinic.wait 还是 true`);
}

// ---------- 2. 第四次前台：预约表仍然是第 12 关那条可选任务的开关 ----------
const LV12 = G('typeof LEVELS !== "undefined" ? LEVELS[12] : null');
const schedTask = LV12 && (LV12.tasks || []).find((t) => t.text === "偷看预约表");
ok(!!schedTask, "第 12 关没有「偷看预约表」这条可选任务了");

reset(12);
window.clinicArrival(4, () => {});
fastForward();
const schedHot = all(".room-map .hot").find((h) => hotTitle(h) === W("预约表"));
ok(!!schedHot, "第四次门外找不到「预约表」那格");
if (schedHot) {
  schedHot.click();
  ok(!!(S.clinicLooked && S.clinicLooked.sched), "点预约表没有写 S.clinicLooked.sched");
  ok(S.notes.some((n) => n.id === "sched"), "预约表没记进日记（id=sched）");
  ok(schedTask ? schedTask.done() === true : false, "看过之后「偷看预约表」这条应算完成");
  const c = all("#game-modal button").pop();
  if (c) c.click();
}
// 没看的时候不能算完成：判定函数要真的挂在那个标记上，不是永远 true
S.clinicLooked = {};
ok(schedTask ? schedTask.done() === false : false, "没看预约表时任务不该算完成");

// ---------- 3. 读档兜底：门外那截没了，人也不会卡在门口 ----------
reset(8);
window.clinicWait(2, null); // 不给 next，模拟刷新／读档后重画
ok(S.clinic && S.clinic.wait === true, "兜底场景没停在门外");
window.clinicRoomEnter();
ok(S.mode === "clinic" && !(S.clinic && S.clinic.wait), `兜底「入去」没进诊室（${S.mode}）`);
ok(all(".desk, .room, .clinic-bg").length > 0, "兜底进诊室后舞台是空的");
ok(txt(el$("#stage")).length > 80, "兜底进诊室后舞台几乎没有字");

// ---------- 4. 第 12 关诊室：预约表已换成桌角 ----------
reset(12);
S.clinic = { visit: 4, seg: 0 };
S.clinicLooked = {};
window.enterClinic(4);
const clinicHots = all(".hot").map(hotTitle);
ok(clinicHots.includes(W("桌角")), `第 12 关诊室没有「桌角」（实得 ${clinicHots.join("／")}）`);
ok(!clinicHots.some((t) => t.includes("预约")), `第 12 关诊室里还留着「预约表」（${clinicHots.join("／")}）`);

// ---------- 汇总 ----------
const errs = errors.filter((e) => !/Not implemented|AudioContext|createElement\(.canvas.\)|getContext/i.test(e));
console.log("\n=== 门外核对 ===");
console.log(`通过 ${pass} 项，失败 ${fails.length} 项`);
if (fails.length) fails.forEach((f) => console.log("  ✗ " + f));
if (errs.length) {
  console.log(`控制台报错 ${errs.length} 条：`);
  errs.slice(0, 8).forEach((e) => console.log("  ! " + e));
}
process.exit(fails.length || errs.length ? 1 : 0);
