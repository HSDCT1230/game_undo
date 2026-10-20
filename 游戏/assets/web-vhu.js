/* web-vhu.js — 维港大学校园入门网站（2014 年）+ 浏览器空白分页
   依赖 web-ui.js 的 el／goWeb／webLink／draw；load 在 web-ui.js 之后。 */

const VHU_HOST = "portal.vhu.edu.hk";

/* 两个账号。学校电邮＝学生编号小写加 @vhu.edu.hk——这条在两个账号上都成立，
   也正是章慧琪能从一个电邮地址推出学生编号的原因。
   两个人都毕业十年以上仍能登入，依据是公告「校友帐户政策更新」：校友帐户不会自动删除。
   密码都是学生编号，依据是登入页那行小字；两个人的「密码最后更改」都写着「从未更改」。 */
const VHU_USERS = {
  law: {
    id: "91024656E",
    pw: "91024656E",
    cn: "罗启明",
    en: "LAW Kai Ming (Kimon)",
    email: "91024656e@vhu.edu.hk",
    unit: "医学院",
    prog: "内外全科医学士（MBBS）",
    progShort: "内外全科医学士",
    span: "2000–2005",
    grad: "2005年6月",
    gradYear: "2005",
    hall: "海宁堂（2000–2003）",
    jupas: "大学联合招生办法（JUPAS）",
    addr: "香港湾仔（2005年登记）",
    created: "2000年8月21日",
    pwChanged: "从未更改",
    libCard: "已失效（2005年7月31日）",
    libFine: "HK$ 0.00",
    libHold: "0 项",
    lastLogin: "2005年6月28日 16:12",
    lastFrom: "校园网络，图书馆地下（10.12.4.87）",
    gpa: "3.25 / 4.0",
    homeNote: "2000–2005 成绩",
    hallNote: "2003 年迁出舍堂，与同学合租西环。",
    // 第 15 关她自己在后座的笔电上敲这一串。学生证照片上抄的学号，密码也试这一串。
    loginNote: ["vhu-law-in", "登入罗启明的校友帐户。学号 91024656E，密码也是学号——他从二〇〇〇年入学就没改过。"],
    borrow: [
      ["2003年2月18日", "格雷氏解剖学（第三十九版）", "2003年3月4日"],
      ["2003年10月21日", "内科学原理（第十五版）", "2003年11月18日"],
      ["2004年1月22日", "精神医学临床手册", "2004年2月6日"],
    ],
  },
  chen: {
    id: "01038472H",
    pw: "01038472H",
    cn: "陈家豪",
    en: "CHAN Ka Ho (Howard)",
    email: "01038472h@vhu.edu.hk",
    unit: "社会科学院",
    prog: "社会科学学士（社会学）",
    progShort: "社会学",
    span: "2001–2004",
    grad: "2004年6月",
    gradYear: "2004",
    hall: "海宁堂（2001–2004）",
    jupas: "大学联合招生办法（JUPAS）",
    addr: "香港深水埗（2004年登记）",
    created: "2001年8月20日",
    pwChanged: "从未更改",
    libCard: "已失效（2004年7月31日）",
    libFine: "HK$ 12.50",
    libHold: "0 项",
    lastLogin: "2004年7月2日 11:20",
    lastFrom: "校园网络，图书馆地下（10.12.4.87）",
    gpa: "2.98 / 4.0",
    homeNote: "2001–2004 成绩",
    borrow: [
      ["2002年10月3日", "社会统计学", "2002年10月31日"],
      ["2003年9月15日", "医疗与社会：香港的病房与家庭", "2003年10月20日"],
      ["2004年3月2日", "香港公共卫生概论", "2004年3月29日"],
    ],
    loginNote: ["vhu-chen-in", "登入陈家豪的校园帐户。学号 01038472H，密码就是学号——他十四年没改过。"],
  },
};

/* ---------- 站内资料 ---------- */

const VHU_NOTICES = [
  {
    id: "maint",
    date: "2014年7月25日",
    tag: "系统",
    title: "入门网站八月维护通告",
    body: [
      "资讯科技服务中心将于二〇一四年八月九日（星期六）凌晨零时至上午六时，为入门网站进行例行维护。",
      "维护期间，选科、成绩查阅、图书馆续借及电邮服务将会暂停。校园无线网络不受影响。",
      "如维护提早完成，服务会提前恢复，不另行通知。",
    ],
  },
  {
    id: "quota",
    date: "2014年7月8日",
    tag: "电邮",
    title: "学生电邮储存空间提升至 500MB",
    body: [
      "由七月十五日起，学生及校友电邮帐户的储存空间由 200MB 提升至 500MB。",
      "单个附件上限维持 20MB。如邮件超出配额，系统会退回寄件人，不会暂存。",
      "资讯科技服务中心",
    ],
  },
  {
    id: "alumni",
    date: "2014年6月18日",
    tag: "帐户",
    title: "校友帐户政策更新",
    body: [
      "由二〇一四年七月一日起，毕业同学的入门网站帐户会转为校友帐户。",
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
    date: "2014年7月18日 10:04",
    subject: "校友电子通讯（2014 年 7 月号）",
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
  // 2003 年非典型肺炎：医学院停临床见习，是那几年香港医学生共同的记忆。
  // 只是时代锚点，不是线索；不想要可以直接删掉这一条。
  {
    id: "sars03",
    from: "医学院院务处",
    addr: "medfac@vhu.edu.hk",
    date: "2003年4月2日 11:35",
    subject: "临床见习暂停（非典型肺炎）",
    body: [
      "因应本港非典型肺炎情况，医学院决定由四月三日起，暂停所有医院临床见习及面授课堂，直至另行通知。",
      "同学请留在家中，按学科网页公布的进度自修。临床技能评核与考试安排，容后公布。",
      "如有发烧或呼吸道症状，请勿回校，并即时求医。",
      "医学院院务处",
    ],
  },
  // 陈家豪当年回的一封。寄件地址就是学生编号——第 14 关的全部作用落在这一行。
  {
    id: "howard03",
    from: "陈家豪",
    addr: "01038472h@vhu.edu.hk",
    date: "2003年4月5日 22:14",
    subject: "唔该晒",
    gives: ["vhu-chen-id", "陈家豪的学号：01038472H。学校电邮就是学号，尾随一个 h。"],
    body: [
      "阿明：",
      "收到。唔该晒。",
      "我同阿 sir 讲咗，佢话呢啲内部通告好有用。你可唔可以再帮我攞多两份——医院点收症、病房点分，总之唔好有病人名。",
      "我唔会写出嚟系边度嚟。",
      "家豪",
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

/* ---------- 陈家豪的帐户 ---------- */

/* 他的信箱。三封收件（两封是罗寄的）＋一封没寄出的草稿。
   草稿是这一整条线的落点：他打了，删了，按了存档，没按寄出。 */
const CHEN_MAILS = [
  {
    id: "chen-alumni14",
    from: "校友事务处",
    addr: "alumni@vhu.edu.hk",
    date: "2014年7月18日 10:04",
    subject: "校友电子通讯（2014 年 7 月号）",
    unread: true,
    body: [
      "各位校友：",
      "今期内容：",
      "一、校友返校日将于十月十八日举行。社会科学院旧生茶聚同日在校园餐厅举行，座位有限，请于九月三十日前回覆。",
      "二、图书馆校友借书证申请办法已更新，年费维持三百元。",
      "三、大学发展基金二〇一三／一四年度报告，已上载校友事务处网页。",
      "如不欲接收本通讯，请于校友事务处网页更改设定。",
      "校友事务处",
      "维港大学",
    ],
  },
  {
    id: "chen-grad04",
    from: "教务处",
    addr: "reg@vhu.edu.hk",
    date: "2004年6月18日 09:05",
    subject: "毕业礼及成绩单领取安排",
    body: [
      "各位毕业同学：",
      "二〇〇四年度毕业礼将于十二月四日举行。学位袍借用手续请于十一月一日起到教务处办理，借用期三日。",
      "成绩单可于毕业礼后申请，费用全免，每人限取两份。",
      "毕业生请于七月三十一日前交还宿舍锁匙及借书证。",
      "教务处",
    ],
  },
  {
    id: "chen-sars03",
    from: "罗启明",
    addr: "91024656e@vhu.edu.hk",
    date: "2003年4月2日 19:48",
    subject: "转寄：临床见习暂停（非典型肺炎）",
    body: [
      "你上次话要医院内部嘅通告。呢个系今日下昼出嘅。",
      "见习停到另行通知为止。我而家每日留喺宿舍，冇嘢做。",
      "唔好周围传。系内部嘅。",
      "阿明",
      "",
      "---------- 转寄的邮件 ----------",
      "因应本港非典型肺炎情况，医学院决定由四月三日起，暂停所有医院临床见习及面授课堂，直至另行通知。",
      "同学请留在家中，按学科网页公布的进度自修。",
      "医学院院务处",
    ],
  },
  {
    id: "chen-stats02",
    from: "罗启明",
    addr: "91024656e@vhu.edu.hk",
    date: "2002年11月14日 23:51",
    subject: "问功课",
    body: [
      "你上次讲嗰个卡方检定，我照住做咗，p 值 0.03。阿 sir 问我点解拣呢个 test，我答唔出。",
      "你听日下昼喺唔喺自修室？我想问清楚先交。",
      "我买面。",
      "阿明",
    ],
  },
  {
    id: "chen-draft04",
    folder: "draft",
    from: "陈家豪",
    addr: "91024656e@vhu.edu.hk",
    date: "2004年6月30日 02:11",
    subject: "（无主旨）",
    gives: ["vhu-draft", "草稿箱里有一封没寄出的信，收件人是罗医生。写到洗衣房那日就停了。"],
    body: [
      "阿明：",
      "我毕业咗。今日去借袍，影相。摆低部机，自己行过去，行返转头。",
      "你仲有一年。宿舍个柜我清空咗，锁匙交还咗。",
      "",
      "洗衣房嗰日我讲咗三个字。你冇应。我当你听唔到，咁大家都好过。",
      "",
      "",
      "我搵到工。下个月开始返。",
      "得闲食饭——我知你会话唔使。",
      "",
    ],
  },
];

const CHEN_YEARS = [
  {
    year: "2001/02",
    label: "一年级",
    gpa: "2.86",
    rows: [
      ["SOC1101", "社会学导论", "6", "B"],
      ["SOC1102", "社会研究方法（一）", "4", "B+"],
      ["PSY1101", "心理学导论", "3", "B"],
      ["LAN1002", "学术英语（一）", "2", "C+"],
    ],
  },
  {
    year: "2002/03",
    label: "二年级",
    gpa: "3.02",
    rows: [
      ["SOC2103", "社会统计学", "6", "B+"],
      ["SOC2104", "社会理论（古典）", "4", "B"],
      ["SOC2105", "城市社会学", "3", "A-"],
      ["SOC2106", "社会研究方法（二）", "4", "B+"],
    ],
  },
  {
    year: "2003/04",
    label: "三年级",
    gpa: "3.08",
    rows: [
      ["SOC3105", "社会调查实习", "8", "A-"],
      ["SOC3106", "医疗与社会", "3", "B+"],
      ["SOC3107", "社会理论（当代）", "4", "B"],
      ["SOC3199", "毕业论文", "6", "B+"],
    ],
  },
];

/* ---------- 状态 ---------- */

function vhuSt() {
  if (!S.vhu || typeof S.vhu !== "object") S.vhu = {};
  const st = S.vhu;
  if (st.authed == null) st.authed = false;
  if (!st.read || typeof st.read !== "object") st.read = {};
  ["id", "pw", "err", "mail", "notice", "libq", "errUrl", "url", "who"].forEach((k) => {
    if (st[k] == null) st[k] = "";
  });
  return st;
}

/* 站内所有页面都从这里取「现在是谁的帐户」。
   没有登入时退回罗的账号，只为让配置字段有值，页面本身会先踢去登入页。 */
function vhuWho() {
  const st = vhuSt();
  return VHU_USERS[st.who] || VHU_USERS.law;
}

function vhuMails() {
  return vhuSt().who === "chen" ? CHEN_MAILS : VHU_MAILS;
}

function vhuYears() {
  return vhuSt().who === "chen" ? CHEN_YEARS : VHU_YEARS;
}

/* 换一台机器、换一个人：会话清掉，已读纪录留着（她读过就是读过）。 */
function vhuReset() {
  const st = vhuSt();
  st.authed = false;
  st.who = "";
  st.id = "";
  st.pw = "";
  st.err = "";
  st.need = false;
  st.out = false;
  st.mail = "";
  st.notice = "";
}

function vhuUnread() {
  const st = vhuSt();
  return vhuMails().filter((m) => m.unread && !st.read[m.id]).length;
}

function blankTabTitle() {
  // 人在别的分页时，分页标题也要显示这一页最后停在哪，而不是退回「新分页」。
  const mem = typeof tabMemory === "function" && S.tab !== "blank" ? tabMemory("blank") : null;
  const s = String((mem && mem.screen) || S.screen || "");
  if (s.indexOf("vhu-") === 0) return "VHU Portal - 维港大学";
  if (s === "engine") return "通搜　搜尋";
  if (s === "wiki") return "維港大學 - 維基百科";
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
  if (host === "tungso.hk" || host === "so.tungso.hk") {
    const m = n.match(/[?&]q=([^&]*)/);
    if (m) {
      try { S.engineQ = decodeURIComponent(m[1]); } catch (e) { S.engineQ = SE_HOME_Q; }
      S.seSearched = true;
    }
    goWeb("engine");
    return;
  }
  if (host === "zh.wikipedia.org" || host === "wikipedia.org") {
    goWeb("wiki");
    return;
  }
  if (host === "vhu.edu.hk" || host === VHU_HOST || host === "intranet.vhu.edu.hk") {
    goWeb(st.authed ? "vhu-home" : "vhu-login");
    return;
  }
  // 没有点、也不像网址：当年装了搜索栏的 IE 就这样，直接拿去找。
  if (n.indexOf(".") < 0) {
    S.engineQ = String(raw || "").trim();
    S.seSearched = true;
    goWeb("engine");
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
  const who = Object.keys(VHU_USERS).find((k) => VHU_USERS[k].id === id && VHU_USERS[k].pw === pw);
  if (who) {
    const u = VHU_USERS[who];
    st.authed = true;
    st.who = who;
    st.err = "";
    st.need = false;
    st.out = false;
    st.pw = "";
    if (u.loginNote && typeof note === "function") note(u.loginNote[0], u.loginNote[1]);
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
  st.who = "";
  st.mail = "";
  st.notice = "";
  goWeb("vhu-login", { replace: true });
}

/* 别人已经登入、没登出的机器：直接进去，不用密码。
   第 14 关诊室那台电脑就是这样——他不是忘了关，是根本没想过要关。 */
function vhuOpenAs(who, screen) {
  vhuReset();
  const st = vhuSt();
  st.who = VHU_USERS[who] ? who : "law";
  st.authed = true;
  st.need = false;
  st.out = false;
  browseFromScene(screen || "vhu-home");
}

/* 元信息之间的竖线：用一根真的细线画，不在字符串里塞「　│　」。
   2014 年的内联网站本来就用这种细竖线分栏，比空格拼出来的更像那时的东西。 */
function vhuSep() {
  return el("span", { class: "vhu-sep", "aria-hidden": "true" });
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

function vhuAccountHelp() {
  showPrompt(
    T("帐户查询", "帐户查询"),
    T(
      "校友帐户请电邮 alumni@vhu.edu.hk 联络校友事务处；学生帐户请到资讯科技服务中心。",
      "校友帐户请电邮 alumni@vhu.edu.hk 联系校友事务处；学生帐户请到信息技术服务中心。"
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
  const u = vhuWho();
  return el("div", { class: "vhu-subbar" }, [
    el("span", {}, ["学号 " + u.id]),
    el("span", {}, [u.cn]),
    el("span", {}, ["校友"]),
    el("span", { class: "vhu-sub-time" }, [(S.time || "").replace(/\s+\d{1,2}:\d{2}$/, "")]),
  ]);
}

function vhuFoot() {
  return el("div", { class: "vhu-foot" }, [
    el("p", { class: "vhu-foot-line" }, [
      el("span", {}, ["© 2014 维港大学"]),
      vhuSep(),
      el("span", {}, ["资讯科技服务中心"]),
      vhuSep(),
      el("span", {}, ["查询：itsc@vhu.edu.hk"]),
    ]),
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
      el("span", { class: "vhu-crumb-mark", "aria-hidden": "true" }, ["›"]),
      el("span", {}, [VHU_PAGE_LABEL[page] || ""]),
    ]));
  }
  kids.push(el("div", { class: "vhu-body" }, body));
  kids.push(vhuFoot());
  return el("div", { class: "hk-site vhu-site" }, kids);
}

/* ---------- 通搜：2014 年她用来找那间学校的搜索 ---------- */

/* 站名虚构，跟廿八屋、墙簿一套：2014 年的香港，本地入口站都长这个样子。
   搜索只有两条结果，第二条是维基——两个人名、一间学校，她要的是把校名换成一个能登入的网址。 */
const SE_SITE = { host: "www.tungso.hk", name: "通搜" };
const SE_HOME_Q = "維港大學";

const SE_RESULTS = [
  {
    id: "portal",
    title: "維港大學 — VHU Portal 校園入門網站",
    url: "portal.vhu.edu.hk",
    text: "選科、成績、圖書館、電郵，一個入口。學生編號為八位數字加一個英文字母；畢業同學的帳戶會轉為校友帳戶，不會自動刪除。",
    kind: "vhu",
  },
  {
    id: "wiki",
    title: "維港大學 - 維基百科，自由的百科全書",
    url: "zh.wikipedia.org › wiki › 維港大學",
    text: "維港大學（英語：Victoria Harbour University，縮寫 VHU）是一所位於香港的公立大學，一九六二年成立，設有文、理、社會科學、醫、工程五個學院。",
    kind: "wiki",
  },
];

function seQueryText() {
  return S.engineQ == null ? SE_HOME_Q : String(S.engineQ);
}

// 她只可能搜这一间。别的词进不来结果，也给一句「找不到」，不装作懂。
function seHit(q) {
  const s = String(q || "").toLowerCase();
  return s.indexOf("維港") >= 0 || s.indexOf("维港") >= 0 || s.indexOf("vhu") >= 0;
}

function seResultGo(kind) {
  if (kind === "wiki") {
    goWeb("wiki");
    return;
  }
  const st = vhuSt();
  if (st.authed) {
    vhuPage("home");
    return;
  }
  vhuReset();
  goWeb("vhu-login");
}

function viewSearchEngine() {
  const q = seQueryText();
  const searched = !!S.seSearched;
  const hit = seHit(q);

  const box = el("input", {
    id: "se-q",
    type: "text",
    class: "se-input",
    value: q,
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": "搜尋",
  });
  const submit = (e) => {
    if (e) e.preventDefault();
    const live = document.getElementById("se-q");
    S.engineQ = (live ? live.value : q) || "";
    S.seSearched = true;
    webAddrDraft = null;
    draw();
  };

  const rows = searched
    ? (hit
      ? [
        el("p", { class: "se-stat" }, ["約 1,240 個結果（0.18 秒）"]),
        el("ol", { class: "se-list" }, SE_RESULTS.map((r) => el("li", { class: "se-item" }, [
          el("div", { class: "se-title" }, [webLink(r.title, () => seResultGo(r.kind))]),
          el("div", { class: "se-url" }, [r.url]),
          el("p", { class: "se-snip" }, [r.text]),
        ]))),
        el("p", { class: "se-fine" }, ["通搜　香港　—　二〇一四年"]),
      ]
      : [
        el("p", { class: "se-stat" }, ["找不到符合的結果。"]),
        el("p", { class: "se-snip" }, ["建議：檢查有沒有打錯字，或改用更短的關鍵詞。"]),
        el("p", { class: "se-fine" }, ["通搜　香港　—　二〇一四年"]),
      ])
    : [
      el("ul", { class: "se-picks" }, [
        el("li", {}, ["熱門：", webLink("維港大學", () => {
          S.engineQ = SE_HOME_Q;
          S.seSearched = true;
          draw();
        })]),
        el("li", {}, ["熱門：", webLink("深水埗　重建", () => {
          S.engineQ = "深水埗 重建";
          S.seSearched = true;
          draw();
        })]),
      ]),
    ];

  return el("div", { class: "hk-site se-site" }, [
    el("div", { class: "se-head" }, [
      el("div", { class: "se-brand" }, [
        el("span", { class: "se-logo" }, ["通搜"]),
        el("small", {}, ["香港"]),
      ]),
      el("nav", { class: "se-nav" }, ["網頁", "圖片", "新聞", "地圖", "更多"].map((t, i) =>
        el("span", { class: i === 0 ? "on" : "" }, [t]))),
    ]),
    el("form", { class: "se-form", onsubmit: submit }, [
      box,
      el("button", { type: "submit", class: "se-btn" }, ["搜尋"]),
    ]),
    el("div", { class: "se-body" }, rows),
  ]);
}

/* ---------- 维基：维港大学条 ---------- */

/* 与现实不同：本港没有这一间。年份、学院、舍堂都要跟站内已经出现过的一致
   （海宁堂、医学院、社会科学院、二〇〇四年十一月）。事故那一段只在黑料到手后才出现，
   免得玩家在第一章就先把第三章的事读掉。 */
const WIKI_VHU = {
  title: "維港大學",
  lead: "維港大學（英語：Victoria Harbour University，縮寫 VHU）是一所位於香港香港島西部的公立大學，一九六二年由香港政府創辦，一九七〇年獲准頒授學位並正名為大學。校訓為「求真」，全校設五個學院、十三間舍堂，學生約一萬四千人。",
  info: [
    ["校訓", "求真"],
    ["創辦", "一九六二年"],
    ["學校類型", "公立"],
    ["校長", "馬仲衡"],
    ["學生人數", "約 14,000"],
    ["校址", "香港島西區"],
    ["校園", "約 11 公頃"],
  ],
  sections: [
    ["歷史", [
      "一九六二年，政府在西區撥出一幅官地，開辦維港夜間學院，首年借用一所官立中學的課室上課，取錄學生一百八十人。",
      "一九七〇年，學院獲准頒授學位，改名維港大學，並於原址以北的山坡興建主校舍。一九八五年增設醫學院，一九九三年增設工程學院。",
    ]],
    ["學院與學系", [
      "大學設文學院、理學院、社會科學院、醫學院及工程學院。醫學院下設臨床醫學、公共衞生及護理三個學系，另設教學醫院。",
      "社會科學院以社會學系及社會工作學系歷史最久，早年為本地社會服務機構培訓前線人員。",
    ]],
    ["校園與舍堂", [
      "主校舍依山而建，由山下入口至山頂圖書館共七層，校內以樓梯及升降機連接。",
      "十三間舍堂分佈於校園南北兩翼，其中海寧堂、觀海堂及思源堂歷史最久。舍堂設導師制度，一年級學生一般須住宿一年。",
    ]],
    ["校友", [
      "校友約六萬人，分佈於醫療、教育、社會服務及工商界。校友事務處每年十月舉辦返校日。",
    ]],
  ],
  // 只有在她已经拿到黑料之后才写出来。
  incident: [
    "二〇〇四年十一月，一名醫學院女生被發現倒臥於主校舍東翼平台，送院後不治。校方其後加高東翼天台圍欄，並收緊夜間開放時間。",
  ],
};

function viewWiki() {
  const show = (id) => typeof noted === "function" && noted(id);
  const body = [];
  body.push(el("div", { class: "wk-crumb" }, ["維基百科，自由的百科全書"]));
  body.push(el("h1", { class: "wk-title" }, [WIKI_VHU.title]));
  body.push(el("div", { class: "wk-warn" }, ["本條目沒有列出任何參考或來源。（2014年8月）"]));
  body.push(el("table", { class: "wk-info" }, [
    el("caption", {}, ["維港大學"]),
    el("tbody", {}, WIKI_VHU.info.map(([k, v]) => el("tr", {}, [
      el("th", {}, [k]),
      el("td", {}, [v]),
    ]))),
  ]));
  body.push(el("p", { class: "wk-lead" }, [WIKI_VHU.lead]));
  WIKI_VHU.sections.forEach(([h, paras]) => {
    body.push(el("h2", { class: "wk-h2" }, [h]));
    paras.forEach((p) => body.push(el("p", {}, [p])));
  });
  if (show("dirt") || show("vhu-school")) {
    body.push(el("h2", { class: "wk-h2" }, ["校園事故"]));
    WIKI_VHU.incident.forEach((p) => body.push(el("p", {}, [p])));
  }
  body.push(el("p", { class: "wk-fine" }, [
    "本頁最後修訂於 2014年8月30日 (星期六) 14:07。",
  ]));

  return el("div", { class: "hk-site wk-site" }, [
    el("div", { class: "wk-head" }, [
      el("span", { class: "wk-mark" }, ["W"]),
      el("span", { class: "wk-word" }, ["維基百科"]),
      el("small", {}, ["自由的百科全書"]),
    ]),
    el("div", { class: "wk-cols" }, [
      el("aside", { class: "wk-side" }, [
        el("h3", {}, ["導覽"]),
        el("ul", {}, ["首頁", "分類", "特色條目", "最近更改", "隨機條目"].map((t) =>
          el("li", {}, [el("span", { class: "wk-dead" }, [t])]))),
        el("h3", {}, ["工具"]),
        el("ul", {}, ["連結至此的頁面", "相關變更", "可列印版"].map((t) =>
          el("li", {}, [el("span", { class: "wk-dead" }, [t])]))),
      ]),
      el("article", { class: "wk-article" }, body),
    ]),
    el("div", { class: "wk-foot" }, ["文字內容可依 CC BY-SA 3.0 條款使用。"]),
  ]);
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
          el("li", {}, [webLink("廿八屋（香港租盘）", () => goWeb("home"))]),
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
      el("p", { class: "vhu-fine vhu-ie-foot" }, [
        el("span", {}, ["找不到伺服器或 DNS 错误"]),
        el("span", { class: "vhu-ie-brand" }, ["Internet Explorer"]),
      ]),
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
    el("label", { for: "vhu-id" }, ["学生编号（Student ID）"]),
    idIn,
    el("label", { for: "vhu-pw" }, ["密码（Password）"]),
    pwIn,
    el("button", { type: "submit", class: "vhu-btn vhu-login-btn" }, ["登入"]),
    el("p", { class: "vhu-fine" }, ["登入后请即时更改密码。"]),
    el("p", { class: "vhu-login-links" }, [
      webLink("忘记密码", vhuForgot),
      vhuSep(),
      webLink("帐户查询", vhuAccountHelp),
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
          el("li", {}, ["帐户密码沿用入学时的设定，可于登入后自行更改。"]),
          el("li", {}, ["服务时间：每日 07:00–23:00。"]),
          el("li", {}, ["毕业同学的帐户会转为校友帐户。"]),
        ]),
      ]),
      form,
    ]),
    el("div", { class: "vhu-login-foot" }, [
      el("h3", {}, ["系统讯息"]),
      el("ul", {}, VHU_NOTICES.slice(0, 2).map((n) =>
        // 日子与标题各占一格，靠 li 的 gap 分开，不用全角空格当分隔
        el("li", {}, [
          el("span", { class: "vhu-date" }, [n.date]),
          el("span", { class: "vhu-date-title" }, [n.title]),
        ])
      )),
    ]),
  ], "login");
}

function vhuAlreadyIn() {
  const u = vhuWho();
  return vhuShell([
    el("div", { class: "vhu-panel" }, [
      el("h2", { class: "vhu-h2" }, ["你已登入"]),
      el("p", {}, [u.cn + "（" + u.id + "）"]),
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
  const u = vhuWho();
  const unread = vhuUnread();
  const kv = el("table", { class: "vhu-kv" }, [
    ["学生编号", u.id],
    ["帐户类别", "校友（Alumni）"],
    ["学籍", "已毕业（" + u.gradYear + "）"],
    ["上次登入", u.lastLogin],
    ["登入位置", u.lastFrom],
    ["未读邮件", unread ? String(unread) + " 封" : "0 封"],
  ].map(([k, v]) => el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])])));

  const news = el("ul", { class: "vhu-list" }, VHU_NOTICES.slice(0, 3).map((n) =>
    el("li", {}, [
      el("span", { class: "vhu-date" }, [n.date]),
      el("button", {
        type: "button",
        class: "vhu-link-btn",
        onclick: () => { goWeb("vhu-notice", { noticeId: n.id }); },
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
    el("h2", { class: "vhu-h2" }, ["欢迎回来，" + u.cn]),
    el("p", { class: "vhu-lead vhu-meta-line" }, [
      el("span", {}, [u.en]),
      vhuSep(),
      el("span", {}, [u.unit]),
      vhuSep(),
      el("span", {}, [u.progShort]),
    ]),
    el("div", { class: "vhu-alert" }, [
      "你的帐户为校友帐户。选科、eLearn 及宿舍服务已停用，学业纪录及电邮仍可查阅。",
    ]),
    st.who === "chen"
      ? el("div", { class: "vhu-alert" }, [
        "本帐户已连续两年以上没有登入，电邮转寄服务已暂停。期间收到的邮件仍保存在信箱内。",
      ])
      : "",
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
      tile("个人资料", "姓名、学号、舍堂", "profile"),
      tile("学业纪录", u.homeNote, "academic"),
      tile("图书馆", "目录、借阅纪录", "library"),
      tile("电邮", unread ? unread + " 封未读" : "没有未读邮件", "mail"),
      tile("成绩单申请", "须亲临教务处办理", "", true),
      tile("eLearn", "校友帐户不适用", "", true),
    ]),
  ], "home");
}

/* ---------- 我的资料 ---------- */

function viewVhuProfile() {
  const u = vhuWho();
  const rows = [
    ["中文姓名", u.cn],
    ["英文姓名", u.en],
    ["学生编号", u.id],
    ["学院", u.unit],
    ["课程", u.prog],
    ["修业年期", u.span],
    ["学籍状况", "毕业（" + u.grad + "）"],
    ["入学途径", u.jupas],
    ["舍堂", u.hall],
    ...(u.hallNote ? [["舍堂（其后）", u.hallNote]] : []),
    ["校园电邮", u.email],
    ["通讯地址", u.addr],
    ["帐户建立", u.created],
    ["密码最后更改", u.pwChanged],
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
    el("p", { class: "vhu-fine" }, ["资料摘录自学生纪录系统，最后更新：" + u.grad + "。" ]),
  ], "profile");
}

/* ---------- 学业纪录 ---------- */

function viewVhuAcademic() {
  const u = vhuWho();
  const blocks = vhuYears().map((y) => el("section", { class: "vhu-year" }, [
    el("h3", {}, [
      // 学年与年级各占一格：h3 是 flex，gap 就是那道空，不用全角空格撑
      el("span", { class: "vhu-year-no" }, [y.year]),
      el("span", {}, [y.label]),
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
      el("span", {}, ["课程：" + u.prog]),
      el("span", {}, ["总平均积点：" + u.gpa]),
      el("span", {}, ["毕业资格：" + u.grad]),
    ]),
    ...blocks,
    el("p", { class: "vhu-fine" }, [
      "本纪录为 " + u.gradYear + " 年 7 月存档版本，仅供查阅。正式成绩单请向教务处申请。",
    ]),
  ], "academic");
}

/* ---------- 图书馆 ---------- */

function viewVhuLibrary() {
  const st = vhuSt();
  const u = vhuWho();
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
      ["借书证号码", u.id],
      ["借书证状态", u.libCard],
      ["未缴罚款", u.libFine],
      ["预约", u.libHold],
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
      el("tbody", {}, (u.borrow || []).map((r) => el("tr", {}, [
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
  const u = vhuWho();
  const list = vhuMails();
  const mail = st.mail ? list.find((m) => m.id === st.mail) : null;
  if (mail) {
    if (mail.gives && typeof note === "function") note(mail.gives[0], mail.gives[1]);
    const draft = mail.folder === "draft";
    const head = draft
      ? [
        ["收件人", mail.addr + "（未寄出）"],
        ["日期", mail.date + "（最后修改）"],
        ["主旨", mail.subject],
      ]
      : [
        // 电邮抬头照 RFC 的写法：名字半角空格接尖括号地址，不用全角空格
        ["寄件人", mail.from + " <" + mail.addr + ">"],
        ["收件人", u.email],
        ["日期", mail.date],
        ["主旨", mail.subject],
      ];
    return vhuShell([
      el("p", { class: "vhu-back" }, [
        webLink("« 返回信箱", () => { goWeb("vhu-mail", { mailId: "" }); }),
      ]),
      draft ? el("p", { class: "vhu-draft-mark" }, ["草稿 — 未寄出"]) : "",
      el("h2", { class: "vhu-h2" }, [mail.subject]),
      el("table", { class: "vhu-kv vhu-kv-wide vhu-mail-head" }, head.map(([k, v]) =>
        el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])]))),
      el("div", { class: "vhu-mail-body" + (draft ? " vhu-mail-draft" : "") },
        mail.body.map((p) => el("p", {}, [p]))),
      el("p", { class: "vhu-fine" }, [
        draft
          ? "这封邮件没有寄出。收件人从未收到。"
          : "此为存档邮件，附件下载已于 2011 年停用。",
      ]),
    ], "mail");
  }
  const row = (m) => {
    const read = !!st.read[m.id];
    const draft = m.folder === "draft";
    return el("tr", {
      class: (m.unread && !read ? "vhu-unread" : "") + " vhu-mail-row",
      onclick: () => { st.read[m.id] = true; goWeb("vhu-mail", { mailId: m.id }); },
    }, [
      el("td", {}, [draft ? m.addr : m.from]),
      el("td", {}, [m.unread && !read ? el("b", {}, ["● "]) : "", m.subject]),
      el("td", { class: "vhu-num" }, [m.date]),
    ]);
  };
  const box = list.filter((m) => m.folder !== "draft");
  const drafts = list.filter((m) => m.folder === "draft");
  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["电邮"]),
    el("p", { class: "vhu-lead vhu-meta-line" }, [
      el("span", { class: "vhu-mono" }, [u.email]),
      vhuSep(),
      el("span", {}, ["容量 500MB"]),
      vhuSep(),
      el("span", {}, ["未读 " + vhuUnread() + " 封"]),
    ]),
    el("table", { class: "vhu-table vhu-mail-list" }, [
      el("thead", {}, [el("tr", {}, [
        el("th", {}, ["寄件人"]),
        el("th", {}, ["主旨"]),
        el("th", { class: "vhu-num" }, ["日期"]),
      ])]),
      el("tbody", {}, box.map(row)),
    ]),
    drafts.length
      ? el("div", {}, [
        el("h3", { class: "vhu-h3" }, ["草稿"]),
        el("table", { class: "vhu-table vhu-mail-list" }, [
          el("thead", {}, [el("tr", {}, [
            el("th", {}, ["收件人"]),
            el("th", {}, ["主旨"]),
            el("th", { class: "vhu-num" }, ["日期"]),
          ])]),
          el("tbody", {}, drafts.map(row)),
        ]),
      ])
      : "",
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
        webLink("« 返回公告", () => { goWeb("vhu-notice", { noticeId: "" }); }),
      ]),
      el("h2", { class: "vhu-h2" }, [one.title]),
      el("p", { class: "vhu-meta vhu-meta-line" }, [
        el("span", {}, [one.date]),
        vhuSep(),
        el("span", {}, [one.tag]),
      ]),
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
        onclick: () => { goWeb("vhu-notice", { noticeId: n.id }); },
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
