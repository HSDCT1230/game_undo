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

function goClinic() {
  setTime("2014年8月16日 周六 15:50");
  S.clinicLooked = {};
  S.clinic = { visit: 1, seg: 0 };
  clinicArrival(1, () => enterClinic(1));
}

function enterClinic(visit) {
  S.talk = null;
  S.mode = "clinic";
  S.clinic = { visit, seg: (S.clinic && S.clinic.visit === visit) ? S.clinic.seg : 0 };
  S.clinicLooked = S.clinicLooked || {};
  drawClinic();
}

function backToClinic(step) {
  S.talk = null;
  S.mode = "clinic";
  if (step) S.clinic.seg += 1;
  drawClinic();
}

const CLINIC1_SEGS = ["你是谁", "阿乐", "谁在帮你", "屋"];

function clinicSpots(visit) {
  const L = S.clinicLooked;
  if (visit === 4) {
    return [
      hot("抽屉", L.drawer4 ? "鱼牌的位置空了。" : "缝还开着一点。", () => {
        L.drawer4 = true;
        note("fishgone", "抽屉里节拍器还在。摆杆旁边那块白鱼牌不见了。");
        showModal("抽屉", "铜色节拍器还在，摆杆停在最左一格。摆杆旁边原来压着那块磨白的鱼牌，位置空了，只剩一圈浅印。", "", null, () => drawClinic());
      }, pic(12, "示意-抽屉"), L.drawer4),
      hot("预约表", L.sched ? "连着四个星期六。" : "前台屏幕没有关。", () => {
        L.sched = true;
        note("sched", "预约表：阿文下一行是我。连着四个星期六，他都排在我前面。");
        showModal("预约表", "常客一栏写着阿文。下一行是你的名字。连着四个星期六，他都排在你前面。", "", null, () => drawClinic());
      }, pic(12, "示意-预约表"), L.sched),
    ];
  }
  const drawerText = visit >= 3
    ? "节拍器还在。摆杆旁边多一封折好的信，封口朝里。"
    : "缝里露出节拍器的摆杆——上一号刚走，没推严。旁边有一小块白鱼牌。";
  const listText = visit >= 2
    ? "常客一列：阿文。每周六。护士说过他常拖时。"
    : "常客一列：阿文。预约每周六。";
  return [
    hot("执照", "罗启明。Kimon Law。照片比真人年轻，笑。", () => {
      L.lic = true;
      showModal("执照", "注册精神科。英文 Kimon Law。", "", null, () => drawClinic());
    }, pic(6, "示意-执照"), L.lic),
    hot("抽屉", drawerText, () => {
      L.drawer = true;
      if (visit >= 3) {
        note("metro", "抽屉缝里是节拍器。摆杆旁边压着一封未开的信，像转介，回形针卡住，打不开。鱼牌还在。");
        showModal(
          "抽屉",
          "铜色节拍器，摆杆停在最左一格。鱼牌还在摆杆旁边。多一封折好的信，封口朝里，回形针卡住。你碰了碰，打不开。",
          "",
          null,
          () => drawClinic()
        );
        return;
      }
      note("metro", "抽屉缝里是节拍器，摆杆旁边压着一小块没有字的白鱼牌。他两样一起按住。只说：旧嘢。数呼吸用的。而家唔用。");
      showModal("抽屉", "铜色节拍器，摆杆停在最左一格。摆杆旁边一小块磨白的塑料鱼牌，没有字。上一个病人刚走，抽屉没推严，他按得很紧，把两样一起盖上。说是旧东西，用来数呼吸的，现在不用了。他只解释节拍器。", "", null, () => drawClinic());
    }, pic(visit >= 3 ? 10 : 6, "示意-抽屉"), L.drawer),
    hot("电脑一角", listText, () => {
      L.list = true;
      if (visit >= 2) {
        note("lok", "有个叫阿文的病人常来。每周六。护士说他那个号成日拖过时。");
        showModal("等候名单", "显示名：阿文　预约：每周六　缴费：现金\n（旁注：上一个时段常拖过。）", "", null, () => drawClinic());
        return;
      }
      note("lok", "有个叫阿文的病人常来。每周六。");
      showModal("等候名单", "显示名：阿文　预约：每周六　缴费：现金", "", null, () => drawClinic());
    }, pic(6, "示意-电脑一角"), L.list),
  ];
}

function clinicActions(visit) {
  const box = el("div", { class: "scene-actions fork hub-acts" });
  if (visit === 4) {
    const ok = !!S.clinicLooked.drawer4;
    box.append(forkChoice("坐", "scene-act" + (ok ? " primary" : ""), () => {
      if (!ok) {
        showModal("坐低", "抽屉……我想先看一眼。", "", null, () => drawClinic());
        return;
      }
      clinic4Talk();
    }, "坐下来讲"));
    if (!ok) box.append(el("p", { class: "hub-hint" }, ["抽屉。上次那块白色的东西。"]));
    return box;
  }
  const seg = S.clinic.seg;
  const looked = cnt(["lic", "drawer", "list"], S.clinicLooked) >= 3;
  box.append(
    el("p", { class: "clinic-seg" }, ["讲到：" + CLINIC1_SEGS.slice(0, seg).join(" → ") + (seg ? " → " : "") + (CLINIC1_SEGS[seg] || "")]),
    forkChoice("讲", "scene-act primary", clinicSpeak, seg === 0 ? "开始讲" : "继续讲（" + CLINIC1_SEGS[seg] + "）"),
    askGrey()
  );
  if (seg === 3 && !looked) box.append(el("p", { class: "hub-hint" }, ["讲屋之前，我想先看清这间房。"]));
  return box;
}

function drawClinic() {
  clearStage();
  const visit = (S.clinic && S.clinic.visit) || 1;
  const box = el("div", { class: "clinic scene-fit" });
  box.append(
    imgSlot(lvPic("场景-诊室"), "clinic-bg", "澄心诊室"),
    el("div", { class: "clinic-dock" }, [
      el("div", { class: "clinic-grid" }, clinicSpots(visit)),
    ])
  );
  stage.append(box);
  stage.append(clinicActions(visit));
  renderPlaybar();
}

function clinicSpeak() {
  const seg = S.clinic.seg;
  const tail = [{ goto: () => backToClinic(true) }];
  if (seg === 0) return startTalk([...clinic1Intro(), line("", "他搁下笔。你可以抬头看看这间房。"), ...tail], "澄心诊室", "face");
  if (seg === 1) return startTalk([...clinic1Present(), ...tail], "澄心诊室", "face");
  if (seg === 2) return startTalk([...clinic1Support(), ...tail], "澄心诊室", "face");
  if (cnt(["lic", "drawer", "list"], S.clinicLooked) < 3) {
    showModal("继续讲", "讲屋之前，我想先看清这间房。", "", null, () => drawClinic());
    return;
  }
  clinicTalk();
}

function clinicArrival(visit, next) {
  S.visitSeen = S.visitSeen || {};
  S.visitSeen[visit] = true;
  const beats = {
    1: [
      line("", "你早到十分钟。诊室门开了，有人走出来。身子很瘦，窄脸看不清，只看见细框眼镜上的光。脸色白，衬衫扣到最上面一颗。"),
      line("", "杂志倒拿着。他对你笑了笑，很客气，笑停在脸上，人却让人觉得奇怪。胸前没有名牌。"),
      line("", "门还开着。你发现自己已经先笑了一下，笑得很浅。诊室里的人站了起来。"),
      line("", "护士说：章小姐？请进。"),
      { note: ["linWait", "上一个病人。瘦，戴细框眼镜。笑很客气，人很奇怪。五官记不住。"] },
    ],
    2: [
      line("", "电梯口有个人背对着你。还是很瘦，细框眼镜，衬衫扣得很齐。他把倒着的杂志递到你手里。"),
      line("", "他说：你都系星期六？"),
      line("", "又说：上星期六，佢听你听得好耐。"),
      line("", "他没有回头。你记不住他的五官，只记得这人奇怪。"),
      line("", "护士低声说：上一个时段拖咗少少。阿文先生刚走。章小姐，请进。"),
      line("", "门打开之前，你又先笑了一下，笑得很浅。"),
      { note: ["linWait", "又是那个瘦、戴细框眼镜的人。五官记不住。人很奇怪。护士说他那个号拖过时。"] },
    ],
    3: [
      line("", "你从电梯出来，和一个倒拿着杂志的男人擦肩而过。还是很瘦，细框眼镜，脸色白。五官对不上，你只认得这副样子。"),
      line("", "他浅浅地笑了一下。笑很礼貌，人仍让人觉得奇怪。他推开洗手间门进去。护士喊道：阿文先生好了——今日又拖过。章小姐，请进。"),
      line("", "擦肩而过之后，你仍然先对着诊室门浅笑了一下。"),
      { note: ["linWait", "第三次。又是那个瘦、戴眼镜的人。笑很客气，人很奇怪。在我前面，又拖过时。"] },
    ],
    4: [
      line("", "杂志干脆放在前台。护士翻看预约表，说：阿文先生啱啱走，又坐满一个时段。章小姐，请进。"),
      line("", "电梯门刚合上。你又看见那个瘦影子，细框眼镜闪了一下。五官还是记不住。这人很奇怪。"),
      line("", "前台的屏幕没有关。门开了。你的笑比前三次更稳一些。"),
      { note: ["linWait", "阿文刚走，又坐满一个时段。还是那个瘦、戴眼镜的人，五官记不住，人很奇怪。"] },
    ],
  };
  startTalk([...(beats[visit] || []), { goto: next }], "澄心候诊", "face");
}

function clinic1Intro() {
  return [
    line("罗启明", "章小姐？早到。坐。要唔要水。", { zh: "章小姐？早到了。坐。要不要水。" }),
    line("章慧琪", "唔使。我……", { zh: "不用。我……" }),
    line("", "……"),
    line("章慧琪", "想坐定先。坐定了再……算了，先坐。", { zh: "想先坐定。坐定了再……算了，先坐。" }),
    line("罗启明", "罗启明。家豪打过电话。你可以叫我阿明。", { zh: "罗启明。家豪打过电话。你可以叫我阿明。" }),
    line("章慧琪", "阿明……好。", { zh: "阿明……好。" }),
    line("罗启明", "一周一次。今日先认识，唔落诊断。", { zh: "一周一次。今天先认识——先不下诊断。" }),
    line("", "他翻开本子，拧开笔帽，等你开口。"),
    line("章慧琪", "章慧琪。美娟系我表姐。家豪……", { zh: "章慧琪。……美娟是我表姐。家豪……" }),
    line("章慧琪", "系我姐夫。就……就这些。", { zh: "是我姐夫。就……就这些。" }),
    line("罗启明", "从边度开始都得。你舒服就得。", { zh: "从哪儿开始都行。你舒服就行。" }),
    line("章慧琪", "……", { zh: "……" }),
    line("", "窗缝漏进一点风。本子上多了几个字，他仍低着头。"),
    line("章慧琪", "我搭车嚟。一路都提醒自己唔好讲太多。", { zh: "我搭车过来的。一路上都在跟自己讲——别讲太多。" }),
    line("章慧琪", "讲多，人就会丢一个字过来：神经，病，又嚟。", { zh: "讲多了，对面就会丢一个字过来。神经。病。又来了。" }),
    line("章慧琪", "我唔系话你都会。我系话……以前都系咁。", { zh: "我不是说你也会。我是说……以前都是这样。" }),
    line("章慧琪", "所以我本来打算今日只坐十分钟就走。而家又坐紧。", { zh: "所以我本来打算今天只坐十分钟就走。现在又坐着了。" }),
    line("罗启明", "今日呢度，我会听完先。", { zh: "今天在这儿，我先听完。" }),
    line("章慧琪", "听完……然后呢。你会写咩。", { zh: "听完……然后呢。你会写什么。" }),
    line("罗启明", "写你讲过嘅。今日唔写病名。", { zh: "写你说过的。今天不写病名。" }),
    line("章慧琪", "……真系？唔系安慰我。", { zh: "……真的？不是安慰我。" }),
    line("罗启明", "安慰你会讲好听啲。我讲写字。", { zh: "安慰你会说好听一点。我说的是写字。" }),
    line("章慧琪", "……好。我试下。", { zh: "……好。我试试。" }),
    line("章慧琪", "……好。好吧。", { zh: "……好。好吧。" }),
    line("", "……"),
    line("章慧琪", "我二十六。喺深水埗大。", { zh: "我二十六。深水埗长大的。" }),
    line("章慧琪", "散工。无粮单，无担保。租盘上唔到。", { zh: "打零工。没工资单，没担保人。……正经租盘，根本上不去。" }),
    line("章慧琪", "我说这个不是……不是要你同情我。只是……你问基本情况，我就……就这些。", { zh: "我说这个不是……不是要你同情我。只是……你问基本情况，我就……就这些。" }),
    line("", "他点一下头，笔尖跟着动。"),
    line("罗启明", "屋企呢？", { zh: "家里呢？" }),
    line("章慧琪", "屋企……", { zh: "家里……" }),
    line("", "……"),
    line("章慧琪", "你可以跳过呢条。我……唔知从边度答起。", { zh: "你可以跳过这条。我……不知道从哪儿答起。" }),
    line("罗启明", "唔跳。你讲得几多算几多。", { zh: "不跳。你说多少算多少。" }),
    line("章慧琪", "爸……走得早。我大约八岁。", { zh: "爸……走得早。我大概八岁。" }),
    line("章慧琪", "葬礼记唔清——不是不想记，是……真的记不清。净系记得之后间屋静咗。", { zh: "葬礼记不清——不是不想记，是……真的记不清。只记得之后那屋子静了。" }),
    line("章慧琪", "阿妈后来改嫁去屯门。我去过一次——", { zh: "妈妈后来改嫁去屯门。我去过一次——" }),
    line("", "她停住，手指在膝盖上捏了一下，又松开。"),
    line("章慧琪", "佢而家个男人问我住几日。就嗰句。", { zh: "她现在那个男人问我住几天。就那一句。" }),
    line("章慧琪", "我坐喺沙发，袋都冇打开。唔系佢凶。系我……听完嗰句就知道自己唔该坐太耐。", { zh: "我坐在沙发上，包都没打开。……不是他凶。是我……听完那句就知道自己不该坐太久。" }),
    line("章慧琪", "之后就少返。", { zh: "之后就很少回去。" }),
    line("章慧琪", "所以表姐而家叫我去沙发，我都当自己系过路。坐几日就要走。", { zh: "所以表姐现在叫我去睡沙发，我还是当自己过路。……坐几天就得走。" }),
    line("章慧琪", "不是她赶我。是我……我自己知道。", { zh: "不是她赶我。是我……我自己知道。" }),
    line("罗启明", "嗯。", { zh: "嗯。" }),
    line("", "……"),
    line("章慧琪", "你写低嘅……会唔会先当我有问题。", { zh: "你记下来的……会不会先当我有问题？……不是质疑你。我就是……想知道。你写「家庭」两个字的时候，是不是已经……算了。你别回答也行。" }),
    line("罗启明", "记一记基本情况。你讲几多，我写几多。", { zh: "记一记基本情况。你讲多少，我写多少。" }),
    line("章慧琪", "……中学唔响。", { zh: "……中学不怎么吭声。" }),
    line("章慧琪", "英文老师俾过个名 Vicky，名片先用。平时……平时冇人叫。", { zh: "英文老师给过个名，Vicky——名片上才用，平时……平时没人叫。" }),
    line("章慧琪", "同学话我望人望得太耐。我都唔系故意。后来学识答短句，人就唔再问。", { zh: "同学说我看人看得太久。……我也不是故意的。后来学会答短句，人就不再问。" }),
    line("章慧琪", "短句护住我，也令我讲唔完。——我又讲远了。你……你当我没讲后半句也行。", { zh: "短句护着我。也让我说不完。——我又讲远了。你……你当我没讲后半句也行。" }),
    line("罗启明", "而家做咩工。", { zh: "现在做什么工。" }),
    line("章慧琪", "散工。货仓点数、展会派传单、茶餐厅都做过。", { zh: "打零工。货仓点数、展会派传单、茶餐厅都做过。" }),
    line("章慧琪", "而家帮展会，有阵时仓库。", { zh: "现在帮展会，有时候仓库。" }),
    line("", "……"),
    line("章慧琪", "七月廿二我喺网上发帖求平租。发之前删过三次。", { zh: "七月二十二我在网上发帖求便宜租。发之前删过三次。" }),
    line("章慧琪", "怕人睇到我求。唔系怕房东。系怕……写出来自己都觉得难看。", { zh: "怕人看见我在求。不是怕房东。是怕……写出来自己都觉得难看。" }),
    line("章慧琪", "大角咀、荃湾睇过，都上唔到。", { zh: "大角咀、荃湾都看过，都上不去。" }),
    line("章慧琪", "——我说这些是因为……因为你问工。不是因为……后面的事。后面的事……等一下。或者不讲。", { zh: "——我说这些是因为……因为你问工。不是因为……后面的事。后面的事……等一下。或者不讲。" }),
    line("", "他写完那一行，抬起眼。"),
    line("罗启明", "跟住呢？", { zh: "后来呢？" }),
  ];
}

function clinic1Present() {
  return [
    line("罗启明", "而家住边。同边个住。", { zh: "现在住哪儿。跟谁住。" }),
    line("章慧琪", "荣汇街。唐楼后座。一个人。", { zh: "荣汇街。唐楼后座。一个人。" }),
    line("章慧琪", "按金交咗，周租现金。口头，无印花。", { zh: "押金交了，周租现金。口头的，没印花。" }),
    line("章慧琪", "唔系我要偷税嗰种。系……租得上嘅都系咁。我说这个，你会不会觉得我……算了。", { zh: "不是我要偷税那种。是……租得上的都这样。我说这个，你会不会觉得我……算了。" }),
    line("", "纸上沙沙响了一阵。"),
    line("罗启明", "搬入之前呢？", { zh: "搬进来之前呢？" }),
    line("章慧琪", "同阿乐。……套房。五月搬出。", { zh: "跟阿乐。……套房。五月搬出。" }),
    line("章慧琪", "之前短租、日租、表姐沙发都瞓过。坐几日就觉得自己系客人。", { zh: "之前短租、日租、表姐沙发都睡过。坐几天就觉得自己是客人。" }),
    line("章慧琪", "唔系抱怨。系……事实。我讲阿乐，唔系要你评谁对谁错。就是……你问之前，我答之前。", { zh: "不是抱怨。是……事实。我讲阿乐，不是要你评谁对谁错。就是……你问之前，我答之前。" }),
    line("罗启明", "拍拖几耐。", { zh: "谈了多久。" }),
    line("章慧琪", "一年有多。起初袋口紧。后尾大家都好攰。", { zh: "一年有多。起初手头紧。后来大家都累。" }),
    line("章慧琪", "佢做物流，我散工，返工时间撞唔上。", { zh: "他做物流，我打零工，上班时间对不上。" }),
    line("章慧琪", "其实也不是时间的事。我……我又想绕开了。", { zh: "其实也不是时间的事。我……我又想绕开了。" }),
    line("", "……"),
    line("章慧琪", "你问分手……其实我唔知从边度讲起。", { zh: "你问分手……其实我不知从哪儿讲起。" }),
    line("章慧琪", "讲出来你会当我又病。你可以当我在铺垫。也可以当我在拖。我自己都分不清。", { zh: "讲出来，你会不会当我又病了。……你可以当我在铺垫。也可以当我在拖。我自己都分不清。" }),
    line("罗启明", "你慢慢讲。", { zh: "你慢慢讲。" }),
    line("章慧琪", "五月有一夜。我半夜坐起。", { zh: "五月有一夜。我半夜坐起来。" }),
    line("章慧琪", "话窗台有水，又话听到有人叫。", { zh: "说窗台有水，又说听到有人叫。" }),
    line("章慧琪", "嗰阵我仲未搬去荣汇街。所以……所以不是那间屋的事。——我先说清楚这一点。", { zh: "那时候我还没搬去荣汇街。所以……所以不是那间屋的事。——我先说清楚这一点。" }),
    line("章慧琪", "可能只系旧楼水管。我自己都唔肯定。", { zh: "可能只是旧楼水管。我自己都不肯定。" }),
    line("章慧琪", "我捉住佢，只想有人醒住。唔系要佢相信有鬼。我嗰阵……甚至冇敢讲鬼呢个字。", { zh: "我抓住他，只想有人醒着。……不是要他相信有鬼。我那时……甚至没敢说鬼这个字。" }),
    line("罗启明", "佢点答。", { zh: "他怎么答。" }),
    line("章慧琪", "「你又病。」", { zh: "「你又病。」" }),
    line("", "……"),
    line("罗启明", "佢讲完仲有冇第二句。", { zh: "他说完还有没有第二句。" }),
    line("章慧琪", "冇。一句够。", { zh: "没有。一句够了。" }),
    line("章慧琪", "我……我其实想过自己系咪真系病。想完又好慞自己想。", { zh: "我……其实想过自己是不是真的病了。想完又很恨自己这么想。" }),
    line("罗启明", "慞自己想，同听唔到声，系两样。", { zh: "恨自己这么想，和听没听见声，是两件事。" }),
    line("章慧琪", "……你又点破我。", { zh: "……你又点破我了。" }),
    line("罗启明", "我净系分开两样。你唔使即刻拣。", { zh: "我只是把两样分开。你不用马上选。" }),
    line("章慧琪", "就这一句。第二日唔接。再打，两声就断。", { zh: "就这一句。第二天不接。再打，两声就断。" }),
    line("章慧琪", "我将置顶删咗。删完仲会睇个空位。像……像还在等它跳回来。好蠢。我知。", { zh: "我把置顶删了。……删完还会看那个空位。像……像还在等它跳回来。很蠢。我知道。" }),
    line("章慧琪", "我当时笑咗一下。话冇事。返房关灯。之后唔敢再讲。", { zh: "我当时笑了一下。说没事。回房关灯。之后不敢再讲。" }),
    line("章慧琪", "讲多一次，佢就更似对。——我而家讲俾你听，也在怕同一种东西。怕你点头。怕你写字。怕你……算了。", { zh: "多讲一次，他就更像是对的。——我现在讲给你听，也在怕同一种东西。怕你点头。怕你写字。怕你……算了。" }),
    line("", "诊室静了一会儿。笔尖在纸上轻点两下。"),
    line("章慧琪", "……我坐喺度，都想再笑一下当冇事。我忍住咗。", { zh: "……我坐在这儿，都想再笑一下当没事。我忍住了。" }),
    line("章慧琪", "所以我先上网发帖，唔想再坐表姐沙发解释。", { zh: "所以我先上网发帖。不想再坐表姐沙发解释。" }),
    line("章慧琪", "解释什么呢。解释我听见了。解释我没听见。解释……我自己都编不好。", { zh: "解释什么呢。解释我听见了。解释我没听见。解释……我自己都编不好。" }),
    line("罗启明", "你怕解释咩？", { zh: "你怕解释什么？" }),
    line("章慧琪", "怕人一个字打发我。怕人当我疯。怕连自己听到嘅都唔信。", { zh: "怕人一个字就把我打发掉。怕人当我疯。怕连自己听到的都不信。" }),
    line("章慧琪", "怕我一开口，就变成要人收拾嘅嗰个。——我唔系嚟讨安慰。我……只系唔想再练嗰种笑。", { zh: "怕我一开口，就变成要人收拾的那个。——我不是来讨安慰的。我……只是不想再练那种笑。" }),
    line("", "……"),
    line("罗启明", "瞓得着？食得落？散工去唔去？", { zh: "睡得着？吃得下？零工还去不去？" }),
    line("章慧琪", "搬入头半个月都得。去工，食饭。", { zh: "搬进去头半个月都还行。去上班，吃饭。" }),
    line("章慧琪", "十五号之后先差。我认定问题喺间屋。", { zh: "十五号之后才差。我认定问题在那间屋。" }),
    line("章慧琪", "你……你可以当我执住呢句。你可以当我在躲别的。我知听起来像借口。可我……我先把这句放这儿。", { zh: "你可以当我咬住这句不放。你可以当我在躲别的。我……我知道听起来像借口。可我……我先把这句放这儿。" }),
    line("罗启明", "我记低。屋。十五号。", { zh: "我记下。屋。十五号。" }),
    line("章慧琪", "……就这样？你唔追？", { zh: "……就这样？你不追问？" }),
    line("罗启明", "追咗你会收口。我宁可变慢。", { zh: "追了你会闭嘴。我宁可慢一点。" }),
  ];
}

function clinic1Support() {
  return [
    line("罗启明", "身边有边个。", { zh: "身边有谁。" }),
    line("章慧琪", "表姐美娟。煮汤，叫我去沙发瞓，叫我食药。", { zh: "表姐美娟。煮汤，叫我去沙发睡，叫我吃药。" }),
    line("章慧琪", "我唔去。……唔系唔领情。系……去了就要解释。", { zh: "我不去。……不是不领情。是……去了就要解释。" }),
    line("章慧琪", "家豪……我姐夫。佢话你肯听完，又叫我唔好自己查房东。", { zh: "家豪……我姐夫。他说你肯听完，又叫我别自己查房东。" }),
    line("章慧琪", "查房东嗰句……我当佢担心我出事。也可以当……算了。我冇查。今日。", { zh: "查房东那句……我当他担心我出事。也可以当……算了。我没查。今天。" }),
    line("", "他写了「美娟」「家豪」，头也没抬。"),
    line("章慧琪", "……表姐爱我。阿乐怕我。", { zh: "……表姐爱我。阿乐怕我。" }),
    line("章慧琪", "我嚟你度，唔想再俾人用一个字打发。——我刚才是不是讲重了。你可以当我没说「爱」和「怕」。", { zh: "我来你这儿，不想再被人一个字打发。——我刚才是不是讲重了。你可以当我没说「爱」和「怕」。" }),
    line("", "……"),
    line("章慧琪", "你听到呢度，会唔会觉得我系嚟投诉屋企、投诉前度——同你冇关。", { zh: "你听到这儿……会不会觉得我是来投诉家里、投诉前男友——跟你没关系？" }),
    line("章慧琪", "你可以老实说。我……我扛得住。大概。", { zh: "你可以老实说。我……我扛得住。大概。" }),
    line("罗启明", "边样最想我听。", { zh: "哪样最想我听。" }),
    line("章慧琪", "……间屋。", { zh: "……那间屋。" }),
    line("章慧琪", "其实我嚟，主要系间屋。之前嗰啲……屋企、阿乐、散工——唔系假。系……怕你一听屋，就当我神经。所以先讲咗人。", { zh: "其实我来，主要是那间屋。……前面那些——家里、阿乐、零工——不是假的。是……怕你一听屋，就当我神经。所以先讲了人。" }),
    line("章慧琪", "我绕了一大圈。你听出来了吧。你……你刚才那句，就是在点这个。", { zh: "我绕了一大圈。你听出来了吧。你……你刚才那句，就是在点这个。" }),
    line("罗启明", "好。你讲屋。", { zh: "好。说说这房子。" }),
    line("章慧琪", "……讲之前，可唔可以再饮啖水。唔使你倒。我……我自己攞。", { zh: "……讲之前，可不可以再喝口水。不用你倒。我……我自己拿。" }),
    line("罗启明", "杯喺边。唔使急。", { zh: "杯子在边上。不用急。" }),
  ];
}

function clinic1House() {
  return [
    line("章慧琪", "搬入两个礼拜都好好。", { zh: "搬进来两个礼拜……其实都还好。" }),
    line("章慧琪", "房东都好人——修水喉、送糖水、收租数两遍。我当呢度系住嘅。", { zh: "房东人也好——水管坏了帮修，还送糖水，收租钱还点两遍。我就……当真把这儿当住的地方了。" }),
    line("章慧琪", "我先讲好的。唔系讨好边个。系……怕你一听坏的，就把好的全划掉。", { zh: "我先讲好的。不是在讨好谁。是……怕你一听坏的，就把好的全划掉。" }),
    line("章慧琪", "跟住……前晚开始。", { zh: "后来……从前天晚上起。" }),
    line("章慧琪", "车会自己转。窗台有细路脚印。录音有女人叫仔食饭。", { zh: "车会自己转。窗台上有小孩脚印。录音里有女人叫孩子吃饭。" }),
    line("章慧琪", "声由储物室门底来。——我……我可以一项一项拆开讲。也可以你让我停。", { zh: "声音……是从储物室门缝底下出来的。——我……我可以一项一项拆开讲。也可以你让我停。" }),
    line("章慧琪", "我讲的时候手在抖。唔系表演。", { zh: "我讲的时候手在抖。不是表演。" }),
    line("", "……"),
    line("章慧琪", "你唔信都得。我讲完，你写「焦虑」都得。", { zh: "你不信也行。我说完，你写「焦虑」也行。" }),
    line("章慧琪", "我只想有人听完。别半截就判我。……你要是已经在写了，也……也别告诉我。我怕听。", { zh: "我只想有人听完。别半截就判我。……你要是已经在写了，也……也别告诉我。我怕听。" }),
    line("罗启明", "你几时开始录。边晚第一次觉得唔对。", { zh: "你什么时候开始录的？哪一晚第一次觉得不对？" }),
    line("章慧琪", flag("called999")
      ? "八月十三水管响，我录咗，只有水。十四号夜晚车转、脚印湿。我打过九九九，佢哋问有冇人伤、有冇人入屋。冇。唔派车。房东十四号傍晚话要收回，又当冇讲过。第二朝佢问我脚湿唔湿——我只鞋系干嘅。我冇同佢讲过门底有脚印。"
      : "八月十三水管响，我录咗，只有水。十四号夜晚车转、脚印湿。房东十四号傍晚话要收回，又当冇讲过。第二朝佢问我脚湿唔湿——我只鞋系干嘅。我冇同佢讲过门底有脚印。",
      flag("called999")
        ? { zh: "八月十三水管响，我录了，只有水。十四号夜里车转、脚印是湿的。我打过九九九，他们问有没有人受伤、有没有人进屋。没有。不派车。房东十四号傍晚说要收回，又当没说过。第二天早上他问我脚湿不湿——我那双鞋是干的。我没跟他讲过门底有脚印。" }
        : { zh: "八月十三水管响，我录了，只有水。十四号夜里车转、脚印是湿的。房东十四号傍晚说要收回，又当没说过。第二天早上他问我脚湿不湿——我那双鞋是干的。我没跟他讲过门底有脚印。" }),
    line("", "他在纸上写下「干鞋」。"),
    line("章慧琪", "……你写「干鞋」。", { zh: "……你写「干鞋」。" }),
    line("罗启明", "你讲嘅，我写。", { zh: "你讲的，我写。" }),
    line("章慧琪", "……我知听起嚟假。车自己转。细路脚印。女人叫仔。我都想自己听错。", { zh: "……我知道听着像假的。车自己转、小孩脚印、女人叫孩子——我也想是自己听错了。" }),
    line("章慧琪", "但十三号只有水，十五号先开始郁。前两个礼拜唔郁。", { zh: "可十三号只有水，十五号才开始动。前两个礼拜……都不动。" }),
    line("章慧琪", "我唔系话呢个就证明有鬼。我系话……时间对唔上「我一搬进去就疯」。", { zh: "我不是说这就证明有鬼。我是说……时间对不上「我一搬进去就疯」。" }),
    line("章慧琪", "你……你可以当我对时间咬得很死。我咬着，才敢坐在这儿。", { zh: "你……你可以当我对时间咬得很死。我咬着，才敢坐在这儿。" }),
    line("罗启明", "嗯。", { zh: "嗯。" }),
    line("章慧琪", "嗯……就「嗯」？", { zh: "嗯……就「嗯」？" }),
    line("罗启明", "「嗯」有时系「我听到」。唔系「你讲完了」。", { zh: "「嗯」有时候是「我听到了」。不是「你讲完了」。" }),
  ];
}

function clinicTalk() {
  startTalk([
    ...clinic1House(),
    line("", "……"),
    line("章慧琪", "我……我带咗啲嘢。你睇唔睇。", { zh: "我……我带了点东西。你……看不看？" }),
    line("章慧琪", "唔睇都得。我可以收回去。我……我怕你一看就——算了。先问你看不看。", { zh: "不看也行。我可以收回去。我……我怕你一看就——算了。先问你看不看。" }),
    line("罗启明", "你放低。", { zh: "你先放下。" }),
    line("", "你打开日记簿，挑一样放到桌上。"),
    { goto: () => handOver(6, stepPast) },
    line("罗启明", "今日我未去过你屋。边个在场，我唔追。", { zh: "今天我没去过你那儿。谁在场，我不追问。" }),
    line("章慧琪", "周知唔知我今日嚟？", { zh: "周……知不知道我今天来？" }),
    line("章慧琪", "唔系我要告状。系……我怕佢知。又怕佢唔知。我……问完又后悔。", { zh: "不是我要告状。是……我怕他知道。又怕他不知道。我……问完又后悔。" }),
    line("罗启明", "你冇同佢讲就好。今日我都唔同佢讲。", { zh: "你没跟他说就好。今天我也不提。" }),
    line("", "笔搁在纸上。"),
    line("罗启明", "你信唔信自己听到嘅？", { zh: "你信不信自己听见的那些？" }),
    {
      prompt: "……",
      choices: [
        {
          label: "我相信有鬼。",
          then: [line("罗启明", "我哋先写你听到咩。唔好即刻判有冇。", { zh: "我们先记下你听见了什么。别马上判有还是没有。" }), ...clinicRest()],
        },
        {
          label: "我疯了。",
          then: [line("罗启明", "呢个字太懒。下星期先写：你住入去第几晚开始。", { zh: "「疯」这个字太懒。下周先写：你住进去第几晚开始的。" }), ...clinicRest()],
        },
        {
          label: "我不知道。我要一个人不把我当疯子。",
          then: [line("罗启明", "呢句我做得到。今日唔落诊断。", { zh: "这话我做得到。今天先不下诊断。" }), ...clinicRest()],
        },
      ],
    },
  ], "澄心诊室", "face");
}

function clinicRest() {
  return [
    line("", "他把笔转过来，本子推近你一点。"),
    line("罗启明", "你写。我唔改你字。", { zh: "你写。我不改你的字。" }),
    line("罗启明", "记低几时、边间房、离开几耐、边样郁咗。唔好用「好恐怖」顶数。", { zh: "记下几点、哪间房、离开多久、什么动了。别拿「好恐怖」来凑。" }),
    line("罗启明", "嗰三个字太省事，省事了就什么都看不见。", { zh: "那三个字太省事，省事了就什么都看不见。" }),
    line("罗启明", "呢个礼拜先住住。唔好对质房东。录音暂时唔好交畀佢。", { zh: "这周先住着。别跟房东对质。录音先别交给他。" }),
    line("章慧琪", "你信唔信有鬼？", { zh: "你……信不信有鬼？" }),
    line("章慧琪", "你可以笑。我……我问完就想收回。", { zh: "你可以笑。我……我问完就想收回。" }),
    line("罗启明", "今日我未听到。我信你听到嘢；有冇鬼，今日未得讲。", { zh: "今天我没听见。我信你听见了东西；有没有鬼，今天还说不了。" }),
    line("罗启明", "——听着像打太极，是吧。下星期六，同一时间。带录音，同你嗰张纸。", { zh: "——听着像打太极，是吧。下周六，同一时间。带录音，还有你那张纸。" }),
    line("章慧琪", "我想听日就嚟。呢个礼拜好长。", { zh: "我想……明天就来。这个礼拜好长。" }),
    line("章慧琪", "我说完又知道不行。我就是……怕等。", { zh: "我说完又知道不行。我就是……怕等。" }),
    line("罗启明", "听日冇位。你等一周。", { zh: "明天没位子。你等一周。" }),
    line("罗启明", "诊所日历唔认心急，只认格子。抱歉，这话不太好听。", { zh: "诊所日历不认心急，只认格子。抱歉，这话不太好听。" }),
    line("", "……"),
    line("章慧琪", "表姐叫我食药。阿乐话我神经。你系第一个未用一个字打发我嘅人。", { zh: "表姐叫我吃药。阿乐说我神经。你是第一个……没用一个字就把我打发掉的人。" }),
    line("章慧琪", "我嚟，唔止想你帮我睇病。——我……我是不是又讲多了。你可以当后半句没说。", { zh: "我来，不只是想让你帮我看病。——我……我是不是又讲多了。你可以当后半句没说。" }),
    line("", "他看了你一眼，又低头拧笔帽。"),
    line("章慧琪", "我……唔想讲唔好意思。我怕返去又一个人听。", { zh: "我……不想老说对不起。我怕回去……又一个人听那些。" }),
    line("章慧琪", "唔系要你陪我返去。我……我就是说出来。", { zh: "不是要你陪我回去。我……我就是说出来。" }),
    line("罗启明", "我未听完。你返去仲要写。", { zh: "我还没听完。你回去还得写。" }),
    { who: "", text: "他说今天只是认识。听完之前，不下结论。" },
    line("", "你看着他拧笔帽的手，有句话悬在嘴边。"),
    line("章慧琪", "姐夫有句说话……算。第一次见，唔好问。", { zh: "姐夫有句话……关于……算了。头一回见，别问。" }),
    line("章慧琪", "唔系重要到非说不可。系……我说到一半就知道不该说。", { zh: "不是重要到非说不可。是……我说到一半就知道不该说。" }),
    line("罗启明", "你想讲就讲。唔想，我唔追。", { zh: "想说就说。不想，我不追。" }),
    line("章慧琪", "……下次。", { zh: "……下次。" }),
    line("章慧琪", "真的下次。不是敷衍。是……今天把话说完，我怕回去路上又拆。", { zh: "真的下次。不是敷衍。是……今天把话说完，我怕回去路上又拆。" }),
    {
      prompt: "……",
      choices: [
        {
          label: "那你什么时候来我家。",
          then: [
            line("罗启明", "唔嚟。病人屋企，我而家只喺诊室听。", { zh: "不去。病人的家，我现在只在诊室听。" }),
            { goto: leaveClinic },
          ],
        },
      ],
    },
  ];
}

function waitWeek(when, body, btn, go) {
  S.talk = null;
  S.mode = "wait";
  S.wait = { when, body, btn, go };
  setTime(when);
  drawWait();
}

function waitBg(when) {
  if (!/8月|9月/.test(when || "")) return "";
  if (/夜/.test(when)) return lvPic("场景-夜里后座厅");
  return lvPic("场景-后座厅");
}

function drawWait() {
  const w = S.wait || {};
  clearStage();
  const bg = waitBg(w.when);
  const { desk, go } = captionShell(bg, bg && CARD_LUM[/夜/.test(w.when) ? "场景-夜里后座厅" : "场景-后座厅"]);
  desk.append(el("div", { class: "caption-text" }, [
    el("p", { class: "caption-line" }, [w.body || ""]),
    w.btn ? el("p", { class: "caption-next" }, [w.btn]) : "",
    el("div", { class: "caption-acts" }, [go("……", () => w.go && w.go())]),
  ]));
  stage.append(desk);
  renderPlaybar();
}

function leaveClinic() {
  startTalk([
    line("", "走廊椅子上的杂志仍然倒拿着。护士在翻预约表，低声叫后面的人。"),
    line("", "你没有回头。"),
    { goto: () => giveHomework(6, () => finishLevel(6)) },
  ], "澄心候诊", "face");
}

function homeAfterClinic() {
  setTime("2014年8月16日 周六 21:40");
  startTalk([
    line("", "你把出门前那两张相拿出来，对着屋里看。"),
    line("", "出门前玩具车的车头朝向窗户。进门后，车头朝向门。你还没有进厕所。"),
    line("", "出门前水龙头拧紧了，没有滴。现在已经在滴水。你没有拧过它。你把它拧紧。等了三秒，又滴下来。", { sfx: "drip" }),
    line("章慧琪", "二十一点四十。我返到。车已经转。水已经滴。我未离开客厅。", { zh: "二十一点四十。我到家了。车已经在转。水已经在滴。我……没离开过客厅。" }),
    { goto: () => keepThen(item("paper-16"), stepPast) },
    line("周", "出街？早啲休息。水喉我日头睇过。", { zh: "出门了？早点歇。水管我白天看过了。" }),
    line("", "他在楼梯口。他没有问你的鞋湿不湿。睡衣领口是干的。", { note: ["zhouDay", "他说白天看过水喉。我回来已经在滴。"] }),
    { goto: meiPhone1 },
  ], "荣汇街后座", "face");
}

function tryWatch() {
  S.tries = S.tries || {};
  S.tries.watch = true;
  setTime("2014年8月20日 周三 23:12");
  hubTalk([
    line("", "你坐在厅里，看着钟。两分钟。"),
    line("", "车没有动。水龙头没有滴。门底是干的。"),
    line("章慧琪", "二十三点十二。望住两分钟。乜都唔动。", { zh: "二十三点十二。盯了两分钟。……一样都没动。" }),
    { goto: () => maybePaper20(stepPast) },
  ], "荣汇街后座", "face");
}

function tryBath() {
  S.tries = S.tries || {};
  S.tries.bath = true;
  setTime("2014年8月20日 周三 23:17");
  hubTalk([
    line("", "你看着钟走进厕所。待了两分钟。出来之前，门底下是干的。"),
    line("", "你出来后，门底下出现一小截湿脚印，走到一半就停下了。你站在客厅里，脚印没有再往前延伸。"),
    line("章慧琪", "二十三点十七。离开两分钟。脚印先出现。我在厅里望住，佢唔动。", { zh: "二十三点十七。离开两分钟。脚印才出现。我在客厅盯着……它不动。" }),
    { goto: () => maybePaper20(stepPast) },
  ], "荣汇街后座", "face");
}

function maybePaper20(next) {
  if (S.tries.watch && S.tries.bath && !ev("paper-20")) {
    note("timed2", "望住它两分钟，它不动。离开两分钟，它先动。纸写好了。还想听他讲一句。等到星期六。");
    keepThen(item("paper-20"), next);
    return;
  }
  next();
}

HUBS.home16 = {
  time: () => (S.tries.watch || S.tries.bath ? "2014年8月20日 周三 23:20" : ev("paper-16") ? "2014年8月17日 周日" : "2014年8月16日 周六 21:40"),
  places: [
    {
      id: "hall", name: "厅", map: "rong-hall", img: pic(7, "场景-后座厅"),
      line: () => (ev("paper-16") ? "他叫我写：几时、哪间房、离开多久、哪样动了。" : "你刚进门。出门前拍了两张相。"),
      spots: () => [
        {
          title: "拿出门前的照片来比", sub: "车，同水喉。", img: pic(7, "示意-拿出门前的照片来比"),
          show: () => !ev("paper-16"),
          go: homeAfterClinic,
        },
        {
          title: "坐在厅里盯两分钟", sub: () => (S.tries.watch ? "什么都不动。" : "望住车，望住水喉。"), img: pic(7, "示意-坐在厅里盯两分钟"),
          show: () => ev("paper-16"),
          seen: () => !!S.tries.watch,
          go: () => (S.tries.watch ? showModal("盯两分钟", "试过了。望住它，它不动。") : tryWatch()),
        },
        {
          title: "电脑：发一帖", sub: () => (flag("serial1") ? "发了。" : "写低这一个星期。"), img: pic(7, "示意-电脑发帖"),
          show: () => ev("paper-16"),
          seen: () => flag("serial1"),
          go: () => (flag("serial1") ? openRental() : postFromHub("wk1")),
        },
      ],
    },
    {
      id: "bath", name: "厕所", map: "rong-bath", img: MAP_PIC + "荣汇街-厕所",
      show: () => ev("paper-16"),
      line: "后座的厕所。门底一道缝。",
      spots: () => [
        {
          title: "进厕所两分钟", sub: () => (S.tries.bath ? "出来时门底有脚印。" : "看着钟进去。"), img: pic(7, "示意-进厕所两分钟"),
          seen: () => !!S.tries.bath,
          go: () => (S.tries.bath ? showModal("离开两分钟", "试过了。离开两分钟，脚印先出现。") : tryBath()),
        },
      ],
    },
    {
      id: "door", name: "门口", map: "rong-door", img: pic(7, "场景-后座门口"),
      show: () => !!S.tries.bath,
      line: "后座门口。对着平台。",
      spots: () => [
        {
          title: "周生", sub: () => (noted("zhouTwo") ? "他说了「两分钟」。" : "他在平台上。"), img: pic(7, "示意-周生"), person: true,
          seen: () => noted("zhouTwo"),
          go: () => hubTalk([
            line("周", "你又出去？入去好快。两分钟。我当冇听见。", { zh: "你又出去了？进去挺快。两分钟。我当没听见。" }),
            line("章慧琪", "我冇叫你。", { zh: "我……没叫过你。" }),
            line("周", "旧楼。人惊就敲门。", { zh: "旧楼嘛。人一害怕就敲门。" }),
            line("", "他笑了笑，关上门。你没有告诉他纸上写的「两分钟」。", { note: ["zhouTwo", "周说「两分钟」。纸上的两分钟，我没同他讲过。"] }),
          ], "荣汇街后座", "face"),
        },
        {
          title: "门口一锅汤", sub: () => (flag("lokSoup") ? "凉了。" : "盖着，压了张字条。"), img: pic(7, "示意-门口一锅汤"),
          seen: () => flag("lokSoup"),
          go: () => hubTalk([
            line("", "手机弹出阿乐的消息：「你又不接，算了。」你没有回复。门口放着一锅凉汤，字条上写着：吃。你锁上门。", { flag: "lokSoup" }),
          ], "荣汇街后座", "face"),
        },
      ],
    },
  ],
};

function postFromHub(id) {
  if (S.mode !== "web") {
    S.paused = { mode: S.mode, talk: null, wait: null };
    if (S.mode === "night") stopNightClock();
  }
  S.pendingPost = id;
  S.mode = "web";
  S.tab = "house";
  S.screen = "post";
  draw();
}

function meiPhone1() {
  setTime("2014年8月16日 周六 22:05");
  startTalk([
    line("陈美娟", "睇完点？人斯文吗？我煮咗汤。今晚过嚟瞓。", { zh: "看完怎么样？人斯文吗？我熬了汤。今晚过来睡啊。" }),
    line("章慧琪", "佢叫我呢个礼拜先住住，记低。我唔搬。", { zh: "他让我这周先住着，记下来。……我不搬。" }),
    line("陈美娟", "有冇叫你食药？", { zh: "有没有叫你吃药？" }),
    line("章慧琪", "你一打嚟就问食药。", { zh: "你一打来就问吃药。" }),
    line("陈美娟", "我担心啦。人好唔好啊？有冇话你病？", { zh: "我担心啊。人好不好啊？有没说你病？" }),
    line("章慧琪", "冇。佢叫我写几时、边样动。未落我有病。", { zh: "没有。他让我写几点、什么动了。……没给我下病。" }),
    line("陈美娟", "你一个人我担心。食咗未。", { zh: "你一个人我放心不下。吃了没？" }),
    line("章慧琪", "食得落。我冇问题。有问题系间屋。", { zh: "吃得下。我没问题。……有问题的是那间屋子。" }),
    line("陈美娟", "下星期六再去？", { zh: "下周六还去吗？" }),
    line("章慧琪", "……去。佢话未听完。", { zh: "……去。他说……他还没听完。" }),
    line("陈美娟", "未听完就仲叫你去？……那你去啦。但唔好夜晚自己硬撑。", { zh: "还没听完就还叫你去？……那你去吧。但别夜里自己硬撑。" }),
    line("章慧琪", "我知。你唔好再问食药。", { zh: "我知道。你别再问吃药。" }),
    line("陈美娟", "……好啦。我问你食唔食得落。", { zh: "……好吧。我改问你吃得下吃不下。" }),
    line("陈美娟", "……好。你锁门。汤我听日放下门口。有事打给我。唔好打给阿乐。", { zh: "……好。你锁好门。汤我明天放门口。有事打给我。别打给阿乐。" }),
    { flag: "meiStay", goto: backToHub },
  ], "拨出 美娟", "phone", { dialout: true, contact: "美娟", number: "陈美娟" });
}


function clinic2Life() {
  return [
    line("罗启明", "一个星期。先唔讲屋。食得落？瞓得？", { zh: "过了一个星期。今天……房子先放一边。吃得下吗？睡得着吗？" }),
    line("", "……"),
    line("罗启明", "呢个星期多开过一转。唔关你。", { zh: "这周多跑了一趟。跟你没关系。——先坐。" }),
    line("章慧琪", "……多开一转。系……病人多？定系……算啦。我唔该问。", { zh: "……多跑一趟。是……病人多？还是……算了。我不该问。" }),
    line("罗启明", "坐。水喺度。", { zh: "坐。水在那儿。" }),
    line("章慧琪", "……我今日几乎唔搵到词。你先问食，我又想跳去屋。", { zh: "……我今天几乎找不到词。你先问吃，我又想跳到屋子。" }),
    line("罗启明", "食同屋，今日分开讲。先食。", { zh: "吃和屋子，今天分开说。先吃。" }),
    line("章慧琪", "饮咗表姐汤，凉咗都饮。佢叫我去瞓沙发。我冇去。", { zh: "表姐的汤我喝了，凉了也喝。……她让我去睡沙发，我没去。" }),
    line("", "她把手袋抱紧一点，又松开。"),
    line("章慧琪", "你叫我住住。我知。可我还是返去咗。唔系佢唔好。系我……一坐别人家沙发，就先想道歉。", { zh: "你让我先在那儿住着——我知道。可我还是回去了。不是她不好。是我……一坐别人家的沙发，就先想道歉。" }),
    line("罗启明", "你瘦咗。散工还去唔去。", { zh: "你瘦了。零工还去不去？" }),
    line("章慧琪", "去。展会照做。日头当没事。同事问，我都笑住话没事。", { zh: "去。展会照做。……白天就当没事。同事问，我也笑着说没事。" }),
    line("章慧琪", "夜先怕。夜里冇人问，就更怕。", { zh: "夜里才怕。夜里没人问，就更怕。" }),
    line("罗启明", "日头笑住讲无事，你笑完会唔会空一阵。", { zh: "白天笑着说没事，你笑完会不会空一阵。" }),
    line("章慧琪", "会。好似……借啖人家一句。还完要加利息。", { zh: "会。好像……借了别人一句。还完还要加利息。" }),
    line("罗启明", "加利息嗰句，你唔使在度加。", { zh: "加利息那句，你不用在这儿加。" }),
    line("", "……"),
    line("罗启明", "上次你讲到怕——连自己听嘅都唔信。这一星期，除屋之外，有冇人联络你。", { zh: "上次你说到怕——连自己听见的，都不敢信。这一周，房子以外，还有人找过你吗？" }),
    line("章慧琪", "阿乐响过两声。我唔接。表姐日日问：食咗未、瞓咗未、要唔要过来。", { zh: "阿乐打过两回……我不接。表姐天天问：吃了没、睡了没、要不要过来。" }),
    line("章慧琪", "家豪星期日留一句：你写就写，房东唔好自己查——然后返差馆。门一关，好似乜都冇发生。", { zh: "家豪星期天留了一句：你写就写，房东别自己查——然后……回局里去了。门一关，像什么都没发生。" }),
    line("罗启明", "唔接阿乐，你怕听到边句。", { zh: "阿乐的电话你不接。怕听见哪一句？" }),
    line("章慧琪", "……「你又神经」。或者沉默。沉默更糟——像默认我系错，只系懒得讲出口。", { zh: "……又是「你又神经了」。或者沉默。沉默更糟——像默认我是错的，只是懒得说出口。" }),
    line("章慧琪", "我练过接。练完又关静音。好似……一接就输。", { zh: "我练过接。练完又开静音。……好像一接就输。" }),
    line("", "……"),
    line("罗启明", "你今日几乎唔来？", { zh: "你今天……差点就不来了？" }),
    line("章慧琪", "……你点知。", { zh: "……你怎么知道。" }),
    line("罗启明", "你坐低先望门。袋口攥得好紧。", { zh: "你坐下先看门。袋口攥得很紧。" }),
    line("章慧琪", "行到楼梯停过。停咗好耐。练过一句：我没事，只系来交纸。", { zh: "走到楼梯口……停过。停了很久。我练过一句：我没事，只是来交纸。" }),
    line("章慧琪", "练到嘴里发干。入到门又想讲多啲。讲完又后悔。", { zh: "练到嘴里发干。……进了门，又想多说点。说完又后悔。" }),
    line("章慧琪", "我差点转身落楼。落咗两级又返嚟。好似……唔嚟，就冇人信纸上写嘅。", { zh: "我差点转身下楼。下了两级又回来。……好像不来，就没人信纸上写的那些。" }),
    line("罗启明", "你几岁开始习惯自己一个人顶住。", { zh: "你从几岁开始，习惯一个人扛？" }),
    line("章慧琪", "……阿妈未走之前已经好忙。问佢嘢，佢话迟啲、迟啲。", { zh: "……妈还没走的时候就已经很忙。问她什么，她都说晚点、晚点。" }),
    line("章慧琪", "走咗之后同阿嫲住。阿嫲煮粥，唔问我点解静——唔问，我反而松一口气。", { zh: "她走了之后跟奶奶住。奶奶煮粥，不问我怎么不说话——不问，我反而松一口气。" }),
    line("章慧琪", "阿嫲死咗……电话只剩表姐肯接。中学要自己搵钱。惊一张嘴就系要钱，就似累赘。", { zh: "奶奶没了……电话只剩表姐肯接。中学就得自己挣钱。怕一张嘴就是要钱……像个累赘。" }),
    line("章慧琪", "一开口，房里空气就变。我细个就识得收声。", { zh: "一开口，房间里的空气就变了。我从小就会收声。" }),
    line("罗启明", "累赘呢个字，系边个先放落你度。", { zh: "「累赘」这个字——是谁先安到你身上的？" }),
    line("章慧琪", "冇人当面讲。我自己放。", { zh: "没人当面说过。……是我自己安的。" }),
    line("章慧琪", "沙发瞓多两晚，我会先道歉：麻烦你了、占地方了。道歉完先食饭。唔道歉，嗰口饭咽唔落。", { zh: "沙发多睡两晚，我会先道歉：麻烦你了、占地方了。道完歉……才敢拿筷子。不道歉，那口饭咽不下去。" }),
    line("", "……"),
    line("罗启明", "所以你而家要证据。录音、纸、时间。你怕讲出口无人信。", { zh: "所以你现在要证据。录音、纸、时间。……你怕一说出口，就没人信。也不只是迷信。" }),
    line("章慧琪", "系。亦怕信错自己。我夜里会重听自己讲过嘅句——听语气、听停顿——睇下似唔似病人。", { zh: "对。也怕……信错自己。夜里我会重听自己说过的话——听语气、听停顿——看像不像病人。" }),
    line("章慧琪", "越听越像。越像就越唔敢日头讲。", { zh: "越听越像。越像就越不敢白天说。" }),
    line("罗启明", "你想有人听完——因为屋，定因为好耐冇人留到尾。", { zh: "你想有人听完——为了房子，还是因为好久没人听到最后？" }),
    line("章慧琪", "两样都有。屋有纸，可以摊开。人……人听到一半就去煮汤、去挂线、去叫我食药。", { zh: "两样都有。……房子有纸，可以摊开。人……人听到一半就去煮汤、去挂电话、去叫我吃药。" }),
    line("章慧琪", "留到尾的，我未试过。所以我都唔知，自己扛唔扛得住被听完。", { zh: "听完的……我还没遇上过。所以我也不知道，自己扛不扛得住被听完。" }),
    line("罗启明", "家豪关心你嘅方式系叫你停手。你点睇。", { zh: "家豪关心你的方式，是让你住手。你怎么看？" }),
    line("章慧琪", "佢关心我，亦关心你。我听落系叫我唔好搞事。唔好俾诊所添麻烦。", { zh: "他关心我，也关心你。……听着像是叫我别惹事。别给诊所添麻烦。" }),
    line("章慧琪", "我今日想讲的系屋。——你先讲，我接着听。别……先判我。", { zh: "我今天想说的是房子。——你先讲，我接着听。别……先判我。" }),
  ];
}

function clinic2() {
  setTime("2014年8月23日 周六 16:00");
  S.clinic = { visit: 2, seg: 0 };
  clinicArrival(2, () => startTalk([
    line("罗启明", "上一个时段拖咗。唔关你。今日写你嘅纸。", { zh: "上一个时段拖了。跟你没关系。今天写你的纸。——你带了吗？" }),
    line("", "他看了一眼关着的门，又把视线收回来。"),
    ...clinic2Life(),
    line("", "……"),
    line("章慧琪", "十六号晚我返到，车已经转咗。我未离开客厅。水龙头我未拧，已经滴。", { zh: "十六号晚上我到家……车已经在转了。我没离开客厅。水龙头我没拧，已经在滴。" }),
    line("章慧琪", "我企喺度，唔敢先郁。郁咗，就好似系我搞出嚟。", { zh: "我站在那儿，不敢先动。一动……就像是我搞出来的。" }),
    line("章慧琪", "二十号我入厕所两分钟。出来门底先有湿脚印。我在厅里望住，佢唔动。像……等我走开。", { zh: "二十号我进厕所两分钟。出来……门底下才有湿脚印。我在客厅盯着，它不动。像……在等我走开。" }),
    line("", "你把纸从日记簿里拿出来。"),
    { goto: () => handOver(8, stepPast) },
    line("章慧琪", "我食得、瞓得、散工都去。我冇问题。有问题系间屋。", { zh: "我吃得下、睡得着、零工也照去。我没问题。……有问题的是那间屋子。不是我。你别先写我。" }),
    line("章慧琪", "呢卷我日日听。唔系为吓自己。今日可以讲给你听，我先听熟。听熟了，先敢交出来。", { zh: "这卷我天天听。不是为了吓自己。……今天能讲给你听，是我先听熟了。听熟了，才敢交出来。" }),
    line("罗启明", "你讲屋。唔好讲我。", { zh: "你说房子。别扯到我。" }),
    line("章慧琪", "……我又拉你。我……唔系故意。", { zh: "……我又拉到你了。我……不是故意。" }),
    line("罗启明", "拉到我我会讲。你未拉到。", { zh: "拉到我我会说。你还没。" }),
    line("", "他戴上耳机听录音，听完才摘下来。"),
    line("罗启明", "声线稳。像留过言，唔像当场叫你。你话声从门底来。我冇站过门底。", { zh: "声音很稳。像留过言，不像当场叫你。你说声从门底下来。——我没在门底下站过。" }),
    line("", "听到「返嚟食饭」，他的手伸向抽屉缝，又收回来。"),
    line("章慧琪", "咁算有鬼？你听完了，仲系唔敢讲有？", { zh: "那……就算有鬼？你听完了，还是不敢说有？" }),
    line("罗启明", "我而家做现实检验：心里信嘅，同纸上写到嘅，分两栏写。别混埋一齐。", { zh: "我现在做现实检验——说白了：把心里信的，跟纸上写到的，分两栏写。别混在一块儿。" }),
    line("罗启明", "纸写：离开房间先动。厅里望住，就唔动。两栏要对得上，我先往下写。", { zh: "纸上写：离开房间才动；在客厅盯着，就不动。这两栏要对得上，我才往下写。" }),
    line("", "他把你讲过的话一句句写在卡上，摆到桌面。"),
    { goto: () => sortPiles(stepPast) },
    line("章慧琪", "所以你信纸，唔信鬼。你只信能摊开嗰一半。", { zh: "所以……你信纸上的，不信鬼。……你只信能摊开的那一半。" }),
    line("罗启明", "纸我信。鬼我未信。你日日听呢卷，系过度警觉——白话讲：神经绷太紧，听得太密，有时会把水滴、风声听成叫人。", { zh: "纸我信。鬼我还没信。你天天听这卷，是过度警觉——白话讲：神经绷太紧，听得太密，有时会把水滴、风声听成人叫。" }),
    line("罗启明", "亦可以真系录音机。我未可以拣。定不了，就唔假装已经定了。", { zh: "也可能真是录音机。我还定不了。定不了，就不假装已经定了。" }),
    line("", "纸上「离开两分钟」那句他看了很久。圆珠笔悬在空白处，大约两分钟，没有落下去。"),
    line("", "他把耳机线慢慢绕回盒子里。"),
    line("罗启明", "我停喺呢度。若写落「有人等你离开」，就要写边个人、点等。白房听唔到门底下。", { zh: "「离开两分钟」那句，我看了很久。笔悬着，没落下去。……我写不下「有人等你离开」。要写，就得写是哪个人、怎么等的。诊室听不到门底下。" }),
    line("罗启明", "我喺度听唔到，就不能替你写实。", { zh: "我在这儿听不到，就不能替你写实。" }),
    { note: ["clinicDoubt", "他搁下笔。现实检验：信纸，未信鬼。过度警觉他说成听太密会把旧楼听成叫人。白房听唔到门底下。"] },
    line("罗启明", "呢个礼拜，有一夜唔好开录音。仍然写纸。看看嘢会唔会自己动？", { zh: "这周有一晚别开录音。纸还是照写。看看东西会不会自己动。" }),
    line("罗启明", "另外写低：搬入头两个礼拜，边样唔会动，边样系十五号先开始。下星期六带来。——少听一晚，唔系罚你，系对照。", { zh: "另外记下：搬进来头两个礼拜，哪些不会动，哪些是十五号才开始。下周六带来。——少听一晚，不是罚你，是对照。" }),
    { goto: () => giveHomework(8, stepPast) },
    line("章慧琪", "少听一晚，我可以试。如果你叫我当自己有病，我走。我冇问题。", { zh: "少听一晚……我可以试。要是你让我当自己有病，我走。我没问题。" }),
    line("章慧琪", "如果你下星期都话系我头脑，我就冇地方去。这一周我都是靠「星期六见到你」过的。", { zh: "要是你下周还说是我脑子的事……我就没地方去了。……这一周我靠的就是「周六能见到你」。" }),
    line("章慧琪", "别把呢句听成撒娇。系……我只有这一根。", { zh: "别把这句话听成撒娇。是……我只有这一根。" }),
    line("", "他对上你的眼，自己先看开。"),
    line("罗启明", "我未叫你有病。我未可以拣。你靠的是约——唔系靠我这个人。你仍然要写。", { zh: "我没说你有病。我还定不了。你靠的是这个约——不是靠我这个人。你还是得写。" }),
    line("章慧琪", "你信纸，我信你会听。两样唔同。", { zh: "你信纸，我信你会听。这两样……不是一回事。" }),
    line("章慧琪", "我听你话写，返去关录音，车仍然动。我唔知边样系医，边样系你肯为我留低。分唔清嗰阵，我更慌。", { zh: "我听你的话写，回去关了录音，车还是动。我分不清哪样是看病，哪样是你肯为我留下。……分不清的时候，我更慌。" }),
    line("罗启明", "我留低系听。有鬼定冇鬼，今日替你拣唔到。——定唔到，我都唔赶你走。", { zh: "我留下是为了听。有鬼还是没鬼，今天替你定不了。——定不了，我也不赶你走。" }),
    line("", "你看着他的手，没看他的眼。"),
    line("章慧琪", "上次咽住嗰句，我仍然未问得出口。今日都……问唔出口。", { zh: "上次咽回去的那句……我还是问不出口。今天也……问不出口。" }),
    line("罗启明", "我唔追。你准备好先讲。——未准备好，带住走都得。", { zh: "我不追。你准备好了再说。——没准备好，就带着走也行。" }),
    ...(flag("serial1") ? [
      line("", "你低下头，声音很细。"),
      line("章慧琪", "我喺网上写咗一句……星期六我会再去。冇写你名。唔好问边个版。", { zh: "我在网上写了一句……星期六我还会再去。没写你的名字。……别问哪个版。问了我也不答。" }),
      line("章慧琪", "写完又想删。删唔成……好似删咗就冇人知我仲会嚟。", { zh: "写完又想删。删不成……好像删了就没人知道我还会来。" }),
      line("", "他对上你的眼，自己先看开。"),
      line("罗启明", "我唔上网睇你写咩。你带纸来就得。——纸够了。", { zh: "我不上网翻你写什么。你带纸来就行。——纸够了。" }),
    ] : []),
    { note: ["clinic2", "第二次。他信我写的时间，未信鬼。这周他多跑了一趟，说不关我。"], goto: clinicDoorChen },
  ], "澄心诊室", "face"));
}

function clinicDoorChen() {
  setTime("2014年8月23日 周六 17:10");
  startTalk([
    line("", "诊室楼下，陈家豪靠在门边，手里一只便当。他看了电梯口那个侧脸一眼，没有说话。"),
    line("陈家豪", "快返去。", { zh: "赶紧回去。" }),
    line("章慧琪", "你……在等？", { zh: "你……在等？" }),
    line("陈家豪", "路过。便当……", { zh: "路过。便当……" }),
    line("", "……"),
    line("陈家豪", "你面色。", { zh: "你脸色。" }),
    line("章慧琪", "……我未讲完。", { zh: "……我还没讲完。" }),
    line("陈家豪", "讲完就走。唔好……唔好坐太耐。", { zh: "讲完就走。别……别坐太久。" }),
    line("章慧琪", "……姐夫。", { zh: "……姐夫。" }),
    line("陈家豪", "汤美娟放咗。你——门锁好。", { zh: "汤美娟放了。你——门锁好。" }),
    line("", "他把便当往前一递，像突然想起手里还有东西。"),
    line("陈家豪", "食咗未。你……", { zh: "吃了没。你……" }),
    line("", "他顿住。半句咬回去。"),
    line("陈家豪", "……楼下外卖多送。佢成日唔记得。", { zh: "……楼下外卖多送。他老是不记得。" }),
    line("", "他转过去，声音压低，只给罗启明。"),
    line("陈家豪", "唔好上门。", { zh: "别上门。" }),
    line("陈家豪", "听就得。屋——唔好去。", { zh: "听就行。屋——别去。" }),
    line("", "罗启明接过饭盒，没有解释。你听见了。姐夫不看你。"),
    line("陈家豪", "走啦。", { zh: "走吧。" }),
    { note: ["bento", "楼下便当。姐夫叫我快回去，又低声叫他不要上门。像怕他真的会去。"], goto: () => finishLevel(8) },
  ], "澄心楼下", "face");
}

function recorderPanel() {
  closeModal();
  const off = !!S.recOff;
  // B：不要白盒子，用和场景「做什么」同一条便条底栏
  const box = el("div", {
    class: "scene-actions fork rec-fork",
    onclick: (e) => e.stopPropagation(),
  }, [
    el("p", { class: "hub-hint" + (off ? " ready" : "") }, [
      off ? "录音已关。灯还开着。" : "录音开着。十四号之后，每晚都开。",
    ]),
    forkChoice(
      off ? "✓" : "关",
      "scene-act" + (off ? " done" : " primary"),
      () => {
        if (off) return;
        S.recOff = true;
        recorderPanel();
      },
      off ? "已经关掉" : "关掉录音"
    ),
    forkChoice(
      "洗",
      "scene-act" + (off ? " primary" : " ask-btn grey"),
      () => {
        if (!off) return;
        closeModal();
        nightNoRec();
      },
      "去洗脸"
    ),
    forkChoice("返", "scene-act", () => afterModalClose(), "先不"),
  ]);
  S.modal = el("div", {
    class: "modal scene rec-dock",
    id: "game-modal",
    onclick: () => afterModalClose(),
  }, [box]);
  stage.append(S.modal);
}

function nightNoRec() {
  setTime("2014年8月23日 周六 22:10");
  hubTalk([
    line("", "你去洗脸。水是冷的。"),
    line("", "你把手机留在茶几上，自己按掉录音键，进浴室洗脸。门开着一条缝，厅和茶几同一视线。回来时，玩具车在地上，车头朝储物室。手机仍在茶几，录音键仍然是关着的。"),
    line("章慧琪", "我听你讲。冇开录音。车仍然动。我冇声可以交。", { zh: "我听你的。……没开录音。车还是动。我……交不出声音来。" }),
    { note: ["noRec", "二十三号晚没有开录音。车仍然走。我想打给他。星期六才准。"], goto: () => keepThen(item("paper-norec"), stepPast) },
  ], "荣汇街后座", "face");
}

function finishCompare() {
 keepThen(item("paper-30"), () => afterModalClose());
}

HUBS.norec = {
  time: () => (ev("note-meiwater") ? "2014年8月27日 周三 夜" : ev("note-notsaid") ? "2014年8月26日 周二" : ev("paper-norec") ? "2014年8月24日 周日" : "2014年8月23日 周六 22:10"),
  places: [
    {
      id: "hall", name: "后座", map: "rong-hall", img: () => (ev("paper-norec") ? pic(9, "场景-后座厅") : pic(9, "场景-夜里后座厅")),
      line: () => (ev("paper-norec") ? "他叫我写：头两个礼拜，同十五号之后。" : "他叫我有一夜不开录音。"),
      spots: () => [
        {
          title: "录音键", sub: () => (ev("paper-norec") ? "那一夜关着。" : "开着。"), img: pic(9, "示意-录音键"),
          seen: () => ev("paper-norec"),
          go: () => (ev("paper-norec") ? showModal("录音", "二十三号那夜是关着的。车仍然走。") : recorderPanel()),
        },
        {
          title: "水龙头", sub: () => (ev("note-meiwater") ? "表姐听到了。" : "又在滴。"), img: pic(9, "示意-水龙头"),
          show: () => ev("note-notsaid"),
          seen: () => ev("note-meiwater"),
          go: () => {
            sfx("drip");
            if (ev("note-meiwater")) showModal("水龙头", "拧紧，三秒，又滴。");
            else meiHearsWater();
          },
        },
        {
          title: "电脑：发一帖", sub: () => (flag("serial2") ? "发了。" : "第二帖。"), img: pic(9, "示意-电脑发帖"),
          show: () => ev("paper-norec"),
          seen: () => flag("serial2"),
          go: () => (flag("serial2") ? openRental() : postFromHub("wk2")),
        },
      ],
    },
    {
      id: "mei", name: "美娟家", map: "mei", img: pic(9, "场景-美娟家"),
      show: () => ev("paper-norec"),
      line: () => (ev("note-notsaid") ? "星期日来过。汤推到我面前。" : "8月24日，星期日。表姐煮了饭。姐夫也在。"),
      spots: () => [
        {
          title: "午饭", sub: () => (ev("note-notsaid") ? "吃过了。" : "汤在桌上。"), img: pic(9, "示意-午饭"),
          seen: () => ev("note-notsaid"),
          go: () => (ev("note-notsaid") ? showModal("美娟家", "汤推到我面前。我没有留宿。") : sundayMeal()),
        },
      ],
    },
  ],
  actions: () => [
    {
      mark: "对",
      label: () => (ev("paper-30") ? "对照纸（写好了）" : "对照纸（" + compareDone().length + "／4）"),
      primary: true,
      // 关录音、表姐听水都做完再写，保证右栏材料齐
      show: () => ev("paper-norec") && ev("note-meiwater"),
      done: () => ev("paper-30"),
      go: () => (ev("paper-30") ? showClueModal(item("paper-30"), { canFile: false }) : openCompare(finishCompare)),
    },
  ],
};

function sundayMeal() {
  setTime("2014年8月24日 周日 13:10");
  startTalk([
    line("陈美娟", "你瘦。食。今晚留低。", { zh: "你瘦了。吃。今晚留下。" }),
    line("陈家豪", "阿明叫你写，你就写。房东你唔好自己查。佢话你精神唔太好，你听佢就得。我返差馆。", { zh: "阿明叫你写，你就写。房东——别自己查。他说你精神不太好，你听他就行。我回局里。" }),
    line("章慧琪", "佢冇咁讲。", { zh: "他……没这么讲。" }),
    { goto: () => keepThen(item("note-notsaid"), stepPast) },
    line("陈家豪", "你听医生。唔好自己查。", { zh: "听医生的。别自己查。" }),
    line("陈家豪", "佢唔适合深交。你唔好当自己特别。", { zh: "他不适合深交。你别当自己特别。" }),
    line("章慧琪", "你唔好咁讲佢。", { zh: "你别这么讲他。" }),
    line("", "他走了。美娟没有再追问那句话，只把汤推到你面前。"),
    line("章慧琪", "我返去。星期六要有嘢讲。", { zh: "我回荣汇街了。星期六诊所，我要有东西讲。" }),
    line("陈美娟", "信不信都要食饭。门锁好。", { zh: "信不信鬼都得吃饭啊。门锁好，听见没？" }),
    { note: ["meiMeal", "姐夫只留一句：听他写，别查房东。"], goto: () => { S.hub.at = "hall"; backToHub(); } },
  ], "美娟家", "face");
}

function meiHearsWater() {
  setTime("2014年8月27日 周三 22:40");
  startTalk([
    line("", "水龙头又滴水。你把它拧紧。手机响了，是美娟打来的。"),
    { goto: meiWaterCall },
  ], "荣汇街后座", "face");
}

function meiWaterCall() {
  startTalk([
    line("陈美娟", "你屋企漏水？我听到。你过嚟瞓。", { zh: "你那儿漏水？我电话里听见了。过来睡，别硬撑。" }),
    line("章慧琪", "我拧紧咗。你听到就好。你当间屋有事，已经好好。我留低。", { zh: "水龙头我拧紧了。你听见就好……你肯当这屋子有事，已经够了。我留下。" }),
    { note: ["meiWater", "表姐在电话里听到滴水。她听到的是水，不是阿轩。"], goto: () => keepThen(item("note-meiwater"), backToHub) },
  ], "来电 美娟", "phone", { incoming: true, contact: "美娟", number: "陈美娟" });
}

function clinic3() {
  setTime("2014年8月30日 周六 16:00");
  S.clinic = { visit: 3, seg: 0 };
  clinicArrival(3, () => startTalk([
    line("罗启明", "对唔住。上一个号又拖过。今日听你。你想从边度起都行，我唔催。", { zh: "抱歉。上一个号又拖了。今天听你说——你想从哪儿起都行，我不催。" }),
    line("", "抽屉缝开着一点。节拍器还在，摆杆旁边压着一封折好的信，封口朝里，回形针卡住。"),
    line("", "他伸手把抽屉推上，没有解释。你没有问。"),
    { note: ["refEdge", "抽屉里压着一封未开的信。像转介，他没让我看。上一个号又拖过时。"] },
    line("", "诊室静了几秒。窗外巴士经过，玻璃微微震。"),
    line("章慧琪", "……上个号拖过，你仲留低。我知你忙。我仍然等。", { zh: "……上一个号拖了，你还是留下了。我知道你忙。我还是等了。" }),
    line("罗启明", "约系约。拖过唔系赶你走。", { zh: "约就是约。拖了不是赶你走。" }),
    line("", "你把对照纸放到桌上：左边头两个礼拜，右边十五号之后。纸角有一点折痕，像在等电梯时捏过。"),
    { goto: () => handOver(10, stepPast) },
    line("罗启明", "坐。头两次你交人。今日我想再入少少——你愿意就讲，不愿意就讲屋。你定。", { zh: "坐。头两次你多在讲别人怎么待你。今天我想再进一点——愿意就说你自己；不愿意，就说屋子。你定。" }),
    line("", "你看着他的手，没看他的眼。手指在膝上收了一下，又松开。"),
    line("章慧琪", "……我试。今日坐低，好似冇咁惊。可以说少少。唔好逼我讲晒。", { zh: "……我试试。今天坐下来，好像没那么怕。……可以说一点。别逼我说完。" }),
    line("罗启明", "唔逼。讲到边度停，就停。", { zh: "不逼。讲到哪儿停，就停。" }),
    line("章慧琪", "……你今日讲「你定」。上两次你多系问。", { zh: "……你今天说「你定」。前两次你多是问。" }),
    line("罗启明", "今日你已经坐得低。我就放慢。", { zh: "今天你已经坐得低了。我就放慢。" }),
    line("章慧琪", "……我想先讲胸口。讲完再讲屋都得。", { zh: "……我想先说胸口。说完再说屋子都行。" }),
    line("罗启明", "夜里你重听自己，觉得似病人嘅时候，你身体边度先紧。", { zh: "夜里你反复听自己，觉得像病人的时候——身体哪儿先紧？" }),
    line("章慧琪", "胸口。先系呢度，好似有人按住。然后我会去拧水龙头，证明水是真的。水滴，我就松一松。水唔滴，我就更惊系我。", { zh: "胸口。先是这儿，像有人按住。然后我会去拧水龙头，证明水是真的。滴了，我就松一点；不滴……我就更怕，是我自己在病。" }),
    line("罗启明", "拧完之后，你会企喺边度几耐。", { zh: "拧完之后，你会在那儿站多久？" }),
    line("章慧琪", "……唔知。有时等到再滴一次。有时听到自己呼吸先走。走咗又返去听电话录音。", { zh: "……不知道。有时等到再滴一次。有时听见自己呼吸才走开。走开了，又回去听电话录音。" }),
    line("罗启明", "你有冇一次，几乎信咗「系我」。", { zh: "有没有那么一次，几乎信了——「是我」？" }),
    line("章慧琪", "有。二十三号关录音，车仍然动，我松过。跟住我又想：会唔会系我瞓着咗唔记得自己动过。我未敢同表姐讲呢句。只敢坐喺呢度同你讲。", { zh: "有。二十三号我按你说的关了录音，车还在动，我松过一口气。跟着又想：会不会是我睡着了，自己动过却不记得。……这句我还没敢跟表姐说。只敢坐在这儿跟你说。" }),
    line("罗启明", "点解唔讲。", { zh: "为什么不说？" }),
    line("章慧琪", "我在沙发后听过佢同家豪讲。声好细：「佢又咁。」我当听错。听错都够。我唔想再做「又咁」嗰个——尤其当着你。", { zh: "我在沙发后面听过表姐跟家豪讲，声音很轻：「她又这样。」我当听错了。听错都够了。我不想再当那个「又这样」的人——尤其当着你。" }),
    line("", "……"),
    line("章慧琪", "我讲完呢句，已经好似讲漏咗一样。你当我冇讲都得。", { zh: "我说完这句，已经像说漏了一样。你当我没说也行。" }),
    line("罗启明", "我听到。唔当冇。亦唔急住写病。", { zh: "我听到了。不当没听见。也不急着写病。" }),
    line("章慧琪", "……你讲「唔当冇」。我……我许久没听过。", { zh: "……你说「不当没听见」。我……我好久没听过。" }),
    line("罗启明", "你讲出口，我就留低。", { zh: "你说出口，我就留低。" }),
    line("罗启明", "美娟同阿乐，有冇一次听完你没叫出声嘅部分。", { zh: "美娟跟阿乐——有没有一次，听完你没喊出来的那部分？" }),
    line("章慧琪", "……冇。阿乐听十秒就要我睇医生。表姐听完煮汤、叫食药、叫我去沙发。都系为我好。我听着像……我已经坏咗，佢哋只系收拾。我好想做个容易嘅亲人。容易就唔使解释。", { zh: "……没有。阿乐听十秒就要我看医生。表姐听完煮汤、叫吃药、叫我去睡沙发——都是为我好。可我听着像……我已经坏了，他们只是在收拾。我好想当个好相处的亲人。好相处，就不用解释。" }),
    line("罗启明", "你没有坏。你系一个人听到太多，又无人同你对齐。想做容易，同想被听完，撞埋一齐。", { zh: "你没有坏。你是一个人听到太多，又没人跟你对齐。想好相处，又想被人听完——这两样撞到一块儿了。" }),
    line("章慧琪", "你今日肯听呢啲……我先敢坐耐啲。上两次我仲系半句半句交。", { zh: "你今天肯听这些……我才敢多坐一会儿。前两次我还是半句半句地交。" }),
    line("罗启明", "今日你定速。美娟打过给你？话听到水？", { zh: "今天你定速。美娟打过给你？说听见水声？" }),
    line("章慧琪", "佢听到水声。叫我过去。我冇去。留低先有人信间屋有事。……你会信嘅吧？我系……靠呢个过嚟嘅。", { zh: "她电话里听见水声，叫我过去。我没去。留下，才有人信这屋子有事。……你也会信的吧？我是……靠这个过来的。" }),
    line("罗启明", "家豪有冇再打电话。", { zh: "家豪后来还有没有打电话？" }),
    line("章慧琪", "冇。佢上次已经叫我唔好查房东。佢讲完就走。我护你嗰句，佢当冇听见。", { zh: "没有。他上次已经叫我别查房东。说完就走。我护你的那句，他当没听见。" }),
    line("罗启明", "好。你讲这一周。我听。纸上有嘅，你用嘴再对一次都得。", { zh: "好。你讲这一周。我听。纸上有的，你用嘴再对一遍也行。" }),
    line("章慧琪", "二十三号晚我听你讲，冇开录音。我去洗面。返来车在地上。我冇声可以交。二十七号表姐打电话，水声她听到。两样我都写咗。", { zh: "二十三号晚我听你的，没开录音。我去洗脸，回来玩具车在地上。我没有声音可以交。——二十七号表姐打电话，水声她听见了。这两件事，我都写在纸上了。" }),
    line("章慧琪", "头两个礼拜车唔转，冇湿脚印，水管响，录音只有水。十五号起车会转，童鞋印系湿嘅，周问我脚湿唔湿——我嘅鞋系干嘅。水龙头拧紧，大约三秒再滴。", { zh: "头两个礼拜车不转，没有湿脚印，水管响，录音只有水。十五号起车会转，童鞋印是湿的，周问我脚湿不湿——我的鞋是干的。水龙头拧紧，大约三秒再滴。" }),
    line("罗启明", "水声有第二个人听到。呢个我写低。听到水，唔等于听到叫人。你拧紧，另一头仍然听到。", { zh: "水声有第二个人听见——这个我记下。听见水，不等于听见叫人。你拧紧了，她那头仍然听见。" }),
    line("", "他把笔帽点了两下纸边，没有盖住你写的字。"),
    line("罗启明", "我而家想做减少暴露：少接触叫你惊嘅声，先帮你瞓，查间屋先放一放。你日日听、日日记，系安全行为。你以为做完就安心，其实越听越惊。药你可以唔食。下星期我可以只做你自己。", { zh: "我现在想做减少暴露：少碰让你怕的声音，先帮你睡，查这间屋先放一放。你天天听、天天记，是安全行为——以为做完就安心，其实越听越怕。药你可以不吃。下星期我可以只做你自己。" }),
    line("", "……"),
    line("章慧琪", "少听我已经试过。你讲到尾，仍然觉得有问题嘅系我。", { zh: "少听我已经试过。……你说到最后，到底还是觉得有问题的是我。好听的词，还是把我当病人。" }),
    line("章慧琪", "我想你信屋。你话帮我瞓。我听落系叫我信自己有問題。好似表姐，好似阿乐。", { zh: "我想你信屋子。你说帮我睡——我听着像是叫我先承认自己有病。像表姐，像阿乐。" }),
    line("章慧琪", "三个星期六我交纸、交声、交胸口边度紧。你仍然先医我。", { zh: "三个星期六我交纸、交声音、交胸口哪儿紧。你还是先医我。" }),
    line("章慧琪", "你都唔信。", { zh: "你也不信。" }),
    {
      prompt: "……",
      choices: [
        {
          label: "你同表姐、同阿乐一样。",
          flag: "fought3",
          then: [
            line("章慧琪", "你用好听的字。你仍然觉得有问题嘅系我。", { zh: "你用好听的字。骨子里还是觉得，有问题的是我。" }),
            line("章慧琪", "佢哋煮汤叫食药。你写安全行为。字唔同。我听落一样。", { zh: "他们煮汤叫吃药。你写安全行为。字不一样。我听着一样。" }),
            ...clinic3Break(),
          ],
        },
        {
          label: "我今晚返去。你当我又讲大话。",
          flag: "fought3",
          then: [
            line("章慧琪", "我等了三个星期六。十六号你话未听完。二十三号你叫我试一晚。我试咗。车仍然动。", { zh: "我等了三个星期六。十六号你说还没听完。二十三号你叫我试一晚——我试了，车仍然动。我照你的做，你还是先医我。" }),
            line("章慧琪", "我照你嘅做。你仍然当我系病人。咁我今晚返荣汇街，你当我又讲大话都得。", { zh: "我照你的做。你还是当我是病人。那我今晚回荣汇街——你当我又说谎也行。" }),
            ...clinic3Break(),
          ],
        },
      ],
    },
  ], "澄心诊室", "face"));
}

function clinic3Break() {
  return [
    line("章慧琪", "你不来，我就只剩病人。", { zh: "你不来荣汇街，我就只剩一个病人。只剩这个名。星期六……我也没得靠了。" }),
    line("", "你说完立刻把视线收回来。声音是裂的，没有摔门走成。"),
    line("罗启明", "我未话你讲大话。", { zh: "我没说你在说谎。" }),
    line("", "他没有马上接话。「周开口就问我脚湿不湿」那一行，他看了两遍。"),
    line("罗启明", "鬼唔使等你离开房间先动。亦唔使问你只鞋。", { zh: "这句鞋干不干——纸上我读了两遍。鬼不用等你离开房间才动，也不用问你的鞋干不干。" }),
    line("章慧琪", "所以系人？", { zh: "所以是人干的？" }),
    line("罗启明", "更像人。鉴别就系分开睇：惊、旧楼、有人装——三样今日都讲到。我未可以写边个。", { zh: "更像人。鉴别就是分开看：你怕、旧楼、有人装——三样今天都讲到了。我还写不出是谁。" }),
    line("", "他说到「更像人」时，手指碰到抽屉缝，没有拉开。"),
    line("罗启明", "声从储物室来，定从窗口来，白房分唔到。你二十三号冇录音，我更加分唔到。", { zh: "声从储物室来，还是从窗口来，白房里分不清。你二十三号没录音，我更分不清。" }),
    line("章慧琪", "人装，我信一半。屋，我仍然信。", { zh: "人装，我信一半；屋子，我仍然信。" }),
    line("章慧琪", "你话更像人——咁你仲系要先医我？定系你终于肯望间屋。", { zh: "你说更像人——那你还是要先医我？还是你终于肯看这间屋子。" }),
    line("罗启明", "今日我写低三样分开。未写你有病。亦未写边个人。", { zh: "今天我记下三样分开看。没写你有病。也没写是哪个人。" }),
    line("章慧琪", "那你来看。你来，我才……站得住。", { zh: "那你来荣汇街看。你来，我才……站得住。" }),
    line("罗启明", "上门唔系治疗。病人屋企，医生唔该夜入去。写进病历会俾人问。我知。但我仲未准备去。", { zh: "上门不是治疗。病人家里，医生不该夜里进。写进病历会给人问。我知道。——但我还没准备好。" }),
    line("", "他把纸推回到你面前，手指停在「周问脚湿」那一行旁边，没有盖住你写的字。"),
    line("罗启明", "下星期六，同一时间。纸仍然要带。多写呢个星期：车几转、你几时喺边间房、水喉几耐滴一次。我谂一星期。唔系你叫，我就去。", { zh: "下星期六，同一时间。纸还是要带。多写这个星期：车转了几下，你什么时候在哪间房，水龙头多久滴一次。我再想一星期。不是你一叫，我就上门。" }),
    { goto: () => giveHomework(10, stepPast) },
    line("章慧琪", "你肯来，我高兴是你来。不只是有人站我这边。系你。第二个人站呢边……唔够。", { zh: "你肯来，我高兴的是你来——不只是有人站我这边。是你。别的人站这边……不够。" }),
    line("罗启明", "你唔好把高兴放在我身上。我未答应上门。", { zh: "你别把高兴放在我身上。我还没答应上门。" }),
    line("", "诊室静了好一会儿。空调声忽然很大。"),
    line("章慧琪", "……我钟意你。你肯听。我唔敢讲信屋，但系你肯听。我讲漏咗。你当冇听见都得。——别停诊就行。", { zh: "……我喜欢你。你肯听。我不敢说你信屋子，可是你肯听。我说漏了。你当没听见也行。——别停诊就行。" }),
    line("", "你说漏了那句之后，没有立刻收回。只是把视线钉在纸边。"),
    line("章慧琪", "仲有一句。关于你自己。第三次都未敢问。问医生自己，好似抢你嘅诊室。", { zh: "还有一句，关于你自己。第三次都还没敢问。……问医生自己，好像抢你的诊室。" }),
    line("罗启明", "你唔使今日问。", { zh: "你不用今天问。" }),
    line("章慧琪", "……好。我带住走。下星期六再嚟。", { zh: "……好。我带着走。下星期六再来。" }),
    line("", "他没有看你，把门把手上的挂牌翻正。"),
    line("罗启明", "下星期六。带纸。", { zh: "下星期六。带纸。" }),
    { note: ["clinic3", "第三次。他先问美娟和家豪，再要医我。减少暴露、安全行为，他讲得清楚。我信可以少听，不信病在我。我崩了。他读了两次那句鞋，说更像人，三样分开睇。人装我信一半，屋我仍然信。他说再等一个星期。我说漏了：我喜欢他。他没应那句。"], goto: () => finishLevel(10) },
  ];
}

function callMingOffHours() {
  setTime("2014年8月31日 周日 23:40");
  startTalk([
    line("罗启明", "章小姐。纸呢个星期写咗未。", { zh: "章小姐。这星期的纸写了没有？" }),
    line("章慧琪", "写咗。车又转。你来。", { zh: "写了。车又转了。你来。" }),
    line("罗启明", "唔好再打。一周一次。下星期六先讲。", { zh: "别再打了。一周一次。下星期六再说。" }),
    line("", "他挂得很干净。"),
    { note: ["offhours", "他先问纸，然后叫我不要再打。一周一次，下星期六才讲。"], goto: backToHub },
  ], "拨出 罗启明", "phone", { contact: "罗启明", number: "澄心／私人", dialout: true });
}

function nightBeforeTue() {
  setTime("2014年8月31日 周日 23:20");
  startTalk([
    line("", "玩具车又自己转了一次。"),
    { goto: callMingOffHours },
  ], "荣汇街后座", "face");
}

function nightBeforeTueZhou() {
  setTime("2014年8月31日 周日 23:50");
  startTalk([
    line("周", "下星期六，又有人上嚟？我煮糖水。", { zh: "下星期六，又有人上来？我煮糖水。" }),
    line("章慧琪", "我冇同你讲。", { zh: "我没跟你讲过有人来。" }),
    line("周", "你锁门。", { zh: "你把门锁好。" }),
    line("", "他笑了笑。领口是干的。", { note: ["zhouTue", "周知道下星期六又有人来，还说要煮糖水。我没同他讲过。"] }),
    { goto: () => keepThen(item("note-zhoutue"), backToHub) },
  ], "荣汇街楼梯口", "face");
}

function meiTue() {
  hubTalk([
    line("陈美娟", "下星期六佢真的再去？", { zh: "下星期六他真的再去诊所？……你吃了没？汤我留着，凉了也喝。" }),
    line("章慧琪", "佢话会听。我信约。", { zh: "他说会听。我信这个约。", flag: "meiTue" }),
  ], "来电 美娟", "phone", { incoming: true, contact: "美娟", number: "陈美娟" });
}

HUBS.week = {
  time: () => (ev("paper-06") ? "2014年9月5日 周五 夜" : noted("offhours") ? "2014年9月1日 周一" : "2014年8月31日 周日 夜"),
  places: [
    {
      id: "hall", name: "后座", map: "rong-hall", img: () => (noted("offhours") ? pic(11, "场景-后座厅") : pic(11, "场景-夜里后座厅")),
      line: () => (noted("offhours")
        ? "他叫我不要打。楼梯口周好像知道有人来。日历三天点开就够。"
        : "8月31日夜。玩具车又自己转了一次。"),
      spots: () => [
        {
          title: "玩具车又转了", sub: () => (noted("offhours") ? "我打过给他。" : "打给他？"), img: pic(11, "示意-玩具车又转了"),
          seen: () => noted("offhours"),
          go: () => (noted("offhours") ? showModal("电话", "他叫我不要再打。一周一次。") : nightBeforeTue()),
        },
        {
          title: "日历：九月头一个礼拜", sub: () => (ev("paper-06") ? "补充纸写好了。" : "点开三天就够。"), img: pic(11, "示意-日历九月头一个礼拜"),
          show: () => noted("offhours"),
          seen: () => ev("paper-06"),
          go: () => (ev("paper-06") ? showClueModal(item("paper-06"), { canFile: false }) : openWeekCal(() => keepThen(item("paper-06"), backToHub))),
        },
        {
          title: "表姐来电", sub: () => (flag("meiTue") ? "听过了。" : "手机在响。"), img: pic(11, "示意-表姐来电"), person: true,
          show: () => noted("offhours"),
          seen: () => flag("meiTue"),
          go: () => (flag("meiTue") ? showModal("表姐", "她问下星期六。我说我信约。") : meiTue()),
        },
        {
          title: "电脑：发一帖", sub: () => (flag("serial3") ? "发了。" : "第三帖。"), img: pic(11, "示意-电脑发帖"),
          seen: () => flag("serial3"),
          go: () => (flag("serial3") ? openRental() : postFromHub("wk3")),
        },
      ],
    },
    {
      id: "stair", name: "楼梯口", map: "rong-stair", img: pic(11, "场景-楼梯"),
      show: () => noted("offhours"),
      line: "公共楼梯。前座的灯亮着。",
      spots: () => [
        {
          title: "周生", sub: () => (ev("note-zhoutue") ? "他说要煮糖水。" : "他站在楼梯口。"), img: pic(11, "示意-周生"), person: true,
          seen: () => ev("note-zhoutue"),
          go: () => (ev("note-zhoutue") ? showModal("楼梯口", "他回前座了。") : nightBeforeTueZhou()),
        },
      ],
    },
  ],
};

function clinic4() {
  setTime("2014年9月6日 周六 16:00");
  S.clinicLooked = {};
  clinicArrival(4, () => enterClinic(4));
}

function clinic4Talk() {
  startTalk([
    line("罗启明", "四个星期六。你由报站名，讲到八岁间屋静、屯门住几日、阿乐两声、阿嫲、沙发后嗰句「又咁」。防线松过。今日如果仲有未讲，而家讲。", { zh: "四个星期六了。你从报站名，一路讲到八岁那间屋忽然静下来、屯门只坐几天、阿乐两声、阿嫲、沙发后那句「又这样」。防线松过。今天要是还有没说完的，现在说——我听。" }),
    line("章慧琪", "我数星期六。出门会换件干净衫。楼梯又停过，怕你一落诊断，我就真系只剩病。", { zh: "我数着星期六。出门会换件干净衣服。楼梯上又停过——怕你一下诊断，我就真的只剩病了。可我还是来了。不来，这星期我撑不住。" }),
    line("", "……"),
    line("章慧琪", "呢个星期我成日望钟。望到星期六先鬆。望完又惊——惊你今日会话听完，唔使再嚟。", { zh: "这个星期我老是看钟。看到星期六才松一口气。松完又怕——怕你今天说听够了，不用再来。" }),
    line("罗启明", "你仲怕咩？", { zh: "你还怕什么？" }),
    line("章慧琪", "怕你今日只系做样讲。讲完，约就断。", { zh: "怕你今天只是做样子给我看。做完，约就断了。" }),
    line("罗启明", "做样嗰两字，我唔用。", { zh: "做样子那两个字，我不用。" }),
    line("章慧琪", "怕我钟意有人听完。钟意完，你就会同佢哋一样走。走之前先叫我食药，或者叫我当自己有问题。", { zh: "怕我喜欢有人听完。喜欢完，你就会跟他们一样走。走之前先叫我吃药，或者叫我当自己有病。……我已经有点靠你了。靠完，你走，我会更空。" }),
    line("章慧琪", "上星期你叫我唔好再打。我听。但我日日望住电话。望住唔敢撳。好似你喺边度，我先企得住。", { zh: "上星期你叫我别再打。我听了。可我天天盯着电话，盯着又不敢按。——好像你在那儿，我才站得住。" }),
    line("罗启明", "我未落诊断。我亦未走。你讲漏嗰句我听见咗，唔拿来当病。", { zh: "我没下诊断，我也没走。你说漏的那句我听见了——不拿来当病。你可以靠一点；别把全部押在我一个人身上。" }),
    line("章慧琪", "一点点都已经……好重。我知唔应该。但知完，仲系会数你仲有几多个星期六。", { zh: "一点点都已经……很重。我知道不该。可知道了，还是会数——你还有几个星期六。" }),
    line("罗启明", "数星期六可以。数我一个人唔得。", { zh: "数星期六可以。数我一个人不行。" }),
    line("章慧琪", "……我知。知完仍系数。", { zh: "……我知道。知道了还是数。" }),
    line("", "她把手里的纸角捏皱了一点，又摊平。"),
    { who: "", text: "姐夫那句话，又到了嘴边。", act: "问他", ask: true },
    line("章慧琪", "三次我都咽住。今日问。家豪话你精神有时唔太好。我只想知，我交俾你嘅嘢，你承唔承担得住。", { zh: "三次我都咽回去了。今天才敢问。家豪说你精神有时不太好。……我不是审你。我只想知道，我交出去的东西，你担不担得住。" }),
    line("", "……"),
    line("章慧琪", "我唔系想挖你。系我怕……你听完我，自己都撑唔住。咁我交出去嘅，会唔会连累你。", { zh: "我不是想挖你。是我怕……你听完我，自己都撑不住。那我交出去的，会不会连累你。" }),
    line("罗启明", "家豪话多。宿舍隔一层，佢成日走上嚟。我瞓得少。唔影响听你讲。", { zh: "……家豪话多。宿舍隔一层，他老往上跑。我睡得少。不影响听你。" }),
    line("章慧琪", "瞓得少，同精神唔好，系咪同一样。", { zh: "睡得少，和精神不好——是不是同一回事。" }),
    line("罗启明", "唔系你今日要分嘅。你带纸嚟，我听纸。", { zh: "不是你今天要分的。你带纸来，我听纸。" }),
    line("", "他拧圆珠笔的笔帽。笔帽掉到地上。他捡起来时手抖了一下。", { note: ["avoid", "第四次先问出口。这个医生也在回避。提到自己，手抖。"], flag: "clinicAvoid" }),
    line("章慧琪", "你手……", { zh: "你的手……" }),
    line("罗启明", "笔帽滑。", { zh: "笔帽滑了。" }),
    line("", "他没有把笔帽拧回去，只握在掌心。"),
    line("罗启明", "佢成日话我健忘。钥匙都系佢留——差人都咁碎嘴。你当佢碎嘴。", { zh: "他老说我健忘。钥匙都是他留的——警察都这么碎嘴。……你当他碎嘴就好。我们接着听你的。" }),
    line("章慧琪", "你把我当病人。三十号你不来。我打给你，你叫我不要打。纸我交够了。", { zh: "你把我当病人。三十号你不来。我打电话给你，你叫我别打。纸我交够了——我交的不只是纸。" }),
    line("章慧琪", "我交嘅系……我一个星期靠住你先行得郁。你知唔知。", { zh: "我交的是……我一个星期靠着你才走得动。你知不知道。" }),
    line("罗启明", "私人门诊一周一次。多过一次，关系会斜。三十号未准备。白房听不清门底。我写唔落你有病。所以今晚来。观察，治疗以外。高兴唔关事。", { zh: "私人门诊一周一次。多过一次，关系会歪——看病倒转了，就治不成。三十号没准备好。白房听不清门底。我写不下你有病，所以今晚来。观察，治疗以外。高兴无关——不是来让你高兴的。" }),
    line("章慧琪", "今晚？", { zh: "今晚？" }),
    line("罗启明", "今晚。你听完先，再决定同唔同意。", { zh: "今晚。你听完先，再决定同不同意。" }),
    line("", "抽屉缝还看得见节拍器摆杆。摆杆旁边鱼牌原来的位置空了，只剩一圈浅印。他按住那个空位。进门时他摸过一次外套口袋，里面有一小块硬的。"),
    line("", "桌上有一只金属夹子，夹着他惯用的现场笔记——空白，还没写。"),
    line("罗启明", "呢句唔影响今日。美娟问过你今日真系再来听？", { zh: "这句不影响今天。美娟问过你，今天是不是真的再来听？" }),
    line("章慧琪", "系。家豪冇打。", { zh: "是。家豪没打电话。——我是自己来的。" }),
    line("罗启明", "家豪唔打，有时系佢当自己帮紧。你先讲纸。我听。", { zh: "家豪不打，有时是他当自己在帮你。你先讲纸，我听——纸上的，我一句句对。" }),
    line("章慧琪", "……好。呢个星期车又转。二号水又滴。四号我试咗一晚冇录音。车仍然动。", { zh: "……好。这个星期车又转了。二号水又滴。四号我试了一晚没开录音，车仍然动。——我按你说的试了。" }),
    line("章慧琪", "三十号对照页我都带埋。我惊你话我写得太密——密到似病人日记。但唔写，我又唔记得边日。", { zh: "三十号对照页我也带着。我怕你说我写得太密——密得像病人日记。可是不写，我又记不清哪一天。" }),
    { goto: () => handOver(12, stepPast) },
    line("罗启明", "俾我三分钟。", { zh: "给我三分钟。别急。" }),
    line("", "他没有插嘴，只看纸。他把三十号那一页和新页并排放在一起。笔只在空白处点了一下，没有盖住你写的字。"),
    line("", "笔帽仍在他左手。指节白了一点。"),
    line("罗启明", "八月三十号我返去谂过。打过督导电话。观察唔等于治疗，要约好时间界、知情同意，唔写进正式病历——我写咗另一本手记，唔系俾医院。知情同意就系：你先知我来做什么、几时走、写边本簿，你同意，我先去。", { zh: "八月三十号我回去想过，打过督导电话。观察不等于治疗——要约好时间界、要知情同意、不写进正式病历。知情同意就是：你先知道我来做什么、什么时候走、写哪本簿；你同意，我才去。我写了另一本手记，不是给医院的。" }),
    line("罗启明", "我嚟荣汇街，系听门底有冇延迟。唔系陪你过夜。唔系开药。唔系证明有鬼。你听清楚未。", { zh: "我来荣汇街，是听门底有没有延迟。不是陪你过夜。不是开药。不是证明有鬼。你听清楚了没有。" }),
    line("章慧琪", "听清楚。", { zh: "听清楚了。" }),
    line("罗启明", "家豪讲过你房东叫周。我查过公开新闻：一二年西贡十二乡。职业病，查开就查。", { zh: "家豪说过你房东叫周。我查过公开新闻：一二年西贡十二乡。职业病，查开就查——查旧闻是医生习惯，不是针对你。" }),
    line("章慧琪", "十二乡……山泥嗰年？", { zh: "十二乡……山泥那一年？" }),
    line("罗启明", "系。公开报道写到姓周嘅住户。我唔同你对名。你唔使今日答。", { zh: "是。公开报道写到姓周的住户。我不跟你对名字。你不用今天答。" }),
    line("章慧琪", "你信我未？", { zh: "那你信我了吗？……信一点也好。" }),
    line("罗启明", "我信你纸上的时间。周问脚湿、两分钟、关录音仍然动。鉴别仍然分唔开：你惊、旧楼、有人做。拖多一个星期，我仍然拣唔到。若我再唔站去门底亲耳听一次延迟，我会在病历写你有病。我写唔落。", { zh: "我信你纸上的时间——周问脚湿不湿、你离开两分钟、关录音车仍然动。鉴别还是分不开：你怕、旧楼、有人做。再拖一个星期，我仍然拣不出。若我再不站到门底亲耳听一次延迟，我就会在病历上写你有病。我写不下——所以要去听，不是来信鬼。" }),
    line("章慧琪", "所以你嚟，唔系因为我钟意你嚟。", { zh: "所以你来，不是因为我喜欢你来。" }),
    line("罗启明", "唔系。你把高兴放喺我身上，关系会斜。斜咗，我听唔清。", { zh: "不是。你把高兴放在我身上，关系会歪。歪了，我听不清。" }),
    line("", "他把抽屉里那本非正式病历的本子合上，封面朝下。"),
    line("罗启明", "今晚医院交更后。唔经门诊预约。唔带药。唔过夜。周先生知唔知你叫我来？", { zh: "今晚医院交更后。不经门诊预约。不带药。不过夜。周先生知不知道你叫我来？" }),
    line("章慧琪", "我未同佢讲。", { zh: "我还没跟他说。……我怕他拦。" }),
    line("罗启明", "你而家同我讲。或者我敲门自己讲。唔好你一个人喺走廊等。我跟你行。日记写观察，唔写诊断。你当我越界。", { zh: "你现在跟我说，或者我敲门自己说。别你一个人在走廊等，我跟你走。日记写观察，不写诊断。你当我越界——界还在：只听门底，不算治疗，不过夜。" }),
    line("章慧琪", "我同意你来。我仍然觉得你入到会见到。见到，你就信。", { zh: "我同意你来。我仍然觉得你进门就会看见——看见，你就信。……你来，我就撑得住。" }),
    line("章慧琪", "……我知你唔想听「撑得住」三个字挂喺你度。但我净系可以咁讲。", { zh: "……我知道你不想听「撑得住」三个字挂在你身上。可我只能这么说。" }),
    line("罗启明", "我上门，为听清门底。你唔好再讲「高兴」。", { zh: "我上门，是为听清门底。你别再讲「高兴」——高兴不是上门的理由。" }),
    line("章慧琪", "……我知。你肯来，我已经……", { zh: "……我知道。你肯来，我已经……" }),
    line("", "她把后半句咽回去。诊室只剩笔帽在他掌心轻轻碰了一下。"),
    line("罗启明", "带钥匙。今晚交更后。唔过夜。你跟住我行，唔好一个人喺走廊等。", { zh: "带钥匙。今晚交更后。不过夜。你跟着我走，别一个人在走廊等。" }),
    line("章慧琪", "好。我等。", { zh: "好。我等。" }),
    { note: ["clinic4", "第四次。先问了美娟和家豪。他打过督导，讲了知情同意，查过新闻，才约今晚上门。观察，不是治疗。"], goto: () => finishLevel(12) },
  ], "澄心诊室", "face");
}

function visitHome() {
  setTime("2014年9月6日 周六 21:40");
  S.visit = S.visit || {};
  startTalk([
    line("周", "医生？难得。我煮了糖水，要唔要？", { zh: "医生？难得。我煮了糖水，要不要？" }),
    line("", "他手里端着一碗，还冒热气。不是八月七日那只白瓷碗，也不是表姐门口的汤。大门内侧小钩上那把天台钥匙齿上有一点新的亮痕，像刚擦过。"),
    line("罗启明", "唔使。我们听房子。", { zh: "不用。我们听房子。" }),
    line("周", "房子不会害人。人先害自己。章小姐，钥匙我帮你擦过，天台嗰把。", { zh: "房子不会害人。人先害自己。章小姐，钥匙我帮你擦过，天台那把。" }),
    line("", "进门时他又摸了一下外套口袋，没有掏出来。玩具车朝向储物室。"),
    line("罗启明", "你带路。你记低过嘅，带我去睇。我跟住你。", { zh: "你带路。你记下过的，带我去看。我跟着你。" }),
    { goto: () => enterHub("visit", "hall") },
  ], "荣汇街后座", "face");
}

// 带路：你看／他看直接当过场旁白，不再单独弹窗
function gazeLead(you, him, beats) {
  hubTalk([
    line("", "你看　" + you, { gaze: "you" }),
    line("", "他看　" + him, { gaze: "him" }),
    ...beats,
  ], "荣汇街后座", "face");
}

function canLead(id) {
  if (id === "family") return !!S.base.family;
  if (id === "car") return !!(S.base.car || S.tonight.car);
  return true;
}

function leadCorridor() {
  gazeLead(
    "门底。小孩的湿脚印，走到一半停住的地方——今晚是干的。",
    "门上面，大约一个人头的高度。半空。",
    [
    line("", "他戴上耳机听录音。听到「阿轩，返嚟食饭」时，目光突然转向走廊尽头。你看过去，那里只有黑暗——没有人影。他低声数了四下，蓝注视点停在半空中。"),
    line("章慧琪", "你见到咩？", { zh: "你见到什么？" }),
    line("罗启明", "一个女人。长发。唔係呢张相里面个太太。可能系反光。", { zh: "一个女人。长发。不是这张照片里的太太。可能是反光。" }),
    line("章慧琪", "你都见到。四个星期六我就是靠「你会来」撑过。你在，我就未疯。", { zh: "你都见到了。……四个星期六，我就是靠「你会来」撑过来的。你在，我就还没疯。" }),
    line("罗启明", "我见到嘅未必系你见到嘅。你唔好靠我只眼。亦唔好靠我这个人。", { zh: "我见到的未必是你见到的。你别靠我这只眼睛。也别靠我这个人。" }),
    {
      prompt: "……",
      choices: [
        {
          label: "我看见的是小孩脚印。",
          then: [
            line("罗启明", "我哋见到嘅唔係同一只。呢点要紧。你唔好改口迁就我。", { zh: "我们见到的不是同一个。这点要紧。你别改口迁就我。", note: ["notsame", "我们看见的不是同一只。"] }),
          ],
        },
        {
          label: "是相框里那个女人？",
          then: [
            line("罗启明", "相里个太太头发冇咁长——齐肩。我见到嘅披过肩。可能系反光。", { zh: "照片里的太太头发没这么长——齐肩。我见到的披过肩。可能是反光。" }),
            line("罗启明", "我哋见到嘅唔係同一只。呢点要紧。你唔好改口迁就我。", { zh: "咱俩看见的，不是同一只。这点要紧。你别改口，迁就我。", note: ["notsame", "我们看见的不是同一只。"] }),
          ],
        },
        {
          label: "不说话，去走廊。",
          then: [
            line("", "储物室门锁着，门底下是干的。阿明没有跟过来，站在客厅里不动。"),
            line("罗启明", "你望门底，我望门顶。我哋见到嘅唔係同一只。呢点要紧。", { zh: "你看门底下，我看门顶上。咱俩看见的，不是同一只。这点要紧。", note: ["notsame", "我们看见的不是同一只。"] }),
          ],
        },
      ],
    },
    ]
  );
}

function leadTap() {
  gazeLead("水喉嘴。一滴挂住，还没有掉。", "他看手表。", [
    line("", "阿明把水龙头拧紧，等了三秒，不滴了。他又等了一会儿，又滴了。"),
    line("罗启明", "延迟三秒。人为可以做到。", { zh: "晚三秒。人手一拨，也能办到。" }),
    line("", "他从口袋取出现场笔记，夹进桌上那只金属夹子，写字。你没有凑过去看。字写得很短。夹子里现在有本。"),
    { note: ["delay", "阿明：延迟三秒。人为可以做到。"], who: "", text: "他在夹子里的本子上写了一句。没有写鬼。" },
  ]);
}

function leadFamily() {
  S.visit.family = true;
  gazeLead("女人缺一颗牙，头发齐肩。小男孩望着镜头外面。", "相框后面那两个纸箱。", [
    line("罗启明", "呢张相，你搬嚟就喺度？", { zh: "这张全家福，你搬来就挂这儿？" }),
    line("章慧琪", "喺度。佢舍不得扔。", { zh: "在这儿……周先生说舍不得扔。" }),
    line("罗启明", "舍不得扔喺你客厅。", { zh: "舍不得扔，搁你客厅里。" }),
  ]);
}

function leadCar() {
  S.visit.car = true;
  gazeLead("敞篷。掉在地上，车头朝储物室。茶几贴着那扇门。", "他没有看车。他看你看车的样子。", [
    line("罗启明", "你每晚都望佢？", { zh: "那辆玩具车，你每晚都盯着看？" }),
    line("章慧琪", "每晚。", { zh: "每晚……都看。" }),
    line("罗启明", "我记低。望得太密，人会累。车唔会。", { zh: "我记下。盯得太密，人会累。车不会。" }),
  ]);
}

function visitTowel() {
  S.visit.towel = true;
  hubTalk([
    line("", "周在门外敲了一下门，递进来一条毛巾，没有进来。他额上有汗，衬衫领口湿了一点。"),
    line("周", "医生脸色白。呢栋楼旧，闷。", { zh: "医生脸色白。楼旧，闷。" }),
    line("罗启明", "周先生，山泥倾泻，系边一年？", { zh: "周先生，十二乡那场山泥，是哪一年？" }),
    line("周", "一二年。你也看新闻？", { zh: "一二年。你也看新闻？" }),
    line("罗启明", "职业病。", { zh: "职业病。" }),
    line("周", "医生查天灾。我当系关心。糖水真的唔饮？", { zh: "医生查天灾。我当你是关心。糖水真不喝？" }),
  ], "荣汇街后座", "face");
}

function visitFarewell() {
  S.visit.left = true;
  S.hub.at = "corridor";
  hubTalk([
    line("罗启明", "明天我把笔记整理给你。你今晚开灯睡。不要上天台。", { zh: "明天笔记整理好给你。今晚开灯睡。别上天台。" }),
    line("章慧琪", "你都话唔好上天台。", { zh: "你自己都说……别上天台。" }),
    line("罗启明", "风大。", { zh: "风大。" }),
    line("", "离开前他又摸了一下口袋。牌子没有掏出来。门关上。后座只剩你。"),
    line("", "你回到走廊。储物室门底下，好像有人在讲话。"),
  ], "荣汇街后座", "face");
}

HUBS.visit = {
  time: () => (S.visit.left ? "2014年9月6日 周六 22:10" : "2014年9月6日 周六 21:50"),
  places: [
    {
      id: "hall", name: "厅", map: "rong-hall", img: pic(13, "场景-后座厅"),
      line: () => (S.visit.left ? "他走了。灯还开着。" : "阿明站在你身后，等你带路。"),
      spots: () => [
        {
          title: "带他看：全家福", sub: "", img: pic(13, "示意-带他看全家福"),
          show: () => !S.visit.left && canLead("family"),
          seen: () => !!S.visit.family,
          go: leadFamily,
        },
        {
          title: "带他看：玩具车", sub: "", img: pic(13, "示意-带他看玩具车"),
          show: () => !S.visit.left && canLead("car"),
          seen: () => !!S.visit.car,
          go: leadCar,
        },
      ],
    },
    {
      id: "corridor", name: "走廊", map: "rong-corridor", img: pic(13, "场景-走廊"),
      line: () => (S.visit.left ? "储物室门缝下没有光。" : "走廊尽头是储物室的门。"),
      spots: () => [
        {
          title: "带他看：走廊尽头", sub: () => (noted("notsame") ? "不是同一只。" : "录音的地方。"), img: pic(13, "示意-带他看走廊尽头"),
          show: () => !S.visit.left && canLead("corridor"),
          seen: () => noted("notsame"),
          go: () => (noted("notsame") ? showModal("走廊尽头", "他望门顶，我望门底。") : leadCorridor()),
        },
        {
          title: "耳朵贴储物室门", sub: () => (noted("phone-you") ? "他在打电话。" : "里面好像有人。"), img: pic(13, "示意-耳朵贴储物室门"),
          show: () => !!S.visit.left,
          seen: () => noted("phone-you"),
          go: () => (noted("phone-you") ? showModal("储物室", "门仍然锁着。") : afterVisitListen()),
        },
      ],
    },
    {
      id: "kitchen", name: "厨房", map: "rong-kitchen", img: MAP_PIC + "荣汇街-厨房",
      show: () => !S.visit.left,
      line: "水龙头。",
      spots: () => [
        {
          title: "带他看：水龙头", sub: () => (noted("delay") ? "延迟三秒。" : "又在滴。"), img: pic(13, "示意-带他看水龙头"),
          show: () => canLead("tap"),
          seen: () => noted("delay"),
          go: () => {
            sfx("drip");
            if (noted("delay")) showModal("水龙头", "延迟三秒。他写低了。");
            else leadTap();
          },
        },
      ],
    },
    {
      id: "door", name: "门口", map: "rong-door", img: pic(13, "场景-后座门口"),
      show: () => !S.visit.left && noted("delay"),
      line: "门外有人。",
      spots: () => [
        {
          title: "周生敲门", sub: () => (S.visit.towel ? "递了毛巾。" : "他拿着一条毛巾。"), img: pic(13, "示意-周生敲门"), person: true,
          seen: () => !!S.visit.towel,
          go: () => (S.visit.towel ? showModal("门口", "他回前座了。") : visitTowel()),
        },
      ],
    },
  ],
  actions: () => [
    {
      mark: "送", label: "送他走", primary: true,
      show: () => !S.visit.left && noted("notsame") && noted("delay"),
      go: visitFarewell,
    },
  ],
};

function afterVisitListen() {
  setTime("2014年9月6日 周六 22:10");
  startTalk([
    line("", "你把耳朵贴在门上。储物室门缝下没有光。声音从里面传来，闷闷的。"),
    line("周", "人开始查。你话吓就够……我知，唔能留。", { zh: "人开始查了。你说吓唬一下就够……我知道，留不得。" }),
    {
      prompt: "另一端听不清。",
      choices: [
        {
          label: "走开。",
          note: ["phone-you", "周在储物室打电话。有一个你。"],
          then: [
            line("", "你退开两步。阿明刚走。后座还亮着灯。储物室仍然锁着。阿明刚问过年份，现在周在里面打电话。"),
            { goto: backToHub },
          ],
        },
      ],
    },
  ], "储物室门底", "phone", { eavesdrop: true, contact: "周", number: "听不清的另一端" });
}

function missAppt() {
  setTime("2014年9月7日 周日 16:10");
  S.clinic = { visit: 5, seg: 0 };
  startTalk([
    line("罗启明", "笔记我话今日整理好给你。本子唔喺度。", { zh: "笔记我说今天整理好给你。本子不在。" }),
    line("章慧琪", "你记不记得昨晚？", { zh: "你……还记不记得昨晚上门？" }),
    line("罗启明", "记得。车、水喉、延迟三秒。周先生话一二年。我叫你唔好上天台。", { zh: "记得。玩具车，水龙头，晚三秒。周先生说十二乡一二年。我叫你别上天台。" }),
    line("章慧琪", "你话见到一个长发女人。唔系相入面个太太。", { zh: "你说看见一个长发女人……不是全家福里那个太太。" }),
    line("罗启明", "我记得自己望过走廊。而家个女人唔喺呢间白房。你唔好帮我补。本子唔喺度，我对唔上自己写过冇写过。", { zh: "我记得自己望过走廊。这会儿那个女人，不在这间白房。你别替我补。本子不在。我对不上自己写过没有。" }),
    line("", "他握着笔，低声数了四下，才把笔放下。"),
    line("章慧琪", "你像唔记得。", { zh: "你像是……不记得了。" }),
    line("罗启明", "失忆系整晚冇。我有。车、水喉、三秒，我讲得出。张相跟唔到我出走廊。白房安全，张相就唔出。返到条走廊，张相先插返嚟。呢个系旧伤。", { zh: "失忆不是整晚空白——我有记得的。车、水龙头、三秒，我讲得出。那张相跟不出走廊。白房安全，相就不出。回到荣汇街那条走廊，相才又插回来。旧伤。" }),
    line("章慧琪", "昨日你话见到。我净系靠你这句。今日你话唔喺度。", { zh: "昨天你说看见了……我就靠你这句。今天你又说她不在。" }),
    line("章慧琪", "你写低咗？我睇到你写。本子唔喺度，系有人拎走，定系你唔想畀我？", { zh: "你写下来了吧？我看见你写的。本子不在……是有人拿走，还是你不想给我？" }),
    line("罗启明", "我写过。唔喺度，我对唔上自己写过咩？唔好帮我猜边个拎。", { zh: "我写过。不在了。我对不上自己写过什么。别帮我猜是谁拿的。", note: ["forget", "事实他记得。画面跟不回白房。他自己说是旧伤——失忆、鬼上身，两条都对不上。"] }),
    line("", "他起身去倒水。工作台上的东西摊着。"),
    { goto: () => { S.miss = S.miss || {}; enterHub("miss", "room"); } },
  ], "澄心诊室", "face");
}

const MAIL_DIRT = {
  id: "mail-dirt",
  kind: "邮件",
  title: "你信紧的医生",
  key: "名字涂掉，露出一个鱼",
  time: "2014年9月7日",
  body: "二〇〇四年十一月，维港大学，一个女学生坠楼。新闻写男友罗某，自称有责任。名字涂掉，露出一个鱼。偷拍：有盖走廊，年轻的罗和一个长发女生，她望住他。信说你是下一个。",
  img: pic(14, "证据-你信紧的医生"),
};

function missDesk() {
  S.miss.desk = true;
  showModal(
    "他的工作台",
    "电脑屏幕上的日历：九月六日晚「荣汇街上门」那一条被删掉了，回收站是空的。不是墙挂日历。",
    "桌上那只金属夹子还在。本子不见了——上门那晚夹子里有本，你见过他写。",
    "scene",
    () => { note("stolen", "上门行程被删了。现场笔记不见。他不是不记得去过。"); backToHub(); }
  );
}

function missChen() {
  hubTalk([
    line("陈家豪", "你又嚟。佢昨日加班太迟，人会懵。你唔好太靠一个人。阿明唔适合深交——佢对边个都好。你唔好当自己特别。人会累。", { zh: "你又来。他昨天加班太迟……人会懵。你别太靠一个人。阿明……不适合深交。他对谁都好。你别当自己特别。人会累。" }),
    {
      prompt: "……",
      choices: [
        {
          label: "你动过他的东西？",
          then: [
            line("陈家豪", "我帮佢收拾过。佢自己会乱。你怀疑我，不如怀疑这栋楼。", { zh: "我帮他收拾过。他自己就乱。你怀疑我……不如怀疑这栋楼。" }),
            line("", "他说这句话说得太快。钥匙在他口袋里碰响了一下。"),
            { goto: () => { S.miss.chen = "touched"; backToHub(); } },
          ],
        },
        {
          label: "你要我离开他。",
          then: [
            line("陈家豪", "我要你安全。也要佢安全。两个人一齐发病，会一齐跳。我见过。", { zh: "我要你安全。也要他安全。两个人一起发病……会一起跳。我见过。" }),
            { goto: () => { S.miss.chen = "leave"; backToHub(); } },
          ],
        },
        {
          label: "不争。走。",
          then: [{ goto: () => { S.miss.chen = "quiet"; backToHub(); } }],
        },
      ],
    },
  ], "澄心走廊", "face");
}

// 先亮手机收件箱，点开才看全文（带证据图）
function missMail() {
  closeModal();
  const home = el("div", { class: "phone-home" }, [
    el("p", { class: "phone-sec" }, ["邮箱"]),
    el("p", { class: "phone-mail-tip" }, ["震动了一下。未读 1。"]),
    el("button", {
      type: "button",
      class: "phone-row mail-new",
      onclick: () => {
        closeModal();
        missMailOpen();
      },
    }, [
      el("span", { class: "phone-row-name" }, ["未知发件人"]),
      el("small", {}, ["你信紧的医生　刚刚"]),
    ]),
    el("button", {
      type: "button",
      class: "phone-hang",
      onclick: () => {
        closeModal();
        backToHub();
      },
    }, ["放下手机"]),
  ]);
  const frame = el("div", { class: "phone-frame" }, [
    el("div", { class: "phone-status" }, ["中国移动　邮箱　" + (typeof clockHm === "function" ? clockHm() : "16:20")]),
    home,
  ]);
  S.modal = el("div", { class: "modal phone-menu", id: "game-modal" }, [frame]);
  stage.append(S.modal);
}

function missMailOpen() {
  S.miss.mail = true;
  closeModal();
  const kids = [
    el("h3", {}, ["一封邮件"]),
    imgSlot(MAIL_DIRT.img, "clue-img", MAIL_DIRT.title),
    el("p", {}, ["发件人没有显示名称，页边有旺印文仪店的页脚。标题：你信紧的医生。"]),
    el("p", { class: "fine" }, ["正文：上一个已经跳了。下一个就是你。下面有两个附件。"]),
    el("button", {
      type: "button",
      class: "btn ghost scene-close",
      onclick: () => afterModalClose(backToHub),
    }, ["好"]),
  ];
  S.modal = el("div", { class: "modal scene", id: "game-modal" }, [
    el("div", { class: "sheet scene" }, kids),
  ]);
  stage.append(S.modal);
}

function missAttach(n) {
  S.miss["att" + n] = true;
  const done = () => (S.miss.att1 && S.miss.att2 && !ev("mail-dirt") ? missMailKeep() : backToHub());
  if (n === 1) {
    withClue(pic(14, "示意-附件一新闻扫描"), () => showModal(
      "附件一　新闻扫描",
      "二〇〇四年十一月，维港大学，一名女学生坠楼。新闻写她的男友姓罗，自称有责任。",
      "名字被黑笔涂掉，涂不干净，露出一个「鱼」字。",
      "scene",
      done
    ));
  } else {
    withClue(pic(14, "示意-附件二偷拍照片"), () => showModal(
      "附件二　偷拍照片",
      "有盖走廊，从阶梯方向按下快门。年轻的罗医生，旁边一个长发女生，她望着他。两个人都不看镜头。",
      "她望着他的样子，你认得。",
      "scene",
      done
    ));
  }
}

function missMailKeep() {
  note("dirt", "二〇〇四年十一月，维港大学，女学生坠楼。新闻写男友罗某。名字涂掉，露出一个鱼。偷拍里年轻的他，旁边一个女生望住他。信说我是下一个。");
  keepThen(MAIL_DIRT, () => hubTalk([
    line("章慧琪", "我等了你四个星期六。我讲过高兴是你来。而家有人寄嚟一则旧闻，同一张旧相。学生时代真的死过一个女人。相里她望住你。我而家都系咁望。我惊我系下一个。", { zh: "我等了你四个星期六。我说过……高兴是你来。现在有人寄来一则旧闻，还有一张旧相。学生时代，真死过一个女人。相里她望着你。我现在也这么望。我怕……我是下一个。" }),
  ], "澄心诊室", "face"));
}

function missShow() {
  hubTalk([
    {
      prompt: "他端着水回来了。当面给他看？",
      choices: [
        {
          label: "给阿明看。",
          flag: "showedDirt",
          then: [
            line("", "他看完新闻就停住了。拇指压在「罗某」两个字上，没有移开。看到偷拍照片时停得更久。他把纸翻过去，手抖了一下，很快塞进袖口。"),
            line("罗启明", "十一月系佢跌落去嗰个月。我唔纪念。黑笔涂唔干净，剩一个鱼字。我心里叫佢鱼。全名我唔讲。", { zh: "十一月是她掉下去的那个月。我不纪念。黑笔涂不干净，剩一个「鱼」字。我心里叫她鱼。全名我不讲。" }),
            line("章慧琪", "你否认吗？", { zh: "你……要否认吗？" }),
            line("罗启明", "否认要有另一个故事。我没有。所以我信咗十年，系我害咗鱼。鱼先会企喺走廊。", { zh: "否认得有另一个故事。我没有。所以我信了十年——是我害了鱼。鱼才会站在走廊。" }),
            line("罗启明", "有人希望你唔好再信我。你信我，先至危险。松开都得。你先安全。", { zh: "有人希望你别再信我。你信我，才危险。松开也行。你先安全。", note: ["dirtreact", "他手抖。十一月是她坠楼的那个月。他信了十年，是自己害了鱼。全名他不讲。"] }),
          ],
        },
        {
          label: "先不给。",
          flag: "hidDirt",
          then: [
            line("", "你把手机扣在腿上。疑心已经在了。"),
          ],
        },
      ],
    },
  ], "澄心诊室", "face");
}

function missOpenNews() {
  if (S.mode !== "web") {
    S.paused = { mode: S.mode, talk: null, wait: null };
    if (S.mode === "night") stopNightClock();
  }
  S.mode = "web";
  S.tab = "house";
  S.screen = "news";
  draw();
}

HUBS.miss = {
  time: "2014年9月7日 周日 16:20",
  places: [
    {
      id: "room", name: "诊室", map: "clinic-room", img: pic(14, "场景-诊室"),
      line: () => (ev("mail-dirt")
        ? (noted("twofiles") ? "他回来了。西贡同荣汇街，我都看过。" : "他回来了。手机还能开廿八屋，查这栋楼。")
        : "他去倒水了。"),
      spots: () => [
        {
          title: "他的工作台", sub: () => (noted("stolen") ? "行程被删，本子不见。" : "日历、夹子。"), img: pic(14, "示意-他的工作台"),
          seen: () => noted("stolen"),
          go: () => (noted("stolen") ? showModal("工作台", "电脑日历被删了。夹子还在。本子不见了。") : missDesk()),
        },
        {
          title: "手机震了", sub: "一封邮件。", img: pic(14, "示意-手机震了"),
          show: () => !!S.miss.chen && !S.miss.mail,
          go: missMail,
        },
        {
          title: "附件一　新闻扫描", sub: "", img: pic(14, "示意-附件一新闻扫描"),
          show: () => !!S.miss.mail,
          seen: () => !!S.miss.att1,
          go: () => missAttach(1),
        },
        {
          title: "附件二　偷拍照片", sub: "", img: pic(14, "示意-附件二偷拍照片"),
          show: () => !!S.miss.mail,
          seen: () => !!S.miss.att2,
          go: () => missAttach(2),
        },
        {
          title: "廿八屋：这栋楼的旧闻", sub: () => (noted("twofiles") ? "西贡，同市建局。" : "西贡山泥。市建局荣汇街。"), img: pic(6, "示意-电脑一角"),
          show: () => ev("mail-dirt"),
          seen: () => noted("twofiles"),
          go: () => (noted("twofiles") ? showModal("旧闻", "他那边死过人。这边楼还要赔一笔。") : missOpenNews()),
        },
      ],
    },
    {
      id: "corridor", name: "走廊", map: "clinic-wait", img: pic(14, "场景-诊所走廊"),
      show: () => noted("stolen"),
      line: () => (S.miss.chen ? "走廊空了。" : "走廊有人。便装衬衫，像休班路过。"),
      spots: () => [
        {
          title: "陈家豪", sub: () => (S.miss.chen ? "说过了。" : "他看见你了。"), img: pic(14, "示意-陈家豪"), person: true,
          seen: () => !!S.miss.chen,
          go: () => (S.miss.chen ? showModal("走廊", "他下楼了。") : missChen()),
        },
      ],
    },
  ],
  actions: () => [
    {
      mark: "给", label: "给他看",
      show: () => ev("mail-dirt") && !flag("showedDirt") && !flag("hidDirt"),
      go: missShow,
    },
  ],
};

function missHome() {
  setTime("2014年9月7日 周日 傍晚");
  startTalk([
    line("", "你取完笔记回家。楼梯口遇见周，像刚下楼倒垃圾。"),
    line("周", "你医生晏昼嚟过？企咗一阵就走。冇入去。", { zh: "你医生下午来过？站楼梯口一阵就走。没进去。" }),
    line("章慧琪", "哦。", { zh: "哦……" }),
    { note: ["zhou-day", "周说他白天来过。他下午明明在诊所。"] },
    line("", "铁闸出门时是扣死的。回来差一格。门垫也略挪过，边缘没对齐。"),
    line("", "储物室门底缝下多一截干了的水印。中午出门前没有。像有人贴过耳。"),
    { note: ["day-trace", "铁闸差一格。门垫挪过。储物室门底多一截干水印。"], goto: () => finishLevel(14) },
  ], "荣汇街楼梯口", "face");
}

function nightName() {
  setTime("2014年9月7日 周日 23:40");
  startTalk([
    line("", "声音先传来一句：「阿轩，返嚟食饭。」"),
    line("", "接着低声说：「章慧琪。你知。」"),
    { goto: () => keepThen(nameItem(), stepPast) },
    {
      prompt: "声从储物室门底来。",
      choices: [
        {
          label: "拨给阿明",
          phone: true,
          flag: "calledMing2",
          note: ["namecall", "鬼叫我的名字。它说我知。"],
          then: [{ goto: callMing }],
        },
      ],
    },
  ], "后座", "msg", { contact: "丽芬（旧机）", number: "语音留言　09-07 夜" });
}

function callMing() {
  startTalk([
    line("罗启明", "声线……阿轩嗰句我听过。呢句唔好再播。我而家过来。唔好喺电话听。", { zh: "声线……叫阿轩那句我听过。别再播。我现在过来。别在电话里听。" }),
    line("章慧琪", "你下午话个女人唔喺度。", { zh: "你下午明明说……那个女人不在。" }),
    line("罗启明", "下午在诊所我想唔到佢。返到呢条走廊先算。", { zh: "下午在诊所，我想不起她。回到这条走廊，才算数。" }),
    line("章慧琪", "你怕什么？", { zh: "你……怕什么？" }),
    line("罗启明", "我怕再听第二遍。听过第二遍，人就会企喺度。", { zh: "我怕再听第二遍。听过第二遍，人就会站在那儿。" }),
    { note: ["fearreplay", "他说怕再听第二遍。像怕旧事回来。"], goto: goSearch },
  ], "拨出 罗启明", "phone", { contact: "罗启明", number: "澄心／私人", dialout: true });
}

function goSearch() {
  S.talk = null;
  S.mode = "search";
  S.tab = "house";
  S.screen = noted("twofiles") ? "home" : "news";
  setTime("2014年9月7日 周日 夜");
  drawSearch();
}

function drawSearch() {
  if (typeof rememberWebScroll === "function") rememberWebScroll();
  clearStage();
  const wallish = S.tab === "wall" || S.screen === "ad" || String(S.screen).indexOf("wall-") === 0;
  // 浏览器仍用全宽廿八屋；语音／天台改到底栏叉选项，别挤在右边容易看不见
  const desk = laptop(webInner(), {
    tab: wallish ? "wall" : "house",
    addr: webAddr(),
  });
  desk.classList.add("search-desk");
  const dock = el("div", { class: "scene-actions fork search-dock" }, [
    el("p", { class: "hub-hint" }, ["站内新闻可以再翻。语音还在手机里。"]),
    forkChoice(
      "☎",
      "scene-act" + (S.searchHeard ? " done" : " primary"),
      () => {
        S.searchHeard = true;
        note("namecall", "鬼叫我的名字。它说我知。");
        showVoicemail("丽芬（旧机）", "阿轩，返嚟食饭。……章慧琪。你知。", drawSearch, nameItem());
      },
      S.searchHeard ? "语音留言　已听" : "再听语音留言"
    ),
    forkChoice(
      "台",
      "scene-act" + (S.searchRoof ? " done" : ""),
      () => {
        S.searchRoof = true;
        S.known = S.known || {};
        S.known.roof = true;
        showModal("天台", "白天上去晾过一次衫。水箱、晾衣绳、矮女儿墙、对面厨房的油烟，白天风已经很大。水箱就在那里——夜里若有人从后面出来，你认得。阿明和周都说过，晚上不要上去。", "", "scene", drawSearch);
      },
      S.searchRoof ? "天台　想过了" : "想想天台的样子"
    ),
  ]);
  desk.append(dock);
  stage.append(desk);
  if (S.modal) stage.append(S.modal);
  else offerSlate();
  renderPlaybar();
  if (typeof applyWebScroll === "function") applyWebScroll();
}

function mingReturn() {
  setTime("2014年9月7日 周日 夜");
  const dirt = flag("showedDirt") ? [
    line("罗启明", "你今晚要我走吗？", { zh: "今晚……你要我走吗？" }),
    {
      prompt: "……",
      choices: [
        {
          label: "留。",
          flag: "keptMing",
          then: mingReturnRest(),
        },
        {
          label: "你走。",
          then: [
            line("", "他点了点头，关上了门。"),
            ...mingReturnRest(),
          ],
        },
      ],
    },
  ] : mingReturnRest();
  startTalk([
    line("", "阿明来了，比下午更瘦。眼睛通红，像一夜没睡。他站在门口，没有立刻进来，先低声数：一、二、三、四。"),
    line("章慧琪", "你在数什么？", { zh: "你在数什么？" }),
    line("罗启明", "呼吸。旧习惯。家豪话我健忘。我唔系唔记得。", { zh: "呼吸。旧习惯。家豪说我健忘。我不是不记得。" }),
    line("", "他的视线转向走廊尽头。眼睛失焦。声音忽然变得很轻，不像是在对你说话。"),
    line("罗启明", "灯。你企喺尽头。唔好走。我应你。", { zh: "灯。你站在走廊尽头。别走。我应你。" }),
    line("", "两秒钟。他眨了眨眼，手按住门框，又数了四下。"),
    line("罗启明", "刚才那句唔系同你讲。我知道自己喺荣汇街。我知道你系章慧琪。而家系九月七日。", { zh: "刚才那句不是跟你说的。我知道自己在荣汇街。我知道你是章慧琪。现在是九月七日。" }),
    line("章慧琪", "你刚才叫谁？", { zh: "你刚才……叫的是谁？" }),
    line("罗启明", "鱼。我唔该叫出口。全名我唔讲。叫完整，画面会更长。你当我发过一次旧病。我仲喺度。", { zh: "鱼。我不该叫出口。全名我不讲。叫完整，画面会更长。你当我发过一次旧病。我还在。" }),
    { note: ["countbreath", "他对走廊尽头说了一句，然后自己数回来。他知道日期，知道我是谁。他叫出了一个字：鱼。抽屉里那只鱼牌，他仍然不解释。旧病，鬼上身对不上。"] },
    ...dirt,
  ], "荣汇街后座", "face");
}

function mingReturnRest() {
  if (!flag("showedDirt")) flag("keptMing", true);
  return [
    line("罗启明", "我查过清拆。呢栋楼值一笔钱。人未查到。钱唔係鬼。", { zh: "我查过清拆。这栋楼值一笔钱。人还没查到。钱不是鬼。" }),
    line("章慧琪", "咁录音係咪人？", { zh: "那……录音是人吗？" }),
    line("罗启明", "人可以延迟三秒。人可以叫你个名。人唔可以……企喺我走廊尽头用嗰种头发。嗰个系我嘅。唔关你间屋。", { zh: "人可以晚三秒。人可以叫你的名。人做不到……站在我走廊尽头，用那种头发。那个是我的。跟你这间屋无关。" }),
    line("章慧琪", "你话系你的问题。", { zh: "你说……是你的问题。" }),
    line("罗启明", "我回流第一年，上过一次高处。身体先走到沿。家豪抬我下来。沿上冇喊名。我第二日当过劳。", { zh: "回流第一年，我上过一次高处。身体先走到沿上。家豪抬我下来。沿上没喊名。第二天我当过劳。" }),
    line("章慧琪", "所以你叫我唔好上天台。", { zh: "所以你才叫我……别上天台。" }),
    line("罗启明", "我讲俾你，因为我见过自己喺沿上。", { zh: "我跟你讲，因为我见过自己在沿上。" }),
    { note: ["hisghost", "他把长发女人认成自己的问题。他提过回流第一年有人抬他下来。"], flag: "roofKeyAsked", who: "周", text: "医生又来。租客有福。今晚风大，天台嗰把钥匙，我帮你收住啦？" },
    {
      prompt: "……",
      choices: [
        {
          label: "钥匙给你。",
          flag: "gaveRoofKey",
          then: [
            line("", "你把大门内侧小钩上的天台钥匙给了他。小钩空着一眼。不久后钥匙又出现在门垫下面，像是谁好心送回来的。"),
            { goto: roofApproach },
          ],
        },
        {
          label: "不给。",
          flag: "keptRoofKey",
          then: [
            line("章慧琪", "我自己收。", { zh: "我……自己收。" }),
            { goto: roofApproach },
          ],
        },
      ],
    },
  ];
}

function roofApproach() {
  const dirt = flag("showedDirt") ? [
    line("罗启明", "有人寄俾你嘅旧闻，我唔会喺电话讲。新闻写罗某。涂剩一个鱼。我信咗十年，系我害咗鱼。唔否认唔代表我推人。", { zh: "有人寄给你的旧闻，我不会在电话里讲。新闻写罗某。涂剩一个「鱼」。我信了十年——是我害了鱼。不否认，不代表我推过人。" }),
    line("章慧琪", "你话我先安全。", { zh: "你说……我先安全。" }),
    line("罗启明", "你安全，系你唔好跟。", { zh: "你安全，是你别跟。" }),
  ] : [];
  startTalk([
    line("", "周走后，走廊又安静下来。他没有立刻离开，看着走廊尽头。你看不见他在看什么，只看见他停在那里。他又数了一次呼吸，声音很低。"),
    line("章慧琪", "你又见到佢？", { zh: "你……又看见她了？" }),
    line("罗启明", "我记得昨夜。车、水喉、延迟三秒。周话一二年。我叫你唔好上天台——我都记得。喺白房，个女人我想唔到。返到呢条走廊，佢又企喺度。", { zh: "我记得昨夜。车，水龙头，晚三秒。周说十二乡一二年。我叫你别上天台——这些我都记得。在白房，那个女人我想不起。回到这条走廊，她又站在那儿。" }),
    { note: ["notforget", "他记得昨夜。诊所里想不起那个女人，走廊里又看见。"] },
    ...dirt,
    line("章慧琪", "你日头系咪嚟过？", { zh: "你白天……是不是来过？" }),
    line("罗启明", "我企喺楼梯。冇揿门铃。唔该问你。", { zh: "我站在楼梯口。没按门铃。不该问你。" }),
    { note: ["day-admit", "他说白天站在楼梯。没按门铃。不该问我。"] },
    line("罗启明", "你而家望住我。同张相一样。我惊嘅系怕再答得太快，又将你收成下一个病人。再有人跌。", { zh: "你现在望着我，跟那张旧相一样。我怕的是再答得太快……又把你收成下一个病人。再有人跌。" }),
    line("章慧琪", "我唔系你病人了吗？", { zh: "我……不是你的病人了吗？" }),
    line("罗启明", "你越信我，我越像医生。我越像医生，你越危险。呢个系我嘅病，同你间屋无关。", { zh: "你信我，我就越像医生。像了，你就危险。这是我的病。跟你这间屋无关。" }),
    line("章慧琪", "姐夫话你精神不太好。我而家信一半。", { zh: "姐夫说你精神不太好……我现在信一半。" }),
    line("罗启明", "佢见过一次沿上。佢唔讲名。我唔怪佢。", { zh: "他见过一次，我在沿上。他不讲名。我不怪他。" }),
    line("罗启明", "你再企喺走廊，又会有人以为要跌落。上次我讲唔好上天台，讲嘅系你。", { zh: "你再站在走廊，又会有人以为要跌下去。上次我说别上天台——说的是你。" }),
    line("章慧琪", "你而家要去边？", { zh: "你现在……要去哪？" }),
    line("罗启明", "我上去同佢讲。你留喺下面。锁门。唔好播嗰卷录音。", { zh: "我上去跟她讲一句。你留下面。锁门。别播那卷录音。" }),
    line("章慧琪", "你唔系要跳？", { zh: "你……不是要跳吧？" }),
    line("罗启明", "你唔使跟。我上去叫她唔好再企喺度。我上过沿。我知道接下来会点：脚会先行，话会迟。我可以讲低。我阻止唔到脚。上次都系咁。", { zh: "你不用跟。我上去叫她别再站。我上过沿。接下来怎样我知道——脚会先走，话会晚。声音我压得住。脚拦不住。上次也是这样。" }),
    { note: ["roofwhy", "他要上天台，叫我留在下面。他说脚会先走、话会迟——旧病他自己知道，停不住。"] },
    line("", "他拿起钥匙。铁梯门打开，风灌进来。他踩上一级台阶，背对着你。"),
    line("罗启明", "如果我喺上面冇声，你唔好跟。打俾家豪。唔好打俾我。", { zh: "如果我在上面没声，你别跟。打给家豪。别打给我。" }),
    line("章慧琪", "阿明——", { zh: "阿明——" }),
    line("罗启明", "我脏。你唔好伸手。伸手我会以为你选中我。选中我，我就会再错一次。", { zh: "我脏。你别伸手。伸手我会以为你选中我。选中我……我就会再错一次。" }),
    line("", "脚步声继续往上，中途顿了一拍，又继续往上。你没有跟上去。你锁上门。屋里还亮着灯。"),
    { goto: roofWait },
  ], "荣汇街后座", "face");
}

function roofWait() {
  setTime("2014年9月7日 周日 夜");
  startTalk([
    line("", "铁梯又响了一下，然后很久都没有声音。好像有人站在上面，没有跳下去，也没有下来。"),
    line("", "你把耳朵贴在门上听。楼上有人很低地数：一、二、三、四。数完又说了一句，听不清楚，像在回答一个不在场的人。然后又继续数。"),
    { note: ["roofpause", "他在上面数呼吸，又对一个不在的人说话。旧病：身体先到了，话还没讲完。"], goto: () => finishLevel(15) },
  ], "荣汇街后座", "face");
}

function roofNight() {
  setTime("2014年9月8日 周一 00:41");
  startTalk([
    line("", "后座所有的灯都灭了。储物室门第一次从里面发出响声，像有人用肩膀撞门。玩具车滑到门边。"),
    line("", "有人喊了一句：上天台。声音像丽芬，却像在下命令，不像叫儿子吃饭。"),
    line("", "他说过：如果我喺上面冇声，你唔好跟。打俾家豪。唔好打俾我。"),
    { act: "开门，跑上后楼梯", who: "", text: "门把手是冰的。", flag: "ranUp" },
    line("", "你打开门。走廊里只有从天台楼梯吹来的风。你往上跑。周的前座门开了一条缝，里面很黑。"),
    line("", "天台上风很大。水箱、晾衣绳打着金属杆。对面还有一盏路灯。阿明已经站在女儿墙上，一只鞋在墙沿外面。他一只手扶着墙，另一只手握着，掌心在路灯余光里露出一块磨白的鱼形牌子的边缘。他没有摊开手给你看。他不是在等你。他对着空气说话，像走廊尽头那个人走到了墙沿上。"),
    line("罗启明", "你企咗十年。我唔想你再企。我估错一次。我唔想再估错。", { zh: "你站了十年。我不想你再站。我估错一次。我不想再估错。" }),
    line("", "他侧过耳，像在等回答。只有风声。"),
    line("罗启明", "系我害的。我同你一齐。你唔好再站在走廊。", { zh: "是我害的。我跟你一起。你别再站在走廊。" }),
    {
      prompt: "风很大。",
      choices: [
        { label: "叫他的名字", flag: "calledName", then: [line("章慧琪", "阿明！我喺度！", { zh: "阿明！我在这儿！" })] },
        { label: "冲过去", then: [
          line("", "你跑了两步。他的鞋又往外挪了一点。你停住。"),
          line("章慧琪", "……阿明！我喺度！", { zh: "……阿明！我在这儿！", flag: "calledName" }),
        ] },
      ],
    },
    line("", "他回过头。两秒钟。先看自己在墙沿外面的那只鞋，再看你。"),
    line("罗启明", "我喺天台。你系章慧琪。刚才那句唔系叫你一齐跳。", { zh: "我在天台。你是章慧琪。刚才那句不是叫你一起跳。" }),
    line("罗启明", "你唔好跟上来。我脏。你伸手，我会以为你选中我。", { zh: "你别跟上来。我脏。你一伸手，我会以为你选中我。" }),
    { note: ["rooftop", "他在沿上对空气说话。掌心露出鱼牌的边，抽屉里那块已经不在。我叫他的名字，他先确认自己在天台、我是谁，才回来。旧画面插进来，失忆对不上。"] },
    line("周", (noted("twofiles") ? "西贡你睇过。呢栋楼嘅补偿你都睇过。" : "") + "你录音收得齐。你同警察讲见到鬼，他们锁你。你同他们讲我演戏，你有证据吗？"),
    line("章慧琪", "你叫我上去。", { zh: "是你叫我上去的……" }),
    line("周", "风大。旧楼常有人跌。跌下去就安静，像她们。你唔使自己查。我帮你安静。", { zh: "风大。旧楼常有人跌。跌下去就安静了，像她们。你不用自己查。安静……我帮你。" }),
    line("", "他伸手拉住你的小臂，力往墙沿那边拉，姿势却像是在扶你。"),
    line("", "阿明的鞋又往外挪了一步。你还有一只手是空的。"),
    { act: "抓住他的手腕", who: "", text: "他说过：你伸手，我会以为你选中我。", flag: "grabbed" },
    line("", "你另一只手抓住了他的手腕。抓到了。"),
    line("", flag("called999")
      ? "你想起阿乐挂断的两声电话、表姐眼里的药、差人问的「有没有人伤」。这一次你没有松手。"
      : "你想起阿乐挂断的两声电话、表姐眼里的药。这一次你没有松手。"),
    line("", "铁门被撞开——门闩被他肩撞开，不是用钥匙拧的。陈家豪站在门口，穿着便装衬衫，喘气很急，像从街底跑了六层没有电梯的楼梯上来。手里攥着澄心的紧急钥匙，开诊所的那把，没插进锁孔。他休班，没有带枪。"),
    line("陈家豪", "阿明——你唔可以再接近——章慧琪，你走开！", { zh: "阿明——你不能再靠近——章慧琪，你走开！" }),
    line("周", "又一个。成日跟住医生嗰个差人。", { zh: "又一个。成天跟着医生的那个差人。" }),
    line("", "三件事在同一秒钟发生：周拉着你的手臂往墙沿方向拉。阿明的鞋离地了。家豪用身体撞向周，不是用拳头——要把人从沿边撞开。"),
    line("", "周的肩膀撞在水箱上。两个人的重心一齐往女儿墙外偏。"),
    line("", "阿明跌回墙内侧，膝盖着地。周快步下楼梯，没有回头。"),
    line("", "陈没有撞在内侧水泥上。他整个人翻出女儿墙。"),
    line("", "风声空了一拍。下面一声闷响——不是落到街面，是竹棚。旧楼外墙的棚架档了一下。竹竿碎、铁丝响。人卡在棚上，没有再往下。"),
    line("", "你趴到沿边看。路灯下，陈趴在裂开的棚架上，一条腿别着，血从衬衫渗到竹篾。他还在动。他看着上面的阿明，没有看你。"),
    line("陈家豪", "你……唔好同她走。你属于……", { zh: "你……别跟她走。你属于……" }),
    line("章慧琪", "我叫救护车。", { zh: "我叫救护车——" }),
    line("陈家豪", "你走开。我不是为你。", { zh: "你走开。我不是为你。" }),
    line("", "头垂下去。阿明用力抓住你的手，抓得很紧。"),
    { goto: ending },
  ], "天台", "face");
}

function ending() {
  stopNightClock();
  S.talk = null;
  S.mode = "end";
  clearStage();
  try { (typeof clearStore === "function" ? clearStore() : localStorage.removeItem(SAVE_KEY)); } catch (e) { /* 无 */ }
  const kept = (S.evidence || []).map((e) => e.kind + "　" + e.title);
  const noise = Object.entries(S.skipAll || {}).filter(([id]) => !hasEvidence(id)).map(([, t]) => t);
  const { desk, go } = captionShell(pic(16, "场景-结局-陈倒下"), 0.4);
  desk.classList.add("caption-end");
  const at = (node, d) => {
    if (node && node.style) node.style.setProperty("--d", d + "s");
    return node;
  };
  desk.append(el("div", { class: "caption-text" }, [
    at(el("p", { class: "caption-line" }, ["救护车声在很远的地方。"]), 0.6),
    at(el("p", { class: "caption-line" }, ["你当时不知道他怎样，日记簿还在你身上。"]), 1.8),
    at(el("p", { class: "caption-next" }, ["日记簿里留下的（" + kept.length + "）"]), 3.2),
    at(kept.length ? el("ul", { class: "caption-kept" + (kept.length > 8 ? " two-col" : "") }, kept.map((t) => el("li", {}, [t]))) : el("p", { class: "caption-next" }, ["什么都没有留下。"]), 3.6),
    noise.length ? at(el("p", { class: "caption-next" }, ["看见了，没有留下（" + noise.length + "）"]), 4.4) : "",
    noise.length ? at(el("ul", { class: "caption-kept noise" + (noise.length > 8 ? " two-col" : "") }, noise.map((t) => el("li", {}, [t]))), 4.8) : "",
    at(el("p", { class: "caption-line" }, [flag("showedDirt") ? "那封信，你当面给他看了。" : "那封信，你没有给他看。"]), 5.6),
    at(el("p", { class: "caption-title" }, ["暗度　undo"]), 6.6),
    at(el("div", { class: "caption-acts" }, [go("回到廿八屋", () => newGame())]), 7.4),
  ]));
  stage.append(desk);
  renderPlaybar();
}
