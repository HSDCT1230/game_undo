# -*- coding: utf-8 -*-
"""重製维港大学学生证（千禧年前后，2000／2001 入学）。

旧图不动，新图另存为 `图/人物/学生证/0X-中文名-重製.jpg`。
证件照用 `图/人物/证件照/` 里的原脸，按 _organize_and_ids.py 的 paper_print 思路做旧：
去毛孔、压对比、暖偏、颗粒、低质 JPEG —— 不是套一层滤镜。

用法（仓库根目录）：
    python tools/img/学生证.py
    python tools/img/学生证.py --sid-lam 91024657K   补上林伟森的学号后重出林证

版式量自 `图/人物/学生证/02-羅啟明.jpg`：卡面 24..1130 / 44..820，
深青横条 87..205，证件照 62..428 / 206..724，右栏标签 x=536、值 x=660，
五行字顶 258/350/442/534/623，页脚 739。三张共用一套，改一处三张一起变。
"""
from __future__ import annotations

import argparse
import io
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
IDPHOTO = ROOT / "图" / "人物" / "证件照"
OUT = ROOT / "图" / "人物" / "学生证"

SS = 2                      # 超采样倍数，出图再降回 1152×864
W, H = 1152, 864

# —— 版式（1× 坐标，全部来自旧卡实测）——
CARD = (24, 44, 1130, 820)
CARD_R = 28
BAND = (24, 87, 1130, 205)
PHOTO = (62, 206, 428, 724)
LABEL_X, VALUE_X = 536, 660
ROWS_Y = (258, 350, 442, 534, 623)
FOOTER_Y = 739
TITLE_XY = (67, 174)        # 基线
SUB_XY = (60, 202)
MARK_XY = (1075, 169)       # 學生證，右对齐基线

# —— 配色（已含旧卡的暖光，不再整张盖滤镜）——
BG_HI = (208, 190, 158)
BG_LO = (170, 150, 118)
CREAM = (236, 216, 179)
CREAM_EDGE = (206, 184, 146)
BAND_TOP = (62, 76, 78)
BAND_BOT = (46, 58, 60)
BAND_INK = (233, 224, 203)
INK = (46, 45, 43)
INK_SOFT = (62, 60, 56)

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
        "sid": "91024130K", "issue": "二〇〇〇年九月",   # 学号由策划给定，--sid-lam 可改
        "light": "flat", "seed": 47,
    },
]


# ---------------------------------------------------------------- 字体与文字

def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, int(size), index=index)


def has_cjk(s: str) -> bool:
    return any("\u3400" <= ch <= "\u9fff" or "\uff00" <= ch <= "\uffef" for ch in s)


def tracked(d: ImageDraw.ImageDraw, xy, text, fnt, fill, tracking=0.0,
            anchor="ls", bold=0, alpha=255):
    """逐字排版，好控字距（旧卡标题和姓名都拉得很开）。"""
    fill = fill if len(fill) == 4 else fill + (alpha,)
    x, y = xy
    if anchor == "rs":                     # 右对齐：先算总宽
        total = sum(d.textlength(ch, font=fnt) for ch in text) + tracking * (len(text) - 1)
        x -= total
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill, anchor="ls",
               stroke_width=bold, stroke_fill=fill if bold else None)
        x += d.textlength(ch, font=fnt) + tracking


def fit_tracking(d, text, fnt, target_w, lo=-6.0, hi=40.0) -> float:
    """二分出字距，让一行字正好占 target_w。"""
    for _ in range(40):
        mid = (lo + hi) / 2
        w = sum(d.textlength(ch, font=fnt) for ch in text) + mid * (len(text) - 1)
        if w < target_w:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


# ---------------------------------------------------------------- 底与纸

def noise_layer(size, sigma, resample=Image.Resampling.BICUBIC):
    w, h = size
    small = (max(2, w // 8), max(2, h // 8))
    a = np.random.normal(0, 1, (small[1], small[0])).astype(np.float32)
    im = Image.fromarray(((a - a.min()) / (np.ptp(a) + 1e-6) * 255).astype(np.uint8))
    im = im.resize((w, h), resample)
    return (np.asarray(im).astype(np.float32) - 128.0) / 128.0 * sigma


def light_field(w, h, cx=0.18, cy=0.04):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w) - cx) ** 2 + ((yy / h) - cy) ** 2)
    field = 1.14 - 0.62 * r
    return np.clip(field, 0.62, 1.12)


def background(w, h):
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    t = np.clip(0.55 * yy + 0.45 * xx, 0, 1)
    hi = np.array(BG_HI, np.float32)
    lo = np.array(BG_LO, np.float32)
    arr = hi * (1 - t[..., None]) + lo * t[..., None]
    arr *= light_field(w, h)[..., None]
    arr += noise_layer((w, h), 6.0)[..., None]
    arr += noise_layer((w, h), 2.2, Image.Resampling.NEAREST)[..., None]
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    return im.filter(ImageFilter.GaussianBlur(0.8 * SS))


def paper(arr, w, h, base, seed):
    rng = np.random.RandomState(seed)
    out = np.ones((h, w, 3), np.float32) * np.array(base, np.float32)
    mottle = noise_layer((w, h), 7.0)
    mottle += np.roll(noise_layer((w, h), 4.0), (seed * 13) % 90, axis=0)
    out += mottle[..., None]
    out += rng.normal(0, 3.0, (h, w, 1)).astype(np.float32)
    return out


# ---------------------------------------------------------------- 证件照做旧

def crop_photo(path: Path, box) -> Image.Image:
    x0, y0, x1, y1 = [v * SS for v in box]
    bw, bh = x1 - x0, y1 - y0
    im = Image.open(path).convert("RGB")
    sw, sh = im.size
    scale = max(bw / sw, bh / sh)
    im = im.resize((max(1, int(sw * scale)), max(1, int(sh * scale))), Image.Resampling.LANCZOS)
    cx, cy = im.size[0] // 2, int(im.size[1] * 0.44)
    left, top = cx - bw // 2, cy - bh // 2
    im = im.crop((left, top, left + bw, top + bh))
    return im.resize((bw, bh), Image.Resampling.LANCZOS)


def age_photo(im: Image.Image, seed: int, mode: str) -> Image.Image:
    rng = np.random.RandomState(seed)
    w, h = im.size

    # 打印件没有数码锐度：降采样再放大，抹掉毛孔和发丝
    im = im.resize((max(2, w // 2), max(2, h // 2)), Image.Resampling.BILINEAR)
    im = im.resize((w, h), Image.Resampling.BILINEAR)
    im = im.filter(ImageFilter.GaussianBlur(1.35 * SS))
    im = ImageEnhance.Color(im).enhance(0.72)

    arr = np.asarray(im).astype(np.float32)
    arr = 30.0 + arr * 0.78                      # 抬黑、压高光
    arr[..., 2] *= 0.90                          # 暖偏
    arr[..., 1] *= 0.985

    if mode == "sideshadow":
        # 侧光半遮：右侧压暗、左上带一抹过曝，脸能认出但不到证件照的清楚
        xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        shade = (1.0 - 0.52 * np.clip((xx - 0.30) / 0.70, 0, 1) ** 0.85) * \
                (1.0 - 0.20 * np.clip((yy - 0.45) / 0.55, 0, 1))
        bloom = 1.0 + 0.22 * np.exp(-(((xx - 0.24) / 0.34) ** 2 + ((yy - 0.30) / 0.42) ** 2))
        arr = arr * (shade * bloom)[..., None]
        arr = np.clip(arr, 0, 255)
        # 暗侧再糊一点，留余地
        soft = Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9 * SS))
        mask = np.clip((np.linspace(0, 1, w, dtype=np.float32) - 0.42) / 0.5, 0, 1)[None, :, None]
        arr = arr * (1 - mask) + np.asarray(soft).astype(np.float32) * mask

    arr += rng.normal(0, 5.0, arr.shape).astype(np.float32)

    # 照片自身的暗角与边沿积色
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w) - 0.5) ** 2 + ((yy / h) - 0.46) ** 2)
    arr *= np.clip(1.06 - 0.42 * r, 0.7, 1.06)[..., None]

    arr = np.clip(arr, 0, 255).astype(np.uint8)
    im = Image.fromarray(arr, "RGB")
    im = ImageEnhance.Contrast(im).enhance(0.88)
    im = ImageEnhance.Sharpness(im).enhance(0.55)

    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=42, subsampling=2)     # 相纸印出来的那层糊
    buf.seek(0)
    return Image.open(buf).convert("RGB")


# ---------------------------------------------------------------- 卡片

def rounded_mask(w, h, box, r):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([v for v in box], r, fill=255)
    return m


def build(card: dict) -> Image.Image:
    w, h = W * SS, H * SS
    S = lambda v: int(round(v * SS))

    canvas = background(w, h)

    # ---- 卡片本体 + 投影
    card_box = [S(CARD[0]), S(CARD[1]), S(CARD[2]), S(CARD[3])]
    mask = rounded_mask(w, h, card_box, S(CARD_R))
    shadow = mask.filter(ImageFilter.GaussianBlur(S(9)))
    shadow = shadow.point(lambda v: int(v * 0.30))
    dark = Image.new("RGB", (w, h), (86, 70, 46))
    canvas = Image.composite(dark, canvas, shadow)

    body = paper(None, w, h, CREAM, card["seed"])
    # 卡面不是平的：上亮下暗，贴边略深
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    body *= (1.045 - 0.085 * yy)
    edge = np.abs(np.linspace(-1, 1, h, dtype=np.float32))[:, None] ** 8
    body -= (edge * 16.0)[..., None]
    body = np.clip(body, 0, 255)
    card_im = Image.fromarray(body.astype(np.uint8))
    canvas.paste(card_im, (0, 0), mask)
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
    band_arr += noise_layer((w, bh), 5.0)[..., None]
    band_arr += np.random.RandomState(card["seed"]).normal(0, 2.6, (bh, w, 1))
    band_im = Image.new("RGB", (w, h), (0, 0, 0))
    band_im.paste(Image.fromarray(np.clip(band_arr, 0, 255).astype(np.uint8)), (0, band_box[1]))
    canvas.paste(band_im, (0, 0), band_mask)
    draw = ImageDraw.Draw(canvas)

    # ---- 条内文字
    f_title = font(F_CJK, S(84))
    tr = fit_tracking(draw, "維港大學", f_title, S(450))
    tracked(draw, (S(TITLE_XY[0]), S(TITLE_XY[1])), "維港大學", f_title,
            BAND_INK, tracking=tr, bold=max(1, S(0.9)), alpha=238)

    f_sub = font(F_SANS_BD, S(33))
    tr = fit_tracking(draw, "VICTORIA HARBOUR UNIVERSITY", f_sub, S(567))
    tracked(draw, (S(SUB_XY[0]), S(SUB_XY[1])), "VICTORIA HARBOUR UNIVERSITY",
            f_sub, BAND_INK, tracking=tr, alpha=228)

    f_mark = font(F_CJK, S(54))
    tracked(draw, (S(MARK_XY[0]), S(MARK_XY[1])), "學生證", f_mark,
            BAND_INK, tracking=S(4), anchor="rs", bold=max(1, S(0.8)), alpha=236)

    # ---- 证件照
    ph = [S(PHOTO[0]), S(PHOTO[1]), S(PHOTO[2]), S(PHOTO[3])]
    ph_im = age_photo(crop_photo(IDPHOTO / card["photo"], PHOTO), card["seed"], card["light"])
    pwid, phei = ph[2] - ph[0], ph[3] - ph[1]
    ph_im = ph_im.resize((pwid, phei), Image.Resampling.LANCZOS)

    # 相纸白边 + 一道极淡的凹印阴影
    draw.rectangle([ph[0] - S(5), ph[1] - S(5), ph[2] + S(5), ph[3] + S(5)],
                   fill=(226, 208, 172))
    canvas.paste(ph_im, (ph[0], ph[1]))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle([ph[0] - S(6), ph[1] - S(6), ph[2] + S(6), ph[3] + S(6)],
                   outline=(168, 148, 112), width=max(1, S(0.9)))
    draw.line([ph[0] - S(4), ph[3] + S(6), ph[2] + S(4), ph[3] + S(6)],
              fill=(178, 158, 122), width=max(1, S(1.4)))

    # ---- 右栏五行
    f_lab = font(F_CJK, S(27))
    f_val = font(F_CJK, S(35))
    f_name = font(F_CJK, S(45))

    labels = ["姓名", "英文姓名", "院系", "學號", "發行日期"]
    values = [card["name_zh"], card["name_en"], card["dept"], card["sid"] or "", card["issue"]]
    for i, (lab, val) in enumerate(zip(labels, values)):
        y = ROWS_Y[i]
        f_l = f_lab
        tracked(draw, (S(LABEL_X), S(y + 27)), lab, f_l, INK_SOFT,
                tracking=S(5.5), alpha=205)
        if not val:
            continue
        if i == 0:
            tracked(draw, (S(VALUE_X), S(y + 44)), val, f_name, INK,
                    tracking=S(9), bold=max(1, S(0.7)), alpha=236)
        else:
            f = f_val if has_cjk(val) else font(F_LAT, S(37))
            tracked(draw, (S(VALUE_X), S(y + 34)), val, f, INK,
                    tracking=S(1.2) if has_cjk(val) else 0, alpha=232)

    f_foot = font(F_CJK, S(28))
    tracked(draw, (S(LABEL_X), S(FOOTER_Y + 29)), "本證只限本人使用", f_foot,
            INK_SOFT, tracking=S(2.0), alpha=196)

    # ---- 整张收光：旧卡是「拍下来的」，不是排版文件
    arr = np.asarray(canvas).astype(np.float32)
    arr *= light_field(w, h)[..., None]
    arr = 8.0 + arr * 0.955
    arr += noise_layer((w, h), 2.6, Image.Resampling.NEAREST)[..., None]
    arr += np.random.RandomState(card["seed"] + 5).normal(0, 2.4, (h, w, 1))
    canvas = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

    canvas = canvas.filter(ImageFilter.GaussianBlur(0.5 * SS))
    canvas = ImageEnhance.Color(canvas).enhance(0.90)
    canvas = ImageEnhance.Contrast(canvas).enhance(0.96)

    return canvas.resize((W, H), Image.Resampling.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sid-lam", default=None, help="林伟森学号；给了就重出 04")
    ap.add_argument("--only", default=None, help="只出某一张，如 02")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    for card in PEOPLE:
        if args.only and card["n"] != args.only:
            continue
        if card["n"] == "04" and args.sid_lam:
            card["sid"] = args.sid_lam
        im = build(card)
        dest = OUT / card["file"]
        im.save(dest, "JPEG", quality=92, subsampling=0, optimize=True)
        print("ok", dest.relative_to(ROOT), f'{im.size[0]}x{im.size[1]}', flush=True)


if __name__ == "__main__":
    main()
