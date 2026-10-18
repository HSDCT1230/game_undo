# -*- coding: utf-8 -*-
"""
抽屉补丁「补纹理」第二版：从**同一张图**里挑一块干净的抽屉底板木面，
只取它的细节层（A - gblur(A, 6)，去均值），羽化补进补丁区。
同图同光源 → 木纹方向、颗粒尺度天然一致，不会像借用别张图那样出现方向错位。
"""
import os
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


def paper_protect(shape, k=0.408, b=255.9, pad=6):
    H, W = shape
    yy, xx = np.mgrid[0:H, 0:W]
    return yy < (k * xx + b + pad)


CASES = [
    ("06-初诊-8月16日/示意-抽屉.png", False),
    ("10-第三次-8月30日/示意-抽屉缝.png", True),
    ("12-第四次-9月6日/示意-抽屉.png", False),
]

BW, BH = 210, 150

for rel, protect in CASES:
    A = np.asarray(Image.open(ROOT + rel).convert("RGB")).astype(np.float64)
    H, W, _ = A.shape
    m = mask_of((H, W), 15)
    if protect:
        m = m & (~paper_protect((H, W)))
    lum = A.mean(2)

    # 掩膜外扩（禁止取样区压到补丁或它的羽化边）
    big = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41))
    forbid = np.asarray(big) > 0

    lo = gblur2(lum, 7.0)
    gy, gx = np.gradient(lo)
    grad = np.hypot(gx, gy)

    best = None
    for y0 in range(300, H - BH - 20, 15):
        for x0 in range(120, 430, 15):
            if forbid[y0:y0 + BH, x0:x0 + BW].any():
                continue
            win = lum[y0:y0 + BH, x0:x0 + BW]
            # 只接受木底：不够亮（黑边）、太亮（白纸）都跳过
            if win.mean() < 55 or win.mean() > 175:
                continue
            score = grad[y0:y0 + BH, x0:x0 + BW].mean()
            if best is None or score < best[0]:
                best = (score, x0, y0)
    if best is None:
        print("!! 找不到干净木块", rel)
        continue
    score, x0, y0 = best
    print("%-14s donor block (%d,%d)  grad=%.2f  mean=%.1f"
          % (rel.split("/")[-1][:12], x0, y0, score, lum[y0:y0 + BH, x0:x0 + BW].mean()))

    D = A[y0:y0 + BH, x0:x0 + BW]
    detail = D - gblur(D, 6.0)
    detail -= detail.reshape(-1, 3).mean(0)

    # 目标：把补丁区的细节能量补到与掩膜外木面相当
    ring = mask_of((H, W), 15 + 55) & (~mask_of((H, W), 15))
    ring_wood = ring & (lum > 55) & (lum < 200)

    cur = lum - gblur2(lum, 6.0)
    tgt = cur[ring_wood].std()
    have = cur[m].std()
    need = max(0.0, tgt ** 2 - have ** 2) ** 0.5

    ys, xs = np.where(m)
    cy, cx = int(ys.mean()), int(xs.mean())
    ph, pw = BH, BW
    # 把木块中心对到补丁中心
    oy = cy - ph // 2
    ox = cx - pw // 2
    patch = np.zeros((H, W, 3), np.float64)
    ay0, ay1 = max(0, oy), min(H, oy + ph)
    ax0, ax1 = max(0, ox), min(W, ox + pw)
    patch[ay0:ay1, ax0:ax1] = detail[ay0 - oy:ay1 - oy, ax0 - ox:ax1 - ox]
    patch_l = patch.mean(2)
    sc = need / max(1e-6, patch_l[m].std())
    print("   tgt=%.2f have=%.2f need=%.2f  scale=%.2f" % (tgt, have, need, sc))

    alpha = np.asarray(
        Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))
    ).astype(np.float64) / 255.0

    out = np.clip(A + (patch * sc) * alpha[..., None], 0, 255)
    l2 = out.mean(2)
    h2 = l2 - gblur2(l2, 6.0)
    print("   after HF std %.2f" % h2[m].std())

    name = "s_" + os.path.basename(os.path.dirname(ROOT + rel))[:2]
    Image.fromarray(out.round().astype(np.uint8)).save(OUT + name + ".png")
    print("   ->", OUT + name + ".png")
