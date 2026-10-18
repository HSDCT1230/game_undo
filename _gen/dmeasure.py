# -*- coding: utf-8 -*-
"""量化三张抽屉图补丁区的低频亮度偏差与纹理能量差。"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "G:/code/active/lab/vibe_undo/图/游戏/"

FISH = [(438,489),(446,484),(451,469),(458,486),(466,480),(484,479),(503,480),
        (520,485),(536,492),(548,501),(558,511),(565,520),(561,528),(549,531),
        (536,528),(524,533),(508,533),(496,521),(483,513),(471,501),(461,495),(449,497)]


def gblur2(x, s):
    r = int(3 * s) + 1
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2)
    k /= k.sum()
    p = np.pad(x, ((r, r), (0, 0)), mode="edge")
    y = np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 0, p)
    p = np.pad(y, ((0, 0), (r, r)), mode="edge")
    return np.apply_along_axis(lambda v: np.convolve(v, k, "valid"), 1, p)


def gblur(x, s):
    if x.ndim == 2:
        return gblur2(x, s)
    return np.stack([gblur2(x[..., c], s) for c in range(x.shape[2])], -1)


def mask_of(shape, grow=15):
    H, W = shape
    img = Image.new("L", (W, H), 0)
    ImageDraw.Draw(img).polygon(FISH, fill=255)
    img = img.filter(ImageFilter.MaxFilter(2 * grow + 1)).filter(ImageFilter.MinFilter(9))
    return np.asarray(img) > 100


D = np.asarray(Image.open(ROOT + "14-拿笔记-9月7日/示意-空抽屉.png").convert("RGB")).astype(np.float64)

CASES = [
    ("06-初诊-8月16日/示意-抽屉.png", (-4, -1)),
    ("10-第三次-8月30日/示意-抽屉缝.png", (-5, -2)),
    ("12-第四次-9月6日/示意-抽屉.png", (0, 0)),
]

for rel, sh in CASES:
    A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
    H, W, _ = A.shape
    m = mask_of((H, W), 15)

    img2 = Image.new("L", (W, H), 0)
    ImageDraw.Draw(img2).polygon(FISH, fill=255)
    img2 = img2.filter(ImageFilter.MaxFilter(2 * 40 + 1)).filter(ImageFilter.MinFilter(9))
    ring = (np.asarray(img2) > 100) & (~m)

    lum = A.mean(2)
    ring_wood = ring & (lum > 55) & (lum < 200)

    Ds = np.roll(np.roll(D, sh[1], axis=0), sh[0], axis=1)
    d = gblur(A, 8) - gblur(Ds, 8)

    print(rel.split("/")[-1][:14], "ring n=%d" % ring_wood.sum(), "mask n=%d" % m.sum())
    print("   LO diff  in-mask", np.round(d[m].mean(0), 1), "  ring", np.round(d[ring_wood].mean(0), 1))
    print("   LO in-mask -> ring  spread", np.round(d[m].mean(0) - d[ring_wood].mean(0), 1))
    hfl = lum - gblur2(lum, 2.2)
    print("   HF std  in-mask %.2f  ring %.2f" % (hfl[m].std(), hfl[ring_wood].std()))
