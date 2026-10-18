# -*- coding: utf-8 -*-
"""
抽屉补丁「补纹理」：把 14/示意-空抽屉 的真实木纹高频，按能量匹配补进补丁区。
只动高频，不动低频 —— 低频由已落盘的 Laplace 解保证边界连续（含节拍器投影衰减）。
"""
import os
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "G:/code/active/lab/vibe_undo/图/游戏/"
OUT = "G:/code/active/lab/vibe_undo/_chk/"

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


def ring_of(shape, grow=15, pad=45):
    H, W = shape
    a = mask_of(shape, grow)
    img = Image.new("L", (W, H), 0)
    ImageDraw.Draw(img).polygon(FISH, fill=255)
    img = img.filter(ImageFilter.MaxFilter(2 * (grow + pad) + 1)).filter(ImageFilter.MinFilter(9))
    return (np.asarray(img) > 100) & (~a)


def paper_protect(shape, k=0.408, b=255.9, pad=6):
    H, W = shape
    yy, xx = np.mgrid[0:H, 0:W]
    return yy < (k * xx + b + pad)


D = np.asarray(Image.open(ROOT + "14-拿笔记-9月7日/示意-空抽屉.png").convert("RGB")).astype(np.float64)
HF_D = D - gblur(D, 2.2)

CASES = [
    ("06-初诊-8月16日/示意-抽屉.png", (-4, -1), False),
    ("10-第三次-8月30日/示意-抽屉缝.png", (-5, -2), True),
    ("12-第四次-9月6日/示意-抽屉.png", (0, 0), False),
]

for rel, sh, protect in CASES:
    A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
    H, W, _ = A.shape
    m = mask_of((H, W), 15)
    if protect:
        m = m & (~paper_protect((H, W)))
    ring = ring_of((H, W), 15, 45) & (~m)

    lum = A.mean(2)
    ring_wood = ring & (lum > 55) & (lum < 210)

    hfD = np.roll(np.roll(HF_D, sh[1], axis=0), sh[0], axis=1)
    lumD = hfD.mean(2)

    cur = (A.mean(2) - gblur2(A.mean(2), 2.2))
    target = cur[ring_wood].std()
    got = lumD[m].std()
    add = (target ** 2 - cur[m].std() ** 2) ** 0.5
    scale = add / max(1e-6, got)

    alpha = np.asarray(
        Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))
    ).astype(np.float64) / 255.0

    out = A + (hfD * scale) * alpha[..., None]
    out = np.clip(out, 0, 255)

    # 复核
    l2 = out.mean(2)
    hfl2 = l2 - gblur2(l2, 2.2)
    print("%-14s targetHF=%.2f  before=%.2f  after=%.2f  scale=%.2f  sgn-mean=%.2f"
          % (rel.split("/")[-1][:12], target, cur[m].std(), hfl2[m].std(), scale, hfD[m].mean()))

    name = "t_" + os.path.basename(os.path.dirname(ROOT + rel))[:2] + "_" + os.path.basename(rel)[3:5]
    Image.fromarray(out.round().astype(np.uint8)).save(OUT + name + ".png")
    print("   ->", OUT + name + ".png")
