# -*- coding: utf-8 -*-
"""Classify character art and rebuild ID cards with CCD passport photos."""
from __future__ import annotations

import io
import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ASSETS = Path(r"C:\Users\Administrator\.cursor\projects\d-cursoe-code-game-ydkj\assets")
FIG = Path(r"D:\cursoe_code\game_ydkj\图\人物")
STILL = FIG / "剧照"
BODY = FIG / "全身"
IDPHOTO = FIG / "证件照"
IDCARD = FIG / "身份证"

W, H = 1712, 1080
INK = (28, 36, 32)
MUTED = (90, 104, 96)
TEAL = (27, 84, 74)
TEAL_DEEP = (18, 58, 52)
CARD = (236, 240, 232)
LINE = (168, 180, 172)
GOLD = (196, 168, 96)
WHITE = (255, 255, 255)
CANCEL = (168, 36, 36)

PEOPLE = [
    {"n": "01", "key": "vicky", "file": "01-章慧琪.png", "name_zh": "章慧琪", "name_en": "CHEUNG, Wai-Kei", "dob": "12-03-1988", "sex": "女  F", "symbols": "***", "reg": "12-03-2006", "job": "散工", "idno": "C 668821(3)", "place": "深水埗", "issue": "2014", "note": ["榮匯街後座租客。口頭租約。", "無擔保人。"], "id_src": "id-01-vicky.png", "body_src": "ydkj-vicky-fullbody.png"},
    {"n": "02", "key": "kimon", "file": "02-羅啟明.png", "name_zh": "羅啟明", "name_en": "LAW, Kai-Ming", "dob": "08-11-1982", "sex": "男  M", "symbols": "***", "reg": "08-11-2000", "job": "醫生", "idno": "K 441902(7)", "place": "灣仔", "issue": "2014", "note": ["日間公立醫院精神科。", "夜間澄心診所。"], "id_src": "id-02-kimon.png", "body_src": "ydkj-kimon-fullbody.png"},
    {"n": "03", "key": "howard", "file": "03-陳家豪.png", "name_zh": "陳家豪", "name_en": "CHAN, Ka-Ho", "dob": "03-01-1982", "sex": "男  M", "symbols": "***", "reg": "03-01-2000", "job": "警察", "idno": "H 390117(1)", "place": "九龍", "issue": "2014", "note": ["大學相鄰宿舍。已婚。", "深水埗警區刑事調查隊督察。"], "id_src": "id-03-howard.png", "body_src": "ydkj-howard-fullbody.png"},
    {"n": "04", "key": "vincent", "file": "04-林偉森.png", "name_zh": "林偉森", "name_en": "LAM, Wai-Sum", "dob": "19-06-1982", "sex": "男  M", "symbols": "***", "reg": "19-06-2000", "job": "保險理賠", "idno": "L 228440(6)", "place": "香港", "issue": "2014", "note": ["澄心診所常客。", "週付。"], "id_src": "id-04-vincent.png", "body_src": "ydkj-vincent-fullbody.png"},
    {"n": "05", "key": "chow", "file": "05-周錦榮.png", "name_zh": "周錦榮", "name_en": "CHOW, Kam-Wing", "dob": "08-04-1962", "sex": "男  M", "symbols": "***", "reg": "08-04-1980", "job": "業主", "idno": "A 105773(2)", "place": "深水埗", "issue": "2014", "note": ["榮匯街二十八號業權人。", "另有西貢十二鄉物業。"], "id_src": "id-05-chow.png", "body_src": "ydkj-chow-fullbody.png"},
    {"n": "06", "key": "meikuen", "file": "06-陳美娟.png", "name_zh": "陳美娟", "name_en": "CHAN, Mei-Kuen", "dob": "22-09-1980", "sex": "女  F", "symbols": "***", "reg": "22-09-1998", "job": "文職", "idno": "M 317208(8)", "place": "九龍", "issue": "2014", "note": ["章慧琪表姐。", "已婚，配偶陳家豪。"], "id_src": "id-06-meikuen.png", "body_src": "ydkj-meikuen-fullbody.png"},
    {"n": "07", "key": "fish", "file": "07-張曉魚.png", "name_zh": "張曉魚", "name_en": "CHEUNG, Hiu-Yu", "dob": "07-12-1983", "sex": "女  F", "symbols": "***", "reg": "07-12-2001", "job": "醫科學生", "idno": "Y 190664(4)", "place": "九龍", "issue": "2004", "cancelled": True, "note": ["維港醫學院。", "二零零四年冬。"], "id_src": "id-07-fish.png", "body_src": "ydkj-fish-fullbody.png"},
    {"n": "08", "key": "laifan", "file": "08-周麗芬.png", "name_zh": "周麗芬", "name_en": "CHOW, Lai-Fan", "dob": "15-05-1965", "sex": "女  F", "symbols": "***", "reg": "15-05-1983", "job": "家庭主婦", "idno": "F 882103(5)", "place": "西貢", "issue": "2012", "cancelled": True, "note": ["周錦榮配偶。", "十二鄉。"], "id_src": "id-08-laifan.png", "body_src": "ydkj-laifan-fullbody.png"},
    {"n": "09", "key": "tszhin", "file": "09-周梓軒.png", "name_zh": "周梓軒", "name_en": "CHOW, Tze-Hin", "dob": "12-03-2006", "sex": "男  M", "symbols": "*", "reg": "12-03-2006", "job": "學童", "idno": "T 006312(9)", "place": "西貢", "issue": "2012", "cancelled": True, "note": ["周錦榮、周麗芬之子。", "二零零六年生。"], "id_src": "id-09-tszhin.png", "body_src": "ydkj-tszhin-fullbody.png"},
    {"n": "10", "key": "lok", "file": "10-阿樂.png", "name_zh": "阿樂", "name_en": "LOK", "dob": "14-07-1988", "sex": "男  M", "symbols": "***", "reg": "14-07-2006", "job": "公司職員", "idno": "P 774210(0)", "place": "新界", "issue": "2014", "note": ["與章慧琪已分居。", "約三個月。"], "id_src": "id-10-lok.png", "body_src": "ydkj-lok-fullbody.png"},
]


def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


F_TITLE = font(r"C:\Windows\Fonts\msjhbd.ttc", 42)
F_TITLE_EN = font(r"C:\Windows\Fonts\times.ttf", 20)
F_NAME = font(r"C:\Windows\Fonts\msjhbd.ttc", 58)
F_NAME_EN = font(r"C:\Windows\Fonts\times.ttf", 28)
F_LAB = font(r"C:\Windows\Fonts\msjh.ttc", 20)
F_LAB_EN = font(r"C:\Windows\Fonts\times.ttf", 16)
F_VAL = font(r"C:\Windows\Fonts\msjh.ttc", 30)
F_VAL_EN = font(r"C:\Windows\Fonts\times.ttf", 24)
F_NO = font(r"C:\Windows\Fonts\tahomabd.ttf", 36)
F_SMALL = font(r"C:\Windows\Fonts\msjh.ttc", 18)


def draw_text(d, xy, text, font_obj, fill, max_w=None):
    x, y = xy
    if max_w is not None:
        size = font_obj.size
        path = font_obj.path
        while size >= 16:
            font_obj = ImageFont.truetype(path, size)
            box = d.textbbox((0, 0), text, font=font_obj)
            if box[2] - box[0] <= max_w:
                break
            size -= 2
    d.text((x, y), text, font=font_obj, fill=fill)
    return d.textbbox((x, y), text, font=font_obj)


def flower(d, cx, cy, r, color):
    for i in range(5):
        a = math.radians(-90 + i * 72)
        x = cx + int(math.cos(a) * r * 0.58)
        y = cy + int(math.sin(a) * r * 0.58)
        d.ellipse((x - r // 3, y - r // 3, x + r // 3, y + r // 3), fill=color)
    d.ellipse((cx - r // 5, cy - r // 5, cx + r // 5, cy + r // 5), fill=CARD)


def field(d, x, y, zh, en, val, max_w=420):
    d.text((x, y), zh, font=F_LAB, fill=MUTED)
    d.text((x, y + 22), en, font=F_LAB_EN, fill=(130, 140, 134))
    draw_text(d, (x, y + 48), val, F_VAL, INK, max_w=max_w)


def paper_print(im: Image.Image, seed: int = 1, aged: bool = False) -> Image.Image:
    """Official card print: lost pores, flat ink, slight cool paper. Not a colour filter."""
    import numpy as np

    rng = np.random.RandomState(seed + 17)
    im = im.convert("RGB")
    w, h = im.size

    small = im.resize((max(160, w // 2), max(210, h // 2)), Image.Resampling.BILINEAR)
    im = small.resize((w, h), Image.Resampling.BILINEAR)
    im = im.filter(ImageFilter.GaussianBlur(0.55))

    arr = np.asarray(im).astype(np.float32)
    arr[..., 0] *= 0.94
    arr[..., 1] *= 1.01
    arr[..., 2] *= 1.04
    if aged:
        arr[..., 0] *= 0.97
        arr[..., 2] *= 1.03
        arr = 12.0 + arr * 0.90
    else:
        arr = 8.0 + arr * 0.93

    grain = rng.normal(0, 5.5, arr.shape).astype(np.float32)
    arr = arr + grain

    arr = np.clip(arr, 0, 255).astype(np.uint8)
    im = Image.fromarray(arr, "RGB")
    im = ImageEnhance.Color(im).enhance(0.88)
    im = ImageEnhance.Contrast(im).enhance(0.92)
    im = ImageEnhance.Sharpness(im).enhance(0.62)

    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=48, subsampling=2)
    buf.seek(0)
    return Image.open(buf).convert("RGB")


def paste_id_photo(base, photo: Image.Image, box, seed=1, aged=False):
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    im = photo.convert("RGB")
    sw, sh = im.size
    scale = max(bw / sw, bh / sh)
    nw, nh = max(1, int(sw * scale)), max(1, int(sh * scale))
    im = im.resize((nw, nh), Image.Resampling.BILINEAR)
    cx, cy = nw // 2, int(nh * 0.46)
    im = im.crop((cx - bw // 2, cy - bh // 2, cx - bw // 2 + bw, cy - bh // 2 + bh))
    if im.size != (bw, bh):
        im = im.resize((bw, bh), Image.Resampling.BILINEAR)
    im = paper_print(im, seed=seed, aged=aged)
    base.paste(im, (x0, y0))


def make_card(card, photo: Image.Image, dest: Path) -> None:
    im = Image.new("RGB", (W, H), CARD)
    d = ImageDraw.Draw(im)
    d.rectangle((24, 24, W - 24, H - 24), outline=TEAL, width=3)
    d.rectangle((32, 32, W - 32, H - 32), outline=(196, 204, 196), width=1)
    d.rectangle((32, 32, W - 32, 128), fill=TEAL_DEEP)
    flower(d, 78, 80, 20, (210, 224, 214))
    d.text((118, 44), "香港身份證", font=F_TITLE, fill=WHITE)
    d.text((118, 90), "HONG KONG IDENTITY CARD", font=F_TITLE_EN, fill=(198, 214, 206))
    d.text((W - 320, 58), card["issue"], font=F_VAL_EN, fill=(198, 214, 206))

    photo_box = (56, 160, 456, 660)
    d.rectangle(photo_box, outline=TEAL, width=2)
    inner = (photo_box[0] + 6, photo_box[1] + 6, photo_box[2] - 6, photo_box[3] - 6)
    paste_id_photo(im, photo, inner, seed=int(card["n"]), aged=bool(card.get("cancelled")))
    d = ImageDraw.Draw(im)
    d.text((56, 676), "相片", font=F_LAB, fill=MUTED)

    d.rounded_rectangle((56, 720, 196, 808), 8, fill=GOLD, outline=(140, 112, 48))
    for i in range(3):
        d.line((72, 744 + i * 16, 180, 744 + i * 16), fill=(140, 112, 48), width=2)

    x = 500
    max_name = W - 80 - x
    d.text((x, 168), "姓名  Name", font=F_LAB, fill=MUTED)
    draw_text(d, (x, 200), card["name_zh"], F_NAME, INK, max_w=max_name)
    draw_text(d, (x, 272), card["name_en"], F_NAME_EN, TEAL_DEEP, max_w=max_name)
    d.line((x, 328, W - 64, 328), fill=LINE, width=1)
    field(d, x, 348, "出生日期", "Date of Birth", card["dob"], 300)
    field(d, x + 380, 348, "性別", "Sex", card["sex"], 200)
    field(d, x + 620, 348, "符號", "Symbols", card["symbols"], 160)
    d.line((x, 468, W - 64, 468), fill=LINE, width=1)
    field(d, x, 488, "首次登記日期", "Date of First Registration", card["reg"], 340)
    field(d, x + 500, 488, "職業", "Occupation", card["job"], 280)
    d.rectangle((x, 620, W - 64, 758), outline=LINE, width=1)
    d.rectangle((x + 18, 608, x + 88, 636), fill=CARD)
    d.text((x + 24, 610), "備註", font=F_SMALL, fill=TEAL)
    yy = 648
    for line in card["note"]:
        draw_text(d, (x + 24, yy), line, F_VAL, INK, max_w=W - 120 - x)
        yy += 44
    d.rectangle((32, 840, W - 32, 1048), fill=(226, 230, 222))
    colors = [(210, 150, 150), (210, 190, 130), (150, 190, 150), (130, 176, 200), (170, 158, 200)]
    for i, c in enumerate(colors):
        xa = 56 + int(1600 * i / 5)
        xb = 56 + int(1600 * (i + 1) / 5)
        d.rectangle((xa, 856, xb, 878), fill=c)
    d.text((56, 900), "身份證號碼  Identity Card No.", font=F_LAB, fill=MUTED)
    d.text((56, 936), card["idno"], font=F_NO, fill=INK)
    d.text((W - 420, 936), card["place"], font=F_VAL, fill=TEAL_DEEP)
    if card.get("cancelled"):
        stamp = Image.new("RGBA", (280, 92), (0, 0, 0, 0))
        sd = ImageDraw.Draw(stamp)
        sd.rectangle((6, 6, 274, 86), outline=CANCEL + (200,), width=6)
        sd.text((36, 22), "已註銷", font=F_TITLE, fill=CANCEL + (200,))
        stamp = stamp.rotate(18, expand=True, resample=Image.Resampling.BICUBIC)
        im.paste(stamp, (1180, 200), stamp)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "PNG")


def move_if(src: Path, dest: Path) -> None:
    if not src.exists() or src.resolve() == dest.resolve():
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    shutil.move(str(src), str(dest))


def copy_if(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def classify() -> None:
    for folder in (STILL, BODY, IDPHOTO, IDCARD):
        folder.mkdir(parents=True, exist_ok=True)

    for p in FIG.glob("*-photo.png"):
        move_if(p, STILL / p.name)
    for p in FIG.glob("*-editorial.png"):
        move_if(p, STILL / p.name)

    for card in PEOPLE:
        src = ASSETS / card["id_src"]
        dest = IDPHOTO / card["file"]
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        body = ASSETS / card["body_src"]
        if body.exists():
            copy_if(body, BODY / card["file"])


def rebuild_cards() -> None:
    for card in PEOPLE:
        photo = Image.open(IDPHOTO / card["file"])
        make_card(card, photo, IDCARD / card["file"])
        print("card", card["file"], flush=True)


def main() -> None:
    classify()
    rebuild_cards()
    print("ok")


if __name__ == "__main__":
    main()
