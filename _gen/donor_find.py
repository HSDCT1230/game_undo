# -*- coding: utf-8 -*-
"""在抽屉底板内侧找一块 150x87 的纯木面，并输出候选块供目视确认。"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "G:/code/active/lab/vibe_undo/图/游戏/"


def gblur2(x, s):
    r = max(1, int(3 * s) + 1)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2)
    k /= k.sum()
    p = np.pad(x, ((r, r), (0, 0)), mode="edge")
    y = np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 0, p)
    p = np.pad(y, ((0, 0), (r, r)), mode="edge")
    return np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 1, p)


PH, PW = 87, 150
SCOPE = (185, 450, 430, 585)   # x0,y0,x1,y1 允许取样范围（底板内侧左半边）

A = np.asarray(Image.open(ROOT + "06-初诊-8月16日/示意-抽屉.png").convert("RGB")).astype(np.float64)
lum = A.mean(2)
sat = A.max(2) - A.min(2)

lo = gblur2(lum, 8.0)
gy, gx = np.gradient(lo)
g = np.hypot(gx, gy)

cands = []
for y in range(SCOPE[1], SCOPE[3] - PH + 1, 3):
    for x in range(SCOPE[0], SCOPE[2] - PW + 1, 3):
        w = lum[y:y + PH, x:x + PW]
        s = sat[y:y + PH, x:x + PW]
        if w.mean() < 70 or w.mean() > 115:
            continue
        if s.mean() > 30:
            continue
        # 低梯度 + 低对比
        score = g[y:y + PH, x:x + PW].mean() * 10 + w.std()
        cands.append((score, x, y, w.mean(), w.std(), g[y:y + PH, x:x + PW].mean()))

cands.sort()
print("候选前 8：")
for c in cands[:8]:
    print("  score=%.2f  (%d,%d)  lum=%.1f  std=%.2f  grad=%.3f" % c)

# 画出来看
im = Image.open(ROOT + "06-初诊-8月16日/示意-抽屉.png").convert("RGB")
d = ImageDraw.Draw(im)
d.rectangle([SCOPE[0], SCOPE[1], SCOPE[2], SCOPE[3]], outline=(0,255,0), width=2)
colors = [(255,0,255), (255,255,0), (0,255,255)]
for i, c in enumerate(cands[:3]):
    _, x, y, *_ = c
    d.rectangle([x, y, x + PW, y + PH], outline=colors[i], width=2)
    d.text((x + 4, y + 4), "#%d" % i, fill=colors[i])
im.crop((100, 380, 700, 640)).resize((1200, 520), Image.LANCZOS).save(
    "G:/code/active/lab/vibe_undo/_chk/donor.png")
print("-> _chk/donor.png")
