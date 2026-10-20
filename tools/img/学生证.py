# -*- coding: utf-8 -*-
"""重製维港大学学生证（千禧年前后，2000／2001 入学）。

旧图不动，新图另存为 `图/人物/学生证/0X-中文名-重製.jpg`。
证件照用 `图/人物/证件照/` 里的原脸，按 _organize_and_ids.py 的 paper_print 思路做旧：
降采样、抬黑、暖偏、颗粒、低质 JPEG —— 不是套一层滤镜。

用法（仓库根目录）：
    python tools/img/学生证.py
    python tools/img/学生证.py --sid-lam 91024130K   改林伟森学号后重出 04
    python tools/img/学生证.py --check               只量字块，不出图

版式量自 `图/人物/学生证/02-羅啟明.jpg`：卡面 24..1130 / 44..820，
深青横条 87..205，证件照 62..428 / 219..738（横条和照片之间留 14px 米色卡面）。
右栏两列：标签墨迹右缘 668、值墨迹左缘 712，五行间距一律 44；
五行字顶 258/350/441/533/624，页脚 739，右边距 1108。
三张共用一套；改一处三张一起变，摆在一起才不露馅。

排版上有两条不能动的坑：
- 裁证件照的窗口必须夹在原图内。越界那一截 PIL 会补纯黑，做旧后就是照片顶上那条深色带。
- 值的位置要补掉首字的左 bearing（`ink_align`），否则 二〇〇〇年九月 会比其他行缩进 20 多像素。
"""
from __future__ import annotations

import argparse
import io
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
IDPHOTO = ROOT / "图" / "人物" / "证件照"
OUT = ROOT / "图" / "人物" / "学生证"

SS = 2                      # 超采样倍数，出图再降回 1152×864
W, H = 1152, 864

# —— 版式（1× 坐标）——
CARD = (24, 44, 1130, 820)
CARD_R = 28
BAND = (24, 87, 1130, 205)
PHOTO = (62, 219, 428, 738)
LABEL_X = 536
LABEL_RIGHT = 668          # 标签墨迹右缘，等于标签列
RIGHT_LIMIT = 1108
ROWS_Y = (258, 350, 441, 533, 624)      # 字顶
VALUE_X = (664, 707, 668, 669, 694)     # 逐行给，旧卡本来就不齐左
GAP_MIN = 34                            # 标签与值的最小间距
FOOTER_Y = 739
TITLE_BASE = 160
SUB_BASE = 196
MARK_BASE = 164
MARK_RIGHT = 1074

# —— 字号（1× px）——
S_TITLE, S_SUB, S_MARK = 74, 27, 52
S_LABEL, S_VALUE, S_NAME, S_LATIN, S_FOOT = 33, 36, 50, 38, 30
# 拉丁值字号比中文大 2：simsun 的字母只有 0.7em 高，同号摆一起会小一圈；再大就比中文粗
TITLE_INK_W, SUB_INK_W, MARK_INK_W = 450, 567, 116

# —— 配色（已含旧卡的暖光，不再整张盖滤镜）——
BG_HI = (214, 196, 166)
BG_LO = (194, 174, 142)
CREAM = (228, 206, 166)
BAND_TOP = (60, 74, 76)
BAND_BOT = (44, 56, 58)
BAND_INK = (231, 222, 201)
INK = (44, 43, 41)
INK_SOFT = (52, 50, 47)

F_CJK = r"C:\Windows\Fonts\simsun.ttc"
F_LAT = r"C:\Windows\Fonts\times.ttf"
F_SANS_BD = r"C:\Windows\Fonts\arialbd.ttf"

PEOPLE = [
    {
        "n": "02", "file": "02-羅啟明-重製.jpg", "photo": "02-羅啟明.png",
        "name_zh": "羅啟明", "name_en": "Kimon Law",
        "dept": "醫學院　內外全科醫學",
        "sid": "91024656E", "issue": "二〇〇〇年九月",
        "light": "flat", "seed": 21,
    },
    {
        "n": "03", "file": "03-陳家豪-重製.jpg", "photo": "03-陳家豪.png",
        "name_zh": "陳家豪", "name_en": "Howard Chan",
        "dept": "社會科學院　社會學",
        "sid": "01038472H", "issue": "二〇〇一年九月",
        "light": "sideshadow", "seed": 33,
    },
    {
        "n": "04", "file": "04-林偉森-重製.jpg", "photo": "04-林偉森.png",
        "name_zh": "林偉森", "name_en": "Wai-Sum Lam",
        "dept": "醫學院　內外全科醫學",
        "sid": "91024130K", "issue": "二〇〇〇年九月",
        "light": "flat", "seed": 47,
    },
]


# ---------------------------------------------------------------- 字体与文字

def font(path: str, size: float, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, int(round(size)), index=index)


def has_cjk(s: str) -> bool:
    return any("\u3400" <= ch <= "\u9fff" or "\uff00" <= ch <= "\uffef" for ch in s)


def ink_span(text: str, fnt, tracking: float, bold: int = 0) -> int:
    """渲染到临时画布，量真实的墨迹宽度（不是 advance 宽度）。

    中文字面的墨迹比字身窄，按 advance 排会排得比旧卡紧，所以按墨迹对。
    """
    em = fnt.size
    wid = int(em * max(1, len(text)) * 1.4) + 80 + int(abs(tracking) * max(1, len(text)))
    im = Image.new("L", (max(32, wid), int(em * 2.4)), 0)
    d = ImageDraw.Draw(im)
    x = 40
    for ch in text:
        d.text((x, em), ch, font=fnt, fill=255, anchor="ls",
               stroke_width=bold, stroke_fill=255 if bold else None)
        x += d.textlength(ch, font=fnt) + tracking
    bb = im.getbbox()
    return (bb[2] - bb[0]) if bb else 0


def fit_ink(text: str, fnt, target: int, bold: int = 0, lo: float | None = None,
            hi: float | None = None) -> float:
    """二分字距，让一行字的墨迹宽度正好落在 target（1× 像素）。"""
    em = fnt.size
    lo = -0.10 * em if lo is None else lo
    hi = 0.90 * em if hi is None else hi
    for _ in range(26):
        mid = (lo + hi) / 2
        if ink_span(text, fnt, mid, bold) < target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def draw_tracked(d: ImageDraw.ImageDraw, x: float, base: float, text: str, fnt,
                 fill, tracking: float, bold: int = 0, alpha: int = 255,
                 right: float | None = None, ink_align: bool = False,
                 right_ink: float | None = None):
    col = tuple(fill) + (alpha,)
    if ink_align and text:                      # 补掉首字的左 bearing，墨迹才真的对齐
        x -= fnt.getbbox(text[0])[0]
    if right_ink is not None and text:          # 墨迹右边缘对齐（标签列用）
        adv = [d.textlength(ch, font=fnt) for ch in text]
        head = sum(adv[:-1]) + tracking * (len(text) - 1)
        x = right_ink - head - fnt.getbbox(text[-1])[2]
    elif right is not None:                     # 右对齐：按 advance 收尾
        total = sum(d.textlength(ch, font=fnt) for ch in text) + tracking * (len(text) - 1)
        x = right - total
    for ch in text:
        d.text((x, base), ch, font=fnt, fill=col, anchor="ls",
               stroke_width=bold, stroke_fill=col if bold else None)
        x += d.textlength(ch, font=fnt) + tracking
    return x


# ---------------------------------------------------------------- 底与纸

def noise_layer(size, sigma, resample=Image.Resampling.BICUBIC):
    w, h = size
    small = (max(2, w // 8), max(2, h // 8))
    a = np.random.normal(0, 1, (small[1], small[0])).astype(np.float32)
    im = Image.fromarray(((a - a.min()) / (np.ptp(a) + 1e-6) * 255).astype(np.uint8))
    im = im.resize((w, h), resample)
    return (np.asarray(im).astype(np.float32) - 128.0) / 128.0 * sigma


def light_field(w, h, cx=0.16, cy=0.02, amp=1.05, fall=0.08):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w) - cx) ** 2 + ((yy / h) - cy) ** 2)
    return np.clip(amp - fall * r, 0.90, amp)


def background(w, h):
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    t = np.clip(0.55 * yy + 0.45 * xx, 0, 1)
    hi, lo = np.array(BG_HI, np.float32), np.array(BG_LO, np.float32)
    arr = hi * (1 - t[..., None]) + lo * t[..., None]
    arr *= light_field(w, h)[..., None]
    arr += noise_layer((w, h), 6.0)[..., None]
    arr += noise_layer((w, h), 2.2, Image.Resampling.NEAREST)[..., None]
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return im.filter(ImageFilter.GaussianBlur(0.8 * SS))


def paper(w, h, base, seed):
    rng = np.random.RandomState(seed)
    out = np.ones((h, w, 3), np.float32) * np.array(base, np.float32)
    out += (noise_layer((w, h), 6.5)
            + np.roll(noise_layer((w, h), 3.6), (seed * 13) % 90, axis=0))[..., None]
    out += rng.normal(0, 2.8, (h, w, 1)).astype(np.float32)
    return out


# ---------------------------------------------------------------- 证件照做旧

def crop_photo(path: Path, box) -> Image.Image:
    x0, y0, x1, y1 = [int(round(v * SS)) for v in box]
    bw, bh = x1 - x0, y1 - y0
    im = Image.open(path).convert("RGB")
    sw, sh = im.size
    scale = max(bw / sw, bh / sh)
    im = im.resize((max(1, int(sw * scale)), max(1, int(sh * scale))), Image.Resampling.LANCZOS)
    sw, sh = im.size
    # 缩放是按「盖满」算的，尺寸可能有零头；窗口必须夹在原图内，
    # 越界那一截 PIL 会补纯黑 —— 证件照顶上那条深色带就是这么来的。
    left = min(max(im.size[0] // 2 - bw // 2, 0), max(0, sw - bw))
    top = min(max(int(sh * 0.42) - bh // 2, 0), max(0, sh - bh))   # 眼位落在照片上四成
    return im.crop((left, top, left + bw, top + bh)).resize((bw, bh), Image.Resampling.LANCZOS)


def age_photo(im: Image.Image, seed: int, mode: str) -> Image.Image:
    """相纸打印再翻拍：没有毛孔、没有高光、整体发灰发暖。"""
    rng = np.random.RandomState(seed)
    w, h = im.size

    im = im.resize((max(2, w // 2), max(2, h // 2)), Image.Resampling.BILINEAR)
    im = im.resize((w, h), Image.Resampling.BILINEAR)
    im = im.filter(ImageFilter.GaussianBlur(1.6 * SS))
    im = ImageEnhance.Color(im).enhance(0.62)

    arr = np.asarray(im).astype(np.float32)
    arr = 52.0 + arr * 0.62                 # 抬黑、压反差：洗出来的一片
    arr[..., 2] *= 0.88                     # 暖偏
    arr[..., 1] *= 0.975
    base_mean = float(arr.mean())

    if mode == "sideshadow":
        # 侧光半遮：右半压暗、左上带一抹过曝。能认出是他，但不到证件照的清楚。
        xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        t = np.clip((xx - 0.40) / 0.34, 0, 1)
        shade = 1.0 - 0.42 * (t * t * (3 - 2 * t))          # 明暗交界落在鼻梁上
        shade = shade * (1.0 - 0.12 * np.clip((yy - 0.42) / 0.58, 0, 1))
        bloom = 1.0 + 0.08 * np.exp(-(((xx - 0.30) / 0.26) ** 2 + ((yy - 0.30) / 0.34) ** 2))
        arr = np.clip(arr * (shade * bloom)[..., None], 0, 255)
        # 光影会整张压暗，把平均亮度拉回和另外两张一条线上（三张摆一起不能一张黑）
        arr *= (base_mean / max(1e-3, float(arr.mean()))) ** 0.9
        soft = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(1.2 * SS))
        mask = np.clip((np.linspace(0, 1, w, dtype=np.float32) - 0.30) / 0.50, 0, 1)[None, :, None]
        arr = arr * (1 - mask) + np.asarray(soft).astype(np.float32) * mask

    arr += rng.normal(0, 6.0, arr.shape).astype(np.float32)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w) - 0.5) ** 2 + ((yy / h) - 0.44) ** 2)
    vig = 0.20 if mode == "sideshadow" else 0.36
    arr *= np.clip(1.05 - vig * r, 0.80, 1.05)[..., None]

    arr = np.clip(arr, 0, 255).astype(np.uint8)
    im = Image.fromarray(arr, "RGB")
    im = ImageEnhance.Contrast(im).enhance(0.84)
    im = ImageEnhance.Sharpness(im).enhance(0.50)

    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=40, subsampling=2)
    buf.seek(0)
    return Image.open(buf).convert("RGB")


# ---------------------------------------------------------------- 卡片

def rounded_mask(w, h, box, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([int(v) for v in box], int(r), fill=255)
    return m


def text_plan(draw, card) -> list[dict]:
    """算好每一行的字距与起点，先查间距再落笔。"""
    labels = ["姓名", "英文姓名", "院系", "學號", "發行日期"]
    values = [card["name_zh"], card["name_en"], card["dept"], card["sid"], card["issue"]]
    f_lab = font(F_CJK, S_LABEL * SS)
    plan = []
    for i, (lab, val) in enumerate(zip(labels, values)):
        # 标签字距固定，宽度自然长出来；值按最小间距让位，绝不压字
        tr_lab = S_LABEL * SS * 0.05
        lab_end = LABEL_X * SS + sum(draw.textlength(c, font=f_lab) for c in lab) + tr_lab * (len(lab) - 1)
        vx = 712 * SS                      # 五行值同一个左边缘，等于一列

        if i == 0:
            f_val = font(F_CJK, S_NAME * SS)
            tr_val = fit_ink(val, f_val, 148 * SS, bold=int(SS * 0.7))
            base = ROWS_Y[i] * SS + int(S_NAME * SS * 0.88)
            val_ink = S_NAME * 0.88
        elif has_cjk(val):
            f_val = font(F_CJK, S_VALUE * SS)
            tr_val = 0.0
            base = ROWS_Y[i] * SS + int(S_VALUE * SS * 0.88)
            val_ink = S_VALUE * 0.88
        else:
            f_val = font(F_LAT, S_LATIN * SS)
            tr_val = 0.0
            base = ROWS_Y[i] * SS + int(S_VALUE * SS * 0.88)   # 与中文同一基线
            val_ink = S_VALUE * 0.88      # 标签按中文行高居中，别跟拉丁字高跑偏

        # 标签与值的墨迹垂直居中（旧卡就是这么摆的，不是齐底）
        lab_ink = S_LABEL * 0.88
        lab_base = base - (val_ink - lab_ink) / 2 * SS

        val_w = (sum(draw.textlength(c, font=f_val) for c in val) + tr_val * (len(val) - 1))
        if vx + val_w > RIGHT_LIMIT * SS:
            raise SystemExit(f"[超标] {card['name_zh']} 第{i+1}行值右边缘 {int((vx+val_w)/SS)} > {RIGHT_LIMIT}")

        plan.append(dict(lab=lab, val=val, f_lab=f_lab, tr_lab=tr_lab, lab_base=lab_base,
                         f_val=f_val, tr_val=tr_val, base=base, vx=vx))
    return plan


def build(card: dict) -> Image.Image:
    w, h = W * SS, H * SS
    S = lambda v: int(round(v * SS))

    canvas = background(w, h)

    # ---- 卡片本体 + 投影
    card_box = [S(CARD[0]), S(CARD[1]), S(CARD[2]), S(CARD[3])]
    mask = rounded_mask(w, h, card_box, S(CARD_R))
    shadow = mask.filter(ImageFilter.GaussianBlur(S(9))).point(lambda v: int(v * 0.28))
    canvas = Image.composite(Image.new("RGB", (w, h), (84, 68, 44)), canvas, shadow)

    body = paper(w, h, CREAM, card["seed"])
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    body *= (1.035 - 0.070 * yy)
    edge = np.abs(np.linspace(-1, 1, h, dtype=np.float32))[:, None] ** 8
    body -= (edge * 14.0)[..., None]
    canvas.paste(Image.fromarray(np.clip(body, 0, 255).astype(np.uint8)), (0, 0), mask)
    draw = ImageDraw.Draw(canvas)

    # ---- 深青横条
    band_box = [S(BAND[0]), S(BAND[1]), S(BAND[2]), S(BAND[3])]
    band_mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(band_mask).rectangle(band_box, fill=255)
    band_mask = Image.composite(band_mask, Image.new("L", (w, h), 0), mask)

    bh = band_box[3] - band_box[1]
    g = np.linspace(0, 1, bh, dtype=np.float32)[:, None, None]
    band_arr = np.array(BAND_TOP, np.float32) * (1 - g) + np.array(BAND_BOT, np.float32) * g
    band_arr = np.repeat(band_arr, w, axis=1)
    band_arr += noise_layer((w, bh), 4.5)[..., None]
    band_arr += np.random.RandomState(card["seed"]).normal(0, 2.4, (bh, w, 1))
    band_im = Image.new("RGB", (w, h), (0, 0, 0))
    band_im.paste(Image.fromarray(np.clip(band_arr, 0, 255).astype(np.uint8)), (0, band_box[1]))
    canvas.paste(band_im, (0, 0), band_mask)
    draw = ImageDraw.Draw(canvas)

    # ---- 条内文字
    f_title = font(F_CJK, S_TITLE * SS)
    tr = fit_ink("維港大學", f_title, TITLE_INK_W * SS, bold=S(0.9))
    draw_tracked(draw, S(67), S(TITLE_BASE), "維港大學", f_title,
                 BAND_INK, tr, bold=S(0.9), alpha=238)

    f_sub = font(F_SANS_BD, S_SUB * SS)
    tr = fit_ink("VICTORIA HARBOUR UNIVERSITY", f_sub, SUB_INK_W * SS)
    draw_tracked(draw, S(60), S(SUB_BASE), "VICTORIA HARBOUR UNIVERSITY", f_sub,
                 BAND_INK, tr, bold=S(0.45), alpha=238)

    f_mark = font(F_CJK, S_MARK * SS)
    tr = fit_ink("學生證", f_mark, MARK_INK_W * SS, bold=S(0.7))
    draw_tracked(draw, 0, S(MARK_BASE), "學生證", f_mark, BAND_INK, tr,
                 bold=S(0.7), alpha=238, right=S(MARK_RIGHT))

    # ---- 证件照：薄白边、右下软影，不做成贴纸
    ph = [S(PHOTO[0]), S(PHOTO[1]), S(PHOTO[2]), S(PHOTO[3])]
    ph_im = age_photo(crop_photo(IDPHOTO / card["photo"], PHOTO), card["seed"], card["light"])
    pw, phh = ph[2] - ph[0], ph[3] - ph[1]
    ph_im = ph_im.resize((pw, phh), Image.Resampling.LANCZOS)

    # 三张是同一批冲出来的：把人脸平均亮度拉到一条线上，免得一张偏黑
    arr = np.asarray(ph_im).astype(np.float32)
    arr *= (112.0 / max(1e-3, float(arr.mean()))) ** 0.8
    ph_im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

    canvas.paste(ph_im, (ph[0], ph[1]))          # 不留框、不描边，照片直接坐在卡面上
    draw = ImageDraw.Draw(canvas)

    # ---- 右栏五行
    plan = text_plan(draw, card)
    for i, p in enumerate(plan):
        draw_tracked(draw, S(LABEL_X), p["lab_base"], p["lab"],
                     p["f_lab"], INK_SOFT, p["tr_lab"], alpha=216,
                     right_ink=S(LABEL_RIGHT))
        draw_tracked(draw, p["vx"], p["base"], p["val"], p["f_val"], INK,
                     p["tr_val"], bold=S(0.7) if i == 0 else 0, alpha=240,
                     ink_align=True)

    f_foot = font(F_CJK, S_FOOT * SS)
    draw_tracked(draw, S(LABEL_X), S(FOOTER_Y + S_FOOT * 0.88), "本證只限本人使用",
                 f_foot, INK_SOFT, 0.0, alpha=216, ink_align=True)

    # ---- 整张收光：旧卡是「拍下来的」，不是排版文件
    arr = np.asarray(canvas).astype(np.float32)
    arr *= light_field(w, h)[..., None]
    arr = 4.0 + arr * 0.945
    arr += noise_layer((w, h), 2.6, Image.Resampling.NEAREST)[..., None]
    arr += np.random.RandomState(card["seed"] + 5).normal(0, 2.2, (h, w, 1))
    canvas = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    canvas = canvas.filter(ImageFilter.GaussianBlur(0.45 * SS))
    canvas = ImageEnhance.Color(canvas).enhance(0.92)
    canvas = ImageEnhance.Contrast(canvas).enhance(0.98)

    return canvas.resize((W, H), Image.Resampling.LANCZOS)


# ---------------------------------------------------------------- 自检

def check(path: Path, card: dict) -> None:
    """量墨迹块，看有没有压字、出界。"""
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    ink = a.sum(axis=2) < 330
    light = a.sum(axis=2) > 430

    def span(m, x0, x1, y0, y1):
        s = m[y0:y1, x0:x1]
        # 细横（二、〇）只有 3 行墨，判定放宽到 1；阈值已经够黑，颗粒不会误触
        cols = np.where(s.sum(axis=0) >= 1)[0]
        rows = np.where(s.sum(axis=1) >= 1)[0]
        if not len(cols) or not len(rows):
            return None
        return (x0 + cols[0], x0 + cols[-1], y0 + rows[0], y0 + rows[-1])

    print(f"  {path.name}")
    t = span(light, 50, 780, 92, 174)
    s = span(light, 50, 700, 175, 204)
    k = span(light, 880, 1105, 100, 180)
    print(f"    标题 {t}  副标 {s}  學生證 {k}")
    if t and s and t[3] >= s[2]:
        print("    ! 标题压副标题")
    if k and k[1] > RIGHT_LIMIT:
        print("    ! 學生證出右界")
    d = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    plan = text_plan(d, card)
    for i, top in enumerate(ROWS_Y):
        vx = int(plan[i]["vx"] / SS)
        l = span(ink, 500, vx - 2, top - 8, top + 44)
        v = span(ink, vx, 1105, top - 8, top + 50)
        flag = ""
        if l and v and v[0] - l[1] < 24:
            flag = f"  ! 标签贴到值（间距 {v[0]-l[1]}）"
        if v and v[1] > RIGHT_LIMIT + 1:
            flag += "  ! 出右界"
        print(f"    行{i+1} 标签 {l}  值 {v}{flag}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sid-lam", default=None)
    ap.add_argument("--only", default=None)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    for card in PEOPLE:
        if args.only and card["n"] != args.only:
            continue
        if card["n"] == "04" and args.sid_lam:
            card["sid"] = args.sid_lam
        if args.check:
            p = OUT / card["file"]
            if p.exists():
                check(p, card)
            continue
        im = build(card)
        dest = OUT / card["file"]
        im.save(dest, "JPEG", quality=92, subsampling=0, optimize=True)
        print("ok", dest.relative_to(ROOT), f'{im.size[0]}x{im.size[1]}', flush=True)


if __name__ == "__main__":
    main()
