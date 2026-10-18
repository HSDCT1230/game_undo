// 手机竖屏逐关核对：390×844（iPhone 14 逻辑尺寸），
// 检查横向溢出、元素出屏、底栏与任务纸重叠、缺图、控制台报错，并逐关截图。
//
// 用法：
//   1) 先开带调试端口的 Chrome：chrome --remote-debugging-port=9222 --user-data-dir=%TEMP%\cdp
//   2) node tools/手机核对.cjs
//   3) 截图在 tools/_mob/lv01.png … lv16.png
const http = require("http");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "_mob");
const GAME = "file:///G%3A/code/active/lab/vibe_undo/%E6%B8%B8%E6%88%8F/index.html";
const get = (url, method = "GET") =>
  new Promise((res, rej) => {
    const req = http.request(url, { method }, (r) => {
      let d = "";
      r.on("data", (c) => (d += c));
      r.on("end", () => res(d));
    });
    req.on("error", rej);
    req.end();
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = `JSON.stringify((()=>{
  const doc=document.documentElement;
  const vw=window.innerWidth, vh=window.innerHeight;
  const out={vw,vh,scrollW:doc.scrollWidth,scrollH:doc.scrollHeight,over:[],miss:[]};
  document.querySelectorAll("img").forEach(im=>{ if(im.complete&&im.naturalWidth===0) out.miss.push(im.getAttribute("src")||""); });
  const miss=[...document.querySelectorAll(".img-slot.missing")].map(e=>e.textContent.trim().slice(0,40));
  out.slotMissing=miss;
  document.querySelectorAll("#stage *").forEach(e=>{
    const r=e.getBoundingClientRect();
    if(r.width<1||r.height<1) return;
    if(r.right>vw+2||r.left<-2) out.over.push([(e.className||e.tagName).toString().slice(0,28),Math.round(r.left),Math.round(r.right)]);
  });
  out.over=out.over.slice(0,8);
  const bar=document.querySelector("#playbar");
  const note=document.querySelector("#stage .task-note");
  if(bar&&note){const b=bar.getBoundingClientRect(),n=note.getBoundingClientRect();out.overlap=!(n.bottom<b.top+1||n.top>b.bottom-1);out.barTop=Math.round(b.top);out.noteBottom=Math.round(n.bottom);}
  const adv=document.querySelector("#playbar-advance");
  out.adv=adv?{hidden:adv.hidden,w:Math.round(adv.getBoundingClientRect().width)}:null;
  out.mode=(typeof S!=="undefined"?S:{}).mode;
  return out;
})())`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const t = JSON.parse(await get("http://127.0.0.1:9222/json/new?about:blank", "PUT"));
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0;
  const pend = {};
  const send = (m, p) =>
    new Promise((res) => {
      const i = ++id;
      pend[i] = res;
      ws.send(JSON.stringify({ id: i, method: m, params: p || {} }));
    });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend[m.id]) {
      pend[m.id](m.result);
      delete pend[m.id];
    }
  };
  await new Promise((r) => (ws.onopen = r));
  const errs = [];
  ws.addEventListener("message", (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === "Runtime.exceptionThrown") errs.push((m.params.exceptionDetails.text || "").slice(0, 120));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });

  const rows = [];
  for (let n = 1; n <= 16; n++) {
    await send("Page.navigate", { url: GAME + "?level=" + n });
    await sleep(3800);
    // 跳过开场卡，测真正的关卡界面
    await send("Runtime.evaluate", { expression: "(async()=>{try{S.card&&startLevelNow()}catch(e){};await new Promise(r=>setTimeout(r,2200))})()", awaitPromise: true });
    const r = await send("Runtime.evaluate", { expression: PROBE, returnByValue: true });
    const v = r && r.result ? JSON.parse(r.result.value) : {};
    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(OUT, "lv" + String(n).padStart(2, "0") + ".png"), Buffer.from(shot.data, "base64"));
    rows.push({ level: n, ...v });
    const bad = [];
    if (v.scrollW > v.vw + 2) bad.push("横向滚动 " + v.scrollW + ">" + v.vw);
    if (v.over && v.over.length) bad.push("出屏 " + v.over.length);
    if (v.slotMissing && v.slotMissing.length) bad.push("坏图 " + v.slotMissing.length);
    if (v.overlap) bad.push("底栏压任务纸");
    console.log(
      String(n).padStart(2) +
        " 关  " +
        (v.mode || "?").padEnd(8) +
        " 宽 " +
        v.scrollW +
        "/" +
        v.vw +
        (bad.length ? "  ⚠ " + bad.join("；") : "  ok")
    );
  }
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(rows, null, 1));
  console.log("\n页面报错：", errs.length ? errs.join(" | ") : "(无)");
  await get("http://127.0.0.1:9222/json/close/" + t.id).catch(() => {});
  process.exit(0);
})().catch((e) => {
  console.error("ERR", e);
  process.exit(1);
});
