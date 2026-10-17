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
  if (diff === 0) return "今天 " + hm;
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

function helpRepliesOpen() {
  return (S.helpSearches || 0) >= 3 || (typeof noted === "function" && noted("bbs-self"));
}

function countHelpSearch() {
  if (!postedHelp() || helpRepliesOpen()) return false;
  if (!(S.query || "").trim()) return false;
  S.helpSearches = (S.helpSearches || 0) + 1;
  return S.helpSearches === 3;
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

/** 列表热度：按回复数假造「第 N 頁」，像本地论坛一眼看出帖有多热闹。 */
function forumPageMarks(replyCount) {
  const pages = Math.max(1, Math.min(6, 1 + Math.ceil((replyCount || 0) / 2)));
  let s = "";
  for (let i = 1; i <= pages; i++) s += T("第", "第") + i + T("頁", "页");
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

// 钟一过剧本上的钟点就发，时间钉死，不跟「你哪一刻点发布」走。不然回复被推到还没到的钟，下一帖对不上。
/* data -> web-data.js: SERIAL_DUE */

function ensureSerials() {
  if (!S || !S.flags) return;
  const now = clockDate().getTime();
  SERIAL_DUE.forEach((d) => {
    const when = serialWhen(d.id);
    if (flag(d.key)) {
      if (!S.postAt || S.postAt[d.id] !== when) pinSerial(d.id);
      return;
    }
    if (!d.ready() || now < when) return;
    pinSerial(d.id);
    flag(d.key, true);
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
  showPrompt(T("登出失败。", "退出失败。"), T("网页无回应，请稍后再试。", "网页无响应，请稍后再试。"));
}

// 网页里的任务提示，和其他场景一样别在屏幕右边的便条上
function currentSlate() {
  if (S.mode !== "web") return "";
  if (S.pendingPost && S.screen === "post") return "看完草稿，按下面的「发布」。不按就不算发出去。";
  if (!postedHelp() && S.screen === "post") return "帖子沉下去了，顶上去，再自己搜。";
  if (postedHelp() && !helpRepliesOpen() && S.level === 1) {
    const n = S.helpSearches || 0;
    return "搜索栏再搜 " + (3 - n) + " 次，任意关键字。藤和后面几层才会出现。";
  }
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
  const titlebar = el("div", { class: "browser-titlebar" }, [
    el("span", { class: "ie-icon", "aria-hidden": "true" }, ["e"]),
    el("span", {}, [(opts.title || (tab === "wall" ? wallCountLabel("墙簿", wallUnread().n) : "廿八屋")) + " - Windows Internet Explorer"]),
    browserCloseControls(),
  ]);
  const canBack = scene ? !!S.searchDoc : (S.webHist || []).length > 0;
  const chrome = el("div", { class: "browser-chrome" }, [
    el("div", { class: "browser-nav" }, [
      el("button", {
        type: "button",
        disabled: !canBack,
        onclick: scene ? () => { S.searchDoc = ""; drawSearch(); } : webBack,
        title: "后退",
      }, ["←"]),
      el("button", { type: "button", disabled: true, title: "前进" }, ["→"]),
      el("button", { type: "button", disabled: true, title: "停止" }, ["■"]),
      el("button", {
        type: "button",
        onclick: scene ? () => { S.searchDoc = ""; drawSearch(); } : () => draw(),
        title: "刷新",
      }, ["↻"]),
    ]),
    el("span", { class: "addr-label" }, ["地址"]),
    el("div", { class: "addr" }, [addr]),
    el("button", { type: "button", class: "go-btn", disabled: true, tabindex: "-1" }, ["转到"]),
  ]);
  const tabs = el("div", { class: "browser-tabs" }, [
    btnTab("廿八屋 - 香港租盘", "house", tab, scene),
    btnTab(wallCountLabel("墙簿", wallUnread().n) + " - 我的首页", "wall", tab, scene),
  ]);
  const status = el("div", { class: "browser-status" }, [
    el("span", {}, ["完成"]),
    el("span", {}, ["Internet　│　100%"]),
  ]);
  screen.append(titlebar, chrome, tabs, inner, status);
  laptopBox.append(screen);
  desk.append(laptopBox);
  return desk;
}

function btnTab(label, id, on, scene) {
  return el("button", {
    type: "button",
    class: id === on ? "on" : "",
    onclick: () => {
      if (scene) {
        browseFromScene(id === "wall" ? "wall" : "home");
        return;
      }
      if (id === "wall") goWeb("wall");
      else if (S.pendingPost || !postedHelp()) goWeb("post");
      else goWeb(flag("searched") ? "list" : "home");
    },
  }, [label]);
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
  };
}

function browseFromScene(screen) {
  if (S.mode !== "web") {
    S.paused = { mode: S.mode, talk: S.talk, wait: S.wait };
    if (S.mode === "night") stopNightClock();
    S.mode = "web";
  }
  goWeb(String(screen).startsWith("wall") ? screen : (postedHelp() ? "home" : "post"));
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
    return el("span", { class: "window-controls", "aria-hidden": "true" }, ["—　□　×"]);
  }
  return el("span", { class: "window-controls" }, [
    el("span", { "aria-hidden": "true" }, ["—　□　"]),
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
        T("还没发布。", "还没发布。"),
        T("先按「发布」。关掉窗口不会把帖发出去。", "先按「发布」。关掉窗口不会把帖发出去。")
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
  if (!extra.replace) {
    S.webHist = S.webHist || [];
    const cur = snapWeb();
    const last = S.webHist[S.webHist.length - 1];
    if (!last || last.screen !== cur.screen || last.tab !== cur.tab) {
      S.webHist.push(cur);
      if (S.webHist.length > 24) S.webHist.shift();
    }
  }
  S.screen = screen;
  S.wallFresh = null;
  S.wallNav = (S.wallNav || 0) + 1;
  if (extra.tab) S.tab = extra.tab;
  else if (screen === "ad" || screen === "wall" || String(screen).indexOf("wall-") === 0) S.tab = "wall";
  else S.tab = "house";
  if ("listing" in extra) S.listing = extra.listing;
  if ("wallWho" in extra) S.wallWho = extra.wallWho;
  if ("forumId" in extra) S.forumId = extra.forumId;
  if ("newsId" in extra) S.newsId = extra.newsId;
  if ("adId" in extra) S.adId = extra.adId;
  if ("query" in extra) S.query = extra.query;
  if ("filter" in extra) S.listFilter = extra.filter;
  if (extra.search) flag("searched", true);
  draw();
}

function webBack() {
  const prev = (S.webHist || [])[S.webHist.length - 1];
  if (!prev) return;
  if (holdForPost(prev.screen)) return;
  S.webHist.pop();
  S.screen = prev.screen;
  S.tab = prev.tab;
  S.listing = prev.listing;
  S.wallWho = prev.wallWho;
  S.forumId = prev.forumId;
  S.newsId = prev.newsId;
  S.adId = prev.adId;
  S.query = prev.query;
  S.listFilter = prev.listFilter || "all";
  draw();
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
  });
}

function renderWeb() {
  rememberWebScroll();
  sfxWebOpen();
  clearStage();
  const inner = webInner();
  const wallish = S.tab === "wall" || S.screen === "ad" || String(S.screen).indexOf("wall-") === 0;
  stage.append(laptop(inner, { tab: wallish ? "wall" : "house", addr: webAddr() }));
  if (S.modal) stage.append(S.modal);
  else offerSlate();
  renderPlaybar();
  applyWebScroll();
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
  };
  return map[S.screen] || "http://28house.hk/";
}

function webInner() {
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
    hkNavItem(W("forum"), "forum"),
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
  if (postedHelp() && helpRepliesOpen() && !(typeof noted === "function" && noted("bbs-self"))) {
    mainKids.unshift(siteNotice(T("讨论区通知", "论坛通知"), [
      el("p", {}, [
        T("你在「求助」的帖子有新回复。", "你在「求助」的帖子有新回复。"),
        "　",
        webLink(T("查看帖子", "查看帖子"), () => goWeb("thread", { forumId: "helpzhang" })),
      ]),
    ]));
  } else if (postedHelp() && !flag("sawOwnPost")) {
    mainKids.unshift(siteNotice(T("讨论区通知", "论坛通知"), [
      el("p", {}, [
        T("你在「求助」的帖子有新回复。", "你在「求助」的帖子有新回复。"),
        "　",
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
      el("p", {}, [
        T("周先生回复了你。", "周先生回复了你。"),
        "　",
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
    el("p", { class: "hint" }, [W("recentSearch")]),
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
  const opened = countHelpSearch();
  goWeb("list", { search: true });
  if (opened) {
    showPrompt(
      T("求助帖有新回复。", "求助帖有新回复。"),
      T("藤先生和后面几层刚出现。回到讨论区查看。", "藤先生和后面几层刚出现。回到论坛查看。")
    );
  } else if (S.query.trim() && !filtered().length) showPrompt(W("emptySearch"), W("emptySearchBody"));
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
        S.query = d;
        S.listFilter = "all";
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
        showPrompt(T("已从我的收藏移除。", "已从我的收藏移除。"));
      } else {
        S.favs.push(l.id);
        draw();
        showPrompt(T("已加入我的收藏。", "已加入我的收藏。"), T("右上角「收藏」可再打开。", "右上角「收藏」可再打开。"));
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
      cards.append(listingCard(l));
      cards.append(el("p", { class: "fine fav-row" }, [
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
  const bodyY = "最短租约一年。约睇楼须先过一个月订金，唔过订唔约。本站不负责订金。";
  const bodyZ = "最短租约一年。预约看房须先交一个月订金，不交订不约。本站不负责订金。";
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
        [T("放盘", "发布"), [l.date, "　", T("浏览", "浏览"), " ", l.views]],
        [T("业主", "房东"), l.owner],
      ]),
      el("p", {}, [T("上手住客评语只剩一句：「夜里听得到隔壁。」天花有水渍。相片是空房。", "上一位住客评语只剩一句：「夜里能听到隔壁。」天花板有水渍。照片是空房。")]),
      el("p", { class: "fine" }, [T("地点近奥海城，空房可即睇——条款写在上面。", "地点近奥海城，空房可即看——条款写在上面。")]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn", type: "button", onclick: () => {
          strikeFour(bodyY, listingShort(l));
          showPrompt(T("业主已回覆。", "房东已回复。"), body);
        } }, [W("bookView")]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, [W("backList")]),
        favBtn(l),
      ]),
    ]),
  ]);
}

function detailTw() {
  const l = listingById("tw");
  const bodyY = "请先提供在职证明及担保人资料，再安排睇楼。本盘不接受周租。";
  const bodyZ = "请先提供在职证明及担保人资料，再安排看房。本盘不接受按周付租。";
  return el("div", { class: "detail hk-detail" }, [
    imgSlot(l.img, "photo-lg", Ty(l, "title")),
    el("div", { class: "kv" }, [
      el("h2", {}, [Ty(l, "title")]),
      el("p", { class: "rent-line" }, [rentLabel(l)]),
      el("p", { class: "fine" }, [T("编号", "编号"), " 28WU-20140730-088　", W("agent")]),
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
            strikeFour(bodyY, listingShort(l));
            showPrompt(T("代理已回覆。", "中介已回复。"), T(bodyY, bodyZ));
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
    [T("地区", "地区"), l.district + "　／　" + l.area],
    [T("面积", "面积"), Ty(l, "nfa")],
    [T("楼龄", "楼龄"), Ty(l, "age")],
    [T("交通", "交通"), Ty(l, "walk")],
    [T("放盘", "发布"), [l.date, "　", T("浏览", "浏览"), " ", l.views]],
    [T("业主", "房东"), l.owner],
  ].concat((l.specs || []).map(([k, v]) => [k, v]));
  const kids = [
    imgSlot(l.img, "photo-lg", Ty(l, "title")),
    el("div", { class: "kv" }, [
      el("h2", {}, [Ty(l, "title")]),
      el("p", { class: "rent-line" }, [rentLabel(l)]),
      el("p", { class: "fine" }, [T("编号", "编号"), " ", l.code, "　", l.agent ? W("agent") : W("ownerLet")]),
      specTable(rows),
      el("p", {}, [Ty(l, "blurb")]),
      el("p", { class: "fine" }, [T("本站不负责口头协议。条款以业主或代理回覆为准。", "本站不负责口头协议。条款以房东或中介回复为准。")]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn",
          type: "button",
          onclick: () => {
            strikeFour(l.failBody, listingShort(l));
            showPrompt(Ty(l, "failTitle") || T("已回覆。", "已回复。"), Ty(l, "failBody"));
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
      el("p", { class: "fine" }, ["编号 28WU-20140728-004　业主自让"]),
      specTable([
        ["地址", "九龙深水埗荣汇街 28 号　4 楼后座"],
        ["面积", l.nfa + "　／　建筑约 380 呎（业主自报，未量）"],
        ["楼龄", l.age + "　无电梯　铁窗"],
        ["交通", l.walk],
        ["同层", "业主自住前座。后座独立厨厕。"],
        ["放盘", l.date + "　浏览 " + l.views],
      ]),
      el("p", {}, [
        "业主",
        webLink("周先生", () => goWeb("landlord")),
        "　独居　自己放盘　上次上线 " + (flag("sawMail") ? "08-01 09:12" : "07-28 22:17") + "　浏览 " + l.views,
      ]),
      sspRented() ? siteNotice("盘源状态", [el("p", {}, ["业主已标示：已租出（08-01）。"])]) : "",
      el("div", { class: "actions" }, [
        sspRented() ? "" : el("button", { class: "btn", type: "button", onclick: () => goViewing(false) }, [
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
        el("h3", { class: "sec-h" }, ["盘源留言板（2）"]),
      el("p", { class: "bbs-line" }, ["过路人　07-29：「厅角嗰架车系卖屋送定自己留？」　——　业主未回。"]),
      el("p", { class: "bbs-line" }, ["深水埗住开　07-30：「问清楚周租点计，同埋锁住嗰间入唔入租。」"]),
      el("label", { class: "remark-label" }, ["备注（仅自己可见）", remark]),
    ]),
  ]);
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
const PM_DRAFT = "周生，荣汇街 28 号 4 楼后座，我想预约睇楼。现金、口头得。我需要一个能住的地方。听日下昼得唔得？";

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
    showPrompt("请填写讯息内容。");
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
    { plate: pic(1, "场景-过场-快餐店"), lum: 0.34 }
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
    el("p", { class: "mail-meta" }, ["收件人：周先生　　主旨：荣汇街 28 号后座　预约睇楼"]),
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
    note("zhou-reply", "周先生回了留言。今日下昼。旧嘢如果怕，可以叫他把相收起。");
  }
  const body = [];
  body.push(
    el("h2", { class: "sec-h" }, ["站内留言"]),
    el("p", { class: "fine" }, ["廿八屋会员留言。对方上线后才会看到。"])
  );
  if (flag("sawMail")) {
    body.push(
      el("div", { class: "site-msg pending" }, [
        el("p", { class: "mail-meta" }, ["07-31 23:14　你 → 周先生　　预约睇楼"]),
        el("div", { class: "mail-body" }, [S.pmSent || PM_DRAFT]),
      ]),
      el("div", { class: "site-msg in" }, [
        el("p", { class: "mail-meta" }, ["08-01 09:12　周先生　回复了你"]),
        el("div", { class: "mail-body" }, ["今日下昼得。我喺度等。简介写过屋内有旧嘢，你见过怕就同我讲，相可以收起一部分。"]),
      ]),
      el("div", { class: "actions" }, [
        sspRented() ? "" : el("button", { class: "btn", type: "button", onclick: () => goViewing(true) }, ["赴约看房"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["返回荣汇街后座"]),
      ])
    );
  } else if (flag("askedOld")) {
    body.push(
      el("div", { class: "site-msg pending" }, [
        el("p", { class: "mail-meta" }, ["07-31 23:14　你 → 周先生　　未读"]),
        el("div", { class: "mail-body" }, [S.pmSent || PM_DRAFT]),
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
      class: "forum-row" + (t.user === "阿琪V" ? " forum-mine" : ""),
      onclick: () => goWeb("thread", { forumId: id }),
    }, [
      el("span", { class: "board" }, [boardLabel(t.board)]),
      el("span", { class: "forum-main" }, [
        el("span", { class: "ftitle" }, [Ty(t, "title")]),
        prev ? el("span", { class: "fprev" }, [T("末回：", "末回："), prev]) : "",
      ]),
      el("span", { class: "fmeta" }, [
        el("span", { class: "fwho" }, [who, "　", when]),
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
        "　", boardLabel(hp.board), T("　回复 ", "　回复 "), n,
      ]),
    ]));
  }
  const fresh = unreadSerial();
  if (fresh) {
    const t = THREADS[fresh];
    kids.push(siteNotice(T("杂谈有新回复", "闲聊有新回复"), [
      el("p", {}, [
        webLink(Ty(t, "title"), () => goWeb("thread", { forumId: fresh })),
        "　" + threadTime(fresh),
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
    if (replies.some((r) => r.user === "藤先生")) note("serial2", "第二帖底下，藤先生只留一句：你写低。下星期再讲。");
  }
  if (S.forumId === "wk3") {
    flag("sawWk3", true);
    note("serial3", "第三帖底下，藤先生又没有出声。");
  }
  const floorBlock = (no, metaKids, bodyKids) => el("div", { class: "mail-body floor" }, [
    el("p", { class: "mail-meta" }, [
      el("span", { class: "floor-no" }, ["#" + no]),
      "　",
      ...metaKids,
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
    return floorBlock(i + 2, [r.user, T("　回复于 ", "　回复于 "), r.time], bodyKids);
  });
  return houseShell([
    el("h2", { class: "sec-h thread-h" }, [
      el("span", { class: "board" }, [boardLabel(t.board)]),
      " ",
      Ty(t, "title"),
    ]),
    floorBlock(1, [t.user, T("　发表于 ", "　发表于 "), threadTime(tid)], [
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
    el("p", {}, ["租住权合约应按《印花税条例》加盖印花。即使先以口头谈妥、其后补书面纪录，原则上仍须加盖。未加盖印花的文书，一旦出现欠租、提早收回等争议，民事程序中可能不被接纳为证据。印花税由业主或租客缴付可自行约定，加盖责任属双方。查询可向税务局印花税署。"]),
    el("h3", { class: "sec-h" }, ["二、口头协议"]),
    el("p", {}, ["双方若已就租金、年期及交收达成一致，即使未签书面租约，在香港亦可构成租住权。举证则视乎交租纪录、讯息往来、证人等。本站仍建议尽量书面写明起租日、通知期及交租方式。"]),
    el("h3", { class: "sec-h" }, ["三、业主自让与本站角色"]),
    el("p", {}, ["「业主自让」指业主自行放盘，不经地产代理。睇楼、议价、交钥匙、收按金均由双方直接安排。本站只提供分类广告，不代收款项，不保证盘源，不对成交负责。"]),
    el("p", {}, ["交租方式（月结、周结、转账或现金）由双方约定。市场常见为两个月按金加一个月上期；亦有业主按周计租。即时交收钥匙并不罕见，仍建议先点齐屋况并拍照。"]),
    el("h3", { class: "sec-h" }, ["四、出租范围与屋内物件"]),
    el("p", {}, ["租约应列明出租范围（例如整层、后座、套房）。阁楼、工人房、储物室、天台、后楼梯等若未写进合约，一般不视为租客专用范围。屋内家具、杂物、私人用品如非订明随楼附送，产权仍属业主；搬入前宜与业主点齐。"]),
    el("p", { class: "fine" }, ["个案情况请自行向律师查询。本页如与现行法例不符，以法例为准。"]),
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
    mud: ["web-zhou", "2012年9月。妻儿遇难。周说是天意。土木署：雨后斜坡失稳。"],
    urb: ["web-ura", "荣汇街在研究名单。业主将获补偿。"],
    kimon: ["kimon-bio", "网上履历：罗启明，维港大学医科，二〇〇五年毕业。没有二〇〇四年。没有十一月。"],
    yu04: ["yu-old", "校报旧闻：二〇〇四年十一月，女学生坠楼。名字涂掉，露出一个鱼。男友姓罗。"],
  }[id];
  if (!kept) return;
  note(kept[0], kept[1]);
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
    || ((id === "kimon" || id === "yu04") && typeof flag === "function" && flag("askedFishLuo"));
  return houseShell([
    el("h2", { class: "sec-h" }, [n.title]),
    el("p", { class: "mail-meta" }, [n.date + "　来源：本站编辑部／公开文件节录"]),
    el("div", { class: "mail-body" }, [n.body]),
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
    el("p", {}, ["你已登入：章慧琪　（vicky_c　注册 2013）"]),
    el("p", {}, ["上次登入：" + (clockHasHm() ? webAgo(new Date(clockDate().getTime() - 4 * 60000)) : "今天") + "　IP 已隐藏"]),
    el("p", { class: "hint" }, ["此浏览器已记住登入状态。"]),
    postedHelp()
      ? siteNotice("刊登记录", [
        el("p", {}, [
          "求助帖 1 篇。"
            + (flag("serial1") ? "　杂谈 " + ["serial1", "serial2", "serial3"].filter((k) => flag(k)).length + " 篇。" : ""),
          "　",
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

function openSerialDraft(id) {
  S.pendingPost = id;
  S.talk = null;
  S.mode = "web";
  S.tab = "house";
  S.screen = "post";
            draw();
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
    el("h2", { class: "sec-h" }, [W("forum"), "　", board]),
    el("p", { class: "hint" }, [W("draftHint")]),
    el("p", { class: "mail-meta" }, [T("版块：", "版块："), board, T("　署名：", "　署名："), "阿琪V"]),
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
        T("版块：", "版块："), board, T("　署名：", "　署名："), "阿琪V", T("　刊登：", "　发布："), hp.time,
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
    el("h2", { class: "sec-h" }, [W("myPost"), "　", W("bump")]),
    siteNotice(T("系统通知", "系统通知"), [
      el("p", {}, [T("已顶帖。求助帖重新排在讨论区「求助」版上方，可查看原文及回复。", "已顶帖。求助帖重新排在论坛「求助」版上方，可查看原文及回复。")]),
      el("p", {}, [webLink(T("查看帖子", "查看帖子"), () => goWeb("thread", { forumId: "helpzhang" }))]),
    ]),
  ], [{ text: W("home"), go: () => goWeb("home") }, { text: W("freePost") }]);
}

function viewLandlord() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["业主档案　周先生"]),
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

// 「回应」在帖子底下展开预制草稿，不弹网页提示
function wallAnswer(e) {
  if (e.mute) {
    tip(e.mute);
    return;
  }
  if (!e.answer || !e.answer.length) return;
  if (wallDrafting(e)) S.wallDraft = null;
  else S.wallDraft = { id: e.id, i: 0 };
  draw();
}

function wallDraftBox(e) {
  const list = e.answer || [];
  if (!list.length) return null;
  const i = Math.max(0, Math.min((S.wallDraft && S.wallDraft.i) || 0, list.length - 1));
  const a = list[i];
  const picks = list.length > 1
    ? el("div", { class: "wall-draft-picks" }, list.map((opt, idx) => el("button", {
      type: "button",
      class: "wall-draft-pick" + (idx === i ? " on" : ""),
      onclick: () => { S.wallDraft = { id: e.id, i: idx }; draw(); },
    }, [opt.text])))
    : "";
  return el("div", { class: "wall-draft" }, [
    picks,
    el("div", { class: "wall-draft-box" }, [
      el("span", { class: "wall-draft-who" }, ["章慧琪"]),
      el("p", { class: "wall-draft-text" }, [a.text]),
    ]),
    el("div", { class: "wall-draft-acts" }, [
      el("button", { type: "button", class: "wall-draft-send", onclick: () => wallSendAnswer(e, a) }, ["发送"]),
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
  if (!key) return [typeof toHkTrad === "function" ? toHkTrad(String(text || "")) : text];
  let at = String(text).indexOf(key);
  if (at < 0 && typeof toHkTrad === "function") {
    const tk = toHkTrad(key);
    at = String(text).indexOf(tk);
    if (at >= 0) key = tk;
  }
  if (at < 0) return [typeof toHkTrad === "function" ? toHkTrad(String(text || "")) : text];
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
  const b = document.getElementById("playbar-house");
  if (b) b.classList.toggle("has-new", n > 0 && S.mode !== "web" && !S.paused);
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
  const trad = (s) => (typeof toHkTrad === "function" ? toHkTrad(s) : s);
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
  if (S.level >= 7) out.unshift({ who: "ming", name: "罗启明", via: "共同好友：陈家豪" });
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
  const wrap = el("div", { class: "hk-site wall-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-grid" }, [feed, side]));
  return wrap;
}

function wallAdCta(a) {
  return el("button", {
    class: "wall-ad-cta",
    type: "button",
    onclick: () => showPrompt(T("未能完成", "未能完成"), a.ctaFail ? hkAd(a.ctaFail) : T("请稍后再试。", "请稍后再试。")),
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
    el("p", { class: "wall-ad-meta" }, [T("外站广告商　电邮已失效", "外站广告商　邮箱已失效")]),
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
  return typeof toHkTrad === "function" ? toHkTrad(String(s)) : String(s);
}

function viewAdShop(a) {
  return wallAdShell([
    el("p", { class: "wall-ad-sponsor" }, [T("赞助内容", "赞助内容")]),
    el("p", { class: "wall-ad-meta" }, [T("外站广告　非墙簿官方", "外站广告　非墙簿官方")]),
    el("div", { class: "wall-ad-floor" }, [
      el("h2", { class: "wall-ad-h" }, [hkAd(a.head)]),
      el("p", { class: "wall-ad-sub" }, [hkAd(a.sub)]),
      wallKv((a.rows || []).map(([k, v]) => [hkAd(k), hkAd(v)])),
    ]),
    a.note ? el("div", { class: "wall-ad-floor muted" }, [el("p", { class: "fine" }, [hkAd(a.note)])]) : "",
    el("div", { class: "wall-ad-acts" }, [wallAdCta(a)]),
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
    el("p", { class: "wall-ad-meta" }, [T("外站广告　非墙簿官方", "外站广告　非墙簿官方")]),
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
  const sheet = el("div", { class: "sheet prompt wall-photo-sheet" }, [
    el("h3", {}, [title]),
    imgSlot(id, "photo-lg", title),
    el("button", { class: "wall-ad-cta ghost", type: "button", onclick: close }, ["合上"]),
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
    wallAlbum("相册「手机」　2 张", [
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

function viewWallMail() {
  const mails = wallShown(WALL_MAIL);
  const fresh = wallFresh("wall-mail", wallMailKeys());
  const rows = mails.map(({ e, t }) => el("div", { class: "wall-mail" + (fresh.includes(e.id) ? " fresh" : "") }, [
    el("p", { class: "wall-mail-meta" }, [
      webLink(e.name, wallWhoGo(e.who)),
      fresh.includes(e.id) ? el("em", { class: "post-new" }, ["新"]) : "",
      el("span", {}, [webAgo(t)]),
    ]),
    el("p", {}, wallNoteParts(Ty(e, "text"), e)),
    ...wallReplies(e).map((x) => {
      const kids = [el("b", {}, [x.r.name]), "："];
      const key = wallNoteKey(e);
      const replyShow = x.r.zh != null ? T(x.r.text, x.r.zh) : hkAd(x.r.text);
      if (key && (String(replyShow).includes(key) || (typeof toHkTrad === "function" && String(replyShow).includes(toHkTrad(key))))) {
        kids.push(...wallNoteParts(replyShow, e));
      } else kids.push(replyShow);
      return el("p", { class: "post-reply" + (fresh.includes(x.key) ? " fresh" : "") }, kids);
    }),
    wallActions(e, hkAd("回复")) || "",
  ]));
  return wallProfile(hkAd("墙簿收件箱"), rows.length ? rows : [hkAd("没有讯息。")]);
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
      wallAlbum("相册「年夜饭」　3 张", [
        { id: pic(1, "墙簿/陈美娟-开席"), cap: "开席" },
        { id: pic(1, "墙簿/陈美娟-敬茶"), cap: "敬茶" },
        { id: pic(1, "墙簿/陈美娟-水果"), cap: "水果" },
      ]),
      wallShown(WALL_FEED).some((x) => x.e.id === "mei-meal")
        ? wallAlbum("相册「星期日」　1 张", [{ id: pic(9, "示意-午饭"), cap: "星期日" }])
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
      wallAlbum("相册「旧相」　2 张", [
        { id: pic(1, "墙簿/阿乐-夜里"), cap: "夜里" },
        { id: pic(1, "墙簿/阿乐-落街"), cap: "落街" },
      ]),
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
    return wallProfile("陈家豪", [
      "姐夫。督察。已婚。",
      "妻子：陈美娟",
      wallAlbum("相册「旅行」　2 张", [
        { id: pic(1, "墙簿/陈家豪-渡轮"), cap: "渡轮" },
        { id: pic(1, "墙簿/陈家豪-沙滩"), cap: "沙滩" },
      ]),
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
      "共同好友：陈家豪",
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
