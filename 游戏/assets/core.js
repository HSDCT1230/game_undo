const $ = (sel, root = document) => root.querySelector(sel);
const stage = $("#stage");
const clockEl = $("#clock");
const placeEl = $("#hud-place");
const notesLayer = $("#notes-layer");
const notesIndex = $("#notes-index");
const notesLeaf = $("#notes-leaf");
const notesActions = $("#notes-actions");

/* 壳上的中文只写在 JS，不写进 index.html，避免编辑工具把 UTF-8 弄成 ?? */
function shellText(s) {
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
fillShellChrome();

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
const AUTO_LABEL = { off: "自动　关", on: "自动　开" };
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

/** 只有一种写法的文本（界面标签、关卡清单、网页裸串）：粤语／粤＋普转港繁，普通话原样。
    与 T() 的区别：T() 有双语来源，H() 只是把单语文本按模式繁化，幂等。 */
function H(s) {
  if (s == null) return "";
  const mode = typeof langMode === "string" ? langMode : "yue";
  if (mode === "zh") return String(s);
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

/* 顶栏开关的字：写法是「名　值」——「环境音　大」「字　中」「自动　关」。
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
  node.replaceChildren(
    el("span", { class: "os-k" }, [full.slice(0, cut)]),
    el("span", { class: "os-v" }, [full.slice(cut + 1)]),
  );
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
    lang.addEventListener("click", (e) => {
      e.stopPropagation();
      langMode = LANG_MODES[(LANG_MODES.indexOf(langMode) + 1) % LANG_MODES.length];
      try { localStorage.setItem(LANG_KEY, langMode); } catch (err) { /* 无 */ }
      optButtons();
      redrawForLang();
      if (langMode === "both" && typeof showPrompt === "function") {
        const hk = (s) => (typeof toHkTrad === "function" ? toHkTrad(s) : s);
        showPrompt(
          hk("粤＋普"),
          hk("网页与长文只出粤语。人物对白下面，会加一行普通话小字。想整页转普通话，再点一次语言按钮。")
        );
      }
    });
    size.addEventListener("click", (e) => {
      e.stopPropagation();
      sizeStep = (sizeStep + 1) % SIZE_STEPS.length;
      try { localStorage.setItem(SIZE_KEY, String(sizeStep)); } catch (err) { /* 无 */ }
      applySize();
      optButtons();
    });
    auto.addEventListener("click", (e) => {
      e.stopPropagation();
      autoMode = !autoMode;
      try { localStorage.setItem(AUTO_KEY, autoMode ? "1" : "0"); } catch (err) { /* 无 */ }
      optButtons();
      // 开着的时候如果正停在一句对白上，立刻排下一次；关掉就撤掉定时器
      if (typeof clearAuto === "function") clearAuto();
      if (autoMode && S && S.mode === "talk" && typeof drawTalk === "function") drawTalk();
    });
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

/* ---------- 全屏 ----------
   走浏览器全屏（不是 F11：那个脚本管不到，退出也只能靠浏览器自己）。
   按钮只报状态、不猜状态，进出都由 fullscreenchange 回来同步，
   这样玩家按 Esc、按 F11、用浏览器菜单退出，顶栏那颗都会跟着变。
   不支持的浏览器（iPhone 上的 Safari）整颗不出现，不留一颗按了没反应的按钮。 */
const FS_LABEL = { on: "全屏　开", off: "全屏　关" };
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
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    fsToggle();
  });
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
  tabMem: { house: null, wall: null, blank: null },
  wallWho: "",
  forumId: "",
  pendingPost: "",
  newsId: "",
  newsSeen: {},
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

function note(id, text) {
  if (S.notes.some((n) => n.id === id)) return;
  S.notes.push({ id, text, time: S.time || "" });
  renderNotes();
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

function flag(k, v) {
  if (v === undefined) return !!S.flags[k];
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

function playReturnLabel() {
  return S.paused ? "关闭网页" : "";
}

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
