/* ---------- 关卡：十六关的表、开场卡、结束卡、清单、存档、跳关 ---------- */

const PARTS = ["", "一 · 住进来", "二 · 夜里", "三 · 星期六", "四 · 上门"];

const noted = (id) => Array.isArray(S.notes) && S.notes.some((n) => n.id === id);
const ev = (id) => hasEvidence(id);
const nightOn = () => !!(S.night && S.night.min !== undefined);
const cnt = (keys, obj) => keys.filter((k) => obj && obj[k]).length;

function seedItems(ids) {
  ids.forEach((id) => fileEvidence(item(id)));
}

function seedNotes(rows) {
  rows.forEach(([id, text]) => note(id, text));
}

const LEVELS = [
  null,
  {
    part: 1, title: "廿八屋", date: "7月31日 夜", place: "她的电脑",
    clock: "2014年7月31日 周四 23:14",
    goal: "找一间今晚之后就能住的房。",
    tasks: [
      { text: "把求助帖顶上去", need: true, done: () => flag("postedHelp"), hint: "帖子沉下去了，顶上去。" },
      { text: "找到一间四条都过得去的房", need: true, done: () => !!(S.known && S.known.rong), hint: "拿四条对着盘看。卡住哪条，就划哪条。" },
      { text: "把「元朗 天水围」删掉，自己搜", done: () => flag("ownSearch") },
      { text: "看看墙簿", after: "墙簿上藤先生的广告", done: () => flag("sawLinAd") },
      { text: "看自己的帖有没有人回", done: () => flag("sawOwnPost") },
      { text: "给业主周留言", show: () => !!(S.known && S.known.rong), done: () => flag("askedOld") },
    ],
    next: "8月1日 15:20　深水埗荣汇街",
    start: () => {
      S.mode = "web";
      S.tab = "house";
      S.screen = flag("postedHelp") ? "home" : "post";
      draw();
    },
    gives: () => {
      flag("postedHelp", true);
      flag("searched", true);
      flag("ownSearch", true);
      S.known.rong = true;
      S.four = { pay: ["荃湾两房"], guar: ["荃湾两房"], now: ["大角咀套房"] };
      seedNotes([["bbs-self", "藤先生回过我的求助帖，丢了个荣汇街的盘连结。"]]);
    },
  },
  {
    part: 1, title: "荣汇街28号", date: "8月1日 15:20", place: "荣汇街 28 号 4 楼",
    clock: "2014年8月1日 周五 15:20",
    goal: "看清这间屋，跟周生谈妥。",
    tasks: [
      { text: "屋里看清四样东西", count: () => [cnt(["family", "car", "sill", "door"], S.view), 4], need: true, done: () => cnt(["family", "car", "sill", "door"], S.view) >= 4, hint: "厅里的相和车、走廊尽头的门、主房窗台，我还没看齐。" },
      { text: "问周生一句", need: true, done: () => !!(S.view && S.view.asked), hint: "问他一句再说。" },
      { text: "跟他一起看主房窗台", after: "他踩住窗台那圈水印", done: () => flag("sawSillTour") },
      { text: "问他一个人住怕不怕", done: () => flag("debtSlip") },
    ],
    advance: { when: "8月1日", where: "交定金，拿钥匙", fn: () => payDeposit() },
    next: "当晚　你一个人",
    start: () => startViewing(),
    gives: () => {
      S.view = { family: true, car: true, sill: true, door: true, asked: true };
      flag("sawSillTour", true);
      markPlace("rong-hall");
    },
  },
  {
    part: 1, title: "唐楼后座", date: "8月1日 夜～8月13日", place: "后座",
    clock: "2014年8月1日 夜",
    goal: "住下来，看清这间屋。",
    tasks: [
      { text: "屋里的样子，记下至少四样", need: true, count: () => [baseCount(), 4], done: () => baseCount() >= 4, hint: "屋里的东西，我还没看清，至少四样。" },
      { text: "日历上，夜里那卷录音", after: "08-13 的录音「只有水」", need: true, show: () => !!S.calOpen, done: () => ev("rec-water"), hint: "有一夜水管响，我开了录音。" },
      { text: "日历上别的日子", show: () => !!S.calOpen, count: () => [cnt(["08-03", "08-07", "08-08", "08-10", "08-12"], S.calSeen), 5], done: () => cnt(["08-03", "08-07", "08-08", "08-10", "08-12"], S.calSeen) >= 5 },
    ],
    advance: { when: "8月14日　傍晚", where: "荣汇街后座", fn: () => finishLevel(3), modes: ["cal"] },
    next: "8月14日 傍晚　后座",
    start: () => moveInStart(),
    gives: () => {
      S.base = { car: true, tap: true, storage: true, sill: true, family: true };
      S.calSeen = { "08-03": true, "08-07": true, "08-08": true, "08-10": true, "08-12": true, "08-13": true };
      seedItems(["rec-water"]);
      seedNotes([
        ["move-car", "车头朝窗。敞篷座位里没有灰。"],
        ["move-tap", "关上之后还会滴。周说修过。"],
        ["tap-fixed", "水龙头修好了。真的不滴了。"],
        ["car-still", "车放到角落，第二天还在；你放回茶几，车头朝窗。"],
      ]);
    },
  },
  {
    part: 2, title: "异样", date: "8月14日 傍晚～8月15日 凌晨", place: "后座（夜）",
    clock: "2014年8月14日 周四 傍晚",
    goal: "今晚，留意这间屋。",
    tasks: [
      { text: "夜里再看一遍这间屋", after: "三组不一样的，摆在一起", need: true, count: () => (nightOn() ? [pairCount(), 3] : null), done: () => pairCount() >= 3, hint: () => (nightOn() ? "先在屋里找出跟搬进来那晚不一样的东西，再点「摆在一起」。" : "") },
      { text: "开录音", show: nightOn, done: () => ev("rec-axuan") || noted("voice") },
      { text: "打 999", show: nightOn, done: () => flag("called999") },
      { text: "打给阿乐", show: nightOn, done: () => flag("calledLok") },
      { text: "敲周生的门", show: nightOn, done: () => flag("knockedZhou") },
    ],
    next: "天亮",
    start: () => startChange(),
    gives: () => {
      S.tonight = { car: true, tap: true, storage: true, sill: true, print: true };
      S.pairs = { car: true, tap: true, storage: true };
      flag("photoSill", true);
      seedItems(["photo-sill", "photo-print", "rec-axuan"]);
      seedNotes([["car-move", "车自己转了方向。"], ["voice", "女人声「阿轩，返嚟食饭。」从储物室门底那边来。"], ["print", "门底下伸出一小截湿脚印，到一半停住。"]]);
    },
  },
  {
    part: 2, title: "关怀", date: "8月15日 早～8月16日 午", place: "前座门口、电脑、手机",
    clock: "2014年8月15日 周五 早上",
    goal: "这里怪怪的，说不清，也没人信，怎么办？",
    tasks: [
      { text: "出门，经过前座门口", after: "周问我脚湿不湿", need: true, done: () => ev("note-dry"), hint: "前座门口，我还没经过。" },
      { text: "倾偈表姐", need: true, done: () => !!(S.chatLogs && S.chatLogs.mei16 && S.chatLogs.mei16.closed), hint: "表姐一直在等我回。" },
      { text: "接陈家豪电话", need: true, show: () => !!(S.chatLogs && S.chatLogs.mei16 && S.chatLogs.mei16.closed), done: () => flag("howardCalled"), hint: "表姐说姐夫会打来。" },
      { text: "拿到诊所地址", need: true, show: () => flag("howardCalled"), done: () => flag("clinicAddr"), hint: "地址他说会发到手机。" },
      { text: "给玩具车和水龙头各拍一张", need: true, show: () => !!(S.chatLogs && S.chatLogs.mei16 && S.chatLogs.mei16.closed), count: () => [cnt(["photo-car-out", "photo-tap-out"], { "photo-car-out": ev("photo-car-out"), "photo-tap-out": ev("photo-tap-out") }), 2], done: () => ev("photo-car-out") && ev("photo-tap-out"), hint: "车同水喉，先拍好。" },
      { text: "电话里，追问姐夫一句", after: "问陈「不太好」是什么意思", show: () => flag("howardCalled"), done: () => flag("askedWorry") },
      { text: "问姐夫为什么这么急", after: "问陈为什么这么快", show: () => flag("howardCalled"), done: () => flag("askedWhyFast") },
    ],
    advance: { when: "8月16日　16:00", where: "湾仔澄心诊所", fn: () => finishLevel(5) },
    next: "8月16日 16:00　湾仔澄心诊所",
    start: () => enterHub("dawn", flag("knockedZhou") ? "hall" : "front"),
    gives: () => {
      flag("knockedZhou", true);
      flag("howardCalled", true);
      flag("clinicAddr", true);
      S.chatLogs.mei16 = { lines: [["she", "……"]], step: 99, closed: true };
      seedItems(["note-dry", "photo-car-out", "photo-tap-out"]);
      seedNotes([["wet", "周开口就问我脚湿不湿。我没同他讲过脚印。"]]);
    },
  },
  {
    part: 2, title: "澄心初诊", date: "8月16日 16:00", place: "澄心候诊、诊室",
    clock: "2014年8月16日 周六 16:00",
    goal: "终于有人肯听，把屋里的事说清楚。",
    tasks: [
      { text: "候诊，看上一个出来的人", after: "候诊，那个倒拿杂志的人", need: true, done: () => noted("linWait"), hint: "候诊那个人。" },
      { text: "诊室里看三样：执照、抽屉、电脑一角", need: true, count: () => [cnt(["lic", "drawer", "list"], S.clinicLooked), 3], done: () => cnt(["lic", "drawer", "list"], S.clinicLooked) >= 3, hint: "这间房，我还没看清楚。" },
      { text: "把你搜集的东西给他看", need: true, done: () => !!(S.handed && S.handed.ok6), hint: "讲到屋的时候，把最要紧的给他看。" },
    ],
    next: "8月16日 21:40　回到后座",
    start: () => goClinic(),
    gives: () => {
      S.handed = { ok6: true };
      S.homework = { n: 6, body: HOMEWORK[6] };
      seedNotes([["linWait", "上一个病人。瘦，戴细框眼镜。笑很客气，人很奇怪。五官记不住。"]]);
    },
  },
  {
    part: 2, title: "两分钟", date: "8月16日 夜～8月20日 夜", place: "后座、电脑",
    clock: "2014年8月16日 周六 21:40",
    goal: "照他说的写时间，看它什么时候动。",
    tasks: [
      { text: "拿出门前那两张相，写「十六号晚」", need: true, done: () => ev("paper-16"), hint: "出门前那两张相，拿出来。" },
      { text: "试两次：盯住两分钟，离开两分钟", after: "8月20日试了两次：盯两分钟，离开两分钟", need: true, show: () => ev("paper-16"), count: () => [cnt(["watch", "bath"], S.tries), 2], done: () => ev("paper-20"), hint: () => (ev("paper-16") ? "望住它两分钟；再离开两分钟，两次都要试。" : "") },
      { text: "发第一帖", need: true, done: () => flag("serial1"), hint: "讨论区，把这一周写上去。" },
      { text: "周在门口，听他说完", after: "周在门口说「两分钟」", show: () => !!S.tries.bath, done: () => noted("zhouTwo") },
      { text: "门口那锅汤", after: "阿乐的短讯，门口的凉汤", show: () => !!S.tries.bath, done: () => flag("lokSoup") },
    ],
    advance: { when: "8月23日　16:00", where: "湾仔澄心诊所", fn: () => finishLevel(7) },
    next: "8月23日 16:00　澄心",
    start: () => enterHub("home16"),
    gives: () => {
      S.tries = { watch: true, bath: true };
      seedItems(["paper-16", "paper-20"]);
    },
  },
  {
    part: 3, title: "纸上，心里", date: "8月23日 16:00", place: "澄心候诊、诊室、楼下",
    clock: "2014年8月23日 周六 16:00",
    goal: "纸和录音都带齐了，看他怎么说。",
    tasks: [
      { text: "候诊，看一眼", after: "候诊，那个人把杂志递给你", need: true, done: () => S.visitSeen && S.visitSeen[2], hint: "候诊。" },
      { text: "把你搜集的东西给他看", need: true, done: () => !!(S.handed && S.handed.ok8), hint: "这一周写的纸，交给他。" },
      { text: "分两堆", need: true, show: () => !!(S.handed && S.handed.ok8), done: () => !!S.sorted, hint: "纸上写的，同我心里信的，分开。" },
    ],
    next: "当晚　后座",
    start: () => clinic2(),
    gives: () => {
      S.handed = Object.assign(S.handed || {}, { ok8: true });
      S.sorted = true;
      S.homework = { n: 8, body: HOMEWORK[8] };
      seedNotes([["clinic2", "第二次。他信我写的时间，未信鬼。上一个时段拖过，他说不关我。"], ["bento", "楼下便当。姐夫叫我快回去，又低声叫他不要上门。像怕他真的会去。"]]);
    },
  },
  {
    part: 3, title: "无声", date: "8月23日 夜～8月27日", place: "后座、美娟家、电话",
    clock: "2014年8月23日 周六 22:10",
    goal: "关掉录音过一夜，再把前后对上。",
    tasks: [
      { text: "关掉录音，写「没有录音的一夜」", need: true, done: () => ev("paper-norec"), hint: "作业说，有一夜不开录音。" },
      { text: "星期日去美娟家", after: "去美娟家吃饭", need: true, done: () => ev("note-notsaid"), hint: "星期日，去美娟家。" },
      { text: "回后座，过几晚", after: "8月27日表姐来电，她听到水声", need: true, show: () => ev("note-notsaid"), done: () => ev("note-meiwater"), hint: () => (ev("note-notsaid") ? "水龙头又在滴。" : "") },
      { text: "做对照纸：头两个礼拜，十五号之后", need: true, done: () => ev("paper-30"), hint: "对照纸还没写好。至少四行，哪边先不一样。" },
      { text: "发第二帖", need: true, done: () => flag("serial2"), hint: "讨论区，第二帖。" },
    ],
    advance: { when: "8月30日　16:00", where: "湾仔澄心诊所", fn: () => finishLevel(9) },
    next: "8月30日 16:00　澄心",
    start: () => enterHub("norec"),
    gives: () => {
      S.compare = { "car:L": "base:car", "car:R": "tonight:car", "tap:L": "base:tap", "tap:R": "tonight:tap", "shoe:R": "note-dry", "time:R": "paper-20" };
      seedItems(["paper-norec", "note-notsaid", "note-meiwater", "paper-30"]);
    },
  },
  {
    part: 3, title: "是人？", date: "8月30日 16:00", place: "澄心",
    clock: "2014年8月30日 周六 16:00",
    goal: "他还是不信是屋，怎么让他看见？",
    tasks: [
      { text: "候诊，走廊里看一眼", after: "走廊擦肩那个人", need: true, done: () => S.visitSeen && S.visitSeen[3], hint: "候诊。" },
      { text: "把你搜集的东西给他看", need: true, done: () => !!(S.handed && S.handed.ok10), hint: "对照纸交给他。" },
      { text: "听他今日怎么说", after: "吵", need: true, done: () => flag("fought3"), hint: "听他讲完。" },
      { text: "看他读我的纸", after: "他读周问脚湿那行", need: true, done: () => noted("clinic3"), hint: "" },
    ],
    next: "8月31日　后座",
    start: () => clinic3(),
    gives: () => {
      S.handed = Object.assign(S.handed || {}, { ok10: true });
      flag("fought3", true);
      S.homework = { n: 10, body: HOMEWORK[10] };
      seedNotes([["clinic3", "第三次。上一个号又拖过。抽屉里有封未开的信。他读了两次周问脚湿那句，说更像人。"]]);
    },
  },
  {
    part: 3, title: "再等一周", date: "8月31日～9月5日", place: "电脑、后座、楼梯口",
    clock: "2014年8月31日 周日 夜",
    goal: "再记一个礼拜，撑到星期六。",
    tasks: [
      { text: "8月31日夜车又转，打给他", need: true, done: () => noted("offhours"), hint: "车又转了，我想打给他。" },
      { text: "去楼梯口看看", after: "周知道星期六有人来", need: true, show: () => noted("offhours"), done: () => ev("note-zhoutue"), hint: "楼梯口，我还没去。" },
      { text: "日历点开三天，收成补充纸", need: true, show: () => noted("offhours"), count: () => [cnt(["09-01", "09-02", "09-04"], S.cal11), 3], done: () => ev("paper-06"), hint: "九月头。点开三天就够。" },
      { text: "发第三帖", need: true, done: () => flag("serial3"), hint: "讨论区，第三帖。" },
      { text: "表姐来电", show: () => noted("offhours"), done: () => flag("meiTue") },
    ],
    advance: { when: "9月6日　16:00", where: "湾仔澄心诊所", fn: () => finishLevel(11) },
    next: "9月6日 16:00　澄心",
    start: () => enterHub("week"),
    gives: () => {
      S.cal11 = { "09-01": true, "09-02": true, "09-04": true };
      seedItems(["note-zhoutue", "paper-06"]);
      seedNotes([["offhours", "他先问纸，然后叫我不要再打。一周一次。"]]);
    },
  },
  {
    part: 3, title: "今夜的约定", date: "9月6日 16:00", place: "澄心",
    clock: "2014年9月6日 周六 16:00",
    goal: "他得亲自来看，不然说不清。",
    tasks: [
      { text: "前台看一眼", after: "前台，阿文刚走", need: true, done: () => S.visitSeen && S.visitSeen[4], hint: "" },
      { text: "再看一次抽屉", after: "抽屉：鱼牌不见了", need: true, done: () => !!(S.clinicLooked && S.clinicLooked.drawer4), hint: "抽屉。上次那块白色的东西。" },
      { text: "问他", need: true, done: () => flag("clinicAvoid"), hint: "姐夫那句，今日要问。" },
      { text: "把你搜集的东西给他看", need: true, done: () => !!(S.handed && S.handed.ok12), hint: "补充纸交给他。" },
      { text: "偷看预约表", done: () => !!(S.clinicLooked && S.clinicLooked.sched) },
    ],
    next: "9月6日 21:40　后座",
    start: () => clinic4(),
    gives: () => {
      flag("clinicAvoid", true);
      S.handed = Object.assign(S.handed || {}, { ok12: true });
      seedNotes([["clinic4", "第四次。他约今晚上门。观察，不是治疗。"]]);
    },
  },
  {
    part: 4, title: "三秒钟", date: "9月6日 21:40", place: "后座",
    clock: "2014年9月6日 周六 21:40",
    goal: "带他走一遍，让他亲眼看见。",
    tasks: [
      { text: "走廊尽头", need: true, done: () => noted("notsame"), hint: "走廊尽头，那卷录音的地方。" },
      { text: "水龙头", need: true, done: () => noted("delay"), hint: "带他去厨房。" },
      { text: "他走后，贴储物室门听", need: true, show: () => !!(S.visit && S.visit.left), done: () => noted("phone-you"), hint: "储物室那边，我还没听过。" },
      { text: "送他到门口", after: "门口，周递毛巾", done: () => !!(S.visit && S.visit.towel) },
      { text: "带他看全家福", done: () => !!(S.visit && S.visit.family) },
    ],
    advance: { when: "9月7日　16:10", where: "湾仔澄心诊所", fn: () => finishLevel(13) },
    next: "9月7日 16:10　澄心",
    start: () => visitHome(),
    gives: () => {
      seedNotes([["notsame", "我们看见的不是同一只。"], ["delay", "阿明：延迟三秒。人为可以做到。"], ["phone-you", "周在储物室打电话。有一个你。"]]);
    },
  },
  {
    part: 4, title: "罗医生的秘密", date: "9月7日 16:10", place: "澄心诊室、走廊、邮箱",
    clock: "2014年9月7日 周日 16:10",
    goal: "去拿他说整理好的笔记。本子不在。",
    tasks: [
      { text: "看一眼他的工作台", after: "他去倒水时，看工作台", need: true, done: () => noted("stolen"), hint: "桌上的东西，我还没看清。" },
      { text: "去走廊", after: "走廊碰到陈家豪", need: true, show: () => noted("stolen"), done: () => !!(S.miss && S.miss.chen), hint: "走廊那边，我还没去。" },
      { text: "手机响了，看完", show: () => !!(S.miss && S.miss.chen), after: "打开邮件，两个附件都看", need: true, count: () => (S.miss && (S.miss.att1 || S.miss.att2) ? [cnt(["att1", "att2"], S.miss), 2] : null), done: () => ev("mail-dirt"), hint: "" },
      { text: "把那封信给他看", after: "给他看", show: () => ev("mail-dirt"), done: () => flag("showedDirt") },
      { text: "翻廿八屋：西贡山泥、市建局荣汇街", show: () => ev("mail-dirt"), done: () => noted("twofiles") },
      { text: "回家，听周一句，看门口", after: "楼梯口周一句；铁闸差一格；门底干水印", need: true, show: () => ev("mail-dirt"), done: () => noted("day-trace"), hint: "回家。" },
    ],
    advance: {
      when: "9月7日　傍晚",
      where: "荣汇街楼梯口",
      fn: () => (noted("day-trace") ? finishLevel(14) : missHome()),
      ready: () => noted("stolen") && !!(S.miss && S.miss.chen) && ev("mail-dirt"),
    },
    next: "当晚　后座",
    start: () => missAppt(),
    gives: () => {
      S.miss = { chen: true, att1: true, att2: true };
      seedItems(["mail-dirt"]);
      seedNotes([
        ["forget", "事实他记得。画面跟不回白房。"],
        ["stolen", "上门行程被删了。现场笔记不见。"],
        ["dirt", "二〇〇四年十一月，维港大学，女学生坠楼。名字涂掉，露出一个鱼。"],
        ["zhou-day", "周说他白天来过。他下午明明在诊所。"],
        ["day-trace", "铁闸差一格。门垫挪过。储物室门底多一截干水印。"],
      ]);
    },
  },
  {
    part: 4, title: "你知道", date: "9月7日 夜", place: "后座、电脑、走廊",
    clock: "2014年9月7日 周日 23:40",
    goal: "今晚等他，这栋楼和周得弄清楚。",
    tasks: [
      { text: "打给他", after: "录音叫了我的名字，打给他", need: true, done: () => flag("calledMing2"), hint: "打给他。" },
      { text: "他到门口，听他讲", after: "他来了，在门口叫出一个字", need: true, show: () => flag("calledMing2"), done: () => noted("countbreath"), hint: "" },
      { text: "有人敲门，听他要什么", after: "周来要天台钥匙", need: true, show: () => false, done: () => flag("roofKeyAsked"), hint: "" },
      { text: "还没看的旧闻：西贡、市建局", after: "翻了西贡山泥、市建局荣汇街两篇", show: () => flag("calledMing2") && !noted("twofiles"), done: () => noted("twofiles") },
      { text: "想想天台白天的样子", after: "想起天台白天的样子", show: () => flag("calledMing2"), done: () => !!S.searchRoof },
      { text: "上楼前问他白天", after: "他认：企喺楼梯，冇揿门铃", show: () => false, done: () => noted("day-admit") },
    ],
    advance: { when: "9月7日　夜", where: "他来了", fn: () => mingReturn(), modes: ["search"], ready: () => flag("calledMing2") },
    next: "约一小时后",
    start: () => nightName(),
    gives: () => {
      flag("calledMing2", true);
      flag("roofKeyAsked", true);
      flag("keptMing", true);
      seedItems(["rec-name"]);
      seedNotes([
        ["namecall", "鬼叫我的名字。它说我知。"],
        ["countbreath", "他叫出了一个字：鱼。"],
        ["day-admit", "他说白天站在楼梯。没按门铃。不该问我。"],
      ]);
    },
  },
  {
    part: 4, title: "天台", date: "9月8日 00:41", place: "后楼梯、天台",
    clock: "2014年9月8日 周一 00:41",
    goal: "上去，别让他留在上面。",
    tasks: [
      { text: "开门，跑上后楼梯", need: true, done: () => flag("ranUp"), hint: "" },
      { text: "走到他身边", after: "叫他的名字", need: true, show: () => flag("ranUp"), done: () => flag("calledName"), hint: "" },
      { text: "拉住他", after: "抓住他的手腕", need: true, show: () => flag("calledName"), done: () => flag("grabbed"), hint: "" },
    ],
    next: "",
    start: () => roofNight(),
    gives: () => {
      flag("ranUp", true);
      flag("calledName", true);
      flag("grabbed", true);
    },
  },
];

/* ---------- 分段测试：?level=N 从关头进，?level=N&seg=b 从关中间进，?test 看目录 ---------- */

const SEGS = {
  1: [
    { key: "b", name: "帖已顶，自己搜", go: () => { flag("postedHelp", true); S.mode = "web"; S.tab = "house"; S.screen = "home"; draw(); } },
    { key: "c", name: "荣汇街详情", go: () => { flag("postedHelp", true); flag("ownSearch", true); S.mode = "web"; S.tab = "house"; goWeb("detail", { listing: "ssp" }); } },
  ],
  2: [
    { key: "b", name: "看完房，交定金", go: () => { LEVELS[2].gives(); payDeposit(); } },
  ],
  3: [
    { key: "b", name: "两周日历", go: () => { S.base = { car: true, tap: true, storage: true, sill: true }; twoWeeks(); } },
  ],
  4: [
    { key: "b", name: "入夜", go: () => nightStart() },
  ],
  5: [
    { key: "b", name: "倾偈表姐", go: () => { flag("knockedZhou", true); seedItems(["note-dry"]); S.hub = { id: "dawn", at: "hall" }; startChat("mei16"); } },
    { key: "c", name: "陈家豪来电", go: () => { flag("knockedZhou", true); seedItems(["note-dry"]); S.chatLogs.mei16 = { lines: [["she", "……"]], step: 99, closed: true }; S.hub = { id: "dawn", at: "hall" }; howardCall(); } },
  ],
  6: [
    { key: "b", name: "诊室（候诊已过）", go: () => { S.visitSeen = { 1: true }; S.clinicLooked = {}; seedNotes([["linWait", "上一个病人。瘦，戴细框眼镜。笑很客气，人很奇怪。五官记不住。"]]); enterClinic(1); } },
    { key: "c", name: "坐下谈，把搜集的给他看", go: () => { S.visitSeen = { 1: true }; S.clinic = { visit: 1, seg: 3 }; clinicTalk(); } },
  ],
  7: [
    { key: "b", name: "回到屋里", go: () => { seedItems(["paper-16"]); enterHub("home16", "hall"); } },
    { key: "c", name: "二十号夜，两分钟", go: () => { seedItems(["paper-16"]); enterHub("home16", "bath"); } },
  ],
  8: [
    { key: "b", name: "楼下便当", go: () => { LEVELS[8].gives(); clinicDoorChen(); } },
  ],
  9: [
    { key: "b", name: "美娟家吃饭", go: () => { S.recOff = true; seedItems(["paper-norec"]); enterHub("norec", "mei"); } },
    { key: "c", name: "对照纸", go: () => {
      S.recOff = true;
      S.base = Object.assign({ car: true, tap: true, storage: true, sill: true, family: true }, S.base || {});
      S.tonight = Object.assign({ car: true, tap: true, storage: true, sill: true, print: true }, S.tonight || {});
      S.pairs = Object.assign({ car: true, tap: true, storage: true }, S.pairs || {});
      seedItems(["note-dry", "rec-water", "rec-axuan", "photo-sill", "photo-print", "paper-16", "paper-20", "paper-norec", "note-notsaid", "note-meiwater"]);
      enterHub("norec", "hall");
      openCompare(finishCompare);
    } },
  ],
  10: [],
  11: [
    { key: "b", name: "打过电话之后", go: () => { seedNotes([["offhours", "他先问纸，然后叫我不要再打。一周一次。"]]); enterHub("week", "hall"); } },
    { key: "c", name: "一周日历", go: () => { seedNotes([["offhours", "他先问纸，然后叫我不要再打。一周一次。"]]); enterHub("week", "hall"); openWeekCal(() => keepThen(item("paper-06"), backToHub)); } },
  ],
  12: [
    { key: "b", name: "坐下谈，问他", go: () => { S.visitSeen = { 4: true }; S.clinicLooked = { drawer4: true }; S.clinic = { visit: 4, seg: 0 }; clinic4Talk(); } },
  ],
  13: [
    { key: "b", name: "他走之后", go: () => { S.visit = { family: true, left: true }; seedNotes([["notsame", "我们看见的不是同一只。"], ["delay", "阿明：延迟三秒。人为可以做到。"]]); enterHub("visit", "corridor"); } },
  ],
  14: [
    { key: "b", name: "邮件", go: () => { S.miss = { desk: true, chen: "quiet" }; seedNotes([["stolen", "上门行程被删了。现场笔记不见。"]]); enterHub("miss", "room"); } },
  ],
  15: [
    { key: "b", name: "等阿明，翻新闻", go: () => { seg15(); goSearch(); } },
    { key: "c", name: "他来了", go: () => { seg15(); mingReturn(); } },
    { key: "d", name: "上楼前", go: () => { seg15(); seg15b(); roofApproach(); } },
    { key: "e", name: "屋里等", go: () => { seg15(); seg15b(); roofWait(); } },
  ],
  16: [
    { key: "b", name: "结算卡", go: () => { LEVELS[16].gives(); ending(); } },
  ],
};

function seg15() {
  flag("calledMing2", true);
  seedItems(["rec-name"]);
  seedNotes([["namecall", "鬼叫我的名字。它说我知。"]]);
}

function seg15b() {
  flag("keptMing", true);
  flag("roofKeyAsked", true);
  seedNotes([["countbreath", "他叫出了一个字：鱼。"]]);
}

/* 旧版 ?preview=1..26 的分段，对到现在的关和段 */
const PREVIEW_TO = {
  1: [1], 2: [2], 3: [3], 4: [4], 5: [4, "b"], 6: [5, "c"], 7: [6], 8: [7], 9: [7, "b"], 10: [7, "c"],
  11: [8], 12: [9], 13: [9], 14: [9, "b"], 15: [10], 16: [11], 17: [11], 18: [12], 19: [13], 20: [14],
  21: [15], 22: [15, "b"], 23: [15, "c"], 24: [15, "d"], 25: [16], 26: [16, "b"],
};

/* ---------- 清单 ---------- */

function levelNow() {
  return LEVELS[S.level] || null;
}

function taskText(t) {
  const c = t.count ? t.count() : null;
  const done = t.done();
  return (done && t.after ? t.after : t.text) + (c && !done ? "（" + c[0] + "／" + c[1] + "）" : "");
}

function levelReady() {
  const L = levelNow();
  if (!L) return true;
  return L.tasks.every((t) => !t.need || t.done());
}

function levelHint() {
  const L = levelNow();
  if (!L) return "";
  const say = (x) => (typeof x.hint === "function" ? x.hint() : x.hint);
    const t = L.tasks.find((x) => x.need && !x.done() && (!x.show || x.show()) && say(x));
  return t ? say(t) : "";
}

function levelAdvance() {
  if (S.paused) return null;
  if (S.mode === "wait" && S.wait) return Object.assign(splitGo(S.wait.btn || "继续"), { fn: S.wait.go });
  const L = levelNow();
  if (!L || !L.advance) return null;
  if (!(L.advance.modes || ["hub"]).includes(S.mode)) return null;
  if (!(L.advance.ready ? L.advance.ready() : levelReady())) return null;
  return L.advance;
}

let taskHeard = { level: -1, done: [] };

function taskTick(L) {
  const done = L.tasks.map((t) => !!t.done());
  const fresh = taskHeard.level === S.level && done.some((d, i) => d && !taskHeard.done[i]);
  taskHeard = { level: S.level, done };
  if (fresh) sfx("tick");
}

function renderLevelBox() {
  const L = levelNow();
  if (L && S.mode !== "end") taskTick(L);
  if (typeof renderDiaryIndex === "function") renderDiaryIndex();
}

// 日记簿「待办事项」那一页：必做在上；空一行，可做的用虚线圈、颜色浅一点，不写「可做可不做」
function levelBlocks() {
  const L = levelNow();
  if (!L || S.mode === "end") return [];
  const shown = L.tasks.filter((t) => !t.show || t.done() || t.show());
  const row = (t) => {
    const done = t.done();
    return el("li", { class: (done ? "done" : "") + (t.need ? "" : " opt") }, [
      el("span", { class: "task-mark", "aria-hidden": "true" }, [done ? "✓" : t.need ? "○" : ""]),
      taskText(t),
    ]);
  };
  const need = shown.filter((t) => t.need);
  const opt = shown.filter((t) => !t.need);
  const blocks = [el("p", { class: "diary-note level-name" }, [L.goal])];
  if (need.length) blocks.push(el("ul", { class: "task-list" }, need.map(row)));
  if (opt.length) blocks.push(el("ul", { class: "task-list opt-list" }, opt.map(row)));
  const hint = levelHint();
  if (hint) blocks.push(el("p", { class: "diary-note task-hint" }, [hint]));
  if (S.homework) blocks.push(el("h4", { class: "diary-sub" }, ["作业"]), el("p", { class: "diary-note" }, [S.homework.body]));
  return blocks;
}

function paperPages() {
  const pages = [];
  if (S.level <= 2 || Object.keys(S.four || {}).length) pages.push(["四条", openFour]);
  if (S.level >= 3) pages.push([S.level <= 3 ? "屋里的样子" : "搬进来那晚", openBase]);
  if (S.level === 4 && nightOn()) pages.push(["摆在一起", () => openPairs(() => afterModalClose())]);
  if (S.level === 9 && ev("paper-norec") && ev("note-meiwater")) {
    pages.push(["对照纸", () => openCompare(finishCompare)]);
  }
  return pages;
}

/* ---------- 开场卡、结束卡 ---------- */

function enterLevel(n, carry) {
  stopNightClock();
  closeModal();
  closeNotes();
  if (mapLayer) mapLayer.hidden = true;
  S.level = n;
  S.levelMark = { ev: (S.evidence || []).map((e) => e.id), skip: {} };
  S.talk = null;
  S.wait = null;
  S.paused = null;
  S.hub = null;
  S.mode = "card";
  if (LEVELS[n].clock) setTime(LEVELS[n].clock);
  saveLevel(n);
  S.card = carry ? { type: "start", n, from: carry.from, kept: carry.kept, missed: carry.missed } : { type: "start", n };
  draw();
}

function finishLevel(n) {
  stopNightClock();
  closeModal();
  closeNotes();
  S.talk = null;
  S.paused = null;
  const mark = S.levelMark || { ev: [], skip: {} };
  const kept = (S.evidence || []).filter((e) => !mark.ev.includes(e.id)).map((e) => e.kind + "　" + e.title);
  const missed = Object.entries(mark.skip || {}).filter(([id]) => !hasEvidence(id)).map(([, t]) => t);
  if (LEVELS[n + 1]) return enterLevel(n + 1, { from: n, kept, missed });
  S.mode = "card";
  S.card = { type: "end", n, kept, missed };
  draw();
}

function noteSkip(it) {
  if (!it || !it.id) return;
  S.levelMark = S.levelMark || { ev: [], skip: {} };
  S.levelMark.skip[it.id] = it.kind + "　" + it.title;
  S.skipAll = S.skipAll || {};
  S.skipAll[it.id] = it.kind + "　" + it.title;
}

const CARD_NIGHT = [3, 4, 7, 9, 11, 13, 15];
const CARD_NIGHT_OWN = [4, 9, 11, 15];

function cardBgName(n) {
  if (n <= 1) return "";
  if ([6, 8, 10, 12, 14].includes(n)) return "场景-候诊";
  if (n === 16) return "场景-天台";
  if (CARD_NIGHT.includes(n)) return "场景-夜里后座厅";
  return "场景-后座厅";
}

function cardBg(n) {
  const name = cardBgName(n);
  if (!name) return "";
  if (name === "场景-夜里后座厅" && !CARD_NIGHT_OWN.includes(n)) return pic(4, name);
  return pic(n, name);
}

// 各底图中间区域原始亮度差很大（候诊约 195、厅约 97、天台约 67、夜里厅约 43），压到看起来同一暗度
const CARD_LUM = { "场景-候诊": 0.16, "场景-后座厅": 0.32, "场景-天台": 0.4, "场景-夜里后座厅": 0.62 };

function stageFilled() {
  return !!(stage && stage.children && stage.children.length);
}

function paintStageFallback(msg) {
  clearStage();
  const desk = el("div", { class: "desk caption-card" });
  desk.append(el("div", { class: "caption-text" }, [
    el("p", { class: "caption-line" }, [msg || "画面打不开，请刷新重试。"]),
    el("div", { class: "caption-acts" }, [
      el("button", {
        type: "button",
        class: "caption-go",
        onclick: () => { try { location.reload(); } catch (e) { /* 无 */ } },
      }, ["刷新"]),
    ]),
  ]));
  stage.append(desk);
  renderPlaybar();
}

let _recoveringStage = false;

// leave／clearStage 之后若台是空的，补一屏，避免只剩 body 的灰蓝底
function recoverEmptyStage() {
  if (stageFilled() || _recoveringStage) return stageFilled();
  _recoveringStage = true;
  try {
    try {
      if (S && LEVELS[S.level]) {
        enterLevel(S.level);
        if (stageFilled()) return true;
      }
    } catch (e) {
      console.error(e);
    }
    try {
      if (typeof newGame === "function") {
        newGame();
        if (stageFilled()) return true;
      }
    } catch (e) {
      console.error(e);
    }
    try {
      paintStageFallback("画面打不开，请刷新重试。");
    } catch (e) {
      console.error(e);
    }
    return stageFilled();
  } finally {
    _recoveringStage = false;
  }
}

function drawCard() {
  clearStage();
  try {
    const c = S.card || {};
    if (c.type === "test") {
      const kids = [
        el("p", { class: "talk-loc" }, ["暗度　第一章　分段测试"]),
        el("p", { class: "fine" }, ["每关都能单独进。前面各关的必拿物和笔记自动补上，不读存档。"]),
        el("ul", { class: "test-list" }, LEVELS.slice(1).map((lv, i) => {
          const n = i + 1;
          return el("li", {}, [
            el("span", { class: "test-lv" }, [n + " · " + lv.title]),
            el("a", { href: testHref(n) }, ["从关头"]),
            ...(SEGS[n] || []).map((s) => el("a", { href: testHref(n, s.key) }, [n + s.key + " " + s.name])),
          ]);
        })),
      ];
      const bg = cardBg(c.n);
      const desk = el("div", { class: "desk beat level-card" + (bg ? " scene-desk" : "") });
      if (bg) desk.append(imgSlot(bg, "scene-plate", ""));
      desk.append(el("div", { class: "beat-card" }, kids));
      stage.append(desk);
      renderPlaybar();
      return;
    }
    drawCaption(c, LEVELS[c.n]);
  } catch (err) {
    console.error(err);
  }
  // 回收走 recoverEmptyStage 会再进 enterLevel→drawCard，这里只贴兜底，避免死循环
  if (!stageFilled() && !_recoveringStage) {
    try { paintStageFallback("画面打不开，请刷新重试。"); }
    catch (e2) { console.error(e2); }
  }
}

function captionShell(bg, lum) {
  const desk = el("div", { class: "desk caption-card" });
  if (bg) {
    desk.style.setProperty("--plate-lum", lum || 0.4);
    desk.append(imgSlot(bg, "caption-plate", ""));
  }
  // 先淡出，再跑回调（回调里通常 clearStage）。不要先拆 desk 再加载——抛错会留下空台（只剩 body 灰蓝）。
  const leave = (fn) => () => {
    if (desk.dataset.leaving) return;
    desk.dataset.leaving = "1";
    desk.classList.add("leaving");
    setTimeout(() => {
      try {
        if (typeof fn === "function") fn();
      } catch (err) {
        console.error(err);
      }
      if (desk.parentNode) desk.remove();
      if (!stageFilled()) recoverEmptyStage();
    }, 600);
  };
  const go = (label, fn) => el("button", { type: "button", class: "caption-go", onclick: leave(fn) }, [label]);
  return { desk, go, leave };
}

function drawCaption(c, L) {
  c = c || {};
  const kept = Array.isArray(c.kept) ? c.kept : [];
  const { desk, go, leave } = captionShell(cardBg(c.n), CARD_LUM[cardBgName(c.n)]);
  const kids = [];
  if (c.type === "resume") {
    kids.push(...resumeCaption(c, L, go, leave));
  } else if (c.type === "start") {
    const prev = c.from && LEVELS[c.from];
    if (prev) desk.classList.add("has-prev");
    if (prev && !kept.length) desk.classList.add("no-kept");
    kids.push(
      prev && kept.length ? el("ul", { class: "caption-kept" }, kept.map((t) => el("li", {}, [t]))) : "",
      prev && prev.next ? el("p", { class: "caption-next" }, [prev.next]) : "",
      el("p", { class: "caption-line" }, [(L && L.goal) || "继续。"]),
      el("div", { class: "caption-acts" }, [go("嗯……", startLevelNow)])
    );
  } else {
    kids.push(
      kept.length ? el("ul", { class: "caption-kept" }, kept.map((t) => el("li", {}, [t]))) : "",
      el("div", { class: "caption-acts" }, [go("……", () => ending())])
    );
  }
  desk.append(el("div", { class: "caption-text" }, kids));
  stage.append(desk);
  renderPlaybar();
}

function startLevelNow() {
  const n = S.card && S.card.n;
  S.card = null;
  if (!LEVELS[n] || typeof LEVELS[n].start !== "function") return;
  LEVELS[n].start();
}

/* ---------- 存档、跳关 ---------- */
// 每进一关在关头存一档（slots）。开局可选已玩过的关从头再玩；选较早的关会清掉后面的档。
// current：这一关玩到一半时的进度，给「继续」用。

const SAVE_KEY = "undo-ch1-save";
const SAVE_VER = 2;
// paused／modal／card 不入库；hub 要留（id／at），不然「继续」进了网页回不了唐楼
const SKIP_KEYS = ["talk", "wait", "paused", "modal", "card", "diaryLeaf", "clinic"];

function snapState() {
  const snap = JSON.parse(JSON.stringify(S, (k, v) => (typeof v === "function" || v instanceof Node ? undefined : v)));
  SKIP_KEYS.forEach((k) => delete snap[k]);
  // 浏览器只是叠层：存成房间，避免读档后停在网页、底栏变灰
  if (snap.mode === "web" && S.level > 1) {
    if (S.paused && S.paused.mode && S.paused.mode !== "web") snap.mode = S.paused.mode;
    else if (S.hub) snap.mode = "hub";
  }
  if (snap.hub && typeof snap.hub === "object") {
    snap.hub = { id: snap.hub.id, at: snap.hub.at };
  }
  return snap;
}

function emptyStore() {
  return { ver: SAVE_VER, max: 0, slots: {}, current: null };
}

function readStore() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;
    if (data.ver === SAVE_VER && data.slots) {
      const max = Number(data.max) || 0;
      if (!max && !data.current) return null;
      return data;
    }
    // 旧档：只有一格 { n, S }
    if (data.n && data.S && LEVELS[data.n]) {
      return {
        ver: SAVE_VER,
        max: data.n,
        slots: { [String(data.n)]: data.S },
        current: { n: data.n, S: data.S },
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(store));
  } catch (e) {
    /* 存不了就算 */
  }
}

function clearStore() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 无 */ }
}

function migrateEvidenceImgs() {
  (S.evidence || []).forEach((e) => {
    if (e.img && !e.img.includes("/")) e.img = (ITEMS[e.id] && ITEMS[e.id].img) || "";
  });
}

function saveLevel(n) {
  if (!LEVELS[n]) return;
  const store = readStore() || emptyStore();
  const snap = snapState();
  store.ver = SAVE_VER;
  store.slots = store.slots || {};
  store.slots[String(n)] = snap;
  store.max = Math.max(Number(store.max) || 0, n);
  store.current = { n, S: snap };
  writeStore(store);
}

// 关内进度：只更新 current，不改各关关头档
function saveProgress() {
  if (!S || !S.level || !LEVELS[S.level]) return;
  if (S.mode === "end" || S.mode === "card") return;
  const store = readStore() || emptyStore();
  store.ver = SAVE_VER;
  store.max = Math.max(Number(store.max) || 0, S.level);
  store.current = { n: S.level, S: snapState() };
  writeStore(store);
}

function readSave() {
  const store = readStore();
  if (!store) return null;
  const n = (store.current && store.current.n) || store.max;
  return LEVELS[n] ? { n, store } : null;
}

function applySnap(snap) {
  S = Object.assign(initial(), snap && typeof snap === "object" ? snap : {});
  if (!Array.isArray(S.notes)) S.notes = [];
  if (!Array.isArray(S.evidence)) S.evidence = [];
  if (!S.flags || typeof S.flags !== "object") S.flags = {};
  if (!S.known || typeof S.known !== "object") S.known = {};
  if (!S.chatLogs || typeof S.chatLogs !== "object") S.chatLogs = {};
  migrateEvidenceImgs();
  renderNotes();
}

function loadSave() {
  try {
    const store = readStore();
    if (!store) return newGame();
    const cur = store.current;
    if (cur && cur.S && LEVELS[cur.n]) {
      applySnap(cur.S);
      // 旧档可能把 mode 存成 web 又丢掉 paused／hub → 卡在浏览器
      if (S.mode === "web" && S.level > 1) {
        if (typeof leaveBrowserToRoom === "function" && leaveBrowserToRoom()) {
          /* 已回房间 */
        } else if (LEVELS[S.level] && typeof LEVELS[S.level].start === "function") {
          LEVELS[S.level].start();
        } else {
          draw();
        }
      } else if (S.mode && S.mode !== "card" && S.mode !== "end") {
        draw();
      } else {
        enterLevel(cur.n);
      }
    } else if (store.max && store.slots && store.slots[String(store.max)]) {
      loadCheckpoint(store.max, true);
    } else {
      newGame();
    }
  } catch (err) {
    console.error(err);
    try { clearStore(); S = initial(); renderNotes(); enterLevel(1); }
    catch (e2) { console.error(e2); }
  }
  if (!stageFilled()) recoverEmptyStage();
}

// 关头档缺失时（旧档只有 current／max）：按跳关同样方式补齐 1…n-1 的 gives
function buildCheckpointSnap(n) {
  const bak = S;
  S = initial();
  for (let i = 1; i < n; i++) {
    if (LEVELS[i] && LEVELS[i].gives) LEVELS[i].gives();
  }
  const snap = snapState();
  S = bak;
  return snap;
}

function resumeMax(store, fallback) {
  return Math.max(
    Number(store && store.max) || 0,
    (store && store.current && store.current.n) || 0,
    fallback || 0,
    1
  );
}

// keepLater：true = 不删后面的档；false = 从这一关重开，后面作废
// 选关进某一关时总会把 current 拨回该关关头档，避免停在半截进度上
function loadCheckpoint(n, keepLater) {
  try {
    const store = readStore();
    if (!store || !LEVELS[n]) {
      newGame();
    } else {
      store.slots = store.slots || {};
      let snap = store.slots[String(n)];
      if (!snap || typeof snap !== "object") {
        snap = buildCheckpointSnap(n);
        store.slots[String(n)] = snap;
      }
      if (!keepLater) {
        Object.keys(store.slots).forEach((k) => {
          if (Number(k) > n) delete store.slots[k];
        });
        store.max = n;
      }
      store.current = { n, S: snap };
      store.ver = SAVE_VER;
      writeStore(store);
      applySnap(snap);
      enterLevel(n);
    }
  } catch (err) {
    console.error(err);
    try { clearStore(); S = initial(); renderNotes(); enterLevel(1); }
    catch (e2) { console.error(e2); }
  }
  if (!stageFilled()) recoverEmptyStage();
}

function newGame() {
  clearStore();
  S = initial();
  renderNotes();
  setTime(S.time);
  enterLevel(1);
}

// 开局存档 C：问句 + 底栏「继续　选关　重来」；选关展开 1…max
function resumeCaption(c, L, go, leave) {
  const store = readStore() || emptyStore();
  const max = resumeMax(store, c.n);
  if ((Number(store.max) || 0) < max) {
    store.max = max;
    writeStore(store);
  }
  const curN = (store.current && store.current.n) || max;
  const curTitle = (LEVELS[curN] && LEVELS[curN].title) || "";
  const pickHost = el("div", { class: "caption-levels", hidden: true });

  // 选关：确认后直接进关（不走淡出），避免 leave→clearStage 抛错留下空台
  // keepLater 仅当点的是当前最远关（不删后面的档）
  const pickLevel = (n) => {
    if (!LEVELS[n] || n < 1 || n > max) return;
    if (n < max && !window.confirm("从第 " + n + " 关重开，第 " + (n + 1) + " 关及之后的进度会清掉。确定？")) {
      return;
    }
    loadCheckpoint(n, n >= max);
  };

  const openPick = (btn) => {
    const show = pickHost.hidden;
    pickHost.hidden = !show;
    btn.classList.toggle("on", show);
    if (!show) return;
    pickHost.replaceChildren();
    for (let i = 1; i <= max; i++) {
      if (!LEVELS[i]) continue;
      const n = i;
      pickHost.append(el("button", {
        type: "button",
        class: "caption-lv" + (n === curN ? " now" : ""),
        onclick: () => pickLevel(n),
      }, [n + ". " + LEVELS[n].title]));
    }
  };

  const cont = el("div", { class: "resume-item" }, [
    el("button", {
      type: "button",
      class: "resume-link",
      onclick: leave(() => loadSave()),
    }, ["继续"]),
    el("span", { class: "resume-mark" }, [curN + ". " + curTitle]),
  ]);
  const pickBtn = el("button", {
    type: "button",
    class: "resume-link",
    onclick: () => openPick(pickBtn),
  }, ["选关"]);
  const redo = el("button", {
    type: "button",
    class: "resume-link",
    onclick: leave(() => newGame()),
  }, ["重来"]);

  return [
    el("p", { class: "caption-line" }, [L ? L.goal : "暗度"]),
    el("div", { class: "caption-acts resume-bar" }, [cont, pickBtn, redo]),
    pickHost,
  ];
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => { try { saveProgress(); } catch (e) { /* 无 */ } });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") try { saveProgress(); } catch (e) { /* 无 */ }
  });
}

// 跳关补上的东西当作以前看过：墙簿不响，日记簿收集的东西不打点
function markPastSeen() {
  wallMarkAllSeen();
  S.evOpened = S.evOpened || {};
  (S.evidence || []).forEach((e) => { S.evOpened[e.id] = true; });
}

function jumpLevel(n, segKey) {
  S = initial();
  for (let i = 1; i < n; i++) LEVELS[i].gives();
  renderNotes();
  const seg = segKey && (SEGS[n] || []).find((s) => s.key === segKey);
  if (!seg) {
    enterLevel(n);
    markPastSeen();
    return;
  }
  S.level = n;
  S.levelMark = { ev: (S.evidence || []).map((e) => e.id), skip: {} };
  S.mode = "card";
  if (LEVELS[n].clock) setTime(LEVELS[n].clock);
  markPastSeen();
  seg.go();
  markPastSeen();
  renderNotes();
}

function testHref(n, key) {
  return "?level=" + n + (key ? "&seg=" + key : "");
}

function bootGame() {
  const q = new URLSearchParams(location.search);
  if (q.has("test")) {
    S.mode = "card";
    S.card = { type: "test" };
    draw();
    return;
  }
  const old = PREVIEW_TO[Number(q.get("preview"))];
  if (old) return jumpLevel(old[0], old[1]);
  const jump = Number(q.get("level"));
  if (LEVELS[jump]) return jumpLevel(jump, q.get("seg"));
  const store = readStore();
  if (store && ((store.max | 0) >= 1 || store.current)) {
    const n = (store.current && store.current.n) || store.max || 1;
    S.mode = "card";
    S.card = { type: "resume", n };
    draw();
    return;
  }
  enterLevel(1);
}
