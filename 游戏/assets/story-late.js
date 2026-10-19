/* story-late.js — split from story.js; load order: early -> clinic -> late */
function visitHome() {
  setTime("2014年9月6日 周六 21:40");
  S.visit = S.visit || {};
  startTalk([
    line("周", "你真系带人上嚟。糖水煲好咗，摊冻咗。", { zh: "你真带人上来了。糖水煮好了，放凉了。" }),
    line("", "他手里端着一碗，碗边没有热气。不是八月七日那只白瓷碗" + (flag("meiStay") ? "，也不是表姐门口的汤" : "") + "。"),
    line("罗启明", "唔使。我哋嚟听间屋。", { zh: "不用。我们来听房子。" }),
    line("周", "间屋唔会害人。人先会害自己。", { zh: "屋子不会害人。是人先害自己。" }),
    line("", "罗启明进门，在门槛上停了一下，摸了一把外套口袋，没有掏出来。玩具车朝向储物室。"),
    line("罗启明", "你带路。你记低过嘅，带我去睇。我跟住你。", { zh: "你带路。你记下过的，带我去看。我跟着你。" }),
    { goto: () => enterHub("visit", "hall") },
  ], "荣汇街后座", "face");
}

// 带路：先一句你看的，再一句他看的
function gazeLead(you, him, beats) {
  hubTalk([
    line("", you),
    line("", him),
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
    "你先看门底。小孩的湿脚印走到一半停住的地方——今晚是干的。",
    "他没有看门底。",
    [
    line("", "他戴上耳机听录音。听到「阿轩，返嚟食饭」时，目光突然转向走廊尽头。你看过去，那里只有黑暗——没有人影。他低声数了四下，目光停在半空中，大约一个人头的高度。"),
    line("章慧琪", "你见到咩？", { zh: "你看见了什么？" }),
    line("罗启明", "一个女人。长头发。唔系呢张相入面个太太。可能系反光。", { zh: "一个女人……长发。不是照片里那位太太。可能是反光。" }),
    line("章慧琪", "你都见到。……四个礼拜六，我就系靠「礼拜六见到你」捱过嚟。你喺度，我就未癫。", { zh: "你也看见了。……四个星期六，我就是靠「星期六见到你」撑过来的。你在，我就还没疯。" }),
    line("罗启明", "我见到嘅未必系你见到嘅。你唔好靠我只眼。亦唔好靠我呢个人。", { zh: "我见到的未必是你见到的。你别靠我这只眼睛。也别靠我这个人。" }),
    {
      prompt: "……",
      choices: [
        {
          label: "我看见的是小孩脚印。",
          then: [
            line("罗启明", "我哋见到嘅唔系同一个。呢点好紧要。你唔好改口迁就我。", { zh: "我们看到的不是同一个。这点要紧。你别改口迁就我。", note: ["notsame", "我们看见的不是同一只。"] }),
          ],
        },
        {
          label: "是相框里那个女人？",
          then: [
            line("罗启明", "相入面个太太头发冇咁长——齐膊头。我见到嗰个过晒膊头。可能系反光。", { zh: "照片里那位太太头发没这么长——齐肩。我看到的过了肩。可能反光。" }),
            line("罗启明", "我哋见到嘅唔系同一个。呢点好紧要。你唔好改口迁就我。", { zh: "我们看见的，不是同一个。这点要紧。你别改口迁就我。", note: ["notsame", "我们看见的不是同一只。"] }),
          ],
        },
        {
          label: "不说话，去走廊。",
          then: [
            line("", "储物室门锁着，门底下是干的。阿明没有跟过来，站在客厅里不动。"),
            line("罗启明", "你望门底，我望门顶。唔系同一个。", { zh: "你看门底下，我看门顶上。不是同一个。", note: ["notsame", "我们看见的不是同一只。"] }),
          ],
        },
      ],
    },
    ]
  );
}

function leadTap() {
  gazeLead("你看水喉嘴。一滴挂住，还没有掉。", "他没有看水喉。他看手表。", [
    line("", "阿明把水龙头拧紧，等了三秒，不滴了。他又等了一会儿，又滴了。"),
    line("罗启明", "迟三秒。人手拨一拨，都做得到。", { zh: "晚三秒。人手拨一下，也做得到。" }),
    line("章慧琪", "你意思系……有人整？", { zh: "你的意思是……有人弄的？" }),
    line("罗启明", "我未讲系人。我讲做得到。做得到同做咗，系两回事。", { zh: "我没说是人。我说做得到。做得到跟做了，是两回事。" }),
    line("", "他从公事包取出那只金属夹子，夹着现场笔记，写字。你没有凑过去看。字写得很短。", { note: ["delay", "阿明在本子上写了：延迟三秒。"] }),
  ]);
}

function leadFamily() {
  S.visit.family = true;
  gazeLead("你看全家福。女人缺一颗牙，头发齐肩。小男孩望着镜头外面。", "他看的是相框后面那两个纸箱。", [
    line("罗启明", "呢张全家福，你搬嚟就挂喺度？", { zh: "这张全家福，你一搬来就挂着？" }),
    line("章慧琪", "喺度……周生话佢唔舍得掉。", { zh: "一直挂着……周先生说舍不得扔。" }),
    line("罗启明", "唔舍得掉，就掉喺你个厅。", { zh: "舍不得扔，就搁你客厅里。" }),
    {
      prompt: "相框有点歪。",
      choices: [
        { label: "翻过来看", then: [{ goto: () => keepThen(item("photo-back"), stepPast) }] },
        { label: "挂回去", then: [] },
      ],
    },
  ]);
}

function leadCar() {
  S.visit.car = true;
  gazeLead("你看那辆敞篷车。掉在地上，车头朝储物室。茶几靠着储物室那面墙。", "他没有看车。他看你看车的样子。", [
    line("罗启明", "架玩具车，你每晚都望住？", { zh: "那辆玩具车，你每晚都盯着？" }),
    line("章慧琪", "每晚……都望。", { zh: "每晚……都盯着。" }),
    line("罗启明", "我记低。望得太密，人会攰。车唔会。", { zh: "我记下。盯得太密，人会累。车不会。" }),
  ]);
}

function visitTowel() {
  S.visit.towel = true;
  hubTalk([
    line("", "周在门外敲了一下门，递进来一条毛巾，没有进来。他额上有汗，衬衫领口湿了一点。"),
    line("周", "医生面色好青。呢栋楼旧，焗。", { zh: "医生脸色好青。这栋楼旧，闷。" }),
    line("罗启明", "周先生，十二乡嗰场山泥，系边一年？", { zh: "周先生，十二乡那场山泥，是哪一年？" }),
    line("周", "一二年。你都睇新闻？", { zh: "一二年。你也看新闻？" }),
    line("罗启明", "职业病。", { zh: "职业病。" }),
    line("周", "医生查天灾。我当你关心啦。糖水真系唔饮？", { zh: "医生查天灾。我当你是关心吧。糖水真不喝？" }),
  ], "荣汇街后座", "face");
}

function visitFarewell() {
  S.visit.left = true;
  S.hub.at = "corridor";
  hubTalk([
    line("罗启明", "听日我执好笔记俾你。你今晚开住灯瞓。唔好上天台。", { zh: "明天我把笔记整理好给你。今晚开着灯睡。别上天台。" }),
    line("章慧琪", "你自己都话……唔好上天台。", { zh: "你自己都说……别上天台。" }),
    line("罗启明", "风大。", { zh: "风大。" }),
    line("章慧琪", "你本笔记……会唔会写我见鬼？", { zh: "你那本笔记……会不会写我见鬼？" }),
    line("罗启明", "写你见到乜、几点、喺边。「鬼」字我唔写。", { zh: "写你看见什么、几点、在哪儿。「鬼」字我不写。" }),
    line("章慧琪", "听日几点？", { zh: "明天几点？" }),
    line("罗启明", "下昼。约咗就系约咗。", { zh: "下午。说好了就是说好了。" }),
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
        {
          title: "车底下", sub: () => (evSeen("paper-ming") ? "他撕下来的那页。" : "压着一张纸。"), img: pic(13, "证据-笔记一页"),
          show: () => !!S.visit.left,
          seen: () => evSeen("paper-ming"),
          go: () => peekItem("paper-ming", backToHub),
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
    line("周", "啲人开始查喇。你之前话吓走佢就够……而家又话唔够。……我知。留唔得。", { zh: "人开始查了。你之前说吓走她就够……现在又说不够。……我知道。留不得。" }),
    {
      prompt: "另一端听不清。",
      choices: [
        {
          label: "走开。",
          note: ["phone-you", "周在储物室打电话。他说留不得。"],
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
    line("罗启明", "笔记我话今日执好俾你。本簿唔喺度。", { zh: "笔记我说今天整理好给你。本子不在。" }),
    line("章慧琪", "你……仲记唔记得琴晚上嚟？", { zh: "你……还记不记得昨晚上来？" }),
    line("罗启明", "记得。玩具车、水喉、迟三秒。十二乡嗰年。我叫你唔好上天台。", { zh: "记得。玩具车，水龙头，晚三秒。十二乡那一年。我叫你别上天台。" }),
    line("章慧琪", "你话见到一个长发女人。唔系相入面个太太。", { zh: "你说看见一个长发女人……不是照片里那位太太。" }),
    line("罗启明", "我记得自己望过走廊。而家个女人唔喺呢间白房。你唔好帮我补。本簿唔喺度，我对唔返自己写过定冇写过。", { zh: "我记得自己望过走廊。这会儿那个女人，不在这间白房。你别替我补。本子不在。我对不上自己写过没有。" }),
    line("", "他握着笔，低声数了四下，才把笔放下。"),
    line("章慧琪", "你好似……唔记得咗。", { zh: "你像是……不记得了。" }),
    line("罗启明", "失忆唔系成晚空白。车、水喉、三秒，我讲得出。走廊嗰个……喺呢间房谂唔返。旧伤嚟㗎。……车祸。", { zh: "失忆不是整晚空白。车、水龙头、三秒，我讲得出。走廊那个……在这间房里想不起来。旧伤。……车祸。" }),
    ...(evSeen("paper-ming") ? [
      line("章慧琪", "你仲撕咗一页，压喺架车底。", { zh: "你还撕了一页，压在车底下。" }),
      line("", "你把那页纸摊在桌上。他看了很久，没有伸手去拿。"),
      line("罗启明", "……系我嘅字。我唔记得撕过。走廊尽头嗰行，系我自己划嘅。", { zh: "……是我的字。我不记得撕过。走廊尽头那行，是我自己划掉的。" }),
    ] : []),
    line("章慧琪", "琴日你话见到……我就靠你呢句。今日你又话佢唔喺度。", { zh: "昨天你说看见了……我就靠你这句。今天你又说她不在。" }),
    line("章慧琪", "你写低咗㗎？我睇到你写。本簿唔喺度……系有人拎走，定系你唔想俾我？", { zh: "你写下来了吧？我看见你写的。本子不在……是有人拿走，还是你不想给我？" }),
    line("罗启明", "我写过。唔喺度喇。我对唔返自己写过啲咩。唔好帮我估系边个拎。", { zh: "我写过。不在了。我对不上自己写过什么。别帮我猜是谁拿的。", note: ["forget", "他说本子不在，却讲得出一串细节。他说是旧伤——车祸。"] }),
    line("", "他起身去倒水。工作台上的东西摊着。"),
    { goto: () => { S.miss = S.miss || {}; enterHub("miss", "room"); } },
  ], "澄心诊室", "face");
}

const MAIL_DIRT = {
  id: "mail-dirt",
  kind: "邮件",
  title: "你信紧嗰个医生",
  key: "名字涂掉，露出一个鱼",
  time: "2014年9月7日",
  body: "二〇〇四年十一月，维港大学，女学生坠楼。新闻写男友罗某，自称有责任。名字涂掉，露出一个鱼。偷拍：年轻的罗，旁边长发女生望住他。没有全名。",
  img: pic(14, "证据-你信紧的医生"),
};

function missDesk() {
  S.miss.desk = true;
  showModal(
    "他的工作台",
    "电脑螢幕上的日历：九月六日晚「荣汇街上门」那一条被删掉了，回收站是空的。不是墙挂日历。",
    "桌上那只金属夹子还在。本子不见了——上门那晚夹子里有本，你见过他写。",
    "scene",
    () => { note("stolen", "上门行程被删了。现场笔记不见。他不是不记得去过。"); backToHub(); }
  );
}

function missChen() {
  hubTalk([
    line("陈家豪", "你又嚟。佢琴日加班太夜……人会懵。你唔好太靠一个人。阿明……唔啱深交。佢对边个都好。你唔好当自己特别。人会攰。", { zh: "你又来。他昨天加班太晚……人会发懵。你别太靠一个人。阿明……不适合深交。他对谁都好。你别当自己特别。人会累。" }),
    line("章慧琪", "佢琴晚喺我屋企。你知唔知？", { zh: "他昨晚在我家。你知道吗？" }),
    line("陈家豪", "佢去过边度，我知——佢电话开住俾我睇位置。佢唔记得，我记得。", { zh: "他去过哪儿，我知道——他电话开着让我看位置。他不记得，我记得。" }),
    {
      prompt: "……",
      choices: [
        {
          label: "你动过他的东西？",
          then: [
            line("陈家豪", "我帮佢执过。佢自己会乱。你怀疑我……不如怀疑嗰栋楼。", { zh: "我帮他收拾过。他自己就乱。你怀疑我……不如怀疑那栋楼。" }),
            line("", "他说这句话说得太快。钥匙在他口袋里碰响了一下。"),
            { goto: () => { S.miss.chen = "touched"; backToHub(); } },
          ],
        },
        {
          label: "你要我离开他。",
          then: [
            line("陈家豪", "我要你安全。亦要佢安全。两个人一齐发病……会一齐跳。我见过。", { zh: "我要你安全。也要他安全。两个人一起发病……会一起跳。我见过。" }),
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

// 发件人没有显示名称，收件箱里只露出一串地址
const MAIL_FROM = "a2291hk@yahoo.com.hk";
const MAIL_SUBJ = "你信紧的医生";
const MAIL_TEXT = "附件。自己睇。";
const MAIL_OLD = [
  ["香港宽频", "昨天", "8月份账单", "你的8月份账单已备妥，请于9月15日或之前缴费。"],
  ["廿八屋", "星期五", "你收藏的盘源有更新", "大角咀、深水埗本周新盘 12 个。"],
  ["HSBC", "9月1日", "电子月结单已备妥", "请登入网上理财查阅。此电邮由系统发出，请勿回覆。"],
];
const MAIL_ATT = [
  [1, "scan0001.jpg", "212 KB", pic(14, "示意-附件一新闻扫描")],
  [2, "IMG_0412.JPG", "486 KB", pic(14, "示意-附件二偷拍照片")],
];

function mailPhone(screen, kids) {
  closeModal();
  const frame = el("div", { class: "phone-frame mail-phone " + screen }, [
    el("div", { class: "mail-status" }, [
      el("span", {}, ["中国移动"]),
      el("span", {}, [screen === "lock" ? "" : clockHm()]),
      el("span", { class: "mail-batt" }, ["64%"]),
    ]),
    ...kids,
    el("div", { class: "mail-chin" }, [
      el("button", {
        type: "button",
        class: "mail-home",
        title: "放下手机",
        "aria-label": "放下手机",
        onclick: () => {
          closeModal();
          backToHub();
        },
      }),
    ]),
  ]);
  S.modal = el("div", {
    class: "modal phone-menu",
    id: "game-modal",
    onclick: (e) => {
      if (e.target !== e.currentTarget) return;
      closeModal();
      backToHub();
    },
  }, [frame]);
  stage.append(S.modal);
}

// 锁屏先亮一条通知，点开（或滑开）才进收件箱
function missMail() {
  const d = clockDate();
  mailPhone("lock", [
    el("div", { class: "mail-lock" }, [
      el("p", { class: "mail-lock-time" }, [clockHm()]),
      el("p", { class: "mail-lock-date" }, [(d.getMonth() + 1) + "月" + d.getDate() + "日　星期" + "日一二三四五六"[d.getDay()]]),
      el("button", { type: "button", class: "mail-note", onclick: missInbox }, [
        el("span", { class: "mail-note-icon", "aria-hidden": "true" }),
        el("span", { class: "mail-note-text" }, [
          el("b", {}, [MAIL_FROM]),
          el("span", {}, [MAIL_SUBJ]),
          el("small", {}, [MAIL_TEXT]),
        ]),
        el("small", { class: "mail-note-when" }, ["现在"]),
      ]),
      el("button", { type: "button", class: "mail-slide", onclick: missInbox }, ["滑动来查看"]),
    ]),
  ]);
}

function mailRow(from, when, subj, text, opt) {
  const o = opt || {};
  return el(o.go ? "button" : "div", Object.assign(
    { class: "mail-row" + (o.unread ? " unread" : "") },
    o.go ? { type: "button", onclick: o.go } : {}
  ), [
    el("span", { class: "mail-dot", "aria-hidden": "true" }),
    el("span", { class: "mail-row-top" }, [el("b", {}, [from]), el("small", {}, [when])]),
    el("span", { class: "mail-row-subj" }, [subj, o.clip ? el("span", { class: "mail-clip", "aria-label": "有附件" }) : ""]),
    el("span", { class: "mail-row-text" }, [text]),
  ]);
}

function missInbox() {
  mailPhone("inbox", [
    el("div", { class: "mail-bar" }, [el("span", { class: "mail-back" }, ["‹ 邮箱"]), el("b", {}, ["收件箱"]), el("span", {})]),
    el("div", { class: "mail-list" }, [
      mailRow(MAIL_FROM, "刚刚", MAIL_SUBJ, MAIL_TEXT, { unread: !S.miss.mail, clip: true, go: missMailOpen }),
      ...MAIL_OLD.map(([from, when, subj, text]) => mailRow(from, when, subj, text)),
    ]),
    el("p", { class: "mail-updated" }, ["刚刚更新"]),
  ]);
}

function missMailOpen() {
  S.miss.mail = true;
  mailPhone("read", [
    el("div", { class: "mail-bar" }, [
      el("button", { type: "button", class: "mail-back", onclick: missInbox }, ["‹ 收件箱"]),
      el("b", {}, [""]),
      el("span", {}),
    ]),
    el("div", { class: "mail-read" }, [
      el("p", { class: "mail-head" }, [el("span", {}, ["寄件人"]), MAIL_FROM]),
      el("p", { class: "mail-head" }, [el("span", {}, ["收件人"]), "章慧琪"]),
      el("h3", { class: "mail-subj" }, [MAIL_SUBJ]),
      el("p", { class: "mail-date" }, ["今天 " + clockHm()]),
      el("p", { class: "mail-text" }, [MAIL_TEXT]),
      el("div", { class: "mail-atts" }, MAIL_ATT.map(([n, name, size, img]) => el("button", {
        type: "button",
        class: "mail-att" + (S.miss["att" + n] ? " seen" : ""),
        onclick: () => missAttach(n, missMailOpen),
      }, [
        imgSlot(img, "mail-att-img", name),
        el("span", { class: "mail-att-name" }, [name]),
        el("small", {}, [size]),
      ]))),
    ]),
  ]);
}

function missAttach(n, back) {
  S.miss["att" + n] = true;
  const done = () => (S.miss.att1 && S.miss.att2 && !ev("mail-dirt") ? missMailKeep() : (back || backToHub)());
  if (n === 1) {
    withClue(pic(14, "示意-附件一新闻扫描"), () => showModal(
      "附件一　新闻扫描",
      "二〇〇四年十一月，维港大学，一名女学生坠楼。新闻写她的男友姓罗，自称有责任。",
      "名字被黑笔涂掉，涂不干净，露出一个「鱼」字。页脚一行小字：旺印文仪店。",
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
  note("dirt", "二〇〇四年十一月，维港大学，女学生坠楼。新闻写男友罗某。名字涂掉，露出一个鱼。偷拍里年轻的他，旁边女生望住他。");
  // 两个附件都看过＝证物已到手；门关靠 ev("mail-dirt")，不能只靠点下划线（手机上容易漏）
  if (!hasEvidence(MAIL_DIRT.id)) fileEvidence(MAIL_DIRT);
  keepThen(MAIL_DIRT, () => hubTalk([
    line("", "你等了他四个星期六。你说过，高兴是因为他来。现在有人寄来一则旧闻，还有一张旧相：读书那时，真的死过一个女生。相里她望着他。你现在也是这样望他。"),
    line("", "诊室里只有饮水机咕噜一声。你把手机反过来扣在桌上。"),
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
            line("罗启明", "十一月系佢跌落去嗰个月。我唔纪念。黑笔涂唔干净，剩低一个「鱼」字。我心入面叫佢鱼。全名我唔讲。", { zh: "十一月是她掉下来的那个月。我不纪念。黑笔涂不干净，剩一个「鱼」字。我心里叫她鱼。全名我不讲。" }),
            line("章慧琪", "你……要否认？", { zh: "你……要否认吗？" }),
            line("罗启明", "否认要有另一个故仔。我冇。所以我信咗十年——系我害咗鱼。鱼先会企喺走廊。", { zh: "否认得有另一个说法。我没有。所以我信了十年——是我害了鱼。鱼才会站在走廊。" }),
            line("罗启明", "有人希望你唔好再信我。松开都可以。你先安全。", { zh: "有人希望你别再信我。松开也可以。你先安全。", note: ["dirtreact", "他手抖。十一月是她坠楼那个月。他信了十年是自己害了鱼。全名他不讲。"] }),
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

function missHasFish() {
  return ev("fish-tag");
}

function missHasWallet() {
  return ev("chen-wallet");
}

// 见过陈、离开过走廊再回来，且没拾鱼牌：钱夹只在这一次出现
function missWalletReady() {
  return !!(S.miss && S.miss.chen && S.miss.leftCorr && !missHasFish() && !missHasWallet());
}

function missDrawer() {
  S.miss = S.miss || {};
  if (missHasWallet()) {
    showModal("抽屉", "空的。节拍器不在。没有别的掉出来。", "", null, backToHub);
    return;
  }
  if (!S.miss.drawer1) {
    S.miss.drawer1 = true;
    note("metro-gone", "空抽屉。节拍器不见了。");
    showModal("空抽屉", "拉开。里面空的。铜色节拍器不在了。", "你合上。", "scene", backToHub);
    return;
  }
  if (!missHasFish()) {
    withClue(pic(14, "证据-鱼牌"), () => showModal(
      "空抽屉",
      "再拉开。抽屉底滑出一小块磨白的塑料，鱼的形状，没有字。",
      "节拍器还是不在。",
      "scene",
      () => keepThen(item("fish-tag"), backToHub)
    ));
    return;
  }
  showModal("抽屉", "鱼牌已经在日记簿里。抽屉还是空的。", "", null, backToHub);
}

function missAskFish() {
  hubTalk([
    line("章慧琪", "抽屉……节拍器唔喺度。我再拉一次，跌咗块鱼出嚟。无字。", { zh: "抽屉……节拍器不在。我再拉一次，掉出一块鱼。没有字。" }),
    line("", "他端着水，看了一眼你掌心，没有接。"),
    line("罗启明", "旧嘢。而家唔用。你放返去。", { zh: "旧东西。现在不用。你放回去。" }),
    line("章慧琪", "你……", { zh: "你……" }),
    line("", "后半句你咽回去了。他已经把杯子放下，去看电脑，不再看你的手。", {
      flag: "askedFishLuo",
      note: ["fish-ask", "我问抽屉掉出来的鱼牌。他说旧东西，而家唔用。"],
    }),
  ], "澄心诊室", "face");
}

function missWallet() {
  startTalk([
    line("", "椅脚边一只黑色钱夹，拉链没拉严。陈家豪刚才站过这里。", { clue: pic(14, "示意-钱夹") }),
    line("", "打开。透明套里一张合照：表姐陈美娟，旁边是他。两个人靠得很近。", { clue: pic(14, "证据-钱夹合照") }),
    line("", "夹层里还有一张发黄的学生证照片。年轻的罗医生。证件上的字糊了，脸你认得。", { clue: pic(14, "证据-钱夹罗证件照") }),
    { note: ["wallet-chen", "钱夹里表姐和他的合照。夹层还有发黄的罗医生学生证。"], goto: () => keepThen(item("chen-wallet"), backToHub) },
  ], "澄心走廊", "face");
}

HUBS.miss = {
  time: "2014年9月7日 周日 16:20",
  places: [
    {
      id: "room", name: "诊室", map: "clinic-room", img: pic(14, "场景-诊室"),
      line: () => (missDirtReady()
        ? (noted("fish-cv") ? "履历和校报对不上。他倒的那杯水还在桌上。" : noted("twofiles") ? "他回来了。西贡同荣汇街，我都看过。" : "他回来了。手机还能开廿八屋。")
        : "他去倒水了。"),
      spots: () => [
        {
          title: "他的工作台", sub: () => (noted("stolen") ? "行程被删，本子不见。" : "日历、夹子。"), img: pic(14, "示意-他的工作台"),
          seen: () => noted("stolen"),
          go: () => (noted("stolen") ? showModal("工作台", "电脑日历被删了。夹子还在。本子不见了。") : missDesk()),
        },
        {
          title: "空抽屉", sub: () => (missHasFish() ? "鱼牌已经在日记簿里。" : S.miss.drawer1 ? "节拍器不在。再拉一次。" : "缝开着。"), img: pic(14, "示意-空抽屉"),
          show: () => !!S.miss.chen && !missHasWallet(),
          seen: () => missHasFish(),
          go: missDrawer,
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
          title: "廿八屋：这栋楼的旧闻", sub: () => (noted("twofiles") ? "两篇都翻过了。" : "站内新闻，还有没翻完的。"), img: pic(14, "示意-廿八屋旧闻"),
          show: () => missDirtReady(),
          seen: () => noted("twofiles"),
          go: () => (noted("twofiles") ? showModal("旧闻", "两篇都翻完了。看完了，心里没有更清。") : missOpenNews()),
        },
        {
          title: "网上：旧闻和履历", sub: () => (noted("fish-cv") ? "对不上。应该另有隐情。" : "校报，和他的公开履历。"), img: pic(14, "示意-罗履历"),
          show: () => flag("askedFishLuo") && missHasFish(),
          seen: () => noted("fish-cv"),
          go: () => (noted("fish-cv") ? showModal("网上", "履历干净。校报那则旧闻对不上。应该另有隐情。") : missOpenNews()),
        },
      ],
    },
    {
      id: "corridor", name: "走廊", map: "clinic-wait", img: pic(14, "场景-诊所走廊"),
      show: () => noted("stolen"),
      line: () => (S.miss.chen ? (missWalletReady() ? "他走了。椅脚边有东西。" : "走廊空了。") : "走廊有人。便装衬衫，像休班路过。"),
      spots: () => [
        {
          title: "陈家豪", sub: () => (S.miss.chen ? "说过了。" : "他看见你了。"), img: pic(14, "示意-陈家豪"), person: true,
          seen: () => !!S.miss.chen,
          go: () => (S.miss.chen ? showModal("走廊", "他下楼了。") : missChen()),
        },
        {
          title: "钱夹", sub: "椅脚边。拉链没拉严。", img: pic(14, "示意-钱夹"),
          show: () => missWalletReady(),
          seen: () => missHasWallet(),
          go: missWallet,
        },
      ],
    },
  ],
  actions: () => [
    {
      mark: "问", label: "问他那块鱼",
      show: () => missHasFish() && missDirtReady() && !flag("askedFishLuo") && !missHasWallet(),
      go: missAskFish,
    },
    {
      mark: "给", label: "给他看",
      show: () => missDirtReady() && !flag("showedDirt") && !flag("hidDirt"),
      go: missShow,
    },
  ],
};

function missDirtReady() {
  return ev("mail-dirt") || !!(S.miss && S.miss.att1 && S.miss.att2);
}

function missHome() {
  setTime("2014年9月7日 周日 傍晚");
  startTalk([
    line("", "你取完笔记回家。楼梯口遇见周，像刚下楼倒垃圾。", { clue: pic(14, "示意-楼梯口周") }),
    line("周", "你个医生晏昼嚟过？喺楼梯口企咗一阵就走。冇入去。", { zh: "你医生下午来过？在楼梯口站了一阵就走。没进来。" }),
    line("章慧琪", "哦……你肯定系佢？", { zh: "哦……你肯定是他？" }),
    line("周", "戴眼镜，斯斯文文，揽住个公事包。唔通我眼花？对面阿婆都见到。", { zh: "戴眼镜，斯斯文文，夹着个公文包。难道我眼花？对门阿婆也看见了。" }),
    line("周", "医生肯上门系好事。不过佢一个男人嚟，你一个女仔住……啲街坊会讲。", { zh: "医生肯上门是好事。不过他一个男的来，你一个女孩子住……街坊会说闲话。" }),
    { note: ["zhou-day", "周说他白天来过。他下午明明在诊所。"] },
    line("", "铁闸出门时是扣死的。回来差一格。门垫也略挪过，边缘没对齐。", { clue: pic(14, "示意-铁闸差一格") }),
    line("", "储物室门底缝下多一截干了的水印。中午出门前没有。像有人贴过耳。", { clue: pic(14, "示意-门底干水印") }),
    { note: ["day-trace", "铁闸差一格。门垫挪过。储物室门底多一截干水印。"], goto: () => showBoard("回家　九月七日", "2014年9月7日 傍晚", [
      { img: pic(14, "示意-楼梯口周"), title: "楼梯口", body: "周说医生下午来过。他下午明明在诊所。" },
      { img: pic(14, "示意-铁闸差一格"), title: "铁闸", body: "出门扣死，回来差一格。门垫挪过。" },
      { img: pic(14, "示意-门底干水印"), title: "储物室门底", body: "多一截干水印。中午出门前没有。" },
    ], () => finishLevel(14)) },
  ], "荣汇街楼梯口", "face");
}

function nightName() {
  setTime("2014年9月7日 周日 23:10");
  startTalk([
    line("", "声音先传来一句：「阿轩，返嚟食饭。」"),
    line("", "接着低声说：「章慧琪。你知。」"),
    { goto: () => keepMust(nameItem(), stepPast) },
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
  ], "后座", "msg", { contact: "女人的声音", number: "语音留言　09-07　23:10" });
}

function callMing() {
  startTalk([
    line("罗启明", "把声……叫阿轩嗰句我听过。唔好再播。我而家过嚟。唔好喺电话度听。", { zh: "那声音……叫阿轩那句我听过。别再播。我现在过来。别在电话里听。" }),
    line("章慧琪", "你晏昼明明话……个女人唔喺度。", { zh: "你下午明明说……那个女人不在。" }),
    line("罗启明", "晏昼喺诊所，我谂唔起佢。返到呢条走廊，先算数。", { zh: "下午在诊所，我想不起她。回到这条走廊，才算数。" }),
    line("章慧琪", "你……惊乜嘢？", { zh: "你……怕什么？" }),
    line("罗启明", "我惊再听第二次。听过第二次，人就会企喺度。", { zh: "我怕再听第二遍。听过第二遍，人就会站在那儿。" }),
    { note: ["fearreplay", "他说怕再听第二遍。"], goto: goSearch },
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
  baseView("search");
  if (typeof rememberWebScroll === "function") rememberWebScroll();
  clearStage();
  const wallish = S.tab === "wall" || S.screen === "ad" || String(S.screen).indexOf("wall-") === 0;
  const desk = laptop(webInner(), {
    tab: wallish ? "wall" : "house",
    addr: webAddr(),
  });
  desk.classList.add("search-desk");
  const dock = el("div", { class: "scene-actions fork task-note" }, [
    el("p", { class: "hub-hint" }, ["站内新闻可以再翻。语音还在手机里。"]),
    forkChoice(
      "☎",
      "scene-act" + (S.searchHeard ? " done" : " primary"),
      () => {
        S.searchHeard = true;
        note("namecall", "鬼叫我的名字。它说我知。");
        showVoicemail("女人的声音", "阿轩，返嚟食饭。……章慧琪。你知。", drawSearch, nameItem(), "录音　09-07");
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
        showModal("天台", "白天上去晾过一次衫。水箱、晾衣绳、矮女儿墙、对面厨房的油烟，白天风已经很大。阿明和周都说过，晚上不要上去。", "", "scene", drawSearch);
      },
      S.searchRoof ? "天台　想过了" : "想想天台的样子"
    ),
  ]);
  stage.append(desk, dock);
  if (S.modal) stage.append(S.modal);
  renderPlaybar();
  if (typeof applyWebScroll === "function") applyWebScroll();
}

function mingReturn() {
  setTime("2014年9月7日 周日 23:45");
  const dirt = flag("showedDirt") ? [
    line("罗启明", "今晚……你要我走？", { zh: "今晚……你要我走吗？" }),
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
            line("", "他点了点头，退到门口，手按住门框，没有走出去。"),
            ...mingReturnRest(),
          ],
        },
      ],
    },
  ] : mingReturnRest();
  startTalk([
    line("", "阿明来了，比下午更瘦。眼睛通红，像一夜没睡。他站在门口，没有立刻进来，先低声数：一、二、三、四。"),
    line("章慧琪", "你数紧咩？", { zh: "你在数什么？" }),
    line("罗启明", "呼吸。旧习惯。家豪话我健忘。我唔系唔记得。", { zh: "呼吸。旧习惯。家豪说我健忘。我不是不记得。" }),
    line("", "他的视线转向走廊尽头。眼睛失焦。声音忽然变得很轻，不像是在对你说话。"),
    line("罗启明", "灯。你企喺走廊尽头。唔好走。我应你。", { zh: "灯。你站在走廊尽头。别走。我应你。" }),
    line("", "两秒钟。他眨了眨眼，手按住门框，又数了四下。"),
    line("罗启明", "头先嗰句唔系同你讲。我知自己喺荣汇街。我知你系章慧琪。而家系九月七号。", { zh: "刚才那句不是跟你说的。我知道自己在荣汇街。我知道你是章慧琪。现在是九月七号。" }),
    line("章慧琪", "你头先……叫紧边个？", { zh: "你刚才……叫的是谁？" }),
    line("罗启明", "鱼。我唔应该叫出口。全名我唔讲。叫齐个名，画面会更长。你当我发咗一次旧病。我仲喺度。", { zh: "鱼。我不该叫出口。全名我不讲。叫全了，画面会更长。你当我发过一次旧病。我还在。" }),
    { note: ["countbreath", ev("fish-tag")
      ? "他对走廊尽头说了一句。自己数回来。叫出一个字：鱼。抽屉那块鱼牌，他仍不解释。"
      : "他对走廊尽头说了一句。自己数回来。叫出一个字：鱼。"] },
    ...dirt,
  ], "荣汇街后座", "face");
}

function mingReturnRest() {
  if (!flag("showedDirt")) flag("keptMing", true);
  return [
    line("罗启明", "人仲未查到。……呢栋楼，值一笔钱。", { zh: "人还没查到。……这栋楼，值一笔钱。" }),
    line("章慧琪", "咁……录音系咪人？", { zh: "那……录音是人弄的吗？" }),
    line("罗启明", "三秒，人手做得到。走廊尽头嗰个……唔系。嗰个系我嘅。", { zh: "三秒，人手做得到。走廊尽头那个……不是。那个是我的。" }),
    line("章慧琪", "你话……系你嘅问题。", { zh: "你说……是你的问题。" }),
    line("罗启明", "回流第一年，我上过一次高处。家豪抬我落嚟。所以我叫你唔好上天台。", { zh: "回流第一年，我上过一次高处。家豪把我抬下来。所以我叫你别上天台。" }),
    { note: ["hisghost", "走廊尽头那个女人，他说是自己的事。回流第一年，有人从沿上抬过他。"], flag: "roofKeyAsked", who: "周", text: "医生又嚟呀。租客有福气。今晚风大，天台嗰把锁匙，我帮你收住啦？", zh: "医生又来了。租客有福气。今晚风大，天台那把钥匙，我替你收着吧？" },
    {
      prompt: "……",
      choices: [
        {
          label: "钥匙给你。",
          flag: "gaveRoofKey",
          then: [
            line("", "你把大门内侧小钩上的天台钥匙给了他。小钩空着。"),
            { goto: roofApproach },
          ],
        },
        {
          label: "不给。",
          flag: "keptRoofKey",
          then: [
            line("章慧琪", "我……自己收住。", { zh: "我……自己收着。" }),
            { goto: roofApproach },
          ],
        },
      ],
    },
  ];
}

function roofApproach() {
  const dirt = flag("showedDirt") ? [
    line("罗启明", "日头嗰封信……我唔会喺电话讲。你安全，系你唔好跟。", { zh: "白天那封信……我不会在电话里讲。你安全，是你别跟。" }),
  ] : [];
  startTalk([
    line("", "周走后，走廊又安静下来。他没有立刻离开，看着走廊尽头。你看不见他在看什么，只看见他停在那里。他又数了一次呼吸，声音很低。"),
    line("章慧琪", "你……又见到佢？", { zh: "你……又看见她了？" }),
    line("罗启明", "诊室度谂唔起。返到呢度，佢又企喺度。", { zh: "诊室里想不起。回到这儿，她又站在那儿。" }),
    { note: ["notforget", "诊室里想不起。回到走廊，她又站在那儿。"] },
    ...dirt,
    line("章慧琪", "你日头系咪嚟过？", { zh: "你白天……是不是来过？" }),
    line("罗启明", "我企喺楼梯口。冇撳门钟。冇问过你就嚟。唔应该。", { zh: "我站在楼梯口。没按门铃。没问过你就来了。不该。" }),
    { note: ["day-admit", "他说白天站在楼梯口，没按门铃。"] },
    flag("showedDirt")
      ? line("罗启明", "你而家咁望住我，同嗰张旧相一样。我惊……又将你收成病人。", { zh: "你现在这样望着我，跟那张旧相一样。我怕……又把你收成病人。" })
      : line("罗启明", "你而家咁望住我……以前有个人都系咁望。我惊……又将你收成病人。", { zh: "你现在这样望着我……以前也有个人这样望。我怕……又把你收成病人。" }),
    line("章慧琪", "我……唔再系你病人？", { zh: "我……不再是你的病人了？" }),
    line("罗启明", "你越信我，我就越似医生。呢个系我嘅病。", { zh: "你越信我，我就越像医生。这是我的病。" }),
    line("章慧琪", "姐夫话你精神唔系几好……我而家信一半。", { zh: "姐夫说你精神不太好……我现在信一半。" }),
    line("罗启明", "佢见过一次，我喺沿上。", { zh: "他见过一次，我在沿上。" }),
    line("", "头顶的天台铁门被风吹得「哐」地响了一声。"),
    line("", "他整个人僵住。视线从走廊尽头移到后楼梯，一级一级往上，像在跟着一个人走。你跟着看过去，楼梯上什么都没有。"),
    line("罗启明", "佢上咗楼梯。", { zh: "她上楼梯了。" }),
    line("章慧琪", "楼梯冇人！系风吹铁门！", { zh: "楼梯上没人！是风吹铁门！" }),
    line("罗启明", "我知冇人。我个脑知道。", { zh: "我知道没人。我脑子知道。" }),
    line("罗启明", "但系佢企咗上去。先走嘅系脚。", { zh: "可是她站上去了。先走的是脚。" }),
    line("章慧琪", "你叫咗我成个月唔好上天台。而家你自己上去？", { zh: "你叫了我一整个月别上天台。现在你自己上去？" }),
    line("罗启明", "所以系我上去，唔系你。", { zh: "所以是我上去，不是你。" }),
    line("章慧琪", "你……唔系想跳嘛？", { zh: "你……不是要跳吧？" }),
    line("罗启明", "唔系。我上去叫佢唔好再企。你留喺下面，锁门。", { zh: "不是。我上去叫她别再站。你留在下面，锁门。", note: ["roofwhy", "铁门一响，他往天台看。楼梯上什么都没有。他还是要上去。"] }),
    line("", "他转身走向后楼梯。"),
    { act: "拉住他的衫袖", who: "", text: "你没有想，手已经伸出去了。" },
    line("", "你抓住他的衫袖。布很薄，底下的手臂在抖。他停住，没有回头。"),
    line("罗启明", "唔好伸手。", { zh: "别伸手。" }),
    line("罗启明", "你一伸手，我会以为你拣咗我。", { zh: "你一伸手，我会以为你选中我。" }),
    line("章慧琪", "我唔系……你叫我信你，信咗成个月，而家叫我放手？", { zh: "我不是……你叫我信你，信了一整个月，现在叫我放手？" }),
    line("", "他把你的手指一只一只扳开。没有用力，像怕弄痛你。"),
    ...(flag("gaveRoofKey") ? [
      line("", "你跟到后楼梯口。抬头看，天台铁门开着一条缝。"),
      line("罗启明", "锁匙喺周度。门反而开住。", { zh: "钥匙在周那儿。门反倒开着。" }),
    ] : [
      line("罗启明", "锁匙。", { zh: "钥匙。" }),
      line("", "你攥着口袋里的天台钥匙，攥到指节发白。他没有伸手抢，只是等。最后你把钥匙放进他掌心。"),
    ]),
    line("", "他踩上后楼梯第一级，背对着你。风从上面灌下来。"),
    line("罗启明", "如果我喺上面冇声，你唔好跟。打俾家豪。唔好打俾我。", { zh: "如果我在上面没声，你别跟。打给家豪。别打给我。" }),
    line("章慧琪", "阿明——", { zh: "阿明——" }),
    line("", "脚步声继续往上，中途顿了一拍，又继续往上。你没有跟上去。"),
    line("", "你锁上门，背贴着门站着。刚才抓过他衫袖的那只手还半握着，松不开。屋里还亮着灯。玩具车仍在地上，车头朝储物室。"),
    { goto: roofWait },
  ], "荣汇街后座", "face");
}

function roofWait() {
  setTime("2014年9月8日 周一 00:20");
  startTalk([
    line("", "铁梯又响了一下，然后很久都没有声音。好像有人站在上面，没有跳下去，也没有下来。"),
    line("", "你把耳朵贴在门上听。楼上有人很低地数：一、二、三、四。数完又说了一句，听不清楚，像在回答一个不在场的人。然后又继续数。数着数着，声音停了，很久没有再响。", { note: ["roofpause", "他在上面数呼吸，又对空气说了一句。然后很久没有再响。"] }),
    { act: "打给家豪", who: "", text: "他说过：冇声就打俾家豪。", flag: "calledChen" },
    { goto: roofCallChen },
  ], "荣汇街后座", "face");
}

// 第一章试玩三收束：由前期发现锁死，不是天台临时三选一。
// dugLuoSecrets → 女主险坠被救（无伤）；foundChenCrush → 陈掉棚轻伤；否则 → 罗掉棚轻伤。
// 陈伤只认钱夹；险坠只认鱼牌链。meiNoise／askedWhyFast 不再锁结局。
function foundChenCrush() {
  return ev("chen-wallet");
}

function dugLuoSecrets() {
  return ev("fish-tag") && flag("askedFishLuo") && noted("fish-cv");
}

function resolveEndHurt() {
  if (S.flags.endHurt === "ming" || S.flags.endHurt === "chen" || S.flags.endHurt === "zhang") {
    return S.flags.endHurt;
  }
  const hurt = dugLuoSecrets() ? "zhang" : foundChenCrush() ? "chen" : "ming";
  S.flags.endHurt = hurt;
  return hurt;
}

function roofCallChen() {
  const crush = foundChenCrush();
  startTalk([
    line("章慧琪", "家豪……阿明上咗天台。佢叫我唔好跟，叫我打俾你。我拉唔住佢。", { zh: "家豪……阿明上了天台。他叫我别跟，叫我打给你。我拉不住他。" }),
    crush
      ? line("陈家豪", "我知佢喺边。我就到。你锁住门。唔好上去。", { zh: "我知道他在哪儿。我马上到。你锁好门。别上去。" })
      : line("陈家豪", "……天台？你锁门先。我……睇下先。唔好自己冲。", { zh: "……天台？你先锁门。我……先看看。别自己冲。" }),
    line("", "他先挂了线。", {
      note: crush
        ? ["chencall", "零点二十分打给家豪。他说知道阿明在哪儿，马上到。叫我锁门，别上去。"]
        : ["chencall", "零点二十分打给家豪。他的声音慢了一拍。叫我锁门，说他先看看。"],
    }),
    { goto: () => finishLevel(15) },
  ], "拨出 陈家豪", "phone", { contact: "陈家豪", number: "陈家豪", dialout: true });
}

/** 三线共用：警车；有伤线加白车；周与三人被带走。hurt: ming|chen|zhang */
function roofAftermath(hurt) {
  const lines = [];
  if (hurt === "ming" || hurt === "chen") {
    lines.push(line("", "楼下先响起警笛，跟着白车的灯也转上来。"));
  } else {
    lines.push(line("", "楼下响起警笛。"));
  }
  lines.push(line("", "差人上楼。前座门开着——周先生也被带了出来。"));
  lines.push(line("", "你、阿明、家豪，连同周，都被带走。"));
  lines.push({ goto: ending });
  return lines;
}

function roofNightTailChen() {
  return [
    line("", "铁门被撞开——门闩被他肩撞开，不是用钥匙拧的。陈家豪站在门口，穿着便装衬衫，喘气很急，像从街底跑了六层没有电梯的楼梯上来。他两手空空，钥匙串在裤袋里响。天台上没有第三个人。"),
    line("陈家豪", "阿明——你唔好再埋去——章慧琪，你行开！", { zh: "阿明——你别再靠近——章慧琪，你走开！" }),
    line("", "他冲到沿边，伸手去扯阿明的手臂，要把人从墙外拉回来。不是推你。"),
    line("", "阿明的鞋离地了半寸，又被你和家豪一起拽回一点。家豪的重心却过了。"),
    line("", "他整个人翻出女儿墙。阿明跌回墙内侧，膝盖着地。"),
    line("", "风声空了一拍。下面一声闷响——不是落到街面，是竹棚。旧楼外墙的棚架档了一下。竹竿碎、铁丝响。人卡在棚上，没有再往下。"),
    line("", "你趴到沿边看。路灯下，陈趴在棚架上，袖口擦破，还在动——像摔疼了，不像摔坏了。他看着上面的阿明，没有看你。"),
    line("陈家豪", "你……唔好跟佢走。你属于……", { zh: "你……别跟她走。你属于……" }),
    line("章慧琪", "我叫白车——", { zh: "我叫救护车——" }),
    line("陈家豪", "你行开。我唔系为你。", { zh: "你走开。我不是为你。" }),
    line("", "头垂下去。阿明用力抓住你的手，抓得很紧。"),
    ...roofAftermath("chen"),
  ];
}

function roofNightTailMing() {
  return [
    line("", "你抓住他了。风很大。你想再用力——脚却钉在原地半秒。天台上只有你们两个。"),
    line("", "半秒里阿明的鞋离了沿。他没有挣你的手，是他自己的重心先走了。"),
    line("", "风声空了一拍。下面一声闷响——竹棚。人卡在棚上。"),
    line("", "你趴到沿边看。路灯下，阿明趴在棚架上，眼镜歪了，还在动——轻伤，无大碍。他看着上面的你。"),
    line("章慧琪", "阿明——我叫白车——", { zh: "阿明——我叫救护车——" }),
    line("", "铁门这时才被撞开。陈家豪冲进来，便装衬衫贴在背上。他看见沿外，整个人没有停——扑到沿边，伸手去够棚上的阿明。"),
    line("", "够不着。人往前一栽，整个人摔在天台水泥地上。胳膊和手擦破，轻伤。"),
    line("陈家豪", "……我嚟迟咗。", { zh: "……我来迟了。" }),
    line("", "你还跪在沿边。日记簿压在肋骨上。他撑着地想再站起来，掌心火辣。"),
    ...roofAftermath("ming"),
  ];
}

function roofNightTailZhang() {
  return [
    line("", "你没有等。你想起信、那个字、空抽屉里掉出来的鱼牌、他讲过的白房——两手已经把阿明往内侧猛拉。"),
    line("", "阿明跌回墙内侧。你脚下一空——风从裙边灌上来，身体已经翻出女儿墙。"),
    line("", "你没有落到棚上。双手死抠住沿口外沿，整个人吊在墙外。脚晃着，碰不到棚架。日记簿压在胸口，没有掉。"),
    line("", "（楼梯口。铁门里侧。家豪听见沿上传来一声闷响，又听见有人喊名字。他撞开门——先看见一双挂在沿外的手。）"),
    line("", "（你。）"),
    line("罗启明", "慧琪！攞稳——唔好松——", { zh: "慧琪！抓紧——别松——" }),
    line("", "阿明趴在沿内，两手扣住你的腕。天台上没有别人。"),
    line("", "铁门还开着。陈家豪冲到沿边，便装衬衫贴在背上，一把抓住你另一只臂肘，同阿明一起往上扯。"),
    line("陈家豪", "我拉住你。你睇住我。唔好望落去。", { zh: "我拉住你。你看着我。别往下看。" }),
    line("", "石沿擦过小臂。你被两人拖回墙内侧，膝盖磕在水泥上，喘不过气——没有血。月亮还是圆的。"),
    line("罗启明", "你有冇整亲？", { zh: "你有没有伤到？" }),
    line("章慧琪", "……冇。日记簿……仲喺。", { zh: "……没有。日记簿……还在。" }),
    line("", "风很大。三个人还跪在沿边。"),
    ...roofAftermath("zhang"),
  ];
}

function roofNight() {
  setTime("2014年9月8日 周一 00:41");
  const hurt = resolveEndHurt();
  const waitLine = foundChenCrush()
    ? "家豪说过：你锁住门，唔好上去。他还没有到。"
    : "你打过给家豪。他的声音慢了一拍。他还没有到。";
  const palm = ev("fish-tag")
    ? "他一只手扶着墙，另一只手握着，掌心在路灯余光里露出一块磨白的鱼形牌子的边缘。"
    : "他一只手扶着墙，另一只手握着，没有摊开。";
  const roofNote = ev("fish-tag")
    ? "他在沿上对空气说话。掌心露出鱼牌的边。我叫他的名字，他先确认自己在天台、我是谁，才回来。"
    : "他在沿上对空气说话。我叫他的名字，他先确认自己在天台、我是谁，才回来。";
  startTalk([
    line("", "后座所有的灯都灭了。储物室的门响了一声，从里面来的，像有人用肩膀撞门。玩具车滑到门边。"),
    line("", "有人喊了一句：上天台。声音像丽芬，却像在下命令，不像叫儿子吃饭。"),
    line("", waitLine),
    { act: "开门，跑上后楼梯", who: "", text: "门把手是冰的。", flag: "ranUp" },
    line("", "你打开门。走廊里只有从天台楼梯吹来的风。你往上跑。周的前座门开了一条缝，里面很黑。他没有出来。"),
    line("", flag("gaveRoofKey")
      ? "天台铁门大开。锁头挂在门环上，插着一把钥匙——就是你给周那把。你冲出去，身后的铁门被风甩上，门闩落下。"
      : "天台铁门虚掩。阿明拿上去的钥匙还插在锁头上。你冲出去，身后的铁门被风甩上，门闩落下。"),
    line("", "天台上风很大。水箱、晾衣绳打着金属杆。对面还有一盏路灯。没有别人。阿明已经站在女儿墙上，一只鞋在墙沿外面。" + palm + "他没有摊开手给你看。他不是在等你。他对着空气说话，像走廊尽头那个人走到了墙沿上。"),
    line("", "月亮很圆，很白。今天是中秋。表姐叫过你中秋返去食饭。这一夜，你在天台上，女儿墙被月亮照成一条白边。"),
    line("罗启明", "你企咗十年。我唔想你再企。我估错一次。我唔想再估错。", { zh: "你站了十年。我不想你再站。我估错一次。我不想再估错。" }),
    line("", "他侧过耳，像在等回答。只有风声。"),
    line("罗启明", "系我害嘅。我同你一齐。你唔好再企喺走廊。", { zh: "是我害的。我跟你一起。你别再站在走廊。" }),
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
    line("罗启明", "我喺天台。你系章慧琪。头先嗰句唔系叫你一齐跳。", { zh: "我在天台。你是章慧琪。刚才那句不是叫你一起跳。" }),
    flag("keptMing")
      ? line("罗启明", "今晚你冇叫我走。我记得。", { zh: "今晚你没叫我走。我记得。" })
      : line("罗启明", "你叫我走。我行到门口，行唔出去。", { zh: "你让我走。我走到门口，走不出去。" }),
    line("罗启明", "你唔好跟上嚟。你一伸手，我会以为你拣咗我。", { zh: "你别跟上来。你一伸手，我会以为你选中我。" }),
    { note: ["rooftop", roofNote] },
    line("", "风灌进领口。天台上仍然只有你们两个。前座那条门缝还在楼下。"),
    line("", "阿明的鞋又往外挪了一步。你还有一只手是空的。"),
    { act: "抓住他的手腕", who: "", text: "他说过：你伸手，我会以为你选中我。", flag: "grabbed" },
    line("", flag("keptMing")
      ? "你另一只手抓住了他的手腕。抓到了。他没有挣，像早知道你会伸手。"
      : "你另一只手抓住了他的手腕。他挣了一下，才停住。抓到了。"),
    line("", flag("called999")
      ? "你想起后楼梯口被他扳开的手指，阿乐挂断的两声电话、表姐眼里的药、差人问的「有没有人伤」。"
      : "你想起后楼梯口被他扳开的手指，阿乐挂断的两声电话、表姐眼里的药。"),
    ...(hurt === "zhang" ? roofNightTailZhang() : hurt === "ming" ? roofNightTailMing() : roofNightTailChen()),
  ], "天台", "face");
}

function ending() {
  stopNightClock();
  S.talk = null;
  S.mode = "end";
  clearStage();
  try { (typeof clearStore === "function" ? clearStore() : localStorage.removeItem(SAVE_KEY)); } catch (e) { /* 忽略 */ }
  markCleared();
  const hurt = resolveEndHurt();
  const kept = (S.evidence || []).map((e) => e.kind + "　" + e.title);
  const noise = Object.entries(S.skipAll || {}).filter(([id]) => !hasEvidence(id)).map(([, t]) => t);
  // 三条结局线各是谁倒下/没倒下都不同，一张图对不上三条，干脆不铺图：黑底字幕。
  const openLine = hurt === "ming"
    ? "警笛和白车都在楼下。棚架上是阿明。天台上，家豪掌心擦破。"
    : hurt === "zhang"
      ? "警笛在楼下。你还跪在沿内侧。掌心没有血。"
      : "警笛和白车都在楼下。棚架上是家豪。";
  const bodyLine = hurt === "ming"
    ? "日记簿还在你身上。差人把周也从楼下带了上来。"
    : hurt === "zhang"
      ? "日记簿还在你胸口。差人把周也从楼下带了上来。"
      : "日记簿还在你身上。差人把周也从楼下带了上来。";
  const hurtLine = hurt === "ming"
    ? "摔下去的是阿明。为了拉他，家豪摔在水泥地上。你们四个，都被带走。"
    : hurt === "zhang"
      ? "掉出去又被拉回来的是你。没有人掉进棚架。你们四个，都被带走。"
      : "摔下去的是家豪。你们四个，都被带走。";
  const { desk, go } = captionShell(null, 0.4);
  desk.classList.add("caption-end");
  const at = (node, d) => {
    if (node && node.style) node.style.setProperty("--d", d + "s");
    return node;
  };
  desk.append(el("div", { class: "caption-text" }, [
    at(el("p", { class: "caption-next" }, ["2014年9月8日　00:41　荣汇街 28 号　天台"]), 0.2),
    at(el("p", { class: "caption-line" }, [openLine]), 0.6),
    at(el("p", { class: "caption-line" }, [bodyLine]), 1.8),
    at(el("p", { class: "caption-line" }, [hurtLine]), 2.4),
    at(el("p", { class: "caption-next" }, ["日记簿里留下的（" + kept.length + "）"]), 3.2),
    at(kept.length ? el("ul", { class: "caption-kept" + (kept.length > 8 ? " two-col" : "") }, kept.map((t) => el("li", {}, [t]))) : el("p", { class: "caption-next" }, ["什么都没有留下。"]), 3.6),
    noise.length ? at(el("p", { class: "caption-next" }, ["看见了，没有留下（" + noise.length + "）"]), 4.4) : "",
    noise.length ? at(el("ul", { class: "caption-kept noise" + (noise.length > 8 ? " two-col" : "") }, noise.map((t) => el("li", {}, [t]))), 4.8) : "",
    at(el("p", { class: "caption-line" }, [flag("showedDirt") ? "那封信，你当面给他看了。" : "那封信，你没有给他看。"]), 5.6),
    at(el("p", { class: "caption-line" }, [flag("keptMing") ? "那晚你没有叫他走。" : "那晚你叫他走。他停在门口。"]), 5.9),
    flag("meiStay") || flag("meiSofa") ? at(el("p", { class: "caption-line" }, [flag("meiStay") ? "表姐的汤，每个星期六还是放在门口。" : "表姐铺好的那条新床单，一直没有收。"]), 6.2) : "",
    flag("gaveRoofKey") || flag("keptRoofKey") ? at(el("p", { class: "caption-line" }, [flag("gaveRoofKey") ? "天台钥匙你给了周。后来插在门上的，就是那一把。" : "天台钥匙你自己收着，最后放进了阿明掌心。"]), 6.5) : "",
    // 章末落款按标题标排：中文大字距 + 竖排 undo，与续玩卡上那个标同构。
    at(el("p", { class: "caption-title" }, [
      el("span", { class: "caption-lock" }, [
        el("span", { class: "caption-brand" }, ["暗度"]),
        el("span", { class: "caption-undo", "aria-hidden": "true" }, "undo".split("").map((ch) => el("span", {}, [ch]))),
        el("span", { class: "caption-ch" }, ["第一章"]),
      ]),
    ]), 7.2),
    at(el("div", { class: "caption-acts" }, [
      go("第二章　预告", () => chapter2Teaser(0)),
      go("回到廿八屋", () => newGame()),
    ]), 7.8),
  ]));
  stage.append(desk);
  renderPlaybar();
}

// 第二章没做：陈伤线保留 2-1 楼梯预告；另两线只放短预告，不假装已实装
// 底图按页标：bg 不写就是天台，写 "stair" 用第 11 关的楼梯图。
// 原来 11 页全铺天台，可前几页字幕明写「后楼梯」「六层，没有电梯」「五楼转角」「他撑着铁栏喘气」，
// 配天台图读起来像他一步就到楼顶了。楼梯图是白天机位，所以压得更狠（0.34，中间亮度落到 24 上下，
// 和天台那几页的 0.22（约 22）咬得住）；只当夜里一盏楼梯灯看，不露窗外天光成片。
// 头八页楼梯、最后两页「铁门在头顶／他撞门」才回天台——出到天台亮一档，正好是推开门的那个亮。
const CH2_TEASER_CHEN = [
  { bg: "stair", lines: ["第二章　陈家豪"], small: "2014年9月8日　00:33　荣汇街 28 号　后楼梯" },
  { bg: "stair", lines: ["六层，没有电梯。", "每层转角一盏黄灯。坏了一盏，就暗一格。"] },
  { bg: "stair", lines: ["他撑着铁栏喘气。便装衬衫贴在背上。", "今晚休班，没有带枪。"] },
  { bg: "stair", lines: ["口袋里一把钥匙，齿硌着大腿。", "不是差馆发的。是澄心的紧急钥匙——他自己留下来的。"] },
  { bg: "stair", lines: ["手机亮着「共享位置」。", "阿明的点，停在天台。", "名单里没有章慧琪。她是病人。"] },
  { bg: "stair", memo: "09-06　他去了她那里。我拿走现场笔记，删了他的日历。我以为他会忘。忘了对他好。", small: "备忘　发给自己　没有收件人" },
  { bg: "stair", say: ["你又去。你每次一接近女人，就去沿。", "你又去了。你每次一靠近女人，就去沿上。"] },
  { bg: "stair", lines: ["五楼。楼梯转角堆着两只别人不要的旧柜。", "墙上没有刻痕。刻痕在西贡十二乡那间村屋：一年一条，停在八岁，旁边写着阿轩。", "他摸了一下那面空墙，沾了灰，在裤腿上擦掉。"] },
  { bg: "stair", say: ["周系周。阿明系阿明。两件事我分得开。", "周是周。阿明是阿明。两件事我分得开。"], after: "他分不开。" },
  { lines: ["铁门在头顶。风灌下来。", "门后有人在说话，断断续续，像在应一个不在的人。"] },
  { lines: ["他撞门——"], small: "然后，倒回八月十五日。那通转介电话打出去之前。" },
];

const CH2_TEASER_MING = [
  { lines: ["第二章　预告"], small: "2014年9月8日　天台之下" },
  { lines: ["阿明在棚架上，还在动。", "家豪摔在水泥地上，胳膊和手擦破。"] },
  { lines: ["他扑出去够过一次。", "够不着。"] },
  { lines: ["第二章　未开放"], small: "罗启明掉棚轻伤线。倒叙未写。" },
];

const CH2_TEASER_ZHANG = [
  { lines: ["第二章　预告"], small: "2014年9月8日　天台　女儿墙内侧" },
  { lines: ["你还在喘。小臂火辣，没有破皮。", "日记簿压在肋骨上，页角皱了，没有血。"] },
  { lines: ["阿明坐在你旁边，眼镜歪了，还抓着你的手腕。", "家豪站着，便装衬衫被风吹开一角。"] },
  { lines: ["没有人掉进棚架。", "楼下警笛响了。周也被带走。"] },
  { lines: ["第二章　未开放"], small: "险坠被救线。倒叙未写。" },
];

function teaserSay(yue, zh) {
  const mode = typeof langMode === "string" ? langMode : "both";
  const main = mode === "zh" ? zh : (typeof toHkTrad === "function" ? toHkTrad(yue) : yue);
  return [
    el("p", { class: "caption-line teaser-say" }, ["陈家豪：「" + main + "」"]),
  ];
}

function chapter2Teaser(i) {
  S.talk = null;
  S.mode = "end";
  clearStage();
  const hurt = S.flags.endHurt || "chen";
  const pages = hurt === "ming" ? CH2_TEASER_MING : hurt === "zhang" ? CH2_TEASER_ZHANG : CH2_TEASER_CHEN;
  const page = pages[i];
  const last = i >= pages.length - 1;
  const stair = page.bg === "stair";
  const { desk, go } = stair ? captionShell(pic(11, "场景-楼梯"), 0.34) : captionShell(pic(16, "场景-天台"), 0.22);
  desk.classList.add("caption-teaser");
  const kids = [];
  if (page.lines) kids.push(...page.lines.map((t) => el("p", { class: "caption-line" }, [t])));
  if (page.memo) kids.push(el("p", { class: "caption-line teaser-memo" }, [page.memo]));
  if (page.say) kids.push(...teaserSay(page.say[0], page.say[1]));
  if (page.after) kids.push(el("p", { class: "caption-line teaser-after" }, [page.after]));
  if (page.small) kids.push(el("p", { class: "caption-next" }, [page.small]));
  if (last) kids.push(el("p", { class: "caption-title" }, ["第二章　未开放"]));
  kids.push(el("div", { class: "caption-acts" }, last
    ? [go("再看一遍", () => chapter2Teaser(0)), go("回到廿八屋", () => newGame())]
    : [go("……", () => chapter2Teaser(i + 1))]));
  desk.append(el("div", { class: "caption-text" }, kids));
  stage.append(desk);
  renderPlaybar();
}

// 第14关：见过陈之后离开走廊，再回来才出现钱夹
(function () {
  const orig = hubGo;
  hubGo = function (id) {
    if (S.hub && S.hub.id === "miss" && S.miss && S.hub.at === "corridor" && id !== "corridor" && S.miss.chen) {
      S.miss.leftCorr = true;
    }
    orig(id);
  };
})();
