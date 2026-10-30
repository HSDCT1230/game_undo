/* ---------- 日记簿：她自己的纸、四条、屋里的样子，和几种「拿出来」 ---------- */

const ITEMS = {
  "obj-keytag": { kind: "物件", title: "钥匙牌", time: "2014年8月1日", body: "钥匙圈上硬纸牌，周先生的字：\n大门　后座　天台（挂门内小钩）\n水喉坏咗拍门。唔使自己整。\n天台晾衫用。", img: pic(2, "证据-钥匙牌"), key: "水喉坏咗拍门" },
  "rec-water": { kind: "录音", title: "只有水", time: "2014年8月13日 夜", body: "录音里只有水。没有人声。", key: "只有水" },
  "letter-red": { kind: "信封", title: "红圈", time: "2014年8月16日 出门前", body: "新闻纸一角。红笔圈。他的拇指挡住圈里的字。", img: pic(4, "证据-红圈信封"), key: "红笔圈" },
  "photo-sill": { kind: "照片", title: "窗台童码", time: "2014年8月15日 凌晨", body: "鞋并上去比：小两号。今晚没下雨。水是新的。搬进来时那圈是干的。", img: pic(4, "证据-窗台童码"), key: "小两号" },
  "photo-print": { kind: "照片", title: "门底湿脚印", time: "2014年8月15日 凌晨", body: "门底湿脚印，到一半停住。", img: pic(4, "证据-门底湿脚印"), key: "门底湿脚印" },
  "rec-axuan": { kind: "录音", title: "阿轩，返嚟食饭", time: "2014年8月15日 凌晨", body: "女人声从储物室门底来：「阿轩，返嚟食饭。」声线稳。门缝下没有光。", key: "阿轩，返嚟食饭" },
  "note-dry": { kind: "记下", title: "鞋是干的", time: "2014年8月15日", body: "周问我脚湿不湿。我低头看：鞋是干的。", key: "鞋是干的" },
  "photo-car-out": { kind: "照片", title: "出门前的车", time: "2014年8月16日 14:30", body: "十五号早上，车捡回茶几晒痕里。敞篷。车头朝窗。出门前拍的。", img: pic(5, "证据-出门前的车"), key: "车头朝窗" },
  "photo-tap-out": { kind: "照片", title: "出门前的水喉", time: "2014年8月16日 14:30", body: "拧紧。等了十秒，没有滴。出门前拍的。", img: pic(5, "证据-出门前的水喉"), key: "没有滴" },
  "paper-16": { kind: "纸", title: "十六号晚", time: "2014年8月16日", body: "二十一点四十。我返到。车已经转。水已经滴。我未离开客厅。出门前两张相：车头朝窗，水喉没有滴。", key: "车已经转" },
  "paper-20": { kind: "纸", title: "离开两分钟", time: "2014年8月20日", body: "二十三点十七。厅里望住两分钟，不动。入厕所两分钟，出来门底先有湿脚印。我在厅里望住，佢唔动。", key: "入厕所两分钟" },
  "paper-norec": { kind: "纸", title: "没有录音的一夜", time: "2014年8月23日", body: "手机留在茶几。录音键是我自己按掉的。去洗脸。门缝看得见厅。回来车在地上，头朝储物室。录音键仍然关着。", key: "录音键是我自己按掉的" },
  "note-notsaid": { kind: "记下", title: "医生没这样讲", time: "2014年8月24日", body: "姐夫说：佢话你精神唔太好。阿明没有这样讲过。", key: "阿明没有这样讲过" },
  "note-meiwater": { kind: "电话", title: "表姐听到水声", time: "2014年8月27日 夜", body: "我拧紧了水喉。表姐在电话那头仍然听到滴水。听到的是水，不是阿轩。", key: "仍然听到滴水" },
  "paper-30": { kind: "纸", title: "第三次对照", time: "2014年8月27日", body: "", key: "头两个礼拜" },
  "obj-referral": { kind: "信封", title: "抽屉缝", time: "2014年8月30日", body: "抽屉缝里折好的信封，封口朝里。回形针卡住一角，露出：……转介。其余搭在节拍器上。", img: pic(10, "示意-抽屉缝"), key: "……转介" },
  "note-zhoutue": { kind: "记下", title: "我没讲", time: "2014年8月31日 夜", body: "周说：下星期六有人上来？我煮糖水。我没有同他讲过。", key: "我没有同他讲过" },
  "obj-zhoucal": { kind: "物件", title: "周的月历", time: "2014年8月31日 夜", body: "前座门边，银行送的月历。周先生的字：\n8/1　后座入伙\n8/3　换胶圈\n8/10　租。问电话——冇。\n8/16　入（用笔涂掉了）\n8/23　六　出\n8/30　六　出\n翻到九月，只写了一格：\n9/6　六　医生", img: pic(11, "证据-周的月历"), key: "9/6　六　医生" },
  "paper-06": { kind: "纸", title: "第四次补充", time: "2014年9月5日", body: "", key: "九月" },
  "photo-back": { kind: "照片", title: "全家福背面", time: "2014年9月6日 夜", body: "相框翻过来，背面铅笔字：\n丽芬　阿轩　十二乡村屋门口　二〇一二年春", img: pic(13, "证据-全家福背面"), key: "十二乡村屋门口　二〇一二年春" },
  "paper-ming": { kind: "纸", title: "他留下的一页", time: "2014年9月6日 夜", body: "压在玩具车下面，从他本子撕下的一页：\n9/6　21:52　荣汇街后座\n水喉：拧紧后约 3 秒再滴。人手可做到。\n车：头朝储物室门。\n走廊尽头——（这一行用力划掉了）\n不写「鬼」。", img: pic(13, "证据-笔记一页"), key: "不写「鬼」" },
  "mail-dirt": { kind: "邮件", title: "你信紧的医生", time: "2014年9月7日", body: "二〇〇四年十一月，维港大学，女学生坠楼。新闻写男友罗某，自称有责任。名字涂掉，露出一个鱼。偷拍：年轻的罗，旁边长发女生望住他。没有全名。", img: pic(14, "证据-你信紧的医生"), key: "名字涂掉，露出一个鱼" },
  "fish-tag": { kind: "物件", title: "鱼牌", time: "2014年9月7日", body: "空抽屉底滑出一小块磨白塑料。鱼形。没有字。节拍器已经不在。", img: pic(14, "证据-鱼牌"), key: "没有字" },
  "chen-wallet": { kind: "物件", title: "钱夹", time: "2014年9月7日", body: "走廊椅脚边黑色钱夹。透明套里表姐和陈家豪合照。夹层里的学生证发黄：年轻的罗医生。", img: pic(14, "证据-钱夹罗证件照"), key: "夹层里的学生证" },
  "rec-name": { kind: "录音", title: "章慧琪。你知", time: "2014年9月7日 夜", body: "先是阿轩，返嚟食饭。再低一句：章慧琪。你知。声从门底来。", key: "章慧琪。你知" },
  // 「两个人」那两页写下来的纸。日子不写死：她在第 14 关就推得出周生那一页，
  // 也可能等到第 15 关拿到图书馆纪录才推得出罗启明——纸上的日子该是她写的那天。
  "paper-zhou": {
    kind: "纸", title: "这两个人", time: "",
    body: "二〇一二年九月，十二乡。一场山泥带走两个人：同村一户的妻子与儿子。\n业主姓周。相框背面的铅笔字：丽芬　阿轩　十二乡村屋门口　二〇一二年春。\n门底那个声音在叫「阿轩，返嚟食饭」。\n阿轩不是鬼。那孩子那年春天还在门口照相。",
    key: "阿轩不是鬼",
  },
  "paper-luo": {
    kind: "纸", title: "不在考场", time: "",
    body: "二〇〇四年十一月十五日，他缺考。那一科是精神科临床实习。\n十一月五日他借了一本书，应还日期是十九日。他没有还。\n十一月八日，东翼平台。十一月十一日，学校把辅导中心开到晚上十点。\n他没去。卷子发下来，那一份没人领。",
    key: "他没去",
  },
  // 第二张：鱼牌＋校报＋履历三样摆齐才写得出来。
  // 不写「那个女生是他的女朋友」——第 14 关他自己当面讲过了（missShow：「我心入面叫佢鱼」）。
  // 这张写的是他没讲的那一半：那一整年被他从履历上剪走了，却剪不干净。
  "paper-yu": {
    kind: "纸", title: "没抹干净", time: "",
    body: "校报写：二〇〇四年十一月，维港大学一个女生从教学楼坠下。男友姓罗，自称有责任。名字涂掉，露出一个「鱼」。\n他的公开履历：二〇〇五年毕业，二〇〇五年开始驻院。二〇〇四年那一整年，上头没有。\n十一月十五日，他没有去考试。\n鱼牌在空抽屉最底下。\n二〇〇四年从履历上剪走了。这块牌，他没扔。",
    key: "没抹干净",
  },
};

function item(id) {
  const base = ITEMS[id] || { kind: "证物", title: id, body: "" };
  const out = Object.assign({ id }, base);
  if (id === "paper-30") out.body = compareBody();
  if (id === "paper-06") out.body = weekCalBody();
  if (id === "paper-zhou" || id === "paper-luo" || id === "paper-yu") out.time = noteDayText();
  // 楼梯口那一晚她怎么答的，这页纸就怎么写。三档共用一条必做，不改关卡结构。
  if (id === "note-zhoutue") {
    const told = flag("zhouTold");
    if (told === "yes") {
      out.title = "我讲了";
      out.body = "周说：下星期六有人上来？我煮糖水。\n我答了是，医生上来。他从门边退开半步，让出楼梯。\n他说：糖水我先煮着。";
      out.key = "我答了是";
    } else if (told === "no") {
      out.body = "周说：下星期六有人上来？我煮糖水。\n我说没人，他听错。他没再问。\n他说：你把门锁好。";
      out.key = "我说没人";
    } else if (told === "none") {
      out.body = "周说：下星期六有人上来？我煮糖水。\n我没答。他没催，等了一会儿。\n他说：你把门锁好。";
      out.key = "我没答";
    }
  }
  return out;
}

const evSeen = (id) => hasEvidence(id) || !!(S.evOpened && S.evOpened[id]);

// 第一次看完接 next；看过再点只弹夹页
function peekItem(id, next) {
  if (evSeen(id)) showClueModal(item(id));
  else keepThen(item(id), next);
}

function itemLabel(id) {
  // 存档里的证物正常都带 kind／title；旧档或手动塞进去的只有 id，
  // 那就回 ITEMS 里取一次——不然簿子上会出现一行「·：」（10-29 探针踩到）。
  const found = hasEvidence(id) ? S.evidence.find((e) => e.id === id) : null;
  const it = found && found.kind ? found : item(id);
  // 网页新闻不在 ITEMS 里（它们是带着标题一起归档的），只剩 id 时 item() 会把 id 当标题，
  // 簿子上就出现「新闻：news-mud」。标题问 NEWS 表，那里才有读者看得懂的那一句（10-29）。
  let kind = it.kind;
  let title = it.title;
  if ((!title || title === id) && /^news-/.test(id) && typeof NEWS === "object" && NEWS[id.slice(5)]) {
    kind = "新闻";
    title = NEWS[id.slice(5)].title;
  }
  return H(kind) + "：" + H(title || id);
}

/* ---------- 归属：这一条挂在谁名下（证物页脚、人物栏共用） ---------- */

const ITEM_ABOUT = {
  "obj-keytag": ["周生"],
  "rec-water": ["水喉"],
  "letter-red": ["周生"],
  "photo-sill": ["窗台"],
  "photo-print": ["储物室门"],
  "rec-axuan": ["储物室门", "周生"],
  "note-dry": ["周生"],
  "photo-car-out": ["车"],
  "photo-tap-out": ["水喉"],
  "paper-16": ["车", "水喉"],
  "paper-20": ["车", "储物室门"],
  "paper-norec": ["车"],
  "note-notsaid": ["表姐一家", "罗启明"],
  "note-meiwater": ["水喉", "表姐一家"],
  "paper-30": ["车", "水喉", "窗台"],
  "obj-referral": ["罗启明"],
  "note-zhoutue": ["周生"],
  "obj-zhoucal": ["周生"],
  "paper-06": ["车", "水喉"],
  "photo-back": ["周生"],
  "paper-ming": ["罗启明", "车", "水喉"],
  "mail-dirt": ["罗启明"],
  "fish-tag": ["罗启明"],
  "chen-wallet": ["表姐一家", "罗启明"],
  "rec-name": ["储物室门"],
  // 两条从网页上抄下来的新闻也归人：山泥那条是周生的十二乡，
  // 市建局那条讲的是这栋楼。新闻原本就进得了簿子，只是从来没归过主人（10-28）。
  "news-mud": ["周生"],
  // 罗线最重的两样一直没贴上主人：校报旧闻写着「男友姓罗」「涂掉的名字露出一个鱼」，
  // 公开履历写着二〇〇五年毕业、中间那一年不见了。不归过来，他那栏就只剩几个日子（10-29）。
  "news-yu04": ["罗启明"],
  "news-kimon": ["罗启明"],
};

const itemAbout = (id) => ITEM_ABOUT[id] || [];

// 笔记和已记下的证物讲同一件事时，目录只列证物。
// 末三条是网页新闻：新闻本身「记下来」归档成证物，同一句话又「抄一行」成了笔记，
// 两行并排的时候「两个人」那一栏看着像重了影。有新闻这件证物，抄的那条就不必再列（10-29）。
const NOTE_IN_ITEM = {
  print: "photo-print", voice: "rec-axuan", sill: "photo-sill", dirt: "mail-dirt",
  namecall: "rec-name", takeback: "letter-red",
  "yu-old": "news-yu04", "kimon-bio": "news-kimon", "web-zhou": "news-mud",
};

// 第 3 关日历上点开的那几天，钟仍停在八月一日
const NOTE_DAY = { "tap-fixed": "8月3日", "gate-tick": "8月11日", "car-still": "8月12日" };

const noteTime = (n) => NOTE_DAY[n.id] || n.time;

function noteShown(n) {
  if (/^cal-/.test(n.id)) return !hasEvidence("paper-06");
  const it = NOTE_IN_ITEM[n.id];
  return !(it && hasEvidence(it));
}

/* 这一件东西归谁（证物页脚下那一行）。

   从前这里是「同一样东西」：按 ITEM_ABOUT 的内部标签算近邻，取同得最多、日子最近的三样。
   标签是玩家看不见的东西，所以录音那一页把「钥匙牌」列了进来（都带「周生」与「储物室门」），
   而同一晚最该看的「窗台童码」反倒不在——它的标签是「窗台」。那一栏既解释不了自己，
   也只是把刚在时间线上看过的三条抄成一份目录。整块删掉（10-29）。

   留下来的只有归属：想「这条归谁」，簿子第三页按人排好了，还带计数和推理。
   ITEM_ABOUT 不能跟着一起删——whoRows() 靠它认人。 */
function itemOwner(id) {
  const about = itemAbout(id);
  return PEOPLE.find((p) => about.includes(p.name)) || null;
}

/* ---------- 四条 ---------- */

const FOUR = [
  { id: "pay", text: "冇粮单", hit: /粮单|工资单|在职证明|公司|面试|商业登记|上班族|从业员/ },
  { id: "guar", text: "冇担保", hit: /担保/ },
  { id: "now", text: "要即刻住", hit: /即日|一年|十个月|订金|定金/ },
  { id: "week", text: "每星期三千几", hit: /周租|按周|口头|家庭户/ },
];

function strikeFour(text, where) {
  S.four = S.four || {};
  let hit = false;
  FOUR.forEach((f) => {
    if (!f.hit.test(text || "")) return;
    S.four[f.id] = S.four[f.id] || [];
    if (!S.four[f.id].includes(where)) S.four[f.id].push(where);
    hit = true;
  });
  if (hit) renderNotes();
}

function fourRows() {
  S.four = S.four || {};
  return FOUR.map((f) => {
    const stuck = S.four[f.id] || [];
    return el("li", { class: stuck.length ? "struck" : "" }, [
      el("span", { class: "four-k" }, [f.text]),
      stuck.length ? el("small", {}, ["卡住：" + stuck.join("、")]) : "",
    ]);
  });
}

/* 「租房必需四条」直接摊在 To do 那一页上，不再另开一层纸。
   从前它在「要摆的纸」底下占一行，点进去才看得见哪一条被哪一间顶回来过——
   一页上于是叠着四层标题（To do／（续）／要摆的纸／租房必需四条），为的只是四行字。
   两列格子就放得下的东西，不该再让人翻一页（10-30）。
   行还是 fourRows() 那一套：划掉的是「这条被顶回来过」，后面跟着是哪一间。 */
function fourBlock() {
  const rows = fourRows();
  // 四条都过得去的那间屋有了名字，就补在格子末尾、横跨两列——
  // 上面三行只写得出「哪一间被顶回来」，不写这一句，这一块就没有答案。
  if (S.known && S.known.rong) rows.push(el("li", { class: "four-ok" }, ["荣汇街 28 号：四条都过。"]));
  return [
    diarySubHead("租房必需四条"),
    el("ul", { class: "four-list four-cols" }, rows),
  ];
}

/* ---------- 屋里的样子／今晚（搬进来那晚记下的，夜里拿来比） ---------- */

const BASE = [
  { id: "car", name: "玩具车", mark: "玩具车", base: "车头朝窗。敞篷座位里没有灰。", tonight: "车头朝门，后来掉在地上朝储物室。" },
  { id: "tap", name: "厨房水龙头", mark: "关了还会滴一滴", base: "关了还会滴一滴。", tonight: "拧紧，三秒后又滴。" },
  { id: "storage", name: "储物室门", mark: "锁着，门底没有光", base: "锁着，门底没有光。", tonight: "门底有翻纸声。门缝下没有光。" },
  { id: "sill", name: "主房窗台", mark: "一圈水印，是干的", base: "一圈水印，是干的。", tonight: "湿的童码。鞋并上去比，小两号。" },
  { id: "family", name: "全家福", mark: "挂得很正", base: "客厅墙上，挂得很正。相后两个纸箱。女人头发齐肩。", tonight: "" },
];
const PRINT_ROW = { id: "print", name: "门底", base: "", tonight: "湿脚印，走到一半停住。" };

function baseText(id) {
  if (id === "tap" && S.calSeen && S.calSeen["08-03"]) return "八月三日修好后不滴。";
  const row = BASE.concat([PRINT_ROW]).find((b) => b.id === id);
  return row ? row.base : "";
}

function baseCount() {
  return BASE.filter((b) => S.base && S.base[b.id]).length;
}

function pairCount() {
  return Object.keys(S.pairs || {}).length;
}

function tonightText(id) {
  if (id === "storage" && hasEvidence("rec-axuan")) return "门底有翻纸声。录音里有女人叫「阿轩」。";
  const row = BASE.concat([PRINT_ROW]).find((b) => b.id === id);
  return row ? row.tonight : "";
}

function baseSheet(id, body, onClose) {
  const row = BASE.find((b) => b.id === id);
  S.base = S.base || {};
  const show = () => showClueModal({
    id: "base-" + id,
    title: row.name,
    time: "2014年8月1日 夜",
    body,
    key: row.mark,
  }, {
    canFile: !S.base[id],
    isFiled: () => !!S.base[id],
    mustFile: !S.base[id],
    keep: () => {
      S.base[id] = true;
      renderNotes();
    },
    onClose: () => {
      if (!S.base[id]) {
        tip("先记进日记簿。", { nearBar: true });
        show();
        return;
      }
      if (onClose) onClose();
    },
  });
  show();
}

function markTonight(id) {
  S.tonight = S.tonight || {};
  if (S.tonight[id]) return;
  S.tonight[id] = true;
  renderNotes();
}

function openBase() {
  const nightSide = S.level === 4 ? "今晚" : "十四号夜";
  showDiaryTool({
    kind: S.level <= 3 ? "屋里的样子" : "搬进来那晚",
    build: (host) => {
      const kept = (b) => S.base && S.base[b.id];
      const late = (b) => S.tonight && S.tonight[b.id];
      const rows = BASE.filter((b) => kept(b) || late(b)).map((b) => el("li", { class: kept(b) ? "" : "empty" }, [
        el("span", { class: "four-k" }, [b.name]),
        kept(b) ? el("small", {}, [baseText(b.id)]) : "",
        late(b) ? el("small", { class: "tonight" }, [nightSide + "：" + tonightText(b.id)]) : "",
      ]));
      if (rows.length) host.append(el("ul", { class: "four-list" }, rows));
      const left = BASE.filter((b) => !kept(b) && !late(b)).map((b) => b.name);
      if (left.length) host.append(el("p", { class: "tool-note" }, ["还没看清：" + left.join("、")]));
    },
  });
}

function openPairs(onClose) {
  let pick = "";
  const rows = BASE.concat([PRINT_ROW]);
  showDiaryTool({
    kind: "摆在一起",
    onClose,
    build: (host, redraw) => {
      S.pairs = S.pairs || {};
      const full = pairCount() >= 3;
      const need = 3 - pairCount();
      const found = rows.filter((r) => S.tonight && S.tonight[r.id]).length;
      const loose = rows.filter((r) => S.tonight && S.tonight[r.id] && !S.pairs[r.id]);
      const empty = !full && !loose.length;
      const leave = () => {
        closeDiaryTool();
        afterModalClose(onClose);
      };
      const step = full ? 0 : empty ? 1 : pick ? 3 : 2;
      const guide = el("div", { class: "tool-guide" });
      // 第一格原来留空：摆齐之后这一框里一个字都没有，只剩右边那个绝对定位的胶囊，
      // 框就塌成一条横线、「✓ 齐了」跑到框外面。（两栏之后才看清，10-29）
      const lead = ["三处对上了。", "先去屋里找，今晚哪里不一样。", "点一张今晚看见的。", "再点它对应的那一格。"][step];
      if (lead) guide.append(el("p", { class: "tool-lead" }, [lead]));
      guide.append(el("span", { class: "tool-progress" + (full ? " done" : "") }, [
        full ? "✓ 齐了" : "已摆好 " + pairCount() + "／3",
      ]));
      host.append(guide);
      const cards = el("div", { class: "tool-cards pair-cards" });
      // 齐了且没有别的纸条时才写这一句；齐了还有没配的，就让它留在左栏里——
      // 那张也是今晚看见的，写着「摆齐了」再摆一张在下面会打架。
      if (full && !loose.length) cards.append(el("p", { class: "tool-note" }, ["今晚的都摆上了。"]));
      else if (empty) {
        // 顶上的引导语已经说了「先去屋里找」，这里只报一句空、给一个门。
        // 从前这里又写一遍「先合上日记簿，去屋里看看哪里跟搬进来那晚不一样」——
        // 同一句话在同一屏说两遍，中间只隔三行（10-30）。
        cards.append(el("div", { class: "tool-empty" }, [
          el("p", { class: "tool-empty-lead" }, [found ? "找到的都摆上了，还差 " + need + " 处。" : "今晚看见的，这里还一张都没有。"]),
          el("button", { type: "button", class: "tool-empty-go", onclick: leave }, ["先去屋里看看"]),
        ]));
      }
      loose.forEach((r) => {
        cards.append(el("button", {
          type: "button",
          class: "tool-card" + (pick === r.id ? " sel" : ""),
          onclick: () => {
            pick = pick === r.id ? "" : r.id;
            redraw();
          },
        }, ["今晚：" + tonightText(r.id)]));
      });
      if (!full && loose.length && loose.length < need) {
        host.append(el("p", { class: "tool-more" }, [
          "这些摆好也还差 " + (need - loose.length) + " 处，要再去屋里找。",
          el("button", { type: "button", class: "tool-more-go", onclick: leave }, ["去屋里"]),
        ]));
      }
      const list = el("div", { class: "tool-rows pair-rows" + (empty ? " idle" : "") });
      rows.forEach((r) => {
        if (r.id === "family") return;
        const known = r.id === "print" || (S.base && S.base[r.id]);
        const paired = S.pairs[r.id];
        list.append(el("button", {
          type: "button",
          class: "tool-row" + (paired ? " done" : ""),
          onclick: () => {
            if (paired) return;
            if (empty) {
              toolSay(host, "手上还没有今晚的线索。先去屋里找，再回来摆。");
              return;
            }
            if (!pick) {
              toolSay(host, "先点上面一张「今晚」的。");
              return;
            }
            if (!known) {
              toolSay(host, "搬进来那晚是怎样，我当时没有记下。");
              return;
            }
            if (pick !== r.id) {
              toolSay(host, "这两样对不上。");
              return;
            }
            S.pairs[r.id] = true;
            pick = "";
            const then = baseText(r.id);
            note("pair-" + r.id, r.name + "：搬进来那晚" + (then ? "「" + then + "」" : "没有记下") + "，今晚「" + tonightText(r.id) + "」");
            redraw();
          },
        }, [
          el("span", { class: "four-k" }, [r.name]),
          el("small", {}, ["搬进来那晚：" + (r.id === "print" ? "（没有）" : known ? baseText(r.id) : "（没有记下）")]),
          paired ? el("small", { class: "tonight" }, ["今晚：" + tonightText(r.id)]) : "",
        ]));
      });
      // 两栏并排：左边「今晚看见的」纸条，右边「搬进来那晚」的格子。
      // 原来是上下两段——点一张今晚的纸条要去下面找它那一格，中间还夹着「还差 N 处」那一行，
      // 1280 下也要滚。并排之后「这一张配哪一格」在一屏里对着看（10-29）。
      // 手机上还是回到上下（见 style-chrome.css 的 640 断点）：一栏放不下两句对照。
      host.append(el("div", { class: "pair-split" }, [
        el("div", { class: "pair-col" }, [
          el("p", { class: "pair-col-title" }, ["今晚看见的"]),
          cards,
        ]),
        el("div", { class: "pair-col" }, [
          el("p", { class: "pair-col-title" }, ["搬进来那晚"]),
          list,
        ]),
      ]));
    },
  });
}

function toolSay(host, text) {
  const old = host.querySelector(".tool-say");
  if (old) old.remove();
  host.prepend(el("p", { class: "tool-say" }, [text]));
}

/* ---------- 作业卡 ---------- */

const HOMEWORK = {
  6: "写时间。几时、喺边间房、离开几耐、边样动咗。唔好写「好恐怖」。下星期六带录音同纸。",
  8: "有一夜唔开录音，仍然写纸。写低头两个礼拜边样唔动、十五号先开始边样。下星期六带来。",
  10: "纸仍然要带。多写呢个星期：车几转、你几时喺边间房、水喉几耐滴一次。",
};

// 作业卡：每条要求对哪张纸；手上有就打勾
const HOMEWORK_ROWS = {
  6: [["几点、在哪间房、怎样动", "paper-16"], ["离开多久：盯住和走开，各试一次", "paper-20"]],
  8: [["有一夜不开录音，照样写", "paper-norec"], ["头两个礼拜和十五号之后，对照", "paper-30"]],
  10: [["这星期：车几转、我在哪间房、水喉多久滴一次", "paper-06"]],
};

function giveHomework(n, next) {
  S.homework = { n, body: HOMEWORK[n] };
  renderNotes();
  showClueModal({
    kind: "作业卡",
    title: "他写下的",
    time: S.time,
    body: HOMEWORK[n],
  }, { canFile: false, onClose: next });
}

/* ---------- 把搜集的东西给他看 ---------- */
// 每轮只交这一周最要紧的那几样；多交、交错都不能「放好了」。

const HAND_REPLY = {
  6: {
    "note-dry": "鞋是干的，呢句我写低。",
    "photo-sill": "比你只脚细两号。我记低尺寸。今日唔判系边个。",
    "photo-print": "行到一半停。我写「停」，唔写「鬼」。",
  },
  8: {
    "paper-16": "十六号晚。你未离开客厅，车已经转。我望住。",
    "paper-20": "两分钟。望住唔动，离开先动。我望到佢动。",
  },
  10: {
    "paper-30": "头两个礼拜，十五号之后。你分得好清楚。",
    "paper-norec": "熄咗录音，车照郁。……对照纸都放低，我并住睇。",
  },
  12: {
    "paper-06": "九月一号、二号、四号。俾我三分钟。",
    "paper-30": "三十号嗰页我睇过。新嘅放低，我并埋一齐睇。",
  },
};

// from：这一轮该交的；exactly：要交几样（初诊只交一样）
const HAND_RULE = {
  6: { from: ["note-dry", "photo-sill", "photo-print"], exactly: 1 },
  8: { from: ["paper-16", "paper-20"], exactly: 1 },
  10: { from: ["paper-30", "paper-norec"], exactly: 1 },
  12: { from: ["paper-06", "paper-30"], exactly: 1 },
};

function handOver(n, onDone) {
  const rule = HAND_RULE[n] || { from: [], exactly: 0 };
  const needN = rule.exactly;
  const given = [];
  let say = "";
  // 必须正好 needN 样，且全在本轮名单里（初诊三选一；其余整组交齐）
  const ready = () => needN > 0 && given.length === needN && given.every((id) => rule.from.includes(id));
  showDiaryTool({
    kind: "把你搜集的东西给他看",
    lock: true,
    build: (host, redraw) => {
      const guide = el("div", { class: "tool-guide" });
      guide.append(el("p", { class: "tool-lead" }, ["只交这一周最要紧的。交错、交多了，放不好。"]));
      guide.append(el("span", { class: "tool-progress" + (ready() ? " done" : "") }, [
        ready() ? "✓ 齐了" : "已选 " + given.length + "／" + needN,
      ]));
      host.append(guide);
      if (say) host.append(el("p", { class: "tool-reply" }, ["罗启明：" + say]));
      const cards = el("div", { class: "tool-cards" });
      const list = S.evidence || [];
      if (!list.length) {
        cards.append(el("p", { class: "tool-note" }, ["日记簿里还没有东西。"]));
      }
      list.forEach((e) => {
        const on = given.includes(e.id);
        const useful = rule.from.includes(e.id);
        cards.append(el("button", {
          type: "button",
          class: "tool-card" + (on ? " sel" : "") + (!useful ? " mute" : ""),
          onclick: () => {
            if (on) {
              const i = given.indexOf(e.id);
              if (i >= 0) given.splice(i, 1);
              say = "";
              redraw();
              return;
            }
            if (!useful) {
              toolSay(host, "这一样今天不用交。");
              return;
            }
            if (given.length >= needN) {
              toolSay(host, "交多了。先点掉一样，再换。");
              return;
            }
            given.push(e.id);
            S.handed = S.handed || {};
            S.handed[n] = given.slice();
            say = (HAND_REPLY[n] || {})[e.id] || "呢样我记低。";
            redraw();
          },
        }, [H(e.kind) + "：" + H(e.title)]));
      });
      host.append(cards);
    },
    actions: () => [{
      label: ready() ? "放好了" : "还没放好",
      primary: true,
      disabled: !ready(),
      fn: () => {
        if (!ready()) return;
        S.handed = S.handed || {};
        S.handed[n] = given.slice();
        S.handed["ok" + n] = true;
        closeDiaryTool();
        onDone();
      },
    }],
  });
}

/* ---------- 分两堆 ---------- */

const PILES = [
  ["离开房间它先动", "paper"],
  ["我喺厅里望住，佢唔动", "paper"],
  ["声从储物室门底来", "paper"],
  ["车会自己转", "paper"],
  ["间屋有鬼", "heart"],
  ["我冇问题", "heart"],
];

function sortPiles(onDone) {
  const placed = {};
  let say = "";
  showDiaryTool({
    kind: "分两堆",
    lock: true,
    build: (host, redraw) => {
      host.append(el("p", { class: "tool-lead" }, ["纸上写的，和心里信的，分开。"]));
      if (say) host.append(el("p", { class: "tool-reply" }, ["罗启明：" + say]));
      const rows = el("div", { class: "tool-rows" });
      PILES.forEach(([text, pile], i) => {
        const at = placed[i];
        const put = (where) => {
          if (where !== pile) {
            say = "呢句纸上有写？";
            redraw();
            return;
          }
          placed[i] = where;
          say = "";
          redraw();
        };
        rows.append(el("div", { class: "tool-row sort" + (at ? " done " + at : "") }, [
          el("span", { class: "four-k" }, ["「" + text + "」"]),
          at
            ? el("span", {
              class: "sort-mark " + at,
              title: at === "paper" ? "纸上写住的" : "我心里信的",
            }, [at === "paper" ? "写" : "心"])
            : el("span", { class: "sort-btns" }, [
              el("button", { type: "button", onclick: () => put("paper") }, ["纸上写住的"]),
              el("button", { type: "button", onclick: () => put("heart") }, ["我心里信的"]),
            ]),
        ]));
      });
      host.append(rows);
    },
    actions: () => [{
      label: Object.keys(placed).length === PILES.length ? "分好了" : "未分完（" + Object.keys(placed).length + "／6）",
      primary: true,
      disabled: Object.keys(placed).length < PILES.length,
      fn: () => {
        S.sorted = true;
        closeDiaryTool();
        onDone();
      },
    }],
  });
}

/* ---------- 诊所里做过的：交了什么、他回了什么，分两堆的结果 ---------- */

const CLINIC_DAY = { 6: "2014年8月16日", 8: "2014年8月23日", 10: "2014年8月30日", 12: "2014年9月6日" };

function handLog(n) {
  const rule = HAND_RULE[n] || { from: [], exactly: 0 };
  const given = (S.handed && Array.isArray(S.handed[n]) && S.handed[n].length) ? S.handed[n] : rule.from.slice(0, rule.exactly);
  const body = given.map((id) => itemLabel(id) + "\n罗启明：" + ((HAND_REPLY[n] || {})[id] || "呢样我记低。")).join("\n\n");
  return { kind: "交给罗启明", title: "交给罗启明", time: CLINIC_DAY[n], body };
}

function sortLog() {
  const pile = (p) => PILES.filter(([, at]) => at === p).map(([t]) => "「" + t + "」").join("\n");
  return { kind: "分两堆", title: "分两堆", time: CLINIC_DAY[8], body: "纸上写住的：\n" + pile("paper") + "\n\n我心里信的：\n" + pile("heart") };
}

// 「我写的」里诊所那一栏：按日子排
function clinicLogs() {
  const rows = [];
  [6, 8, 10, 12].forEach((n) => {
    if (S.handed && S.handed["ok" + n]) rows.push({ day: CLINIC_DAY[n], label: "交给罗启明", open: () => handLog(n) });
    if (n === 8 && S.sorted) rows.push({ day: CLINIC_DAY[8], label: "分两堆", open: sortLog });
  });
  return rows;
}

/* ---------- 对照纸 ---------- */

/* topic 是行头，写这一行说的是哪件东西。
   以前只有两栏标题、六行全是空格子，卡片该落在哪一行没有依据，
   唯一的路是「选中之后哪个格子亮」——那等于把答案指给她看（10-30 用户提的）。
   现在行头告诉她放到哪一行，选中不再高亮，放错才说一句。 */
const COMPARE_ROWS = [
  { id: "car", topic: "车", left: ["base:car"], right: ["tonight:car", "paper-16"], lt: "车头朝窗，放角落第二日仍在", rt: "车自己转，掉在地上朝储物室" },
  { id: "tap", topic: "水龙头", left: ["base:tap"], right: ["tonight:tap", "note-meiwater"], lt: "关了水喉滴一滴", rt: "拧紧三秒再滴" },
  { id: "rec", topic: "储物室门", left: ["rec-water", "base:storage"], right: ["rec-axuan", "tonight:storage"], lt: "十三号录音只有水，门后很静", rt: "门底有声，录音有女人叫阿轩" },
  { id: "sill", topic: "窗台", left: ["base:sill"], right: ["photo-sill", "tonight:sill"], lt: "窗台水印是干的", rt: "湿童码，比我细两号" },
  { id: "shoe", topic: "鞋", fixedLeft: "周没有问过我的鞋", right: ["note-dry"], rt: "周问我脚湿不湿，鞋是干的" },
  { id: "time", topic: "时间", fixedLeft: "—", right: ["paper-20", "paper-norec", "photo-print", "tonight:print"], rt: "离开两分钟先动；没录音那晚车仍然走" },
];

function compareAllowed() {
  const set = new Set();
  COMPARE_ROWS.forEach((r) => {
    (r.left || []).forEach((t) => set.add(t));
    (r.right || []).forEach((t) => set.add(t));
  });
  return set;
}

function compareOwnedRaw() {
  const out = [];
  BASE.forEach((b) => { if (S.base && S.base[b.id]) out.push("base:" + b.id); });
  BASE.concat([PRINT_ROW]).forEach((b) => { if (S.tonight && S.tonight[b.id]) out.push("tonight:" + b.id); });
  (S.evidence || []).forEach((e) => out.push(e.id));
  return out;
}

// 只列出能放进对照纸的，避免无关卡片诱人去点、点了又放不进
function compareTokens() {
  const allow = compareAllowed();
  return compareOwnedRaw().filter((t) => allow.has(t));
}

// 开对照纸前补齐通关必需材料，防止旧存档／跳关缺卡卡死
function ensureCompareMaterials() {
  S.base = S.base || {};
  S.tonight = S.tonight || {};
  Object.keys(S.pairs || {}).forEach((id) => {
    if (id === "print") S.tonight.print = true;
    else {
      S.base[id] = true;
      S.tonight[id] = true;
    }
  });
  const must = ["note-dry", "rec-water", "paper-16", "paper-20", "photo-print"];
  if (flag("photoSill")) must.push("photo-sill");
  if (noted("voice") || hasEvidence("rec-axuan") || (S.tonight && S.tonight.storage)) must.push("rec-axuan");
  if (hasEvidence("paper-norec") || S.level >= 9) must.push("paper-norec");
  if (hasEvidence("note-meiwater")) must.push("note-meiwater");
  seedItems(must.filter((id) => !hasEvidence(id)));
  if (!compareSolvable()) {
    ["car", "tap", "storage", "sill"].forEach((id) => {
      S.base[id] = true;
      S.tonight[id] = true;
    });
    S.tonight.print = true;
    seedItems(["note-dry", "rec-water", "rec-axuan", "paper-16", "paper-20", "paper-norec", "photo-print"]
      .concat(flag("photoSill") ? ["photo-sill"] : [])
      .filter((id) => !hasEvidence(id)));
  }
}

function comparePool() {
  const pool = new Set(compareOwnedRaw());
  Object.values(S.compare || {}).forEach((t) => { if (t) pool.add(t); });
  return pool;
}

function compareRowOpen(r, pool) {
  const leftOk = !!(r.fixedLeft || (r.left || []).some((t) => pool.has(t)));
  const rightOk = (r.right || []).some((t) => pool.has(t));
  return leftOk && rightOk;
}

function compareSolvable() {
  const pool = comparePool();
  if (!pool.has("note-dry") && !(S.compare && S.compare["shoe:R"])) return false;
  const n = COMPARE_ROWS.filter((r) => compareRowOpen(r, pool)).length;
  return n >= 4 && COMPARE_ROWS.some((r) => r.id === "shoe" && compareRowOpen(r, pool));
}

function tokenLabel(t) {
  // 卡片抬头写清「哪件东西（什么时候记的）」：东西在前、时候进括号。
  // 以前是「搬进来·沙发：…」，中点是拼出来的分隔，读起来像机器写的。
  if (t.startsWith("base:")) {
    const b = BASE.find((x) => x.id === t.slice(5));
    return b.name + "（搬进来）：" + baseText(b.id);
  }
  if (t.startsWith("tonight:")) {
    const id = t.slice(8);
    const b = BASE.concat([PRINT_ROW]).find((x) => x.id === id);
    return b.name + "（" + (S.level === 4 ? "今晚" : "十四号夜") + "）：" + tonightText(id);
  }
  return itemLabel(t);
}

function compareDone() {
  const c = S.compare || {};
  return COMPARE_ROWS.filter((r) => (r.fixedLeft || c[r.id + ":L"]) && c[r.id + ":R"]);
}

function compareReady() {
  const rows = compareDone();
  return rows.length >= 4 && rows.some((r) => r.id === "shoe");
}

function compareBody() {
  const rows = compareDone();
  // 对照纸是日记里的一页，两栏用斜线分——不用「　｜　」那种拿全角空格撑出来的竖线
  const lines = rows.map((r) => (r.fixedLeft || r.lt) + "／" + r.rt);
  const head = "头两个礼拜／十五号之后\n" + (lines.length ? lines.join("\n") : "（还没写）");
  // 纸尾那一行是她自己写的结论。放在正文里，不在簿子里另开一条——
  // 同一句话走两条进簿子的路会重影（NOTE_IN_ITEM 就是为这个存在的）。
  // 这一行单独过 H()：正文是整串拼出来的，整串查不到表，不单独转就会在普通话模式里漏粤语。
  const tail = compareGuessText();
  return tail ? head + "\n\n" + H(tail) : head;
}

function compareAlmost() {
  return compareDone().length >= 4;
}

/* ---------- 对照纸的纸尾一行 ----------
 *
 * 为什么要有这一步：上面四行是她一张一张摆进去的，摆完之后一直是阿明把结论读出来
 * ——推理落在 NPC 那边，玩家只是搬纸。这一行要求她先写：四行合起来，她自己看见什么。
 *
 * 只给一道题，三条选一句，选错不罚。选错的那句淘汰话用屋子里的东西说（凳子不会自己走），
 * 不用术语、不由他替她讲道理——她挑起来的东西自己会顶回来。
 * 写完 index 存 S.compareGuess（-1＝未写），纸尾正文跟着变，诊室里他读的也是这一句。 */
const COMPARE_GUESS = [
  { ok: true, yue: "有人知道门底有水。我从来冇同佢讲过。", zh: "有人知道门底有水。我从来没有跟他说过。" },
  {
    yue: "呢间屋自己识郁。车、水喉、脚印，都系佢。", zh: "这间屋子自己会动。车、水管、脚印，都是它。",
    no: "会郁嘅嘢，都要有人先郁过佢。张凳唔会自己行出门口。",
    noZh: "会动的东西，都得有人先动过它。凳子不会自己走出门口。",
  },
  {
    yue: "我一直冇留意。可能搬入嚟佢就系咁。", zh: "我一直没留意。也许搬进来它就是这么回事。",
    no: "纸左边嗰四行系你自己写嘅：头两个礼拜乜都冇。",
    noZh: "纸左边那四行是你自己写的：头两个星期什么都没有。",
  },
];

const compareGuessIdx = () => (typeof S.compareGuess === "number" ? S.compareGuess : -1);
const compareOkIdx = () => COMPARE_GUESS.findIndex((g) => g.ok);

function compareGuessText() {
  const i = compareGuessIdx();
  return i >= 0 && COMPARE_GUESS[i] ? COMPARE_GUESS[i].yue : "";
}

/* 纸尾那一行。写完才给纸入簿（keepMust 在她这一句之后），所以有这个证物＝有这一句。 */
function openCompareGuess(onWrite) {
  let tried = -1;
  showDiaryTool({
    kind: "对照纸",
    build: (host, redraw) => {
      host.append(el("p", { class: "tool-lead" }, ["四行写好了。张纸最底下，我再写一行。"]));
      if (tried >= 0) host.append(el("p", { class: "tool-say" }, [COMPARE_GUESS[tried].no]));
      const cards = el("div", { class: "tool-cards" });
      COMPARE_GUESS.forEach((g, i) => {
        cards.append(el("button", {
          type: "button",
          class: "tool-card",
          onclick: () => {
            if (!g.ok) { tried = i; redraw(); return; }
            S.compareGuess = i;
            if (typeof sfx === "function") sfx("paper");
            closeDiaryTool();
            onWrite();
          },
        }, [g.yue]));
      });
      host.append(cards);
    },
    actions: () => [{ label: "先合上", fn: () => { closeDiaryTool(); afterModalClose(); } }],
  });
}

function openCompare(onDone) {
  let pick = "";
  let hostEl = null;
  S.compare = S.compare || {};
  ensureCompareMaterials();
  showDiaryTool({
    kind: "对照纸",
    build: (host, redraw) => {
      hostEl = host;
      const n = compareDone().length;
      const guide = el("div", { class: "tool-guide" });
      // 选中之后不再高亮能放的格子——那是把答案指给她看。
      // 该说的两条：左边一栏是什么、右边一栏是什么；放错了才回一句。
      guide.append(el("p", { class: "tool-lead" }, [pick ? "点一格，放进去。" : "点一张卡片，再点格子。"]));
      guide.append(el("p", { class: "tool-lead" }, ["左栏头两个礼拜，右栏十五号之后。"]));
      // 「四行」只是数量，真正卡人的是鞋印那一行。写在这里，不让人凑满四行再来回试。
      if (!compareReady()) guide.append(el("p", { class: "tool-lead" }, ["其中一行要是鞋印。"]));
      guide.append(el("span", { class: "tool-progress" + (compareReady() ? " done" : "") }, [
        compareReady() ? "✓ 齐了" : "已写 " + n + "／4",
      ]));
      host.append(guide);
      if (!compareSolvable()) {
        host.append(el("p", { class: "tool-say" }, ["材料还不够对照。先把这一周该记下的记下，再回来。"]));
      }
      host.append(el("p", { class: "tool-label" }, ["我记下的"]));
      const used = Object.values(S.compare);
      const loose = compareTokens().filter((t) => !used.includes(t));
      const cards = el("div", { class: "tool-cards compare-cards" });
      loose.forEach((t) => {
        cards.append(el("button", {
          type: "button",
          class: "tool-card" + (pick === t ? " sel" : ""),
          onclick: () => {
            pick = pick === t ? "" : t;
            redraw();
          },
        }, [tokenLabel(t)]));
      });
      if (!loose.length) {
        cards.append(el("p", { class: "tool-note" }, ["能对照的都用上了。点已放好的格可以拿回来。"]));
      }
      host.append(cards);
      host.append(el("p", { class: "tool-label" }, ["对照纸"]));
      // 放错的回话贴在格子上面，不放页面顶部：格子在这一屏最底下，
      // 提示若跑到顶上（toolSay 是 prepend），她正看着格子，看不见那句。
      const sayBox = el("p", { class: "tool-say", hidden: true });
      host.append(sayBox);
      const warn = (node, msg) => {
        // textContent 不过 H()，港繁要在自己这里转一次
        sayBox.textContent = H(msg);
        sayBox.hidden = false;
        node.classList.add("bad");
        setTimeout(() => node.classList.remove("bad"), 700);
      };
      const grid = el("div", { class: "compare-grid" });
      grid.append(el("b", { class: "compare-corner" }, [""]), el("b", {}, ["头两个礼拜"]), el("b", {}, ["十五号之后"]));
      COMPARE_ROWS.forEach((r) => {
        const slot = (side) => {
          const key = r.id + ":" + side;
          const filled = S.compare[key];
          const fixed = side === "L" && r.fixedLeft;
          const ok = (side === "L" ? r.left : r.right) || [];
          if (fixed) return el("div", { class: "compare-slot fixed" }, [r.fixedLeft]);
          const btn = el("button", {
            type: "button",
            class: "compare-slot" + (filled ? " filled" : ""),
            onclick: () => {
              if (filled) {
                delete S.compare[key];
                redraw();
                return;
              }
              if (!pick) {
                warn(btn, "先点上面一张卡片。");
                return;
              }
              if (!ok.includes(pick)) {
                const other = side === "L" ? r.right : r.left;
                warn(btn, other && other.includes(pick) ? "放反了。这一张该放另一边。" : "不对。这一张不是这一行的。");
                return;
              }
              S.compare[key] = pick;
              pick = "";
              redraw();
            },
          }, [filled ? (side === "L" ? r.lt : r.rt) : "放在这里"]);
          return btn;
        };
        grid.append(el("span", { class: "compare-topic" }, [r.topic]), slot("L"), slot("R"));
      });
      host.append(grid);
    },
    actions: () => [{
      label: compareReady() ? "写好了" : (compareAlmost() ? "还差一点" : "未写好"),
      primary: true,
      disabled: !compareAlmost(),
      fn: () => {
        if (!compareReady()) {
          if (hostEl) toolSay(hostEl, "四行有了，还缺鞋印那一行。再翻翻你记下的。");
          return;
        }
        closeDiaryTool();
        onDone();
      },
    }, {
      label: "先合上",
      fn: () => {
        closeDiaryTool();
        afterModalClose();
      },
    }],
  });
}

/* ---------- 我认识的人：把簿子里的事按人分开，再问一句「合起来是什么」 ---------- */

/* 网页上的字进了簿子，是一行一行散着的。这一页把它们按人分开：
   周生那边是这间屋，罗启明那边是二〇〇四年十一月。
   归类不要她动手——条目自己认得主人（证物看 ITEM_ABOUT，抄下来的笔记看 who）；
   她要做的只有最后那一下：从三句里挑一句，把它写下来。
   三条候选只有一条对，选错不罚，只换一句她自己的反驳，可以再选。

   为什么不给「全部集齐」才可推：任何一条藏在不好找的页面上（公告存档最底那条），
   整条线就停在门口。必要几条够了就写得出来，缺的那几处只留在栏里当计数（10-29）。

   罗启明有两问。第一问只到「他出了事」，材料全在第 15 关的校园网上；
   第二问要鱼牌、校报、公开履历——三样都在第 14 关，且都藏在可做可不做的分支里，
   所以它不挂关卡、凑不齐就不出现。第一页是这一章能给的，第二页是给第二章留的钩。 */
const PEOPLE = [
  {
    key: "zhou",
    name: "周生",
    sub: "这间屋",
    min: 3,
    need: ["photo-back", "news-mud", "rec-axuan"],
    q: "这几样合起来是……",
    options: [
      { t: "他把这间屋租给我，是想有人陪他。", no: "不对。他要的是有人住。有人住，他才有租收。" },
      { t: "二〇一二年十二乡那场山泥里死的两个人，是他的妻子和儿子。", ok: true },
      { t: "储物室里住着一个人，他不让我进去。", no: "门是从里面锁着的。里面没有人住。" },
    ],
    paper: "paper-zhou",
    flag: "deduce-zhou",
  },
  {
    key: "luo",
    name: "罗启明",
    sub: "二〇〇四年十一月",
    min: 3,
    need: ["vhu-miss04", "vhu-grief04", "vhu-news04", "vhu-lib-trace"],
    q: "这几样合起来是……",
    options: [
      { t: "他那一科没考，是因为他不想当精神科医生。", no: "他借了那一科的书，借了两次。不想当的人不会借两次。" },
      { t: "二〇〇四年十一月，他不在考场。那个月他出了事。", ok: true },
      { t: "教务处改了考试日期，他没有收到通知。", no: "通告写着「按原定日期」。改期这件事没有发生过。" },
    ],
    paper: "paper-luo",
    flag: "deduce-luo",
    // 第二问：第一页只到「他出了事」，这一页到「出事的是谁」。
    // 要鱼牌、校报、履历三样——三样都在第 14 关，且都藏在可做可不做的分支里。
    // 所以这一问不挂关卡（软），凑不齐就不出现，不提示「你还有东西没找」。
    next: {
      key: "yu",
      min: 3,
      need: ["fish-tag", "news-yu04", "news-kimon"],
      leader: "还有一样，我一直没写。",
      q: "校报、履历、鱼牌，三样摆在一起……",
      options: [
        { t: "他不想当精神科医生，所以空了一年。", no: "不想当不用把年份抹掉。他是整年剪走了——连驻院那一年都换了年份。" },
        { t: "他把二〇〇四年整年从履历上剪掉了。可是鱼牌还在抽屉里。", ok: true },
        { t: "履历是学校写错的。", no: "名字、年份、专科资格都对得上。只有那一年是空的。" },
      ],
      paper: "paper-yu",
      flag: "deduce-yu",
    },
  },
];

/* 这个人名下现在有什么。证物在前（她拿到的顺序），抄下来的笔记在后（她抄的顺序）。
   证物靠 ITEM_ABOUT 里写的中文名认人；笔记靠 note() 第三参的短名（"luo"／"zhou"）——
   两套 key 不同，所以 p 同时带 name 与 key，别拿 name 去比 n.who（10-28 踩过）。 */
function whoRows(p) {
  const out = [];
  (S.evidence || []).forEach((e) => {
    if (!itemAbout(e.id).includes(p.name)) return;
    out.push({ id: e.id, ev: true, text: itemLabel(e.id) });
  });
  (S.notes || []).forEach((n) => {
    if (!n.who || (n.who !== p.key && n.who !== p.name)) return;
    // 这句话已经有对应的证物在栏里了，就不再列第二遍（NOTE_IN_ITEM：新闻与抄录同源）。
    if (NOTE_IN_ITEM[n.id] && hasEvidence(NOTE_IN_ITEM[n.id])) return;
    out.push({ id: n.id, ev: false, text: n.text });
  });
  return out;
}

const whoGot = (st, rows) => rows.filter((r) => st.need.includes(r.id)).length;
const whoReady = (st, rows) => whoGot(st, rows) >= st.min;

/* 写下来：纸进簿子，flag 立起来。门槛只判「够不够」，不够就不给按。 */
function whoWrite(st, redraw) {
  flag(st.flag, true);
  if (!hasEvidence(st.paper)) fileEvidence(item(st.paper));
  if (typeof sfx === "function") sfx("paper");
  if (typeof tip === "function") tip("写下来了。在簿子里。", { nearBar: true });
  redraw();
}

/* 一问的整块：写过了只留去那一页的链接，不够写什么都不留（状态在头上），
   够了才出三句。两问共用这一段，第二问只是换一组 need 与候选。 */
function whoAsk(st, rows, redraw) {
  if (flag(st.flag)) {
    // 链接用那页纸自己的题目，不用「看写下来的那页」：罗启明一页里有两问，
    // 两个一模一样的链接并排在纸上，谁也分不清点哪个（10-29）。
    const see = el("button", {
      type: "button",
      class: "who-see",
      onclick: () => showClueModal(item(st.paper)),
    }, ["看〈" + item(st.paper).title + "〉 ›"]);
    // 只留链接。页头已经写着「写下来了」；第二问写完时再挂一句，同一页就有两个
    // 相距五十像素的「写下来了」，说的是两页纸，读的人分不出来（10-29）。
    return [el("p", { class: "who-done" }, [see])];
  }
  // 不够写的时候不再补一句灰字。头上那句「还差 N 处」就是全部信息；原来底下那句
  // 「对得上的还不够。再有两处，我才写得出来」既重复又把数字写死——罗启明 min 3、
  // 手上 0 时，头上说「还差 3 处」、底下说「再有两处」，同一页两个数（10-29）。
  if (!whoReady(st, rows)) return [];
  const out = [el("p", { class: "who-q" }, [st.q])];
  const tried = S.whoTry[st.key];
  if (tried != null && st.options[tried] && st.options[tried].no) {
    out.push(el("p", { class: "who-no" }, [st.options[tried].no]));
  }
  out.push(el("div", { class: "who-opts" }, st.options.map((o, i) => el("button", {
    type: "button",
    class: "who-opt",
    onclick: () => {
      if (o.ok) { whoWrite(st, redraw); return; }
      S.whoTry[st.key] = i;
      redraw();
    },
  }, [o.t]))));
  return out;
}

/* 计数说人话。「3／4」既像进度条又像「还差一处」，玩家得先猜这个分数是什么；
   而且它是按 need 算的，跟栏里列了几行不是一回事——列了六行、句子写「手上三样」，
   读的人只会觉得哪里不对（10-29）。所以只回答一句：够不够写。 */
function whoStateText(p, rows) {
  if (flag(p.flag)) return "写下来了";
  if (!rows.length) return "还没有";
  if (whoReady(p, rows)) return "够写了";
  // 「还差」按 min 算，不按 need.length 算：够写只要 min 条，而 need 更长
  // （罗启明必要四条，凑够三条就写得出来）。按 need 报会多报一处——
  // 玩家凑到三条时下面三句选项已经出来了，这句话还挂着「还差一处」（10-29）。
  return "还差 " + (p.min - whoGot(p, rows)) + " 处";
}

/* 一个人的整页：他名下的东西、够不够写、够写就出三句。
   这一页只放一个人——两个并排是上一版的读法，两个人挤在同一屏，谁也读不完（10-29）。 */
function whoCard(p, redraw) {
  const rows = whoRows(p);
  const card = el("div", { class: "who-card" });
  // 名字只在页标题出现一次。这里只留两样：这一栏是什么（这间屋／二〇〇四年十一月）、
  // 够不够写。三个字并排的时候谁也不比谁重，读完什么都没记住（10-29）。
  card.append(el("div", { class: "who-head" }, [
    el("span", { class: "who-sub" }, [p.sub]),
    el("span", { class: "who-state" + (whoReady(p, rows) || flag(p.flag) ? " ready" : "") }, [whoStateText(p, rows)]),
  ]));
  const list = el("ul", { class: "who-list" });
  if (!rows.length) list.append(el("li", { class: "who-row ghost" }, ["——　还没有。"]));
  // 行首不再标 ◆：玩家不知道那是什么，他只需要知道「够不够写」，那句话在头上。
  rows.forEach((r) => {
    list.append(el("li", { class: "who-row" }, [
      r.ev
        ? el("button", {
          type: "button",
          class: "who-item",
          onclick: () => showClueModal(item(r.id)),
        }, [r.text])
        : el("span", { class: "who-item plain" }, [r.text]),
    ]));
  });
  card.append(list);
  card.append(...whoAsk(p, rows, redraw));
  // 第二问只在第一页写完、且三样真的凑齐时才露。凑不齐就当它不存在——
  // 这一问是深度内容，不该在栏里挂一行「你还差三样」把人赶去找（10-29）。
  if (p.next && flag(p.flag) && (flag(p.next.flag) || whoReady(p.next, rows))) {
    // 写完就不再挂「还有一样，我一直没写」——那句话在写之前是真的，写完之后正好相反。
    card.append(el("div", { class: "who-stage" }, [
      ...(flag(p.next.flag) ? [] : [el("p", { class: "who-stage-lead" }, [p.next.leader])]),
      ...whoAsk(p.next, rows, redraw),
    ]));
  }
  return card;
}

/* 进去就是那个人的一页。名字写在页标题上，这里不再重复。
   从前这上面还有一句引导（「归在「这间屋」的东西，都在这一页」），
   说完紧接着卡头又写「这间屋」——同一句话说两遍，还占掉一整行（10-29）。 */
function openWho(key) {
  S.whoTry = S.whoTry || {};
  const p = PEOPLE.find((x) => x.key === key) || PEOPLE[0];
  showDiaryTool({
    kind: p.name,
    build: (host, redraw) => { host.append(whoCard(p, redraw)); },
  });
}

/* 「我认识的人」那一页的目录：一行一个人。
   这一页只回答「有谁、够不够写」，点进去才是他那一页。
   没有东西的人不出现——第 3 关刚拿到钥匙牌时，两张空卡挂在这里，点开两个「—— 还没有」（10-29）。
   不写引导语：「他们各自的东西，我分开记」已经在页签和每一行的名字里说完，
   再写一遍只是占掉第一行（10-29）。 */
function peopleBlocks() {
  const out = [];
  PEOPLE.forEach((p) => {
    const rows = whoRows(p);
    if (!rows.length && !flag(p.flag)) return;
    const ready = whoReady(p, rows) || flag(p.flag);
    out.push(el("button", {
      type: "button",
      class: "people-row" + (ready ? " ready" : ""),
      onclick: () => {
        if (typeof sfx === "function") sfx("paper");
        diaryOpen(() => openWho(p.key));
      },
    }, [
      el("span", { class: "people-name" }, [p.name]),
      el("span", { class: "people-sub" }, [p.sub]),
      el("span", { class: "people-state" }, [whoStateText(p, rows)]),
      el("span", { class: "people-go", "aria-hidden": "true" }, ["›"]),
    ]));
  });
  if (!out.length) return [];
  return out;
}

/* ---------- 补充纸：九月头一个礼拜 ---------- */

const WEEK_DAYS = [
  ["09-01", "车又转。早上摆返车头朝窗，出门买饭，十分钟，返来车头朝门。"],
  ["09-02", "水又滴。拧紧，数到三，又滴。"],
  ["09-04", "冇录音。车仍然自己动，跌落地，车头朝储物室。我冇再执。"],
];

function weekCalBody() {
  const done = WEEK_DAYS.filter(([d]) => S.cal11 && S.cal11[d]);
  return done.map(([d, t]) => d.replace("09-0", "九月") + "日　" + t).join("\n") + "\n三十号那张对照仍在。";
}

function openWeekCal(onDone) {
  S.cal11 = S.cal11 || {};
  showDiaryTool({
    kind: "九月头一个礼拜",
    build: (host, redraw) => {
      host.append(el("p", { class: "tool-note" }, ["每天写一行。车几转、我在哪、水隔多久。"]));
      const rows = el("div", { class: "tool-rows" });
      WEEK_DAYS.forEach(([d, t]) => {
        const done = S.cal11[d];
        rows.append(el("button", {
          type: "button",
          class: "tool-row" + (done ? " done" : ""),
          onclick: () => {
            if (done) return;
            S.cal11[d] = true;
            note("cal-" + d, d + "：" + t);
            redraw();
          },
        }, [
          el("span", { class: "four-k" }, [d]),
          el("small", {}, [done ? t : "（点一下，写这一天）"]),
        ]));
      });
      host.append(rows);
    },
    actions: () => {
      const all = WEEK_DAYS.every(([d]) => S.cal11[d]);
      return [{
        label: all ? "合成一张纸" : "未写完",
        primary: true,
        disabled: !all,
        fn: () => {
          closeDiaryTool();
          onDone();
        },
      }, {
        label: "先合上",
        fn: () => {
          closeDiaryTool();
          afterModalClose();
        },
      }];
    },
  });
}

/* ---------- 通用：日记簿里的一页操作 ---------- */

function showDiaryTool(spec) {
  closeModal();
  if (typeof ensureStageBackdrop === "function") ensureStageBackdrop();
  if (mapLayer) mapLayer.hidden = true;
  const nested = !spec.lock && typeof diaryNested !== "undefined" && diaryNested;
  S.diaryLeaf = { tool: true, lock: !!spec.lock, onClose: spec.onClose, fromIndex: nested };
  const redraw = () => {
    const host = el("div", { class: "diary-tool" });
    spec.build(host, redraw);
    if (notesIndex) notesIndex.hidden = true;
    if (notesLeaf) {
      notesLeaf.hidden = false;
      const head = [el("h4", { class: "diary-title" }, [spec.kind || spec.title || ""]), host];
      notesLeaf.replaceChildren(...head);
    }
    if (notesActions) {
      const acts = spec.actions ? spec.actions(redraw) : [{
        label: "合上",
        fn: () => {
          closeDiaryTool();
          afterModalClose(spec.onClose);
        },
      }];
      if (nested) acts.unshift({ label: diaryBackLabel(), fn: diaryBack });
      notesActions.replaceChildren(...acts.map((a) => el("button", {
        type: "button",
        class: "diary-btn" + (a.primary ? " primary" : ""),
        disabled: !!a.disabled,
        onclick: a.fn,
      }, [a.label])));
    }
    if (notesLayer) notesLayer.hidden = false;
  };
  redraw();
  return redraw;
}

function closeDiaryTool() {
  S.diaryLeaf = null;
  closeNotes();
}
