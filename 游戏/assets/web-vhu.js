/* web-vhu.js — 维港大学校园入门网站（2014 年）+ 浏览器空白分页
   依赖 web-ui.js 的 el／goWeb／webLink／draw；load 在 web-ui.js 之后。 */

const VHU_HOST = "portal.vhu.edu.hk";
const VHU_ID = "91024656E";
const VHU_PW = "91024656E";

/* ---------- 站内资料 ---------- */

const VHU_NOTICES = [
  {
    id: "maint",
    date: "2014年9月5日",
    tag: "系统",
    title: "入门网站九月维护通告",
    body: [
      "资讯科技服务中心将于二〇一四年九月十三日（星期六）凌晨零时至上午六时，为入门网站进行例行维护。",
      "维护期间，选科、成绩查阅、图书馆续借及电邮服务将会暂停。校园无线网络不受影响。",
      "如维护提早完成，服务会提前恢复，不另行通知。",
    ],
  },
  {
    id: "quota",
    date: "2014年8月28日",
    tag: "电邮",
    title: "学生电邮储存空间提升至 500MB",
    body: [
      "由九月一日起，学生及校友电邮帐户的储存空间由 200MB 提升至 500MB。",
      "单个附件上限维持 20MB。如邮件超出配额，系统会退回寄件人，不会暂存。",
      "资讯科技服务中心",
    ],
  },
  {
    id: "alumni",
    date: "2014年7月15日",
    tag: "帐户",
    title: "校友帐户政策更新",
    body: [
      "由二〇一四年八月一日起，毕业同学的入门网站帐户会转为校友帐户。",
      "校友帐户保留：校园电邮、学业纪录查阅、图书馆目录查询。",
      "选科、eLearn、宿舍申请及学生会服务，会于毕业手续办妥后停止。",
      "校友帐户不会自动删除。如帐户连续两年没有登入，系统会暂停电邮转寄，学业纪录仍然保留。",
    ],
  },
  {
    id: "libsummer",
    date: "2014年6月2日",
    tag: "图书馆",
    title: "图书馆暑期开放时间",
    body: [
      "六月九日至八月三十一日，总馆开放时间为星期一至五上午九时至晚上七时，星期六上午九时至下午五时，星期日及公众假期休馆。",
      "医学院分馆逢星期六下午及星期日休馆。",
      "还书箱于休馆期间照常开放。",
    ],
  },
];

const VHU_MAILS = [
  {
    id: "alumni14",
    from: "校友事务处",
    addr: "alumni@vhu.edu.hk",
    date: "2014年8月20日 10:04",
    subject: "校友电子通讯（2014 年 8 月号）",
    unread: true,
    body: [
      "各位校友：",
      "今期内容：",
      "一、校友返校日将于十月十八日举行。医学院旧生午宴同日在校园餐厅举行，座位有限，请于九月三十日前回覆。",
      "二、图书馆校友借书证申请办法已更新，年费维持三百元。",
      "三、大学发展基金二〇一三／一四年度报告，已上载校友事务处网页。",
      "如不欲接收本通讯，请于校友事务处网页更改设定。",
      "校友事务处",
      "维港大学",
    ],
  },
  {
    id: "grad05",
    from: "医学院院务处",
    addr: "medfac@vhu.edu.hk",
    date: "2005年6月30日 15:22",
    subject: "毕业证书及成绩单领取安排",
    body: [
      "各位毕业同学：",
      "二〇〇五年度毕业证书将于七月十一日起，于医学院院务处派发。领取时请出示学生证或身份证明文件。",
      "成绩单可于同一期间申请，费用全免，每人限取两份。",
      "医学院院务处",
    ],
  },
  {
    id: "hold04",
    from: "图书馆",
    addr: "lib@vhu.edu.hk",
    date: "2004年1月19日 09:41",
    subject: "预约书到馆通知",
    body: [
      "阁下预约之《内科学原理》已到馆，请于七日内到医学院图书馆借阅。逾期未取，预约将被取消。",
      "图书馆",
    ],
  },
  {
    id: "rot03",
    from: "医学院",
    addr: "medfac@vhu.edu.hk",
    date: "2003年10月9日 17:08",
    subject: "2003/04 年度临床见习组别分配",
    body: [
      "临床见习组别已公布，请于医学院地下布告板查阅。",
      "精神科见习将于二〇〇四年一月至二月进行，地点容后通知。",
      "医学院",
    ],
  },
];

const VHU_BOOKS = [
  { title: "格雷氏解剖学（第三十九版）", author: "Williams, P. L.", year: "1999", call: "QM 23.2 W72", state: "可借" },
  { title: "内科学原理（第十五版）", author: "Braunwald, E. 等", year: "2001", call: "RC 46 H32", state: "可借" },
  { title: "精神医学临床手册", author: "维港大学医学院精神科", year: "2003", call: "RC 456 V52", state: "已借出" },
  { title: "香港公共卫生概论", author: "医学院公共卫生学系", year: "2000", call: "RA 541.H6 V52", state: "可借" },
  { title: "医学统计入门", author: "医学院医学教育组", year: "1999", call: "RA 409 V52", state: "可借" },
  { title: "临床沟通技巧", author: "医学院医学教育组", year: "2002", call: "R 727.3 V52", state: "可借" },
];

const VHU_YEARS = [
  {
    year: "2000/01",
    label: "一年级",
    gpa: "3.32",
    rows: [
      ["MED1101", "人体结构学", "6", "A-"],
      ["MED1102", "生理学", "6", "B+"],
      ["MED1103", "生物化学", "4", "B"],
      ["MED1104", "医护人文学导论", "2", "A"],
      ["MED1105", "临床技巧入门", "2", "B+"],
    ],
  },
  {
    year: "2001/02",
    label: "二年级",
    gpa: "3.21",
    rows: [
      ["MED2101", "病理学", "6", "B+"],
      ["MED2102", "药理学", "5", "B"],
      ["MED2103", "微生物学与免疫学", "4", "B+"],
      ["MED2104", "公共卫生与流行病学", "3", "B+"],
      ["MED2105", "行为科学", "2", "A-"],
    ],
  },
  {
    year: "2002/03",
    label: "三年级",
    gpa: "3.18",
    rows: [
      ["MED3101", "内科学（一）", "8", "B+"],
      ["MED3102", "外科学（一）", "8", "B"],
      ["MED3103", "社区医学", "4", "B+"],
      ["MED3104", "临床沟通", "2", "A"],
    ],
  },
  {
    year: "2003/04",
    label: "四年级",
    gpa: "3.29",
    rows: [
      ["MED4101", "内科学（二）", "8", "B+"],
      ["MED4102", "外科学（二）", "8", "B"],
      ["MED4103", "妇产科", "5", "B+"],
      ["MED4104", "儿科", "5", "B+"],
      ["MED4105", "精神科", "5", "A-"],
    ],
  },
  {
    year: "2004/05",
    label: "五年级",
    gpa: "—",
    rows: [
      ["MED5101", "临床实习（内科）", "10", "合格"],
      ["MED5102", "临床实习（外科）", "10", "合格"],
      ["MED5103", "临床实习（精神科）", "6", "合格"],
      ["MED5104", "急症医学", "3", "合格"],
      ["MED5105", "毕业专题", "4", "B+"],
    ],
  },
];

/* ---------- 状态 ---------- */

function vhuSt() {
  if (!S.vhu || typeof S.vhu !== "object") S.vhu = {};
  const st = S.vhu;
  if (st.authed == null) st.authed = false;
  if (!st.read || typeof st.read !== "object") st.read = {};
  ["id", "pw", "err", "mail", "notice", "libq", "errUrl", "url"].forEach((k) => {
    if (st[k] == null) st[k] = "";
  });
  return st;
}

function vhuUnread() {
  const st = vhuSt();
  return VHU_MAILS.filter((m) => m.unread && !st.read[m.id]).length;
}

function blankTabTitle() {
  const s = String(S.screen || "");
  if (s.indexOf("vhu-") === 0) return "VHU Portal - 维港大学";
  if (s === "web-error") return "无法显示网页";
  return "新分页";
}

/* ---------- 地址 ---------- */

function vhuNormalizeUrl(raw) {
  let s = String(raw || "").trim();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  s = s.replace(/^www\./i, "");
  s = s.replace(/\/+$/, "");
  return s.toLowerCase();
}

function vhuOpenUrl(raw) {
  const st = vhuSt();
  const n = vhuNormalizeUrl(raw);
  if (!n || n === "about:blank") {
    goWeb("newtab");
    return;
  }
  const host = n.split("/")[0];
  if (host === "28house.hk") {
    goWeb("home");
    return;
  }
  if (host === "wallbook.hk") {
    goWeb("wall");
    return;
  }
  if (host === "vhu.edu.hk" || host === VHU_HOST || host === "intranet.vhu.edu.hk") {
    goWeb(st.authed ? "vhu-home" : "vhu-login");
    return;
  }
  st.errUrl = String(raw || "").trim();
  goWeb("web-error");
}

/* ---------- 登入 ---------- */

function vhuLogin() {
  const st = vhuSt();
  const id = String(st.id || "").trim().toUpperCase();
  const pw = String(st.pw || "").trim().toUpperCase();
  if (!id || !pw) {
    st.err = "请输入学生编号及密码。";
    draw();
    return;
  }
  if (id === VHU_ID && pw === VHU_PW) {
    st.authed = true;
    st.err = "";
    st.need = false;
    st.out = false;
    st.pw = "";
    goWeb("vhu-home", { replace: true });
    return;
  }
  st.err = "学生编号或密码不正确。请再试一次。";
  draw();
}

function vhuLogout() {
  const st = vhuSt();
  st.authed = false;
  st.out = true;
  st.need = false;
  st.mail = "";
  st.notice = "";
  goWeb("vhu-login", { replace: true });
}

function vhuPage(id) {
  const st = vhuSt();
  if (!st.authed) {
    st.need = true;
    goWeb("vhu-login");
    return;
  }
  st.need = false;
  if (id !== "mail") st.mail = "";
  if (id !== "notice") st.notice = "";
  goWeb("vhu-" + id);
}

function vhuForgot() {
  showPrompt(
    T("忘记密码", "忘记密码"),
    T(
      "请带同学生证，于办公时间到资讯科技服务中心办理。",
      "请携带学生证，于办公时间到信息技术服务中心办理。"
    )
  );
}

/* ---------- 外壳 ---------- */

const VHU_PAGE_LABEL = {
  home: "首页",
  profile: "我的资料",
  academic: "学业纪录",
  library: "图书馆",
  mail: "电邮",
  notice: "公告",
  login: "登入",
};

function vhuHead() {
  return el("div", { class: "vhu-head" }, [
    el("div", { class: "vhu-mark" }, ["VHU"]),
    el("div", { class: "vhu-wordmark" }, [
      el("strong", {}, ["维港大学"]),
      el("small", {}, ["VICTORIA HARBOUR UNIVERSITY"]),
    ]),
    el("div", { class: "vhu-head-side" }, [
      el("span", {}, ["资讯科技服务中心"]),
      el("small", {}, ["Information Technology Services Centre"]),
    ]),
  ]);
}

function vhuNav(page) {
  const st = vhuSt();
  const item = (label, id) =>
    el("button", {
      type: "button",
      class: "vhu-nav-item" + (page === id ? " on" : ""),
      onclick: () => vhuPage(id),
    }, [label]);
  const unread = vhuUnread();
  return el("div", { class: "vhu-nav" }, [
    item("首页", "home"),
    item("我的资料", "profile"),
    item("学业纪录", "academic"),
    item("图书馆", "library"),
    item(st.authed && unread ? "电邮（" + unread + "）" : "电邮", "mail"),
    item("公告", "notice"),
    el("span", { class: "vhu-nav-gap" }, []),
    el("button", { type: "button", class: "vhu-nav-item vhu-nav-out", onclick: vhuLogout }, ["登出"]),
  ]);
}

function vhuSubbar() {
  return el("div", { class: "vhu-subbar" }, [
    el("span", {}, ["学号 " + VHU_ID]),
    el("span", {}, ["罗启明"]),
    el("span", {}, ["校友"]),
    el("span", { class: "vhu-sub-time" }, [(S.time || "").replace(/\s+\d{1,2}:\d{2}$/, "")]),
  ]);
}

function vhuFoot() {
  return el("div", { class: "vhu-foot" }, [
    el("p", {}, ["© 2014 维港大学　资讯科技服务中心　│　查询：itsc@vhu.edu.hk"]),
    el("p", {}, ["内联网只供本校成员使用。建议以 Internet Explorer 8 或以上浏览。"]),
  ]);
}

function vhuShell(body, page) {
  const st = vhuSt();
  const kids = [vhuHead()];
  if (st.authed) {
    kids.push(vhuNav(page), vhuSubbar());
    kids.push(el("div", { class: "vhu-crumb" }, [
      webLink("首页", () => vhuPage("home")),
      "　›　",
      el("span", {}, [VHU_PAGE_LABEL[page] || ""]),
    ]));
  }
  kids.push(el("div", { class: "vhu-body" }, body));
  kids.push(vhuFoot());
  return el("div", { class: "hk-site vhu-site" }, kids);
}

/* ---------- 空白分页 ---------- */

function viewNewTab() {
  const st = vhuSt();
  const input = el("input", {
    id: "vhu-url",
    type: "text",
    class: "vhu-url-input",
    value: st.url || "",
    placeholder: "www.example.com",
    autocomplete: "off",
    spellcheck: "false",
  });
  input.addEventListener("input", () => {
    st.url = input.value;
  });
  const form = el("form", {
    class: "vhu-url-form",
    onsubmit: (e) => {
      e.preventDefault();
      vhuOpenUrl(input.value);
    },
  }, [
    el("label", { for: "vhu-url" }, ["输入网址"]),
    el("div", { class: "vhu-url-row" }, [
      input,
      el("button", { type: "submit", class: "vhu-btn" }, ["转到"]),
    ]),
  ]);
  setTimeout(() => {
    const box = document.getElementById("vhu-url");
    if (box && document.activeElement !== box) {
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    }
  }, 0);
  return el("div", { class: "hk-site vhu-site vhu-blank" }, [
    el("div", { class: "vhu-blank-inner" }, [
      el("p", { class: "vhu-blank-mark" }, ["about:blank"]),
      form,
      el("p", { class: "vhu-fine" }, ["输入网址后按 Enter。也可从下面「我的最爱」开启。"]),
      el("div", { class: "vhu-fav" }, [
        el("h3", {}, ["我的最爱"]),
        el("ul", {}, [
          el("li", {}, [webLink("廿八屋　香港租盘", () => goWeb("home"))]),
          el("li", {}, [webLink("墙簿", () => goWeb("wall"))]),
        ]),
      ]),
    ]),
  ]);
}

/* ---------- 打不开的网址 ---------- */

function viewWebError() {
  const st = vhuSt();
  return el("div", { class: "hk-site vhu-site vhu-error" }, [
    el("div", { class: "vhu-error-inner" }, [
      el("h1", {}, ["无法显示网页"]),
      el("p", {}, [
        "正在寻找的网页 ",
        el("span", { class: "vhu-mono" }, [st.errUrl || ""]),
        " 目前无法使用。",
      ]),
      el("p", {}, ["网站可能发生技术问题，或网址输入有误。"]),
      el("p", { class: "vhu-error-sub" }, ["请尝试以下方法："]),
      el("ul", {}, [
        el("li", {}, ["按一下工具列上的「重新整理」，或稍后再试。"]),
        el("li", {}, ["如果你已在网址列输入网址，请确定拼写正确。"]),
        el("li", {}, ["检查网络连线是否正常。"]),
      ]),
      el("hr"),
      el("p", { class: "vhu-fine" }, ["找不到伺服器或 DNS 错误　　Internet Explorer"]),
      el("p", {}, [webLink("回到空白分页", () => goWeb("newtab"))]),
    ]),
  ]);
}

/* ---------- 登入页 ---------- */

function viewVhuLogin() {
  const st = vhuSt();
  if (st.authed) return vhuAlreadyIn();

  const idIn = el("input", {
    id: "vhu-id",
    type: "text",
    class: "vhu-input",
    maxlength: "20",
    value: st.id || "",
    autocomplete: "off",
  });
  const pwIn = el("input", {
    id: "vhu-pw",
    type: "password",
    class: "vhu-input",
    maxlength: "32",
    value: st.pw || "",
    autocomplete: "off",
  });
  idIn.addEventListener("input", () => { st.id = idIn.value; });
  pwIn.addEventListener("input", () => { st.pw = pwIn.value; });

  const form = el("form", {
    class: "vhu-login-form",
    onsubmit: (e) => {
      e.preventDefault();
      vhuLogin();
    },
  }, [
    el("h2", {}, ["登入"]),
    st.need ? el("p", { class: "vhu-msg" }, ["请先登入，方可使用校园网上服务。"]) : "",
    st.out ? el("p", { class: "vhu-msg" }, ["你已登出。"]) : "",
    st.err ? el("p", { class: "vhu-err", role: "alert" }, [st.err]) : "",
    el("label", { for: "vhu-id" }, ["学生编号　Student ID"]),
    idIn,
    el("label", { for: "vhu-pw" }, ["密码　Password"]),
    pwIn,
    el("button", { type: "submit", class: "vhu-btn vhu-login-btn" }, ["登入"]),
    el("p", { class: "vhu-fine" }, ["首次登入的密码为学生编号，英文字母不分大小写。登入后请即时更改。"]),
    el("p", { class: "vhu-login-links" }, [
      webLink("忘记密码", vhuForgot),
      "　│　",
      webLink("帐户查询", vhuForgot),
    ]),
  ]);

  setTimeout(() => {
    const box = document.getElementById(st.id ? "vhu-pw" : "vhu-id");
    if (box && document.activeElement !== box) box.focus();
  }, 0);

  return vhuShell([
    el("div", { class: "vhu-login-wrap" }, [
      el("div", { class: "vhu-login-intro" }, [
        el("h1", {}, ["VHU Portal"]),
        el("p", { class: "vhu-login-cn" }, ["校园入门网站"]),
        el("p", {}, ["选科、成绩、图书馆、电邮，一个入口。"]),
        el("ul", {}, [
          el("li", {}, ["学生编号为八位数字加一个英文字母。"]),
          el("li", {}, ["服务时间：每日 07:00–23:00。"]),
          el("li", {}, ["毕业同学的帐户会转为校友帐户。"]),
        ]),
      ]),
      form,
    ]),
    el("div", { class: "vhu-login-foot" }, [
      el("h3", {}, ["系统讯息"]),
      el("ul", {}, VHU_NOTICES.slice(0, 2).map((n) =>
        el("li", {}, [el("span", { class: "vhu-date" }, [n.date]), "　", n.title])
      )),
    ]),
  ], "login");
}

function vhuAlreadyIn() {
  const st = vhuSt();
  return vhuShell([
    el("div", { class: "vhu-panel" }, [
      el("h2", { class: "vhu-h2" }, ["你已登入"]),
      el("p", {}, ["罗启明　（" + VHU_ID + "）"]),
      el("p", { class: "vhu-actions" }, [
        el("button", { type: "button", class: "vhu-btn", onclick: () => vhuPage("home") }, ["进入首页"]),
        el("button", { type: "button", class: "vhu-btn ghost", onclick: vhuLogout }, ["登出"]),
      ]),
    ]),
  ], "login");
}

/* ---------- 首页 ---------- */

function viewVhuHome() {
  const st = vhuSt();
  const unread = vhuUnread();
  const kv = el("table", { class: "vhu-kv" }, [
    ["学生编号", VHU_ID],
    ["帐户类别", "校友（Alumni）"],
    ["学籍", "已毕业（2005）"],
    ["上次登入", "2005年6月28日 16:12"],
    ["登入位置", "校园网络　图书馆地下（10.12.4.87）"],
    ["未读邮件", unread ? String(unread) + " 封" : "0 封"],
  ].map(([k, v]) => el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])])));

  const news = el("ul", { class: "vhu-list" }, VHU_NOTICES.slice(0, 3).map((n) =>
    el("li", {}, [
      el("span", { class: "vhu-date" }, [n.date]),
      el("button", {
        type: "button",
        class: "vhu-link-btn",
        onclick: () => { st.notice = n.id; goWeb("vhu-notice"); },
      }, [n.title]),
    ])
  ));

  const tile = (title, note, page, off) => el("button", {
    type: "button",
    class: "vhu-tile" + (off ? " off" : ""),
    disabled: !!off,
    onclick: off ? null : () => vhuPage(page),
  }, [
    el("strong", {}, [title]),
    el("small", {}, [note]),
  ]);

  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["欢迎回来，罗启明"]),
    el("p", { class: "vhu-lead" }, ["LAW Kai Ming (Kimon)　·　医学院　·　内外全科医学士"]),
    el("div", { class: "vhu-alert" }, [
      "你的帐户为校友帐户。选科、eLearn 及宿舍服务已停用，学业纪录及电邮仍可查阅。",
    ]),
    el("div", { class: "vhu-cols" }, [
      el("section", { class: "vhu-panel" }, [
        el("h3", {}, ["我的户口"]),
        kv,
      ]),
      el("section", { class: "vhu-panel" }, [
        el("h3", {}, ["校园公告"]),
        news,
      ]),
    ]),
    el("h3", { class: "vhu-h3" }, ["网上服务"]),
    el("div", { class: "vhu-services" }, [
      tile("个人资料", "姓名、学号、书院", "profile"),
      tile("学业纪录", "2000–2005 成绩", "academic"),
      tile("图书馆", "目录、借阅纪录", "library"),
      tile("电邮", unread ? unread + " 封未读" : "没有未读邮件", "mail"),
      tile("成绩单申请", "须亲临教务处办理", "", true),
      tile("eLearn", "校友帐户不适用", "", true),
    ]),
  ], "home");
}

/* ---------- 我的资料 ---------- */

function viewVhuProfile() {
  const rows = [
    ["中文姓名", "罗启明"],
    ["英文姓名", "LAW Kai Ming (Kimon)"],
    ["学生编号", VHU_ID],
    ["学院", "医学院"],
    ["课程", "内外全科医学士（MBBS）"],
    ["修业年期", "2000–2005"],
    ["学籍状况", "毕业（2005年6月）"],
    ["书院", "博文书院"],
    ["舍堂", "海宁堂（2000–2003）"],
    ["校园电邮", "91024656e@vhu.edu.hk"],
    ["通讯地址", "香港湾仔（2005年登记）"],
    ["帐户建立", "2000年8月21日"],
    ["密码最后更改", "从未更改"],
    ["帐户类别", "校友（只读）"],
  ];
  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["我的资料"]),
    el("p", { class: "vhu-note" }, [
      "校友帐户只供查阅。如需更新联络资料，请填写校友事务处的更新表格。",
    ]),
    el("table", { class: "vhu-kv vhu-kv-wide" }, rows.map(([k, v]) =>
      el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])])
    )),
    el("p", { class: "vhu-fine" }, ["资料摘录自学生纪录系统，最后更新：2005年7月4日。"]),
  ], "profile");
}

/* ---------- 学业纪录 ---------- */

function viewVhuAcademic() {
  const blocks = VHU_YEARS.map((y) => el("section", { class: "vhu-year" }, [
    el("h3", {}, [
      y.year + "　" + y.label,
      el("span", { class: "vhu-gpa" }, ["平均积点 " + y.gpa]),
    ]),
    el("table", { class: "vhu-table" }, [
      el("thead", {}, [el("tr", {}, [
        el("th", {}, ["科目编号"]),
        el("th", {}, ["科目名称"]),
        el("th", { class: "vhu-num" }, ["学分"]),
        el("th", { class: "vhu-num" }, ["成绩"]),
      ])]),
      el("tbody", {}, y.rows.map((r) => el("tr", {}, [
        el("td", { class: "vhu-mono" }, [r[0]]),
        el("td", {}, [r[1]]),
        el("td", { class: "vhu-num" }, [r[2]]),
        el("td", { class: "vhu-num" }, [r[3]]),
      ]))),
    ]),
  ]));
  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["学业纪录"]),
    el("div", { class: "vhu-summary" }, [
      el("span", {}, ["课程：内外全科医学士"]),
      el("span", {}, ["总平均积点：3.25 / 4.0"]),
      el("span", {}, ["毕业资格：2005年6月"]),
    ]),
    ...blocks,
    el("p", { class: "vhu-fine" }, [
      "本纪录为 2005 年 7 月存档版本，仅供查阅。正式成绩单请向教务处申请。",
    ]),
  ], "academic");
}

/* ---------- 图书馆 ---------- */

function viewVhuLibrary() {
  const st = vhuSt();
  const q = String(st.libq || "");
  const hit = q
    ? VHU_BOOKS.filter((b) => (b.title + b.author + b.call).toLowerCase().includes(q.toLowerCase()))
    : [];
  const input = el("input", {
    type: "search",
    class: "vhu-input vhu-search",
    value: q,
    maxlength: "40",
    placeholder: "",
  });
  input.addEventListener("input", () => { st.libq = input.value; });
  const run = () => {
    st.libq = input.value;
    st.libdone = true;
    draw();
    setTimeout(() => {
      const box = document.querySelector(".vhu-search");
      if (box) box.focus();
    }, 0);
  };
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); run(); } });

  const results = !st.libdone
    ? el("p", { class: "vhu-fine" }, ["输入书名、作者或索书号，再按「搜寻」。"])
    : !hit.length
      ? el("p", { class: "vhu-empty" }, ["没有符合的纪录。请尝试其他关键字。"])
      : el("table", { class: "vhu-table" }, [
        el("thead", {}, [el("tr", {}, [
          el("th", {}, ["书名"]),
          el("th", {}, ["作者"]),
          el("th", {}, ["年份"]),
          el("th", {}, ["索书号"]),
          el("th", {}, ["状态"]),
        ])]),
        el("tbody", {}, hit.map((b) => el("tr", {}, [
          el("td", {}, [b.title]),
          el("td", {}, [b.author]),
          el("td", { class: "vhu-num" }, [b.year]),
          el("td", { class: "vhu-mono" }, [b.call]),
          el("td", {}, [b.state]),
        ]))),
      ]);

  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["图书馆"]),
    el("table", { class: "vhu-kv vhu-kv-wide" }, [
      ["借书证号码", VHU_ID],
      ["借书证状态", "已失效（2005年7月31日）"],
      ["未缴罚款", "HK$ 0.00"],
      ["预约", "0 项"],
    ].map(([k, v]) => el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])]))),
    el("p", { class: "vhu-note" }, [
      "校友可申请借书证，年费 HK$300。申请表格可于总馆地下服务台索取。",
    ]),
    el("h3", { class: "vhu-h3" }, ["目录搜寻"]),
    el("div", { class: "vhu-search-row" }, [
      input,
      el("button", { type: "button", class: "vhu-btn", onclick: run }, ["搜寻"]),
    ]),
    results,
    el("h3", { class: "vhu-h3" }, ["借阅纪录"]),
    el("table", { class: "vhu-table" }, [
      el("thead", {}, [el("tr", {}, [
        el("th", {}, ["借出日期"]),
        el("th", {}, ["书名"]),
        el("th", {}, ["归还日期"]),
      ])]),
      el("tbody", {}, [
        ["2003年2月18日", "格雷氏解剖学（第三十九版）", "2003年3月4日"],
        ["2003年10月21日", "内科学原理（第十五版）", "2003年11月18日"],
        ["2004年1月22日", "精神医学临床手册", "2004年2月6日"],
      ].map((r) => el("tr", {}, [
        el("td", { class: "vhu-num" }, [r[0]]),
        el("td", {}, [r[1]]),
        el("td", { class: "vhu-num" }, [r[2]]),
      ]))),
    ]),
  ], "library");
}

/* ---------- 电邮 ---------- */

function viewVhuMail() {
  const st = vhuSt();
  const mail = st.mail ? VHU_MAILS.find((m) => m.id === st.mail) : null;
  if (mail) {
    st.read[mail.id] = true;
    return vhuShell([
      el("p", { class: "vhu-back" }, [
        webLink("« 返回收件箱", () => { st.mail = ""; draw(); }),
      ]),
      el("h2", { class: "vhu-h2" }, [mail.subject]),
      el("table", { class: "vhu-kv vhu-kv-wide vhu-mail-head" }, [
        ["寄件人", mail.from + "　<" + mail.addr + ">"],
        ["收件人", "91024656e@vhu.edu.hk"],
        ["日期", mail.date],
        ["主旨", mail.subject],
      ].map(([k, v]) => el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])]))),
      el("div", { class: "vhu-mail-body" }, mail.body.map((p) => el("p", {}, [p]))),
      el("p", { class: "vhu-fine" }, ["此邮件为 2014 年 9 月 7 日之前的存档副本。"]),
    ], "mail");
  }
  const rows = VHU_MAILS.map((m) => {
    const read = !!st.read[m.id];
    return el("tr", {
      class: (m.unread && !read ? "vhu-unread" : "") + " vhu-mail-row",
      onclick: () => { st.mail = m.id; draw(); },
    }, [
      el("td", {}, [m.from]),
      el("td", {}, [m.unread && !read ? el("b", {}, ["● "]) : "", m.subject]),
      el("td", { class: "vhu-num" }, [m.date]),
    ]);
  });
  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["电邮"]),
    el("p", { class: "vhu-lead" }, [
      "91024656e@vhu.edu.hk　·　容量 500MB　·　未读 " + vhuUnread() + " 封",
    ]),
    el("table", { class: "vhu-table vhu-mail-list" }, [
      el("thead", {}, [el("tr", {}, [
        el("th", {}, ["寄件人"]),
        el("th", {}, ["主旨"]),
        el("th", { class: "vhu-num" }, ["日期"]),
      ])]),
      el("tbody", {}, rows),
    ]),
    el("p", { class: "vhu-fine" }, ["只显示最近 50 封邮件。附件下载已于 2011 年停用。"]),
  ], "mail");
}

/* ---------- 公告 ---------- */

function viewVhuNotice() {
  const st = vhuSt();
  const one = st.notice ? VHU_NOTICES.find((n) => n.id === st.notice) : null;
  if (one) {
    return vhuShell([
      el("p", { class: "vhu-back" }, [
        webLink("« 返回公告", () => { st.notice = ""; draw(); }),
      ]),
      el("h2", { class: "vhu-h2" }, [one.title]),
      el("p", { class: "vhu-meta" }, [one.date + "　·　" + one.tag]),
      el("div", { class: "vhu-article" }, one.body.map((p) => el("p", {}, [p]))),
    ], "notice");
  }
  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["校园公告"]),
    el("table", { class: "vhu-table vhu-notice-list" }, [
      el("thead", {}, [el("tr", {}, [
        el("th", {}, ["日期"]),
        el("th", {}, ["类别"]),
        el("th", {}, ["标题"]),
      ])]),
      el("tbody", {}, VHU_NOTICES.map((n) => el("tr", {
        class: "vhu-mail-row",
        onclick: () => { st.notice = n.id; draw(); },
      }, [
        el("td", { class: "vhu-num" }, [n.date]),
        el("td", {}, [n.tag]),
        el("td", {}, [n.title]),
      ]))),
    ]),
  ], "notice");
}

/* ---------- 图鉴：给后面对线索用 ---------- */
/* 页面只做展示。线索要放进来时，在 VHU_MAILS／VHU_NOTICES 里加一条，
   或在 viewVhuProfile／viewVhuAcademic 里加一行，不要另起一套状态。 */
