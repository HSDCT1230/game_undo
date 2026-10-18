// 门检：查「必做项（need: true）的触发条件有没有人真的去置真」。
//
// 为什么要这个：过关是被 need 项卡的。如果某一项的 done() 读一个从来没人写的 flag，
// 玩家怎么点都过不去，而且在浏览器里表现为"一切都正常，就是没下一步"——最难查的一类。
// 冒烟脚本查不出这个：它检查的是有没有白屏/坏图/报错，不是"这一关能不能结束"。
//
// 做法：把 LEVELS 里每个 need 项的 done() 源码取出来，抽出它读的条件名
// （flag("x") / noted("x") / ev("x") / hasEvidence("x")），
// 再回所有 asset 里数这个名字被"写"了多少次。只有读没有写 = 死门。
//
// 用法：node tools/门检.cjs      有问题退出码 1

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dir = join(root, "游戏/assets");

const files = readdirSync(dir).filter((f) => f.endsWith(".js"));
const all = files.map((f) => ({ f, t: readFileSync(join(dir, f), "utf8") }));
const levelsSrc = readFileSync(join(dir, "levels.js"), "utf8");

// levels.js 顶层只有常量与函数声明，函数体不会被执行，所以可以整段求值
const stub = new Proxy(function () {}, {
  get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : stub),
  apply: () => stub,
  construct: () => stub,
});
const ctx = vm.createContext({ console, S: stub, flag: () => false, draw: () => {}, window: stub, document: stub });
new vm.Script(levelsSrc + "\n;globalThis.__L = LEVELS;").runInContext(ctx);
const LEVELS = ctx.__L;

// 动态拼出来的键，静态数不出写入点，但代码里确实在写（见 why），不算死门
const DYNAMIC = [
  { re: /^ok(6|8|10|12)$/, why: 'diary.js:470  S.handed["ok" + n] = true' },
];
// 属性式条件：读的是 S.handed.ok6 / S.visitSeen[2] 这种，没有字符串可数，单独列出来
const PROP = [
  { re: /S\.handed\s*(?:&&\s*S\.handed)?\.(ok\d+)\b/g, note: "diary.js:470 动态拼键写入" },
  { re: /S\.visitSeen\s*&&\s*S\.visitSeen\[(\d+)\]/g, note: "story-clinic.js:124 写入" },
  { re: /S\.clinicLooked\s*&&\s*S\.clinicLooked\.(\w+)/g, note: "story-clinic.js:31 写入" },
];

const readCount = (name) => all.reduce((n, { t }) => n + (t.split('"' + name + '"').length - 1), 0);
// 「写」的判定：同名字符串在源码里出现 ≥2 次（一次在 levels.js 读，至少一次在别处）
const COND_CALL = /\b(?:flag|noted|ev|hasEvidence)\(\s*"([^"]+)"\s*\)/g;

const rows = [];
const props = [];
for (let n = 1; n < LEVELS.length; n++) {
  const L = LEVELS[n];
  if (!L) continue;
  (L.tasks || []).forEach((t) => {
    if (!t.need || typeof t.done !== "function") return;
    const src = t.done.toString();
    const names = [...new Set([...src.matchAll(COND_CALL)].map((m) => m[1]))];
    for (const name of names) {
      const dyn = DYNAMIC.find((d) => d.re.test(name));
      rows.push({ n, task: t.text, name, count: readCount(name), dyn });
    }
    for (const p of PROP) {
      for (const m of src.matchAll(p.re)) props.push({ n, task: t.text, name: m[0].trim(), note: p.note });
    }
  });
}

const dead = rows.filter((r) => !r.dyn && r.count < 2);
const dyn = rows.filter((r) => r.dyn);
const covered = new Set([...rows.map((r) => r.n + "|" + r.task), ...props.map((p) => p.n + "|" + p.task)]);
const needTasks = new Set();
for (let n = 1; n < LEVELS.length; n++) for (const t of LEVELS[n]?.tasks || []) if (t.need) needTasks.add(n + "|" + t.text);
const uncovered = [...needTasks].filter((k) => !covered.has(k));

console.log("== 门检 ==");
console.log(
  `  必做项 ${needTasks.size} 项：具名条件核到 ${rows.length} 处、属性式 ${props.length} 处，覆盖 ${covered.size} 项；` +
    `余 ${uncovered.length} 项是计数式，静态查不出，只能实际点`
);
for (const u of uncovered) console.log(`    （计数式）第 ${u.split("|")[0]} 关「${u.split("|")[1]}」`);
console.log(`  死门（读得到、没人写）：${dead.length}`);
for (const d of dead) console.log(`    第 ${d.n} 关「${d.task}」→ "${d.name}" 全库仅出现 ${d.count} 次`);
if (dyn.length) {
  console.log(`  动态键 ${dyn.length} 处，已人工确认写入点：`);
  for (const d of dyn) console.log(`    第 ${d.n} 关「${d.task}」→ "${d.name}"　${d.dyn.why}`);
}
if (props.length) {
  console.log(`  属性式（无字符串可数，已核写入点）：`);
  for (const p of props) console.log(`    第 ${p.n} 关「${p.task}」→ ${p.name}　${p.note}`);
}
console.log(dead.length ? "有死门，需要处理。" : "没有死门。");
process.exit(dead.length ? 1 : 0);
