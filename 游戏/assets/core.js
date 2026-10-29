const $ = (sel, root = document) => root.querySelector(sel);
const stage = $("#stage");
const clockEl = $("#clock");
const placeEl = $("#hud-place");
const notesLayer = $("#notes-layer");
const notesIndex = $("#notes-index");
const notesLeaf = $("#notes-leaf");
const notesActions = $("#notes-actions");

/* 壳上的中文只写在 JS，不写进 index.html，避免编辑工具把 UTF-8 弄成 ?? */
/* 顶栏也跟语言模式走：粤语／粤＋普转港繁，普通话原样。以前这里无条件转繁，
   切到普通话模式，顶栏还是「瀏覽器　日記簿　地圖」，跟网页里已经简体的字对不上。
   注意：这个函数在 langMode 初始化之前不能调用（H() 会读 langMode，触发 TDZ），
   所以 fillShellChrome() 的调用点挪到了语言初始化之后。 */
function shellText(s) {
  if (typeof H === "function") return H(s);
  return typeof toHkTrad === "function" ? toHkTrad(s) : s;
}
function fillShellChrome() {
  const set = (sel, text, attr) => {
    const n = typeof sel === "string" ? $(sel) : sel;
    if (!n) return;
    const t = shellText(text);
    if (attr) n.setAttribute(attr, t);
    else n.textContent = t;
  };
  document.title = "暗度 undo";
  set("#os-title", "暗度");
  set("#clock", "2014年7月31日 周四 23:14");
  set("#sfx-toggle", "环境音　大");
  set("#playbar", "游戏导航", "aria-label");
  set("#playbar-house", "浏览器");
  set("#playbar-notes", "日记簿");
  set("#playbar-map", "地图");
  set("#playbar-advance .go-mark", "往下");
  set("#playbar-advance .go-arrow", "→");
  set("#map-toggle", "地图");
  set("#notes-toggle", "日记簿");
  set("#map-sheet", "地图", "aria-label");
  set("#map-title", "地图");
  set("#map-close", "合上");
  set("#notes-book", "日记簿", "aria-label");
  set("#notes-kind", "日记簿");
  if (!$("#rotate-hint")) {
    const hint = document.createElement("div");
    hint.id = "rotate-hint";
    hint.setAttribute("aria-live", "polite");
    hint.innerHTML = '<div class="rotate-phone" aria-hidden="true"></div><p>' + shellText("把手机竖过来玩") + "</p>";
    document.body.appendChild(hint);
  }
}

/* 对白语言、字号：跟环境音开关一样存在本地，不进存档 */
const LANG_KEY = "undo-lang-v3";
const LANG_MODES = ["yue", "zh", "both"];
const LANG_LABEL = { both: "粤＋普", yue: "粤语", zh: "普通话" };
const SIZE_KEY = "undo-size";
const SIZE_STEPS = [1, 1.15, 1.3];
const SIZE_LABEL = ["字　中", "字　大", "字　特大"];
const SIZE_VARS = { "--say-face": 18, "--say-choice": 16, "--say-phone": 15, "--say-msg": 17, "--say-chat": 12 };

let langMode = "yue";
let sizeStep = 0;
/* 自动播放：默认关；和语言、字号一样只存本地，不进存档 */
const AUTO_KEY = "undo-auto";
/* 开画勾、关画叉：两个字换成两个符号，顶栏一下短了一截，也不再用文字报开关。 */
const AUTO_LABEL = { off: "自动　×", on: "自动　√" };
let autoMode = false;
try {
  autoMode = localStorage.getItem(AUTO_KEY) === "1";
} catch (e) { /* 无 */ }
try {
  const l = localStorage.getItem(LANG_KEY);
  if (LANG_MODES.includes(l)) langMode = l;
  else langMode = "yue";
  sizeStep = Math.min(SIZE_STEPS.length - 1, Math.max(0, Number(localStorage.getItem(SIZE_KEY)) || 0));
} catch (e) { /* 无 */ }

// 读完存档里的语言模式才画壳上的字：顶栏也分粤／普两套字形（见 shellText）。
fillShellChrome();

/** 粤／普：对白与网站共用。粤语侧转香港繁体。both＝粤语为主，对白另加一行普通话小字对照。 */
function T(yue, zh) {
  const raw = yue == null ? "" : String(yue);
  const y = typeof toHkTrad === "function" ? toHkTrad(raw) : raw;
  const z = zh == null || zh === "" ? raw : String(zh);
  const mode = typeof langMode === "string" ? langMode : "yue";
  if (mode === "zh") return z;
  return y;
}

/** 仅要纯字串时用（拼接、属性值、输入框）。 */
function Ts(yue, zh) {
  return T(yue, zh);
}

/** 只有一种写法的文本（界面标签、关卡清单、日记、网页裸串）：粤语／粤＋普转港繁，普通话原样。
    与 T() 的区别：T() 有双语来源，H() 只是把单语文本按模式繁化，幂等。
    普通话模式先查 yue-zh.js 的对照表——单语文本里若写了粤语（「佢」「唔」「细路」），
    这里是最后一个能拦住它的地方，不查就会原样漏给玩家。查不到才原样返回。 */
function H(s) {
  if (s == null) return "";
  const mode = typeof langMode === "string" ? langMode : "yue";
  if (mode === "zh") return typeof zhOf === "function" ? zhOf(String(s)) : String(s);
  return typeof toHkTrad === "function" ? toHkTrad(String(s)) : String(s);
}

/** 取对象字段：优先 key / keyZh；也认 { yue, zh }。 */
function Ty(obj, key) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  if (key) {
    const y = obj[key];
    if (y && typeof y === "object" && (y.yue != null || y.zh != null)) return T(y.yue || y.zh, y.zh || y.yue);
    return T(y, obj[key + "Zh"] != null ? obj[key + "Zh"] : obj[key + "_zh"]);
  }
  return T(obj.yue || obj.text, obj.zh);
}

/** 长文：按语言模式只显示其一，不混排。 */
function Tblock(yue, zh, className) {
  const raw = yue == null ? "" : String(yue);
  const y = typeof toHkTrad === "function" ? toHkTrad(raw) : raw;
  const z = zh == null || zh === "" ? "" : String(zh);
  const mode = typeof langMode === "string" ? langMode : "yue";
  const box = el("div", { class: "web-bi" + (className ? " " + className : "") });
  box.append(el("div", { class: "web-bi-main" }, [mode === "zh" ? (z || raw) : y]));
  return box;
}

function applySize() {
  const k = SIZE_STEPS[sizeStep];
  Object.entries(SIZE_VARS).forEach(([v, px]) => document.documentElement.style.setProperty(v, Math.round(px * k) + "px"));
}

function redrawForLang() {
  if (typeof draw !== "function" || !S) return;
  if (S.mode === "talk" || S.mode === "web" || S.mode === "hub" || S.mode === "map") draw();
}

/* 开关的「值」有一半是符号：开是勾、关是叉。
   勾和叉跟旁边的汉字不是一个模子刻出来的，字宽、粗细、基线都得单独调，
   所以给它们各挂一个 class，样式在 .os-yes / .os-no。 */
const OS_SYM = { "√": "os-yes", "×": "os-no" };

/* 顶栏开关的字：写法是「名　值」——「环境音　大」「字　中」「自动　√」。
   以前把两段拼进一个字符串、中间塞个全角空格撑着，看着像空格排版而不是排版。
   现在拆成两格：名淡一点、值亮一点，距离交给 CSS 的 gap，字里不再有撑出来的空。
   传进来的还是原来那个带全角空格的标签，split 一次就散开，标签表不用动。 */
function setPairLabel(node, label) {
  const full = shellText(String(label || ""));
  const cut = full.indexOf("　");
  if (cut < 0) {
    node.textContent = full;
    return;
  }
  const val = full.slice(cut + 1);
  const sym = OS_SYM[val];
  node.replaceChildren(
    el("span", { class: "os-k" }, [full.slice(0, cut)]),
    el("span", { class: sym ? "os-v " + sym : "os-v" }, [val]),
  );
}

/* ---- 顶栏按钮的动作 ----
   语言、字号、自动、环境音、全屏，五颗按钮只有五个动作。
   以前每个动作都写成 addEventListener 塞进建按钮的那段里，谁看都得先找绑在哪。
   抽出来之后，点击由一个统一的入口分派（见下面的 osBarClick），加按钮、换位置都只动一处。 */
function cycleLang() {
  langMode = LANG_MODES[(LANG_MODES.indexOf(langMode) + 1) % LANG_MODES.length];
  try { localStorage.setItem(LANG_KEY, langMode); } catch (err) { /* 无 */ }
  // 顶栏、玩吧那几颗字的字形也跟着换，不然切到普通话还挂着「瀏覽器」。
  fillShellChrome();
  optButtons();
  redrawForLang();
  if (langMode === "both" && typeof showPrompt === "function") {
    const hk = (s) => H(s);
    showPrompt(
      hk("粤＋普"),
      hk("网页与长文只出粤语。人物对白下面，会加一行普通话小字。想整页转普通话，再点一次语言按钮。")
    );
  }
}

function cycleSize() {
  sizeStep = (sizeStep + 1) % SIZE_STEPS.length;
  try { localStorage.setItem(SIZE_KEY, String(sizeStep)); } catch (err) { /* 无 */ }
  applySize();
  optButtons();
}

function toggleAuto() {
  autoMode = !autoMode;
  try { localStorage.setItem(AUTO_KEY, autoMode ? "1" : "0"); } catch (err) { /* 无 */ }
  optButtons();
  // 开着的时候如果正停在一句对白上，立刻排下一次；关掉就撤掉定时器
  if (typeof clearAuto === "function") clearAuto();
  if (autoMode && S && S.mode === "talk" && typeof drawTalk === "function") drawTalk();
}

function cycleBg() {
  if (typeof sfxSetLevel !== "function" || typeof BG_VOL === "undefined") return;
  sfxSetLevel((bgLevel + 1) % BG_VOL.length);
  if (typeof sfx === "function") sfx("tap");
}

function optButtons() {
  const bar = $("#os-bar");
  const sfxBtn = $("#sfx-toggle");
  if (!bar) return;
  let lang = $("#lang-toggle");
  let size = $("#size-toggle");
  let auto = $("#auto-toggle");
  if (!lang) {
    lang = el("button", { type: "button", id: "lang-toggle", class: "os-opt" });
    size = el("button", { type: "button", id: "size-toggle", class: "os-opt" });
    auto = el("button", { type: "button", id: "auto-toggle", class: "os-opt" });
    bar.insertBefore(auto, sfxBtn || null);
    bar.insertBefore(lang, sfxBtn || null);
    bar.insertBefore(size, sfxBtn || null);
  }
  lang.textContent = shellText(LANG_LABEL[langMode]);
  lang.setAttribute("aria-label", shellText("对白与网站：" + LANG_LABEL[langMode] + "，点按切换"));
  size.setAttribute("aria-label", shellText("对白字号：" + SIZE_LABEL[sizeStep].replace("字　", "") + "，点按切换"));
  setPairLabel(size, SIZE_LABEL[sizeStep]);
  if (auto) {
    setPairLabel(auto, autoMode ? AUTO_LABEL.on : AUTO_LABEL.off);
    auto.setAttribute("aria-label", shellText("自动播放：" + (autoMode ? "开" : "关") + "，点按切换"));
    auto.setAttribute("aria-pressed", autoMode ? "true" : "false");
  }
}
applySize();
document.addEventListener("DOMContentLoaded", optButtons);

/* ---------- 顶栏按钮的统一入口 ----------
   以前每颗按钮各自 addEventListener，三个坑都踩过：
   ① 按钮是脚本建出来的，节点一旦被换掉，绑在旧节点上的监听就跟着没了，按下去没反应；
   ② 按钮里其实是 .os-k/.os-v 两个 span，点到的是子节点，不是按钮本身；
   ③ 顶栏 32px 高，按钮只有 19px，上下各有六七像素空白。鼠标点偏一点点就落在
      空白里，横坐标明明还在按钮范围内，却什么都不发生——玩家只会说「开关坏了」。
   所以改成一个入口：先从点到的东西往上找按钮，找不到再按坐标就近认一次。
   注册在 document 的捕获阶段，比任何冒泡里的 handler 都早，也不会被关卡那层
   「点画面往下走」抢走。 */
const OS_IDS = ["auto-toggle", "lang-toggle", "size-toggle", "sfx-toggle", "fs-toggle"];

/* 横坐标落在哪颗按钮的范围里、纵坐标还在顶栏这一行，就算点了它 */
function osBarByPoint(x, y) {
  const bar = $("#os-bar");
  if (!bar) return null;
  const br = bar.getBoundingClientRect();
  if (!br.height || y < br.top || y > br.bottom) return null;
  for (const id of OS_IDS) {
    const b = document.getElementById(id);
    if (!b || b.hidden || !b.offsetParent) continue;
    const r = b.getBoundingClientRect();
    if (r.width && x >= r.left - 4 && x <= r.right + 4) return b;
  }
  return null;
}

function osBarClick(e) {
  const t = e.target;
  const hit = (t && t.closest ? t.closest("#" + OS_IDS.join(", #")) : null) || osBarByPoint(e.clientX, e.clientY);
  if (!hit || !hit.id) return;
  const run = {
    "sfx-toggle": cycleBg,
    "auto-toggle": toggleAuto,
    "lang-toggle": cycleLang,
    "size-toggle": cycleSize,
    "fs-toggle": fsToggle,
  }[hit.id];
  if (!run) return;
  // 顶栏不该把点击漏给下面的画面（对白是「点一下往下走」的）
  e.stopPropagation();
  e.preventDefault();
  run();
}
document.addEventListener("click", osBarClick, true);

/* ---------- 全屏 ----------
   走浏览器全屏（不是 F11：那个脚本管不到，退出也只能靠浏览器自己）。
   按钮只报状态、不猜状态，进出都由 fullscreenchange 回来同步，
   这样玩家按 Esc、按 F11、用浏览器菜单退出，顶栏那颗都会跟着变。
   不支持的浏览器（iPhone 上的 Safari）整颗不出现，不留一颗按了没反应的按钮。 */
const FS_LABEL = { on: "全屏　√", off: "全屏　×" };
function fsEnabled() {
  return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
}
function fsOn() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function fsToggle() {
  const root = document.documentElement;
  const quiet = (p) => { if (p && p.catch) p.catch(() => {}); };
  try {
    if (fsOn()) {
      const out = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen;
      quiet(out && out.call(document));
    } else {
      const go = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
      const p = go && go.call(root);
      // 这台机器（老 iPad 之类）答「有全屏」但真请求又被拒：把按钮收掉，别留一颗按不动的
      if (p && p.catch) p.catch(() => { const b = $("#fs-toggle"); if (b && !fsOn()) b.hidden = true; });
    }
  } catch (e) { /* 被浏览器拒了就算了，界面不改口 */ }
}
function fsSync() {
  const b = $("#fs-toggle");
  if (!b) return;
  const on = fsOn();
  setPairLabel(b, FS_LABEL[on ? "on" : "off"]);
  b.setAttribute("aria-pressed", on ? "true" : "false");
  b.setAttribute("aria-label", shellText("全屏：" + (on ? "开" : "关") + "，点按" + (on ? "退出全屏" : "进入全屏") + "（快捷键 F）"));
}
["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, fsSync));
document.addEventListener("DOMContentLoaded", () => {
  const bar = $("#os-bar");
  if (!bar || $("#fs-toggle") || !fsEnabled()) return;
  const b = el("button", { type: "button", id: "fs-toggle", class: "os-opt" });
  bar.append(b);
  fsSync();
});
/* F 进出全屏。这一颗登记在 window 捕获阶段、core.js 又先于 levels.js 加载，
   所以卡片锁键盘、开场锁键盘的时候它照样管用——换个屏幕大小不算跳过剧情。 */
addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  if (e.key !== "f" && e.key !== "F") return;
  const t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""))) return;
  if (!fsEnabled()) return;
  e.preventDefault();
  fsToggle();
}, true);

const initial = () => ({
  time: "2014年7月31日 周四 23:14",
  mode: "web",
  tab: "house",
  screen: "post",
  query: "元朗 天水围",
  listFilter: "all",
  listing: null,
  favs: [],
  modal: null,
  flags: {},
  notes: [],
  evidence: [],
  remark: "我需要一个能住的地方。",
  pmBody: "",
  pmSent: "",
  webHist: [],
  webFwd: [],
  // 每个分页最后停在哪一页。切走再切回来要回到原页，不是一张新的 about:blank。
  tabMem: { house: null, wall: null },
  // 网页分页（廿八屋、墙簿之外的）按打开顺序排在这里；最后永远另有一个空的「新分页」。
  webTabs: [],
  tabSeq: 0,
  wallWho: "",
  forumId: "",
  pendingPost: "",
  newsId: "",
  newsSeen: {},
  // 维基条目最底那几条新闻稿：同一张分页，靠这一项记住打开的是哪一篇。
  wikiNews: "",
  talk: null,
  calSeen: {},
  night: { phase: 0, car: "窗", recording: false, print: false },
  chat: [],
  chatPack: "",
  chatLogs: {},
  clinicLooked: {},
  wait: null,
  place: "nowhere",
  known: {},
  chatHist: false,
  chatQuery: "",
  level: 0,
  levelMark: null,
  card: null,
  hub: null,
  four: {},
  view: {},
  base: {},
  tonight: {},
  pairs: {},
  tries: {},
  homework: null,
  handed: {},
  sorted: false,
  compare: {},
  // 对照纸纸尾她自己写的那一行（diary.js COMPARE_GUESS 的下标，-1＝还没写）
  compareGuess: -1,
  cal11: {},
  visit: {},
  visitSeen: {},
  miss: {},
  skipAll: {},
  vhu: {
    authed: false,
    id: "",
    pw: "",
    err: "",
    need: false,
    out: false,
    mail: "",
    notice: "",
    libq: "",
    libdone: false,
    errUrl: "",
    url: "",
    read: {},
  },
});

let S = initial();
let nightTick = null;
let clockHold = false;

function setTime(t) {
  S.time = t;
  if (typeof ensureSerials === "function") ensureSerials();
  renderHud();
}

function renderHud() {
  if (clockEl && !clockHold) clockEl.textContent = S.time || "";
  renderWeek();
  if (placeEl) {
    const rec = S.mode === "night" && S.night && S.night.recording ? "（录音中）" : "";
    placeEl.textContent = hudPlace() + rec;
  }
  sfxSync();
  if (typeof wallTick === "function") wallTick();
}

function hudPlace() {
  if (S.mode === "card" || S.mode === "wait" || S.mode === "end") return "";
  if (typeof syncPlace === "function") syncPlace();
  if (typeof placeLine !== "function") return "";
  return placeLine(S.place);
}

function storyDay() {
  const m = /(\d+)月(\d+)日/.exec(S.time || "");
  if (!m) return 0;
  return Number(m[1]) * 100 + Number(m[2]);
}

function renderWeek() {
  if (typeof renderLevelBox === "function") renderLevelBox();
}

// 画底景（日历、夜里、诊所……）时认领模式。对话常以 goto 收尾直接画回底景，
// 不认领就停在 talk，之后任何没带回调的弹窗一关，draw() 会把那段对话的最后一步再放一遍。
function baseView(mode) {
  S.mode = mode;
  S.talk = null;
}

/* 笔记写在哪一天：以「这一关的钟」为准。
   S.time 有时会停在上一个日子（选关回来、读档回来、日历那一关写的是「8月1日–13日」），
   照它抄下去，笔记就落到一个本关还没到的日子上——日记簿里会看见「八月一日登入九月才该有的帐户」
   这种穿帮。所以只允许往前走：关卡钟比当前时间晚，就用关卡钟。

   日历那一关另说：它的钟本来就是一整段「8月1日–13日」，十三天的笔记全会挤进「8月1日」
   （diary.js 的 dayOf 取第一个日期当分组头）。所以点开哪天，就按哪天记。 */
function noteDayText() {
  if (S.level === 3 && S.calNoteDay) return S.calNoteDay;
  const day = (t) => {
    const m = /(\d+)月(\d+)日/.exec(t || "");
    return m ? Number(m[1]) * 100 + Number(m[2]) : 0;
  };
  const L = typeof levelNow === "function" ? levelNow() : null;
  const clock = (L && L.clock) || "";
  if (clock && day(clock) > day(S.time)) return clock;
  const out = S.time || "";
  // 区间串（「8月1日–13日」）不是某一天：真让它落进日记簿，dayOf 会取头一个日期，
  // 十三天的笔记全挤到「8月1日」那一组去。退回关卡钟，至少是一个真日子。
  if (/日\s*[–—~－]\s*\d/.test(out) && clock) return clock;
  return out;
}

/* who：这一行指向谁（"luo"／"zhou"／"chen"）。
   有 who 的进「三个人」那一栏，没 who 的照旧只在时间线上——现有几十条一条都不用改。
   网页上的字要她自己抄下来才进得来（点那一行小字），所以这里的 who 只决定归属，不决定收不收。 */
function note(id, text, who) {
  if (S.notes.some((n) => n.id === id)) return;
  S.notes.push({ id, text, time: noteDayText(), who: who || "" });
  renderNotes();
}

/* 同一条只在第一次抄下来时算数：网页上那一处点第二次不该再响一声。 */
function notedRow(id, text, who) {
  if (S.notes.some((n) => n.id === id)) return false;
  note(id, text, who);
  return true;
}

function hasEvidence(id) {
  return (S.evidence || []).some((e) => e.id === id);
}

function fileEvidence(item) {
  S.evidence = S.evidence || [];
  if (S.evidence.some((e) => e.id === item.id)) return false;
  S.evidence.push(item);
  renderNotes();
  return true;
}

function renderNotes() {
  renderWeek();
}

/* 读回原值，不要强转布尔。
   大部分 flag 存的就是 true，`if (flag(名))` 这类写法行为不变；
   但少数 flag 要记事，存的是 "yes"/"no"/"none"、"mine"/"his" 这种字，
   强转成 !! 之后 `=== "yes"` 永远不成立——分支会静默走 else。 */
function flag(k, v) {
  if (v === undefined) return S.flags[k];
  S.flags[k] = v;
  renderWeek();
}

const mapLayer = $("#map-layer");

$("#notes-toggle").onclick = () => toggleNotes();
$("#map-toggle").onclick = () => openMap();
$("#map-close").onclick = () => closeMap();
mapLayer.addEventListener("click", (e) => {
  if (e.target === mapLayer) closeMap();
});
if (notesLayer) {
  notesLayer.addEventListener("click", (e) => {
    if (e.target !== notesLayer) return;
    if (S.diaryLeaf && S.diaryLeaf.lock) return;
    if (S.diaryLeaf) dismissDiaryLeaf();
    else closeNotes();
  });
}

const playbarEl = $("#playbar");
const playbarHouse = $("#playbar-house");
const playbarNotes = $("#playbar-notes");
const playbarMap = $("#playbar-map");
const playbarAdvance = $("#playbar-advance");

if (playbarNotes) playbarNotes.onclick = () => toggleNotes();
if (playbarMap) playbarMap.onclick = () => openMap();

function openHouseFromScene() {
  // 已经叠在房间上的网页：再点一次等于关掉，不要 early-return 把人锁死
  if (typeof browserOverRoom === "function" && browserOverRoom()) {
    closeRental();
    return;
  }
  if (S.mode === "web" && !S.paused) return;
  if (S.mode === "wait") openRental();
  else if (typeof houseForumUnread === "function" && houseForumUnread().length) browseFromScene("forum");
  else browseFromScene(typeof wallUnread === "function" && wallUnread().n ? (wallUnread().feed ? "wall" : "wall-mail") : "home");
}

function splitGo(label) {
  const parts = String(label || "").split("　").filter(Boolean);
  if (parts.length >= 3) return { when: parts[0] + "　" + parts[1], where: parts.slice(2).join("　") };
  if (parts.length === 2) return { when: parts[0], where: parts[1] };
  return { when: "", where: parts[0] || "继续" };
}

let readyRang = 0;

function playAdvanceAction() {
  if (S.paused || S.mode === "card") return null;
  return typeof levelAdvance === "function" ? levelAdvance() : null;
}

function renderPlaybar() {
  if (!playbarEl) return;
  renderHud();
  if (S.mode === "end" || S.mode === "card" || S.mode === "wait") {
    playbarEl.hidden = true;
    return;
  }
  playbarEl.hidden = false;

  if (playbarHouse) {
    if (S.paused || (typeof browserOverRoom === "function" && browserOverRoom())) {
      playbarHouse.textContent = "关闭网页";
      playbarHouse.className = "return";
      playbarHouse.disabled = false;
      playbarHouse.onclick = closeRental;
    } else if (S.mode === "web") {
      playbarHouse.textContent = "浏览器";
      playbarHouse.className = "here";
      playbarHouse.disabled = true;
      playbarHouse.onclick = null;
    } else {
      playbarHouse.textContent = "浏览器";
      playbarHouse.className = "";
      playbarHouse.disabled = false;
      playbarHouse.onclick = openHouseFromScene;
    }
    if (typeof wallTick === "function") wallTick();
  }

  const adv = playAdvanceAction();
  if (playbarAdvance) {
    const whenEl = playbarAdvance.querySelector(".go-when");
    const whereEl = playbarAdvance.querySelector(".go-where");
    if (adv && adv.fn) {
      if (S.mode !== "wait" && readyRang !== S.level) {
        readyRang = S.level;
        sfx("ready");
      }
      playbarAdvance.hidden = false;
      if (whenEl) whenEl.textContent = adv.when || "";
      if (whereEl) whereEl.textContent = adv.where || "";
      playbarAdvance.setAttribute("aria-label", "往下，" + [adv.when, adv.where].filter(Boolean).join("，"));
      playbarAdvance.onclick = adv.fn;
    } else {
      playbarAdvance.hidden = true;
      playbarAdvance.onclick = null;
    }
  }
}

function clearStage() {
  if (typeof choiceUnlock === "function") choiceUnlock();
  stage.innerHTML = "";
  stage.onclick = null;
  syncPlace();
  if (mapLayer && !mapLayer.hidden) renderMap();
}

// 手机竖屏便条贴在画面底部（CSS 里 position:absolute），热点卡用 --fork-h 往上让
const forkWatch = typeof ResizeObserver === "function" ? new ResizeObserver(() => fitFork()) : null;
let forkNow = null;
function fitFork() {
  const f = stage.querySelector(":scope > .scene-actions.fork");
  if (f !== forkNow) {
    if (forkNow && forkWatch) forkWatch.unobserve(forkNow);
    forkNow = f;
    if (f && forkWatch) forkWatch.observe(f);
  }
  const h = f && getComputedStyle(f).position === "absolute" ? f.offsetHeight + 8 : 0;
  stage.style.setProperty("--fork-h", h + "px");
}
new MutationObserver(() => fitFork()).observe(stage, { childList: true });
addEventListener("resize", () => fitFork());

function el(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) n.setAttribute(k, "");
    else if (v !== false && v != null) n.setAttribute(k, v);
  });
  (function walk(xs) {
    (Array.isArray(xs) ? xs : [xs]).forEach((c) => {
      if (c == null || c === false || c === "") return;
      if (Array.isArray(c)) walk(c);
      else n.append(typeof c === "string" ? H(c) : c);
    });
  })(kids);
  return n;
}

/* 手机顶栏：运营商、状态、钟点各占一格，两端顶开。
   以前是「中国移动　来电　08:12」——用两个全角空格把三件事撑开，
   像拿空格排的表；真的手机顶栏本来就是左一个、右一个。 */
function phoneStatus(mode, cls) {
  const face = (s) => (typeof yueFace === "function" ? yueFace(s) : s);
  return el("div", { class: cls || "phone-status" }, [
    el("span", { class: "ps-carrier" }, [face("中国移动")]),
    el("span", { class: "ps-mode" }, [face(mode || "")]),
    el("span", { class: "ps-clock" }, [clockHm()]),
  ]);
}

// 本机开发（localhost / file:// / ?dev）才露出「待补图」路径；线上和局域网手机只见灰底
const DEV_PICS = /^(localhost|127\.0\.0\.1|\[::1\])?$/.test(location.hostname) || /[?&]dev\b/.test(location.search);
document.documentElement.classList.toggle("dev-pics", DEV_PICS);

function imgSlot(id, className, alt) {
  const wrap = el("div", {
    class: "img-slot missing " + (className || ""),
    "data-img": id,
  });
  const mark = el("span", { class: "img-mark" }, ["待补图：图/游戏/" + id + ".jpg"]);
  const image = document.createElement("img");
  image.alt = alt || id;
  image.draggable = false;
  const reveal = () => {
    if (!image.naturalWidth) return;
    image.hidden = false;
    wrap.classList.remove("missing");
  };
  let retried = false;
  image.addEventListener("load", reveal);
  image.addEventListener("error", () => {
    if (image.naturalWidth) return;
    // 手机网抖会误报失败：已知缺图不重试，其余隔一下再拉一次
    if (!retried && !PIC_MISSING[id]) {
      retried = true;
      setTimeout(() => {
        if (wrap.isConnected) image.src = picSrc(id) + "&r=1";
      }, 1200);
      return;
    }
    PIC_MISSING[id] = true;
    wrap.classList.add("missing", "broken");
    image.hidden = true;
  });
  wrap.append(image, mark);
  PIC_USED[id] = true;
  image.src = picSrc(id);
  if (image.complete) reveal();
  return wrap;
}

const WHO_IMG = {
  周: "00-通用/头像-周",
  章慧琪: "00-通用/头像-章慧琪",
  陈家豪: "00-通用/头像-陈家豪",
  罗启明: "00-通用/头像-罗启明",
  陈美娟: "00-通用/头像-陈美娟",
  美娟: "00-通用/头像-陈美娟",
  阿乐: "00-通用/头像-阿乐",
  // 999 紧急求助是服务不是人：用听筒剪影，不落到「差人」的占位字上
  "999": "00-通用/头像-999",
};

function locImg(loc) {
  if (!loc) return "";
  if (loc.includes("天台")) return lvPic("场景-天台");
  if (loc.includes("楼梯")) return MAP_PIC + "荣汇街-楼梯";
  if (loc.includes("候诊")) return lvPic("场景-候诊");
  if (loc.includes("澄心")) return lvPic("场景-诊室");
  if (loc.includes("前座门口")) return lvPic("场景-前座门口");
  if (loc.includes("门口")) return lvPic("场景-后座门口");
  if (loc.includes("美娟家")) return lvPic("场景-美娟家");
  if (loc.includes("荣汇") || loc.includes("后座")) return lvPic("场景-后座厅");
  // 「来电／拨出／手机」没有单独场景图；底图由 talkBgId 用 hereBg／当前地点回落
  return "";
}
