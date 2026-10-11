/* story-late.js — split from story.js; load order: early -> clinic -> late */
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
