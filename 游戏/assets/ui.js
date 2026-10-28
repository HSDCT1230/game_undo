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
// 刚点了「历史收集」的展开/收起，重排之后要跟到它所在的页去（不存进档）
let diaryFocus = false;
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
    sfx("paper");
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
    "aria-label": (side ? side + "，" : "") + label + (unread ? "（未打开）" : ""),
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

// 「收集的」：证物和笔记按日子排；纸归「我写的」。
// 本关之前的收成「历史收集」挂在最新一条后面；展开后同一页内滚动，不翻页
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
  const cur = keys.filter((k) => !old.includes(k));
  const out = [];
  const dayChunk = (k) => {
    const d = days.get(k);
    return [diarySubHead(d.label), ...d.rows];
  };
  cur.forEach((k) => out.push(...dayChunk(k)));
  if (old.length) {
    const n = old.reduce((s, k) => s + days.get(k).rows.length, 0);
    const span = days.get(old[0]).label + (old.length > 1 ? "～" + days.get(old[old.length - 1]).label : "");
    const fold = el("button", {
      type: "button",
      class: "diary-fold" + (S.diaryOld ? " unfolded" : ""),
      "aria-expanded": S.diaryOld ? "true" : "false",
      onclick: () => {
        S.diaryOld = !S.diaryOld;
        // 展开后这一块常常放不进本页，会被分到下一页——只重排不跟过去，
        // 玩家按了「展开」看着本页没动静，会以为按坏了。让分页把他带过去。
        diaryFocus = S.diaryOld;
        sfx("paper");
        renderDiaryIndex();
      },
    }, [
      el("span", { class: "diary-fold-name" }, ["历史收集（" + span + "）"]),
      el("span", { class: "diary-count" }, [String(n)]),
      el("span", { class: "diary-fold-go", "aria-hidden": "true" }, [S.diaryOld ? "收起 ▴" : "展开 ▾"]),
    ]);
    if (S.diaryOld) {
      const hist = el("div", { class: "diary-hist", role: "region", "aria-label": "历史收集" });
      old.forEach((k) => hist.append(...dayChunk(k)));
      // 开关和它开出来的那一块是一个整体：分页时不许拆。拆了就是「按钮在这页、
      // 内容在下页」，而「收起」还留在玩家看不到的那一页上。
      out.push(el("div", { class: "diary-old" }, [fold, hist]));
    } else out.push(fold);
  }
  return out;
}

// 「按东西」：证物和笔记都按「关于哪样」归堆。
// 先前这里只数证物，笔记一条都不出现——两个视图一翻，二十几条当场不见，
// 看着就像收来的东西丢了。归不上的（论坛回帖之类）收在最后一组，不硬塞。
function thingBlocks() {
  const rows = [];
  // 每条存「怎么造」，不存造好的节点：一条纸可以同时关于车和水喉，
  // 两组各要自己的一个节点。共用同一个的话，后一组的 append 会把节点搬走，
  // 前一组当场少几条（数着 9 件，只排出 5 件）。
  (S.evidence || []).forEach((e) => rows.push({ t: e.time, about: itemAbout(e.id), make: () => evidenceEntry(e) }));
  (S.notes || []).filter(noteShown).forEach((n) => rows.push({
    t: noteTime(n),
    about: noteAbout(n.id),
    make: () => el("p", { class: "diary-note diary-line" }, [n.text]),
  }));
  const out = [];
  [...THINGS, ""].forEach((t) => {
    const group = rows.filter((r) => (t ? r.about.includes(t) : !r.about.length));
    if (!group.length) return;
    group.sort((a, b) => dayOf(a.t).key - dayOf(b.t).key);
    out.push(diarySubHead(t || "只是记下的话", group.length), ...group.map((r) => r.make()));
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
    // 「历史收集」那两条（折叠按钮、展开后的整块）不是哪一天的事，
    // 续页不该把上一天的日期头带过去——带了，下一页顶上一行「9月7日」，
    // 看起来就像古老的东西都是九月七日收的。
    const noCarry = b.classList.contains("diary-old") || b.classList.contains("diary-fold") || b.classList.contains("diary-hist");
    if (page.scrollHeight > page.clientHeight + 1 && page.children.length > 2) {
      const carry = [b];
      const prev = b.previousElementSibling;
      if (!isSub && !noCarry && prev && prev.classList.contains("diary-sub") && page.children.length > 3) carry.unshift(prev);
      else if (!isSub && !noCarry && sub) carry.unshift(sub.cloneNode(true));
      page = newPage(true);
      page.append(...carry);
    }
    if (isSub) sub = b;
  });
  const n = pages.length;
  S.diaryPage = Math.max(0, Math.min(S.diaryPage || 0, n - 1));
  // 刚点开「历史收集」：跟到那一块所在的页去（它多半被挤到了下一页）。
  if (diaryFocus) {
    const i = pages.findIndex((p) => p.querySelector(".diary-old"));
    if (i >= 0) S.diaryPage = i;
    diaryFocus = false;
  }
  pages.forEach((p, i) => { p.hidden = i !== S.diaryPage; });
  // 「历史收集」那一块按本页还剩多少地方给高度。写死一个 px 值，窗口一大就空着半页、
  // 窗口一小就把「8月3日」以下全切掉——两者都会让人以为日记簿坏了。
  // 高度还要取整到格子（--diary-cell）：切在半行字上，看着就像页面坏了。
  pages.forEach((p) => {
    const h = p.querySelector(".diary-hist");
    if (!h) return;
    const cell = parseFloat(getComputedStyle(p).getPropertyValue("--diary-cell")) || 28;
    const was = p.hidden;
    p.hidden = false;
    const box = p.getBoundingClientRect();
    const room = Math.max(0, p.clientHeight - (h.getBoundingClientRect().top - box.top) - 4);
    p.hidden = was;
    const fit = Math.floor(room / cell) * cell;
    if (fit > 0) h.style.maxHeight = fit + "px";
  });
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
  const filed = leaf && leaf.item && (leaf.isFiled ? leaf.isFiled() : hasEvidence(leaf.item.id));
  // 必做：没记下不记 skip，交给 onClose 再弹；旁支：先不记才进 missed
  if (leaf && leaf.canFile && leaf.item && !filed && !leaf.mustFile) noteSkip(leaf.item);
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
    mustFile: !!opts.mustFile,
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
        }, [H(e.kind) + "：" + H(e.title) + " ›"])),
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

  const sheet = el("div", { class: "sheet scene clue-sheet" + (isPolaroid(item) ? " polaroid-leaf" : "") }, kids);
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

/* 她自己的拍立得。相纸一盒八张。租盘图、旧相框、别人的偷拍不走这里。
   快门之前那张相纸是白的——还没曝光，画面里什么都不该有。按下去才吐纸：
   先一片灰白，药膜退开，影像才慢慢浮上来；白边上的时间要等显影完了才写。 */
const POLAROID_IDS = ["photo-sill", "photo-print", "photo-car-out", "photo-tap-out"];
const FILM_PACK = 8;
const POLAROID_EJECT_MS = 420;
const POLAROID_DEV_MS = 2200;

function isPolaroid(it) {
  return !!(it && POLAROID_IDS.includes(it.id));
}

function filmLeft() {
  const used = (S.evidence || []).filter((e) => POLAROID_IDS.includes(e.id)).length;
  return Math.max(0, FILM_PACK - used);
}

function shootPolaroid(it, next) {
  if (!it) return;
  if (hasEvidence(it.id)) {
    showClueModal(it, { canFile: false, onClose: next });
    return;
  }
  closeModal();
  if (notesLayer && !notesLayer.hidden) notesLayer.hidden = true;
  const frame = el("div", { class: "polaroid" }, [
    el("div", { class: "polaroid-well" }, [it.img ? imgSlot(it.img, "polaroid-pic", it.title) : ""]),
    el("p", { class: "polaroid-cap" }, [""]),
  ]);
  const film = el("p", { class: "fine polaroid-film" }, ["相纸还剩 " + filmLeft() + " 张"]);
  const btn = el("button", { type: "button", class: "btn" }, ["按快门"]);
  const sheet = el("div", { class: "sheet scene polaroid-sheet" }, [
    el("h3", {}, ["拍立得"]),
    el("p", { class: "fine" }, ["自己的相机，按下去要等一会儿，白边再写时间"]),
    frame,
    film,
    btn,
  ]);
  // 关掉动效的人不该等两秒半的空窗：三段照走，只是缩到几乎瞬时
  const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ejectMs = calm ? 60 : POLAROID_EJECT_MS;
  const devMs = calm ? 160 : POLAROID_DEV_MS;
  btn.addEventListener("click", () => {
    if (frame.classList.contains("ready")) {
      sfx("file");
      fileEvidence(it);
      renderNotes();
      closeModal();
      if (next) next();
      return;
    }
    if (frame.classList.contains("exposing") || frame.classList.contains("developing")) return;
    sfx("shutter");
    frame.classList.add("exposing"); // 吐纸：整张灰白，影还压在里面
    btn.disabled = true;
    btn.textContent = "吐纸……";
    setTimeout(() => {
      frame.classList.remove("exposing");
      frame.classList.add("developing"); // 药膜退开，影像浮上来
      btn.textContent = "显影……";
      setTimeout(() => {
        frame.classList.remove("developing");
        frame.classList.add("ready");
        const cap = frame.querySelector(".polaroid-cap");
        if (cap) cap.textContent = (it.time ? it.time + "　" : "") + (it.title || "");
        film.textContent = "相纸还剩 " + Math.max(0, filmLeft() - 1) + " 张";
        btn.disabled = false;
        btn.textContent = "夹进日记簿";
      }, devMs);
    }, ejectMs);
  });
  S.modal = el("div", { class: "modal scene", id: "game-modal" }, [sheet]);
  stage.append(S.modal);
}

function keepThen(item, next) {
  showClueModal(item, {
    onClose: () => {
      if (next) next();
    },
  });
}

// 必做证物：点铅笔线记下才走下一步；合上未记则提示并再弹
function keepMust(item, next) {
  const show = () => showClueModal(item, {
    mustFile: true,
    onClose: () => {
      if (!hasEvidence(item.id)) {
        tip("先记进日记簿。", { nearBar: true });
        show();
        return;
      }
      if (next) next();
    },
  });
  show();
}

/* 并列卡：同一天、同一趟的几样东西横排在一张卡上。故事按时间讲，线索并排摆。
   cards: [{ img, title, body, item }]；有 item 的那张，正文铅笔线点一下记进日记簿
   opts.must：有 item 的卡必须先记下才关（必做） */
function showBoard(title, time, cards, onClose, opts) {
  opts = opts || {};
  closeModal();
  if (notesLayer && !notesLayer.hidden) notesLayer.hidden = true;
  if (typeof ensureStageBackdrop === "function") ensureStageBackdrop();
  if (mapLayer) mapLayer.hidden = true;
  const close = () => {
    const missing = cards.filter((c) => c.item && !hasEvidence(c.item.id));
    if (opts.must && missing.length) {
      tip("先记进日记簿。", { nearBar: true });
      showBoard(title, time, cards, onClose, opts);
      return;
    }
    missing.forEach((c) => noteSkip(c.item));
    if (onClose) onClose();
  };
  S.diaryLeaf = { clueModal: true, onClose: close, mustFile: !!opts.must };
  const row = el("div", { class: "board-row n" + cards.length }, cards.map((c) => {
    const it = c.item;
    const filed = !!(it && hasEvidence(it.id));
    const fileIt = () => {
      sfx("file");
      fileEvidence(c.img && !it.img ? { ...it, img: c.img } : it);
      renderNotes();
      showBoard(title, time, cards, onClose, opts);
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
