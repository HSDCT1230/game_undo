# -*- coding: utf-8 -*-
"""荣汇街 28 号结构图。尺寸以呎计，墙中线，四张图同一套数。"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
F = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 22)
F_S = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 16)
F_T = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 32)
F_H = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 26)

# 平面两张用同一比例尺，房间像素尺寸一致。立面、剖面各自横竖同尺，不拉宽。
PLAN_S = 32

PAPER = (246, 241, 230)
INK = (32, 32, 32)
MUTED = (90, 86, 78)
WALL = (28, 28, 28)
HI = (240, 214, 140)
ROOM = (252, 248, 240)
STAIR = (226, 220, 208)
STORE = (236, 214, 186)
WELL = (214, 224, 214)


def font(size, bold=False):
    path = r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc"
    return ImageFont.truetype(path, size)


def text(d, xy, s, fill=INK, f=None, anchor="lt"):
    f = f or F
    x, y = xy
    lines = s.split("\n")
    if len(lines) == 1:
        d.text((x, y), s, font=f, fill=fill, anchor=anchor)
        return
    for i, line in enumerate(lines):
        d.text((x, y + i * (f.size + 6)), line, font=f, fill=fill, anchor=anchor)


def center(d, box, s, fill=INK, f=None):
    f = f or F
    x0, y0, x1, y1 = box
    lines = s.split("\n")
    heights = []
    widths = []
    for line in lines:
        b = d.textbbox((0, 0), line, font=f)
        widths.append(b[2] - b[0])
        heights.append(b[3] - b[1])
    gap = 4
    total_h = sum(heights) + gap * (len(lines) - 1)
    y = (y0 + y1 - total_h) / 2
    for line, w, h in zip(lines, widths, heights):
        d.text(((x0 + x1 - w) / 2, y), line, font=f, fill=fill)
        y += h + gap


def wall(d, box, width=7):
    d.rectangle(box, outline=WALL, width=width)


def door(d, x, y, horizontal, length=36):
    """White gap where a door breaks the wall."""
    if horizontal:
        d.line((x, y, x + length, y), fill=PAPER, width=12)
    else:
        d.line((x, y, x, y + length), fill=PAPER, width=12)


def window_on_south(d, x, y, length):
    d.line((x, y, x + length, y), fill=(70, 110, 130), width=8)
    for i in range(4):
        xx = x + 6 + i * (length / 4)
        d.line((xx, y - 8, xx, y + 8), fill=(70, 110, 130), width=2)


def window_on_west(d, x, y, length):
    d.line((x, y, x, y + length), fill=(70, 110, 130), width=8)


def save(im, name):
    path = OUT / name
    im.save(path, "PNG")
    print(name, im.size)


def scale_bar(d, x, y, px_per_ft, feet=10):
    d.line((x, y, x + feet * px_per_ft, y), fill=INK, width=3)
    d.line((x, y - 7, x, y + 7), fill=INK, width=3)
    d.line((x + feet * px_per_ft, y - 7, x + feet * px_per_ft, y + 7), fill=INK, width=3)
    text(d, (x, y + 12), f"{feet:g} 呎", f=F_S)


# 后座局部坐标：北墙 y=0（双锁门），南墙 y=22（天井）。单位呎。
# 走廊是拐角，不是 4×13 的完整矩形：窄段 4×13，入口向东加宽 4×6。
REAR = [
    ("厨房", 0, 0, 8, 7),
    ("厕所", 0, 7, 8, 6),
    ("睡房", 0, 13, 8, 9),
    ("厅", 8, 13, 8, 9),
    ("储物室", 12, 6, 4, 7),
]
FRONT = [
    ("前座厅", 0, 0, 16, 10),
    ("前座房", 0, 10, 10, 8),
    ("前座厨", 10, 10, 6, 5),
    ("前座厕", 10, 15, 6, 3),
]


def room_label(name, w, h):
    return f"{name}\n{w:g}×{h:g}"


def draw_rear(d, X, Y, font_name, font_size):
    """同一套后座矩形。X/Y 把呎换成像素。"""
    d.rectangle((X(0), Y(0), X(16), Y(22)), fill=ROOM)
    d.rectangle((X(8), Y(0), X(16), Y(6)), fill=ROOM)
    d.rectangle((X(12), Y(6), X(16), Y(13)), fill=STORE)
    d.rectangle((X(16), Y(0), X(19.5), Y(22)), fill=STAIR)
    wall(d, (X(0), Y(0), X(16), Y(22)), 8)
    wall(d, (X(16), Y(0), X(19.5), Y(22)), 6)
    for x0, y0, x1, y1 in [
        (8, 0, 8, 22),
        (0, 7, 8, 7),
        (0, 13, 8, 13),
        (8, 13, 16, 13),
        (12, 6, 12, 13),
        (12, 6, 16, 6),
    ]:
        d.line((X(x0), Y(y0), X(x1), Y(y1)), fill=WALL, width=5)
    window_on_south(d, X(1), Y(22), 5 * (X(1) - X(0)))
    window_on_south(d, X(8.6), Y(22), 4 * (X(1) - X(0)))
    window_on_west(d, X(0), Y(1.2), 4 * (Y(1) - Y(0)))
    # 双锁门、储物室南门、储物室东门
    d.line((X(8.5), Y(0), X(11.2), Y(0)), fill=PAPER, width=12)
    d.line((X(12.4), Y(13), X(15.2), Y(13)), fill=PAPER, width=12)
    d.line((X(16), Y(8.2), X(16), Y(10.8)), fill=PAPER, width=12)
    for name, x, y, w, h in REAR:
        center(d, (X(x) + 4, Y(y) + 4, X(x + w) - 4, Y(y + h) - 4), room_label(name, w, h), f=font_name)
    center(d, (X(8) + 2, Y(7), X(12) - 2, Y(12)), "走廊", f=font_size)
    center(d, (X(16) + 4, Y(0) + 8, X(19.5) - 4, Y(22) - 8), "后楼梯", f=font_size)


def plan_floor():
    S = PLAN_S
    ox, oy = 200, 180
    W, H = 1000, 1960
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    text(d, (40, 36), "四楼平面", f=F_T)
    text(d, (40, 82), "北为荣汇街。单位呎。", fill=MUTED, f=F_S)

    def X(ft):
        return ox + ft * S

    def Y(ft):
        return oy + ft * S

    d.rectangle((X(0), Y(0), X(16), Y(18)), fill=(248, 244, 232))
    d.rectangle((X(0), Y(18), X(16), Y(26)), fill=HI)
    wall(d, (X(0), Y(0), X(16), Y(48)), 8)
    for x0, y0, x1, y1 in [
        (0, 10, 16, 10),
        (10, 10, 10, 18),
        (10, 15, 16, 15),
        (0, 18, 16, 18),
        (9, 18, 9, 26),
        (0, 26, 16, 26),
    ]:
        d.line((X(x0), Y(y0), X(x1), Y(y1)), fill=WALL, width=5)
    d.line((X(11), Y(18), X(13.6), Y(18)), fill=PAPER, width=12)
    d.rectangle((X(0), Y(48), X(16), Y(50)), fill=WELL)
    center(d, (X(0), Y(48), X(16), Y(50)), "天井", fill=(40, 70, 50), f=F_S)
    text(d, (X(0), Y(-0.85)), "荣汇街", fill=MUTED, f=font(18, True))

    fn = font(16, True)
    for name, x, y, w, h in FRONT:
        center(d, (X(x) + 3, Y(y) + 3, X(x + w) - 3, Y(y + h) - 3), room_label(name, w, h), f=fn)
    center(d, (X(0) + 4, Y(18) + 4, X(9) - 4, Y(26) - 4), "楼梯\n9×8", f=fn)
    center(d, (X(9) + 4, Y(18) + 4, X(16) - 4, Y(26) - 4), "平台\n7×8", f=fn)
    draw_rear(d, X, lambda ft: Y(26 + ft), fn, fn)
    scale_bar(d, 48, H - 70, S)
    save(im, "plan-03-四楼平面.png")


def plan_rear():
    S = PLAN_S
    ox, oy = 180, 150
    W, H = 1000, 1120
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    text(d, (40, 36), "后座", f=F_T)
    text(d, (40, 84), "尺寸与四楼平面相同。北为平台，南为天井。米色房间不入租。", fill=MUTED, f=F_S)

    def X(ft):
        return ox + ft * S

    def Y(ft):
        return oy + ft * S

    d.rectangle((X(0), Y(22), X(16), Y(24)), fill=WELL)
    center(d, (X(0), Y(22), X(16), Y(24)), "天井", fill=(40, 70, 50), f=F_S)
    draw_rear(d, X, Y, font(16, True), font(16, True))
    text(d, (X(8.2), Y(-0.7)), "双锁", fill=MUTED, f=F_S)
    scale_bar(d, 48, H - 70, S)
    save(im, "plan-04-后座平面.png")


def elevation():
    """面宽 16 呎，层高 9.5 呎。横竖同一尺，楼身是窄而高的唐楼。"""
    S = 18
    W, H = 820, 1720
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    text(d, (40, 32), "荣汇街 28 号 · 临街立面", f=F_T)
    text(d, (40, 78), "面宽 16 呎，与平面同宽。横竖同一尺。", fill=MUTED, f=F_S)

    floors = [("天台", 3)] + [(f"{n} 楼", 9.5) for n in range(6, 0, -1)] + [("地下铺", 12)]
    top = 150
    left = 230
    right = left + 16 * S
    y = top
    bands = []
    for name, h in floors:
        y2 = y + h * S
        bands.append((name, y, y2))
        y = y2
    bot = y

    d.rectangle((left, top, right, bot), fill=(236, 228, 206), outline=WALL, width=4)
    d.rectangle((80, bot, W - 80, bot + 18), fill=(190, 186, 176))
    text(d, (left, bot + 26), "荣汇街  ±0", fill=MUTED, f=F_S)

    for name, y0, y1 in bands:
        if name != "天台":
            d.line((left, y1, right, y1), fill=WALL, width=2)
        text(d, (right + 14, (y0 + y1) / 2), name, fill=INK, f=F_S, anchor="lm")
        if name == "地下铺":
            d.rectangle((left + 16, y0 + 28, left + 150, y1 - 8), fill=(186, 190, 194), outline=WALL, width=3)
            text(d, ((left + 16 + left + 150) / 2, (y0 + 28 + y1 - 8) / 2), "铁闸", fill=INK, f=F_S, anchor="mm")
            d.rectangle((right - 78, y0 + 40, right - 16, y1 - 8), fill=(214, 206, 190), outline=WALL, width=3)
            text(d, ((right - 78 + right - 16) / 2, (y0 + 40 + y1 - 8) / 2), "楼梯门", fill=INK, f=font(14), anchor="mm")
        elif name.endswith("楼"):
            for k in range(2):
                wx0 = left + (2.6 + k * 6.8) * S
                wy0 = y0 + 1.7 * S
                wy1 = y1 - 1.4 * S
                d.rectangle((wx0, wy0, wx0 + 4 * S, wy1), fill=(214, 226, 230), outline=WALL, width=2)
                d.rectangle((wx0 - 3, wy0 - 3, wx0 + 4 * S + 3, wy1 + 3), outline=(80, 80, 80), width=2)
                if k == 1:
                    d.rectangle((wx0 + 2.2 * S, wy0 + 5, wx0 + 3.7 * S, wy0 + 1.2 * S), fill=(200, 204, 198), outline=WALL, width=2)
        elif name == "天台":
            d.ellipse((left + 18, y0 - 28, left + 70, y0 + 6), outline=WALL, width=3)
            d.ellipse((right - 70, y0 - 28, right - 18, y0 + 6), outline=WALL, width=3)
            text(d, ((left + right) / 2, (y0 + y1) / 2), "水箱", fill=MUTED, f=font(14), anchor="mm")

    name, y0, y1 = bands[3]
    d.rectangle((left + 3, y0 + 2, right - 3, y1 - 2), outline=(160, 110, 20), width=4)
    text(d, (left - 12, (y0 + y1) / 2), "4 楼\n周 / 章", fill=(120, 80, 10), f=font(16, True), anchor="rm")

    text(d, (40, bot + 70), "地下高 12 呎。标准层高 9 呎 6 寸 × 6。", fill=INK, f=F_S)
    text(d, (40, bot + 98), "每层两扇铁窗，是前座那 16 呎。后座窗朝天井，立面看不见。", fill=INK, f=F_S)
    scale_bar(d, 40, H - 56, S)
    save(im, "plan-01-立面.png")


def section():
    """进深 18+8+22，与四楼平面同一分段。后楼梯在东侧，不从进深里挖掉。"""
    S = 16
    W, H = 1180, 1520
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    text(d, (40, 28), "荣汇街 28 号 · 剖面", f=F_T)
    text(d, (40, 74), "从街看到天井。分段与四楼平面相同：前座 18，楼梯 8，后座 22。", fill=MUTED, f=F_S)

    names = ["6 楼", "5 楼", "4 楼", "3 楼", "2 楼", "1 楼", "地下"]
    heights = [9.5] * 6 + [12]
    top, left = 160, 200
    right = left + 48 * S
    y = top
    level_y = {}
    for name, h in zip(names, heights):
        y2 = y + h * S
        level_y[name] = (y, y2)
        y = y2
    bot = y

    y0, y1 = level_y["4 楼"]
    d.rectangle((left, y0, right, y1), fill=HI)
    d.rectangle((left, top, right, bot), outline=WALL, width=4)
    d.rectangle((right, top, right + 2 * S, bot), fill=WELL)
    text(d, (right + 4, top - 22), "天井", fill=(40, 70, 50), f=F_S)

    d.rectangle((40, bot, left, bot + 16), fill=(190, 186, 176))
    d.rectangle((right + 2 * S, bot, W - 40, bot + 16), fill=(190, 186, 176))
    text(d, (48, bot + 24), "荣汇街", fill=MUTED, f=F_S)
    text(d, (right + 2 * S, bot + 24), "后巷", fill=MUTED, f=F_S)

    x_front = left + 18 * S
    x_stair = left + 26 * S
    d.line((x_front, top, x_front, bot), fill=WALL, width=3)
    d.line((x_stair, top, x_stair, bot), fill=WALL, width=3)

    for name, (y0, y1) in level_y.items():
        d.line((left, y1, right, y1), fill=WALL, width=2)
        text(d, (left - 12, (y0 + y1) / 2), name, fill=INK, f=F_S, anchor="rm")
        if name == "地下":
            center(d, (left, y0, x_front, y1), "铺", f=F_S)
            center(d, (x_front, y0, x_stair, y1), "楼梯", f=F_S)
        elif name == "4 楼":
            center(d, (left, y0, x_front, y1), "前座 · 周\n18 呎", f=font(16, True))
            center(d, (x_front, y0, x_stair, y1), "楼梯\n8 呎", f=F_S)
            center(d, (x_stair, y0, right, y1), "后座 · 章\n22 呎", f=font(16, True))

    d.rectangle((left, top - 28, right, top), fill=(232, 226, 214), outline=WALL, width=3)
    d.ellipse((left + 24, top - 58, left + 72, top - 22), outline=WALL, width=3)
    d.ellipse((right - 80, top - 58, right - 32, top - 22), outline=WALL, width=3)
    text(d, ((left + right) / 2, top - 42), "天台  水箱", fill=MUTED, f=F_S, anchor="mm")

    text(d, (40, bot + 64), "后楼梯贴后座东侧，宽 3.5 呎，不占这 48 呎进深。", fill=INK, f=F_S)
    text(d, (40, bot + 92), "4 楼楼面距街约 40.5 呎。标准层高 9 呎 6 寸。铺高 12 呎。", fill=INK, f=F_S)
    scale_bar(d, 40, H - 56, S)
    save(im, "plan-02-剖面.png")


if __name__ == "__main__":
    elevation()
    section()
    plan_floor()
    plan_rear()
