/* ---------- 日记簿：她自己的纸、四条、本来的样子，和几种「拿出来」 ---------- */

const ITEMS = {
  "rec-water": { kind: "录音", title: "只有水", key: "没有人声", time: "2014年8月13日 夜", body: "水管响了一阵。没有人声。" },
  "letter-red": { kind: "信封", title: "红圈", time: "2014年8月14日 傍晚", body: "角上有一个红圈。圈里的字看不清。", img: pic(4, "证据-红圈信封") },
  "photo-sill": { kind: "照片", title: "窗台童码", key: "比我的脚小两号", time: "2014年8月15日 凌晨", body: "比我的脚小两号。今晚没下雨。水是新的。", img: pic(4, "证据-窗台童码") },
  "photo-print": { kind: "照片", title: "门底湿脚印", key: "到一半停住", time: "2014年8月15日 凌晨", body: "到一半停住。", img: pic(4, "证据-门底湿脚印") },
  "rec-axuan": { kind: "录音", title: "阿轩，返嚟食饭", key: "从储物室门底那边来", time: "2014年8月15日 凌晨", body: "女人声。从储物室门底那边来。声线稳，像留过言。" },
  "note-dry": { kind: "记下", title: "周问我脚湿不湿", key: "周开口就问：你脚湿了？", time: "2014年8月15日", body: "天亮前，周开口就问：你脚湿了？门底有湿脚印，我没同他讲过。" },
  "photo-car-out": { kind: "照片", title: "出门前的车", key: "车头朝窗", time: "2014年8月16日 14:30", body: "车头朝窗。出门前拍的。", img: pic(5, "证据-出门前的车") },
  "photo-tap-out": { kind: "照片", title: "出门前的水喉", key: "等了十秒，没有滴", time: "2014年8月16日 14:30", body: "拧紧。等了十秒，没有滴。出门前拍的。", img: pic(5, "证据-出门前的水喉") },
  "paper-16": { kind: "纸", title: "十六号晚", key: "车已经转。水已经滴。", time: "2014年8月16日", body: "二十一点四十。我返到。车已经转。水已经滴。我未离开客厅。出门前两张相：车头朝窗，水喉没有滴。" },
  "paper-20": { kind: "纸", title: "离开两分钟", key: "入厕所两分钟，出来门底先有湿脚印", time: "2014年8月20日", body: "二十三点十七。坐在厅里望住两分钟，什么都不动。入厕所两分钟，出来门底先有湿脚印。我在厅里望住，佢唔郁。" },
  "paper-norec": { kind: "纸", title: "没有录音的一夜", key: "回来车在地上，头朝储物室", time: "2014年8月23日", body: "录音键是我自己按掉的。我去洗脸。回来车在地上，头朝储物室。这夜没有声音可以交。" },
  "note-notsaid": { kind: "记下", title: "医生没这样讲", key: "阿明没有这样讲过", time: "2014年8月24日", body: "姐夫说：佢话你精神唔太好。阿明没有这样讲过。" },
  "note-meiwater": { kind: "电话", title: "表姐听到水声", key: "表姐在电话那头仍然听到滴水", time: "2014年8月27日 夜", body: "我拧紧了水喉。表姐在电话那头仍然听到滴水。她听到的是水，不是阿轩。" },
  "paper-30": { kind: "纸", title: "带去第三次的对照", time: "2014年8月27日", body: "" },
  "note-zhoutue": { kind: "记下", title: "周知道星期六有人来", key: "星期六的事，我没有同他讲过", time: "2014年8月31日 夜", body: "周说：下星期六又有人上嚟？我煮糖水。星期六的事，我没有同他讲过。" },
  "paper-06": { kind: "纸", title: "带去第四次的补充", time: "2014年9月5日", body: "" },
  "mail-dirt": { kind: "邮件", title: "你信紧的医生", key: "名字涂掉，露出一个鱼", time: "2014年9月7日", body: "二〇〇四年十一月，维港大学，一个女学生坠楼。新闻写男友罗某，自称有责任。名字涂掉，露出一个鱼。偷拍：有盖走廊，年轻的罗和一个长发女生，她望住他。信说你是下一个。", img: pic(14, "证据-你信紧的医生") },
  "rec-name": { kind: "录音", title: "章慧琪。你知", time: "2014年9月7日 夜", body: "先是阿轩，返嚟食饭。再低一句：章慧琪。你知。声从门底来。" },
};

function item(id) {
  const base = ITEMS[id] || { kind: "其他", title: id, body: "" };
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

/* ---------- 本来的样子／今晚 ---------- */

const BASE = [
  { id: "car", name: "玩具车", base: "车头朝窗。车里没有灰。", tonight: "车头朝门，后来掉在地上朝储物室。" },
  { id: "tap", name: "厨房水龙头", base: "关了还会滴一滴。", tonight: "拧紧，三秒后又滴。" },
  { id: "storage", name: "储物室门", base: "贴门听，很静。", tonight: "门底有翻纸声。" },
  { id: "sill", name: "主房窗台", base: "一圈水印，是干的。", tonight: "湿的童码，比我的脚小两号。" },
  { id: "family", name: "全家福", base: "挂得很正，相后两个纸箱。", tonight: "" },
];
const PRINT_ROW = { id: "print", name: "门底", base: "", tonight: "湿脚印，走到一半停住。" };

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
  showDiarySheet({
    id: "base-" + id,
    kind: "屋里的样子",
    title: row.name,
    time: "2014年8月1日 夜",
    body,
  }, {
    key: row.base,
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
  showDiaryTool({
    kind: S.level === 3 ? "屋里的样子" : "本来的样子",
    title: S.level === 3 ? "搬进来时，这间屋的样子" : "这间屋本来的样子",
    build: (host) => {
      const rows = BASE.map((b) => el("li", { class: S.base && S.base[b.id] ? "" : "empty" }, [
        el("span", { class: "four-k" }, [b.name]),
        el("small", {}, [S.base && S.base[b.id] ? b.base : "（没有记下）"]),
        S.tonight && S.tonight[b.id] ? el("small", { class: "tonight" }, [(S.level === 4 ? "今晚：" : "十四号夜：") + tonightText(b.id)]) : "",
      ]));
      host.append(el("ul", { class: "four-list" }, rows));
    },
  });
}

function openPairs(onClose) {
  let pick = "";
  let say = null;
  const rows = BASE.concat([PRINT_ROW]);
  showDiaryTool({
    title: "好像有什么悄悄变了？",
    onClose,
    build: (host, redraw) => {
      S.pairs = S.pairs || {};
      const n = pairCount();
      host.append(toolGuide(
        "把今晚和搬进来那晚不同的线索对应起来",
        ["拖起一张黄卡片（或点选）", "放到下面对应那一行的虚线格"],
        n, 3, "摆好"
      ));
      if (say) host.append(el("p", { class: "tool-say" + (say.ok ? " ok" : "") }, [say.text]));
      const put = (rowId, cardId) => {
        const r = rows.find((x) => x.id === rowId);
        const known = r.id === "print" || (S.base && S.base[r.id]);
        if (S.pairs[r.id]) return;
        if (!cardId) say = { text: "先拖起（或点选）上面一张黄色的「今晚」卡片。" };
        else if (!known) say = { text: "「" + r.name + "」搬进来那晚我没有记下本来的样子，放不了这里。" };
        else if (cardId !== r.id) say = { text: "对不上。这张卡说的不是「" + r.name + "」，再看看卡上写的是哪样东西。" };
        else {
          S.pairs[r.id] = true;
          note("pair-" + r.id, r.name + "：本来" + (r.base ? "「" + r.base + "」" : "没有") + "，今晚「" + tonightText(r.id) + "」");
          sfx("tick");
          say = { ok: true, text: "摆好了：" + r.name + "。" + (pairCount() >= 3 ? "三组都齐了，可以合上。" : "") };
        }
        pick = "";
        redraw();
      };

      host.append(el("p", { class: "tool-label" }, ["今晚看到的"]));
      const loose = rows.filter((r) => S.tonight && S.tonight[r.id] && !S.pairs[r.id]);
      const cards = el("div", { class: "tool-cards" });
      if (!loose.length) {
        cards.append(el("p", { class: "tool-note" }, [n >= 3
          ? "三组都摆好了。合上日记簿，往下。"
          : "今晚看到的都摆上了，还差 " + (3 - n) + " 组。先合上，去屋里再找找跟搬进来那晚不一样的东西。"]));
      }
      loose.forEach((r) => {
        const card = el("button", {
          type: "button",
          class: "tool-card tonight-card" + (pick === r.id ? " sel" : ""),
          onclick: () => {
            pick = pick === r.id ? "" : r.id;
            say = null;
            redraw();
          },
        }, [el("span", { class: "tool-tag" }, ["今晚"]), tonightText(r.id)]);
        dragCard(card, r.id, host);
        cards.append(card);
      });
      host.append(cards);

      host.append(el("p", { class: "tool-label" }, ["搬进来那晚记下的"]));
      const list = el("div", { class: "tool-rows" + (pick ? " picking" : "") });
      rows.forEach((r) => {
        if (r.id === "family") return;
        const known = r.id === "print" || (S.base && S.base[r.id]);
        const paired = S.pairs[r.id];
        const slot = el("span", {
          class: "pair-slot" + (paired ? " filled" : known ? " open" : " blank"),
        }, [paired ? "✓ 今晚：" + tonightText(r.id) : known ? "放在这里" : "当时没有记下"]);
        const row = el("button", {
          type: "button",
          class: "tool-row pair-row" + (paired ? " done" : ""),
          onclick: () => { if (!paired) put(r.id, pick); },
        }, [
          el("span", { class: "pair-name" }, [r.name]),
          el("span", { class: "pair-base" }, [r.id === "print" ? "本来：没有" : known ? "本来：" + r.base : "本来：？"]),
          slot,
        ]);
        if (!paired) dropSlot(row, (id) => put(r.id, id));
        list.append(row);
      });
      host.append(list);
    },
  });
}

// 操作页顶上的说明框：一句做什么、几步怎么做、右上角进度
function toolGuide(lead, steps, done, total, word) {
  const full = total && done >= total;
  return el("div", { class: "tool-guide" }, [
    total ? el("span", { class: "tool-progress" + (full ? " done" : "") }, [full ? "✓ 齐了" : "已" + (word || "做") + " " + done + "／" + total]) : "",
    el("p", { class: "tool-lead" }, [lead]),
    steps && steps.length ? el("ol", { class: "tool-steps" }, steps.map((s) => el("li", {}, [s]))) : "",
  ]);
}

// 卡片可以拖到格子上，也可以先点卡、再点格子。拖起时不重画，免得把正在拖的那张卡换掉
function dragCard(node, id, host) {
  node.draggable = true;
  node.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    node.classList.add("dragging");
    host.classList.add("dragging-on");
  });
  node.addEventListener("dragend", () => {
    node.classList.remove("dragging");
    host.classList.remove("dragging-on");
  });
}

function dropSlot(node, onDrop) {
  node.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    node.classList.add("over");
  });
  node.addEventListener("dragleave", () => node.classList.remove("over"));
  node.addEventListener("drop", (e) => {
    e.preventDefault();
    node.classList.remove("over");
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDrop(id);
  });
}

function toolSay(host, text) {
  const old = host.querySelector(".tool-say");
  if (old) old.remove();
  const at = host.querySelector(".tool-guide");
  const p = el("p", { class: "tool-say" }, [text]);
  if (at) at.after(p);
  else host.prepend(p);
}

/* ---------- 作业卡 ---------- */

const HOMEWORK = {
  6: "写时间。几时、喺边间房、离开几耐、边样郁咗。唔好写「好恐怖」。下星期六带录音同纸。",
  8: "有一夜唔开录音，仍然写纸。写低头两个礼拜边样唔郁、十五号先开始边样。周问你脚湿嗰句都写埋。下星期六带来。",
  10: "纸仍然要带。多写呢个星期：车几转、你几时喺边间房、水喉几耐滴一次。",
};

function giveHomework(n, next) {
  S.homework = { n, body: HOMEWORK[n] };
  renderNotes();
  showDiarySheet({
    kind: "作业卡",
    title: "他写下的",
    time: S.time,
    body: HOMEWORK[n],
  }, { canFile: false, onClose: next });
}

/* ---------- 拿给他看 ---------- */

const HAND_REPLY = {
  6: {
    "note-dry": "佢开口就问你脚湿唔湿？呢句我写低。",
    "photo-sill": "比你只脚细两号。我记低尺寸。今日唔判系边个。",
    "photo-print": "行到一半停。我写「停」，唔写「鬼」。",
    "rec-axuan": "下星期六先听。今日我想先听你讲。",
    "rec-water": "十三号只有水。有响你就录，冇嘢都留低。好。",
  },
  8: {
    "paper-16": "十六号晚。你未离开客厅，车已经转。我睇。",
    "paper-20": "两分钟。望住唔郁，离开先郁。我睇。",
    "rec-axuan": "录音我今日听。",
    "rec-water": "十三号只有水。放埋一齐听。",
  },
  10: {
    "paper-30": "头两个礼拜，十五号之后。你分得好清楚。",
  },
  12: {
    "paper-06": "九月一号、二号、四号。俾我三分钟。",
  },
};

function handOver(n, onDone) {
  const need = { 6: [], 8: ["paper-16", "paper-20"], 10: ["paper-30"], 12: ["paper-06"] }[n] || [];
  const given = [];
  let say = "";
  const ready = () => (need.length ? need.every((id) => given.includes(id)) : given.length > 0);
  showDiaryTool({
    kind: "拿给他看",
    title: n === 6 ? "拿一样放上桌" : "要交给他的",
    lock: true,
    build: (host, redraw) => {
      if (need.length) {
        host.append(el("p", { class: "tool-note" }, ["要交：" + need.map(itemLabel).join("、")]));
      } else {
        host.append(el("p", { class: "tool-note" }, ["照片、录音、周问脚湿那句都得。"]));
      }
      if (say) host.append(el("p", { class: "tool-reply" }, ["罗启明：" + say]));
      const cards = el("div", { class: "tool-cards" });
      (S.evidence || []).forEach((e) => {
        const done = given.includes(e.id);
        cards.append(el("button", {
          type: "button",
          class: "tool-card" + (done ? " done" : ""),
          onclick: () => {
            if (done) return;
            given.push(e.id);
            S.handed = S.handed || {};
            S.handed[n] = (S.handed[n] || []).concat([e.id]);
            say = (HAND_REPLY[n] || {})[e.id] || (n === 6 ? "呢样我记低。你讲返屋。" : "呢样我记低。你讲返纸。");
            redraw();
          },
        }, [e.kind + "　" + e.title]));
      });
      if (!(S.evidence || []).length) cards.append(el("p", { class: "tool-note" }, ["日记簿里还没有东西。"]));
      host.append(cards);
    },
    actions: () => [{
      label: ready() ? "放好了" : "还没有交齐",
      primary: true,
      disabled: !ready() && (S.evidence || []).length > 0,
      fn: () => {
        S.handed = S.handed || {};
        S.handed["ok" + n] = true;
        closeDiaryTool();
        onDone();
      },
    }],
  });
}

/* ---------- 分两堆 ---------- */

const PILES = [
  ["离开房间它先郁", "paper"],
  ["我喺厅里望住，佢唔郁", "paper"],
  ["声从储物室门底来", "paper"],
  ["车会自己转", "paper"],
  ["间屋有鬼", "heart"],
  ["我冇问题", "heart"],
];

function sortPiles(onDone) {
  const placed = {};
  let say = "";
  showDiaryTool({
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
        rows.append(el("div", { class: "tool-row sort" + (at ? " done" : "") }, [
          el("span", { class: "four-k" }, ["「" + text + "」"]),
          at
            ? el("small", {}, [at === "paper" ? "纸上写住的" : "我心里信的"])
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
  { id: "shoe", fixedLeft: "周没有问过我脚湿不湿", right: ["note-dry"], rt: "周开口就问我脚湿不湿，没人同他讲过脚印" },
  { id: "time", fixedLeft: "—", right: ["paper-20", "paper-norec", "photo-print", "tonight:print"], rt: "离开两分钟先郁；没有录音那晚车仍然走" },
];

function compareTokens() {
  const out = [];
  BASE.forEach((b) => { if (S.base && S.base[b.id]) out.push("base:" + b.id); });
  BASE.concat([PRINT_ROW]).forEach((b) => { if (S.tonight && S.tonight[b.id]) out.push("tonight:" + b.id); });
  (S.evidence || []).forEach((e) => out.push(e.id));
  return out;
}

function tokenLabel(t) {
  if (t.startsWith("base:")) {
    const b = BASE.find((x) => x.id === t.slice(5));
    return "本来·" + b.name + "：" + b.base;
  }
  if (t.startsWith("tonight:")) {
    const id = t.slice(8);
    const b = BASE.concat([PRINT_ROW]).find((x) => x.id === id);
    return "十四号夜·" + b.name + "：" + tonightText(id);
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

function openCompare(onDone) {
  let pick = "";
  S.compare = S.compare || {};
  showDiaryTool({
    title: "哪边先不一样？",
    build: (host, redraw) => {
      host.append(toolGuide(
        "把头两个礼拜和十五号之后的线索对照起来",
        ["拖起一张卡片（或点选）", "放到对应那一栏的空格", "至少四行，周问脚湿那行要有"],
        compareDone().length, 4, "写"
      ));
      const used = Object.values(S.compare);
      host.append(el("p", { class: "tool-label" }, ["我记下的"]));
      const cards = el("div", { class: "tool-cards compare-cards" });
      compareTokens().filter((t) => !used.includes(t)).forEach((t) => {
        const card = el("button", {
          type: "button",
          class: "tool-card" + (pick === t ? " sel" : ""),
          onclick: () => {
            pick = pick === t ? "" : t;
            redraw();
          },
        }, [tokenLabel(t)]);
        dragCard(card, t, host);
        cards.append(card);
      });
      host.append(cards);
      host.append(el("p", { class: "tool-label" }, ["对照纸"]));
      const grid = el("div", { class: "compare-grid" + (pick ? " picking" : "") });
      grid.append(el("b", {}, ["头两个礼拜"]), el("b", {}, ["十五号之后"]));
      COMPARE_ROWS.forEach((r) => {
        const slot = (side) => {
          const key = r.id + ":" + side;
          const filled = S.compare[key];
          const fixed = side === "L" && r.fixedLeft;
          if (fixed) return el("div", { class: "compare-slot fixed" }, [r.fixedLeft]);
          const put = (token) => {
            if (!token) {
              toolSay(host, "先拖起（或点选）上面一张卡片。");
              return;
            }
            const ok = (side === "L" ? r.left : r.right) || [];
            if (!ok.includes(token)) {
              const other = side === "L" ? r.right : r.left;
              toolSay(host, other && other.includes(token) ? "这张是另一栏的：头两个礼拜放左边，十五号之后放右边。" : "这张不是这一行的，换一行试试。");
              return;
            }
            S.compare[key] = token;
            pick = "";
            sfx("tick");
            redraw();
          };
          const node = el("button", {
            type: "button",
            class: "compare-slot" + (filled ? " filled" : ""),
            title: filled ? "点一下拿回去" : "",
            onclick: () => {
              if (filled) {
                delete S.compare[key];
                redraw();
                return;
              }
              put(pick);
            },
          }, [filled ? (side === "L" ? r.lt : r.rt) : "放在这里"]);
          if (!filled) dropSlot(node, put);
          return node;
        };
        grid.append(slot("L"), slot("R"));
      });
      host.append(grid);
    },
    actions: () => [{
      label: compareReady() ? "写好了" : "未写好",
      primary: true,
      disabled: !compareReady(),
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
    }],
  });
}

/* ---------- 补充纸：九月头一个礼拜 ---------- */

const WEEK_DAYS = [
  ["09-01", "车又转。我出门买饭，十分钟，返来车头朝门。"],
  ["09-02", "水又滴。拧紧，数到三，又滴。"],
  ["09-04", "冇录音。车仍郁。"],
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
      host.append(el("p", { class: "tool-note" }, ["点开三天就够。齐了会自动收成一张补充纸。"]));
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
            if (WEEK_DAYS.every(([day]) => S.cal11[day])) {
              closeDiaryTool();
              tip("三天齐了，收成一张补充纸。");
              onDone();
              return;
            }
            redraw();
          },
        }, [
          el("span", { class: "four-k" }, [d]),
          el("small", {}, [done ? t : "（点一下，写这一天）"]),
        ]));
      });
      host.append(rows);
    },
    actions: () => [{
      label: "先合上",
      fn: () => {
        closeDiaryTool();
        afterModalClose();
      },
    }],
  });
}

/* ---------- 通用：日记簿里的一页操作 ---------- */

function showDiaryTool(spec) {
  closeModal();
  if (mapLayer) mapLayer.hidden = true;
  S.diaryLeaf = { tool: true, lock: !!spec.lock, onClose: spec.onClose };
  const redraw = () => {
    const host = el("div", { class: "diary-tool" });
    spec.build(host, redraw);
    if (notesIndex) notesIndex.hidden = true;
    if (notesLeaf) {
      notesLeaf.hidden = false;
      const head = [];
      if (spec.kind) head.push(el("div", { class: "diary-meta" }, [el("span", { class: "diary-kind" }, [spec.kind])]));
      if (spec.title) head.push(el("h4", { class: "diary-title" }, [spec.title]));
      notesLeaf.replaceChildren(...head, host);
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
