#!/usr/bin/env python3
"""Cập nhật kích thước chuẩn trong products.js theo pack-dimension-rules.json."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pack_spec_rules import (  # noqa: E402
    classify_pack_type,
    dimension_bullet,
    packing_weight,
    upsert_spec_bullets,
)

PRODUCTS_JS = ROOT / "js" / "products.js"


def extract_intro_and_bullets(desc: str) -> tuple[str, list[str]]:
    desc = desc.strip()
    bullets: list[str] = []
    intro = desc
    if "\n\n" in desc:
        parts = desc.split("\n\n")
        intro = parts[0].strip()
        for part in parts[1:]:
            for line in part.split("\n"):
                line = line.strip()
                if line.startswith("•"):
                    bullets.append(line)
    return intro, bullets


def rebuild_description(intro: str, bullets: list[str], price_bullets: list[str]) -> str:
    spec = [b for b in bullets if re.search(r"cân nặng|kích thước", b, re.I)]
    other = [b for b in bullets if b not in spec and b not in price_bullets]
    body = intro
    all_bullets = spec + other + price_bullets
    if all_bullets:
        body += "\n\n" + "\n".join(all_bullets)
    return body


def strip_price_bullets(bullets: list[str]) -> tuple[list[str], list[str]]:
    price_keys = (
        "giá lẻ",
        "giá tham khảo",
        "sl 11",
        "sl 100",
        "trên 1.000",
    )
    kept, prices = [], []
    for b in bullets:
        low = b.lower()
        if any(k in low for k in price_keys):
            prices.append(b)
        elif re.search(r"cân nặng|kích thước|^•\s*kt\b", low):
            continue
        else:
            kept.append(b)
    return kept, prices


def js_str(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")


def main() -> None:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    updated = 0

    def repl(m: re.Match) -> str:
        nonlocal updated
        pid = m.group(1)
        name = m.group(2).replace("\\'", "'")
        desc = m.group(3).replace("\\'", "'").replace("\\n", "\n")
        pack_type = classify_pack_type(f"{pid} {name} {desc}")
        wg, wtype = packing_weight(f"{pid} {name}")
        intro, bullets = extract_intro_and_bullets(desc)
        kept, prices = strip_price_bullets(bullets)
        new_specs = upsert_spec_bullets(kept, pack_type, wg, wtype)
        new_desc = rebuild_description(intro, new_specs, prices)
        if new_desc != desc:
            updated += 1
        new_desc_js = js_str(new_desc)
        return m.group(0).replace(f"description: '{m.group(3)}'", f"description: '{new_desc_js}'", 1)

    pattern = re.compile(
        r"\{\s*id:\s*'([^']+)'[\s\S]*?name:\s*'((?:\\'|[^'])*)'[\s\S]*?"
        r"description:\s*'((?:\\'|[^'])*)'",
    )
    new_text = pattern.sub(repl, text)
    PRODUCTS_JS.write_text(new_text, encoding="utf-8")
    print(f"✅ Cập nhật kích thước {updated} sản phẩm trong products.js")


if __name__ == "__main__":
    main()
