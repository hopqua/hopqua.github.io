#!/usr/bin/env python3
"""Quét 19 SP Shopee + ghép link → js/shopee-links.js"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JS = ROOT / "js" / "products.js"
OUT_JS = ROOT / "js" / "shopee-links.js"
OUT_JSON = ROOT / "data" / "shopee" / "shop_products.json"
OUT_MAP = ROOT / "data" / "shopee" / "product_mapping.json"
FETCH_ONE = Path(__file__).resolve().parent / "fetch-one-shopee-title.py"

SHOP_ID = 1307955653
ITEM_IDS = [
    28345022739, 40031646973, 40081639057, 41731641478, 42281641284,
    43781648219, 44031632972, 44512085845, 45712108022, 45812073290,
    48112038624, 49012099573, 50712056189, 51112057468, 51912066032,
    52412057658, 52612060994, 53412082834, 57362065871,
]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", (text or "").lower())
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    for pat in (r"\bcombo\b", r"\b20\d{2}\b", r"\bmau\b", r"\bhop\b", r"\bvo\b", r"\b5\s*10\b"):
        text = re.sub(pat, " ", text)
    return re.sub(r"\s+", " ", text).strip()


def tokens(text: str) -> set[str]:
    stop = {"va", "cho", "banh", "trung", "thu", "hop", "vo", "mau", "com", "the", "cao", "cap", "kem"}
    return {t for t in normalize(text).split() if len(t) > 2 and t not in stop}


def parse_products() -> list[dict]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    out = []
    for block in re.split(r"\n\s*\{", text)[1:]:
        pid = re.search(r"id:\s*'([^']+)'", block)
        if not pid:
            continue
        name = re.search(r"name:\s*'((?:\\'|[^'])*)'", block)
        desc = re.search(r"description:\s*'((?:\\'|[^'])*)'", block)
        out.append(
            {
                "id": pid.group(1),
                "name": (name.group(1) if name else "").replace("\\'", "'"),
                "description": (desc.group(1) if desc else "").replace("\\'", "'"),
            }
        )
    return out


def score(web: dict, shopee_name: str) -> float:
    w = tokens(web["name"] + " " + web["description"] + " " + web["id"].replace("-", " "))
    s = tokens(shopee_name)
    if not w or not s:
        return 0.0
    inter = w & s
    for part in web["id"].split("-"):
        if len(part) > 4 and part in normalize(shopee_name):
            inter.add(part)
    # từ khóa đặc trưng
    aliases = {
        "hoang kim": ["hoang", "kim"],
        "lien nguyet": ["lien", "nguyet"],
        "kim lien": ["kim", "lien"],
        "tho do": ["tho", "do"],
        "tho đỏ": ["tho", "do"],
        "bat giac": ["bat", "giac"],
        "song ngu": ["song", "ngu"],
        "cuc nguyet": ["cuc", "nguyet"],
        "thu hoa": ["thu", "hoa"],
    }
    nn = normalize(shopee_name)
    wn = normalize(web["name"] + " " + web["id"])
    for _key, parts in aliases.items():
        if all(p in nn for p in parts) and all(p in wn for p in parts):
            inter.update(parts)
    if not inter:
        return 0.0
    return len(inter) / max(len(s), 1)


def fetch_title(itemid: int) -> str:
    proc = subprocess.run(
        [sys.executable, str(FETCH_ONE), str(itemid)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=180,
    )
    return (proc.stdout or "").strip()


def build_mapping(products: list[dict], shopee_items: list[dict]) -> list[dict]:
    used_web: set[str] = set()
    mappings = []
    ranked = sorted(
        [it for it in shopee_items if it["name"]],
        key=lambda it: len(tokens(it["name"])),
        reverse=True,
    )
    for sp in ranked:
        best = None
        best_score = 0.32
        for web in products:
            if web["id"] in used_web:
                continue
            sc = score(web, sp["name"])
            if sc > best_score:
                best_score = sc
                best = web
        if best:
            used_web.add(best["id"])
            mappings.append(
                {
                    "productId": best["id"],
                    "shopeeUrl": sp["url"],
                    "shopeeName": sp["name"],
                    "itemid": sp["itemid"],
                    "score": round(best_score, 3),
                }
            )
    return mappings


def write_js(mappings: list[dict]) -> None:
    lines = [
        "// Link Shopee trực tiếp theo sản phẩm (shop longthibo958)",
        "// Chạy lại: python scripts/build-shopee-links.py",
        "const SHOPEE_PRODUCT_URLS = {",
    ]
    for m in sorted(mappings, key=lambda x: x["productId"]):
        lines.append(f"    '{m['productId']}': '{m['shopeeUrl']}',")
    lines.append("};")
    OUT_JS.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    shopee_items = []
    for i, iid in enumerate(ITEM_IDS, 1):
        print(f"[{i}/{len(ITEM_IDS)}] fetch {iid}...", flush=True)
        name = fetch_title(iid)
        print(f"  -> {name[:90] if name else '(empty)'}", flush=True)
        shopee_items.append(
            {
                "itemid": iid,
                "name": name,
                "url": f"https://shopee.vn/product/{SHOP_ID}/{iid}",
            }
        )

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(shopee_items, ensure_ascii=False, indent=2), encoding="utf-8")

    products = parse_products()
    mappings = build_mapping(products, shopee_items)
    unmapped = [it for it in shopee_items if it["itemid"] not in {m["itemid"] for m in mappings}]
    OUT_MAP.write_text(
        json.dumps({"mapped": mappings, "unmapped_shopee": unmapped}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_js(mappings)
    print(f"\nMapped {len(mappings)}/{len(ITEM_IDS)} -> {OUT_JS}")
    for m in mappings:
        print(f"  {m['productId']} ({m['score']})")


if __name__ == "__main__":
    main()
