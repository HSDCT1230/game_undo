const $ = (sel, root = document) => root.querySelector(sel);
const stage = $("#stage");
const clockEl = $("#clock");
const placeEl = $("#hud-place");
const notesLayer = $("#notes-layer");
const notesIndex = $("#notes-index");
const notesLeaf = $("#notes-leaf");
const notesActions = $("#notes-actions");

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
  slateOff: {},
  notes: [],
  evidence: [],
  remark: "我需要一个能住的地方。",
  pmBody: "",
  pmSent: "",
  webHist: [],
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
});

let S = initial();
let nightTick = null;

function setTime(t) {
  S.time = t;
  renderHud();
}

function renderHud() {
  if (clockEl) clockEl.textContent = S.time || "";
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

function note(id, text) {
  if (S.notes.some((n) => n.id === id)) return;
  S.notes.push({ id, text });
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
  if (S.mode === "web" && !S.paused) return;
  if (S.mode === "wait") openRental();
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
    if (S.paused) {
      playbarHouse.textContent = playReturnLabel();
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
  stage.innerHTML = "";
  stage.onclick = null;
  syncPlace();
  if (mapLayer && !mapLayer.hidden) renderMap();
}

function el(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) n.setAttribute(k, "");
    else if (v !== false && v != null) n.setAttribute(k, v);
  });
  kids.forEach((c) => n.append(c));
  return n;
}

function imgSlot(id, className, alt) {
  const wrap = el("div", {
    class: "img-slot missing " + (className || ""),
    "data-img": id,
  });
  const mark = el("span", { class: "img-mark" }, ["待补图　图/游戏/" + id + ".png"]);
  const image = document.createElement("img");
  image.alt = alt || id;
  image.draggable = false;
  const reveal = () => {
    if (!image.naturalWidth) return;
    image.hidden = false;
    wrap.classList.remove("missing");
  };
  image.addEventListener("load", reveal);
  image.addEventListener("error", () => {
    if (image.naturalWidth) return;
    PIC_MISSING[id] = true;
    wrap.classList.add("missing");
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
  if (loc.includes("楼梯")) return lvPic("场景-楼梯");
  if (loc.includes("候诊")) return lvPic("场景-候诊");
  if (loc.includes("澄心")) return lvPic("场景-诊室");
  if (loc.includes("前座门口")) return lvPic("场景-前座门口");
  if (loc.includes("门口")) return lvPic("场景-后座门口");
  if (loc.includes("美娟家")) return lvPic("场景-美娟家");
  if (loc.includes("荣汇") || loc.includes("后座")) return lvPic("场景-后座厅");
  if (loc.includes("电话") || loc.includes("来电") || loc.includes("拨出") || loc.includes("隔门")) return lvPic("场景-电话");
  return "";
}
