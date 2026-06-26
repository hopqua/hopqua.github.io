#!/usr/bin/env python3
"""Điền shopee_item_id sau khi đăng Shopee → cập nhật js/shopee-links.js (+ mapping JSON)."""
from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_JS = ROOT / "js" / "shopee-links.js"
OUT_MAP = ROOT / "data" / "shopee" / "product_mapping.json"
SHOP_ID = 1307955653


def _hop_qua_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "Shopee_mass_upload_71sp.xlsx").is_file():
            return parent
        if (parent / "hop-qua" / "Shopee_mass_upload_71sp.xlsx").is_file():
            return parent / "hop-qua"
    return Path("/home/vananh/huong-dan/du-an/vo-anh/hop-qua")


DEFAULT_CSV = _hop_qua_root() / "shopee-upload-2026" / "shopee-item-ids.csv"


def read_existing_js() -> dict[str, str]:
    if not OUT_JS.is_file():
        return {}
    text = OUT_JS.read_text(encoding="utf-8")
    return dict(re.findall(r"'([^']+)':\s*'(https://shopee\.vn/product/\d+/\d+)'", text))


def load_csv(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            rows.append(row)
    return rows


def item_url(item_id: str) -> str:
    return f"https://shopee.vn/product/{SHOP_ID}/{item_id.strip()}"


def write_js(urls: dict[str, str]) -> None:
    lines = [
        "// Link Shopee trực tiếp theo sản phẩm (shop longthibo958)",
        "// Cập nhật: python scripts/apply-shopee-item-ids.py",
        "const SHOPEE_PRODUCT_URLS = {",
    ]
    for pid in sorted(urls):
        lines.append(f"    '{pid}': '{urls[pid]}',")
    lines.append("};")
    lines.append("")
    OUT_JS.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    args = parser.parse_args()
    if not args.csv.is_file():
        raise SystemExit(f"Không thấy CSV: {args.csv}")

    urls = read_existing_js()
    added = 0
    mappings = []

    for row in load_csv(args.csv):
        web_id = (row.get("web_id") or row.get("sku") or "").strip()
        item_id = (row.get("shopee_item_id") or "").strip()
        shopee_url = (row.get("shopee_url") or "").strip()
        if not web_id:
            continue
        if item_id and not shopee_url:
            shopee_url = item_url(item_id)
        if shopee_url and "shopee.vn/product/" in shopee_url:
            urls[web_id] = shopee_url
            added += 1
            mappings.append(
                {
                    "productId": web_id,
                    "shopeeUrl": shopee_url,
                    "shopeeName": (row.get("ten_shopee") or "").strip(),
                    "itemid": int(shopee_url.rstrip("/").split("/")[-1]),
                }
            )

    write_js(urls)
    OUT_MAP.parent.mkdir(parents=True, exist_ok=True)
    OUT_MAP.write_text(
        json.dumps({"mapped": mappings, "source": str(args.csv)}, ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )
    print(f"✅ {len(urls)} link trong {OUT_JS} ({added} từ CSV)")
    print("   Commit & push website để link Shopee hiển thị trên hopqua.github.io")


if __name__ == "__main__":
    main()
