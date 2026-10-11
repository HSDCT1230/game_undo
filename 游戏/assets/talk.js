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
    hereBg,
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

function phoneButton(label, onclick, opt) {
  opt = opt || {};
  if (opt.hangup) {
    return el("button", {
      type: "button",
      class: "phone-hang",
      onclick,
    }, [label || "挂断"]);
  }
  const copy = [el("span", { class: "phone-act-label" }, [label])];
  if (opt.hint) copy.push(el("span", { class: "phone-act-hint" }, [opt.hint]));
  return el("button", {
    type: "button",
    class: "phone-act" + (opt.done ? " done" : ""),
    onclick,
  }, [
    el("span", { class: "phone-act-ico", "aria-hidden": "true" }, ["📞"]),
    el("span", { class: "phone-act-copy" }, copy),
  ]);
}

function choiceBox(b, className) {
  if (phoneOnly(b)) {
    const ch = el("div", { class: "phone-ops" + (b.choices.some((c) => c.hangup) ? " phone-ops-hang" : "") });
    b.choices.forEach((c) => {
      ch.append(phoneButton(c.label, () => applyChoice(c), { hint: c.hint, hangup: c.hangup }));
    });
    return ch;
  }
  const ch = el("div", { class: "choices " + (className || "") });
  b.choices.forEach((c) => {
    ch.append(el("button", { type: "button", onclick: () => applyChoice(c) }, [c.label]));
  });
  return ch;
}

function nextBtn(b, label) {
  return el("button", {
    class: "btn talk-next",
    type: "button",
    onclick: (e) => {
      e.stopPropagation();
      advanceBeat(b);
    },
  }, [label || "继续"]);
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
    "丽芬（旧机）": "lifen",
    林伟森: "lin",
  }[name];
  return key ? "who-" + key : "";
}

function speakerOf(b) {
  if (!b) return "现场";
  if (b.choices) return "章慧琪";
  return b.who || "现场";
}

/** 粤语主句 + 可选下行括号普通话（只给角色话用；旁白／选项不走这里） */
function talkBody(text, zh, className) {
  const box = el("div", { class: "talk-body" });
  box.append(el("div", { class: "talk-text" + (className ? " " + className : "") }, [text || ""]));
  if (zh) {
    const shown = /^\(.*\)$/.test(String(zh).trim()) ? String(zh).trim() : "(" + zh + ")";
    box.append(el("div", { class: "talk-zh" }, [shown]));
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
  if (p.includes("stair")) return lvPic("场景-楼梯");
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
  if (b.goto) {
    if (b.note) note(b.note[0], b.note[1]);
    if (b.flag) flag(b.flag, true);
    if (b.tip) tip(b.tip);
    paintTalkBackdrop();
    b.goto();
    return;
  }
  clearStage();
  if (t.kind === "phone") stage.append(drawPhone(b));
  else if (t.kind === "sms") stage.append(drawSms(b));
  else if (t.kind === "msg") stage.append(drawMsg(b));
  else stage.append(drawFace(b));
  renderPlaybar();
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
    el("div", { class: "phone-status" }, ["中国移动　来电　" + clockHm()]),
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
      }, [el("span", { class: "phone-act-ico", "aria-hidden": "true" }, ["📞"]), "接听"]),
    ]),
  ]));
  return el("div", { class: "talk phone" + phoneEnterClass(), "aria-live": "polite" }, kids);
}

// 每句台词都会重画；照片只在这场对话里第一次出现或换图时才落一次
let clueSeen = { talk: null, clue: "" };

const AWEN_BG = "00-通用/候诊-阿文";

function awenVisible(prompt) {
  if (!/阿文/.test(prompt || "")) return false;
  if (!/候诊|澄心/.test((S.talk && S.talk.loc) || "")) return false;
  if (/刚走|剛剛走|啱啱走/.test(prompt)) return false;
  return true;
}

function drawFace(b) {
  const choosing = !!b.choices;
  const stageDir = !b.who && !choosing;
  const speaker = choosing ? "章慧琪" : speakerOf(b);
  const prompt = choosing ? (b.prompt && b.prompt !== "……" ? b.prompt : "") : (b.text || "");
  const awen = awenVisible(prompt);
  const bgId = awen ? AWEN_BG : talkBgId();
  const box = el("div", { class: "talk face" + (stageDir ? " narr" : "") + (awen ? " awen-photo" : ""), "aria-live": "polite" });
  if (bgId) box.append(imgSlot(bgId, "talk-bg", S.talk.loc));
  if (S.talk.clue) {
    const fresh = clueSeen.talk !== S.talk || clueSeen.clue !== S.talk.clue;
    clueSeen = { talk: S.talk, clue: S.talk.clue };
    box.append(imgSlot(S.talk.clue, "talk-clue" + (fresh ? " clue-drop" : ""), S.talk.clue.split("/").pop().replace(/^(示意|场景|证据)-/, "")));
  }

  const inner = el("div", { class: "face-inner" + (stageDir ? " solo" : "") });
  if (!stageDir) inner.append(portraitSlot(speaker));

  const tone = stageDir ? "" : whoClass(speaker);
  const body = el("div", { class: "face-body" });
  if (!stageDir) body.append(el("div", { class: "talk-name " + tone }, [speaker]));

  if (prompt) {
    const gaze = b.gaze === "you" ? " gaze-you" : b.gaze === "him" ? " gaze-him" : "";
    const cls = (stageDir ? "stage-dir" : tone) + (awen ? " awen-line" : "") + gaze;
    // 旁白不加普通话行；角色话读 b.zh
    if (stageDir || choosing) {
      body.append(el("div", { class: "talk-text " + cls }, [prompt]));
    } else {
      body.append(talkBody(prompt, b.zh, cls));
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
          sfx("next");
          advanceBeat(b);
        },
      }, [b.act]),
    ]));
  } else {
    body.append(el("div", { class: "face-cont", "aria-hidden": "true" }, ["▾"]));
    box.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      sfx("next");
      advanceBeat(b);
    });
  }
  inner.append(body);
  box.append(el("div", { class: "face-dock" }, [inner]));
  if (!b.act && S.talk.loc === "澄心诊室" && [6, 8, 10].includes(S.level)) box.append(askGrey());
  return box;
}

function askGrey() {
  return el("button", {
    type: "button",
    class: "ask-btn grey",
    disabled: true,
    title: "姐夫那句话到了嘴边。",
    "aria-label": "问他（按不了）",
  }, ["问他"]);
}

function drawPhone(b) {
  const t = S.talk;
  const speaker = speakerOf(b);
  const tag = t.eavesdrop ? "隔门听电话" : t.dialout ? "拨号　通话中" : "通话中";
  const box = el("div", { class: "talk phone" + phoneEnterClass(), "aria-live": "polite" });
  const bgId = talkBgId();
  if (bgId) box.append(imgSlot(bgId, "talk-bg", t.loc || "通话"));
  const narr = !b.choices && !b.who;
  const tone = whoClass(b.choices ? "章慧琪" : (b.who || speaker));
  const phoneLine = b.choices
    ? el("div", { class: "talk-text " + tone }, [b.prompt || "……"])
    : (narr
      ? el("div", { class: "talk-text stage-dir" }, [b.text || ""])
      : talkBody(b.text || "", b.zh, tone));
  const script = el("div", { class: "phone-script" }, [
    el("div", { class: "phone-line-who " + tone }, [b.choices ? "你说" : (b.who || (t.eavesdrop ? "隔门" : "听筒"))]),
    phoneLine,
  ]);
  const keys = b.choices
    ? choiceBox(b, "phone-choices")
    : el("div", { class: "phone-pad" }, [nextBtn(b, t.eavesdrop ? "再贴过去听" : "听下句")]);
  box.append(el("div", { class: "phone-frame" }, [
    el("div", { class: "phone-status" }, ["中国移动　通话　" + clockHm()]),
    el("div", { class: "phone-incall" }, [
      el("div", { class: "phone-tag" }, [tag]),
      portraitSlot(WHO_IMG[t.contact] ? t.contact : (WHO_IMG[t.number] ? t.number : speaker)),
      el("div", { class: "phone-who " + whoClass(t.contact) }, [t.contact || S.talk.loc]),
      el("div", { class: "phone-num" }, [t.eavesdrop ? "听筒凑近门底" : (t.number || "手机")]),
      el("div", { class: "phone-timer" }, [t.eavesdrop ? "听不清" : fmtCall()]),
      script,
      keys,
      el("div", { class: "phone-fakekeys", "aria-hidden": "true" }, ["静音", "免提", "键盘"]),
    ]),
  ]));
  return box;
}

function drawSms(b) {
  const t = S.talk;
  const until = t.i + (b.choices ? 0 : 1);
  const log = t.beats.slice(0, until).filter((x) => x.text);
  if (log.length > (t.smsShown || 0)) sfx(log[log.length - 1].who === "章慧琪" ? "smsOut" : "smsIn");
  t.smsShown = log.length;
  const thread = el("div", { class: "sms-thread" });
  log.forEach((x) => {
    const mine = x.who === "章慧琪";
    const tone = whoClass(mine ? "章慧琪" : (x.who || t.contact || ""));
    thread.append(el("div", { class: "sms-row " + (mine ? "me" : "them") }, [
      el("div", { class: "sms-bubble " + tone }, [x.text]),
      el("div", { class: "sms-time" }, [clockHm()]),
    ]));
  });
  const who = t.contact || t.number || "未知号码";
  const sub = t.number && t.number !== who ? t.number : "短讯";
  const box = el("div", { class: "talk sms", "aria-live": "polite" });
  const bgId = talkBgId();
  if (bgId) box.append(imgSlot(bgId, "talk-bg", t.loc || "短讯"));
  box.append(el("div", { class: "sms-frame" }, [
    el("div", { class: "sms-status" }, ["中国移动　信息　" + clockHm()]),
    el("div", { class: "sms-bar" }, [
      el("strong", { class: whoClass(who) }, [who]),
      el("span", {}, [sub]),
    ]),
    thread,
    b.choices
      ? el("div", { class: "sms-compose" + (phoneOnly(b) ? " is-phone-op" : "") }, [
        phoneOnly(b) && b.prompt ? el("div", { class: "sms-hint" }, [b.prompt]) : "",
        !phoneOnly(b) && b.compose ? el("div", { class: "sms-hint" }, ["发短讯（70字内）"]) : "",
        choiceBox(b, "sms-choices"),
      ])
      : el("div", { class: "sms-compose" }, [nextBtn(b, (t.beats[t.i + 1] && t.beats[t.i + 1].choices) ? "看完" : "下一条")]),
  ]));
  return box;
}

function drawMsg(b) {
  const t = S.talk;
  const box = el("div", { class: "talk msg", "aria-live": "polite" });
  const bgId = talkBgId();
  if (bgId) box.append(imgSlot(bgId, "talk-bg", t.loc || "留言"));
  box.append(el("div", { class: "msg-frame" }, [
    el("div", { class: "msg-tag" }, ["语音留言"]),
    el("div", { class: "msg-from " + whoClass(t.contact) }, [t.contact || "未知来源"]),
    el("div", { class: "msg-num" }, [t.number || "语音留言"]),
    el("div", { class: "msg-wave", "aria-hidden": "true" }, ["▶　00:07 / 00:11"]),
    el("div", { class: "talk-text " + whoClass(t.contact) }, [b.choices ? (b.prompt || "……") : ("「" + (b.text || "") + "」")]),
    b.choices ? choiceBox(b, "msg-choices") : el("div", { class: "talk-actions" }, [nextBtn(b, "听完")]),
  ]));
  return box;
}

function line(who, text, extra) {
  return Object.assign({ who, text }, extra || {});
}

function showVoicemail(from, text, onClose, keep) {
  showModal(from, "「" + text + "」", "贴在门底的手机", "voicemail", onClose, keep);
}
