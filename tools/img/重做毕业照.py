# -*- coding: utf-8 -*-
"""一条命令收尾：底图 → 压边框做旧 → 同步图片版本号。

底图从哪来：见同目录 `毕业照-提示词.md` 里的提示词，生成 1536×1024 的图存到 `gen/` 下。
这个脚本只做后处理与版本号，不生成图。

用法（仓库根目录）：
    python tools/img/重做毕业照.py gen/底图.png
    python tools/img/重做毕业照.py gen/底图.png 90     # 底图底部有水印要切 90px

为什么版本号要脚本改：`图/游戏` 里图就是同名覆盖，路径不变，浏览器会一直吃旧缓存。
2026-10-23 那次「搜索框改了但截图还是老样子」就是版本号写回去了一个相同的值。
这里的版本号取 `YYYYMMDD-gradN`，同一天跑第二次自动变 grad2。
"""
from __future__ import annotations

import datetime as _dt
import importlib
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PICS = ROOT / "游戏" / "assets" / "pics.js"

sys.path.insert(0, str(HERE))
毕业照 = importlib.import_module("毕业照")


def bump_ver() -> str:
    src = PICS.read_text(encoding="utf-8")
    m = re.search(r'const PIC_VER = "([^"]*)";', src)
    if not m:
        raise SystemExit("找不到 PIC_VER，pics.js 结构变了？")
    old = m.group(1)
    today = _dt.date.today().strftime("%Y%m%d")
    n = 1
    hit = re.fullmatch(rf"{today}-grad(\d+)", old)
    if hit:
        n = int(hit.group(1)) + 1
    new = f"{today}-grad{n}"
    PICS.write_text(src.replace(f'const PIC_VER = "{old}";', f'const PIC_VER = "{new}";'),
                    encoding="utf-8")
    print(f"PIC_VER: {old} -> {new}")
    return new


def main(argv: list[str]) -> None:
    if len(argv) < 2 or not argv[1]:
        raise SystemExit(__doc__)
    base = argv[1]
    chop = int(argv[2]) if len(argv) > 2 else 0
    if not Path(base).exists():
        raise SystemExit(f"底图不存在：{base}")

    毕业照.main(base, chop)
    bump_ver()
    print("接着跑：")
    print("  python tools/全检.mjs        # 或 node tools/全检.mjs，核对图库登记")
    print("  node tools/冒烟.cjs          # 49 段")


if __name__ == "__main__":
    main(sys.argv)
