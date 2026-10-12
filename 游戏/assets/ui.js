let CLUE_IMG = "";

function withClue(img, fn) {
  CLUE_IMG = img || "";
  try {
    return fn();
  } finally {
    CLUE_IMG = "";
  }
}

function clueSlot(id, alt) {
  return id ? imgSlot(id, "clue-img", alt) : "";
}

const ZOOMABLE = ".img-slot.clue-img, .img-slot.photo-lg, .img-slot.diary-img, .img-slot.talk-clue, img.map-photo";

const ZOOM_HINT_KEY = "undo-zoom-hint";

function zoomPic(src, cap) {
  const old = document.getElementById("pic-zoom");
  if (old) old.remove();
  const onKey = (e) => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    close();
  };
  const close = () => {
    box.remove();
    document.removeEventListener("keydown", onKey, true);
  };
  const name = (cap && cap.name) || "";
  const time = (cap && cap.time) || "";
  let hint = false;
  try {
    hint = !localStorage.getItem(ZOOM_HINT_KEY);
    if (hint) localStorage.setItem(ZOOM_HINT_KEY, "1");
  } catch (_) { /* 无痕模式存不了，就不提示 */ }
  const box = el("div", {
    class: "pic-zoom",
    id: "pic-zoom",
    role: "dialog",
    "aria-label": name || "原图",
    onclick: (e) => {
      e.stopPropagation();
      close();
    },
  }, [
    el("img", { src, alt: name, draggable: "false" }),
    name || time ? el("div", { class: "pic-zoom-cap" }, [
      name ? el("p", { class: "pic-zoom-name" }, [name]) : "",
      time ? el("p", { class: "pic-zoom-time" }, [time]) : "",
    ]) : "",
    hint ? el("p", { class: "pic-zoom-hint" }, ["点任意处合上"]) : "",
  ]);
  document.addEventListener("keydown", onKey, true);
  document.body.append(box);
  sfx("photo");
}

document.addEventListener("click", (e) => {
  const hit = e.target.closest && e.target.closest(ZOOMABLE);
  if (!hit || hit.classList.contains("missing")) return;
  const img = hit.tagName === "IMG" ? hit : hit.querySelector("img");
  if (!img || !img.naturalWidth) return;
  e.stopPropagation();
  e.preventDefault();
  const id = hit.getAttribute("data-img");
  zoomPic(img.currentSrc || img.src, picCap(id) || { name: img.alt === id ? "" : img.alt });
}, true);

function closeModal() {
  const m = $("#game-modal", stage);
  if (m) m.remove();
  S.modal = null;
}

function afterModalClose(onClose) {
  closeModal();
  if (onClose) onClose();
  else draw();
}

function itemFromModalTitle(title, body, time) {
  const parts = String(title || "").split("：");
  return {
    kind: parts.length > 1 ? parts[0] : "其他",
    title: parts.length > 1 ? parts.slice(1).join("：") : title,
    body: body || "",
    time: time || "",
  };
}

function openNotes() {
  if (mapLayer) mapLayer.hidden = true;
  S.diaryTab = "";
  S.diaryPage = 0;
  diaryTrail = [];
  diaryNow = null;
  showDiaryIndex();
}

/* 日记簿里一层层打开：记住上一层，「返回」一层层退回，退到目录停在原来那一页 */
let diaryTrail = [];
let diaryNow = null;
let diaryNested = false;

function diaryShow(fn) {
  diaryNow = fn;
  diaryNested = true;
  try { fn(); } finally { diaryNested = false; }
}

// 从目录打开
function diaryOpen(fn) {
  diaryTrail = [];
  diaryShow(fn);
}

// 从日记簿里的一页再打开一页
function diaryPush(fn) {
  if (diaryNow) diaryTrail.push(diaryNow);
  diaryShow(fn);
}

function diaryBack() {
  S.diaryLeaf = null;
  closeModal();
  const prev = diaryTrail.pop();
  if (prev) {
    diaryShow(prev);
    return;
  }
  diaryNow = null;
  showDiaryIndex();
}

const diaryBackLabel = () => (diaryTrail.length ? "‹ 返回" : "‹ 回到目录");

function diarySubHead(label, n) {
  return el("h4", { class: "diary-sub" }, n ? [label, el("span", { class: "diary-count" }, [String(n)])] : [label]);
}

// side：条目名前面的小字（种类或日子）；img：有图就带缩图
function diaryEntry(label, onclick, unread, side, img) {
  const thumb = img && !PIC_MISSING[img] ? el("img", { class: "evidence-thumb", src: picSrc(img), alt: "", draggable: "false", onerror: (e) => e.target.remove() }) : "";
  return el("button", {
    type: "button",
    class: "evidence-open" + (unread ? " unread" : ""),
    "aria-label": (side ? side + "　" : "") + label + (unread ? "（未打开）" : ""),
    onclick,
  }, [
    thumb,
    side ? el("span", { class: "evidence-side" }, [side]) : "",
    el("span", { class: "evidence-name" }, [label]),
    el("span", { class: "evidence-go", "aria-hidden": "true" }, ["›"]),
  ]);
}

function evidenceEntry(item, side) {
  const unread = !(S.evOpened && S.evOpened[item.id]);
  return diaryEntry(item.title, () => diaryOpen(() => showClueModal(item, { canFile: false, fromIndex: true })), unread, side === undefined ? item.kind : side, item.img);
}

function dayOf(t) {
  const m = /(\d+)月(\d+)日/.exec(t || "");
  return m ? { key: Number(m[1]) * 100 + Number(m[2]), label: m[1] + "月" + m[2] + "日" } : { key: 0, label: "更早记下的" };
}

// 「收集的」：证物和笔记按日子排；纸归「我写的」。这一关以前的日子收成一行，点开才列
function timelineBlocks() {
  const days = new Map();
  const at = (t) => {
    const d = dayOf(t);
    if (!days.has(d.key)) days.set(d.key, { label: d.label, rows: [] });
    return days.get(d.key).rows;
  };
  (S.evidence || []).filter((e) => e.kind !== "纸").forEach((e) => at(e.time).push(evidenceEntry(e)));
  (S.notes || []).filter(noteShown).forEach((n) => at(noteTime(n)).push(el("p", { class: "diary-note diary-line" }, [n.text])));
  const keys = [...days.keys()].sort((a, b) => a - b);
  const L = typeof levelNow === "function" ? levelNow() : null;
  const start = L && L.clock ? dayOf(L.clock).key : 0;
  const old = start ? keys.filter((k) => k < start) : [];
  const out = [];
  if (old.length) {
    const n = old.reduce((s, k) => s + days.get(k).rows.length, 0);
    const span = days.get(old[0]).label + (old.length > 1 ? "～" + days.get(old[old.length - 1]).label : "");
    out.push(el("button", {
      type: "button",
      class: "diary-fold" + (S.diaryOld ? " unfolded" : ""),
      "aria-expanded": S.diaryOld ? "true" : "false",
      onclick: () => {
        S.diaryOld = !S.diaryOld;
        S.diaryPage = 0;
        sfx("paper");
        renderDiaryIndex();
      },
    }, [
      el("span", { class: "diary-fold-name" }, ["以前的日子　" + span]),
      el("span", { class: "diary-count" }, [String(n)]),
      el("span", { class: "diary-fold-go", "aria-hidden": "true" }, [S.diaryOld ? "收起 ▴" : "展开 ▾"]),
    ]));
  }
  keys.forEach((k) => {
    if (old.includes(k) && !S.diaryOld) return;
    const d = days.get(k);
    out.push(diarySubHead(d.label), ...d.rows);
  });
  return out;
}

function thingBlocks() {
  const items = S.evidence || [];
  const out = [];
  [...THINGS, ""].forEach((t) => {
    const group = items.filter((e) => (t ? itemAbout(e.id).includes(t) : !itemAbout(e.id).length));
    if (!group.length) return;
    out.push(diarySubHead(t || "其他", group.length), ...group.map((e) => evidenceEntry(e)));
  });
  return out;
}

function diaryByToggle() {
  const by = S.diaryBy === "thing" ? "thing" : "date";
  const opt = (k, label) => el("button", {
    type: "button",
    class: "diary-by-opt" + (by === k ? " on" : ""),
    "aria-pressed": by === k ? "true" : "false",
    onclick: () => {
      if (by === k) return;
      S.diaryBy = k;
      S.diaryPage = 0;
      sfx("paper");
      renderDiaryIndex();
    },
  }, [label]);
  return el("div", { class: "diary-by" }, [opt("date", "按日子"), opt("thing", "按东西")]);
}

function writtenBlocks() {
  const out = [];
  const papers = typeof paperPages === "function" ? paperPages() : [];
  if (papers.length) {
    out.push(diarySubHead("我列的", papers.length));
    papers.forEach(([label, fn]) => out.push(diaryEntry(label, () => diaryOpen(fn), false)));
  }
  const sheets = (S.evidence || []).filter((e) => e.kind === "纸");
  if (sheets.length) {
    out.push(diarySubHead("带给他的纸", sheets.length));
    sheets.forEach((e) => out.push(evidenceEntry(e, dayOf(e.time).key ? dayOf(e.time).label : "")));
  }
  const logs = typeof clinicLogs === "function" ? clinicLogs() : [];
  if (logs.length) {
    out.push(diarySubHead("在诊所", logs.length));
    logs.forEach((r) => out.push(diaryEntry(r.label, () => diaryOpen(() => showClueModal(r.open(), { canFile: false, fromIndex: true })), false, dayOf(r.day).label)));
  }
  return out;
}

function diarySections() {
  const secs = [];
  const todo = typeof levelBlocks === "function" ? levelBlocks() : [];
  if (todo.length) secs.push({ tab: "要做的", title: "要做的", blocks: todo });

  const empty = (t) => [el("p", { class: "diary-note diary-empty" }, [t])];
  const got = S.diaryBy === "thing" ? thingBlocks() : timelineBlocks();
  secs.push({ tab: "收集的", title: "收集的东西", blocks: got.length ? [diaryByToggle(), ...got] : empty("还没有。") });

  const mine = writtenBlocks();
  secs.push({ tab: "我写的", title: "我写的", blocks: mine.length ? mine : empty("还没有写过。") });
  return secs;
}

let diaryTabsNow = [];

function renderDiaryTabs(secs, cur) {
  const meta = notesIndex && notesIndex.querySelector(".diary-meta");
  if (!meta) return;
  meta.replaceChildren(el("nav", { class: "diary-tabs", "aria-label": "日记簿分类" }, secs.map((s, i) => el("button", {
    type: "button",
    class: "diary-tab" + (i === cur ? " on" : ""),
    "aria-current": i === cur ? "page" : null,
    onclick: () => {
      if (i === cur) return;
      S.diaryTab = s.tab;
      S.diaryPage = 0;
      sfx("paper");
      renderDiaryIndex();
    },
  }, [s.tab]))));
}

// 每个签各自从第 1 页数起；一页放不下就续到下一页，不滚动
function renderDiaryIndex() {
  const flow = document.getElementById("diary-flow");
  if (!flow || !notesLayer || notesLayer.hidden || !notesIndex || notesIndex.hidden) return;
  renderDiaryNav(2, true, true);
  flow.replaceChildren();
  const secs = diarySections();
  diaryTabsNow = secs.map((s) => s.tab);
  let cur = diaryTabsNow.indexOf(S.diaryTab);
  if (cur < 0) cur = 0;
  S.diaryTab = diaryTabsNow[cur];
  const s = secs[cur];
  const pages = [];
  const newPage = (cont) => {
    const p = el("div", { class: "diary-folio-page" }, [el("h3", { class: "diary-sec" }, [cont ? s.title + "（续）" : s.title])]);
    flow.append(p);
    pages.push(p);
    return p;
  };
  let page = newPage(false);
  let sub = null;
  s.blocks.forEach((b) => {
    page.append(b);
    const isSub = b.classList.contains("diary-sub");
    if (page.scrollHeight > page.clientHeight + 1 && page.children.length > 2) {
      const carry = [b];
      const prev = b.previousElementSibling;
      if (!isSub && prev && prev.classList.contains("diary-sub") && page.children.length > 3) carry.unshift(prev);
      else if (!isSub && sub) carry.unshift(sub.cloneNode(true));
      page = newPage(true);
      page.append(...carry);
    }
    if (isSub) sub = b;
  });
  const n = pages.length;
  S.diaryPage = Math.max(0, Math.min(S.diaryPage || 0, n - 1));
  pages.forEach((p, i) => { p.hidden = i !== S.diaryPage; });
  renderDiaryTabs(secs, cur);
  renderDiaryNav(n, cur > 0, cur < secs.length - 1);
}

// 翻过一个签的头尾，就翻到隔壁的签
function flipDiary(d) {
  const flow = document.getElementById("diary-flow");
  const n = flow ? flow.children.length : 1;
  const to = (S.diaryPage || 0) + d;
  if (to >= 0 && to < n) {
    S.diaryPage = to;
  } else {
    const next = diaryTabsNow.indexOf(S.diaryTab) + d;
    if (next < 0 || next >= diaryTabsNow.length) return;
    S.diaryTab = diaryTabsNow[next];
    S.diaryPage = d > 0 ? 0 : Infinity;
  }
  sfx("paper");
  renderDiaryIndex();
}

function renderDiaryNav(n, hasPrev, hasNext) {
  if (!notesActions || S.diaryLeaf) return;
  const i = S.diaryPage || 0;
  const kids = [];
  if (n > 1 || hasPrev || hasNext) {
    kids.push(el("div", { class: "diary-nav" }, [
      el("button", { type: "button", class: "diary-btn diary-flip", "aria-label": "上一页", disabled: i <= 0 && !hasPrev, onclick: () => flipDiary(-1) }, ["‹"]),
      el("span", { class: "diary-folio" }, [i + 1 + "／" + n]),
      el("button", { type: "button", class: "diary-btn diary-flip", "aria-label": "下一页", disabled: i >= n - 1 && !hasNext, onclick: () => flipDiary(1) }, ["›"]),
    ]));
  }
  kids.push(el("button", { type: "button", class: "diary-btn", onclick: closeNotes }, ["合上"]));
  notesActions.replaceChildren(...kids);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.getElementById("pic-zoom") && S.diaryLeaf && !S.diaryLeaf.lock) {
    if (S.diaryLeaf.clueModal || (notesLayer && !notesLayer.hidden)) {
      dismissDiaryLeaf();
      return;
    }
  }
  if (!notesLayer || notesLayer.hidden || S.diaryLeaf || !notesIndex || notesIndex.hidden) return;
  if (e.key === "ArrowLeft") flipDiary(-1);
  else if (e.key === "ArrowRight") flipDiary(1);
});

function closeNotes() {
  if (notesLayer && !notesLayer.hidden) sfx("shut");
  if (notesLayer) notesLayer.hidden = true;
  if (S.diaryLeaf && !S.diaryLeaf.clueModal) S.diaryLeaf = null;
}

function toggleNotes() {
  if (S.diaryLeaf && S.diaryLeaf.canFile) return;
  if (S.diaryLeaf && S.diaryLeaf.clueModal) {
    dismissDiaryLeaf();
    return;
  }
  if (notesLayer && !notesLayer.hidden) closeNotes();
  else openNotes();
}

function showDiaryIndex() {
  sfx(notesLayer && notesLayer.hidden ? "open" : "paper");
  closeModal();
  S.diaryLeaf = null;
  if (notesIndex) notesIndex.hidden = false;
  if (notesLeaf) {
    notesLeaf.hidden = true;
    notesLeaf.replaceChildren();
  }
  if (notesLayer) notesLayer.hidden = false;
  renderNotes();
}

function dismissDiaryLeaf() {
  const leaf = S.diaryLeaf;
  const onClose = leaf && leaf.onClose;
  const fromIndex = leaf && leaf.fromIndex;
  const clueModal = leaf && leaf.clueModal;
  if (leaf && leaf.canFile && leaf.item && !(leaf.isFiled ? leaf.isFiled() : hasEvidence(leaf.item.id))) noteSkip(leaf.item);
  S.diaryLeaf = null;
  if (clueModal) closeModal();
  if (fromIndex) {
    diaryBack();
    return;
  }
  if (!clueModal) closeNotes();
  afterModalClose(onClose);
}

/* 正文里找能记的那几个字：显式 key → 标题字眼 → 第一句 */
function clueKeySpan(body, item, opts, canFile, stamped, fileIt) {
  const keyMark = (text) => {
    if (canFile) {
      return el("span", {
        class: "diary-key-link",
        role: "button",
        tabindex: "0",
        title: "点一下，记进日记簿",
        onclick: fileIt,
        onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileIt(); } },
      }, [text]);
    }
    return stamped ? el("span", { class: "diary-key-kept" }, [text]) : text;
  };
  let keyText = String((opts && opts.key) || item.key || "");
  if (!keyText && item.title && body.includes(item.title)) keyText = item.title;
  let at = -1;
  let len = 0;
  if (keyText) {
    for (const k of [keyText, keyText.replace(/[。．.]+$/, "")]) {
      at = body.indexOf(k);
      if (at >= 0) { len = k.length; break; }
    }
  }
  if (at < 0 && body && (canFile || stamped || item.id)) {
    const m = body.match(/^\s*([^\n。．.!！？]{2,28})/);
    if (m) {
      keyText = m[1];
      at = body.indexOf(keyText);
      len = keyText.length;
    }
  }
  if (at >= 0) return [body.slice(0, at), keyMark(body.slice(at, at + len)), body.slice(at + len)];
  return [body];
}

/* 单条线索／证物：和「大门与铁闸」同一套 scene 弹窗；可记的字画在正文 */
function showClueModal(item, opts) {
  opts = { ...(opts || {}) };
  if (!opts.clue) opts.clue = CLUE_IMG;
  closeModal();
  if (notesLayer && !notesLayer.hidden) {
    notesLayer.hidden = true;
  }
  if (typeof ensureStageBackdrop === "function") ensureStageBackdrop();
  if (mapLayer) mapLayer.hidden = true;
  if (item.id) {
    S.evOpened = S.evOpened || {};
    S.evOpened[item.id] = true;
  }
  const filed = opts.isFiled ? opts.isFiled() : !!(item.id && hasEvidence(item.id));
  const stamped = opts.stamped || filed;
  const canFile = opts.canFile !== false && item.id && !filed;
  S.diaryLeaf = {
    canFile,
    item,
    isFiled: opts.isFiled,
    fromIndex: !!opts.fromIndex,
    onClose: opts.onClose,
    clueModal: true,
  };

  const pic = item.img || opts.clue;
  const fileIt = () => {
    sfx("file");
    if (opts.keep) opts.keep(item);
    else fileEvidence(pic && !item.img ? { ...item, img: pic } : item);
    renderNotes();
    if (opts.onFile) opts.onFile(item);
    showClueModal(item, { ...opts, canFile: false, stamped: true });
  };

  const body = item.body || "";
  const kids = [
    el("h3", {}, [item.title || ""]),
    pic ? clueSlot(pic, item.title) : "",
    el("p", { class: "clue-body" }, clueKeySpan(body, item, opts, canFile, stamped, fileIt)),
  ];
  if (item.time) kids.splice(1, 0, el("p", { class: "fine clue-time" }, [item.time]));
  if (stamped && !opts.fromIndex) kids.push(el("span", { class: "diary-stamp clue-stamp", "aria-hidden": "true" }, ["已记下"]));

  // 点正文下划线记下；点「好／合上」、弹窗外或 Esc = 不记（不恢复「记下来／先不记」）
  if (opts.fromIndex) {
    const kin = item.id && typeof itemKin === "function" ? itemKin(item.id) : [];
    if (kin.length) {
      kids.push(el("div", { class: "clue-kin" }, [
        el("p", { class: "clue-kin-h" }, ["同一样东西"]),
        ...kin.map((e) => el("button", {
          type: "button",
          class: "clue-kin-link",
          onclick: () => diaryPush(() => showClueModal(e, { canFile: false, fromIndex: true })),
        }, [e.kind + "　" + e.title + " ›"])),
      ]));
    }
    kids.push(el("div", { class: "clue-acts" }, [
      el("button", { type: "button", class: "btn ghost", onclick: diaryBack }, [diaryBackLabel()]),
      el("button", {
        type: "button",
        class: "btn ghost scene-close",
        onclick: () => {
          S.diaryLeaf = null;
          closeModal();
          if (notesLayer) notesLayer.hidden = true;
        },
      }, ["合上"]),
    ]));
  } else {
    kids.push(el("button", {
      type: "button",
      class: "btn ghost scene-close",
      onclick: () => dismissDiaryLeaf(),
    }, ["好"]));
  }

  const sheet = el("div", { class: "sheet scene clue-sheet" }, kids);
  S.modal = el("div", {
    class: "modal scene",
    id: "game-modal",
    onclick: (e) => {
      if (e.target !== S.modal) return;
      dismissDiaryLeaf();
    },
  }, [sheet]);
  stage.append(S.modal);
}

function showDiarySheet(item, opts) {
  showClueModal(item, opts);
}

function showModal(title, p1, p2, kind, onClose, keep) {
  const wasVm = !!$(".sheet.voicemail", stage);
  closeModal();
  const k = kind || (keep ? "memo" : "scene");
  const clue = (keep && keep.img) || CLUE_IMG;

  if (k === "memo" || keep) {
    const item = keep || itemFromModalTitle(title, p1, p2);
    if (!item.body && p1) item.body = p1;
    if (p2 && !item.time) item.time = p2;
    showClueModal(item, { onClose, canFile: !!keep, clue });
    return;
  }

  if (k === "voicemail") {
    if (!wasVm) sfx("vm");
    const kids = [
      el("h3", {}, [title]),
      clueSlot(clue, title),
      el("p", { class: "talk-text" }, [p1 || ""]),
      p2 ? el("p", { class: "fine" }, [p2]) : "",
    ];
    const filed = !!(keep && hasEvidence(keep.id));
    if (keep) {
      kids.push(el("button", {
        class: "btn",
        type: "button",
        disabled: filed,
        onclick: () => {
          sfx("file");
          fileEvidence(keep);
          renderNotes();
          showModal(title, p1, "已记下。", k, onClose, keep);
        },
      }, [filed ? "已记下" : "记下来"]));
    }
    kids.push(el("button", {
      class: "btn ghost",
      type: "button",
      onclick: () => {
        if (keep && !hasEvidence(keep.id)) noteSkip(keep);
        afterModalClose(onClose);
      },
    }, [keep && !filed ? "先不记" : "好"]));
    S.modal = el("div", { class: "modal", id: "game-modal" }, [
      el("div", { class: "sheet voicemail" }, kids),
    ]);
    stage.append(S.modal);
    return;
  }

  if (k === "prompt") {
    const kids = [
      el("h3", {}, [title]),
      clueSlot(clue, title),
      el("p", {}, [p1 || ""]),
      p2 ? el("p", {}, [p2]) : "",
      el("button", {
        class: "btn ghost",
        type: "button",
        onclick: () => afterModalClose(onClose),
    }, ["好"]),
    ];
    if (typeof browserOverRoom === "function" && browserOverRoom()) {
      kids.push(el("button", {
        class: "btn ghost",
        type: "button",
        onclick: closeRental,
      }, ["关闭网页"]));
    }
    S.modal = el("div", { class: "modal web", id: "game-modal" }, [
      el("div", { class: "sheet prompt" }, kids),
  ]);
  stage.append(S.modal);
    return;
  }

  // scene：与可记线索同一奶油壳。先开窗；能不能记只看 keep／memo（正文有没有铅笔线）
  showClueModal({
    title,
    body: p1 || "",
    time: p2 || "",
  }, {
    onClose,
    canFile: false,
    clue,
  });
}

function tip(text, opt) {
  opt = opt || {};
  const old = document.getElementById("game-tip");
  if (old) old.remove();
  const node = el("div", { class: "game-tip", id: "game-tip", role: "status" }, [text]);
  if (opt.nearBar) node.classList.add("near-bar");
  document.body.append(node);
  if (!opt.quiet) sfx("tip");
  setTimeout(() => node.remove(), opt.ms || 3200);
}

function keepThen(item, next) {
  showClueModal(item, {
    onClose: () => {
      if (next) next();
    },
  });
}

/* 并列卡：同一天、同一趟的几样东西横排在一张卡上。故事按时间讲，线索并排摆。
   cards: [{ img, title, body, item }]；有 item 的那张，正文铅笔线点一下记进日记簿 */
function showBoard(title, time, cards, onClose) {
  closeModal();
  if (notesLayer && !notesLayer.hidden) notesLayer.hidden = true;
  if (typeof ensureStageBackdrop === "function") ensureStageBackdrop();
  if (mapLayer) mapLayer.hidden = true;
  const close = () => {
    cards.forEach((c) => { if (c.item && !hasEvidence(c.item.id)) noteSkip(c.item); });
    if (onClose) onClose();
  };
  S.diaryLeaf = { clueModal: true, onClose: close };
  const row = el("div", { class: "board-row n" + cards.length }, cards.map((c) => {
    const it = c.item;
    const filed = !!(it && hasEvidence(it.id));
    const fileIt = () => {
      sfx("file");
      fileEvidence(c.img && !it.img ? { ...it, img: c.img } : it);
      renderNotes();
      showBoard(title, time, cards, onClose);
    };
    const body = c.body || (it && it.body) || "";
    return el("figure", { class: "board-card" }, [
      clueSlot(c.img, c.title),
      el("figcaption", {}, [
        el("b", { class: "board-title" }, [c.title]),
        el("span", { class: "clue-body" }, it ? clueKeySpan(body, it, {}, !filed, filed, fileIt) : [body]),
      ]),
      filed ? el("span", { class: "diary-stamp clue-stamp", "aria-hidden": "true" }, ["已记下"]) : "",
    ]);
  }));
  const kids = [
    el("h3", {}, [title]),
    time ? el("p", { class: "fine clue-time" }, [time]) : "",
    row,
    el("button", { type: "button", class: "btn ghost scene-close", onclick: () => dismissDiaryLeaf() }, ["好"]),
  ];
  S.modal = el("div", {
    class: "modal scene",
    id: "game-modal",
    onclick: (e) => {
      if (e.target !== S.modal) return;
      dismissDiaryLeaf();
    },
  }, [el("div", { class: "sheet scene clue-sheet clue-board" }, kids)]);
  stage.append(S.modal);
}

function stepPast() {
  const b = currentBeat();
  if (b) advanceBeat(b);
}

function showPrompt(p1, p2) {
  showModal("提示", p1, p2, "prompt");
}
