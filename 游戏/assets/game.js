(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const stage = $("#stage");
  const clockEl = $("#clock");
  const placeEl = $("#hud-place");
  const notesList = $("#notes-list");
  const notesLayer = $("#notes-layer");
  const notesIndex = $("#notes-index");
  const notesLeaf = $("#notes-leaf");
  const notesActions = $("#notes-actions");

  const initial = () => ({
    time: "2014年7月31日 周四 23:14",
    mode: "web",
    tab: "house",
    screen: "post",
    query: "元朗 天水围",
    listFilter: "all",
    listing: null,
    modal: null,
    flags: {},
    slateOff: {},
    notes: [],
    evidence: [],
    remark: "我需要一个能住的地方。",
    pmBody: "",
    pmSent: "",
    webHist: [],
    wallWho: "",
    forumId: "",
    pendingPost: "",
    newsId: "",
    newsSeen: {},
    talk: null,
    calSeen: {},
    night: { phase: 0, car: "窗", recording: false, print: false },
    chat: [],
    chatPack: "",
    chatLogs: {},
    clinicLooked: {},
    wait: null,
    place: "nowhere",
    known: {},
    chatHist: false,
    chatQuery: "",
  });

  let S = initial();
  let nightTick = null;

  function setTime(t) {
    S.time = t;
    renderHud();
  }

  function renderHud() {
    if (clockEl) clockEl.textContent = S.time || "";
    renderWeek();
    if (placeEl) {
      const rec = S.mode === "night" && S.night && S.night.recording ? "（录音中）" : "";
      placeEl.textContent = hudPlace() + rec;
    }
  }

  function hudPlace() {
    if (typeof syncPlace === "function") syncPlace();
    if (typeof placeLine !== "function") return "";
    return placeLine(S.place);
  }

  function storyDay() {
    const m = /(\d+)月(\d+)日/.exec(S.time || "");
    if (!m) return 0;
    return Number(m[1]) * 100 + Number(m[2]);
  }

  function weekLine() {
    if (S.mode === "end") return "";
    const has = (id) => S.notes.some((n) => n.id === id);
    const day = storyDay();
    if (has("delay")) {
      return day >= 907
        ? "他说明天把笔记整理给我。不要上天台。"
        : "他说明天把笔记整理给我。今晚开灯睡。不要上天台。";
    }
    if (has("clinic4")) return "今晚他上门。不带药。不过夜。";
    if (has("clinic3")) return "下星期六，9月6日 16:00。纸还要带。多写：车转了几次、人在哪间房、水喉隔多久滴一次。";
    if (has("clinic2")) return "下星期六，8月30日 16:00。写下头两周不会动的，和十五号才开始的。";
    if (has("like") || flag("serial1")) return "下星期六，8月23日 16:00。带录音，和记下的纸。";
    if (flag("clinicAddr") && day && day < 816) return "明天 16:00，湾仔澄心诊所。罗启明。";
    return "";
  }

  function renderWeek() {
    const box = document.getElementById("week-box");
    const line = document.getElementById("week-line");
    if (!box || !line) return;
    const text = weekLine();
    box.hidden = !text;
    line.textContent = text;
  }

  function note(id, text) {
    if (S.notes.some((n) => n.id === id)) return;
    S.notes.push({ id, text });
    renderNotes();
  }

  function hasEvidence(id) {
    return (S.evidence || []).some((e) => e.id === id);
  }

  function fileEvidence(item) {
    S.evidence = S.evidence || [];
    if (S.evidence.some((e) => e.id === item.id)) return false;
    S.evidence.push(item);
    renderNotes();
    return true;
  }

  function renderNotes() {
    notesList.innerHTML = "";
    if (!S.notes.length) {
      const li = document.createElement("li");
      li.textContent = "还没有记下。";
      notesList.appendChild(li);
    } else {
    S.notes.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n.text;
      notesList.appendChild(li);
    });
    }
    const box = document.getElementById("evidence-list");
    if (!box) return;
    box.innerHTML = "";
    const items = S.evidence || [];
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = "还没有。";
      box.appendChild(li);
      return;
    }
    items.forEach((item) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "evidence-open";
      btn.textContent = item.kind + "　" + item.title;
      btn.onclick = () => showDiarySheet(item, { canFile: false, fromIndex: true });
      li.appendChild(btn);
      box.appendChild(li);
    });
    renderWeek();
  }

  function flag(k, v) {
    if (v === undefined) return !!S.flags[k];
    S.flags[k] = v;
    renderWeek();
  }

  const mapLayer = $("#map-layer");

  $("#notes-toggle").onclick = () => toggleNotes();
  $("#map-toggle").onclick = () => openMap();
  $("#map-close").onclick = () => closeMap();
  mapLayer.addEventListener("click", (e) => {
    if (e.target === mapLayer) closeMap();
  });
  if (notesLayer) {
    notesLayer.addEventListener("click", (e) => {
      if (e.target !== notesLayer) return;
      if (S.diaryLeaf) dismissDiaryLeaf();
      else closeNotes();
    });
  }

  const playbarEl = $("#playbar");
  const playbarHouse = $("#playbar-house");
  const playbarNotes = $("#playbar-notes");
  const playbarMap = $("#playbar-map");
  const playbarAdvance = $("#playbar-advance");

  if (playbarNotes) playbarNotes.onclick = () => toggleNotes();
  if (playbarMap) playbarMap.onclick = () => openMap();

  function playReturnLabel() {
    const p = S.paused;
    if (!p) return "";
    if (p.mode === "night") return "回到后座";
    if (p.mode === "wait") return "回到" + ((S.wait && S.wait.title) || "等待");
    if (p.mode === "search") return "回到等阿明";
    if (p.mode === "clinic") return "回到诊室";
    if (p.mode === "talk" && p.talk) return "回到" + (p.talk.loc || "对话");
    if (p.mode === "cal") return "回到两周";
    return "回到刚才";
  }

  function openHouseFromScene() {
    if (S.mode === "web" && !S.paused) return;
    if (S.mode === "wait") openRental();
    else browseFromScene("home");
  }

  function splitGo(label) {
    const parts = String(label || "").split("　").filter(Boolean);
    if (parts.length >= 3) return { when: parts[0] + "　" + parts[1], where: parts.slice(2).join("　") };
    if (parts.length === 2) return { when: parts[0], where: parts[1] };
    return { when: "", where: parts[0] || "继续" };
  }

  function playAdvanceAction() {
    if (S.paused) return null;
    if (S.mode === "wait" && S.wait) {
      return Object.assign(splitGo(S.wait.btn || "继续"), { fn: S.wait.go });
    }
    if (S.mode === "search") {
      return { when: "9月7日　夜", where: "荣汇街门口", fn: mingReturn };
    }
    if (S.mode === "clinic") {
      return { when: "8月16日　16:00", where: "澄心候诊", fn: () => clinicArrival(1, clinicTalk) };
    }
    if (S.mode === "cal") {
      return { when: "8月14日　傍晚", where: "荣汇街后座", fn: startChange };
    }
    return null;
  }

  function renderPlaybar() {
    if (!playbarEl) return;
    renderHud();
    if (S.mode === "end") {
      playbarEl.hidden = true;
      return;
    }
    playbarEl.hidden = false;

    if (playbarHouse) {
      if (S.paused) {
        playbarHouse.textContent = playReturnLabel();
        playbarHouse.className = "return";
        playbarHouse.disabled = false;
        playbarHouse.onclick = closeRental;
      } else if (S.mode === "web") {
        playbarHouse.textContent = "廿八屋";
        playbarHouse.className = "here";
        playbarHouse.disabled = true;
        playbarHouse.onclick = null;
      } else {
        playbarHouse.textContent = "廿八屋";
        playbarHouse.className = "";
        playbarHouse.disabled = false;
        playbarHouse.onclick = openHouseFromScene;
      }
    }

    const adv = playAdvanceAction();
    if (playbarAdvance) {
      const whenEl = playbarAdvance.querySelector(".go-when");
      const whereEl = playbarAdvance.querySelector(".go-where");
      if (adv && adv.fn) {
        playbarAdvance.hidden = false;
        if (whenEl) whenEl.textContent = adv.when || "";
        if (whereEl) whereEl.textContent = adv.where || "";
        playbarAdvance.setAttribute("aria-label", "往下，" + [adv.when, adv.where].filter(Boolean).join("，"));
        playbarAdvance.onclick = adv.fn;
      } else {
        playbarAdvance.hidden = true;
        playbarAdvance.onclick = null;
      }
    }
  }

  function clearStage() {
    stage.innerHTML = "";
    stage.onclick = null;
    syncPlace();
    if (mapLayer && !mapLayer.hidden) renderMap();
  }

  function el(tag, attrs = {}, kids = []) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) n.setAttribute(k, "");
      else if (v !== false && v != null) n.setAttribute(k, v);
    });
    kids.forEach((c) => n.append(c));
    return n;
  }

  function imgSlot(id, className, alt) {
    const wrap = el("div", {
      class: "img-slot missing " + (className || ""),
      "data-img": id,
    });
    const mark = el("span", { class: "img-mark" }, ["待补图，" + id]);
    const image = document.createElement("img");
    image.alt = alt || id;
    image.draggable = false;
    const reveal = () => {
      if (!image.naturalWidth) return;
      image.hidden = false;
      wrap.classList.remove("missing");
    };
    image.addEventListener("load", reveal);
    image.addEventListener("error", () => {
      if (image.naturalWidth) return;
      wrap.classList.add("missing");
      image.hidden = true;
    });
    wrap.append(image, mark);
    image.src = "../图/游戏/" + id + ".png?v=20260925zb";
    if (image.complete) reveal();
    return wrap;
  }

  const WHO_IMG = {
    周: "01-sil-zhou",
    章慧琪: "01-sil-zhang",
    陈家豪: "01-sil-chen",
    罗启明: "01-sil-ming",
    陈美娟: "01-sil-mei",
    美娟: "01-sil-mei",
    阿乐: "01-sil-lok",
  };

  function locImg(loc) {
    if (!loc) return "";
    if (loc.includes("天台")) return "01-roof";
    if (loc.includes("楼梯")) return "01-view-stair";
    if (loc.includes("候诊")) return "01-clinic-waiting";
    if (loc.includes("澄心")) return "01-clinic-room";
    if (loc.includes("门口")) return "01-view-door";
    if (loc.includes("美娟家")) return "01-view-mei";
    if (loc.includes("荣汇") || loc.includes("后座")) return "01-view-interior";
    if (loc.includes("电话") || loc.includes("来电") || loc.includes("拨出") || loc.includes("隔门")) return "01-phone-999";
    return "";
  }

  /* ---------- 廿八屋 / 墙簿 ---------- */

  const HK_DISTRICTS = [
    "中西区", "湾仔", "东区", "南区", "油尖旺", "深水埗",
    "九龙城", "黄大仙", "观塘", "荃湾", "葵青", "屯门",
    "元朗", "北区", "大埔", "沙田", "西贡", "离岛",
  ];

  const LISTINGS = [
    {
      id: "tk",
      featured: true,
      title: "大角咀 套房 近奥海城",
      rent: "$8,200",
      sub: "空房发霉，隔音差，业主已下线，07-29",
      keys: ["大角咀", "套房", "平租", "油尖旺", "业主自让"],
      img: "01-listing-tk",
      district: "油尖旺",
      area: "大角咀",
      nfa: "实用约 120 呎",
      age: "楼龄约 30 年",
      walk: "奥海城步行 6 分钟",
      date: "07-29",
      views: 86,
      owner: "陈太（已下线）",
      agent: false,
    },
    {
      id: "tw",
      featured: true,
      title: "荃湾 新楼 两房",
      rent: "$13,800",
      sub: "2009 入伙空关，两按一上，要担保人、粮单，07-30",
      keys: ["荃湾", "新楼"],
      img: "01-listing-tw",
      district: "荃湾",
      area: "荃湾",
      nfa: "实用约 430 呎",
      age: "2009 年入伙",
      walk: "荃湾站步行 4 分钟",
      date: "07-30",
      views: 214,
      owner: "中介代放",
      agent: true,
    },
    {
      id: "ssp",
      featured: true,
      title: "深水埗荣汇街 28 号 4 楼后座",
      rent: "$3,200",
      sub: "业主自住同层，人和善，可即时入住，07-28",
      keys: ["深水埗", "唐楼", "平租", "荣汇街", "业主自让"],
      img: "01-listing-ssp",
      district: "深水埗",
      area: "深水埗",
      nfa: "实用约 280 呎",
      age: "楼龄约 50 年",
      walk: "深水埗站步行约 8 分钟",
      date: "07-28",
      views: 12,
      owner: "周先生",
      agent: false,
    },
    {
      id: "cw",
      title: "上环 套房 近中环",
      rent: "$13,800",
      sub: "写字楼隔篱，两按一上，要粮单，07-30",
      keys: ["中西区", "上环", "中环", "套房"],
      img: "01-listing-cw",
      district: "中西区",
      area: "上环",
      nfa: "实用约 160 呎",
      age: "楼龄约 25 年",
      walk: "上环站步行 3 分钟",
      date: "07-30",
      views: 173,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140730-102",
      specs: [["按金", "两个月按金 + 一个月上期"], ["资格", "要近三个月粮单"]],
      blurb: "1990 年代单幢，套房连细厨。窗外写字楼。日间管理处接待睇楼。",
      failTitle: "代理已回覆。",
      failBody: "请先提供近三个月粮单，再安排睇楼。本盘不接受周租。",
    },
    {
      id: "wc",
      title: "铜锣湾 雅房 包家电",
      rent: "$7,500",
      sub: "板间雅房，只限上班族，07-29",
      keys: ["湾仔", "铜锣湾", "雅房"],
      img: "01-listing-wc",
      district: "湾仔",
      area: "铜锣湾",
      nfa: "实用约 80 呎",
      age: "楼龄约 35 年",
      walk: "铜锣湾站步行 7 分钟",
      date: "07-29",
      views: 241,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140729-056",
      specs: [["资格", "上班族；要公司证明"], ["合住", "与业主亲戚分住客厅"]],
      blurb: "旧楼分间雅房，夹板墙，公共厨房。业主声明不租散工、不租夜班。",
      failTitle: "代理已回覆。",
      failBody: "本盘只限日间上班族。请提供公司在职证明后，再安排睇楼。",
    },
    {
      id: "east",
      title: "北角 一房 海景",
      rent: "$14,800",
      sub: "海景一侧，要担保人、粮单，07-28",
      keys: ["东区", "北角", "一房", "海景"],
      img: "01-listing-east",
      district: "东区",
      area: "北角",
      nfa: "实用约 320 呎",
      age: "楼龄约 20 年",
      walk: "北角站步行 5 分钟",
      date: "07-28",
      views: 198,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140728-077",
      specs: [["按金", "两个月按金 + 一个月上期"], ["资格", "要担保人、要粮单"]],
      blurb: "1990 年代私人楼一房。海景一侧，管理费另计。新租客须经代理审核。",
      failTitle: "代理已回覆。",
      failBody: "请先提供在职证明及担保人资料，再安排睇楼。",
    },
    {
      id: "south",
      title: "薄扶林 分租 一房",
      rent: "$8,200",
      sub: "无港铁，要在职证明，07-27",
      keys: ["南区", "薄扶林", "分租"],
      img: "01-listing-south",
      district: "南区",
      area: "薄扶林",
      nfa: "实用约 90 呎",
      age: "楼龄约 40 年",
      walk: "巴士约 25 分钟到中环",
      date: "07-27",
      views: 64,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140727-033",
      specs: [["交通", "无港铁；以巴士及专线为主"], ["资格", "要在职证明"]],
      blurb: "南区旧楼分租一房，客厅共用。窗外山坡。睇楼请预留巴士时间。",
      failTitle: "代理已回覆。",
      failBody: "请先提供在职证明。本盘不接受即日搬入。",
    },
    {
      id: "mk",
      title: "旺角 板间房 女仔合租",
      rent: "$4,800",
      sub: "夹板分间，要女仔、要担保人，07-30",
      keys: ["油尖旺", "旺角", "合租", "板间房"],
      img: "01-listing-mk",
      district: "油尖旺",
      area: "旺角",
      nfa: "实用约 50 呎",
      age: "楼龄约 45 年",
      walk: "旺角站步行 6 分钟",
      date: "07-30",
      views: 312,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140730-019",
      specs: [["资格", "只限女性；要担保人签署"], ["合住", "三房分租，公共厨厕"]],
      blurb: "旧楼板间房，约一张床位。现住两人。入住前须担保人到场签署。",
      failTitle: "代理已回覆。",
      failBody: "合租须担保人签署。请先提供担保人资料及身份证明，再安排睇楼。",
    },
    {
      id: "mf",
      title: "美孚新邨 一房",
      rent: "$11,800",
      sub: "屋苑管理，要粮单、面试，07-29",
      keys: ["深水埗", "美孚", "美孚新邨", "屋苑"],
      img: "01-listing-mf",
      district: "深水埗",
      area: "美孚",
      nfa: "实用约 310 呎",
      age: "楼龄约 40 年",
      walk: "美孚站步行 8 分钟",
      date: "07-29",
      views: 156,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140729-091",
      specs: [["管理费", "另计"], ["资格", "要粮单；管理处面试"]],
      blurb: "1970 年代大型屋苑一房。马赛克地砖、铁窗，有管理处。不接受口头周租。",
      failTitle: "代理已回覆。",
      failBody: "管理处须先面试，并收取近三个月粮单。本盘不接受口头周租。",
    },
    {
      id: "klnc",
      title: "土瓜湾 两房 唐楼",
      rent: "$8,800",
      sub: "无电梯唐楼，只租家庭户，07-26",
      keys: ["九龙城", "土瓜湾", "唐楼", "业主自让"],
      img: "01-listing-klnc",
      district: "九龙城",
      area: "土瓜湾",
      nfa: "实用约 380 呎",
      age: "楼龄约 50 年",
      walk: "红磡站巴士约 10 分钟",
      date: "07-26",
      views: 49,
      owner: "黄生",
      agent: false,
      code: "28WU-20140726-008",
      specs: [["资格", "只租一家三口或以上"], ["按金", "两个月"]],
      blurb: "未通铁路前的土瓜湾唐楼两房。业主原文：单人免问，要一家人住。",
      failTitle: "业主已回覆。",
      failBody: "本盘只租给家庭户。单人租客请另选其他放盘。",
    },
    {
      id: "wts",
      title: "新蒲岗 工厦套房",
      rent: "$5,800",
      sub: "工厦改装，要先过订才睇楼，07-28",
      keys: ["黄大仙", "新蒲岗", "工厦", "套房"],
      img: "01-listing-wts",
      district: "黄大仙",
      area: "新蒲岗",
      nfa: "实用约 140 呎",
      age: "工厦改装（业主自报）",
      walk: "钻石山站步行 12 分钟",
      date: "07-28",
      views: 88,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140728-044",
      specs: [["睇楼", "须先过订金"], ["用途", "工厦改装，业主自报可住"]],
      blurb: "新蒲岗工厦自行间隔。天花高、日光灯。代理声明有诚意者先过订再睇。本站不对订金负责。",
      failTitle: "代理已回覆。",
      failBody: "业主要求先过订金才安排睇楼。本站不负责订金，请自行决定。",
    },
    {
      id: "kt",
      title: "牛头角 工厦单位",
      rent: "$6,800",
      sub: "工业用途，只接受公司租约，07-27",
      keys: ["观塘", "牛头角", "工厦"],
      img: "01-listing-kt",
      district: "观塘",
      area: "牛头角",
      nfa: "实用约 200 呎",
      age: "工厦",
      walk: "牛头角站步行 5 分钟",
      date: "07-27",
      views: 71,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140727-061",
      specs: [["租约", "公司租约"], ["资格", "要商业登记"]],
      blurb: "观塘工厦空置车间。不作住宅装修。住宅用途请自行向大厦查询。",
      failTitle: "代理已回覆。",
      failBody: "本盘只接受公司租约。请提供商业登记及公司证明。",
    },
    {
      id: "kwai",
      title: "葵涌 套房 近工业区",
      rent: "$6,500",
      sub: "工厦隔篱，要担保人，07-29",
      keys: ["葵青", "葵涌", "套房"],
      img: "01-listing-kwai",
      district: "葵青",
      area: "葵涌",
      nfa: "实用约 130 呎",
      age: "楼龄约 30 年",
      walk: "葵芳站巴士约 10 分钟",
      date: "07-29",
      views: 95,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140729-028",
      specs: [["资格", "要担保人"], ["按金", "两个月按金 + 一个月上期"]],
      blurb: "葵涌旧楼套房，窗外货柜场方向。夜间货车多。代理要求担保人签署。",
      failTitle: "代理已回覆。",
      failBody: "请先提供担保人资料，再安排睇楼。本盘不接受周租。",
    },
    {
      id: "tm",
      title: "屯门 新楼 两房",
      rent: "$9,800",
      sub: "2011 入伙，两按一上，要粮单，07-30",
      keys: ["屯门", "新楼"],
      img: "01-listing-tm",
      district: "屯门",
      area: "屯门",
      nfa: "实用约 400 呎",
      age: "2011 年入伙",
      walk: "屯门站步行 6 分钟",
      date: "07-30",
      views: 187,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140730-053",
      specs: [["按金", "两个月按金 + 一个月上期"], ["资格", "要担保人、要粮单"]],
      blurb: "屯门新市镇私人楼两房，空关。管理处日间有人。不收周租。",
      failTitle: "代理已回覆。",
      failBody: "请先提供在职证明及担保人资料，再安排睇楼。本盘不接受周租。",
    },
    {
      id: "yl",
      title: "天水围 两房",
      rent: "$8,200",
      sub: "新市镇屋苑，要父母担保，07-28",
      keys: ["元朗", "天水围", "两房"],
      img: "01-listing-yl",
      district: "元朗",
      area: "天水围",
      nfa: "实用约 390 呎",
      age: "楼龄约 15 年",
      walk: "天水围站步行 9 分钟",
      date: "07-28",
      views: 132,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140728-039",
      specs: [["资格", "要直系亲属担保"], ["按金", "两个月按金 + 一个月上期"]],
      blurb: "天水围私人屋苑两房。业主只要有父母或兄姊作担保。单人无担保免问。",
      failTitle: "代理已回覆。",
      failBody: "本盘须直系亲属作担保人。请先提供担保人资料，再安排睇楼。",
    },
    {
      id: "north",
      title: "上水 村屋一层",
      rent: "$6,800",
      sub: "村屋一层，要一年长约，07-25",
      keys: ["北区", "上水", "村屋", "业主自让"],
      img: "01-listing-north",
      district: "北区",
      area: "上水",
      nfa: "建筑约 500 呎（业主自报）",
      age: "村屋",
      walk: "上水站专线约 15 分钟",
      date: "07-25",
      views: 41,
      owner: "刘生",
      agent: false,
      code: "28WU-20140725-006",
      specs: [["租约", "最少一年"], ["交通", "村口无车站；上水站转专线约 15 分钟"]],
      blurb: "上水村屋其中一层，瓷砖到顶。睇楼请先约专线。不租短租。",
      failTitle: "业主已回覆。",
      failBody: "本盘最少签一年。短期或即日搬入请另选市区盘。",
    },
    {
      id: "tp",
      title: "大埔 私人屋苑 两房",
      rent: "$12,200",
      sub: "屋苑管理，面试、要粮单，07-29",
      keys: ["大埔", "屋苑", "两房"],
      img: "01-listing-tp",
      district: "大埔",
      area: "大埔",
      nfa: "实用约 420 呎",
      age: "楼龄约 18 年",
      walk: "大埔墟站步行 12 分钟",
      date: "07-29",
      views: 109,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140729-074",
      specs: [["资格", "管理处面试；要粮单"], ["管理费", "另计"]],
      blurb: "大埔私人屋苑两房，1990 年代中期入伙。新租客须经管理处面试。",
      failTitle: "代理已回覆。",
      failBody: "请先提供近三个月粮单，由管理处安排面试后再睇楼。",
    },
    {
      id: "st",
      title: "沙田第一城 一房",
      rent: "$11,500",
      sub: "大型屋苑，要在职证明，07-30",
      keys: ["沙田", "沙田第一城", "屋苑", "一房"],
      img: "01-listing-st",
      district: "沙田",
      area: "沙田",
      nfa: "实用约 300 呎",
      age: "楼龄约 30 年",
      walk: "第一城站步行 3 分钟",
      date: "07-30",
      views: 226,
      owner: "中介代放",
      agent: true,
      code: "28WU-20140730-081",
      specs: [["管理费", "另计"], ["资格", "要在职证明"]],
      blurb: "1980 年代沙田大型屋苑一房。有管理处。租约须交印花。不收周租。",
      failTitle: "代理已回覆。",
      failBody: "请先提供在职证明。本盘不接受口头协议。",
    },
    {
      id: "sk",
      title: "西贡墟 楼上单位",
      rent: "$7,500",
      sub: "墟镇楼上，无港铁，要长约，07-26",
      keys: ["西贡", "西贡墟", "业主自让"],
      img: "01-listing-sk",
      district: "西贡",
      area: "西贡墟",
      nfa: "实用约 220 呎",
      age: "楼龄约 35 年",
      walk: "巴士／小巴；无港铁",
      date: "07-26",
      views: 37,
      owner: "何太",
      agent: false,
      code: "28WU-20140726-012",
      specs: [["交通", "无港铁；睇楼请自行安排"], ["租约", "最少十个月"]],
      blurb: "西贡墟铺楼上，周末街市声。业主只要长约，不租周租。",
      failTitle: "业主已回覆。",
      failBody: "乡郊交通请自行安排。本盘最少十个月，不接受即日搬入。",
    },
    {
      id: "isl",
      title: "东涌 套房",
      rent: "$8,800",
      sub: "机场新市镇，机场员工优先，07-27",
      keys: ["离岛", "东涌", "套房", "业主自让"],
      img: "01-listing-isl",
      district: "离岛",
      area: "东涌",
      nfa: "实用约 150 呎",
      age: "楼龄约 12 年",
      walk: "东涌站步行 9 分钟",
      date: "07-27",
      views: 58,
      owner: "郑生",
      agent: false,
      code: "28WU-20140727-017",
      specs: [["资格", "机场相关从业员优先"], ["按金", "两个月"]],
      blurb: "东涌 2002 年前后私人楼套房。业主原文：做机场或航空公司嗰啲优先。",
      failTitle: "业主已回覆。",
      failBody: "本盘优先租给机场相关从业员。其他职业请先提供在职证明再议。",
    },
  ];

  function listingById(id) {
    return LISTINGS.find((l) => l.id === id) || LISTINGS.find((l) => l.id === "ssp");
  }

  function homeLatest() {
    return ["yl", "tw", "tk"].map((id) => listingById(id));
  }

  const NEWS = {
    rain: {
      date: "2014-07-30",
      title: "本周有骤雨及雷暴　郊游人士须留意天气",
      body: "天文台预计未来数日有骤雨及雷暴，局部地区雨势颇大。市民外出请带备雨具。郊野公园及乡郊斜坡在暴雨期间请避免逗留。",
    },
    school: {
      date: "2014-07-29",
      title: "开学在即　家长留意课本及校服开支",
      body: "新学年将于九月开始。有家长团体提醒尽早比较课本及校服价钱，并留意学校指定供应商安排。教育局称会继续检视课本加幅。",
    },
    heat: {
      date: "2014-07-28",
      title: "天文台发出酷热天气警告　市区气温升至三十三度",
      body: "受高气压支配，本港天气酷热。天文台已发出酷热天气警告，呼吁市民减少户外逗留，多喝水。长者、户外工人及小童尤须注意。",
    },
    mtr: {
      date: "2014-07-25",
      title: "港铁：周末晚间部分列车服务调整",
      body: "港铁表示，本周末晚间部分市区线列车将加密或调整班次，以配合维修工程。乘客请留意月台广播及车站通告，预留额外交通时间。",
    },
    urb: {
      date: "2014-07-22",
      title: "市建局：深水埗指定范围持续研究",
      body: "市区重建局重申，深水埗指定范围仍属研究阶段，未有收地或收购时间表。局方公开页写明下一轮地区咨询暂订八月下旬，详情以局方公布为准。研究范围文字提及荣汇街一带唐楼。文件写业主将获补偿，补偿尚未发放。",
    },
    labour: {
      date: "2014-07-21",
      title: "劳工处提醒户外工人防中暑",
      body: "劳工处呼吁雇主为户外工人提供足够饮水、遮荫及休息时间。如出现头晕、恶心，应立即到阴凉处休息，严重者须求医。",
    },
    food: {
      date: "2014-07-15",
      title: "食环署加强夏季食物巡查",
      body: "食物环境卫生署表示，夏季将加强巡查食肆及街市，重点包括雪柜温度、熟食存放及虫鼠防治。市民选购食物亦须注意冷藏及食用期限。",
    },
    worldcup: {
      date: "2014-07-14",
      title: "世界杯结束　湾仔酒吧街人流回落",
      body: "巴西世界杯决赛结束后，中环兰桂坊、湾仔酒吧街一带人流较赛事期间明显减少。有商户表示一个月生意好过平时，现已回复夏季平常水平。",
    },
    clinic: {
      date: "2014-07-08",
      title: "湾仔夜间专科门诊试验加开",
      body: "医管局表示，部分专科夜间门诊将试验由私家诊所分担，以缩短轮候。参与诊所名单稍后再公布。",
    },
    mud: {
      date: "2013-09-18",
      title: "西贡乡郊山泥倾泻近两年　土木署维持天灾结论",
      body: "（本站转载）西贡十二乡一带前年雨后发生山泥倾泻，造成两人死亡，为同村一户的妻子与儿子。受访业主周姓，称是天意。同场有人送礼。土木工程拓展署其后公布调查，结论维持「雨后斜坡失稳」。公开文件记录现场排水口有淤塞。署方表示个案已结束。",
    },
  };

  function newsIds(limit) {
    const ids = Object.keys(NEWS).sort((a, b) => NEWS[b].date.localeCompare(NEWS[a].date));
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
      el("span", { class: "ftitle" }, [n.title]),
    ]);
  }

  const THREADS = {
    helpzhang: {
      board: "求助",
      title: "散工女 深水埗 急求平租 口头得 人当我神经",
      user: "阿琪V",
      time: "07-22",
      body: "同阿乐分手三个月。短租快到期，表姐沙发不想再坐，前度当我神经。夜里又见到嘢，解释唔清，唔想再被人一个字打发。深水埗长大，求唐楼平租，现金口头，唔好问粮单。有盘直接丢连结。",
      replies: [
        { user: "街坊路过", time: "07-23 11:02", body: "美孚要面试同粮单。散工好难。短租酒店更贵。" },
        { user: "屯门住客", time: "07-25 19:40", body: "我都散工。中介一听粮单就收线。工厦阁楼有时平，不过深水埗我唔熟。" },
        { user: "藤先生", time: "07-29 01:14", body: "有人听得完你讲。廿八屋而家有业主自让，深水埗荣汇街，现金口头。你自己点进去睇。", listing: "ssp" },
        { user: "夜猫", time: "07-30 02:06", body: "旧楼半夜水喉响好正常。你先睡得着再讲租。唔好一惊就搬。" },
      ],
    },
    stamp: {
      board: "租务",
      title: "口头租约无印花，后尾点追？",
      user: "散工阿强",
      time: "07-26",
      body: "朋友话平租可以口头、现金、唔打印花。律师朋友讲：出事先至知无纸。业主自让嗰啲最钟意咁。你租得过今晚，但追不回按金。",
    },
    sspbbs: {
      board: "地区",
      title: "深水埗唐楼平租会唔会中伏",
      user: "北河街街坊",
      time: "07-24",
      body: "后座平一截通常有原因：暗、无电梯、同层住业主。重建研究名单年年传，传完又无事。夜响好正常，老鼠同水管。",
    },
    night: {
      board: "杂谈",
      title: "旧楼夜响好正常",
      user: "住开唐楼",
      time: "07-19",
      body: "水喉、老鼠、隔壁电视。旧楼就系咁。",
    },
    ghost: {
      board: "求助",
      title: "长沙湾后座日日有细路声，问过话冇住人",
      user: "短租过",
      time: "07-20",
      body: "业主话旧物仓，锁住。我听过玩具车辘地。第二日佢话我神经。已搬走。唔好问边栋，我唔想再被寻。",
    },
    wk1: {
      board: "杂谈",
      title: "医生话未听完。返到屋企已经郁咗",
      user: "阿琪V",
      time: "08-17 09:00",
      body: "个医生唔判我有病，亦唔讲有鬼。叫我留低记。我返到，出门前车头朝窗，而家朝门。水喉我未拧，已经滴。我食得落。我冇问题。有问题系间屋。有人肯听完。我未敢写佢名。下星期六我会再去。唔写门牌。",
      replies: [
        { user: "住开唐楼", time: "08-17 09:22", body: "旧楼水管。你又写。" },
        { user: "短租过", time: "08-17 10:05", body: "唔好写门牌。我写过地址，第二日话我神经。" },
        { user: "阿七", time: "08-17 11:18", body: "我留低。下星期你再讲。" },
      ],
    },
    wk2: {
      board: "杂谈",
      title: "离开两分钟先郁。有一夜我冇录音",
      user: "阿琪V",
      time: "08-24 09:40",
      body: "我照医生讲，有一夜关掉录音。去洗面。返来车在地上。我冇声可以畀人。二十号我入厕所两分钟，脚印先出现。我在厅里望住，佢唔郁。我仍然冇问题。有一人肯听完。我未信屋。我靠星期六。",
      replies: [
        { user: "阿七", time: "08-24 10:02", body: "你写离开两分钟。我追。" },
        { user: "住开唐楼", time: "08-24 10:30", body: "停一晚录音，车都郁。都系水管。" },
        { user: "藤先生", time: "08-24 11:14", body: "你写低。下星期再讲。" },
        { user: "短租过", time: "08-24 12:01", body: "有人留一句就走。你小心。" },
      ],
    },
    wk3: {
      board: "杂谈",
      title: "医生要医我。佢话要像人先。下星期六再讲",
      user: "阿琪V",
      time: "08-31 10:05",
      body: "三个星期六。佢先要医我。我话佢唔信。后来佢话更像人，但唔约上门。叫我下星期六再带纸。上门唔系治疗，系佢自己讲过。有人对我好。我不写名。下星期六我还会去。",
      replies: [
        { user: "阿七", time: "08-31 10:40", body: "三个星期。藤先生呢个星期冇出声。下星期六你真的再去？" },
        { user: "住开唐楼", time: "08-31 11:02", body: "医生要医你，先至正常。你唔好叫人夜里上门。" },
        { user: "短租过", time: "08-31 11:36", body: "我搬咗。你仲写。" },
      ],
    },
  };

  function threadVisible(id) {
    if (id === "helpzhang") return postedHelp();
    if (id === "wk1") return flag("serial1");
    if (id === "wk2") return flag("serial2");
    if (id === "wk3") return flag("serial3");
    return true;
  }

  function unreadSerial() {
    if (flag("serial3") && !flag("sawWk3")) return "wk3";
    if (flag("serial2") && !flag("sawWk2")) return "wk2";
    if (flag("serial1") && !flag("sawWk1")) return "wk1";
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

  function holdForPost(screen) {
    if (S.pendingPost) {
      if (screen === "post") return false;
      showPrompt("有内容待发布。", "请先发布，再浏览其他页面。");
      if (S.screen !== "post") {
        S.screen = "post";
        S.tab = "house";
        draw();
      }
      return true;
    }
    if (postedHelp() || screen === "post") return false;
    showPrompt("有内容待发布。", "请先发布，再浏览其他页面。");
    if (S.screen !== "post") {
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
    showPrompt("登出失败。", "网页无回应，请稍后再试。");
  }

  function currentSlate() {
    if (S.mode === "search" && !(S.slateOff || {}).look) {
      return { id: "look", text: "站内新闻可以再翻。" };
    }
    if (S.mode !== "web") return null;
    if (S.pendingPost && S.screen === "post" && !(S.slateOff || {})["draft-" + S.pendingPost]) {
      return { id: "draft-" + S.pendingPost, text: "检查无误后发布。" };
    }
    if (!postedHelp() && S.screen === "post" && !(S.slateOff || {}).start) {
      return { id: "start", text: "检查无误后发布。" };
    }
    return null;
  }

  function offerSlate() {
    const s = currentSlate();
    if (!s || S.modal || document.getElementById("slate")) return;
    const desk = stage.querySelector(".desk");
    if (!desk) return;
    desk.classList.add("has-slate");
    desk.append(el("div", { class: "slate", id: "slate" }, [
      el("span", { class: "slate-k" }, ["提示"]),
      el("p", {}, [s.text]),
      el("button", {
        type: "button",
        class: "slate-ok",
        title: "收起",
        onclick: () => {
          S.slateOff[s.id] = true;
          clearSlate();
        },
      }, ["×"]),
    ]));
  }

  function clearSlate() {
    const n = document.getElementById("slate");
    if (n) n.remove();
    const desk = document.querySelector(".desk");
    if (desk) desk.classList.remove("has-slate");
  }

  function publishHelpPost() {
    flag("postedHelp", true);
    note("bbs-post", "我在廿八屋发了求助帖。");
    clearSlate();
    showPrompt("已收到你的刊登。");
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
      el("span", {}, [(opts.title || (tab === "wall" ? "墙簿" : "廿八屋")) + " - Windows Internet Explorer"]),
      el("span", { class: "window-controls", "aria-hidden": "true" }, ["—　□　×"]),
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
      btnTab("墙簿 - 我的首页", "wall", tab, scene),
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
    goWeb(screen === "wall" ? "wall" : (postedHelp() ? "home" : "post"));
  }

  function openRental() {
    if (S.mode !== "web") {
      S.paused = { mode: S.mode, talk: S.talk, wait: S.wait };
      if (S.mode === "night") stopNightClock();
      S.mode = "web";
    }
    goWeb(postedHelp() ? "forum" : "post");
  }

  function closeRental() {
    const p = S.paused;
    if (!p) return;
    S.paused = null;
    S.mode = p.mode;
    S.talk = p.talk;
    S.wait = p.wait;
    if (p.mode === "night") startNightClock();
    draw();
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
    if (extra.tab) S.tab = extra.tab;
    else if (screen === "ad" || screen === "wall" || String(screen).indexOf("wall-") === 0) S.tab = "wall";
    else S.tab = "house";
    if ("listing" in extra) S.listing = extra.listing;
    if ("wallWho" in extra) S.wallWho = extra.wallWho;
    if ("forumId" in extra) S.forumId = extra.forumId;
    if ("newsId" in extra) S.newsId = extra.newsId;
    if ("query" in extra) S.query = extra.query;
    if ("filter" in extra) S.listFilter = extra.filter;
    if (extra.search) flag("searched", true);
    draw();
  }

  function webBack() {
    if (holdForPost("home")) return;
    const prev = (S.webHist || []).pop();
    if (!prev) return;
    S.screen = prev.screen;
    S.tab = prev.tab;
    S.listing = prev.listing;
    S.wallWho = prev.wallWho;
    S.forumId = prev.forumId;
    S.newsId = prev.newsId;
    S.query = prev.query;
    S.listFilter = prev.listFilter || "all";
    draw();
  }

  function renderWeb() {
    clearStage();
    const inner = webInner();
    const wallish = S.tab === "wall" || S.screen === "ad" || String(S.screen).indexOf("wall-") === 0;
    stage.append(laptop(inner, { tab: wallish ? "wall" : "house", addr: webAddr() }));
    if (S.modal) stage.append(S.modal);
    else offerSlate();
    renderPlaybar();
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
      post: "http://28house.hk/post",
      landlord: "http://28house.hk/user/chow",
      about: "http://28house.hk/about",
      wall: "http://wallbook.hk/home",
      ad: "http://wallbook.hk/ad/teng",
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
    const mail = flag("askedOld") && !flag("sawMail")
      ? (replyReady() ? "站内留言(1)" : "站内留言(待回)")
      : "站内留言";
    return el("div", { class: "site-header" }, [
      el("button", {
        type: "button",
        class: "logo-btn",
        onclick: () => goWeb("home"),
      }, [el("div", { class: "logo", html: "廿八屋<small>香港楼盘　业主自让　2014</small>" })]),
      el("div", { class: "hdr-tools" }, [
        el("span", {}, [S.time.replace("2014年", "")]),
        el("button", { type: "button", class: "btn ghost hdr-btn", onclick: () => goWeb("inbox") }, [mail]),
        el("button", { type: "button", class: "btn ghost hdr-btn", onclick: () => goWeb("login") }, ["章慧琪"]),
      ]),
    ]);
  }

  function houseNav() {
    return el("nav", { class: "hk-nav" }, [
      hkNavItem("首页", "home"),
      hkNavItem("租盘", "list"),
      hkNavItem("讨论区", "forum"),
      hkNavItem("新闻", "news"),
      el("span", { class: "hk-nav-gap" }, ["│"]),
      (() => {
        const btn = hkNavItem("免费刊登", "post");
        if (!postedHelp() || S.pendingPost) btn.className += " quest";
        return btn;
      })(),
      hkNavItem("账户", "login"),
    ]);
  }

  function houseFooter() {
    return el("footer", { class: "hk-footer" }, [
      webLink("租务须知", () => goWeb("rules")),
      " | ",
      webLink("新闻中心", () => goWeb("news")),
      " | ",
      webLink("关于廿八屋", () => goWeb("about")),
      " | ",
      webLink("讨论区", () => goWeb("forum")),
      el("div", {}, ["廿八屋 28House　2011–2014　香港业主自让　不负责成交　请自行查册"]),
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
    return el("p", { class: "fine back-link" }, [webLink("« 返回" + label, fn)]);
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

  function viewHome() {
    const input = el("input", { type: "search", value: S.query, maxlength: "40" });
    input.addEventListener("input", () => { S.query = input.value; });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
    const chips = el("div", { class: "hot-chips" }, [
      el("span", {}, ["热门地区："]),
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
        el("span", {}, [l.title]),
        el("b", {}, [l.rent]),
      ])
    ));
    const news = el("div", { class: "mini-list" }, newsIds(5).map((id) => newsLink(id, true)));
    const mainKids = [chips];
    if (postedHelp() && !flag("sawOwnPost")) {
      mainKids.unshift(siteNotice("讨论区通知", [
        el("p", {}, [
          "你在「求助」的帖子有新回复。",
          "　",
          webLink("查看帖子", () => goWeb("thread", { forumId: "helpzhang" })),
        ]),
      ]));
    }
    const freshHome = unreadSerial();
    if (freshHome) {
      const t = THREADS[freshHome];
      mainKids.unshift(siteNotice("杂谈有新回复", [
        el("p", {}, [
          webLink(t.title, () => goWeb("thread", { forumId: freshHome })),
        ]),
      ]));
    }
    if (flag("askedOld") && replyReady() && !flag("sawMail")) {
      mainKids.unshift(siteNotice("站内留言", [
        el("p", {}, [
          "周先生回复了你。",
          "　",
          webLink("查看", () => goWeb("inbox")),
        ]),
      ]));
    }
    const main = el("div", { class: "hk-main search-hero" }, [
      ...mainKids,
      el("h1", {}, ["搜租盘"]),
      el("div", { class: "search-row" }, [
        input,
        el("button", { type: "button", class: "btn", onclick: doSearch }, ["搜寻"]),
      ]),
      el("p", { class: "hint" }, ["最近搜过：元朗　天水围　／　荃湾　新楼　／　大角咀　套房"]),
      el("div", { class: "home-grid" }, [
        el("section", {}, [el("h2", { class: "sec-h" }, ["最新放盘"]), latest]),
        el("section", {}, [el("h2", { class: "sec-h" }, ["站内新闻"]), news]),
      ]),
    ]);
    const side = el("div", { class: "hk-side" }, [
      sideBox("租务提示", [
        el("p", {}, ["租约应交印花税。未加盖印花，有争议时文件可能不被接纳。"]),
        el("p", {}, ["私人屋苑多见两按一上。业主自让条款各有不同，以双方约定为准。"]),
        webLink("租务须知（摘录）", () => goWeb("rules")),
      ]),
      sideBox("你可能想睇", [
        postedHelp()
          ? webLink("讨论区：散工女急求平租", () => goWeb("thread", { forumId: "helpzhang" }))
          : webLink("免费刊登", () => goWeb("post")),
        el("br"),
        webLink("讨论区：旧楼夜响", () => goWeb("thread", { forumId: "night" })),
        el("br"),
        webLink("市建局研究新闻", () => goWeb("newsitem", { newsId: "urb" })),
      ]),
    ]);
    const wrap = houseShell([el("div", { class: "hk-layout" }, [main, side])], [
      { text: "首页" },
    ]);
    setTimeout(() => input.focus(), 0);
    return wrap;
  }

  function doSearch() {
    if (needPostFirst()) return;
    flag("searched", true);
    goWeb("list", { search: true });
    if (S.query.trim() && !filtered().length) showPrompt("暂无盘。", "没有符合的结果。");
  }

  function listFilterBar() {
    return el("div", { class: "list-filters" }, [
      ["全部", "all"],
      ["业主自让", "owner"],
      ["合租", "share"],
      ["屋苑", "estate"],
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
      cards.append(el("p", { class: "hint" }, ["请输入地区或关键字。"]));
    } else if (!rows.length) {
      cards.append(el("p", { class: "hint" }, ["没有符合的盘。"]));
    } else {
      rows.forEach((l) => {
        cards.append(el("button", {
          class: "card",
          type: "button",
          onclick: () => goWeb("detail", { listing: l.id }),
        }, [
          imgSlot(l.img, "thumb", l.title),
          el("div", {}, [
            el("h3", {}, [l.title]),
            el("p", {}, [l.sub]),
            el("p", { class: "card-spec" }, [[l.nfa, l.age, l.walk, "浏览 " + l.views].join(" | ")]),
          ]),
          el("div", { class: "rent" }, [l.rent, el("small", {}, [l.agent ? "代理" : "业主自让"])]),
        ]));
      });
    }
    const side = el("div", { class: "hk-side" }, [
      sideBox("缩小范围", [
        webLink("只看业主自让", () => { S.query = "业主自让"; doSearch(); }),
        el("p", { class: "hint" }, ["代理盘一般要求在职证明及担保人。业主自让请向业主查询条款。"]),
      ]),
      sideBox("热门搜寻", ["元朗 天水围", "荃湾 新楼", "大角咀 套房"].map((q) =>
        el("div", {}, [webLink(q, () => { S.query = q; doSearch(); })])
      )),
    ]);
    const filterLabel = { all: "全部", owner: "业主自让", share: "合租", estate: "屋苑" }[S.listFilter || "all"] || "全部";
    return houseShell([
      el("div", { class: "list-tools" }, [
        el("div", { class: "search-row" }, [
          input,
          el("button", { type: "button", class: "btn", onclick: doSearch }, ["搜寻"]),
        ]),
        listFilterBar(),
        el("p", { class: "list-tools-label" }, ["十八区："]),
        districtBar(),
      ]),
      siteNotice("租盘", [
        el("p", {}, ["点进盘源可看屋况、预约睇楼，或经站内留言联络业主。结果按放盘日期排列。"]),
      ]),
      el("div", { class: "listing-meta" }, [
        rows.length + " 个盘，" + filterLabel + "，「" + (S.query || "全部") + "」，按放盘日期",
      ]),
      el("div", { class: "hk-layout" }, [cards, side]),
    ], viewListTrail());
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
      { text: "首页", go: () => goWeb("home") },
      { text: "租盘", go: () => goWeb("list") },
      { text: name },
    ];
  }

  function specTable(rows) {
    return el("table", { class: "kv-table" }, rows.map(([k, v]) =>
      el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])])
    ));
  }

  function detailTk() {
    const l = listingById("tk");
    return el("div", { class: "detail hk-detail" }, [
      imgSlot(l.img, "photo-lg", l.title),
      el("div", { class: "kv" }, [
        el("h2", {}, [l.title]),
        el("p", { class: "rent-line" }, [l.rent + "／月"]),
        el("p", { class: "fine" }, ["编号 28WU-20140729-011"]),
        specTable([
          ["地区", l.area],
          ["面积", l.nfa],
          ["楼龄", l.age],
          ["交通", l.walk],
          ["放盘", l.date + "　浏览 " + l.views],
          ["业主", l.owner],
        ]),
        el("p", {}, ["上个月住客评语只剩一句：「夜里听得到隔壁。」天花有水渍。相片是空房。"]),
        el("p", { class: "fine" }, ["留言功能：对方已下线。系统不保证送达。"]),
        el("div", { class: "actions" }, [
          el("button", { class: "btn", type: "button", onclick: () => showPrompt("业主现时不在线。", "留言会保留，对方上线后可见。") }, ["预约看房"]),
          el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
        ]),
      ]),
    ]);
  }

  function detailTw() {
    const l = listingById("tw");
    return el("div", { class: "detail hk-detail" }, [
      imgSlot(l.img, "photo-lg", l.title),
      el("div", { class: "kv" }, [
        el("h2", {}, [l.title]),
        el("p", { class: "rent-line" }, [l.rent + "／月"]),
        el("p", { class: "fine" }, ["编号 28WU-20140730-088　代理"]),
        specTable([
          ["地区", l.area],
          ["面积", l.nfa],
          ["入伙", l.age],
          ["交通", l.walk],
          ["按金", "两个月按金 + 一个月上期"],
          ["资格", "要担保人、要粮单"],
          ["放盘", "地产代理代放"],
        ]),
        el("p", {}, ["管理处日间有人。新楼唔收周租。"]),
        el("div", { class: "actions" }, [
          el("button", {
            class: "btn",
            type: "button",
            onclick: () => showPrompt("代理已回覆。", "请先提供在职证明及担保人资料，再安排睇楼。本盘不接受周租。"),
          }, ["预约睇楼"]),
          el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
        ]),
      ]),
    ]);
  }

  function detailGeneric(l) {
    const rows = [
      ["地区", l.district + "　／　" + l.area],
      ["面积", l.nfa],
      ["楼龄", l.age],
      ["交通", l.walk],
      ["放盘", l.date + "　浏览 " + l.views],
      ["业主", l.owner],
    ].concat(l.specs || []);
    const kids = [
      imgSlot(l.img, "photo-lg", l.title),
      el("div", { class: "kv" }, [
        el("h2", {}, [l.title]),
        el("p", { class: "rent-line" }, [l.rent + "／月"]),
        el("p", { class: "fine" }, ["编号 " + l.code + "　" + (l.agent ? "代理" : "业主自让")]),
        specTable(rows),
        el("p", {}, [l.blurb]),
        el("p", { class: "fine" }, ["本站不负责口头协议。条款以业主或代理回覆为准。"]),
        el("div", { class: "actions" }, [
          el("button", {
            class: "btn",
            type: "button",
            onclick: () => showPrompt(l.failTitle, l.failBody),
          }, ["预约睇楼"]),
          el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
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
        el("p", { class: "rent-line" }, [l.rent + "／周"]),
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
          "　独居　自己放盘　上次上线 07-28 22:17　浏览 " + l.views,
        ]),
        el("h3", { class: "sec-h" }, ["屋况（业主原文）"]),
        el("p", {}, ["唐楼，行到地铁。屋内仍有家人旧物，不介意者优先。可即时入住。储物室上锁，钥匙业主收，不入租。后楼梯通往天台，住客可用。"]),
        el("h3", { class: "sec-h" }, ["交易条款"]),
        el("p", {}, ["现金。口头。无印花。周租，可即日计。无地产佣金。"]),
        el("p", { class: "fine" }, ["本站不负责口头协议。详见", webLink("租务须知", () => goWeb("rules")), "。"]),
        el("h3", { class: "sec-h" }, ["照片说明"]),
        el("p", {}, ["业主上载相片 1 张（07-28）。本站不对相片内容作审核。"]),
        el("h3", { class: "sec-h" }, ["地区资讯"]),
        el("p", { class: "fine" }, [
          "深水埗指定范围仍列于市区重建研究。公开咨询暂写八月下旬。",
          webLink("相关新闻", () => goWeb("newsitem", { newsId: "urb" })),
        ]),
          el("h3", { class: "sec-h" }, ["盘源留言板（2）"]),
        el("p", { class: "bbs-line" }, ["过路人　07-29：「相里面有车？业主有细路住？」　——　业主未回。"]),
        el("p", { class: "bbs-line" }, ["深水埗住开　07-30：「后座平一截正常。问清楚锁门嗰间系乜。」"]),
        el("label", {}, ["备注（仅自己可见）", remark]),
        el("div", { class: "actions" }, [
          el("button", { class: "btn", type: "button", onclick: () => goViewing(false) }, [
            flag("sawMail") ? "赴约看房" : "预约睇楼",
          ]),
          el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("pm") }, ["写站内留言"]),
          el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("landlord") }, ["业主档案"]),
          el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
          el("button", { class: "btn ghost", type: "button", onclick: () => showPrompt("已加入我的收藏。") }, ["收藏"]),
        ]),
      ]),
    ]);
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
    S.pmSent = text;
    flag("askedOld", true);
    goWeb("inbox");
    showModal("提示", "已送出。", "业主现时不在线。回复会留在站内留言。", "prompt", () => {
      waitWeek(
        "2014年7月31日 周四 23:14",
        "留言送出了",
        "他夜间不在线。",
        "8月1日　上午",
        reachMorning
      );
    });
  }

  function viewPm() {
    if (flag("askedOld")) {
      const ready = replyReady();
      const read = flag("sawMail");
      return houseShell([
        el("h2", { class: "sec-h" }, ["写站内留言"]),
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
    if (!S.pmBody) S.pmBody = PM_DRAFT;
    const box = el("textarea", { class: "note-box", maxlength: "400" });
    box.value = S.pmBody;
    box.addEventListener("input", () => { S.pmBody = box.value; });
    return houseShell([
      el("h2", { class: "sec-h" }, ["写站内留言"]),
      el("p", { class: "mail-meta" }, ["收件人：周先生　　主旨：荣汇街 28 号后座　预约睇楼"]),
      el("p", { class: "hint" }, ["业主夜间常不在线。回复于翌日上午显示。"]),
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
      note("zhou-reply", "周先生回了留言。听日下昼。旧嘢如果怕，可以叫他把相收起。");
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
          el("div", { class: "mail-body" }, ["听日下昼得。我喺度等。简介写过屋内有旧嘢，你见过怕就同我讲，相可以收起一部分。"]),
        ]),
        el("div", { class: "actions" }, [
          el("button", { class: "btn", type: "button", onclick: () => goViewing(true) }, ["赴约看房"]),
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
      if (S.known && S.known.rong) {
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
      const title = t.title;
      return el("button", {
            type: "button",
        class: "forum-row" + (t.user === "阿琪V" ? " forum-mine" : ""),
        onclick: () => goWeb("thread", { forumId: id }),
      }, [
        el("span", { class: "board" }, ["[" + t.board + "]"]),
        el("span", { class: "ftitle" }, [title]),
        el("span", { class: "fmeta" }, [t.user + "　" + t.time]),
      ]);
    });
    const kids = [
      el("h2", { class: "sec-h" }, ["讨论区"]),
      el("p", { class: "hint" }, ["公开版面。请勿留下电话、住址及银行户口。"]),
    ];
    if (postedHelp()) {
      const hp = THREADS.helpzhang;
      const n = (hp.replies || []).length;
      kids.push(siteNotice(flag("sawOwnPost") ? "我的帖子" : "我的帖子（有新回复）", [
        el("p", {}, [
          webLink(hp.title, () => goWeb("thread", { forumId: "helpzhang" })),
          "　" + hp.board + "版　回复 " + n,
        ]),
      ]));
    }
    const fresh = unreadSerial();
    if (fresh) {
      const t = THREADS[fresh];
      kids.push(siteNotice("杂谈有新回复", [
        el("p", {}, [
          webLink(t.title, () => goWeb("thread", { forumId: fresh })),
          "　" + t.time,
        ]),
      ]));
    }
    kids.push(el("div", { class: "forum-list" }, rows));
    return houseShell(kids, [{ text: "首页", go: () => goWeb("home") }, { text: "讨论区" }]);
  }

  function viewThread() {
    if (S.forumId === "helpzhang" && !postedHelp()) {
      return viewPost();
    }
    const t = THREADS[S.forumId] || THREADS.stamp;
    if (S.forumId === "helpzhang") {
      flag("sawOwnPost", true);
      note("bbs-self", "我发过帖。藤先生回过，丢了个盘连结。");
      if (flag("sawLinAd")) note("same-name", "墙上和帖里是同一个名字。");
    }
    if (S.forumId === "wk1") {
      flag("sawWk1", true);
      note("serial1", "讨论区第一帖。藤先生没有再回。墙簿没有发。");
    }
    if (S.forumId === "wk2") {
      flag("sawWk2", true);
      note("serial2", "第二帖。藤先生只留一句：你写低。下星期再讲。");
    }
    if (S.forumId === "wk3") {
      flag("sawWk3", true);
      note("serial3", "第三帖。藤先生又没有出声。阿七在问。");
    }
    const replies = t.replies || [];
    const replyNodes = replies.map((r) => {
      const kids = [
        el("p", { class: "mail-meta" }, [r.user + "　回复于 " + r.time]),
        el("p", {}, [r.body]),
      ];
      if (r.listing) {
        kids.push(el("p", {}, [
          webLink("连结：深水埗荣汇街 28 号 4 楼后座", () => goWeb("detail", { listing: r.listing })),
        ]));
      }
      return el("div", { class: "mail-body" }, kids);
    });
    return houseShell([
      el("h2", { class: "sec-h" }, ["[" + t.board + "] " + t.title]),
      el("p", { class: "mail-meta" }, [t.user + "　发表于 " + t.time]),
      el("div", { class: "mail-body" }, [t.body]),
      t.user === "阿琪V" ? el("p", {}, [el("button", {
        type: "button",
        class: "btn" + (hasEvidence("post-" + S.forumId) ? " ghost" : ""),
        onclick: () => {
          const postItem = {
            id: "post-" + S.forumId,
            kind: "帖",
            title: t.title,
            time: t.time,
            body: t.body,
          };
          showDiarySheet(postItem, {
            canFile: !hasEvidence(postItem.id),
            onClose: () => goWeb("thread"),
          });
        },
      }, [hasEvidence("post-" + S.forumId) ? "已记下" : "记下来"])]) : "",
      replies.length
        ? el("p", { class: "fine" }, ["回复（" + replies.length + "）"])
        : el("p", { class: "fine" }, ["回复（0）　夜间暂停。"]),
      ...replyNodes,
    ], [
      { text: "首页", go: () => goWeb("home") },
      { text: "讨论区", go: () => goWeb("forum") },
      { text: t.title },
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
      el("p", { class: "fine" }, ["个桉情况请自行向律师查询。本页如与现行法例不符，以法例为准。"]),
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
      mud: ["web-zhou", "2012年9月。妻儿遇难。他们话天意。土木署：雨后斜坡失稳。"],
      urb: ["web-ura", "荣汇街在研究名单。业主将获补偿。"],
    }[id];
    if (!kept) return;
    note(kept[0], kept[1]);
    if (hasEvidence("news-mud") && hasEvidence("news-urb")) {
      note("twofiles", "他那边死过人。这边楼还要赔一笔。");
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
    showDiarySheet(item, {
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
    const canKeep = id === "mud" || id === "urb";
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
      el("p", {}, ["上次登入：今天 23:10　IP 已隐藏"]),
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
    if (id === "wk1") flag("serial1", true);
    if (id === "wk2") flag("serial2", true);
    if (id === "wk3") flag("serial3", true);
    note("bbs-" + id, "我在讨论区发了一帖。");
    S.pendingPost = "";
    clearSlate();
    const next = id === "wk1"
      ? ["2014年8月17日 周日 上午", "帖在讨论区", "星期三夜里，你再对一次钟。", "8月20日　夜里", weekFoot]
      : id === "wk2"
        ? ["2014年8月24日 周日 上午", "帖在讨论区", "下午要去表姐家。", "下午　去表姐家", sundayMeal]
        : ["2014年8月31日 周日 上午", "帖在讨论区", "夜里你还在后座。", "8月31日　夜里", nightBeforeTue];
    showModal("提示", "已收到你的刊登。", "", "prompt", () => {
      waitWeek(next[0], next[1], next[2], next[3], next[4]);
    });
  }

  function viewSerialDraft() {
    const t = THREADS[S.pendingPost];
    return houseShell([
      el("h2", { class: "sec-h" }, ["讨论区　" + t.board]),
      el("p", { class: "hint" }, ["写好了，还没发布。凌晨写的帖，早上才在版面上显示。"]),
      el("p", { class: "mail-meta" }, ["版块：" + t.board + "　署名：阿琪V"]),
      el("div", { class: "post-draft" }, [
        el("h3", { style: "margin:0 0 8px;font-size:15px;color:#1f4f96" }, [t.title]),
        el("div", { class: "mail-body" }, [t.body]),
      ]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn", type: "button", onclick: publishSerial }, ["发布"]),
      ]),
    ], [
      { text: "首页", go: () => goWeb("home") },
      { text: "讨论区", go: () => goWeb("forum") },
      { text: "发帖" },
    ]);
  }

  function viewPost() {
    if (S.pendingPost && THREADS[S.pendingPost]) return viewSerialDraft();
    const hp = THREADS.helpzhang;
    if (!postedHelp()) {
      return houseShell([
        el("h2", { class: "sec-h" }, ["免费刊登　求助帖"]),
        el("p", { class: "hint" }, ["讨论区求助版。凌晨 00:00–08:00 新帖须经审核。"]),
        el("p", { class: "mail-meta" }, ["版块：" + hp.board + "　署名：阿琪V"]),
        el("div", { class: "post-draft" }, [
          el("h3", { style: "margin:0 0 8px;font-size:15px;color:#1f4f96" }, [hp.title]),
          el("div", { class: "mail-body" }, [hp.body]),
        ]),
        el("div", { class: "actions" }, [
          el("button", { class: "btn", type: "button", onclick: publishHelpPost }, ["发布"]),
        ]),
      ], [{ text: "首页", go: () => goWeb("home") }, { text: "免费刊登" }]);
    }
    return houseShell([
      el("h2", { class: "sec-h" }, ["免费刊登　求助帖"]),
      siteNotice("系统通知", [
        el("p", {}, ["已发布。求助帖已刊登于讨论区「求助」版，可查看原文及回复。"]),
        el("p", {}, [webLink("查看帖子", () => goWeb("thread", { forumId: "helpzhang" }))]),
      ]),
    ], [{ text: "首页", go: () => goWeb("home") }, { text: "免费刊登" }]);
  }

  function viewLandlord() {
    return houseShell([
      el("h2", { class: "sec-h" }, ["业主档案　周先生"]),
      specTable([
        ["身份", "业主自让，非代理"],
        ["放盘", "1 个（现正上架）"],
        ["上线", "07-28 22:17"],
        ["回覆率", "慢。夜间常不在。"],
        ["认证", "未做身份认证"],
      ]),
      el("h3", { class: "sec-h" }, ["简介（自填）"]),
      el("p", {}, ["自己住同层前座。屋有旧嘢，唔介意先好倾。即时可以搬。现金得。"]),
      el("p", { class: "fine" }, ["本会员暂无其他租客评价。"]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["看他的盘"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("pm") }, ["写站内留言"]),
      ]),
    ], [
      { text: "首页", go: () => goWeb("home") },
      { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
      { text: "周先生" },
    ]);
  }

  function viewAbout() {
    return houseShell([
      el("h2", { class: "sec-h" }, ["关于廿八屋"]),
      el("p", {}, ["廿八屋于 2011 年上线，刊香港业主自让及代理租盘。不设带看，不收佣金。"]),
      el("p", { class: "fine" }, ["侧栏广告由第三方投放，本站不对连结内容负责。"]),
    ], [{ text: "首页", go: () => goWeb("home") }, { text: "关于廿八屋" }]);
  }

  function closeModal() {
    const m = $("#game-modal", stage);
    if (m) m.remove();
    S.modal = null;
  }

  function afterModalClose(onClose) {
    closeModal();
    if (onClose) onClose();
    else if (S.mode === "cal") drawCalendar();
          else if (S.mode === "night") drawNight();
          else if (S.mode === "clinic") drawClinic();
          else if (S.mode === "talk") drawTalk();
    else if (S.mode === "search") drawSearch();
    else if (S.mode === "chat") drawChat();
    else if (S.mode === "wait") drawWait();
          else draw();
  }

  function itemFromModalTitle(title, body, time) {
    const parts = String(title || "").split("：");
    return {
      kind: parts.length > 1 ? parts[0] : "证物",
      title: parts.length > 1 ? parts.slice(1).join("：") : title,
      body: body || "",
      time: time || "",
    };
  }

  function openNotes() {
    if (mapLayer) mapLayer.hidden = true;
    showDiaryIndex();
  }

  function closeNotes() {
    if (notesLayer) notesLayer.hidden = true;
    S.diaryLeaf = null;
  }

  function toggleNotes() {
    if (S.diaryLeaf && S.diaryLeaf.canFile) return;
    if (notesLayer && !notesLayer.hidden) closeNotes();
    else openNotes();
  }

  function showDiaryIndex() {
    S.diaryLeaf = null;
    if (notesIndex) notesIndex.hidden = false;
    if (notesLeaf) {
      notesLeaf.hidden = true;
      notesLeaf.replaceChildren();
    }
    renderNotes();
    if (notesActions) {
      notesActions.replaceChildren(el("button", {
        type: "button",
        class: "diary-btn",
        onclick: closeNotes,
      }, ["合上"]));
    }
    if (notesLayer) notesLayer.hidden = false;
  }

  function dismissDiaryLeaf() {
    const leaf = S.diaryLeaf;
    const onClose = leaf && leaf.onClose;
    const fromIndex = leaf && leaf.fromIndex;
    S.diaryLeaf = null;
    if (fromIndex) {
      showDiaryIndex();
      return;
    }
    closeNotes();
    afterModalClose(onClose);
  }

  function showDiarySheet(item, opts) {
    opts = opts || {};
    closeModal();
    if (mapLayer) mapLayer.hidden = true;
    const filed = !!(item.id && hasEvidence(item.id));
    const stamped = opts.stamped || filed;
    const canFile = opts.canFile !== false && item.id && !filed;
    S.diaryLeaf = { canFile, fromIndex: !!opts.fromIndex, onClose: opts.onClose };

    const innerKids = [
      el("div", { class: "diary-meta" }, [
        el("span", { class: "diary-kind" }, [item.kind || "证物"]),
        item.time ? el("time", { class: "diary-time" }, [item.time]) : "",
      ]),
      el("h4", { class: "diary-title" }, [item.title || ""]),
    ];
    if (item.img) innerKids.push(imgSlot(item.img, "diary-img", item.title));
    innerKids.push(el("div", { class: "diary-body" }, [opts.bodyOverride || item.body || ""]));
    if (stamped) innerKids.push(el("span", { class: "diary-stamp", "aria-hidden": "true" }, ["已记下"]));

    if (notesIndex) notesIndex.hidden = true;
    if (notesLeaf) {
      notesLeaf.hidden = false;
      notesLeaf.replaceChildren(...innerKids);
    }
    if (notesActions) {
      notesActions.replaceChildren();
      if (canFile) {
        notesActions.append(
          el("button", {
            type: "button",
            class: "diary-btn primary",
            onclick: () => {
              fileEvidence(item);
              renderNotes();
              if (opts.onFile) opts.onFile(item);
              showDiarySheet(item, { ...opts, canFile: false, stamped: true });
            },
          }, ["记下来"]),
          el("button", {
            type: "button",
            class: "diary-btn",
            onclick: dismissDiaryLeaf,
          }, ["先不记"])
        );
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
    if (notesLayer) notesLayer.hidden = false;
  }

  function showModal(title, p1, p2, kind, onClose, keep) {
    closeModal();
    const k = kind || (keep ? "memo" : "scene");

    if (k === "memo" || keep) {
      const item = keep || itemFromModalTitle(title, p1, p2);
      showDiarySheet(item, { onClose, canFile: !!keep });
      return;
    }

    if (k === "voicemail") {
      const kids = [
        el("h3", {}, [title]),
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
            fileEvidence(keep);
            renderNotes();
            showModal(title, p1, "已记下。", k, onClose, keep);
          },
        }, [filed ? "已记下" : "记下来"]));
      }
      kids.push(el("button", {
        class: "btn ghost",
        type: "button",
        onclick: () => afterModalClose(onClose),
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
      keep && keep.img ? imgSlot(keep.img, "photo-lg", keep.title) : "",
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

  function keepThen(item, next) {
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

  function wallHeader() {
    const items = [
      ["首页", "wall"],
      ["我的页面", "wall-me"],
      ["好友", "wall-friends"],
      ["收件箱", "wall-mail"],
      ["设置", "wall-set"],
    ];
    return el("div", { class: "wall-head" }, [
      el("button", { type: "button", class: "wall-logo", onclick: () => goWeb("wall") }, ["墙簿"]),
      el("nav", { class: "wall-nav" }, items.map(([label, screen]) =>
        el("button", {
          type: "button",
          class: "wall-nav-item" + (S.screen === screen ? " on" : ""),
          onclick: () => goWeb(screen),
        }, [label])
      )),
    ]);
  }

  function wallPost(name, who, text, time, extra) {
    const actions = extra || el("div", { class: "post-actions" }, [
      webLink("回应", () => showPrompt("讯息未送出。", "网络繁忙，请稍后再试。")),
      " | ",
      webLink("转贴", () => showPrompt("转贴失败。", "请稍后再试。")),
    ]);
    return el("article", { class: "post" }, [
      el("button", {
        type: "button",
        class: "post-avatar",
        onclick: () => goWeb("wall-user", { wallWho: who }),
      }, [name.slice(0, 1)]),
      el("div", { class: "post-main" }, [
        el("div", { class: "post-meta" }, [
          webLink(name, () => goWeb("wall-user", { wallWho: who })),
          el("span", {}, [time]),
        ]),
        el("p", {}, [text]),
        actions,
      ]),
    ]);
  }

  function linAdButton() {
    return el("button", {
        class: "ad",
        type: "button",
        onclick: () => {
        flag("sawLinAd", true);
        note("lin", "有人在网上等人聊。藤先生。");
        if (flag("sawOwnPost")) note("same-name", "墙上和帖里是同一个名字。");
        goWeb("ad");
        },
      }, [
        el("b", {}, ["一对一深谈"]),
        "适合想被认真听的年轻人",
      el("div", {}, ["——藤先生"]),
    ]);
  }

  function livingIn() {
    return /8月|9月/.test(S.time || "");
  }

  function viewWall() {
    const meiNow = flag("serial3")
      ? wallPost("陈美娟", "mei", "下星期六佢真的再去？你电话里讲过。沙发仍在。", "今天 10:12")
      : (flag("serial2") || S.notes.some((n) => n.id === "meiMeal"))
        ? wallPost("陈美娟", "mei", "食过未。汤我留住。", "今天 13:40")
        : (flag("serial1") || S.notes.some((n) => n.id === "meiStay"))
          ? wallPost("陈美娟", "mei", "沙发仍在。你不过来都好。门锁好。", "今天 21:50")
          : wallPost("陈美娟", "mei", "阿琪你今晚住边。沙发留住。", "今天 22:48");
    const feed = el("div", { class: "feed" }, [
      meiNow,
      wallPost("阿乐", "lok", "……", livingIn() ? "三个星期前" : "今天 22:55"),
      wallPost("廿八屋转贴", "house", livingIn() ? "你最近看过深水埗唐楼。" : "元朗天水围，有人在看。", livingIn() ? "昨天 16:02" : "今天 23:02",
        el("div", { class: "post-actions" }, [webLink("打开廿八屋", () => {
          S.query = livingIn() ? "深水埗" : "元朗 天水围";
          doSearch();
        })])
      ),
      wallPost("陈美娟", "mei", "上载了相册「年夜饭」。家豪又醉，成晚讲大学宿舍嗰个。", livingIn() ? "上周" : "昨天 01:12"),
      wallPost("同事阿诗", "ping", "湾仔今晚有灯嘅诊所？路过见到。", "昨天 21:03"),
    ]);
    const side = el("div", { class: "hk-side" }, [
      sideBox("赞助连结", [
        el("button", { class: "ad mute", type: "button", onclick: () => showPrompt("旧机上台", "月费 $88 起　旺角信和中心 2 楼　欢迎查询") }, [el("b", {}, ["旧手机上台"]), "旺角信和中心 2 楼"]),
        linAdButton(),
        el("button", { class: "ad mute", type: "button", onclick: () => showPrompt("家庭人寿", "理赔快捷　资料保密　按此留下联络") }, [el("b", {}, ["家庭人寿查询"]), "理赔快　资料保密"]),
      ]),
      sideBox("你可能认识", [
        webLink("陈美娟", () => goWeb("wall-user", { wallWho: "mei" })),
        "（表姐）",
        el("br"),
        webLink("阿乐", () => goWeb("wall-user", { wallWho: "lok" })),
        "（前度）",
      ]),
    ]);
    const wrap = el("div", { class: "hk-site" });
    wrap.append(wallHeader());
    wrap.append(el("div", { class: "wall-grid" }, [feed, side]));
    return wrap;
  }

  function viewAd() {
    const wrap = el("div", { class: "hk-site" });
    wrap.append(wallHeader());
    wrap.append(el("div", { class: "blank-ad" }, [
      backLink("墙簿", () => goWeb("wall")),
      imgSlot("01-wall-lin-empty", "avatar-slot", "藤先生"),
      el("p", {}, ["把你的故事交给能懂的人"]),
      el("p", {}, ["（电邮已失效）"]),
      el("p", { class: "fine" }, ["此页由广告商提供。"]),
    ]));
    return wrap;
  }

  function showWallPhoto(title, id) {
    closeModal();
    const sheet = el("div", { class: "sheet prompt" }, [
      el("h3", {}, [title]),
      imgSlot(id, "photo-lg", title),
      el("button", {
        class: "btn ghost",
        type: "button",
        onclick: () => {
          closeModal();
          draw();
        },
      }, ["好"]),
    ]);
    S.modal = el("div", { class: "modal web", id: "game-modal" }, [sheet]);
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
    const wrap = el("div", { class: "hk-site" });
    wrap.append(wallHeader());
    wrap.append(el("div", { class: "wall-profile" }, [
      backLink("墙簿", () => goWeb("wall")),
      el("h2", {}, [title]),
      ...lines.map((t) => typeof t === "string" ? el("p", {}, [t]) : t),
    ]));
    return wrap;
  }

  function viewWallMe() {
    const status = flag("serial3")
      ? "状态：在住。下星期六再去诊所。"
      : flag("serial1")
        ? "状态：在住。"
        : livingIn()
          ? "状态：在住。"
          : "状态：在找地方住。";
    return wallProfile("章慧琪", [
      status,
      livingIn() ? "最近：廿八屋　深水埗 唐楼" : "最近：廿八屋　元朗 天水围",
      "好友：12",
      wallAlbum("相册「手机」　2 张", [
        { id: "01-wall-vicky-1", cap: "茶餐厅" },
        { id: "01-wall-vicky-2", cap: "出街" },
      ]),
    ]);
  }

  function viewWallFriends() {
    const wrap = el("div", { class: "hk-site" });
    wrap.append(wallHeader());
    wrap.append(el("div", { class: "wall-profile" }, [
      backLink("墙簿", () => goWeb("wall")),
      el("h2", {}, ["好友"]),
      el("p", { class: "wall-friend" }, [
        webLink("陈美娟", () => goWeb("wall-user", { wallWho: "mei" })),
        el("span", {}, ["表姐"]),
        el("span", { class: "wall-st" }, ["在线"]),
      ]),
      el("p", { class: "wall-friend" }, [
        webLink("阿乐", () => goWeb("wall-user", { wallWho: "lok" })),
        el("span", {}, ["前度"]),
        el("span", { class: "wall-st dim" }, ["很久没上线"]),
      ]),
      el("p", { class: "wall-friend" }, [
        webLink("陈家豪", () => goWeb("wall-user", { wallWho: "howard" })),
        el("span", {}, ["姐夫"]),
        el("span", { class: "wall-st dim" }, ["忙碌"]),
      ]),
    ]));
    return wrap;
  }

  function viewWallMail() {
    return wallProfile("墙簿收件箱", [
      "没有未读讯息。",
    ]);
  }

  function viewWallSet() {
    const wrap = el("div", { class: "hk-site" });
    wrap.append(wallHeader());
    wrap.append(el("div", { class: "wall-profile" }, [
      backLink("墙簿", () => goWeb("wall")),
      el("h2", {}, ["设置"]),
      el("p", {}, ["谁可以找我：好友"]),
      el("p", {}, ["赞助连结：免费账户无法关闭"]),
      el("p", {}, ["语言：中文（香港）"]),
      el("p", {}, ["登出：此浏览器已记住登入"]),
      el("button", { class: "btn ghost", type: "button", onclick: blockedLogout }, ["登出"]),
    ]));
    return wrap;
  }

  function viewWallUser() {
    if (S.wallWho === "mei") {
      return wallProfile("陈美娟", [
        "文职。已婚。",
        wallAlbum("相册「年夜饭」　3 张", [
          { id: "01-wall-mei-1", cap: "开席" },
          { id: "01-wall-mei-2", cap: "敬茶" },
          { id: "01-wall-mei-3", cap: "水果" },
        ]),
        "最近动态：今天 22:48",
      ]);
    }
    if (S.wallWho === "lok") {
      return wallProfile("阿乐", [
        "上次上线：三个星期前",
        "签名档：",
        "关系：无",
        wallAlbum("相册「旧相」　2 张", [
          { id: "01-wall-lok-1", cap: "夜里" },
          { id: "01-wall-lok-2", cap: "落街" },
        ]),
      ]);
    }
    if (S.wallWho === "house") {
      return wallProfile("廿八屋转贴", [
        "廿八屋官方专页。",
        "通知：开启",
      ]);
    }
    if (S.wallWho === "howard") {
      return wallProfile("陈家豪", [
        "姐夫。督察。已婚。",
        "妻子：陈美娟",
        wallAlbum("相册「旅行」　2 张", [
          { id: "01-wall-howard-1", cap: "渡轮" },
          { id: "01-wall-howard-2", cap: "沙滩" },
        ]),
        "最近动态：昨天 19:22",
      ]);
    }
    if (S.wallWho === "ping") {
      return wallProfile("同事阿诗", [
        "任职：零售",
        "最近动态：昨天 21:03",
      ]);
    }
    return wallProfile("用户", ["资料不公开。"]);
  }

  function goViewing() {
    closeModal();
    if (flag("askedOld") && !flag("sawMail")) {
      showPrompt(
        replyReady() ? "站内留言有新回复。" : "业主现时不在线。",
        replyReady() ? "请先查看，再赴约睇楼。" : "回复会留在站内留言。"
      );
      return;
    }
    setTime("2014年8月1日 周五 15:20");
    startTalk(viewingBeats());
  }

  /* ---------- 对话引擎：当面 / 电话 / 短信 / 语音留言 ---------- */

  function startTalk(beats, loc, kind, meta) {
    S.mode = "talk";
    meta = meta || {};
    S.talk = {
      beats: beats.slice(),
      i: 0,
      loc: loc || "荣汇街 28 号 4 楼",
      kind: kind || "face",
      contact: meta.contact || "",
      number: meta.number || "",
      incoming: !!meta.incoming,
      dialout: !!meta.dialout,
      eavesdrop: !!meta.eavesdrop,
      callSec: meta.incoming ? 0 : 6,
      waiting: false,
    };
    drawTalk();
  }

  function currentBeat() {
    return S.talk && S.talk.beats[S.talk.i];
  }

  function applyChoice(c) {
              if (c.note) note(c.note[0], c.note[1]);
              if (c.flag) flag(c.flag, true);
              if (typeof c.then === "function") c.then();
              else if (Array.isArray(c.then)) {
                S.talk.beats = S.talk.beats.slice(0, S.talk.i + 1).concat(c.then, S.talk.beats.slice(S.talk.i + 1));
                S.talk.i += 1;
      S.talk.callSec += 4;
                drawTalk();
              }
  }

  function advanceBeat(b) {
        if (b.note) note(b.note[0], b.note[1]);
    if (b.flag) flag(b.flag, true);
        S.talk.i += 1;
    S.talk.callSec += 3 + Math.min(9, Math.floor(((b.text || "").length) / 14));
        if (!currentBeat()) return;
        drawTalk();
  }

  function phoneOnly(b) {
    return !!(b.choices && b.choices.length && b.choices.every((c) => c.phone));
  }

  function phoneButton(label, onclick, opt) {
    opt = opt || {};
    const copy = [el("span", { class: "phone-act-label" }, [label])];
    if (opt.hint) copy.push(el("span", { class: "phone-act-hint" }, [opt.hint]));
    return el("button", {
      type: "button",
      class: "phone-act" + (opt.hangup ? " hangup" : "") + (opt.done ? " done" : ""),
      onclick,
    }, [
      el("span", { class: "phone-act-ico", "aria-hidden": "true" }, ["📞"]),
      el("span", { class: "phone-act-copy" }, copy),
    ]);
  }

  function choiceBox(b, className) {
    if (phoneOnly(b)) {
      const ch = el("div", { class: "phone-ops" });
      b.choices.forEach((c) => {
        ch.append(phoneButton(c.label, () => applyChoice(c), { hint: c.hint, hangup: c.hangup }));
      });
      return ch;
    }
    const ch = el("div", { class: "choices " + (className || "") });
    b.choices.forEach((c) => {
      ch.append(el("button", { type: "button", onclick: () => applyChoice(c) }, [c.label]));
    });
    return ch;
  }

  function nextBtn(b, label) {
    return el("button", {
      class: "btn talk-next",
        type: "button",
        onclick: (e) => {
          e.stopPropagation();
        advanceBeat(b);
      },
    }, [label || "继续"]);
  }

  function whoClass(name) {
    const key = {
      章慧琪: "zhang",
      周: "zhou",
      周锦荣: "zhou",
      罗启明: "ming",
      阿明: "ming",
      陈家豪: "hao",
      Howard: "hao",
      陈美娟: "mei",
      美娟: "mei",
      阿乐: "lok",
      差人: "cop",
      丽芬: "lifen",
      "丽芬（旧机）": "lifen",
      林伟森: "lin",
    }[name];
    return key ? "who-" + key : "";
  }

  function speakerOf(b) {
    if (!b) return "现场";
    if (b.choices) return "章慧琪";
    return b.who || "现场";
  }

  function portraitSlot(who) {
    if (WHO_IMG[who]) return imgSlot(WHO_IMG[who], "talk-portrait", who);
    const ch = (who && who !== "现场") ? who.slice(0, 1) : "·";
    return el("div", { class: "talk-avatar-placeholder", "aria-hidden": "true" }, [ch]);
  }

  function fmtCall() {
    const s = Math.max(0, Math.floor(S.talk.callSec || 0));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function clockHm() {
    const m = S.time.match(/(\d{1,2}:\d{2})\s*$/);
    return m ? m[1] : "--:--";
  }

  function drawTalk() {
    clearStage();
    const t = S.talk;
    if (!t) return;
    if (t.incoming) {
      stage.append(drawIncoming());
      renderPlaybar();
      return;
    }
    const b = currentBeat();
    if (!b) return;
    if (b.goto) {
      if (b.note) note(b.note[0], b.note[1]);
      b.goto();
      return;
    }
    if (t.kind === "phone") stage.append(drawPhone(b));
    else if (t.kind === "sms") stage.append(drawSms(b));
    else if (t.kind === "msg") stage.append(drawMsg(b));
    else stage.append(drawFace(b));
    renderPlaybar();
  }

  function phoneEnterClass() {
    const t = S.talk;
    if (!t || t.phoneEntered) return "";
    t.phoneEntered = true;
    return " phone-enter";
  }

  function drawIncoming() {
    const t = S.talk;
    const who = t.contact || "未知号码";
    return el("div", { class: "talk phone" + phoneEnterClass(), "aria-live": "polite" }, [
      el("div", { class: "phone-frame" }, [
        el("div", { class: "phone-status" }, ["中国移动　来电　" + clockHm()]),
        el("div", { class: "phone-incoming" }, [
          el("div", { class: "phone-tag" }, ["来电"]),
        portraitSlot(WHO_IMG[t.contact] ? t.contact : (t.number || who)),
          el("div", { class: "phone-who" }, [who]),
          el("div", { class: "phone-num" }, [t.number || "手机"]),
          el("button", {
            type: "button",
            class: "phone-answer",
            onclick: () => {
              t.incoming = false;
              t.callSec = 0;
              drawTalk();
            },
          }, [el("span", { class: "phone-act-ico", "aria-hidden": "true" }, ["📞"]), "接听"]),
        ]),
      ]),
    ]);
  }

  function drawFace(b) {
    const choosing = !!b.choices;
    const stageDir = !b.who && !choosing;
    const speaker = choosing ? "章慧琪" : speakerOf(b);
    const bgId = locImg(S.talk.loc);
    const box = el("div", { class: "talk face" + (stageDir ? " narr" : ""), "aria-live": "polite" });
    if (bgId) box.append(imgSlot(bgId, "talk-bg", S.talk.loc));

    const inner = el("div", { class: "face-inner" + (stageDir ? " solo" : "") });
    if (!stageDir) inner.append(portraitSlot(speaker));

    const tone = stageDir ? "" : whoClass(speaker);
    const body = el("div", { class: "face-body" });
    if (!stageDir) body.append(el("div", { class: "talk-name " + tone }, [speaker]));

    const prompt = choosing ? (b.prompt && b.prompt !== "……" ? b.prompt : "") : (b.text || "");
    const awen = /阿文/.test(prompt) && /候诊|澄心/.test(S.talk.loc || "");
    if (awen) {
      box.classList.add("awen");
      box.append(el("div", { class: "shade-figure", "aria-hidden": "true" }));
    }
    if (prompt) {
      body.append(el("div", { class: "talk-text" + (stageDir ? " stage-dir" : " " + tone) + (awen ? " awen-line" : "") }, [prompt]));
    }
    if (choosing) {
      body.append(choiceBox(b, "face-choices"));
    } else {
      body.append(el("div", { class: "face-cont", "aria-hidden": "true" }, ["▾"]));
      box.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        advanceBeat(b);
      });
    }
    inner.append(body);
    box.append(el("div", { class: "face-dock" }, [inner]));
    return box;
  }

  function drawPhone(b) {
    const t = S.talk;
    const speaker = speakerOf(b);
    const tag = t.eavesdrop ? "隔门听电话" : t.dialout ? "拨号　通话中" : "通话中";
    const box = el("div", { class: "talk phone" + phoneEnterClass(), "aria-live": "polite" });
    if (t.contact === "999") box.append(imgSlot("01-phone-999", "talk-bg", "999"));
    const narr = !b.choices && !b.who;
    const tone = whoClass(b.choices ? "章慧琪" : (b.who || speaker));
    const script = el("div", { class: "phone-script" }, [
      el("div", { class: "phone-line-who " + tone }, [b.choices ? "你说" : (b.who || (t.eavesdrop ? "隔门" : "听筒"))]),
      el("div", { class: "talk-text" + (narr ? " stage-dir" : " " + tone) }, [b.choices ? (b.prompt || "……") : (b.text || "")]),
    ]);
    const keys = b.choices
      ? choiceBox(b, "phone-choices")
      : el("div", { class: "phone-pad" }, [nextBtn(b, t.eavesdrop ? "再贴过去听" : "听下句")]);
    box.append(el("div", { class: "phone-frame" }, [
      el("div", { class: "phone-status" }, ["中国移动　通话　" + clockHm()]),
      el("div", { class: "phone-incall" }, [
        el("div", { class: "phone-tag" }, [tag]),
        portraitSlot(WHO_IMG[t.contact] ? t.contact : (WHO_IMG[t.number] ? t.number : speaker)),
        el("div", { class: "phone-who " + whoClass(t.contact) }, [t.contact || S.talk.loc]),
        el("div", { class: "phone-num" }, [t.eavesdrop ? "听筒凑近门底" : (t.number || "手机")]),
        el("div", { class: "phone-timer" }, [t.eavesdrop ? "听不清" : fmtCall()]),
        script,
        keys,
        el("div", { class: "phone-fakekeys", "aria-hidden": "true" }, ["静音", "免提", "键盘"]),
      ]),
    ]));
    return box;
  }

  function drawSms(b) {
    const t = S.talk;
    const until = t.i + (b.choices ? 0 : 1);
    const log = t.beats.slice(0, until).filter((x) => x.text);
    const thread = el("div", { class: "sms-thread" });
    log.forEach((x) => {
      const mine = x.who === "章慧琪";
      const tone = whoClass(mine ? "章慧琪" : (x.who || t.contact || ""));
      thread.append(el("div", { class: "sms-row " + (mine ? "me" : "them") }, [
        el("div", { class: "sms-bubble " + tone }, [x.text]),
        el("div", { class: "sms-time" }, [clockHm()]),
      ]));
    });
    const who = t.contact || t.number || "未知号码";
    const sub = t.number && t.number !== who ? t.number : "短讯";
    const box = el("div", { class: "talk sms", "aria-live": "polite" });
    box.append(el("div", { class: "sms-frame" }, [
      el("div", { class: "sms-status" }, ["中国移动　信息　" + clockHm()]),
      el("div", { class: "sms-bar" }, [
        el("strong", { class: whoClass(who) }, [who]),
        el("span", {}, [sub]),
      ]),
      thread,
      b.choices
        ? el("div", { class: "sms-compose" + (phoneOnly(b) ? " is-phone-op" : "") }, [
          phoneOnly(b) && b.prompt ? el("div", { class: "sms-hint" }, [b.prompt]) : "",
          !phoneOnly(b) && b.compose ? el("div", { class: "sms-hint" }, ["发短讯（70字内）"]) : "",
          choiceBox(b, "sms-choices"),
        ])
        : el("div", { class: "sms-compose" }, [nextBtn(b, (t.beats[t.i + 1] && t.beats[t.i + 1].choices) ? "看完" : "下一条")]),
    ]));
    return box;
  }

  function drawMsg(b) {
    const t = S.talk;
    const box = el("div", { class: "talk msg", "aria-live": "polite" });
    box.append(el("div", { class: "msg-frame" }, [
      el("div", { class: "msg-tag" }, ["语音留言"]),
      el("div", { class: "msg-from " + whoClass(t.contact) }, [t.contact || "未知来源"]),
      el("div", { class: "msg-num" }, [t.number || "语音留言"]),
      el("div", { class: "msg-wave", "aria-hidden": "true" }, ["▶　00:07 / 00:11"]),
      el("div", { class: "talk-text " + whoClass(t.contact) }, [b.choices ? (b.prompt || "……") : ("「" + (b.text || "") + "」")]),
      b.choices ? choiceBox(b, "msg-choices") : el("div", { class: "talk-actions" }, [nextBtn(b, "听完")]),
    ]));
    return box;
  }

  function line(who, text, extra) {
    return Object.assign({ who, text }, extra || {});
  }

  function showVoicemail(from, text, onClose, keep) {
    showModal(from, "「" + text + "」", "贴在门底的手机", "voicemail", onClose, keep);
  }

  function viewingBeats() {
    const door = flag("askedOld")
      ? line("周", "你份留言我睇到。听日下昼，我喺度等。旧嘢怕就同我讲。上来热。水唔烫。")
      : line("周", "上来热。水唔烫。");
    return [
      door,
      line("章慧琪", "唔该。呢层……好静。"),
      line("周", "日头静。晚上旧楼会响，水管、老鼠、隔壁电视。住惯就得。我自己都住前座。"),
      line("章慧琪", "周生，简介写屋内仍有家人旧物。边样？"),
      line("周", "（顿）箱箱袋袋，衫同碗碟。未清完。你介意杂物多，唔合适，你睇过先。"),
      line("章慧琪", "走廊张相……一家人？"),
      line("周", "挂惯咗。自家相。唔关你住。唔好动相框后面嘅箱就得。"),
      line("章慧琪", "边个？你太太？细路？"),
      line("周", "（笑一下，不接）家里人。名你唔使知。相挂住，我唔想收。"),
      line("章慧琪", "客厅有车。"),
      line("周", "前租客留低。我懒清。碍眼我可以挪去……嗰边。（朝走廊尽头看一眼，不说储物室）迟啲先。"),
      line("章慧琪", "阴我唔理。杂物我唔会乱郁。租得，今晚住得？"),
      line("周", "（松一口气）老实。厨房水龙头有时自己滴，我修过，仲滴。你同我讲就得，唔使自己请人。今晚搬得，钥匙我即刻俾你。"),
      {
        prompt: "……",
        choices: [
          {
            label: "墙上那张相，像西贡乡村屋？",
            flag: "askedMudslide",
            note: ["tian", "周说是天灾。他说「他们话」。他没主动讲家人名字。"],
            then: [
              line("章慧琪", "背景好似乡村。西贡那边？"),
              line("周", "（挡了一下视线）旧年嘅事。新闻闹过一阵。报过。他们话天灾。唔好著你个租客身上。"),
              ...afterTour(),
            ],
          },
          {
            label: "先看房间。",
            flag: "sawSillTour",
            then: [
              line("", "主房窗台有一圈浅色水印，形状像小孩鞋的印子。他用脚踩住那片水印。"),
              ...afterTour(),
            ],
          },
          {
            label: "你一个人住会怕吗？",
            flag: "debtSlip",
            note: ["zhai", "口误：「还债」改成「还生活」。"],
            then: [
              line("周", "怕过。后来发现，怕的人先走。剩低的人要还债……要还生活。"),
              ...afterTour(),
            ],
          },
        ],
      },
    ];
  }

  function afterTour() {
    return [
      line("章慧琪", "嗰间锁咗？"),
      line("周", "储物。衫箱多，乱。钥匙我拎住。你唔使开。门后有楼梯，上晒衫用。你要多一格柜，同我讲。"),
      line("", "他收现金，手写一张收条，钱数了两遍。"),
      line("周", "无印花，平就平在呢度。我住 4 楼前座，隔一道墙。水龙头、老鼠、门锁，你敲门，我开。重建嗰啲嘢，名单挂咗好耐，未轮到。到时我同你讲，唔会无端端赶人。"),
      line("章慧琪", "我会好静。"),
      line("周", "安静最好。旧楼就系咁，住惯就得。"),
      {
        prompt: "……",
        choices: [
          {
            label: "这把？",
            then: [
              line("周", "天台。晾衫。晚上风大，早啲翻落来。"),
              line("章慧琪", "我今晚搬。"),
              { goto: moveInStart },
            ],
          },
          {
            label: "你怎么知道我会住惯。",
            note: ["nai", "睇得细的人，住得耐。"],
            then: [
              line("周", "你眼看门锁，看水渍，看我手。租客很少看这么多。睇得细的人，住得耐。"),
              line("周", "天台那把也给你。晾衫。晚上风大，早啲翻落来。"),
              { goto: moveInStart },
            ],
          },
        ],
      },
    ];
  }

  function dayMessage() {
    const saved = (S.chatLogs || {})["0808"];
    const lines = saved && saved.lines && saved.lines.length
      ? saved.lines
      : [["she", "住得惯未。唔好又唔食饭。"]];
    const last = lines[lines.length - 1];
    const read = saved && (saved.closed || lines.length > 1);
    return el("div", { class: "day-msg" }, [
      el("div", { class: "day-msg-k" }, [read ? "已读" : "有讯息"]),
      el("strong", {}, [last[0] === "me" ? "章慧琪" : "陈美娟"]),
      el("p", {}, [last[1]]),
    ]);
  }

  function moveInAct(key) {
    return S.moveIn && S.moveIn.acted && S.moveIn.acted[key];
  }

  function markMoveIn(key) {
    S.moveIn.acted = S.moveIn.acted || {};
    S.moveIn.acted[key] = true;
  }

  function moveInStart() {
    S.talk = null;
    S.mode = "movein";
    S.moveIn = { acted: {} };
    setTime("2014年8月1日 夜");
    drawMoveIn();
  }

  function sillMoveInText() {
    if (flag("sawSillTour")) {
      return "铁条窗。窗台上那圈浅色水印还在，是干的。看房时周生用脚踩住过——你认得那个形状。";
    }
    return "铁条窗。外面是天井一侧，旧霓虹和对面的窗户。窗台上有一圈浅色水印，像有人踮着脚留下的印子。你按了按，是干的。";
  }

  function drawMoveIn() {
    clearStage();
    const looks = [
      hot("大门与铁闸", "两道锁都试过。钥匙还能拧顺。", () => {
        markMoveIn("door");
        showModal("大门与铁闸", "两道锁都试过。铁闸推开时会响。钥匙齿有些磨损，还能拧顺。你反手锁好，又试了一次。", "", null, () => drawMoveIn());
      }, "01-view-door", moveInAct("door")),
      hot("全家福", "相框很干净。相后靠着纸箱。", () => {
        markMoveIn("family");
        note("move-family", "周说这是家里人。名字他不讲。相挂得很整齐。");
        showModal("全家福", "三个人。男人笑得很用力，女人缺一颗牙，小男孩看向镜头外面。相框擦得很干净，没有灰。相框后面靠着两个纸箱。周先生说不要动。", "", null, () => drawMoveIn());
      }, "01-prop-family", moveInAct("family")),
      hot("玩具车", "车头朝窗。车里没有灰。", () => {
        markMoveIn("car");
        note("move-car", "车头朝窗。车里没有灰。");
        showModal("玩具车", "一辆旧红色塑料玩具车。车轮完整，没有缺件。车头朝窗。茶几上有一圈晒痕，像这辆车常常停在这里。你没有碰。", "", null, () => drawMoveIn());
      }, "01-prop-car-window", moveInAct("car")),
      hot("厨房水龙头", "关上之后还会滴一滴。", () => {
        markMoveIn("tap");
        note("move-tap", "关上之后还会滴。周说修过。");
        showModal("厨房水龙头", "拧开，水流一顿一顿的，带着铁管味。关上之后，等了几秒，滴答一声，又滴了一滴。周先生说修过，还在滴。", "", null, () => drawMoveIn());
      }, "01-prop-tap", moveInAct("tap")),
      hot("储物室门", "锁着。里面很安静。", () => {
        markMoveIn("storage");
        showModal("储物室门", "木门。锁从走廊这一侧锁着。门底有一道缝，里面是黑的，没有光。贴近门板听了一会儿，很安静。后楼梯在这扇门后面。你没有钥匙。", "", null, () => drawMoveIn());
      }, "01-prop-storage", moveInAct("storage")),
      hot("主房窗台", "干的水印。", () => {
        markMoveIn("sill");
        showModal("主房窗台", sillMoveInText(), "", null, () => drawMoveIn());
      }, "01-prop-sill", moveInAct("sill")),
      hot("行李与床", "一只箱、一只袋。", () => {
        markMoveIn("bed");
        showModal("行李与床", "一只纸箱、一只旧旅行袋，都是你的。箱推在墙角。厨房没有剩菜。床上只有你带来的薄被。", "", null, () => drawMoveIn());
      }, "01-view-interior", moveInAct("bed")),
      hot("天台钥匙", "挂在门旁小钩上。", () => {
        markMoveIn("roof");
        showModal("天台钥匙", "第三把钥匙挂在门旁小钩上。周先生说过：晾衫用。晚上风大，早点下来。你没有上去。", "", null, () => drawMoveIn());
      }, "01-view-stair", moveInAct("roof")),
    ];
    const box = el("div", { class: "room scene-fit" });
    box.append(
      imgSlot("01-view-interior", "room-bg", "后座"),
      el("p", { class: "room-note" }, ["周生下楼回前座。你一个人站在走廊里。钥匙在掌心，三把。"]),
      el("div", { class: "room-dock" }, [el("div", { class: "room-map" }, looks)])
    );
    const wrap = el("div", { class: "desk night-desk" });
    wrap.append(box);
    stage.append(wrap);
    stage.append(moveInActions());
    renderPlaybar();
  }

  function moveInActions() {
    const box = el("div", { class: "scene-actions" });
    box.classList.add("fork");
    box.append(
      el("div", { class: "fork-head" }, ["今晚"]),
      forkChoice("甲", "scene-act", () => {
        markMoveIn("tv");
        showModal("电视", "旧楼天线，只有沙沙声。你又关掉。", "", null, () => drawMoveIn());
      }, "开一下电视"),
      el("div", { class: "fork-or", "aria-hidden": "true" }, ["或"]),
      forkChoice("乙", "scene-act", () => {
        markMoveIn("meter");
        note("move-meter", "记下电费表：08-01。");
        showModal("电费表", "记下今天的读数。08-01。以后若要留证，有个起点。", "", null, () => drawMoveIn());
      }, "记下电表读数"),
      el("div", { class: "fork-or", "aria-hidden": "true" }, ["或"]),
      forkChoice("丙", "scene-act primary", finishMoveIn, "先睡一晚")
    );
    return box;
  }

  function finishMoveIn() {
    S.talk = null;
    showModal(
      "08-01 夜",
      "前座电视声隔着墙闷闷的，十一点前后关了。没有人敲门。储物室那边没有脚步声。你锁好门，躺下。",
      "荣汇街 28 号 后座",
      null,
      () => twoWeeks()
    );
  }

  function twoWeeks() {
    setTime("2014年8月3日–13日");
    S.talk = null;
    S.mode = "cal";
    drawCalendar();
  }

  function drawCalendar() {
    clearStage();
    const days = [
      ["08-03", "周上门修水龙头。真的不滴了。收工说「有事敲门」。", "01-cal-tap"],
      ["08-07", "他送来一碗糖水，「太热」。碗第二天他还来收。", "01-cal-tongshui"],
      ["08-08", "倾偈　陈美娟", ""],
      ["08-10", "第二笔周租。现金。他数两遍，点头，写在一本日历上。", "01-cal-rent"],
      ["08-12", "你把玩具车放到角落。第二天车仍在角落。", "01-cal-car-corner"],
      ["08-13", "夜里水管响。你开了录音。听完只有水声。", "01-cal-pipe"],
    ];
    const box = el("div", { class: "desk scene-desk" }, [
      imgSlot("01-view-interior", "scene-plate", "后座"),
      el("div", { class: "calendar" }, [
        el("h2", {}, ["两周"]),
        el("div", {
          class: "days",
          onclick: (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            const id = btn.getAttribute("data-day");
            if (!id) return;
            openCalDay(id, btn.getAttribute("data-text") || "");
          },
        }, days.map(([id, text, img]) =>
          el("button", {
            type: "button",
            class: S.calSeen[id] ? "seen" : "",
            "data-day": id,
            "data-text": text,
          }, [
            id === "08-08" ? dayMessage() : imgSlot(img, "day-img", id),
            el("span", { class: "day-label" }, [id]),
          ])
        )),
      ]),
    ]);
    stage.append(box);
    renderPlaybar();
  }

  function openCalDay(id, text) {
    S.calSeen[id] = true;
    if (id === "08-08") {
      startChat("0808");
      return;
    }
    if (id === "08-12") note("car-still", "你把车放到角落。第二天它还在。");
    if (id === "08-13") {
      showModal("录音：只有水", text, "2014年8月13日 夜", "memo", () => drawCalendar(), {
        id: "rec-water",
        kind: "录音",
        title: "只有水",
        time: "2014年8月13日 夜",
        body: "水管。没有人声。用来对照十五号之后。",
      });
      return;
    }
    showModal(id, text);
  }

  function startChange() {
    S.modal = null;
    setTime("2014年8月14日 周四 傍晚");
    startTalk([
      line("周", "章小姐。后座……我想收回自住。定金我退你。周租都退。你再住两日，走得唔得？"),
      line("章慧琪", "我冇度去。我啱啱当呢度系住嘅。"),
      line("周", "当我冇讲。当我冇讲。水喉有问题我再睇。你当今日冇呢句。"),
      line("", "信封角从指缝露出来，上面有一截红圈，字看不清。"),
      {
        prompt: "他已经转身。",
        choices: [
          {
            label: "看信封。",
            then: () => showModal(
              "信封",
              "角上有一个红圈。圈里的字看不清。",
              "2014年8月14日 傍晚",
              "memo",
              () => drawTalk(),
              {
                id: "letter-red",
                kind: "信封",
                title: "红圈",
                time: "2014年8月14日 傍晚",
                body: "角上有一个红圈。圈里的字看不清。",
                img: "01-letter-red",
              }
            ),
          },
          {
            label: "发生什么事？",
            note: ["takeback", "他下午还好好。傍晚要收回。他说重建，又说未定。"],
            then: [
              line("周", "冇。重建嗰啲。未定。你唔好问。"),
              { goto: nightStart },
            ],
          },
          {
            label: "我可以晚一点走。",
            then: [
              line("周", "唔使你答应。当我冇讲。"),
              { goto: nightStart },
            ],
          },
          {
            label: "不追。关门。",
            then: [{ goto: nightStart }],
          },
        ],
      },
    ], "后座门口");
  }

  function nightClockText() {
    const m = S.night.min || 63;
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return "2014年8月15日 周五 " + hh + ":" + mm;
  }

  function stopNightClock() {
    if (nightTick) {
      clearInterval(nightTick);
      nightTick = null;
    }
  }

  function startNightClock() {
    stopNightClock();
    nightTick = setInterval(tickNight, 1100);
  }

  function tickNight() {
    if (S.mode !== "night") return stopNightClock();
    if (S.modal || !mapLayer.hidden) return;
    if ((S.night.min || 63) >= 101) return;
    S.night.min += 1;
    setTime(nightClockText());
    const loc = stage.querySelector(".talk-loc");
    if (loc) loc.textContent = "后座 " + S.time + (S.night.recording ? "（录音中）" : "");
    fireNightEvents();
  }

  function fireNightEvents() {
    const n = S.night;
    n.fired = n.fired || {};
    const m = n.min;
    let changed = false;
    if (m === 67 && !n.fired.light) {
      n.fired.light = true;
      changed = true;
    }
    if (m === 79 && !n.fired.car) {
      n.fired.car = true;
      n.car = "地";
      note("car-move", "车自己转了方向。");
      changed = true;
    }
    if (m === 91 && !n.fired.voice) {
      n.fired.voice = true;
      if (n.recording) {
        note("voice", "女人声「阿轩，返嚟食饭。」从储物室门底那边来。");
        if (flag("askedMudslide")) note("voice2", "同一声叠了一下。");
      }
      changed = true;
    }
    if (m === 101 && !n.fired.print) {
      n.fired.print = true;
      n.print = true;
      note("print", "门底下伸出一小截湿脚印，到一半停住。");
      changed = true;
    }
    if (changed && !S.modal && S.mode === "night") drawNight();
  }

  function axuanItem() {
    return {
      id: "rec-axuan",
      kind: "录音",
      title: "阿轩，返嚟食饭",
      time: "2014年8月16日 夜",
      body: "女人声。从储物室门底那边来。声线稳，像留过言。",
    };
  }

  function openAxuan(onClose) {
    showVoicemail("丽芬（旧机）", "阿轩，返嚟食饭。", onClose || (() => drawNight()), axuanItem());
  }

  function printItem() {
    return {
      id: "photo-print",
      kind: "照片",
      title: "门底湿脚印",
      time: "2014年8月16日 夜",
      body: "到一半停住。",
      img: "01-night-print",
    };
  }

  function openPrint(onClose) {
    showModal("照片：门底湿脚印", "门底下伸出一小截湿脚印，走到一半就停下了。", "", "memo", onClose || (() => drawNight()), printItem());
  }

  function sillItem() {
    return {
      id: "photo-sill",
      kind: "照片",
      title: "窗台童码",
      time: "2014年8月16日 夜",
      body: "比我的脚小两号。今晚没下雨。水是新的。",
      img: "01-prop-sill",
    };
  }

  function nameItem() {
    return {
      id: "rec-name",
      kind: "录音",
      title: "章慧琪。你知",
      time: "2014年9月7日 夜",
      body: "先是阿轩，返嚟食饭。再低一句：章慧琪。你知。声从门底来。",
    };
  }

  function resumeNight() {
    S.talk = null;
    S.mode = "night";
    if (S.night) S.night.phase = "leave";
    drawNight();
    startNightClock();
  }

  function nightStart() {
    note("whisper", "前座一个人说话。他说吓。");
    S.talk = null;
    S.mode = "night";
    S.night = { min: 63, car: "窗", recording: false, print: false, fired: {}, acted: {}, phase: "phone" };
    setTime(nightClockText());
    drawNight();
    startNightClock();
  }

  function drawNight() {
    clearStage();
    const n = S.night;
    const carText = n.car === "门" ? "车头朝门" : n.car === "地" ? "掉在地上，朝储物室" : "车头朝窗";
    const carImg = n.car === "门" ? "01-prop-car-door" : n.car === "地" ? "01-prop-car-floor" : "01-prop-car-window";
    const box = el("div", { class: "room scene-fit" });
    const sillDone = nightAct("sill");
    const looks = [
      hot("全家福", "丽芬在笑，缺一颗牙。阿轩看向镜头外。", () => {
        markNight("family");
          if (n.recording) note("photo-rec", "录音里有极轻的一声「阿轩」。");
        showModal("全家福", "丽芬在笑，缺一颗牙。阿轩看向镜头外。相框背面没有写日期。", "", null, () => drawNight());
      }, "01-prop-family", nightAct("family")),
        hot("玩具车", carText, () => {
          if (n.car === "窗") n.car = "门";
        markNight("car");
        showModal("玩具车", n.car === "地" ? "掉在地上，车头朝储物室。" : "车头朝向和刚才不同了。", "", null, () => drawNight());
      }, carImg, nightAct("car")),
      hot("窗台水印", sillDone ? sillLine(sillDone) : "童码。比你的脚小两号。今晚没下雨。", () => sillMenu(), "01-prop-sill", !!sillDone),
      hot("水龙头", "拧紧后，三秒后又滴水。", () => {
          if (n.recording) note("drip", "滴水里夹着女人气音，叫不全。");
        markNight("tap");
        showModal("水龙头", "拧紧后，等了三秒，又滴下来。");
      }, "01-prop-tap", nightAct("tap")),
      hot("储物室门底", n.fired && n.fired.voice && n.recording ? "那卷录音还在" : "锁着。", () => {
        if (n.fired && n.fired.voice && n.recording) {
          markNight("heardAxuan");
          openAxuan();
          return;
        }
        markNight("door");
        showModal("储物室", "门锁着。里面有纸页被翻的声音，很慢。你敲了门，没有人应。隔壁电视的笑声准时传来。");
      }, "01-prop-storage", nightAct("door") || nightAct("heardAxuan")),
    ];
    if (n.print) {
      looks.push(hot("湿脚印", "门底下，走到一半停下。", () => {
        markNight("sawPrint");
        openPrint();
      }, "01-night-print", nightAct("sawPrint")));
    }
    box.append(
      imgSlot("01-night-room", "room-bg", "后座夜里"),
      n.fired && n.fired.light ? el("p", { class: "room-note" }, ["走廊灯自己亮，再灭。"]) : "",
      el("div", { class: "room-dock" }, [
        el("div", { class: "room-map" }, looks),
      ])
    );
    const wrap = el("div", { class: "desk night-desk" });
    wrap.append(box);
    stage.append(wrap);
    stage.append(nightSceneActions(n));
    renderPlaybar();
  }

  function forkChoice(mark, className, onclick, label) {
    return el("button", {
      type: "button",
      class: className,
      "aria-label": mark + "，" + label,
      onclick,
    }, [
      el("span", { class: "fork-mark", "aria-hidden": "true" }, [mark]),
      label,
    ]);
  }

  function nightSceneActions(n) {
    const box = el("div", { class: "scene-actions" });
    if (n.phase !== "leave") {
      box.classList.add("phone-launch");
      box.append(phoneButton("打开手机", () => phoneMenu(), { hint: n.recording ? "录音开着" : "" }));
      return box;
    }
    box.classList.add("fork");
    box.append(
      el("div", { class: "fork-head" }, ["今夜"]),
      forkChoice(
        "甲",
        "scene-act" + (flag("knockedZhou") ? " done" : " primary"),
        knockZhou,
        flag("knockedZhou") ? "已敲过门" : "敲周先生的门"
      ),
      el("div", { class: "fork-or", "aria-hidden": "true" }, ["或"]),
      forkChoice("乙", "scene-act primary", waitDawn, "忍到天亮")
    );
    return box;
  }

  function hot(title, sub, fn, imgId, seen) {
    const kids = [];
    if (imgId) kids.push(imgSlot(imgId, "hot-img", title));
    kids.push(el("span", { class: "hot-copy" }, [title, el("small", {}, [sub])]));
    return el("button", { class: "hot" + (seen ? " seen" : ""), type: "button", onclick: fn }, kids);
  }

  function nightAct(key) {
    return S.night && S.night.acted && S.night.acted[key];
  }

  function markNight(key, val) {
    S.night.acted = S.night.acted || {};
    S.night.acted[key] = val || true;
  }

  function sillLine(which) {
    if (which === "wipe") return "擦掉了。同一位置又有一圈。";
    if (which === "photo") return "拍下来了。水是新的。";
    return "你没有再碰。水还在。";
  }

  function sillMenu() {
    const done = nightAct("sill");
    if (done === "photo") {
      showModal("照片：窗台童码", "水是新的。今晚没下雨。比我的脚小两号。", "", "memo", () => drawNight(), sillItem());
      return;
    }
    if (done) {
      showModal("窗台水印", sillLine(done));
      return;
    }
    closeModal();
    const ch = el("div", { class: "choices" });
    [
      ["擦掉", "wipe", () => {
        flag("wipedSill", true);
        showModal("窗台水印", "擦掉了。水印还是新的。", "", null, () => drawNight());
      }],
      ["拍照", "photo", () => {
        flag("photoSill", true);
        note("sill", "窗台童码。比我的脚小两号。拍下来了。");
        showModal("照片：窗台童码", "水是新的。今晚没下雨。比我的脚小两号。", "", "memo", () => drawNight(), sillItem());
      }],
      ["不理", "skip", () => showModal("窗台水印", "水是新的。今晚没下雨。", "", null, () => drawNight())],
    ].forEach(([label, key, then]) => {
      ch.append(el("button", {
        type: "button",
        onclick: () => {
          markNight("sill", key);
          closeModal();
          then();
        },
      }, [label]));
    });
    const sheet = el("div", { class: "sheet" }, [el("h3", {}, ["窗台水印"]), ch]);
    S.modal = el("div", { class: "modal", id: "game-modal" }, [sheet]);
    stage.append(S.modal);
  }

  function phoneMenu() {
    markNight("phone");
    closeModal();
    const n = S.night;
    const lokDone = flag("calledLok");
    const alarmDone = flag("called999");
    const row = (title, sub, onclick, extra) => el("button", {
      type: "button",
      class: "phone-row" + (extra || ""),
      onclick,
    }, [
      el("span", { class: "phone-row-name" }, [title]),
      sub ? el("small", {}, [sub]) : "",
    ]);
    const home = el("div", { class: "phone-home" }, [
      el("p", { class: "phone-sec" }, ["录音"]),
      row(n.recording ? "录音开着" : "录音关着", n.recording ? "点按停止" : "点按开始", () => {
        n.recording = !n.recording;
        phoneMenu();
      }, n.recording ? " on" : ""),
      el("p", { class: "phone-sec" }, ["通讯录"]),
      row("阿乐", lokDone ? "已挂断" : "已删置顶", () => {
        closeModal();
        if (lokDone) showModal("阿乐", "打过。两声，对方挂断。没有留言。", "", null, () => phoneMenu());
        else callLok();
      }, lokDone ? " done" : ""),
      row("999", alarmDone ? "已打过" : "紧急求助", () => {
        closeModal();
        alarm();
      }, alarmDone ? " done" : ""),
    ]);
    if (flag("clinicAddr")) {
      home.append(
        el("p", { class: "phone-sec" }, ["短讯"]),
        row("陈家豪", "诊所地址　已读", () => {
          closeModal();
          showModal("陈家豪", "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n日间请经医院门诊。", "短讯　已读", "memo", () => phoneMenu());
        }, " done")
      );
    }
    home.append(el("button", {
      type: "button",
      class: "phone-hang",
      onclick: () => {
        n.phase = "leave";
        closeModal();
        drawNight();
      },
    }, ["放下手机"]));
    const frame = el("div", { class: "phone-frame" }, [
      el("div", { class: "phone-status" }, ["中国移动　拨号　" + clockHm()]),
      home,
    ]);
    S.modal = el("div", { class: "modal phone-menu", id: "game-modal" }, [frame]);
    stage.append(S.modal);
  }

  function callLok() {
    if (flag("calledLok")) {
      showModal("阿乐", "打过。两声，对方挂断。没有留言。");
      return;
    }
    flag("calledLok", true);
    markNight("phone");
    stopNightClock();
    startTalk([
      line("", "电话拨出去。响第一声。"),
      line("", "响第二声。"),
      line("", "对方挂断，没有留言。"),
      { goto: resumeNight },
    ], "拨出 阿乐", "phone", { contact: "阿乐", number: "已删置顶", dialout: true });
  }

  function alarm() {
    if (flag("called999")) {
      showModal("999", "已经打过。没有人伤、没有人入屋，他们不派车。");
      return;
    }
    flag("called999", true);
    note("999", "差人只问有没有人伤。");
    startTalk([
      line("差人", "紧急求助。有没有人伤？有没有人入屋？"),
      line("章慧琪", "没有。有声音。有车自己转。"),
      line("差人", "没有人伤、没有人入屋，我们不派车。你可到就近警署备案。身体不适打九九九叫救护车。"),
      {
        prompt: "通话还开着。",
        choices: [
          { label: "挂断", hint: "回屋里", phone: true, hangup: true, then: [{ goto: resumeNight }] },
        ],
      },
    ], "拨出 999", "phone", { contact: "999", number: "紧急求助", dialout: true });
  }

  function leaveNightToMei() {
    stopNightClock();
    if (flag("knockedZhou")) {
      startChat("mei16");
      return;
    }
    flag("knockedZhou", true);
    note("wet", "周问我脚湿不湿。我没有。");
    setTime("2014年8月15日 周五 清晨");
    startTalk([
      line("", "天亮了。你经过前座门口。"),
      line("周", "你脚湿了？"),
      line("章慧琪", "没有。"),
      line("", "你的鞋子是干的。他关上门。"),
      { goto: () => startChat("mei16") },
    ], "4 楼前座门口", "face");
  }

  function knockZhou() {
    if (flag("knockedZhou")) {
      showModal("周先生", "已经敲过。他说是水管，问你脚湿不湿。你没有。");
      return;
    }
    flag("knockedZhou", true);
    note("wet", "周问我脚湿不湿。我没有。");
    const late = (S.night.min || 63) >= 79;
    startTalk([
      line("周", late
        ? "响呀？水管。电视开住。我日头帮你睇。你怕，就开灯。唔好上天台。"
        : "响呀？水管。我日头帮你睇。你怕，就开灯，开电视。唔好上天台。"),
      line("周", "你脚湿了？"),
      line("章慧琪", "没有。"),
      line("", late ? "他过了几秒才开门。睡衣领口是湿的。他关上门。你的脚是干的。" : "他开门很慢，像是刚睡醒。他关上门。你的脚是干的。"),
      {
        prompt: "……",
        choices: [
          { label: "回屋里", then: [{ goto: resumeNight }] },
          { label: "忍到天亮，找表姐", then: [{ goto: waitDawn }] },
        ],
      },
    ], "4 楼前座门口");
  }

  function waitDawn() {
    stopNightClock();
    const n = S.night;
    n.fired = n.fired || {};
    const missedVoice = !!(n.recording && !n.fired.voice);
    const missedPrint = !n.fired.print;
    const unseenVoice = !!(n.recording && !nightAct("heardAxuan"));
    const unseenPrint = !nightAct("sawPrint");
    if (!n.fired.car) {
      n.car = "地";
      note("car-move", "车自己转了方向。");
    }
    if (missedVoice) {
      note("voice", "女人声「阿轩，返嚟食饭。」从储物室门底那边来。");
    }
    if (missedPrint) {
      n.print = true;
      note("print", "门底下伸出一小截湿脚印，到一半停住。");
    }
    n.fired = { light: true, car: true, voice: true, print: true };
    n.min = 101;
    setTime(nightClockText());
    if (n.recording || S.notes.some((x) => x.id === "voice")) {
      note("dawn", "你把录音听了三遍。女人叫仔吃饭。水声。");
    }
    const go = () => leaveNightToMei();
    const offerPrint = () => {
      if (!(missedPrint || unseenPrint)) return go();
      markNight("sawPrint");
      openPrint(go);
    };
    if (missedVoice || unseenVoice) {
      markNight("heardAxuan");
      openAxuan(offerPrint);
    } else offerPrint();
  }

  function persistChat() {
    S.chatLogs = S.chatLogs || {};
    S.chatLogs[S.chatPack] = {
      lines: S.chat,
      step: S.chatStep,
      closed: !!S.chatClosed,
    };
  }

  function startChat(pack) {
    stopNightClock();
    closeModal();
    S.talk = null;
    S.mode = "chat";
    S.chatPack = pack || "mei16";
    S.chatLogs = S.chatLogs || {};
    if (S.chatPack === "0808") setTime("2014年8月8日 周五 21:06");
    else setTime("2014年8月15日 周五 10:02");
    const saved = S.chatLogs[S.chatPack];
    if (saved) {
      S.chat = saved.lines;
      S.chatStep = saved.step;
      S.chatClosed = !!saved.closed;
    } else {
      S.chat = S.chatPack === "0808"
        ? [["she", "住得惯未。唔好又唔食饭。"]]
        : [["she", "阿琪，你终于肯回我。八号你仲话周生好人。新屋点？"]];
    S.chatStep = 0;
      S.chatClosed = false;
      persistChat();
    }
    drawChat();
  }

  const CHAT_MEI16 = [
    { me: ["旧。平。夜里响。今次会郁嘢。唔係我「见到」。"] },
    { she: "你又……阿乐同我讲过。你今次真搬出去住，我以为会好。" },
    { me: ["差人唔来。我唔想再听人话我神经。"] },
    { she: "我冇话你神经。你一个人我担心。唔好再同阿乐讲，佢听唔懂。" },
    { me: ["咁你想点。"] },
    { she: "我想你同能听的人讲。家豪大学识嘅朋友，读医嗰个。年夜饭佢喝醉，成晚讲呢个人。你问过边个阿明，记得未？" },
    { me: ["就系成日留佢加班那个。"] },
    { she: "系。我见过一次，家豪去医院接佢收工。人斯文，唔会一开口就话你疯。我叫家豪问下得唔得——你唔想去，当我冇讲。" },
  ];

  function chatClock(i, pack) {
    const id = pack || S.chatPack;
    if (id === "0808") return "21:" + String(6 + i).padStart(2, "0");
    return "10:" + String(2 + i).padStart(2, "0");
  }

  function chatPackLines(id) {
    if (S.chatPack === id) return S.chat || [];
    const saved = (S.chatLogs || {})[id];
    return (saved && saved.lines) || [];
  }

  function chatArchive() {
    const rows = [];
    [
      ["0808", "8月8日"],
      ["mei16", "8月15日"],
    ].forEach(([id, when]) => {
      const lines = chatPackLines(id);
      if (!lines.length) return;
      lines.forEach(([k, t], i) => {
        rows.push({
          when,
          clock: chatClock(i, id),
          who: k === "me" ? "章慧琪" : "陈美娟",
          text: t,
        });
      });
    });
    return rows;
  }

  function closeChatWindow() {
    S.chatHist = false;
    persistChat();
    if (S.chatPack === "0808") {
      if (S.chat.length >= 3) {
        S.chatClosed = true;
        persistChat();
      }
      twoWeeks();
      return;
    }
    resumeNight();
  }

  function drawChatHist(host) {
    const q = (S.chatQuery || "").trim();
    const hits = chatArchive().filter((r) => !q || (r.when + r.who + r.text).includes(q));
    host.replaceChildren();
    if (!hits.length) {
      host.append(el("p", { class: "chat-empty" }, ["没有符合的记录。"]));
      return;
    }
    hits.forEach((r) => {
      host.append(el("div", { class: "chat-hit" }, [
        el("div", { class: "bubble-meta" }, [r.when + "　" + r.clock + "　" + r.who]),
        el("div", { class: "bubble-text " + whoClass(r.who) }, [r.text]),
      ]));
    });
  }

  function drawChat() {
    clearStage();
    const box = el("div", { class: "desk im-desk" });
    box.append(imgSlot("01-chat-bg", "talk-bg", "倾偈"));
    const chat = el("div", { class: "chat" });
    chat.append(el("div", { class: "chat-bar" }, [
      el("span", {}, ["倾偈　—　陈美娟"]),
      el("button", {
        type: "button",
        class: "chat-close",
        title: "关闭",
        onclick: closeChatWindow,
      }, ["×"]),
    ]));
    chat.append(el("div", { class: "chat-contact" }, [
      imgSlot("01-sil-mei", "chat-ava", "陈美娟"),
      el("div", {}, [
        el("strong", { class: whoClass("陈美娟") }, ["陈美娟"]),
        el("span", {}, [S.chatPack === "0808" ? "在线" : "忙碌"]),
      ]),
    ]));
    const histBox = el("div", { class: "chat-hist" });
    const find = el("input", { type: "search", value: S.chatQuery || "", placeholder: "查找记录" });
    find.addEventListener("input", () => {
      S.chatQuery = find.value;
      drawChatHist(histBox);
    });
    chat.append(el("div", { class: "chat-tools" }, [
      el("button", {
        type: "button",
        class: S.chatHist ? "on" : "",
        onclick: () => {
          S.chatHist = !S.chatHist;
          drawChat();
        },
      }, ["聊天记录"]),
    ]));
    if (S.chatHist) {
      drawChatHist(histBox);
      chat.append(el("div", { class: "chat-find" }, [
        find,
        histBox,
      ]));
      chat.append(el("div", { class: "chat-status" }, ["倾偈　│　网络：在线"]));
      box.append(chat);
      stage.append(box);
      find.focus();
      renderPlaybar();
      return;
    }
    const bubbles = el("div", { class: "bubbles" });
    S.chat.forEach(([k, t], i) => {
      const mine = k === "me";
      bubbles.append(el("div", { class: "bubble " + (mine ? "me" : "she") }, [
        el("div", { class: "bubble-meta" }, [
          (mine ? "章慧琪" : "陈美娟") + "　" + chatClock(i),
        ]),
        el("div", { class: "bubble-text " + whoClass(mine ? "章慧琪" : "陈美娟") }, [t]),
      ]));
    });
    chat.append(bubbles);
    const pinLog = () => { bubbles.scrollTop = bubbles.scrollHeight; };

    if (S.chatPack === "0808") {
      if (S.chatClosed || S.chat.length >= 3) {
        chat.append(el("button", {
          class: "btn chat-continue",
          type: "button",
          onclick: () => {
            S.chatClosed = true;
            persistChat();
            twoWeeks();
          },
        }, ["合上倾偈"]));
      } else if (S.chatStep === 0) {
        const ch = el("div", { class: "choices chat-choices" });
        ch.append(el("button", {
          type: "button",
          onclick: () => {
            S.chat.push(["me", "周生好人。水龙头佢嚟修。"]);
            S.chatStep = 1;
            persistChat();
            drawChat();
          },
        }, ["周生好人。水龙头佢嚟修。"]));
        ch.append(el("button", {
          type: "button",
          onclick: () => {
            S.chatClosed = true;
            persistChat();
            note("ming-name", "美娟问过住得惯未。你已读，没回。");
            twoWeeks();
          },
        }, ["已读。不回。"]));
        chat.append(ch);
      } else if (!S.chatClosed && S.chat.length < 3) {
        chat.append(el("button", {
          class: "btn chat-continue",
          type: "button",
          onclick: () => {
            S.chat.push(["she", "你姐夫话旧楼小心火烛。佢又加班，又系阿明——差馆嗰啲。"]);
            note("ming-name", "美娟又提阿明。家豪加班。");
            persistChat();
            drawChat();
          },
        }, ["继续"]));
      } else {
        chat.append(el("button", {
          class: "btn chat-continue",
          type: "button",
          onclick: () => {
            S.chatClosed = true;
            persistChat();
            twoWeeks();
          },
        }, ["合上倾偈"]));
      }
      chat.append(el("div", { class: "chat-status" }, ["倾偈　│　网络：在线"]));
      box.append(chat);
      stage.append(box);
      pinLog();
      renderPlaybar();
      return;
    }

    const step = S.chatStep;
    if (S.chatClosed) {
      chat.append(el("button", {
        class: "btn chat-continue",
        type: "button",
        onclick: () => resumeNight(),
      }, ["合上倾偈"]));
    } else if (step < CHAT_MEI16.length) {
      const node = CHAT_MEI16[step];
      if (node.she) {
        chat.append(
          el("button", {
            class: "btn chat-continue",
            type: "button",
            onclick: () => {
              S.chat.push(["she", node.she]);
              S.chatStep += 1;
              drawChat();
            },
          }, ["继续"])
        );
      } else {
        const ch = el("div", { class: "choices chat-choices" });
        node.me.forEach((t) => {
          ch.append(
            el("button", {
              type: "button",
              onclick: () => {
                S.chat.push(["me", t]);
                S.chatStep += 1;
                drawChat();
              },
            }, [t])
          );
        });
        chat.append(ch);
      }
    } else {
      const ch = el("div", { class: "choices chat-choices" });
      [
        ["我不是病人。", false],
        ["……问下得。", false],
        ["家豪自己都怪怪地。", true],
      ].forEach(([t, noise]) => {
        ch.append(
          el("button", {
            type: "button",
            onclick: () => {
              S.chat.push(["me", t]);
              S.chatClosed = true;
              persistChat();
              if (noise) {
                flag("meiNoise", true);
                note("brother", "美娟：佢对阿明好到像亲兄弟。人唔怪。我都嫌。");
              }
              howardCall();
            },
          }, [t])
        );
      });
      chat.append(ch);
    }
    chat.append(el("div", { class: "chat-status" }, ["倾偈　│　网络：在线"]));
    box.append(chat);
    stage.append(box);
    pinLog();
    renderPlaybar();
  }

  function howardCall() {
    setTime("2014年8月15日 周五 10:18");
    startTalk([
      line("陈家豪", "阿琪？美娟叫我打。我喺差馆。你住得惯吗？旧楼响，好正常。"),
      line("章慧琪", "车会自己转。录音有女人叫仔食饭。前两周冇。"),
      line("陈家豪", "美娟话你搬咗去深水埗。荣汇街，系咪。旧。我带你去见个人。唔系急症。大学识嘅，读医，我读社会学，宿舍隔一层。日头医院，晚上湾仔有私家。我哋叫佢阿明。罗启明。年夜饭我讲过。"),
      line("章慧琪", "就系成日留你加班嗰个。"),
      line("陈家豪", "系。佢识听。我介绍，佢会收。你同佢讲真话。听完就会攞嚟自己身上。所以你……准时到就得。楼下嗰间面，佢有时会忘食。"),
      line("章慧琪", "佢点？"),
      line("陈家豪", "专业。用心。佢本人精神有时唔太好。过劳。你当我冇讲。睇病人一流。"),
      {
        prompt: "听筒里静了半拍。",
        choices: [
          {
            label: "好。明天我去。",
            then: howardClose(),
          },
          {
            label: "「不太好」是什么意思",
            flag: "askedWorry",
            note: ["worry", "陈：阿明接不上昨日。别让他知道是我说的。他说「我担心就算」。"],
            then: [
              line("陈家豪", "失眠，健忘，有时接唔上昨日。你别同佢讲系我说的。佢唔钟意人担心佢。我担心就算。"),
              ...howardClose(),
            ],
          },
          {
            label: "你为什么这么快就把我塞给他？",
            flag: "askedWhyFast",
            then: [
              line("陈家豪", "因为你系亲人。因为佢需要……因为佢擅于这种。我送你过去，你安心。"),
              ...howardClose(),
            ],
          },
        ],
      },
    ], "来电 Howard", "phone", { incoming: true, contact: "Howard", number: "陈家豪" });
  }

  function howardClose() {
    return [
      line("陈家豪", "对了。房东叫周，是吗？旧闻我有印象。天灾。你唔好自己查东查西。你自己查，会越查越怕。怕咗更难瞓。准时去见佢就得。"),
      { note: ["dontlook", "陈不让我查房东。他像已经知道这条街。"], who: "陈家豪", text: "我挂咗。等阵我发你地址。同一部手机。" },
      { goto: howardSms },
    ];
  }

  function howardSms() {
    setTime("2014年8月15日 周五 10:21");
    flag("clinicAddr", true);
    startTalk([
      line("陈家豪", "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n日间请经医院门诊。"),
      {
        prompt: "地址到了。",
        choices: [
          {
            label: "收起手机",
            hint: "明天赴约",
            phone: true,
            then: [{ goto: goClinic }],
          },
        ],
      },
    ], "手机", "sms", { contact: "Howard", number: "陈家豪" });
  }

  function goClinic() {
    setTime("2014年8月16日 周六 16:00");
    S.talk = null;
    S.mode = "clinic";
    S.clinicLooked = {};
    drawClinic();
  }

  function drawClinic() {
    clearStage();
    const box = el("div", { class: "clinic scene-fit" });
    box.append(
      imgSlot("01-clinic-room", "clinic-bg", "澄心诊室"),
      el("div", { class: "clinic-dock" }, [
      el("div", { class: "clinic-grid" }, [
        hot("执照", "罗启明。Kimon Law。照片比真人年轻，笑。", () => {
          S.clinicLooked.lic = true;
            showModal("执照", "注册精神科。英文 Kimon Law。", "", null, () => drawClinic());
          }, "01-clinic-license", S.clinicLooked.lic),
          hot("抽屉", "缝里露出节拍器的摆杆。旁边有一小块白鱼牌。", () => {
          S.clinicLooked.drawer = true;
            note("metro", "抽屉缝里是节拍器，旁边压着一小块没有字的白鱼牌。他两样一起按住。只说：旧嘢。数呼吸用的。而家唔用。");
            showModal("抽屉", "铜色节拍器，摆杆停着。旁边一小块磨白的塑料鱼牌，没有字。上一个病人刚走，他按得比平时紧，把两样一起盖上。说是旧东西，用来数呼吸的，现在不用了。他只解释节拍器。", "", null, () => drawClinic());
          }, "01-clinic-metronome", S.clinicLooked.drawer),
          hot("电脑一角", "常客一列：阿文。预约每周六。", () => {
          S.clinicLooked.list = true;
            note("lok", "有个叫阿文的病人常来。每周六。");
            showModal("等候名单", "显示名：阿文　预约：每周六　缴费：现金", "", null, () => drawClinic());
          }, "01-clinic-screen", S.clinicLooked.list),
        ]),
      ])
    );
    stage.append(box);
    renderPlaybar();
  }

  function clinicArrival(visit, next) {
    const beats = {
      1: [
        line("", "你早到十分钟。诊室门开了，有人走出来。身子很瘦，窄脸看不清，只看见细框眼镜上的光。脸色白，衬衫扣到最上面一颗。"),
        line("", "杂志倒拿着。他对你笑了笑，很客气，笑停在脸上，人却让人觉得奇怪。胸前没有名牌。"),
        line("", "门还开着。你发现自己已经先笑了一下，笑得很浅。诊室里的人站了起来。"),
        line("", "护士说：章小姐？请进。"),
        { note: ["linWait", "上一个病人。瘦，戴细框眼镜。笑很客气，人很奇怪。五官记不住。"] },
      ],
      2: [
        line("", "电梯口有个人背对着你。还是很瘦，细框眼镜，衬衫扣得很齐。他把倒着的杂志递到你手里。"),
        line("", "你都系星期六？"),
        line("", "佢今日听你听得好耐。"),
        line("", "他不问你住哪里，也不回头。你记不住他的五官，只记得这人奇怪。"),
        line("", "护士低声说：上一个病人刚走。章小姐，请进。"),
        line("", "门打开之前，你又先笑了一下，笑得很浅。"),
        { note: ["linWait", "又是那个瘦、戴细框眼镜的人。五官记不住。人很奇怪。上一个病人刚走。我进门前又先笑了。"] },
      ],
      3: [
        line("", "你从电梯出来，和一个倒拿着杂志的男人擦肩而过。还是很瘦，细框眼镜，脸色白。五官对不上，你只认得这副样子。"),
        line("", "他浅浅地笑了一下。笑很礼貌，人仍让人觉得奇怪。他推开洗手间门进去。护士喊道：阿文先生好了。章小姐，请进。"),
        line("", "擦肩而过之后，你仍然先对着诊室门浅笑了一下。"),
        { note: ["linWait", "第三次。又是那个瘦、戴眼镜的人。笑很客气，人很奇怪。在我前面。我对门笑了。"] },
      ],
      4: [
        line("", "杂志干脆放在前台。护士翻看预约表，说：阿文先生刚离开。章小姐，请进。"),
        line("", "电梯门刚合上。你又看见那个瘦影子，细框眼镜闪了一下。五官还是记不住。这人很奇怪。"),
        line("", "屏幕上的常客一栏写着阿文。下一行是你的名字。连着四个星期六，都是下午四点前的时段。"),
        line("", "门开了。你的笑比前三次更稳一些。"),
        { note: ["linWait", "阿文刚走。还是那个瘦、戴眼镜的人，五官记不住，人很奇怪。预约表上我们连着四个星期六。我进门还是先笑。"] },
      ],
    };
    startTalk([...(beats[visit] || []), { goto: next }], "澄心候诊", "face");
  }

  function clinic1Intro() {
    return [
      line("罗启明", "章小姐？早到。坐。要唔要水。"),
      line("章慧琪", "唔使。我……想坐定先。"),
      line("罗启明", "我系罗启明。家豪打电话叫你来。你可以叫我阿明。私人门诊，一周一次。今日先认识，唔落诊断。"),
      line("罗启明", "有病人会把话题拧到我身上。今日我们写你的。"),
      line("章慧琪", "章慧琪。美娟系我表姐。家豪系我姐夫。"),
      line("罗启明", "今日唔急。你有时间。你想停就停，想跳开就讲。我想先认识章慧琪，唔系先认识一堆吓亲你嘅声音。"),
      line("章慧琪", "……好。"),
      line("", "你坐直身子，双手按在膝盖上，回答得很简短。"),
      line("罗启明", "你今年几岁。"),
      line("章慧琪", "二十六。"),
      line("罗启明", "边度长大。"),
      line("章慧琪", "深水埗。"),
      line("罗启明", "我唔赶。你答完可以停一阵。停唔等于完。"),
      line("", "窗缝有风吹过。他没有打破沉默。"),
      line("章慧琪", "……我搭车嚟，一路练过唔好讲太多。讲多，人会用一个字收我。"),
      line("罗启明", "今日呢度，一个字收唔到你。你想从边度讲起。"),
      line("章慧琪", "屋企。爸走得早，我大约八岁。葬礼我记唔清，只记得之后间屋静咗。阿妈后来改嫁去屯门。我去过一次，姐夫……唔系，系佢而家个男人问我住几日。我之后就少返。"),
      line("罗启明", "你听完「住几日」，你点放自己。"),
      line("章慧琪", "放成客人。坐几日就要走。所以而家表姐叫我去沙发，我都当自己系过路。"),
      line("罗启明", "边个肯听你说多两句。"),
      line("章慧琪", "表姐美娟。母系这边。其他人……问两句就转话题。"),
      line("罗启明", "学校呢。你响唔响。"),
      line("章慧琪", "中五。唔响。英文老师俾过个名 Vicky，名片先用。同学话我望人望得太耐。我学识答短句，人就唔再问。"),
      line("罗启明", "短句保护你。亦令你讲唔完。你而家做咩工。"),
      line("章慧琪", "散工。货仓点数、展会派传单、茶餐厅都做过。而家帮展会，有时仓库。无粮单、无担保。"),
      line("罗启明", "租盘都要粮单，系咪。"),
      line("章慧琪", "系。大角咀、荃湾睇过都上唔到。七月廿二我在网上发帖求平租。发之前删过三次。怕人睇到我求。"),
    ];
  }

  function clinic1Present() {
    return [
      line("罗启明", "而家住边。同边个住。"),
      line("章慧琪", "荣汇街唐楼后座。一个人。按金交咗，周租现金。"),
      line("罗启明", "搬入之前呢。"),
      line("章慧琪", "同阿乐。套房。五月搬出。之前短租、日租、表姐沙发都瞓过。坐几日就觉得自己系客人。"),
      line("罗启明", "拍拖几耐。点解住一齐。"),
      line("章慧琪", "一年有多。起初袋口紧。后尾……大家都好攰。佢做物流，我散工，返工时间撞唔上。"),
      line("罗启明", "分手系佢讲，定你讲。"),
      line("章慧琪", "佢话我神经。"),
      line("罗启明", "边一晚。你讲咗句咩。"),
      line("章慧琪", "五月。我半夜坐起，话窗台有水，又话听见有人叫。我未搬去荣汇街，嗰阵只系旧楼水管。我自己都唔肯定。我擒佢只系想有人醒住。"),
      line("罗启明", "佢点答。"),
      line("章慧琪", "「你又病。」第二日唔接。再打，两声就断。我把置顶删咗。删完仲会睇个空位。"),
      line("罗启明", "你听到「神经」，你点应。"),
      line("章慧琪", "我笑咗一下。话没事。返房关灯。之后唔敢再讲。讲多一次，佢就更似对。"),
      line("罗启明", "笑一下，系你收返自己。你而家坐喺度，有冇想再笑一下当没事。"),
      line("章慧琪", "……有。我忍住。所以我先上网发帖，唔想再坐表姐沙发解释。"),
      line("罗启明", "你怕解释咩。"),
      line("章慧琪", "怕人一个字打发我。怕人当我疯。怕连自己听到嘅都唔信。怕我一开口，就变成要人收拾嘅嗰个。"),
      line("", "他对上你的眼，自己先看开。你当是礼貌。"),
      line("罗启明", "瞓得着？食得落？散工去唔去？日头你仲做得成唔成——我唔系考你，系睇你仲有几多力气。"),
      line("章慧琪", "搬入头半个月都得。去工，食饭。十五号之后先差。我坚持差的系间屋，唔系我。"),
    ];
  }

  function clinic1Support() {
    return [
      line("罗启明", "美娟呢排点。家豪呢。"),
      line("章慧琪", "表姐煮汤，叫我去沙发瞓，叫我食药。我唔去。家豪话你肯听完，又叫我唔好自己查房东。"),
      line("罗启明", "两个人都信你住得唔安乐，帮法唔同。帮手有时帮到你唔想要嘅地方——你唔使同意呢句，你只需知佢哋点帮。"),
      line("章慧琪", "表姐爱我。阿乐怕我。我嚟你度，系唔想再俾人用一个字打发。"),
      line("罗启明", "好。你而家最想我讲嘅，唔系药。系边样。你慢慢讲，由近讲到远都得。"),
    ];
  }

  function clinic1House() {
    return [
      line("章慧琪", "搬入半个月都好好。呢两夜，车会自己转。窗台有细路脚印。录音有女人叫仔食饭。声从储物室门底来。"),
      line("罗启明", "你几时开始录。边晚第一次觉得唔对。"),
      line("章慧琪", "八月十三水管响，我录咗，只有水。十五号车转、脚印湿。十六号差人唔来。房东前一晚话要收回，又当冇讲过。佢问我脚湿唔湿。我只鞋系干的。"),
    ];
  }

  function clinicTalk() {
    startTalk([
      ...clinic1Intro(),
      ...clinic1Present(),
      ...clinic1Support(),
      ...clinic1House(),
      line("罗启明", "我听到。鞋是干的，呢句我写低。今日我未去过你屋，唔追边个在场。"),
      line("章慧琪", "周知不知道我今日来？"),
      line("罗启明", "你冇同佢讲就好。今日我亦唔同佢讲。"),
      line("罗启明", "你信唔信自己听到嘅？"),
      {
        prompt: "他的笔停住。",
        choices: [
          {
            label: "我相信有鬼。",
            then: [line("罗启明", "鬼系个标签。我们先写你听到咩，唔好即刻判有冇。"), ...clinicRest()],
          },
          {
            label: "我疯了。",
            then: [line("罗启明", "「疯」呢个字好懒。一句就扫走晒，唔会答你边样对唔上。你住入去第几晚开始，下星期先写。"), ...clinicRest()],
          },
          {
            label: "我不知道。我要一个人不把我当疯子。",
            then: [line("罗启明", "呢句我做得到。今日唔落诊断。"), ...clinicRest()],
          },
        ],
      },
    ], "澄心诊室", "face");
  }

  function clinicRest() {
    return [
      line("罗启明", "你写，我唔改你字。今日认识你。唔落诊断。呢个礼拜你先住住。唔好自己搬走，亦唔好同房东对质。记低几时、你喺边间房、离开几耐、边样郁咗。写时间点，唔好用「好恐怖」「好乱」顶数。录音暂时唔好畀房东。"),
      line("章慧琪", "你信唔信有鬼？"),
      line("罗启明", "今日我未听到。信你听到，同信有鬼，系两件事。下星期六，同一时间。带录音，同你记低嗰张纸。未听完，我唔落鬼，亦唔落你有病。"),
      line("章慧琪", "我想听日就来。这一周好长。"),
      line("罗启明", "听日冇位。你等一周。"),
      line("章慧琪", "表姐叫我食药。阿乐话我神经。你是第一个未用一个字打发我的人。我不是只想你帮我睇病。"),
      line("罗启明", "（看你一眼，没有接「不是只想看病」那句）"),
      line("章慧琪", "我唔系……我唔系讲唔好意思。我系怕返去又系一个人听。"),
      line("罗启明", "呢个唔系信我。亦唔好把人放在我身上。系我未听完。你返去仍然要写。写时间，唔写「好恐怖」。"),
      { note: ["like", "下星期六先再见到他。我想再来。不只因为鬼。"], who: "", text: "他说今天只是认识我。没听完之前，不下鬼的结论，也不说我有病。" },
      line("", "你看着他拧笔帽的那只手，话到了嘴边。"),
      line("章慧琪", "姐夫有句说话……算。第一次见，唔该问。"),
      line("罗启明", "你想讲就讲。唔想讲，我唔追。"),
      line("章慧琪", "……下次。"),
      {
        prompt: "……",
        choices: [
          {
            label: "那你什么时候来我家。",
            then: [
              line("罗启明", "唔来。病人屋企，唔系门诊。我先在呢度听。"),
              { goto: leaveClinic },
            ],
          },
        ],
      },
    ];
  }

  function waitWeek(when, title, body, btn, go) {
    S.talk = null;
    S.mode = "wait";
    S.wait = { when, title, body, btn, go };
    setTime(when);
    drawWait();
  }

  function waitBg(when) {
    if (!/8月|9月/.test(when || "")) return "";
    if (/夜/.test(when)) return "01-night-room";
    return "01-view-interior";
  }

  function drawWait() {
    const w = S.wait || {};
    clearStage();
    const bg = waitBg(w.when);
    const kids = [];
    if (bg) kids.push(imgSlot(bg, "scene-plate", "这一段"));
    kids.push(el("div", { class: "beat-card" }, [
      el("h2", {}, [w.title || "等到下一次"]),
      el("p", {}, [w.body || ""]),
    ]));
    stage.append(el("div", { class: "desk beat" + (bg ? " scene-desk" : "") }, kids));
    renderPlaybar();
  }

  function leaveClinic() {
    startTalk([
      line("", "走廊椅子上的杂志仍然倒拿着。护士在翻预约表，低声叫后面的人。"),
      line("", "你没有回头。"),
      { goto: homeAfterClinic },
    ], "澄心候诊", "face");
  }

  function homeAfterClinic() {
    setTime("2014年8月16日 周六 21:40");
    startTalk([
      line("", "出门前玩具车的车头朝向窗户。进门后，车头朝向门。你还没有进厕所。"),
      line("", "水龙头已经在滴水。你没有拧过它。你把它拧紧。等了三秒，又滴下来。"),
      line("章慧琪", "二十一点四十。我返到。车已经转。水已经滴。我未离开客厅。"),
      line("周", "出街？早啲休息。水喉我日头睇过。"),
      line("", "他在楼梯口。他没有问你的鞋湿不湿。睡衣领口是干的。", { note: ["zhouDay", "他说白天看过水喉。我回来已经在滴。"] }),
      { goto: meiPhone1 },
    ], "荣汇街后座", "face");
  }

  function meiPhone1() {
    setTime("2014年8月16日 周六 22:05");
    startTalk([
      line("陈美娟", "睇完点？人斯文吗？我煮咗汤。今晚过嚟瞓。"),
      line("章慧琪", "佢叫我呢个礼拜先住住，记低。我唔搬。"),
      line("陈美娟", "有冇叫你食药？"),
      line("章慧琪", "冇。佢叫我写几时、边样郁。未落我有病。"),
      line("陈美娟", "你一个人我担心。食咗未。"),
      line("章慧琪", "食得落。我冇问题。有问题系间屋。"),
      line("陈美娟", "下星期六再去？"),
      line("章慧琪", "……去。佢话未听完。"),
      line("陈美娟", "……好。你锁门。汤我听日放下门口。有事打给我。唔好打给阿乐。"),
      { note: ["meiStay", "表姐叫我去瞓。我冇去。医生叫我留低记。"], goto: postSerial1 },
    ], "拨出 美娟", "phone", { dialout: true, contact: "美娟", number: "陈美娟" });
  }

  function postSerial1() {
    setTime("2014年8月17日 周日 09:10");
    openSerialDraft("wk1");
  }

  function weekFoot() {
    setTime("2014年8月20日 周三 23:17");
    startTalk([
      line("", "你看着钟走进厕所。待了两分钟。出来之前，门底下是干的。"),
      line("", "你出来后，门底下出现一小截湿脚印，走到一半就停下了。你站在客厅里，脚印没有再往前延伸。"),
      line("章慧琪", "二十三点十七。离开两分钟。脚印先出现。我在厅里望住，佢唔郁。"),
      line("周", "你又出去？入去好快。两分钟。我当冇听见。"),
      line("章慧琪", "我冇叫你。"),
      line("周", "旧楼。人惊就敲门。"),
      line("", "他笑了笑，关上门。你没有告诉他纸上写的「两分钟」。", { note: ["zhouTwo", "我没讲两分钟。他说两分钟。"] }),
      line("", "手机弹出阿乐的消息：「你又不接，算了。」你没有回复。门口放着一锅凉汤，字条上写着：吃。你锁上门。"),
      { note: ["timed", "离开两分钟，脚印先出现。我在厅里它不走。阿乐当我又来。表姐的汤凉了。"], goto: () => keepThen({
        id: "paper-20",
        kind: "纸",
        title: "离开两分钟",
        time: "2014年8月20日",
        body: "二十三点十七。离开两分钟。脚印先出现。我在厅里望住，佢唔郁。",
      }, () => waitWeek(
        "2014年8月20日 周三 夜",
        "等到星期六",
        "你把这两次写在纸上。录音也在。你等的是他。",
        "8月23日　带录音和纸赴约",
        clinic2
      )) },
    ], "荣汇街后座", "face");
  }

  function clinic2Life() {
    return [
      line("罗启明", "一个星期。先唔讲屋。食得落？瞓得？"),
      line("罗启明", "呢个星期多开过一转。唔关你。"),
      line("章慧琪", "饮咗表姐汤，凉咗都饮。佢叫我去瞓沙发。我冇去。你叫我住住。我先返去。"),
      line("罗启明", "你瘦咗。散工还去唔去。"),
      line("章慧琪", "去。展会照做。日头当没事，夜先怕。"),
      line("罗启明", "上次你讲到怕连自己听嘅都唔信。这一星期，除屋之外，有冇人联络你。"),
      line("章慧琪", "阿乐响过两声。我唔接。表姐日日问。家豪星期日留一句：你写就写，房东唔好自己查，然后返差馆。"),
      line("罗启明", "唔接阿乐，你怕听到边句。"),
      line("章慧琪", "你又神经。或者沉默。沉默好似默认我系错。"),
      line("罗启明", "你今日几乎唔来？"),
      line("章慧琪", "行到楼梯停过。练过一句：我没事，只系来交纸。入到门又想讲多啲。"),
      line("罗启明", "你几岁开始习惯自己一个人顶住。"),
      line("章慧琪", "……阿妈未走之前已经好忙，问佢嘢佢话迟啲。走咗之后同阿嫲住。阿嫲煮粥，唔问我点解静。阿嫲死咗，电话只剩表姐肯接。中学要自己搵钱。惊一张嘴就系要钱，就似累赘。"),
      line("罗启明", "累赘呢个字，系边个先放落你度。"),
      line("章慧琪", "冇人当面讲。我自己放。沙发瞓多两晚，我会先道歉。道歉完先食饭。"),
      line("罗启明", "所以你而家要证据。录音、纸、时间。唔系因为你迷信，系因为你怕讲出口无人信。"),
      line("章慧琪", "系。亦怕信错自己。我夜里会重听自己讲过嘅句，睇下似唔似病人。"),
      line("罗启明", "你想有人听完——因为屋，定因为好耐冇人留到尾。"),
      line("章慧琪", "两样都有。屋有纸。人……人听到一半就去煮汤、去挂线、去叫我食药。留到尾的，我未试过。"),
      line("罗启明", "家豪关心你嘅方式系叫你停手。你点睇。"),
      line("章慧琪", "佢关心我，亦关心你。我听落系叫我唔好搞事。我今日想讲的系屋。我听。"),
    ];
  }

  function clinic2() {
    setTime("2014年8月23日 周六 16:00");
    clinicArrival(2, () => startTalk([
      ...clinic2Life(),
      line("章慧琪", "十六号晚我返到，车已经转咗。我未离开客厅。水龙头我未拧，已经滴。"),
      line("章慧琪", "二十号我入厕所两分钟。出来门底先有湿脚印。我在厅里望住，佢唔郁。"),
      line("章慧琪", "我食得、瞓得、散工都去。我冇问题。有问题系间屋。"),
      line("章慧琪", "呢卷我日日听。不是为了鬼。是为了今日可以讲给你听。"),
      line("罗启明", "你讲屋。唔好讲我。"),
      line("", "他戴上耳机听录音，听完才摘下来。"),
      line("罗启明", "声线稳。像留过言，唔像当场叫你。你话声从门底来。我冇站过门底。"),
      line("", "听到「返嚟食饭」，他的手伸向抽屉缝，又收回来。"),
      line("章慧琪", "咁算有鬼？"),
      line("罗启明", "我而家做现实检验：心里信嘅，同纸上写到嘅，分两栏写。纸写：离开房间先郁。厅里望住，就唔郁。"),
      line("章慧琪", "所以你信纸，唔信鬼。"),
      line("罗启明", "纸我信。鬼我未信。你日日听呢卷，系过度警觉。听得太密，有时会把水滴、风声听成叫人。亦可以真系录音机。我未可以拣。"),
      line("", "他的笔停住了。纸上「离开两分钟」那句他看了很久，下一句话没有说出来。他把耳机线慢慢绕回盒子里。"),
      line("罗启明", "我停喺呢度，唔系因为你讲唔清楚。系我若写落「有人等你离开」，就要写边个人、点等。白房听唔到门底下。"),
      { note: ["clinicDoubt", "他停笔。现实检验：信纸，未信鬼。过度警觉他说成听太密会把旧楼听成叫人。白房听唔到门底下。"] },
      line("罗启明", "呢个礼拜，有一夜唔好开录音。仍然写纸。看看嘢郁不郁。另外写低：搬入头两个礼拜，边样唔会郁。边样系十五号先开始。下星期六带来。"),
      line("章慧琪", "少听一晚，我可以试。如果你叫我当自己有病，我走。我冇问题。如果你下星期都话系我头脑，我就冇地方去。这一周我都是靠「星期六见到你」过的。"),
      line("罗启明", "我未叫你有病。我未可以拣。你靠的是约，唔系我。你仍然要写。"),
      line("章慧琪", "你信纸，我信你会听。唔同系同一回事。我听你话写，返去关录音，车仍然郁。我唔知边样系医，边样系你肯为我留低。"),
      line("罗启明", "我留低系听。唔系替你拣有鬼定冇鬼。"),
      line("章慧琪", "（看着他的手，没看他的眼）上次咽住嗰句，我仍然未问得出口。"),
      line("罗启明", "我唔追。你准备好先讲。"),
      line("章慧琪", "（低头，声音细）我喺网上写咗一句……靠星期六。冇写你名。唔好问边个版。"),
      line("", "他对上你的眼，自己先看开。"),
      line("罗启明", "我唔上网睇你写咩。你带纸来就得。"),
      { note: ["clinic2", "第二次。他信我写的时间，未信鬼。这个星期他多开过一转，说不关我。我等的是他这个人。"], goto: clinicDoorChen },
    ], "澄心诊室", "face"));
  }

  function clinicDoorChen() {
    setTime("2014年8月23日 周六 17:10");
    startTalk([
      line("", "诊室楼下，陈家豪靠在门边，手里一只便当。他看了电梯口那个侧脸一眼，没有说话。"),
      line("陈家豪", "快返去。"),
      line("", "他转过去，声音压低，只给罗启明。"),
      line("陈家豪", "唔好上门。"),
      line("", "罗启明接过饭盒，没有解释。"),
      { note: ["bento", "楼下便当。姐夫叫我快回去，又低声叫他不要上门。"], goto: nightNoRec },
    ], "澄心楼下", "face");
  }

  function nightNoRec() {
    setTime("2014年8月23日 周六 22:10");
    startTalk([
      line("", "你关掉录音键。灯还开着。你去洗脸。"),
      line("", "你回来时，玩具车在地上，车头朝储物室。录音键仍然是关着的。"),
      line("章慧琪", "我听你讲。冇开录音。车仍然郁。我冇声可以畀你。"),
      { note: ["noRec", "二十三号晚没有开录音。车仍然走。我没有声音可以带去。"], goto: () => keepThen({
        id: "paper-norec",
        kind: "纸",
        title: "没有录音的一夜",
        time: "2014年8月23日",
        body: "录音键是关的。车仍然在地上，头朝储物室。这夜没有声音可以交。",
      }, postSerial2) },
    ], "荣汇街后座", "face");
  }

  function postSerial2() {
    setTime("2014年8月24日 周日 09:40");
    openSerialDraft("wk2");
  }

  function sundayMeal() {
    setTime("2014年8月24日 周日 13:10");
    startTalk([
      line("陈美娟", "你瘦。食。今晚留低。"),
      line("陈家豪", "阿明叫你写，你就写。房东你唔好自己查。佢话你精神唔太好，你听佢就得。我返差馆。"),
      line("章慧琪", "佢冇咁讲。"),
      line("陈家豪", "你听医生。唔好自己查。"),
      line("陈家豪", "佢唔适合深交。你唔好当自己特别。"),
      line("章慧琪", "你唔好咁讲佢。"),
      line("", "他走了。美娟没有再追问那句话，只把汤推到你面前。"),
      line("章慧琪", "我返去。星期六要有嘢讲。"),
      line("陈美娟", "信不信都要食饭。门锁好。"),
      { note: ["meiMeal", "姐夫只留一句：听他写，别查房东。表姐留我过夜。我要回去。"], goto: () => waitWeek(
        "2014年8月24日 周日 下午",
        "回到后座",
        "你没有留宿。星期三夜里，表姐会打来。",
        "8月27日　夜里",
        meiHearsWater
      ) },
    ], "美娟家", "face");
  }

  function meiHearsWater() {
    setTime("2014年8月27日 周三 22:40");
    startTalk([
      line("", "水龙头又滴水。你把它拧紧。手机响了，是美娟打来的。"),
      { goto: meiWaterCall },
    ], "荣汇街后座", "face");
  }

  function meiWaterCall() {
    startTalk([
      line("陈美娟", "你屋企漏水？我听到。你过嚟瞓。"),
      line("章慧琪", "我拧紧咗。你听到就好。你当间屋有事，已经好好。我留低。"),
      { note: ["meiWater", "表姐在电话里听到水声。她叫我过去。我没有去。"], goto: () => waitWeek(
        "2014年8月27日 周三 夜",
        "下星期六带纸",
        "头两周不会动的，十五号才开始的，你都写上了。还有二十三号那一夜，和她听到的水。",
        "8月30日　赴约",
        clinic3
      ) },
    ], "来电 美娟", "phone", { incoming: true, contact: "美娟", number: "陈美娟" });
  }

  function clinic3() {
    setTime("2014年8月30日 周六 16:00");
    clinicArrival(3, () => keepThen({
      id: "paper-30",
      kind: "纸",
      title: "带去第三次的对照",
      time: "2014年8月30日",
      body: "头两周：车不转、脚印没有、水管响但录音只有水。十五号起：车会转、童码是湿的、周问脚湿不湿，鞋是干的。水龙头拧紧，大约三秒再滴。二十三号没有录音，车仍然走。",
    }, () => startTalk([
      line("", "你的纸上写着：头两周车不会自己转，没有脚印，水管响但录音里只有水声。从十五号起车会转，窗台上是小孩尺码的湿脚印，周问过你脚湿不湿，你的鞋是干的。水龙头拧紧后大约三秒又滴一次。"),
      line("罗启明", "坐。头两次你交人。今日我想再入少少——你愿意就讲，不愿意就讲屋。"),
      line("章慧琪", "……我试。"),
      line("罗启明", "夜里你重听自己，觉得似病人嘅时候，你身体边度先紧。"),
      line("章慧琪", "胸口。然后我会去拧水龙头，证明水是真的。水滴，我就松一松。水唔滴，我就更惊系我。"),
      line("罗启明", "你有冇一次，几乎信咗「系我」。"),
      line("章慧琪", "有。二十三号关录音，车仍然郁，我松过。跟住我又想：会唔会系我瞓着咗唔记得自己郁过。我未敢同表姐讲呢句。"),
      line("罗启明", "点解唔讲。"),
      line("章慧琪", "我在沙发后听过佢同家豪讲。声好细：「佢又咁。」我当听错。听错都够。我唔想再做「又咁」嗰个。"),
      line("罗启明", "美娟同阿乐，有冇一次听完你没叫出声嘅部分。"),
      line("章慧琪", "……冇。阿乐听十秒就要我睇医生。表姐听完煮汤、叫食药、叫我去沙发。都系为我好。我听着像……我已经坏咗，佢哋只系收拾。我好想做个容易嘅亲人。容易就唔使解释。"),
      line("罗启明", "你没有坏。你系一个人听到太多，又无人同你对齐。想做容易，同想被听完，撞埋一齐。美娟二十七号打过给你？"),
      line("章慧琪", "佢听到水声。叫我过去。我冇去。留低先有人信间屋有事。"),
      line("罗启明", "家豪有冇再打电话。"),
      line("章慧琪", "冇。佢上次已经叫我唔好查房东。"),
      line("罗启明", "好。你讲这一周。我听。"),
      line("章慧琪", "二十三号晚我听你讲，冇开录音。我去洗面。返来车在地上。我冇声可以畀你。二十七号表姐打电话，水声她听到。"),
      line("罗启明", "水声有第二个人听到。呢个我写低。听到水，唔等于听到叫人。你拧紧，另一头仍然听到。"),
      line("罗启明", "我而家想做减少暴露：少接触叫你惊嘅声，先帮你瞓，唔系先去查间屋。你日日听、日日记，系安全行为。你以为做完就安心，其实越听越惊。药你可以唔食。下星期我可以只做你自己。"),
      line("章慧琪", "少听我已经试过。你讲到尾，仍然觉得有问题嘅系我。"),
      line("章慧琪", "我想你信屋。你话帮我瞓。我听落系叫我信自己有問題。"),
      line("章慧琪", "你都唔信。"),
      {
        prompt: "……",
        choices: [
          {
            label: "你同表姐、同阿乐一样。",
            then: [
              line("章慧琪", "你用好听的字。你仍然觉得有问题嘅系我。"),
              ...clinic3Break(),
            ],
          },
          {
            label: "我今晚返去。你当我又讲大话。",
            then: [
              line("章慧琪", "我等了三个星期六。十六号你话未听完。二十三号你叫我试一晚。我试咗。车仍然郁。"),
              ...clinic3Break(),
            ],
          },
        ],
      },
    ], "澄心诊室", "face")));
  }

  function clinic3Break() {
    return [
      line("章慧琪", "你不来，我就只剩病人。"),
      line("", "你说完立刻把视线收回来。"),
      line("罗启明", "我未话你讲大话。"),
      line("", "他没有马上接话。「周问我脚湿不湿，我没有」这句话他在纸上看了两遍。"),
      line("罗启明", "鬼唔使等你离开房间先郁。亦唔使问你只鞋。"),
      line("章慧琪", "所以系人？"),
      line("罗启明", "更像人。鉴别就系分开睇：惊、旧楼、有人装——三样今日都讲到。我未可以写边个。"),
      line("", "他说到「更像人」时，手指碰到抽屉缝，没有拉开。"),
      line("罗启明", "声从储物室来，定从窗口来，白房分唔到。你二十三号冇录音，我更加分唔到。"),
      line("章慧琪", "人装，我信一半。屋，我仍然信。"),
      line("章慧琪", "那你来看。"),
      line("罗启明", "上门唔系治疗。病人屋企，医生唔该夜入去。写进病历会俾人问。我知。但我仲未准备去。"),
      line("", "他把纸推回到你面前，手指停在「干鞋」那一行旁边，没有盖住你写的字。"),
      line("罗启明", "下星期六，同一时间。纸仍然要带。多写呢个星期：车几转、你几时喺边间房、水喉几耐滴一次。我谂一星期。唔系你叫，我就去。"),
      line("章慧琪", "你肯来，我高兴是你来。不只是有人站我这边。"),
      line("罗启明", "你唔好把高兴放在我身上。我未答应上门。"),
      line("章慧琪", "（停很久，像后悔，又像唔想收返）……我钟意你。唔系因为你信屋。系因为你肯听。我讲漏咗。你当冇听见都得。"),
      line("章慧琪", "仲有一句。关于你自己。第三次都未敢问。问医生自己，好似抢你嘅诊室。"),
      line("罗启明", "你唔使今日问。"),
      line("章慧琪", "……好。"),
      line("罗启明", "（没有看你。把门把手上的挂牌翻正）下星期六。带纸。"),
      { note: ["clinic3", "第三次。他先问美娟和家豪，再要医我。我信可以少听，不信病在我。他读了两次那句鞋，说更像人，三样分开写。人装我信一半，屋我仍然信。他说再等一个星期。我说漏了：我喜欢他。他没有接住。"], goto: postSerial3 },
    ];
  }

  function postSerial3() {
    setTime("2014年8月31日 周日 10:05");
    openSerialDraft("wk3");
  }

  function callMingOffHours() {
    setTime("2014年8月31日 周日 23:40");
    startTalk([
      line("罗启明", "章小姐。纸呢个星期写咗未。"),
      line("章慧琪", "写咗。车又转。你来。"),
      line("罗启明", "唔好再打。一周一次。下星期六先讲。"),
      line("", "他挂得很干净。"),
      { note: ["offhours", "我打给他。他先问纸，然后叫我不要再打。下星期六才讲。"], goto: nightBeforeTueZhou },
    ], "拨出 罗启明", "phone", { contact: "罗启明", number: "澄心／私人", dialout: true });
  }

  function nightBeforeTue() {
    setTime("2014年8月31日 周日 23:20");
    startTalk([
      line("", "玩具车又自己转了一次。"),
      { goto: callMingOffHours },
    ], "荣汇街后座", "face");
  }

  function nightBeforeTueZhou() {
    setTime("2014年8月31日 周日 23:50");
    startTalk([
      line("周", "下星期六，又有人上嚟？我煮糖水。"),
      line("章慧琪", "我冇同你讲。"),
      line("周", "你锁门。"),
      line("", "他笑了笑。领口是干的。", { note: ["zhouTue", "我没讲下星期六。他说又有人来。还要煮糖水。"] }),
      { goto: meiTue },
    ], "荣汇街楼梯口", "face");
  }

  function meiTue() {
    startTalk([
      line("陈美娟", "下星期六佢真的再去？"),
      line("章慧琪", "佢话会听。我信约。"),
      { note: ["meiTue", "表姐问的是电话。我说我信约。"], goto: () => waitWeek(
        "2014年8月31日 周日 夜",
        "等到下星期六",
        "你打过一次。他叫你不要再打。这一周你继续写纸。",
        "9月6日　第四次赴约",
        clinic4
      ) },
    ], "来电 美娟", "phone", { incoming: true, contact: "美娟", number: "陈美娟" });
  }

  function clinic4() {
    setTime("2014年9月6日 周六 16:00");
    clinicArrival(4, () => keepThen({
      id: "paper-06",
      kind: "纸",
      title: "带去第四次的补充",
      time: "2014年9月6日",
      body: "九月一日车又转。二号水喉又滴，拧紧，三秒。四号没有录音，车仍然走。三十号对照页仍在。",
    }, () => startTalk([
      line("罗启明", "四个星期六。你由报站名，讲到八岁间屋静、屯门住几日、阿乐两声、阿嫲、沙发后嗰句「又咁」。防线松过。今日如果仲有未讲，而家讲。"),
      line("章慧琪", "我数星期六。出门会换件干净衫。楼梯又停过，怕你一落诊断，我就真系只剩病。"),
      line("罗启明", "你仲怕咩。"),
      line("章慧琪", "怕我钟意有人听完。钟意完，你就会同佢哋一样走。走之前先叫我食药，或者叫我当自己有问题。"),
      line("罗启明", "我未落诊断。我亦未走。你讲漏嗰句我听见咗，唔拿来当病。"),
      line("章慧琪", "三次我都咽住。今日问。家豪话你精神有时唔太好。我唔系审你。我只系想知，我交俾你嘅嘢，你承唔承担得住。"),
      line("罗启明", "家豪话多。宿舍隔一层，佢成日走上嚟。我瞓得少。唔影响听你讲。"),
      line("", "他拧圆珠笔的笔帽。笔帽掉到地上。他捡起来时手抖了一下。", { note: ["avoid", "第四次先问出口。这个医生也在回避。提到自己，手抖。"], flag: "clinicAvoid" }),
      line("罗启明", "佢成日话我健忘。钥匙都系佢留——差人都咁碎嘴。你当佢碎嘴。"),
      line("章慧琪", "你把我当病人。三十号你不来。我打给你，你叫我不要打。纸我交够了。"),
      line("罗启明", "私人门诊一周一次。多过一次，关系会斜。三十号未准备。白房听不清门底。我写唔落你有病。所以今晚来。观察，唔系治疗。唔系因为高兴。"),
      line("", "抽屉缝还看得见节拍器。鱼牌原来的位置空了。他按住那个空位。进门时他摸过一次外套口袋，里面有一小块硬的。"),
      line("罗启明", "呢句唔影响今日。美娟问过你下星期六真的再听？"),
      line("章慧琪", "系。家豪冇打。"),
      line("罗启明", "家豪唔打，有时系佢当自己帮紧。你先讲纸。我听。"),
      line("章慧琪", "……好。呢个星期车又转。二号水又滴。四号我试咗一晚冇录音。车仍然郁。"),
      line("罗启明", "俾我三分钟。"),
      line("", "他没有插嘴，只看纸。他把三十号那一页和新页并排放在一起。笔只在空白处点了一下，没有盖住你写的字。"),
      line("罗启明", "八月三十号我返去谂过。打过督导电话。观察唔等于治疗，要约好时间界、知情同意，唔写进正式病历——我写咗另一本手记，唔系俾医院。知情同意就系：你先知我来做什么、几时走、写边本簿，你同意，我先去。"),
      line("罗启明", "家豪讲过你房东叫周。我查过公开新闻：一二年西贡十二乡。唔系调查你，系职业病。"),
      line("章慧琪", "你信我未？"),
      line("罗启明", "我信你纸上的时间。干鞋、两分钟、关录音仍郁。鉴别仍然分唔开：你惊、旧楼、有人做。拖多一个星期，我仍然拣唔到。若我再唔站去门底亲耳听一次延迟，我会在病历写你有病。我写唔落。"),
      line("", "他把抽屉里那本非正式病历的本子合上，封面朝下。"),
      line("罗启明", "今晚医院交更后。唔经门诊预约。唔带药。唔过夜。周先生知唔知你叫我来？"),
      line("章慧琪", "我未同佢讲。"),
      line("罗启明", "你而家同我讲。或者我敲门自己讲。唔好你一个人喺走廊等。我跟你行。日记写观察，唔写诊断。你当我越界。"),
      line("章慧琪", "我同意你来。我仍然觉得你入到会见到。见到，你就信。"),
      line("罗启明", "我上门唔系为了信鬼。系为了听清门底。你唔好再讲「高兴」。"),
      line("章慧琪", "……我知。你肯来，我已经……"),
      line("罗启明", "带钥匙。今晚交更后。唔过夜。你跟住我行，唔好一个人喺走廊等。"),
      { note: ["clinic4", "第四次。先问了美娟和家豪。他打过督导，讲了知情同意，查过新闻，才约今晚上门。我同意。我仍然觉得他看见就会信。观察，不是治疗。"], goto: () => waitWeek(
        "2014年9月6日 周六 下午",
        "等到晚上",
        "你离开澄心。纸留在你这边。他没有再打电话。",
        "9月6日　21:40　他上门",
        visitHome
      ) },
    ], "澄心诊室", "face")));
  }

  function visitHome() {
    setTime("2014年9月6日 周六 21:40");
    startTalk([
      line("周", "医生？难得。我煮了糖水，要唔要？"),
      line("罗启明", "唔使。我们听房子。"),
      line("周", "房子不会害人。人先害自己。章小姐，钥匙我帮你擦过，天台嗰把。"),
      line("", "进门时他又摸了一下外套口袋，没有掏出来。玩具车朝向储物室。阿明先看墙上的全家福，没有先看车。"),
      line("罗启明", "呢张相，你搬嚟就喺度？"),
      line("章慧琪", "喺度。佢舍不得扔。"),
      line("罗启明", "舍不得扔喺你客厅。"),
      line("", "他戴上耳机听录音。听到「阿轩，回来吃饭」时，目光突然转向走廊尽头。你看过去，那里只有黑暗。他低声数了四下，视线停在半空中。"),
      line("章慧琪", "你见到咩？"),
      line("罗启明", "一个女人。长发。唔係呢张相里面个太太。可能系反光。"),
      line("章慧琪", "你都见到。四个星期六我就是靠「你会来」撑过。你在，我就未疯。"),
      line("罗启明", "我见到嘅未必系你见到嘅。你唔好靠我只眼。亦唔好靠我这个人。"),
      {
        prompt: "……",
        choices: [
          {
            label: "我看见的是小孩脚印。",
            note: ["notsame", "我们看见的不是同一只。"],
            then: [
              line("罗启明", "我哋见到嘅唔係同一只。呢点要紧。你唔好改口迁就我。"),
              ...visitRest(),
            ],
          },
          {
            label: "那是丽芬。",
            then: [
              line("罗启明", "丽芬头发冇咁长。我讲过，可能系反光。"),
              line("", "他的视线仍然停在走廊尽头。"),
              ...visitRest(),
            ],
          },
          {
            label: "不说话，去走廊。",
            then: [
              line("", "储物室门锁着，门底下是干的。阿明没有跟过来，站在客厅里不动。"),
              ...visitRest(),
            ],
          },
        ],
      },
    ], "荣汇街后座", "face");
  }

  function visitRest() {
    return [
      line("", "水龙头又滴水。阿明先去厨房把它拧紧，等了三秒，不滴了。他又等了一会儿，又滴了。"),
      line("罗启明", "延迟三秒。人为可以做到。"),
      line("", "他在本子上写字。你没有凑过去看。字写得很短。"),
      { note: ["delay", "阿明：延迟三秒。人为可以做到。"], who: "", text: "他在本子上写了一句。没有写鬼。" },
      line("", "周在门外敲了一下门，递进来一条毛巾，没有进来。"),
      line("周", "医生脸色白。呢栋楼旧，闷。"),
      line("罗启明", "周先生，山泥倾泻，系边一年？"),
      line("周", "一二年。你也看新闻？"),
      line("罗启明", "职业病。"),
      line("周", "医生查天灾。我当系关心。糖水真的唔饮？"),
      line("罗启明", "明天我把笔记整理给你。你今晚开灯睡。不要上天台。"),
      line("章慧琪", "你都话唔好上天台。"),
      line("罗启明", "风大。"),
      line("", "离开前他又摸了一下口袋。牌子没有掏出来。"),
      { goto: afterVisitListen },
    ];
  }

  function afterVisitListen() {
    setTime("2014年9月6日 周六 22:10");
    startTalk([
      line("", "你把耳朵贴在门上。储物室门缝下没有光。声音从里面传来，闷闷的。"),
      line("周", "人开始查。你话吓就够……我知，唔能留。"),
      {
        prompt: "另一端听不清。",
        choices: [
          {
            label: "走开。",
            note: ["phone-you", "周在储物室打电话。有一个你。"],
            then: [
              line("", "你退开两步。阿明刚走。后座还亮着灯。储物室仍然锁着。八月下旬那次调查没有上门，医生进了屋、问了年份之后，周才打电话。"),
              { goto: () => waitWeek(
              "2014年9月6日 周六 夜",
              "明天去取笔记",
              "他走后，后座还亮着。储物室仍锁。你听见他在里面打电话。",
              "9月7日　16:10　澄心",
              missAppt
            ) },
            ],
          },
        ],
      },
    ], "储物室门底", "phone", { eavesdrop: true, contact: "周", number: "听不清的另一端" });
  }

  function missAppt() {
    setTime("2014年9月7日 周日 16:10");
    startTalk([
      line("罗启明", "笔记我话今日整理畀你。本子唔喺度。"),
      line("章慧琪", "你记不记得昨晚？"),
      line("罗启明", "记得。车、水喉、延迟三秒。周先生话一二年。我叫你唔好上天台。"),
      line("章慧琪", "你话见到一个长发女人。唔系相入面个太太。"),
      line("罗启明", "我记得自己望过走廊。而家个女人唔喺呢间白房。你唔好帮我补。本子唔喺度，我对唔上自己写过冇写过。"),
      line("", "他握着笔，低声数了四下，才把笔放下。"),
      line("章慧琪", "你像唔记得。"),
      line("罗启明", "失忆系整晚冇。我有。车、水喉、三秒，我讲得出。张相跟唔到我出走廊。白房安全，张相就唔出。返到条走廊，张相先插返嚟。呢个系旧伤。唔系鬼上身。"),
      line("章慧琪", "昨日你话见到。我净系靠你这句。今日你话唔喺度。"),
      line("章慧琪", "你写低咗？我睇到你写。本子唔喺度，系有人拎走，定系你唔想畀我？"),
      line("罗启明", "我写过。唔喺度，我对唔上自己写过咩。唔好帮我猜边个拎。"),
      { note: ["forget", "事实他记得。画面跟不回白房。他自己说是旧伤，不是失忆，也不是鬼上身。"], who: "", text: "他去倒水。日历上九月六日晚「荣汇街上门」那一条被删掉了。夹子还在，本子不见了。" },
      { note: ["stolen", "上门行程被删了。现场笔记不见。他不是不记得去过。"], who: "陈家豪", text: "走廊。便装衬衫。像休班路过。" },
      line("陈家豪", "你又嚟。佢昨日加班太迟，人会懵。你唔好太靠一个人。阿明唔适合深交——佢对边个都好。你唔好当自己特别。人会累。"),
      {
        prompt: "……",
        choices: [
          {
            label: "你动过他的东西？",
            then: [
              line("陈家豪", "我帮佢收拾过。佢自己会乱。你怀疑我，不如怀疑这栋楼。"),
              line("", "他说这句话说得太快。钥匙在他口袋里碰响了一下。"),
              ...mailBeats(),
            ],
          },
          {
            label: "你要我离开他。",
            then: [
              line("陈家豪", "我要你安全。也要佢安全。两个人一齐发病，会一齐跳。我见过。"),
              ...mailBeats(),
            ],
          },
          {
            label: "不争。走。",
            then: mailBeats(),
          },
        ],
      },
    ], "澄心诊所", "face");
  }

  function mailBeats() {
    return [
      line("", "手机震动。一封电子邮件，发件人没有显示名称，页边有旺印文仪店的页脚。标题是：你信任的医生。"),
      line("", "正文写：二〇〇四年十一月，维港大学，一名女学生坠楼。新闻写她的男友姓罗，自称有责任。名字被涂掉了。附件是一张偷拍照片，年轻的罗医生和一个女学生站在一起，她看着他。你现在看着罗医生，和照片里一样。上一个已经跳了。下一个就是你。"),
      { note: ["dirt", "二〇〇四年十一月，维港大学，女学生坠楼。新闻写男友罗某。名字涂掉，露出一个鱼。偷拍里年轻的他，旁边一个女生望住他。信说我是下一个。"], who: "", text: "附件有两张图。新闻扫描还能读。名字涂不干净，露出一个「鱼」字。偷拍照片在有盖的走廊里，从阶梯方向按下快门，两个人都不看镜头。没有全名，也没有写过程。" },
      { goto: () => keepThen({
        id: "mail-dirt",
        kind: "邮件",
        title: "你信紧的医生",
        time: "2014年9月7日",
        body: "二〇〇四年十一月，维港大学，一个女学生坠楼。新闻写男友罗某，自称有责任。名字涂掉，露出一个鱼。偷拍：有盖走廊，年轻的罗和一个长发女生，她望住他。信说你是下一个。没有全名，没有过程。",
        img: "01-blackmail",
      }, stepPast) },
      line("章慧琪", "我等了你四个星期六。我讲过高兴是你来。而家有人寄嚟一则旧闻，同一张旧相。学生时代真的死过一个女人。相里她望住你。我而家都系咁望。我惊我系下一个。"),
      {
        prompt: "当面给他看？",
        choices: [
          {
            label: "给阿明看。",
            flag: "showedDirt",
            then: [
              line("", "他看完新闻就停住了。拇指压在「罗某」两个字上，没有移开。看到偷拍照片时停得更久。照片里是有盖走廊，从阶梯方向拍下来的，两个人都不看镜头。他把纸翻过去，手抖了一下，很快塞进袖口。"),
              line("罗启明", "十一月系佢跌落去嗰个月。我唔纪念。黑笔涂唔干净，剩一个鱼字。我心里叫佢鱼。全名我唔讲。"),
              line("章慧琪", "你否认吗？"),
              line("罗启明", "否认要有另一个故事。我没有。所以我信咗十年，系我害咗鱼。鱼先会企喺走廊。"),
              line("罗启明", "有人希望你唔好再信我。你信我，先至危险。松开都得。你先安全。"),
              { note: ["dirtreact", "他手抖。十一月是她坠楼的那个月。他信了十年，是自己害了鱼。全名他不讲。"], goto: nightName },
            ],
          },
          {
            label: "先不给。",
            then: [
              line("", "你把邮件放进「噪音」文件夹。疑心已经在了。"),
              { goto: nightName },
            ],
          },
        ],
      },
    ];
  }

  function nightName() {
    setTime("2014年9月7日 周日 23:40");
    startTalk([
      line("", "声音先传来一句：「阿轩，回来吃饭。」"),
      line("", "接着低声说：「章慧琪。你知道。」"),
      { goto: () => keepThen(nameItem(), stepPast) },
      {
        prompt: "声从储物室门底来。",
        choices: [
          {
            label: "拨给阿明",
            phone: true,
            note: ["namecall", "鬼叫我的名字。它说我知。"],
            then: [{ goto: callMing }],
          },
        ],
      },
    ], "后座", "msg", { contact: "丽芬（旧机）", number: "语音留言　09-07 夜" });
  }

  function callMing() {
    startTalk([
      line("罗启明", "声线……阿轩嗰句我听过。呢句唔好再播。我而家过来。唔好喺电话听。"),
      line("章慧琪", "你下午话个女人唔喺度。"),
      line("罗启明", "下午在诊所我想唔到佢。返到呢条走廊先算。"),
      line("章慧琪", "你怕什么？"),
      line("罗启明", "我怕再听第二遍。听过第二遍，人就会企喺度。"),
      { note: ["fearreplay", "他说怕再听第二遍。像怕的不是鬼，是旧事回来。"], goto: goSearch },
    ], "拨出 罗启明", "phone", { contact: "罗启明", number: "澄心／私人", dialout: true });
  }

  function goSearch() {
    S.talk = null;
    S.mode = "search";
    S.tab = "house";
    S.screen = "news";
    setTime("2014年9月7日 周日 夜");
    drawSearch();
  }

  function drawSearch() {
    clearStage();
    const wallish = S.tab === "wall" || S.screen === "ad" || String(S.screen).indexOf("wall-") === 0;
    const desk = laptop(webInner(), {
      tab: wallish ? "wall" : "house",
      addr: webAddr(),
    });
    desk.classList.add("search-desk");
    const row = el("div", { class: "search-row" });
    const laptopBox = desk.querySelector(".laptop");
    row.append(laptopBox);
    row.append(el("aside", { class: "scene-actions search-scene-acts" }, [
      el("button", {
        type: "button",
        class: "scene-act" + (S.searchHeard ? " done" : ""),
        onclick: () => {
          S.searchHeard = true;
          note("namecall", "鬼叫我的名字。它说我知。");
          showVoicemail("丽芬（旧机）", "阿轩，返嚟食饭。……章慧琪。你知。", drawSearch, nameItem());
        },
      }, [S.searchHeard ? "语音留言　已听" : "再听语音留言"]),
      el("button", {
        type: "button",
        class: "scene-act" + (S.searchRoof ? " done" : ""),
        onclick: () => {
          S.searchRoof = true;
          S.known = S.known || {};
          S.known.roof = true;
          showModal("天台（白天）", "晾衣绳、矮女儿墙、对面厨房的油烟。风很大。阿明和周都说过，晚上不要来。", "", "memo", drawSearch);
        },
      }, [S.searchRoof ? "天台　已看" : "白天上天台看看"]),
    ]));
    desk.append(row);
    stage.append(desk);
    if (S.modal) stage.append(S.modal);
    else offerSlate();
    renderPlaybar();
  }

  function mingReturn() {
    setTime("2014年9月7日 周日 夜");
    const dirt = flag("showedDirt") ? [
      line("罗启明", "你今晚要我走吗？"),
      {
        prompt: "……",
        choices: [
          {
            label: "留。",
            flag: "keptMing",
            then: mingReturnRest(),
          },
          {
            label: "你走。",
            then: [
              line("", "他点了点头，关上了门。"),
              ...mingReturnRest(),
            ],
          },
        ],
      },
    ] : mingReturnRest();
    startTalk([
      line("", "阿明来了，比下午更瘦。眼睛通红，像一夜没睡。他站在门口，没有立刻进来，先低声数：一、二、三、四。"),
      line("章慧琪", "你在数什么？"),
      line("罗启明", "呼吸。旧习惯。家豪话我健忘。我唔系唔记得。"),
      line("", "他的视线转向走廊尽头。眼睛失焦。声音忽然变得很轻，不像是在对你说话。"),
      line("罗启明", "灯。你企喺尽头。唔好走。我应你。"),
      line("", "两秒钟。他眨了眨眼，手按住门框，又数了四下。"),
      line("罗启明", "刚才那句唔系同你讲。我知道自己喺荣汇街。我知道你系章慧琪。而家系九月七日。"),
      line("章慧琪", "你刚才叫谁？"),
      line("罗启明", "鱼。我唔该叫出口。全名我唔讲。叫完整，画面会更长。你当我发过一次旧病。我仲喺度。唔系鬼上身。"),
      { note: ["countbreath", "他对走廊尽头说了一句，然后自己数回来。他知道日期，知道我是谁。他叫出了一个字：鱼。抽屉里那只鱼牌，他仍然不解释。不是鬼上身。"] },
      ...dirt,
    ], "荣汇街后座", "face");
  }

  function mingReturnRest() {
    if (!flag("showedDirt")) flag("keptMing", true);
    return [
      line("罗启明", "我查过清拆。呢栋楼值一笔钱。人未查到。钱唔係鬼。"),
      line("章慧琪", "咁录音係咪人？"),
      line("罗启明", "人可以延迟三秒。人可以叫你个名。人唔可以……企喺我走廊尽头用嗰种头发。嗰个系我嘅。唔关你间屋。"),
      line("章慧琪", "你话系你的问题。"),
      line("罗启明", "我回流第一年，上过一次高处。唔系想死。系身体先走到沿。家豪抬我下来。沿上冇喊名。我第二日当过劳。"),
      line("章慧琪", "所以你叫我唔好上天台。"),
      line("罗启明", "我讲俾你，唔系因为我冇事。系我见过自己喺沿上。"),
      { note: ["hisghost", "他把长发女人认成自己的问题。他提过回流第一年有人抬他下来。"], who: "周", text: "医生常来。租客有福。今晚风大，天台嗰把钥匙，我帮你收住啦？" },
      {
        prompt: "……",
        choices: [
          {
            label: "钥匙给你。",
            flag: "gaveRoofKey",
            then: [
              line("", "你把天台钥匙给了他。不久后钥匙又出现在门垫下面，像是谁好心送回来的。"),
              { goto: roofApproach },
            ],
          },
          {
            label: "不给。",
            then: [
              line("章慧琪", "我自己收。"),
              { goto: roofApproach },
            ],
          },
        ],
      },
    ];
  }

  function roofApproach() {
    const dirt = flag("showedDirt") ? [
      line("罗启明", "有人寄俾你嘅旧闻，我唔会喺电话讲。新闻写罗某。涂剩一个鱼。我信咗十年，系我害咗鱼。唔否认唔代表我推人。"),
      line("章慧琪", "你话我先安全。"),
      line("罗启明", "你安全，系你唔好跟。"),
    ] : [];
    startTalk([
      line("", "周走后，走廊又安静下来。他没有立刻离开，看着走廊尽头。你看不见他在看什么，只看见他停在那里。他又数了一次呼吸，声音很低。"),
      line("章慧琪", "你又见到佢？"),
      line("罗启明", "我记得昨夜。车、水喉、延迟三秒。周话一二年。我叫你唔好上天台——我都记得。唔系唔记得。系喺白房，个女人我想唔到。返到呢条走廊，佢又企喺度。"),
      { note: ["notforget", "他不是忘了。是诊所里想不起，走廊里又看见。"] },
      ...dirt,
      line("罗启明", "你而家望住我。同张相一样。我惊嘅唔系你跳。系我怕再答得太快，又将你收成下一个病人。再有人跌。"),
      line("章慧琪", "我唔系你病人了吗？"),
      line("罗启明", "你越信我，我越像医生。我越像医生，你越危险。呢个系我嘅病。唔系你间屋。"),
      line("章慧琪", "姐夫话你精神不太好。我而家信一半。"),
      line("罗启明", "佢见过一次沿上。佢唔讲名。我唔怪佢。"),
      line("罗启明", "你再企喺走廊，又会有人以为要跌落。上次我讲唔好上天台，系讲你。唔系讲我自己。"),
      line("章慧琪", "你而家要去边？"),
      line("罗启明", "我上去同佢讲。你留喺下面。锁门。唔好播嗰卷录音。"),
      line("章慧琪", "你唔系要跳？"),
      line("罗启明", "我唔系要你跟。我上去，系叫她唔好再企喺度。我上过沿。我知道接下来会点：脚会先行，话会迟。我可以讲低。我阻止唔到脚。上次都系咁。"),
      { note: ["roofwhy", "他要上天台，不是拉我一起。他说脚会先走、话会迟——旧病他自己知道，停不住。"] },
      line("", "他拿起钥匙。铁梯门打开，风灌进来。他踩上一级台阶，停住，背对着你。"),
      line("罗启明", "如果我喺上面冇声，你唔好跟。打俾家豪。唔好打俾我。"),
      line("章慧琪", "阿明——"),
      line("罗启明", "我脏。你唔好伸手。伸手我会以为你选中我。选中我，我就会再错一次。"),
      line("", "脚步声继续往上。停了一下，又继续往上。你没有跟上去。你锁上门。屋里还亮着灯。"),
      { goto: roofWait },
    ], "荣汇街后座", "face");
  }

  function roofWait() {
    setTime("2014年9月7日 周日 夜");
    startTalk([
      line("", "铁梯又响了一下，然后很久都没有声音。好像有人站在上面，没有跳下去，也没有下来。"),
      line("", "你把耳朵贴在门上听。楼上有人很低地数：一、二、三、四。数完又说了一句，听不清楚，像在回答一个不在场的人。然后又继续数。"),
      { note: ["roofpause", "他在上面数呼吸，又对一个不在的人说话。不是鬼上身。是旧病。身体先到了，话还没讲完。"], goto: () => waitWeek(
        "2014年9月7日 周日 夜",
        "约一小时后",
        "楼上仍没有声音。灯还亮着。然后，全灭。",
        "9月8日　00:41　天台",
        roofNight
      ) },
    ], "荣汇街后座", "face");
  }

  function roofNight() {
    setTime("2014年9月8日 周一 00:41");
    startTalk([
      line("", "后座所有的灯都灭了。储物室门第一次从里面发出响声，像有人用肩膀撞门。玩具车滑到门边。"),
      line("", "有人喊了一句：上天台。声音像丽芬的声音，不是在叫儿子吃饭，像是在下命令。"),
      line("", "你打开门。走廊里只有从天台楼梯吹来的风。你往上跑。周的前座门开了一条缝，里面很黑。"),
      line("", "天台上风很大。晾衣绳打着金属杆。阿明已经站在女儿墙上，一只鞋在墙沿外面。他一只手扶着墙，另一只手握着，掌心露出一块磨白的鱼形牌子的边缘。他没有摊开手给你看。他不是在等你。他对着空气说话，像走廊尽头那个人走到了墙沿上。"),
      line("罗启明", "你企咗十年。我唔想你再企。我估错一次。我唔想再估错。"),
      line("", "他停了一下，像在等回答。只有风声。"),
      line("罗启明", "系我害的。我同你一齐。你唔好再站在走廊。"),
      line("章慧琪", "阿明！我喺度！"),
      line("", "他回过头。两秒钟。先看自己在墙沿外面的那只鞋，再看你。"),
      line("罗启明", "我喺天台。你系章慧琪。刚才那句唔系叫你一齐跳。"),
      line("罗启明", "你唔好跟上来。我脏。你伸手，我会以为你选中我。"),
      { note: ["rooftop", "他在沿上对空气说话。掌心那只鱼牌和抽屉里的是同一块。我叫他的名字，他先确认自己在天台、我是谁，才回来。不是失忆。是旧画面插进来。"] },
      line("周", "你查咗两次赔偿。你录音收得齐。你同警察讲见到鬼，他们锁你。你同他们讲我演戏，你有证据吗？"),
      line("章慧琪", "你叫我上去。"),
      line("周", "风大。旧楼常有人跌。跌下去就安静，像她们。你唔使自己查。我帮你安静。"),
      line("", "他伸手拉住你的小臂，方向朝墙沿拉。姿势像是搀扶——明天的口供可以写成「我拉住她」。"),
      line("", "他的身体又要跨出去——不是决定和你一起跳，而是旧病在墙沿上再次发作。你另一只手抓住了他的手腕。抓到了。"),
      line("", "你想起阿乐挂断的两声电话、表姐眼里的药、差人说过的「有没有人受伤」。这一次你没有松手。"),
      line("", "铁门被撞开。陈家豪站在门口，穿着便装衬衫，喘气很急，像从街底跑了六层没有电梯的楼梯上来。手里是澄心的紧急钥匙。他没有带枪——今天休班。"),
      line("陈家豪", "阿明——你唔可以再接近——章慧琪，你走开！"),
      line("周", "又一个。成日跟住医生嗰个差人。"),
      line("", "三件事在同一秒钟发生：周拉着你的手臂往墙沿方向拉。阿明的鞋离地了。陈家用身体撞向周，不是用拳头。"),
      line("", "周的肩膀撞在水箱上。陈的腰撞在女儿墙内侧的水泥上。声音很闷。"),
      line("", "阿明跌回墙内侧，膝盖着地。周快步下楼梯，没有回头。"),
      line("", "陈靠着墙滑坐下去，手按住自己的腰，血从指缝里渗出来。他看着阿明，没有看你。"),
      line("陈家豪", "你……唔好同她走。你属于……"),
      line("章慧琪", "我叫救护车。"),
      line("陈家豪", "你走开。我不是为你。"),
      line("", "他说完这句话，头垂到胸前。阿明用力抓住你的手，抓得很紧。"),
      { goto: ending },
    ], "天台", "face");
  }

  function ending() {
    stopNightClock();
    S.talk = null;
    S.mode = "end";
    clearStage();
    const box = el("div", { class: "endcard" });
    box.append(
      imgSlot("01-chen-down", "end-bg", "陈倒下"),
      el("div", { class: "end-copy" }, [
      el("h1", {}, ["暗度"]),
      el("p", {}, ["undo"]),
        el("p", {}, ["救护车声在很远的地方。"]),
        el("p", {}, ["你当时不知道他怎样。笔记还在。"]),
      el("button", {
        class: "btn",
        type: "button",
        onclick: () => {
            stopNightClock();
          S = initial();
          setTime(S.time);
          renderNotes();
          draw();
        },
        }, ["回到廿八屋"]),
      ])
    );
    stage.append(box);
    renderPlaybar();
  }

  const SCENE = "../图/场景/荣汇街/";
  const GAME = "../图/游戏/";

  const RONG_PLAN = [
    { id: "rong-street", name: "荣汇街", line: "铺侧窄门入楼梯。", x: 24, y: 6, w: 236, h: 20, img: SCENE + "ccd-01-街道.png" },
    { id: "rong-front", name: "前座", line: "周先生自住。临街。", x: 24, y: 34, w: 236, h: 74, img: SCENE + "ccd-11-前座客厅.png" },
    { id: "rong-landing", name: "平台", line: "同层两扇门。", x: 24, y: 118, w: 148, h: 56, img: SCENE + "ccd-03-四楼平台.png" },
    { id: "rong-stair", name: "楼梯", line: "公共楼梯。无电梯。", x: 172, y: 118, w: 88, h: 56, img: GAME + "01-view-stair.png" },
    { id: "rong-door", name: "后座门", line: "双锁。对着平台。", x: 136, y: 182, w: 88, h: 24, img: GAME + "01-view-door.png" },
    { id: "rong-kitchen", name: "厨房", line: "后座西侧。", x: 24, y: 214, w: 112, h: 88, img: SCENE + "ccd-05-厨房.png" },
    { id: "rong-corridor", name: "走廊", line: "从大门望向天井那扇窗。", x: 136, y: 214, w: 60, h: 164, lx: 142, ly: 348, points: "136,214 260,214 260,302 196,302 196,378 136,378", img: GAME + "01-listing-ssp.png" },
    { id: "rong-bath", name: "厕所", line: "后座。", x: 24, y: 302, w: 112, h: 76, img: SCENE + "ccd-06-厕所.png" },
    { id: "rong-store", name: "储物室", line: "锁着。门开向后楼梯。", x: 196, y: 302, w: 64, h: 76, img: SCENE + "ccd-07-储物室门缝.png" },
    { id: "rong-bed", name: "睡房", line: "铁窗朝天井。", x: 24, y: 378, w: 112, h: 108, img: SCENE + "ccd-04-睡房.png" },
    { id: "rong-hall", name: "厅", line: "后座。窗朝天井。", x: 136, y: 378, w: 124, h: 108, img: GAME + "01-view-interior.png", imgNight: GAME + "01-night-room.png" },
    { id: "rong-roof", name: "天台", line: "晾衫。晚上风大。后楼梯上去。", x: 276, y: 118, w: 100, h: 64, img: GAME + "01-roof.png" },
    { id: "rong-backstair", name: "后楼梯", line: "贴后巷，上天台。", x: 276, y: 182, w: 48, h: 304, img: SCENE + "ccd-09-后楼梯.png" },
  ];

  const CLINIC_PLAN = [
    { id: "clinic-wait", name: "候诊", line: "湾仔澄心。", x: 28, y: 48, w: 160, h: 130, img: GAME + "01-clinic-waiting.png" },
    { id: "clinic-room", name: "诊室", line: "罗启明。", x: 206, y: 48, w: 180, h: 130, img: GAME + "01-clinic-room.png" },
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
      if (loc.includes("荣汇") || loc.includes("后座")) return markPlace("rong-hall");
      return;
    }
    if (S.mode === "chat") return;
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
    if (S.mapView === "rong" && !S.known.rongIn) S.mapSel = "rong-listing";
    else if (S.mapView === "clinic" && !S.known.clinicIn) S.mapSel = "clinic-addr";
    else if (S.mapView === "none") S.mapSel = S.place === "mei" ? "mei" : "nowhere";
    else if (S.mapView === "rong" && String(S.place).startsWith("rong")) S.mapSel = S.place;
    else if (S.mapView === "clinic" && String(S.place).startsWith("clinic")) S.mapSel = S.place;
    else if (S.place === "mei") S.mapSel = "mei";
    else if (S.mapView === "rong") S.mapSel = "rong-hall";
    else S.mapSel = "clinic-room";
    mapLayer.hidden = false;
    renderMap();
  }

  function closeMap() {
    mapLayer.hidden = true;
  }

  function selectRoom(id) {
    S.mapSel = id;
    renderMap();
  }

  function detailSpec(id) {
    if (id === "mei") return { name: "表姐家", line: "陈美娟。午饭。沙发在。", img: GAME + "01-view-mei.png" };
    if (id === "rong-listing") return { name: "荣汇街 28 号", line: "深水埗，4 楼后座。放盘上的走廊。", img: GAME + "01-listing-ssp.png" };
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
    img.alt = alt || "";
    img.draggable = false;
    img.src = src;
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
      here ? el("p", { class: "map-now" }, ["人在这里"]) : "",
      spec.img ? mapPhoto(spec.img, spec.name) : ""
    );
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
      ]));
    });
    host.append(wrap);
  }

  function renderPlan(host, rooms, viewBox) {
    const svg = svgEl("svg", { viewBox: viewBox, class: "map-svg" });
    const seen = {};
    rooms.forEach((r) => {
      const g = svgEl("g", {
        class: "map-room-g" + (S.mapSel === r.id ? " sel" : "") + (S.place === r.id && r.id !== "rong-front" ? " here" : ""),
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
    else if (S.mapView === "rong") host.append(mapPhoto(GAME + "01-listing-ssp.png", "荣汇街"));
    else if (clinicDirect && S.known.clinicIn) renderClinicSlots(host);
    else if (clinicDirect) host.append(el("p", { class: "map-empty" }, ["湾仔澄心诊所。罗启明。"]));
    else host.append(el("p", { class: "map-empty" }, [S.place === "mei" ? "表姐家。" : "还没有住的地方。"]));
    if (clinicDirect) $("#map-detail").replaceChildren();
    else renderDetail();
  }

  function draw() {
    if (S.mode === "talk") return drawTalk();
    if (S.mode === "cal") return drawCalendar();
    if (S.mode === "movein") return drawMoveIn();
    if (S.mode === "night") return drawNight();
    if (S.mode === "chat") return drawChat();
    if (S.mode === "clinic") return drawClinic();
    if (S.mode === "search") return drawSearch();
    if (S.mode === "wait") return drawWait();
    if (S.mode === "end") return ending();
    renderWeb();
  }

  renderNotes();
  setTime(S.time);
  draw();
  const previews = {
    1: () => {},
    2: () => { flag("postedHelp", true); goViewing(); },
    3: () => moveInStart(),
    4: () => startChange(),
    5: () => nightStart(),
    6: () => howardSms(),
    7: () => goClinic(),
    8: () => homeAfterClinic(),
    9: () => postSerial1(),
    10: () => weekFoot(),
    11: () => clinic2(),
    12: () => nightNoRec(),
    13: () => postSerial2(),
    14: () => sundayMeal(),
    15: () => clinic3(),
    16: () => postSerial3(),
    17: () => nightBeforeTue(),
    18: () => clinic4(),
    19: () => visitHome(),
    20: () => missAppt(),
    21: () => nightName(),
    22: () => goSearch(),
    23: () => mingReturn(),
    24: () => roofApproach(),
    25: () => roofNight(),
    26: () => ending(),
  };
  const preview = Number(new URLSearchParams(location.search).get("preview"));
  if (previews[preview]) previews[preview]();
})();
