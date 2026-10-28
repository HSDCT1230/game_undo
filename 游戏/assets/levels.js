/* ---------- 关卡：十六关的表、开场卡、结束卡、清单、存档、跳关 ---------- */

/* 章内分段。号和名分开存：排版交给 CSS（号小、名正），不在字符串里拼「一 · 住进来」
   这种靠空格和中点撑出来的分隔——那是生成的痕迹，不是排版。
   PART_NO 只在旧的开局卡上出现过（编号 + 部名 + 「5 / 16」那一行元信息）。
   开局卡要的是「上次停在哪」，不是进度条；那一行已经拿掉，编号也就没有地方用了。 */
const PARTS = ["", "住进来", "夜里", "星期六", "上门"];

const noted = (id) => Array.isArray(S.notes) && S.notes.some((n) => n.id === id);
const ev = (id) => hasEvidence(id);
const nightOn = () => !!(S.night && S.night.min !== undefined);
const cnt = (keys, obj) => keys.filter((k) => obj && obj[k]).length;

// 第 3 关日历的十三天（08-01…08-13，与 CAL_DAYS 同一份顺序）。
// 任务条计数与 done() 共用这一份，别再手抄两遍——抄两遍就会出现「条子写 13、判定看 12」。
const CAL13 = ["08-01", "08-02", "08-03", "08-04", "08-05", "08-06", "08-07", "08-08", "08-09", "08-10", "08-11", "08-12", "08-13"];

function seedItems(ids) {
  ids.forEach((id) => fileEvidence(item(id)));
}

/* 第三格是「这一行指向谁」：有就进簿子「两个人」那一栏，没有就只在时间线上。
   who 用短名（"luo"／"zhou"），跟 PEOPLE 的 key 对得上；写中文名也认（whoRows 两边都比）。 */
function seedNotes(rows) {
  rows.forEach(([id, text, who]) => note(id, text, who));
}

const LEVELS = [
  null,
  {
    part: 1, title: "廿八屋", date: "7月31日 夜", place: "她的电脑",
    clock: "2014年7月31日 周四 23:14",
    goal: "上廿八屋，今晚就搵到可以搬入去嘅房。",
    goalZh: "上廿八屋，今晚就找到能搬进去的房间。",
    tasks: [
      { text: "把求助帖顶上去", need: true, done: () => flag("postedHelp"), hint: "帖子沉下去了，顶上去" },
      { text: "找到一间四条都过得去的房", need: true, done: () => !!(S.known && S.known.rong), hint: "日记簿里那四条，一间一间对过去" },
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
      S.viewTried = { tk: true, tw: true, wc: true };
      S.known.rong = true;
      S.four = { pay: ["荃湾两房"], guar: ["荃湾两房"], now: ["大角咀套房"] };
      seedNotes([["bbs-self", "藤先生回了我的求助帖。丢了个荣汇街的盘连结。"]]);
    },
  },
  {
    part: 1, title: "荣汇街28号", date: "8月1日 15:20", place: "荣汇街 28 号 4 楼",
    clock: "2014年8月1日 周五 15:20",
    goal: "看清这间屋，跟周生谈妥。",
    tasks: [
      { text: "屋里看清四样东西", count: () => [cnt(["family", "car", "sill", "door"], S.view), 4], need: true, done: () => cnt(["family", "car", "sill", "door"], S.view) >= 4, hint: "厅里的相和车、走廊尽头的门、主房窗台，我还没看齐" },
      { text: "问周生一句", need: true, done: () => !!(S.view && S.view.asked), hint: "问他一句再说" },
      { text: "跟他一起看主房窗台", after: "他的手盖住窗台那圈水印", done: () => flag("sawSillTour") },
      { text: "问他一个人住怕不怕", done: () => flag("debtSlip") },
      { text: "上廿八屋，看清市建局那条「持续研究」", after: "市建局：深水埗指定范围持续研究", need: true, show: () => !!flag("uraGate"), done: () => noted("web-ura"), hint: "廿八屋新闻中心，七月廿二那条。看过不算，要记进簿里" },
    ],
    // 这里不能用通用的 levelReady()：第 5 条要 flag("uraGate") 才现身，而 uraGate 是在
    // 「交定金」那场对话里才置位的——等它，门就永远锁着（曾实测复现：四样看清、问过周生，
    // 没有按钮也没有提示）。先按「现在看得见的必做」放行，进了对话那条自己会浮出来。
    advance: { when: "8月1日", where: "交定金，拿钥匙", fn: () => payDeposit(), ready: readyShown },
    next: "当晚　后座",
    start: () => startViewing(),
    gives: () => {
      S.view = { family: true, car: true, sill: true, door: true, asked: true };
      flag("sawSillTour", true);
      markPlace("rong-hall");
      seedItems(["obj-keytag"]);
    },
  },
  {
    part: 1, title: "唐楼后座", date: "8月1日 夜～8月13日", place: "后座",
    clock: "2014年8月1日 夜",
    goal: "住下来，看清这间屋。",
    tasks: [
      { text: "屋里的样子，记下至少四样", need: true, count: () => [baseCount(), 4], done: () => baseCount() >= 4, hint: "屋里的东西，我还没看清，至少四样" },
      { text: "日历上，夜里那卷录音", after: "08-13 的录音「只有水」", need: true, show: () => !!S.calOpen, done: () => ev("rec-water"), hint: "有一夜水管响，我开了录音" },
      // 十三天是这一关的正事：一天一格，看完才翻到十四号。
      // 从前这条不是必做，可任务条照样写「0／13」——点两格也能按「往下」，等于没住过这两个礼拜。
      { text: "日历上十三天，一天一天看过", after: "八月一日到十三日，一天一天看过", need: true, show: () => !!S.calOpen, count: () => [cnt(CAL13, S.calSeen), 13], done: () => cnt(CAL13, S.calSeen) >= 13, hint: "日历上还有日子没点开，一直到十三号" },
    ],
    advance: { when: "8月14日　夜", where: "荣汇街后座", fn: () => twoWeekCalm(), modes: ["cal"] },
    next: "8月14日 夜　后座",
    start: () => moveInStart(),
    gives: () => {
      S.base = { car: true, tap: true, storage: true, sill: true, family: true };
      S.calSeen = { "08-01": true, "08-02": true, "08-03": true, "08-04": true, "08-05": true, "08-06": true, "08-07": true, "08-08": true, "08-09": true, "08-10": true, "08-11": true, "08-12": true, "08-13": true };
      seedItems(["rec-water"]);
      seedNotes([
        ["move-car", "车头朝窗。敞篷座位里没有灰。"],
        ["move-tap", "关上还会滴。周说修过。"],
        ["tap-fixed", "水龙头修好了。不滴了。"],
        ["car-still", "车放到角落，第二天还在。放回茶几，车头朝窗。"],
      ]);
    },
  },
  {
    part: 2, title: "异样", date: "8月14日 夜～8月15日 凌晨", place: "后座（夜）",
    clock: "2014年8月14日 周四 夜",
    // 这一关原来没有 goal，关头底下靠一句「继续。」凑数。现在目标只在日记簿里露面，
    // 空着就是一页空白，补一句真话：她今晚要做的就这两件。
    goal: "再看一遍这间屋，天光之前做个决定。",
    tasks: [
      { text: "夜里再看一遍这间屋", after: "三组不一样的，摆在一起", need: true, count: () => (nightOn() ? [pairCount(), 3] : null), done: () => pairCount() >= 3, hint: () => (nightOn() ? "先在屋里找出跟搬进来那晚不一样的东西，再点「摆在一起」" : "") },
      { text: "天光之前做个决定：敲门，或者忍到天亮", after: "这一夜的两种走法", need: true, show: nightOn, done: () => flag("knockedZhou") || noted("whisper"), hint: "摆好之后，门在那边——敲，或者不敲" },
      // 这一条从前不是必做，于是录音整夜可以不按——第 8 关他照样「戴上耳机听录音」，
      // 第 9 关又照样叫「有一晚唔好开录音」。剧本已经当她录过了，机制没跟上。
      // 两种达成都要求录音键开着：一个是拿着那卷，一个是整夜在带子上（见 waitDawn）。
      { text: "开录音", need: true, show: nightOn, done: () => ev("rec-axuan") || noted("voice"), hint: () => (!(S.night && S.night.recording)
        ? "手机在茶几上。先开录音，这一夜才录得到"
        : nightAct("heardAxuan")
          ? "录音开着，带子也听过了"
          : "录音开着。回屋里，点一下储物室门底") },
      { text: "打 999", show: nightOn, done: () => flag("called999") },
      { text: "打给阿乐", show: nightOn, done: () => flag("calledLok") },
      { text: "敲周生的门", show: nightOn, done: () => flag("knockedZhou") },
    ],
    next: "天亮　前座门口",
    start: () => nightStart(),
    gives: () => {
      S.tonight = { car: true, tap: true, storage: true, sill: true, print: true };
      S.pairs = { car: true, tap: true, storage: true };
      flag("photoSill", true);
      seedItems(["photo-sill", "photo-print", "rec-axuan"]);
      seedNotes([["car-move", "车头朝门。昨晚放的时候朝窗。"], ["voice", "女人声「阿轩，返嚟食饭。」从储物室门底来。"], ["print", "门底湿脚印，到一半停住。"]]);
    },
  },
  {
    part: 2, title: "关怀", date: "8月15日 早～8月16日 午", place: "前座门口、电脑、手机",
    clock: "2014年8月15日 周五 早上",
    goal: "这里怪怪的，说不清，也没人信，怎么办？",
    tasks: [
      { text: "出门，经过前座门口", after: "周问我脚湿不湿", need: true, done: () => ev("note-dry"), hint: "前座门口，我还没经过" },
      { text: "倾偈表姐", need: true, done: () => !!(S.chatLogs && S.chatLogs.mei16 && S.chatLogs.mei16.closed), hint: "表姐一直在等我回" },
      { text: "接陈家豪电话", need: true, show: () => !!(S.chatLogs && S.chatLogs.mei16 && S.chatLogs.mei16.closed), done: () => flag("howardCalled"), hint: "表姐说姐夫会打来" },
      { text: "拿到诊所地址", show: () => flag("howardCalled"), done: () => flag("clinicAddr"), hint: "地址他说会发到手机" },
      { text: "给玩具车和水龙头各拍一张", need: true, show: () => !!(S.chatLogs && S.chatLogs.mei16 && S.chatLogs.mei16.closed), count: () => [cnt(["photo-car-out", "photo-tap-out"], { "photo-car-out": ev("photo-car-out"), "photo-tap-out": ev("photo-tap-out") }), 2], done: () => ev("photo-car-out") && ev("photo-tap-out"), hint: "用自己的拍立得。车同水喉，各拍一张，夹进簿里" },
      { text: "电话里，追问姐夫一句", after: "问陈「不太好」是什么意思", show: () => flag("howardCalled"), done: () => flag("askedWorry") },
      { text: "问姐夫为什么这么急", after: "问陈为什么这么快", show: () => flag("howardCalled"), done: () => flag("askedWhyFast") },
    ],
    advance: { when: "8月16日　出门前", where: "荣汇街后座门口", fn: () => finishLevel(5) },
    next: "8月16日 出门前　后座门口",
    start: () => enterHub("dawn", flag("knockedZhou") ? "hall" : "front"),
    gives: () => {
      flag("knockedZhou", true);
      flag("howardCalled", true);
      flag("clinicAddr", true);
      S.chatLogs.mei16 = { lines: [["she", "……"]], step: 99, closed: true };
      seedItems(["note-dry", "photo-car-out", "photo-tap-out"]);
      seedNotes([["wet", "周问我脚湿不湿。我没同他讲过脚印。"]]);
    },
  },
  {
    part: 2, title: "澄心初诊", date: "8月16日 出门前～16:00", place: "后座门口、澄心候诊、诊室",
    clock: "2014年8月16日 周六 14:50",
    goal: "把屋里的事，一样一样说给他听。",
    tasks: [
      { text: "记下门口收回，收好红圈信封", need: true, done: () => noted("takeback") && ev("letter-red"), hint: "楼梯口那一幕，信封角。记进日记簿再出门" },
      { text: "诊室里看三样：执照、抽屉、电脑一角", need: true, show: () => noted("takeback") && ev("letter-red"), count: () => [cnt(["lic", "drawer", "list"], S.clinicLooked), 3], done: () => cnt(["lic", "drawer", "list"], S.clinicLooked) >= 3, hint: "这间房，我还没看清楚" },
      { text: "把你搜集的东西给他看", need: true, show: () => noted("takeback") && ev("letter-red"), done: () => !!(S.handed && S.handed.ok6), hint: "讲到屋的时候，把最要紧的给他看" },
    ],
    next: "8月16日 21:40　后座",
    start: () => startTakeback(),
    gives: () => {
      S.handed = { ok6: true };
      S.homework = { n: 6, body: HOMEWORK[6] };
      seedNotes([
        ["linWait", "上一个病人。瘦，细框眼镜。笑很客气。五官记不住。"],
        ["takeback", "出门赴诊前，周说要收回。手抖，信封朝里。他说重建，又说未定。"],
      ]);
      seedItems(["letter-red"]);
    },
  },
  {
    part: 2, title: "两分钟", date: "8月16日 夜～8月20日 夜", place: "后座、电脑",
    clock: "2014年8月16日 周六 21:40",
    goal: "照他说的写时间，看它什么时候动。",
    tasks: [
      { text: "拿出门前那两张相，写「十六号晚」", need: true, done: () => ev("paper-16"), hint: "出门前那两张相，拿出来" },
      { text: "试两次：盯住两分钟，离开两分钟", after: "8月20日试了两次：盯两分钟，离开两分钟", need: true, show: () => ev("paper-16"), count: () => [cnt(["watch", "bath"], S.tries), 2], done: () => ev("paper-20"), hint: () => (ev("paper-16") ? "望住它两分钟；再离开两分钟，两次都要试" : "") },
      { text: "发第一帖", need: true, done: () => flag("serial1"), hint: "厅里那台电脑，这一帖还没发出去" },
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
      { text: "把你搜集的东西给他看", need: true, done: () => !!(S.handed && S.handed.ok8), hint: "这一周写的纸，交给他" },
      { text: "分两堆", need: true, show: () => !!(S.handed && S.handed.ok8), done: () => !!S.sorted, hint: "纸上写的，同我心里信的，分开" },
    ],
    next: "当晚　后座",
    start: () => clinic2(),
    gives: () => {
      S.handed = Object.assign(S.handed || {}, { ok8: true });
      S.sorted = true;
      S.homework = { n: 8, body: HOMEWORK[8] };
      seedNotes([["clinic2", "第二次。他信我写的时间。叫我有一夜不开录音。"], ["bento", "楼下便当。姐夫叫我快回去，又低声叫他不要上门。"]]);
    },
  },
  {
    part: 3, title: "无声", date: "8月23日 夜～8月27日", place: "后座、美娟家、电话",
    clock: "2014年8月23日 周六 22:10",
    // 他有没有听过那卷录音，决定他下一句医嘱从哪儿说出口：听过的说「关一晚」，
    // 没听过的只能说「由今晚起日日录」。目标句子跟着分两版。
    goal: () => (flag("playedRec")
      ? "他听过那卷。他叫我关一晚，睇下车仲郁唔郁。"
      : "他叫我由今晚起日日录，留一晚唔开。我睇下分别。"),
    goalZh: () => (flag("playedRec")
      ? "他听过那卷。他叫我关一晚，看车还动不动。"
      : "他叫我由今晚起天天录，留一晚不开。我看看分别。"),
    tasks: [
      { text: "关掉录音，写「没有录音的一夜」", need: true, done: () => ev("paper-norec"), hint: "作业说，有一夜不开录音" },
      { text: "星期日去美娟家", after: "去美娟家吃饭", need: true, done: () => ev("note-notsaid"), hint: "星期日，去美娟家" },
      { text: "回后座，过几晚", after: "8月27日表姐来电，她听到水声", need: true, show: () => ev("note-notsaid"), done: () => ev("note-meiwater"), hint: () => (ev("note-notsaid") ? "水龙头又在滴" : "") },
      { text: "做对照纸：头两个礼拜，十五号之后", need: true, done: () => ev("paper-30"), hint: "对照纸还没写好。四行，其中一行要是鞋印" },
      { text: "发第二帖", need: true, done: () => flag("serial2"), hint: "厅里那台电脑，这一帖还没发出去" },
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
      { text: "把你搜集的东西给他看", need: true, done: () => !!(S.handed && S.handed.ok10), hint: "对照纸交给他" },
      { text: "听他今日怎么说", after: "吵", need: true, done: () => flag("fought3"), hint: "听他讲完" },
      { text: "看他读我的纸", after: "他读周问脚湿那行", need: true, done: () => noted("clinic3"), hint: "" },
    ],
    next: "8月31日　后座",
    start: () => clinic3(),
    gives: () => {
      S.handed = Object.assign(S.handed || {}, { ok10: true });
      flag("fought3", true);
      S.homework = { n: 10, body: HOMEWORK[10] };
      seedNotes([["clinic3", "第三次。上一个号又拖过。抽屉里有封未开的信。他读了两次周问脚湿那句。"]]);
    },
  },
  {
    part: 3, title: "再等一周", date: "8月31日～9月5日", place: "电脑、后座、楼梯口",
    clock: "2014年8月31日 周日 夜",
    goal: "再记一个礼拜，撑到星期六。",
    tasks: [
      { text: "8月31日夜车又转，打给他", need: true, done: () => noted("offhours"), hint: "车又转了，我想打给他" },
      { text: "去楼梯口看看，翻翻他门边的月历", after: "周说星期六有人来；月历上涂掉的那一格", need: true, show: () => noted("offhours"), done: () => ev("note-zhoutue") && !!flag("zhoucal"), hint: "楼梯口还没去。他门边那本月历也没关严" },
      { text: "日历点开三天，收成补充纸", need: true, show: () => noted("offhours"), count: () => [cnt(["09-01", "09-02", "09-04"], S.cal11), 3], done: () => ev("paper-06"), hint: "九月头，点开三天就够" },
      { text: "发第三帖", need: true, done: () => flag("serial3"), hint: "厅里那台电脑，这一帖还没发出去" },
      { text: "表姐来电", show: () => noted("offhours"), done: () => flag("meiTue") },
    ],
    advance: { when: "9月6日　16:00", where: "湾仔澄心诊所", fn: () => finishLevel(11) },
    next: "9月6日 16:00　澄心",
    start: () => enterHub("week"),
    gives: () => {
      S.cal11 = { "09-01": true, "09-02": true, "09-04": true };
      seedItems(["note-zhoutue", "paper-06"]);
      seedNotes([["offhours", "他先问纸，叫我不要再打。一周一次。"]]);
    },
  },
  {
    part: 3, title: "今夜的约定", date: "9月6日 16:00", place: "澄心",
    clock: "2014年9月6日 周六 16:00",
    goal: "他得亲自来看，不然说不清。",
    tasks: [
      { text: "再看一次抽屉", after: "抽屉：节拍器还在", need: true, done: () => !!(S.clinicLooked && S.clinicLooked.drawer4), hint: "抽屉。节拍器还在不在" },
      { text: "问他", need: true, done: () => flag("clinicAvoid"), hint: "姐夫那句，今日要问" },
      { text: "把你搜集的东西给他看", need: true, done: () => !!(S.handed && S.handed.ok12), hint: "补充纸交给他" },
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
      { text: "走廊尽头", need: true, done: () => noted("notsame"), hint: "走廊尽头，那卷录音的地方" },
      { text: "水龙头", need: true, done: () => noted("delay"), hint: "带他去厨房" },
      { text: "他走后，贴储物室门听", need: true, show: () => !!(S.visit && S.visit.left), done: () => noted("phone-you"), hint: "储物室那边，我还没听过" },
      { text: "送他到门口", after: "门口，周递毛巾", done: () => !!(S.visit && S.visit.towel) },
      { text: "带他看全家福", done: () => !!(S.visit && S.visit.family) },
    ],
    advance: { when: "9月7日　16:10", where: "湾仔澄心诊所", fn: () => finishLevel(13) },
    next: "9月7日 16:10　澄心",
    start: () => visitHome(),
    gives: () => {
      seedNotes([["notsame", "我们看见的不是同一只。"], ["delay", "阿明在本子上写了：延迟三秒。"], ["phone-you", "周在储物室打电话。他说留不得。"]]);
    },
  },
  {
    part: 4, title: "他说整理好了", date: "9月7日 16:10", place: "澄心诊室、走廊、邮箱",
    clock: "2014年9月7日 周日 16:10",
    goal: "去拿他说整理好的笔记。",
    tasks: [
      { text: "看一眼他的工作台", after: "他去倒水时，看工作台", need: true, done: () => noted("stolen"), hint: "桌上的东西，我还没看清" },
      { text: "去走廊", after: "走廊碰到陈家豪", need: true, show: () => noted("stolen"), done: () => !!(S.miss && S.miss.chen), hint: "走廊那边，我还没去" },
      { text: "手机响了，看完", show: () => !!(S.miss && S.miss.chen), after: "打开邮件，两个附件都看", need: true, count: () => (S.miss && (S.miss.att1 || S.miss.att2) ? [cnt(["att1", "att2"], S.miss), 2] : null), done: () => typeof missDirtReady === "function" ? missDirtReady() : ev("mail-dirt"), hint: "" },
      { text: "把那封信给他看", after: "给他看", show: () => typeof missDirtReady === "function" ? missDirtReady() : ev("mail-dirt"), done: () => flag("showedDirt") },
      // 可选：簿子里写出了「这两个人」那页，才有这一行。软钥匙——写了有回报，不写照样过关。
      { text: "把这两个人那一页给他看", after: "他看完了。他问我：三个都在，我去了哪", show: () => flag("deduce-zhou"), done: () => flag("showedZhou") },
      { text: "空抽屉再拉一次", after: "空抽屉掉出鱼牌", show: () => !!(S.miss && S.miss.chen) && !ev("chen-wallet"), done: () => ev("fish-tag") },
      // 后半截「上网对履历」要等校名从剪报上抄下来之后才露面（履历上就印着校名）。
      { text: "问他那块鱼，再上网对履历", after: "问过。履历和校报对不上", show: () => ev("fish-tag") && (typeof vhuKnowsSchool === "function" ? vhuKnowsSchool() : true), done: () => flag("askedFishLuo") && noted("fish-cv") },
      { text: "再出走廊，看椅脚边", after: "钱夹：合照，夹层是他的学生证", show: () => !!(S.miss && S.miss.leftCorr) && !ev("fish-tag"), done: () => ev("chen-wallet") },
      { text: "回家，听周一句，看门口", after: "楼梯口周一句；铁闸差一格；门底干水印", show: () => typeof missDirtReady === "function" ? missDirtReady() : ev("mail-dirt"), done: () => noted("day-trace") },
    ],
    advance: {
      when: "9月7日　傍晚",
      where: "荣汇街楼梯口",
      fn: () => (noted("day-trace") ? finishLevel(14) : missHome()),
      ready: () => noted("stolen") && !!(S.miss && S.miss.chen) && (typeof missDirtReady === "function" ? missDirtReady() : ev("mail-dirt")),
    },
    next: "当晚　后座",
    start: () => missAppt(),
    gives: () => {
      S.miss = { chen: true, att1: true, att2: true };
      seedItems(["mail-dirt"]);
      seedNotes([
        ["forget", "他说本子不在，却讲得出一串细节。", "luo"],
        ["stolen", "上门行程被删了。现场笔记不见。", "luo"],
        ["dirt", "二〇〇四年十一月，维港大学，女学生坠楼。剪报报头上印着校名。名字涂掉，露出一个鱼。", "luo"],
        ["vhu-school", "剪报上印着「维港大学　二〇〇四年十一月」。阿明读的是这一间。", "luo"],
        ["zhou-day", "周说他白天来过。他下午明明在诊所。"],
        ["day-trace", "铁闸差一格。门垫挪过。储物室门底多一截干水印。"],
      ]);
    },
  },
  {
    part: 4, title: "夜里有人敲门", date: "9月7日 夜", place: "后座、电脑、走廊",
    clock: "2014年9月7日 周日 23:10",
    goal: "录音叫了我的名字。今晚他会不会来。",
    tasks: [
      { text: "打给他", after: "录音叫了我的名字，打给他", need: true, done: () => flag("calledMing2"), hint: "打给他" },
      { text: "他到门口，听他讲", after: "他来了，在门口叫出一个字", need: true, show: () => flag("calledMing2"), done: () => noted("countbreath"), hint: "" },
      { text: "有人敲门，听他要什么", after: "周来要天台钥匙", show: () => noted("countbreath"), done: () => flag("roofKeyAsked"), hint: "" },
      { text: "还没看完廿八屋的旧闻", after: "翻了站内那两篇旧闻", show: () => flag("calledMing2") && !noted("twofiles"), done: () => noted("twofiles") },
      { text: "想想天台白天的样子", after: "想起天台白天的样子", show: () => flag("calledMing2"), done: () => !!S.searchRoof },
      { text: "找到维港大学的校园网，登入", after: "进了维港大学的校园网，登入第一个帐户", need: true, show: () => flag("calledMing2"), done: () => noted("vhu-law-in") || noted("vhu-chen-in"), hint: () => (S.vhu && S.vhu.chal
        ? "密码已经对了。它还要问一条开户时登记的问题——答案在维基百科「维港大学」条目里。"
        : noted("vhu-id")
          // 提示分三段，跟着她在浏览器里走到哪一步换：搜到了、进了学校网页、看见了那一行。
          // 三段都只指方向，不写网址——门户的网址从来没有印在任何一页上，
          // 只有官网页脚那一行「校园入门网站」通到它。
          ? (S.sawVhuSite
            ? "学校网页最底，页脚「快速连结」那一列。里头只有一行是学生每天要用的。"
            : S.sawHkNews
              ? "新闻里说的「校园入门网站」是另一部机器。学校网页的地址，维基条目右上的资料框里写着。"
              : "笔电在桌底。校名在剪报上，学号在钱夹那张学生证上。搜到之后先读维基，条目里有学校网址。")
          : "笔电在桌底。校名在剪报上；学号在墙簿那张毕业相的右下角。") },
      { text: "两个人的学号，各登进去看一次", after: "两个帐户都进去了", need: true, show: () => noted("vhu-law-in") || noted("vhu-chen-in"), done: () => vhuBothIn(), hint: "他们之间那封「唔该晒」——信头那行地址就是另一个人的学号" },
      // 维基条目最底「相关新闻」那三条是学校新闻稿；只有围栏那一条写着东翼平台出过什么事。
      // 她读到的不是剪报上别人转述的一句，是学校自己写的那一句。
      { text: "维基那条旧闻：天台围栏为什么加高", after: "二〇〇四年，东翼平台。之后围栏加高了半米", need: true, show: () => flag("calledMing2"), done: () => noted("vhu-news04"), hint: "搜「维港大学」。条目最底「外部链接」那几条都是学校新闻稿" },
      // 这一行是「B 档」加的：要她真的在目录里翻到那一册，不是登进去就算。
      // 任务条上把地方写清楚，不让人在站里瞎点；看懂多少仍留给愿意的人。
      { text: "当年到底发生了什么？图书馆目录，搜「精神」", after: "那一册：二〇〇四年十一月借出，应还日期过了十年", need: true, show: () => noted("vhu-law-in") || noted("vhu-chen-in"), done: () => noted("vhu-lib-trace"), hint: "两个帐户里都有图书馆。目录里那一条点得开" },
      { text: "上楼前问他白天", after: "他认：站在楼梯口，没按门铃", show: () => noted("countbreath"), done: () => noted("day-admit") },
      { text: "他上去之后，打给家豪", after: "零点二十分打给家豪，他说马上到", show: () => noted("roofpause"), done: () => flag("calledChen") },
    ],
    // 别改成 levelReady()：这一关有一条必做是「他到门口」，那件事本身要按这颗按钮才发生，
    // 用 levelReady() 会死锁。这里只挡四样：打过电话、两个帐户都进去过、目录里那一册看过、
    // 维基那条旧闻读过（围栏为什么加高——上天台之前要知道的那件事）。
    advance: { when: "9月7日　夜", where: "他来了", fn: () => mingReturn(), modes: ["search"], ready: () => flag("calledMing2") && vhuBothIn() && noted("vhu-lib-trace") && noted("vhu-news04") },
    next: "零点四十一分　后楼梯",
    start: () => nightName(),
    gives: () => {
      flag("calledMing2", true);
      flag("roofKeyAsked", true);
      flag("keptMing", true);
      flag("calledChen", true);
      seedItems(["rec-name"]);
      seedNotes([
        ["namecall", "鬼叫我的名字。它说我知。"],
        ["countbreath", "他叫出了一个字：鱼。"],
        ["day-admit", "他说白天站在楼梯口，没按门铃。"],
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
    { key: "b", name: "出门撞见周（收回）", go: () => startTakeback() },
    { key: "c", name: "并板收红圈", go: () => { seedNotes([["takeback", "出门赴诊前，周说要收回。手抖，信封朝里。他说重建，又说未定。"]]); afterTakeback(); } },
    { key: "d", name: "诊室（候诊已过）", go: () => { S.visitSeen = { 1: true }; S.clinicLooked = {}; seedNotes([["linWait", "上一个病人。瘦，细框眼镜。笑很客气。五官记不住。"], ["takeback", "出门赴诊前，周说要收回。手抖，信封朝里。他说重建，又说未定。"]]); seedItems(["letter-red"]); enterClinic(1); } },
    { key: "e", name: "坐下谈，把搜集的给他看", go: () => { S.visitSeen = { 1: true }; seedNotes([["takeback", "出门赴诊前，周说要收回。手抖，信封朝里。他说重建，又说未定。"]]); seedItems(["letter-red"]); S.clinic = { visit: 1, seg: 3 }; clinicTalk(); } },
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
    { key: "b", name: "打过电话之后", go: () => { seedNotes([["offhours", "他先问纸，叫我不要再打。一周一次。"]]); enterHub("week", "hall"); } },
    { key: "c", name: "一周日历", go: () => { seedNotes([["offhours", "他先问纸，叫我不要再打。一周一次。"]]); enterHub("week", "hall"); openWeekCal(() => keepMust(item("paper-06"), backToHub)); } },
  ],
  12: [
    { key: "b", name: "坐下谈，问他", go: () => { S.visitSeen = { 4: true }; S.clinicLooked = { drawer4: true }; S.clinic = { visit: 4, seg: 0 }; clinic4Talk(); } },
  ],
  13: [
    { key: "b", name: "他走之后", go: () => { S.visit = { family: true, left: true }; seedNotes([["notsame", "我们看见的不是同一只。"], ["delay", "阿明在本子上写了：延迟三秒。"]]); enterHub("visit", "corridor"); } },
  ],
  14: [
    { key: "b", name: "邮件", go: () => { S.miss = { desk: true, chen: "quiet" }; seedNotes([["stolen", "上门行程被删了。现场笔记不见。"]]); enterHub("miss", "room"); } },
    { key: "c", name: "二次走廊／钱夹", go: () => { S.miss = { desk: true, chen: "quiet", leftCorr: true, att1: true, att2: true }; seedNotes([["stolen", "上门行程被删了。现场笔记不见。"]]); seedItems(["mail-dirt"]); enterHub("miss", "corridor"); } },
    { key: "d", name: "空抽屉／鱼牌", go: () => { S.miss = { desk: true, chen: "quiet", drawer1: true, att1: true, att2: true, mail: true }; seedNotes([["stolen", "上门行程被删了。现场笔记不见。"], ["metro-gone", "空抽屉。节拍器不见了。"]]); seedItems(["mail-dirt"]); enterHub("miss", "room"); } },
  ],
  15: [
    { key: "b", name: "等阿明，翻新闻", go: () => { seg15(); goSearch(); } },
    { key: "c", name: "他来了", go: () => { seg15(); mingReturn(); } },
    { key: "d", name: "上楼前", go: () => { seg15(); seg15b(); roofApproach(); } },
    { key: "e", name: "屋里等", go: () => { seg15(); seg15b(); roofWait(); } },
  ],
  16: [
    { key: "b", name: "结算／陈轻伤", go: () => { LEVELS[16].gives(); S.flags.endHurt = "chen"; ending(); } },
    { key: "c", name: "结算／罗轻伤", go: () => { LEVELS[16].gives(); S.flags.endHurt = "ming"; ending(); } },
    { key: "d", name: "结算／女主险坠", go: () => { LEVELS[16].gives(); S.flags.endHurt = "zhang"; ending(); } },
    { key: "e", name: "天台夜／按发现重算", go: () => { LEVELS[16].gives(); delete S.flags.endHurt; roofNight(); } },
    { key: "f", name: "天台／钱夹线", go: () => { LEVELS[16].gives(); seedItems(["chen-wallet"]); delete S.flags.endHurt; roofNight(); } },
    { key: "g", name: "天台／鱼牌线", go: () => { LEVELS[16].gives(); seedItems(["fish-tag"]); flag("askedFishLuo", true); seedNotes([["fish-cv", "履历干净，校报对不上。另有隐情。"]]); delete S.flags.endHurt; roofNight(); } },
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

/* 墙簿上今天有人问她话：并进这一关的必做，回了才走得了。
   只看「今天」发的那一条——旧帖仍然能回，但不拿它们卡住日子。
   这一关一旦出现过，这条就留在簿里（打了勾才算过），下一关重新算。 */
function wallTaskFor() {
  if (typeof wallToday !== "function" || S.mode === "end") return [];
  const now = wallToday();
  if (now.open.length) S.wallTaskLv = S.level;
  if (S.wallTaskLv !== S.level) return [];
  return [{
    text: "墙簿上，回一句",
    need: true,
    count: () => [now.all.length - now.open.length, now.all.length],
    done: () => now.open.length === 0,
    hint: "墙簿上有新回复，你还没回",
  }];
}

// 关卡自带的任务 + 随剧情长出来的那条（墙簿）
function tasksOf(L) {
  if (!L) return [];
  return L.tasks.concat(wallTaskFor());
}

function levelReady() {
  const L = levelNow();
  if (!L) return true;
  return tasksOf(L).every((t) => !t.need || t.done());
}

// 「看得见的必做都做完了」——给那种「必做要靠按往下才发生」的关用。
// levelReady() 不认 show()，会去等一条还没放行的任务，然后永远等下去；
// 但整体放宽也不对（比如第 6 关要等表姐的电话挂断才算数）。所以只在这里放开。
function readyShown() {
  const L = levelNow();
  if (!L) return true;
  return tasksOf(L).every((t) => !t.need || t.done() || (t.show && !t.show()));
}

const hintSay = (x) => (typeof x.hint === "function" ? x.hint() : x.hint);

function hintTask() {
  const L = levelNow();
  if (!L) return null;
  return tasksOf(L).find((x) => x.need && !x.done() && (!x.show || x.show()) && hintSay(x)) || null;
}

function levelHint() {
  const t = hintTask();
  return t ? hintSay(t) : "";
}

// 提示的字大半已在那条任务里（「候诊。」对「候诊，看一眼」），日记簿就不再写一遍
function hintEchoes(hint, task) {
  const chars = [...hint.replace(/[\s，。、；：！？「」…—\-我你还没的了是在就都也这那再]/g, "")];
  if (!chars.length) return true;
  return chars.filter((c) => task.includes(c)).length / chars.length >= 0.55;
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
  const list = tasksOf(L);
  const done = list.map((t) => !!t.done());
  const fresh = taskHeard.level === S.level && done.some((d, i) => d && !taskHeard.done[i]);
  taskHeard = { level: S.level, done };
  if (fresh) sfx("tick");
}

function renderLevelBox() {
  const L = levelNow();
  if (L && S.mode !== "end") taskTick(L);
  if (typeof renderDiaryIndex === "function") renderDiaryIndex();
}

// 日记簿「要做的」那一页：必做在上；空一行，可做的用虚线圈、颜色浅一点，不写「可做可不做」
function levelBlocks() {
  const L = levelNow();
  if (!L || S.mode === "end") return [];
  const shown = tasksOf(L).filter((t) => !t.show || t.done() || t.show());
  const row = (t) => {
    const done = t.done();
    return el("li", { class: (done ? "done" : "") + (t.need ? "" : " opt") }, [
      el("span", { class: "task-mark", "aria-hidden": "true" }, [done ? "✓" : t.need ? "○" : ""]),
      taskText(t),
    ]);
  };
  const need = shown.filter((t) => t.need);
  const opt = shown.filter((t) => !t.need);
  const blocks = [el("p", { class: "diary-note level-name" }, [levelGoalText(L)])];
  if (need.length) blocks.push(el("ul", { class: "task-list" }, need.map(row)));
  if (opt.length) blocks.push(el("ul", { class: "task-list opt-list" }, opt.map(row)));
  const ht = hintTask();
  const hint = ht ? hintSay(ht) : "";
  if (hint && !hintEchoes(hint, ht.text)) blocks.push(el("p", { class: "diary-note task-hint" }, [hint]));
  // 要摆的纸：三张纸都不是「读一页」，是「做一件事」，所以每行右端带一句进度。
  const papers = typeof todoPapers === "function" ? todoPapers() : [];
  if (papers.length) {
    blocks.push(diarySubHead("要摆的纸"));
    blocks.push(el("div", { class: "todo-papers" }, papers.map((p) => el("button", {
      type: "button",
      class: "todo-paper",
      onclick: () => { sfx("paper"); diaryOpen(p.fn); },
    }, [
      el("span", { class: "todo-paper-name" }, [p.label]),
      el("span", { class: "todo-paper-meta" }, [p.meta]),
      el("span", { class: "todo-paper-go", "aria-hidden": "true" }, ["›"]),
    ]))));
  }
  blocks.push(...homeworkBlocks());
  return blocks;
}

// 作业到下一次复诊交掉为止
function homeworkBlocks() {
  const hw = S.homework;
  if (!hw || S.level > hw.n + 2) return [];
  const rows = HOMEWORK_ROWS[hw.n] || [];
  const done = rows.filter(([, id]) => ev(id)).length;
  const out = [
    diarySubHead("作业", rows.length ? done + "／" + rows.length : ""),
    el("p", { class: "diary-note hw-quote" }, ["罗启明写：" + hw.body]),
  ];
  if (rows.length) {
    out.push(el("ul", { class: "task-list hw-list" }, rows.map(([text, id]) => {
      const have = ev(id);
      return el("li", { class: have ? "done" : "" }, [
        el("span", { class: "task-mark", "aria-hidden": "true" }, [have ? "✓" : "○"]),
        el("span", { class: "hw-text" }, [text]),
        have ? el("button", { type: "button", class: "hw-ev", onclick: () => diaryOpen(() => showClueModal(item(id), { canFile: false, fromIndex: true })) }, [item(id).title + " ›"]) : "",
      ]);
    })));
  }
  return out;
}

// 「To do」页底下那一小块：这一章还要摆弄的几张纸。
// 三样都是「做到一半」的状态，所以每行带一句进度——裸链接每打开一次都要重新确认到哪了。
// 「搬进来那晚」不在这里：它是八月一日夜里的记录，归时间线。
// 「两个人」也不在这里：那是一页人名，归「我认识的人」（10-29）。
function todoPapers() {
  const out = [];
  // 「租房必需四条」只在看楼那两章有用：楼已经租下来了，这张纸再挂在簿子上
  // 就是一本翻两页全是旧清单的簿子（从前 `|| Object.keys(S.four).length` 让它一直留着）。
  // 进度说「划掉」不说「卡住」：找着的证据越多，划掉的越多——那是在往前走。
  // 写「卡住 3 条」会读反，读成「还有三条没解决」（10-29）。
  if (S.level <= 2) {
    const n = FOUR.filter((f) => ((S.four && S.four[f.id]) || []).length).length;
    out.push({ label: "租房必需四条", meta: n ? "划掉 " + n + " 条" : "一条都还没划", fn: openFour });
  }
  if (S.level === 4 && nightOn()) {
    const n = pairCount();
    out.push({
      label: "摆在一起",
      meta: n >= 3 ? "三处都摆上了" : n ? "摆上 " + n + " 处" : "一处都还没摆",
      fn: () => openPairs(() => afterModalClose()),
    });
  }
  if (S.level === 9 && ev("paper-norec") && ev("note-meiwater")) {
    const n = Object.keys(S.compare || {}).length;
    out.push({
      label: "对照纸",
      meta: compareReady() ? "四格都填上了" : n ? "填了 " + n + " 格" : "一格都还没填",
      fn: () => openCompare(finishCompare),
    });
  }
  return out;
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
  const kept = (S.evidence || []).filter((e) => !mark.ev.includes(e.id)).map((e) => e.kind + "：" + e.title);
  const missed = Object.entries(mark.skip || {}).filter(([id]) => !hasEvidence(id)).map(([, t]) => t);
  if (LEVELS[n + 1]) return enterLevel(n + 1, { from: n, kept, missed });
  S.mode = "card";
  S.card = { type: "end", n, kept, missed };
  draw();
}

function noteSkip(it) {
  if (!it || !it.id) return;
  S.levelMark = S.levelMark || { ev: [], skip: {} };
  S.levelMark.skip[it.id] = it.kind + "：" + it.title;
  S.skipAll = S.skipAll || {};
  S.skipAll[it.id] = it.kind + "：" + it.title;
}

const CARD_NIGHT = [3, 4, 7, 9, 11, 13, 15];
const CARD_NIGHT_OWN = [4, 7, 9, 11, 15];

function cardBgName(n) {
  if (!(n > 1)) return "";
  if ([6, 8, 10, 12, 14].includes(n)) return "场景-候诊";
  if (n === 16) return "场景-天台";
  if (CARD_NIGHT.includes(n)) return "场景-夜里后座厅";
  return "场景-后座厅";
}

function cardBg(n) {
  const name = cardBgName(n);
  if (!name) return "";
  if (name === "场景-夜里后座厅" && !CARD_NIGHT_OWN.includes(n)) return pic(n, "场景-后座厅");
  return pic(n, name);
}

// 各底图中间区域原始亮度差很大（10-17 重出后实测：候诊约 151、白天厅约 103、天台约 100、夜里厅约 36）。
// 不压成同一暗度，按「这一场是白天还是夜里」定，目标是落到 45～60 这一段：
// 压到 25 以下白字压得住，但屋子就看不见了（08-15「早上」那张后来读成夜里，就是 0.32 压过头）。
const CARD_LUM = { "场景-候诊": 0.4, "场景-后座厅": 0.7, "场景-天台": 0.4, "场景-夜里后座厅": 1.12 };

// 过关卡第一句：把「刚才那一关做成了什么」说出来，别只列下一站。
// 只写单语（H() 按语言模式繁化），不写粤语口语，免得普通话模式里突然冒一句粤语。
/* 关头那一句：她自己的一句心里话，不是这一关的清单。
   右边「本次新增」已经把这一趟拿到的东西一条条列出来了，这里再数一遍
   （「你都记下了」「这一夜你记住了：车转了向，门底有脚印，水又滴」），
   就成了念清单——一进关就出戏。所以这里只写她此刻身上的一点感觉，
   剩下半句留白，人自己会往下走。 */
const DONE_LINE = {
  1: "网上真的有人回我了。荣汇街二十八号，四楼后座——去看看，反正也花不了半天。",
  2: "钥匙是真的。门一推开，屋里比走廊凉一点，也静一点。",
  3: "两个礼拜住下来，闭着眼也摸得到开关。只是……",
  4: "天亮了。我得找个人，从头讲一遍。",
  5: "终于有人肯听了，我把东西都装进袋子里，出门时抱在腿上。",
  6: "他真的坐下来听我讲完。回家的车上，我把那张纸折了两次才放好。",
  7: "照他说的做了两遍，一遍盯着，一遍走开。两遍的结果不一样。",
  8: "纸上的放一堆，心里的放一堆。分完才发现，两堆差不多一样高。",
  9: "那一夜我故意不开录音。第二天早上，车还是转了方向。",
  10: "最不敢讲的那句，我说出来了。他低头写字，笔停了一下，最后没写「病」。",
  11: "又一个礼拜记满了。他门口那本月历上，星期六那格涂得很用力。",
  12: "他答应今晚来。挂电话之前又补一句：只听门底，不过夜。",
  13: "他亲耳听到了那三秒。走的时候一句话没说，只在本子上写了一行。",
  14: "本子说不在，细节他却讲得出。回来一查，昨晚那页行程没了。",
  15: "录音里那把声音，叫了我的名字。零点四十一分，楼梯上有脚步，一级一级，往上。",
};

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
    if (c.type === "cut") {
      if (c.playing && stage.querySelector(".desk.cut")) return;
      return drawCut(c);
    }
    if (c.type === "test") {
      const kids = [
        el("p", { class: "talk-loc" }, ["暗度　第一章　分段测试"]),
        el("p", { class: "fine" }, ["每关都能单独进。前面各关的必拿物和笔记自动补上，不读存档。"]),
        el("ul", { class: "test-list" }, LEVELS.slice(1).map((lv, i) => {
          const n = i + 1;
          return el("li", {}, [
            el("span", { class: "test-lv" }, [
              el("span", { class: "test-no" }, [String(n).padStart(2, "0")]),
              el("span", { class: "test-name" }, [lv.title]),
            ]),
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

/** 续玩／选关品牌底：竖屏用竖版，横屏用宽版（无字钥匙＋车水印）。 */
function resumePlate() {
  const portrait = typeof matchMedia === "function" && matchMedia("(orientation: portrait), (max-aspect-ratio: 3/4)").matches;
  return portrait ? "00-通用/场景-续玩底-竖" : "00-通用/场景-续玩底-宽";
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

/* 一行「时段　地点」拆两截：前半截是时间，后半截是地方。全角空格是作者写死的分隔符。 */
function splitWhere(s) {
  const t = String(s || "");
  const i = t.indexOf("　");
  return i < 0 ? ["", t] : [t.slice(0, i), t.slice(i + 1)];
}

/* 「类别：标题」拆成两截：类别只是标签，标题才是要看的东西。标题里还有冒号，只切第一个。 */
function splitKept(s) {
  const t = String(s || "");
  const i = t.indexOf("：");
  return i < 0 ? ["", t] : [t.slice(0, i), t.slice(i + 1)];
}

const CAP_NEW_MAX = 3;

/* 关卡开头：三块固定，中间只留一句。
   以前旁白、记下的、时间地点、目标、按钮全叠在中轴一列，只靠字号分出先后：
   一件事说完，眼睛得自己找下一件，同一屏里五样东西都长一个样。
   现在四处各管一件，位置再也不动——左上「在哪、什么时候」，中间「刚才」，
   右下「这一趟多了什么」，目标贴着底边整条可点，不用再去够那个小按钮。 */
function sceneZones(c, L, leave) {
  const n = c.n;
  const prev = c.from ? LEVELS[c.from] : null;
  const where = (prev && prev.next) || [L && L.date, L && L.place].filter(Boolean).join("　");
  const whenSpot = splitWhere(where);
  const one = (c.from && DONE_LINE[c.from]) || DONE_LINE[n - 1] || "";
  const kept = (Array.isArray(c.kept) ? c.kept : []).map(splitKept);
  const out = [];

  out.push(el("p", { class: "cap-where" }, [
    whenSpot[0] ? el("span", { class: "cap-where-when" }, [whenSpot[0]]) : "",
    whenSpot[1] ? el("span", { class: "cap-where-spot" }, [whenSpot[1]]) : "",
  ]));

  if (one) out.push(el("p", { class: "cap-say" }, [one]));

  if (kept.length) {
    const list = el("ul", { class: "cap-new-list" + (kept.length > CAP_NEW_MAX ? " fold" : "") },
      kept.map(([k, t]) => el("li", {}, [
        k ? el("span", { class: "cap-new-k" }, [k]) : "",
        el("span", { class: "cap-new-t" }, [t]),
      ])));
    const zone = el("aside", { class: "cap-new", "aria-label": "本次新增" }, [
      el("p", { class: "cap-new-h" }, ["本次新增"]),
      list,
    ]);
    if (kept.length > CAP_NEW_MAX) {
      const rest = kept.length - CAP_NEW_MAX;
      const more = el("button", { type: "button", class: "cap-new-more", "aria-expanded": "false" }, ["+" + rest]);
      more.onclick = () => {
        const open = list.classList.contains("fold");
        list.classList.toggle("fold", !open);
        more.setAttribute("aria-expanded", open ? "true" : "false");
        more.textContent = open ? "收起" : "+" + rest;
        sfx("paper");
      };
      zone.append(more);
    }
    out.push(zone);
  }

  // 底下只留一颗「嗯……」，靠右。原来左半边还印着这一关的目标，可目标在日记簿
  // 「要做的」那一页顶上天天开着，关头再念一遍，等于同一句话读两次，还把这句
  // 心理独白挤成了一个说明栏。整条仍然是按钮（不必去够那颗小字），只是不再写字。
  out.push(el("button", {
    type: "button",
    class: "caption-go cap-bar",
    "aria-label": H("继续"),
    onclick: leave(startLevelNow),
  }, [
    el("span", { class: "cap-bar-go" }, ["嗯……"]),
  ]));
  return out;
}

function drawCaption(c, L) {
  c = c || {};
  const kept = Array.isArray(c.kept) ? c.kept : [];
  const resume = c.type === "resume";
  const { desk, go, leave } = captionShell(
    resume ? resumePlate() : cardBg(c.n),
    resume ? 0.92 : CARD_LUM[cardBgName(c.n)]
  );
  const kids = [];
  if (resume) {
    desk.classList.add("resume-card");
    kids.push(...resumeCaption(c, L, go, leave));
  } else if (c.type === "start") {
    // 三块固定区，不再走 .caption-text 那条中轴
    desk.classList.add("scene-card");
    desk.append(...sceneZones(c, L, leave));
  } else {
    kids.push(
      kept.length ? el("ul", { class: "caption-kept" }, kept.map((t) => el("li", {}, [t]))) : "",
      el("div", { class: "caption-acts" }, [go("……", () => ending())])
    );
  }
  if (kids.length) desk.append(el("div", { class: "caption-text" }, kids));
  stage.append(desk);
  renderPlaybar();
  const app = document.getElementById("app");
  if (app) app.classList.remove("opening-dark");
  if (c.type === "resume") choiceLock(desk);
}

/* ---------- 新游戏开场：耳机提示 → 黑屋里一行行打出心声，最后一行就是这一关要做的 → 电脑屏幕亮起，直接进廿八屋 ----------
   不打标题、不写第几关、不再弹第 1 关字幕卡（标题留到第一章结尾）。心声只写她此刻知道的事——
   她此刻知道什么：分了手、没有自己的地方、散工、现金、口头、被当有问题、不想坐别人家沙发。
   基调偏暖：她说的是疼，不是怨；表姐爱她，只是也把她当病人。她只是要一间自己的门。
   她此刻不知道什么：荣汇街、周、藤先生、这间屋出过事。开场一个字都不许提前。
   开场心声默认粤语（香港繁体）；切普通话时用第二行。 */
const OPENING_SAY = [
  ["五月分手，短租、日租、朋友屋企个沙发，试到七月尾。", "五月分手了，短租、日租、朋友家的沙发，试到七月尾。"],
  ["做散工，现金出粮：冇粮单，冇担保人。", "做散工，现金出粮：没有粮单，没有担保人。"],
  ["正经租盘，我一条都过唔到。", "正经租盘，我一条都过不了。"],
  ["阿乐当我有病。表姐冇讲咩，眼神却系一样。", "阿乐当我有病。表姐没说什么，眼神却是一样的。"],
  ["佢留咗沙发给我，但係我唔想住。", "她留了沙发给我，但我不想住。"],
];
const OPENING_TYPE_MS = 75;
const OPENING_HOLD_MS = 2000;
let openingTimers = [];

function openingLater(fn, ms) {
  openingTimers.push(setTimeout(fn, ms));
}

function openingClear() {
  openingTimers.forEach(clearTimeout);
  openingTimers = [];
}

function openingLineText(pair) {
  if (Array.isArray(pair)) return typeof T === "function" ? T(pair[0], pair[1]) : pair[0];
  return typeof T === "function" ? T(pair, pair) : pair;
}

// goal／goalZh 可以是函数：第 9 关那一句取决于第 8 关他有没有听过那卷录音。
function levelGoalText(lv) {
  if (!lv) return "";
  const g = typeof lv.goal === "function" ? lv.goal() : lv.goal;
  const gz = typeof lv.goalZh === "function" ? lv.goalZh() : lv.goalZh;
  if (gz != null && typeof T === "function") return T(g, gz);
  return typeof H === "function" ? H(g || "") : (g || "");
}

// 开场一旦开始就不许跳：盖一层透明罩吃掉所有点击，键盘也拦下（浏览器自己的组合键放行）。
function openingKeyBlock(e) {
  if (e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.key)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
}

function openingLock(on) {
  const old = document.getElementById("opening-lock");
  if (old) old.remove();
  window.removeEventListener("keydown", openingKeyBlock, true);
  if (!on) return;
  document.body.append(el("div", { id: "opening-lock", "aria-hidden": "true" }));
  window.addEventListener("keydown", openingKeyBlock, true);
}

function playOpening() {
  openingClear();
  openingLock(false);
  openingMusic(false);
  clockHold = false;
  S.mode = "card";
  S.card = null;
  clearStage();
  const app = document.getElementById("app");
  if (app) app.classList.add("opening-dark");
  const lines = el("div", { class: "opening-lines" });
  const desk = el("div", { class: "desk caption-card opening-pre" }, [lines]);
  stage.append(desk);
  renderPlaybar();

  const rows = OPENING_SAY.map((pair) => ({ text: openingLineText(pair) }))
    .concat([{ text: levelGoalText(LEVELS[1]), goal: true }]);
  const lineEl = (r, text) => el("p", { class: "opening-line" + (r.goal ? " goal" : "") }, [text]);
  // gate → typing → hold → leaving；只有 gate 要点（解锁声音），之后一路播完，屏幕通电、日期淡掉才放手
  let phase = "gate";

  const hold = () => {
    phase = "hold";
    desk.classList.add("typed");
    openingLater(powerOn, OPENING_HOLD_MS);
  };
  const typeRow = (i) => {
    if (i >= rows.length) return hold();
    const r = rows[i];
    const p = lineEl(r, "");
    lines.append(p);
    const chars = Array.from(r.text);
    let n = 0;
    const tick = () => {
      n += 1;
      const ch = chars[n - 1];
      p.textContent = chars.slice(0, n).join("");
      const stop = /[，。、]/.test(ch);
      if (!stop) sfx("key");
      if (n < chars.length) openingLater(tick, stop ? OPENING_TYPE_MS * 4 : OPENING_TYPE_MS);
      else openingLater(() => typeRow(i + 1), 650);
    };
    openingLater(tick, r.goal ? 450 : 0);
  };
  const powerOn = () => {
    if (phase === "leaving") return;
    phase = "leaving";
    openingClear();
    // 心声打完、最后那行「今晚就搵到可以搬入去嘅房」也停够了：钢琴从屏幕通电开始淡出，
    // 收进黑屋那一声「通电」里，之后交给第 1 关自己的声音（廿八屋先静着，回到屋里才有地点声）
    openingMusic(false);
    desk.classList.add("leaving");
    openingLater(() => {
      clockHold = true;
      if (clockEl) clockEl.textContent = "";
      enterLevel(1);
      screenOn();
      startLevelNow();
      bootDate(); // 屏幕通电时先浮一下今天的日期，接住开场白那句「试到七月尾」
      const lit = Date.now();
      typeClock(() => {
        const left = typeMotionOff() ? 0 : Math.max(0, 1900 - (Date.now() - lit));
        setTimeout(() => openingLock(false), left);
      });
    }, 420);
  };
  const begin = () => {
    phase = "typing";
    desk.classList.add("locked");
    openingLock(true);
    // 这里原本会起 roomTone（380Hz 低通白噪，当房间底噪）。引子是黑屏心声，没有"房间"，
    // 那层噪声正好盖在 -39dB 的钢琴上，听着像空调嗡嗡。只留钢琴和打字声。
    // 点这一下既是解锁声音，也是这首钢琴的起拍：音乐和第一行心声同时进来
    openingMusic(true);
    lines.replaceChildren();
    openingLater(() => typeRow(0), 700);
  };
  desk.addEventListener("click", () => {
    if (phase === "gate") begin();
  });
  // 已经点过（重来）声音早解锁了，不再问
  if (sfxReady) return begin();
  lines.append(el("p", { class: "opening-gate" }, [typeof T === "function" ? T("戴上耳机，点一下", "戴上耳机，点一下") : "戴上耳机，点一下"]));
}

// 整个画面像笔记本背光通电：从黑里冷灰发虚地浮上来，约 1.8 秒回到正常
function screenOn() {
  if (typeMotionOff()) return;
  const root = document.documentElement;
  root.classList.remove("screen-on");
  void root.offsetWidth;
  root.classList.add("screen-on");
  setTimeout(() => root.classList.remove("screen-on"), 1900);
}

// 屏幕亮起后左上角的钟一个字一个字打出来。这一步是开场的一部分：不许点掉，关动效也照打。
const CLOCK_TYPE_MS = 55;
function typeClock(done) {
  const chars = Array.from(S.time || "");
  let n = 0;
  const tick = () => {
    n += 1;
    if (clockEl) clockEl.textContent = chars.slice(0, n).join("");
    if (String(chars[n - 1] || "").trim()) sfx("key");
    if (n < chars.length) return openingLater(tick, CLOCK_TYPE_MS);
    clockHold = false;
    renderHud();
    if (done) done();
  };
  if (!chars.length) {
    clockHold = false;
    renderHud();
    return done && done();
  }
  openingLater(tick, typeMotionOff() ? 300 : 900);
}

// 屏幕通电后，正中先浮一下「7月31日」，淡掉。接住开场白那句「试到七月尾」——
// 免得心声停在「她留了沙发给我，但我不想住」，画面却一下落到七月底的那一夜。
function bootDate() {
  if (typeMotionOff()) return; // 关动效时不闪，右上角钟仍在
  if (document.querySelector(".boot-date")) return;
  const node = el("div", { class: "boot-date" }, ["7月31日"]);
  document.body.append(node);
  setTimeout(() => node.classList.add("leaving"), 1150);
  setTimeout(() => { if (node.parentNode) node.parentNode.removeChild(node); }, 1900);
}

function startLevelNow() {
  roomTone(false);
  // 兜底：跳过 powerOn 的路径（跳关、重来）也不会把开场曲带进第 1 关
  openingMusic(false);
  const app = document.getElementById("app");
  if (app) app.classList.remove("opening-dark");
  openingLock(false);
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

// 通关记录单独一个键：清档、重来都不碰它
const CLEARED_KEY = "undo-ch1-cleared";

function markCleared() {
  try {
    const old = JSON.parse(localStorage.getItem(CLEARED_KEY) || "null") || {};
    const now = new Date().toISOString();
    localStorage.setItem(CLEARED_KEY, JSON.stringify({ first: old.first || now, last: now, times: (Number(old.times) || 0) + 1 }));
  } catch (e) { /* 无 */ }
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

function applySnap(snap) {
  S = Object.assign(initial(), snap && typeof snap === "object" ? snap : {});
  // 存档是磁盘上的明文，可能被改坏或来自旧版本。关卡号一旦落空，
  // levelNow() 会返回 undefined，后面所有 tasks／draw 全线连锁报错，所以先钉回一个存在的关。
  const n = Math.round(Number(S.level));
  S.level = LEVELS[n] ? n : 1;
  if (!Array.isArray(S.notes)) S.notes = [];
  if (!Array.isArray(S.evidence)) S.evidence = [];
  if (!S.flags || typeof S.flags !== "object") S.flags = {};
  if (!S.known || typeof S.known !== "object") S.known = {};
  if (!S.chatLogs || typeof S.chatLogs !== "object") S.chatLogs = {};
  // 旧档里分页是写死的 blank／blank2，这里换成动态分页（见 web-ui.js normalizeTabs）。
  if (typeof normalizeTabs === "function") normalizeTabs();
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
// 补的笔记按那一关的日子记
function givePast(n) {
  for (let i = 1; i < n; i++) {
    if (!LEVELS[i] || !LEVELS[i].gives) continue;
    S.level = i;
    if (LEVELS[i].clock) S.time = LEVELS[i].clock;
    LEVELS[i].gives();
  }
}

function buildCheckpointSnap(n) {
  const bak = S;
  S = initial();
  givePast(n);
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
  playOpening();
}

// 「继续　选关　重来」没选之前锁死：卡片以外的东西全部 inert（顶栏、底栏、地图、日记簿、浮层），
// 键盘只认卡片里的按钮——Tab 在卡片里转圈，Enter／空格只按当前那颗，其余键吞掉（浏览器组合键放行）。
let choiceRelease = null;

function choiceLock(card) {
  choiceUnlock();
  const app = document.getElementById("app");
  const shut = [];
  /* 记住「已经关过一次」用 shut 判断，不要用 node.inert 判断：
     节点可能是被别处先设成 inert 的（或者上一次解锁漏了它），这时如果看到 inert
     就 return，它永远进不了 shut，解锁时也就永远轮不到它——顶栏那颗环境音开关
     会从此按下去毫无反应，连悬停都没有。 */
  const seal = (node) => {
    if (!node || node.tagName === "SCRIPT" || shut.includes(node)) return;
    node.inert = true;
    shut.push(node);
  };
  Array.from(document.body.children).forEach((n) => { if (n !== app) seal(n); });
  // 顶栏也锁，只留「全屏」那颗：换屏幕大小跟玩不玩无关，等选完再全屏太别扭
  if (app) Array.from(app.children).forEach((n) => {
    if (n.id === "stage") return;
    if (n.id === "os-bar") {
      Array.from(n.children).forEach((c) => { if (c.id !== "fs-toggle") seal(c); });
      return;
    }
    seal(n);
  });
  const keys = () => Array.from(card.querySelectorAll("button")).filter((b) => !b.disabled && b.offsetParent);
  const onKey = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.key)) return;
    const list = keys();
    const at = list.indexOf(document.activeElement);
    if (e.key === "Tab") {
      e.preventDefault();
      if (list.length) list[(at + (e.shiftKey ? -1 : 1) + list.length) % list.length].focus();
    } else if ((e.key === "Enter" || e.key === " ") && at >= 0) {
      e.stopImmediatePropagation();
      return;
    } else {
      e.preventDefault();
    }
    e.stopImmediatePropagation();
  };
  window.addEventListener("keydown", onKey, true);
  choiceRelease = () => {
    window.removeEventListener("keydown", onKey, true);
    shut.forEach((n) => { n.inert = false; });
  };
  const first = keys()[0];
  if (first) setTimeout(() => { if (card.isConnected) first.focus({ preventScroll: true }); }, 0);
}

function choiceUnlock() {
  if (choiceRelease) choiceRelease();
  choiceRelease = null;
  /* 兜底：顶栏和底栏是常驻节点，全项目只有这里碰 inert。
     不管 shut 有没有漏记，退出卡片时把它们再扫一遍，绝不把一颗死按钮留给玩家。 */
  ["os-bar", "playbar"].forEach((id) => {
    const n = document.getElementById(id);
    if (!n) return;
    if (n.inert) n.inert = false;
    Array.from(n.children).forEach((c) => { if (c.inert) c.inert = false; });
  });
}

// 开局存档：标题 → 上次停在（日子、地方、要做的事）→ 继续／选关／重来。
// 选关和确认都在同一张卡片里换页，不弹浏览器对话框；没玩到的关不写名字。
function resumeCaption(c, L, go, leave) {
  const store = readStore() || emptyStore();
  const max = resumeMax(store, c.n);
  if ((Number(store.max) || 0) < max) {
    store.max = max;
    writeStore(store);
  }
  const curN = (store.current && store.current.n) || max;
  const cur = LEVELS[curN] || L || {};
  const savedTime = (store.current && store.current.S && store.current.S.time) || cur.clock || "";
  if (savedTime) setTime(savedTime);
  const shortDay = (t) => String(t || "").replace(/^\d{4}年/, "");

  const host = el("div", { class: "resume-view" });
  const show = (kids) => {
    host.replaceChildren(...kids);
    const first = host.querySelector("button");
    if (first) setTimeout(() => { if (first.isConnected) first.focus({ preventScroll: true }); }, 0);
  };
  const btn = (cls, label, fn, aria) => el("button", { type: "button", class: cls, "aria-label": aria || null, onclick: fn }, [label]);

  const home = () => show([
    el("h1", { class: "resume-title" }, [
      el("span", { class: "resume-brand" }, ["暗度"]),
      el("span", { class: "resume-undo", "aria-hidden": "true" }, "undo".split("").map((ch) => el("span", {}, [ch]))),
    ]),
    el("p", { class: "resume-sub" }, ["第一章：章慧琪"]),
    el("div", { class: "resume-where", role: "group", "aria-label": "存档" }, [
      el("span", { class: "resume-ribbon", "aria-hidden": "true" }),
      el("p", { class: "resume-when" }, [shortDay(savedTime)]),
      cur.place ? el("p", { class: "resume-place" }, [cur.place]) : "",
      cur.goal ? el("p", { class: "resume-goal" }, [levelGoalText(cur)]) : "",
    ]),
    btn("resume-go", "继续", leave(() => { choiceUnlock(); loadSave(); })),
    btn("resume-link", "选关", pick),
    btn("resume-quiet", "重来", () => confirm(
      "从头来？",
      "所有进度都会清掉。",
      "清掉，重来",
      leave(() => { choiceUnlock(); newGame(); }),
      home,
    )),
  ]);

  const enter = (n) => {
    choiceUnlock();
    loadCheckpoint(n, n >= max);
  };

  const pick = () => {
    const list = el("div", { class: "resume-list" });
    for (let p = 1; p < PARTS.length; p++) {
      const ns = [];
      for (let n = 1; n <= max; n++) if (LEVELS[n] && LEVELS[n].part === p) ns.push(n);
      if (!ns.length) continue;
      list.append(el("h4", { class: "resume-part" }, [PARTS[p]]));
      ns.forEach((n) => {
        const lv = LEVELS[n];
        const now = n === curN;
        list.append(el("button", {
          type: "button",
          class: "resume-lv" + (now ? " now" : ""),
          "aria-current": now ? "true" : null,
          onclick: () => (n < max
            ? confirm("从「" + lv.title + "」重开？", "后面几关的进度会清掉。", "重开", () => enter(n), pick)
            : enter(n)),
        }, [
          now ? el("span", { class: "resume-ribbon", "aria-hidden": "true" }) : "",
          el("span", { class: "resume-lv-title" }, [lv.title]),
          el("span", { class: "resume-lv-date" }, [lv.date]),
        ]));
      });
    }
    show([
      el("h2", { class: "resume-h" }, ["选关"]),
      list,
      btn("resume-quiet", "返回", home),
    ]);
    const now = list.querySelector(".resume-lv.now");
    if (now) list.scrollTop = Math.max(0, now.offsetTop - list.offsetTop - list.clientHeight / 2 + now.offsetHeight / 2);
  };

  const confirm = (q, why, yes, onYes, onNo) => show([
    el("p", { class: "resume-ask" }, [q]),
    el("p", { class: "resume-why" }, [why]),
    el("div", { class: "resume-pair" }, [
      btn("resume-link", "算了", onNo),
      btn("resume-go danger", yes, onYes),
    ]),
  ]);

  home();
  return [host];
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
  if (typeof markHouseThread === "function" && typeof myThreadIds === "function") {
    myThreadIds().forEach(markHouseThread);
    S.houseLastN = 0;
  }
  S.evOpened = S.evOpened || {};
  (S.evidence || []).forEach((e) => { S.evOpened[e.id] = true; });
}

function jumpLevel(n, segKey) {
  S = initial();
  givePast(n);
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
  // 调试：直接开浏览器分页。?web=blank 空白分页，?web=vhu 校园网登入页。
  const web = q.get("web");
  if (web) {
    S.mode = "web";
    S.paused = null;
    S.tab = "newtab";
    S.screen = web === "vhu" ? "vhu-login" : "newtab";
    if (S.screen !== "newtab") S.tab = newPageTab();
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
  playOpening();
}
