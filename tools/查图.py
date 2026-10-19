# 图库查重与孤儿分析。按 md5 分组，标出每组里「同目录／跨目录」「代码有没有引用」，
# 再单独列出代码完全没提到的图（孤儿）。判定是保守的：文件名在源码里出现过就算引用。
#
# 用法：python tools/查图.py
# 输出：终端摘要 + tools/_bin/_dup.txt、tools/_bin/_orphan.txt
import os
import hashlib
import re
import json
import io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # tools → 仓库根
IMGDIR = os.path.join(ROOT, "图", "游戏")
ASSETS = os.path.join(ROOT, "游戏", "assets")

# 读代码里出现过的图片名（不带扩展名）
src = ""
for fn in os.listdir(ASSETS):
    if fn.endswith(".js"):
        src += io.open(os.path.join(ASSETS, fn), encoding="utf-8", errors="ignore").read()

names = set(re.findall(r'"(?:0\d|1\d)-[^"]*/([^"/]+)"', src))
names |= set(re.findall(r'pic\(\s*\d+\s*,\s*"([^"]+)"', src))
names |= set(re.findall(r'lvPic\(\s*"([^"]+)"', src))
names |= set(re.findall(r'picSrc\(\s*"([^"]+)"', src))
# README 里也提到过的不算引用
def referenced(stem):
    # 保守判定：文件名（或它的路径片段）在源码里出现过就算引用，宁可漏删不误删
    if stem in names:
        return True
    return stem in src

groups = {}
for dirpath, _, files in os.walk(IMGDIR):
    for f in files:
        if not f.lower().endswith((".png", ".jpg", ".jpeg")):
            continue
        p = os.path.join(dirpath, f)
        h = hashlib.md5(open(p, "rb").read()).hexdigest()
        groups.setdefault(h, []).append((p, os.path.getsize(p)))

dups = {h: v for h, v in groups.items() if len(v) > 1}
total_dup = sum(sum(s for _, s in v[1:]) for v in dups.values())
print("重复组 %d，份数 %d，可省 %.1f MB" % (len(dups), sum(len(v) for v in dups.values()), total_dup / 1048576))

rows = []
for h, v in sorted(dups.items(), key=lambda kv: -sum(s for _, s in kv[1])):
    v = sorted(v, key=lambda t: t[0])
    names_ = [os.path.basename(p) for p, _ in v]
    dirs = [os.path.relpath(os.path.dirname(p), IMGDIR) for p, _ in v]
    same_dir = len(set(dirs)) == 1
    refs = [referenced(os.path.splitext(os.path.basename(p))[0]) for p, _ in v]
    rows.append(
        {
            "size": v[0][1],
            "n": len(v),
            "same_dir": same_dir,
            "names": names_,
            "dirs": dirs,
            "refs": refs,
            "waste": sum(s for _, s in v[1:]),
        }
    )

with io.open(os.path.join(ROOT, "tools", "_bin", "_dup.txt"), "w", encoding="utf-8") as f:
    f.write("重复组 %d，份数 %d，可省 %.1f MB\n\n" % (len(dups), sum(len(v) for v in dups.values()), total_dup / 1048576))
    for r in rows[:40]:
        f.write(
            "%.1fMB x%d  同目录=%s  引用=%s\n    %s\n    %s\n\n"
            % (r["size"] / 1048576, r["n"], r["same_dir"], "".join("1" if x else "0" for x in r["refs"]), " | ".join(r["dirs"]), " | ".join(r["names"]))
        )

# 完全没被引用的图（孤儿）
orps = []
for dirpath, _, files in os.walk(IMGDIR):
    for f in files:
        if not f.lower().endswith((".png", ".jpg", ".jpeg")):
            continue
        stem = os.path.splitext(f)[0]
        if not referenced(stem):
            p = os.path.join(dirpath, f)
            orps.append((os.path.relpath(p, IMGDIR), os.path.getsize(p)))
print("没被代码引用的图 %d 张，%.1f MB" % (len(orps), sum(s for _, s in orps) / 1048576))
with io.open(os.path.join(ROOT, "tools", "_bin", "_orphan.txt"), "w", encoding="utf-8") as f:
    for p, s in sorted(orps, key=lambda t: -t[1]):
        f.write("%.2fMB  %s\n" % (s / 1048576, p))
