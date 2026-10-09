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

function zoomPic(src, alt) {
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
  const box = el("div", {
    class: "pic-zoom",
    id: "pic-zoom",
    role: "dialog",
    "aria-label": alt || "原图",
    onclick: (e) => {
      e.stopPropagation();
      close();
    },
  }, [
    el("img", { src, alt: alt || "", draggable: "false" }),
    el("p", { class: "pic-zoom-cap" }, [(alt ? alt + "　·　" : "") + "点任意处合上"]),
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
  zoomPic(img.currentSrc || img.src, img.alt);
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
  S.diaryPage = 0;
  showDiaryIndex();
}

const KIND_ORDER = ["照片", "录音", "纸", "记下", "电话", "短讯", "邮件"];

function diarySubHead(label, n) {
  return el("h4", { class: "diary-sub" }, n ? [label, el("span", { class: "diary-count" }, [String(n)])] : [label]);
}

function diaryEntry(label, onclick, unread) {
  return el("button", {
    type: "button",
    class: "evidence-open" + (unread ? " unread" : ""),
    "aria-label": unread ? label + "（未打开）" : label,
    onclick,
  }, [el("span", { class: "evidence-name" }, [label]), el("span", { class: "evidence-go", "aria-hidden": "true" }, ["›"])]);
}

function diarySections() {
  const secs = [];
  const todo = typeof levelBlocks === "function" ? levelBlocks() : [];
  if (todo.length) secs.push({ tab: "待办事项", title: "待办事项", blocks: todo });

  const clip = [];
  const papers = typeof paperPages === "function" ? paperPages() : [];
  if (papers.length) {
    clip.push(diarySubHead("我写的", papers.length));
    papers.forEach(([label, fn]) => clip.push(diaryEntry(label, fn, false)));
  }
  const items = S.evidence || [];
  const rank = (k) => (KIND_ORDER.includes(k) ? KIND_ORDER.indexOf(k) : KIND_ORDER.length);
  const kinds = [...new Set(items.map((e) => e.kind || "其他"))].sort((a, b) => rank(a) - rank(b));
  kinds.forEach((k) => {
    const group = items.filter((e) => (e.kind || "其他") === k);
    clip.push(diarySubHead(k, group.length));
    group.forEach((item) => {
      const unread = !(S.evOpened && S.evOpened[item.id]);
      clip.push(diaryEntry(item.title, () => showDiarySheet(item, { canFile: false, fromIndex: true }), unread));
    });
  });
  if (!items.length && !papers.length) clip.push(el("p", { class: "diary-note diary-empty" }, ["还没有。"]));
  secs.push({ tab: "收集", title: "收集的东西", blocks: clip });

  const notes = (S.notes || []).map((n) => el("p", { class: "diary-note diary-line" }, [n.text]));
  secs.push({ tab: "笔记", title: "笔记", blocks: notes.length ? notes : [el("p", { class: "diary-note diary-empty" }, ["还没有记下。"])] });
  return secs;
}

function renderDiaryTabs(starts) {
  const meta = notesIndex && notesIndex.querySelector(".diary-meta");
  if (!meta) return;
  const now = S.diaryPage || 0;
  let cur = 0;
  starts.forEach((s, i) => { if (now >= s.page) cur = i; });
  meta.replaceChildren(el("nav", { class: "diary-tabs", "aria-label": "日记簿分类" }, starts.map((s, i) => el("button", {
    type: "button",
    class: "diary-tab" + (i === cur ? " on" : ""),
    "aria-current": i === cur ? "page" : null,
    onclick: () => {
      if (i === cur) return;
      S.diaryPage = s.page;
      sfx("paper");
      renderDiaryIndex();
    },
  }, [s.tab]))));
}

// 一类一页起头；一页放不下就续到下一页，不滚动
function renderDiaryIndex() {
  const flow = document.getElementById("diary-flow");
  if (!flow || !notesLayer || notesLayer.hidden || !notesIndex || notesIndex.hidden) return;
  renderDiaryNav(2);
  flow.replaceChildren();
  const pages = [];
  const newPage = (title, cont) => {
    const p = el("div", { class: "diary-folio-page" }, [el("h3", { class: "diary-sec" }, [cont ? title + "（续）" : title])]);
    flow.append(p);
    pages.push(p);
    return p;
  };
  const starts = [];
  diarySections().forEach((s) => {
    starts.push({ tab: s.tab, page: pages.length });
    let page = newPage(s.title, false);
    let sub = null;
    s.blocks.forEach((b) => {
      page.append(b);
      const isSub = b.classList.contains("diary-sub");
      if (page.scrollHeight > page.clientHeight + 1 && page.children.length > 2) {
        const carry = [b];
        const prev = b.previousElementSibling;
        if (!isSub && prev && prev.classList.contains("diary-sub") && page.children.length > 3) carry.unshift(prev);
        else if (!isSub && sub) carry.unshift(sub.cloneNode(true));
        page = newPage(s.title, true);
        page.append(...carry);
      }
      if (isSub) sub = b;
    });
  });
  const n = pages.length;
  S.diaryPage = Math.max(0, Math.min(S.diaryPage || 0, n - 1));
  pages.forEach((p, i) => { p.hidden = i !== S.diaryPage; });
  renderDiaryTabs(starts);
  renderDiaryNav(n);
}

function flipDiary(d) {
  const flow = document.getElementById("diary-flow");
  const n = flow ? flow.children.length : 1;
  const to = Math.max(0, Math.min((S.diaryPage || 0) + d, n - 1));
  if (to === (S.diaryPage || 0)) return;
  S.diaryPage = to;
  sfx("paper");
  renderDiaryIndex();
}

function renderDiaryNav(n) {
  if (!notesActions || S.diaryLeaf) return;
  const i = S.diaryPage || 0;
  const kids = [];
  if (n > 1) {
    kids.push(el("div", { class: "diary-nav" }, [
      el("button", { type: "button", class: "diary-btn diary-flip", "aria-label": "上一页", disabled: i <= 0, onclick: () => flipDiary(-1) }, ["‹"]),
      el("span", { class: "diary-folio" }, [i + 1 + "／" + n]),
      el("button", { type: "button", class: "diary-btn diary-flip", "aria-label": "下一页", disabled: i >= n - 1, onclick: () => flipDiary(1) }, ["›"]),
    ]));
  }
  kids.push(el("button", { type: "button", class: "diary-btn", onclick: closeNotes }, ["合上"]));
  notesActions.replaceChildren(...kids);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && notesLayer && !notesLayer.hidden && S.diaryLeaf && !S.diaryLeaf.lock && !document.getElementById("pic-zoom")) {
    dismissDiaryLeaf();
    return;
  }
  if (!notesLayer || notesLayer.hidden || S.diaryLeaf || !notesIndex || notesIndex.hidden) return;
  if (e.key === "ArrowLeft") flipDiary(-1);
  else if (e.key === "ArrowRight") flipDiary(1);
});

function closeNotes() {
  if (notesLayer && !notesLayer.hidden) sfx("shut");
  if (notesLayer) notesLayer.hidden = true;
  S.diaryLeaf = null;
}

function toggleNotes() {
  if (S.diaryLeaf && S.diaryLeaf.canFile) return;
  if (notesLayer && !notesLayer.hidden) closeNotes();
  else openNotes();
}

function showDiaryIndex() {
  sfx(notesLayer && notesLayer.hidden ? "open" : "paper");
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
  if (leaf && leaf.canFile && leaf.item && !(leaf.isFiled ? leaf.isFiled() : hasEvidence(leaf.item.id))) noteSkip(leaf.item);
  S.diaryLeaf = null;
  if (fromIndex) {
    showDiaryIndex();
    return;
  }
  closeNotes();
  afterModalClose(onClose);
}

function showDiarySheet(item, opts) {
  opts = { ...(opts || {}) };
  if (!opts.clue) opts.clue = CLUE_IMG;
  closeModal();
  if (mapLayer) mapLayer.hidden = true;
  if (item.id) {
    S.evOpened = S.evOpened || {};
    S.evOpened[item.id] = true;
  }
  const filed = opts.isFiled ? opts.isFiled() : !!(item.id && hasEvidence(item.id));
  const stamped = opts.stamped || filed;
  const canFile = opts.canFile !== false && item.id && !filed;
  S.diaryLeaf = { canFile, item, isFiled: opts.isFiled, fromIndex: !!opts.fromIndex, onClose: opts.onClose };

  const innerKids = [
    el("div", { class: "diary-meta" }, [
      el("span", { class: "diary-kind" }, [item.kind || "其他"]),
      item.time ? el("time", { class: "diary-time" }, [item.time]) : "",
    ]),
  ];
  const pic = item.img || opts.clue;
  const fileIt = () => {
    sfx("file");
    if (opts.keep) opts.keep(item);
    else fileEvidence(pic && !item.img ? { ...item, img: pic } : item);
    renderNotes();
    if (opts.onFile) opts.onFile(item);
    showDiarySheet(item, { ...opts, canFile: false, stamped: true });
  };
  // 能记的那几个字就在原文里画线：另写了 key 就在正文里找；没写就找正文里的标题字眼；都找不到才画标题
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
  const body = item.body || "";
  let keyText = String(opts.key || item.key || "");
  if (!keyText && item.id && item.title && body.includes(item.title)) keyText = item.title;
  let at = -1;
  let len = 0;
  if (keyText) {
    for (const k of [keyText, keyText.replace(/[。．.]+$/, "")]) {
      at = body.indexOf(k);
      if (at >= 0) { len = k.length; break; }
    }
  }
  const onTitle = !keyText && item.id;
  innerKids.push(el("h4", { class: "diary-title" }, [onTitle ? keyMark(item.title || "") : item.title || ""]));
  if (pic) innerKids.push(imgSlot(pic, "diary-img", item.title));
  innerKids.push(el("div", { class: "diary-body" }, at >= 0
    ? [body.slice(0, at), keyMark(body.slice(at, at + len)), body.slice(at + len)]
    : [body]));
  if (keyText && at < 0) innerKids.push(el("p", { class: "diary-key" }, [keyMark(keyText)]));
  if (stamped) innerKids.push(el("span", { class: "diary-stamp", "aria-hidden": "true" }, ["已记下"]));

  if (notesIndex) notesIndex.hidden = true;
  if (notesLeaf) {
    notesLeaf.hidden = false;
    notesLeaf.replaceChildren(...innerKids);
  }
  if (notesActions) {
    notesActions.replaceChildren();
    if (canFile) {
      // 不放按钮：点下划线那句记下；点纸外面或按 Esc 就是不记
    } else if (opts.fromIndex) {
      notesActions.append(
        el("button", {
          type: "button",
          class: "diary-btn",
          onclick: showDiaryIndex,
        }, ["回到目录"]),
        el("button", {
          type: "button",
          class: "diary-btn",
          onclick: closeNotes,
        }, ["合上"])
      );
    } else {
      notesActions.append(el("button", {
        type: "button",
        class: "diary-btn",
        onclick: dismissDiaryLeaf,
        }, ["合上"]));
    }
  }
  if (notesLayer && notesLayer.hidden) sfx("open");
  if (notesLayer) notesLayer.hidden = false;
}

function showModal(title, p1, p2, kind, onClose, keep) {
  const wasVm = !!$(".sheet.voicemail", stage);
  closeModal();
  const k = kind || (keep ? "memo" : "scene");
  const clue = (keep && keep.img) || CLUE_IMG;

  if (k === "memo" || keep) {
    const item = keep || itemFromModalTitle(title, p1, p2);
    showDiarySheet(item, { onClose, canFile: !!keep });
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
    S.modal = el("div", { class: "modal web", id: "game-modal" }, [
      el("div", { class: "sheet prompt" }, kids),
  ]);
  stage.append(S.modal);
    return;
  }

  const kids = [
    el("h3", {}, [title]),
    clueSlot(clue, title),
    el("p", {}, [p1 || ""]),
    p2 ? el("p", { class: "fine" }, [p2]) : "",
    el("button", {
      class: "btn ghost scene-close",
      type: "button",
      onclick: () => afterModalClose(onClose),
    }, ["好"]),
  ];
  S.modal = el("div", { class: "modal scene", id: "game-modal" }, [
    el("div", { class: "sheet scene" }, kids),
  ]);
  stage.append(S.modal);
}

function tip(text) {
  const old = document.getElementById("game-tip");
  if (old) old.remove();
  const node = el("div", { class: "game-tip", id: "game-tip", role: "status" }, [text]);
  document.body.append(node);
  sfx("tip");
  setTimeout(() => node.remove(), 3200);
}

function keepThen(item, next) {
  // 对话 goto 清过舞台、或其它路径没留下房间底图时，先补一块再摊开日记
  if (S.mode === "talk" && typeof paintTalkBackdrop === "function" && stage && !stage.querySelector(".room-bg, .talk-bg")) {
    paintTalkBackdrop();
  }
  showDiarySheet(item, {
    onClose: () => {
      if (next) next();
    },
  });
}

function stepPast() {
  const b = currentBeat();
  if (b) advanceBeat(b);
}

function showPrompt(p1, p2) {
  showModal("提示", p1, p2, "prompt");
}
