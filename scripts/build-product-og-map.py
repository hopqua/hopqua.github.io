#!/usr/bin/env python3
"""Tạo js/product-og-map.js — map id → meta OG cho product.html?id= (preview link)."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JS = ROOT / "js" / "products.js"
OUT_JS = ROOT / "js" / "product-og-map.js"
SITE_ORIGIN = "https://hopqua.io.vn"


def parse_field(block: str, name: str) -> str:
    m = re.search(rf"{name}:\s*'((?:\\'|[^'])*)'", block, re.DOTALL)
    if not m:
        return ""
    return m.group(1).replace("\\'", "'").replace("\\n", "\n")


def product_intro(description: str) -> str:
    text = (description or "").strip()
    if not text:
        return ""
    first = text.split("\n\n")[0].replace("\n", " ").strip()
    return re.sub(r"\s+", " ", first)


def meta_description(name: str, description: str, price: str) -> str:
    intro = product_intro(description)
    desc = intro[:105] + ("…" if len(intro) > 105 else "")
    price_bit = f" Giá tham khảo: {price}." if price else ""
    base = f"{desc}{price_bit} Mua Shopee hoặc Zalo báo giá sỉ."
    return base[:160]


def parse_products() -> list[dict]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    out: list[dict] = []
    for block in re.split(r"\n\s*\{", text)[1:]:
        pid = re.search(r"id:\s*'([^']+)'", block)
        if not pid:
            continue
        out.append(
            {
                "id": pid.group(1),
                "name": parse_field(block, "name"),
                "thumbnail": parse_field(block, "thumbnail"),
                "price": parse_field(block, "price"),
                "description": parse_field(block, "description"),
            }
        )
    return out


def build_map(products: list[dict]) -> dict[str, dict[str, str]]:
    og: dict[str, dict[str, str]] = {}
    for p in products:
        thumb = (p.get("thumbnail") or "").lstrip("/")
        if not thumb:
            continue
        og[p["id"]] = {
            "n": p["name"],
            "t": thumb,
            "d": meta_description(p["name"], p["description"], p["price"]),
        }
    return og


def write_js(og_map: dict[str, dict[str, str]]) -> None:
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    body = json.dumps(og_map, ensure_ascii=False, separators=(",", ":"))
    content = (
        f"/* Auto-generated {generated} — scripts/build-product-og-map.py */\n"
        f"window.PRODUCT_OG_MAP = {body};\n"
        f"window.PRODUCT_OG_SITE = '{SITE_ORIGIN}';\n"
    )
    OUT_JS.write_text(content, encoding="utf-8")


def main() -> None:
    products = parse_products()
    og_map = build_map(products)
    write_js(og_map)
    size_kb = OUT_JS.stat().st_size / 1024
    print(f"✅ {OUT_JS} — {len(og_map)} sản phẩm, {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
