/* ---------- 关内场景：这一关能去的地方，每处能看的东西 ---------- */

const HUBS = {};

function hubDef() {
  return S.hub && HUBS[S.hub.id];
}

function hubPlaces() {
  const d = hubDef();
  if (!d) return [];
  return d.places.filter((p) => !p.show || p.show());
}

function hubPlace() {
  const d = hubDef();
  if (!d) return null;
  return d.places.find((p) => p.id === S.hub.at) || d.places[0];
}

function enterHub(id, at) {
  stopNightClock();
  closeModal();
  S.talk = null;
  S.mode = "hub";
  S.hub = { id, at: at || HUBS[id].places[0].id };
  drawHub();
}

function backToHub() {
  closeModal();
  S.talk = null;
  S.mode = "hub";
  drawHub();
}

function hubGo(id) {
  if (!S.hub) return;
  if (S.hub.at !== id) sfx("steps");
  S.hub.at = id;
  if (mapLayer) mapLayer.hidden = true;
  drawHub();
}

function hubPlaceByMap(mapId) {
  return hubPlaces().find((p) => p.map === mapId);
}

function val(v) {
  return typeof v === "function" ? v() : v;
}

function hubSpots(p) {
  return val(p.spots).filter((s) => !s.show || s.show());
}

// 没写 seen 的卡：点开过就算看过
function spotSeen(s) {
  return s.seen ? !!s.seen() : hotClicked(s.title);
}

function spotLooksSeen(s) {
  return hotSeen(s.title, val(s.sub) || "", val(s.img), spotSeen(s));
}

// 地图变灰用：这一关去过，而且里面的卡都看过了
function hubPlaceDone(p) {
  if (!S.hub || !(S.hubBeen && S.hubBeen[S.level + ":" + S.hub.id + ":" + p.id])) return false;
  return hubSpots(p).every(spotLooksSeen);
}

function drawHub() {
  const d = hubDef();
  const p = hubPlace();
  if (!d || !p) return;
  clearStage();
  if (d.time) setTime(val(d.time));
  S.hubBeen = S.hubBeen || {};
  S.hubBeen[S.level + ":" + S.hub.id + ":" + p.id] = true;
  const spots = hubSpots(p);
  const box = el("div", { class: "room scene-fit hub-room" });
  box.append(
    imgSlot(val(p.img), "room-bg", p.name),
    el("p", { class: "room-note" }, [val(p.line) || ""]),
    el("div", { class: "room-dock" }, [
      el("div", { class: "room-map" }, spots.length
        ? spots.map((s) => hot(s.title, val(s.sub) || "", s.go, val(s.img), spotSeen(s), s.person ? "" : undefined))
        : [el("p", { class: "hub-empty" }, ["这里没有别的了。"])]),
    ])
  );
  const wrap = el("div", { class: "desk night-desk" });
  wrap.append(box);
  stage.append(wrap);
  stage.append(hubActions(d, p));
  renderPlaybar();
}

function hubActions(d, p) {
  const box = el("div", { class: "scene-actions fork hub-acts" });
  hubPlaces().filter((x) => x.id !== p.id).forEach((x) => {
    box.append(forkChoice("去", "scene-act", () => hubGo(x.id), x.name));
  });
  (d.actions ? d.actions() : []).filter((a) => !a.show || a.show()).forEach((a) => {
    box.append(forkChoice(a.mark || "·", "scene-act" + (a.done && a.done() ? " done" : a.primary ? " primary" : ""), a.go, val(a.label)));
  });
  const hint = levelHint();
  if (hint) box.append(el("p", { class: "hub-hint" }, [hint]));
  else if (levelAdvance()) box.append(el("p", { class: "hub-hint ready" }, ["可以往下了。"]));
  return box;
}

function hubTalk(beats, loc, kind, meta) {
  startTalk(beats.concat([{ goto: backToHub }]), loc, kind, meta);
}
