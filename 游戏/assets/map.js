const M = MAP_PIC;

const RONG_PLAN = [
  { id: "rong-street", name: "荣汇街", line: "铺侧窄门入楼梯。", x: 24, y: 6, w: 236, h: 20, img: M + "荣汇街-街道" },
  { id: "rong-front", name: "前座", line: "周先生自住。临街。", x: 24, y: 34, w: 236, h: 74, img: M + "荣汇街-前座" },
  { id: "rong-landing", name: "平台", line: "同层两扇门。", x: 24, y: 118, w: 148, h: 56, img: M + "荣汇街-平台" },
  { id: "rong-stair", name: "楼梯", line: "公共楼梯。无电梯。", x: 172, y: 118, w: 88, h: 56, img: M + "荣汇街-楼梯" },
  { id: "rong-door", name: "后座门", line: "双锁。对着平台。", x: 136, y: 182, w: 88, h: 24, img: M + "荣汇街-后座门" },
  { id: "rong-kitchen", name: "厨房", line: "后座西侧。", x: 24, y: 214, w: 112, h: 88, img: M + "荣汇街-厨房" },
  { id: "rong-corridor", name: "走廊", line: "从大门望向天井那扇窗。", x: 136, y: 214, w: 60, h: 164, lx: 142, ly: 348, points: "136,214 260,214 260,302 196,302 196,378 136,378", img: M + "荣汇街-走廊" },
  { id: "rong-bath", name: "厕所", line: "后座。", x: 24, y: 302, w: 112, h: 76, img: M + "荣汇街-厕所" },
  { id: "rong-store", name: "储物室", line: "锁着。钥匙在周生手上。", x: 196, y: 302, w: 64, h: 76, img: M + "荣汇街-储物室" },
  { id: "rong-bed", name: "睡房", line: "铁窗朝天井。", x: 24, y: 378, w: 112, h: 108, img: M + "荣汇街-睡房" },
  { id: "rong-hall", name: "厅", line: "后座。窗朝天井。", x: 136, y: 378, w: 124, h: 108, img: M + "荣汇街-厅", imgNight: M + "荣汇街-厅-夜里" },
  { id: "rong-roof", name: "天台", line: "晾衫。晚上风大。后楼梯上去。", x: 276, y: 118, w: 100, h: 64, img: M + "荣汇街-天台" },
  { id: "rong-backstair", name: "后楼梯", line: "贴后巷，上天台。", x: 276, y: 182, w: 48, h: 304, img: M + "荣汇街-后楼梯" },
];

const CLINIC_PLAN = [
  { id: "clinic-wait", name: "候诊", line: "湾仔澄心。", x: 28, y: 48, w: 160, h: 130, img: M + "澄心-候诊" },
  { id: "clinic-room", name: "诊室", line: "罗启明。", x: 206, y: 48, w: 180, h: 130, img: M + "澄心-诊室" },
];

function svgEl(tag, attrs) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

function svgText(x, y, text, cls) {
  const n = svgEl("text", { x, y, class: cls || "map-label" });
  n.textContent = text;
  return n;
}

function markPlace(id) {
  S.place = id;
  if (!id || id === "nowhere") return;
  S.known = S.known || {};
  S.known[id] = true;
  if (id.startsWith("rong")) S.known.rongIn = true;
  if (id === "rong-roof") S.known.roof = true;
  if (id.startsWith("clinic")) S.known.clinicIn = true;
  if (id === "mei") S.known.mei = true;
}

function syncPlace() {
  S.known = S.known || {};
  if (S.mode === "talk" && S.talk) {
    const k = S.talk.kind;
    if (k === "phone" || k === "sms") return;
    const loc = S.talk.loc || "";
    if (loc.includes("天台")) return markPlace("rong-roof");
    if (loc.includes("美娟")) return markPlace("mei");
    if (loc.includes("候诊")) return markPlace("clinic-wait");
    if (loc.includes("澄心")) return markPlace("clinic-room");
    if (loc.includes("前座")) return markPlace("rong-front");
    if (loc.includes("门口")) return markPlace("rong-door");
    if (loc.includes("楼梯")) return markPlace("rong-stair");
    if (loc.includes("讨论区")) return markPlace(livingIn() ? "rong-hall" : "nowhere");
    if (loc.includes("荣汇") || loc.includes("后座")) {
      const here = S.talk.herePlace || "";
      return markPlace(here.startsWith("rong-") && here !== "rong-listing" ? here : "rong-hall");
    }
    return;
  }
  if (S.mode === "chat") return;
  if (S.mode === "hub") {
    const p = hubPlace();
    return p && p.map ? markPlace(p.map) : undefined;
  }
  if (S.paused && S.mode === "web") return;
  if (S.mode === "clinic") return markPlace("clinic-room");
  if (S.mode === "night" || S.mode === "movein" || S.mode === "cal" || S.mode === "search") return markPlace("rong-hall");
  if (S.mode === "end") return markPlace("rong-roof");
  if (S.mode === "wait") return markPlace(livingIn() ? "rong-hall" : "nowhere");
  if (S.mode === "web") return markPlace(livingIn() ? "rong-hall" : "nowhere");
}

function placeLine(id) {
  const lines = {
    nowhere: "还没有住的地方",
    mei: "表姐家",
    "rong-listing": "深水埗，荣汇街 28 号",
    "rong-street": "深水埗，荣汇街",
    "rong-stair": "荣汇街 28 号，楼梯",
    "rong-landing": "荣汇街 28 号，4 楼平台",
    "rong-front": "荣汇街 28 号，前座门口",
    "rong-door": "荣汇街 28 号，后座门口",
    "rong-hall": "荣汇街 28 号，4 楼后座，厅",
    "rong-bed": "荣汇街 28 号，睡房",
    "rong-kitchen": "荣汇街 28 号，厨房",
    "rong-bath": "荣汇街 28 号，厕所",
    "rong-store": "荣汇街 28 号，储物室门口",
    "rong-corridor": "荣汇街 28 号，走廊",
    "rong-backstair": "荣汇街 28 号，后楼梯",
    "rong-roof": "荣汇街 28 号，天台",
    "clinic-addr": "湾仔，澄心诊所",
    "clinic-wait": "湾仔，澄心诊所，候诊",
    "clinic-room": "湾仔，澄心诊所，诊室",
  };
  return lines[id] || "还没有住的地方";
}

function mapPlaces() {
  const tabs = [];
  if (S.known.rong || S.known.rongIn) tabs.push("rong");
  if (flag("clinicAddr") || S.known.clinicIn) tabs.push("clinic");
  return tabs;
}

function openMap() {
  closeNotes();
  syncPlace();
  const tabs = mapPlaces();
  const atClinic = String(S.place).startsWith("clinic");
  const atRong = String(S.place).startsWith("rong");
  if (atClinic && tabs.includes("clinic")) S.mapView = "clinic";
  else if (atRong && S.known.rongIn) S.mapView = "rong";
  else if (tabs.includes("rong")) S.mapView = "rong";
  else if (tabs.includes("clinic")) S.mapView = "clinic";
  else S.mapView = "none";
  if (S.mapView === "none" && S.place !== "mei") {
    mapLayer.hidden = true;
    showPrompt("暂无住所");
    return;
  }
  if (S.mapView === "rong" && !S.known.rongIn) S.mapSel = "rong-listing";
  else if (S.mapView === "clinic" && !S.known.clinicIn) S.mapSel = "clinic-addr";
  else if (S.mapView === "none") S.mapSel = S.place === "mei" ? "mei" : "nowhere";
  else if (S.mapView === "rong" && String(S.place).startsWith("rong")) S.mapSel = S.place;
  else if (S.mapView === "clinic" && String(S.place).startsWith("clinic")) S.mapSel = S.place;
  else if (S.place === "mei") S.mapSel = "mei";
  else if (S.mapView === "rong") S.mapSel = "rong-hall";
  else S.mapSel = "clinic-room";
  if (mapLayer.hidden) sfx("unfold");
  mapLayer.hidden = false;
  renderMap();
}

function closeMap() {
  if (!mapLayer.hidden) sfx("paper");
  mapLayer.hidden = true;
}

function selectRoom(id) {
  S.mapSel = id;
  renderMap();
}

function detailSpec(id) {
  if (id === "mei") return { name: "表姐家", line: "陈美娟。午饭。沙发在。", img: M + "表姐家" };
  if (id === "rong-listing") return { name: "荣汇街 28 号", line: "深水埗，4 楼后座。放盘上的走廊。", img: M + "荣汇街-放盘照" };
  if (id === "clinic-addr") return { name: "澄心诊所", line: "湾仔。罗启明。" };
  if (!id || id === "nowhere") return { name: "章慧琪", line: "还没有住的地方。" };
  const r = RONG_PLAN.concat(CLINIC_PLAN).find((x) => x.id === id);
  if (!r) return { name: "章慧琪", line: placeLine(S.place) };
  let img = r.img || "";
  if (r.need && !S.known[r.need]) img = "";
  if (id.startsWith("rong") && !S.known.rongIn) img = "";
  if (id.startsWith("clinic") && !S.known.clinicIn) img = "";
  if (id === "rong-hall" && S.mode === "night" && r.imgNight) img = r.imgNight;
  return { name: r.name || "走廊", line: r.line, img };
}

function mapPhoto(src, alt) {
  const img = document.createElement("img");
  img.className = "map-photo";
  img.alt = alt || "";
  img.draggable = false;
  img.src = picSrc(src);
  img.addEventListener("error", () => img.remove());
  return img;
}

function renderDetail() {
  const box = $("#map-detail");
  box.replaceChildren();
  const spec = detailSpec(S.mapSel);
  const here = S.mapSel === S.place || (S.mapSel === "rong-listing" && String(S.place).startsWith("rong") && !S.known.rongIn);
  box.append(
    el("h3", {}, [spec.name]),
    el("p", { class: "map-line" }, [spec.line || placeLine(S.mapSel)]),
    mapRoomDone(S.mapSel) ? el("p", { class: "map-line fine map-done" }, ["这里都看过了。"]) : "",
    here ? el("p", { class: "map-now" }, ["人在这里"]) : walkButton(S.mapSel),
    spec.img ? mapPhoto(spec.img, spec.name) : ""
  );
}

function mapRoomDone(mapId) {
  if (S.mode !== "hub") return false;
  const p = hubPlaceByMap(mapId);
  return !!p && hubPlaceDone(p);
}

function walkButton(mapId) {
  if (S.mode !== "hub") return "";
  const p = hubPlaceByMap(mapId);
  if (!p) return el("p", { class: "map-line fine" }, ["现在不用去这里。"]);
  return el("button", {
    type: "button",
    class: "btn map-walk",
    onclick: () => hubGo(p.id),
  }, ["走过去"]);
}

function renderTabs() {
  const bar = $("#map-tabs");
  const span = $("#map-span");
  bar.replaceChildren();
  const tabs = mapPlaces().map((id) => ({ id, label: id === "rong" ? "荣汇街" : "澄心" }));
  bar.hidden = tabs.length < 2;
  if (span) {
    span.hidden = tabs.length < 2;
    span.textContent = tabs.length < 2 ? "" : "荣汇街在深水埗。诊所在湾仔，要过海。";
  }
  if (tabs.length < 2) return;
  tabs.forEach((t) => {
    bar.append(el("button", {
      type: "button",
      class: S.mapView === t.id ? "on" : "",
      onclick: () => {
        S.mapView = t.id;
        if (t.id === "rong") S.mapSel = S.known.rongIn ? (String(S.place).startsWith("rong") ? S.place : "rong-hall") : "rong-listing";
        else S.mapSel = S.known.clinicIn ? (String(S.place).startsWith("clinic") ? S.place : "clinic-room") : "clinic-addr";
        renderMap();
      },
    }, [t.label]));
  });
}

function renderClinicSlots(host) {
  const wrap = el("div", { class: "clinic-slots" });
  CLINIC_PLAN.forEach((r) => {
    const here = S.place === r.id;
    wrap.append(el("figure", { class: "clinic-slot" + (here ? " here" : "") }, [
      mapPhoto(r.img, r.name),
      el("figcaption", {}, [here ? r.name + "（人在这里）" : r.name]),
      here ? "" : walkButton(r.id),
    ]));
  });
  host.append(wrap);
}

function renderPlan(host, rooms, viewBox) {
  const svg = svgEl("svg", { viewBox: viewBox, class: "map-svg" });
  const seen = {};
  rooms.forEach((r) => {
    const g = svgEl("g", {
      class: "map-room-g" + (S.mapSel === r.id ? " sel" : "") + (S.place === r.id && r.id !== "rong-front" ? " here" : "") + (mapRoomDone(r.id) ? " done" : ""),
    });
    g.append(r.points
      ? svgEl("polygon", { points: r.points, class: "map-room" })
      : svgEl("rect", { x: r.x, y: r.y, width: r.w, height: r.h, class: "map-room" }));
    if (r.name && !seen[r.id]) g.append(svgText(r.lx != null ? r.lx : r.x + 6, r.ly != null ? r.ly : r.y + 15, r.name));
    seen[r.id] = true;
    g.addEventListener("click", () => selectRoom(r.id));
    svg.append(g);
  });
  let dot = null;
  if (S.place === "rong-front") dot = [78, 112];
  else {
    const r = rooms.find((x) => x.id === S.place && !x.quiet);
    if (r) dot = [r.x + r.w / 2, r.y + r.h / 2];
  }
  if (dot) {
    svg.append(svgEl("circle", { cx: dot[0], cy: dot[1], r: 6, class: "map-you" }));
    svg.append(svgText(dot[0] + 9, dot[1] + 4, "慧琪", "map-you-name"));
  }
  if (viewBox.indexOf("400 520") !== -1) svg.append(svgText(24, 508, "后巷"));
  host.append(svg);
}

function renderMap() {
  const here = $("#map-here");
  if (here) here.textContent = "人在　" + placeLine(S.place);
  renderTabs();
  const host = $("#map-draw");
  const sheet = $("#map-sheet");
  host.replaceChildren();
  const clinicDirect = S.mapView === "clinic";
  if (sheet) sheet.classList.toggle("map-direct", clinicDirect);
  if (S.mapView === "rong" && S.known.rongIn) renderPlan(host, RONG_PLAN, "0 0 400 520");
  else if (S.mapView === "rong") host.append(mapPhoto(M + "荣汇街-放盘照", "荣汇街"));
  else if (clinicDirect && S.known.clinicIn) renderClinicSlots(host);
  else if (clinicDirect) host.append(el("p", { class: "map-empty" }, ["湾仔澄心诊所。罗启明。"]));
  else host.append(el("p", { class: "map-empty" }, [S.place === "mei" ? "表姐家。" : "还没有住的地方。"]));
  if (clinicDirect) $("#map-detail").replaceChildren();
  else renderDetail();
}
