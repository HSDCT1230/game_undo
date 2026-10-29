/* ---------- 对话引擎：当面 / 电话 / 短信 / 语音留言 ---------- */

function stageBgNode() {
  return stage && stage.querySelector(".room-bg, .clinic-bg, .talk-bg");
}

function roomBgNow() {
  const fromStage = (() => {
    const bg = stageBgNode();
    return bg ? bg.dataset.img || "" : "";
  })();
  // 对话中也优先读舞台上已铺的底图（goto 补底后，下一场 startTalk 才能接上）
  if (S.mode === "talk") return fromStage || (S.talk && S.talk.hereBg) || "";
  return fromStage;
}

function startTalk(beats, loc, kind, meta) {
  const hereBg = roomBgNow();
  const herePlace = S.mode === "talk" ? (S.talk && S.talk.herePlace) || "" : hereBg ? S.place || "" : "";
  S.mode = "talk";
  meta = meta || {};
  S.talk = {
    beats: beats.slice(),
    i: 0,
    loc: loc || "荣汇街 28 号 4 楼",
    kind: kind || "face",
    contact: meta.contact || "",
    number: meta.number || "",
    incoming: !!meta.incoming,
    dialout: !!meta.dialout,
    eavesdrop: !!meta.eavesdrop,
    callSec: meta.incoming ? 0 : 6,
    waiting: false,
    clue: CLUE_IMG,
    // meta.bg 是「这一场不在刚才那间房」：给空串就交给 locImg 按地点挑，
    // 给图号就钉死。她刚从一个地方走开、下一句已经到别处时，舞台底图会留在原处，
    // 不钉就会把厕所铺成客厅、把楼梯铺成诊室。
    hereBg: meta.bg !== undefined ? meta.bg : hereBg,
    herePlace,
  };
  drawTalk();
}

function currentBeat() {
  return S.talk && S.talk.beats[S.talk.i];
}

function applyChoice(c) {
            if (c.note) note(c.note[0], c.note[1]);
            if (c.flag) flag(c.flag, true);
            if (c.tip) tip(c.tip);
            if (typeof c.then === "function") c.then();
            else if (Array.isArray(c.then)) {
              S.talk.beats = S.talk.beats.slice(0, S.talk.i + 1).concat(c.then, S.talk.beats.slice(S.talk.i + 1));
              S.talk.i += 1;
    S.talk.callSec += 4;
              drawTalk();
            }
}

/* 选项要记的不是 true，是一句话（"yes"/"no"/"none"）时用它：
   then: pickFlag(() => flag("zhouTold", "yes"), line(...), ...)。
   选项节拍本身不前进，所以先写 flag 再 stepPast。
   flag 那一下写在做调用方，让 `flag("名",` 这种字面写法留在源码里（全检靠它统计设了哪些 Flag）。 */
function pickFlag(set) {
  const beats = Array.prototype.slice.call(arguments, 1);
  return [{ goto: () => { set(); stepPast(); } }].concat(beats);
}

function advanceBeat(b) {
      if (b.note) note(b.note[0], b.note[1]);
  if (b.flag) flag(b.flag, true);
  if (b.tip) tip(b.tip);
      S.talk.i += 1;
  S.talk.callSec += 3 + Math.min(9, Math.floor(((b.text || "").length) / 14));
      if (!currentBeat()) return;
      drawTalk();
}

function phoneOnly(b) {
  return !!(b.choices && b.choices.length && b.choices.every((c) => c.phone));
}

// emoji 听筒在各系统上颜色不一，统一画成白色线稿
const PHONE_ICO = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';

function phoneIco() {
  return el("span", { class: "phone-act-ico", "aria-hidden": "true", html: PHONE_ICO });
}

function phoneButton(label, onclick, opt) {
  opt = opt || {};
  if (opt.hangup) {
    return el("button", {
      type: "button",
      class: "phone-hang",
      onclick,
    }, [label || "挂断"]);
  }
  // 「拨给阿明」画成通讯录里的一行：名字、号码类别、右边绿色拨号键
  const dial = /^拨给(.+)$/.exec(label || "");
  const copy = [el("span", { class: "phone-act-label" }, [dial ? dial[1] : label])];
  if (opt.hint || dial) copy.push(el("span", { class: "phone-act-hint" }, [opt.hint || "手提电话"]));
  return el("button", {
    type: "button",
    class: "phone-act" + (opt.done ? " done" : ""),
    "aria-label": label,
    onclick,
  }, [
    el("span", { class: "phone-act-copy" }, copy),
    phoneIco(),
  ]);
}

function yueFace(s) {
  return typeof H === "function" ? H(s == null ? "" : String(s)) : (s == null ? "" : String(s));
}

/** 只做港繁，不读语言模式。对白主行专用——「普＋粤」下正文已经转普通话，
    对白若也走 H()，双轨会变成两行一模一样的普通话。 */
function faceYue(s) {
  const t = String(s == null ? "" : s);
  return typeof toHkTrad === "function" ? toHkTrad(t) : t;
}

/** 对白／旁白共用。第三参说明这一句是「听到的」还是「看到／想到的」：
 *  - 不传＝她听到的原话（角色对白、电话、语音留言）→ 粤语档与普＋粤都出港繁粤语；
 *  - true 或 "narr"＝旁白／选项提示（她想到的）→ 普＋粤与普通话出普通话单行；
 *  - "read"＝她低头读的字（短讯）→ 同上。
 *  并排小字由 talkBody() 负责，只有对白才有。 */
function faceLine(text, zh, as) {
  const mode = typeof langMode === "string" ? langMode : "both";
  const t = String(text == null ? "" : text);
  const z = zh != null && zh !== "" ? String(zh).trim() : "";
  if (mode === "zh") return (z || t).trim().replace(/^[（(](.*)[）)]$/, "$1");
  if (mode === "both" && as) return z || (typeof zhOf === "function" ? zhOf(t) : t);
  return faceYue(t);
}

/** 选项前注「【动作／口气】正文」拆成两段：前注小一号、淡一点，像游戏 UI 的提示，不跟正文连读。 */
// 选项前注（橙光式【动作／口气】）已撤：同一组里只要有一格带前注，它就成了「推荐点这个」。
// 现在 label 一律就是她说的那句原话，渲染层不再拆。真要恢复，必须整组全带，见 策划/文字规范.md 3.6。

function choiceBox(b, className) {
  if (phoneOnly(b)) {
    const ch = el("div", { class: "phone-ops" + (b.choices.some((c) => c.hangup) ? " phone-ops-hang" : "") });
    b.choices.forEach((c) => {
      ch.append(phoneButton(yueFace(c.label), () => applyChoice(c), { hint: c.hint ? yueFace(c.hint) : c.hint, hangup: c.hangup }));
    });
    return ch;
  }
  const ch = el("div", { class: "choices " + (className || "") });
  b.choices.forEach((c) => {
    ch.append(el("button", { type: "button", onclick: () => applyChoice(c) }, [yueFace(c.label)]));
  });
  return ch;
}

function nextBtn(b, label) {
  return el("button", {
    class: "btn talk-next",
    type: "button",
    onclick: (e) => {
      e.stopPropagation();
      if (finishTyping()) return;
      advanceBeat(b);
    },
  }, [label || "继续"]);
}

// drawTalk 每次整块重画（切语言也会），只按说话人变没变决定播不播
function turnIn(key) {
  const t = S.talk;
  if (!t || t.turnKey === key) return "";
  t.turnKey = key;
  return " turn-in";
}

/* 已读：这一局里第二次走到同一句，不再逐字打。
   只在这一次开着的页面里算——不进存档、不落 localStorage。
   以前落到本地，于是「重开一局」之后几乎每个字都跳过打字动画，看着像动画坏了；
   现在刷新／重开就从第一句重新打，往回翻到看过的句子仍然直接给全文。 */
let readMap = null;

function readAll() {
  if (readMap) return readMap;
  readMap = {};
  return readMap;
}

function readHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function beatKey(b) {
  if (!b) return "";
  const raw = String(b.text || b.prompt || "") + "|" + String(b.zh || "");
  return raw === "|" ? "" : readHash(raw);
}

function beatRead(b) {
  const k = beatKey(b);
  return !!(k && readAll()[k]);
}

function beatMarkRead(b) {
  const k = beatKey(b);
  if (!k) return;
  readAll()[k] = 1;
}

/* 快速打字机：整句先占位（未打出的字透明），换行不跳；打字中点一下只补全、不翻页 */
const TYPE_MS = 22;
const TYPE_MS_ZH = 12;
const TYPE_PAUSE = /[，。！？、；：…—,.!?]/;
let typer = null;
let typeQueue = [];

function typeLater(node, ms) {
  if (!node) return;
  if (node.dataset && node.dataset.read === "1") return; // 已读：整句直接给出
  typeQueue.push({ node, ms: ms || TYPE_MS });
}

function typeMotionOff() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function finishTyping() {
  if (!typer) return false;
  typer.finish();
  return true;
}

function startTyping() {
  const queue = typeQueue;
  typeQueue = [];
  if (typer) typer.finish();
  const t = S.talk;
  // 同一句重画（切语言等）直接给全文
  if (!queue.length || !t || t.typedAt === t.i || typeMotionOff()) {
    if (t) t.typedAt = t.i;
    return;
  }
  t.typedAt = t.i;
  const parts = queue.map(({ node, ms }) => {
    const chars = Array.from(node.textContent);
    const shown = el("span", {}, []);
    const rest = el("span", { class: "type-rest", "aria-hidden": "true" }, [chars.join("")]);
    node.textContent = "";
    node.append(shown, rest);
    return { chars, shown, rest, ms };
  });
  let p = 0;
  let n = 0;
  let timer = 0;
  const finish = () => {
    clearTimeout(timer);
    parts.forEach((x) => {
      x.shown.textContent = x.chars.join("");
      x.rest.remove();
    });
    if (typer && typer.finish === finish) typer = null;
  };
  const tick = () => {
    const x = parts[p];
    if (!x || !x.shown.isConnected) return finish();
    n += 1;
    x.shown.textContent = x.chars.slice(0, n).join("");
    x.rest.textContent = x.chars.slice(n).join("");
    const ch = x.chars[n - 1];
    if (n >= x.chars.length) {
      p += 1;
      n = 0;
      if (p >= parts.length) return finish();
    }
    timer = setTimeout(tick, TYPE_PAUSE.test(ch) ? x.ms * 4 : x.ms);
  };
  typer = { finish };
  timer = setTimeout(tick, parts[0].ms);
}

function whoClass(name) {
  const key = {
    章慧琪: "zhang",
    周: "zhou",
    周锦荣: "zhou",
    罗启明: "ming",
    阿明: "ming",
    陈家豪: "hao",
    Howard: "hao",
    陈美娟: "mei",
    美娟: "mei",
    阿乐: "lok",
    差人: "cop",
    丽芬: "lifen",
    "女人的声音": "lifen",
    林伟森: "lin",
  }[name];
  return key ? "who-" + key : "";
}

function speakerOf(b) {
  if (!b) return "现场";
  if (b.choices) return "章慧琪";
  return b.who || "现场";
}

/** 对白正文：粤语／普通话各取一侧；「普＋粤」在粤语行下面加一行小字普通话对照。
    没有普通话侧（旁白、录音原话）时只显示粤语，不硬凑。 */
function talkBody(text, zh, className) {
  const box = el("div", { class: "talk-body" });
  const mode = typeof langMode === "string" ? langMode : "yue";
  const z = zh != null && zh !== "" ? String(zh).trim() : "";
  const showZh = mode === "both" && z && z !== String(text == null ? "" : text).trim();
  box.append(el("div", { class: "talk-text" + (className ? " " + className : "") }, [faceLine(text, zh)]));
  if (showZh) {
    // 用 textContent 直接落文本：这行必须是普通话原文，不能再过一遍繁化
    const sub = document.createElement("div");
    sub.className = "talk-zh";
    sub.lang = "zh-CN";
    sub.textContent = z;
    box.append(sub);
  }
  return box;
}

function portraitSlot(who) {
  if (WHO_IMG[who]) return imgSlot(WHO_IMG[who], "talk-portrait", who);
  const ch = (who && who !== "现场") ? who.slice(0, 1) : "·";
  return el("div", { class: "talk-avatar-placeholder", "aria-hidden": "true" }, [ch]);
}

function fmtCall() {
  const s = Math.max(0, Math.floor(S.talk.callSec || 0));
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function clockHm() {
  const m = S.time.match(/(\d{1,2}:\d{2})\s*$/);
  return m ? m[1] : "--:--";
}

// 人站在哪间房，就铺哪张底图。电话／短讯 loc（「来电」「拨出」）没有专用场景图，回落到 hereBg／地点。
function placeSceneFallback() {
  const p = String(S.place || "");
  if (p.startsWith("clinic-wait") || p === "clinic-addr") return lvPic("场景-候诊");
  if (p.startsWith("clinic")) return lvPic("场景-诊室");
  if (p === "mei") return lvPic("场景-美娟家");
  if (p.includes("stair")) return MAP_PIC + "荣汇街-楼梯";
  if (p.includes("roof") || p.includes("天台")) return lvPic("场景-天台");
  if (p.includes("front") || p === "rong-door") return lvPic("场景-后座门口");
  if (p.includes("corridor")) return MAP_PIC + "荣汇街-走廊";
  if (p.includes("bath")) return MAP_PIC + "荣汇街-厕所";
  if (S.mode === "night") return lvPic("场景-夜里后座厅");
  if (typeof hubPlace === "function") {
    const hp = hubPlace();
    if (hp && hp.img) {
      const img = typeof hp.img === "function" ? hp.img() : hp.img;
      if (img) return img;
    }
  }
  return lvPic("场景-后座厅");
}

function talkBgId() {
  const t = S.talk;
  if (!t) return placeSceneFallback();
  if (t.contact === "999") return pic(4, "场景-拨999");
  // 站在具体房间时，优先用房间底图（不要被「荣汇街后座」泛称盖掉）
  if (t.hereBg) return t.hereBg;
  const locBg = locImg(t.loc);
  if (locBg) return locBg;
  return placeSceneFallback();
}

// goto 会先清舞台再开日记／弹窗；先铺地点底图，避免合上前只剩夜蓝空底。
// 用场景同款 room-bg（不透明铺满），不要用 talk-bg：对话底图只有 0.62 透明度，再叠日记遮罩就几乎看不见。
function paintTalkBackdrop() {
  const bgId = talkBgId();
  clearStage();
  if (bgId) {
    const box = el("div", { class: "room scene-fit hub-room", "aria-hidden": "true" });
    box.append(imgSlot(bgId, "room-bg", (S.talk && S.talk.loc) || ""));
    const wrap = el("div", { class: "desk night-desk" });
    wrap.append(box);
    stage.append(wrap);
  }
  renderPlaybar();
}

function ensureStageBackdrop() {
  if (!stage || stageBgNode()) return;
  if (S.mode === "talk") {
    paintTalkBackdrop();
    return;
  }
  const bgId = placeSceneFallback();
  if (!bgId) return;
  const box = el("div", { class: "room scene-fit hub-room", "aria-hidden": "true" });
  box.append(imgSlot(bgId, "room-bg", ""));
  const wrap = el("div", { class: "desk night-desk" });
  wrap.append(box);
  stage.append(wrap);
  renderPlaybar();
}

function drawTalk() {
  const t = S.talk;
  if (!t) return;
  if (t.incoming) {
    clearStage();
    stage.append(drawIncoming());
    renderPlaybar();
    return;
  }
  const b = currentBeat();
  if (!b) return;
  if (b.sfx && t.sfxAt !== t.i) {
    t.sfxAt = t.i;
    sfx(b.sfx);
  }
  if (b.clue !== undefined) t.clue = b.clue;
  // 一句话里换地方（走进厕所／出来站在客厅）：底图跟着这一句走，并且贴住，
  // 后面没写 bg 的句子继续用它——不然第三句又跳回进门时那张。
  if (b.bg !== undefined) t.hereBg = b.bg;
  if (b.goto) {
    if (b.note) note(b.note[0], b.note[1]);
    if (b.flag) flag(b.flag, true);
    if (b.tip) tip(b.tip);
    paintTalkBackdrop();
    b.goto();
    return;
  }
  if (!b.text && !b.choices && !b.act && t.beats[t.i + 1]) {
    advanceBeat(b);
    return;
  }
  clearStage();
  typeQueue = [];
  if (t.kind === "phone") stage.append(drawPhone(b));
  else if (t.kind === "sms") stage.append(drawSms(b));
  else if (t.kind === "msg") stage.append(drawMsg(b));
  else stage.append(drawFace(b));
  startTyping();
  beatMarkRead(b);
  scheduleAuto(b, t.i);
  renderPlaybar();
}

/* 自动播放：检查「设置栏」的开关。读完一句停一下就走；遇到选择、goto、弹窗一概不动。 */
let autoTimer = 0;

function clearAuto() {
  clearTimeout(autoTimer);
  autoTimer = 0;
}

function scheduleAuto(b, i0) {
  clearAuto();
  if (typeof autoMode === "undefined" || !autoMode || !b) return;
  if (b.choices || b.goto || b.act) return;
  if (!b.text && !b.prompt) return;
  const len = Array.from(String(b.text || b.prompt || "")).length + Array.from(String(b.zh || "")).length;
  const ms = Math.min(11000, 1300 + len * 55);
  autoTimer = setTimeout(() => {
    if (!S.talk || S.talk.i !== i0 || S.mode !== "talk") return;
    if (S.modal || S.paused) return;
    if (finishTyping()) {
      autoTimer = setTimeout(() => {
        if (!S.talk || S.talk.i !== i0 || S.mode !== "talk" || S.modal || S.paused) return;
        advanceBeat(b);
      }, 700);
    } else {
      advanceBeat(b);
    }
  }, ms);
}

function typeBody(box) {
  const b = currentBeat();
  if (b && beatRead(b)) {
    const face = box.querySelector(".talk-text");
    const zh = box.querySelector(".talk-zh");
    if (face) face.dataset.read = "1";
    if (zh) zh.dataset.read = "1";
  }
  typeLater(box.querySelector(".talk-text"));
  typeLater(box.querySelector(".talk-zh"), TYPE_MS_ZH);
  return box;
}

function phoneEnterClass() {
  const t = S.talk;
  if (!t || t.phoneEntered) return "";
  t.phoneEntered = true;
  if (t.dialout) sfxDial(t.contact === "999" ? "999" : t.number);
  return " phone-enter";
}

function drawIncoming() {
  const t = S.talk;
  ringStart();
  const who = t.contact || "未知号码";
  const bgId = talkBgId();
  const kids = [];
  if (bgId) kids.push(imgSlot(bgId, "talk-bg", t.loc || "来电"));
  kids.push(el("div", { class: "phone-frame" }, [
    phoneStatus("来电"),
    el("div", { class: "phone-incoming" }, [
      el("div", { class: "phone-tag" }, ["来电"]),
      portraitSlot(WHO_IMG[t.contact] ? t.contact : (t.number || who)),
      el("div", { class: "phone-who" }, [who]),
      el("div", { class: "phone-num" }, [t.number || "手机"]),
      el("button", {
        type: "button",
        class: "phone-answer",
        onclick: () => {
          ringStop();
          sfx("answer");
          t.incoming = false;
          t.callSec = 0;
          drawTalk();
        },
      }, [phoneIco(), "接听"]),
    ]),
  ]));
  return el("div", { class: "talk phone" + phoneEnterClass(), "aria-live": "polite" }, kids);
}

// 每句台词都会重画；照片只在这场对话里第一次出现或换图时才落一次
let clueSeen = { talk: null, clue: "" };

function drawFace(b) {
  const choosing = !!b.choices;
  const prompt = choosing ? (b.prompt && b.prompt !== "……" ? b.prompt : "") : (b.text || "");
  // 选项上面那句提示是旁白，不挂章慧琪的名字和头像
  const stageDir = choosing ? !!prompt : !b.who;
  const speaker = choosing ? "章慧琪" : speakerOf(b);
  // 以前「这一句里出现阿文」会换成另一张候诊照片（00-通用/候诊-阿文）。
  // 那张是另一个房间：暖米墙、布椅、墙上有牌子，而候诊本身是冷灰墙加茶几。
  // 于是一段对话里逐句提不提阿文，背景就在两间房之间跳。底色只认地点，不再认人名。
  const bgId = talkBgId();
  const box = el("div", { class: "talk face" + (stageDir ? " narr" : ""), "aria-live": "polite" });
  if (bgId) box.append(imgSlot(bgId, "talk-bg", S.talk.loc));
  if (S.talk.clue) {
    const fresh = clueSeen.talk !== S.talk || clueSeen.clue !== S.talk.clue;
    clueSeen = { talk: S.talk, clue: S.talk.clue };
    const cap = picCap(S.talk.clue);
    box.append(imgSlot(S.talk.clue, "talk-clue" + (fresh ? " clue-drop" : ""), cap ? cap.name : "线索"));
  }

  const inner = el("div", { class: "face-inner" + (stageDir ? " solo" : "") });
  if (!stageDir) inner.append(portraitSlot(speaker));

  const tone = stageDir ? "" : whoClass(speaker);
  const body = el("div", { class: "face-body" });
  if (!stageDir) body.append(el("div", { class: "talk-name " + tone }, [speaker]));

  if (prompt) {
    const cls = stageDir ? "stage-dir" : tone;
    // 旁白／选项提示／角色话：同一套三模式、同一套打字。
    // 以前旁白是整句淡入，夹在两句角色话中间就像「这一句没动画」——现在一律逐字出。
    if (stageDir || choosing) {
      const dir = el("div", { class: "talk-text " + cls }, [faceLine(prompt, b.zh || b.promptZh, "narr")]);
      typeLater(dir, 18);
      body.append(dir);
    } else {
      body.append(typeBody(talkBody(prompt, b.zh, cls)));
    }
  }
  if (choosing) {
    body.append(choiceBox(b, "face-choices"));
  } else if (b.act) {
    body.append(el("div", { class: "act-row" }, [
      el("button", {
        type: "button",
        class: "act-btn" + (b.ask ? " ask-btn" : ""),
        onclick: (e) => {
          e.stopPropagation();
          if (finishTyping()) return;
          sfx("next");
          advanceBeat(b);
        },
      }, [b.act]),
    ]));
  } else {
    body.append(el("div", { class: "face-cont", "aria-hidden": "true" }, ["▾"]));
    box.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      if (finishTyping()) return;
      sfx("next");
      advanceBeat(b);
    });
  }
  inner.append(body);
  box.append(el("div", { class: "face-dock" }, [inner]));
  return box;
}

function drawPhone(b) {
  const t = S.talk;
  const speaker = speakerOf(b);
  const tag = t.eavesdrop ? "隔门听电话" : t.dialout ? "拨号／通话中" : "通话中";
  const box = el("div", { class: "talk phone" + phoneEnterClass(), "aria-live": "polite" });
  const bgId = talkBgId();
  if (bgId) box.append(imgSlot(bgId, "talk-bg", t.loc || "通话"));
  const cue = b.choices && b.prompt && b.prompt !== "……";
  const narr = b.choices ? cue : !b.who;
  const tone = whoClass(b.choices ? "章慧琪" : (b.who || speaker));
  const phoneLine = narr
    ? el("div", { class: "talk-text stage-dir" }, [faceLine(b.choices ? b.prompt : (b.text || ""), b.zh || b.promptZh, "narr")])
    : b.choices
      ? el("div", { class: "talk-text " + tone }, ["……"])
      : typeBody(talkBody(b.text || "", b.zh, tone));
  if (narr && !b.choices) typeLater(phoneLine);
  const script = el("div", { class: "phone-script" }, [
    narr ? "" : el("div", { class: "phone-line-who " + tone }, [b.choices ? yueFace("你说") : b.who]),
    phoneLine,
  ]);
  const keys = b.choices
    ? choiceBox(b, "phone-choices")
    : el("div", { class: "phone-pad" }, [nextBtn(b, t.eavesdrop ? yueFace("再贴过去听") : yueFace("听下句"))]);
  box.append(el("div", { class: "phone-frame" }, [
    phoneStatus("通话"),
    el("div", { class: "phone-incall" }, [
      el("div", { class: "phone-tag" }, [yueFace(tag)]),
      portraitSlot(WHO_IMG[t.contact] ? t.contact : (WHO_IMG[t.number] ? t.number : speaker)),
      el("div", { class: "phone-who " + whoClass(t.contact) }, [t.contact || S.talk.loc]),
      el("div", { class: "phone-num" }, [t.eavesdrop ? yueFace("听筒凑近门底") : (t.number || yueFace("手机"))]),
      el("div", { class: "phone-timer" }, [t.eavesdrop ? yueFace("听不清") : fmtCall()]),
      script,
      keys,
      el("div", { class: "phone-fakekeys", "aria-hidden": "true" }, [yueFace("静音"), yueFace("免提"), yueFace("键盘")]),
    ]),
  ]));
  return box;
}

function drawSms(b) {
  const t = S.talk;
  const until = t.i + (b.choices ? 0 : 1);
  const log = t.beats.slice(0, until).filter((x) => x.text);
  const grew = log.length > (t.smsShown || 0);
  if (grew) sfx(log[log.length - 1].who === "章慧琪" ? "smsOut" : "smsIn");
  t.smsShown = log.length;
  const thread = el("div", { class: "sms-thread" });
  log.forEach((x, n) => {
    const mine = x.who === "章慧琪";
    const tone = whoClass(mine ? "章慧琪" : (x.who || t.contact || ""));
    const pop = grew && n === log.length - 1 ? turnIn(mine ? "me" : "them") : "";
    const bubble = el("div", { class: "sms-bubble " + tone });
    bubble.append(el("div", { class: "talk-text" }, [faceLine(x.text, x.zh, "read")]));
    thread.append(el("div", { class: "sms-row " + (mine ? "me" : "them") + pop }, [
      bubble,
      el("div", { class: "sms-time" }, [clockHm()]),
    ]));
  });
  const who = t.contact || t.number || "未知号码";
  const sub = t.number && t.number !== who ? t.number : yueFace("短讯");
  const box = el("div", { class: "talk sms", "aria-live": "polite" });
  const bgId = talkBgId();
  if (bgId) box.append(imgSlot(bgId, "talk-bg", t.loc || "短讯"));
  box.append(el("div", { class: "sms-frame" }, [
    phoneStatus("信息", "sms-status"),
    el("div", { class: "sms-bar" }, [
      el("strong", { class: whoClass(who) }, [who]),
      el("span", {}, [sub]),
    ]),
    thread,
    b.choices
      ? el("div", { class: "sms-compose" + (phoneOnly(b) ? " is-phone-op" : "") }, [
        phoneOnly(b) && b.prompt ? el("div", { class: "sms-hint" }, [faceLine(b.prompt, b.promptZh || b.zh, "narr")]) : "",
        !phoneOnly(b) && b.compose ? el("div", { class: "sms-hint" }, [yueFace("发短讯（70字内）")]) : "",
        choiceBox(b, "sms-choices"),
      ])
      : el("div", { class: "sms-compose" }, [nextBtn(b, (t.beats[t.i + 1] && t.beats[t.i + 1].choices) ? yueFace("看完") : yueFace("下一条"))]),
  ]));
  return box;
}

function drawMsg(b) {
  const t = S.talk;
  const box = el("div", { class: "talk msg", "aria-live": "polite" });
  const bgId = talkBgId();
  if (bgId) box.append(imgSlot(bgId, "talk-bg", t.loc || "留言"));
  box.append(el("div", { class: "msg-frame" }, [
    el("div", { class: "msg-tag" }, [yueFace("语音留言")]),
    el("div", { class: "msg-from " + whoClass(t.contact) }, [t.contact || yueFace("未知来源")]),
    el("div", { class: "msg-num" }, [t.number || yueFace("语音留言")]),
    el("div", { class: "msg-wave", "aria-hidden": "true" }, ["▶ 00:07 / 00:11"]),
    msgBody(b, whoClass(t.contact)),
    b.choices ? choiceBox(b, "msg-choices") : el("div", { class: "talk-actions" }, [nextBtn(b, yueFace("听完"))]),
  ]));
  return box;
}

function msgBody(b, cls) {
  if (b.choices || !b.who) {
    const cue = b.choices ? (b.prompt && b.prompt !== "……" ? b.prompt : "") : (b.text || "");
    // 选项上面那句提示是旁白；没写 who 的正文仍按「听到的原话」处理（录音里的话）
    const plain = el("div", { class: "talk-text " + (cue ? "stage-dir" : cls) }, [cue ? faceLine(cue, b.zh || b.promptZh, b.choices ? "narr" : "") : "……"]);
    if (!b.choices) typeLater(plain);
    return plain;
  }
  const quote = (s) => "「" + String(s || "").trim().replace(/^[（(](.*)[）)]$/, "$1") + "」";
  return typeBody(talkBody(quote(b.text), b.zh ? quote(b.zh) : "", cls));
}

function line(who, text, extra) {
  return Object.assign({ who, text }, extra || {});
}

function showVoicemail(from, text, onClose, keep, sub) {
  showModal(from, "「" + text + "」", sub || "贴在门底的手机", "voicemail", onClose, keep);
}
