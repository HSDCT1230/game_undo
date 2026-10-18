# -*- coding: utf-8 -*-
"""
抽屉补丁「补纹理」定稿：从同一张图的**平坦木面**（抽屉前脸等）取细节层，
1:1 贴进补丁区。只搬高通细节（σ=14，去均值），不搬明暗，所以平面朝向不同也不冲突。
用法：python dgrain6.py            → 出候选图到 _chk/
      python dgrain6.py --apply    → 用 DONOR 指定的取样点写回三张图
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


def gblur2(x, s):
    r = max(1, int(3 * s) + 1)
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


def paper_protect(shape, k=0.408, b=255.9, pad=6):
    H, W = shape
    yy, xx = np.mgrid[0:H, 0:W]
    return yy < (k * xx + b + pad)


CASES = [
    ("06-初诊-8月16日/示意-抽屉.png", False),
    ("10-第三次-8月30日/示意-抽屉缝.png", True),
    ("12-第四次-9月6日/示意-抽屉.png", False),
]

DONORS = [(205, 640), (240, 655), (75, 305)]


def build(A, protect, donor):
    H, W, _ = A.shape
    m = mask_of((H, W), 15)
    if protect:
        m = m & (~paper_protect((H, W)))
    lum = A.mean(2)
    ys, xs = np.where(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    ph, pw = y1 - y0, x1 - x0

    dx, dy = donor
    D = A[dy:dy + ph, dx:dx + pw]
    detail = D - gblur(D, 14.0)
    detail -= detail.reshape(-1, 3).mean(0)

    field = np.zeros((H, W))
    field[y0:y1, x0:x1] = detail.mean(2)

    alpha = np.asarray(
        Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))
    ).astype(np.float64) / 255.0
    out = np.clip(A + (field * alpha)[..., None], 0, 255)
    b0 = (lum - gblur2(lum, 3.0))[m].std()
    b1 = (out.mean(2) - gblur2(out.mean(2), 3.0))[m].std()
    return out, b0, b1, (pw, ph)


if APPLY:
    for rel, protect in CASES:
        A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
        out, b0, b1, dim = build(A, protect, DONORS[0])
        Image.fromarray(out.round().astype(np.uint8)).convert("RGBA").save(ROOT + rel)
        print("applied %-14s %s  HFstd %.2f -> %.2f" % (rel.split("/")[-1][:12], dim, b0, b1))
else:
    for i, dn in enumerate(DONORS):
        A = np.asarray(Image.open(ROOT + CASES[0][0]).convert("RGB")).astype(np.float64)
        out, b0, b1, dim = build(A, CASES[0][1], dn)
        Image.fromarray(out.round().astype(np.uint8)).save(OUT + "v%d_06.png" % i)
        print("donor %s  %s  HFstd %.2f -> %.2f" % (dn, dim, b0, b1))
