// 从 levels.js 里把十六关的「必做项」抽出来，生成一份人工通关核对清单。
// 冒烟脚本能挡住白屏／坏图／报错，挡不住「该出现的东西没出现」；那份只能靠人点，
// 这份清单就是把每一关要点到的东西按顺序列好，方便照着走一遍。
//
// 用法：node tools/通关清单.mjs            → 写到 策划/剧本/改对话/通关核对清单.md
//       node tools/通关清单.mjs --dry      → 只打印，不写文件

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const src = readFileSync(join(root, "游戏/assets/levels.js"), "utf8");

// levels.js 顶层只有常量与函数声明，真正用到 S／DOM 的都在函数体里，所以可以直接求值。
// 少数顶层引用会碰到的名字用空壳顶上，碰不到就算了。
const stub = new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : stub),
  apply: () => stub,
  construct: () => stub,
});
const ctx = vm.createContext({
  console,
  S: stub,
  flag: () => false,
  draw: () => {},
  window: stub,
  document: stub,
});
// 整段求值最稳：函数体不会被调用，只有顶层的 const 会被算出来
const script = new vm.Script(src + "\n;globalThis.__out = { LEVELS, SEGS, PARTS };");
script.runInContext(ctx);
const { LEVELS, SEGS, PARTS } = ctx.__out;

const hintOf = (t) => {
  if (!t.hint) return "";
  if (typeof t.hint === "string") return t.hint;
  try {
    const v = t.hint();
    return typeof v === "string" ? v : "";
  } catch {
    return "";
  }
};

const rows = [];
for (let n = 1; n < LEVELS.length; n++) {
  const L = LEVELS[n];
  if (!L) continue;
  const need = (L.tasks || []).filter((t) => t.need);
  const opt = (L.tasks || []).filter((t) => !t.need);
  rows.push({
    n,
    part: PARTS[L.part] || "",
    title: L.title,
    date: L.date,
    place: L.place,
    goal: L.goalZh || L.goal || "",
    need: need.map((t) => ({ text: t.text, after: t.after || "", hint: hintOf(t) })),
    opt: opt.map((t) => ({ text: t.text, after: t.after || "" })),
    segs: (SEGS[n] || []).map((s) => s.name),
  });
}

let totalNeed = 0;
let totalOpt = 0;
const lines = [];
const P = (s = "") => lines.push(s);

P("# 通关核对清单（十六关）");
P();
P("> 本文件由 `tools/通关清单.mjs` 从 `游戏/assets/levels.js` 直接生成，改关卡后重跑即可。");
P("> 用途：自动检查只能证明「不白屏、不缺图、不报错」，证明不了「该出现的按钮出现了」。");
P("> 那份只能靠人点一遍——照着这张清单走，每一步点不出来就是真问题。");
P();
P("## 怎么用");
P();
P("1. `cd 游戏 && python -m http.server 8080`，浏览器开 `http://127.0.0.1:8080/?dev`。");
P("2. `?dev` 会显示跳关面板；怀疑某一关有问题时，直接跳过去单测那关（`?level=N`）。");
P("3. 每一关**只看带 ★ 的项**——那是过关必须满足的条件（`need: true`），缺一项就卡住。");
P("4. 圆括号里的「触发」是这一项对应的画面／事件名，找不到就说明触发没出来。");
P("5. 卡住时先按 F12 看控制台；再对照本关 ★ 项，确认是「条件没满足」还是「按钮根本没画出来」。");
P();
P("## 全表");
P();
P("| 关 | 篇 | 标题 | 时间 | 地点 | ★ 必做 | ○ 可选 | 分段入口 |");
P("| --- | --- | --- | --- | --- | --- | --- | --- |");
for (const r of rows) {
  totalNeed += r.need.length;
  totalOpt += r.opt.length;
  P(
    `| ${r.n} | ${r.part} | ${r.title} | ${r.date} | ${r.place} | ${r.need.length} | ${r.opt.length} | ${
      r.segs.length ? r.segs.join(" / ") : "—"
    } |`
  );
}
P();
P(`合计 **★ 必做 ${totalNeed} 项**、○ 可选 ${totalOpt} 项。全部点出来，主线就是通的。`);
P();

for (const r of rows) {
  P(`## 第 ${r.n} 关 · ${r.title}`);
  P();
  P(`- ${r.part}　${r.date}　${r.place}`);
  if (r.goal) P(`- 目标：${r.goal}`);
  if (r.segs.length) P("- 分段入口（网址加 ?level=" + r.n + "&seg=b 这种）：" + r.segs.map((s) => "`" + s + "`").join("、"));
  P();
  if (r.need.length) {
    P("**★ 必做**");
    P();
    r.need.forEach((t, i) => {
      P(`${i + 1}. ${t.text}${t.after ? `　（触发：${t.after}）` : ""}`);
      if (t.hint) P(`   - 提示：${t.hint}`);
    });
    P();
  }
  if (r.opt.length) {
    P("○ 可选（不做也能过，但会少内容）");
    P();
    r.opt.forEach((t) => P(`- ${t.text}${t.after ? `　（触发：${t.after}）` : ""}`));
    P();
  }
}

P("## 走完之后");
P();
P("若某关卡住，按这三条分辨：");
P();
P("1. **条件没满足**：★ 项还是灰的 → 看它的提示，通常是漏点了屋里的某样东西（`屋里看清四样`、`看三样`计数类）。");
P("2. **触发没出**：该出现的画面根本没出现 → 查 `story-*.js` 里这段的入口函数是否被 `S.xxx` 前置条件挡住。");
P("3. **点了没反应**：按钮在但点下去无事发生 → 控制台多半有报错，把报错连同关卡号记下来。");
P();

const out = lines.join("\n");
if (process.argv.includes("--dry")) {
  console.log(out);
} else {
  const p = join(root, "策划/剧本/改对话/通关核对清单.md");
  writeFileSync(p, out, "utf8");
  console.log(`已写出 ${p}`);
  console.log(`十六关：★ 必做 ${totalNeed} 项 / ○ 可选 ${totalOpt} 项`);
}
