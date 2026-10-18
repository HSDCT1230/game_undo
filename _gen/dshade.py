# -*- coding: utf-8 -*-
"""
抽屉补丁第五步：抹掉鱼牌底下残留的椭圆投影。

现象：v7 的 grow=15 只够盖住鱼牌本体，投影的暗弧在 y≈530–565 留在外面，
表现为一块灰雾下面的一道暗弧。这里在外扩环带（grow 15 → 32）上再做一次调和插值：
环带内边界是已填好的补丁、外边界是干净木面，插值结果自然把暗弧抹掉，
且两头都连续，不会出现硬边。

用法：python dshade.py           → 候选到 _chk/
      python dshade.py --apply   → 写回三张图
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


def mask_of(shape, grow):
    H, W = shape
    img = Image.new("L", (W, H), 0)
    ImageDraw.Draw(img).polygon(FISH, fill=255)
    if grow > 0:
        img = img.filter(ImageFilter.MaxFilter(2 * grow + 1))
    img = img.filter(ImageFilter.MinFilter(9))
    return np.asarray(img) > 100


def paper_protect(shape, k=0.408, b=255.9, pad=6):
    H, W = shape
    yy, xx = np.mgrid[0:H, 0:W]
    return yy < (k * xx + b + pad)


def laplace_band(a, band, iters=1500, tol=0.02):
    """在 band 内解 Δu=0，边界（band 外）取原图值。"""
    out = a.copy()
    ys, xs = np.where(band)
    y0, y1 = ys.min() - 1, ys.max() + 2
    x0, x1 = xs.min() - 1, xs.max() + 2
    sub = out[y0:y1, x0:x1]
    m = band[y0:y1, x0:x1]
    inner = m[1:-1, 1:-1]
    for i in range(iters):
        avg = 0.25 * (sub[:-2, 1:-1] + sub[2:, 1:-1] + sub[1:-1, :-2] + sub[1:-1, 2:])
        nv = np.where(inner[..., None], avg, sub[1:-1, 1:-1])
        diff = np.abs(nv - sub[1:-1, 1:-1]).max()
        sub[1:-1, 1:-1] = nv
        if i % 50 == 49 and diff < tol:
            break
    out[y0:y1, x0:x1] = sub
    return out, i + 1


CASES = [
    ("06-初诊-8月16日/示意-抽屉.png", False, 32),
    ("10-第三次-8月30日/示意-抽屉缝.png", True, 32),
    ("12-第四次-9月6日/示意-抽屉.png", False, 32),
]

for rel, protect, ogrow in CASES:
    A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
    H, W, _ = A.shape
    mi = mask_of((H, W), 15)
    mo = mask_of((H, W), ogrow)
    if protect:
        pp = ~paper_protect((H, W))
        mi = mi & pp
        mo = mo & pp
    band = mo & ~mi

    # 诊断：环带内的亮度，如果存在暗弧，局部会比两侧低
    lum = A.mean(2)
    ys, xs = np.where(band)
    print("%-14s band n=%d  band lum %.1f (%.1f–%.1f)"
          % (rel.split("/")[-1][:12], band.sum(), lum[band].mean(), lum[band].min(), lum[band].max()))

    out, it = laplace_band(A, band, 2000, 0.02)
    print("   laplace iters=%d   band lum after %.1f" % (it, out.mean(2)[band].mean()))

    if APPLY:
        Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)).convert("RGBA").save(ROOT + rel)
        print("   applied")
    else:
        Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)).save(OUT + "d_" + rel[:2] + ".png")
