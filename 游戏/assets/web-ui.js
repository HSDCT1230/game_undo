/* web-ui.js — rental / wall UI; requires web-data.js */
/* data -> web-data.js: HK_DISTRICTS */

/* data -> web-data.js: LISTINGS */

function listingById(id) {
  return LISTINGS.find((l) => l.id === id) || LISTINGS.find((l) => l.id === "ssp");
}

function rentLabel(l) {
  return (l.rent || "") + "／" + (l.per || "月");
}

function homeLatest() {
  return LISTINGS
    .filter((l) => l.id !== "ssp" && l.date)
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.views || 0) - (a.views || 0))
    .slice(0, 3);
}

/* data -> web-data.js: NEWS */

/* ---------- 网页上的时间：一律对着游戏钟，不准比钟快 ---------- */

const pad2 = (n) => String(n).padStart(2, "0");

function webDate(mmdd, hm) {
  const [mo, d] = mmdd.split("-").map(Number);
  const [h, mi] = (hm || "00:00").split(":").map(Number);
  return new Date(2014, mo - 1, d, h, mi);
}

function clockHasHm() {
  return /\d{1,2}:\d{2}/.test(S.time || "");
}

function clockDate() {
  const day = storyDay();
  const m = /(\d{1,2}):(\d{2})/.exec(S.time || "");
  return new Date(2014, Math.floor(day / 100) - 1, day % 100, m ? Number(m[1]) : 23, m ? Number(m[2]) : 59);
}

function webStamp(t) {
  return pad2(t.getMonth() + 1) + "-" + pad2(t.getDate()) + " " + pad2(t.getHours()) + ":" + pad2(t.getMinutes());
}

function webAgo(t) {
  const now = clockDate();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(t)) / 86400000);
  const hm = pad2(t.getHours()) + ":" + pad2(t.getMinutes());
  // 「今天」也算还没到的钟点：倾偈那几段是一口气排下来的，钟点会走到当前时刻之后，
  // 那时给它们写「08-15 10:15」会在同一段里一半「今天」一半日子。
  if (diff <= 0) return "今天 " + hm;
  if (diff === 1) return "昨天 " + hm;
  return webStamp(t);
}

function webPast(t) {
  return t.getTime() <= clockDate().getTime();
}

function isSerial(id) {
  return id === "wk1" || id === "wk2" || id === "wk3";
}

function serialAt(id) {
  const at = S.postAt && S.postAt[id];
  return at ? new Date(at) : webDate(...THREADS[id].time.split(" "));
}

function threadTime(id) {
  return isSerial(id) ? webStamp(serialAt(id)) : THREADS[id].time;
}

function viewTriedCount() {
  return Object.keys(S.viewTried || {}).length;
}

function helpRepliesOpen() {
  // S.helpSearches 是旧档留下的计数，只读不再写——跳关补前情那条路径还在用它。
  return viewTriedCount() >= 3 || (S.helpSearches || 0) >= 3
    || (typeof noted === "function" && noted("bbs-self"));
}

// 问过三间不同的盘，求助帖才露出藤先生那层。
// 曾按「点三次」算，同一间连点也算——她只碰过一间，帖子就有人回了，
// 与日记簿「一间一间对过去」对不上。现在按盘算。
function countViewTry(id) {
  if (helpRepliesOpen() || !id) return;
  S.viewTried = S.viewTried || {};
  S.viewTried[id] = true;
}

function threadReplies(id) {
  const t = THREADS[id];
  let rows = t.replies || [];
  if (id === "helpzhang" && !helpRepliesOpen()) {
    const cut = rows.findIndex((r) => r.user === "藤先生");
    if (cut >= 0) rows = rows.slice(0, cut);
  }
  if (!isSerial(id)) return rows;
  const base = webDate(...t.time.split(" ")).getTime();
  const at = serialAt(id).getTime();
  return rows
    .map((r) => Object.assign({}, r, { at: new Date(at + webDate(...r.time.split(" ")).getTime() - base) }))
    .filter((r) => webPast(r.at))
    .map((r) => Object.assign(r, { time: webStamp(r.at) }));
}

function boardLabel(b) {
  return T(b, ({ 求助: "求助", 租务: "租房", 地区: "地区", 杂谈: "闲聊" })[b] || b);
}

/** 列表热度：按回复数假造「第 N 页」，像本地论坛一眼看出帖有多热闹。 */
function forumPageMarks(replyCount) {
  const pages = Math.max(1, Math.min(6, 1 + Math.ceil((replyCount || 0) / 2)));
  let s = "";
  for (let i = 1; i <= pages; i++) s += T("第", "第") + i + T("页", "页");
  return s;
}

function forumPreview(text, max) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const n = max || 36;
  return raw.length > n ? raw.slice(0, n) + "…" : raw;
}

function serialWhen(id) {
  return webDate(...THREADS[id].time.split(" ")).getTime();
}

function pinSerial(id) {
  S.postAt = S.postAt || {};
  S.postAt[id] = serialWhen(id);
}

// 刊登时间钉死在剧本那一点，不跟「你哪一刻点发布」走——不然回复会被推到还没到的钟，下一帖对不上。
// 但「几点刊登」不等于「已经发出」：发帖只能由草稿页那个「发布」按钮成立（publishSerial）。
// 从前这里按钟点自己 flag(serialN, true)，玩家还没按，讨论区就先挂着「阿琪V」的帖，
// 「发第 N 帖」也跟着自己勾上——她莫名其妙多了一篇帖，这一关也白送了。
/* data -> web-data.js: SERIAL_DUE */

function ensureSerials() {
  if (!S || !S.flags) return;
  SERIAL_DUE.forEach((d) => {
    if (!flag(d.key)) return;
    const when = serialWhen(d.id);
    if (!S.postAt || S.postAt[d.id] !== when) pinSerial(d.id);
  });
}

function newsCaseOpen() {
  return S.level >= 14 && !(hasEvidence("news-mud") && hasEvidence("news-urb"));
}

function newsIds(limit) {
  let ids = Object.keys(NEWS).sort((a, b) => NEWS[b].date.localeCompare(NEWS[a].date));
  // 鱼牌链才露出校报旧闻和罗的公开履历；没问过他，列表里不放
  if (typeof flag !== "function" || !flag("askedFishLuo")) {
    ids = ids.filter((id) => id !== "kimon" && id !== "yu04");
  }
  // 后半段要自己翻到西贡／市建局：仍夹在普通港闻里，但别沉到滚很久才见
  if (newsCaseOpen()) {
    const pin = ["urb", "mud"].filter((id) => ids.includes(id));
    const rest = ids.filter((id) => !pin.includes(id));
    ids = rest.slice(0, 2).concat(pin, rest.slice(2));
  }
  // 入住那晚是带着「重建」两个字进站的，第一条就该是它
  if (typeof flag === "function" && flag("uraGate") && S.level < 14) {
    ids = ["urb"].concat(ids.filter((id) => id !== "urb"));
  }
  if (typeof flag === "function" && flag("askedFishLuo")) {
    const pin = ["yu04", "kimon"].filter((id) => ids.includes(id));
    ids = pin.concat(ids.filter((id) => !pin.includes(id)));
  }
  return limit ? ids.slice(0, limit) : ids;
}

function newsLink(id, mini) {
  const n = NEWS[id];
  const seen = !!(S.newsSeen && S.newsSeen[id]);
  return el("a", {
    href: "http://28house.hk/news/" + id,
    class: (mini ? "mini-row" : "forum-row news-row") + (seen ? " seen" : ""),
    onclick: (e) => {
      e.preventDefault();
      S.newsSeen = S.newsSeen || {};
      S.newsSeen[id] = true;
      goWeb("newsitem", { newsId: id });
    },
  }, [
    el("span", { class: "fmeta" }, [n.date]),
    el("span", { class: "ftitle" }, [Ty(n, "title")]),
  ]);
}

/* data -> web-data.js: THREADS */

function threadVisible(id) {
  if (id === "helpzhang") return postedHelp();
  if (id === "wk1") return flag("serial1");
  if (id === "wk2") return flag("serial2");
  if (id === "wk3") return flag("serial3");
  return true;
}

function unreadSerial() {
  const fresh = (id, posted, seen) => flag(posted) && !flag(seen) && threadReplies(id).length;
  if (fresh("wk3", "serial3", "sawWk3")) return "wk3";
  if (fresh("wk2", "serial2", "sawWk2")) return "wk2";
  if (fresh("wk1", "serial1", "sawWk1")) return "wk1";
  return "";
}

function myThreadIds() {
  const ids = [];
  if (postedHelp() && helpRepliesOpen()) ids.push("helpzhang");
  if (flag("serial1")) ids.push("wk1");
  if (flag("serial2")) ids.push("wk2");
  if (flag("serial3")) ids.push("wk3");
  return ids;
}

function houseForumUnread() {
  S.houseSeen = S.houseSeen || {};
  const keys = [];
  myThreadIds().forEach((id) => {
    threadReplies(id).forEach((r, i) => {
      const k = id + "#" + i;
      if (!S.houseSeen[k]) keys.push(k);
    });
  });
  return keys;
}

function threadFresh(id) {
  return houseForumUnread().some((k) => k.indexOf(id + "#") === 0);
}

function markHouseThread(id) {
  if (!THREADS[id]) return;
  S.houseSeen = S.houseSeen || {};
  threadReplies(id).forEach((r, i) => { S.houseSeen[id + "#" + i] = true; });
}

function listingBlob(l) {
  return [l.title, l.sub, l.area, l.district].concat(l.keys).join(" ");
}

function listingIsShare(l) {
  return /合租|分租|雅房|板间|分住/.test(listingBlob(l));
}

function listingIsEstate(l) {
  return /屋苑|新邨|第一城|花园/.test(listingBlob(l));
}

function applyListFilter(rows) {
  const f = S.listFilter || "all";
  if (f === "owner") return rows.filter((l) => !l.agent);
  if (f === "share") return rows.filter(listingIsShare);
  if (f === "estate") return rows.filter(listingIsEstate);
  return rows;
}

function filtered() {
  const q = S.query.trim();
  let rows;
  if (q === "业主自让") {
    return applyListFilter(LISTINGS.filter((l) => !l.agent));
  } else if (!q) {
    rows = [];
  } else if (HK_DISTRICTS.includes(q)) {
    rows = LISTINGS.filter((l) => l.district === q);
  } else {
    const words = q.split(/\s+/).filter(Boolean);
    rows = LISTINGS.filter((l) => words.some((w) => listingBlob(l).includes(w)));
  }
  return applyListFilter(rows);
}

function postedHelp() {
  return flag("postedHelp");
}

function isWallScreen(screen) {
  const s = String(screen || "");
  return s === "wall" || s === "ad" || s.indexOf("wall-") === 0;
}

function holdForPost(screen) {
  // 空白分页、搜索结果、维基、校园网都是另外几个站，不受廿八屋发帖门禁管。
  // 判法跟 goWeb／browseFromScene／分页标题同一套，别再各写一份白名单。
  if (isBlankSite(screen)) return false;
  const onWall = isWallScreen(S.screen);
  if (S.pendingPost) {
    if (screen === "post") return false;
    showPrompt(W("needPost"), W("needPostBody"));
    if (!onWall && S.screen !== "post") {
      S.screen = "post";
      S.tab = "house";
      draw();
    }
    return true;
  }
  // 墙簿是另一个站。未顶帖只拦住廿八屋，不把人从墙簿拽回去。
  if (isWallScreen(screen) || postedHelp() || screen === "post") return false;
  showPrompt(W("needBump"), W("needBumpBody"));
  if (!onWall && S.screen !== "post") {
    S.screen = "post";
    S.tab = "house";
    draw();
  }
  return true;
}

function needPostFirst() {
  return holdForPost("list");
}

function blockedLogout() {
  showPrompt(T("登出失败", "退出失败"), T("网页无回应，请稍后再试", "网页无响应，请稍后再试"));
}

// 网页里的任务提示，和其他场景一样别在荧幕右边的便条上
function currentSlate() {
  if (S.mode !== "web") return "";
  if (S.pendingPost && S.screen === "post") return "看完草稿，按下面的「发布」。不按就不算发出去。";
  if (!postedHelp() && S.screen === "post") return "帖子沉下去了，顶上去，再自己搜。";
  return !S.paused && typeof levelHint === "function" ? levelHint() : "";
}

function offerSlate() {
  const text = currentSlate();
  if (!text || S.modal || document.getElementById("slate")) return;
  stage.append(el("div", { class: "scene-actions fork task-note", id: "slate" }, [
    el("p", { class: "hub-hint" }, [text]),
  ]));
}

function clearSlate() {
  const n = document.getElementById("slate");
  if (n) n.remove();
}

function publishHelpPost() {
  sfx("send");
  flag("postedHelp", true);
  clearSlate();
  showPrompt(W("bumped"));
}

function districtSelected(d) {
  const q = (S.query || "").trim();
  if (q === d || q.startsWith(d + " ")) return true;
  if (d === "油尖旺" && /旺角|大角咀/.test(q)) return true;
  if (d === "东区" && q.includes("北角")) return true;
  return false;
}

function laptop(inner, opts) {
  opts = opts || {};
  const tab = opts.tab;
  const addr = opts.addr;
  const scene = !!opts.scene;
  const desk = el("div", { class: "desk" });
  const laptopBox = el("div", { class: "laptop" });
  const screen = el("div", { class: "laptop-screen" });
  const title = opts.title
    || (tab === "wall"
      // 标签页这个数字只算首页（公开动态）：邮件那条已经在站内「收件箱」钮上有自己的数，
      // 两处都算合计等于同一批未读被数两遍，玩家对不上。
      ? wallCountLabel("墙簿", wallUnread().feed)
      : tab === "house"
        ? wallCountLabel("廿八屋", houseForumUnread().length)
        : webTabTitle(tab));
  const titlebar = el("div", { class: "browser-titlebar" }, [
    el("span", { class: "ie-icon", "aria-hidden": "true" }, ["e"]),
    el("span", { class: "browser-title" }, [title + " - Windows Internet Explorer"]),
    browserCloseControls(),
  ]);
  const canBack = scene ? !!S.searchDoc : (S.webHist || []).length > 0;
  const canFwd = scene ? false : (S.webFwd || []).length > 0;
  const loading = webLoadEnd > Date.now();
  // 地址栏是真的输入框：回车或「转到」才导航，输入中不重绘，草稿靠 webAddrDraft 熬过重绘。
  const addrBox = el("input", {
    type: "text",
    class: "addr",
    value: webAddrDraft != null ? webAddrDraft : addr,
    spellcheck: "false",
    autocomplete: "off",
    "aria-label": "地址",
    oninput: (e) => { webAddrDraft = e.target.value; },
    onfocus: (e) => e.target.select(),
    onkeydown: (e) => {
      if (e.key === "Enter") { e.preventDefault(); webSubmitAddr(); }
      else if (e.key === "Escape") { webAddrDraft = null; e.target.value = addr; e.target.blur(); }
    },
  });
  const chrome = el("div", { class: "browser-chrome" }, [
    el("div", { class: "browser-nav" }, [
      el("button", {
        type: "button",
        "data-nav": "back",
        disabled: !canBack,
        onclick: scene ? () => { S.searchDoc = ""; drawSearch(); } : webBack,
        title: "后退",
      }, ["←"]),
      el("button", {
        type: "button",
        "data-nav": "fwd",
        disabled: !canFwd,
        onclick: webForward,
        title: "前进",
      }, ["→"]),
      el("button", {
        type: "button",
        "data-nav": "stop",
        disabled: !loading,
        onclick: webStopLoad,
        title: "停止",
      }, ["■"]),
      el("button", {
        type: "button",
        "data-nav": "reload",
        onclick: scene ? () => { S.searchDoc = ""; drawSearch(); } : webReload,
        title: "刷新",
      }, ["↻"]),
    ]),
    el("span", { class: "addr-label" }, ["地址"]),
    addrBox,
    el("button", {
      type: "button",
      class: "go-btn",
      onclick: webSubmitAddr,
      title: "转到",
    }, ["转到"]),
  ]);
  // 分页：廿八屋、墙簿两个固定格，后面是这趟开过的网页，最右边永远留一格空的「新分页」。
  // 那一格被用来开了一个网页之后，分页会自动再多出一格空白的（见 goWeb → tabForScreen）。
  const tabs = el("div", { class: "browser-tabs" }, [
    btnTab(wallCountLabel("廿八屋", houseForumUnread().length) + " - 香港租盘", "house", tab, scene),
    btnTab(wallCountLabel("墙簿", wallUnread().n) + " - 我的首页", "wall", tab, scene),
    ...webTabs().map((id) => tabCell(webTabTitle(id), id, tab, scene)),
    btnTab("新分页", "newtab", tab, scene),
  ]);
  revealTab(tabs);
  const status = el("div", { class: "browser-status" }, [
    el("span", { class: "bs-left" }, [loading ? webLoadLabel() : "完成"]),
    el("span", { class: "bs-right" }, [
      el("span", {}, ["Internet"]),
      el("span", { class: "bs-sep", "aria-hidden": "true" }),
      el("span", {}, [opts.secure ? "受保护模式：开启" : "100%"]),
    ]),
  ]);
  screen.append(titlebar, chrome, tabs, inner, status);
  laptopBox.append(screen);
  desk.append(laptopBox);
  return desk;
}

// 分页开到装不下时，当前这一格得自己滚进来。整排每次重绘都从最左边开始，
// 不补这一下，人在第 8 格按个刷新就被弹回「廿八屋」了。
function revealTab(bar) {
  setTimeout(() => {
    const on = bar.querySelector("button.on");
    if (!on || !bar.isConnected) return;
    if (bar.scrollWidth <= bar.clientWidth + 1) return;
    const br = bar.getBoundingClientRect();
    const or = on.getBoundingClientRect();
    const left = or.left - br.left + bar.scrollLeft;
    if (left < bar.scrollLeft) bar.scrollLeft = left - 6;
    else if (left + or.width > bar.scrollLeft + bar.clientWidth)
      bar.scrollLeft = left + or.width - bar.clientWidth + 6;
  }, 0);
}

function btnTab(label, id, on, scene) {  return el("button", {
    type: "button",
    class: id === on ? "on" : "",
    onclick: () => {
      if (scene) {
        browseFromScene(id === "wall" ? "wall" : id === "house" ? "home" : "newtab");
        return;
      }
      // 点自己所在的分页不重载——真实浏览器只是把这一页提到前面。
      if (id === on) return;
      // 该分页上次停在哪就回哪：从校园网切去廿八屋再切回来，还是原来那一页。
      const mem = id === "house" && (S.pendingPost || !postedHelp()) ? null : tabMemory(id);
      if (mem) {
        if (holdForPost(mem.screen)) return;
        swapTabHist(S.tab, id);
        restoreWebSnap(mem);
        S.tab = id;
        webAddrDraft = null;
        webStartLoad();
        draw();
        return;
      }
      if (id === "wall") {
        swapTabHist(S.tab, id);
        goWeb("wall", { noHist: true });
        return;
      }
      if (id === "newtab") {
        // 最右那一格永远是空的：点它就是把一张 about:blank 提到前面，不动别的分页。
        swapTabHist(S.tab, id);
        goWeb("newtab", { tab: id, noHist: true });
        return;
      }
      if (id !== "house") {
        // 网页分页没有记忆（理论上只在刚开出来那一下）——给它一张空白页。
        swapTabHist(S.tab, id);
        goWeb("newtab", { tab: id, noHist: true });
        return;
      }
      // 换去廿八屋／墙簿也各算一格：不换历史的话，在那边按后退会退进
      // 别个分页刚才那间校园网——几个分页却共用一个后退栈。
      swapTabHist(S.tab, id);
      if (S.pendingPost || !postedHelp()) goWeb("post", { noHist: true });
      else goWeb(flag("searched") ? "list" : "home", { noHist: true });
    },
  }, [label]);
}

/* 网页分页外面再包一格，好让右上角那颗 × 单独成键。
   廿八屋、墙簿是这部机固定的两格，照旧只用 btnTab，没有 ×。
   「新分页」也不给 ×——那一格永远要留在最右边（见 closeWebTab 的说明）。 */
function tabCell(label, id, on, scene) {
  const btn = btnTab(label, id, on, scene);
  if (scene) return btn;
  btn.className += " closable";
  return el("span", { class: "tab-cell" }, [
    btn,
    el("button", {
      type: "button",
      class: "tab-x",
      title: "关闭分页",
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeWebTab(id);
      },
    }, ["×"]),
  ]);
}

/* 关一格网页分页。关掉的若正是眼前这一格，把邻格提上来（先右后左，都没有就回
   「新分页」）；「新分页」那一格本身由 laptop() 无条件画出来，所以关到只剩它也不会没了。 */
function closeWebTab(id) {
  const list = webTabs();
  const i = list.indexOf(id);
  if (i < 0) return;
  const wasOn = S.tab === id;
  const next = list[i + 1] || list[i - 1] || "newtab";
  S.webTabs = list.filter((x) => x !== id);
  if (S.tabMem) delete S.tabMem[id];
  if (S.tabHist) delete S.tabHist[id];
  if (!wasOn) {
    draw();
    return;
  }
  if (typeof sfxWebClose === "function") sfxWebClose();
  webAddrDraft = null;
  const mem = next !== "newtab" ? tabMemory(next) : null;
  if (mem) {
    swapTabHist(id, next);
    restoreWebSnap(mem);
    S.tab = next;
    webStartLoad();
    draw();
    return;
  }
  swapTabHist(id, "newtab");
  goWeb("newtab", { tab: "newtab", noHist: true });
}

function webLink(text, fn, cls) {
  return el("a", {
    href: "#",
    class: cls || "web-link",
    onclick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      fn();
    },
  }, [text]);
}

function snapWeb() {
  return {
    screen: S.screen,
    tab: S.tab,
    listing: S.listing,
    wallWho: S.wallWho,
    forumId: S.forumId,
    newsId: S.newsId,
    adId: S.adId,
    query: S.query,
    listFilter: S.listFilter || "all",
    // 维基条目最底那几条新闻稿是同一个 screen，靠这一项分开是哪一篇。
    wikiNews: S.wikiNews || "",
    // 官网内页同理：栏目页／新闻／活动各是一个 screen，靠这一项分开是哪一页。
    siteArg: S.siteArg || "",
    // 校园网站内页（收件箱／公告栏）是同一个 screen，靠这两项分开列表与单条。
    vhuMail: (S.vhu && S.vhu.mail) || "",
    vhuNotice: (S.vhu && S.vhu.notice) || "",
    vhuBook: (S.vhu && S.vhu.book) || "",
  };
}

/* 分页：廿八屋、墙簿是固定两格；后面是这趟真正开过的网页（webTabs，按打开顺序）；
   最右永远留一格空的「新分页」。那一格被拿去开了网页之后，goWeb 会补一格新的——
   所以整排里始终只有一格「新分页」，不会再像从前那样并排摆着两格空白页。
   每格各自记得停在哪一页（tabMem），也各自有自己的后退栈（tabHist）。 */
function webTabs() {
  if (!Array.isArray(S.webTabs)) S.webTabs = [];
  return S.webTabs;
}

function isWebTab(id) {
  return webTabs().indexOf(id) >= 0;
}

// 开一格新的网页分页，排在「新分页」左边。id 只增不减，要写进 tabMem／tabHist／后退栈。
function newPageTab() {
  S.tabSeq = Number(S.tabSeq) || 0;
  const id = "w" + (++S.tabSeq);
  webTabs().push(id);
  return id;
}

function tabKey() {
  const t = String(S.tab || "");
  if (t === "wall" || t === "house" || t === "newtab") return t;
  return isWebTab(t) ? t : "newtab";
}

function rememberTab() {
  // 「新分页」永远是空的，不必记；记下来反而会把这一格变成一张有内容的页。
  if (tabKey() === "newtab") return;
  S.tabMem = S.tabMem || {};
  S.tabMem[tabKey()] = snapWeb();
}

function tabMemory(id) {
  const mem = S.tabMem && S.tabMem[id];
  return mem && mem.screen ? mem : null;
}

// 这一格最后停在哪一页：自己就在这一格时看实时状态，否则看记忆。
function tabScreen(id) {
  if (id === S.tab) return String(S.screen || "newtab");
  const mem = tabMemory(id);
  return String((mem && mem.screen) || "newtab");
}

// 分页上的字：网页分页显示它停在的那一页，跟标题栏对得上。
function webTabTitle(id) {
  if (id === "newtab") return "新分页";
  const s = tabScreen(id);
  if (s.indexOf("vhu-") === 0) return "VHU Portal - 维港大学";
  if (s === "engine") return "通搜　搜寻";
  // 真维基的分页标题是「条目名 - 维基百科，自由的百科全书」，一行写全，截不截是浏览器的事。
  if (s === "wiki") return "维港大学 - 维基百科，自由的百科全书";
  if (s === "wiki-news") return "大学新闻稿 - 维港大学";
  if (s === "wiki-cat") return "Category:香港的大学 - 维基百科，自由的百科全书";
  // 官网与门户的标题刻意不同：一部是「维港大学」，一部是「VHU Portal」。
  // 分页条上并排两格的时候，这一行字就是她分辨「哪个才是能登入的」的唯一依据。
  if (s === "vhusite") return "维港大学";
  // 内页标题：真站的浏览器标题是「栏目 - 站名」，不写篇名——篇名长了会被截，
  // 而且分页上并排几格时，认出「还是同一部机器」比认出「是哪一篇」要紧。
  if (s === "vhusite-page") return "维港大学";
  if (s === "vhusite-story") return "新闻稿 - 维港大学";
  if (s === "vhusite-event") return "活动 - 维港大学";
  if (s === "hknews") return "维港大学 - 院校动态 - 香港日报";
  if (s === "web-error") return "无法显示网页";
  return "about:blank";
}

// 一张页面该落在哪一格：廿八屋／墙簿回自己那格；外来页留在当前网页分页里，
// 若当前停在固定格或「新分页」上，就为它开一张新分页（「新分页」随即被补一张新的）。
function tabForScreen(screen, cur) {
  if (screen === "ad" || screen === "wall" || String(screen).indexOf("wall-") === 0) return "wall";
  if (isBlankSite(screen)) return isWebTab(cur) ? cur : newPageTab();
  return "house";
}

// 旧档迁移：从前 blank／blank2 是写死的两格，现在换成动态分页。
function normalizeTabs() {
  if (!Array.isArray(S.webTabs)) S.webTabs = [];
  S.webTabs = S.webTabs.filter((x) => typeof x === "string" && x);
  S.tabSeq = Math.max(Number(S.tabSeq) || 0, S.webTabs.length);
  S.tabMem = S.tabMem && typeof S.tabMem === "object" ? S.tabMem : {};
  delete S.tabMem.blank;
  delete S.tabMem.blank2;
  const t = String(S.tab || "");
  if (t === "house" || t === "wall" || t === "newtab" || isWebTab(t)) return;
  // 旧档正停在一张外来页上：给它补一张正式分页，别让这一页丢掉。
  if ((t === "blank" || t === "blank2") && !isBlankSite(String(S.screen || "newtab"))) {
    S.tab = newPageTab();
    return;
  }
  S.tab = "newtab";
}

// 几个分页各有自己的「上一页」：在这一格按后退，不该退到别格刚才那一页去。
function swapTabHist(from, to) {
  S.tabHist = S.tabHist || {};
  if (from && from !== to) S.tabHist[from] = { hist: S.webHist || [], fwd: S.webFwd || [] };
  const got = S.tabHist[to];
  S.webHist = got ? (got.hist || []).slice() : [];
  S.webFwd = got ? (got.fwd || []).slice() : [];
}

function browseFromScene(screen) {
  if (S.mode !== "web") {
    S.paused = { mode: S.mode, talk: S.talk, wait: S.wait };
    if (S.mode === "night") stopNightClock();
    S.mode = "web";
  }
  const keep = isBlankSite(screen) || String(screen).startsWith("wall");
  goWeb(keep ? screen : (postedHelp() ? "home" : "post"));
}

function openRental() {
  if (S.mode !== "web") {
    S.paused = { mode: S.mode, talk: S.talk, wait: S.wait };
    if (S.mode === "night") stopNightClock();
    S.mode = "web";
  }
  goWeb(postedHelp() ? "forum" : "post");
}

// 第二关起人已经住进／在场，浏览器只是叠在房间上；关窗口必须回房间。
// 存档会丢掉 paused／hub，所以不能再靠这两样判断——否则底栏一直灰着「浏览器」。
function browserOverRoom() {
  return S.mode === "web" && S.level > 1;
}

function browserCloseControls() {
  if (!browserOverRoom()) {
    // 三颗窗控钮之间靠 CSS 的 gap 隔开——以前是「—　□　×」拿全角空格撑的
    return el("span", { class: "window-controls", "aria-hidden": "true" }, [
      el("span", {}, ["—"]),
      el("span", {}, ["□"]),
      el("span", {}, ["×"]),
    ]);
  }
  return el("span", { class: "window-controls" }, [
    el("span", { "aria-hidden": "true" }, ["—"]),
    el("span", { "aria-hidden": "true" }, ["□"]),
    el("button", {
      type: "button",
      class: "window-x",
      title: "关闭网页，回到房间",
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeRental();
      },
    }, ["×"]),
  ]);
}

function leaveBrowserToRoom() {
  if (typeof closeModal === "function") closeModal();
  S.pendingPost = "";
  const p = S.paused;
  S.paused = null;
  if (p && p.mode && p.mode !== "web") {
    S.mode = p.mode;
    S.talk = p.talk;
    S.wait = p.wait;
    if (p.mode === "night" && typeof startNightClock === "function") startNightClock();
    draw();
    return true;
  }
  if (S.hub && typeof HUBS !== "undefined" && HUBS[S.hub.id]) {
    if (typeof backToHub === "function") backToHub();
    else {
      S.mode = "hub";
      draw();
    }
    return true;
  }
  const L = typeof LEVELS !== "undefined" ? LEVELS[S.level] : null;
  if (L && typeof L.start === "function") {
    L.start();
    return true;
  }
  return false;
}

function closeRental() {
  if (S.modal) {
    closeModal();
    draw();
    return;
  }
  if (S.pendingPost && typeof THREADS !== "undefined" && THREADS[S.pendingPost]) {
    if (!S.modal) {
      showPrompt(
        T("还没发布", "还没发布"),
        T("先按「发布」，关掉窗口不会把帖发出去", "先按「发布」，关掉窗口不会把帖发出去")
      );
    }
    return;
  }
  if (typeof sfxWebClose === "function") sfxWebClose();
  if (!leaveBrowserToRoom()) draw();
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !browserOverRoom()) return;
  if (notesLayer && !notesLayer.hidden) return;
  if (document.getElementById("pic-zoom")) return;
  if (S.modal) {
    closeModal();
    draw();
    return;
  }
  closeRental();
});

// 落「新分页」那一格的都是外来站：空白页、打不开的网址、搜索结果、维基、学校官网、报纸、整个校园网。
// 三处（goWeb／browseFromScene／分页标题）都得用同一套判法，不然分页高亮会跟页面对不上。
function isBlankSite(screen) {
  const s = String(screen || "");
  // 官网内页（vhusite-page／vhusite-story／vhusite-event）跟首页一样落在外来页那一格，
  // 所以这里要按前缀认，不能只认 "vhusite" 一个字符串。
  return s === "newtab" || s === "web-error" || s === "engine" || s === "wiki" ||
    s === "wiki-news" || s === "wiki-cat" || s.indexOf("vhusite") === 0 ||
    s === "hknews" || s.indexOf("vhu-") === 0;
}

function goWeb(screen, extra) {
  extra = extra || {};
  if (screen === "district") {
    screen = "list";
    extra.search = true;
    if (!("filter" in extra)) extra.filter = "all";
  } else if (screen === "estate") {
    screen = "list";
    extra.search = true;
    extra.filter = "estate";
  } else if (screen === "share") {
    screen = "list";
    extra.search = true;
    extra.filter = "share";
  }
  if (holdForPost(screen)) return;
  // 先定这一页落在哪一格，再记历史：新开分页时上一页（about:blank）要记成同一格的，
  // 否则新分页里按后退会跳回最右那格「新分页」，页跑了、格还留着。
  const targetTab = extra.tab || tabForScreen(screen, S.tab);
  // noHist：换分页那一下不算「在新分页里走了一步」，不必把旧分页那一页塞进来。
  if (!extra.replace && !extra.noHist) {
    S.webHist = S.webHist || [];
    const cur = Object.assign(snapWeb(), { tab: targetTab });
    const last = S.webHist[S.webHist.length - 1];
    if (!last || last.screen !== cur.screen || last.tab !== cur.tab) {
      S.webHist.push(cur);
      if (S.webHist.length > 24) S.webHist.shift();
    }
  }
  S.webFwd = [];
  S.screen = screen;
  S.wallFresh = null;
  // 一走动就把没答完的回覆丢掉：草稿不该跟着人跑，更不该下次打开还挂在帖下面。
  S.wallDraft = null;
  S.wallNav = (S.wallNav || 0) + 1;
  if (extra.tab) S.tab = extra.tab;
  // 站内页之间走动时留在自己这一格：从哪张分页搜进去，就一直在那张分页里。
  // 若当前停在固定格或「新分页」上，外来页会开一张新分页——「新分页」随即补一张新的。
  else S.tab = targetTab;
  if ("listing" in extra) S.listing = extra.listing;
  if ("wallWho" in extra) S.wallWho = extra.wallWho;
  if ("forumId" in extra) S.forumId = extra.forumId;
  if ("newsId" in extra) S.newsId = extra.newsId;
  if ("adId" in extra) S.adId = extra.adId;
  if ("query" in extra) S.query = extra.query;
  if ("wikiNews" in extra) S.wikiNews = extra.wikiNews || "";
  if ("siteArg" in extra) S.siteArg = extra.siteArg || "";
  if ("filter" in extra) S.listFilter = extra.filter;
  // 收件箱／公告栏的列表与单条是同一个 screen，用这两个走历史栈。
  if ("mailId" in extra && S.vhu) S.vhu.mail = extra.mailId || "";
  if ("noticeId" in extra && S.vhu) S.vhu.notice = extra.noticeId || "";
  if ("bookCall" in extra && S.vhu) S.vhu.book = extra.bookCall || "";
  if (extra.search) flag("searched", true);
  webAddrDraft = null;
  webStartLoad();
  draw();
}

function webBack() {
  const prev = (S.webHist || [])[S.webHist.length - 1];
  if (!prev) return;
  if (holdForPost(prev.screen)) return;
  S.webHist.pop();
  S.webFwd = S.webFwd || [];
  S.webFwd.push(snapWeb());
  if (S.webFwd.length > 24) S.webFwd.shift();
  restoreWebSnap(prev);
  webAddrDraft = null;
  webStartLoad();
  draw();
}

function webForward() {
  const next = (S.webFwd || [])[S.webFwd.length - 1];
  if (!next) return;
  if (holdForPost(next.screen)) return;
  S.webFwd.pop();
  S.webHist = S.webHist || [];
  S.webHist.push(snapWeb());
  if (S.webHist.length > 24) S.webHist.shift();
  restoreWebSnap(next);
  webAddrDraft = null;
  webStartLoad();
  draw();
}

function restoreWebSnap(p) {
  S.screen = p.screen;
  // 旧档/旧后退栈里可能还留着 blank／blank2 这种写死的分页名，认不出就留在当前这格。
  if (p.tab === "house" || p.tab === "wall" || p.tab === "newtab" || isWebTab(p.tab)) S.tab = p.tab;
  S.listing = p.listing;
  S.wallWho = p.wallWho;
  S.forumId = p.forumId;
  S.newsId = p.newsId;
  S.adId = p.adId;
  S.query = p.query;
  S.listFilter = p.listFilter || "all";
  if (p.screen === "wiki-news") S.wikiNews = p.wikiNews || "";
  S.siteArg = p.siteArg || "";
  if (S.vhu) {
    if (p.screen === "vhu-mail") S.vhu.mail = p.vhuMail || "";
    if (p.screen === "vhu-notice") S.vhu.notice = p.vhuNotice || "";
    if (p.screen === "vhu-book") S.vhu.book = p.vhuBook || "";
  }
}

/* ---------- 地址栏、四个导航键 ---------- */

// 输入中的草稿。重绘会重建输入框，靠它把没提交的文字留住。
let webAddrDraft = null;
// 状态栏「正在开启…」的截止时间戳；大于此刻即载入中，「停止」才可按。
let webLoadEnd = 0;
let webLoadTimer = null;
let webReloadTop = false;
const WEB_LOAD_MS = 600;

function webLoadLabel() {
  const a = webAddr();
  if (a === "about:blank") return "正在开启 about:blank…";
  const host = String(a).replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split("/")[0];
  return "正在开启 " + (host || a) + "…";
}

function webStartLoad() {
  webLoadEnd = Date.now() + WEB_LOAD_MS;
  clearTimeout(webLoadTimer);
  webLoadTimer = setTimeout(() => webEndLoad("完成"), WEB_LOAD_MS);
}

function webEndLoad(label) {
  clearTimeout(webLoadTimer);
  webLoadTimer = null;
  webLoadEnd = 0;
  const left = stage && stage.querySelector(".browser-status .bs-left");
  if (left) left.textContent = label || "完成";
  const stop = stage && stage.querySelector('.browser-nav button[data-nav="stop"]');
  if (stop) stop.disabled = true;
}

function webStopLoad() {
  webEndLoad("已停止");
}

function webReload() {
  webReloadTop = true;
  webAddrDraft = null;
  webStartLoad();
  draw();
}

function webSubmitAddr() {
  const box = stage && stage.querySelector(".browser-chrome .addr");
  const raw = String(box ? box.value : (webAddrDraft || "")).trim();
  if (!raw) {
    if (box) box.focus();
    return;
  }
  if (typeof vhuOpenUrl !== "function" || typeof vhuNormalizeUrl !== "function") return;
  // 从搜查画面里直接输网址会离开剧情镜头，这里顺手把模式拨回浏览器。
  if (S.mode !== "web") {
    S.mode = "web";
    S.paused = null;
    S.searchDoc = "";
  }
  if (vhuNormalizeUrl(raw) === vhuNormalizeUrl(webAddr())) {
    webReload();
    return;
  }
  webAddrDraft = null;
  vhuOpenUrl(raw);
}


/* 网页内容区滚动：同页重绘（回应展开、收藏、记下）保住位置；换页才回到顶 */
function webPageScrollEl(root) {
  root = root || stage;
  if (!root) return null;
  return root.querySelector(".laptop-screen > .hk-site") || root.querySelector(".hk-site");
}

function webViewKey() {
  return [
    S.mode || "",
    S.tab || "",
    S.screen || "",
    S.listing || "",
    S.forumId || "",
    S.newsId || "",
    S.adId || "",
    S.wallWho || "",
    S.query || "",
    S.listFilter || "",
  ].join("|");
}

let webScrollSnap = null;

function rememberWebScroll() {
  const el = webPageScrollEl();
  if (!el) {
    webScrollSnap = null;
    return;
  }
  webScrollSnap = { key: webViewKey(), top: el.scrollTop, left: el.scrollLeft };
}

function applyWebScroll() {
  const snap = webScrollSnap;
  webScrollSnap = null;
  if (!snap || snap.key !== webViewKey()) return;
  const put = () => {
    const el = webPageScrollEl();
    if (!el) return;
    el.scrollTop = snap.top;
    el.scrollLeft = snap.left;
  };
  put();
  requestAnimationFrame(() => {
    put();
    // 展开回应栏时，只在必要时微移，避免被裁在视口外；不滚回顶
    const draft = stage && stage.querySelector(".post-reply-wrap.open .wall-draft");
    if (draft && draft.scrollIntoView) draft.scrollIntoView({ block: "nearest", inline: "nearest" });
    const box = stage && stage.querySelector(".post-reply-wrap.open .wall-draft-input");
    if (box) box.focus();
  });
}

function renderWeb() {
  if (webReloadTop) { webReloadTop = false; webScrollSnap = null; }
  else rememberWebScroll();
  sfxWebOpen();
  clearStage();
  const inner = webInner();
  // 分页高亮照 tabKey() 走：多出第四格之后，这里再手写一份白名单就会把它
  // 当成廿八屋——第四格上亮着第一格，点第一格又因为「点的是自己」不理人。
  const tab = tabKey();
  stage.append(laptop(inner, {
    tab,
    addr: webAddr(),
    secure: String(S.screen).indexOf("vhu-") === 0,
  }));
  if (S.modal) stage.append(S.modal);
  else offerSlate();
  renderPlaybar();
  applyWebScroll();
  if (S.mode === "web") rememberTab();
}

function webAddr() {
  const q = encodeURIComponent(S.query || "");
  const map = {
    home: "http://28house.hk/",
    list: "http://28house.hk/search?q=" + q,
    detail: "http://28house.hk/property/" + (S.listing || "ssp"),
    inbox: "http://28house.hk/pm/inbox",
    pm: "http://28house.hk/pm/compose",
    share: "http://28house.hk/share",
    district: "http://28house.hk/district",
    estate: "http://28house.hk/estate",
    forum: "http://28house.hk/bbs",
    thread: "http://28house.hk/bbs/t/" + (S.forumId || ""),
    rules: "http://28house.hk/help/tenancy",
    news: "http://28house.hk/news",
    newsitem: "http://28house.hk/news/" + (S.newsId || ""),
    login: "http://28house.hk/member/login",
    favs: "http://28house.hk/member/favs",
    post: "http://28house.hk/post",
    landlord: "http://28house.hk/user/chow",
    about: "http://28house.hk/about",
    wall: "http://wallbook.hk/home",
    ad: "http://wallbook.hk/ad/" + ((WALL_ADS[S.adId] && WALL_ADS[S.adId].slug) || S.adId || "teng"),
    "wall-me": "http://wallbook.hk/profile/vicky",
    "wall-friends": "http://wallbook.hk/friends",
    "wall-mail": "http://wallbook.hk/inbox",
    "wall-set": "http://wallbook.hk/settings",
    "wall-user": "http://wallbook.hk/profile/" + (S.wallWho || ""),
    newtab: "about:blank",
    "web-error": (S.vhu && S.vhu.errUrl) || "http://",
    // 地址栏上是她刚打的那几个中文字，不是一串 %E7%BB%B4。空格仍旧转成 %20——
    // 真浏览器只把空白转义，汉字照原样显示。
    // 还没搜的时候地址栏是站点首页（不带 q）——从前一律带着 ?q=，页面明明是首页、
    // 地址栏却像搜过，看着像刚搜完又把结果清掉了。
    engine: S.seSearched
      ? "http://" + SE_SITE.host + "/search?q=" + String(seQueryText()).split(" ").join("%20")
      : "http://" + SE_SITE.host + "/",
    // 真正的浏览器把路径上的中文显示出来，不会给她看一串 %E7%BB%B4。
    wiki: "http://zh.wikipedia.org/wiki/" + "维港大学",
    // 新闻稿存档在对外那一头：门户要登入，这一头不用——她读到的那条旧闻就在这里。
    "wiki-news": "http://www.vhu.edu.hk/press/" +
      ((typeof WIKI_NEWS === "object" && WIKI_NEWS[S.wikiNews] && WIKI_NEWS[S.wikiNews].slug) || ""),
    // 分类页跟条目同在 zh.wikipedia.org 底下，只是名字空间换成 Category:。
    "wiki-cat": "http://zh.wikipedia.org/wiki/Category:香港的大学",
    // 对外那一页。维基资料框里写的 www.vhu.edu.hk，就是这一串。
    vhusite: "http://www.vhu.edu.hk/",
    // 内页三个。地址跟真站一样走路径：栏目挂在根下，新闻与活动按年份分夹。
    // siteArg 就是那一页的 slug（about／0912／1031…），直接拼进去。
    "vhusite-page": "http://www.vhu.edu.hk/" + (S.siteArg || "") + "/",
    "vhusite-story": "http://www.vhu.edu.hk/news/2014/" + (S.siteArg || "") + "/",
    "vhusite-event": "http://www.vhu.edu.hk/events/2014/" + (S.siteArg || "") + "/",
    hknews: "http://news.hkdaily.com.hk/edu/vhu",
    "vhu-login": "https://" + VHU_HOST + "/login",
    "vhu-home": "https://" + VHU_HOST + "/home",
    "vhu-profile": "https://" + VHU_HOST + "/profile",
    "vhu-academic": "https://" + VHU_HOST + "/academic",
    "vhu-library": "https://" + VHU_HOST + "/library",
    "vhu-book": "https://" + VHU_HOST + "/library/cat/" + encodeURIComponent((S.vhu && S.vhu.book) || ""),
    "vhu-mail": "https://" + VHU_HOST + "/webmail" + (S.vhu && S.vhu.mail ? "/read/" + S.vhu.mail : ""),
    "vhu-notice": "https://" + VHU_HOST + "/notice" + (S.vhu && S.vhu.notice ? "/" + S.vhu.notice : ""),
  };
  return map[S.screen] || "http://28house.hk/";
}

function webInner() {
  // 未登入却直接进校园网子页（后退、旧纪录），一律落回登入页。
  if (String(S.screen).indexOf("vhu-") === 0 && S.screen !== "vhu-login") {
    const st = typeof vhuSt === "function" ? vhuSt() : null;
    if (!st || !st.authed) {
      if (st) st.need = true;
      S.screen = "vhu-login";
    }
  }
  const views = {
    home: viewHome,
    list: viewList,
    detail: viewDetail,
    inbox: viewInbox,
    pm: viewPm,
    forum: viewForum,
    thread: viewThread,
    rules: viewRules,
    news: viewNews,
    newsitem: viewNewsItem,
    login: viewLogin,
    favs: viewFavs,
    post: viewPost,
    landlord: viewLandlord,
    about: viewAbout,
    wall: viewWall,
    ad: viewAd,
    "wall-me": viewWallMe,
    "wall-friends": viewWallFriends,
    "wall-mail": viewWallMail,
    "wall-set": viewWallSet,
    "wall-user": viewWallUser,
    newtab: viewNewTab,
    "web-error": viewWebError,
    engine: viewSearchEngine,
    wiki: viewWiki,
    "wiki-news": viewWikiNews,
    "wiki-cat": viewWikiCat,
    vhusite: viewVhuSite,
    "vhusite-page": viewVhuSitePage,
    "vhusite-story": viewVhuSiteStory,
    "vhusite-event": viewVhuSiteEvent,
    hknews: viewHkNews,
    "vhu-login": viewVhuLogin,
    "vhu-home": viewVhuHome,
    "vhu-profile": viewVhuProfile,
    "vhu-academic": viewVhuAcademic,
    "vhu-library": viewVhuLibrary,
    "vhu-book": viewVhuBook,
    "vhu-mail": viewVhuMail,
    "vhu-notice": viewVhuNotice,
  };
  const fn = views[S.screen];
  return fn ? fn() : viewHome();
}

function hkNavItem(label, screen, extra) {
  const on =
    S.screen === screen ||
    (screen === "list" && (S.screen === "detail" || S.screen === "list")) ||
    (screen === "forum" && S.screen === "thread") ||
    (screen === "news" && S.screen === "newsitem");
  return el("button", {
    type: "button",
    class: "hk-nav-item" + (on ? " on" : ""),
    onclick: () => {
      extra = extra || {};
      if (screen === "list") extra.search = true;
      goWeb(screen, extra);
    },
  }, [label]);
}

function houseHeader() {
  const favN = (S.favs || []).length;
  return el("div", { class: "site-header" }, [
    el("button", {
      type: "button",
      class: "logo-btn",
      onclick: () => goWeb("home"),
    }, [
      el("div", { class: "logo" }, [
        "廿八屋",
        el("small", {}, [W("slogan")]),
      ]),
    ]),
    el("div", { class: "hdr-tools" }, [
      el("span", {}, [S.time.replace("2014年", "")]),
      el("button", {
        type: "button",
        class: "btn ghost hdr-btn" + (flag("askedOld") && !flag("sawMail") ? " hdr-hot" : ""),
        onclick: () => goWeb("inbox"),
      }, [WmailLabel()]),
      el("button", { type: "button", class: "btn ghost hdr-btn", onclick: () => goWeb("favs") }, [
        favN ? WfavLabel(favN) : W("favs"),
      ]),
      el("button", { type: "button", class: "btn ghost hdr-btn", onclick: () => goWeb("login") }, ["章慧琪"]),
    ]),
  ]);
}

function houseNav() {
  return el("nav", { class: "hk-nav" }, [
    hkNavItem(W("home"), "home"),
    hkNavItem(W("rentList"), "list"),
    hkNavItem(wallCountLabel(W("forum"), houseForumUnread().length), "forum"),
    hkNavItem(W("news"), "news"),
    el("span", { class: "hk-nav-gap" }, ["│"]),
    (() => {
      const btn = hkNavItem(W("freePost"), "post");
      if (!postedHelp() || S.pendingPost) btn.className += " quest";
      return btn;
    })(),
    hkNavItem(W("account"), "login"),
  ]);
}

function houseFooter() {
  return el("footer", { class: "hk-footer" }, [
    el("div", { class: "hk-footer-nav" }, [
      webLink(W("tenancy"), () => goWeb("rules")),
      " | ",
      webLink(W("newsCenter"), () => goWeb("news")),
      " | ",
      webLink(W("about"), () => goWeb("about")),
      " | ",
      webLink(W("forum"), () => goWeb("forum")),
      " | ",
      webLink(W("account"), () => goWeb("login")),
    ]),
    el("div", { class: "hk-footer-lines" }, [
      el("p", {}, [W("footCorp")]),
      el("p", {}, [W("foot1")]),
      el("p", {}, [W("foot2")]),
      el("p", {}, [W("foot3")]),
    ]),
  ]);
}

function crumb(parts) {
  const kids = [];
  parts.forEach((p, i) => {
    if (i) kids.push("  ›  ");
    if (p.go) kids.push(webLink(p.text, p.go));
    else kids.push(el("span", {}, [p.text]));
  });
  return el("div", { class: "crumb" }, kids);
}

function backLink(label, fn) {
  return el("p", { class: "fine back-link" }, [webLink(["« 返回", label], fn)]);
}

function siteNotice(meta, kids) {
  return el("div", { class: "site-msg" }, [
    el("p", { class: "mail-meta" }, [meta]),
  ].concat(kids));
}

function houseShell(bodyKids, trail) {
  const wrap = el("div", { class: "hk-site" });
  wrap.append(houseHeader(), houseNav());
  if (trail) wrap.append(crumb(trail));
  const parent = trail && trail.length >= 2 ? trail[trail.length - 2] : null;
  const body = parent && parent.go
    ? [backLink(parent.text, parent.go)].concat(bodyKids)
    : bodyKids;
  wrap.append(el("div", { class: "site-body hk-body" }, body));
  wrap.append(houseFooter());
  return wrap;
}

function sideBox(title, kids) {
  return el("aside", { class: "side-box" }, [el("h3", {}, [title])].concat(kids));
}

/** 墙簿侧栏：绿灰系，不与廿八屋 side-box 共用。 */
function wallSideBox(title, kids) {
  return el("aside", { class: "wall-side" }, [el("h3", {}, [title])].concat(kids));
}

function wallKv(rows) {
  return el("table", { class: "wall-kv" }, rows.map(([k, v]) =>
    el("tr", {}, [el("th", {}, [k]), el("td", {}, [Array.isArray(v) ? v : [v]])])
  ));
}

function viewHome() {
  const input = el("input", { type: "search", value: S.query, maxlength: "40" });
  input.addEventListener("input", () => { S.query = input.value; });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
  const chips = el("div", { class: "hot-chips" }, [
    el("span", {}, [W("hotDist")]),
    ...["元朗", "荃湾", "屯门", "大角咀", "湾仔", "北角"].map((d) =>
      webLink(d, () => {
        S.query = d;
        doSearch();
      }, "chip")
    ),
  ]);
  const latest = el("div", { class: "mini-list" }, homeLatest().map((l) =>
    el("button", {
      type: "button",
      class: "mini-row",
      onclick: () => {
        if (needPostFirst()) return;
        flag("searched", true);
        goWeb("detail", { listing: l.id });
      },
    }, [
      el("span", {}, [Ty(l, "title")]),
      el("b", {}, [rentLabel(l)]),
    ])
  ));
  const news = el("div", { class: "mini-list" }, newsIds(5).map((id) => newsLink(id, true)));
  const mainKids = [chips];
  // 两条分支从前正文一字不差。底下那条更糟：藤先生还没回，也说「有新回复」，
  // 她点进去看见自己那帖底下空着——提示在替网站撒谎。没人回就写没人回。
  if (postedHelp() && helpRepliesOpen() && !(typeof noted === "function" && noted("bbs-self"))) {
    mainKids.unshift(siteNotice(T("讨论区通知", "论坛通知"), [
      el("p", { class: "notice-line" }, [
        T("你在「求助」的帖子有新回复。", "你在「求助」的帖子有新回复。"),
        webLink(T("查看帖子", "查看帖子"), () => goWeb("thread", { forumId: "helpzhang" })),
      ]),
    ]));
  } else if (postedHelp() && !flag("sawOwnPost")) {
    mainKids.unshift(siteNotice(T("讨论区通知", "论坛通知"), [
      el("p", { class: "notice-line" }, [
        T("你的帖子还在，暂时没有人回。", "你的帖子还在，暂时没有人回复。"),
        webLink(T("查看帖子", "查看帖子"), () => goWeb("thread", { forumId: "helpzhang" })),
      ]),
    ]));
  }
  const freshHome = unreadSerial();
  if (freshHome) {
    const t = THREADS[freshHome];
    mainKids.unshift(siteNotice(T("杂谈有新回复", "闲聊有新回复"), [
      el("p", {}, [
        webLink(Ty(t, "title"), () => goWeb("thread", { forumId: freshHome })),
      ]),
    ]));
  }
  if (flag("askedOld") && replyReady() && !flag("sawMail")) {
    mainKids.unshift(siteNotice(W("inbox"), [
      el("p", { class: "notice-line" }, [
        T("周先生回复了你。", "周先生回复了你。"),
        webLink(T("查看", "查看"), () => goWeb("inbox")),
      ]),
    ]));
  }
  const main = el("div", { class: "hk-main search-hero" }, [
    ...mainKids,
    el("h1", {}, [W("searchRent")]),
    el("div", { class: "search-row" }, [
      input,
      el("button", { type: "button", class: "btn", onclick: doSearch }, [W("search")]),
    ]),
    // 「最近搜过」从前是一行「元朗　天水围／荃湾　新楼／大角咀　套房」：
    // 三笔不同的搜寻用全角空格和斜线拼在一条线上，只有机器看得顺。拆成三行，点一下重搜。
    el("div", { class: "recent-searches" }, [
      el("span", { class: "recent-h" }, [W("recentSearch")]),
      ...["元朗 天水围", "荃湾 新楼", "大角咀 套房"].map((q) =>
        webLink(q, () => {
          S.query = q;
          doSearch();
        }, "recent-q")),
    ]),
    el("div", { class: "home-grid" }, [
      el("section", {}, [el("h2", { class: "sec-h" }, [W("latest")]), latest]),
      el("section", {}, [el("h2", { class: "sec-h" }, [W("siteNews")]), news]),
    ]),
  ]);
  const side = el("div", { class: "hk-side" }, [
    sideBox(W("tipTitle"), [
      el("p", {}, [W("tip1")]),
      el("p", {}, [W("tip2")]),
      webLink(W("tipLink"), () => goWeb("rules")),
    ]),
    sideBox(W("maybeLike"), [
      postedHelp()
        ? webLink(W("helpPost"), () => goWeb("thread", { forumId: "helpzhang" }))
        : webLink(W("freePost"), () => goWeb("post")),
      el("br"),
      webLink(W("yuenThread"), () => goWeb("thread", { forumId: "yuenlong" })),
      el("br"),
      webLink(W("urbNews"), () => goWeb("newsitem", { newsId: "urb" })),
    ]),
  ]);
  const wrap = houseShell([el("div", { class: "hk-layout" }, [main, side])], [
    { text: W("home") },
  ]);
  setTimeout(() => input.focus(), 0);
  return wrap;
}

function listingShort(l) {
  return l.title.split(" ").slice(0, 2).join("");
}

function markOwnSearch() {
  const q = (S.query || "").trim();
  if (q && q !== "元朗 天水围") flag("ownSearch", true);
}

function doSearch() {
  if (needPostFirst()) return;
  flag("searched", true);
  markOwnSearch();
  goWeb("list", { search: true });
  if ((S.query || "").trim() && !filtered().length) showPrompt(W("emptySearch"), W("emptySearchBody"));
}

function listFilterBar() {
  return el("div", { class: "list-filters" }, [
    [W("all"), "all"],
    [W("ownerLet"), "owner"],
    [W("share"), "share"],
    [W("estate"), "estate"],
  ].map(([label, id]) => el("button", {
    type: "button",
    class: "filter-chip" + ((S.listFilter || "all") === id ? " on" : ""),
    onclick: () => {
      S.listFilter = id;
      flag("searched", true);
  draw();
    },
  }, [label])));
}

function districtBar() {
  return el("div", { class: "district-grid compact" }, HK_DISTRICTS.map((d) =>
    el("button", {
      type: "button",
      class: "dist" + (districtSelected(d) ? " dist-on" : ""),
      onclick: () => {
        // 地区与上面那排类型是「与」的关系，点地区不该动类型。
        // 从前这一行写着 S.listFilter = "all"：先点「房东直租」再点地区，
        // 类型就被悄悄清回「全部」，筛出来的盘也跟着变了——看着像页面自己跳回去。
        // 同一个地区再点一次也不重写查询串：她已经打进去的字别丢。
        if (!districtSelected(d)) S.query = d;
        flag("searched", true);
        markOwnSearch();
        draw();
      },
    }, [d])
  ));
}

function viewList() {
  if (!postedHelp()) {
    S.screen = "post";
    return viewPost();
  }
  const rows = filtered();
  const input = el("input", { type: "search", value: S.query, maxlength: "40" });
  input.addEventListener("input", () => { S.query = input.value; });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
    const cards = el("div", { class: "cards" });
  if (!(S.query || "").trim()) {
    cards.append(el("p", { class: "hint" }, [W("searchHint")]));
  } else if (!rows.length) {
    cards.append(el("p", { class: "hint" }, [W("noMatch")]));
  } else {
    rows.forEach((l) => cards.append(listingCard(l)));
  }
  const side = el("div", { class: "hk-side" }, [
    sideBox(W("latest"), [
      el("div", { class: "mini-list" }, homeLatest().map((l) =>
        el("button", {
          type: "button",
          class: "mini-row",
          onclick: () => {
            if (needPostFirst()) return;
            flag("searched", true);
            goWeb("detail", { listing: l.id });
          },
        }, [
          el("span", {}, [Ty(l, "title")]),
          el("b", {}, [rentLabel(l)]),
        ])
      )),
    ]),
  ]);
  const filterLabel = { all: W("all"), owner: W("ownerLet"), share: W("share"), estate: W("estate") }[S.listFilter || "all"] || W("all");
  return houseShell([
    el("div", { class: "list-tools" }, [
      el("div", { class: "search-row" }, [
        input,
        el("button", { type: "button", class: "btn", onclick: doSearch }, [W("search")]),
      ]),
      listFilterBar(),
      el("p", { class: "list-tools-label" }, [W("districts")]),
      districtBar(),
    ]),
    siteNotice(W("rentList"), [
      el("p", {}, [W("listNotice")]),
    ]),
    el("div", { class: "listing-meta" }, [
      [rows.length, T(" 个盘，", " 套房源，"), filterLabel, "，「", S.query || W("all"), "」", W("listMetaBy")],
    ]),
    el("div", { class: "hk-layout" }, [cards, side]),
  ], viewListTrail());
}

function listingCard(l) {
  const title = Ty(l, "title");
  return el("button", {
    class: "card",
    type: "button",
    onclick: () => goWeb("detail", { listing: l.id }),
  }, [
    imgSlot(l.img, "thumb", title),
    el("div", {}, [
      el("h3", {}, [title]),
      el("p", {}, [Ty(l, "sub")]),
      el("p", { class: "card-spec" }, [[Ty(l, "nfa"), " | ", Ty(l, "age"), " | ", Ty(l, "walk"), " | ", T("浏览 ", "浏览 "), l.views]]),
    ]),
    el("div", { class: "rent" }, [rentLabel(l), el("small", {}, [l.agent ? W("agent") : W("ownerLet")])]),
  ]);
}

function fourStuck(l) {
  if (!l || l.id === "ssp" || typeof FOUR === "undefined") return [];
  const name = listingShort(l);
  S.four = S.four || {};
  return FOUR.filter((f) => (S.four[f.id] || []).indexOf(name) >= 0).map((f) => f.text);
}

function isFav(id) {
  return (S.favs || []).includes(id);
}

function favBtn(l) {
  return el("button", {
    class: "btn ghost" + (isFav(l.id) ? " fav-on" : ""),
    type: "button",
    onclick: () => {
      S.favs = S.favs || [];
      if (isFav(l.id)) {
        S.favs = S.favs.filter((x) => x !== l.id);
        draw();
        showPrompt(T("已从我的收藏移除", "已从我的收藏移除"));
      } else {
        S.favs.push(l.id);
        draw();
        showPrompt(T("已加入我的收藏", "已加入我的收藏"), T("右上角「收藏」可再打开", "右上角「收藏」可再打开"));
      }
    },
  }, [isFav(l.id) ? T("已收藏", "已收藏") : W("fav")]);
}

function viewFavs() {
  const rows = (S.favs || []).map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean);
  const cards = el("div", { class: "cards" });
  if (!rows.length) {
    cards.append(el("p", { class: "hint" }, [T("还没有收藏的盘。在放盘页按「收藏」，就会列在这里。", "还没有收藏的房源。在详情页按「收藏」，就会列在这里。")]));
  } else {
    rows.forEach((l) => {
      const stuck = fourStuck(l);
      cards.append(listingCard(l));
      cards.append(el("p", { class: "fine fav-row" }, [
        stuck.length ? el("span", {}, ["卡住：" + stuck.join("、")]) : (l.id === "ssp" && S.known && S.known.rong ? el("span", {}, ["四条都过。"]) : ""),
        webLink(W("unfav"), () => {
          S.favs = S.favs.filter((x) => x !== l.id);
          draw();
        }),
      ]));
    });
  }
  return houseShell([
    el("h2", { class: "sec-h" }, ["我的收藏"]),
    rows.length ? el("p", { class: "fine" }, [rows.length + " 个盘，按收藏先后排列。"]) : "",
    cards,
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "我的收藏" },
  ]);
}

function viewListTrail() {
  const q = (S.query || "").trim();
  let dist = HK_DISTRICTS.find((d) => q === d);
  if (!dist && /旺角|大角咀/.test(q)) dist = "油尖旺";
  if (!dist && q.includes("北角")) dist = "东区";
  if (dist) {
    return [
      { text: "首页", go: () => goWeb("home") },
      { text: "租盘", go: () => { S.query = ""; S.listFilter = "all"; goWeb("list"); } },
      { text: dist },
    ];
  }
  return [
    { text: "首页", go: () => goWeb("home") },
    { text: "租盘" },
  ];
}

function viewDetail() {
  const l = listingById(S.listing);
  if (l.id === "tk") return houseShell([detailTk()], detailCrumb("大角咀 套房"));
  if (l.id === "tw") return houseShell([detailTw()], detailCrumb("荃湾 新楼"));
  if (l.id === "ssp") return houseShell([detailSsp()], detailCrumb("荣汇街 28 号后座"));
  return houseShell([detailGeneric(l)], detailCrumb(l.title));
}

function detailCrumb(name) {
  return [
    { text: W("home"), go: () => goWeb("home") },
    { text: W("rentList"), go: () => goWeb("list") },
    { text: name },
  ];
}

function specTable(rows) {
  return el("table", { class: "kv-table" }, rows.map(([k, v]) =>
    el("tr", {}, [el("th", {}, [k]), el("td", {}, Array.isArray(v) ? v : [v])])
  ));
}

function detailTk() {
  const l = listingById("tk");
  // 业主说的就是业主说的：从前这行尾巴挂着一句「本站不负责订金」，
  // 那是网站的口径，不该从业主嘴里出来。
  const bodyY = "最短租约一年。约睇楼要先过一个月订金，唔过订唔约。";
  const bodyZ = "最短租约一年。预约看房要先交一个月订金，不交订不约。";
  const body = T(bodyY, bodyZ);
  return el("div", { class: "detail hk-detail" }, [
    imgSlot(l.img, "photo-lg", Ty(l, "title")),
    el("div", { class: "kv" }, [
      el("h2", {}, [Ty(l, "title")]),
      el("p", { class: "rent-line" }, [rentLabel(l)]),
      el("p", { class: "fine" }, [T("编号", "编号"), " 28WU-20140729-011"]),
      specTable([
        [T("地区", "地区"), l.area],
        [T("面积", "面积"), Ty(l, "nfa")],
        [T("楼龄", "楼龄"), Ty(l, "age")],
        [T("交通", "交通"), Ty(l, "walk")],
        [T("租约", "租约"), T("最短一年", "最短一年")],
        [T("睇楼", "看房"), T("须先过一个月订金", "须先交一个月订金")],
        [T("放盘", "发布"), [l.date, "，", T("浏览", "浏览"), " ", l.views]],
        [T("业主", "房东"), l.owner],
      ]),
      el("p", {}, [T("上手住客评语只剩一句：「夜里听得到隔壁。」天花有水渍。相片是空房。", "上一位住客评语只剩一句：「夜里能听到隔壁。」天花板有水渍。照片是空房。")]),
      el("p", { class: "fine" }, [T("地点近奥海城，空房可即睇——条款写在上面。", "地点近奥海城，空房可即看——条款写在上面。")]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn", type: "button",         onclick: () => {
          countViewTry(l.id);
          strikeFour(bodyY, listingShort(l));
          showPrompt(T("业主已回覆", "房东已回复"), body);
        } }, [W("bookView")]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, [W("backList")]),
        favBtn(l),
      ]),
    ]),
  ]);
}

function detailTw() {
  const l = listingById("tw");
  const bodyY = "在职证明、担保人。两样齐了再约。周租不做。";
  const bodyZ = "在职证明、担保人资料。两样齐了再约。按周付租不做。";
  return el("div", { class: "detail hk-detail" }, [
    imgSlot(l.img, "photo-lg", Ty(l, "title")),
    el("div", { class: "kv" }, [
      el("h2", {}, [Ty(l, "title")]),
      el("p", { class: "rent-line" }, [rentLabel(l)]),
      el("p", { class: "fine" }, [T("编号", "编号"), " 28WU-20140730-088，", W("agent")]),
      specTable([
        [T("地区", "地区"), l.area],
        [T("面积", "面积"), Ty(l, "nfa")],
        [T("入伙", "入住"), Ty(l, "age")],
        [T("交通", "交通"), Ty(l, "walk")],
        [T("按金", "押金"), T("两个月按金 + 一个月上期", "押二付一")],
        [T("资格", "资格"), T("要担保人、要粮单", "要担保人、要工资单")],
        [T("放盘", "发布"), T("地产代理代放", "中介代发")],
      ]),
      el("p", {}, [T("管理处日间有人。本盘不接受周租。", "物业处白天有人。本盘不接受按周付租。")]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn",
          type: "button",
          onclick: () => {
            countViewTry(l.id);
            strikeFour(bodyY, listingShort(l));
            showPrompt(T("代理已回覆", "中介已回复"), T(bodyY, bodyZ));
          },
        }, [W("bookView")]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, [W("backList")]),
        favBtn(l),
      ]),
    ]),
  ]);
}

function detailGeneric(l) {
  const rows = [
    [T("地区", "地区"), l.district + "／" + l.area],
    [T("面积", "面积"), Ty(l, "nfa")],
    [T("楼龄", "楼龄"), Ty(l, "age")],
    [T("交通", "交通"), Ty(l, "walk")],
    [T("放盘", "发布"), [l.date, "，", T("浏览", "浏览"), " ", l.views]],
    [T("业主", "房东"), l.owner],
  ].concat((l.specs || []).map(([k, v]) => [k, v]));
  const kids = [
    imgSlot(l.img, "photo-lg", Ty(l, "title")),
    el("div", { class: "kv" }, [
      el("h2", {}, [Ty(l, "title")]),
      el("p", { class: "rent-line" }, [rentLabel(l)]),
      el("p", { class: "fine" }, [T("编号", "编号"), " ", l.code, "，", l.agent ? W("agent") : W("ownerLet")]),
      specTable(rows),
      el("p", {}, [Ty(l, "blurb")]),
      el("p", { class: "fine" }, [T("本站不负责口头协议。条款以业主或代理回覆为准。", "本站不负责口头协议。条款以房东或中介回复为准。")]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn",
          type: "button",
          onclick: () => {
            countViewTry(l.id);
            strikeFour(l.failBody, listingShort(l));
            showPrompt(Ty(l, "failTitle") || T("已回覆", "已回复"), Ty(l, "failBody"));
          },
        }, [W("bookView")]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, [W("backList")]),
        favBtn(l),
      ]),
    ]),
  ];
  return el("div", { class: "detail hk-detail" }, kids);
}

function detailSsp() {
  S.known = S.known || {};
  S.known.rong = true;
  const l = listingById("ssp");
  const remark = el("textarea", { class: "note-box" });
  remark.value = S.remark;
  remark.addEventListener("input", () => { S.remark = remark.value; });
  return el("div", { class: "detail hk-detail" }, [
    imgSlot(l.img, "photo-lg", l.title),
    el("div", { class: "kv" }, [
      el("h2", {}, [l.title]),
      el("p", { class: "rent-line" }, [rentLabel(l)]),
      el("p", { class: "fine" }, ["编号 28WU-20140728-004，业主自让"]),
      specTable([
        ["地址", "九龙深水埗荣汇街 28 号 4 楼后座"],
        ["面积", l.nfa + "／建筑约 380 呎（业主自报，未量）"],
        ["楼龄", l.age + "，无电梯，铁窗"],
        ["交通", l.walk],
        ["同层", "业主自住前座。后座独立厨厕。"],
        ["放盘", l.date + "，浏览 " + l.views],
      ]),
      el("p", { class: "notice-line" }, [
        el("span", {}, ["业主"]),
        webLink("周先生", () => goWeb("landlord")),
        el("span", {}, ["独居"]),
        el("span", {}, ["自己放盘"]),
        el("span", {}, ["上次上线 " + (flag("sawMail") ? "08-01 09:12" : "07-28 22:17")]),
        el("span", {}, ["浏览 " + l.views]),
      ]),
      sspRented() ? siteNotice("盘源状态", [el("p", {}, ["业主已标示：已租出（08-01）。"])]) : "",
      el("div", { class: "actions" }, [
        sspRented() ? "" : el("button", { class: "btn", type: "button", onclick: () => {
          if (!flag("sawMail")) countViewTry(l.id);
          goViewing(false);
        } }, [
          flag("sawMail") ? W("goViewing") : W("bookView"),
        ]),
        sspRented() ? "" : el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("pm") }, [W("writePm")]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("landlord") }, [W("landlord")]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, [W("backList")]),
        favBtn(l),
      ]),
      el("h3", { class: "sec-h" }, ["屋况（业主原文）"]),
      el("p", {}, ["唐楼，行到地铁。屋内仍有家人旧物，不介意者优先。可即时入住。储物室上锁，钥匙业主收，不入租。后楼梯通往天台，住客可用。"]),
      el("h3", { class: "sec-h" }, ["交易条款"]),
      el("p", {}, ["现金。口头。无印花。月租三千二，可按周交，可即日计。无地产佣金。"]),
      el("p", { class: "fine" }, ["本站不负责口头协议。详见", webLink("租务须知", () => goWeb("rules")), "。"]),
      el("h3", { class: "sec-h" }, ["照片说明"]),
      el("p", {}, ["业主上载相片 1 张（07-28）。本站不对相片内容作审核。"]),
      el("h3", { class: "sec-h" }, ["地区资讯"]),
      el("p", { class: "fine" }, [
        "深水埗指定范围仍列于市区重建研究。公开咨询暂写八月下旬。",
        webLink("相关新闻", () => goWeb("newsitem", { newsId: "urb" })),
      ]),
        el("h3", { class: "sec-h" }, ["盘源留言板"]),
      ...sspBoardLines(),
      el("label", { class: "remark-label" }, ["备注（仅自己可见）", remark]),
    ]),
  ]);
}

function sspBoardLines() {
  const seen = S.view || {};
  const lines = [
    el("p", { class: "bbs-line" }, ["过路人　07-29：「厅角嗰架车系卖屋送定自己留？」"]),
  ];
  if (S.boardCar) lines.push(el("p", { class: "bbs-line mine" }, ["阿琪V：「自己留。唔送。」"]));
  else if (seen.car) lines.push(el("p", { class: "bbs-act" }, [
    webLink("回一句：自己留。", () => {
      S.boardCar = true;
      note("board-car", "放盘留言我回过：厅角那架车自己留，不送。");
      draw();
    }),
  ]));
  lines.push(el("p", { class: "bbs-line" }, ["深水埗住开　07-30：「问清楚周租点计，同埋锁住嗰间入唔入租。」"]));
  if (S.boardDoor) lines.push(el("p", { class: "bbs-line mine" }, ["阿琪V：「门锁住。包租，入唔到。」"]));
  else if (seen.door) lines.push(el("p", { class: "bbs-act" }, [
    webLink("回一句：门锁住，入唔到。", () => {
      S.boardDoor = true;
      note("board-door", "放盘留言我回过：锁住那间包在租里，进不去。");
      draw();
    }),
  ]));
  return lines;
}

function sspRented() {
  return S.level >= 3;
}

function pmDraftText() {
  return Ts(
    "周生，荣汇街 28 号 4 楼后座，我想预约睇楼。现金、口头得。我需要一个能住的地方。听日下昼得唔得？",
    "周先生，荣汇街 28 号 4 楼后座，我想预约看房。现金、口头就行。我需要一个能住的地方。明天下午可以吗？"
  );
}

function replyReady() {
  return flag("askedOld") && storyDay() >= 801;
}

function reachMorning() {
  setTime("2014年8月1日 周五 09:12");
  S.talk = null;
  S.wait = null;
  S.paused = null;
  S.mode = "web";
  S.tab = "house";
  S.screen = "home";
  draw();
}

function sendPm() {
  const text = (S.pmBody || "").trim();
  if (!text) {
    showPrompt("请填写讯息内容");
    return;
  }
  if (flag("askedOld")) return;
  sfx("send");
  S.pmSent = text;
  flag("askedOld", true);
  // 他没在线。这一夜她没回表姐（22:48「沙发留住」她没回），去快餐店坐了一晚。
  waitWeek(
    "2014年7月31日 周四 23:14",
    "他夜间不在线。",
    "你坐到天亮。",
    reachMorning,
    { plate: pic(1, "场景-过场-快餐店"), lum: 0.34, place: "rong-street" }
  );
}

function viewPm() {
  if (sspRented()) {
    return houseShell([
      el("h2", { class: "sec-h" }, [W("writePmTitle")]),
      siteNotice("盘源已租出", [
        el("p", {}, ["荣汇街 28 号后座已租出。本盘留言已关闭。"]),
        el("p", {}, [webLink("打开站内留言", () => goWeb("inbox"))]),
      ]),
    ], [
      { text: "首页", go: () => goWeb("home") },
      { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
      { text: "写留言" },
    ]);
  }
  if (flag("askedOld")) {
    const ready = replyReady();
    const read = flag("sawMail");
    return houseShell([
      el("h2", { class: "sec-h" }, [W("writePmTitle")]),
      siteNotice(read ? "已回复" : (ready ? "有新回复" : "待回复"), [
        el("p", {}, [read
          ? "周先生已回复。到站内留言看过，再赴约睇楼。"
          : ready
            ? "周先生有新回复。"
            : "这条已送给周先生。他夜间不在线，回复会留在站内留言。"]),
        el("p", {}, [webLink("打开站内留言", () => goWeb("inbox"))]),
      ]),
    ], [
      { text: "首页", go: () => goWeb("home") },
      { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
      { text: "写留言" },
    ]);
  }
  if (!S.pmBody) S.pmBody = pmDraftText();
  const box = el("textarea", { class: "note-box", maxlength: "400" });
  box.value = S.pmBody;
  box.addEventListener("input", () => { S.pmBody = box.value; });
  return houseShell([
    el("h2", { class: "sec-h" }, [W("writePmTitle")]),
    el("p", { class: "mail-meta mail-meta-row" }, [
      el("span", {}, ["收件人：周先生"]),
      el("span", {}, ["主旨：荣汇街 28 号后座，预约睇楼"]),
    ]),
    el("p", { class: "hint" }, ["业主夜间常不在线，回复要到翌日上午才送到。"]),
    el("label", {}, ["留言正文", box]),
      el("div", { class: "actions" }, [
      el("button", { class: "btn", type: "button", onclick: sendPm }, ["送出"]),
      el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["取消"]),
    ]),
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
    { text: "写留言" },
  ]);
}

function viewInbox() {
  if (replyReady() && !flag("sawMail")) {
    flag("sawMail", true);
    note("zhou-reply", "周先生回了留言。今日下昼，他在。");
  }
  const body = [];
  body.push(
    el("h2", { class: "sec-h" }, ["站内留言"]),
    el("p", { class: "fine" }, ["廿八屋会员留言。对方上线后才会看到。"])
  );
  if (flag("sawMail")) {
    body.push(
      el("div", { class: "site-msg pending" }, [
        el("p", { class: "mail-meta mail-meta-row" }, [
          el("span", { class: "mm-when" }, ["07-31 23:14"]),
          el("span", {}, ["你 → 周先生"]),
          el("span", { class: "mm-sub" }, ["预约睇楼"]),
        ]),
        el("div", { class: "mail-body" }, [S.pmSent || pmDraftText()]),
      ]),
      el("div", { class: "site-msg in" }, [
        el("p", { class: "mail-meta mail-meta-row" }, [
          el("span", { class: "mm-when" }, ["08-01 09:12"]),
          el("span", {}, ["周先生"]),
          el("span", { class: "mm-sub" }, ["回复了你"]),
        ]),
        // 他只回这一句。旧嘢那句放到看房时当面说——留言里先交代一遍，
        // 等于把后面的戏提前讲完，见面再讲就成复读。短到近乎冷淡，才是这个人。
        el("div", { class: "mail-body" }, ["今日下昼得。我喺度等。"]),
      ]),
      el("div", { class: "actions" }, [
        sspRented() ? "" : el("button", { class: "btn", type: "button", onclick: () => goViewing(true) }, ["赴约看房"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["返回荣汇街后座"]),
      ])
    );
  } else if (flag("askedOld")) {
    body.push(
      el("div", { class: "site-msg pending" }, [
        el("p", { class: "mail-meta mail-meta-row" }, [
          el("span", { class: "mm-when" }, ["07-31 23:14"]),
          el("span", {}, ["你 → 周先生"]),
          el("span", { class: "mm-sub" }, ["未读"]),
        ]),
        el("div", { class: "mail-body" }, [S.pmSent || pmDraftText()]),
        el("p", { class: "hint" }, ["对方状态：不在线。请勿重复发送。"]),
      ])
    );
  } else {
    body.push(el("p", {}, ["没有新的站内留言。"]));
    if (S.known && S.known.rong && !sspRented()) {
      body.push(el("p", {}, [webLink("写给周先生", () => goWeb("pm"))]));
    }
    body.push(el("p", { class: "hint" }, ["在放盘页联络业主。口头租约请自行承担。"]));
  }
  return houseShell(body, [
    { text: "首页", go: () => goWeb("home") },
    { text: "站内留言" },
  ]);
}

function viewForum() {
  const order = ["wk3", "wk2", "wk1"];
  const ids = Object.keys(THREADS).filter(threadVisible);
  ids.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  const rows = ids.map((id) => {
    const t = THREADS[id];
    const replies = threadReplies(id);
    const last = replies.length ? replies[replies.length - 1] : null;
    const who = last ? last.user : t.user;
    const when = last ? last.time : threadTime(id);
    const prev = last ? forumPreview(Ty(last, "body")) : "";
    return el("button", {
      type: "button",
      class: "forum-row" + (t.user === "阿琪V" ? " forum-mine" : "") + (threadFresh(id) ? " fresh" : ""),
      onclick: () => goWeb("thread", { forumId: id }),
    }, [
      el("span", { class: "board" }, [boardLabel(t.board)]),
      el("span", { class: "forum-main" }, [
        el("span", { class: "ftitle" }, [Ty(t, "title")]),
        prev ? el("span", { class: "fprev" }, [T("末回：", "末回："), prev]) : "",
      ]),
      el("span", { class: "fmeta" }, [
        el("span", { class: "fwho" }, [
          el("span", {}, [who]),
          el("span", {}, [when]),
        ]),
        el("span", { class: "fpages", "aria-hidden": "true" }, [forumPageMarks(replies.length)]),
      ]),
    ]);
  });
  const kids = [
    el("h2", { class: "sec-h" }, [W("forum")]),
    el("p", { class: "hint" }, [T("公开版面。请勿留下电话、住址及银行户口。", "公开版面。请勿留下电话、住址及银行账户。")]),
  ];
  if (postedHelp()) {
    const hp = THREADS.helpzhang;
    const n = threadReplies("helpzhang").length;
    kids.push(siteNotice(flag("sawOwnPost") ? W("myPost") : T("我的帖子（有新回复）", "我的帖子（有新回复）"), [
      el("p", {}, [
        webLink(Ty(hp, "title"), () => goWeb("thread", { forumId: "helpzhang" })),
        "，", boardLabel(hp.board), T("，回复 ", "，回复 "), n,
      ]),
    ]));
  }
  const fresh = unreadSerial();
  if (fresh) {
    const t = THREADS[fresh];
    kids.push(siteNotice(T("杂谈有新回复", "闲聊有新回复"), [
      el("p", {}, [
        webLink(Ty(t, "title"), () => goWeb("thread", { forumId: fresh })),
        "，" + threadTime(fresh),
      ]),
    ]));
  }
  kids.push(el("div", { class: "forum-list" }, rows));
  return houseShell(kids, [{ text: W("home"), go: () => goWeb("home") }, { text: W("forum") }]);
}

function viewThread() {
  if (S.forumId === "helpzhang" && !postedHelp()) {
    return viewPost();
  }
  const tid = THREADS[S.forumId] ? S.forumId : "stamp";
  const t = THREADS[tid];
  markHouseThread(tid);
  const replies = threadReplies(tid);
  if (S.forumId === "helpzhang") {
    flag("sawOwnPost", true);
    if (replies.some((r) => r.user === "藤先生")) {
      note("bbs-self", "藤先生回了我的求助帖。丢了个荣汇街的盘连结。");
      if (flag("sawLinAd")) note("same-name", "墙上和帖里是同一个名字。");
    }
  }
  if (S.forumId === "wk1") {
    flag("sawWk1", true);
    note("serial1", "第一帖底下，藤先生没有再回。");
  }
  if (S.forumId === "wk2") {
    flag("sawWk2", true);
    if (replies.some((r) => r.user === "藤先生")) note("serial2", "第二帖底下，藤先生只留一句：下星期再讲。");
  }
  if (S.forumId === "wk3") {
    flag("sawWk3", true);
    note("serial3", "第三帖底下，藤先生还是没出声。");
  }
  const floorBlock = (no, metaKids, bodyKids) => el("div", { class: "mail-body floor" }, [
    el("p", { class: "mail-meta floor-head" }, [
      el("span", { class: "floor-no" }, ["#" + no]),
      // 每段自带一格：字符串会被 flex 并成一个匿名项，间距就丢了
      ...metaKids.map((k) => (typeof k === "string" ? el("span", {}, [k]) : k)),
    ]),
    ...bodyKids,
  ]);
  const replyNodes = replies.map((r, i) => {
    const bodyKids = [el("p", {}, [Ty(r, "body")])];
    if (r.listing) {
      bodyKids.push(el("p", {}, [
        webLink(T("连结：深水埗荣汇街 28 号 4 楼后座", "链接：深水埗荣汇街 28 号 4 楼后座"), () => goWeb("detail", { listing: r.listing })),
      ]));
    }
    return floorBlock(i + 2, [r.user, T("回复于 ", "回复于 "), r.time], bodyKids);
  });
  return houseShell([
    el("h2", { class: "sec-h thread-h" }, [
      el("span", { class: "board" }, [boardLabel(t.board)]),
      " ",
      Ty(t, "title"),
    ]),
    floorBlock(1, [t.user, T("发表于 ", "发表于 "), threadTime(tid)], [
      el("p", {}, [Ty(t, "body")]),
    ]),
    el("p", { class: "fine" }, [T("回复（", "回复（"), replies.length, "）"]),
    ...replyNodes,
  ], [
    { text: W("home"), go: () => goWeb("home") },
    { text: W("forum"), go: () => goWeb("forum") },
    { text: Ty(t, "title") },
  ]);
}

function viewRules() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["租务须知（摘录）"]),
    el("p", { class: "mail-meta" }, ["最后修订：2012年3月。一般说明，并非法律意见。"]),
    el("h3", { class: "sec-h" }, ["一、印花税"]),
    el("p", {}, ["租约应按《印花税条例》加盖印花。口头谈妥、之后补书面纪录的，原则上仍要盖。未加盖的文书一旦闹上法庭，可能不被接纳为证据。由哪一方付，双方自己约定。"]),
    el("h3", { class: "sec-h" }, ["二、口头协议"]),
    el("p", {}, ["双方若已就租金、年期及交收达成一致，即使未签书面租约，在香港亦可构成租住权。举证则视乎交租纪录、讯息往来、证人等。本站仍建议尽量书面写明起租日、通知期及交租方式。"]),
    el("h3", { class: "sec-h" }, ["三、业主自让与本站角色"]),
    el("p", {}, ["「业主自让」指业主自行放盘，不经地产代理。睇楼、议价、交钥匙、收按金均由双方直接安排。本站只提供分类广告，不代收款项，不保证盘源，不对成交负责。"]),
    // 这一段原有一句「市场常见为两个月按金加一个月上期」，首页侧栏那条提示
    // 说的是同一件事——同一页里讲两遍，就只剩一遍的分量。删掉。
    el("p", {}, ["交租方式（月结、周结、转账或现金）由双方约定。亦有业主按周计租。即日交收钥匙并不罕见，仍建议先点齐屋况并拍照。"]),
    el("h3", { class: "sec-h" }, ["四、出租范围与屋内物件"]),
    el("p", {}, ["租约应列明出租范围（例如整层、后座、套房）。阁楼、工人房、储物室、天台、后楼梯等若未写进合约，一般不视为租客专用范围。屋内家具、杂物、私人用品如非订明随楼附送，产权仍属业主；搬入前宜与业主点齐。"]),
    // 页脚每页都写着「成交前建议咨询律师」，这里不必再说一次。
    el("p", { class: "fine" }, ["本页如与现行法例不符，以法例为准。"]),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "租务须知" }]);
}

function viewNews() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["新闻中心"]),
    el("p", { class: "hint" }, ["转载及节录，不代表本站立场。详情以原文为准。"]),
    el("div", { class: "forum-list" }, newsIds().map((id) => newsLink(id, false))),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "新闻中心" }]);
}

function applyNewsNotes(id) {
  const kept = {
    mud: ["web-zhou", "2012年9月。妻儿遇难。周说是天意。土木署：雨后斜坡失稳。", "zhou"],
    urb: ["web-ura", "荣汇街在研究名单。业主将获补偿。"],
    kimon: ["kimon-bio", "网上履历：罗启明，维港大学医科，二〇〇五年毕业。没有二〇〇四年。没有十一月。", "luo"],
    yu04: ["yu-old", "校报旧闻：二〇〇四年十一月，女学生坠楼。名字涂掉，露出一个鱼。男友姓罗。", "luo"],
  }[id];
  if (!kept) return;
  note(kept[0], kept[1], kept[2]);
  if (hasEvidence("news-mud") && hasEvidence("news-urb")) {
    note("twofiles", "两篇都看完。更乱。");
  }
  if (hasEvidence("news-kimon") && hasEvidence("news-yu04")) {
    note("fish-cv", "履历干净，校报对不上。十一月那件事另有隐情。");
  }
}

function openNewsDiary(id) {
  const n = NEWS[id];
  if (!n) return;
  const item = {
    id: "news-" + id,
    kind: "新闻",
    title: n.title,
    time: n.date,
    body: n.body,
  };
  showClueModal(item, {
    canFile: !hasEvidence(item.id),
    onFile: () => applyNewsNotes(id),
    onClose: () => goWeb("newsitem"),
  });
}

function viewNewsItem() {
  const id = S.newsId || "urb";
  const n = NEWS[id] || NEWS.urb;
  S.newsSeen = S.newsSeen || {};
  S.newsSeen[id] = true;
  const canKeep = ((id === "mud" || id === "urb") && S.level >= 14)
    || (id === "urb" && !!flag("uraGate"))
    || ((id === "kimon" || id === "yu04") && typeof flag === "function" && flag("askedFishLuo"));
  return houseShell([
    el("h2", { class: "sec-h" }, [n.title]),
    el("p", { class: "mail-meta" }, [n.date + "，来源：本站编辑部／公开文件节录"]),
    el("div", { class: "mail-body" }, [n.body]),
    id === "urb" && flag("uraGate") && !hasEvidence("news-urb")
      ? el("p", { class: "hint" }, ["这一条我得留下。光看过，回头就记不清了。"])
      : "",
    canKeep ? el("div", { class: "actions" }, [
        el("button", {
          type: "button",
        class: "btn" + (hasEvidence("news-" + id) ? " ghost" : ""),
        onclick: () => openNewsDiary(id),
      }, [hasEvidence("news-" + id) ? "已记下" : "记下来"]),
    ]) : "",
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "新闻中心", go: () => goWeb("news") },
    { text: n.title },
  ]);
}

function viewLogin() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["账户"]),
    el("p", {}, ["你已登入：章慧琪（vicky_c，注册 2013）"]),
    el("p", {}, ["上次登入：" + (clockHasHm() ? webAgo(new Date(clockDate().getTime() - 4 * 60000)) : "今天") + "（IP 已隐藏）"]),
    el("p", { class: "hint" }, ["此浏览器已记住登入状态。"]),
    postedHelp()
      ? siteNotice("刊登记录", [
        el("p", { class: "notice-line" }, [
          "求助帖 1 篇。"
            + (flag("serial1") ? "杂谈 " + ["serial1", "serial2", "serial3"].filter((k) => flag(k)).length + " 篇。" : ""),
          webLink("到讨论区查看", () => goWeb("forum")),
        ]),
      ])
      : "",
        el("button", {
          class: "btn ghost",
          type: "button",
      onclick: blockedLogout,
    }, ["登出"]),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "账户" }]);
}

function publishSerial() {
  const id = S.pendingPost;
  if (!THREADS[id]) return;
  pinSerial(id);
  if (id === "wk1") flag("serial1", true);
  if (id === "wk2") flag("serial2", true);
  if (id === "wk3") flag("serial3", true);
  S.pendingPost = "";
  clearSlate();
  showModal("提示", "已收到你的刊登。", "", "prompt", S.paused ? closeRental : () => draw());
}

function viewSerialDraft() {
  const t = THREADS[S.pendingPost];
  const board = T(t.board, ({ 求助: "求助", 租务: "租房", 地区: "地区", 杂谈: "闲聊" })[t.board] || t.board);
  return houseShell([
    el("h2", { class: "sec-h" }, [W("forum") + "／" + board]),
    el("p", { class: "hint" }, [W("draftHint")]),
    el("p", { class: "mail-meta" }, [T("版块：", "版块："), board, T("，署名：", "，署名："), "阿琪V"]),
    el("div", { class: "post-draft" }, [
      el("h3", { style: "margin:0 0 8px;font-size:15px;color:#1f4f96" }, [Ty(t, "title")]),
      el("div", { class: "mail-body" }, [Ty(t, "body")]),
    ]),
    el("div", { class: "actions" }, [
      el("button", { class: "btn", type: "button", onclick: publishSerial }, [W("publish")]),
    ]),
  ], [
    { text: W("home"), go: () => goWeb("home") },
    { text: W("forum"), go: () => goWeb("forum") },
    { text: T("发帖", "发帖") },
  ]);
}

function viewPost() {
  if (S.pendingPost && THREADS[S.pendingPost]) return viewSerialDraft();
  const hp = THREADS.helpzhang;
  const board = T(hp.board, ({ 求助: "求助", 租务: "租房", 地区: "地区", 杂谈: "闲聊" })[hp.board] || hp.board);
  if (!postedHelp()) {
    return houseShell([
      el("h2", { class: "sec-h" }, [W("myPost")]),
      el("p", { class: "mail-meta" }, [
        T("版块：", "版块："), board, T("，署名：", "，署名："), "阿琪V", T("，刊登：", "，发布："), hp.time,
      ]),
      el("div", { class: "post-draft" }, [
        el("h3", { style: "margin:0 0 8px;font-size:15px;color:#1f4f96" }, [Ty(hp, "title")]),
        el("div", { class: "mail-body" }, [Ty(hp, "body")]),
      ]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn", type: "button", onclick: publishHelpPost }, [W("bump")]),
      ]),
    ], [{ text: W("home"), go: () => goWeb("home") }, { text: W("myPost") }]);
  }
  return houseShell([
    el("h2", { class: "sec-h" }, [W("myPost") + "／" + W("bump")]),
    siteNotice(T("系统通知", "系统通知"), [
      el("p", {}, [T("已顶帖。求助帖重新排在讨论区「求助」版上方，可查看原文及回复。", "已顶帖。求助帖重新排在论坛「求助」版上方，可查看原文及回复。")]),
      el("p", {}, [webLink(T("查看帖子", "查看帖子"), () => goWeb("thread", { forumId: "helpzhang" }))]),
    ]),
  ], [{ text: W("home"), go: () => goWeb("home") }, { text: W("freePost") }]);
}

function viewLandlord() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["业主档案：周先生"]),
    specTable([
      ["身份", "业主自让，非代理"],
      ["放盘", sspRented() ? "1 个（已租出）" : "1 个（现正上架）"],
      ["上线", flag("sawMail") ? "08-01 09:12" : "07-28 22:17"],
      ["回覆率", "慢。夜间常不在。"],
      ["认证", "未做身份认证"],
    ]),
    el("h3", { class: "sec-h" }, ["简介（自填）"]),
    el("p", {}, ["自己住同层前座。屋有旧嘢，唔介意先好倾。即时可以搬。现金得。"]),
    el("p", { class: "fine" }, ["本会员暂无其他租客评价。"]),
    el("div", { class: "actions" }, [
      el("button", { class: "btn", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["看他的盘"]),
      sspRented() ? "" : el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("pm") }, [W("writePm")]),
    ]),
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
    { text: "周先生" },
  ]);
}

function viewAbout() {
  return houseShell([
    el("h2", { class: "sec-h" }, [W("about")]),
    el("p", {}, [W("aboutBody")]),
    el("p", { class: "fine" }, [W("aboutFine")]),
  ], [{ text: W("home"), go: () => goWeb("home") }, { text: W("about") }]);
}

function wallHeader() {
  const items = [
    [W("wallHome"), "wall"],
    [W("wallMe"), "wall-me"],
    [W("wallFriends"), "wall-friends"],
    [wallCountLabel(W("wallMail"), wallUnread().mail), "wall-mail"],
    [W("wallSet"), "wall-set"],
  ];
  return el("div", { class: "wall-head" }, [
    el("button", { type: "button", class: "wall-logo", onclick: () => goWeb("wall") }, [W("wall")]),
    el("nav", { class: "wall-nav" }, items.map(([label, screen]) =>
      el("button", {
        type: "button",
        class: "wall-nav-item" + (S.screen === screen ? " on" : ""),
        onclick: () => goWeb(screen),
      }, [label])
    )),
  ]);
}

/** 页内「返回墙簿」回到首页，并丢掉这一串墙簿子页，避免浏览器后退又弹回个人页。 */
function wallGoHome() {
  const hist = S.webHist || [];
  while (hist.length) {
    const top = hist[hist.length - 1];
    const scr = String(top.screen || "");
    if (top.tab === "wall" || scr === "ad" || scr.indexOf("wall") === 0) hist.pop();
    else break;
  }
  goWeb("wall", { replace: true });
}

function wallWhoGo(who) {
  return () => (who === "me" ? goWeb("wall-me") : goWeb("wall-user", { wallWho: who }));
}

function wallPost(name, who, text, time, extra, opts) {
  opts = opts || {};
  const actions = extra || (opts.entry ? wallActions(opts.entry) : null) || "";
  const body = opts.entry ? wallNoteParts(text, opts.entry) : [text];
  return el("article", { class: "post" + (opts.fresh ? " fresh" : "") }, [
    el("button", {
      type: "button",
      class: "post-avatar",
      onclick: wallWhoGo(who),
    }, [name.slice(0, 1)]),
    el("div", { class: "post-main" }, [
      el("div", { class: "post-meta" }, [
        el("span", {}, [webLink(name, wallWhoGo(who)), opts.fresh ? el("em", { class: "post-new" }, ["新"]) : ""]),
        el("span", {}, [time]),
      ]),
      el("p", {}, body),
      opts.photo ? el("button", { type: "button", class: "wall-shot", onclick: () => showWallPhoto(opts.photo.cap, opts.photo.id) }, [imgSlot(opts.photo.id, "wall-thumb", opts.photo.cap)]) : "",
      ...(opts.replies || []),
      actions,
    ]),
  ]);
}

/* ---------- 墙簿跟着剧情走：熟人动态、收件箱、藤先生广告 ---------- */

// at：网页时间，钟走过才显示；after：剧情条件；react：条件第一次成立的那一刻起算
// old：开局之前就在墙上，不算新
// answer：「回应」可选的话，各一句；back：对方过一阵回的一句。mute：点「回应」只会打了又删
/* data -> web-data.js: WALL_FEED */

/* data -> web-data.js: WALL_MAIL */

/* data -> web-data.js: WALL_NAMES */

function wallTime(e) {
  if (e.react) {
    if (!e.react()) return null;
    S.wallAt = S.wallAt || {};
    if (!S.wallAt[e.id]) S.wallAt[e.id] = clockDate().getTime();
    return new Date(S.wallAt[e.id]);
  }
  if (e.after && !e.after()) return null;
  return webDate(e.at[0], e.at[1]);
}

function wallShown(list) {
  return list.map((e) => ({ e, t: wallTime(e) })).filter((x) => x.t && webPast(x.t)).sort((a, b) => b.t - a.t);
}

/* 今天的那几条：发在「今天」，有可挑的话，她还没回。
   关卡拿它当必做——回一句才走得了；旧帖照样能回，但不拿它们卡住日子。 */
function wallToday() {
  const today = typeof storyDay === "function" ? storyDay() : 0;
  const dayNum = (s) => {
    const m = /^(\d{2})-(\d{2})$/.exec(String(s || ""));
    return m ? Number(m[1]) * 100 + Number(m[2]) : 0;
  };
  const all = wallShown(WALL_FEED.concat(WALL_MAIL))
    .map((x) => x.e)
    .filter((e) => e.answer && e.answer.length && dayNum(e.at[0]) === today);
  return { all, open: all.filter((e) => !wallMine(e)) };
}

function wallMine(e) {
  return (S.wallReplied && S.wallReplied[e.id]) || null;
}

// back 那句是「对方」说的：别人的帖 → 发帖人回；自己的帖 → 帖下最近一个别人回（如表姐问边度）
function wallBackSpeaker(e) {
  if (e.who && e.who !== "me") {
    return { who: e.who, name: e.name || WALL_NAMES[e.who] || e.who };
  }
  const others = (e.replies || []).filter((r) => r.who && r.who !== "me");
  if (others.length) {
    const r = others[others.length - 1];
    return { who: r.who, name: r.name || WALL_NAMES[r.who] || r.who };
  }
  return null;
}

// 别人的回应 + 我回的那句 + 对方回的一句（钟常常只写「早上」，所以等我离开这页再回来才出现）
function wallReplies(e) {
  const out = (e.replies || []).map((r, i) => ({ r, key: e.id + ":r" + i, t: webDate(r.at[0], r.at[1]) })).filter((x) => webPast(x.t));
  const mine = wallMine(e);
  if (mine) {
    out.push({ r: { who: "me", name: "章慧琪", text: mine.text }, key: e.id + ":me", t: new Date(mine.t) });
    const backWho = mine.back && (S.wallNav || 0) > mine.nav ? wallBackSpeaker(e) : null;
    if (backWho) out.push({ r: { who: backWho.who, name: backWho.name, text: mine.back }, key: e.id + ":back", t: new Date(mine.t + 1) });
  }
  return out.sort((a, b) => a.t - b.t);
}

function wallDrafting(e) {
  return !!(S.wallDraft && e && S.wallDraft.id === e.id);
}

function wallSendAnswer(e, a) {
  if (!a) return;
  S.wallReplied = S.wallReplied || {};
  S.wallReplied[e.id] = { text: a.text, back: a.back || "", t: clockDate().getTime(), nav: S.wallNav || 0 };
  wallMarkSeen([e.id + ":me"]);
  S.wallDraft = null;
  sfx("send");
  draw();
}

function wallDropDraft() {
  S.wallDraft = null;
  draw();
}

// 「回应」在帖子底下展开预制草稿，不弹网页提示。
// 打开时一句都不预选：这句要她自己挑，挑完备选自动收起，才按得了「发送」。
function wallAnswer(e) {
  if (e.mute) {
    tip(e.mute);
    return;
  }
  if (!e.answer || !e.answer.length) return;
  if (wallDrafting(e)) S.wallDraft = null;
  else S.wallDraft = { id: e.id, i: -1 };
  draw();
}

function wallDraftBox(e) {
  const list = e.answer || [];
  if (!list.length) return null;
  const saved = S.wallDraft && S.wallDraft.id === e.id ? S.wallDraft.i : -1;
  let i = typeof saved === "number" && saved >= 0 ? Math.min(saved, list.length - 1) : -1;
  const input = el("input", {
    type: "text",
    class: "wall-draft-input",
    readOnly: true,
    // value 走的是属性，不经过 el() 的 H()，粤语模式要自己转一次，
    // 不然下拉里是「遲啲講。」、格子里是「迟啲讲。」，一句话两种字。
    value: i >= 0 ? H(list[i].text) : "",
    placeholder: H("选一句回覆"),
    "aria-label": "回复",
  });
  const send = el("button", {
    type: "button",
    class: "wall-draft-send",
    disabled: i < 0,
    onclick: () => { if (i >= 0) wallSendAnswer(e, list[i]); },
  }, ["发送"]);
  const menu = el("ul", { class: "wall-draft-menu" }, list.map((opt, idx) => el("li", {}, [
    el("button", {
      type: "button",
      class: "wall-draft-opt" + (idx === i ? " on" : ""),
      onmousedown: (ev) => {
        ev.preventDefault();
        i = idx;
        S.wallDraft = { id: e.id, i: idx };
        input.value = H(opt.text);
        input.blur();
        // 选完就收起来：备选框不该一直摊在那里挡着「发送」，也不该留半截没答的话。
        menu.hidden = true;
        send.disabled = false;
        menu.querySelectorAll(".wall-draft-opt").forEach((b, n) => b.classList.toggle("on", n === idx));
      },
    }, [opt.text]),
  ])));
  // 选过了想换一句：点一下输入框，备选再翻出来
  input.addEventListener("focus", () => { menu.hidden = false; });
  return el("div", { class: "wall-draft" }, [
    el("div", { class: "wall-draft-box" }, [
      el("span", { class: "wall-draft-who" }, ["章慧琪"]),
      el("div", { class: "wall-draft-field" }, [input, menu]),
    ]),
    el("div", { class: "wall-draft-acts" }, [
      send,
      el("button", { type: "button", class: "wall-draft-drop", onclick: () => wallDropDraft() }, ["不发"]),
    ]),
  ]);
}

function wallActions(e, word) {
  word = word || "回应";
  if (wallMine(e)) return el("div", { class: "post-actions" }, [el("span", { class: "post-kept" }, ["已" + word])]);
  if (!e.answer && !e.mute) return null;
  const open = wallDrafting(e);
  const link = e.mute
    ? webLink(word, () => wallAnswer(e))
    : webLink(open ? "收起" : word, () => wallAnswer(e));
  return el("div", { class: "post-reply-wrap" + (open ? " open" : "") }, [
    el("div", { class: "post-actions" }, [link]),
    open ? wallDraftBox(e) : "",
  ]);
}

// 能记的那几个字画在正文／回帖里：点一下写进日记簿笔记，飘一句「已记录」，不盖戳、底部不放「记下」按钮
function wallNoteKey(e) {
  if (!e || !e.note) return "";
  if (e.key) return e.key;
  const m = /「([^」]+)」/.exec(e.text || "");
  if (m) return m[1];
  const t = String(e.text || "").replace(/[。．.…]+$/g, "").trim();
  return t.length && t.length <= 16 ? t : "";
}

function wallDoKeep(e) {
  if (!e.note || noted(e.note[0])) return;
  note(e.note[0], e.note[1]);
  sfx("file");
  draw();
  tip("已记录");
}

function wallNoteParts(text, e) {
  let key = wallNoteKey(e);
  if (!key) return [H(text || "")];
  let at = String(text).indexOf(key);
  if (at < 0 && typeof toHkTrad === "function") {
    const tk = toHkTrad(key);
    at = String(text).indexOf(tk);
    if (at >= 0) key = tk;
  }
  if (at < 0) return [H(text || "")];
  const kept = noted(e.note[0]);
  const mark = kept
    ? el("span", { class: "wall-key-kept", title: hkAd("已记进日记簿") }, [key])
    : el("span", {
      class: "wall-key-link",
      role: "button",
      tabindex: "0",
      title: hkAd("点一下，记进日记簿"),
      onclick: (ev) => { ev.stopPropagation(); wallDoKeep(e); },
      onkeydown: (ev) => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); wallDoKeep(e); }
      },
    }, [key]);
  return [text.slice(0, at), mark, text.slice(at + key.length)];
}

function wallReplyLine(e, x, fresh) {
  const kids = [webLink(x.r.name, wallWhoGo(x.r.who)), "："];
  const key = wallNoteKey(e);
  if (key && String(x.r.text).includes(key)) kids.push(...wallNoteParts(x.r.text, e));
  else kids.push(x.r.text);
  kids.push(el("span", { class: "post-reply-time" }, [webAgo(x.t)]));
  return el("p", { class: "post-reply" + (fresh ? " fresh" : "") }, kids);
}

function wallSeen(key) {
  return !!(S.wallSeen && S.wallSeen[key]);
}

function wallMarkSeen(keys) {
  S.wallSeen = S.wallSeen || {};
  keys.forEach((k) => { S.wallSeen[k] = true; });
}

function wallFeedKeys() {
  const keys = [];
  wallShown(WALL_FEED).forEach(({ e }) => {
    if (!e.old) keys.push(e.id);
    wallReplies(e).forEach((x) => keys.push(x.key));
  });
  return keys;
}

function wallMailKeys() {
  const keys = [];
  wallShown(WALL_MAIL).forEach(({ e }) => {
    keys.push(e.id);
    wallReplies(e).forEach((x) => keys.push(x.key));
  });
  return keys;
}

function wallUnread() {
  const feed = wallFeedKeys().filter((k) => !wallSeen(k)).length;
  const mail = wallMailKeys().filter((k) => !wallSeen(k)).length;
  return { feed, mail, n: feed + mail };
}

function wallCountLabel(label, n) {
  if (!n) return label;
  if (typeof label === "string" || typeof label === "number") return label + " (" + n + ")";
  return [label, " (", n, ")"];
}

// 进页那一刻没看过的，这一趟都标「新」，重画也不消失
function wallFresh(screen, keys) {
  if (!S.wallFresh || S.wallFresh.screen !== screen) {
    S.wallFresh = { screen, keys: keys.filter((k) => !wallSeen(k)) };
  }
  wallMarkSeen(keys);
  return S.wallFresh.keys;
}

// 跳关进来时，之前的动态当作已经看过
function wallMarkAllSeen() {
  wallMarkSeen(wallFeedKeys().concat(wallMailKeys()));
  S.wallLastN = 0;
}

if (typeof SFX !== "undefined") {
  SFX.wallIn = () => {
    sfxTone(1047, 0, 0.09, { type: "triangle", gain: 0.057 });
    sfxTone(1568, 0.08, 0.2, { type: "triangle", gain: 0.05 });
  };
}

// 底栏「浏览器」：墙簿有新东西就慢慢明暗、亮红点；多了一条叮一声 + 底栏上短 toast
function wallTick() {
  const unread = wallUnread();
  const n = unread.n;
  const quiet = S.mode === "card" || S.mode === "wait" || S.mode === "end";
  if (!quiet) {
    if (n > (S.wallLastN || 0)) {
      sfx("wallIn");
      if (typeof tip === "function" && S.mode !== "web" && !S.paused) {
        const msg = unread.mail && !unread.feed
          ? "墙簿有新邮件。"
          : unread.feed && !unread.mail
            ? "墙簿有新动态。"
            : "墙簿有新东西。";
        tip(msg, { quiet: true, nearBar: true, ms: 2800 });
      }
    }
    S.wallLastN = n;
  }
  const houseN = typeof houseForumUnread === "function" ? houseForumUnread().length : 0;
  if (!quiet && houseN > (S.houseLastN || 0) && n <= (S.wallLastN || 0)) {
    if (typeof tip === "function" && S.mode !== "web" && !S.paused) {
      tip("廿八屋讨论区有新回复。", { quiet: true, nearBar: true, ms: 2800 });
    }
  }
  S.houseLastN = houseN;
  // 红点不只看「没看过」：有人问了话、她还没回，也算这里有事。
  // 那种帖早就读过了，未读数掉到零，可任务还卡着——先前只有一张文字便条，
  // 底栏干干净净，看着像没事。回覆之前红点一直亮（那一条也是必做，不回走不了）。
  const openN = typeof wallToday === "function" ? wallToday().open.length : 0;
  const b = document.getElementById("playbar-house");
  if (b) b.classList.toggle("has-new", (n > 0 || houseN > 0 || openN > 0) && S.mode !== "web" && !S.paused);
}

// 这格跟他在论坛出没同步：她搬进去后收起，08-24 回帖那天冒一天，09-07 论坛发帖同一分钟回来。字从来不改。
function linAdState() {
  if (webPast(webDate("09-07", "14:40"))) return "back";
  if (webPast(webDate("08-24", "11:14")) && !webPast(webDate("08-25", "11:14"))) return "blip";
  if (webPast(webDate("08-15", "06:00"))) return "gone";
  return "on";
}

const FILLER_AD_IDS = ["move", "tutor", "storage"];

function openWallAd(id) {
  goWeb("ad", { adId: id || "lin" });
}

function wallAdButton(id, cls) {
  const a = WALL_ADS[id];
  if (!a) return "";
  const trad = (s) => H(s);
  const kids = [el("b", {}, [trad(a.sideTitle)]), trad(a.sideLine)];
  if (a.sideBy) kids.push(el("div", {}, [trad(a.sideBy)]));
  return el("button", {
    class: "ad" + (cls ? " " + cls : ""),
    type: "button",
    onclick: () => openWallAd(id),
  }, kids);
}

function fillerAd() {
  const day = Math.floor(clockDate().getTime() / 86400000);
  return wallAdButton(FILLER_AD_IDS[day % FILLER_AD_IDS.length], "mute");
}

function linAdButton() {
  const st = linAdState();
  if (st === "gone") {
    if (flag("sawLinAd")) note("wall-ad-gone", "墙簿右边藤先生那格广告不见了，换成别的。");
    return fillerAd();
  }
  return el("button", {
    class: "ad",
    type: "button",
    onclick: () => {
      const seen = flag("sawLinAd");
      flag("sawLinAd", true);
      if (st === "back" && seen) note("wall-ad-back", "藤先生那格广告又出现了。字一样。");
      else if (st === "blip" && noted("wall-ad-gone")) note("wall-ad-blip", "藤先生那格广告今天又在，字一样。之前不见了一阵。");
      else note("lin", "有人在网上等人聊。藤先生。");
      if (flag("sawOwnPost")) note("same-name", "墙上和帖里是同一个名字。");
      openWallAd("lin");
    },
  }, [
    el("b", {}, [hkAd(WALL_ADS.lin.sideTitle)]),
    hkAd(WALL_ADS.lin.sideLine),
    el("div", {}, [hkAd(WALL_ADS.lin.sideBy)]),
  ]);
}

function livingIn() {
  return S.level >= 3;
}

function wallLatest(who) {
  return wallShown(WALL_FEED).find((x) => x.e.who === who) || null;
}

/* data -> web-data.js: WALL_FRIENDS */

// 在线状态跟着钟走：美娟早睡早起，家豪白天当更，阿诗夜里才上，阿乐只看最后一次动态
function wallStatus(who) {
  const h = clockDate().getHours();
  if (who === "mei") return h >= 7 && h < 24 ? { on: true, text: "在线" } : { on: false, text: "离线" };
  if (who === "howard") {
    const d = clockDate();
    if (d.getMonth() === 8 && d.getDate() >= 7) return { on: false, text: "休班" };
    return h >= 9 && h < 18 ? { on: false, text: "当更中" } : { on: false, text: "离线" };
  }
  if (who === "ping") return h >= 19 || h < 1 ? { on: true, text: "在线" } : { on: false, text: "离线" };
  if (who === "lok") return { on: false, text: lokOnline() + " 上线" };
  return { on: false, text: "" };
}

function wallFestival() {
  const now = clockDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((new Date(2014, 8, 8) - today) / 86400000);
  if (days > 0) return "中秋节　9月8日（还有 " + days + " 日）";
  if (days === 0) return "今日中秋。";
  return "中秋已过。";
}

// 不是好友、但墙簿觉得你认识的人；罗启明要等见过他之后才出现
function wallMaybe() {
  const out = [{ who: "kelvin", name: "Kelvin 刘", via: "共同好友：同事阿诗" }];
  if (S.level >= 7) out.unshift({ who: "ming", name: "罗启明", via: "共同好友：邝家豪" });
  return out;
}

function wallTimeline(who) {
  const rows = wallShown(WALL_FEED).filter((x) => x.e.who === who).map(({ e, t }) => ({ t, text: e.text, n: wallReplies(e).length }));
  if (who === "me") {
    wallShown(WALL_FEED).forEach(({ e }) => {
      const mine = wallMine(e);
      if (mine && e.who !== "me") rows.push({ t: new Date(mine.t), text: "回应了 " + e.name + "：「" + mine.text + "」", n: 0 });
    });
  }
  rows.sort((a, b) => b.t - a.t);
  return el("div", { class: "wall-tl" }, [
    el("p", { class: "wall-album-name" }, ["动态"]),
    ...(rows.length ? rows.map((r) => el("div", { class: "wall-tl-row" }, [
      el("span", { class: "wall-tl-time" }, [webAgo(r.t)]),
      el("span", { class: "wall-tl-text" }, [r.text]),
      r.n ? el("span", { class: "wall-tl-n" }, [r.n + " 则回应"]) : "",
    ])) : [el("p", { class: "wall-tl-empty" }, ["最近没有动态。"])]),
  ]);
}

/* 通知不是人说的话，所以挂在首页顶上一横条：没有头像、没有「回应」，
   也不进收件箱、不算未读。廿八屋那句「已标记为已租」是唯一一条。 */
function wallNoticeBar() {
  const list = wallShown(WALL_NOTICE);
  if (!list.length) return null;
  return el("div", { class: "wall-notice" }, list.map(({ e, t }) =>
    el("p", {}, [
      el("span", { class: "wall-notice-tag" }, [W("wallNotice")]),
      el("span", {}, [Ty(e, "text")]),
      el("span", { class: "wall-notice-time" }, [webAgo(t)]),
    ])
  ));
}

function viewWall() {
  const fresh = wallFresh("wall", wallFeedKeys());
  const posts = wallShown(WALL_FEED).map(({ e, t }) => {
    const replies = wallReplies(e).map((x) => wallReplyLine(e, x, fresh.includes(x.key)));
    return {
      t,
      node: wallPost(e.name, e.who, Ty(e, "text"), webAgo(t), null, {
        fresh: fresh.includes(e.id),
        entry: e,
        photo: e.photo,
        replies,
      }),
    };
  });
  const houseAt = livingIn() ? webDate("08-01", "09:30") : webDate("07-31", "23:02");
  posts.push({
    t: houseAt,
    node: wallPost("廿八屋转贴", "house", livingIn() ? "你最近看过深水埗唐楼。" : "元朗天水围，有人在看。", webAgo(houseAt),
      el("div", { class: "post-actions" }, [webLink("打开廿八屋", () => {
        S.query = livingIn() ? "深水埗" : "元朗 天水围";
        goWeb("list");
      })])
    ),
  });
  posts.sort((a, b) => b.t - a.t);
  const feed = el("div", { class: "feed" }, posts.map((p) => p.node));
  const side = el("div", { class: "wall-rail" }, [
    wallSideBox(hkAd("好友"), WALL_FRIENDS.map((f) => {
      const st = wallStatus(f.who);
      return el("p", { class: "side-friend" }, [
        el("i", { class: "side-dot" + (st.on ? " on" : "") }),
        webLink(f.name, () => goWeb("wall-user", { wallWho: f.who })),
        el("span", {}, [hkAd(st.text)]),
      ]);
    })),
    wallSideBox(T("赞助连结", "赞助链接"), [
      wallAdButton("phone", "mute"),
      linAdButton(),
      wallAdButton("life", "mute"),
    ]),
    wallSideBox(hkAd("节日"), [el("p", { class: "side-fest" }, [hkAd(wallFestival())])]),
    wallSideBox(hkAd("你可能认识"), wallMaybe().map((m) => el("p", { class: "side-friend" }, [
      webLink(m.name, () => goWeb("wall-user", { wallWho: m.who })),
      el("span", {}, [hkAd(m.via)]),
    ]))),
  ]);
  const notice = wallNoticeBar();
  const wrap = el("div", { class: "hk-site wall-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-grid" }, [
    el("div", { class: "wall-main" }, notice ? [notice, feed] : [feed]),
    side,
  ]));
  return wrap;
}

function wallAdCta(a) {
  return el("button", {
    class: "wall-ad-cta",
    type: "button",
    onclick: () => showPrompt(T("提交失败", "提交失败"), a.ctaFail ? hkAd(a.ctaFail) : T("请稍后再试", "请稍后再试")),
  }, [a.cta ? hkAd(a.cta) : T("提交", "提交")]);
}

function wallAdShell(kids) {
  return el("div", { class: "wall-ad-page" }, [
    backLink(W("wall"), wallGoHome),
    el("div", { class: "wall-ad-card" }, kids),
  ]);
}

function viewAdLin() {
  return wallAdShell([
    el("p", { class: "wall-ad-sponsor" }, [T("赞助内容", "赞助内容")]),
    el("p", { class: "wall-ad-meta" }, [T("外站广告商，电邮已失效", "外站广告商，邮箱已失效")]),
    el("div", { class: "wall-ad-floor" }, [
      imgSlot(pic(1, "墙簿/藤先生-空头像"), "avatar-slot", "藤先生"),
      el("h2", { class: "wall-ad-h" }, [T("把你的故事交给能懂的人", "把你的故事交给能懂的人")]),
      el("p", { class: "wall-ad-sub" }, [T("（电邮已失效）", "（邮箱已失效）")]),
    ]),
    el("p", { class: "wall-ad-disc" }, [T("此页由广告商提供。墙簿不对赞助内容负责。", "此页由广告商提供。墙簿不对赞助内容负责。")]),
  ]);
}

function hkAd(s) {
  if (s == null || s === "") return "";
  return H(String(s));
}

function viewAdShop(a) {
  return wallAdShell([
    el("p", { class: "wall-ad-sponsor" }, [T("赞助内容", "赞助内容")]),
    el("p", { class: "wall-ad-meta" }, [T("外站广告，非墙簿官方", "外站广告，非墙簿官方")]),
    el("div", { class: "wall-ad-floor" }, [
      el("h2", { class: "wall-ad-h" }, [hkAd(a.head)]),
      el("p", { class: "wall-ad-sub" }, [hkAd(a.sub)]),
      wallKv((a.rows || []).map(([k, v]) => [hkAd(k), hkAd(v)])),
    ]),
    a.note ? el("div", { class: "wall-ad-floor muted" }, [el("p", { class: "fine" }, [hkAd(a.note)])]) : "",
    // 小商户的落地页本来没有按钮：电话就写在资料里，人自己打。从前这里挂一个
    // 「亲临门市」的钮，按下去回一句「本页不收预约」——钮说要人做的事，弹窗说做不了。
    a.cta ? el("div", { class: "wall-ad-acts" }, [wallAdCta(a)]) : "",
    el("p", { class: "wall-ad-disc" }, [T("墙簿不对赞助内容负责。", "墙簿不对赞助内容负责。")]),
  ]);
}

function viewAdLead(a) {
  const fields = (a.fields || []).map((label) =>
    el("label", { class: "wall-ad-field" }, [
      hkAd(label),
      el("input", { type: "text", maxlength: "40", autocomplete: "off" }),
    ])
  );
  return wallAdShell([
    el("p", { class: "wall-ad-sponsor" }, [T("赞助内容", "赞助内容")]),
    el("p", { class: "wall-ad-meta" }, [T("外站广告，非墙簿官方", "外站广告，非墙簿官方")]),
    el("div", { class: "wall-ad-floor" }, [
      el("h2", { class: "wall-ad-h" }, [hkAd(a.head)]),
      el("p", { class: "wall-ad-sub" }, [hkAd(a.sub)]),
      wallKv((a.rows || []).map(([k, v]) => [hkAd(k), hkAd(v)])),
    ]),
    el("div", { class: "wall-ad-floor" }, [
      el("div", { class: "wall-ad-form" }, fields),
      a.note ? el("p", { class: "fine" }, [hkAd(a.note)]) : "",
    ]),
    el("div", { class: "wall-ad-acts" }, [wallAdCta(a)]),
    el("p", { class: "wall-ad-disc" }, [T("墙簿不对赞助内容负责。", "墙簿不对赞助内容负责。")]),
  ]);
}

function viewAd() {
  const id = S.adId && WALL_ADS[S.adId] ? S.adId : "lin";
  const a = WALL_ADS[id];
  const wrap = el("div", { class: "hk-site wall-site" });
  wrap.append(wallHeader());
  if (a.kind === "blank") wrap.append(viewAdLin());
  else if (a.kind === "lead") wrap.append(viewAdLead(a));
  else wrap.append(viewAdShop(a));
  return wrap;
}

function showWallPhoto(title, id) {
  closeModal();
  const close = () => {
    closeModal();
    draw();
  };
  /* 这一屏不用 prompt：prompt 是蓝色的「网页提示」窗，那是站外的浏览器外壳，
     而这里是墙簿自己开的看图层——标题条要用站头那支绿（10-29）。
     标题走 el()，所以跟别处一样由 H() 转港繁；CSS 里写死 content 做不到这一点。 */
  const sheet = el("div", { class: "sheet wall-photo-sheet" }, [
    el("p", { class: "wall-photo-title" }, [title]),
    imgSlot(id, "photo-lg wall-photo-lg", title),
    el("button", { class: "wall-ad-cta", type: "button", onclick: close }, ["合上"]),
  ]);
  S.modal = el("div", {
    class: "modal web",
    id: "game-modal",
    onclick: (e) => { if (e.target === S.modal) close(); },
  }, [sheet]);
  stage.append(S.modal);
}

function wallAlbum(label, shots) {
  return el("div", { class: "wall-album" }, [
    el("p", { class: "wall-album-name" }, [label]),
    el("div", { class: "wall-shots" }, shots.map((s) =>
      el("button", {
        type: "button",
        class: "wall-shot",
        onclick: () => showWallPhoto(s.cap, s.id),
      }, [imgSlot(s.id, "wall-thumb", s.cap)])
    )),
  ]);
}

function wallProfile(title, lines) {
  const wrap = el("div", { class: "hk-site wall-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-profile" }, [
    backLink("墙簿", wallGoHome),
    el("h2", {}, [title]),
    ...lines.map((t) => typeof t === "string" ? el("p", {}, [t]) : t),
  ]));
  return wrap;
}

function viewWallMe() {
  const status = flag("serial3") && S.level < 12
    ? "状态：在住。星期六再去诊所。"
    : livingIn()
      ? "状态：在住。"
      : "状态：在找地方住。";
  return wallProfile("章慧琪", [
    status,
    livingIn() ? "最近：廿八屋　深水埗 唐楼" : "最近：廿八屋　元朗 天水围",
    "好友：12",
    wallAlbum("相册「手机」（2 张）", [
      { id: pic(1, "墙簿/章慧琪-茶餐厅"), cap: "茶餐厅" },
      { id: pic(1, "墙簿/章慧琪-出街"), cap: "出街" },
    ]),
    wallTimeline("me"),
  ]);
}

function viewWallFriends() {
  const wrap = el("div", { class: "hk-site wall-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-profile" }, [
    backLink(hkAd("墙簿"), wallGoHome),
    el("h2", {}, [hkAd("好友")]),
    ...WALL_FRIENDS.map((f) => {
      const st = wallStatus(f.who);
      return el("p", { class: "wall-friend" }, [
        webLink(f.name, () => goWeb("wall-user", { wallWho: f.who })),
        el("span", {}, [hkAd(f.rel)]),
        el("span", { class: "wall-st" + (st.on ? "" : " dim") }, [hkAd(st.text)]),
      ]);
    }),
  ]));
  return wrap;
}

function lokOnline() {
  const last = wallLatest("lok");
  return webAgo(last ? last.t : webDate("07-31", "22:55"));
}

/* 收件箱与「倾偈」并成一处的样子：窗口标题条、头像行、点线排下来的对话、底下一格发送。
   墙簿里不再有第二种私信界面——同一个人说的话只在一个地方，玩家不用记住哪句在哪边。
   首页问「谁在哪天发了什么」（按时间、帖子流），这里问「谁找过你、你们说过什么」（按人、对话）。 */

/* 倾偈那两场（八月八日夜里、八月十五日早上）现在排在收件箱里，
   由 story-early.js 的 MAIL_PACKS 登记；没开场之前一行都不出现。 */
function mailPacks() {
  const out = [];
  if (typeof MAIL_PACKS === "undefined") return out;
  MAIL_PACKS.forEach((p) => {
    const lines = typeof chatPackLines === "function" ? chatPackLines(p.id) : [];
    if (lines.length) out.push({ pack: p, lines });
  });
  return out;
}

function mailPackTime(pack, i) {
  return new Date(webDate(pack.at[0], pack.at[1]).getTime() + (i || 0) * 60000);
}

// 最后说话那一刻：留言与实时那几段一起算，联系人栏才排得对
function mailLastLine(who, items) {
  let best = items.length
    ? { t: items[items.length - 1].t, text: Ty(items[items.length - 1].e, "text") }
    : null;
  mailPacks().forEach(({ pack, lines }) => {
    if (pack.who !== who || !lines.length) return;
    const t = mailPackTime(pack, lines.length - 1);
    if (!best || t > best.t) best = { t, text: lines[lines.length - 1][1] };
  });
  return best;
}

function wallMailThreads() {
  const by = {};
  const order = [];
  wallShown(WALL_MAIL).forEach(({ e, t }) => {
    if (!by[e.who]) { by[e.who] = []; order.push(e.who); }
    by[e.who].push({ e, t });
  });
  // 只有实时那一段、还没有留言的人也要出现在栏里，不然开场第一句会没地方落
  mailPacks().forEach(({ pack }) => {
    if (!by[pack.who]) { by[pack.who] = []; order.push(pack.who); }
  });
  return order.map((who) => {
    const items = by[who].sort((a, b) => a.t - b.t);
    const last = mailLastLine(who, items);
    const name = (items.length && items[items.length - 1].e.name) || WALL_NAMES[who] || who;
    return { who, name, items, last };
  }).filter((th) => th.last).sort((a, b) => b.last.t - a.last.t);
}

function wallThreadKeys(th) {
  const keys = [];
  th.items.forEach(({ e }) => {
    keys.push(e.id);
    wallReplies(e).forEach((x) => keys.push(x.key));
  });
  return keys;
}

/* 头像：表姐有照片；其余人墙簿只给了个剪影。
   早一版取名字第一个字做成方块，于是「同事阿诗」顶着个「同」、「全部记录」顶着个「全」——
   字母方块是后来那批邮箱的样子，二〇一四年这里就是一块灰底的人形。 */
function mailFace(who, name) {
  if (who === "mei") return imgSlot("00-通用/头像-陈美娟", "inbox-ava", name);
  return el("span", { class: "inbox-face", "aria-hidden": "true" });
}

/* 一行一句：抬头「谁　几点」，正文缩进一格，行间一条点线。
   她自己发的那几句整行翻到右边（`.mine`，样式在 style-chrome.css）。
   原先怕「左右翻会看丢上一句是谁说的」，所以一律左齐；可每行抬头都写着名字，
   这个问题本来就不存在——反倒是全左齐时，她自己的话混在表姐的话里，要读名字才认得出。
   名字带 inbox 前缀：story-late 里那个 mailRow 是校园邮箱的列表行，两个都叫 mailRow 会互相顶掉。 */
function inboxRow(mine, name, body, time, isFresh) {
  return el("div", { class: "inbox-row" + (mine ? " mine" : "") + (isFresh ? " fresh" : "") }, [
    el("div", { class: "inbox-meta" }, [
      el("span", { class: "ix-who" }, [name]),
      el("span", { class: "ix-time" }, [time]),
    ]),
    el("div", { class: "inbox-text" }, body),
  ]);
}

/* 回一句：点哪句发哪句。旧版是「先展开草稿、再按发送」两步，那是表单的做法；
   窗口里没有那一步，倾偈也没有。 */
function mailReply(e) {
  if (wallMine(e)) return el("div", { class: "inbox-acts" }, [el("span", { class: "inbox-kept" }, ["已回复"])]);
  if (e.mute) return el("div", { class: "inbox-acts" }, [webLink("回复", () => wallAnswer(e))]);
  if (!e.answer || !e.answer.length) return null;
  return el("div", { class: "inbox-acts" }, [
    // 「回一句」不是「发送」：这是隔了几天才看到的留言，不是当场对着说话
    el("span", { class: "inbox-acts-h" }, ["回一句"]),
    ...e.answer.map((a) => el("button", {
      type: "button",
      class: "inbox-pick",
      onclick: () => wallSendAnswer(e, a),
    }, [a.text])),
  ]);
}

function mailThreadNodes(th, fresh) {
  const items = [];
  th.items.forEach(({ e, t }) => {
    items.push({
      t,
      node: inboxRow(false, e.name || WALL_NAMES[th.who] || th.who, wallNoteParts(Ty(e, "text"), e), webAgo(t), fresh.includes(e.id)),
    });
    let end = t.getTime();
    wallReplies(e).forEach((x) => {
      const mine = x.r.who === "me";
      const body = x.r.zh != null ? [T(x.r.text, x.r.zh)] : [hkAd(x.r.text)];
      items.push({ t: x.t, node: inboxRow(mine, x.r.name, body, webAgo(x.t), fresh.includes(x.key)) });
      end = Math.max(end, x.t.getTime());
    });
    /* 底下那一格挂在这一条后面还是挂在整段后面，看它是哪种：
       「回一句」是给这条留言的答复入口，要跟在她那一轮话之后（end+1）；
       「已回复」是给这条留言盖的章，得留在它自己下面——用 end+1 的话，
       她会把三个月后才回的那句排到栏底，那枚章就跟着沉下去，孤零零挂在
       别人的话下面，读成「刚才那一轮已回复」。 */
    const act = mailReply(e);
    if (act) items.push({ t: new Date(wallMine(e) ? t.getTime() + 1 : end + 1), node: act });
  });
  mailPacks().forEach(({ pack, lines }) => {
    if (pack.who !== th.who) return;
    lines.forEach(([k, t], i) => {
      const mine = k === "me";
      // 抬头要带日子。这两段实时记录和八号那段、和几条静态私信排在同一栏里，
      // 只写「21:06」看不出它比下面早了一个礼拜（早一版就是 chatClock(i) 只给钟点）。
      const at = mailPackTime(pack, i);
      items.push({
        t: at,
        node: inboxRow(mine, mine ? "章慧琪" : th.name, [t], webAgo(at), false),
      });
    });
  });
  return items.sort((a, b) => a.t - b.t).map((x) => x.node);
}

// 查找记录：翻的是所有人、所有日子，不只是这一栏。
function mailArchive() {
  const rows = [];
  wallShown(WALL_MAIL).forEach(({ e, t }) => {
    rows.push({ who: e.name || WALL_NAMES[e.who] || e.who, t, text: Ty(e, "text") });
    wallReplies(e).forEach((x) => {
      rows.push({ who: x.r.name, t: x.t, text: x.r.zh != null ? T(x.r.text, x.r.zh) : x.r.text });
    });
  });
  mailPacks().forEach(({ pack, lines }) => {
    lines.forEach(([k, text], i) => rows.push({
      who: k === "me" ? "章慧琪" : (WALL_NAMES[pack.who] || pack.who),
      t: mailPackTime(pack, i),
      text,
    }));
  });
  return rows.sort((a, b) => a.t - b.t);
}

function mailFindHits(q) {
  return mailArchive().filter((r) => !q || ((r.who || "") + r.text).includes(q));
}

function mailFindList(hits) {
  if (!hits.length) return el("p", { class: "inbox-empty" }, ["没有符合的记录。"]);
  return el("div", { class: "inbox-find-list" }, hits.map((r) => el("div", { class: "inbox-hit" }, [
    el("div", { class: "inbox-meta" }, [
      el("span", { class: "ix-day" }, [webStamp(r.t)]),
      el("span", { class: "ix-who" }, [r.who]),
    ]),
    el("div", { class: "inbox-text" }, [r.text]),
  ])));
}

function viewWallMail() {
  const fresh = wallFresh("wall-mail", wallMailKeys());
  const threads = wallMailThreads();
  if (!threads.length) return wallProfile(W("wallMail"), [hkAd("没有讯息。")]);

  const freshN = (th) => wallThreadKeys(th).filter((k) => fresh.includes(k)).length;
  const keep = threads.some((th) => th.who === S.wallMailWho);
  if (!keep) S.wallMailWho = (threads.find((th) => freshN(th)) || threads[0]).who;
  const now = threads.find((th) => th.who === S.wallMailWho) || threads[0];

  // 搜索框常驻在左栏顶上，跟邮箱一样：有字就是在翻旧记录，清掉就回到这一栏。
  // 早一版是个「查找记录」按钮，点开才冒出一条工具条＋一行输入框——那一层工具条
  // 在二〇一四年的网页上没有对应的东西，看着像客户端。
  const q = (S.mailQuery || "").trim();
  const find = el("input", { type: "search", value: S.mailQuery || "", placeholder: "搜索消息", "aria-label": "搜索消息" });
  // 每打一个字就重画整页，所以这一格是新造的。两件事要自己接：
  // ① 焦点回到新格上（pin() 里做），② 光标停在末尾——不接的话它停在 0，
  //    打「水声」出来是「声水」；③ 拼音还没上屏时别重画，重画会把输入法正在拼的那个词打断。
  let composing = false;
  find.addEventListener("compositionstart", () => { composing = true; });
  find.addEventListener("compositionend", () => {
    composing = false;
    S.mailQuery = find.value;
    draw();
  });
  find.addEventListener("input", () => {
    S.mailQuery = find.value;
    if (composing) return;
    draw();
  });

  // 人包在 .inbox-people 里：窄屏要把这一栏横过来滚，搜索框得单独占一行，
  // 不包一层就只能跟着一起滚。
  const people = threads.map((th) => {
    const n = freshN(th);
    // 有人问了她还没回：列表上挂一个点，不用点进去也知道这栏有事
    const pending = th.items.some(({ e }) => e.answer && !wallMine(e));
    return el("button", {
      type: "button",
      class: "inbox-who" + (!q && th.who === now.who ? " on" : ""),
      "aria-current": th.who === now.who ? "true" : "false",
      onclick: () => { S.wallMailWho = th.who; S.mailQuery = ""; draw(); },
    }, [
      mailFace(th.who, th.name),
      // 名字独占一行，时刻与摘要挤在第二行：左栏只有两百来像素，
      // 把时刻放在名字那一行的右边，名字与摘要就都只剩五六个字的宽度。
      el("span", { class: "inbox-who-main" }, [
        el("span", { class: "inbox-who-name" }, [th.name, n ? el("em", { class: "post-new" }, ["新"]) : ""]),
        el("span", { class: "inbox-who-meta" }, [
          el("span", { class: "inbox-who-time" }, [webAgo(th.last.t)]),
          el("span", { class: "inbox-who-last" }, [th.last.text]),
        ]),
      ]),
      pending ? el("i", { class: "inbox-pending", title: hkAd("还没回") }) : "",
    ]);
  });

  const list = el("div", { class: "inbox-who-list" }, [
    el("div", { class: "inbox-search" }, [find]),
    el("div", { class: "inbox-people" }, people),
  ]);

  const stream = el("div", { class: "inbox-stream" });
  if (q) stream.append(mailFindList(mailFindHits(q)));
  else stream.append(...mailThreadNodes(now, fresh));

  // 实时那一段（表姐）的发送栏排在留言后面，由 story-early.js 按当年倾偈的规矩给。
  // 搜索时不放——翻旧记录的时候不该摆一排「发送：」。
  const send = !q && typeof mailChatFooter === "function" ? mailChatFooter(now.who) : null;

  // 一页，不是桌面上再放一个窗：只有左右两栏和一条竖线，没有第二层标题条、没有 ×。
  // 关掉它靠上面那条「返回墙簿」，跟这一站别的内页一样。
  const win = el("div", { class: "mailbox" }, [
    list,
    el("div", { class: "inbox-thread" }, [
      q ? "" : el("div", { class: "inbox-contact" }, [
        mailFace(now.who, now.name),
        el("span", { class: "inbox-contact-main" }, [
          el("strong", {}, [now.name]),
          el("span", {}, [wallStatus(now.who).text || "离线"]),
        ]),
      ]),
      stream,
      send || "",
    ]),
  ]);

  const wrap = el("div", { class: "hk-site wall-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-profile" }, [
    backLink("墙簿", wallGoHome),
    win,
  ]));

  // 打开时停在最后一句：该看见最新的话，不是翻到几个月前。视图要等这一帧插进文档再滚。
  // 搜索结果反过来停在第一条——翻旧账是从最早的看起。
  const pin = (n) => requestAnimationFrame(() => {
    if (!stream.isConnected && n < 6) { pin(n + 1); return; }
    stream.scrollTop = q ? 0 : stream.scrollHeight;
    if (q) {
      find.focus();
      // 焦点给回去还不够：新造的输入框光标默认在 0，接着打就是往前插。
      try { find.setSelectionRange(find.value.length, find.value.length); } catch (_) { /* 不支持就算了 */ }
    } else find.blur();
  });
  pin(0);
  return wrap;
}

function viewWallSet() {
  const wrap = el("div", { class: "hk-site wall-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-profile" }, [
    backLink("墙簿", wallGoHome),
    el("h2", {}, ["设置"]),
    el("p", {}, ["谁可以找我：好友"]),
    el("p", {}, ["赞助连结：免费账户无法关闭"]),
    el("p", {}, ["语言：中文（香港）"]),
    el("p", {}, ["登出：此浏览器已记住登入"]),
    el("button", { class: "wall-ad-cta ghost", type: "button", onclick: blockedLogout }, ["登出"]),
  ]));
  return wrap;
}

function viewWallUser() {
  if (S.wallWho === "mei") {
    return wallProfile("陈美娟", [
      "文职。已婚。",
      wallAlbum("相册「年夜饭」（3 张）", [
        { id: pic(1, "墙簿/陈美娟-开席"), cap: "开席" },
        { id: pic(1, "墙簿/陈美娟-敬茶"), cap: "敬茶" },
        { id: pic(1, "墙簿/陈美娟-水果"), cap: "水果" },
      ]),
      wallAlbum("相册「生日」（1 张）", [
        { id: pic(1, "墙簿/陈美娟-生日"), cap: "切蛋糕" },
      ]),
      wallShown(WALL_FEED).some((x) => x.e.id === "mei-meal")
        ? wallAlbum("相册「星期日」（1 张）", [{ id: pic(9, "示意-午饭"), cap: "星期日" }])
        : "",
      // 发在墙上的月饼照，同样收在她自己的相簿里。
      wallShown(WALL_FEED).some((x) => x.e.id === "mei-fest")
        ? wallAlbum("相册「做节」（1 张）", [{ id: pic(1, "墙簿/表姐-做节"), cap: "做节" }])
        : "",
      wallTimeline("mei"),
    ]);
  }
  if (S.wallWho === "lok") {
    const sig = wallShown(WALL_FEED).some((x) => x.e.id === "lok-sig");
    return wallProfile("阿乐", [
      "上次上线：" + lokOnline(),
      "签名档：" + (sig ? "唔好再打嚟。" : ""),
      "关系：无",
      // 相册只放拍得到他本人的两张，加一张旧屋厨房。
      // 别再把 `场景-美娟家`／`示意-午饭` 的裁切版挂到这里：那是第 9 关「美娟家」的地点底图
      // 与她家「午饭」的热点图，玩家在那里走过、跟她说过话——同一间屋出现在两个人主页，
      // 是空间记忆撞车，比「脏不脏」严重。脏乱与否不是这条判据。
      // 册名从「旧相」改成「以前住的地方」（10-31）：他主页上有两个厨房——这一锅旧灶台，
      // 与「一个人」那个电饭煲。「旧相」只说「这是老照片」，没说「这是老地方」，
      // 两间厨房照样读成同一间；把「以前」写进册名，第二个相册才是现在。
      wallAlbum("相册「以前住的地方」（3 张）", [
        { id: pic(1, "墙簿/阿乐-夜里"), cap: "夜里" },
        { id: pic(1, "墙簿/阿乐-落街"), cap: "落街" },
        { id: pic(1, "墙簿/阿乐-厨房"), cap: "厨房" },
      ]),
      // 他发在墙上的那张，也在他自己的相簿里——墙簿上发过的相会自动进个人主页，
      // 读的人会拿这两处对照。所以这张跟着 `lok-0828` 出现（汤是他一个人的事，不能提前看）。
      wallShown(WALL_FEED).some((x) => x.e.id === "lok-0828")
        ? wallAlbum("相册「一个人」（1 张）", [{ id: pic(1, "墙簿/阿乐-自己煲汤"), cap: "一个人" }])
        : "",
      wallTimeline("lok"),
    ]);
  }
  if (S.wallWho === "house") {
    return wallProfile("廿八屋转贴", [
      "廿八屋官方专页。",
      "通知：开启",
      wallTimeline("house"),
    ]);
  }
  if (S.wallWho === "howard") {
    // 相册「青春」要等银包不见那晚、他翻了一整晚旧相簿之后才出现：那一趟上载的毕业照，
    // 和学生证并排挂在同一个相簿里。学号在动态里已经给了，这里不多也不少——
    // 只是把这句「他也是维港大学的」落成一张看得见的卡。
    const youth = wallShown(WALL_FEED).some((x) => x.e.id === "howard-grad");
    return wallProfile("邝家豪", [
      "姐夫。督察。已婚。",
      "妻子：陈美娟",
      youth ? wallAlbum("相册「青春」（2 张）", [
        { id: pic(15, "示意-家豪毕业照"), cap: "维港大学社会科学院　二〇〇四届" },
        { id: pic(14, "证据-邝家豪学生证"), cap: "维港大学学生证" },
      ]) : "",
      wallAlbum("相册「旅行」（2 张）", [
        { id: pic(1, "墙簿/邝家豪-渡轮"), cap: "渡轮" },
        { id: pic(1, "墙簿/邝家豪-沙滩"), cap: "沙滩" },
      ]),
      wallAlbum("相册「生日」（1 张）", [
        { id: pic(1, "墙簿/邝家豪-生日"), cap: "生日" },
      ]),
      // 他在墙簿上发过的两张，也挂在自己的相簿里。两条动态各有各的出现时机
      // （出差、收工），所以张数按实际收到几张算，不写死。
      (() => {
        const shots = [];
        if (wallShown(WALL_FEED).some((x) => x.e.id === "howard-ot"))
          shots.push({ id: pic(1, "墙簿/家豪-加班桌面"), cap: "未食饭" });
        if (wallShown(WALL_FEED).some((x) => x.e.id === "howard-0830"))
          shots.push({ id: pic(1, "墙簿/家豪-大排档"), cap: "落楼下" });
        return shots.length ? wallAlbum("相册「近照」（" + shots.length + " 张）", shots) : "";
      })(),
      wallTimeline("howard"),
    ]);
  }
  if (S.wallWho === "ping") {
    return wallProfile("同事阿诗", [
      "任职：零售",
      wallTimeline("ping"),
    ]);
  }
  if (S.wallWho === "ming") {
    return wallProfile("罗启明", [
      "共同好友：邝家豪",
      "资料不公开。只有好友看得到他的动态。",
    ]);
  }
  if (S.wallWho === "kelvin") {
    return wallProfile("Kelvin 刘", [
      "共同好友：同事阿诗",
      "资料不公开。",
    ]);
  }
  return wallProfile("用户", ["资料不公开。"]);
}
