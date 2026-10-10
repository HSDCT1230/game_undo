/* ---------- 声音：界面音（多数合成，翻合日记簿、纸、地图、大图用录音）、字幕底乐（合成）、环境声（文件，放 assets/sfx/） ---------- */

// 右上角按钮只关环境声（地点循环的那一首）。操作音、字幕底乐、录音底噪都不走它
const SFX_KEY = "undo-sfx";
const BG_VOL = [1, 0.4, 0];
const BG_LABEL = ["环境音　大", "环境音　小", "环境音　关"];

let bgLevel = 0;
try { bgLevel = Math.min(2, Math.max(0, Number(localStorage.getItem(SFX_KEY)) || 0)); } catch (e) { /* 无 */ }

let sfxCtx = null;
let sfxOut = null;  // 字幕底乐、录音底噪、仍用合成的操作音。不接环境音开关
let sfxNoiseBuf = null;
let sfxReady = false;
let sfxKeep = null; // 环境声关掉后浏览器会休眠 AudioContext；吊着一条极轻的音，操作音才不丢

function bgOn() {
  return !!BG_VOL[bgLevel];
}

// 必须在用户手势里同步 resume；不要 .then 再播——手势过了浏览器会吞合成音
function sfxResume() {
  if (!sfxCtx) return;
  if (sfxCtx.state === "suspended") {
    try { sfxCtx.resume(); } catch (e) { /* 无 */ }
  }
}

function sfxKeepAlive() {
  if (!sfxCtx || sfxKeep) return;
  try {
    const o = sfxCtx.createOscillator();
    const g = sfxCtx.createGain();
    g.gain.value = 0.00001;
    o.frequency.value = 30;
    o.connect(g).connect(sfxCtx.destination);
    o.start();
    sfxKeep = { o, g };
  } catch (e) { /* 无 */ }
}

function sfxAudio() {
  if (!sfxReady) return null;
  if (!sfxCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    sfxCtx = new AC();
    sfxOut = sfxCtx.createGain();
    sfxOut.gain.value = 1;
    sfxOut.connect(sfxCtx.destination);
    const len = sfxCtx.sampleRate * 2;
    sfxNoiseBuf = sfxCtx.createBuffer(1, len, sfxCtx.sampleRate);
    const d = sfxNoiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  sfxResume();
  sfxKeepAlive();
  return sfxCtx;
}

// 浏览器要玩家先点一下才肯出声；手势里立刻拉起 Context，再对一次环境／垫乐
function sfxUnlock() {
  if (!sfxReady) {
    sfxReady = true;
    sfxAudio();
    sfxSync();
    return;
  }
  sfxResume();
  sfxKeepAlive();
  sfxSync();
}
document.addEventListener("pointerdown", sfxUnlock, true);
document.addEventListener("keydown", sfxUnlock, true);

function sfxEnv(g, t, dur, peak, attack) {
  const a = Math.min(attack || 0.004, dur / 2);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function sfxTone(freq, at, dur, o) {
  o = o || {};
  const c = sfxCtx;
  const t = c.currentTime + (at || 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type || "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  sfxEnv(g, t, dur, o.gain || 0.1, o.attack);
  osc.connect(g).connect(o.dest || sfxOut);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function sfxNoise(at, dur, o) {
  o = o || {};
  const c = sfxCtx;
  const t = c.currentTime + (at || 0);
  const src = c.createBufferSource();
  src.buffer = sfxNoiseBuf;
  const f = c.createBiquadFilter();
  f.type = o.filter || "bandpass";
  f.frequency.setValueAtTime(o.freq || 2000, t);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  f.Q.value = o.q || 1;
  const g = c.createGain();
  sfxEnv(g, t, dur, o.gain || 0.1, o.attack);
  src.connect(f).connect(g).connect(o.dest || sfxOut);
  src.start(t, Math.random() * 1.5);
  src.stop(t + dur + 0.05);
}

const DTMF = {
  1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477],
  7: [852, 1209], 8: [852, 1336], 9: [852, 1477], 0: [941, 1336], "*": [941, 1209], "#": [941, 1477],
};

/* 点按类走 HTMLAudio，不进 AudioContext */
function sfxWavUrl(samples, sr) {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  ws(8, "WAVE");
  ws(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  ws(36, "data");
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, samples[i], true);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

/* 点击：暂用旧键帽（略钝的机械感，不尖） */
function sfxClickSynth(role) {
  const sr = 44100;
  const scale = role === "next" ? 0.92 : role === "pick" ? 1.05 : 1;
  const peak = 0.21 * scale; // 略压一点，别盖过对白气氛
  const dur = 0.09;
  const n = Math.floor(sr * dur);
  const out = new Int16Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.min(1, t / 0.0025) * Math.exp(-t / 0.025);
    const clack = Math.sin(2 * Math.PI * 310 * t) * 0.4
      + Math.sin(2 * Math.PI * 155 * t) * 0.4;
    const shell = (Math.random() * 2 - 1) * 0.2 * Math.exp(-t / 0.006);
    lp = lp * 0.8 + (clack + shell) * 0.2;
    const x = lp * env * peak * 0.95;
    out[i] = Math.max(-32767, Math.min(32767, x * 32767));
  }
  return sfxWavUrl(out, sr);
}

const SFX_CLICK_CAND = [
  { id: "7", title: "旧键帽（暂用）", sub: "略钝的机械感" },
];
const SFX_CLICK_USE = "7";

function sfxClickByCand(role) {
  return sfxClickSynth(role || "next");
}

function sfxPlayClickCand(_candId, role) {
  const a = new Audio(sfxClickByCand(role || "next"));
  a.play().catch(() => { /* 无 */ });
}

const SFX_WAV = {
  tap: sfxClickByCand("tap"),
  next: sfxClickByCand("next"),
  pick: sfxClickByCand("pick"),
};
const sfxWavAudio = {};

const SFX = {
  // 清单打勾
  tick() {
    sfxNoise(0, 0.05, { freq: 2400, q: 1.8, gain: 0.045, attack: 0.012 });
    sfxNoise(0.05, 0.1, { freq: 2200, to: 2800, q: 1.8, gain: 0.05, attack: 0.012 });
  },
  // 走过去：唐楼水泥地几步
  steps() {
    [0, 0.42, 0.84].forEach((at, i) => {
      sfxTone(78 + i * 4, at, 0.11, { gain: 0.15, attack: 0.018 });
      sfxNoise(at, 0.07, { filter: "lowpass", freq: 480, gain: 0.09, attack: 0.018 });
    });
  },
  // 屏幕上的一句提示
  tip() { sfxTone(620, 0, 0.24, { gain: 0.016, attack: 0.035 }); },
  // 「往下」第一次亮
  ready() {
    sfxTone(470, 0, 0.44, { gain: 0.016, attack: 0.045 });
    sfxTone(700, 0.14, 0.52, { gain: 0.013, attack: 0.045 });
  },
  // 接听
  answer() { sfxTone(820, 0, 0.11, { gain: 0.024, attack: 0.018 }); },
  // 短讯收到
  smsIn() {
    sfxTone(1180, 0, 0.1, { type: "triangle", gain: 0.024 });
    sfxTone(1580, 0.1, 0.14, { type: "triangle", gain: 0.022 });
    sfxTone(55, 0, 0.3, { type: "sawtooth", gain: 0.015 });
  },
  // 短讯发出
  smsOut() {
    sfxNoise(0, 0.24, { freq: 1000, to: 2200, q: 0.8, gain: 0.03, attack: 0.07 });
    sfxTone(900, 0.12, 0.08, { gain: 0.015 });
  },
  // 倾偈：表姐来消息／自己发出
  chatIn() {
    sfxTone(540, 0, 0.16, { gain: 0.024 });
    sfxTone(800, 0.09, 0.24, { gain: 0.02 });
  },
  chatOut() { sfxTone(800, 0, 0.1, { gain: 0.015 }); },
  // 旧键盘一下
  key() {
    sfxNoise(0, 0.035, { freq: 1300 + Math.random() * 400, q: 1, gain: 0.07, attack: 0.012 });
    sfxTone(130, 0, 0.03, { gain: 0.02 });
  },
  // 廿八屋：送出、顶帖
  send() {
    sfxTone(900, 0, 0.26, { gain: 0.02 });
    sfxTone(1320, 0.08, 0.32, { gain: 0.012 });
  },
  // 录音键
  recOn() {
    sfxNoise(0, 0.03, { freq: 1100, gain: 0.16, attack: 0.012 });
    sfxNoise(0.06, 0.035, { freq: 900, gain: 0.13, attack: 0.012 });
  },
  recOff() { sfxNoise(0, 0.045, { freq: 750, gain: 0.17, attack: 0.012 }); },
  // 语音留言开始
  vm() { sfxTone(820, 0, 0.3, { gain: 0.024, attack: 0.025 }); },
};

/* 打开廿八屋那一下才响；在站内翻页不再响，离开网页再回来又响 */
let webHeard = false;

function sfxWebOpen() {
  if (webHeard) return;
  webHeard = true;
  sfx("browserOpen");
}

function sfxWebClose() {
  webHeard = false;
  sfx("browserClose");
}

/* 用录音的操作音：Pixabay 实录，音量已在文件里调好，按原音量放 */
const SFX_FILES = {
  open: "操作-翻开日记簿",
  shut: "操作-合上日记簿",
  photo: "操作-点开大图",
  unfold: "操作-摊开地图",
  paper: "操作-纸放回去",
  file: "操作-记下来",
  drip: "操作-滴水",
  browserOpen: "操作-打开浏览器",
  browserClose: "操作-关闭浏览器",
};
// 换了同名文件就改这个
const SFX_REV = "20261010f";
const sfxFileAudio = {};

function sfxFileGet(name) {
  if (!sfxFileAudio[name]) {
    const a = new Audio("assets/sfx/" + SFX_FILES[name] + ".mp3?v=" + SFX_REV);
    a.preload = "auto";
    sfxFileAudio[name] = a;
  }
  return sfxFileAudio[name];
}
Object.keys(SFX_FILES).forEach(sfxFileGet);

function sfx(name) {
  if (!sfxReady) return;
  if (SFX_WAV[name]) {
    if (!sfxWavAudio[name]) {
      const a0 = new Audio(SFX_WAV[name]);
      a0.preload = "auto";
      sfxWavAudio[name] = a0;
    }
    const base = sfxWavAudio[name];
    const a = base.paused || base.ended ? base : base.cloneNode();
    a.volume = 1;
    a.currentTime = 0;
    a.play().catch(() => { /* 无 */ });
    return;
  }
  if (SFX_FILES[name]) {
    const base = sfxFileGet(name);
    // 上一下还没放完就另开一个，不切断
    const a = base.paused || base.ended ? base : base.cloneNode();
    a.currentTime = 0;
    a.play().catch(() => { /* 无 */ });
    return;
  }
  // 合成音：先拉起 Context（环境声关着也要），再排程
  if (!SFX[name] || !sfxAudio()) return;
  sfxResume();
  sfxKeepAlive();
  try { SFX[name](); } catch (e) { /* 无 */ }
}

/* 拨号：按键音，再响两下回铃 */
function sfxDial(number) {
  if (!sfxAudio()) return;
  let digits = String(number || "").replace(/[^0-9*#]/g, "");
  if (!digits) digits = String(Math.floor(20000000 + Math.random() * 79999999));
  digits = digits.slice(0, 8);
  let at = 0;
  digits.split("").forEach((d) => {
    const f = DTMF[d];
    if (!f) return;
    sfxTone(f[0], at, 0.09, { gain: 0.03 });
    sfxTone(f[1], at, 0.09, { gain: 0.03 });
    at += 0.13;
  });
  at += 0.4;
  [0, 1.4].forEach((k) => {
    sfxTone(440, at + k, 0.8, { gain: 0.022, attack: 0.02 });
    sfxTone(480, at + k, 0.8, { gain: 0.022, attack: 0.02 });
  });
}

/* 来电铃：响到接听或离开为止 */
let ringTimer = null;

function ringStart() {
  if (ringTimer || !sfxAudio()) return;
  const once = () => {
    if (!sfxAudio()) return;
    [1319, 1047, 1319, 1047, 1319, 1047].forEach((f, i) => sfxTone(f, i * 0.11, 0.1, { type: "square", gain: 0.022 }));
    sfxTone(55, 0, 0.5, { type: "sawtooth", gain: 0.04 });
  };
  once();
  ringTimer = setInterval(once, 2000);
}

function ringStop() {
  if (!ringTimer) return;
  clearInterval(ringTimer);
  ringTimer = null;
}

/* 字幕底乐：很淡的一层低音，字幕出现时淡入，离开时淡出 */
let padNode = null;

function padStart(root) {
  if (padNode || !sfxAudio()) return;
  const c = sfxCtx;
  const t = c.currentTime;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 3);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 650;
  f.Q.value = 0.5;
  const lfo = c.createOscillator();
  const depth = c.createGain();
  lfo.frequency.value = 0.07;
  depth.gain.value = 180;
  lfo.connect(depth).connect(f.frequency);
  root = root || 110;
  const oscs = [[root, "triangle", 0], [root * 1.498, "sine", 4], [root * 2.378, "sine", -5]].map(([fr, type, cents]) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = fr;
    o.detune.value = cents;
    o.connect(f);
    o.start(t);
    return o;
  });
  f.connect(g).connect(sfxOut);
  lfo.start(t);
  padNode = { g, oscs: oscs.concat(lfo) };
}

function padStop(fade) {
  if (!padNode || !sfxCtx) return;
  const p = padNode;
  padNode = null;
  const t = sfxCtx.currentTime;
  const d = fade || 1.2;
  p.g.gain.cancelScheduledValues(t);
  p.g.gain.setValueAtTime(Math.max(0.0001, p.g.gain.value), t);
  p.g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  p.oscs.forEach((o) => o.stop(t + d + 0.1));
}

/* 录音开着：叠一层很轻的磁带底噪 */
let hissNode = null;

function hissOn(on) {
  if (!on) {
    if (hissNode && sfxCtx) {
      const h = hissNode;
      hissNode = null;
      const t = sfxCtx.currentTime;
      h.g.gain.setValueAtTime(h.g.gain.value, t);
      h.g.gain.linearRampToValueAtTime(0, t + 0.4);
      h.src.stop(t + 0.5);
    }
    return;
  }
  if (hissNode || !sfxAudio()) return;
  const c = sfxCtx;
  const src = c.createBufferSource();
  src.buffer = sfxNoiseBuf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 3500;
  f.Q.value = 0.4;
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.018, c.currentTime + 0.6);
  src.connect(f).connect(g).connect(sfxOut);
  src.start();
  hissNode = { src, g };
}

/* 环境声：按地点循环。只用 assets/sfx/ 里的选用文件，不用 备用/ 里挑剩的 */
const AMB_FILES = {
  "rong-day": "环境-后座白天",           // Documentary Mystery（1～3 关全天；之后七点前）
  "rong-night": "环境-后座夜里",         // Night Interior（第 4 关整天；第 5～12 关夜里）
  "rong-night-late": "环境-后座夜里-后段", // Hidden Hypothesis（第 13 关起后座夜里）
  "rong-stair": "环境-楼梯走廊",
  "rong-roof": "环境-天台",
  "rong-street": "环境-深水埗街道",
  "clinic-wait": "环境-澄心候诊",
  "clinic-room": "环境-澄心诊室",         // 初诊：Low Energy
  "clinic-room-8": "环境-澄心诊室-第8关",   // 第二次：8-2 Thoughtful Piano Calm
  "clinic-room-10": "环境-澄心诊室-第10关", // 第三次：10-2 Quiet Suspicions
  "clinic-room-12": "环境-澄心诊室-第12关", // 第四次：10-3 Tense Sad Piano
  "clinic-room-14": "环境-澄心诊室-第14关", // 拿笔记：12-4 Echoes of Mystery
  mei: "环境-表姐家",
};
/* 就诊次序 → 配乐（勿按「备用」曲目；勿把 8-1/10-1 等落选曲写进来） */
const CLINIC_AMB_BY_VISIT = {
  1: "clinic-room",
  2: "clinic-room-8",
  3: "clinic-room-10",
  4: "clinic-room-12",
  5: "clinic-room-14",
};
const CLINIC_VISIT_BY_LEVEL = { 6: 1, 8: 2, 10: 3, 12: 4, 14: 5 };
const AMB_VOL = 0.5;
// 换了同名文件就改这个，免得浏览器放旧的
const AMB_REV = "20261010f";
const ambMissing = {};

function ambSrc(key) {
  return "assets/sfx/" + AMB_FILES[key] + ".mp3?v=" + AMB_REV;
}
let ambNow = { key: "", audio: null };

/* 从钟面判断日夜：有几点用几点；没有则看「早上／夜里」等词。不清楚就返回 "" */
function dayPart(t) {
  const s = String(t || "");
  const m = /(\d{1,2}):(\d{2})\s*$/.exec(s);
  if (m) {
    const h = Number(m[1]);
    return h >= 19 || h < 6 ? "night" : "day";
  }
  if (/傍晚|黄昏|入夜|凌晨|午夜|深夜|夜里|夜晚/.test(s)) return "night";
  if (/\s夜\s*$/.test(s) || /日\s*夜\s*$/.test(s)) return "night";
  if (/早上|早晨|清晨|上午|中午|午后|下午|白天/.test(s)) return "day";
  return "";
}

/* 第 4～12 关后座夜里同一首；第四次就诊之后（第 13 关上门起）换一首，免得听到结局都是同一首 */
function rongNightKey() {
  return S.level >= 13 ? "rong-night-late" : "rong-night";
}

function clinicAmbKey() {
  const visit = (S.clinic && S.clinic.visit)
    || CLINIC_VISIT_BY_LEVEL[S.level]
    || 1;
  return CLINIC_AMB_BY_VISIT[visit] || "clinic-room";
}

function ambKey() {
  if (!S || S.mode === "card" || S.mode === "wait" || S.mode === "end") return "";
  const p = String(S.place || "");
  if (p === "mei") return "mei";
  if (p === "clinic-wait") return "clinic-wait";
  if (p === "clinic-room") return clinicAmbKey();
  if (p === "rong-roof") return "rong-roof";
  if (p === "rong-street") return "rong-street";
  // 唐楼走廊／楼梯：楼梯环境声（含上门关的走廊尽头）
  if (p === "rong-stair" || p === "rong-landing" || p === "rong-backstair" || p === "rong-corridor") return "rong-stair";
  if (p.startsWith("rong")) {
    // 刚入住（1～3 关）日夜都放白天那首；第 4 关整关夜里那首
    if (S.level <= 3) return "rong-day";
    if (S.level === 4) return rongNightKey();
    // 钟面优先：点证据时 sfxUnlock 会再对一次，不能靠停着的旧夜里那首
    const part = dayPart(S.time);
    if (part === "night") return rongNightKey();
    if (part === "day") return "rong-day";
    // 钟面没写清：只有还在夜里流程里才放夜里
    return S.mode === "night" ? rongNightKey() : "rong-day";
  }
  return "";
}

function ambFade(audio, to, ms, done) {
  const from = audio.volume;
  const t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step);
    else if (done) done();
  };
  requestAnimationFrame(step);
}

function ambPlay(a) {
  const vol = AMB_VOL * BG_VOL[bgLevel];
  a.play().then(() => {
    if (ambNow.audio !== a) return;
    if (a.volume < vol * 0.9) ambFade(a, vol, 1500);
    else a.volume = vol;
  }).catch(() => { /* 浏览器还不许出声；下次点按再试 */ });
}

function ambSet(key) {
  // 同地点但上次被自动播放拦住、停着：在同一次用户点按里再试
  if (key && key === ambNow.key && ambNow.audio) {
    if (ambNow.audio.paused && BG_VOL[bgLevel]) ambPlay(ambNow.audio);
    return;
  }
  const old = ambNow;
  if (old.audio) ambFade(old.audio, 0, 1200, () => old.audio.pause());
  ambNow = { key, audio: null };
  if (!key || ambMissing[key]) return;
  const a = new Audio(ambSrc(key));
  a.loop = true;
  a.volume = 0;
  a.addEventListener("error", () => {
    ambMissing[key] = true;
    if (ambNow.audio === a) { ambNow.audio = null; ambNow.key = ""; }
  });
  ambNow.audio = a;
  ambPlay(a);
}

/* 每次画面或钟变了就对一次。环境声看开关；字幕底乐、录音底噪、来电铃不看 */
function sfxSync() {
  if (!sfxReady || typeof S === "undefined") return;
  if (S.mode !== "web") webHeard = false;
  ambSet(bgOn() ? ambKey() : "");
  if (S.mode === "card" || S.mode === "wait" || S.mode === "end") padStart(S.mode === "end" ? 82.4 : 110);
  else padStop();
  hissOn(S.mode === "night" && S.night && S.night.recording);
  if (!(S.mode === "talk" && S.talk && S.talk.incoming)) ringStop();
}

/* 右上角：只改环境声那一条 HTMLAudio */
function sfxSetLevel(n) {
  bgLevel = n;
  try { localStorage.setItem(SFX_KEY, String(n)); } catch (e) { /* 无 */ }
  sfxButton();
  sfxSync();
}

function sfxButton() {
  const b = document.getElementById("sfx-toggle");
  if (!b) return;
  b.textContent = BG_LABEL[bgLevel];
  b.classList.toggle("off", !BG_VOL[bgLevel]);
  b.setAttribute("aria-label", BG_LABEL[bgLevel] + "，点按切换。只影响环境声");
}

document.addEventListener("DOMContentLoaded", () => {
  const b = document.getElementById("sfx-toggle");
  if (!b) return;
  sfxButton();
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    sfxSetLevel((bgLevel + 1) % BG_VOL.length);
    sfx("tap");
  });
});

/* 普通按钮的「嗒」：有专门声音的按钮在各自的地方响，这里跳过 */
const SFX_QUIET = "#sfx-toggle, .sfx-quiet, .phone-answer, .diary-btn, #playbar-notes, #playbar-map, #map-close, .map-walk";

document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("button");
  if (!b || b.disabled || b.matches(SFX_QUIET)) return;
  const mark = b.matches(".scene-act") && b.querySelector(".fork-mark");
  if (mark && mark.textContent === "去") return;
  if (b.matches(".talk-next, .caption-go")) sfx("next");
  else if (b.closest(".choices, .phone-choices, .sms-choices, .msg-choices, .face-choices")) sfx("pick");
  else sfx("tap");
}, true);

let keyLast = 0;
document.addEventListener("input", (e) => {
  if (!e.target.matches || !e.target.matches("textarea, input")) return;
  const now = performance.now();
  if (now - keyLast < 35) return;
  keyLast = now;
  sfx("key");
}, true);
