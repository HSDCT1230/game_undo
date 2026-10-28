/* story-early.js — split from story.js; load order: early -> clinic -> late */
function goViewing() {
  closeModal();
  if (S.level !== 1) {
    showPrompt("此盘已租出");
    return;
  }
  if (flag("askedOld") && !flag("sawMail")) {
    showPrompt(
      replyReady() ? "站内留言有新回复。" : "业主现时不在线。",
      replyReady() ? "请先查看，再赴约看房。" : "回复会留在站内留言。"
    );
    return;
  }
  if (!levelReady()) {
    showModal("还不能去", levelHint() || "还没准备好。", "", null, () => draw());
    return;
  }
  // 没发过留言、直接预约：她 7/31 夜也照样没地方睡，这一夜两条路都要过。
  // 发过留言的，这一夜早在「他夜间不在线。」那格播过了，不重复。
  if (!flag("askedOld")) return fastFoodNight(() => finishLevel(1));
  finishLevel(1);
}

// 7/31 → 8/1 的那一夜：24 小时快餐店。两条路径共用同一格定格与字幕。
function fastFoodNight(next) {
  waitWeek(
    "2014年7月31日 周四 23:14",
    "今晚没地方睡。",
    "你坐到天亮。",
    next,
    { plate: pic(1, "场景-过场-快餐店"), lum: 0.34 }
  );
}

function startViewing() {
  setTime("2014年8月1日 周五 15:20");
  S.view = S.view || {};
  const door = flag("askedOld")
    ? line("周", "你个留言我睇咗。旧嘢你怕，就同我讲。行上嚟好热吖嘛？饮杯水，唔烫嘅。", { zh: "你留言我看了。旧东西怕，就跟我说。爬上来热吧？喝杯水，不烫。" })
    : line("周", "行上嚟好热吖嘛？饮杯水，唔烫嘅。", { zh: "爬上来热吧？喝杯水，不烫。" });
  startTalk([
    door,
    line("章慧琪", "唔该。呢层……好静。", { zh: "谢谢。……这层，好静。" }),
    line("周", "日头静。夜晚旧楼会响：水喉、老鼠、隔篱电视。住惯就得。我自己都住前座。", { zh: "白天静。夜里就响——水管、老鼠、隔壁电视。住惯就好。我自己也住前座。" }),
    line("", "他推开后座的门，站到一边，让出的宽度刚够一个人侧身进去。"),
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
      line: "后座的厅。窗朝天井。茶几靠着储物室那面墙。周生跟在你后面，手插在裤袋里。",
      spots: () => [
        {
          title: "全家福", sub: "客厅墙上。挂得很正。", img: pic(2, "示意-全家福"),
          seen: () => !!S.view.family,
          go: () => viewLook("family", [
            line("章慧琪", "厅入面张相……一家人？", { zh: "厅里那张相……一家子？" }),
            line("周", "挂惯咗。自己屋企嘅。同你住冇关。相框后面嗰箱唔好郁就得。", { zh: "挂惯了，自家的。跟你住没关系。相框后面那箱别动就行。" }),
            line("章慧琪", "边个嚟㗎？……你太太？仲有细路？", { zh: "谁呀？……你太太？还有孩子？" }),
            line("", "他笑了一下，没说话。墙上女人头发齐肩，缺一颗牙。小男孩望着镜头外。"),
            line("周", "屋企人。名你唔使知。相挂住，我唔想收。", { zh: "家里人。名字你就不用知道了。相挂着，我不想摘。" }),
          ]),
        },
        {
          title: "玩具车", sub: "茶几上敞篷红色塑料车。", img: pic(2, "示意-玩具车"),
          seen: () => !!S.view.car,
          go: () => viewLook("car", [
            line("章慧琪", "厅度……有架车。", { zh: "客厅里……有辆车。" }),
            line("周", "上手租客留低嘅。我懒得清。你嫌碍眼，我可以搬去……嗰边。", { zh: "前一个租客留下的。我懒得清。你嫌碍眼，我可以挪到……那边。" }),
            line("", "茶几靠着储物室那面墙。他朝走廊尽头看了一眼。"),
            line("周", "迟啲先。", { zh: "以后再说。" }),
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
            line("章慧琪", "嗰间……锁咗？", { zh: "那间……锁着？" }),
            line("周", "储物。衫箱多，乱。锁匙我拎住，你唔使开。门后有楼梯，上去晾衫用。你要多格柜，同我讲。", { zh: "放东西的。衣箱多，乱。钥匙我拿着，你甭开。门后有楼梯，上去晾衣服用的。嫌柜子不够，跟我说。" }),
          ]),
        },
      ],
    },
    {
      id: "bed", name: "主房", map: "rong-bed", img: MAP_PIC + "荣汇街-主房",
      line: "铁条窗朝天井。",
      spots: () => [
        {
          title: "主房窗台", sub: "一圈浅色水印。", img: pic(2, "示意-主房窗台"),
          seen: () => !!S.view.sill,
          go: () => {
            flag("sawSillTour", true);
            viewLook("sill", [
              line("", "主房窗台有一圈浅色水印，像小孩的鞋印。他走过来，手掌撑在窗台上，正好盖住那片水印。"),
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
          note: ["tian", "周说是天灾。他说「他们话」。家人名字他不讲。"],
          then: [
            { goto: () => { asked(); stepPast(); } },
            line("章慧琪", "背景好似乡下。……西贡嗰边？", { zh: "背景像乡下。……西贡那边？" }),
            line("", "他侧身挡了一下你的视线。"),
            line("周", "前年嘅事。新闻闹过一阵。报过。佢哋话天灾。唔好扯到你租客身上。", { zh: "前年的事。新闻闹过一阵，报过。他们说是天灾。别扯到你租客身上。" }),
          ],
        },
        {
          label: "简介写屋内仍有家人旧物，是哪些？",
          then: [
            { goto: () => { asked(); stepPast(); } },
            line("章慧琪", "周生，简介写屋入面仲有屋企人旧嘢。……系啲咩？", { zh: "周生，简介写屋里还有家人的旧东西。……是些什么？" }),
            line("", "他想了想。"),
            line("周", "箱箱袋袋，衫同碗碟。未执完。你介意杂物多、觉得唔啱，自己睇过先。", { zh: "箱子袋子，衣服碗碟。没清完。你要是嫌杂物多、看不合适，就自己先看看。" }),
          ],
        },
        {
          label: "你一个人住会怕吗？",
          flag: "debtSlip",
          note: ["zhai", "口误：「还债」改成「还生活」。"],
          then: [
            { goto: () => { asked(); stepPast(); } },
            line("周", "怕过。后尾发觉，怕嘅人先走。剩低嘅人要还债……要还生活。", { zh: "怕过。后来发现，怕的人先走。留下来的人得还债……还生活。" }),
          ],
        },
      ],
    },
  ], "荣汇街 28 号 4 楼");
}

function payDeposit() {
  startTalk([
    line("章慧琪", "阴唔阴我唔理。杂物我唔会乱郁。租得嘅话……今晚住唔住得？", { zh: "阴不阴我不管。杂物我不乱动。能租的话……今晚住得进来吗？" }),
    line("", "他松了一口气。"),
    line("周", "你一个人住？做咩工㗎？", { zh: "你一个人住？做什么工作？" }),
    line("章慧琪", "散工。展会、货仓……冇粮单。你要嘅话，我可以俾多一个月按金。", { zh: "打散工。展会、货仓……没有工资单。你要的话，我可以多押一个月。" }),
    line("周", "唔使。粮单我睇唔明。我睇人。", { zh: "不用。工资单我看不懂。我看人。" }),
    line("章慧琪", "……咁你睇我系咩人？", { zh: "……那你看我是什么人？" }),
    line("", "他想了一下，眼睛没有离开你手里的信封。"),
    line("周", "肯今晚就搬嘅人，唔会嫌东嫌西。", { zh: "肯今晚就搬的人，不挑三拣四。" }),
    line("周", "讲老实。厨房水喉有时自己滴，我整过，仲滴。你同我讲就得，唔使自己搵人。今晚搬得，锁匙即刻俾你。", { zh: "说实话。厨房水龙头有时候自己滴，我修过，还滴。跟我说就行，不用自己找人。今晚搬得进，钥匙马上给你。" }),
    ...afterTour(),
  ], "荣汇街 28 号 4 楼");
}

function afterTour() {
  return [
    line("", "他收现金，手写一张收条，钱数了两遍。"),
    line("周", "冇印花，平就平喺呢度。我住四楼前座，隔一幅墙。有咩事拍门就得。重建嗰啲嘢，名单挂咗好耐，未轮到。到时我会同你讲，唔会无端端赶人。", { zh: "没印花，便宜就便宜在这儿。我住四楼前座，隔一道墙。有事敲门就行。重建那事，名单挂很久了，还没轮到。到时候我会跟你说，不会平白无故赶人。" }),
    line("章慧琪", "我会……好静。", { zh: "我会……很安静。" }),
    line("周", "安静最好。旧楼就系咁，住惯就得。", { zh: "安静最好。旧楼就这样，住惯就好。" }),
    line("", "收条推过来，墨还没干。刚才那两个字他说得很顺——重建。"),
    line("章慧琪", "周生，你头先讲重建。呢栋都有份？", { zh: "周生，你刚才说重建。这栋也有份？" }),
    line("周", "研究啫。挂咗好耐，未轮到。你唔使理。", { zh: "研究而已。挂很久了，还没轮到。你不用管。" }),
    line("", "「研究」两个字他说得很轻，比说「重建」时更轻。"),
    { goto: () => uraGate() },
  ];
}

/* 伏笔：他提了「重建」，又轻轻放下。章不肯就咁信——这条得自己去查、去记，
   钥匙才拿得走。这一场始终留在 talk 里：打开网页时把对话挂起，关掉网页落回
   下一格，重新判一次有没有记进日记簿。 */
function uraGate() {
  if (noted("web-ura")) return uraKeys();
  const again = flag("uraGate");
  flag("uraGate", true);
  const open = {
    prompt: "……",
    choices: [
      {
        label: again ? "再看一次那条新闻" : "掏出笔电，上廿八屋查清楚",
        then: [{ goto: () => uraBrowse() }],
      },
    ],
  };
  startTalk(again
    ? [
        line("", "新闻页关掉了。字还在眼前，簿子里却什么都没有。"),
        open,
        { goto: () => uraGate() },
      ]
    : [
        line("", "他在数第二遍钱。手机在袋子里，隔着一层布。"),
        line("", "你把笔电从袋子里抽出来，搁在膝上。机器还温着，塑料壳贴住膝盖。"),
        line("", "廿八屋新闻中心转载过市建局那条，七月廿二。研究范围写到荣汇街，写到唐楼。"),
        line("", "研究到哪一步，补偿什么时候到，字里都没有。"),
        open,
        { goto: () => uraGate() },
      ], "荣汇街 28 号 4 楼");
}

function uraBrowse() {
  // 走掉脚下这一格 goto，否则关网页时会被重新触发，一关就再开一次
  if (S.talk) S.talk.i += 1;
  S.paused = { mode: "talk", talk: S.talk, wait: S.wait };
  S.mode = "web";
  goWeb("news");
}

function uraKeys() {
  startTalk([
    line("", "他从裤袋摸出一串钥匙，挑出两把，搁在收条上面。一把铜色，一把磨得发黑。"),
    ...keyHandover(),
  ], "荣汇街 28 号 4 楼");
}

function keyHandover() {
  return [
    {
      prompt: "……",
      choices: [
        {
          label: "这把？",
          then: [
            line("周", "天台。晾衫。上面大把位，日头上得。夜晚唔好上天台，风大。", { zh: "天台。晾衣服。上面地方多，白天可以上。晚上别上天台，风大。" }),
            line("章慧琪", "我今晚搬。", { zh: "我今晚搬。" }),
            { goto: () => keepMust(item("obj-keytag"), () => finishLevel(2)) },
          ],
        },
        {
          label: "你怎么知道我会住惯？",
          note: ["nai", "周留意我看门锁、水渍、他的手。"],
          then: [
            line("周", "你望门锁，望水渍，又望我只手。好少租客睇咁多。睇得咁仔细嘅人，住得耐。", { zh: "你看门锁，看水渍，又看我的手。租客很少看这么多。看得细的人，住得久。" }),
            line("周", "天台嗰把都俾埋你。晾衫用。上面大把位，日头上得。夜晚唔好上天台，风大。", { zh: "天台那把也给你。晾衣服用。上面地方多，白天可以上。晚上别上天台，风大。" }),
            { goto: () => keepMust(item("obj-keytag"), () => finishLevel(2)) },
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
    return "铁条窗。窗台上那一圈水印，是干的，像小孩鞋的印子。看房时周生的手撑在这里，正好盖住它——你认得那个形状。像搬东西时放过一双童鞋，不是这后座住过小孩。";
  }
  return "铁条窗。外面是天井一侧，旧霓虹和对面的窗户。窗台上一圈水印，是干的——你按了按。形状清楚是小孩鞋印，像搬东西时放过，不是怪事。";
}

function drawMoveIn() {
  baseView("movein");
  clearStage();
  const looks = [
    hot("大门与铁闸", "两道锁都试过。钥匙还能拧顺。", () => {
      markMoveIn("door");
      // 电表并在这里：它本来就在门边走廊墙角，为它单开一格热点不划算（热点盘会多一行，
      // 盖掉半个房间）。它是「章自己的事／环境读数」，按设定不记进日记簿，所以只写在描述里。
      showModal("大门与铁闸", "两道锁都试过。铁闸推开时会响。钥匙齿有些磨损，还能拧顺。你反手锁好，又试了一次。门边走廊墙角是电表，数字转得很慢。", "", null, () => drawMoveIn());
    }, pic(3, "示意-大门与铁闸"), moveInAct("door")),
    hot("全家福", S.base.family ? "记下了。" : "客厅墙上。相后靠着纸箱。", () => {
      markMoveIn("family");
      note("move-family", "周说是家里人。名字他不讲。相挂得很正。");
      baseSheet("family", "客厅墙上，正对茶几。三个人。男人笑得很用力，女人缺一颗牙、头发齐肩，小男孩看向镜头外面。相框擦得很干净，没有灰。挂得很正，相后两个纸箱。周先生说不要动。", () => drawMoveIn());
    }, pic(3, "示意-全家福"), !!S.base.family),
    hot("玩具车", S.base.car ? "记下了。" : "车头朝窗。敞篷座位里没有灰。", () => {
      markMoveIn("car");
      note("move-car", "车头朝窗。敞篷座位里没有灰。");
      baseSheet("car", "一辆旧红色塑料敞篷玩具车。车轮完整，没有缺件。车头朝窗。茶几靠着储物室那面墙，上面有一圈晒痕。你低头往座位里看：没有灰。你没有碰。", () => drawMoveIn());
    }, pic(3, "示意-玩具车"), !!S.base.car),
    hot("厨房水龙头", S.base.tap ? "记下了。" : "关上之后还会滴一滴。", () => {
      markMoveIn("tap");
      note("move-tap", "关上还会滴。周说修过。");
      sfx("drip");
      baseSheet("tap", "拧开，水流一顿一顿的，带着铁管味。关上，等了几秒，滴答一声——关了还会滴一滴。周先生说修过，还在滴。", () => drawMoveIn());
    }, pic(3, "示意-厨房水龙头"), !!S.base.tap),
    hot("储物室门", S.base.storage ? "记下了。" : "锁着。门底没有光。", () => {
      markMoveIn("storage");
      baseSheet("storage", "走廊尽头。木门。锁从走廊这一侧锁着。门底有一道缝，里面是黑的，没有光。后楼梯在这扇门后面。你没有钥匙。", () => drawMoveIn());
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
      showModal("天台钥匙", "第三把挂在大门内侧的小钩上。钥匙牌上周先生写着：天台晾衫用。你没有上去。", "", null, () => drawMoveIn());
    }, pic(3, "示意-天台钥匙"), moveInAct("roof")),
  ];
  const box = el("div", { class: "room scene-fit" });
  box.append(
    imgSlot(pic(3, "场景-后座厅"), "room-bg", "后座"),
    el("p", { class: "room-note" }, ["周生下楼回前座。你一个人站在走廊里。钥匙在掌心，两把；天台那把挂在门内小钩上。"]),
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
  const seen = Math.min(baseCount(), 4);
  const left = Math.max(0, 4 - baseCount());
  // 这一关只有一个动作：睡。看屋子是右边那盘热点的事，不该在这里摆成「甲／乙／丙」——
  // 三条路里两条不通，玩家会以为自己选错了、或者卡住了。
  // 按钮上直接写还差几样，点之前就知道为什么还走不了，不必等弹窗来告诉他。
  box.append(
    forkChoice("睡", "scene-act" + (left ? "" : " primary"), finishMoveIn,
      left ? "先睡一晚（还差 " + left + " 样）" : "先睡一晚"),
    el("p", { class: "base-boxes", title: "屋里的样子", "aria-label": "屋里的样子，看清了 " + seen + " 样" },
      [0, 1, 2, 3].map((i) => el("span", { class: i < seen ? "on" : "" }))),
    left ? el("p", { class: "hub-hint" }, [H("右边一格一格点开，看清四样再睡。")]) : ""
  );
  return box;
}

function finishMoveIn() {
  if (baseCount() < 4) {
    showModal("先睡一晚", "屋里的东西，我还没看清，再看一遍。", "", null, () => drawMoveIn());
    return;
  }
  S.talk = null;
  // 电视并在这里：后座这台开起来只有沙沙声，隔一幅墙的前座却在笑——
  // 两个后座/前座的第一夜对照，比单开一个「开一下电视」的假按钮更有用。
  showModal(
    "08-01 夜",
    "你开过后座那台电视，旧楼天线，只有沙沙声，又关掉。前座电视声隔着墙闷闷的，十一点前后关了。没有人敲门。储物室那边没有脚步声。你锁好门，躺下。",
    "荣汇街 28 号 后座",
    null,
    () => twoWeeks()
  );
}

function twoWeeks() {
  setTime("2014年8月1日–13日");
  // 这两周里也可能记笔记（开浏览器读留言之类）。不先给一天，笔记就会挂上整段区间。
  // 没点某一天之前，先算八月一日；点开哪天，openCalDay 会把它改成那一天。
  S.calNoteDay = "2014年8月1日";
  S.talk = null;
  S.mode = "cal";
  S.calOpen = true;
  drawCalendar();
}

// 日历每天：一天一格。前十日是暖的（她把这里当家），后三日出现极轻的裂缝。
// warm：暖色小标；crack：那三日的「说不清」标记。
const CAL_DAYS = [
  ["08-01", "搬进来。周生下楼回前座。你一个人站在走廊里。三把钥匙：大门、铁闸、天台。", "warm", "", true],
  ["08-02", "第一夜。前座电视声隔着墙，十一点前后关了。没有人敲门。", "warm", "示意-日历-0802-第一夜", true],
  ["08-03", "周上门修水龙头。真的不滴了。收工时说了句「有事拍门」。", "warm", "示意-日历-0803-修水龙头", true],
  ["08-04", "去楼下便利店买了洗衣粉和一只塑料盆。这里的自来水有铁味。", "warm", "", true],
  ["08-05", "散工回来晚了。你在门口脱鞋，怕吵到前座。其实隔一幅墙。", "warm", "", true],
  ["08-06", "把衣服晾在天台。周生的竹竿靠在墙角最上头那格。", "warm", "", true],
  ["08-07", "他送来一碗糖水，说「太热」。白瓷碗放在茶几晒痕旁边。第二天他还来收——这只碗以后不再出现。", "warm", "示意-日历-0807-糖水", true],
  ["08-08", "倾偈：陈美娟", "warm", "", true],
  ["08-09", "无事。把带来的书立起来，靠着墙。这只箱以后就是书架。", "warm", "", true],
  ["08-10", "第二笔周租，现金。他数两遍，忽然问有没有陌生人打电话来问这栋楼。你说没有。他点头，写在日历上。", "warm", "示意-日历-0810-交租", true],
  ["08-11", "夜里回来，铁闸推到一半，那声「咔」比前几天多响了一下。你回头看了一眼，什么也没有。", "crack", "示意-日历-0811-铁闸", true],
  ["08-12", "你把玩具车挪到墙角。过了一夜，它还在墙角，一点没动。你说不出为什么，反而有点不安，又把它放回茶几晒痕上，车头朝窗。", "crack", "示意-日历-0812-车放回茶几", true],
  ["08-13", "夜里水管响。你开了录音。听完只有水声。傍晚楼下有个戴帽子的男人在对街站了一会儿，又走了。", "crack", "示意-日历-0813-对街的人", true],
];

// 8月13日傍晚：平静时光的最后一拍日常。让玩家亲口跟周讲一次话、收一次好，
// 才翻到那页小结——后面 8/14 的翻脸才有东西可碎。不产线索、不解谜、不暗示。
function twoWeekCalm() {
  startTalk([
    line("", "傍晚，楼梯上有脚步。是周生，抱着一竿晒干的衣服，从天台下来。他在门口站住，没进来。"),
    line("周", "晒衫呀？天台最上嗰格我收返，唔阻你。", { zh: "晾衣服吗？天台最上面那格我收回来了，不挡你。" }),
    line("章慧琪", "唔阻。我用下面嗰格就得。", { zh: "不挡。我用下面那格就行。" }),
    line("周", "住咗半个月，惯唔惯？", { zh: "住了半个月，习惯了吗？" }),
    line("章慧琪", "……好静。静到有时会听见自己嘅声。", { zh: "……很静。静到有时听见自己的声音。" }),
    line("", "他笑了一下，把衣服换到另一只手。"),
    line("周", "旧楼系咁。我一个人坐前座，都系听收音机过日辰。", { zh: "旧楼就这样。我一个人坐前座，也是听收音机过日子。" }),
    // 「重建嗰啲嘢讲咗好耐，未轮到」在收租那天已经说过一遍，她还追着问过。
    // 半个月后再原样复述第三次，没有新东西——反而不提更可疑。这里只留招呼。
    line("周", "有咩唔妥就拍门，唔使客气。你安心住。", { zh: "有什么不方便就敲门，别客气。你安心住。" }),
    line("章慧琪", "嗯。", { zh: "嗯。" }),
    line("", "他没有多留，抱着衣服往下走。脚步很稳，一级一级，像做过很多次。"),
    { goto: () => { S.talk = null; S.mode = "cal"; twoWeekPaper(); } },
  ], "荣汇街 28 号 4 楼后座门口");
}

// 8月14日傍晚前的一页：她自己写的两周小结。不产线索、不解谜，只做「日常结束」的分隔。
//
// 这一页原先是一张白纸弹窗：外面一层纸、里面一个带框的表格、七行格线、底下一颗通栏的
// 「合上」。全游戏其它时候都是「人站在一个地方，画面是拍出来的」，只有这里像在填表——
// 一翻开就出戏。现在把纸放回场景里：同一张后座的照片压暗，一页纸摆在上面，日期写在
// 右上角（她自己习惯那样写），字是手写体，最后一行淡一点。底下不再是通栏按钮，
// 只一点小字「合上」——像把纸折起来收好。不产状态，不进存档。
function twoWeekPaper() {
  closeModal();
  if (notesLayer && !notesLayer.hidden) notesLayer.hidden = true;
  if (typeof ensureStageBackdrop === "function") ensureStageBackdrop();
  if (mapLayer) mapLayer.hidden = true;
  clearStage();
  const lines = [
    "两个礼拜。",
    "箱没 unpack，衣服晾了三次。",
    "周生修好水龙头。真的不滴了。",
    "他送过一次糖水，碗第二天来收。",
    "他把天台上格让给我。说，安心住。",
    "我把这里叫「屋企」，是第三日的事了。",
    "……应该可以住落去。",
  ];
  let box = null;
  const fold = () => {
    if (!box || box.dataset.leaving) return;
    box.dataset.leaving = "1";
    box.classList.add("leaving");
    sfx("paper");
    setTimeout(() => finishLevel(3), 380);
  };
  const paper = el("div", { class: "my-paper" }, [
    el("p", { class: "my-paper-date" }, ["八月十四日"]),
    el("div", { class: "my-paper-body" }, lines.map((t, i) =>
      el("p", { class: "my-paper-line" + (i === lines.length - 1 ? " soft" : "") }, [t]))),
    el("button", { type: "button", class: "my-paper-fold", onclick: fold }, ["合上"]),
  ]);
  box = el("div", { class: "desk scene-desk paper-desk" }, [
    imgSlot(pic(3, "场景-两周"), "scene-plate", "后座"),
    paper,
  ]);
  stage.append(box);
  renderPlaybar();
}

const CAL_WD = ["日", "一", "二", "三", "四", "五", "六"];
function weekdayOf(id) {
  return new Date(2014, 7, +id.slice(3)).getDay();
}

// 未点开的日格：一整张日期封面。没有摘要、没有照片——那天发生过什么，点开才知道。
function calCover(id) {
  return el("div", { class: "day-cover" }, [
    el("span", { class: "cover-m" }, [H("八月")]),
    el("strong", { class: "cover-d" }, [String(+id.slice(3))]),
  ]);
}

function drawCalendar() {
  baseView("cal");
  clearStage();
  const seenN = cnt(CAL13, S.calSeen);
  const left = CAL13.length - seenN;
  const box = el("div", { class: "desk scene-desk" }, [
    imgSlot(pic(3, "场景-两周"), "scene-plate", "后座"),
    el("div", { class: "calendar" }, [
      el("h2", {}, ["两周"]),
      el("div", {
        class: "days",
        onclick: (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;
          const id = btn.getAttribute("data-day");
          if (!id) return;
          withClue(btn.getAttribute("data-img"), () => openCalDay(id, btn.getAttribute("data-text") || ""));
        },
      }, CAL_DAYS.map(([id, text, tone, name]) => {
        const img = name ? pic(3, name) : "";
        const seen = !!S.calSeen[id];
        // 没点开的那一天只露一张日期封面：文字和照片留着，点开才给。
        const face = !seen
          ? calCover(id)
          : id === "08-08" ? dayMessage()
          : img ? imgSlot(img, "day-img", id)
          : el("div", { class: "day-img empty" }, [el("p", {}, [text])]);
        return el("button", {
          type: "button",
          class: (seen ? "seen " : "unread ") + (tone || ""),
          "data-day": id,
          "data-text": text,
          "data-img": img,
          "aria-label": H("八月 " + (+id.slice(3)) + " 日，") + (seen ? H("看过") : H("还没看")),
        }, [
          face,
          !seen
            ? el("span", { class: "day-label week" }, [H("星期" + CAL_WD[weekdayOf(id)])])
            : el("span", { class: "day-label" }, [id]),
          // 没点开的格右上角一颗空心圈：一眼看得出「这一格还没开」，
          // 点下去它会消失、纸也换色，玩家不会以为点了没反应。
          !seen ? el("span", { class: "day-todo", "aria-hidden": "true" }) : "",
          tone === "crack" ? el("span", { class: "day-crack", "aria-hidden": "true" }, ["·"]) : "",
        ]);
      })),
      el("p", { class: "cal-progress" + (left ? "" : " done") }, [
        left
          ? H("看过 " + seenN + "／13 天，还有 " + left + " 天没点开")
          : H("十三天都点开过了。"),
      ]),
    ]),
  ]);
  const hint = levelHint();
  stage.append(box, el("div", { class: "scene-actions fork task-note" }, [
    el("p", { class: "hub-hint" + (hint ? "" : " ready") }, [hint || "要做的都做完了。"]),
  ]));
  renderPlaybar();
}

function openCalDay(id, text) {
  S.calSeen[id] = true;
  // 日历那一关的钟是整段「8月1日–13日」，直接抄会把十三天的笔记全挤进「8月1日」。
  // 点开哪天，这一天的笔记就落哪天（core.js 的 noteDayText 只认第 3 关的这一个值）。
  S.calNoteDay = "2014年8月" + (+id.slice(3)) + "日";
  if (id === "08-08") {
    startChat("0808");
    return;
  }
  if (id === "08-12") note("car-still", "车放到角落，第二天还在。放回茶几，车头朝窗。");
  if (id === "08-11") note("gate-tick", "铁闸多响一下。回头，什么也没有。");
  if (id === "08-03") {
    S.base = S.base || {};
    if (S.base.tap) note("tap-fixed", "水龙头修好了。不滴了。");
  }
  if (id === "08-13") {
    const man = pic(3, "示意-日历-0813-对街的人");
    const rec = pic(3, "示意-日历-0813-录音只有水");
    const board = () => {
      flag("saw0813", true);
      showBoard("八月十三日", "2014年8月13日", [
        { img: man, title: "傍晚　对街的人", body: "骑楼底下，鸭舌帽压得低。他看的是这栋楼。" },
        { img: rec, title: "夜里　录音", item: item("rec-water") },
      ], () => drawCalendar(), { must: true });
    };
    if (flag("saw0813")) {
      board();
      return;
    }
    startTalk([
      line("", "八月十三日，傍晚。你下楼买饭，在楼门口等车过马路。", { clue: man }),
      line("", "对面骑楼底下，站着一个男人。鸭舌帽压得低，看不清脸。他没有看铺面，也没有看手机。他看的是这栋楼。"),
      line("", "你多看了一眼。他转过身，慢慢走开了。"),
      line("", "夜里水管响。你开了录音。听完，只有水声。", { clue: rec }),
      { goto: board },
    ], "荣汇街 28 号 楼下");
    return;
  }
  if (CAL_TALK[id]) {
    startTalk([
      ...CAL_TALK[id](),
      { goto: () => { S.talk = null; S.mode = "cal"; drawCalendar(); } },
    ], "荣汇街 28 号 4 楼后座", "face");
    return;
  }
  showModal(id, text);
}

const CAL_TALK = {
  "08-02": () => [
    line("", "八月二日。第一夜过去。"),
    line("", "前座的电视声隔着墙，闷闷的，十一点前后关了。楼下有车过，窗帘缝里一道光扫过去，又没了。"),
    line("", "你把箱子从门口推到墙角，怕挡路。这里安静得能听见自己翻身。"),
  ],
  "08-03": () => [
    line("", "八月三日。周蹲在厨房，扳手咬住水龙头。他拧紧，松手。你们一起等。"),
    line("", "一滴也没有。"),
    line("周", "得喇。真系唔滴喇。", { zh: "好了。真不滴了。" }),
    line("章慧琪", "之前点解会滴？", { zh: "之前为什么会滴？" }),
    line("周", "旧喉，胶圈老咗。换过就得。", { zh: "管子旧了，胶圈老化。换个就好。" }),
    line("章慧琪", "几多钱？我俾返你。", { zh: "多少钱？我还你。" }),
    line("周", "包喺租入面。有事拍门。", { zh: "算在租金里。有事敲门。" }),
    line("", "他收好工具，在门口站了一下，才回前座。"),
  ],
  "08-07": () => [
    line("", "八月七日夜里，门口敲了两下。周端着一只白瓷碗。"),
    line("周", "太热。饮碗糖水先瞓。绿豆沙，冇落陈皮。", { zh: "太热了。喝碗糖水再睡。绿豆沙，没放陈皮。" }),
    line("章慧琪", "唔该。碗我洗好拎过去俾你。", { zh: "谢谢。碗我洗好给你端过去。" }),
    line("周", "唔使。听日我上嚟收。", { zh: "不用。明天我上来收。" }),
    line("", "你把碗放在茶几上，晒痕旁边。第二天他真的上来收走了。"),
  ],
  "08-11": () => [
    line("", "八月十一日，夜里回来。楼道黑，你摸到铁闸。"),
    line("", "推到一半，铁闸响了一声——「咔」。"),
    line("", "前几天也响，但没有哪一次像这样，慢了半拍才合上。"),
    line("", "你回头看了一眼楼梯。楼梯黑着，一个人都没有。你把铁闸推到底，锁上，回屋。"),
  ],
  "08-12": () => [
    line("", "八月十二日。你顺手把茶几上的玩具车挪到墙角，免得挡路。"),
    line("", "第二天早上，它还在墙角，车头朝墙，跟你放下时一模一样。"),
    line("", "没有动过。你蹲下去看了两秒，心里反而不踏实。你把它放回茶几晒痕上，车头朝窗，跟搬进来那天一样。"),
  ],
  "08-10": () => [
    line("", "八月十日。第二笔周租，现金。他把钞票数了一遍，又数一遍。"),
    line("周", "啱数。……呢排有冇陌生人打电话嚟，问呢栋楼嘅嘢？", { zh: "数对了。……这阵子有没有陌生人打电话来，问这栋楼的事？" }),
    line("章慧琪", "冇。点解咁问？", { zh: "没有。怎么这么问？" }),
    line("周", "地产佬多。有人问，你话唔知就得。", { zh: "地产经纪多。有人问，你说不知道就行。" }),
    line("", "他点点头，在门边的月历上写了一笔。"),
  ],
};

// 过场图约 1MB：手机／Pages 上若等不到 onload 就开播，会黑好几秒。先预载再播。
function preloadCut(frames, done) {
  const urls = frames.map((f) => f.img).filter(Boolean);
  if (!urls.length) {
    done();
    return;
  }
  let left = urls.length;
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    done();
  };
  const tick = () => {
    left -= 1;
    if (left <= 0) finish();
  };
  setTimeout(finish, 4000);
  urls.forEach((id) => {
    const img = new Image();
    img.onload = tick;
    img.onerror = tick;
    img.src = picSrc(id);
    if (img.complete && img.naturalWidth) tick();
  });
}

// 过场：几格定格依次淡入。push 慢推镜；cap 压在下三分之一；sfx 在这一格亮起后 sfxAt 毫秒响。
// 点一下跳下一格，「跳过」直接走完。期间记作 card 模式，不入档，刷新回到上一个存档点。
function playCut(frames, done) {
  closeModal();
  S.mode = "card";
  const card = { type: "cut", frames, done, playing: false };
  S.card = card;
  // 预载未完先贴黑底，避免空台；图到了再开播
  clearStage();
  stage.append(el("div", { class: "desk caption-card cut" }));
  renderPlaybar();
  preloadCut(frames, () => {
    if (S.card !== card) return;
    drawCut(card);
  });
}

function drawCut(c) {
  if (!c || c.type !== "cut") return;
  // 已在播同一支：不要 clearStage 把画面清成黑底再从头来
  if (c.playing && stage.querySelector(".desk.cut")) return;
  clearStage();
  c.playing = true;
  const still = typeMotionOff();
  const desk = el("div", { class: "desk caption-card cut" });
  const plates = c.frames.map((f) => {
    const box = el("div", { class: "cut-frame" + (f.push && !still ? " push" : "") }, [
      f.img ? imgSlot(f.img, "cut-plate", "") : "",
      f.cap ? el("p", { class: "cut-cap" }, [f.cap]) : "",
    ]);
    box.style.setProperty("--dur", (f.ms + 1800) + "ms");
    if (f.origin) box.style.setProperty("--origin", f.origin);
    desk.append(box);
    return box;
  });
  let i = -1;
  let timer = null;
  let over = false;
  const live = () => desk.isConnected && S.card === c;
  const finish = () => {
    if (over) return;
    over = true;
    clearTimeout(timer);
    desk.classList.add("out");
    setTimeout(() => {
      if (S.card === c) S.card = null;
      if (!desk.isConnected) return;
      c.done();
    }, 450);
  };
  const next = () => {
    clearTimeout(timer);
    if (over) return;
    if (!live()) return;
    if (i >= 0) plates[i].classList.replace("on", "past");
    i += 1;
    if (i >= c.frames.length) return finish();
    const f = c.frames[i];
    plates[i].classList.add("on");
    if (f.sfx) setTimeout(() => { if (!over && live()) sfx(f.sfx); }, f.sfxAt || 0);
    timer = setTimeout(next, f.ms);
  };
  desk.addEventListener("click", next);
  desk.append(el("button", {
    type: "button",
    class: "cut-skip",
    onclick: (e) => { e.stopPropagation(); finish(); },
  }, ["跳过"]));
  stage.append(desk);
  renderPlaybar();
  requestAnimationFrame(() => requestAnimationFrame(next));
}

// 赴诊出门前：周背光站在门口，信封角露一截红圈。
// 这两格画面里没有窗，看不出时辰，白天也接得上；文件名沿用 04 夹旧名（见 图/游戏/README.md）。
function startTakeback() {
  playCut([
    // origin 压到 30%：推镜只放大 8%，锚点太高会把周头顶那点留白吃掉
    { img: pic(4, "场景-过场-八月十四傍晚"), ms: 6000, push: true, origin: "52% 30%", cap: "08-16　出门前" },
    { img: pic(4, "场景-过场-信封角"), ms: 3200, push: true, origin: "45% 50%" },
  ], doorTalk);
}

// 门口收回：笔记 + 红圈并板收进日记簿，记齐才去诊所（跳过会再弹）
function afterTakeback() {
  note("takeback", "出门赴诊前，周说要收回。手抖，信封朝里。他说重建，又说未定。");
  showBoard("出门前　八月十六日", "2014年8月16日 出门前", [
    {
      img: pic(4, "场景-过场-八月十四傍晚"),
      title: "楼梯口",
      body: "他说要收回自住。又说当我冇讲。手抖，信封朝里。",
    },
    {
      img: pic(4, "证据-红圈信封"),
      title: "红圈",
      item: item("letter-red"),
    },
  ], () => goClinic(), { must: true });
}

function doorTalk() {
  S.modal = null;
  setTime("2014年8月16日 周六 14:50");
  startTalk([
    line("", "你锁好门要出门。楼梯口撞见他。衬衫皱，领口却是干的，手背上青筋凸着。信封角朝里，像怕你看见。"),
    line("周", "章小姐。后座……我想收回自住。定金我退你。周租都退。你再住两日，走得唔得？", { zh: "章小姐。后座……我想收回来自己住。定金退你，周租也退。你再住两天，走得开吗？" }),
    line("章慧琪", "我冇地方去。……我啱啱先当咗呢度系屋企。", { zh: "我没地方去。……我才刚把这儿当成家。" }),
    line("周", "……算。当我冇讲。水喉有问题我再睇。", { zh: "……算了。当我没说。水管有问题我再来看。" }),
    line("", "信封角从指缝露出来，上面有一截红圈，字看不清。他的手抖了一下，又把信夹紧。"),
    {
      prompt: "他已经转身。你还要约四点的诊。",
      choices: [
        {
          label: "看信封。",
          then: () => showModal(
            "信封",
            "新闻纸一角。红笔圈住的字被他拇指挡住，只看见圈的弧。圈里的字看不清。",
            "2014年8月16日 出门前",
            "memo",
            () => drawTalk(),
            item("letter-red")
          ),
        },
        {
          label: "发生什么事？",
          then: [
            line("周", "冇。重建……未定。有人……你唔好问。", { zh: "没有。重建……还没定。有人……你别问。" }),
            { goto: afterTakeback },
          ],
        },
        {
          label: "我可以晚一点走。",
          then: [
            line("周", "唔使你答应。你住你嘅。", { zh: "不用你答应。你住你的。" }),
            { goto: afterTakeback },
          ],
        },
        {
          label: "不追。先记下这一幕。",
          then: [{ goto: afterTakeback }],
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
    note("car-move", "车头朝门。昨晚放的时候朝窗。");
    changed = true;
  }
  if (m === 91 && !n.fired.voice) {
    n.fired.voice = true;
    if (n.recording) {
      note("voice", "女人声「阿轩，返嚟食饭。」从储物室门底来。");
      if (flag("askedMudslide")) note("voice2", "同一声叠了一下。");
    }
    changed = true;
  }
  if (m === 101 && !n.fired.print) {
    n.fired.print = true;
    n.print = true;
    note("print", "门底湿脚印，到一半停住。");
    changed = true;
  }
  if (changed && !S.modal && S.mode === "night") drawNight();
}

function axuanItem() {
  return item("rec-axuan");
}

// 第 4 关：她只听见门底有个女人在叫「阿轩」。名字要等到 09-06 翻相框背面才知道。
function openAxuan(onClose) {
  showVoicemail("女人的声音", "阿轩，返嚟食饭。", onClose || (() => drawNight()), axuanItem(), "录音　08-15");
}

function printItem() {
  return item("photo-print");
}

function openPrint(onClose) {
  shootPolaroid(printItem(), onClose || (() => drawNight()));
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

// 第一夜开始：一滴水将落未落 → 灯亮进厅。不再先播一格空黑底（图未载完时整段像坏掉）。
function nightStart() {
  S.talk = null;
  S.night = { min: 63, car: "窗", recording: false, print: false, fired: {}, acted: {}, phase: "phone" };
  setTime(nightClockText());
  playCut([
    { img: pic(4, "场景-过场-一滴水"), ms: 2800, sfx: "drip", sfxAt: 900, origin: "82% 42%" },
    { img: pic(4, "场景-过场-第一夜灯亮"), ms: 3400, cap: "08-15　01:03", origin: "40% 55%" },
  ], () => {
    S.mode = "night";
    drawNight();
    startNightClock();
  });
}

// 储物室门底的副标题分三档，中间那一档是这一章唯一一处「你正在错过」的告示。
// 从前只写「那卷录音还在／锁着」——没开录音的时候写「锁着」，等于告诉她门本来就锁着，
// 里面本来没声音，那一下也就白过了。告示要长在物件上，不长在界面上。
function storageSub(n) {
  if (!(n.fired && n.fired.voice)) return "锁着。";
  return n.recording ? "那卷录音还在" : "门底有声音。手机在茶几上，没开。";
}

function drawNight() {
  baseView("night");
  clearStage();
  const n = S.night;
  const carText = n.car === "门" ? "车头朝门" : n.car === "地" ? "掉在地上，朝储物室" : "车头朝窗";
  const carImg = n.car === "门" ? pic(4, "示意-玩具车-车头朝门") : n.car === "地" ? pic(4, "示意-玩具车-掉在地上") : pic(4, "示意-玩具车-车头朝窗");
  const box = el("div", { class: "room scene-fit" });
  const sillDone = nightAct("sill");
  const looks = [
    hot("全家福", "女人在笑，缺一颗牙，头发齐肩。小男孩看向镜头外。", () => {
      markNight("family");
      showModal("全家福", "客厅墙上。女人在笑，缺一颗牙，头发齐肩。小男孩看向镜头外。她看了一眼，没有伸手去动它。" + (n.recording ? "录音开着——门外门底若有声，不会从相框上来。" : ""), "", null, () => drawNight());
    }, pic(4, "示意-全家福"), nightAct("family")),
      hot("玩具车", carText, () => {
        if (n.car === "窗") n.car = "门";
      markNight("car");
      markTonight("car");
      showModal("玩具车", n.car === "地" ? "掉在地上，车头朝储物室。敞篷座位里仍然没有灰。" : "车头朝向和刚才不同了。搬进来时车头朝窗。茶几仍靠着储物室那面墙。", "", null, () => drawNight());
    }, carImg, nightAct("car")),
    hot("窗台水印", sillDone ? sillLine(sillDone) : "童码。湿了。今晚没下雨。", () => sillMenu(), pic(4, "示意-窗台水印"), !!sillDone),
    hot("水龙头", "拧紧后，三秒后又滴水。", () => {
        if (n.recording) note("drip", "滴水里夹着女人气音，叫不全。");
      markNight("tap");
      markTonight("tap");
      sfx("drip");
      showModal("水龙头", "八月三日修好之后一直不滴。今夜拧紧，等了三秒，又滴下来。");
    }, pic(4, "示意-水龙头"), nightAct("tap")),
    hot("储物室门底", storageSub(n), () => {
      markTonight("storage");
      if (n.fired && n.fired.voice && n.recording) {
        markNight("heardAxuan");
        openAxuan();
        return;
      }
      markNight("door");
      showModal("储物室", "门锁着。里面有纸页被翻的声音，很慢。门缝下没有光。你敲了门，没有人应。隔壁电视的笑声准时传来。搬进来那晚，这门也是锁着的。");
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
  const loose = Object.keys(S.tonight || {}).filter((id) => !(S.pairs || {})[id]).length;
  box.append(
    forkChoice("☎", "scene-act", () => phoneMenu(), phoneLabel),
    forkChoice("并", "scene-act" + (ready ? " done" : loose ? " primary" : ""), () => openPairs(() => drawNight()), "摆在一起（" + pairCount() + "／3）")
  );
  if (!ready) {
    box.append(el("p", { class: "hub-hint" }, [loose
      ? "找到 " + loose + " 处跟搬进来那晚不一样的，摆在一起看看。"
      : "先在屋里点点看，哪里跟搬进来那晚不一样；找到了再摆在一起。"]));
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

function sillPhoto() {
  flag("photoSill", true);
  markTonight("sill");
  note("sill", "窗台童码。鞋并上去比：小两号。今晚没下雨。");
  shootPolaroid(sillItem(), () => drawNight());
}

function sillMenu() {
  const done = nightAct("sill");
  if (done === "photo") {
    shootPolaroid(sillItem(), () => drawNight());
    return;
  }
  // 擦掉也算看见异样（进摆在一起）；同一位置又有一圈，可再拍
  if (done === "wipe") {
    const clue = CLUE_IMG;
    closeModal();
    const ch = el("div", { class: "choices" });
    ch.append(el("button", {
      type: "button",
      onclick: () => {
        markNight("sill", "photo");
        closeModal();
        withClue(clue, sillPhoto);
      },
    }, ["拍照"]));
    ch.append(el("button", {
      type: "button",
      onclick: () => {
        closeModal();
        showModal("窗台水印", sillLine("wipe"), "", null, () => drawNight());
      },
    }, ["先这样"]));
    const sheet = el("div", { class: "sheet" }, [
      el("h3", {}, ["窗台水印"]),
      clueSlot(clue, "窗台水印"),
      el("p", { class: "talk-text" }, ["擦掉了。同一位置又有一圈。"]),
      ch,
    ]);
    S.modal = el("div", { class: "modal", id: "game-modal" }, [sheet]);
    stage.append(S.modal);
    return;
  }
  // 不理：旁支，可再开一次补擦／拍（不锁死）
  if (done && done !== "skip") {
    showModal("窗台水印", sillLine(done));
    return;
  }
  const clue = CLUE_IMG;
  closeModal();
  const ch = el("div", { class: "choices" });
  [
    ["擦掉", "wipe", () => {
      flag("wipedSill", true);
      markTonight("sill");
      note("sill", "窗台童码。擦掉了，同一位置又有一圈。今晚没下雨。");
      showModal("窗台水印", "擦掉了。水印还是新的。同一位置又有一圈。", "", null, () => drawNight());
    }],
    ["拍照", "photo", sillPhoto],
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
        showModal("陈家豪", "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n三点我喺你楼下。", "短讯　已读", "memo", () => phoneMenu());
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
    phoneStatus("拨号"),
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
    line("差人", "九九九紧急求助。有冇人受伤？有冇人入咗屋？", { zh: "九九九紧急求助。有人受伤吗？有人进屋了吗？" }),
    line("章慧琪", "冇。……冇人伤。有声。有架车自己转。", { zh: "没有。……没人受伤。有声音。有辆车自己转。" }),
    line("差人", "冇人受伤、冇人入屋，我哋唔会派车。你可以去就近警署备案。身体唔舒服就打九九九叫白车。", { zh: "没人受伤、没人进屋，我们不会派车。你可以去就近警署备案。身体不舒服就打九九九叫救护车。" }),
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
  setTime("2014年8月15日 周五 05:40");
  startTalk([
    line("", "天快亮了。隔着墙，前座有人压着嗓子说话，只有他一个人的声音。"),
    line("", "你只听清一个字：「吓。」之后就没有了。", { note: ["whisper", "前座有人说话。他说吓。"] }),
    { goto: () => finishLevel(4) },
  ], "后座", "face");
}

function passFrontDoor() {
  // A-1：夜里敲过门的人已经听过「你对脚湿咗？」。天亮再从正门出去，只走，不再问第二遍。
  const asked = flag("knockedZhou");
  flag("knockedZhou", true);
  setTime("2014年8月15日 周五 清晨");
  if (asked) {
    hubTalk([
      line("", "天亮了。你经过前座门口。门关着，里头没有声音。"),
      { goto: () => (ev("note-dry") ? stepPast() : keepMust(item("note-dry"), stepPast)) },
    ], "4 楼前座门口", "face");
    return;
  }
  hubTalk([
    line("", "天亮了。你经过前座门口。"),
    line("周", "你对脚湿咗？", { zh: "你脚湿了？" }),
    line("章慧琪", "冇。……干嘅。", { zh: "没有。……干的。" }),
    line("周", "噢。楼梯啱啱拖完地，我以为你踩过。", { zh: "噢。楼梯刚拖完，我以为你踩过。" }),
    line("章慧琪", "……你咁早拖地？", { zh: "……你这么早拖地？" }),
    line("周", "瞓唔着。旧楼返潮。", { zh: "睡不着。旧楼返潮。" }),
    { note: ["wet", "周问我脚湿不湿。我没同他讲过脚印。"] },
    line("", "你低头看。鞋子是干的。他关上门。"),
    { goto: () => keepMust(item("note-dry"), stepPast) },
  ], "4 楼前座门口", "face");
}

function knockZhou() {
  if (flag("knockedZhou")) {
    showModal("周先生", "已经敲过。他说是水管，问你脚湿不湿。你没有。");
    return;
  }
  flag("knockedZhou", true);
  const late = (S.night.min || 63) >= 79;
  startTalk([
    line("周", late
      ? "响？水喉嚟㗎。我开住电视。听日日头帮你睇。你怕就开灯，开电视。唔好周围走，尤其唔好上天台，黑。"
      : "响？水喉嚟㗎。听日日头帮你睇。你怕就开灯，开电视。唔好周围走，尤其唔好上天台，黑。",
      { zh: late
        ? "响？是水管。我电视开着呢。明天白天帮你看。怕就开灯，开电视。别到处走，尤其别上天台，黑。"
        : "响？是水管。明天白天帮你看。怕就开灯，开电视。别到处走，尤其别上天台，黑。" }),
    line("周", "你对脚湿咗？", { zh: "你脚湿了？" }),
    line("章慧琪", "冇。……我对脚系干嘅。", { zh: "没有。……我脚是干的。" }),
    { note: ["wet", "周问我脚湿不湿。我没同他讲过脚印。"] },
    line("", late ? "他过了几秒才开门。睡衣领口是湿的。他关上门。你低头看，鞋是干的。" : "他开门很慢，像刚睡醒。他关上门。你低头看，鞋是干的。"),
    { goto: () => keepMust(item("note-dry"), stepPast) },
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
  // 过关前只拦＋提示，不硬弹证物窗（怪异）
  if (pairCount() < 3) {
    tip("先把不一样的摆在一起。", { nearBar: true });
    if (S.mode === "night") drawNight();
    return;
  }
  stopNightClock();
  const n = S.night;
  n.fired = n.fired || {};
  const missedVoice = !!(n.recording && !n.fired.voice);
  const missedPrint = !n.fired.print;
  const unseenVoice = !!(n.recording && !nightAct("heardAxuan"));
  const unseenPrint = !nightAct("sawPrint");
  if (!n.fired.car) {
    n.car = "地";
    note("car-move", "车头朝门。昨晚放的时候朝窗。");
  }
  // 时钟追到天亮：屋里状态到位，漏看的让自己点，不连环弹窗
  if (missedVoice) {
    note("voice", "女人声「阿轩，返嚟食饭。」从储物室门底来。");
  }
  if (missedPrint) {
    n.print = true;
    note("print", "门底湿脚印，到一半停住。");
  }
  n.fired = { light: true, car: true, voice: true, print: true };
  n.min = 101;
  n.phase = "leave";
  setTime(nightClockText());
  // 录音是这一关的必做，所以这里也要拦一道。原来的判断是反的：missedVoice／unseenVoice
  // 都以 n.recording 为前提，于是「压根没开录音」的人一个提示都收不到，直接被送去天亮。
  const recDone = !!(hasEvidence("rec-axuan") || noted("voice"));
  if (missedVoice || unseenVoice || missedPrint || unseenPrint || !recDone) {
    tip(
      !recDone
        ? "录音还没开。开了，再等到天亮。"
        : missedPrint || unseenPrint
          ? "门底那边，天亮前再看一眼。"
          : "储物室那边，天亮前再看一眼。",
      { nearBar: true }
    );
    S.talk = null;
    S.mode = "night";
    drawNight();
    return;
  }
  leaveNightToMei();
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
  { me: ["荣汇街。旧。平。夜里响。今次有嘢会自己动。唔係我「见到」。"] },
  { she: "你又……阿乐同我讲过。你今次真搬出去住，我以为会好。" },
  { me: ["我唔想再听人话我神经。"] },
  { she: "我冇话你神经。你一个人我担心。唔好再同阿乐讲，佢听唔懂。" },
  { me: ["咁你想点。"] },
  { she: "我想你同能听的人讲。家豪大学识嘅朋友，读医嗰个。年夜饭佢喝醉，成晚讲呢个人。你问过边个阿明，记得未？" },
  { me: ["就系姐夫成日攞佢做借口嗰个。"] },
  { she: "系。我见过一次，家豪去医院接佢收工。佢成日食烟，恤衫都系味——人斯文，唔会一开口就话你疯。我叫家豪问下得唔得——你唔想去，当我冇讲。" },
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
              keepMust(item("note-dry"), backToHub);
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
          go: () => showModal("陈家豪", "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n三点我喺你楼下。", "短讯　已读", "memo"),
        },
        {
          title: "拍一张：玩具车", sub: () => (flag("clinicAddr") ? "出门前。" : "先拍好。"), img: pic(5, "示意-拍玩具车"),
          show: () => !!(S.chatLogs.mei16 && S.chatLogs.mei16.closed),
          seen: () => ev("photo-car-out"),
          go: () => shootPolaroid(item("photo-car-out"), backToHub),
        },
        {
          title: "拍一张：水龙头", sub: () => (flag("clinicAddr") ? "出门前，拧紧。" : "先拍好，拧紧。"), img: pic(5, "示意-拍水龙头"),
          show: () => !!(S.chatLogs.mei16 && S.chatLogs.mei16.closed),
          seen: () => ev("photo-tap-out"),
          go: () => shootPolaroid(item("photo-tap-out"), backToHub),
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
      // 抬头三格：日子、时刻、谁说的。靠 flex 的 gap 分开，不在字符串里塞全角空格
      el("div", { class: "bubble-meta" }, [
        el("span", { class: "bm-day" }, [r.when]),
        el("span", { class: "bm-time" }, [r.clock]),
        el("span", { class: "bm-who" }, [r.who]),
      ]),
      el("div", { class: "bubble-text " + whoClass(r.who) }, [r.text]),
    ]));
  });
}

/* 窗口最下面那条状态：倾偈 ／ 网络：在线。
   中间那根竖线是真的 1px，不再用「　│　」拿全角空格和制表符拼。 */
function chatStatusBar() {
  return el("div", { class: "chat-status" }, [
    el("span", {}, ["倾偈"]),
    el("span", { class: "chat-st-sep", "aria-hidden": "true" }),
    el("span", {}, ["网络：在线"]),
  ]);
}

let chatHeard = { pack: "", n: 0 };

function drawChat() {
  baseView("chat");
  clearStage();
  const box = el("div", { class: "desk im-desk" });
  box.append(imgSlot("00-通用/场景-倾偈窗口", "talk-bg", "倾偈"));
  const chat = el("div", { class: "chat" });
  chat.append(el("div", { class: "chat-bar" }, [
    el("span", { class: "chat-title" }, [
      el("span", { class: "chat-app" }, ["倾偈"]),
      el("span", { class: "chat-dash", "aria-hidden": "true" }, ["—"]),
      el("span", {}, ["陈美娟"]),
    ]),
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
      el("span", {}, [S.chatPack === "0808" ? "在线" : "离线"]),
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
    chat.append(chatStatusBar());
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
        el("span", { class: "bm-who" }, [mine ? "章慧琪" : "陈美娟"]),
        el("span", { class: "bm-time" }, [chatClock(i)]),
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
    chat.append(chatStatusBar());
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
            if (t === "我不是病人。") flag("notPatient", true);
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
  chat.append(chatStatusBar());
  box.append(chat);
  stage.append(box);
  pinLog();
  renderPlaybar();
}

function howardCall() {
  flag("howardCalled", true);
  setTime("2014年8月15日 周五 11:20");
  startTalk([
    flag("notPatient")
      ? line("陈家豪", "阿琪？美娟叫我打俾你。佢话你唔想当病人睇——唔紧要，当见个朋友。我喺差馆。住唔住得惯？旧楼响，好正常。", { zh: "阿琪？美娟让我打给你的。她说你不想当病人去看——没关系，当见个朋友。我在局里。住得惯吗？旧楼响，正常。" })
      : line("陈家豪", "阿琪？美娟叫我打俾你。我喺差馆。住唔住得惯？旧楼响，好正常。", { zh: "阿琪？美娟让我打给你的。我在局里。住得惯吗？旧楼响，正常。" }),
    line("章慧琪", "车会自己转。……录音入面有个女人叫仔食饭。前两个礼拜冇㗎。", { zh: "车会自己转。……录音里有个女人叫孩子吃饭。前两个礼拜都没有。" }),
    line("陈家豪", "美娟话你搬咗去深水埗。荣汇街，系咪？旧楼。我带你去见个人。唔系急症。大学识嘅，佢读医——我读社会学，宿舍隔一层。日头喺医院，夜晚同礼拜六喺湾仔有私家诊所。我哋叫佢阿明。罗启明。团年饭我讲过。", { zh: "美娟说你搬去深水埗了。荣汇街，是吧？旧楼。我带你见个人。不是急症。大学认识的，他读医——我读社会学，宿舍隔一层。白天在医院，晚上和周六在湾仔开私家诊所。我们都叫他阿明。罗启明。年夜饭我提过。" }),
    line("章慧琪", "就系……你成日攞佢做借口嗰个？", { zh: "就是……你老拿他当借口那个？" }),
    line("陈家豪", "系。我识佢十几年，有事都系搵佢。佢唔会问你点解，净系问你食咗饭未。你照直讲就得，唔好同佢客气——你讲一句，佢会当成自己嘅事去做。忙起上嚟，诊所楼下嗰间面档，都要我打电话去叫。", { zh: "是。我认识他十几年，有事都找他。他不会问你为什么，只问你吃饭了没有。你照直说就行，别跟他客气——你说一句，他会当成自己的事去做。忙起来，诊所楼下那家面档，都得我打电话去叫。" }),
    line("章慧琪", "佢……点㗎？", { zh: "他……人怎么样？" }),
    // 「车祸」不放这里。他先在电话里把这句讲完，玩家再选「『不太好』是什么意思」，
    // 追问得到的是复述——同一件事说两遍。留白，让「太好了，只是精神有时不好」停在半句，
    // 追问才吐出车祸，人物也才像在替谁遮着什么。
    line("陈家豪", "专业。用心。佢本人精神有时唔太好。你当我冇讲。睇病人一流。", { zh: "专业。用心。他本人精神有时不太好。你就当我没说。看病一流。" }),
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
          note: ["worry", "陈说阿明以前出过车祸，之后会懵、接不上昨日。叫我别让他知道。"],
          then: [
            line("陈家豪", "失眠，健忘，有时接唔上琴日——车祸之后就咁。你唔好同佢讲系我讲嘅。佢唔钟意人担心佢。我担心就算。", { zh: "失眠，健忘，有时候接不上昨天——车祸之后就这样。你别跟他说是我说的。他不喜欢别人担心他。我担心就行。" }),
            ...howardClose(),
          ],
        },
        {
          label: "你为什么这么快就把我塞给他？",
          flag: "askedWhyFast",
          then: [
            line("陈家豪", "因为你系自己人。因为佢需要……因为佢最识呢样。我车你过去，你安心。", { zh: "因为你是自己人。因为他需要……因为他最懂这个。我开车送你过去，你放心。" }),
            ...howardClose(),
          ],
        },
      ],
    },
  ], "来电 陈家豪", "phone", { incoming: true, contact: "陈家豪", number: "陈家豪" });
}

function howardClose() {
  return [
    line("陈家豪", "准时去见佢就得。旧楼啲嘢，自己查越查越惊。你安心去。", { zh: "准时去见他就是了。旧楼那些事，自己查越查越怕。你安心去。" }),
    { note: ["dontlook", "陈叫我准时见阿明。别自己乱查。"], who: "陈家豪", text: "我收线喇。等阵发地址俾你。同一部手机。", zh: "我挂了。等会儿把地址发你。还是这部手机。" },
    { goto: howardSms },
  ];
}

function howardSms() {
  setTime("2014年8月15日 周五 11:24");
  flag("clinicAddr", true);
  startTalk([
    line("陈家豪", "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n三点我喺你楼下。", { zh: "湾仔澄心诊所，罗启明 Kimon Law。明天 16:00。\n三点我在你楼下。" }),
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
  ], "手机", "sms", { contact: "陈家豪", number: "陈家豪" });
}

function afterHowardSms() {
  waitWeek(
    "2014年8月15日 周五 11:24",
    "地址到了，明天赴约。",
    "",
    () => backToHub()
  );
}
