# -*- coding: utf-8 -*-
"""家豪的毕业照（2004 届，维港大学社会科学院）—— 墙簿「青春」相簿那一张。

底图是生成的，白边、印字、右下角那行手写名号都在这里压上去：
    · 先切掉底图最下面那条（生成器的水印在那儿，切掉比涂掉干净）
    · 按 4:3 补白边，下边留够放一行印字
    · 中间一行是相馆印的：維港大學社會科學院　二〇〇四屆畢業同學合影
    · 右下角是家豪自己用原子笔写的：陳家豪　01038472H（第 15 关那条替代线的学号就出在这里）
    · 最后整张压旧：降饱和、抬黑、暖偏、颗粒、低质 JPEG

用法（仓库根目录）：
    python tools/img/毕业照.py 底图.png
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "图" / "游戏" / "15-等他-9月7日夜" / "示意-家豪毕业照.jpg"

W, H = 1152, 864            # 与热点图同一规格
PAD_X, PAD_TOP, PAD_BOT = 18, 16, 68
INNER_W, INNER_H = W - PAD_X * 2, H - PAD_TOP - PAD_BOT   # 1116 × 780

CHOP_BOTTOM = 90            # 切掉底图最下面这一条（水印在 1097 起）
PAPER = (246, 244, 238)     # 相纸白边，不是纯白
INK = (62, 58, 52)          # 相馆印字
PEN = (44, 52, 86)          # 原子笔

F_PRINT = r"C:\Windows\Fonts\simsun.ttc"
F_PEN = r"C:\Windows\Fonts\simkai.ttf"

CAPTION = "維港大學社會科學院　二〇〇四屆畢業同學合影"
NAME_LINE = "陳家豪　01038472H"


def cover(im: Image.Image, w: int, h: int) -> Image.Image:
    """按目标比例裁到最小够用，再缩到 w×h——不拉伸脸。"""
    tw, th = w / h, im.width / im.height
    if th > tw:
        nw = int(round(im.height * tw))
        x = (im.width - nw) // 2
        im = im.crop((x, 0, x + nw, im.height))
    elif th < tw:
        nh = int(round(im.width / tw))
        y = (im.height - nh) // 2
        im = im.crop((0, y, im.width, y + nh))
    return im.resize((w, h), Image.LANCZOS)


def aged(im: Image.Image, seed: int = 7) -> Image.Image:
    """2004 年晒出来、2014 年用手机翻拍的那张：褪一点色，暗部抬起来。"""
    im = ImageEnhance.Color(im).enhance(0.86)
    im = ImageEnhance.Contrast(im).enhance(0.94)
    a = np.asarray(im).astype(np.float32)
    a = a * 0.94 + 12.0                     # 抬黑
    a[..., 0] *= 1.012                      # 暖
    a[..., 2] *= 0.982
    rng = np.random.default_rng(seed)
    grain = rng.normal(0.0, 3.1, a.shape[:2])[..., None]
    a = a + grain
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def main(src: str) -> None:
    base = Image.open(src).convert("RGB")
    base = base.crop((0, 0, base.width, max(1, base.height - CHOP_BOTTOM)))
    photo = aged(cover(base, INNER_W, INNER_H))

    sheet = Image.new("RGB", (W, H), PAPER)
    sheet.paste(photo, (PAD_X, PAD_TOP))

    d = ImageDraw.Draw(sheet)
    cap = ImageFont.truetype(F_PRINT, 21)
    tw = d.textlength(CAPTION, font=cap)
    d.text(((W - tw) / 2, PAD_TOP + INNER_H + 14), CAPTION, font=cap, fill=INK)

    # 右下角那行是他自己写的：先写在一张透明片上，歪一度半再盖上去。
    # 正着排会像相馆的另一行印字，歪一点才像笔。
    pen = ImageFont.truetype(F_PEN, 21)
    layer = Image.new("RGBA", (360, 44), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((0, 6), NAME_LINE, font=pen, fill=PEN + (255,))
    layer = layer.rotate(-1.6, resample=Image.BICUBIC, expand=False)
    nw = int(ImageDraw.Draw(layer).textlength(NAME_LINE, font=pen))
    sheet.paste(layer, (W - PAD_X - nw - 8, PAD_TOP + INNER_H + 34), layer)

    # 纸面的细颗粒：白边也要脏一点，不然像贴上去的
    a = np.asarray(sheet).astype(np.float32)
    rng = np.random.default_rng(11)
    a += rng.normal(0.0, 1.5, a.shape[:2])[..., None]
    sheet = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    sheet = sheet.filter(ImageFilter.GaussianBlur(0.25))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
    print("ok", OUT, sheet.size)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "")
