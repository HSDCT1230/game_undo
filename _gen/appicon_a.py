# -*- coding: utf-8 -*-
"""
全作 App 图标 · 方案 A「亮窗·夜」定稿生成器。

构图：竖长窗（旧楼气窗比例）＋ 十字窗棂，四格同亮，
暖金渐变压在深蓝黑上。四格即四人，光是同一场圈套。

工艺：全部矢量逻辑在 4096 上画，LANCZOS 降采样到各尺寸——
不是 AI 生图，所以边缘干净、可无损复刻、无隐藏水印。
转角按上一轮定案做硬（半径 0.011），系统圆角（22.4%）只在预览里套。

分层（大尺寸看得见，小尺寸自然退化成「四块金格子」）：
  底色深蓝黑竖渐变 → 窗心暖光外溢（加法）→ 框内金渐变玻璃四格
  → 暗色十字窗棂 → 窗框淡金细线 → 框与玻璃之间一道暗缝 → 本体硬圆角

配色取自 游戏/assets/style-base.css：
  --night #12151c ／ --desk #1b1f28 ／ --paper #efe6d6 ／ 暖金 say-zhou #e4c98a

用法：
  python _gen/appicon_a.py            → 全套尺寸 + SVG 源 + 场景预览
  python _gen/appicon_a.py --sheet    → 额外留一张 4096 母版
"""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "G:/code/active/lab/vibe_undo/"
OUT = ROOT + "图/品牌/App图标-a-亮窗夜/"
S = 4096                      # 超采样边长
R_CORNER = 0.011              # 图标本体圆角（占边长比例）

# ---- 几何（单位坐标 0..1）----
WIN = (0.240, 0.130, 0.760, 0.870)     # 窗框外沿
RIM = 0.014                            # 窗框金线宽
GAP = 0.005                            # 框与玻璃之间那道暗缝（大尺寸的「做工」）
INSET = RIM + GAP
GLASS = (WIN[0] + INSET, WIN[1] + INSET, WIN[2] - INSET, WIN[3] - INSET)
BAR = 0.042                            # 十字窗棂宽
CX = (WIN[0] + WIN[2]) / 2.0
CY = (WIN[1] + WIN[3]) / 2.0
PANE_R = 0.005                         # 玻璃格微圆角
GLOW_R = 0.66                          # 窗光外溢半径
GLOW_A = 0.22                          # 窗光外溢峰值

# ---- 颜色 ----
BG_TOP = (0x18, 0x1d, 0x28)
BG_BOT = (0x0a, 0x0d, 0x13)
MULL = (0x0b, 0x0e, 0x14)
RIM_C = (0xf3, 0xdf, 0xb1)
GOLD_HI = (0xfb, 0xee, 0xca)
GOLD_MID = (0xf1, 0xd6, 0x9d)
GOLD_LO = (0xd4, 0xa2, 0x5b)
GLOW_C = (0xe8, 0xbf, 0x7a)

# 四格亮度：光从左上来，右下最暗。差值很小——四格仍是「同亮」，
# 但 24px 下这点微差能让眼睛数出四个格子，不会糊成一块金。
PANE_GAIN = {(0, 0): 1.000, (1, 0): 0.968, (0, 1): 0.934, (1, 1): 0.898}


def u(v):
    return int(round(v * S))


def rounded_mask(size, box, r):
    """box=(x0,y0,x1,y1) 单位坐标，返回 L 掩膜（框外 0、框内 255）。"""
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle(
        [u(box[0]), u(box[1]), u(box[2]), u(box[3])], radius=max(0, u(r)), fill=255)
    return m


def vgrad3(size, stops):
    """多停靠点竖向渐变。stops = [(t, (r,g,b)), …]，t 升序。"""
    ts = np.array([s[0] for s in stops], np.float32)
    cs = np.array([s[1] for s in stops], np.float32)
    t = np.linspace(0.0, 1.0, size, dtype=np.float32)
    band = np.stack([np.interp(t, ts, cs[:, i]) for i in range(3)], axis=1)  # (size,3)
    arr = np.repeat(band[:, None, :], size, axis=1)                            # (size,size,3)
    return Image.fromarray(np.uint8(np.clip(arr, 0, 255)), "RGB")


def glow(size):
    """窗心向外的暖光外溢，返回 RGB 图（黑底，供加法叠加）。"""
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    xx /= size
    yy /= size
    dx = (xx - CX) / (GLOW_R * 0.90)     # 横向稍收
    dy = (yy - CY) / (GLOW_R * 1.05)     # 竖向稍放，贴合长窗
    r = np.sqrt(dx * dx + dy * dy)
    a = np.clip(1.0 - r, 0.0, 1.0) ** 2.3 * GLOW_A
    arr = np.array(GLOW_C, np.float32)[None, None, :] * a[:, :, None]
    return Image.fromarray(np.uint8(np.clip(arr, 0, 255)), "RGB")


def build():
    size = S
    base = vgrad3(size, [(0.0, BG_TOP), (0.62, (0x11, 0x14, 0x1c)), (1.0, BG_BOT)])

    # 1) 窗光外溢：加法叠加，让深蓝黑「被照亮」而不是被涂亮
    b = np.array(base, np.float32)
    b += np.array(glow(size), np.float32)
    base = Image.fromarray(np.uint8(np.clip(b, 0, 255)), "RGB")

    # 2) 玻璃：一条贯穿全窗的金渐变，按格裁切后各自乘一点亮度
    gy0, gy1 = GLASS[1], GLASS[3]
    gold = vgrad3(size, [(gy0, GOLD_HI), ((gy0 + gy1 * 2) / 3.0, GOLD_MID), (gy1, GOLD_LO)])
    ga = np.array(gold, np.float32)

    gx0, gx1 = GLASS[0], GLASS[2]
    cols = [(gx0, CX - BAR / 2), (CX + BAR / 2, gx1)]
    rows = [(gy0, CY - BAR / 2), (CY + BAR / 2, gy1)]

    for ci, (px0, px1) in enumerate(cols):
        for ri, (py0, py1) in enumerate(rows):
            gain = PANE_GAIN[(ci, ri)]
            pane = Image.fromarray(np.uint8(np.clip(ga * gain, 0, 255)), "RGB")
            base.paste(pane, (0, 0), rounded_mask(size, (px0, py0, px1, py1), PANE_R))

            # 玻璃上沿一层极淡的反光：大尺寸有玻璃厚度感，24px 下自动消失。
            # 上一版这道太亮，像按钮高光，这里压到 0.30 并收窄一半。
            hl = rounded_mask(size, (px0, py0, px1, py0 + 0.006), 0.0015)
            hl = hl.filter(ImageFilter.GaussianBlur(u(0.005)))
            base.paste(Image.new("RGB", (size, size), (0xff, 0xf7, 0xe0)), (0, 0),
                       hl.point(lambda v: int(v * 0.30)))

    # 3) 暗色十字窗棂盖在玻璃上，出来才是「窗」不是「四块砖」
    mm = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mm)
    md.rectangle([u(CX - BAR / 2), u(gy0), u(CX + BAR / 2), u(gy1)], fill=255)
    md.rectangle([u(gx0), u(CY - BAR / 2), u(gx1), u(CY + BAR / 2)], fill=255)
    base.paste(Image.new("RGB", (size, size), MULL), (0, 0), mm)

    # 4) 框与玻璃之间一道暗缝：把「框」和「玻璃」分开，大尺寸才像真窗
    gm = Image.new("L", (size, size), 0)
    ImageDraw.Draw(gm).rounded_rectangle(
        [u(GLASS[0]), u(GLASS[1]), u(GLASS[2]), u(GLASS[3])],
        radius=u(PANE_R), outline=255, width=max(1, u(GAP * 1.6)))
    base.paste(Image.new("RGB", (size, size), MULL), (0, 0), gm)

    # 5) 淡金窗框细线，贴外沿
    rm = Image.new("L", (size, size), 0)
    ImageDraw.Draw(rm).rounded_rectangle(
        [u(WIN[0]), u(WIN[1]), u(WIN[2]), u(WIN[3])],
        radius=u(0.007), outline=255, width=max(1, u(RIM)))
    base.paste(Image.new("RGB", (size, size), RIM_C), (0, 0), rm)

    # 6) 本体硬圆角
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0), rounded_mask(size, (0, 0, 1, 1), R_CORNER))
    return out


def write_sizes(master, sizes):
    for n in sizes:
        p = OUT + "icon-%d.png" % n
        master.resize((n, n), Image.LANCZOS).save(p, optimize=True)
        print("  写出", os.path.basename(p), "%dx%d" % (n, n))


def write_svg():
    """同几何的矢量源，改色改比例随时可重出。1024 视图。"""
    f = lambda v: round(v * 1024, 2)
    gx0, gy0, gx1, gy1 = GLASS
    cols = [(gx0, CX - BAR / 2), (CX + BAR / 2, gx1)]
    rows = [(gy0, CY - BAR / 2), (CY + BAR / 2, gy1)]

    panes = []
    HL_H = 0.006                      # 玻璃上沿反光带高（与 build() 一致）
    for ci, (px0, px1) in enumerate(cols):
        for ri, (py0, py1) in enumerate(rows):
            r = '%s %s %s %s %s' % (f(px0), f(py0), f(px1 - px0), f(py1 - py0), f(PANE_R))
            panes.append('    <rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="url(#gold)"/>' % tuple(r.split()))
            op = round(1.0 - PANE_GAIN[(ci, ri)], 3)
            if op > 0:
                panes.append('    <rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="#000" opacity="%s"/>'
                             % (f(px0), f(py0), f(px1 - px0), f(py1 - py0), f(PANE_R), op))
            panes.append('    <rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="url(#hl)"/>'
                         % (f(px0), f(py0), f(px1 - px0), f(HL_H), f(0.0015)))

    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <title>暗度 · 亮窗·夜</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#181d28"/>
      <stop offset="0.62" stop-color="#11141c"/>
      <stop offset="1" stop-color="#0a0d13"/>
    </linearGradient>
    <radialGradient id="glow" cx="%(cx)s" cy="%(cy)s" r="%(gr)s" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#e8bf7a" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="#e8bf7a" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#e8bf7a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="%(gy0)s" x2="0" y2="%(gy1)s" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fbeeca"/>
      <stop offset="0.5" stop-color="#f1d7a0"/>
      <stop offset="1" stop-color="#d4a25b"/>
    </linearGradient>
    <linearGradient id="hl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff7e0" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#fff7e0" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="body">
      <rect width="1024" height="1024" rx="%(rc)s"/>
    </clipPath>
  </defs>
  <g clip-path="url(#body)">
    <rect width="1024" height="1024" fill="url(#bg)"/>
    <rect width="1024" height="1024" fill="url(#glow)"/>
%(panes)s
    <rect x="%(vx)s" y="%(gy0)s" width="%(bar)s" height="%(gh)s" fill="#0b0e14"/>
    <rect x="%(gx0)s" y="%(hy)s" width="%(gw)s" height="%(bar)s" fill="#0b0e14"/>
    <rect x="%(gx0)s" y="%(gy0)s" width="%(gw)s" height="%(gh)s" rx="%(pr)s" fill="none" stroke="#0b0e14" stroke-width="%(gapw)s"/>
    <rect x="%(wx)s" y="%(wy)s" width="%(ww)s" height="%(wh)s" rx="%(wr)s" fill="none" stroke="#f3dfb1" stroke-width="%(rim)s"/>
  </g>
</svg>
""" % dict(
        cx=round(CX * 1024, 2), cy=round(CY * 1024, 2), gr=round(GLOW_R * 1024, 2),
        gy0=f(gy0), gy1=f(gy1), rc=f(R_CORNER),
        panes="\n".join(panes),
        vx=f(CX - BAR / 2), bar=f(BAR), gh=f(gy1 - gy0),
        gx0=f(gx0), hy=f(CY - BAR / 2), gw=f(gx1 - gx0),
        pr=f(PANE_R), gapw=f(GAP * 1.6),
        wx=f(WIN[0]), wy=f(WIN[1]), ww=f(WIN[2] - WIN[0]), wh=f(WIN[3] - WIN[1]),
        wr=f(0.007), rim=f(RIM),
    )
    with open(OUT + "icon.svg", "w", encoding="utf-8") as fp:
        fp.write(svg)
    print("  写出 icon.svg")


def write_preview(master):
    """场景预览：大图套 22.4% 系统圆角放桌面上，下面深底／浅底两排
    128/64/48/32/24 实际像素——专查小尺寸会不会糊、在浅底上会不会失形。"""
    W, H = 1400, 1280
    sheet = vgrad3(H, [(0.0, (0x1e, 0x24, 0x2f)), (1.0, (0x0c, 0x0e, 0x14))]).resize((W, H), Image.BICUBIC)
    sheet = sheet.convert("RGB")

    BIG = 560
    big = master.resize((BIG, BIG), Image.LANCZOS)
    rad = int(round(BIG * 0.224))
    mask = Image.new("L", (BIG, BIG), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, BIG - 1, BIG - 1], radius=rad, fill=255)
    sh = Image.new("RGBA", (BIG + 220, BIG + 220), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([110, 110, 110 + BIG, 110 + BIG], radius=rad, fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(30))
    ox, oy = W // 2 - BIG // 2, 80
    sheet.paste(sh, (ox - 110, oy - 110), sh)
    sheet.paste(big, (ox, oy), mask)

    d = ImageDraw.Draw(sheet)
    try:
        from PIL import ImageFont
        f22 = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 24)
        f18 = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 17)
    except Exception:
        f22 = f18 = ImageFont.load_default()
    d.text((W // 2, 712), "A 亮窗·夜　系统圆角 22.4%　本体圆角 1.1%", font=f22,
           fill=(0xe4, 0xc9, 0x8a), anchor="mm")

    sizes = [128, 64, 48, 32, 24]
    for row, (bgc, label, fg) in enumerate([
            ((0x16, 0x1a, 0x22), "深底", (0x8a, 0x93, 0x9b)),
            ((0xef, 0xe6, 0xd6), "浅底", (0x6f, 0x67, 0x5c))]):
        y0 = 770 + row * 240
        d.rounded_rectangle([60, y0, W - 60, y0 + 220], radius=16, fill=bgc)
        d.text((84, y0 + 16), label, font=f18, fill=fg)
        base_y = y0 + 46 + 128          # 一排图标共用底线，小尺寸不悬空
        x = 170
        for n in sizes:
            ic = master.resize((n, n), Image.LANCZOS)
            m2 = Image.new("L", (n, n), 0)
            ImageDraw.Draw(m2).rounded_rectangle([0, 0, n - 1, n - 1],
                                                 radius=int(round(n * 0.224)), fill=255)
            sheet.paste(ic, (x, base_y - n), m2)
            d.text((x + n // 2, base_y + 12), str(n), font=f18, fill=fg, anchor="ma")
            x += 235

    sheet.save(OUT + "场景预览.png", optimize=True)
    print("  写出 场景预览.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("画 4096…")
    master = build()
    if "--sheet" in sys.argv:
        master.save(OUT + "_母版-4096.png")
        print("  写出 _母版-4096.png")
    master.save(OUT + "icon-4096.png", optimize=True)
    print("  写出 icon-4096.png")
    write_sizes(master, [2048, 1024, 512, 256, 128, 64, 32, 24])
    write_svg()
    write_preview(master)
    print("完。")
