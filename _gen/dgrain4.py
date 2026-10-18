# -*- coding: utf-8 -*-
"""
抽屉补丁「补纹理」定稿方案。

依据（_gen/dgrain3_measure.py 实测）：
  · 抽屉底板的木纹是**竖向**的（沿 x 变化快、沿 y 几乎不变）：
    干净木面 box(170,600,320,700) 上 |dh|=4.86 / |dv|=1.16，比值 4.2。
  · 真实颗粒能量：高通 σ=3 的 std ≈ 4.0–6.0（亮度 80–90 区）。
  · 补丁区实测 std 只有 2.0 左右 —— 所以看上去像一块抹开的雾。

做法：合成各向异性颗粒（沿 y 拉长 σ=9、沿 x 仅 σ=0.7），
把 std 归一到 5.0，再按羽化掩膜叠进补丁区。不再从别张图搬纹理。
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "G:/code/active/lab/vibe_undo/图/游戏/"
OUT = "G:/code/active/lab/vibe_undo/_chk/"
APPLY = "--apply" in sys.argv

FISH = [(438,489),(446,484),(451,469),(458,486),(466,480),(484,479),(503,480),
        (520,485),(536,492),(548,501),(558,511),(565,520),(561,528),(549,531),
        (536,528),(524,533),(508,533),(496,521),(483,513),(471,501),(461,495),(449,497)]

GRAIN_STD = 5.0


def gblur2(x, s):
    r = max(1, int(3 * s) + 1)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2)
    k /= k.sum()
    p = np.pad(x, ((r, r), (0, 0)), mode="edge")
    y = np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 0, p)
    p = np.pad(y, ((0, 0), (r, r)), mode="edge")
    return np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 1, p)


def mask_of(shape, grow=15):
    H, W = shape
    img = Image.new("L", (W, H), 0)
    ImageDraw.Draw(img).polygon(FISH, fill=255)
    img = img.filter(ImageFilter.MaxFilter(2 * grow + 1)).filter(ImageFilter.MinFilter(9))
    return np.asarray(img) > 100


def paper_protect(shape, k=0.408, b=255.9, pad=6):
    H, W = shape
    yy, xx = np.mgrid[0:H, 0:W]
    return yy < (k * xx + b + pad)


CASES = [
    ("06-初诊-8月16日/示意-抽屉.png", False),
    ("10-第三次-8月30日/示意-抽屉缝.png", True),
    ("12-第四次-9月6日/示意-抽屉.png", False),
]

for rel, protect in CASES:
    A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
    H, W, _ = A.shape
    m = mask_of((H, W), 15)
    if protect:
        m = m & (~paper_protect((H, W)))
    lum = A.mean(2)

    ys, xs = np.where(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1

    rng = np.random.default_rng(20261018 + y0)
    n = rng.normal(0, 1, (y1 - y0 + 40, x1 - x0 + 40))
    n = gblur2(n, 9.0)      # 沿 y 拉长 → 竖纹
    n = gblur2(n, 0.7)      # 沿 x 只留极细变化
    n = n[20:20 + (y1 - y0), 20:20 + (x1 - x0)]
    n -= n.mean()
    n *= GRAIN_STD / max(1e-6, n.std())

    field = np.zeros((H, W))
    field[y0:y1, x0:x1] = n

    before = (lum - gblur2(lum, 3.0))[m].std()

    alpha = np.asarray(
        Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))
    ).astype(np.float64) / 255.0

    out = np.clip(A + (field * alpha)[..., None], 0, 255)
    l2 = out.mean(2)
    after = (l2 - gblur2(l2, 3.0))[m].std()

    print("%-14s  patch %dx%d  HFstd(σ3) %.2f -> %.2f  (目标 5.0)"
          % (rel.split("/")[-1][:12], x1 - x0, y1 - y0, before, after))

    if APPLY:
        Image.fromarray(out.round().astype(np.uint8)).convert("RGBA").save(ROOT + rel)
        print("   applied ->", rel)
    else:
        name = "g_" + rel[:2]
        Image.fromarray(out.round().astype(np.uint8)).save(OUT + name + ".png")
        print("   ->", OUT + name + ".png")
