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
    // 这一行可抄：他停下来的那个月，正好是毕业那个月。
    loginTake: {
      id: "vhu-last-login", who: "luo",
      text: "罗启明的校友帐户，最后一次登入是二〇〇五年六月二十八日。毕业那个月之后，他没有再进来。",
    },
    // 从上次登入到这一次（2014年9月5日 23:41）隔了多久。写成汉字，不写「3286 天」——
    // 她看一眼就知道这个号空了多久，不需要算。
    lastGap: "九年二个月",
    lastFrom: "校园网络，图书馆地下（10.12.4.87）",
    gpa: "3.25 / 4.0",
    homeNote: "2000–2005 成绩",
    hallNote: "2003 年迁出舍堂，与同学合租西环。",
    // 第 15 关她自己在后座的笔电上敲这一串。学生证照片上抄的学号，密码也试这一串。
    loginNote: ["vhu-law-in", "登入罗启明的校友帐户。学号 91024656E，密码也是学号——他从二〇〇〇年入学就没改过。"],
    // 十多年没人登入的户口，光有密码不算数：还要答一条开户时登记的问题。
    // 答案只写在维基百科那条目里（第一段与资料框都写着），这一条就是逼人去读它。
    verify: {
      q: "校训是什么？",
      a: ["求真"],
      tip: "答案在维基百科「维港大学」条目第一段，右上角资料框也写着。",
    },
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
    lastGap: "十年二个月",
    lastFrom: "校园网络，图书馆地下（10.12.4.87）",
    gpa: "2.98 / 4.0",
    homeNote: "2001–2004 成绩",
    borrow: [
      ["2002年10月3日", "社会统计学", "2002年10月31日"],
      ["2003年9月15日", "医疗与社会：香港的病房与家庭", "2003年10月20日"],
      ["2004年3月2日", "香港公共卫生概论", "2004年3月29日"],
    ],
    loginNote: ["vhu-chen-in", "登入陈家豪的校园帐户。学号 01038472H，密码就是学号——他十三年没改过。"],
    // 他那条问题问的是学生术语，答案在条目「传统与术语」那一段的最后：
    // 「上山」是去图书馆，「下山」是去码头坐车。读到那一段才答得出。
    verify: {
      q: "「下山」是指？",
      a: ["去码头坐车", "码头坐车"],
      tip: "答案在维基百科「维港大学」条目「传统与术语」一段，跟「上山」写在同一行。",
    },
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
      "校友帐户保留：校园电邮、学业纪录查阅、图书馆目录查询及个人历史借阅纪录。",
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

/* 存档通告：只放在列表最底，不贴在首页，也不进登入页那两条「系统讯息」。
   二〇〇四年十一月那一条是这一整条线的背景：学校当时怎么处理，一个字的名字都不写。
   版面理由用《资料保留政策》——保留十年，所以二〇一四年九月它还在这里，下个月就没了。 */
const VHU_NOTICES_OLD = [
  {
    id: "grief04",
    date: "2004年11月11日",
    tag: "辅导",
    title: "辅导及发展中心延长开放时间",
    body: [
      "本校一名同学于本周离世。辅导及发展中心由今日起延长开放时间：星期一至五上午九时至晚上十时，星期六上午十时至下午六时。",
      "同学如需要，可于办公时间到中心预约，亦可经所属学系或舍堂导师转介。所有谈话内容保密。",
      "中心同时呼吁同学留意身边的人。如察觉同学持续失眠、缺课、不愿与人接触，或反复说同一件事，可通知学系或舍堂导师。",
      "辅导及发展中心",
    ],
    // 名单里最不能漏的一条：它不写名字，只写「一名同学」。读过成绩表那一格的人
    // 会自己去对日子。从前这条只是列表最底的一行灰字，现在可以抄下来（10-28）。
    clue: {
      id: "vhu-grief04", who: "luo",
      text: "二〇〇四年十一月十一日，辅导中心延长开放时间。通告说「本校一名同学于本周离世」，没有名字。",
    },
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
  // 二〇〇四年十一月十日，教务处还在通知考试日期。没有一句提到有人死了。
  // 这一封的作用不是线索，是那一周的空气：世界照常运转，只有她那边停了。
  {
    id: "exam04",
    from: "教务处",
    addr: "reg@vhu.edu.hk",
    date: "2004年11月10日 08:30",
    subject: "二〇〇四／〇五年度上学期考试安排",
    gives: ["vhu-exam04", "二〇〇四年十一月十日，教务处仍在通知考试日期。学校照原定日子办。"],
    body: [
      "各位同学：",
      "上学期考试将按原定日期于十二月六日开始，考试时间表于十一月二十二日上载教务处网页。",
      "同学如因病或其他理由申请特别安排，须于考试前七个工作天提交证明文件。逾期申请不获受理。",
      "试场安排以教务处网页公布为准，不再个别通知。",
      "教务处",
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
];

/* 逾期日数不写死。这一册一直在逾期，日子该跟着游戏钟走：
   写死一个「3,579 日」，她九月三日打开、九月九日再打开，都是同一个数——
   越精确反而越露馅。日期本身才是线索，天数只是系统顺手算的。 */
function bookOverDays(due) {
  const m = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(String(due || ""));
  if (!m) return "";
  const from = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = typeof clockDate === "function" ? clockDate() : new Date(2014, 8, 7);
  const days = Math.floor((now - from) / 86400000);
  if (!(days > 0)) return "";
  return String(days).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " 日";
}

/* 目录里每一条都能点开看馆藏状态。第三本那一册是第 15 关的钩子：
   二〇〇四年十一月五日借出，应还十一月十九日，一直没回来。
   目录从不显示借阅人——现实如此，这里也不破例：只给日期，不给名字。
   五天前是那一天她被告知暂缓独立值班（11-05），三天后她死（11-08）。
   看书的人自己把两个日子对上去，系统一个字都没说。 */
const VHU_BOOKS = [
  { title: "格雷氏解剖学（第三十九版）", author: "Williams, P. L.", year: "1999", call: "QM 23.2 W72", state: "可借", shelf: "医学院分馆　楼座 QM" },
  { title: "内科学原理（第十五版）", author: "Braunwald, E. 等", year: "2001", call: "RC 46 H32", state: "可借", shelf: "医学院分馆　楼座 RC" },
  {
    title: "精神医学临床手册", author: "维港大学医学院精神科", year: "2003", call: "RC 456 V52", state: "已借出",
    shelf: "医学院分馆　楼座 RC",
    loan: {
      out: "2004年11月5日",
      due: "2004年11月19日",
      note: "自二〇〇五年三月起列为长期逾期，暂缓催还。",
    },
  },
  { title: "香港公共卫生概论", author: "医学院公共卫生学系", year: "2000", call: "RA 541.H6 V52", state: "可借", shelf: "医学院分馆　楼座 RA" },
  { title: "医学统计入门", author: "医学院医学教育组", year: "1999", call: "RA 409 V52", state: "可借", shelf: "总馆　三楼 RA" },
  { title: "临床沟通技巧", author: "医学院医学教育组", year: "2002", call: "R 727.3 V52", state: "可借", shelf: "医学院分馆　楼座 R" },
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
      // 整张表唯一一处不是「合格」的地方。二〇〇四年十一月十五日他不在。
      // 不写为什么、不写后来补上没有——读过二〇〇四年那条辅导通告的人自己会算。
      ["MED5103", "临床实习（精神科）", "6", "缺考"],
      ["MED5104", "急症医学", "3", "合格"],
      ["MED5105", "毕业专题", "4", "B+"],
    ],
    note: "MED5103 缺考记录：2004年11月15日。补考安排另行通知。",
    // 这一格是全站最该被抄下来的一处：它跟 11-05 借书、11-08 东翼平台、
    // 11-11 辅导中心延长，四个日子串成一条。从前它只是红字，看过就没了（10-28）。
    clue: {
      id: "vhu-miss04", who: "luo",
      text: "二〇〇四年十一月十五日，精神科临床实习缺考。整个五年级只有这一格不是「合格」。",
    },
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

/* 他的寄件备份。里面那封「唔该晒」就是罗信箱里那一封——同一封信的另一头，
   正文一个字都没有另写，只是抬头从「寄件人陈家豪」换成「收件人 91024656e@vhu.edu.hk」。
   这一条是「没捡到钱夹」那条路的第二步：她已经从毕业照上有了家豪的学号，
   登进来，看寄件备份，收件地址就是阿明的学号。 */
const CHEN_SENT = [
  Object.assign({}, VHU_MAILS.find((m) => m.id === "howard03"), {
    // 换个 id：已读纪录是按 id 记的，跟罗信箱里那一封分开，不然在那边读过这边就变灰。
    id: "chen-sent01",
    folder: "sent",
    to: "91024656e@vhu.edu.hk",
    unread: false,
    gives: ["vhu-law-id", "寄件备份的收件地址：91024656E@vhu.edu.hk。阿明的学号——学校电邮就是学号。"],
  }),
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
  ["id", "pw", "err", "mail", "notice", "libq", "errUrl", "url", "who", "book", "chal", "ans"].forEach((k) => {
    if (st[k] == null) st[k] = "";
  });
  // chal：密码已对、等人答问题的那个户口（""＝不在验证这一步）。tries：答错几次。
  if (st.tries == null) st.tries = 0;
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

// 寄件备份只有家豪那个帐户有。罗那边不给：他自己寄出去的信跟她要找的东西无关，
// 多一列只会让人以为漏了什么。
function vhuSent() {
  return vhuSt().who === "chen" ? CHEN_SENT : [];
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
  st.book = "";
  st.chal = "";
  st.ans = "";
  st.tries = 0;
}

function vhuUnread() {
  const st = vhuSt();
  return vhuMails().filter((m) => m.unread && !st.read[m.id]).length;
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
    // 名字空间写在标题里：她若真的照地址栏再打一遍 Category:…，落到的该是分类页。
    goWeb(/Category:/i.test(n) ? "wiki-cat" : "wiki");
    return;
  }
  if (host === "news.hkdaily.com.hk" || host === "hkdaily.com.hk") {
    goWeb("hknews");
    return;
  }
  // 三部机器三个门口，别混：portal 是学生登入的那部，www 是对外那部，
  // www 底下的 /press/ 是更旧的一层存档。从前 host 一条判断全收，
  // 打 www.vhu.edu.hk 会直接落到登入页——等于把答案递到手里。
  if (host === VHU_HOST || host === "intranet.vhu.edu.hk") {
    goWeb(st.authed ? "vhu-home" : "vhu-login");
    return;
  }
  // 新闻稿的存档在对外那一头（www.vhu.edu.hk/press/…）：没登入也读得到。
  if (host === "vhu.edu.hk" && n.slice(host.length + 1).indexOf("press/") === 0) {
    const slug = n.replace(/^[^/]+\/press\//, "").replace(/\.html?$/, "");
    const hit = Object.keys(WIKI_NEWS).find((k) => WIKI_NEWS[k].slug === slug);
    goWeb("wiki-news", { wikiNews: hit || "" });
    return;
  }
  // 对外那一头：维基资料框里「网站 www.vhu.edu.hk」指的就是这一页。
  // 内页也照路径认——她自己把地址抄下来再打一遍的时候（没有人会把地址栏的
  // /about/ 删掉再打），落回首页就等于告诉她「这里只有一页」，那才是露馅。
  if (host === "vhu.edu.hk") {
    const path = n.slice(host.length + 1).replace(/\/+$/, "");
    const mNews = path.match(/^news\/2014\/([A-Za-z0-9]+)$/);
    if (mNews && VHU_SITE_STORIES[mNews[1]]) {
      goWeb("vhusite-story", { siteArg: mNews[1] });
      return;
    }
    const mEv = path.match(/^events\/2014\/([A-Za-z0-9]+)$/);
    if (mEv && VHU_SITE_EVENTPAGES[mEv[1]]) {
      goWeb("vhusite-event", { siteArg: mEv[1] });
      return;
    }
    if (VHU_SITE_PAGES[path]) {
      goWeb("vhusite-page", { siteArg: path });
      return;
    }
    goWeb("vhusite");
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

/* 学号是剧情递到手里的东西：日记簿里还没有那一行，密码打对了也进不去。
   不然重玩的玩家可以在八月一日就登进九月才该看见的信箱——日记簿会跟着穿帮
   （「八月一日　登入陈家豪的校园帐户」）。 */
const VHU_KNOWN = {
  law: () => noted("vhu-id") || noted("vhu-law-id"),
  chen: () => noted("vhu-chen-id"),
};

/* 答案比对：不认繁简、不认空格与句读。她是从屏幕上把那一行抄下来的，
   抄的时候会多打一个句号、把逗号省掉、把「碼」打成「码」。 */
function vhuAnsNorm(s) {
  let t = String(s == null ? "" : s);
  t = t.replace(/[\s\u3000]/g, "");
  t = t.replace(/[「」『』（）()《》〈〉【】，。、；：？！,.;:?!"'‘’“”·…—–\-~～]/g, "");
  return typeof toHkTrad === "function" ? toHkTrad(t) : t;
}

/* 对得上就算答对：只认整句相同——「求真务实」不是「求真」，
   「校训是求真」也不算。宁可让她重打一次，也不要放过一个错答案。 */
function vhuAnsOk(input, list) {
  const got = vhuAnsNorm(input);
  if (!got) return false;
  return (list || []).some((x) => vhuAnsNorm(x) === got);
}

function vhuLogin() {
  const st = vhuSt();
  // 一动手登入，「你已登出」那句就过期了；再跟错误讯息叠在一起，会像两件事同时发生。
  st.out = false;
  const id = String(st.id || "").trim().toUpperCase();
  const pw = String(st.pw || "").trim().toUpperCase();
  if (!id || !pw) {
    st.err = "请输入学生编号及密码";
    draw();
    return;
  }
  const who = Object.keys(VHU_USERS).find((k) => VHU_USERS[k].id === id && VHU_USERS[k].pw === pw);
  const known = who && VHU_KNOWN[who];
  // 密码不对就直接说不对，不进验证那一格：先问问题，等于告诉人家「这个编号是有的」。
  if (!who || (known && !known())) {
    st.chal = "";
    st.ans = "";
    st.tries = 0;
    st.err = "学生编号或密码不正确，请再试一次";
    draw();
    return;
  }
  // 密码对：十三年没人碰过的户口，光有密码不算数，还要问一条开户时自己填的问题。
  st.chal = who;
  st.ans = "";
  st.tries = 0;
  st.err = "";
  st.pw = "";
  draw();
}

/* 验证那一格：答对了才算登入。答错只叫重试；
   错两次之后才说「答案在条目哪一段」——那一条目本来就是这一关要读的东西。 */
function vhuVerify() {
  const st = vhuSt();
  const u = VHU_USERS[st.chal];
  if (!u || !u.verify) {
    st.chal = "";
    st.ans = "";
    st.err = "";
    draw();
    return;
  }
  if (!String(st.ans || "").trim()) {
    st.err = "请填写答案";
    draw();
    return;
  }
  if (vhuAnsOk(st.ans, u.verify.a)) {
    st.authed = true;
    st.who = st.chal;
    st.chal = "";
    st.ans = "";
    st.tries = 0;
    st.err = "";
    st.need = false;
    st.out = false;
    if (u.loginNote && typeof note === "function") note(u.loginNote[0], u.loginNote[1]);
    goWeb("vhu-home", { replace: true });
    return;
  }
  st.tries = (Number(st.tries) || 0) + 1;
  st.err = "答案不正确，请再试一次";
  if (st.tries >= 2 && u.verify.tip) st.err += "（提示：" + u.verify.tip + "）";
  draw();
}

/* 从验证那一格退回登入：编号留着，密码要重新打一次。 */
function vhuChalBack() {
  const st = vhuSt();
  st.chal = "";
  st.ans = "";
  st.tries = 0;
  st.err = "";
  draw();
}

/* 登出：会话清掉，编号留着（下一回同一部机器还会替她填上），密码一定要清——
   真的登入页从来不会替你把密码填回去。 */
function vhuLogout() {
  const st = vhuSt();
  st.authed = false;
  st.out = true;
  st.need = false;
  st.who = "";
  st.pw = "";
  st.err = "";
  st.chal = "";
  st.ans = "";
  st.tries = 0;
  st.mail = "";
  st.notice = "";
  goWeb("vhu-login", { replace: true });
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
      "请带同学生证，于办公时间到资讯科技服务中心办理",
      "请携带学生证，于办公时间到信息技术服务中心办理"
    )
  );
}

function vhuAccountHelp() {
  showPrompt(
    T("帐户查询", "帐户查询"),
    T(
      "校友帐户请电邮 alumni@vhu.edu.hk 联络校友事务处；学生帐户请到资讯科技服务中心",
      "校友帐户请电邮 alumni@vhu.edu.hk 联系校友事务处；学生帐户请到信息技术服务中心"
    )
  );
}

/* ---------- 外壳 ---------- */

const VHU_PAGE_LABEL = {
  home: "首页",
  profile: "我的资料",
  academic: "学业纪录",
  library: "图书馆",
  book: "馆藏纪录",
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

function vhuShell(body, page, crumb) {
  const st = vhuSt();
  const kids = [vhuHead()];
  if (st.authed) {
    kids.push(vhuNav(page), vhuSubbar());
    kids.push(el("div", { class: "vhu-crumb" }, [
      webLink("首页", () => vhuPage("home")),
      el("span", { class: "vhu-crumb-mark", "aria-hidden": "true" }, ["›"]),
      // 馆藏纪录挂在图书馆下面：左边导航还亮「图书馆」，面包屑写它自己那一层。
      el("span", {}, [crumb || VHU_PAGE_LABEL[page] || ""]),
    ]));
  }
  kids.push(el("div", { class: "vhu-body" }, body));
  kids.push(vhuFoot());
  return el("div", { class: "hk-site vhu-site" }, kids);
}

/* ---------- 抄下来：网页上唯一一个会进簿子的动作 ---------- */

/* 只给「这一行和别处对得上」的地方用——一个日子、一个名字、一个编号。
   世界照常运转的那些（非典停见习、校友通讯、考试通告）一律不给：
   簿子不是网页副本，抄满一页就没人翻（10-28）。
   要抄的对象就是那一行字本身：它带一条虚下划线，点一下就进簿子。
   点了就地变灰，不重绘页面——成绩表很长，重绘会把她甩回顶部。
   字不加后缀：抄过的行跟没抄过的行只差「虚线收掉、颜色退成旁注」，
   加一句「（抄下了）」等于在正文里塞功能提示，而正文不点头（10-28）。 */
function vhuTake(spec, label) {
  const on = typeof noted === "function" && noted(spec.id);
  const b = el("button", {
    type: "button",
    class: "vhu-take" + (on ? " on" : ""),
    disabled: on,
  }, [label]);
  if (on) return b;
  b.onclick = (e) => {
    if (e) e.stopPropagation();
    if (!notedRow(spec.id, spec.text, spec.who)) return;
    b.disabled = true;
    b.className = "vhu-take on";
    if (typeof sfx === "function") sfx("paper");
    if (typeof tip === "function") tip("抄进簿子了。", { nearBar: true });
    if (typeof renderNotes === "function") renderNotes();
  };
  return b;
}

/* ---------- 通搜：2014 年她用来找那间学校的搜索 ---------- */

/* 站名虚构，跟廿八屋、墙簿一套：2014 年的香港，本地入口站都长这个样子。
   头两条：一条维基、一条当月新闻。她搜的是校名——头一条给她年份与校训，
   第二条给她「有个校园入门网站」这件事；两条都不直接给那个登入页。
   从前第二条是门户登入页本身，等于把答案摆在搜索结果第二行，那一关就只剩打字了。 */
const SE_SITE = { host: "www.tungso.hk", name: "通搜" };
const SE_HOME_Q = "维港大学";

const SE_RESULTS = [
  {
    id: "wiki",
    title: "维港大学 - 维基百科，自由的百科全书",
    url: "zh.wikipedia.org › wiki › 维港大学",
    text: "维港大学（英语：Victoria Harbour University，缩写 VHU）是一所位于香港的公立大学，1962年成立，设有文、理、社会科学、医、工程五个学院。校训为「求真」。",
    go: () => { openForthTab(); goWeb("wiki"); },
  },
  {
    id: "news",
    title: "维港大学 - 院校动态 - 香港日报",
    url: "news.hkdaily.com.hk › 教育 › 院校动态",
    text: "2014年9月5日 — 维港大学本周开学，取录本科新生一千八百人。校方今年起不再派发纸本选科表，学生须经「校园入门网站」自行确认本学期科目……",
    go: () => { openForthTab(); goWeb("hknews"); },
  },
];

/* 首页那两条「热门」从前只有校名点得通：另一条「深水埗　重建」一点，
   必然回一句「找不到符合的结果」——热门点了没有的东西，是在骗人点。
   现在真给两份。头一份是市建局的资料页，点开打不开（二〇一四年政府站就这样），
   她只拿得到地址栏那一行「sham-shui-po」；第二份是报纸八月廿一日那条研究。
   后者讲的是别区的旧楼、别个团队的数字，读起来跟她无关——要等到住进去，
   自己听见隔壁、看见公告，才会想起这一页早就翻过。 */
const SE_REBUILD = [
  {
    id: "ura",
    title: "市区重建局 — 深水埗　市区更新地区（资料页）",
    url: "www.ura.org.hk › tc › projects › sham-shui-po",
    text: "本局正就区内楼宇状况收集资料，范围及时间表待定。有关收购安排，请留意本局公布。",
    go: () => vhuOpenUrl("http://www.ura.org.hk/tc/projects/sham-shui-po.html"),
  },
  {
    id: "hkd-rebuild",
    title: "旧楼重建与健康　维大研究：搬迁三年内长者求诊增两成",
    url: "news.hkdaily.com.hk › 教育 › 院校动态",
    text: "2014年8月21日 — 团队于深水埗及观塘两区访问四百二十户旧楼住户，其中一百七十户在研究期间因重建或收购而搬迁……",
    go: () => { openForthTab(); goWeb("hknews"); },
  },
];

function seQueryText() {
  return S.engineQ == null ? SE_HOME_Q : String(S.engineQ);
}

// 搜什么给什么。「热门」上摆着的每一个词，点了都要有下文。
function seResultsFor(q) {
  const s = String(q || "").toLowerCase();
  const has = (w) => s.indexOf(w) >= 0;
  // 两种字形都认：普通话模式用简体，粤语／粤＋普模式界面是港繁，有人会照屏幕上的字打「維港」。
  if (["维港", "維港", "vhu"].some(has)) return SE_RESULTS;
  if (["深水埗", "重建", "市建局", "旧楼", "舊樓"].some(has)) return SE_REBUILD;
  return [];
}

// 第一次点开维基：站外的页，左上角那个后退键不显眼。从前这里手动造第四格空白页；
// 现在分页栏本来就始终留着一格「新分页」，开了维基之后它是空的，她要再搜一次点那一格就行。
function openForthTab() {
  if (S.wikiOpened) return;
  S.wikiOpened = true;
}

function viewSearchEngine() {
  const q = seQueryText();
  const searched = !!S.seSearched;
  const hit = seResultsFor(q);

  const box = el("input", {
    id: "se-q",
    type: "text",
    class: "se-input",
    value: q,
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": "搜寻",
  });
  const submit = (e) => {
    if (e) e.preventDefault();
    const live = document.getElementById("se-q");
    S.engineQ = (live ? live.value : q) || "";
    S.seSearched = true;
    S.engineDraft = S.engineQ; // 回到空白分页时那个框里还留着上次搜的词
    webAddrDraft = null;
    draw();
  };

  const rows = searched
    ? (hit.length
      ? [
        el("p", { class: "se-stat" }, ["约 1,240 个结果（0.18 秒）"]),
        el("ol", { class: "se-list" }, hit.map((r) => el("li", { class: "se-item" }, [
          el("div", { class: "se-title" }, [webLink(r.title, r.go)]),
          el("div", { class: "se-url" }, [r.url]),
          el("p", { class: "se-snip" }, [r.text]),
        ]))),
        el("p", { class: "se-fine" }, ["通搜　香港　—　二〇一四年"]),
      ]
      : [
        el("p", { class: "se-stat" }, ["找不到符合的结果。"]),
        el("p", { class: "se-snip" }, ["建议：检查有没有打错字，或改用更短的关键词。"]),
        el("p", { class: "se-fine" }, ["通搜　香港　—　二〇一四年"]),
      ])
    : [
      el("ul", { class: "se-picks" }, [
        el("li", { class: "se-picks-h" }, ["热门搜索"]),
        el("li", {}, [webLink("维港大学", () => {
          S.engineQ = SE_HOME_Q;
          S.seSearched = true;
          draw();
        })]),
        el("li", {}, [webLink("深水埗 重建", () => {
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
      el("nav", { class: "se-nav" }, ["网页", "图片", "新闻", "地图", "更多"].map((t, i) =>
        el("span", { class: i === 0 ? "on" : "" }, [t]))),
    ]),
    el("form", { class: "se-form", onsubmit: submit }, [
      box,
      el("button", { type: "submit", class: "se-btn" }, ["搜寻"]),
    ]),
    el("div", { class: "se-body" }, rows),
  ]);
}

/* ---------- 维基：维港大学条 ---------- */

/* 与现实不同：本港没有这一间。年份、学院、舍堂都要跟站内已经出现过的一致
   （海宁堂、医学院、社会科学院、二〇〇四年十一月）。
   二〇〇四年十一月那件事从前直接写在这条「历史」的最后一句，现在整句挪走了，
   变成条目最底「外部链接」里一条能点开的学校新闻稿——史书一句话说完的事，
   当年的稿子会写清楚是哪一座楼、之后围栏加高了多少。她要在这一条里读到它。

   这里的年份、人数一律用阿拉伯数字（1962、14,000），因为维基的格式手册就是
   这样写的；「外部链接」那几行的日期也是 2005年1月17日。日记与对白里仍旧
   写二〇〇四年——那是她那一代人的写法，两处不必统一。 */
const WIKI_VHU = {
  title: "维港大学",
  lead: "（英语：Victoria Harbour University，缩写 VHU）是一所位于香港香港岛西区的公立大学，1962年由香港政府创办，1970年获准颁授学位并正名为大学。校训为「求真」，全校设五个学院、十三间舍堂，学生约14,000人。",
  info: [
    ["校训", "求真"],
    ["创办时间", "1962年"],
    ["学校类型", "公立"],
    ["校长", "马仲衡"],
    ["教师人数", "约800人"],
    ["学生人数", "约14,000"],
    ["校址", "香港岛西区"],
    ["校区", "市区，约11公顷"],
    ["代表色", "深青、米白"],
    ["网站", "www.vhu.edu.hk"],
  ],
  sections: [
    ["历史", [
      "1962年，政府在西区拨出一幅官地，开办维港夜间学院，首年借用一所官立中学的课室上课，取录学生180人。",
      "1970年，学院获准颁授学位，改名维港大学，并于原址以北的山坡兴建主校舍。1985年增设医学院，1993年增设工程学院。",
    ]],
    ["学院与学系", [
      "大学设文学院、理学院、社会科学院、医学院及工程学院，另设通识教育部，负责全校共同必修课。",
      "医学院下设临床医学、公共卫生及护理三个学系，另设教学医院，五年制课程的最后两年全部在医院上课。社会科学院以社会学系及社会工作学系历史最久，早年为本地社会服务机构培训前线人员。",
    ]],
    ["校园与舍堂", [
      "主校舍依山而建，由山下入口至山顶图书馆共七层，校内以楼梯、斜坡及两部升降机连接，中间几层是课室与实验室，最上两层是图书馆和行政楼。",
      "十三间舍堂分布于校园南北两翼，其中海宁堂、观海堂及思源堂历史最久。舍堂设导师制度，一年级学生一般须住宿一年；舍堂不按学院分配，医科生与社会科学院学生常常住在同一层。",
    ]],
    ["校园生活", [
      "舍堂是大学生活的主干。每间舍堂有自己的堂色、堂歌和堂训，一年级入宿第一晚要在饭堂唱一次堂歌，唱错歌词会被同层的旧生留下来再唱。",
      "每年九月开学第一周，各舍堂举行迎新晚宴，新生穿堂袍出席，席间由舍监介绍舍堂历史。十月最后一个星期五是「回堂日」，毕业生穿回当年的堂袍回舍堂吃饭。",
      "图书馆总馆位于山顶，藏书约120万册，另有医学院及工程学院两间分馆。考试期间总馆通宵开放，座位先到先得，医科生习惯在上课前先去占位。",
    ]],
    ["传统与术语", [
      "校园依山，学生口中的「上山」是指去图书馆，「下山」是指去码头坐车；迟到的人说「等埋升降机」，意思是要多等五分钟。",
      "总馆地下有一道1970年代留下的铜牌，刻着创校时180名学生的名字。考试前摸一下铜牌，是校内流传最久的一个小迷信。",
      "校歌以粤语演唱，1970年由校内一名中文科讲师填词，共四段，毕业礼只唱第一段。",
    ]],
    ["校友", [
      "校友约60,000人，分布于医疗、教育、社会服务及工商界。校友事务处每年十月举办返校日，毕业礼多在十二月举行。",
    ]],
  ],
};

/* 条目最底「相关新闻」那几条：学校新闻稿的存档页。年份与稿号照当年的格式，
   路径是 /press/年份/月日——二〇一〇年网站改版时整批搬过一次，编号没改。
   三条都点得开、都有正文：迎新晚宴是没事的，安全检讨只说「未列出个别事件」，
   只有围栏那一条写着哪一座楼、几时、之后加高了多少。她得自己读到那一条。 */
const WIKI_NEWS = {
  dinner04: {
    slug: "2004/1025",
    date: "2004年10月25日",
    title: "海宁堂迎新晚宴",
    paras: [
      "海宁堂迎新晚宴于十月二十二日晚在校园餐厅举行，堂友一百八十人出席，舍监及三十二名旧生回堂。",
      "晚宴由舍监致辞开始，一年级堂友穿堂袍入席，席间由旧生领唱堂歌。堂歌共三段，唱错歌词的新生要留下来再唱一次，这一项「罚则」在堂友之间传了二十多年。",
      "海宁堂今年有六十三名新生入宿，其中十二人来自医学院。",
      "传讯及公共事务处",
    ],
  },
  rail05: {
    slug: "2005/0117",
    date: "2005年1月17日",
    title: "东翼天台围栏加高工程完成",
    // 三条里只有这一条会写进簿：读到它才算知道东翼天台出过什么事。
    clue: ["vhu-news04", "二〇〇四年十一月，一名医学院女生倒卧于主校舍东翼平台，送院后不治。学校其后加高东翼天台围栏：由一点一米加到一点六米。", "罗启明"],
    paras: [
      "主校舍东翼天台围栏加高工程已于本年一月十四日完成，围栏高度由一点一米加高至一点六米，并在内侧加设一道横向扶手。工程由校园发展处统筹，施工期间东翼天台暂停开放。",
      "二〇〇四年十一月，一名医学院女生被发现倒卧于主校舍东翼平台，送院后不治。校方其后加高东翼天台围栏，并重新检视各座天台及平台的围栏高度。",
      "校方再次向离世同学的家人致以慰问，并感谢同学在这段期间对校园安全的关注。",
      "传讯及公共事务处",
    ],
  },
  safety05: {
    slug: "2005/0302",
    date: "2005年3月2日",
    title: "校园安全设施年度检讨",
    paras: [
      "校园发展处已完成二〇〇四／〇五年度安全设施检讨，范围包括各座天台及平台的围栏、楼梯扶手、夜间照明与消防通道。",
      "检讨报告列出十四项改善工程，其中九项已于一月完成，其余五项将于暑假期间施工。报告全文存放于图书馆参考部，同学可于办公时间查阅。",
      "报告未列出个别事件、日期或人名。",
      "传讯及公共事务处",
    ],
  },
};

const WIKI_NEWS_ORDER = ["dinner04", "rail05", "safety05"];

/* 条目最底「外部链接」那几行。维基的外部链接就长这样：一行一条，前面一颗圆点，
   链接文字后面用括号补日期或语言。混在里面的第四条是死链——二〇一〇年网站改版
   时整批旧稿换过位，这一条没有搬过来。 */
function wikiNewsLink(id) {
  const n = WIKI_NEWS[id];
  return el("li", {}, [
    "大学新闻稿：",
    webLink(n.title, () => goWeb("wiki-news", { wikiNews: id })),
    el("span", { class: "wk-ext-n" }, ["（" + n.date + "）"]),
  ]);
}

/* 小节标题右端那个「[编辑]」。维基每一节都挂着，读者扫标题时它是个节拍。 */
function wikiH2(title, anchor) {
  return el("h2", { class: "wk-h2", id: anchor }, [
    title,
    el("span", { class: "wk-edit" }, ["[编辑]"]),
  ]);
}

/* 目录。真维基把它浮在正文左侧，七条上下排，点一条跳到那一节。 */
function wikiToc(rows) {
  return el("div", { class: "wk-toc" }, [
    el("div", { class: "wk-toc-h" }, [
      "目录",
      el("span", { class: "wk-toc-hide" }, ["[隐藏]"]),
    ]),
    el("ol", {}, rows.map(([t, id]) =>
      el("li", {}, [
        el("a", {
          href: "#" + id,
          onclick: (e) => {
            e.preventDefault();
            const n = document.getElementById(id);
            if (n && n.scrollIntoView) n.scrollIntoView({ block: "start" });
          },
        }, [t]),
      ])
    )),
  ]);
}

/* 维基右上角那个搜索框从前是个空壳：字打得进去，按「搜索」毫无反应——
   半功能比死链更假。现在搜得动：认得的词留在这一条，不认得的照当年那句回。 */
function wikiSearchHit(q) {
  const s = String(q || "").toLowerCase();
  return s.indexOf("维港") >= 0 || s.indexOf("維港") >= 0 || s.indexOf("vhu") >= 0;
}

function wikiSearchSubmit() {
  const box = document.getElementById("wk-q");
  S.wikiQ = String((box ? box.value : "") || "").trim();
  draw();
}

function wikiHead() {
  return el("div", { class: "wk-head" }, [
    el("div", { class: "wk-brand" }, [
      // 维基的标志是那颗拼图地球，中文版球面中间一个「維」。
      el("span", { class: "wk-globe", "aria-hidden": "true" }, ["维"]),
      el("span", { class: "wk-word" }, [
        el("strong", {}, ["维基百科"]),
        el("small", {}, ["自由的百科全书"]),
      ]),
    ]),
    el("div", { class: "wk-tools" }, [
      // 右上角那一行人名：没登入的读者看到的就是这一串，点「登入」才有帐户。
      // 写「登入」不写「登录」——维基中文版这一格本来就叫登入，港台读起来才对。
      el("div", { class: "wk-user" }, [
        el("span", { class: "wk-user-me" }, ["未登入"]),
        el("span", { class: "wk-dead" }, ["讨论"]),
        el("span", { class: "wk-dead" }, ["贡献"]),
        el("span", { class: "wk-dead" }, ["创建账户"]),
        el("span", { class: "wk-user-in" }, ["登入"]),
      ]),
      el("div", { class: "wk-search" }, [
        el("input", {
          id: "wk-q",
          class: "wk-q",
          type: "text",
          value: S.wikiQ || "",
          placeholder: "搜索维基百科",
          "aria-label": "搜索维基百科",
          onkeydown: (e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            wikiSearchSubmit();
          },
        }),
        el("button", { class: "wk-qbtn", type: "button", onclick: wikiSearchSubmit }, ["搜索"]),
      ]),
    ]),
  ]);
}

function wikiSide() {
  // 「分类」那一格是全侧栏唯一活的：点开是一页极简的分类页。
  // 其余照旧灰着——侧栏做成整排真链接就假了，有过一次真的才像。
  const group = (h, items) => [
    el("h3", {}, [h]),
    el("ul", {}, items.map((t) => el("li", {}, [
      t === "分类"
        ? webLink(t, () => goWeb("wiki-cat"))
        : el("span", { class: "wk-dead" }, [t]),
    ]))),
  ];
  return el("aside", { class: "wk-side" }, [
    ...group("导航", ["首页", "分类", "特色条目", "新闻动态", "最近更改", "随机条目", "帮助", "资助维基百科"]),
    ...group("工具", ["链入页面", "相关更改", "上传文件", "特殊页面", "页面信息", "数据项"]),
    ...group("打印/导出", ["下载为PDF", "可打印版"]),
    ...group("其他语言", ["English", "日本語", "Deutsch"]),
  ]);
}

/* 页脚三行：修订时间、双授权声明、基金会商标。第二行是维基页脚最显眼的一句，
   当年每一条条目底下都印着它。最底那排是隐私政策一类的站务链接。 */
function wikiFoot() {
  return el("div", { class: "wk-foot" }, [
    el("div", { class: "wk-foot-rev" }, ["本页面最后修订于2014年8月30日 (星期六) 14:07。"]),
    el("div", { class: "wk-foot-lic" }, [
      "本站的全部文字在知识共享 署名-相同方式共享 3.0协议之条款下提供，附加条款亦可能应用。（请参阅使用条款）",
    ]),
    el("div", { class: "wk-foot-lic" }, [
      "Wikipedia®和维基百科标志是维基媒体基金会的注册商标；维基™是维基媒体基金会的商标。维基媒体基金会是在美国佛罗里达州登记的免税、非营利、慈善机构。",
    ]),
    el("ul", { class: "wk-foot-links" },
      ["隐私政策", "关于维基百科", "免责声明", "开发者", "统计", "Cookie声明", "手机版视图"]
        .map((t) => el("li", {}, [el("span", { class: "wk-dead" }, [t])]))),
  ]);
}

function viewWiki() {
  const secs = WIKI_VHU.sections.map(([t, paras], i) => ({ t, paras, id: "wk-s" + (i + 1) }));
  const body = [];

  // 搜索框里打了一个维基没有的词：不换页，就在最上面回一句。
  // 这一句要压在「条目／讨论」那排标签之上——放在标题上方，读起来会像是
  // 「維港大學是一个不存在的条目」。末尾点明下面仍在看哪一条，免得误会。
  const sq = String(S.wikiQ || "").trim();
  if (sq && !wikiSearchHit(sq)) {
    body.push(el("div", { class: "wk-noresult" }, [
      el("p", {}, ["维基百科目前没有名为「" + sq + "」的条目。"]),
      el("p", {}, ["请检查有没有打错字，或改用更通用的词。下面仍是「" + WIKI_VHU.title + "」这一条。"]),
    ]));
  }

  body.push(el("div", { class: "wk-tabs" }, [
    el("ul", { class: "wk-tabs-l" }, [
      el("li", { class: "on" }, ["条目"]),
      el("li", {}, [el("span", { class: "wk-dead" }, ["讨论"])]),
    ]),
    el("ul", { class: "wk-tabs-r" }, [
      el("li", { class: "on" }, ["阅读"]),
      el("li", {}, [el("span", { class: "wk-dead" }, ["编辑"])]),
      el("li", {}, [el("span", { class: "wk-dead" }, ["查看历史"])]),
    ]),
  ]));

  body.push(el("h1", { class: "wk-title" }, [WIKI_VHU.title]));
  // 标题下面这行小字是维基的 siteSub，每条条目都有；从前它被搬到标题上面当面包屑，位置错了。
  body.push(el("div", { class: "wk-sub" }, ["维基百科，自由的百科全书"]));

  // 维护模板：条目没有列参考来源。真维基就是这样一块灰框，句子后面挂着年月。
  body.push(el("div", { class: "wk-warn" }, [
    "此条目没有列出任何参考或来源。",
    el("span", { class: "wk-warn-d" }, ["（2014年8月）"]),
  ]));

  body.push(el("table", { class: "wk-info" }, [
    el("caption", {}, [WIKI_VHU.title]),
    el("tbody", {}, WIKI_VHU.info.map(([k, v]) => el("tr", {}, [
      el("th", {}, [k]),
      // 资料框里「网站」那一格是真维基唯一一处蓝色外链：点它出去，是对外那一头。
      // 从前这里写死成黑字（怕做了假链接），现在对面真有一页，就该让它点得动。
      el("td", {}, [k === "网站" ? webLink(v, () => goWeb("vhusite")) : v]),
    ]))),
  ]));

  body.push(el("p", { class: "wk-lead" }, [el("b", {}, [WIKI_VHU.title]), WIKI_VHU.lead]));

  body.push(wikiToc(secs.map((s) => [s.t, s.id]).concat([["外部链接", "wk-ext"]])));

  secs.forEach((s) => {
    body.push(wikiH2(s.t, s.id));
    s.paras.forEach((p) => body.push(el("p", {}, [p])));
  });

  body.push(wikiH2("外部链接", "wk-ext"));
  // 真维基的外部链接第一条几乎总是「官方网站」：一行、一个圆点、后面括号注语言。
  // 这一条是给读者去学校那一头的门——不是登入页，学校对外那页而已。
  body.push(el("ul", { class: "wk-ext" }, [
    el("li", {}, [webLink("官方网站", () => goWeb("vhusite"))]),
    ...WIKI_NEWS_ORDER.map(wikiNewsLink),
    el("li", {}, [
      "大学新闻稿：",
      el("span", { class: "wk-dead" }, ["2005年度毕业典礼安排"]),
      el("span", { class: "wk-ext-n" }, ["（2005年6月30日）"]),
      el("span", { class: "wk-ext-dead" }, ["[失效链接]"]),
    ]),
  ]));

  // 条目最底那行分类：灰框、粗体「分类」、竖线分开。维基每条条目都有。
  body.push(el("div", { class: "wk-cat" }, [
    el("b", {}, ["分类"]),
    "：",
    webLink("香港的大学", () => goWeb("wiki-cat")),
    el("span", { class: "wk-cat-sep" }, [" | "]),
    el("span", { class: "wk-dead" }, ["1962年创建的教育机构"]),
    el("span", { class: "wk-cat-sep" }, [" | "]),
    el("span", { class: "wk-dead" }, ["香港岛西区"]),
  ]));

  return el("div", { class: "hk-site wk-site" }, [
    wikiHead(),
    el("div", { class: "wk-cols" }, [
      wikiSide(),
      el("article", { class: "wk-article" }, body),
    ]),
    wikiFoot(),
  ]);
}

/* ---------- 维基分类页 ---------- */

/* 侧栏「分类」点出来的一页。真维基的分类页极简：一个标题、一句系统话、一串条目，
   条目后面跟一句「(页面)」。这里只做一个分类、只列十一家，其中只有维港大学是蓝的。
   其余十家不打开也不假装打开——分类页的价值不在内容，在于「侧栏原来真的通」。
   校名全部虚构：列真的港大中大，会跟维港大学这一整套设定打架。 */
const WIKI_CAT = {
  title: "Category:香港的大学",
  dead: [
    "港岛医学院", "九龙理工学院", "新界农学院", "荃湾教育学院", "香港工商学院",
    "维多利亚书院", "南方神学院", "东区设计学院", "西贡海洋学院", "沙田体育学院",
  ],
};

function viewWikiCat() {
  const n = WIKI_CAT.dead.length + 1;
  return el("div", { class: "hk-site wk-site" }, [
    wikiHead(),
    el("div", { class: "wk-cols" }, [
      wikiSide(),
      el("article", { class: "wk-article" }, [
        el("div", { class: "wk-tabs" }, [
          el("ul", { class: "wk-tabs-l" }, [
            el("li", { class: "on" }, ["分类页"]),
            el("li", {}, [el("span", { class: "wk-dead" }, ["讨论"])]),
          ]),
          el("ul", { class: "wk-tabs-r" }, [
            el("li", { class: "on" }, ["阅读"]),
            el("li", {}, [el("span", { class: "wk-dead" }, ["编辑"])]),
          ]),
        ]),
        el("h1", { class: "wk-title" }, [WIKI_CAT.title]),
        el("div", { class: "wk-sub" }, ["维基百科，自由的百科全书"]),
        el("p", { class: "wk-catsum" }, ["本分类共 " + n + " 个页面。"]),
        el("ul", { class: "wk-catlist" }, [
          el("li", {}, [
            webLink("维港大学", () => goWeb("wiki")),
            el("span", { class: "wk-catn" }, ["（页面）"]),
          ]),
          ...WIKI_CAT.dead.map((t) => el("li", {}, [
            el("span", { class: "wk-dead" }, [t]),
            el("span", { class: "wk-catn" }, ["（页面）"]),
          ])),
        ]),
        el("div", { class: "wk-cat" }, [
          el("b", {}, ["分类"]),
          "：",
          webLink("香港的大学", () => goWeb("wiki-cat")),
        ]),
      ]),
    ]),
    wikiFoot(),
  ]);
}

/* ---------- 大学新闻稿的存档页 ---------- */

/* 点那些「相关新闻」出来的一页。二十〇〇年代的大学网站就这样：
   一张白纸、一条深青色横带、日期与稿号、正文、署名的处室。
   三篇都写完了，只有围栏那一条提到有人死了——那一条进了簿，就成了去天台之前要知道的事。 */
function viewWikiNews() {
  const id = String(S.wikiNews || "");
  const n = WIKI_NEWS[id];
  if (!n) {
    return el("div", { class: "hk-site press-site" }, [
      pressHead(),
      el("div", { class: "press-body" }, [
        el("h1", { class: "press-title" }, ["找不到这个页面"]),
        el("p", {}, ["此新闻稿已于二〇一〇年网站改版时移除，或网址输入有误。"]),
        el("p", { class: "press-fine" }, ["存档编号 /press/" + id]),
        el("p", {}, [webLink("« 返回维基百科条目", () => goWeb("wiki"))]),
      ]),
    ]);
  }
  // 读到这一条：平台、不治、围栏加高。她要的就是这一句——
  // 学校自己写在稿子里的，不是剪报上别人转述的。
  if (n.clue && typeof noted === "function" && !noted(n.clue[0])) note(n.clue[0], n.clue[1], n.clue[2]);
  return el("div", { class: "hk-site press-site" }, [
    pressHead(),
    el("div", { class: "press-body" }, [
      el("p", { class: "press-kicker" }, ["大学新闻稿"]),
      el("h1", { class: "press-title" }, [n.title]),
      el("p", { class: "press-meta" }, [n.date + "　编号 " + n.slug.replace("/", "-")]),
      ...n.paras.map((p) => el("p", {}, [p])),
      // 那年头的网页底下就这一行：版权年、校名、更新日期。不写「存档页面」——
      // 学校自己的旧稿本来就一直挂在网上。
      el("p", { class: "press-fine" }, [
        "© " + n.slug.slice(0, 4) + " 维港大学　版权所有　｜　更新日期：" + n.date,
      ]),
      el("p", { class: "press-back" }, [
        // 「回上一页」按真的上一页走：从维基条目点进来就回维基，
        // 从官网新闻页最底点进来就回官网新闻页。写死回维基，新入口就成了单向死路。
        webLink("回上一页", webBack),
      ]),
    ]),
  ]);
}

function pressHead() {
  return el("div", { class: "press-head" }, [
    el("div", { class: "press-mark" }, ["VHU"]),
    el("div", { class: "press-word" }, [
      el("strong", {}, ["维港大学"]),
      el("small", {}, ["传讯及公共事务处　新闻稿"]),
    ]),
  ]);
}

/* ---------- 学校官网：www.vhu.edu.hk（对外那一头） ---------- */

/* 维基资料框「网站」那一行写的 www.vhu.edu.hk，就是这一页。
   它跟门户不是同一部机器：对外这一头给学生家长看的是课程、研究、活动、捐款，
   一部份页面十年不动；学生每天要用的选科与成绩，在另一部叫「校园入门网站」的机器上。
   那个入口没有放在导航条上——只在页脚「快速连结」那一列里挂着，
   字号跟旁边的私隐政策一样小，要先滚到底才看得见。这一层是故意留的。 */

/* 站内图：官网这一页的照片单独一个夹，不进 图/游戏（那边归剧情图库，全检逐张对配字）。
   图落同名路径要 bump 这里的版本号，跟 PIC_VER 一个道理。 */
const WEB_PIC_ROOT = "../图/网页/";
const WEB_PIC_VER = "20261027-site1";

function sitePic(name) {
  return encodeURI(WEB_PIC_ROOT + name) + ".jpg?v=" + WEB_PIC_VER;
}

/* 导航八项。五项点得动（关于维大／入学／学院与学系／校园生活／新闻与活动），
   三项挂着但不通（研究／校友／捐赠）——2014 年那部「一年只改一两次」的机器就是这样，
   栏目没建完，链接就摆在那里。八个全做成真的反而假：真站上总有几栏是空的。
   「新闻与活动」就是首页本身：在首页时它高亮、按了不跳；进了内页才可以按回来。 */
/* 第一项必须是「首页」。之前没有这一项，而首页又把「新闻与活动」标成当前栏目
   （因为新闻与活动就是这一页），结果打开站看到的是「新闻与活动」被点亮——
   像这一部机器只有新闻，没有门厅。真站的第一格永远是首页，栏目各占一格。 */
const VHU_SITE_NAV = [
  { k: "home", t: "首页" },
  { k: "about", t: "关于维大" },
  { k: "admissions", t: "入学" },
  { k: "faculties", t: "学院与学系" },
  { k: "", t: "研究" },
  { k: "campus-life", t: "校园生活" },
  { k: "news", t: "新闻与活动" },
  { k: "alumni", t: "校友" },
  { k: "", t: "捐赠" },
];

/* 首图轮播。两张：一张开学、一张山顶图书馆——都是这一页要讲的事，
   不是随机风景。点下面的圆点能换图，换的是 DOM，不重画整页。 */
const VHU_SLIDES = [
  {
    img: "大-主校舍",
    kicker: "2014　开学",
    a: "五个学院，七十四个本科课程",
    b: "一千八百名新生入读",
    p: "九月一日，新学年开始。校长马仲衡在开学礼上说，大学要教学生的不是答案，是问对问题。",
  },
  {
    img: "大-图书馆",
    kicker: "山顶图书馆",
    a: "藏书一百二十万册，考试期间通宵开放",
    b: "由山下入口到总馆，一共七层",
    p: "校园依山而建。学生口中的「上山」是去图书馆，「下山」是到码头坐车。",
  },
];
let vhuSlide = 0;

/* 对外那一头的新闻列表。同一批事在《香港日报》那边有全文；这里配一张图、一个栏目，
   像 2014 年那些大学网站一样，一列排下来，点不开也不奇怪。

   只留三条，是砍过的：原来还有「开学礼：校长谈问对问题」和「海宁堂文化节：旧生回堂」，
   前一条跟首图第一张讲的是同一句话，后一条跟右栏「回堂日」讲的是同一批人。
   三条新闻对三条活动，两栏一样长，页面也短下来。 */
/* 最后一项是 slug，点得开的那三条拿它去取正文（VHU_SITE_STORIES）。 */
const VHU_SITE_NEWS = [
  ["2014年9月5日", "新生须于九月十二日前经校园入门网站确认选科", "教务", "小-图书馆", "0912"],
  ["2014年8月21日", "旧楼重建与健康：社会科学院发表六年追踪研究", "研究", "小-旧楼", "0821"],
  ["2014年6月30日", "临床技能中心启用，玛丽医院拨出两层", "医学院", "小-病房", "0630"],
];

/* 右侧「即将举行」。日期跟站内别处对得上，两件事别混成一件事：
   返校日（校友事务处主办）是十月十八日，校友电邮里写的就是这一天；
   回堂日（各舍堂自己办）是十月最后一个星期五，维基与舍堂那一条都这么写，2014 年即三十一日。
   非联招十一月底截止。第八条以后的事不写，写了就要在别处也交代。 */
const VHU_SITE_EVENTS = [
  ["18", "10月", "校友返校日", "校友事务处主办，毕业班旧生回校午宴。", "校园餐厅　12:00", "1018"],
  ["31", "10月", "回堂日", "十三间舍堂同时开门，旧生穿回当年堂袍。", "各舍堂　18:30", "1031"],
  ["28", "11月", "2015 年度非联招申请截止", "网上申请于下午五时关闭，逾期不予受理。", "入学事务处", "1128"],
];

/* 点得开的四页。文案跟维基条目刻意错开：维基讲沿革、传统与校園事故，
   这一头讲课程、学院与日常，同一个事实不在两处讲两遍。
   图片各归各位，站内八张照片到这里没有一张是备用的：
   主校舍进了「关于维大」，开学礼进了「入学」，舍堂那张进了回堂日的活动详情，
   三张新闻缩图在正文里放大成通栏——同一张片子换个尺寸，不另生一张。 */
const VHU_SITE_PAGES = {
  about: {
    nav: "关于维大",
    title: "关于维大",
    img: "小-主校舍",
    cap: "本部大楼。一九六二年创校时只有这一座，至今仍在上课。",
    lede: "维港大学一九六二年由香港政府创办，一九七〇年获准颁授学位。校训「求真」。",
    paras: [
      "校园依山而建。由薄扶林道九十四号的正门进来，一路都是上坡；五个学院分散在七座楼里，学生往来靠一条有盖步道和两部升降机。",
      "本科生约占全校七成。十三间舍堂分别在校园东侧与山西坡，最早的四间与本部同年落成。",
    ],
    facts: [
      ["学院", "文、理、社会科学、医、工程"],
      ["本科课程", "七十四个"],
      ["舍堂", "十三间"],
      ["学生", "约一万四千人"],
    ],
  },
  admissions: {
    nav: "入学",
    title: "入学",
    img: "小-开学礼",
    cap: "开学礼，本部大楼礼堂。全校新生同场。",
    lede: "本科课程经大学联合招生办法录取。非联招申请每年十一月底截止，逾期不予受理。",
    paras: [
      "获录取的新生于八月中旬办理注册，领取学生证与宿舍分配。九月一日开学礼在本部大楼礼堂举行，由校长致辞。",
      "研究生课程由各学院自行收生，申请期由十一月起至翌年三月，面试以英语进行。",
    ],
    facts: [
      ["本科申请", "大学联合招生办法"],
      ["非联招截止", "十一月二十八日"],
      ["注册", "八月中旬"],
      ["开学礼", "九月一日"],
    ],
  },
  faculties: {
    nav: "学院与学系",
    title: "学院与学系",
    lede: "五个学院，七十四个本科课程。医学院的临床教学在玛丽医院进行。",
    paras: ["各学院学系列于下。课程资料与收生分数由教务处每年十月更新，以该处公布为准。"],
    cols: [
      ["文学院", ["中国语言文学", "英国语文", "历史", "哲学", "翻译"]],
      ["理学院", ["数学", "物理", "化学", "生物", "统计学"]],
      ["社会科学院", ["社会学", "心理学", "政治与公共行政", "地理"]],
      ["医学院", ["内外全科医学", "护理学", "药学"]],
      ["工程学院", ["土木工程", "机械工程", "电机电子工程", "计算机科学"]],
    ],
    // 这一节是「旧楼重建」那条链中间缺的一跳：报纸只说「有这么个研究」，
    // 到这里才知道研究的是哪几条街、谁在外面帮忙找人。
    // 刻意不重复 8/21 新闻稿已经说过的三样（合作学系、经费来源、报告存放处）——
    // 同一件事写两遍，玩家读到第二处就学会「别处不用看」，那正好杀死复用。
    after: {
      h: "研究",
      paras: [
        "社会科学院现正进行一项旧区居住状况研究，范围包括深水埗南昌街、基隆街一带，以及观塘月华街、协和街一带楼龄逾四十年的住宅楼宇。",
        "受访住户由深水埗街坊会及观塘社区中心协助招募。问卷与访谈纪录由学院保存，不作个别公开。",
      ],
      link: ["本院于八月二十一日就此项研究发出新闻稿。", "0821"],
    },
  },
  "campus-life": {
    nav: "校园生活",
    title: "校园生活",
    lede: "十三间舍堂同住，六十五个学生组织，一年到头排满的院际比赛。",
    paras: [
      "学生会每年九月改选，属下有学术、体育、文化、服务四个事务委员会；各学院另有院会，办迎新营与院际比赛。",
      "体育设施分布在山西坡：一个标准田径场、四个网球场、一座室内泳池。泳池十一月至三月供应暖水，清晨六时开放。",
      "大学保健中心设于本部大楼地下，星期一至六应诊，非办公时间由值班医生处理。",
    ],
    facts: [
      ["学生组织", "六十五个"],
      ["体育设施", "田径场、网球场、泳池"],
      ["保健中心", "本部大楼地下"],
    ],
  },
  // 栏目页不能跟首页同一页。「新闻与活动」原来点了就回首页——首页又把这一格标成
  // 当前栏目，于是打开站像只有新闻。现在它是自己的一页：一栏到底，新闻在上、
  // 活动在下，像一份按月归档的目录。
  news: {
    nav: "新闻与活动",
    title: "新闻与活动",
    lede: "新闻稿由传讯及公共事务处发出，活动消息由各主办单位提供，以最新公告为准。",
    paras: [
      "本年度已发出新闻稿二十九篇。本页列出最近三条，较早的稿件可于图书馆的期刊存档查阅。",
    ],
    lists: true,
  },
  // 「校友」原来是一行灰死字。这一页只做一件事：给一张名录。
  // 名录是官方那一头的说法——它有罗启明 2005 年医学毕业，
  // 而成绩表那一头有一科缺考、待补。两处并看，官方版本与缺口才咬得住。
  // 只列十一人不是偷懒，是「未授权公开」——那个年代的名录就是这样，多半不齐。
  alumni: {
    nav: "校友",
    title: "校友事务处",
    // 这一页只讲它自己才有的东西：名录怎么来、怎么改。
    // 人数分布那一套维基条目已经写过，返校日与借书证年费活动页和校友电邮也写过，
    // 官网这一页不再说第二遍——那正是「读了一处就不用读第二处」的来路。
    lede: "毕业同学的学生编号与校园电邮永久保留。本处负责校友通讯、借书证申请与名录更新。",
    paras: [
      "以下为已授权公开个人资料的校友，按毕业年份排列。未列出者资料不对外公开。",
      "名录每两年更新一次。如需更正，请以校友电邮致函本处。",
    ],
    roll: [
      ["何丽珍", "翻译", "2012"],
      ["吴家俊", "土木工程", "2011"],
      ["周文彬", "护理学", "2010"],
      ["梁颂恩", "心理学", "2009"],
      ["黄志强", "药学", "2008"],
      ["张婉婷", "历史", "2007"],
      ["李国华", "计算机科学", "2006"],
      ["罗启明", "内外全科医学", "2005"],
      ["陈嘉敏", "英国语文", "2005"],
      ["陈家豪", "社会学", "2004"],
      ["邓志明", "机械工程", "2004"],
      ["林美玲", "政治与公共行政", "2003"],
    ],
    // 官方那一头的说法：他是一个二〇〇五年正常毕业的校友。
    // 成绩表那一头有一格「缺考」——两处并看才咬得住，名录自己一个字都不提（10-28）。
    clue: {
      id: "vhu-alumni-luo", who: "luo", name: "罗启明",
      text: "校友名录：罗启明，内外全科医学，二〇〇五年毕业。官方版本里，他是一个正常毕业的人。",
    },
  },
};

/* 三条新闻的正文。第一条是这一站上最要紧的一段话：它把「校园入门网站」这个名字
   再讲一次，又说清它跟对外网页不是同一部机器——但仍然不给网址。
   门在页脚，得她自己滚到底。正文里出现网址，这一关就白设了。 */
const VHU_SITE_STORIES = {
  "0912": {
    tag: "教务",
    date: "2014年9月5日",
    img: "小-图书馆",
    cap: "图书馆阅览室。绿色台灯是这一层的老规矩：人走了不必关，位置就算还占着。",
    title: "新生须于九月十二日前经校园入门网站确认选科",
    lede: "教务处今日发信全体新生，提醒须于九月十二日或之前，经校园入门网站确认第一学期选科。",
    body: [
      "教务处说，今年起选科确认一律在网上办理，不再接受纸本表格。学生须以学生编号与开学时领取的密码登入校园入门网站，逾期未确认者，其选科纪录将留待开学后由所属学院代行编配。",
      "教务处又提醒，校园入门网站与大学对外网页并非同一系统。对外网页上的课程资料只供参考，不设登入；有关登入办法与密码重置，可向所属学院事务处查询。",
    ],
    tail: "传讯及公共事务处　二〇一四年九月五日",
  },
  "0821": {
    tag: "研究",
    date: "2014年8月21日",
    img: "小-旧楼",
    cap: "研究的其中一个旧区。街市后面那几幢，楼龄由四十三年至五十一年。",
    title: "旧楼重建与健康：社会科学院发表六年追踪研究",
    // 样本量跟《香港日报》那条对齐（四百二十户，其中一百七十户搬迁过）。
    // 同一份研究在两处写出两个数，玩家两边都读过就会撞上。
    lede: "社会科学院今日发表一项为期六年的追踪研究，访问四百二十户旧区住户，其中一百七十户在研究期间因重建或收购而搬迁，检视搬迁对居民精神健康的影响。",
    body: [
      "研究发现，搬迁后首两年，受访者的焦虑与失眠指数平均上升；第三年起回落至搬迁前水平，但独居长者一组未见回落。研究团队建议，重建计划应为独居长者提供为期不少于三年的社区跟进。",
      "研究由社会工作学系与医学院精神科学系合作进行，经费来自研究资助局。报告全文已上载大学图书馆的机构储存库。",
    ],
    tail: "传讯及公共事务处　二〇一四年八月二十一日",
  },
  "0630": {
    tag: "医学院",
    date: "2014年6月30日",
    img: "小-病房",
    cap: "病房教学。三年级生进入病房之前，须先在技能中心完成四十小时训练。",
    title: "临床技能中心启用，玛丽医院拨出两层",
    lede: "医学院今日宣布，位于玛丽医院两层的临床技能中心正式启用，供医科生练习问诊、检查与急救程序。",
    body: [
      "中心设十二间模拟诊室、一间模拟病房与一套高阶模拟人系统，可重演药物过敏、急性心衰竭等情况。三年级生自本学年起，须在进入病房前完成四十小时技能训练并通过考核。",
      "医学院院长说，中心里没有真实病人，学生可以在不承担风险的情况下反复练习——特别是告知坏消息一类无法在病房里试错的对谈。",
    ],
    tail: "传讯及公共事务处　二〇一四年六月三十日",
  },
};

/* 三场活动的详情。回堂日那张舍堂晚宴的照片终于落在这里：
   绿色的堂袍、长桌、举杯的那一下，跟列表上那句「旧生穿回当年堂袍」是同一件事。 */
const VHU_SITE_EVENTPAGES = {
  "1018": {
    tag: "校友",
    title: "校友返校日",
    lede: "毕业班旧生回校午宴。今年是第三届，报名人数一千一百人。",
    body: [
      "午宴设于校园餐厅，中午十二时入席。旧生可凭当年的学生证入场，未带证的于正门登记处核对姓名即可，不必事先登记。",
      "下午二时起开放本部大楼与图书馆，供旧生参观。图书馆地下那道铜牌前照例摆一张长桌，供人签名。",
    ],
    facts: [
      ["日期", "10月18日（星期六）"],
      ["时间", "12:00 入席"],
      ["地点", "校园餐厅"],
      ["主办", "校友事务处"],
    ],
  },
  "1031": {
    tag: "舍堂",
    title: "回堂日",
    img: "小-舍堂",
    cap: "去年回堂日晚宴。旧生按毕业年份入座，穿回当年堂袍。",
    lede: "十三间舍堂同日开门，旧生穿回当年堂袍，与在宿生同席。",
    body: [
      "晚宴六时半开始。先在堂内礼堂唱堂歌，再由舍监致辞；旧生按毕业年份入座，最早的一桌是一九六八届。",
      "非旧生不得入场，在宿生可携一位家属。各堂名额不同，向所属堂会查询。",
    ],
    facts: [
      ["日期", "10月31日（星期五）"],
      ["时间", "18:30"],
      ["地点", "各舍堂"],
      ["主办", "各舍堂舍监及堂会"],
    ],
  },
  "1128": {
    tag: "入学",
    title: "2015 年度非联招申请截止",
    lede: "网上申请于十一月二十八日下午五时关闭，逾期不予受理。",
    body: [
      "申请人须于截止前上载身份证明文件、成绩单与个人陈述。报名费三百元，以信用卡缴付，未缴费者申请不予处理。",
      "面试于十二月中至翌年一月进行，结果于三月下旬公布。",
    ],
    facts: [
      ["截止", "11月28日 17:00"],
      ["方式", "网上申请"],
      ["报名费", "三百元"],
      ["结果", "2015年3月下旬"],
    ],
  },
};

/* 页头、导航、页脚三块，首页与内页共用。内页不是另做一个站，
   只是同一部机器里翻了一页，这三块必须一模一样，否则一眼看出是拼的。 */
function vhuSiteHead() {
  return el("div", { class: "vhu-o-head" }, [
    el("div", { class: "vhu-o-crest", "aria-hidden": "true" }, [
      el("i", {}),
      el("b", {}, ["VHU"]),
    ]),
    el("div", { class: "vhu-o-word" }, [
      el("strong", {}, ["维港大学"]),
      el("small", {}, ["VICTORIA HARBOUR UNIVERSITY　香港"]),
    ]),
    el("p", { class: "vhu-o-addr" }, ["香港岛西区薄扶林道九十四号"]),
  ]);
}

// cur 是当前所在的那一项（页面 slug，或 "home" 表首页）。死项仍旧是一行灰字。
function vhuSiteNav(cur) {
  return el("div", { class: "vhu-o-nav" }, VHU_SITE_NAV.map((it) => {
    if (!it.k) return el("span", { class: "vhu-o-dead" }, [it.t]);
    return webLink(it.t, () => {
      // 首页那一格回自己这一页；其余栏目一律落内页。
      if (it.k === "home") goWeb("vhusite");
      else goWeb("vhusite-page", { siteArg: it.k });
    }, "vhu-o-navi" + (it.k === cur ? " on" : ""));
  }));
}

function vhuSiteFoot() {
  return el("div", { class: "vhu-o-foot" }, [
    el("div", { class: "vhu-o-foot-cols" }, [
      el("div", {}, [
        el("h4", {}, ["快速连结"]),
        el("ul", {}, [
          el("li", {}, [
            webLink("校园入门网站", () => {
              const st = vhuSt();
              if (st.authed) vhuPage("home");
              else goWeb("vhu-login");
            }, "vhu-o-portal"),
            el("span", { class: "vhu-o-pt" }, ["VHU Portal"]),
          ]),
          el("li", {}, [el("span", { class: "vhu-o-dead" }, ["学生电邮"])]),
          el("li", {}, [el("span", { class: "vhu-o-dead" }, ["图书馆"])]),
        ]),
      ]),
      el("div", {}, [
        el("h4", {}, ["联络"]),
        el("ul", {}, [
          el("li", {}, ["电话 (852) 2859 0000"]),
          el("li", {}, ["info@vhu.edu.hk"]),
        ]),
      ]),
    ]),
    el("p", { class: "vhu-o-copy" }, [
      "© 2014 维港大学　版权所有　｜　本网站由传讯及公共事务处管理",
    ]),
  ]);
}

// 面包屑。最后一段是当前页，不带下划线；前面的都能按回去。
function vhuCrumb(items) {
  const kids = [];
  items.forEach(([t, fn], i) => {
    if (i) kids.push(el("span", { class: "vhu-o-csep" }, ["›"]));
    kids.push(fn ? webLink(t, fn, "vhu-o-clink") : el("span", { class: "vhu-o-cnow" }, [t]));
  });
  return el("div", { class: "vhu-o-crumb" }, kids);
}

// 资料小表：左窄右宽，一路拉到底的细线——2014 年那种「表格当版面」的做法。
function vhuFacts(pairs) {
  return el("dl", { class: "vhu-o-facts" }, pairs.map(([k, v]) => [
    el("dt", {}, [k]),
    el("dd", {}, [v]),
  ]));
}

function vhuCols(cols) {
  return el("div", { class: "vhu-o-cols" }, cols.map(([name, ls]) =>
    el("div", { class: "vhu-o-col" }, [
      el("h3", {}, [name]),
      el("ul", {}, ls.map((x) => el("li", {}, [x]))),
    ])));
}

/* 校友名录。三列：姓名、学院／专业、毕业年份。
   不做成卡片、不做头像——二〇一四年那种官方名录就是一串名字，越朴素越像真的。
   带 clue 时，clue.name 那一个名字可点：她抄的是名录上的名字，不是整张表。 */
function vhuSiteRoll(rows, clue) {
  return el("table", { class: "vhu-o-roll" }, [
    el("thead", {}, [el("tr", {}, [
      el("th", {}, ["姓名"]),
      el("th", {}, ["学院／专业"]),
      el("th", { class: "vhu-o-roll-y" }, ["毕业年份"]),
    ])]),
    el("tbody", {}, rows.map(([n, p, y]) => el("tr", {}, [
      el("td", {}, [clue && clue.name === n ? vhuTake(clue, n) : n]),
      el("td", {}, [p]),
      el("td", { class: "vhu-o-roll-y" }, [y]),
    ]))),
  ]);
}

function viewVhuSite() {
  // 关卡提示靠这个记号换一句话（第 15 关：到过官网之后，「藏在页脚」那句才出来）。
  S.sawVhuSite = true;

  // 页头与页脚都抽到外面去了：内页翻的是同一部机器，这三块必须一模一样。
  const head = vhuSiteHead();

  // 导航条右端原来挂着一项「教职员内联网」，页脚「快速连结」里也有一行同名——
  // 两处都是点不动的死字，留一处就够，这里去掉，页脚那行才是玩家要滚到底找的。
  // 高亮的是「首页」——这一页就是首页，不该把新闻那一格点亮。
  const nav = vhuSiteNav("home");

  // 首图：两张叠着放，靠 .on 切换。图上压一层从下往上的黑，白字才读得清。
  const hero = el("div", { class: "vhu-o-hero" });
  const dots = el("div", { class: "vhu-o-dots" });
  // 右下角那个「1 / 2」跟着圆点走，换图不更新就成了假的页码。
  const count = el("span", { class: "vhu-o-count" }, [(vhuSlide + 1) + " / " + VHU_SLIDES.length]);
  const slides = VHU_SLIDES.map((s, i) => {
    const fig = el("div", { class: "vhu-o-slide" + (i === vhuSlide ? " on" : "") }, [
      el("img", { class: "vhu-o-photo", src: sitePic(s.img), alt: "" }),
      el("div", { class: "vhu-o-veil" }),
      el("div", { class: "vhu-o-cap" }, [
        el("p", { class: "vhu-o-kicker" }, [s.kicker]),
        el("h1", {}, [
          // 两行分开写，不交给浏览器断：中文一行断在「新生」中间，读起来像错字。
          el("span", { class: "vhu-o-h1a" }, [s.a]),
          el("span", { class: "vhu-o-h1b" }, [s.b]),
        ]),
        el("p", { class: "vhu-o-hero-p" }, [s.p]),
      ]),
    ]);
    hero.append(fig);
    return fig;
  });
  VHU_SLIDES.forEach((s, i) => {
    const d = el("button", {
      class: "vhu-o-dot" + (i === vhuSlide ? " on" : ""),
      type: "button",
      "aria-label": "第 " + (i + 1) + " 张",
    });
    d.addEventListener("click", () => {
      vhuSlide = i;
      slides.forEach((f, k) => f.classList.toggle("on", k === i));
      Array.prototype.forEach.call(dots.children, (c, k) => c.classList.toggle("on", k === i));
      count.textContent = (i + 1) + " / " + VHU_SLIDES.length;
    });
    dots.append(d);
  });
  hero.append(count, dots);

  // 首图下面原来还有三块「入学／研究／校友」的推广格子，内容跟左栏新闻、右栏活动
  // 各撞一次（非联招截止讲了两遍、回堂日讲了两遍）。整块拿掉，首图下面直接是新闻。

  const news = el("div", { class: "vhu-o-sec" }, [
    el("div", { class: "vhu-o-sec-h" }, [el("h2", {}, ["新闻与活动"])]),
    vhuNewsList(),
  ]);

  const events = el("div", { class: "vhu-o-side" }, [
    el("div", { class: "vhu-o-sec-h" }, [el("h2", {}, ["即将举行"])]),
    vhuEventList(),
  ]);

  // 右栏到底原来还挂着「支持维大」捐款格和三格「校园掠影」。前者是纯入口，点不开；
  // 后者那三张照片跟左栏新闻缩图是同一批图，配字又跟首图第二张讲同一件事（七层、山顶、舍堂）。
  // 两处都去掉——这一页留一份影像、一份文字就够。

  // 页脚两列，跟 vhuSiteFoot() 同一份——内页翻过来也是这一张，不再写第二遍。
  const foot = vhuSiteFoot();

  return el("div", { class: "hk-site vhu-o-site" }, [
    head, nav,
    el("div", { class: "vhu-o-body" }, [
      hero,
      el("div", { class: "vhu-o-main" }, [news, events]),
    ]),
    foot,
  ]);
}

/* 内页三个 view。版式共用一个壳：页头、导航、页脚照旧，中间换成 640 宽的一栏。
   做成真的靠三样东西——地址栏跟着变（/about/、/news/2014/0912/）、
   分页标题跟着变、后退键回得去。少一样就还是「点一下换张图」。 */
/* 新闻三行与活动三行各只写一遍，取法在这里：首页左栏／右栏用它，
   「新闻与活动」栏目页也用它。两头共用同一份 DOM，日期与标题不会走样。 */
function vhuNewsList() {
  return el("ul", { class: "vhu-o-news" }, VHU_SITE_NEWS.map(([d, t, tag, img, slug]) =>
    el("li", {
      class: "vhu-o-hit",
      onclick: () => goWeb("vhusite-story", { siteArg: slug }),
    }, [
      el("img", { class: "vhu-o-thumb", src: sitePic(img), alt: "" }),
      el("div", { class: "vhu-o-ntx" }, [
        el("p", { class: "vhu-o-nt" }, [t]),
        el("p", { class: "vhu-o-nmeta" }, [
          el("span", { class: "vhu-o-chip" }, [tag]),
          el("span", { class: "vhu-o-date" }, [d]),
        ]),
      ]),
    ])));
}

function vhuEventList() {
  return el("ul", { class: "vhu-o-events" }, VHU_SITE_EVENTS.map(([d, m, t, p, when, slug]) =>
    el("li", {
      class: "vhu-o-hit",
      onclick: () => goWeb("vhusite-event", { siteArg: slug }),
    }, [
      el("div", { class: "vhu-o-evd" }, [
        el("b", {}, [d]),
        el("span", {}, [m]),
      ]),
      el("div", { class: "vhu-o-evt" }, [
        el("p", { class: "vhu-o-evtitle" }, [t]),
        el("p", { class: "vhu-o-evwhere" }, [when]),
        el("p", { class: "vhu-o-evwhen" }, [p]),
      ]),
    ])));
}

/* 「历年新闻稿」：二〇一〇年改版前那批旧稿，按年份分夹挂在新闻页最底。
   这三条原来只能从维基条目最底「外部链接」进去——那条路太窄，多数玩家一辈子走不到。
   挂在这里并不是多写一份正文：点开仍是 /press/ 那套存档版式，跟维基那边同一份数据。
   放在最底是有意的——她得滚过今年的三条和全部活动，才看见「更早」两个字。 */
function vhuSiteArchive() {
  const byYear = {};
  WIKI_NEWS_ORDER.forEach((id) => {
    const n = WIKI_NEWS[id];
    const y = String(n.slug).slice(0, 4);
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push([id, n]);
  });
  return el("div", { class: "vhu-o-arch" }, Object.keys(byYear).sort().reverse().map((y) =>
    el("div", { class: "vhu-o-archy" }, [
      el("p", { class: "vhu-o-arch-y" }, [y + " 年"]),
      el("ul", { class: "vhu-o-arch-list" }, byYear[y].map(([id, n]) =>
        el("li", {
          class: "vhu-o-arch-hit",
          onclick: () => goWeb("wiki-news", { wikiNews: id }),
        }, [
          el("span", { class: "vhu-o-arch-d" }, [n.date]),
          el("span", { class: "vhu-o-arch-t" }, [n.title]),
        ]))),
    ])));
}

function vhuSiteFrame(navCur, inner) {
  return el("div", { class: "hk-site vhu-o-site" }, [
    vhuSiteHead(),
    vhuSiteNav(navCur),
    el("div", { class: "vhu-o-body vhu-o-pbody" }, [
      el("div", { class: "vhu-o-page" }, inner),
    ]),
    vhuSiteFoot(),
  ]);
}

// 内页的图一律 640 宽通栏，不跟着文字缩——2014 年那些站的内页配图就是这样一张压到底。
function vhuSiteFigure(img, cap) {
  return el("figure", { class: "vhu-o-figure" }, [
    el("img", { src: sitePic(img), alt: "" }),
    cap ? el("figcaption", { class: "vhu-o-figcap" }, [cap]) : null,
  ]);
}

function viewVhuSitePage() {
  S.sawVhuSite = true;
  const cur = VHU_SITE_PAGES[S.siteArg] ? S.siteArg : "about";
  const p = VHU_SITE_PAGES[cur];
  return vhuSiteFrame(cur, [
    vhuCrumb([["首页", () => goWeb("vhusite")], [p.nav, null]]),
    el("h1", { class: "vhu-o-ph" }, [p.title || p.nav]),
    p.img ? vhuSiteFigure(p.img, p.cap) : null,
    el("p", { class: "vhu-o-lede" }, [p.lede]),
    el("div", { class: "vhu-o-prose" }, (p.paras || []).map((t) => el("p", {}, [t]))),
    p.facts ? vhuFacts(p.facts) : null,
    p.cols ? vhuCols(p.cols) : null,
    // cols 之后的补充小节（现在只有「学院与学系」用）：标题＋两段，不另做版式。
    p.after ? el("div", { class: "vhu-o-after" }, [
      el("div", { class: "vhu-o-sec-h" }, [el("h2", {}, [p.after.h])]),
      el("div", { class: "vhu-o-prose" }, p.after.paras.map((t) => el("p", {}, [t]))),
      // 补充小节末尾的下一个门。现在只有「学院与学系」用：那一句把人送去 8/21 的新闻稿。
      p.after.link ? el("p", {}, [
        p.after.link[0],
        webLink("新闻稿", () => goWeb("vhusite-story", { siteArg: p.after.link[1] })),
      ]) : null,
    ]) : null,
    p.roll ? vhuSiteRoll(p.roll, p.clue) : null,
    p.lists ? el("div", { class: "vhu-o-index" }, [
      el("div", { class: "vhu-o-sec-h" }, [el("h2", {}, ["新闻稿"])]),
      vhuNewsList(),
      el("div", { class: "vhu-o-sec-h vhu-o-sec-h2" }, [el("h2", {}, ["即将举行"])]),
      vhuEventList(),
      el("div", { class: "vhu-o-sec-h vhu-o-sec-h2" }, [el("h2", {}, ["历年新闻稿"])]),
      el("p", { class: "vhu-o-arch-note" }, ["二〇一〇年网站改版前的稿件，编号未改。"]),
      vhuSiteArchive(),
    ]) : null,
  ]);
}

function viewVhuSiteStory() {
  S.sawVhuSite = true;
  const a = VHU_SITE_STORIES[S.siteArg] || VHU_SITE_STORIES["0912"];
  return vhuSiteFrame("news", [
    vhuCrumb([
      ["首页", () => goWeb("vhusite")],
      ["新闻与活动", () => goWeb("vhusite-page", { siteArg: "news" })],
      [a.tag, null],
    ]),
    el("p", { class: "vhu-o-ameta" }, [
      el("span", { class: "vhu-o-chip" }, [a.tag]),
      el("span", { class: "vhu-o-date" }, [a.date]),
    ]),
    el("h1", { class: "vhu-o-ph vhu-o-ah" }, [a.title]),
    vhuSiteFigure(a.img, a.cap),
    el("p", { class: "vhu-o-lede" }, [a.lede]),
    el("div", { class: "vhu-o-prose" }, a.body.map((t) => el("p", {}, [t]))),
    el("p", { class: "vhu-o-tail" }, [a.tail]),
  ]);
}

function viewVhuSiteEvent() {
  S.sawVhuSite = true;
  const e = VHU_SITE_EVENTPAGES[S.siteArg] || VHU_SITE_EVENTPAGES["1031"];
  return vhuSiteFrame("news", [
    vhuCrumb([
      ["首页", () => goWeb("vhusite")],
      ["新闻与活动", () => goWeb("vhusite-page", { siteArg: "news" })],
      [e.title, null],
    ]),
    el("h1", { class: "vhu-o-ph" }, [e.title]),
    vhuFacts(e.facts),
    e.img ? vhuSiteFigure(e.img, e.cap) : null,
    el("p", { class: "vhu-o-lede vhu-o-lede2" }, [e.lede]),
    el("div", { class: "vhu-o-prose" }, e.body.map((t) => el("p", {}, [t]))),
  ]);
}

/* ---------- 香港日报：院校动态 ---------- */

/* 通搜第二条落在这里。2014 年报纸网站的教育版就是一条一条往下排，
   标题大、正文小、日期灰；没有作者署名，末尾一句「本报讯」。
   四条里只有第一条跟她今晚要找的东西有关：它说得出「校园入门网站」这个名，
   也说得出学生才登得入——但没给网址。网址在维基资料框，门在官网页脚。 */

const HK_NEWS = [
  {
    date: "2014年9月5日",
    tag: "院校",
    title: "维港大学开学　新生改上网确认选科",
    paras: [
      "本报讯　维港大学本周开学，今年取录本科新生一千八百人，五个学院共开设七十四个本科课程。医学院收生分数较去年再升一级，社会科学院及工程学院则与去年相若。",
      "校方今年起不再向一年级生派发纸本选科表。教务处表示，学生须于九月十二日前，经「校园入门网站」自行确认本学期科目；未确认者的选科纪录，将以系统预设为准。",
      "教务处又提醒，校园入门网站只供在学学生及毕业校友登入，家长与公众如要查阅课程资料，可到大学官方网站。两个网站的入口不同，每年都有新生搞错。",
    ],
  },
  {
    date: "2014年8月21日",
    tag: "研究",
    title: "旧楼重建与健康　维大研究：搬迁三年内长者求诊增两成",
    paras: [
      "本报讯　维港大学社会科学院公布一项为期六年的追踪研究，团队于深水埗及观塘两区访问四百二十户旧楼住户，其中一百七十户在研究期间因重建或收购而搬迁。",
      "研究指出，搬迁后首三年，六十五岁以上受访者到公立门诊求诊的次数，平均较搬迁前增加约两成；自评健康状况转差的比例，亦高于没有搬迁的一组。负责研究的团队认为，搬迁本身不是问题，问题是搬到哪里、还剩下谁。",
    ],
  },
  {
    date: "2014年6月30日",
    tag: "医学院",
    title: "维大临床技能中心启用　玛丽医院拨出两层",
    paras: [
      "本报讯　维港大学医学院临床技能中心本月启用，由玛丽医院拨出两层改建，设模拟病房、急救室及一间可与手术室连线观看的示教室。",
      "医学院表示，五年制课程的最后两年全部在医院上课，中心启用后，三、四年级学生可以先在模拟病房练习，再到真实病房。",
    ],
  },
  {
    date: "2014年5月12日",
    tag: "校园",
    title: "海宁堂文化节　旧生回堂再唱一次堂歌",
    paras: [
      "本报讯　维港大学十三间舍堂于上月最后一个星期六同时开门，举办一年一度的舍堂文化节，其中海宁堂回堂旧生逾二百人。",
      "舍堂文化节按传统由堂歌开始。堂歌共三段，唱错歌词的旧生要留下来再唱一次——这一项「罚则」在堂友之间传了二十多年。",
    ],
  },
  // 这一条跟她要查的事完全无关，这是它存在的理由：一版报纸若每条都指向同一件事，
  // 就成了剧情摘要机。顺带把「九龙理工学院」这个名字用第二次——它在维基的分类页里也有一行，
  // 两处都不解释，世界才显得比这条线大。
  {
    date: "2014年4月8日",
    tag: "院校",
    title: "九龙理工学院新校长上任　承诺三年内不调学费",
    paras: [
      "本报讯　九龙理工学院校董会昨日宣布，委任陈立德教授为新任校长，任期五年，八月一日生效。",
      "陈立德表示，未来三年会维持本科学费不变，并计划增建一座学生宿舍。他此前任教于该校工程学院，专长建筑材料。",
    ],
  },
];

function viewHkNews() {
  // 读过这一页，关卡提示才会说「新闻里那个名字」那一句。
  S.sawHkNews = true;
  const head = el("div", { class: "hkd-head" }, [
    el("div", { class: "hkd-brand" }, [
      el("strong", {}, ["香港日报"]),
      el("small", {}, ["HONG KONG DAILY"]),
    ]),
    el("div", { class: "hkd-head-side" }, [
      el("span", {}, ["2014年9月5日　星期五"]),
      el("span", { class: "hkd-ed" }, ["教育"]),
    ]),
  ]);

  const crumb = el("div", { class: "hkd-crumb" }, [
    el("span", { class: "hkd-dead" }, ["首页"]),
    el("span", { class: "hkd-slash" }, ["›"]),
    el("span", { class: "hkd-dead" }, ["教育"]),
    el("span", { class: "hkd-slash" }, ["›"]),
    el("span", {}, ["院校动态"]),
  ]);

  const list = el("div", { class: "hkd-list" }, HK_NEWS.map((n) =>
    el("article", { class: "hkd-item" }, [
      el("div", { class: "hkd-meta" }, [
        el("span", { class: "hkd-date" }, [n.date]),
        el("span", { class: "hkd-tag" }, [n.tag]),
      ]),
      el("h2", { class: "hkd-title" }, [n.title]),
      ...n.paras.map((p) => el("p", { class: "hkd-p" }, [p])),
    ])));

  return el("div", { class: "hk-site hkd-site" }, [
    head,
    el("div", { class: "hkd-body" }, [
      crumb,
      el("h1", { class: "hkd-h1" }, ["维港大学"]),
      el("p", { class: "hkd-lead" }, ["共 47 条报道，显示最近 " + HK_NEWS.length + " 条。"]),
      list,
      el("p", { class: "hkd-fine" }, [
        "以上报道由本报教育组整理　｜　© 2014 香港日报有限公司　版权所有　｜　未经授权不得转载",
      ]),
    ]),
  ]);
}

/* ---------- 空白分页 ---------- */

function viewNewTab() {
  const blankQuery = () => {
    const live = document.getElementById("vhu-blank-q");
    return String((live ? live.value : S.engineDraft) || "").trim();
  };
  const searchWith = (q) => {
    S.engineQ = q;
    S.seSearched = true;
    S.engineDraft = q;
    goWeb("engine");
  };
  // 这一页照当年那台装了搜索栏的 IE 摆：一片白，一个牌子，一格框，底下「我的最爱」。
  // 只有一格——带点的当网址，不带点的拿去搜。从前并排两格（上面「通搜」、下面「输入网址」），
  // 人常把词打进下面那格，点「转到」既不搜也不动，还把刚打的字清掉。
  // 草稿存在 S.engineDraft：重绘（回车、切分页、点「我的最爱」）不会把打到一半的字吞掉。
  const opened = !!S.wikiOpened;
  const submit = (e) => {
    e.preventDefault();
    const q = blankQuery();
    if (!q) {
      // 空着一按：当年首页就是通搜，回车即回首页。没见过的站不抢这一步。
      if (opened) searchWith(SE_HOME_Q);
      return;
    }
    S.engineDraft = q;
    vhuOpenUrl(q);
  };
  const blankInput = el("input", {
    id: "vhu-blank-q",
    type: "text",
    class: "se-input",
    value: S.engineDraft || "",
    placeholder: opened ? "搜寻或输入网址" : "http://",
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": opened ? "搜寻" : "网址",
    oninput: (e) => { S.engineDraft = e.target.value; },
  });
  setTimeout(() => {
    if (document.activeElement !== blankInput) {
      blankInput.focus();
      if (blankInput.setSelectionRange) {
        const at = blankInput.value.length;
        blankInput.setSelectionRange(at, at);
      }
    }
  }, 0);
  // 通搜的牌子只在她见过这个站之后才挂；之前这一页就是一片白加一格地址。
  const brand = !opened ? "" : el("div", { class: "se-brand vhu-blank-brand" }, [
    el("span", { class: "se-logo" }, ["通搜"]),
    el("small", {}, ["香港"]),
  ]);
  return el("div", { class: "hk-site vhu-site vhu-blank" }, [
    el("div", { class: "vhu-blank-inner" }, [
      brand,
      el("form", { class: "se-form se-form-blank", onsubmit: submit }, [
        blankInput,
        el("button", { type: "submit", class: "se-btn" }, [opened ? "搜寻" : "转到"]),
      ]),
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
  if (st.chal) return viewVhuChal(st);

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
    st.need ? el("p", { class: "vhu-msg" }, ["请先登入，方可使用校园网上服务"]) : "",
    // 登出提示与错误讯息不同时出现：刚登出又打错密码时，说了「已登出」再说「密码不对」是两件事挤在一起。
    st.out && !st.err ? el("p", { class: "vhu-msg" }, ["你已登出"]) : "",
    st.err ? el("p", { class: "vhu-err", role: "alert" }, [st.err]) : "",
    el("label", { for: "vhu-id" }, ["学生编号（Student ID）"]),
    idIn,
    el("label", { for: "vhu-pw" }, ["密码（Password）"]),
    pwIn,
    el("button", { type: "submit", class: "vhu-btn vhu-login-btn" }, ["登入"]),
    el("p", { class: "vhu-fine" }, ["登入后请即时更改密码"]),
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
          el("li", {}, ["学生编号为八位数字加一个英文字母"]),
          el("li", {}, ["帐户密码沿用入学时的设定，可于登入后自行更改"]),
          el("li", {}, ["超过两年没有登入的帐户，密码核对后须回答开户时登记的问题"]),
          el("li", {}, ["服务时间：每日 07:00–翌日 01:00"]),
          el("li", {}, ["毕业同学的帐户会转为校友帐户"]),
        ]),
      ]),
      form,
    ]),
    vhuLoginFoot(),
  ], "login");
}

/* 登入页底下那两条系统讯息：登入那一格与验证那一格共用。 */
function vhuLoginFoot() {
  return el("div", { class: "vhu-login-foot" }, [
    el("h3", {}, ["系统讯息"]),
    el("ul", {}, VHU_NOTICES.slice(0, 2).map((n) =>
      // 日子与标题各占一格，靠 li 的 gap 分开，不用全角空格当分隔
      el("li", {}, [
        el("span", { class: "vhu-date" }, [n.date]),
        el("span", { class: "vhu-date-title" }, [n.title]),
      ])
    )),
  ]);
}

/* 密码对了之后那一格。还是同一个登入页，只是下面那块牌子从两格输入换成一条问题：
   「由于此帐户长时间没有登入，为确认身份……」。答案不在这一页上，在公开的条目里。 */
function viewVhuChal(st) {
  const u = VHU_USERS[st.chal];
  const ansIn = el("input", {
    id: "vhu-ans",
    type: "text",
    class: "vhu-input",
    maxlength: "40",
    value: st.ans || "",
    autocomplete: "off",
    spellcheck: "false",
  });
  ansIn.addEventListener("input", () => { st.ans = ansIn.value; });

  const form = el("form", {
    class: "vhu-login-form vhu-chal-form",
    onsubmit: (e) => {
      e.preventDefault();
      vhuVerify();
    },
  }, [
    el("h2", {}, ["身份确认"]),
    el("p", { class: "vhu-msg" }, ["由于此帐户长时间没有登入，为确认身份，请回答开户时登记的问题"]),
    st.err ? el("p", { class: "vhu-err", role: "alert" }, [st.err]) : "",
    el("p", { class: "vhu-chal-id" }, ["帐户　" + u.id + "　" + u.cn]),
    el("p", { class: "vhu-chal-q" }, [u.verify.q]),
    el("label", { for: "vhu-ans" }, ["答案（Answer）"]),
    ansIn,
    el("button", { type: "submit", class: "vhu-btn vhu-login-btn" }, ["确认"]),
    el("p", { class: "vhu-fine" }, ["答案取自公开的学校资料；如忘记，请到校友事务处查询"]),
    el("p", { class: "vhu-login-links" }, [
      webLink("« 返回登入", vhuChalBack),
      vhuSep(),
      webLink("帐户查询", vhuAccountHelp),
    ]),
  ]);

  setTimeout(() => {
    const box = document.getElementById("vhu-ans");
    if (box && document.activeElement !== box) box.focus();
  }, 0);

  return vhuShell([
    el("div", { class: "vhu-login-wrap" }, [
      el("div", { class: "vhu-login-intro vhu-chal-intro" }, [
        el("h1", {}, ["VHU Portal"]),
        el("p", { class: "vhu-login-cn" }, ["身份确认"]),
        el("p", {}, ["密码已于上一步核对。这一步只看一件事：敲键盘的人是不是开户那一个。"]),
        el("ul", {}, [
          el("li", {}, ["问题与答案于开户时登记，系统不作提示。"]),
          el("li", {}, ["答错可以再试，不限次数。"]),
          el("li", {}, ["服务时间：每日 07:00–翌日 01:00。"]),
        ]),
      ]),
      form,
    ]),
    vhuLoginFoot(),
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
    // 本次与上次并排，间隔写在括号里。这一栏是整页最锋利的一处：
    // 官方通告只说「连续两年没有登入会暂停转寄」，这里给出的是九年、十年。
    ["本次登入", "2014年9月5日 23:41　香港"],
    ["上次登入", u.lastLogin + "（距今" + u.lastGap + "）"],
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
      "你的帐户为校友帐户。选科、eLearn 及宿舍服务已停用，学业纪录、图书馆及电邮仍可查阅。",
    ]),
    // 这条原来只在陈家豪那个号上出现。可罗启明的号空了九年，比陈的十年只少一年，
    // 单给一边显示，等于告诉玩家「另一个号还算正常」——而它恰恰是这一关要用的那个。
    el("div", { class: "vhu-alert" }, [
      "本帐户已连续两年以上没有登入，电邮转寄服务已暂停。期间收到的邮件仍保存在信箱内。",
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
    // 「最后登入」原来只写在数据表里、不上屏：她是二〇一四年九月进来的，
    // 而这个号的最后登入停在他毕业那个月。这一行比十行成绩都更能说明他什么时候停的（10-28）。
    ["最后登入", u.lastLogin, u.loginTake],
    ["上次登入距今", u.lastGap],
  ];
  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["我的资料"]),
    el("p", { class: "vhu-note" }, [
      "校友帐户只供查阅。如需更新联络资料，请填写校友事务处的更新表格。",
    ]),
    el("table", { class: "vhu-kv vhu-kv-wide" }, rows.map(([k, v, take]) =>
      el("tr", {}, [el("th", {}, [k]), el("td", {}, [take ? vhuTake(take, v) : v])])
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
        el("td", { class: "vhu-num" + (r[3] === "缺考" ? " vhu-miss" : "") }, [r[3]]),
      ]))),
    ]),
    y.note ? el("p", { class: "vhu-year-note" }, [
      y.clue ? vhuTake(y.clue, y.note) : y.note,
    ]) : null,
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
  // 书名字面量是简体；粤语模式下屏幕上是港繁，有人会照屏幕打「精神醫學」。
  // 两边都过一遍 toHkTrad 再比，简繁输入都认，跟界面语言无关。
  const norm = (s) => (typeof toHkTrad === "function" ? toHkTrad(String(s)) : String(s)).toLowerCase();
  const hit = q
    ? VHU_BOOKS.filter((b) => norm(b.title + b.author + b.call).includes(norm(q)))
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
      : el("table", { class: "vhu-table vhu-book-list" }, [
        el("thead", {}, [el("tr", {}, [
          el("th", {}, ["书名"]),
          el("th", {}, ["作者"]),
          el("th", {}, ["年份"]),
          el("th", {}, ["索书号"]),
          el("th", {}, ["状态"]),
        ])]),
        // 一条一条都能点开：状态那一栏写着「已借出」，接下来去哪儿看，得让它自己开。
        el("tbody", {}, hit.map((b) => el("tr", {
          onclick: () => { goWeb("vhu-book", { bookCall: b.call }); },
        }, [
          el("td", {}, [b.title]),
          el("td", {}, [b.author]),
          el("td", { class: "vhu-num" }, [b.year]),
          el("td", { class: "vhu-mono" }, [b.call]),
          el("td", {}, [b.state]),
        ]))),
      ]);

  // 「他也借过同一本」不是系统给的答案：目录从来不显示借阅人。
  // 这句要她自己在阿明的帐户里翻到借阅纪录，才记下来。
  if (st.who === "law" && typeof noted === "function" && noted("vhu-lib-trace")) {
    note("vhu-same-book", "那一册，他也借过。二〇〇四年一月二十二日借，二月六日还。", "luo");
  }

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
    st.libdone && hit.length ? el("p", { class: "vhu-fine" }, ["按任何一条，可看该册的馆藏状态。"]) : "",
    el("h3", { class: "vhu-h3" }, ["借阅纪录"]),
    el("table", { class: "vhu-table" }, [
      el("thead", {}, [el("tr", {}, [
        el("th", {}, ["借出日期"]),
        el("th", {}, ["书名"]),
        el("th", {}, ["归还日期"]),
      ])]),
      el("tbody", {}, (u.borrow || []).map((r) => el("tr", {}, [
        el("td", { class: "vhu-num" }, [r[0]]),
        // 借阅纪录从不显示别人借过什么，只显示他自己借过。这一本他借了两次：
        // 一月这一笔还了，十一月那一笔没有还（馆藏那边）。同一本书，两个日子（10-28）。
        el("td", {}, [
          r[1] === "精神医学临床手册"
            ? vhuTake({
              id: "vhu-borrow-luo", who: "luo",
              text: "二〇〇四年一月二十二日，他借过《精神医学临床手册》，二月六日还了。",
            }, r[1])
            : r[1],
        ]),
        el("td", { class: "vhu-num" }, [r[2]]),
      ]))),
    ]),
  ], "library");
}

/* ---------- 馆藏纪录 ---------- */

/* 一册一条。借出／应还／逾期只在「已借出」那一册上出现。
   逾期日数按二〇一四年九月七日算（2004-11-19 → 2014-09-07）。
   页面底下两行小字是这一页最要紧的地方：一行说系统每天更新，一行说借阅人不显示——
   两行都成立，所以这本书十年没回来，也没有一个名字。 */
function viewVhuBook() {
  const st = vhuSt();
  const b = VHU_BOOKS.find((x) => x.call === st.book);
  if (!b) {
    return vhuShell([
      el("p", { class: "vhu-back" }, [
        webLink("« 返回目录", () => vhuPage("library")),
      ]),
      el("p", { class: "vhu-empty" }, ["找不到这一册的纪录。"]),
    ], "library");
  }
  const loan = b.loan;
  const rows = [
    ["书名", b.title],
    ["著者", b.author],
    ["出版", b.year],
    ["索书号", b.call, "mono"],
    ["馆藏地", b.shelf || "医学院分馆"],
    ["状态", b.state],
  ];
  if (loan) {
    rows.push(["借出日期", loan.out], ["应还日期", loan.due], ["逾期", bookOverDays(loan.due)]);
    rows.push(["备注", loan.note]);
  }
  if (typeof noted === "function" && loan && !noted("vhu-lib-trace")) {
    note("vhu-lib-trace", "医学院分馆那本《精神医学临床手册》：二〇〇四年十一月五日借出，应还十一月十九日，一直没还。二〇〇五年三月起暂缓催还。", "luo");
  }
  return vhuShell([
    el("p", { class: "vhu-back" }, [
      webLink("« 返回目录", () => vhuPage("library")),
    ]),
    el("h2", { class: "vhu-h2" }, ["馆藏纪录"]),
    el("table", { class: "vhu-kv vhu-kv-wide" }, rows.map(([k, v, cls]) =>
      el("tr", {}, [el("th", {}, [k]), el("td", { class: cls || "" }, [v])]))),
    el("p", { class: "vhu-fine" }, ["本纪录每二十四小时更新一次。"]),
    el("p", { class: "vhu-fine" }, ["借阅纪录依私隐政策不显示借阅人。"]),
  ], "library", "馆藏纪录");
}

/* ---------- 电邮 ---------- */

function viewVhuMail() {
  const st = vhuSt();
  const u = vhuWho();
  const list = vhuMails();
  const sent = vhuSent();
  const mail = st.mail ? list.concat(sent).find((m) => m.id === st.mail) : null;
  if (mail) {
    if (mail.gives && typeof note === "function") note(mail.gives[0], mail.gives[1]);
    const draft = mail.folder === "draft";
    const sentItem = mail.folder === "sent";
    const head = draft
      ? [
        ["收件人", mail.addr + "（未寄出）"],
        ["日期", mail.date + "（最后修改）"],
        ["主旨", mail.subject],
      ]
      : sentItem
        ? [
          // 寄件备份的抬头：自己寄出去的，收件人那一行才是她要看的。
          ["寄件人", u.email],
          ["收件人", mail.to || ""],
          ["日期", mail.date],
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
    const first = m.folder === "draft" || m.folder === "sent" ? (m.folder === "draft" ? m.addr : m.to || "") : m.from;
    return el("tr", {
      class: (m.unread && !read ? "vhu-unread" : "") + " vhu-mail-row",
      onclick: () => { st.read[m.id] = true; goWeb("vhu-mail", { mailId: m.id }); },
    }, [
      el("td", {}, [first]),
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
    sent.length
      ? el("div", {}, [
        el("h3", { class: "vhu-h3" }, ["寄件备份"]),
        el("table", { class: "vhu-table vhu-mail-list" }, [
          el("thead", {}, [el("tr", {}, [
            el("th", {}, ["收件人"]),
            el("th", {}, ["主旨"]),
            el("th", { class: "vhu-num" }, ["日期"]),
          ])]),
          el("tbody", {}, sent.map(row)),
        ]),
      ])
      : "",
    el("p", { class: "vhu-fine" }, ["校友信箱，只保留最近 50 封；附件下载已于 2011 年停用。"]),
  ], "mail");
}

/* ---------- 公告 ---------- */

function viewVhuNotice() {
  const st = vhuSt();
  const all = VHU_NOTICES.concat(VHU_NOTICES_OLD);
  const one = st.notice ? all.find((n) => n.id === st.notice) : null;
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
      // 存档里只有这一条写着人。正文不会提她是谁——那正是要抄下来的地方。
      one.clue ? el("p", { class: "vhu-year-note" }, [
        vhuTake(one.clue, "二〇〇四年十一月十一日，辅导中心延长开放时间。"),
      ]) : null,
    ], "notice");
  }
  const list = (rows) => el("table", { class: "vhu-table vhu-notice-list" }, [
    el("thead", {}, [el("tr", {}, [
      el("th", {}, ["日期"]),
      el("th", {}, ["类别"]),
      el("th", {}, ["标题"]),
    ])]),
    el("tbody", {}, rows.map((n) => el("tr", {
      onclick: () => { goWeb("vhu-notice", { noticeId: n.id }); },
    }, [
      el("td", { class: "vhu-num" }, [n.date]),
      el("td", {}, [n.tag]),
      el("td", {}, [n.title]),
    ]))),
  ]);
  return vhuShell([
    el("h2", { class: "vhu-h2" }, ["校园公告"]),
    list(VHU_NOTICES),
    // 存档压在最底。不写「二〇〇四年」以外的任何提示：要翻到最底的人才看得见。
    el("h3", { class: "vhu-h3" }, ["存档通告"]),
    el("p", { class: "vhu-fine" }, ["按《资料保留政策》保留十年，只作存档，不再更新。"]),
    list(VHU_NOTICES_OLD),
  ], "notice");
}

/* ---------- 图鉴：给后面对线索用 ---------- */
/* 页面只做展示。线索要放进来时，在 VHU_MAILS／VHU_NOTICES 里加一条，
   或在 viewVhuProfile／viewVhuAcademic 里加一行，不要另起一套状态。 */
