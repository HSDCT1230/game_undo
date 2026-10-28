// 做入口：给每一关生成一个 Windows 快捷方式（.url），双击即开那关的关头。
//
// 为什么不用 .bat：双击会闪一个黑框；.url 由资源管理器直接交给默认浏览器，干净。
// 为什么不用手写地址：改一关名字就得改一串文件，漏一个就是死链。
//
// 用法：node tools/做入口.mjs
// 产物：测试入口/00-… 01-… 16-… 90-… 91-…
// 关卡表从 游戏/assets/levels.js 里读，不另存一份。
// 仓库搬家之后重跑一次即可（快捷方式里写的是绝对路径）。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "测试入口");
// 直接指游戏本体，不指根目录那块跳板。跳板认 ?level=，靠的是
// <meta http-equiv="refresh"> 和 location.replace 两条路同时跳；meta 那条不带查询串，
// 抢到了就落地成「游戏/index.html」——关号丢了，双击哪一关都回到开场／继续，
// 看着就像「单关打不开」。少一跳就没有这个不确定性。
const GAME = pathToFileURL(path.join(ROOT, "游戏/index.html")).href;

const src = fs.readFileSync(path.join(ROOT, "游戏/assets/levels.js"), "utf8");
const RE =
  /^ {2}\{\s*\n\s*part: (\d), title: "([^"]+)", date: "([^"]+)", place: "([^"]+)"/gm;

const levels = [];
let m;
while ((m = RE.exec(src))) {
  levels.push({ n: levels.length + 1, part: +m[1], title: m[2], date: m[3], place: m[4] });
}
if (!levels.length) {
  console.error("没读到关卡表：游戏/assets/levels.js 的写法变了？");
  process.exit(1);
}

const PARTS = ["", "住进来", "夜里", "星期六", "上门"];
// Windows 文件名里不能出现 \ / : * ? " < > |，全角标点不算，但半角要挡一道。
const safe = (s) => s.replace(/[\\/:*?"<>|]/g, "·").trim();
const pad = (n) => String(n).padStart(2, "0");

const shortcuts = [];
const add = (file, url) => shortcuts.push([file, url]);

add("00-全部关卡（分段目录）", GAME + "?test");
for (const lv of levels) {
  add(pad(lv.n) + "-" + safe(lv.title), GAME + "?level=" + lv.n);
}
// 浏览器本身的两个入口：调版面、调搜索框时省得从第一关点进去。
add("90-空白分页", GAME + "?web=blank");
add("91-校园网登入页", GAME + "?web=vhu");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const [name, url] of shortcuts) {
  // .url 是 INI，CRLF 才稳；内容全 ASCII（网址里的中文已由 pathToFileURL 转义）。
  fs.writeFileSync(path.join(OUT, name + ".url"), "[InternetShortcut]\r\nURL=" + url + "\r\n", "ascii");
}

const rows = levels.map(
  (lv) => `| \`${pad(lv.n)}-${lv.title}.url\` | ${lv.part} · ${PARTS[lv.part] || ""} | ${lv.date} | ${lv.place} |`,
);

fs.writeFileSync(
  path.join(OUT, "README.md"),
  [
    "# 测试入口",
    "",
    "双击任意一个 `.url`，直接用默认浏览器打开那一关的关头（`?level=数字`）。",
    "不用改地址栏，也不用从第一关点进去。",
    "",
    "- `00-全部关卡（分段目录）` 走游戏自带的 `?test` 页，一屏列完 16 关和每个分段，点哪个进哪个。",
    "- `90-空白分页` / `91-校园网登入页` 是两个调试入口，调浏览器版面时用。",
    "",
    "这堆文件是生成的，别手改：关卡名或关卡数变了，重跑一次",
    "",
    "```",
    "node tools/做入口.mjs",
    "```",
    "",
    "（快捷方式里写的是绝对路径，仓库搬家之后也要重跑。）",
    "",
    "| 入口 | 章内位置 | 日期 | 场景 |",
    "| --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n"),
  "utf8",
);

console.log("写出 " + (shortcuts.length + 1) + " 个文件到 " + path.relative(ROOT, OUT) + "/");
shortcuts.forEach(([n, u]) => console.log("  " + n.padEnd(22) + u.replace(GAME, "index.html")));
