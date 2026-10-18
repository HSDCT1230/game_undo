# -*- coding: utf-8 -*-
"""
抽屉补丁「补纹理」定稿：从**同一张图**抽屉底板的左半边（干净木面）
取一整块 150x87 的细节层，1:1 贴进右侧补丁区（原鱼牌位置）。
不缩放、不搬别张图 —— 频谱、方向、光照都天然一致。
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
    ("06-初诊-8月16日/示意-抽屉.png", False, (170, 436)),
    ("10-第三次-8月30日/示意-抽屉缝.png", True, (170, 436)),
    ("12-第四次-9月6日/示意-抽屉.png", False, (170, 436)),
]

for rel, protect, dpos in CASES:
    A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
    H, W, _ = A.shape
    m = mask_of((H, W), 15)
    if protect:
        m = m & (~paper_protect((H, W)))
    lum = A.mean(2)

    ys, xs = np.where(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    ph, pw = y1 - y0, x1 - x0

    dx, dy = dpos
    D = A[dy:dy + ph, dx:dx + pw]
    assert D.shape[:2] == (ph, pw), (D.shape, ph, pw)

    detail = D - gblur(D, 14.0)
    detail -= detail.reshape(-1, 3).mean(0)

    dl = detail.mean(2)
    gh = np.abs(np.diff((A[dy:dy + ph, dx:dx + pw]).mean(2), axis=1)).mean()
    gv = np.abs(np.diff((A[dy:dy + ph, dx:dx + pw]).mean(2), axis=0)).mean()

    # 只取亮度细节，避免叠出彩色噪点
    field = np.zeros((H, W))
    field[y0:y1, x0:x1] = dl

    alpha = np.asarray(
        Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))
    ).astype(np.float64) / 255.0

    out = np.clip(A + (field * alpha)[..., None], 0, 255)
    l2 = out.mean(2)
    b0 = (lum - gblur2(lum, 3.0))[m].std()
    b1 = (l2 - gblur2(l2, 3.0))[m].std()
    print("%-14s patch %dx%d donor(%d,%d) lum=%.1f |dh/dv|=%.2f  HFstd %.2f -> %.2f"
          % (rel.split("/")[-1][:12], pw, ph, dx, dy, lum[dy:dy + ph, dx:dx + pw].mean(),
             gh / max(gv, 1e-6), b0, b1))

    if APPLY:
        Image.fromarray(out.round().astype(np.uint8)).convert("RGBA").save(ROOT + rel)
        print("   applied")
    else:
        Image.fromarray(out.round().astype(np.uint8)).save(OUT + "h_" + rel[:2] + ".png")
