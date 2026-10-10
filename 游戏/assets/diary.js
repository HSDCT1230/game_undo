/* ---------- 日记簿：她自己的纸、四条、屋里的样子，和几种「拿出来」 ---------- */

const ITEMS = {
  "rec-water": { kind: "录音", title: "只有水", time: "2014年8月13日 夜", body: "录音里只有水。没有人声。", key: "只有水" },
  "letter-red": { kind: "信封", title: "红圈", time: "2014年8月14日 傍晚", body: "新闻纸一角。红笔圈的弧。他的拇指挡住圈里的字。", img: pic(4, "证据-红圈信封"), key: "红笔圈" },
  "photo-sill": { kind: "照片", title: "窗台童码", time: "2014年8月15日 凌晨", body: "把自己的鞋并上去比过：小两号。今晚没下雨。水是新的。搬进来时那圈是干的。", img: pic(4, "证据-窗台童码"), key: "小两号" },
  "photo-print": { kind: "照片", title: "门底湿脚印", time: "2014年8月15日 凌晨", body: "门底湿脚印，到一半停住。", img: pic(4, "证据-门底湿脚印"), key: "门底湿脚印" },
  "rec-axuan": { kind: "录音", title: "阿轩，返嚟食饭", time: "2014年8月15日 凌晨", body: "女人声从储物室门底那边来：「阿轩，返嚟食饭。」声线稳，像留过言。门缝下没有光。", key: "阿轩，返嚟食饭" },
  "note-dry": { kind: "记下", title: "鞋是干的", time: "2014年8月15日", body: "周问我脚湿不湿。我低头看：鞋是干的。", key: "鞋是干的" },
  "photo-car-out": { kind: "照片", title: "出门前的车", time: "2014年8月16日 14:30", body: "敞篷。车头朝窗。茶几贴着储物室门一侧。出门前拍的。", img: pic(5, "证据-出门前的车"), key: "车头朝窗" },
  "photo-tap-out": { kind: "照片", title: "出门前的水喉", time: "2014年8月16日 14:30", body: "拧紧。等了十秒，没有滴——八月三日修好之后一直这样。出门前拍的。", img: pic(5, "证据-出门前的水喉"), key: "没有滴" },
  "paper-16": { kind: "纸", title: "十六号晚", time: "2014年8月16日", body: "二十一点四十。我返到。车已经转。水已经滴。我未离开客厅。出门前两张相：车头朝窗，水喉没有滴。", key: "车已经转" },
  "paper-20": { kind: "纸", title: "离开两分钟", time: "2014年8月20日", body: "二十三点十七。坐在厅里望住两分钟，什么都不动。入厕所两分钟，出来门底先有湿脚印。我在厅里望住，佢唔动。", key: "入厕所两分钟" },
  "paper-norec": { kind: "纸", title: "没有录音的一夜", time: "2014年8月23日", body: "手机留在茶几。录音键是我自己按掉的。我去洗脸。门缝看得见厅。回来车在地上，头朝储物室。录音键仍然关着。这夜没有声音可以交。", key: "录音键是我自己按掉的" },
  "note-notsaid": { kind: "记下", title: "医生没这样讲", time: "2014年8月24日", body: "姐夫说：佢话你精神唔太好。阿明没有这样讲过。", key: "阿明没有这样讲过" },
  "note-meiwater": { kind: "电话", title: "表姐听到水声", time: "2014年8月27日 夜", body: "我拧紧了水喉。表姐在电话那头仍然听到滴水。她听到的是水，不是阿轩。", key: "仍然听到滴水" },
  "paper-30": { kind: "纸", title: "带去第三次的对照", time: "2014年8月27日", body: "", key: "头两个礼拜" },
  "note-zhoutue": { kind: "记下", title: "我没讲", time: "2014年8月31日 夜", body: "周说：下星期六又有人上嚟？我煮糖水。我没有同他讲过。", key: "我没有同他讲过" },
  "paper-06": { kind: "纸", title: "带去第四次的补充", time: "2014年9月5日", body: "", key: "九月" },
  "mail-dirt": { kind: "邮件", title: "你信紧的医生", time: "2014年9月7日", body: "二〇〇四年十一月，维港大学，一个女学生坠楼。新闻写男友罗某，自称有责任。名字涂掉，露出一个鱼。偷拍：有盖走廊，年轻的罗和一个长发女生，她望住他。信说你是下一个。没有全名，没有过程。", img: pic(14, "证据-你信紧的医生"), key: "名字涂掉，露出一个鱼" },
  "rec-name": { kind: "录音", title: "章慧琪。你知", time: "2014年9月7日 夜", body: "先是阿轩，返嚟食饭。再低一句：章慧琪。你知。声从门底来。", key: "章慧琪。你知" },
};

function item(id) {
  const base = ITEMS[id] || { kind: "证物", title: id, body: "" };
  const out = Object.assign({ id }, base);
  if (id === "paper-30") out.body = compareBody();
  if (id === "paper-06") out.body = weekCalBody();
  return out;
}

function itemLabel(id) {
  const it = hasEvidence(id) ? (S.evidence.find((e) => e.id === id) || item(id)) : item(id);
  return it.kind + "　" + it.title;
}

/* ---------- 四条 ---------- */

const FOUR = [
  { id: "pay", text: "冇粮单", hit: /粮单|在职证明|公司|面试|商业登记|上班族|从业员/ },
  { id: "guar", text: "冇担保", hit: /担保/ },
  { id: "now", text: "要即刻住", hit: /即日|一年|十个月|不在线|下线|订金/ },
  { id: "week", text: "每星期三千几", hit: /周租|口头|家庭户/ },
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
    kind: "四条",
    title: "我自己写的",
    build: (host) => {
      host.append(el("ul", { class: "four-list" }, fourRows()));
      host.append(el("p", { class: "tool-note" }, [
        S.known && S.known.rong ? "荣汇街 28 号：四条都过。" : "每个盘问一次，卡住边条，就划边条。",
      ]));
    },
  });
}

/* ---------- 屋里的样子／今晚（搬进来那晚记下的，夜里拿来比） ---------- */

const BASE = [
  { id: "car", name: "玩具车", mark: "玩具车", base: "车头朝窗。敞篷座位里没有灰。", tonight: "车头朝门，后来掉在地上朝储物室。" },
  { id: "tap", name: "厨房水龙头", mark: "关了还会滴一滴", base: "关了还会滴一滴。", tonight: "拧紧，三秒后又滴。" },
  { id: "storage", name: "储物室门", mark: "贴门听，很静", base: "贴门听，很静。", tonight: "门底有翻纸声。门缝下没有光。" },
  { id: "sill", name: "主房窗台", mark: "一圈水印，是干的", base: "一圈水印，是干的。", tonight: "湿的童码。鞋并上去比过，小两号。" },
  { id: "family", name: "全家福", mark: "挂得很正", base: "客厅墙上，挂得很正，相后两个纸箱。女人头发齐肩。", tonight: "" },
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
  showClueModal({
    id: "base-" + id,
    title: row.name,
    time: "2014年8月1日 夜",
    body,
    key: row.mark,
  }, {
    canFile: !S.base[id],
    isFiled: () => !!S.base[id],
    keep: () => {
      S.base[id] = true;
      renderNotes();
    },
    onClose,
  });
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
    kind: "屋里的样子",
    title: S.level <= 3 ? "这间屋的样子" : "搬进来那晚记下的",
    build: (host) => {
      const rows = BASE.map((b) => el("li", { class: S.base && S.base[b.id] ? "" : "empty" }, [
        el("span", { class: "four-k" }, [b.name]),
        el("small", {}, [S.base && S.base[b.id] ? baseText(b.id) : "（没有记下）"]),
        S.tonight && S.tonight[b.id] ? el("small", { class: "tonight" }, [nightSide + "：" + tonightText(b.id)]) : "",
      ]));
      host.append(el("ul", { class: "four-list" }, rows));
    },
  });
}

function openPairs(onClose) {
  let pick = "";
  const rows = BASE.concat([PRINT_ROW]);
  showDiaryTool({
    kind: "摆在一起",
    title: "好像有什么悄悄变了？",
    onClose,
    build: (host, redraw) => {
      S.pairs = S.pairs || {};
      const guide = el("div", { class: "tool-guide" });
      guide.append(el("p", { class: "tool-lead" }, ["把今晚和搬进来那晚不同的线索对应起来"]));
      const steps = el("ol", { class: "tool-steps" });
      steps.append(el("li", {}, ["先点一张今晚看见的"]));
      steps.append(el("li", {}, ["再点它对应的那一格"]));
      guide.append(steps);
      guide.append(el("span", { class: "tool-progress" + (pairCount() >= 3 ? " done" : "") }, [
        pairCount() >= 3 ? "✓ 齐了" : "已摆好 " + pairCount() + "／3",
      ]));
      host.append(guide);
      const loose = rows.filter((r) => S.tonight && S.tonight[r.id] && !S.pairs[r.id]);
      const cards = el("div", { class: "tool-cards" });
      if (!loose.length) cards.append(el("p", { class: "tool-note" }, [pairCount() >= 3 ? "摆齐了。" : "今晚看见的，都摆上了。再去看看屋里还有什么不一样。"]));
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
      const list = el("div", { class: "tool-rows" });
      rows.forEach((r) => {
        if (r.id === "family") return;
        const known = r.id === "print" || (S.base && S.base[r.id]);
        const paired = S.pairs[r.id];
        list.append(el("button", {
          type: "button",
          class: "tool-row" + (paired ? " done" : ""),
          onclick: () => {
            if (paired) return;
            if (!pick) {
              toolSay(host, "先点一张今晚的。");
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
  },
  12: {
    "paper-06": "九月一号、二号、四号。俾我三分钟。",
  },
};

// from：这一轮该交的；exactly：要交几样（初诊只交一样）
const HAND_RULE = {
  6: { from: ["note-dry", "photo-sill", "photo-print"], exactly: 1 },
  8: { from: ["paper-16", "paper-20"], exactly: 2 },
  10: { from: ["paper-30"], exactly: 1 },
  12: { from: ["paper-06"], exactly: 1 },
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
              toolSay(host, "呢样今日未使交。");
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
    title: "纸上写的，和心里信的，分开",
    lock: true,
    build: (host, redraw) => {
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

/* ---------- 对照纸 ---------- */

const COMPARE_ROWS = [
  { id: "car", left: ["base:car"], right: ["tonight:car", "paper-16"], lt: "车头朝窗，放角落第二日仍在角落", rt: "车自己转，掉在地上朝储物室" },
  { id: "tap", left: ["base:tap"], right: ["tonight:tap", "note-meiwater"], lt: "关了水喉滴一滴", rt: "拧紧三秒再滴" },
  { id: "rec", left: ["rec-water", "base:storage"], right: ["rec-axuan", "tonight:storage"], lt: "十三号录音只有水，门后很静", rt: "门底有声，录音有女人叫阿轩" },
  { id: "sill", left: ["base:sill"], right: ["photo-sill", "tonight:sill"], lt: "窗台水印是干的", rt: "湿童码，比我细两号" },
  { id: "shoe", fixedLeft: "周没有问过我的鞋", right: ["note-dry"], rt: "周问我脚湿不湿，我的鞋是干的" },
  { id: "time", fixedLeft: "—", right: ["paper-20", "paper-norec", "photo-print", "tonight:print"], rt: "离开两分钟先动；没有录音那晚车仍然走" },
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
  const must = ["note-dry", "rec-water", "paper-16", "paper-20", "photo-sill", "photo-print"];
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
    seedItems(["note-dry", "rec-water", "rec-axuan", "paper-16", "paper-20", "paper-norec", "photo-sill", "photo-print"]
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
    title: "哪边先不一样？",
    build: (host, redraw) => {
      hostEl = host;
      const n = compareDone().length;
      const guide = el("div", { class: "tool-guide" });
      guide.append(el("p", { class: "tool-lead" }, ["把头两个礼拜和十五号之后的线索对照起来"]));
      const steps = el("ol", { class: "tool-steps" });
      steps.append(el("li", {}, ["拖起一张卡片（或点选）"]));
      steps.append(el("li", {}, ["放到亮起来的空格"]));
      steps.append(el("li", {}, ["至少写满四行"]));
      guide.append(steps);
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
  ["09-01", "车又转。我出门买饭，十分钟，返来车头朝门。"],
  ["09-02", "水又滴。拧紧，数到三，又滴。"],
  ["09-04", "冇录音。车仍然自己动。"],
];

function weekCalBody() {
  const done = WEEK_DAYS.filter(([d]) => S.cal11 && S.cal11[d]);
  return done.map(([d, t]) => d.replace("09-0", "九月") + "日　" + t).join("\n") + "\n三十号那张对照仍在。";
}

function openWeekCal(onDone) {
  S.cal11 = S.cal11 || {};
  showDiaryTool({
    kind: "日历",
    title: "九月头一个礼拜",
    build: (host, redraw) => {
      host.append(el("p", { class: "tool-note" }, ["每天写一行。照作业：车几转、我在哪、水隔多久。"]));
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
  S.diaryLeaf = { tool: true, lock: !!spec.lock, onClose: spec.onClose };
  const redraw = () => {
    const host = el("div", { class: "diary-tool" });
    spec.build(host, redraw);
    if (notesIndex) notesIndex.hidden = true;
    if (notesLeaf) {
      notesLeaf.hidden = false;
      const head = [el("div", { class: "diary-meta" }, [el("span", { class: "diary-kind" }, [spec.kind || spec.title || ""])])];
      if (spec.title && spec.title !== spec.kind) head.push(el("h4", { class: "diary-title" }, [spec.title]));
      head.push(host);
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
