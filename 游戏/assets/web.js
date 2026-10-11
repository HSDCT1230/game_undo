/* ---------- 廿八屋 / 墙簿 ---------- */

const HK_DISTRICTS = [
  "中西区", "湾仔", "东区", "南区", "油尖旺", "深水埗",
  "九龙城", "黄大仙", "观塘", "荃湾", "葵青", "屯门",
  "元朗", "北区", "大埔", "沙田", "西贡", "离岛",
];

const LISTINGS = [
  {
    id: "tk",
    featured: true,
    title: "大角咀 套房 近奥海城",
    rent: "$8,200",
    sub: "空房发霉，隔音差，业主已下线，07-29",
    keys: ["大角咀", "套房", "平租", "油尖旺", "业主自让"],
    img: pic(1, "廿八屋租盘/01-大角咀"),
    district: "油尖旺",
    area: "大角咀",
    nfa: "实用约 120 呎",
    age: "楼龄约 30 年",
    walk: "奥海城步行 6 分钟",
    date: "07-29",
    views: 86,
    owner: "陈太（已下线）",
    agent: false,
  },
  {
    id: "tw",
    featured: true,
    title: "荃湾 新楼 两房",
    rent: "$13,800",
    sub: "2009 入伙空关，两按一上，要担保人、粮单，07-30",
    keys: ["荃湾", "新楼"],
    img: pic(1, "廿八屋租盘/02-荃湾"),
    district: "荃湾",
    area: "荃湾",
    nfa: "实用约 430 呎",
    age: "2009 年入伙",
    walk: "荃湾站步行 4 分钟",
    date: "07-30",
    views: 214,
    owner: "中介代放",
    agent: true,
  },
  {
    id: "ssp",
    featured: true,
    title: "深水埗荣汇街 28 号 4 楼后座",
    rent: "$3,200",
    sub: "业主自住同层，人和善，可即时入住，07-28",
    keys: ["深水埗", "唐楼", "平租", "荣汇街", "业主自让"],
    img: pic(1, "廿八屋租盘/03-荣汇街"),
    district: "深水埗",
    area: "深水埗",
    nfa: "实用约 280 呎",
    age: "楼龄约 50 年",
    walk: "深水埗站步行约 8 分钟",
    date: "07-28",
    views: 12,
    owner: "周先生",
    agent: false,
  },
  {
    id: "cw",
    title: "上环 套房 近中环",
    rent: "$13,800",
    sub: "写字楼隔篱，两按一上，要粮单，07-30",
    keys: ["中西区", "上环", "中环", "套房"],
    img: pic(1, "廿八屋租盘/04-中西区-上环"),
    district: "中西区",
    area: "上环",
    nfa: "实用约 160 呎",
    age: "楼龄约 25 年",
    walk: "上环站步行 3 分钟",
    date: "07-30",
    views: 173,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140730-102",
    specs: [["按金", "两个月按金 + 一个月上期"], ["资格", "要近三个月粮单"]],
    blurb: "1990 年代单幢，套房连细厨。窗外写字楼。日间管理处接待睇楼。",
    failTitle: "代理已回覆。",
    failBody: "请先提供近三个月粮单，再安排睇楼。本盘不接受周租。",
  },
  {
    id: "wc",
    title: "铜锣湾 雅房 包家电",
    rent: "$7,500",
    sub: "板间雅房，只限上班族，07-29",
    keys: ["湾仔", "铜锣湾", "雅房"],
    img: pic(1, "廿八屋租盘/05-湾仔-铜锣湾"),
    district: "湾仔",
    area: "铜锣湾",
    nfa: "实用约 80 呎",
    age: "楼龄约 35 年",
    walk: "铜锣湾站步行 7 分钟",
    date: "07-29",
    views: 241,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140729-056",
    specs: [["资格", "上班族；要公司证明"], ["合住", "与业主亲戚分住客厅"]],
    blurb: "旧楼分间雅房，夹板墙，公共厨房。业主声明不租散工、不租夜班。",
    failTitle: "代理已回覆。",
    failBody: "本盘只限日间上班族。请提供公司在职证明后，再安排睇楼。",
  },
  {
    id: "east",
    title: "北角 一房 海景",
    rent: "$14,800",
    sub: "海景一侧，要担保人、粮单，07-28",
    keys: ["东区", "北角", "一房", "海景"],
    img: pic(1, "廿八屋租盘/06-东区-北角"),
    district: "东区",
    area: "北角",
    nfa: "实用约 320 呎",
    age: "楼龄约 20 年",
    walk: "北角站步行 5 分钟",
    date: "07-28",
    views: 198,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140728-077",
    specs: [["按金", "两个月按金 + 一个月上期"], ["资格", "要担保人、要粮单"]],
    blurb: "1990 年代私人楼一房。海景一侧，管理费另计。新租客须经代理审核。",
    failTitle: "代理已回覆。",
    failBody: "请先提供在职证明及担保人资料，再安排睇楼。",
  },
  {
    id: "south",
    title: "薄扶林 分租 一房",
    rent: "$8,200",
    sub: "无港铁，要在职证明，07-27",
    keys: ["南区", "薄扶林", "分租"],
    img: pic(1, "廿八屋租盘/07-南区-薄扶林"),
    district: "南区",
    area: "薄扶林",
    nfa: "实用约 90 呎",
    age: "楼龄约 40 年",
    walk: "巴士约 25 分钟到中环",
    date: "07-27",
    views: 64,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140727-033",
    specs: [["交通", "无港铁；以巴士及专线为主"], ["资格", "要在职证明"]],
    blurb: "南区旧楼分租一房，客厅共用。窗外山坡。睇楼请预留巴士时间。",
    failTitle: "代理已回覆。",
    failBody: "请先提供在职证明。本盘不接受即日搬入。",
  },
  {
    id: "mk",
    title: "旺角 板间房 女仔合租",
    rent: "$4,800",
    sub: "夹板分间，要女仔、要担保人，07-30",
    keys: ["油尖旺", "旺角", "合租", "板间房"],
    img: pic(1, "廿八屋租盘/08-油尖旺-旺角"),
    district: "油尖旺",
    area: "旺角",
    nfa: "实用约 50 呎",
    age: "楼龄约 45 年",
    walk: "旺角站步行 6 分钟",
    date: "07-30",
    views: 312,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140730-019",
    specs: [["资格", "只限女性；要担保人签署"], ["合住", "三房分租，公共厨厕"]],
    blurb: "旧楼板间房，约一张床位。现住两人。入住前须担保人到场签署。",
    failTitle: "代理已回覆。",
    failBody: "合租须担保人签署。请先提供担保人资料及身份证明，再安排睇楼。",
  },
  {
    id: "mf",
    title: "美孚新邨 一房",
    rent: "$11,800",
    sub: "屋苑管理，要粮单、面试，07-29",
    keys: ["深水埗", "美孚", "美孚新邨", "屋苑"],
    img: pic(1, "廿八屋租盘/09-深水埗-美孚"),
    district: "深水埗",
    area: "美孚",
    nfa: "实用约 310 呎",
    age: "楼龄约 40 年",
    walk: "美孚站步行 8 分钟",
    date: "07-29",
    views: 156,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140729-091",
    specs: [["管理费", "另计"], ["资格", "要粮单；管理处面试"]],
    blurb: "1970 年代大型屋苑一房。马赛克地砖、铁窗，有管理处。不接受口头周租。",
    failTitle: "代理已回覆。",
    failBody: "管理处须先面试，并收取近三个月粮单。本盘不接受口头周租。",
  },
  {
    id: "klnc",
    title: "土瓜湾 两房 唐楼",
    rent: "$8,800",
    sub: "无电梯唐楼，只租家庭户，07-26",
    keys: ["九龙城", "土瓜湾", "唐楼", "业主自让"],
    img: pic(1, "廿八屋租盘/10-九龙城-土瓜湾"),
    district: "九龙城",
    area: "土瓜湾",
    nfa: "实用约 380 呎",
    age: "楼龄约 50 年",
    walk: "红磡站巴士约 10 分钟",
    date: "07-26",
    views: 49,
    owner: "黄生",
    agent: false,
    code: "28WU-20140726-008",
    specs: [["资格", "只租一家三口或以上"], ["按金", "两个月"]],
    blurb: "铁路未到的土瓜湾唐楼两房。业主原文：单人免问，要一家人住。",
    failTitle: "业主已回覆。",
    failBody: "本盘只租给家庭户。单人租客请另选其他放盘。",
  },
  {
    id: "wts",
    title: "新蒲岗 工厦套房",
    rent: "$5,800",
    sub: "工厦改装，要先过订才睇楼，07-28",
    keys: ["黄大仙", "新蒲岗", "工厦", "套房"],
    img: pic(1, "廿八屋租盘/11-黄大仙-新蒲岗"),
    district: "黄大仙",
    area: "新蒲岗",
    nfa: "实用约 140 呎",
    age: "工厦改装（业主自报）",
    walk: "钻石山站步行 12 分钟",
    date: "07-28",
    views: 88,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140728-044",
    specs: [["睇楼", "须先过订金"], ["用途", "工厦改装，业主自报可住"]],
    blurb: "新蒲岗工厦自行间隔。天花高、日光灯。代理声明有诚意者先过订再睇。本站不对订金负责。",
    failTitle: "代理已回覆。",
    failBody: "业主要求先过订金才安排睇楼。本站不负责订金，请自行决定。",
  },
  {
    id: "kt",
    title: "牛头角 工厦单位",
    rent: "$6,800",
    sub: "工业用途，只接受公司租约，07-27",
    keys: ["观塘", "牛头角", "工厦"],
    img: pic(1, "廿八屋租盘/12-观塘-牛头角"),
    district: "观塘",
    area: "牛头角",
    nfa: "实用约 200 呎",
    age: "工厦",
    walk: "牛头角站步行 5 分钟",
    date: "07-27",
    views: 71,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140727-061",
    specs: [["租约", "公司租约"], ["资格", "要商业登记"]],
    blurb: "观塘工厦空置车间。不作住宅装修。住宅用途请自行向大厦查询。",
    failTitle: "代理已回覆。",
    failBody: "本盘只接受公司租约。请提供商业登记及公司证明。",
  },
  {
    id: "kwai",
    title: "葵涌 套房 近工业区",
    rent: "$6,500",
    sub: "工厦隔篱，要担保人，07-29",
    keys: ["葵青", "葵涌", "套房"],
    img: pic(1, "廿八屋租盘/13-葵青-葵涌"),
    district: "葵青",
    area: "葵涌",
    nfa: "实用约 130 呎",
    age: "楼龄约 30 年",
    walk: "葵芳站巴士约 10 分钟",
    date: "07-29",
    views: 95,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140729-028",
    specs: [["资格", "要担保人"], ["按金", "两个月按金 + 一个月上期"]],
    blurb: "葵涌旧楼套房，窗外货柜场方向。夜间货车多。代理要求担保人签署。",
    failTitle: "代理已回覆。",
    failBody: "请先提供担保人资料，再安排睇楼。本盘不接受周租。",
  },
  {
    id: "tm",
    title: "屯门 新楼 两房",
    rent: "$9,800",
    sub: "2011 入伙，两按一上，要粮单，07-30",
    keys: ["屯门", "新楼"],
    img: pic(1, "廿八屋租盘/14-屯门"),
    district: "屯门",
    area: "屯门",
    nfa: "实用约 400 呎",
    age: "2011 年入伙",
    walk: "屯门站步行 6 分钟",
    date: "07-30",
    views: 187,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140730-053",
    specs: [["按金", "两个月按金 + 一个月上期"], ["资格", "要担保人、要粮单"]],
    blurb: "屯门新市镇私人楼两房，空关。管理处日间有人。不收周租。",
    failTitle: "代理已回覆。",
    failBody: "请先提供在职证明及担保人资料，再安排睇楼。本盘不接受周租。",
  },
  {
    id: "yl",
    title: "天水围 两房",
    rent: "$8,200",
    sub: "新市镇屋苑，要父母担保，07-28",
    keys: ["元朗", "天水围", "两房"],
    img: pic(1, "廿八屋租盘/15-元朗-天水围"),
    district: "元朗",
    area: "天水围",
    nfa: "实用约 390 呎",
    age: "楼龄约 15 年",
    walk: "天水围站步行 9 分钟",
    date: "07-28",
    views: 132,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140728-039",
    specs: [["资格", "要直系亲属担保"], ["按金", "两个月按金 + 一个月上期"]],
    blurb: "天水围私人屋苑两房。业主只要有父母或兄姊作担保。单人无担保免问。",
    failTitle: "代理已回覆。",
    failBody: "本盘须直系亲属作担保人。请先提供担保人资料，再安排睇楼。",
  },
  {
    id: "north",
    title: "上水 村屋一层",
    rent: "$6,800",
    sub: "村屋一层，要一年长约，07-25",
    keys: ["北区", "上水", "村屋", "业主自让"],
    img: pic(1, "廿八屋租盘/16-北区-上水"),
    district: "北区",
    area: "上水",
    nfa: "建筑约 500 呎（业主自报）",
    age: "村屋",
    walk: "上水站专线约 15 分钟",
    date: "07-25",
    views: 41,
    owner: "刘生",
    agent: false,
    code: "28WU-20140725-006",
    specs: [["租约", "最少一年"], ["交通", "村口无车站；上水站转专线约 15 分钟"]],
    blurb: "上水村屋其中一层，瓷砖到顶。睇楼请先约专线。不租短租。",
    failTitle: "业主已回覆。",
    failBody: "本盘最少签一年。短期或即日搬入请另选市区盘。",
  },
  {
    id: "tp",
    title: "大埔 私人屋苑 两房",
    rent: "$12,200",
    sub: "屋苑管理，面试、要粮单，07-29",
    keys: ["大埔", "屋苑", "两房"],
    img: pic(1, "廿八屋租盘/17-大埔"),
    district: "大埔",
    area: "大埔",
    nfa: "实用约 420 呎",
    age: "楼龄约 18 年",
    walk: "大埔墟站步行 12 分钟",
    date: "07-29",
    views: 109,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140729-074",
    specs: [["资格", "管理处面试；要粮单"], ["管理费", "另计"]],
    blurb: "大埔私人屋苑两房，1990 年代中期入伙。新租客须经管理处面试。",
    failTitle: "代理已回覆。",
    failBody: "请先提供近三个月粮单，由管理处安排面试后再睇楼。",
  },
  {
    id: "st",
    title: "沙田第一城 一房",
    rent: "$11,500",
    sub: "大型屋苑，要在职证明，07-30",
    keys: ["沙田", "沙田第一城", "屋苑", "一房"],
    img: pic(1, "廿八屋租盘/18-沙田-第一城"),
    district: "沙田",
    area: "沙田",
    nfa: "实用约 300 呎",
    age: "楼龄约 30 年",
    walk: "第一城站步行 3 分钟",
    date: "07-30",
    views: 226,
    owner: "中介代放",
    agent: true,
    code: "28WU-20140730-081",
    specs: [["管理费", "另计"], ["资格", "要在职证明"]],
    blurb: "1980 年代沙田大型屋苑一房。有管理处。租约须交印花。不收周租。",
    failTitle: "代理已回覆。",
    failBody: "请先提供在职证明。本盘不接受口头协议。",
  },
  {
    id: "sk",
    title: "西贡墟 楼上单位",
    rent: "$7,500",
    sub: "墟镇楼上，无港铁，要长约，07-26",
    keys: ["西贡", "西贡墟", "业主自让"],
    img: pic(1, "廿八屋租盘/19-西贡-西贡墟"),
    district: "西贡",
    area: "西贡墟",
    nfa: "实用约 220 呎",
    age: "楼龄约 35 年",
    walk: "巴士／小巴；无港铁",
    date: "07-26",
    views: 37,
    owner: "何太",
    agent: false,
    code: "28WU-20140726-012",
    specs: [["交通", "无港铁；睇楼请自行安排"], ["租约", "最少十个月"]],
    blurb: "西贡墟铺楼上，周末街市声。业主只要长约，不租周租。",
    failTitle: "业主已回覆。",
    failBody: "乡郊交通请自行安排。本盘最少十个月，不接受即日搬入。",
  },
  {
    id: "isl",
    title: "东涌 套房",
    rent: "$8,800",
    sub: "机场新市镇，机场员工优先，07-27",
    keys: ["离岛", "东涌", "套房", "业主自让"],
    img: pic(1, "廿八屋租盘/20-离岛-东涌"),
    district: "离岛",
    area: "东涌",
    nfa: "实用约 150 呎",
    age: "楼龄约 12 年",
    walk: "东涌站步行 9 分钟",
    date: "07-27",
    views: 58,
    owner: "郑生",
    agent: false,
    code: "28WU-20140727-017",
    specs: [["资格", "机场相关从业员优先"], ["按金", "两个月"]],
    blurb: "东涌 2002 年前后私人楼套房。业主原文：做机场或航空公司嗰啲优先。",
    failTitle: "业主已回覆。",
    failBody: "本盘优先租给机场相关从业员。其他职业请先提供在职证明再议。",
  },
];

function listingById(id) {
  return LISTINGS.find((l) => l.id === id) || LISTINGS.find((l) => l.id === "ssp");
}

function homeLatest() {
  return ["yl", "tw", "tk"].map((id) => listingById(id));
}

const NEWS = {
  rain: {
    date: "2014-07-30",
    title: "本周有骤雨及雷暴　郊游人士须留意天气",
    body: "天文台预计未来数日有骤雨及雷暴，局部地区雨势颇大。市民外出请带备雨具。郊野公园及乡郊斜坡在暴雨期间请避免逗留。",
  },
  school: {
    date: "2014-07-29",
    title: "开学在即　家长留意课本及校服开支",
    body: "新学年将于九月开始。有家长团体提醒尽早比较课本及校服价钱，并留意学校指定供应商安排。教育局称会继续检视课本加幅。",
  },
  heat: {
    date: "2014-07-28",
    title: "天文台发出酷热天气警告　市区气温升至三十三度",
    body: "受高气压支配，本港天气酷热。天文台已发出酷热天气警告，呼吁市民减少户外逗留，多喝水。长者、户外工人及小童尤须注意。",
  },
  mtr: {
    date: "2014-07-25",
    title: "港铁：周末晚间部分列车服务调整",
    body: "港铁表示，本周末晚间部分市区线列车将加密或调整班次，以配合维修工程。乘客请留意月台广播及车站通告，预留额外交通时间。",
  },
  urb: {
    date: "2014-07-22",
    title: "市建局：深水埗指定范围持续研究",
    body: "市区重建局重申，深水埗指定范围仍属研究阶段，未有收地或收购时间表。局方公开页写明下一轮地区咨询暂订八月下旬，详情以局方公布为准。研究范围文字提及荣汇街一带唐楼。文件写业主将获补偿，补偿尚未发放。",
  },
  labour: {
    date: "2014-07-21",
    title: "劳工处提醒户外工人防中暑",
    body: "劳工处呼吁雇主为户外工人提供足够饮水、遮荫及休息时间。如出现头晕、恶心，应立即到阴凉处休息，严重者须求医。",
  },
  food: {
    date: "2014-07-15",
    title: "食环署加强夏季食物巡查",
    body: "食物环境卫生署表示，夏季将加强巡查食肆及街市，重点包括雪柜温度、熟食存放及虫鼠防治。市民选购食物亦须注意冷藏及食用期限。",
  },
  worldcup: {
    date: "2014-07-14",
    title: "世界杯结束　湾仔酒吧街人流回落",
    body: "巴西世界杯决赛结束后，中环兰桂坊、湾仔酒吧街一带人流较赛事期间明显减少。有商户表示一个月生意好过平时，现已回复夏季平常水平。",
  },
  clinic: {
    date: "2014-07-08",
    title: "湾仔夜间专科门诊试验加开",
    body: "医管局表示，部分专科夜间门诊将试验由私家诊所分担，以缩短轮候。参与诊所名单稍后再公布。",
  },
  mud: {
    date: "2013-09-18",
    title: "西贡乡郊山泥倾泻一年　土木署维持天灾结论",
    body: "（本站转载）西贡十二乡一带去年九月雨后发生山泥倾泻，造成两人死亡，为同村一户的妻子与儿子。受访业主周姓，称是天意。同场有人送礼。土木工程拓展署其后公布调查，结论维持「雨后斜坡失稳」。公开文件记录现场排水口有淤塞。署方表示个案已结束。",
  },
};

/* ---------- 网页上的时间：一律对着游戏钟，不准比钟快 ---------- */

const pad2 = (n) => String(n).padStart(2, "0");

function webDate(mmdd, hm) {
  const [mo, d] = mmdd.split("-").map(Number);
  const [h, mi] = (hm || "00:00").split(":").map(Number);
  return new Date(2014, mo - 1, d, h, mi);
}

function clockHasHm() {
  return /\d{1,2}:\d{2}/.test(S.time || "");
}

function clockDate() {
  const day = storyDay();
  const m = /(\d{1,2}):(\d{2})/.exec(S.time || "");
  return new Date(2014, Math.floor(day / 100) - 1, day % 100, m ? Number(m[1]) : 23, m ? Number(m[2]) : 59);
}

function webStamp(t) {
  return pad2(t.getMonth() + 1) + "-" + pad2(t.getDate()) + " " + pad2(t.getHours()) + ":" + pad2(t.getMinutes());
}

function webAgo(t) {
  const now = clockDate();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(t)) / 86400000);
  const hm = pad2(t.getHours()) + ":" + pad2(t.getMinutes());
  if (diff === 0) return "今天 " + hm;
  if (diff === 1) return "昨天 " + hm;
  return webStamp(t);
}

function webPast(t) {
  return t.getTime() <= clockDate().getTime();
}

function isSerial(id) {
  return id === "wk1" || id === "wk2" || id === "wk3";
}

function serialAt(id) {
  const at = S.postAt && S.postAt[id];
  return at ? new Date(at) : webDate(...THREADS[id].time.split(" "));
}

function threadTime(id) {
  return isSerial(id) ? webStamp(serialAt(id)) : THREADS[id].time;
}

function threadReplies(id) {
  const t = THREADS[id];
  const rows = t.replies || [];
  if (!isSerial(id)) return rows;
  const base = webDate(...t.time.split(" ")).getTime();
  const at = serialAt(id).getTime();
  return rows
    .map((r) => Object.assign({}, r, { at: new Date(at + webDate(...r.time.split(" ")).getTime() - base) }))
    .filter((r) => webPast(r.at))
    .map((r) => Object.assign(r, { time: webStamp(r.at) }));
}

function serialWhen(id) {
  return webDate(...THREADS[id].time.split(" ")).getTime();
}

function pinSerial(id) {
  S.postAt = S.postAt || {};
  S.postAt[id] = serialWhen(id);
}

// 钟一过剧本上的钟点就发，时间钉死，不跟「你哪一刻点发布」走。不然回复被推到还没到的钟，下一帖对不上。
const SERIAL_DUE = [
  { id: "wk1", key: "serial1", ready: () => hasEvidence("paper-16") || S.level >= 8 },
  { id: "wk2", key: "serial2", ready: () => hasEvidence("paper-norec") || S.level >= 10 },
  { id: "wk3", key: "serial3", ready: () => S.level >= 11 },
];

function ensureSerials() {
  if (!S || !S.flags) return;
  const now = clockDate().getTime();
  SERIAL_DUE.forEach((d) => {
    const when = serialWhen(d.id);
    if (flag(d.key)) {
      if (!S.postAt || S.postAt[d.id] !== when) pinSerial(d.id);
      return;
    }
    if (!d.ready() || now < when) return;
    pinSerial(d.id);
    flag(d.key, true);
  });
}

function newsCaseOpen() {
  return S.level >= 14 && !(hasEvidence("news-mud") && hasEvidence("news-urb"));
}

function newsIds(limit) {
  let ids = Object.keys(NEWS).sort((a, b) => NEWS[b].date.localeCompare(NEWS[a].date));
  // 后半段要自己翻到西贡／市建局：仍夹在普通港闻里，但别沉到滚很久才见
  if (newsCaseOpen()) {
    const pin = ["urb", "mud"].filter((id) => ids.includes(id));
    const rest = ids.filter((id) => !pin.includes(id));
    ids = rest.slice(0, 2).concat(pin, rest.slice(2));
  }
  return limit ? ids.slice(0, limit) : ids;
}

function newsLink(id, mini) {
  const n = NEWS[id];
  const seen = !!(S.newsSeen && S.newsSeen[id]);
  return el("a", {
    href: "http://28house.hk/news/" + id,
    class: (mini ? "mini-row" : "forum-row news-row") + (seen ? " seen" : ""),
    onclick: (e) => {
      e.preventDefault();
      S.newsSeen = S.newsSeen || {};
      S.newsSeen[id] = true;
      goWeb("newsitem", { newsId: id });
    },
  }, [
    el("span", { class: "fmeta" }, [n.date]),
    el("span", { class: "ftitle" }, [n.title]),
  ]);
}

const THREADS = {
  helpzhang: {
    board: "求助",
    title: "散工女 深水埗 急求平租 口头得 人当我神经",
    user: "阿琪V",
    time: "07-22",
    body: "同阿乐分手三个月。短租快到期，表姐沙发不想再坐，前度当我神经。夜里又见到嘢，解释唔清，唔想再被人一个字打发。深水埗长大，求唐楼平租，现金口头，唔好问粮单。有盘直接丢连结。",
    replies: [
      { user: "街坊路过", time: "07-23 11:02", body: "美孚要面试同粮单。散工好难。短租酒店更贵。" },
      { user: "屯门住客", time: "07-25 19:40", body: "我都散工。中介一听粮单就收线。工厦阁楼有时平，不过深水埗我唔熟。" },
      { user: "藤先生", time: "07-29 01:14", body: "有人听得完你讲。廿八屋而家有业主自让，深水埗荣汇街，现金口头。你自己点进去睇。", listing: "ssp" },
      { user: "夜猫", time: "07-30 02:06", body: "旧楼半夜水喉响好正常。你先睡得着再讲租。唔好一惊就搬。" },
    ],
  },
  stamp: {
    board: "租务",
    title: "口头租约无印花，后尾点追？",
    user: "散工阿强",
    time: "07-26",
    body: "朋友话平租可以口头、现金、唔打印花。律师朋友讲：出事先至知无纸。业主自让嗰啲最钟意咁。你租得过今晚，但追不回按金。",
  },
  sspbbs: {
    board: "地区",
    title: "深水埗唐楼平租会唔会中伏",
    user: "北河街街坊",
    time: "07-24",
    body: "后座平一截通常有原因：暗、无电梯、同层住业主。重建研究名单年年传，传完又无事。夜响好正常，老鼠同水管。",
  },
  night: {
    board: "杂谈",
    title: "旧楼夜响好正常",
    user: "住开唐楼",
    time: "07-19",
    body: "水喉、老鼠、隔壁电视。旧楼就系咁。",
  },
  ghost: {
    board: "求助",
    title: "长沙湾后座日日有细路声，问过话冇住人",
    user: "短租过",
    time: "07-20",
    body: "业主话旧物仓，锁住。我听过玩具车辘地。第二日佢话我神经。已搬走。唔好问边栋，我唔想再被寻。",
  },
  wk1: {
    board: "杂谈",
    title: "医生话未听完，返到屋企已经自己动咗",
    user: "阿琪V",
    time: "08-17 09:00",
    body: "个医生唔判我有病，亦唔讲有鬼。叫我留低记。我返到，出门前车头朝窗，而家朝门。水喉我未拧，已经滴。我食得落。我冇问题。有问题系间屋。有人肯听完。我未敢写佢名。下星期六我会再去。唔写门牌。",
    replies: [
      { user: "住开唐楼", time: "08-17 09:22", body: "旧楼水管。你又写。" },
      { user: "短租过", time: "08-17 10:05", body: "唔好写门牌。我写过地址，第二日话我神经。" },
      { user: "阿七", time: "08-17 11:18", body: "我留低。下星期你再讲。" },
    ],
  },
  wk2: {
    board: "杂谈",
    title: "离开两分钟先动，有一夜我冇录音",
    user: "阿琪V",
    time: "08-24 09:40",
    body: "我照医生讲，有一夜关掉录音。去洗面。返来车在地上。我冇声可以交。二十号我入厕所两分钟，脚印先出现。我在厅里望住，佢唔动。我仍然冇问题。有一人肯听完。我未信屋。我靠星期六。",
    replies: [
      { user: "阿七", time: "08-24 10:02", body: "你写离开两分钟。我追。" },
      { user: "住开唐楼", time: "08-24 10:30", body: "停一晚录音，车都会自己动。都系水管。" },
      { user: "藤先生", time: "08-24 11:14", body: "你写低。下星期再讲。" },
      { user: "短租过", time: "08-24 12:01", body: "有人留一句就走。你小心。" },
    ],
  },
  wk3: {
    board: "杂谈",
    title: "医生要医我，佢话要像人先，下星期六再讲",
    user: "阿琪V",
    time: "08-31 22:05",
    body: "三个星期六。佢先要医我。我话佢唔信。后来佢话更像人，但唔约上门。叫我下星期六再带纸。上门唔系治疗，系佢自己讲过。有人对我好。我不写名。下星期六我还会去。",
    replies: [
      { user: "阿七", time: "08-31 22:40", body: "三个星期。藤先生呢个星期冇出声。下星期六你真的再去？" },
      { user: "住开唐楼", time: "08-31 23:02", body: "医生要医你，先至正常。你唔好叫人夜里上门。" },
      { user: "短租过", time: "08-31 23:36", body: "我搬咗。你仲写。" },
    ],
  },
};

function threadVisible(id) {
  if (id === "helpzhang") return postedHelp();
  if (id === "wk1") return flag("serial1");
  if (id === "wk2") return flag("serial2");
  if (id === "wk3") return flag("serial3");
  return true;
}

function unreadSerial() {
  const fresh = (id, posted, seen) => flag(posted) && !flag(seen) && threadReplies(id).length;
  if (fresh("wk3", "serial3", "sawWk3")) return "wk3";
  if (fresh("wk2", "serial2", "sawWk2")) return "wk2";
  if (fresh("wk1", "serial1", "sawWk1")) return "wk1";
  return "";
}

function listingBlob(l) {
  return [l.title, l.sub, l.area, l.district].concat(l.keys).join(" ");
}

function listingIsShare(l) {
  return /合租|分租|雅房|板间|分住/.test(listingBlob(l));
}

function listingIsEstate(l) {
  return /屋苑|新邨|第一城|花园/.test(listingBlob(l));
}

function applyListFilter(rows) {
  const f = S.listFilter || "all";
  if (f === "owner") return rows.filter((l) => !l.agent);
  if (f === "share") return rows.filter(listingIsShare);
  if (f === "estate") return rows.filter(listingIsEstate);
  return rows;
}

function filtered() {
  const q = S.query.trim();
  let rows;
  if (q === "业主自让") {
    return applyListFilter(LISTINGS.filter((l) => !l.agent));
  } else if (!q) {
    rows = [];
  } else if (HK_DISTRICTS.includes(q)) {
    rows = LISTINGS.filter((l) => l.district === q);
  } else {
    const words = q.split(/\s+/).filter(Boolean);
    rows = LISTINGS.filter((l) => words.some((w) => listingBlob(l).includes(w)));
  }
  return applyListFilter(rows);
}

function postedHelp() {
  return flag("postedHelp");
}

function holdForPost(screen) {
  if (S.pendingPost) {
    if (screen === "post") return false;
    showPrompt("有内容待发布。", "请先发布，再浏览其他页面。");
    if (S.screen !== "post") {
      S.screen = "post";
      S.tab = "house";
      draw();
    }
    return true;
  }
  if (postedHelp() || screen === "post") return false;
  showPrompt("求助帖还没顶。", "请先顶帖，再浏览其他页面。");
  if (S.screen !== "post") {
    S.screen = "post";
    S.tab = "house";
    draw();
  }
  return true;
}

function needPostFirst() {
  return holdForPost("list");
}

function blockedLogout() {
  showPrompt("登出失败。", "网页无回应，请稍后再试。");
}

function currentSlate() {
  if (S.mode === "search" && !(S.slateOff || {}).look) {
    return { id: "look", text: "站内新闻可以再翻。" };
  }
  if (S.mode !== "web") return null;
  if (S.pendingPost && S.screen === "post" && !(S.slateOff || {})["draft-" + S.pendingPost]) {
    return { id: "draft-" + S.pendingPost, text: "检查无误后发布。" };
  }
  if (!postedHelp() && S.screen === "post" && !(S.slateOff || {}).start) {
    return { id: "start", text: "帖子沉下去了，顶上去，再自己搜。" };
  }
  return null;
}

function offerSlate() {
  const s = currentSlate();
  if (!s || S.modal || document.getElementById("slate")) return;
  const desk = stage.querySelector(".desk");
  if (!desk) return;
  desk.classList.add("has-slate");
  desk.append(el("div", { class: "slate", id: "slate" }, [
    el("span", { class: "slate-k" }, ["提示"]),
    el("p", {}, [s.text]),
    el("button", {
      type: "button",
      class: "slate-ok",
      title: "收起",
      onclick: () => {
        S.slateOff[s.id] = true;
        clearSlate();
      },
    }, ["×"]),
  ]));
}

function clearSlate() {
  const n = document.getElementById("slate");
  if (n) n.remove();
  const desk = document.querySelector(".desk");
  if (desk) desk.classList.remove("has-slate");
}

function publishHelpPost() {
  sfx("send");
  flag("postedHelp", true);
  clearSlate();
  showPrompt("已顶帖。");
}

function districtSelected(d) {
  const q = (S.query || "").trim();
  if (q === d || q.startsWith(d + " ")) return true;
  if (d === "油尖旺" && /旺角|大角咀/.test(q)) return true;
  if (d === "东区" && q.includes("北角")) return true;
  return false;
}

function laptop(inner, opts) {
  opts = opts || {};
  const tab = opts.tab;
  const addr = opts.addr;
  const scene = !!opts.scene;
  const desk = el("div", { class: "desk" });
  const laptopBox = el("div", { class: "laptop" });
  const screen = el("div", { class: "laptop-screen" });
  const titlebar = el("div", { class: "browser-titlebar" }, [
    el("span", { class: "ie-icon", "aria-hidden": "true" }, ["e"]),
    el("span", {}, [(opts.title || (tab === "wall" ? wallCountLabel("墙簿", wallUnread().n) : "廿八屋")) + " - Windows Internet Explorer"]),
    browserCloseControls(),
  ]);
  const canBack = scene ? !!S.searchDoc : (S.webHist || []).length > 0;
  const chrome = el("div", { class: "browser-chrome" }, [
    el("div", { class: "browser-nav" }, [
      el("button", {
        type: "button",
        disabled: !canBack,
        onclick: scene ? () => { S.searchDoc = ""; drawSearch(); } : webBack,
        title: "后退",
      }, ["←"]),
      el("button", { type: "button", disabled: true, title: "前进" }, ["→"]),
      el("button", { type: "button", disabled: true, title: "停止" }, ["■"]),
      el("button", {
        type: "button",
        onclick: scene ? () => { S.searchDoc = ""; drawSearch(); } : () => draw(),
        title: "刷新",
      }, ["↻"]),
    ]),
    el("span", { class: "addr-label" }, ["地址"]),
    el("div", { class: "addr" }, [addr]),
    el("button", { type: "button", class: "go-btn", disabled: true, tabindex: "-1" }, ["转到"]),
  ]);
  const tabs = el("div", { class: "browser-tabs" }, [
    btnTab("廿八屋 - 香港租盘", "house", tab, scene),
    btnTab(wallCountLabel("墙簿", wallUnread().n) + " - 我的首页", "wall", tab, scene),
  ]);
  const status = el("div", { class: "browser-status" }, [
    el("span", {}, ["完成"]),
    el("span", {}, ["Internet　│　100%"]),
  ]);
  screen.append(titlebar, chrome, tabs, inner, status);
  laptopBox.append(screen);
  desk.append(laptopBox);
  return desk;
}

function btnTab(label, id, on, scene) {
  return el("button", {
    type: "button",
    class: id === on ? "on" : "",
    onclick: () => {
      if (scene) {
        browseFromScene(id === "wall" ? "wall" : "home");
        return;
      }
      if (id === "wall") goWeb("wall");
      else goWeb(flag("searched") ? "list" : "home");
    },
  }, [label]);
}

function webLink(text, fn, cls) {
  return el("a", {
    href: "#",
    class: cls || "web-link",
    onclick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      fn();
    },
  }, [text]);
}

function snapWeb() {
  return {
    screen: S.screen,
    tab: S.tab,
    listing: S.listing,
    wallWho: S.wallWho,
    forumId: S.forumId,
    newsId: S.newsId,
    query: S.query,
    listFilter: S.listFilter || "all",
  };
}

function browseFromScene(screen) {
  if (S.mode !== "web") {
    S.paused = { mode: S.mode, talk: S.talk, wait: S.wait };
    if (S.mode === "night") stopNightClock();
    S.mode = "web";
  }
  goWeb(String(screen).startsWith("wall") ? screen : (postedHelp() ? "home" : "post"));
}

function openRental() {
  if (S.mode !== "web") {
    S.paused = { mode: S.mode, talk: S.talk, wait: S.wait };
    if (S.mode === "night") stopNightClock();
    S.mode = "web";
  }
  goWeb(postedHelp() ? "forum" : "post");
}

// 第二关起人已经住进／在场，浏览器只是叠在房间上；关窗口必须回房间。
// 存档会丢掉 paused／hub，所以不能再靠这两样判断——否则底栏一直灰着「浏览器」。
function browserOverRoom() {
  return S.mode === "web" && S.level > 1;
}

function browserCloseControls() {
  if (!browserOverRoom()) {
    return el("span", { class: "window-controls", "aria-hidden": "true" }, ["—　□　×"]);
  }
  return el("span", { class: "window-controls" }, [
    el("span", { "aria-hidden": "true" }, ["—　□　"]),
    el("button", {
      type: "button",
      class: "window-x",
      title: "关闭网页，回到房间",
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeRental();
      },
    }, ["×"]),
  ]);
}

function leaveBrowserToRoom() {
  if (typeof closeModal === "function") closeModal();
  S.pendingPost = "";
  const p = S.paused;
  S.paused = null;
  if (p && p.mode && p.mode !== "web") {
    S.mode = p.mode;
    S.talk = p.talk;
    S.wait = p.wait;
    if (p.mode === "night" && typeof startNightClock === "function") startNightClock();
    draw();
    return true;
  }
  if (S.hub && typeof HUBS !== "undefined" && HUBS[S.hub.id]) {
    if (typeof backToHub === "function") backToHub();
    else {
      S.mode = "hub";
      draw();
    }
    return true;
  }
  const L = typeof LEVELS !== "undefined" ? LEVELS[S.level] : null;
  if (L && typeof L.start === "function") {
    L.start();
    return true;
  }
  return false;
}

function closeRental() {
  if (typeof sfxWebClose === "function") sfxWebClose();
  if (!leaveBrowserToRoom()) draw();
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !browserOverRoom()) return;
  if (notesLayer && !notesLayer.hidden) return;
  if (document.getElementById("pic-zoom")) return;
  closeRental();
});

function goWeb(screen, extra) {
  extra = extra || {};
  if (screen === "district") {
    screen = "list";
    extra.search = true;
    if (!("filter" in extra)) extra.filter = "all";
  } else if (screen === "estate") {
    screen = "list";
    extra.search = true;
    extra.filter = "estate";
  } else if (screen === "share") {
    screen = "list";
    extra.search = true;
    extra.filter = "share";
  }
  if (holdForPost(screen)) return;
  if (!extra.replace) {
    S.webHist = S.webHist || [];
    const cur = snapWeb();
    const last = S.webHist[S.webHist.length - 1];
    if (!last || last.screen !== cur.screen || last.tab !== cur.tab) {
      S.webHist.push(cur);
      if (S.webHist.length > 24) S.webHist.shift();
    }
  }
  S.screen = screen;
  S.wallFresh = null;
  S.wallNav = (S.wallNav || 0) + 1;
  if (extra.tab) S.tab = extra.tab;
  else if (screen === "ad" || screen === "wall" || String(screen).indexOf("wall-") === 0) S.tab = "wall";
  else S.tab = "house";
  if ("listing" in extra) S.listing = extra.listing;
  if ("wallWho" in extra) S.wallWho = extra.wallWho;
  if ("forumId" in extra) S.forumId = extra.forumId;
  if ("newsId" in extra) S.newsId = extra.newsId;
  if ("query" in extra) S.query = extra.query;
  if ("filter" in extra) S.listFilter = extra.filter;
  if (extra.search) flag("searched", true);
  draw();
}

function webBack() {
  if (holdForPost("home")) return;
  const prev = (S.webHist || []).pop();
  if (!prev) return;
  S.screen = prev.screen;
  S.tab = prev.tab;
  S.listing = prev.listing;
  S.wallWho = prev.wallWho;
  S.forumId = prev.forumId;
  S.newsId = prev.newsId;
  S.query = prev.query;
  S.listFilter = prev.listFilter || "all";
  draw();
}

/* 网页内容区滚动：同页重绘（回应展开、收藏、记下）保住位置；换页才回到顶 */
function webPageScrollEl(root) {
  root = root || stage;
  if (!root) return null;
  return root.querySelector(".laptop-screen > .hk-site") || root.querySelector(".hk-site");
}

function webViewKey() {
  return [
    S.mode || "",
    S.tab || "",
    S.screen || "",
    S.listing || "",
    S.forumId || "",
    S.newsId || "",
    S.wallWho || "",
    S.query || "",
    S.listFilter || "",
  ].join("|");
}

let webScrollSnap = null;

function rememberWebScroll() {
  const el = webPageScrollEl();
  if (!el) {
    webScrollSnap = null;
    return;
  }
  webScrollSnap = { key: webViewKey(), top: el.scrollTop, left: el.scrollLeft };
}

function applyWebScroll() {
  const snap = webScrollSnap;
  webScrollSnap = null;
  if (!snap || snap.key !== webViewKey()) return;
  const put = () => {
    const el = webPageScrollEl();
    if (!el) return;
    el.scrollTop = snap.top;
    el.scrollLeft = snap.left;
  };
  put();
  requestAnimationFrame(() => {
    put();
    // 展开回应栏时，只在必要时微移，避免被裁在视口外；不滚回顶
    const draft = stage && stage.querySelector(".post-reply-wrap.open .wall-draft");
    if (draft && draft.scrollIntoView) draft.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

function renderWeb() {
  rememberWebScroll();
  sfxWebOpen();
  clearStage();
  const inner = webInner();
  const wallish = S.tab === "wall" || S.screen === "ad" || String(S.screen).indexOf("wall-") === 0;
  stage.append(laptop(inner, { tab: wallish ? "wall" : "house", addr: webAddr() }));
  if (S.modal) stage.append(S.modal);
  else offerSlate();
  renderPlaybar();
  applyWebScroll();
}

function webAddr() {
  const q = encodeURIComponent(S.query || "");
  const map = {
    home: "http://28house.hk/",
    list: "http://28house.hk/search?q=" + q,
    detail: "http://28house.hk/property/" + (S.listing || "ssp"),
    inbox: "http://28house.hk/pm/inbox",
    pm: "http://28house.hk/pm/compose",
    share: "http://28house.hk/share",
    district: "http://28house.hk/district",
    estate: "http://28house.hk/estate",
    forum: "http://28house.hk/bbs",
    thread: "http://28house.hk/bbs/t/" + (S.forumId || ""),
    rules: "http://28house.hk/help/tenancy",
    news: "http://28house.hk/news",
    newsitem: "http://28house.hk/news/" + (S.newsId || ""),
    login: "http://28house.hk/member/login",
    favs: "http://28house.hk/member/favs",
    post: "http://28house.hk/post",
    landlord: "http://28house.hk/user/chow",
    about: "http://28house.hk/about",
    wall: "http://wallbook.hk/home",
    ad: "http://wallbook.hk/ad/teng",
    "wall-me": "http://wallbook.hk/profile/vicky",
    "wall-friends": "http://wallbook.hk/friends",
    "wall-mail": "http://wallbook.hk/inbox",
    "wall-set": "http://wallbook.hk/settings",
    "wall-user": "http://wallbook.hk/profile/" + (S.wallWho || ""),
  };
  return map[S.screen] || "http://28house.hk/";
}

function webInner() {
  const views = {
    home: viewHome,
    list: viewList,
    detail: viewDetail,
    inbox: viewInbox,
    pm: viewPm,
    forum: viewForum,
    thread: viewThread,
    rules: viewRules,
    news: viewNews,
    newsitem: viewNewsItem,
    login: viewLogin,
    favs: viewFavs,
    post: viewPost,
    landlord: viewLandlord,
    about: viewAbout,
    wall: viewWall,
    ad: viewAd,
    "wall-me": viewWallMe,
    "wall-friends": viewWallFriends,
    "wall-mail": viewWallMail,
    "wall-set": viewWallSet,
    "wall-user": viewWallUser,
  };
  const fn = views[S.screen];
  return fn ? fn() : viewHome();
}

function hkNavItem(label, screen, extra) {
  const on =
    S.screen === screen ||
    (screen === "list" && (S.screen === "detail" || S.screen === "list")) ||
    (screen === "forum" && S.screen === "thread") ||
    (screen === "news" && S.screen === "newsitem");
  return el("button", {
    type: "button",
    class: "hk-nav-item" + (on ? " on" : ""),
    onclick: () => {
      extra = extra || {};
      if (screen === "list") extra.search = true;
      goWeb(screen, extra);
    },
  }, [label]);
}

function houseHeader() {
  const mail = flag("askedOld") && !flag("sawMail")
    ? (replyReady() ? "站内留言(1)" : "站内留言(待回)")
    : "站内留言";
  return el("div", { class: "site-header" }, [
    el("button", {
      type: "button",
      class: "logo-btn",
      onclick: () => goWeb("home"),
    }, [el("div", { class: "logo", html: "廿八屋<small>香港楼盘　业主自让　2014</small>" })]),
    el("div", { class: "hdr-tools" }, [
      el("span", {}, [S.time.replace("2014年", "")]),
      el("button", { type: "button", class: "btn ghost hdr-btn", onclick: () => goWeb("inbox") }, [mail]),
      el("button", { type: "button", class: "btn ghost hdr-btn", onclick: () => goWeb("favs") }, [
        (S.favs || []).length ? "收藏(" + S.favs.length + ")" : "收藏",
      ]),
      el("button", { type: "button", class: "btn ghost hdr-btn", onclick: () => goWeb("login") }, ["章慧琪"]),
    ]),
  ]);
}

function houseNav() {
  return el("nav", { class: "hk-nav" }, [
    hkNavItem("首页", "home"),
    hkNavItem("租盘", "list"),
    hkNavItem("讨论区", "forum"),
    hkNavItem("新闻", "news"),
    el("span", { class: "hk-nav-gap" }, ["│"]),
    (() => {
      const btn = hkNavItem("免费刊登", "post");
      if (!postedHelp() || S.pendingPost) btn.className += " quest";
      return btn;
    })(),
    hkNavItem("账户", "login"),
  ]);
}

function houseFooter() {
  return el("footer", { class: "hk-footer" }, [
    webLink("租务须知", () => goWeb("rules")),
    " | ",
    webLink("新闻中心", () => goWeb("news")),
    " | ",
    webLink("关于廿八屋", () => goWeb("about")),
    " | ",
    webLink("讨论区", () => goWeb("forum")),
    el("div", {}, ["廿八屋 28House　2011–2014　香港业主自让　不负责成交　请自行查册"]),
  ]);
}

function crumb(parts) {
  const kids = [];
  parts.forEach((p, i) => {
    if (i) kids.push("  ›  ");
    if (p.go) kids.push(webLink(p.text, p.go));
    else kids.push(el("span", {}, [p.text]));
  });
  return el("div", { class: "crumb" }, kids);
}

function backLink(label, fn) {
  return el("p", { class: "fine back-link" }, [webLink("« 返回" + label, fn)]);
}

function siteNotice(meta, kids) {
  return el("div", { class: "site-msg" }, [
    el("p", { class: "mail-meta" }, [meta]),
  ].concat(kids));
}

function houseShell(bodyKids, trail) {
  const wrap = el("div", { class: "hk-site" });
  wrap.append(houseHeader(), houseNav());
  if (trail) wrap.append(crumb(trail));
  const parent = trail && trail.length >= 2 ? trail[trail.length - 2] : null;
  const body = parent && parent.go
    ? [backLink(parent.text, parent.go)].concat(bodyKids)
    : bodyKids;
  wrap.append(el("div", { class: "site-body hk-body" }, body));
  wrap.append(houseFooter());
  return wrap;
}

function sideBox(title, kids) {
  return el("aside", { class: "side-box" }, [el("h3", {}, [title])].concat(kids));
}

function viewHome() {
  const input = el("input", { type: "search", value: S.query, maxlength: "40" });
  input.addEventListener("input", () => { S.query = input.value; });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
  const chips = el("div", { class: "hot-chips" }, [
    el("span", {}, ["热门地区："]),
    ...["元朗", "荃湾", "屯门", "大角咀", "湾仔", "北角"].map((d) =>
      webLink(d, () => {
        S.query = d;
        doSearch();
      }, "chip")
    ),
  ]);
  const latest = el("div", { class: "mini-list" }, homeLatest().map((l) =>
    el("button", {
      type: "button",
      class: "mini-row",
      onclick: () => {
        if (needPostFirst()) return;
        flag("searched", true);
        goWeb("detail", { listing: l.id });
      },
    }, [
      el("span", {}, [l.title]),
      el("b", {}, [l.rent]),
    ])
  ));
  const news = el("div", { class: "mini-list" }, newsIds(5).map((id) => newsLink(id, true)));
  const mainKids = [chips];
  if (postedHelp() && !flag("sawOwnPost")) {
    mainKids.unshift(siteNotice("讨论区通知", [
      el("p", {}, [
        "你在「求助」的帖子有新回复。",
        "　",
        webLink("查看帖子", () => goWeb("thread", { forumId: "helpzhang" })),
      ]),
    ]));
  }
  const freshHome = unreadSerial();
  if (freshHome) {
    const t = THREADS[freshHome];
    mainKids.unshift(siteNotice("杂谈有新回复", [
      el("p", {}, [
        webLink(t.title, () => goWeb("thread", { forumId: freshHome })),
      ]),
    ]));
  }
  if (flag("askedOld") && replyReady() && !flag("sawMail")) {
    mainKids.unshift(siteNotice("站内留言", [
      el("p", {}, [
        "周先生回复了你。",
        "　",
        webLink("查看", () => goWeb("inbox")),
      ]),
    ]));
  }
  const main = el("div", { class: "hk-main search-hero" }, [
    ...mainKids,
    el("h1", {}, ["搜租盘"]),
    el("div", { class: "search-row" }, [
      input,
      el("button", { type: "button", class: "btn", onclick: doSearch }, ["搜寻"]),
    ]),
    el("p", { class: "hint" }, ["最近搜过：元朗　天水围　／　荃湾　新楼　／　大角咀　套房"]),
    el("div", { class: "home-grid" }, [
      el("section", {}, [el("h2", { class: "sec-h" }, ["最新放盘"]), latest]),
      el("section", {}, [el("h2", { class: "sec-h" }, ["站内新闻"]), news]),
    ]),
  ]);
  const side = el("div", { class: "hk-side" }, [
    sideBox("租务提示", [
      el("p", {}, ["租约应交印花税。未加盖印花，有争议时文件可能不被接纳。"]),
      el("p", {}, ["私人屋苑多见两按一上。业主自让条款各有不同，以双方约定为准。"]),
      webLink("租务须知（摘录）", () => goWeb("rules")),
    ]),
    sideBox("你可能想睇", [
      postedHelp()
        ? webLink("讨论区：散工女急求平租", () => goWeb("thread", { forumId: "helpzhang" }))
        : webLink("免费刊登", () => goWeb("post")),
      el("br"),
      webLink("讨论区：旧楼夜响", () => goWeb("thread", { forumId: "night" })),
      el("br"),
      webLink("市建局研究新闻", () => goWeb("newsitem", { newsId: "urb" })),
    ]),
  ]);
  const wrap = houseShell([el("div", { class: "hk-layout" }, [main, side])], [
    { text: "首页" },
  ]);
  setTimeout(() => input.focus(), 0);
  return wrap;
}

function listingShort(l) {
  return l.title.split(" ").slice(0, 2).join("");
}

function markOwnSearch() {
  const q = (S.query || "").trim();
  if (q && q !== "元朗 天水围") flag("ownSearch", true);
}

function doSearch() {
  if (needPostFirst()) return;
  flag("searched", true);
  markOwnSearch();
  goWeb("list", { search: true });
  if (S.query.trim() && !filtered().length) showPrompt("暂无盘。", "没有符合的结果。");
}

function listFilterBar() {
  return el("div", { class: "list-filters" }, [
    ["全部", "all"],
    ["业主自让", "owner"],
    ["合租", "share"],
    ["屋苑", "estate"],
  ].map(([label, id]) => el("button", {
    type: "button",
    class: "filter-chip" + ((S.listFilter || "all") === id ? " on" : ""),
    onclick: () => {
      S.listFilter = id;
      flag("searched", true);
  draw();
    },
  }, [label])));
}

function districtBar() {
  return el("div", { class: "district-grid compact" }, HK_DISTRICTS.map((d) =>
      el("button", {
        type: "button",
      class: "dist" + (districtSelected(d) ? " dist-on" : ""),
        onclick: () => {
        S.query = d;
        S.listFilter = "all";
        flag("searched", true);
        markOwnSearch();
          draw();
        },
    }, [d])
  ));
}

function viewList() {
  if (!postedHelp()) {
    S.screen = "post";
    return viewPost();
  }
  const rows = filtered();
  const input = el("input", { type: "search", value: S.query, maxlength: "40" });
  input.addEventListener("input", () => { S.query = input.value; });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
    const cards = el("div", { class: "cards" });
  if (!(S.query || "").trim()) {
    cards.append(el("p", { class: "hint" }, ["请输入地区或关键字。"]));
  } else if (!rows.length) {
    cards.append(el("p", { class: "hint" }, ["没有符合的盘。"]));
  } else {
    rows.forEach((l) => cards.append(listingCard(l)));
  }
  const side = el("div", { class: "hk-side" }, [
    sideBox("缩小范围", [
      webLink("只看业主自让", () => { S.query = "业主自让"; doSearch(); }),
      el("p", { class: "hint" }, ["代理盘一般要求在职证明及担保人。业主自让请向业主查询条款。"]),
    ]),
    sideBox("热门搜寻", ["元朗 天水围", "荃湾 新楼", "大角咀 套房"].map((q) =>
      el("div", {}, [webLink(q, () => { S.query = q; doSearch(); })])
    )),
  ]);
  const filterLabel = { all: "全部", owner: "业主自让", share: "合租", estate: "屋苑" }[S.listFilter || "all"] || "全部";
  return houseShell([
    el("div", { class: "list-tools" }, [
      el("div", { class: "search-row" }, [
        input,
        el("button", { type: "button", class: "btn", onclick: doSearch }, ["搜寻"]),
      ]),
      listFilterBar(),
      el("p", { class: "list-tools-label" }, ["十八区："]),
      districtBar(),
    ]),
    siteNotice("租盘", [
      el("p", {}, ["点进盘源可看屋况、预约睇楼，或经站内留言联络业主。结果按放盘日期排列。"]),
    ]),
    el("div", { class: "listing-meta" }, [
      rows.length + " 个盘，" + filterLabel + "，「" + (S.query || "全部") + "」，按放盘日期",
    ]),
    el("div", { class: "hk-layout" }, [cards, side]),
  ], viewListTrail());
}

function listingCard(l) {
  return el("button", {
    class: "card",
    type: "button",
    onclick: () => goWeb("detail", { listing: l.id }),
  }, [
    imgSlot(l.img, "thumb", l.title),
    el("div", {}, [
      el("h3", {}, [l.title]),
      el("p", {}, [l.sub]),
      el("p", { class: "card-spec" }, [[l.nfa, l.age, l.walk, "浏览 " + l.views].join(" | ")]),
    ]),
    el("div", { class: "rent" }, [l.rent, el("small", {}, [l.agent ? "代理" : "业主自让"])]),
  ]);
}

function isFav(id) {
  return (S.favs || []).includes(id);
}

function favBtn(l) {
  return el("button", {
    class: "btn ghost" + (isFav(l.id) ? " fav-on" : ""),
    type: "button",
    onclick: () => {
      S.favs = S.favs || [];
      if (isFav(l.id)) {
        S.favs = S.favs.filter((x) => x !== l.id);
        draw();
        showPrompt("已从我的收藏移除。");
      } else {
        S.favs.push(l.id);
        draw();
        showPrompt("已加入我的收藏。", "右上角「收藏」可再打开。");
      }
    },
  }, [isFav(l.id) ? "已收藏" : "收藏"]);
}

function viewFavs() {
  const rows = (S.favs || []).map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean);
  const cards = el("div", { class: "cards" });
  if (!rows.length) {
    cards.append(el("p", { class: "hint" }, ["还没有收藏的盘。在放盘页按「收藏」，就会列在这里。"]));
  } else {
    rows.forEach((l) => {
      cards.append(listingCard(l));
      cards.append(el("p", { class: "fine fav-row" }, [
        webLink("取消收藏", () => {
          S.favs = S.favs.filter((x) => x !== l.id);
          draw();
        }),
      ]));
    });
  }
  return houseShell([
    el("h2", { class: "sec-h" }, ["我的收藏"]),
    rows.length ? el("p", { class: "fine" }, [rows.length + " 个盘，按收藏先后排列。"]) : "",
    cards,
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "我的收藏" },
  ]);
}

function viewListTrail() {
  const q = (S.query || "").trim();
  let dist = HK_DISTRICTS.find((d) => q === d);
  if (!dist && /旺角|大角咀/.test(q)) dist = "油尖旺";
  if (!dist && q.includes("北角")) dist = "东区";
  if (dist) {
    return [
      { text: "首页", go: () => goWeb("home") },
      { text: "租盘", go: () => { S.query = ""; S.listFilter = "all"; goWeb("list"); } },
      { text: dist },
    ];
  }
  return [
    { text: "首页", go: () => goWeb("home") },
    { text: "租盘" },
  ];
}

function viewDetail() {
  const l = listingById(S.listing);
  if (l.id === "tk") return houseShell([detailTk()], detailCrumb("大角咀 套房"));
  if (l.id === "tw") return houseShell([detailTw()], detailCrumb("荃湾 新楼"));
  if (l.id === "ssp") return houseShell([detailSsp()], detailCrumb("荣汇街 28 号后座"));
  return houseShell([detailGeneric(l)], detailCrumb(l.title));
}

function detailCrumb(name) {
  return [
    { text: "首页", go: () => goWeb("home") },
    { text: "租盘", go: () => goWeb("list") },
    { text: name },
  ];
}

function specTable(rows) {
  return el("table", { class: "kv-table" }, rows.map(([k, v]) =>
    el("tr", {}, [el("th", {}, [k]), el("td", {}, [v])])
  ));
}

function detailTk() {
  const l = listingById("tk");
  return el("div", { class: "detail hk-detail" }, [
    imgSlot(l.img, "photo-lg", l.title),
    el("div", { class: "kv" }, [
      el("h2", {}, [l.title]),
      el("p", { class: "rent-line" }, [l.rent + "／月"]),
      el("p", { class: "fine" }, ["编号 28WU-20140729-011"]),
      specTable([
        ["地区", l.area],
        ["面积", l.nfa],
        ["楼龄", l.age],
        ["交通", l.walk],
        ["放盘", l.date + "　浏览 " + l.views],
        ["业主", l.owner],
      ]),
      el("p", {}, ["上个月住客评语只剩一句：「夜里听得到隔壁。」天花有水渍。相片是空房。"]),
      el("p", { class: "fine" }, ["留言功能：对方已下线。系统不保证送达。"]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn", type: "button", onclick: () => {
          strikeFour("业主不在线", listingShort(l));
          showPrompt("业主现时不在线。", "留言会保留，对方上线后可见。");
        } }, ["预约看房"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
        favBtn(l),
      ]),
    ]),
  ]);
}

function detailTw() {
  const l = listingById("tw");
  return el("div", { class: "detail hk-detail" }, [
    imgSlot(l.img, "photo-lg", l.title),
    el("div", { class: "kv" }, [
      el("h2", {}, [l.title]),
      el("p", { class: "rent-line" }, [l.rent + "／月"]),
      el("p", { class: "fine" }, ["编号 28WU-20140730-088　代理"]),
      specTable([
        ["地区", l.area],
        ["面积", l.nfa],
        ["入伙", l.age],
        ["交通", l.walk],
        ["按金", "两个月按金 + 一个月上期"],
        ["资格", "要担保人、要粮单"],
        ["放盘", "地产代理代放"],
      ]),
      el("p", {}, ["管理处日间有人。新楼唔收周租。"]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn",
          type: "button",
          onclick: () => {
            const body = "请先提供在职证明及担保人资料，再安排睇楼。本盘不接受周租。";
            strikeFour(body, listingShort(l));
            showPrompt("代理已回覆。", body);
          },
        }, ["预约睇楼"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
        favBtn(l),
      ]),
    ]),
  ]);
}

function detailGeneric(l) {
  const rows = [
    ["地区", l.district + "　／　" + l.area],
    ["面积", l.nfa],
    ["楼龄", l.age],
    ["交通", l.walk],
    ["放盘", l.date + "　浏览 " + l.views],
    ["业主", l.owner],
  ].concat(l.specs || []);
  const kids = [
    imgSlot(l.img, "photo-lg", l.title),
    el("div", { class: "kv" }, [
      el("h2", {}, [l.title]),
      el("p", { class: "rent-line" }, [l.rent + "／月"]),
      el("p", { class: "fine" }, ["编号 " + l.code + "　" + (l.agent ? "代理" : "业主自让")]),
      specTable(rows),
      el("p", {}, [l.blurb]),
      el("p", { class: "fine" }, ["本站不负责口头协议。条款以业主或代理回覆为准。"]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn",
          type: "button",
          onclick: () => {
            strikeFour(l.failBody, listingShort(l));
            showPrompt(l.failTitle, l.failBody);
          },
        }, ["预约睇楼"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
        favBtn(l),
      ]),
    ]),
  ];
  return el("div", { class: "detail hk-detail" }, kids);
}

function detailSsp() {
  S.known = S.known || {};
  S.known.rong = true;
  const l = listingById("ssp");
  const remark = el("textarea", { class: "note-box" });
  remark.value = S.remark;
  remark.addEventListener("input", () => { S.remark = remark.value; });
  return el("div", { class: "detail hk-detail" }, [
    imgSlot(l.img, "photo-lg", l.title),
    el("div", { class: "kv" }, [
      el("h2", {}, [l.title]),
      el("p", { class: "rent-line" }, [l.rent + "／周"]),
      el("p", { class: "fine" }, ["编号 28WU-20140728-004　业主自让"]),
      specTable([
        ["地址", "九龙深水埗荣汇街 28 号　4 楼后座"],
        ["面积", l.nfa + "　／　建筑约 380 呎（业主自报，未量）"],
        ["楼龄", l.age + "　无电梯　铁窗"],
        ["交通", l.walk],
        ["同层", "业主自住前座。后座独立厨厕。"],
        ["放盘", l.date + "　浏览 " + l.views],
      ]),
      el("p", {}, [
        "业主",
        webLink("周先生", () => goWeb("landlord")),
        "　独居　自己放盘　上次上线 " + (flag("sawMail") ? "08-01 09:12" : "07-28 22:17") + "　浏览 " + l.views,
      ]),
      el("h3", { class: "sec-h" }, ["屋况（业主原文）"]),
      el("p", {}, ["唐楼，行到地铁。屋内仍有家人旧物，不介意者优先。可即时入住。储物室上锁，钥匙业主收，不入租。后楼梯通往天台，住客可用。"]),
      el("h3", { class: "sec-h" }, ["交易条款"]),
      el("p", {}, ["现金。口头。无印花。周租，可即日计。无地产佣金。"]),
      el("p", { class: "fine" }, ["本站不负责口头协议。详见", webLink("租务须知", () => goWeb("rules")), "。"]),
      el("h3", { class: "sec-h" }, ["照片说明"]),
      el("p", {}, ["业主上载相片 1 张（07-28）。本站不对相片内容作审核。"]),
      el("h3", { class: "sec-h" }, ["地区资讯"]),
      el("p", { class: "fine" }, [
        "深水埗指定范围仍列于市区重建研究。公开咨询暂写八月下旬。",
        webLink("相关新闻", () => goWeb("newsitem", { newsId: "urb" })),
      ]),
        el("h3", { class: "sec-h" }, ["盘源留言板（2）"]),
      el("p", { class: "bbs-line" }, ["过路人　07-29：「相里面有车？业主有细路住？」　——　业主未回。"]),
      el("p", { class: "bbs-line" }, ["深水埗住开　07-30：「后座平一截正常。问清楚锁门嗰间系乜。」"]),
      el("label", {}, ["备注（仅自己可见）", remark]),
      sspRented() ? siteNotice("盘源状态", [el("p", {}, ["业主已标示：已租出（08-01）。"])]) : "",
      el("div", { class: "actions" }, [
        sspRented() ? "" : el("button", { class: "btn", type: "button", onclick: () => goViewing(false) }, [
          flag("sawMail") ? "赴约看房" : "预约睇楼",
        ]),
        sspRented() ? "" : el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("pm") }, ["写站内留言"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("landlord") }, ["业主档案"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("list") }, ["返回租盘"]),
        favBtn(l),
      ]),
    ]),
  ]);
}

function sspRented() {
  return S.level >= 3;
}

const PM_DRAFT = "周生，荣汇街 28 号 4 楼后座，我想预约睇楼。现金、口头得。我需要一个能住的地方。听日下昼得唔得？";

function replyReady() {
  return flag("askedOld") && storyDay() >= 801;
}

function reachMorning() {
  setTime("2014年8月1日 周五 09:12");
  S.talk = null;
  S.wait = null;
  S.paused = null;
  S.mode = "web";
  S.tab = "house";
  S.screen = "home";
  draw();
}

function sendPm() {
  const text = (S.pmBody || "").trim();
  if (!text) {
    showPrompt("请填写讯息内容。");
    return;
  }
  if (flag("askedOld")) return;
  sfx("send");
  S.pmSent = text;
  flag("askedOld", true);
  waitWeek("2014年7月31日 周四 23:14", "他夜间不在线。", "8月1日　上午", reachMorning);
}

function viewPm() {
  if (sspRented()) {
    return houseShell([
      el("h2", { class: "sec-h" }, ["写站内留言"]),
      siteNotice("盘源已租出", [
        el("p", {}, ["荣汇街 28 号后座已租出。本盘留言已关闭。"]),
        el("p", {}, [webLink("打开站内留言", () => goWeb("inbox"))]),
      ]),
    ], [
      { text: "首页", go: () => goWeb("home") },
      { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
      { text: "写留言" },
    ]);
  }
  if (flag("askedOld")) {
    const ready = replyReady();
    const read = flag("sawMail");
    return houseShell([
      el("h2", { class: "sec-h" }, ["写站内留言"]),
      siteNotice(read ? "已回复" : (ready ? "有新回复" : "待回复"), [
        el("p", {}, [read
          ? "周先生已回复。到站内留言看过，再赴约睇楼。"
          : ready
            ? "周先生有新回复。"
            : "这条已送给周先生。他夜间不在线，回复会留在站内留言。"]),
        el("p", {}, [webLink("打开站内留言", () => goWeb("inbox"))]),
      ]),
    ], [
      { text: "首页", go: () => goWeb("home") },
      { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
      { text: "写留言" },
    ]);
  }
  if (!S.pmBody) S.pmBody = PM_DRAFT;
  const box = el("textarea", { class: "note-box", maxlength: "400" });
  box.value = S.pmBody;
  box.addEventListener("input", () => { S.pmBody = box.value; });
  return houseShell([
    el("h2", { class: "sec-h" }, ["写站内留言"]),
    el("p", { class: "mail-meta" }, ["收件人：周先生　　主旨：荣汇街 28 号后座　预约睇楼"]),
    el("p", { class: "hint" }, ["业主夜间常不在线。回复于翌日上午显示。"]),
    el("label", {}, ["留言正文", box]),
      el("div", { class: "actions" }, [
      el("button", { class: "btn", type: "button", onclick: sendPm }, ["送出"]),
      el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["取消"]),
    ]),
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
    { text: "写留言" },
  ]);
}

function viewInbox() {
  if (replyReady() && !flag("sawMail")) {
    flag("sawMail", true);
    note("zhou-reply", "周先生回了留言。今日下昼。旧嘢如果怕，可以叫他把相收起。");
  }
  const body = [];
  body.push(
    el("h2", { class: "sec-h" }, ["站内留言"]),
    el("p", { class: "fine" }, ["廿八屋会员留言。对方上线后才会看到。"])
  );
  if (flag("sawMail")) {
    body.push(
      el("div", { class: "site-msg pending" }, [
        el("p", { class: "mail-meta" }, ["07-31 23:14　你 → 周先生　　预约睇楼"]),
        el("div", { class: "mail-body" }, [S.pmSent || PM_DRAFT]),
      ]),
      el("div", { class: "site-msg in" }, [
        el("p", { class: "mail-meta" }, ["08-01 09:12　周先生　回复了你"]),
        el("div", { class: "mail-body" }, ["今日下昼得。我喺度等。简介写过屋内有旧嘢，你见过怕就同我讲，相可以收起一部分。"]),
      ]),
      el("div", { class: "actions" }, [
        sspRented() ? "" : el("button", { class: "btn", type: "button", onclick: () => goViewing(true) }, ["赴约看房"]),
        el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["返回荣汇街后座"]),
      ])
    );
  } else if (flag("askedOld")) {
    body.push(
      el("div", { class: "site-msg pending" }, [
        el("p", { class: "mail-meta" }, ["07-31 23:14　你 → 周先生　　未读"]),
        el("div", { class: "mail-body" }, [S.pmSent || PM_DRAFT]),
        el("p", { class: "hint" }, ["对方状态：不在线。请勿重复发送。"]),
      ])
    );
  } else {
    body.push(el("p", {}, ["没有新的站内留言。"]));
    if (S.known && S.known.rong && !sspRented()) {
      body.push(el("p", {}, [webLink("写给周先生", () => goWeb("pm"))]));
    }
    body.push(el("p", { class: "hint" }, ["在放盘页联络业主。口头租约请自行承担。"]));
  }
  return houseShell(body, [
    { text: "首页", go: () => goWeb("home") },
    { text: "站内留言" },
  ]);
}

function viewForum() {
  const order = ["wk3", "wk2", "wk1"];
  const ids = Object.keys(THREADS).filter(threadVisible);
  ids.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  const rows = ids.map((id) => {
    const t = THREADS[id];
    const title = t.title;
    return el("button", {
          type: "button",
      class: "forum-row" + (t.user === "阿琪V" ? " forum-mine" : ""),
      onclick: () => goWeb("thread", { forumId: id }),
    }, [
      el("span", { class: "board" }, ["[" + t.board + "]"]),
      el("span", { class: "ftitle" }, [title]),
      el("span", { class: "fmeta" }, [t.user + "　" + threadTime(id)]),
    ]);
  });
  const kids = [
    el("h2", { class: "sec-h" }, ["讨论区"]),
    el("p", { class: "hint" }, ["公开版面。请勿留下电话、住址及银行户口。"]),
  ];
  if (postedHelp()) {
    const hp = THREADS.helpzhang;
    const n = (hp.replies || []).length;
    kids.push(siteNotice(flag("sawOwnPost") ? "我的帖子" : "我的帖子（有新回复）", [
      el("p", {}, [
        webLink(hp.title, () => goWeb("thread", { forumId: "helpzhang" })),
        "　" + hp.board + "版　回复 " + n,
      ]),
    ]));
  }
  const fresh = unreadSerial();
  if (fresh) {
    const t = THREADS[fresh];
    kids.push(siteNotice("杂谈有新回复", [
      el("p", {}, [
        webLink(t.title, () => goWeb("thread", { forumId: fresh })),
        "　" + threadTime(fresh),
      ]),
    ]));
  }
  kids.push(el("div", { class: "forum-list" }, rows));
  return houseShell(kids, [{ text: "首页", go: () => goWeb("home") }, { text: "讨论区" }]);
}

function viewThread() {
  if (S.forumId === "helpzhang" && !postedHelp()) {
    return viewPost();
  }
  const tid = THREADS[S.forumId] ? S.forumId : "stamp";
  const t = THREADS[tid];
  const replies = threadReplies(tid);
  if (S.forumId === "helpzhang") {
    flag("sawOwnPost", true);
    note("bbs-self", "藤先生回过我的求助帖，丢了个荣汇街的盘连结。");
    if (flag("sawLinAd")) note("same-name", "墙上和帖里是同一个名字。");
  }
  if (S.forumId === "wk1") {
    flag("sawWk1", true);
    note("serial1", "第一帖底下，藤先生没有再回。");
  }
  if (S.forumId === "wk2") {
    flag("sawWk2", true);
    if (replies.some((r) => r.user === "藤先生")) note("serial2", "第二帖底下，藤先生只留一句：你写低。下星期再讲。");
  }
  if (S.forumId === "wk3") {
    flag("sawWk3", true);
    note("serial3", "第三帖底下，藤先生又没有出声。");
  }
  const replyNodes = replies.map((r) => {
    const kids = [
      el("p", { class: "mail-meta" }, [r.user + "　回复于 " + r.time]),
      el("p", {}, [r.body]),
    ];
    if (r.listing) {
      kids.push(el("p", {}, [
        webLink("连结：深水埗荣汇街 28 号 4 楼后座", () => goWeb("detail", { listing: r.listing })),
      ]));
    }
    return el("div", { class: "mail-body" }, kids);
  });
  return houseShell([
    el("h2", { class: "sec-h" }, ["[" + t.board + "] " + t.title]),
    el("p", { class: "mail-meta" }, [t.user + "　发表于 " + threadTime(tid)]),
    el("div", { class: "mail-body" }, [t.body]),
    el("p", { class: "fine" }, ["回复（" + replies.length + "）"]),
    ...replyNodes,
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "讨论区", go: () => goWeb("forum") },
    { text: t.title },
  ]);
}

function viewRules() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["租务须知（摘录）"]),
    el("p", { class: "mail-meta" }, ["最后修订：2012年3月。一般说明，并非法律意见。"]),
    el("h3", { class: "sec-h" }, ["一、印花税"]),
    el("p", {}, ["租住权合约应按《印花税条例》加盖印花。即使先以口头谈妥、其后补书面纪录，原则上仍须加盖。未加盖印花的文书，一旦出现欠租、提早收回等争议，民事程序中可能不被接纳为证据。印花税由业主或租客缴付可自行约定，加盖责任属双方。查询可向税务局印花税署。"]),
    el("h3", { class: "sec-h" }, ["二、口头协议"]),
    el("p", {}, ["双方若已就租金、年期及交收达成一致，即使未签书面租约，在香港亦可构成租住权。举证则视乎交租纪录、讯息往来、证人等。本站仍建议尽量书面写明起租日、通知期及交租方式。"]),
    el("h3", { class: "sec-h" }, ["三、业主自让与本站角色"]),
    el("p", {}, ["「业主自让」指业主自行放盘，不经地产代理。睇楼、议价、交钥匙、收按金均由双方直接安排。本站只提供分类广告，不代收款项，不保证盘源，不对成交负责。"]),
    el("p", {}, ["交租方式（月结、周结、转账或现金）由双方约定。市场常见为两个月按金加一个月上期；亦有业主按周计租。即时交收钥匙并不罕见，仍建议先点齐屋况并拍照。"]),
    el("h3", { class: "sec-h" }, ["四、出租范围与屋内物件"]),
    el("p", {}, ["租约应列明出租范围（例如整层、后座、套房）。阁楼、工人房、储物室、天台、后楼梯等若未写进合约，一般不视为租客专用范围。屋内家具、杂物、私人用品如非订明随楼附送，产权仍属业主；搬入前宜与业主点齐。"]),
    el("p", { class: "fine" }, ["个案情况请自行向律师查询。本页如与现行法例不符，以法例为准。"]),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "租务须知" }]);
}

function viewNews() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["新闻中心"]),
    el("p", { class: "hint" }, ["转载及节录，不代表本站立场。详情以原文为准。"]),
    el("div", { class: "forum-list" }, newsIds().map((id) => newsLink(id, false))),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "新闻中心" }]);
}

function applyNewsNotes(id) {
  const kept = {
    mud: ["web-zhou", "2012年9月。妻儿遇难。他们话天意。土木署：雨后斜坡失稳。"],
    urb: ["web-ura", "荣汇街在研究名单。业主将获补偿。"],
  }[id];
  if (!kept) return;
  note(kept[0], kept[1]);
  if (hasEvidence("news-mud") && hasEvidence("news-urb")) {
    note("twofiles", "他那边死过人。这边楼还要赔一笔。");
  }
}

function openNewsDiary(id) {
  const n = NEWS[id];
  if (!n) return;
  const item = {
    id: "news-" + id,
    kind: "新闻",
    title: n.title,
    time: n.date,
    body: n.body,
  };
  showClueModal(item, {
    canFile: !hasEvidence(item.id),
    onFile: () => applyNewsNotes(id),
    onClose: () => goWeb("newsitem"),
  });
}

function viewNewsItem() {
  const id = S.newsId || "urb";
  const n = NEWS[id] || NEWS.urb;
  S.newsSeen = S.newsSeen || {};
  S.newsSeen[id] = true;
  const canKeep = (id === "mud" || id === "urb") && S.level >= 14;
  return houseShell([
    el("h2", { class: "sec-h" }, [n.title]),
    el("p", { class: "mail-meta" }, [n.date + "　来源：本站编辑部／公开文件节录"]),
    el("div", { class: "mail-body" }, [n.body]),
    canKeep ? el("div", { class: "actions" }, [
        el("button", {
          type: "button",
        class: "btn" + (hasEvidence("news-" + id) ? " ghost" : ""),
        onclick: () => openNewsDiary(id),
      }, [hasEvidence("news-" + id) ? "已记下" : "记下来"]),
    ]) : "",
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "新闻中心", go: () => goWeb("news") },
    { text: n.title },
  ]);
}

function viewLogin() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["账户"]),
    el("p", {}, ["你已登入：章慧琪　（vicky_c　注册 2013）"]),
    el("p", {}, ["上次登入：" + (clockHasHm() ? webAgo(new Date(clockDate().getTime() - 4 * 60000)) : "今天") + "　IP 已隐藏"]),
    el("p", { class: "hint" }, ["此浏览器已记住登入状态。"]),
    postedHelp()
      ? siteNotice("刊登记录", [
        el("p", {}, [
          "求助帖 1 篇。"
            + (flag("serial1") ? "　杂谈 " + ["serial1", "serial2", "serial3"].filter((k) => flag(k)).length + " 篇。" : ""),
          "　",
          webLink("到讨论区查看", () => goWeb("forum")),
        ]),
      ])
      : "",
        el("button", {
          class: "btn ghost",
          type: "button",
      onclick: blockedLogout,
    }, ["登出"]),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "账户" }]);
}

function openSerialDraft(id) {
  S.pendingPost = id;
  S.talk = null;
  S.mode = "web";
  S.tab = "house";
  S.screen = "post";
            draw();
}

function publishSerial() {
  const id = S.pendingPost;
  if (!THREADS[id]) return;
  pinSerial(id);
  if (id === "wk1") flag("serial1", true);
  if (id === "wk2") flag("serial2", true);
  if (id === "wk3") flag("serial3", true);
  S.pendingPost = "";
  clearSlate();
  showModal("提示", "已收到你的刊登。", "", "prompt", S.paused ? closeRental : () => draw());
}

function viewSerialDraft() {
  const t = THREADS[S.pendingPost];
  return houseShell([
    el("h2", { class: "sec-h" }, ["讨论区　" + t.board]),
    el("p", { class: "hint" }, ["写好了，还没发布。"]),
    el("p", { class: "mail-meta" }, ["版块：" + t.board + "　署名：阿琪V"]),
    el("div", { class: "post-draft" }, [
      el("h3", { style: "margin:0 0 8px;font-size:15px;color:#1f4f96" }, [t.title]),
      el("div", { class: "mail-body" }, [t.body]),
    ]),
    el("div", { class: "actions" }, [
      el("button", { class: "btn", type: "button", onclick: publishSerial }, ["发布"]),
    ]),
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "讨论区", go: () => goWeb("forum") },
    { text: "发帖" },
  ]);
}

function viewPost() {
  if (S.pendingPost && THREADS[S.pendingPost]) return viewSerialDraft();
  const hp = THREADS.helpzhang;
  if (!postedHelp()) {
    return houseShell([
      el("h2", { class: "sec-h" }, ["我的帖子　顶帖"]),
      el("p", { class: "hint" }, ["帖子刊登满七日，可免费顶上版面一次。"]),
      el("p", { class: "mail-meta" }, ["版块：" + hp.board + "　署名：阿琪V　刊登：" + hp.time]),
      el("div", { class: "post-draft" }, [
        el("h3", { style: "margin:0 0 8px;font-size:15px;color:#1f4f96" }, [hp.title]),
        el("div", { class: "mail-body" }, [hp.body]),
      ]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn", type: "button", onclick: publishHelpPost }, ["顶帖"]),
      ]),
    ], [{ text: "首页", go: () => goWeb("home") }, { text: "我的帖子" }]);
  }
  return houseShell([
    el("h2", { class: "sec-h" }, ["我的帖子　顶帖"]),
    siteNotice("系统通知", [
      el("p", {}, ["已顶帖。求助帖重新排在讨论区「求助」版上方，可查看原文及回复。"]),
      el("p", {}, [webLink("查看帖子", () => goWeb("thread", { forumId: "helpzhang" }))]),
    ]),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "免费刊登" }]);
}

function viewLandlord() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["业主档案　周先生"]),
    specTable([
      ["身份", "业主自让，非代理"],
      ["放盘", sspRented() ? "1 个（已租出）" : "1 个（现正上架）"],
      ["上线", flag("sawMail") ? "08-01 09:12" : "07-28 22:17"],
      ["回覆率", "慢。夜间常不在。"],
      ["认证", "未做身份认证"],
    ]),
    el("h3", { class: "sec-h" }, ["简介（自填）"]),
    el("p", {}, ["自己住同层前座。屋有旧嘢，唔介意先好倾。即时可以搬。现金得。"]),
    el("p", { class: "fine" }, ["本会员暂无其他租客评价。"]),
    el("div", { class: "actions" }, [
      el("button", { class: "btn", type: "button", onclick: () => goWeb("detail", { listing: "ssp" }) }, ["看他的盘"]),
      sspRented() ? "" : el("button", { class: "btn ghost", type: "button", onclick: () => goWeb("pm") }, ["写站内留言"]),
    ]),
  ], [
    { text: "首页", go: () => goWeb("home") },
    { text: "荣汇街后座", go: () => goWeb("detail", { listing: "ssp" }) },
    { text: "周先生" },
  ]);
}

function viewAbout() {
  return houseShell([
    el("h2", { class: "sec-h" }, ["关于廿八屋"]),
    el("p", {}, ["廿八屋于 2011 年上线，刊香港业主自让及代理租盘。不设带看，不收佣金。"]),
    el("p", { class: "fine" }, ["侧栏广告由第三方投放，本站不对连结内容负责。"]),
  ], [{ text: "首页", go: () => goWeb("home") }, { text: "关于廿八屋" }]);
}

function wallHeader() {
  const items = [
    ["首页", "wall"],
    ["我的页面", "wall-me"],
    ["好友", "wall-friends"],
    [wallCountLabel("收件箱", wallUnread().mail), "wall-mail"],
    ["设置", "wall-set"],
  ];
  return el("div", { class: "wall-head" }, [
    el("button", { type: "button", class: "wall-logo", onclick: () => goWeb("wall") }, ["墙簿"]),
    el("nav", { class: "wall-nav" }, items.map(([label, screen]) =>
      el("button", {
        type: "button",
        class: "wall-nav-item" + (S.screen === screen ? " on" : ""),
        onclick: () => goWeb(screen),
      }, [label])
    )),
  ]);
}

function wallWhoGo(who) {
  return () => (who === "me" ? goWeb("wall-me") : goWeb("wall-user", { wallWho: who }));
}

function wallPost(name, who, text, time, extra, opts) {
  opts = opts || {};
  const actions = extra || (opts.entry ? wallActions(opts.entry) : null) || "";
  const body = opts.entry ? wallNoteParts(text, opts.entry) : [text];
  return el("article", { class: "post" + (opts.fresh ? " fresh" : "") }, [
    el("button", {
      type: "button",
      class: "post-avatar",
      onclick: wallWhoGo(who),
    }, [name.slice(0, 1)]),
    el("div", { class: "post-main" }, [
      el("div", { class: "post-meta" }, [
        el("span", {}, [webLink(name, wallWhoGo(who)), opts.fresh ? el("em", { class: "post-new" }, ["新"]) : ""]),
        el("span", {}, [time]),
      ]),
      el("p", {}, body),
      opts.photo ? el("button", { type: "button", class: "wall-shot", onclick: () => showWallPhoto(opts.photo.cap, opts.photo.id) }, [imgSlot(opts.photo.id, "wall-thumb", opts.photo.cap)]) : "",
      ...(opts.replies || []),
      actions,
    ]),
  ]);
}

/* ---------- 墙簿跟着剧情走：熟人动态、收件箱、藤先生广告 ---------- */

// at：网页时间，钟走过才显示；after：剧情条件；react：条件第一次成立的那一刻起算
// old：开局之前就在墙上，不算新
// answer：「回应」可选的话，各一句；back：对方过一阵回的一句。mute：点「回应」只会打了又删
const WALL_FEED = [
  { id: "mei-album", who: "mei", name: "陈美娟", at: ["07-30", "01:12"], old: true, text: "上载了相册「年夜饭」。家豪又醉，成晚讲大学宿舍嗰个。" },
  {
    id: "mei-0731", who: "mei", name: "陈美娟", at: ["07-31", "22:48"], text: "阿琪你今晚住边。沙发留住。",
    answer: [{ text: "多谢家姐。", back: "同我客气咩？" }, { text: "唔使留。" }],
  },
  { id: "lok-0731", who: "lok", name: "阿乐", at: ["07-31", "22:55"], old: true, text: "……", mute: "你打了几个字，又删掉。" },
  {
    id: "me-in", who: "me", name: "章慧琪", at: ["08-01", "18:20"], after: () => S.level >= 3, text: "更新了状态：在住。",
    replies: [{ who: "mei", name: "陈美娟", at: ["08-01", "21:10"], text: "边度？" }],
    answer: [{ text: "深水埗。", back: "旧楼？门锁好。" }, { text: "迟啲讲。" }],
  },
  { id: "lok-sig", who: "lok", name: "阿乐", react: () => flag("calledLok"), text: "更新了签名档：「唔好再打嚟。」", key: "唔好再打嚟", note: ["wall-loksig", "阿乐改了签名档：唔好再打嚟。"], mute: "你打了「对唔住」，又删掉。" },
  {
    id: "howard-ot", who: "howard", name: "陈家豪", at: ["08-15", "13:05"], text: "又加班。",
    replies: [{ who: "mei", name: "陈美娟", at: ["08-15", "13:20"], text: "又系阿明？" }],
    key: "又加班",
    note: ["wall-ot", "姐夫又加班。表姐在下面问：又系阿明？"],
    answer: [{ text: "姐夫辛苦。" }],
  },
  {
    id: "ping-0815", who: "ping", name: "同事阿诗", at: ["08-15", "21:03"], text: "湾仔今晚有灯嘅诊所？路过见到。",
    answer: [{ text: "边间？", back: "唔记得名。夜晚都仲有灯。" }],
  },
  {
    id: "mei-0815", who: "mei", name: "陈美娟", at: ["08-15", "21:50"], text: "沙发仍在，你不过来都好，门锁好。",
    answer: [{ text: "锁好了。", back: "乖。" }],
  },
  {
    id: "mei-0823", who: "mei", name: "陈美娟", at: ["08-23", "21:30"], text: "食过未？汤我留住。",
    answer: [{ text: "食咗。", back: "讲大话。听日过嚟。" }, { text: "听日过嚟饮。", back: "好。" }],
  },
  {
    id: "mei-meal", who: "mei", name: "陈美娟", at: ["08-24", "15:40"], after: () => ev("note-notsaid"), text: "上载了 1 张相片，标注了你。「瘦咗。食。」", photo: { id: pic(9, "示意-午饭"), cap: "星期日" },
    answer: [{ text: "多谢家姐。" }],
  },
  { id: "lok-0828", who: "lok", name: "阿乐", at: ["08-28", "23:40"], after: () => flag("lokSoup"), text: "汤煲多咗。以后唔煲。", mute: "你打了「对唔住」，又删掉。" },
  {
    id: "ping-0829", who: "ping", name: "同事阿诗", at: ["08-29", "20:15"], text: "阿琪，下个礼拜有更开，你嚟唔嚟？",
    answer: [{ text: "嚟。", back: "好，我同经理讲。" }, { text: "呢排唔得。", back: "保重。" }],
  },
  {
    id: "howard-0830", who: "howard", name: "陈家豪", at: ["08-30", "18:20"], text: "收工。去饮杯。",
    replies: [
      { who: "mei", name: "陈美娟", at: ["08-30", "18:31"], text: "同阿明？" },
      { who: "howard", name: "陈家豪", at: ["08-30", "19:02"], text: "唔系。" },
    ],
  },
  { id: "house-0901", who: "house", name: "廿八屋转贴", at: ["09-01", "10:00"], text: "专页：深水埗旧楼近来多人问收购，业主留意来历不明嘅电话。" },
  {
    id: "mei-0902", who: "mei", name: "陈美娟", at: ["09-02", "22:10"], text: "今个星期六你真的再去？你姐夫话佢最近好攰。",
    answer: [{ text: "去。", back: "咁你自己小心。" }],
  },
  {
    id: "mei-0906", who: "mei", name: "陈美娟", at: ["09-06", "22:15"], text: "星期六去过未。中秋返嚟食饭。沙发仍在。",
    answer: [{ text: "返。", back: "等你。" }, { text: "睇吓。" }],
  },
  { id: "howard-0907", who: "howard", name: "陈家豪", at: ["09-07", "11:05"], text: "在　湾仔。", key: "湾仔", note: ["wall-howard-wc", "九月七日上午，姐夫在湾仔。"] },
];

const WALL_MAIL = [
  { id: "house-rent", who: "house", name: "廿八屋", at: ["08-01", "19:00"], after: () => S.level >= 3, text: "你收藏的「荣汇街 28 号 4 楼后座」已标记为已租。多谢使用廿八屋。" },
  { id: "lok-pm", who: "lok", name: "阿乐", at: ["08-16", "01:40"], after: () => flag("calledLok"), text: "你打嚟做咩？我瞓紧。", key: "你打嚟做咩", note: ["wall-lokpm", "阿乐在墙簿问我打去做咩。我没有回。"], mute: "你打了几个字，又删掉。" },
  {
    id: "mei-pm", who: "mei", name: "陈美娟", at: ["08-27", "23:10"], after: () => ev("note-meiwater"), text: "电话入面成日有水声。系咪你屋企？唔好一个人顶。",
    answer: [{ text: "冇事。水喉旧。", back: "有事打俾我。几夜都得。" }, { text: "我惊。", back: "过嚟住。沙发仍在。" }],
  },
];

const WALL_NAMES = { mei: "陈美娟", lok: "阿乐", howard: "陈家豪", ping: "同事阿诗", house: "廿八屋转贴", me: "章慧琪" };

function wallTime(e) {
  if (e.react) {
    if (!e.react()) return null;
    S.wallAt = S.wallAt || {};
    if (!S.wallAt[e.id]) S.wallAt[e.id] = clockDate().getTime();
    return new Date(S.wallAt[e.id]);
  }
  if (e.after && !e.after()) return null;
  return webDate(e.at[0], e.at[1]);
}

function wallShown(list) {
  return list.map((e) => ({ e, t: wallTime(e) })).filter((x) => x.t && webPast(x.t)).sort((a, b) => b.t - a.t);
}

function wallMine(e) {
  return (S.wallReplied && S.wallReplied[e.id]) || null;
}

// back 那句是「对方」说的：别人的帖 → 发帖人回；自己的帖 → 帖下最近一个别人回（如表姐问边度）
function wallBackSpeaker(e) {
  if (e.who && e.who !== "me") {
    return { who: e.who, name: e.name || WALL_NAMES[e.who] || e.who };
  }
  const others = (e.replies || []).filter((r) => r.who && r.who !== "me");
  if (others.length) {
    const r = others[others.length - 1];
    return { who: r.who, name: r.name || WALL_NAMES[r.who] || r.who };
  }
  return null;
}

// 别人的回应 + 我回的那句 + 对方回的一句（钟常常只写「早上」，所以等我离开这页再回来才出现）
function wallReplies(e) {
  const out = (e.replies || []).map((r, i) => ({ r, key: e.id + ":r" + i, t: webDate(r.at[0], r.at[1]) })).filter((x) => webPast(x.t));
  const mine = wallMine(e);
  if (mine) {
    out.push({ r: { who: "me", name: "章慧琪", text: mine.text }, key: e.id + ":me", t: new Date(mine.t) });
    const backWho = mine.back && (S.wallNav || 0) > mine.nav ? wallBackSpeaker(e) : null;
    if (backWho) out.push({ r: { who: backWho.who, name: backWho.name, text: mine.back }, key: e.id + ":back", t: new Date(mine.t + 1) });
  }
  return out.sort((a, b) => a.t - b.t);
}

function wallDrafting(e) {
  return !!(S.wallDraft && e && S.wallDraft.id === e.id);
}

function wallSendAnswer(e, a) {
  S.wallReplied = S.wallReplied || {};
  S.wallReplied[e.id] = { text: a.text, back: a.back || "", t: clockDate().getTime(), nav: S.wallNav || 0 };
  wallMarkSeen([e.id + ":me"]);
  S.wallDraft = null;
  sfx("send");
  draw();
}

function wallDropDraft() {
  S.wallDraft = null;
  draw();
}

// 「回应」在帖子底下展开预制草稿，不弹网页提示
function wallAnswer(e) {
  if (e.mute) {
    tip(e.mute);
    return;
  }
  if (!e.answer || !e.answer.length) return;
  if (wallDrafting(e)) S.wallDraft = null;
  else S.wallDraft = { id: e.id, i: 0 };
  draw();
}

function wallDraftBox(e) {
  const list = e.answer || [];
  if (!list.length) return null;
  const i = Math.max(0, Math.min((S.wallDraft && S.wallDraft.i) || 0, list.length - 1));
  const a = list[i];
  const picks = list.length > 1
    ? el("div", { class: "wall-draft-picks" }, list.map((opt, idx) => el("button", {
      type: "button",
      class: "wall-draft-pick" + (idx === i ? " on" : ""),
      onclick: () => { S.wallDraft = { id: e.id, i: idx }; draw(); },
    }, [opt.text])))
    : "";
  return el("div", { class: "wall-draft" }, [
    picks,
    el("div", { class: "wall-draft-box" }, [
      el("span", { class: "wall-draft-who" }, ["章慧琪"]),
      el("p", { class: "wall-draft-text" }, [a.text]),
    ]),
    el("div", { class: "wall-draft-acts" }, [
      el("button", { type: "button", class: "wall-draft-send", onclick: () => wallSendAnswer(e, a) }, ["发送"]),
      el("button", { type: "button", class: "wall-draft-drop", onclick: () => wallDropDraft() }, ["删掉"]),
    ]),
  ]);
}

function wallActions(e, word) {
  word = word || "回应";
  if (wallMine(e)) return el("div", { class: "post-actions" }, [el("span", { class: "post-kept" }, ["已" + word])]);
  if (!e.answer && !e.mute) return null;
  const open = wallDrafting(e);
  const link = e.mute
    ? webLink(word, () => wallAnswer(e))
    : webLink(open ? "收起" : word, () => wallAnswer(e));
  return el("div", { class: "post-reply-wrap" + (open ? " open" : "") }, [
    el("div", { class: "post-actions" }, [link]),
    open ? wallDraftBox(e) : "",
  ]);
}

// 能记的那几个字画在正文／回帖里：点一下写进日记簿笔记，飘一句「已记录」，不盖戳、底部不放「记下」按钮
function wallNoteKey(e) {
  if (!e || !e.note) return "";
  if (e.key) return e.key;
  const m = /「([^」]+)」/.exec(e.text || "");
  if (m) return m[1];
  const t = String(e.text || "").replace(/[。．.…]+$/g, "").trim();
  return t.length && t.length <= 16 ? t : "";
}

function wallDoKeep(e) {
  if (!e.note || noted(e.note[0])) return;
  note(e.note[0], e.note[1]);
  sfx("file");
  draw();
  tip("已记录");
}

function wallNoteParts(text, e) {
  const key = wallNoteKey(e);
  if (!key) return [text];
  const at = String(text).indexOf(key);
  if (at < 0) return [text];
  const kept = noted(e.note[0]);
  const mark = kept
    ? el("span", { class: "wall-key-kept", title: "已记进日记簿" }, [key])
    : el("span", {
      class: "wall-key-link",
      role: "button",
      tabindex: "0",
      title: "点一下，记进日记簿",
      onclick: (ev) => { ev.stopPropagation(); wallDoKeep(e); },
      onkeydown: (ev) => {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); wallDoKeep(e); }
      },
    }, [key]);
  return [text.slice(0, at), mark, text.slice(at + key.length)];
}

function wallReplyLine(e, x, fresh) {
  const kids = [webLink(x.r.name, wallWhoGo(x.r.who)), "："];
  const key = wallNoteKey(e);
  if (key && String(x.r.text).includes(key)) kids.push(...wallNoteParts(x.r.text, e));
  else kids.push(x.r.text);
  kids.push(el("span", { class: "post-reply-time" }, [webAgo(x.t)]));
  return el("p", { class: "post-reply" + (fresh ? " fresh" : "") }, kids);
}

function wallSeen(key) {
  return !!(S.wallSeen && S.wallSeen[key]);
}

function wallMarkSeen(keys) {
  S.wallSeen = S.wallSeen || {};
  keys.forEach((k) => { S.wallSeen[k] = true; });
}

function wallFeedKeys() {
  const keys = [];
  wallShown(WALL_FEED).forEach(({ e }) => {
    if (!e.old) keys.push(e.id);
    wallReplies(e).forEach((x) => keys.push(x.key));
  });
  return keys;
}

function wallMailKeys() {
  const keys = [];
  wallShown(WALL_MAIL).forEach(({ e }) => {
    keys.push(e.id);
    wallReplies(e).forEach((x) => keys.push(x.key));
  });
  return keys;
}

function wallUnread() {
  const feed = wallFeedKeys().filter((k) => !wallSeen(k)).length;
  const mail = wallMailKeys().filter((k) => !wallSeen(k)).length;
  return { feed, mail, n: feed + mail };
}

function wallCountLabel(label, n) {
  return n ? label + " (" + n + ")" : label;
}

// 进页那一刻没看过的，这一趟都标「新」，重画也不消失
function wallFresh(screen, keys) {
  if (!S.wallFresh || S.wallFresh.screen !== screen) {
    S.wallFresh = { screen, keys: keys.filter((k) => !wallSeen(k)) };
  }
  wallMarkSeen(keys);
  return S.wallFresh.keys;
}

// 跳关进来时，之前的动态当作已经看过
function wallMarkAllSeen() {
  wallMarkSeen(wallFeedKeys().concat(wallMailKeys()));
  S.wallLastN = 0;
}

if (typeof SFX !== "undefined") {
  SFX.wallIn = () => {
    sfxTone(1047, 0, 0.09, { type: "triangle", gain: 0.08 });
    sfxTone(1568, 0.08, 0.2, { type: "triangle", gain: 0.07 });
  };
}

// 底栏「浏览器」：墙簿有新东西就慢慢明暗、亮红点；多了一条叮一声 + 底栏上短 toast
function wallTick() {
  const unread = wallUnread();
  const n = unread.n;
  const quiet = S.mode === "card" || S.mode === "wait" || S.mode === "end";
  if (!quiet) {
    if (n > (S.wallLastN || 0)) {
      sfx("wallIn");
      if (typeof tip === "function" && S.mode !== "web" && !S.paused) {
        const msg = unread.mail && !unread.feed
          ? "墙簿有新邮件。"
          : unread.feed && !unread.mail
            ? "墙簿有新动态。"
            : "墙簿有新东西。";
        tip(msg, { quiet: true, nearBar: true, ms: 2800 });
      }
    }
    S.wallLastN = n;
  }
  const b = document.getElementById("playbar-house");
  if (b) b.classList.toggle("has-new", n > 0 && S.mode !== "web" && !S.paused);
}

function linAdState() {
  if (webPast(webDate("09-07", "14:40"))) return "back";
  if (webPast(webDate("08-15", "06:00"))) return "gone";
  return "on";
}

function linAdButton() {
  const st = linAdState();
  if (st === "gone") {
    return el("button", {
      class: "ad gone",
      type: "button",
      onclick: () => {
        note("wall-ad-gone", "藤先生那格广告下架了。");
        showPrompt("此广告已下架。", "");
      },
    }, [el("b", {}, ["此广告已下架"]), "——"]);
  }
  return el("button", {
    class: "ad",
    type: "button",
    onclick: () => {
      flag("sawLinAd", true);
      if (st === "back") note("wall-ad-back", "藤先生那格广告又出现了。字一样。");
      else note("lin", "有人在网上等人聊。藤先生。");
      if (flag("sawOwnPost")) note("same-name", "墙上和帖里是同一个名字。");
      goWeb("ad");
    },
  }, [
    el("b", {}, ["一对一深谈"]),
    "适合想被认真听的年轻人",
    el("div", {}, ["——藤先生"]),
  ]);
}

function livingIn() {
  return S.level >= 3;
}

function wallLatest(who) {
  return wallShown(WALL_FEED).find((x) => x.e.who === who) || null;
}

const WALL_FRIENDS = [
  { who: "mei", name: "陈美娟", rel: "表姐" },
  { who: "howard", name: "陈家豪", rel: "姐夫" },
  { who: "ping", name: "同事阿诗", rel: "同事" },
  { who: "lok", name: "阿乐", rel: "前度" },
];

// 在线状态跟着钟走：美娟早睡早起，家豪白天当更，阿诗夜里才上，阿乐只看最后一次动态
function wallStatus(who) {
  const h = clockDate().getHours();
  if (who === "mei") return h >= 7 && h < 24 ? { on: true, text: "在线" } : { on: false, text: "离线" };
  if (who === "howard") return h >= 9 && h < 21 ? { on: false, text: "当更中" } : { on: false, text: "离线" };
  if (who === "ping") return h >= 19 || h < 1 ? { on: true, text: "在线" } : { on: false, text: "离线" };
  if (who === "lok") return { on: false, text: lokOnline() + " 上线" };
  return { on: false, text: "" };
}

function wallFestival() {
  const now = clockDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((new Date(2014, 8, 8) - today) / 86400000);
  if (days > 0) return "中秋节　9月8日（还有 " + days + " 日）";
  if (days === 0) return "今日中秋。";
  return "中秋已过。";
}

// 不是好友、但墙簿觉得你认识的人；罗启明要等见过他之后才出现
function wallMaybe() {
  const out = [{ who: "kelvin", name: "Kelvin 刘", via: "共同好友：同事阿诗" }];
  if (S.level >= 7) out.unshift({ who: "ming", name: "罗启明", via: "共同好友：陈家豪" });
  return out;
}

function wallTimeline(who) {
  const rows = wallShown(WALL_FEED).filter((x) => x.e.who === who).map(({ e, t }) => ({ t, text: e.text, n: wallReplies(e).length }));
  if (who === "me") {
    wallShown(WALL_FEED).forEach(({ e }) => {
      const mine = wallMine(e);
      if (mine && e.who !== "me") rows.push({ t: new Date(mine.t), text: "回应了 " + e.name + "：「" + mine.text + "」", n: 0 });
    });
  }
  rows.sort((a, b) => b.t - a.t);
  return el("div", { class: "wall-tl" }, [
    el("p", { class: "wall-album-name" }, ["动态"]),
    ...(rows.length ? rows.map((r) => el("div", { class: "wall-tl-row" }, [
      el("span", { class: "wall-tl-time" }, [webAgo(r.t)]),
      el("span", { class: "wall-tl-text" }, [r.text]),
      r.n ? el("span", { class: "wall-tl-n" }, [r.n + " 则回应"]) : "",
    ])) : [el("p", { class: "wall-tl-empty" }, ["最近没有动态。"])]),
  ]);
}

function viewWall() {
  const fresh = wallFresh("wall", wallFeedKeys());
  const posts = wallShown(WALL_FEED).map(({ e, t }) => {
    const replies = wallReplies(e).map((x) => wallReplyLine(e, x, fresh.includes(x.key)));
    return {
      t,
      node: wallPost(e.name, e.who, e.text, webAgo(t), null, {
        fresh: fresh.includes(e.id),
        entry: e,
        photo: e.photo,
        replies,
      }),
    };
  });
  const houseAt = livingIn() ? webDate("08-01", "09:30") : webDate("07-31", "23:02");
  posts.push({
    t: houseAt,
    node: wallPost("廿八屋转贴", "house", livingIn() ? "你最近看过深水埗唐楼。" : "元朗天水围，有人在看。", webAgo(houseAt),
      el("div", { class: "post-actions" }, [webLink("打开廿八屋", () => {
        S.query = livingIn() ? "深水埗" : "元朗 天水围";
        doSearch();
      })])
    ),
  });
  posts.sort((a, b) => b.t - a.t);
  const feed = el("div", { class: "feed" }, posts.map((p) => p.node));
  const side = el("div", { class: "hk-side" }, [
    sideBox("好友", WALL_FRIENDS.map((f) => {
      const st = wallStatus(f.who);
      return el("p", { class: "side-friend" }, [
        el("i", { class: "side-dot" + (st.on ? " on" : "") }),
        webLink(f.name, () => goWeb("wall-user", { wallWho: f.who })),
        el("span", {}, [st.text]),
      ]);
    })),
    sideBox("赞助连结", [
      el("button", { class: "ad mute", type: "button", onclick: () => showPrompt("旧机上台", "月费 $88 起　旺角信和中心 2 楼　欢迎查询") }, [el("b", {}, ["旧手机上台"]), "旺角信和中心 2 楼"]),
      linAdButton(),
      el("button", { class: "ad mute", type: "button", onclick: () => showPrompt("家庭人寿", "理赔快捷　资料保密　按此留下联络") }, [el("b", {}, ["家庭人寿查询"]), "理赔快　资料保密"]),
    ]),
    sideBox("节日", [el("p", { class: "side-fest" }, [wallFestival()])]),
    sideBox("你可能认识", wallMaybe().map((m) => el("p", { class: "side-friend" }, [
      webLink(m.name, () => goWeb("wall-user", { wallWho: m.who })),
      el("span", {}, [m.via]),
    ]))),
  ]);
  const wrap = el("div", { class: "hk-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-grid" }, [feed, side]));
  return wrap;
}

function viewAd() {
  const wrap = el("div", { class: "hk-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "blank-ad" }, [
    backLink("墙簿", () => goWeb("wall")),
    imgSlot(pic(1, "墙簿/藤先生-空头像"), "avatar-slot", "藤先生"),
    el("p", {}, ["把你的故事交给能懂的人"]),
    el("p", {}, ["（电邮已失效）"]),
    el("p", { class: "fine" }, ["此页由广告商提供。"]),
  ]));
  return wrap;
}

function showWallPhoto(title, id) {
  closeModal();
  const sheet = el("div", { class: "sheet prompt" }, [
    el("h3", {}, [title]),
    imgSlot(id, "photo-lg", title),
    el("button", {
      class: "btn ghost",
      type: "button",
      onclick: () => {
        closeModal();
        draw();
      },
    }, ["好"]),
  ]);
  S.modal = el("div", { class: "modal web", id: "game-modal" }, [sheet]);
  stage.append(S.modal);
}

function wallAlbum(label, shots) {
  return el("div", { class: "wall-album" }, [
    el("p", { class: "wall-album-name" }, [label]),
    el("div", { class: "wall-shots" }, shots.map((s) =>
      el("button", {
        type: "button",
        class: "wall-shot",
        onclick: () => showWallPhoto(s.cap, s.id),
      }, [imgSlot(s.id, "wall-thumb", s.cap)])
    )),
  ]);
}

function wallProfile(title, lines) {
  const wrap = el("div", { class: "hk-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-profile" }, [
    backLink("墙簿", () => goWeb("wall")),
    el("h2", {}, [title]),
    ...lines.map((t) => typeof t === "string" ? el("p", {}, [t]) : t),
  ]));
  return wrap;
}

function viewWallMe() {
  const status = flag("serial3") && S.level < 12
    ? "状态：在住。星期六再去诊所。"
    : livingIn()
      ? "状态：在住。"
      : "状态：在找地方住。";
  return wallProfile("章慧琪", [
    status,
    livingIn() ? "最近：廿八屋　深水埗 唐楼" : "最近：廿八屋　元朗 天水围",
    "好友：12",
    wallAlbum("相册「手机」　2 张", [
      { id: pic(1, "墙簿/章慧琪-茶餐厅"), cap: "茶餐厅" },
      { id: pic(1, "墙簿/章慧琪-出街"), cap: "出街" },
    ]),
    wallTimeline("me"),
  ]);
}

function viewWallFriends() {
  const wrap = el("div", { class: "hk-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-profile" }, [
    backLink("墙簿", () => goWeb("wall")),
    el("h2", {}, ["好友"]),
    ...WALL_FRIENDS.map((f) => {
      const st = wallStatus(f.who);
      return el("p", { class: "wall-friend" }, [
        webLink(f.name, () => goWeb("wall-user", { wallWho: f.who })),
        el("span", {}, [f.rel]),
        el("span", { class: "wall-st" + (st.on ? "" : " dim") }, [st.text]),
      ]);
    }),
  ]));
  return wrap;
}

function lokOnline() {
  const last = wallLatest("lok");
  return webAgo(last ? last.t : webDate("07-31", "22:55"));
}

function viewWallMail() {
  const mails = wallShown(WALL_MAIL);
  const fresh = wallFresh("wall-mail", wallMailKeys());
  const rows = mails.map(({ e, t }) => el("div", { class: "wall-mail" + (fresh.includes(e.id) ? " fresh" : "") }, [
    el("p", { class: "wall-mail-meta" }, [
      webLink(e.name, wallWhoGo(e.who)),
      fresh.includes(e.id) ? el("em", { class: "post-new" }, ["新"]) : "",
      el("span", {}, [webAgo(t)]),
    ]),
    el("p", {}, wallNoteParts(e.text, e)),
    ...wallReplies(e).map((x) => {
      const kids = [el("b", {}, [x.r.name]), "："];
      const key = wallNoteKey(e);
      if (key && String(x.r.text).includes(key)) kids.push(...wallNoteParts(x.r.text, e));
      else kids.push(x.r.text);
      return el("p", { class: "post-reply" + (fresh.includes(x.key) ? " fresh" : "") }, kids);
    }),
    wallActions(e, "回复") || "",
  ]));
  return wallProfile("墙簿收件箱", rows.length ? rows : ["没有讯息。"]);
}

function viewWallSet() {
  const wrap = el("div", { class: "hk-site" });
  wrap.append(wallHeader());
  wrap.append(el("div", { class: "wall-profile" }, [
    backLink("墙簿", () => goWeb("wall")),
    el("h2", {}, ["设置"]),
    el("p", {}, ["谁可以找我：好友"]),
    el("p", {}, ["赞助连结：免费账户无法关闭"]),
    el("p", {}, ["语言：中文（香港）"]),
    el("p", {}, ["登出：此浏览器已记住登入"]),
    el("button", { class: "btn ghost", type: "button", onclick: blockedLogout }, ["登出"]),
  ]));
  return wrap;
}

function viewWallUser() {
  if (S.wallWho === "mei") {
    return wallProfile("陈美娟", [
      "文职。已婚。",
      wallAlbum("相册「年夜饭」　3 张", [
        { id: pic(1, "墙簿/陈美娟-开席"), cap: "开席" },
        { id: pic(1, "墙簿/陈美娟-敬茶"), cap: "敬茶" },
        { id: pic(1, "墙簿/陈美娟-水果"), cap: "水果" },
      ]),
      wallShown(WALL_FEED).some((x) => x.e.id === "mei-meal")
        ? wallAlbum("相册「星期日」　1 张", [{ id: pic(9, "示意-午饭"), cap: "星期日" }])
        : "",
      wallTimeline("mei"),
    ]);
  }
  if (S.wallWho === "lok") {
    const sig = wallShown(WALL_FEED).some((x) => x.e.id === "lok-sig");
    return wallProfile("阿乐", [
      "上次上线：" + lokOnline(),
      "签名档：" + (sig ? "唔好再打嚟。" : ""),
      "关系：无",
      wallAlbum("相册「旧相」　2 张", [
        { id: pic(1, "墙簿/阿乐-夜里"), cap: "夜里" },
        { id: pic(1, "墙簿/阿乐-落街"), cap: "落街" },
      ]),
      wallTimeline("lok"),
    ]);
  }
  if (S.wallWho === "house") {
    return wallProfile("廿八屋转贴", [
      "廿八屋官方专页。",
      "通知：开启",
      wallTimeline("house"),
    ]);
  }
  if (S.wallWho === "howard") {
    return wallProfile("陈家豪", [
      "姐夫。督察。已婚。",
      "妻子：陈美娟",
      wallAlbum("相册「旅行」　2 张", [
        { id: pic(1, "墙簿/陈家豪-渡轮"), cap: "渡轮" },
        { id: pic(1, "墙簿/陈家豪-沙滩"), cap: "沙滩" },
      ]),
      wallTimeline("howard"),
    ]);
  }
  if (S.wallWho === "ping") {
    return wallProfile("同事阿诗", [
      "任职：零售",
      wallTimeline("ping"),
    ]);
  }
  if (S.wallWho === "ming") {
    return wallProfile("罗启明", [
      "共同好友：陈家豪",
      "资料不公开。只有好友看得到他的动态。",
    ]);
  }
  if (S.wallWho === "kelvin") {
    return wallProfile("Kelvin 刘", [
      "共同好友：同事阿诗",
      "资料不公开。",
    ]);
  }
  return wallProfile("用户", ["资料不公开。"]);
}
