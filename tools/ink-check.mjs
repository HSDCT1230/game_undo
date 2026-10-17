/**
 * 编译并抽检第一章 Ink（写稿用，不接运行时）。
 *   node tools/ink-check.mjs
 * 需要 tools/_bin/inklecate/inklecate.exe（缺则自动从 GitHub 拉 v1.2.1）。
 * 可选依赖 tools/node_modules/inkjs：有则跑三结局路径断言。
 */
import fs from "fs";
import path from "path";
import { execFileSync, spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";
import https from "https";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const inkRoot = path.join(root, "策划", "剧本", "ink");
const entry = path.join(inkRoot, "ch1.ink");
const binDir = path.join(__dirname, "_bin");
const inkBin = path.join(binDir, "inklecate");
const exe = path.join(inkBin, process.platform === "win32" ? "inklecate.exe" : "inklecate");
const outJson = path.join(binDir, "ch1.json");
const INKLECATE_VER = "v1.2.1";

const errors = [];
const info = [];
const err = (m) => errors.push(m);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "vibe_undo-ink-check" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} ${url}`));
          return;
        }
        const f = createWriteStream(dest);
        pipeline(res, f).then(resolve, reject);
      })
      .on("error", reject);
  });
}

async function ensureInklecate() {
  if (fs.existsSync(exe)) return exe;
  fs.mkdirSync(inkBin, { recursive: true });
  const plat =
    process.platform === "win32" ? "windows" : process.platform === "darwin" ? "mac" : "linux";
  const zipName = `inklecate_${plat}.zip`;
  const zipPath = path.join(binDir, zipName);
  const url = `https://github.com/inkle/ink/releases/download/${INKLECATE_VER}/${zipName}`;
  info.push(`下载 inklecate ${INKLECATE_VER}…`);
  await download(url, zipPath);
  if (process.platform === "win32") {
    const ps = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${inkBin.replace(/'/g, "''")}' -Force`,
      ],
      { encoding: "utf8" }
    );
    if (ps.status !== 0) throw new Error(ps.stderr || ps.stdout || "Expand-Archive failed");
  } else {
    execFileSync("unzip", ["-o", zipPath, "-d", inkBin], { stdio: "pipe" });
    try {
      fs.chmodSync(exe, 0o755);
    } catch {
      /* ignore */
    }
  }
  if (!fs.existsSync(exe)) throw new Error(`inklecate 解压后仍找不到：${exe}`);
  return exe;
}

function compile(compiler) {
  fs.mkdirSync(binDir, { recursive: true });
  if (fs.existsSync(outJson)) fs.unlinkSync(outJson);
  const r = spawnSync(compiler, ["-o", outJson, entry], {
    encoding: "utf8",
    cwd: inkRoot,
  });
  const log = ((r.stdout || "") + (r.stderr || "")).trim();
  if (r.status !== 0 || !fs.existsSync(outJson)) {
    err("inklecate 编译失败");
    log.split(/\r?\n/).forEach((ln) => {
      if (ln.trim()) err("  " + ln);
    });
    return false;
  }
  if (log) info.push("inklecate 警告：\n" + log);
  info.push(`编译 OK → ${path.relative(root, outJson)}（${fs.statSync(outJson).size} bytes）`);
  return true;
}

function checkSourceConventions() {
  const files = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".ink")) files.push(p);
    }
  })(inkRoot);

  const doneFiles = files.filter((p) => /=== DONE ===/.test(fs.readFileSync(p, "utf8")));
  if (doneFiles.length !== 1) {
    err(`=== DONE === 应只出现一次（现 ${doneFiles.length}）：${doneFiles.map((p) => path.relative(root, p)).join(", ")}`);
  }

  for (const p of files) {
    const t = fs.readFileSync(p, "utf8");
    const rel = path.relative(root, p);
    if (/# note:[A-Za-z0-9_-]+\|/.test(t)) {
      err(`${rel}：# note:id|… 的 | 会被 Ink 当语法，请改成 # note:id=…`);
    }
  }

  const late = fs.readFileSync(path.join(inkRoot, "ch1", "late.ink"), "utf8");
  for (const name of ["roofNightTailChen", "roofNightTailMing", "roofNightTailZhang", "resolveEndHurt"]) {
    if (!late.includes(`=== ${name} ===`)) err(`late.ink 缺 knot ${name}`);
  }
  const vars = fs.readFileSync(path.join(inkRoot, "ch1", "_vars.ink"), "utf8");
  if (!/function foundChenCrush/.test(vars) || !/function dugLuoSecrets/.test(vars)) {
    err("_vars.ink 缺 foundChenCrush / dugLuoSecrets");
  }
  if (!/=== test_endHurt ===/.test(vars)) err("_vars.ink 缺 test_endHurt（ink-check 用）");
}

async function assertEndings() {
  const inkjsPath = path.join(__dirname, "node_modules", "inkjs", "dist", "ink.js");
  const inkjsMod = path.join(__dirname, "node_modules", "inkjs", "package.json");
  if (!fs.existsSync(inkjsMod)) {
    info.push("未装 inkjs（tools/ 下 npm install），跳过三结局运行时断言");
    return;
  }
  let Story;
  try {
    const mod = await import(pathToFileURL(path.join(__dirname, "node_modules", "inkjs", "engine.js")).href);
    Story = mod.Story;
  } catch {
    try {
      const mod = await import("inkjs");
      Story = mod.Story;
    } catch (e) {
      err(`无法加载 inkjs：${e.message}`);
      return;
    }
  }

  const json = fs.readFileSync(outJson, "utf8");
  const cases = [
    {
      name: "ming（默认）",
      expect: "ming",
      set: {},
    },
    {
      name: "chen（钱夹）",
      expect: "chen",
      set: { has_chen_wallet: true },
    },
    {
      name: "zhang（鱼牌链）",
      expect: "zhang",
      set: { has_fish_tag: true, askedFishLuo: true, note_fish_cv: true },
    },
    {
      name: "zhang 优先于 chen",
      expect: "zhang",
      set: { has_fish_tag: true, askedFishLuo: true, note_fish_cv: true, has_chen_wallet: true },
    },
  ];

  for (const c of cases) {
    const story = new Story(json);
    for (const [k, v] of Object.entries(c.set)) story.variablesState[k] = v;
    story.ChoosePathString("test_endHurt");
    let text = "";
    while (story.canContinue) text += story.Continue();
    const m = text.match(/EndHurt:(\w+)/);
    const got = m ? m[1] : "";
    if (got !== c.expect) err(`结局断言失败「${c.name}」：期望 ${c.expect}，得到 ${got || "(空)"}｜${text.trim().slice(0, 80)}`);
    else info.push(`结局 OK：${c.name} → ${got}`);
  }
}

function checkJsParity() {
  const lateJs = fs.readFileSync(path.join(root, "游戏", "assets", "story-late.js"), "utf8");
  for (const fn of ["foundChenCrush", "dugLuoSecrets", "resolveEndHurt", "roofNightTailChen", "roofNightTailMing", "roofNightTailZhang"]) {
    if (!new RegExp(`function\\s+${fn}\\s*\\(`).test(lateJs)) err(`story-late.js 缺 function ${fn}`);
  }
  if (!/dugLuoSecrets\(\)\s*\?\s*"zhang"\s*:\s*foundChenCrush\(\)\s*\?\s*"chen"\s*:\s*"ming"/.test(lateJs)) {
    err("story-late.js resolveEndHurt 优先级与文档不符（应为 dug→zhang / crush→chen / else→ming）");
  }
}

async function main() {
  if (!fs.existsSync(entry)) {
    console.error("找不到", entry);
    process.exit(1);
  }
  checkSourceConventions();
  checkJsParity();
  let compiler;
  try {
    compiler = await ensureInklecate();
  } catch (e) {
    err(`无法取得 inklecate：${e.message}`);
  }
  if (compiler && compile(compiler)) await assertEndings();

  console.log("== Ink 检 ==");
  info.forEach((m) => console.log("  " + m));
  if (errors.length) {
    console.log(`\n-- ERROR ${errors.length} 条 --`);
    errors.forEach((m) => console.log("ERROR " + m));
    process.exitCode = 1;
  } else {
    console.log("\n没有 ERROR。");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
