/* story-early.js — split from story.js; load order: early -> clinic -> late */
function goViewing() {
  closeModal();
  if (S.level !== 1) {
    showPrompt("此盘已租出。");
    return;
  }
  if (flag("askedOld") && !flag("sawMail")) {
    showPrompt(
      replyReady() ? "站内留言有新回复。" : "业主现时不在线。",
      replyReady() ? "请先查看，再赴约睇楼。" : "回复会留在站内留言。"
    );
    return;
  }
  if (!levelReady()) {
    showModal("还不能去", levelHint() || "还没准备好。", "", null, () => draw());
    return;
  }
  finishLevel(1);
}

function startViewing() {
  setTime("2014年8月1日 周五 15:20");
  S.view = S.view || {};
  const door = flag("askedOld")
    ? line("周", "你份留言我睇到。听日下昼，我喺度等。旧嘢怕就同我讲。上来热。水唔烫。", { zh: "留言我看到了。明天下午我在这儿等。旧东西怕，跟我说。上来，热的。水不烫。" })
    : line("周", "上来热。水唔烫。", { zh: "上来热。水不烫。" });
  startTalk([
    door,
    line("章慧琪", "唔该。呢层……好静。", { zh: "谢谢。……这一层，好静。" }),
    line("周", "日头静。晚上旧楼会响，水管、老鼠、隔壁电视。住惯就得。我自己都住前座。", { zh: "白天静。夜里旧楼会响：水管、老鼠、隔壁电视。住惯就行。我自己也住前座。" }),
    line("", "他推开后座的门，站到一边。你可以自己看。"),
    { goto: () => enterHub("view", "hall") },
  ], "荣汇街 28 号 4 楼");
}

function viewLook(key, beats) {
  S.view = S.view || {};
  S.view[key] = true;
  hubTalk(beats, "荣汇街 28 号 4 楼");
}

HUBS.view = {
  time: "2014年8月1日 周五 15:30",
  places: [
    {
      id: "hall", name: "厅", map: "rong-hall", img: pic(2, "场景-后座厅"),
      line: "后座的厅。窗朝天井。茶几贴着储物室门一侧。周生跟在你后面，手插在裤袋里。",
      spots: () => [
        {
          title: "全家福", sub: "客厅墙上。挂得很正。", img: pic(2, "示意-全家福"),
          seen: () => !!S.view.family,
          go: () => viewLook("family", [
            line("章慧琪", "厅里张相……一家人？", { zh: "厅里那张相……一家子？" }),
            line("周", "挂惯咗。自家相。唔关你住。唔好动相框后面嘅箱就得。", { zh: "挂惯了。自家的。跟你住没关系。相框后面那箱别动就行。" }),
            line("章慧琪", "边个？你太太？细路？", { zh: "谁啊？……太太？还有小孩？" }),
            line("", "他笑了一下，没有接。墙上女人头发齐肩，缺一颗牙。小男孩望镜头外。"),
            line("周", "家里人。名你唔使知。相挂住，我唔想收。", { zh: "家里人。名你不用知道。相挂着，我不想收。" }),
          ]),
        },
        {
          title: "玩具车", sub: "茶几上敞篷红色塑料车。", img: pic(2, "示意-玩具车"),
          seen: () => !!S.view.car,
          go: () => viewLook("car", [
            line("章慧琪", "客厅有车。", { zh: "客厅……有辆车。" }),
            line("周", "前租客留低。我懒清。碍眼我可以挪去……嗰边。", { zh: "前租客留下的。我懒清。碍眼，我可以挪到……那边。" }),
            line("", "茶几贴着储物室门这一侧。他朝走廊尽头看了一眼。"),
            line("周", "迟啲先。", { zh: "回头再说。" }),
          ]),
        },
      ],
    },
    {
      id: "corridor", name: "走廊", map: "rong-corridor", img: MAP_PIC + "荣汇街-走廊",
      line: "从大门望进去的走廊。尽头一扇门。全家福在厅里，不在这边。",
      spots: () => [
        {
          title: "尽头锁着的门", sub: "木门。锁着。", img: pic(2, "示意-尽头锁着的门"),
          seen: () => !!S.view.door,
          go: () => viewLook("door", [
            line("章慧琪", "嗰间锁咗？", { zh: "那间……锁了？" }),
            line("周", "储物。衫箱多，乱。钥匙我拎住。你唔使开。门后有楼梯，上晒衫用。你要多一格柜，同我讲。", { zh: "储物。衣箱多，乱。钥匙我拿着，你不用开。门后有楼梯，上晒衣。要多一格柜，跟我说。" }),
          ]),
        },
      ],
    },
    {
      id: "bed", name: "主房", map: "rong-bed", img: MAP_PIC + "荣汇街-睡房",
      line: "铁条窗朝天井。",
      spots: () => [
        {
          title: "主房窗台", sub: "一圈浅色水印。", img: pic(2, "示意-主房窗台"),
          seen: () => !!S.view.sill,
          go: () => {
            flag("sawSillTour", true);
            viewLook("sill", [
              line("", "主房窗台有一圈浅色水印，形状像小孩鞋的印子。他走过来，用脚踩住那片水印。"),
            ]);
          },
        },
      ],
    },
  ],
  actions: () => [
    { mark: "问", label: "问周生", go: askZhouView },
  ],
};

function askZhouView() {
  const asked = () => { S.view.asked = true; };
  hubTalk([
    {
      prompt: "问他什么？",
      choices: [
        {
          label: "墙上那张相，像西贡乡村屋？",
          flag: "askedMudslide",
          note: ["tian", "周说是天灾。他说「他们话」。他没主动讲家人名字。"],
          then: [
            { goto: () => { asked(); stepPast(); } },
            line("章慧琪", "背景好似乡村。西贡那边？", { zh: "背景像乡下。……西贡那边？" }),
            line("", "他侧身挡了一下你的视线。"),
            line("周", "前年嘅事。新闻闹过一阵。报过。他们话天灾。唔好著你个租客身上。", { zh: "前年的事。新闻闹过一阵。报过。他们说天灾。别扯到你租客身上。" }),
          ],
        },
        {
          label: "简介写屋内仍有家人旧物。是哪些？",
          then: [
            { goto: () => { asked(); stepPast(); } },
            line("章慧琪", "周生，简介写屋内仍有家人旧物。边样？", { zh: "周生，简介写屋里还有家人旧物。……哪些？" }),
            line("", "他顿了一下。"),
            line("周", "箱箱袋袋，衫同碗碟。未清完。你介意杂物多，唔合适，你睇过先。", { zh: "箱子袋子，衣服碗碟。没清完。介意杂物多、不合适，先自己看。" }),
          ],
        },
        {
          label: "你一个人住会怕吗？",
          flag: "debtSlip",
          note: ["zhai", "口误：「还债」改成「还生活」。"],
          then: [
            { goto: () => { asked(); stepPast(); } },
            line("周", "怕过。后来发现，怕的人先走。剩低的人要还债……要还生活。", { zh: "怕过。后来发现，怕的人先走。留下来的人要还债……要还生活。" }),
          ],
        },
        { label: "先不问。", then: [] },
      ],
    },
  ], "荣汇街 28 号 4 楼");
}

function payDeposit() {
  startTalk([
    line("章慧琪", "阴我唔理。杂物我唔会乱动。租得，今晚住得？", { zh: "阴的我不管。杂物我不动。能租的话……今晚住得了吗？" }),
    line("", "他松了一口气。"),
    line("周", "老实。厨房水龙头有时自己滴，我修过，仲滴。你同我讲就得，唔使自己请人。今晚搬得，钥匙我即刻俾你。", { zh: "实话。厨房水龙头有时自己滴，我修过，还滴。跟我说就行，不用自己请人。今晚能搬，钥匙马上给你。" }),
    ...afterTour(),
  ], "荣汇街 28 号 4 楼");
}

function afterTour() {
  return [
    line("", "他收现金，手写一张收条，钱数了两遍。"),
    line("周", "无印花，平就平在呢度。我住 4 楼前座，隔一道墙。水龙头、老鼠、门锁，你敲门，我开。重建嗰啲嘢，名单挂咗好耐，未轮到。到时我同你讲，唔会无端端赶人。", { zh: "没印花，便宜就便宜在这儿。我住四楼前座，隔一道墙。水龙头、老鼠、门锁，你敲门我就开。重建那些，名单挂很久了，还没轮到。到时我跟你说，不会无端端赶人。" }),
    line("章慧琪", "我会好静。", { zh: "我会……很安静。" }),
    line("周", "安静最好。旧楼就系咁，住惯就得。", { zh: "安静最好。旧楼就这样，住惯就行。" }),
    {
      prompt: "……",
      choices: [
        {
          label: "这把？",
          then: [
            line("周", "天台。晾衫。晚上风大，早啲翻落来。", { zh: "天台。晾衣服。晚上风大，早点下来。" }),
            line("章慧琪", "我今晚搬。", { zh: "我今晚搬。" }),
            { goto: () => finishLevel(2) },
          ],
        },
        {
          label: "你怎么知道我会住惯。",
          note: ["nai", "周留意我看门锁、看水渍、看他的手。"],
          then: [
            line("周", "你眼看门锁，看水渍，看我手。租客很少看这么多。睇得细的人，住得耐。", { zh: "你眼睛看门锁、水渍，还有我的手。租客很少看这么多。看得细的人，住得久。" }),
            line("周", "天台那把也给你。晾衫。晚上风大，早啲翻落来。", { zh: "天台那把也给你。晾衣服。晚上风大，早点下来。" }),
            { goto: () => finishLevel(2) },
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
    return "铁条窗。窗台上那一圈水印，是干的，像小孩鞋的印子。看房时周生用脚踩住过——你认得那个形状。像搬东西时放过一双童鞋，不是这后座住过细路。";
  }
  return "铁条窗。外面是天井一侧，旧霓虹和对面的窗户。窗台上一圈水印，是干的——你按了按。形状清楚是小孩鞋印，像搬东西时放过，不是怪事。";
}

function drawMoveIn() {
  clearStage();
  const looks = [
    hot("大门与铁闸", "两道锁都试过。钥匙还能拧顺。", () => {
      markMoveIn("door");
      showModal("大门与铁闸", "两道锁都试过。铁闸推开时会响。钥匙齿有些磨损，还能拧顺。你反手锁好，又试了一次。", "", null, () => drawMoveIn());
    }, pic(3, "示意-大门与铁闸"), moveInAct("door")),
    hot("全家福", S.base.family ? "记下了。" : "客厅墙上。相后靠着纸箱。", () => {
      markMoveIn("family");
      note("move-family", "周说这是家里人。名字他不讲。相挂得很整齐。");
      baseSheet("family", "客厅墙上，正对茶几。三个人。男人笑得很用力，女人缺一颗牙、头发齐肩，小男孩看向镜头外面。相框擦得很干净，没有灰。挂得很正，相后两个纸箱。周先生说不要动。", () => drawMoveIn());
    }, pic(3, "示意-全家福"), !!S.base.family),
    hot("玩具车", S.base.car ? "记下了。" : "车头朝窗。座位里没有灰。", () => {
      markMoveIn("car");
      note("move-car", "车头朝窗。敞篷座位里没有灰。");
      baseSheet("car", "一辆旧红色塑料敞篷玩具车。车轮完整，没有缺件。车头朝窗。茶几贴着储物室门这一侧，上面有一圈晒痕。你低头往座位里看：没有灰。你没有碰。", () => drawMoveIn());
    }, pic(3, "示意-玩具车"), !!S.base.car),
    hot("厨房水龙头", S.base.tap ? "记下了。" : "关上之后还会滴一滴。", () => {
      markMoveIn("tap");
      note("move-tap", "关上之后还会滴。周说修过。");
      sfx("drip");
      baseSheet("tap", "拧开，水流一顿一顿的，带着铁管味。关上，等了几秒，滴答一声——关了还会滴一滴。周先生说修过，还在滴。", () => drawMoveIn());
    }, pic(3, "示意-厨房水龙头"), !!S.base.tap),
    hot("储物室门", S.base.storage ? "记下了。" : "锁着。里面很安静。", () => {
      markMoveIn("storage");
      baseSheet("storage", "走廊尽头。木门。锁从走廊这一侧锁着。门底有一道缝，里面是黑的，没有光。贴门听，很静。后楼梯在这扇门后面。你没有钥匙。", () => drawMoveIn());
    }, pic(3, "示意-储物室门"), !!S.base.storage),
    hot("主房窗台", S.base.sill ? "记下了。" : "干的水印。", () => {
      markMoveIn("sill");
      baseSheet("sill", sillMoveInText(), () => drawMoveIn());
    }, pic(3, "示意-主房窗台"), !!S.base.sill),
    hot("行李与床", "一只箱、一只袋。", () => {
      markMoveIn("bed");
      showModal("行李与床", "一只纸箱、一只旧旅行袋，都是你的。箱推在墙角。厨房没有剩菜。床上只有你带来的薄被。", "", null, () => drawMoveIn());
    }, pic(3, "示意-行李与床"), moveInAct("bed")),
    hot("天台钥匙", "大门内侧，门旁小钩。", () => {
      markMoveIn("roof");
      showModal("天台钥匙", "第三把钥匙挂在后座大门内侧的小钩上。周先生说过：晾衫用。晚上风大，早点下来。你没有上去。", "", null, () => drawMoveIn());
    }, pic(3, "示意-天台钥匙"), moveInAct("roof")),
  ];
  const box = el("div", { class: "room scene-fit" });
  box.append(
    imgSlot(pic(3, "场景-后座厅"), "room-bg", "后座"),
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
    forkChoice("甲", "scene-act", () => {
      markMoveIn("tv");
      showModal("电视", "旧楼天线，只有沙沙声。你又关掉。", "", null, () => drawMoveIn());
    }, "开一下电视"),
    el("div", { class: "fork-or", "aria-hidden": "true" }, ["或"]),
    forkChoice("乙", "scene-act", () => {
      markMoveIn("meter");
      flag("meter", true);
      showModal("电表", "电表在门边走廊墙角。数字转得很慢。", "", null, () => drawMoveIn());
    }, "看一眼电表"),
    el("div", { class: "fork-or", "aria-hidden": "true" }, ["或"]),
    forkChoice("丙", "scene-act" + (baseCount() >= 4 ? " primary" : ""), finishMoveIn, "先睡一晚")
  );
  const seen = Math.min(baseCount(), 4);
  box.append(el("p", { class: "base-boxes", title: "屋里的样子", "aria-label": "屋里的样子，看清了 " + seen + " 样" },
    [0, 1, 2, 3].map((i) => el("span", { class: i < seen ? "on" : "" }))));
  return box;
}

function finishMoveIn() {
  if (baseCount() < 4) {
    showModal("先睡一晚", "屋里的东西，我还没看清，再看一遍。", "", null, () => drawMoveIn());
    return;
  }
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
  S.calOpen = true;
  drawCalendar();
}

function drawCalendar() {
  clearStage();
  const days = [
    ["08-03", "周上门修水龙头。真的不滴了。收工说「有事敲门」。", pic(3, "示意-日历-0803-修水龙头")],
    ["08-07", "他送来一碗糖水，「太热」。白瓷碗放在茶几晒痕旁边。碗第二天他还来收——这只碗以后不再出现。", pic(3, "示意-日历-0807-糖水")],
    ["08-08", "倾偈　陈美娟", ""],
    ["08-10", "第二笔周租。现金。他数两遍，忽然问有没有陌生人打电话来问这栋楼。你说没有。他点头，写在日历上。", pic(3, "示意-日历-0810-交租")],
    ["08-12", "你把玩具车挪到墙角。过了一夜，它还在墙角。你把它放回茶几晒痕上，车头朝窗。", pic(3, "示意-日历-0812-车放回茶几")],
    ["08-13", "夜里水管响。你开了录音。听完只有水声。", pic(3, "示意-日历-0813-录音只有水")],
  ];
  const box = el("div", { class: "desk scene-desk" }, [
    imgSlot(pic(3, "场景-两周"), "scene-plate", "后座"),
    el("div", { class: "calendar" }, [
      el("h2", {}, ["两周"]),
      el("p", { class: "cal-hint" }, [levelHint() || "看完这几日，就往下。"]),
      el("div", {
        class: "days",
        onclick: (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          const id = btn.getAttribute("data-day");
          if (!id) return;
          withClue(btn.getAttribute("data-img"), () => openCalDay(id, btn.getAttribute("data-text") || ""));
        },
      }, days.map(([id, text, img]) =>
        el("button", {
          type: "button",
          class: S.calSeen[id] ? "seen" : "",
          "data-day": id,
          "data-text": text,
          "data-img": img,
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
  if (id === "08-12") note("car-still", "车放到角落，第二天还在；你放回茶几，车头朝窗。");
  if (id === "08-03") {
    S.base = S.base || {};
    if (S.base.tap) note("tap-fixed", "水龙头修好了。真的不滴了。");
  }
  if (id === "08-13") {
    showModal("录音：只有水", text, "2014年8月13日 夜", "memo", () => drawCalendar(), item("rec-water"));
    return;
  }
  showModal(id, text);
}

function startChange() {
  S.modal = null;
  setTime("2014年8月14日 周四 傍晚");
  startTalk([
    line("", "他衬衫皱，领口却是干的。手背青筋。信封角朝里，像怕你看见。"),
    line("周", "章小姐。后座……我想收回自住。定金我退你。周租都退。你再住两日，走得唔得？", { zh: "章小姐。后座……我想收回自住。定金退你。周租也退。你再住两天，走得了吗？" }),
    line("章慧琪", "我冇度去。我啱啱当呢度系住嘅。", { zh: "我没地方去。……我才刚当这儿是住的地方。" }),
    line("周", "当我冇讲。当我冇讲。水喉有问题我再睇。你当今日冇呢句。", { zh: "当我没说。当我没说。水龙头有问题我再看。你当今天没这句。" }),
    line("", "信封角从指缝露出来，上面有一截红圈，字看不清。他的手抖了一下，又把信夹紧。"),
    {
      prompt: "他已经转身。",
      choices: [
        {
          label: "看信封。",
          then: () => showModal(
            "信封",
            "新闻纸一角。红笔圈住的字被他拇指挡住，只看见圈的弧。圈里的字看不清。",
            "2014年8月14日 傍晚",
            "memo",
            () => drawTalk(),
            {
              id: "letter-red",
              kind: "信封",
              title: "红圈",
              time: "2014年8月14日 傍晚",
              body: "新闻纸一角。红笔圈的弧。他的拇指挡住圈里的字。",
              img: pic(4, "证据-红圈信封"),
            }
          ),
        },
        {
          label: "发生什么事？",
          note: ["takeback", "他前几日还好好。今日傍晚要收回。手抖，信封朝里。他说重建，又说未定。"],
          then: [
            line("周", "冇。重建……未定。有人……你唔好问。当我冇讲。", { zh: "没有。重建……还没定。有人……你别问。当我没说。" }),
            { goto: nightStart },
          ],
        },
        {
          label: "我可以晚一点走。",
          then: [
            line("周", "唔使你答应。当我冇讲。", { zh: "不用你答应。当我没说。" }),
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
    tip("走廊灯自己亮，再灭。");
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
  return item("rec-axuan");
}

function openAxuan(onClose) {
  showVoicemail("丽芬（旧机）", "阿轩，返嚟食饭。", onClose || (() => drawNight()), axuanItem());
}

function printItem() {
  return item("photo-print");
}

function openPrint(onClose) {
  showModal("照片：门底湿脚印", "门底下伸出一小截湿脚印，走到一半就停下了。", "", "memo", onClose || (() => drawNight()), printItem());
}

function sillItem() {
  return item("photo-sill");
}

function nameItem() {
  return item("rec-name");
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
  const carImg = n.car === "门" ? pic(4, "示意-玩具车-车头朝门") : n.car === "地" ? pic(4, "示意-玩具车-掉在地上") : pic(4, "示意-玩具车-车头朝窗");
  const box = el("div", { class: "room scene-fit" });
  const sillDone = nightAct("sill");
  const looks = [
    hot("全家福", "女人在笑，缺一颗牙，头发齐肩。小男孩看向镜头外。", () => {
      markNight("family");
      showModal("全家福", "客厅墙上。女人在笑，缺一颗牙，头发齐肩。小男孩看向镜头外。相框背面没有写日期，也没有名字。" + (n.recording ? "录音开着——门外门底若有声，不会从相框上来。" : ""), "", null, () => drawNight());
    }, pic(4, "示意-全家福"), nightAct("family")),
      hot("玩具车", carText, () => {
        if (n.car === "窗") n.car = "门";
      markNight("car");
      markTonight("car");
      showModal("玩具车", n.car === "地" ? "掉在地上，车头朝储物室。敞篷座位里仍然没有灰。" : "车头朝向和刚才不同了。搬进来时车头朝窗。茶几仍贴着储物室门这一侧。", "", null, () => drawNight());
    }, carImg, nightAct("car")),
    hot("窗台水印", sillDone ? sillLine(sillDone) : "童码。湿了。今晚没下雨。", () => sillMenu(), pic(4, "示意-窗台水印"), !!sillDone),
    hot("水龙头", "拧紧后，三秒后又滴水。", () => {
        if (n.recording) note("drip", "滴水里夹着女人气音，叫不全。");
      markNight("tap");
      markTonight("tap");
      sfx("drip");
      showModal("水龙头", "八月三日修好之后一直不滴。今夜拧紧，等了三秒，又滴下来。");
    }, pic(4, "示意-水龙头"), nightAct("tap")),
    hot("储物室门底", n.fired && n.fired.voice && n.recording ? "那卷录音还在" : "锁着。", () => {
      markTonight("storage");
      if (n.fired && n.fired.voice && n.recording) {
        markNight("heardAxuan");
        openAxuan();
        return;
      }
      markNight("door");
      showModal("储物室", "门锁着。里面有纸页被翻的声音，很慢。门缝下没有光。你敲了门，没有人应。隔壁电视的笑声准时传来。搬进来那晚贴门听，很静。");
    }, pic(4, "示意-储物室门底"), nightAct("door") || nightAct("heardAxuan")),
  ];
  if (n.print) {
    looks.push(hot("湿脚印", "门底下，走到一半停下。", () => {
      markNight("sawPrint");
      markTonight("print");
      openPrint();
    }, pic(4, "示意-湿脚印"), nightAct("sawPrint")));
  }
  box.append(
    imgSlot(pic(4, "场景-夜里后座厅"), "room-bg", "后座夜里"),
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
  const box = el("div", { class: "scene-actions fork" });
  const phoneLabel = n.recording ? "手机（录音开着）" : "打开手机";
  if (n.phase !== "leave") {
    box.append(forkChoice("☎", "scene-act", () => phoneMenu(), phoneLabel));
    return box;
  }
  const ready = pairCount() >= 3;
  box.append(
    forkChoice("☎", "scene-act", () => phoneMenu(), phoneLabel),
    forkChoice("并", "scene-act" + (ready ? " done" : " primary"), () => openPairs(() => drawNight()), "摆在一起（" + pairCount() + "／3）")
  );
  if (!ready) {
    box.append(el("p", { class: "hub-hint" }, ["跟搬进来那晚不一样的，摆在一起。"]));
    return box;
  }
  box.append(
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

function hotKey(title) {
  return S.level + ":" + title;
}

function hotClicked(title) {
  return !!(S.hotClicked && S.hotClicked[hotKey(title)]);
}

// 看过时记下卡上的字和图；之后变了就当没看过，再点一次才算
function hotSeen(title, sub, imgId, seen) {
  if (!seen) return false;
  S.hotSig = S.hotSig || {};
  const key = hotKey(title);
  const sig = sub + "|" + (imgId || "");
  if (S.hotSig[key] === undefined) S.hotSig[key] = sig;
  return S.hotSig[key] === sig;
}

function hot(title, sub, fn, imgId, seen, clue) {
  const kids = [];
  if (imgId) kids.push(imgSlot(imgId, "hot-img", title));
  kids.push(el("span", { class: "hot-copy" }, [title, el("small", {}, [sub])]));
  const pic = clue === undefined ? imgId : clue;
  const on = hotSeen(title, sub, imgId, seen);
  return el("button", {
    class: "hot" + (on ? " seen" : ""),
    type: "button",
    onclick: () => {
      const key = hotKey(title);
      S.hotClicked = S.hotClicked || {};
      S.hotClicked[key] = true;
      if (S.hotSig) delete S.hotSig[key];
      withClue(pic, fn);
    },
  }, kids);
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
    showModal("照片：窗台童码", "把自己的鞋并上去比过：小两号。水是新的。今晚没下雨。搬进来时那圈是干的。", "", "memo", () => drawNight(), sillItem());
    return;
  }
  if (done) {
    showModal("窗台水印", sillLine(done));
    return;
  }
  const clue = CLUE_IMG;
  closeModal();
  const ch = el("div", { class: "choices" });
  [
    ["擦掉", "wipe", () => {
      flag("wipedSill", true);
      showModal("窗台水印", "擦掉了。水印还是新的。", "", null, () => drawNight());
    }],
    ["拍照", "photo", () => {
      flag("photoSill", true);
      markTonight("sill");
      note("sill", "窗台童码。把自己的鞋并上去比过：小两号。今晚没下雨。");
      showModal("照片：窗台童码", "把自己的鞋并上去比过：小两号。水是新的。今晚没下雨。搬进来时那圈是干的。", "", "memo", () => drawNight(), sillItem());
    }],
    ["不理", "skip", () => showModal("窗台水印", "水是新的。今晚没下雨。干印变湿了。", "", null, () => drawNight())],
  ].forEach(([label, key, then]) => {
    ch.append(el("button", {
      type: "button",
      onclick: () => {
        markNight("sill", key);
        closeModal();
        withClue(clue, then);
      },
    }, [label]));
  });
  const sheet = el("div", { class: "sheet" }, [el("h3", {}, ["窗台水印"]), clueSlot(clue, "窗台水印"), ch]);
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
      sfx(n.recording ? "recOn" : "recOff");
      sfxSync();
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
  startTalk([
    line("差人", "紧急求助。有没有人伤？有没有人入屋？", { zh: "紧急求助。有没有人伤？有没有人入屋？" }),
    line("章慧琪", "没有。有声音。有车自己转。", { zh: "没有。……没人伤。有声音。有车自己转。" }),
    line("差人", "没有人伤、没有人入屋，我们不派车。你可到就近警署备案。身体不适打九九九叫救护车。", { zh: "没有人伤、没有人入屋，我们不派车。你可到就近警署备案。身体不适打九九九叫救护车。" }),
    {
      prompt: "通话还开着。",
      choices: [
        { label: "挂断", phone: true, hangup: true, then: [{ goto: resumeNight }] },
      ],
    },
  ], "拨出 999", "phone", { contact: "999", number: "紧急求助", dialout: true });
}

function leaveNightToMei() {
  stopNightClock();
  finishLevel(4);
}

function passFrontDoor() {
  flag("knockedZhou", true);
  note("wet", "周开口就问我脚湿不湿。我没同他讲过脚印。");
  setTime("2014年8月15日 周五 清晨");
  hubTalk([
    line("", "天亮了。你经过前座门口。"),
    line("周", "你脚湿了？", { zh: "你脚湿了？" }),
    line("章慧琪", "没有。", { zh: "没有。……干的。" }),
    line("", "你低头看。鞋子是干的。他关上门。"),
    { goto: () => keepThen(item("note-dry"), stepPast) },
  ], "4 楼前座门口", "face");
}

function knockZhou() {
  if (flag("knockedZhou")) {
    showModal("周先生", "已经敲过。他说是水管，问你脚湿不湿。你没有。");
    return;
  }
  flag("knockedZhou", true);
  note("wet", "周开口就问我脚湿不湿。我没同他讲过脚印。");
  const late = (S.night.min || 63) >= 79;
  startTalk([
    line("周", late
      ? "响呀？水管。电视开住。我日头帮你睇。你怕，就开灯。唔好上天台。"
      : "响呀？水管。我日头帮你睇。你怕，就开灯，开电视。唔好上天台。"),
    line("周", "你脚湿了？", { zh: "你脚湿了？" }),
    line("章慧琪", "没有。", { zh: "没有。……我脚干的。" }),
    line("", late ? "他过了几秒才开门。睡衣领口是湿的。他关上门。你低头看，鞋是干的。" : "他开门很慢，像是刚睡醒。他关上门。你低头看，鞋是干的。"),
    { goto: () => keepThen(item("note-dry"), stepPast) },
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
  const saved = S.chatLogs[S.chatPack];
  if (S.chatPack === "0808") setTime("2014年8月8日 周五 21:06");
  else if (!flag("clinicAddr")) setTime("2014年8月15日 周五 10:02");
  if (saved) {
    S.chat = saved.lines;
    S.chatStep = saved.step;
    S.chatClosed = !!saved.closed;
  } else {
    S.chat = S.chatPack === "0808"
      ? [["she", "住得惯未。唔好又唔食饭。"]]
      : [["she", ((S.chatLogs["0808"] || {}).lines || []).some(([k]) => k === "me") ? "阿琪，你终于肯回我。八号你仲话周生好人。新屋点？" : "阿琪，你终于肯回我。新屋点？"]];
  S.chatStep = 0;
    S.chatClosed = false;
    persistChat();
  }
  drawChat();
}

const CHAT_MEI16 = [
  { me: ["旧。平。夜里响。今次有嘢会自己动。唔係我「见到」。"] },
  { she: "你又……阿乐同我讲过。你今次真搬出去住，我以为会好。" },
  { me: ["我唔想再听人话我神经。"] },
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
  leaveChat();
}

function leaveChat() {
  if (S.level === 5) backToHub();
  else resumeNight();
}

HUBS.dawn = {
  time: () => (flag("clinicAddr") ? "2014年8月16日 周六 14:30" : "2014年8月15日 周五 早上"),
  places: [
    {
      id: "front", name: "前座门口", map: "rong-front", img: pic(5, "场景-前座门口"),
      line: () => (flag("knockedZhou") ? "周生的门关着。" : "天亮了。你要出门，得经过前座。"),
      spots: () => [
        {
          title: "前座门口", sub: () => (flag("knockedZhou") ? "门关着。" : "门开着一条缝。"), img: pic(5, "示意-前座门口"),
          seen: () => ev("note-dry"),
          go: () => {
            if (!flag("knockedZhou")) return passFrontDoor();
            if (!ev("note-dry")) {
              keepThen(item("note-dry"), backToHub);
              return;
            }
            showModal("前座门口", "门关着。十五号天亮前，他问过我的鞋。");
          },
        },
      ],
    },
    {
      id: "hall", name: "后座", map: "rong-hall", img: pic(5, "场景-后座厅"),
      line: () => (flag("clinicAddr")
        ? "8月16日。出门前。"
        : (S.chatLogs.mei16 && S.chatLogs.mei16.closed
          ? "倾偈聊过了。屋里的车同水喉，我想先拍好。"
          : "电脑开着。倾偈有新讯息。")),
      spots: () => [
        {
          title: "电脑：倾偈", sub: () => (S.chatLogs.mei16 && S.chatLogs.mei16.closed ? "已读。" : "陈美娟：阿琪，你终于肯回我。"), img: pic(5, "示意-电脑倾偈"),
          seen: () => !!(S.chatLogs.mei16 && S.chatLogs.mei16.closed),
          go: () => startChat("mei16"),
        },
        {
          title: "手机：短讯", sub: "陈家豪发来的地址。", img: pic(5, "示意-手机短讯"),
          show: () => flag("clinicAddr"),
          seen: () => true,
          go: () => showModal("陈家豪", "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n日间请经医院门诊。", "短讯　已读", "memo"),
        },
        {
          title: "拍一张：玩具车", sub: () => (flag("clinicAddr") ? "出门前。" : "先拍好。"), img: pic(5, "示意-拍玩具车"),
          show: () => !!(S.chatLogs.mei16 && S.chatLogs.mei16.closed),
          seen: () => ev("photo-car-out"),
          go: () => keepThen(item("photo-car-out"), backToHub),
        },
        {
          title: "拍一张：水龙头", sub: () => (flag("clinicAddr") ? "出门前，拧紧。" : "先拍好，拧紧。"), img: pic(5, "示意-拍水龙头"),
          show: () => !!(S.chatLogs.mei16 && S.chatLogs.mei16.closed),
          seen: () => ev("photo-tap-out"),
          go: () => keepThen(item("photo-tap-out"), backToHub),
        },
      ],
    },
  ],
};

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

let chatHeard = { pack: "", n: 0 };

function drawChat() {
  clearStage();
  const box = el("div", { class: "desk im-desk" });
  box.append(imgSlot("00-通用/场景-倾偈窗口", "talk-bg", "倾偈"));
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
    imgSlot("00-通用/头像-陈美娟", "chat-ava", "陈美娟"),
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
  if (S.chatPack !== chatHeard.pack) chatHeard = { pack: S.chatPack, n: 0 };
  if (S.chat.length > chatHeard.n) sfx(S.chat[S.chat.length - 1][0] === "me" ? "chatOut" : "chatIn");
  chatHeard.n = S.chat.length;
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
      onclick: () => leaveChat(),
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
            if (noise) S.chat.push(["she", "佢对阿明好到像亲兄弟。人唔怪。我都嫌。"]);
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
  flag("howardCalled", true);
  setTime("2014年8月15日 周五 10:18");
  startTalk([
    line("陈家豪", "阿琪？美娟叫我打。我喺差馆。你住得惯吗？旧楼响，好正常。", { zh: "阿琪？美娟叫我打。我在差馆。住得惯吗？旧楼响，正常。" }),
    line("章慧琪", "车会自己转。录音有女人叫仔食饭。前两周冇。", { zh: "车会自己转。……录音有女人叫仔吃饭。前两周没有。" }),
    line("陈家豪", "美娟话你搬咗去深水埗。荣汇街，系咪。旧。我带你去见个人。唔系急症。大学识嘅，读医，我读社会学，宿舍隔一层。日头医院，晚上湾仔有私家。我哋叫佢阿明。罗启明。年夜饭我讲过。", { zh: "美娟说你搬去深水埗了。荣汇街，对吧。旧。我带你去见个人。不是急症。大学识的，读医——我读社会学，宿舍隔一层。白天医院，晚上湾仔有私家。我们叫他阿明。罗启明。年夜饭我讲过。" }),
    line("章慧琪", "就系成日留你加班嗰个。", { zh: "就是……老留你加班那个？" }),
    line("陈家豪", "系。佢识听。我介绍，佢会收。你同佢讲真话。听完就会攞嚟自己身上。所以你……准时到就得。楼下嗰间面，佢有时会忘食。", { zh: "对。他肯听。我介绍，他会收。你跟他说真话。听完就会往自己身上揽。所以你……准时到就行。楼下那家面，他有时会忘吃。" }),
    line("章慧琪", "佢点？", { zh: "他……怎样？" }),
    line("陈家豪", "专业。用心。佢本人精神有时唔太好。过劳。你当我冇讲。睇病人一流。", { zh: "专业。用心。他本人精神有时不太好。过劳。你当我没说。看病人一流。" }),
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
            line("陈家豪", "失眠，健忘，有时接唔上昨日。你别同佢讲系我说的。佢唔钟意人担心佢。我担心就算。", { zh: "失眠，健忘，有时接不上昨天。别跟他说是我说的。他不喜欢人担心他。我担心就算。" }),
            ...howardClose(),
          ],
        },
        {
          label: "你为什么这么快就把我塞给他？",
          flag: "askedWhyFast",
          then: [
            line("陈家豪", "因为你系亲人。因为佢需要……因为佢擅于这种。我送你过去，你安心。", { zh: "因为你是亲人。因为他需要……因为他擅长这种。我送你过去，你安心。" }),
            ...howardClose(),
          ],
        },
      ],
    },
  ], "来电 Howard", "phone", { incoming: true, contact: "Howard", number: "陈家豪" });
}

function howardClose() {
  return [
    line("陈家豪", "对了。房东叫周，是吗？旧闻我有印象。天灾。你唔好自己查东查西。你自己查，会越查越怕。怕咗更难瞓。准时去见佢就得。", { zh: "对了。房东叫周，是吗？旧闻我有印象。天灾。你别自己查东查西。自己查，越查越怕。怕了更难睡。准时去见他就行。" }),
    { note: ["dontlook", "陈不让我查房东。他像已经知道这条街。"], who: "陈家豪", text: "我挂咗。等阵我发你地址。同一部手机。" },
    { goto: howardSms },
  ];
}

function howardSms() {
  setTime("2014年8月15日 周五 10:21");
  flag("clinicAddr", true);
  startTalk([
    line("陈家豪", "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n日间请经医院门诊。", { zh: "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n日间请经医院门诊。" }),
    {
      choices: [
        {
          label: "收起手机",
          phone: true,
          hangup: true,
          then: [{ goto: afterHowardSms }],
        },
      ],
    },
  ], "手机", "sms", { contact: "Howard", number: "陈家豪" });
}

function afterHowardSms() {
  waitWeek(
    "2014年8月15日 周五 10:21",
    "地址到了，明天赴约。",
    "",
    () => backToHub()
  );
}
