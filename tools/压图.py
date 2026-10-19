# -*- coding: utf-8 -*-
"""把 图/游戏 下的 PNG 转成 JPEG（游戏运行时只读 .jpg）。

为什么要转：这套图是照片，用 PNG 存等于没压缩。193.7MB → 约 20MB，首屏从 10.3MB 降到 1MB 出头。
（2026-10-19 核过：185 张里 102 张标称 RGBA，但 alpha 全 255，没有一张真透明，所以全部能转。）

用法（在仓库根目录）：
    python tools/压图.py --dry          只算体积，不写文件
    python tools/压图.py                全部转，转完删掉原 .png
    python tools/压图.py 03 14          只转路径里带 03 / 14 的

参数默认 q88、4:4:4（不做色度抽样）。不降色度是为了截图类图（电脑发帖、预约表、证件）
里的繁体小字不糊；照片类其实 q84 也看不出，但统一一档省得以后猜。
想更小就 --quality 84 --sub 2（4:2:0），体积再省三成，细字会软一点。
"""
import os
import sys
import io
import json
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                      # tools → 仓库根
GAME = os.path.join(ROOT, "图", "游戏")

argv = sys.argv[1:]
DRY = "--dry" in argv
KEEP = "--keep" in argv          # 只生成 .jpg，先不删源 .png（大批量迁移时分批删，免得撞删除护栏）
Q, SUB, FILTERS = 88, 0, []
i = 0
while i < len(argv):
    a = argv[i]
    if a == "--quality":
        Q = int(argv[i + 1]); i += 2; continue
    if a == "--sub":
        SUB = int(argv[i + 1]); i += 2; continue
    if not a.startswith("--"):
        FILTERS.append(a)
    i += 1


def wanted(rel):
    return not FILTERS or any(f in rel for f in FILTERS)


def has_alpha(im):
    if im.mode not in ("RGBA", "LA"):
        return False
    lo, _ = im.getchannel("A").getextrema()
    return lo < 250


def encode(im):
    b = io.BytesIO()
    im.convert("RGB").save(b, "JPEG", quality=Q, optimize=True, progressive=True, subsampling=SUB)
    return b.getvalue()


rows, skipped = [], []
for dirpath, _, fns in os.walk(GAME):
    fns.sort()
    for fn in fns:
        if not fn.lower().endswith(".png"):
            continue
        p = os.path.join(dirpath, fn)
        rel = os.path.relpath(p, GAME).replace("\\", "/")
        if not wanted(rel):
            continue
        out = os.path.splitext(p)[0] + ".jpg"
        if os.path.exists(out):
            skipped.append((rel, "已有同名 .jpg，没动"))
            continue
        im = Image.open(p)
        if has_alpha(im):
            skipped.append((rel, "真的带透明，必须留 PNG"))
            continue
        before = os.path.getsize(p)
        if DRY:
            after = len(encode(im))
        else:
            with open(out, "wb") as f:
                f.write(encode(im))
            after = os.path.getsize(out)
            if not KEEP:
                os.remove(p)
        rows.append((rel, before, after))

tot_b = sum(r[1] for r in rows)
tot_a = sum(r[2] for r in rows)
print("%s：%d 张，%.1f MB → %.1f MB（%.0f%%），q%d/%s%s" % (
    "试算（未写盘）" if DRY else "已转", len(rows),
    tot_b / 1048576, tot_a / 1048576, 100.0 * tot_a / max(tot_b, 1),
    Q, "4:4:4" if SUB == 0 else "4:2:0",
    "" if DRY else ("，源 .png 保留（--keep）" if KEEP else "，原 .png 已删")))
if skipped:
    print("\n跳过 %d 个：" % len(skipped))
    for rel, why in skipped:
        print("  %-56s %s" % (rel, why))
big = sorted(rows, key=lambda r: r[2])[-5:]
if big:
    print("\n转完最大的 5 个：")
    for rel, b, a in big:
        print("  %-58s %6.2fM → %5.2fM" % (rel, b / 1048576, a / 1048576))
if not DRY:
    log = os.path.join(HERE, "_bin", "压图记录.json")
    os.makedirs(os.path.dirname(log), exist_ok=True)
    with open(log, "w", encoding="utf-8") as f:
        json.dump([{"file": r[0], "before": r[1], "after": r[2]} for r in rows], f, ensure_ascii=False, indent=1)
    print("\n记录写到 tools/_bin/压图记录.json")
