/* ---------- 日记簿：她自己的纸、四条、屋里的样子，和几种「拿出来」 ---------- */

const ITEMS = {
  "obj-keytag": { kind: "物件", title: "钥匙牌", time: "2014年8月1日", body: "钥匙圈上硬纸牌，周先生的字：\n大门　铁闸　天台（挂门内小钩）\n水喉坏咗拍门。唔使自己整。\n天台晾衫用。", img: pic(2, "证据-钥匙牌"), key: "水喉坏咗拍门" },
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
  "obj-referral": { kind: "信封", title: "抽屉缝", time: "2014年8月30日", body: "抽屉缝里折好的信封，封口朝里。回形针卡住一角，露出：……转介。其余压在节拍器底下。", img: pic(10, "示意-抽屉缝"), key: "……转介" },
  "note-zhoutue": { kind: "记下", title: "我没讲", time: "2014年8月31日 夜", body: "周说：下星期六有人上来？我煮糖水。我没有同他讲过。", key: "我没有同他讲过" },
  "obj-zhoucal": { kind: "物件", title: "周的月历", time: "2014年8月31日 夜", body: "前座门边，银行送的月历。周先生的字：\n8/1　后座入伙\n8/3　换胶圈\n8/10　租。问电话——冇。\n8/16　入（用笔涂掉了）\n8/23　六　出\n8/30　六　出\n翻到九月，只写了一格：\n9/6　六　医生", img: pic(11, "证据-周的月历"), key: "9/6　六　医生" },
  "paper-06": { kind: "纸", title: "第四次补充", time: "2014年9月5日", body: "", key: "九月" },
  "photo-back": { kind: "照片", title: "全家福背面", time: "2014年9月6日 夜", body: "相框翻过来，背面铅笔字：\n丽芬　阿轩　十二乡村屋门口　二〇一二年春", img: pic(13, "证据-全家福背面"), key: "十二乡村屋门口　二〇一二年春" },
  "paper-ming": { kind: "纸", title: "他留下的一页", time: "2014年9月6日 夜", body: "压在玩具车下面，从他本子撕下的一页：\n9/6　21:52　荣汇街后座\n水喉：拧紧后约 3 秒再滴。人手可做到。\n车：头朝储物室门。\n走廊尽头——（这一行用力划掉了）\n不写「鬼」。", img: pic(13, "证据-笔记一页"), key: "不写「鬼」" },
  "mail-dirt": { kind: "邮件", title: "你信紧的医生", time: "2014年9月7日", body: "二〇〇四年十一月，维港大学，女学生坠楼。新闻写男友罗某，自称有责任。名字涂掉，露出一个鱼。偷拍：年轻的罗，旁边长发女生望住他。没有全名。", img: pic(14, "证据-你信紧的医生"), key: "名字涂掉，露出一个鱼" },
  "fish-tag": { kind: "物件", title: "鱼牌", time: "2014年9月7日", body: "空抽屉底滑出一小块磨白塑料。鱼形。没有字。节拍器已经不在。", img: pic(14, "证据-鱼牌"), key: "没有字" },
  "chen-wallet": { kind: "物件", title: "钱夹", time: "2014年9月7日", body: "走廊椅脚边黑色钱夹。透明套里表姐和陈家豪合照。夹层里的学生证发黄：年轻的罗医生。", img: pic(14, "证据-钱夹罗证件照"), key: "夹层里的学生证" },
  "rec-name": { kind: "录音", title: "章慧琪。你知", time: "2014年9月7日 夜", body: "先是阿轩，返嚟食饭。再低一句：章慧琪。你知。声从门底来。", key: "章慧琪。你知" },
};

function item(id) {
  const base = ITEMS[id] || { kind: "证物", title: id, body: "" };
  const out = Object.assign({ id }, base);
  if (id === "paper-30") out.body = compareBody();
  if (id === "paper-06") out.body = weekCalBody();
  return out;
}

const evSeen = (id) => hasEvidence(id) || !!(S.evOpened && S.evOpened[id]);

// 第一次看完接 next；看过再点只弹夹页
function peekItem(id, next) {
  if (evSeen(id)) showClueModal(item(id));
  else keepThen(item(id), next);
}

function itemLabel(id) {
  const it = hasEvidence(id) ? (S.evidence.find((e) => e.id === id) || item(id)) : item(id);
  return it.kind + "　" + it.title;
}

/* ---------- 日记簿目录用：每样东西关于屋里哪样、哪句笔记和证物重复 ---------- */

const THINGS = ["车", "水喉", "储物室门", "窗台", "周生", "罗启明", "表姐一家"];

const ITEM_ABOUT = {
  "obj-keytag": ["周生"],
  "rec-water": ["水喉"],
  "letter-red": ["周生"],
  "photo-sill": ["窗台"],
  "photo-print": ["储物室门"],
  "rec-axuan": ["储物室门"],
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
};

const itemAbout = (id) => ITEM_ABOUT[id] || [];

// 笔记和已记下的证物讲同一件事时，目录只列证物
const NOTE_IN_ITEM = { print: "photo-print", voice: "rec-axuan", sill: "photo-sill", dirt: "mail-dirt", namecall: "rec-name", takeback: "letter-red" };

// 第 3 关日历上点开的那几天，钟仍停在八月一日
const NOTE_DAY = { "tap-fixed": "8月3日", "gate-tick": "8月11日", "car-still": "8月12日" };

const noteTime = (n) => NOTE_DAY[n.id] || n.time;

function noteShown(n) {
  if (/^cal-/.test(n.id)) return !hasEvidence("paper-06");
  const it = NOTE_IN_ITEM[n.id];
  return !(it && hasEvidence(it));
}

// 同一样东西的其他证物（证物页底下列出来）：同的越多越前，再按日子近，最多三样
function itemKin(id) {
  const about = itemAbout(id);
  if (!about.length) return [];
  const day = (t) => {
    const m = /(\d+)月(\d+)日/.exec(t || "");
    return m ? Number(m[1]) * 31 + Number(m[2]) : 0;
  };
  const self = (S.evidence || []).find((e) => e.id === id) || ITEMS[id] || {};
  const at = day(self.time);
  return (S.evidence || [])
    .filter((e) => e.id !== id)
    .map((e) => ({ e, shared: itemAbout(e.id).filter((a) => about.includes(a)).length, gap: Math.abs(day(e.time) - at) }))
    .filter((r) => r.shared)
    .sort((a, b) => b.shared - a.shared || a.gap - b.gap)
    .slice(0, 3)
    .map((r) => r.e);
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

function openFour() {
  showDiaryTool({
    kind: "租房必需四条",
    build: (host) => {
      host.append(el("ul", { class: "four-list" }, fourRows()));
      if (S.known && S.known.rong) {
        host.append(el("p", { class: "tool-note" }, ["荣汇街 28 号：四条都过。"]));
      }
    },
  });
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
      const lead = ["", "先去屋里找，今晚哪里不一样。", "点一张今晚看见的。", "再点它对应的那一格。"][step];
      if (lead) guide.append(el("p", { class: "tool-lead" }, [lead]));
      guide.append(el("span", { class: "tool-progress" + (full ? " done" : "") }, [
        full ? "✓ 齐了" : "已摆好 " + pairCount() + "／3",
      ]));
      host.append(guide);
      const cards = el("div", { class: "tool-cards" });
      if (full) cards.append(el("p", { class: "tool-note" }, ["摆齐了。"]));
      else if (empty) {
        cards.append(el("div", { class: "tool-empty" }, [
          el("p", { class: "tool-empty-lead" }, [found ? "找到的都摆上了，还差 " + need + " 处。" : "今晚看见的，这里还一张都没有。"]),
          el("p", {}, ["先合上日记簿，去屋里看看哪里跟搬进来那晚不一样。看到了，会自己放到这里。"]),
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
      host.append(cards);
      if (!full && loose.length && loose.length < need) {
        host.append(el("p", { class: "tool-more" }, [
          "这些摆好也还差 " + (need - loose.length) + " 处，要再去屋里找。",
          el("button", { type: "button", class: "tool-more-go", onclick: leave }, ["去屋里"]),
        ]));
      }
      const list = el("div", { class: "tool-rows" + (empty ? " idle" : "") });
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
      host.append(list);
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
    "paper-16": "十六号晚。你未离开客厅，车已经转。我睇。",
    "paper-20": "两分钟。望住唔动，离开先动。我睇。",
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
    title: "把你搜集的东西给他看",
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
        }, [e.kind + "　" + e.title]));
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

const COMPARE_ROWS = [
  { id: "car", left: ["base:car"], right: ["tonight:car", "paper-16"], lt: "车头朝窗，放角落第二日仍在", rt: "车自己转，掉在地上朝储物室" },
  { id: "tap", left: ["base:tap"], right: ["tonight:tap", "note-meiwater"], lt: "关了水喉滴一滴", rt: "拧紧三秒再滴" },
  { id: "rec", left: ["rec-water", "base:storage"], right: ["rec-axuan", "tonight:storage"], lt: "十三号录音只有水，门后很静", rt: "门底有声，录音有女人叫阿轩" },
  { id: "sill", left: ["base:sill"], right: ["photo-sill", "tonight:sill"], lt: "窗台水印是干的", rt: "湿童码，比我细两号" },
  { id: "shoe", fixedLeft: "周没有问过我的鞋", right: ["note-dry"], rt: "周问我脚湿不湿，鞋是干的" },
  { id: "time", fixedLeft: "—", right: ["paper-20", "paper-norec", "photo-print", "tonight:print"], rt: "离开两分钟先动；没录音那晚车仍然走" },
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
  if (t.startsWith("base:")) {
    const b = BASE.find((x) => x.id === t.slice(5));
    return "搬进来·" + b.name + "：" + baseText(b.id);
  }
  if (t.startsWith("tonight:")) {
    const id = t.slice(8);
    const b = BASE.concat([PRINT_ROW]).find((x) => x.id === id);
    return (S.level === 4 ? "今晚·" : "十四号夜·") + b.name + "：" + tonightText(id);
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
  const lines = rows.map((r) => (r.fixedLeft || r.lt) + "　｜　" + r.rt);
  return "头两个礼拜　｜　十五号之后\n" + (lines.length ? lines.join("\n") : "（还没写）");
}

function compareAlmost() {
  return compareDone().length >= 4;
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
      guide.append(el("p", { class: "tool-lead" }, [pick ? "放到亮起来的空格。" : "点卡片，放进下面的格。"]));
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
      const grid = el("div", { class: "compare-grid" + (pick ? " picking" : "") });
      grid.append(el("b", {}, ["头两个礼拜"]), el("b", {}, ["十五号之后"]));
      COMPARE_ROWS.forEach((r) => {
        const slot = (side) => {
          const key = r.id + ":" + side;
          const filled = S.compare[key];
          const fixed = side === "L" && r.fixedLeft;
          const ok = (side === "L" ? r.left : r.right) || [];
          const open = !!(pick && !filled && !fixed && ok.includes(pick));
          if (fixed) return el("div", { class: "compare-slot fixed" }, [r.fixedLeft]);
          return el("button", {
            type: "button",
            class: "compare-slot" + (filled ? " filled" : "") + (open ? " open" : ""),
            onclick: () => {
              if (filled) {
                delete S.compare[key];
                redraw();
                return;
              }
              if (!pick) {
                toolSay(host, "先点上面一张卡片。");
                return;
              }
              if (!ok.includes(pick)) {
                const other = side === "L" ? r.right : r.left;
                toolSay(host, other && other.includes(pick) ? "这样是另一边的。" : "这样不是这一行的。");
                return;
              }
              S.compare[key] = pick;
              pick = "";
              redraw();
            },
          }, [filled ? (side === "L" ? r.lt : r.rt) : "放在这里"]);
        };
        grid.append(slot("L"), slot("R"));
      });
      host.append(grid);
    },
    actions: () => [{
      label: compareReady() ? "写好了" : (compareAlmost() ? "还差一点" : "未写好"),
      primary: true,
      disabled: !compareAlmost(),
      fn: () => {
        if (!compareReady()) {
          if (hostEl) toolSay(hostEl, "四行有了，还缺最能对照的那一句。再翻翻你记下的。");
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
