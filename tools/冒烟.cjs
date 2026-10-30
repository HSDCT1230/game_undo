// 全段冒烟：把 16 关的关头与每个 ?seg= 分段都进一次，各点十下，
// 检查白屏、缺图、坏图、undefined 文案、控制台报错。
//
// 用法：
//   1) 先开一个带调试端口的 Chrome：
//      chrome --remote-debugging-port=9222 --user-data-dir=%TEMP%\cdp
//   2) node tools/冒烟.cjs
//   3) 结果：终端表格 + tools/_smoke/report.json
//
// 分段表取自游戏里的 SEGS（levels.js），加了新分段不用改这里。
const http = require("http");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "_smoke");
const GAME = "file:///G%3A/code/active/lab/vibe_undo/%E6%B8%B8%E6%88%8F/index.html";
const get = (u, m = "GET") =>
  new Promise((res, rej) => {
    const r = http.request(u, { method: m }, (s) => {
      let d = "";
      s.on("data", (c) => (d += c));
      s.on("end", () => res(d));
    });
    r.on("error", rej);
    r.end();
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CLICK = `(()=>{
  const vis=e=>{if(!e||e.disabled||e.hidden)return false;const r=e.getBoundingClientRect();
    if(r.width<4||r.height<4)return false;if(e.closest("[data-leaving]"))return false;
    const c=getComputedStyle(e);return c.visibility!=="hidden"&&c.display!=="none"&&+c.opacity>0.05;};
  const bar=document.querySelector("#playbar-advance");
  if(bar&&!bar.hidden&&vis(bar)&&typeof bar.onclick==="function"){bar.click();return "adv";}
  for(const s of [".caption-go",".face-cont",".act-btn",".hot",".choice button",".btn",".web-hot"]){
    for(const e of document.querySelectorAll("#stage "+s)){ if(vis(e)){e.click();return s;} }
  }
  return "none";
})()`;

const PROBE = `JSON.stringify((()=>{
  const st=document.querySelector("#stage");
  const out={mode:(typeof S!=="undefined"?S:{}).mode,level:(typeof S!=="undefined"?S:{}).level,
    empty:!st||st.children.length===0, miss:[], broken:[], undef:0, err:null};
  /* img-slot 天生带 missing 类，图解码完才摘掉；冒烟是刚画完就快照的，
     冷缓存那一下会拍到「还在下载」的槽，误报成缺图。
     所以只算已经下载结束的：complete 且 naturalWidth 为 0 才是真缺。
     out.broken 抓的是 img 层面，两边对得上。 */
  out.miss=[...document.querySelectorAll(".img-slot.missing")].filter(e=>{
    const im=e.querySelector("img"); return !im||im.complete;
  }).map(e=>e.textContent.trim().slice(0,50));
  document.querySelectorAll("img").forEach(im=>{if(im.complete&&im.naturalWidth===0)out.broken.push((im.getAttribute("src")||"").slice(-40));});
  out.undef=(st?st.innerText:"").split("undefined").length-1;
  return out;
})())`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const CDP = process.env.CDP || "http://127.0.0.1:9222";
  const t = JSON.parse(await get(CDP + "/json/new?about:blank", "PUT"));
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
    if (m.method === "Runtime.exceptionThrown") errs.push((m.params.exceptionDetails.text || "").slice(0, 140));
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error")
      errs.push(m.params.args.map((a) => a.value || (a.description || "").split("\n")[0]).join(" ").slice(0, 140));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  // 先取分段表
  await send("Page.navigate", { url: GAME });
  await sleep(4500);
  const segList = JSON.parse(
    (await send("Runtime.evaluate", {
      expression:
        "JSON.stringify((()=>{const out=[];for(let n=1;n<=LEVELS.length-1;n++){out.push([n,'']);(SEGS[n]||[]).forEach(s=>out.push([n,s.key]));}return out})())",
      returnByValue: true,
    })).result.value
  );
  console.log("分段总数", segList.length);

  const rows = [];
  for (const [lv, key] of segList) {
    errs.length = 0;
    const url = GAME + "?level=" + lv + (key ? "&seg=" + key : "");
    await send("Page.navigate", { url });
    await sleep(3800);
    for (let i = 0; i < 10; i++) {
      await send("Runtime.evaluate", { expression: CLICK });
      await sleep(160);
    }
    const v = JSON.parse((await send("Runtime.evaluate", { expression: PROBE, returnByValue: true })).result.value);
    const row = { lv, key, ...v, errs: [...new Set(errs)] };
    rows.push(row);
    const bad = [];
    if (row.empty) bad.push("白屏");
    if (row.miss.length) bad.push("缺图 " + row.miss.length);
    if (row.broken.length) bad.push("坏图 " + row.broken.length);
    if (row.undef) bad.push("undefined×" + row.undef);
    if (row.errs.length) bad.push("报错 " + row.errs.length);
    console.log((String(lv) + (key ? key : "-")).padEnd(4) + " " + String(row.mode).padEnd(8) + (bad.length ? "⚠ " + bad.join("；") : "ok"));
  }
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(rows, null, 1));

  const bad = rows.filter((r) => r.empty || r.miss.length || r.broken.length || r.undef || r.errs.length);
  console.log("\n=== 有问题的分段 " + bad.length + " ===");
  bad.forEach((r) =>
    console.log(
      "第" + r.lv + "关" + (r.key ? " 段" + r.key : " 关头") + " mode=" + r.mode + " " + JSON.stringify({ miss: r.miss, broken: r.broken, undef: r.undef, errs: r.errs })
    )
  );
  await get(CDP + "/json/close/" + t.id).catch(() => {});
  process.exit(0);
})().catch((e) => {
  console.error("ERR", e);
  process.exit(1);
});
