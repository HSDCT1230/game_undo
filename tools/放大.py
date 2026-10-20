# -*- coding: utf-8 -*-
"""把满屏铺底的 1280×720 场景图预放大到 1920×1080。

为什么：场景图铺满整个窗口（`.room.scene-fit > .room-bg{object-fit:cover}`）。
1920 宽的窗口里，1280 的图被浏览器放大 1.5 倍——1080p 屏上能看出发糊。
图只有 1280，没有更高分辨率的原图可换，所以这里做的是「换一种放大方式」：
先用 Lanczos 放大，再补一点轻锐化（radius 0.8 / 38% / 阈值 2），
比浏览器那条双线性路径清楚一些，墙面的 JPEG 块也不会被锐化放大。

只动 `场景-*.jpg` 且原尺寸正好 1280×720 的图。示意-／证据-／地图／人物 一律不碰：
那些最大只显示到几百像素，本来就在缩小，放大只会白占体积。

用法（在仓库根目录）：
    python tools/放大.py --dry      只列表，不写文件
    python tools/放大.py            全部处理（原地覆盖，旧图在 git 里）
    python tools/放大.py 06 12      只处理路径里带 06 / 12 的

跑完记得 bump `游戏/assets/pics.js` 的 PIC_VER，不然浏览器还用缓存里的旧图。
"""
import os
import sys
import io
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                       # tools → 仓库根
GAME = os.path.join(ROOT, "图", "游戏")

SRC_W, SRC_H = 1280, 720
DST_W, DST_H = 1920, 1080
SHARP_R, SHARP_PCT, SHARP_TH = 0.8, 38, 2
Q, SUB = 86, 0

argv = sys.argv[1:]
DRY = "--dry" in argv
FILTERS = [a for a in argv if not a.startswith("--")]


def wanted(rel):
    if not FILTERS:
        return True
    return any(f in rel for f in FILTERS)


def encode(im):
    b = io.BytesIO()
    im.save(b, "JPEG", quality=Q, optimize=True, progressive=True, subsampling=SUB)
    return b.getvalue()


rows, skipped = [], []
for dirpath, _, fns in os.walk(GAME):
    for fn in sorted(fns):
        if not fn.startswith("场景-") or not fn.lower().endswith(".jpg"):
            continue
        p = os.path.join(dirpath, fn)
        rel = os.path.relpath(p, GAME).replace("\\", "/")
        if not wanted(rel):
            continue
        with Image.open(p) as im:
            size = im.size
            if size == (DST_W, DST_H):
                skipped.append((rel, "已经是 1920×1080"))
                continue
            if size != (SRC_W, SRC_H):
                skipped.append((rel, "尺寸 %d×%d，不在这一档" % size))
                continue
            before = os.path.getsize(p) // 1024
            if DRY:
                rows.append((rel, before, -1))
                continue
            out = im.convert("RGB").resize((DST_W, DST_H), Image.LANCZOS).filter(
                ImageFilter.UnsharpMask(radius=SHARP_R, percent=SHARP_PCT, threshold=SHARP_TH)
            )
            data = encode(out)
        if not DRY:
            with open(p, "wb") as f:
                f.write(data)
            rows.append((rel, before, len(data) // 1024))

print("处理 %d 张%s" % (len(rows), "（dry，未写文件）" if DRY else ""))
for rel, b, a in rows:
    print("  %-52s %4d KB%s" % (rel, b, "" if a < 0 else " → %4d KB" % a))
if skipped:
    print("跳过 %d 张：" % len(skipped))
    for rel, why in skipped:
        print("  %-52s %s" % (rel, why))
if rows and not DRY:
    tb = sum(r[1] for r in rows)
    ta = sum(r[2] for r in rows)
    print("体积合计 %d KB → %d KB（+%d%%）" % (tb, ta, round((ta - tb) * 100.0 / tb)))
if not DRY and rows:
    print("记得 bump 游戏/assets/pics.js 的 PIC_VER")
