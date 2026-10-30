// 扫粤语：同一屏分别在「普＋粤」与「普通话」下渲染，逐节点比较。
// 两档文本应当一致（除了字号什么都不该变）；不一致＝普＋粤这一档没跟普通话走。
//
// 唯一的例外是**角色对白主行**：普＋粤下它就该是港繁粤语（下面另有一行普通话小字）。
// 脚本按容器判断，标 [对白] 的不算问题。
//
// 用法（先起静态服务器，再开一个带调试端口的 Chrome）：
//   node tools/扫粤语.mjs
//   CDP=http://127.0.0.1:9334 node tools/扫粤语.mjs
//
// 判据见 策划/文字规范.md 1.4：她「听到的」用粤语，她「看到／想到的」用普通话。

const CDP = process.env.CDP || "http://127.0.0.1:9222";
const BASE = process.env.BASE || "http://127.0.0.1:8848/" + encodeURI("游戏/index.html");

const screens = [
  ["hub", `S.mode = "hub"; draw();`],
  ["网页·首页", `S.mode = "web"; S.tab = "house"; goWeb("home");`],
  ["网页·盘源", `S.mode = "web"; goWeb("detail", { listing: "ssp" });`],
  ["网页·讨论区", `S.mode = "web"; goWeb("forum");`],
  ["网页·新闻", `S.mode = "web"; goWeb("hknews");`],
  ["官网·VHU", `S.mode = "web"; goWeb("vhusite");`],
  ["日记簿", `openNotes();`],
  ["地图", `openMap();`],
  // 收件箱＝原倾偈窗口：留言与实时那一段排在一起，两档文本要一致
  ["网页·收件箱", `setTime("2014年8月8日 周五 21:06"); startChat("0808");`],
  ["网页·收件箱·搜索", `S.mailQuery = "水"; draw();`],
];

const SCAN = `(() => {
  const HINT = /[佢哋咗唔嘅喺咁嗰啲冇咩嘢嚟睇搵揾畀噃囉嘞啩吖嗱嚿]|倾偈|倾计|屋企|细路|隔篱|而家|返工/;
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const n = w.currentNode;
    const raw = n.nodeValue.trim();
    if (raw.length < 2) continue;
    if (n.parentElement.closest("script, style, .talk-zh")) continue;
    const host = n.parentElement.closest(".talk-body, .face-body, .phone-script, .msg-body");
    const speech = !!(host && host.querySelector(".talk-name")) || !!n.parentElement.closest(".talk.face .face-inner");
    out.push({ text: raw.slice(0, 90), cls: String(n.parentElement.className || n.parentElement.tagName).slice(0, 40), speech, yue: HINT.test(raw) });
  }
  return out;
})()`;

const t = await (await fetch(CDP + "/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 1;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
});
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}) => {
  const myId = id++;
  ws.send(JSON.stringify({ id: myId, method, params }));
  return new Promise((res, rej) => {
    pending.set(myId, { res, rej });
    setTimeout(() => pending.has(myId) && (pending.delete(myId), rej(new Error("timeout " + method))), 20000);
  });
};
const js = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result ? r.result.value : undefined;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.navigate", { url: BASE });
await wait(2200);

const setLang = async (m) => {
  await js(`langMode = ${JSON.stringify(m)}; fillShellChrome(); optButtons();`);
  await wait(250);
};

let bad = 0;
let staleAll = 0;
for (const [name, act] of screens) {
  const shots = {};
  for (const m of ["both", "zh"]) {
    await setLang(m);
    const ok = await js(`(() => { try { ${act} return true; } catch (e) { return String(e); } })()`);
    await wait(1000);
    shots[m] = { ok, rows: (await js(SCAN)) || [] };
  }
  const a = shots.both.rows;
  const b = shots.zh.rows;
  const leaks = [];
  const stale = []; // 两档一致、但都还带着粤语词：这是 zhOf() 表里没有的条目，两档一起漏
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i].text === b[i].text) {
      if (a[i].yue && !a[i].speech) stale.push({ text: a[i].text, cls: a[i].cls });
      continue;
    }
    if (a[i].speech) continue; // 对白主行：就该是粤语
    leaks.push({ both: a[i].text, zh: b[i].text, cls: a[i].cls });
  }
  console.log("\n== " + (name) + " ==", "节点 " + a.length + "／" + b.length, "不同 " + leaks.length, "两档都像粤语 " + stale.length);
  leaks.forEach((x) => {
    bad++;
    console.log("  · ." + x.cls);
    console.log("      普＋粤：" + x.both);
    console.log("      普通话：" + x.zh);
  });
  stale.forEach((x) => {
    staleAll++;
    console.log("  ~ 两档都带粤语词 ." + x.cls + " ｜ " + x.text);
  });
}
console.log("\n合计 " + bad + " 处两档不一致（对白主行已排除）；" + staleAll + " 处两档都带粤语词（多半是对照表缺条目）");
ws.close();
process.exit(0);
