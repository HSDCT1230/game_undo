# -*- coding: utf-8 -*-
"""量真实木纹的颗粒能量与各向异性，用于生成同参数的合成木纹。"""
import numpy as np
from PIL import Image

ROOT = "G:/code/active/lab/vibe_undo/图/游戏/"


def gblur2(x, s):
    r = int(3 * s) + 1
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2)
    k /= k.sum()
    p = np.pad(x, ((r, r), (0, 0)), mode="edge")
    y = np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 0, p)
    p = np.pad(y, ((0, 0), (r, r)), mode="edge")
    return np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 1, p)


BOXES = [(150, 470, 300, 590), (170, 600, 320, 700), (330, 590, 450, 680),
         (600, 560, 720, 660), (120, 380, 240, 470)]

for rel in ["06-初诊-8月16日/示意-抽屉.png", "14-拿笔记-9月7日/示意-空抽屉.png"]:
    A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
    lum = A.mean(2)
    print("==", rel)
    for (x0, y0, x1, y1) in BOXES:
        w = lum[y0:y1, x0:x1]
        d = w - gblur2(w, 3.0)
        # 各向：沿 x 平滑后剩多少、沿 y 平滑后剩多少
        dx = w - gblur2(w, 4.0)  # 横向平均 → 剩纵向变化
        print("  box %s  lum=%.1f  std=%.2f" % ((x0, y0, x1, y1), w.mean(), d.std()), end="  ")
        # 自相关近似：水平相邻差 vs 垂直相邻差
        gh = np.abs(np.diff(w, axis=1)).mean()
        gv = np.abs(np.diff(w, axis=0)).mean()
        print("|dh|=%.2f |dv|=%.2f  ratio=%.2f" % (gh, gv, gh / max(gv, 1e-6)))
