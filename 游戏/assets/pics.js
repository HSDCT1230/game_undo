const PIC_ROOT = "../图/游戏/";
const PIC_VER = "20261008f";

const PIC_LV = [
  "",
  "01-找房-7月31日",
  "02-看房-8月1日",
  "03-搬进来-8月1日至13日",
  "04-第一夜-8月14日夜",
  "05-找人-8月15日至16日",
  "06-初诊-8月16日",
  "07-十六号夜-8月16日至20日",
  "08-第二次-8月23日",
  "09-关掉录音-8月23日至27日",
  "10-第三次-8月30日",
  "11-再等一个星期-8月31日至9月5日",
  "12-第四次-9月6日",
  "13-上门-9月6日夜",
  "14-拿笔记-9月7日",
  "15-等他-9月7日夜",
  "16-天台-9月8日",
];

const PIC_USED = {};
const PIC_MISSING = {};

function pic(n, name) {
  return PIC_LV[n] + "/" + name;
}

function lvPic(name) {
  return pic((typeof S !== "undefined" && S.level) || 1, name);
}

function picSrc(path) {
  return encodeURI(PIC_ROOT + path + ".png") + "?v=" + PIC_VER;
}

const MAP_PIC = "00-地图/";
