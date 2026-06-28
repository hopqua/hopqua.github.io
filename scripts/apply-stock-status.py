#!/usr/bin/env python3
"""Áp dụng stock-status.json — ẩn SP hết hàng (false) khỏi web."""
from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_JSON = ROOT / "data" / "stock-status.json"
OUT_JS = ROOT / "js" / "stock-status.js"
SHOPEE_DIR = ROOT.parent.parent / "shopee-upload-2026"


def load_out_of_stock(path: Path) -> tuple[dict[str, bool], list[str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"File không hợp lệ: {path}")
    stock: dict[str, bool] = {}
    for key, val in data.items():
        if key.startswith("_"):
            continue
        if isinstance(val, bool):
            stock[key] = val
        elif isinstance(val, dict) and "inStock" in val:
            stock[key] = bool(val["inStock"])
    hidden = sorted(sku for sku, ok in stock.items() if not ok)
    return stock, hidden


def write_stock_js(hidden: list[str]) -> None:
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    body = {
        "generated": generated,
        "hiddenCount": len(hidden),
        "hidden": hidden,
    }
    js = f"""/** AUTO-GENERATED — scripts/apply-stock-status.py ({generated}) */
const STOCK_STATUS_META = {json.dumps(body, ensure_ascii=False, indent=2)};
const OUT_OF_STOCK_IDS = new Set(STOCK_STATUS_META.hidden);

function isProductListed(product) {{
    if (!product || !product.id) return false;
    return !OUT_OF_STOCK_IDS.has(product.id);
}}

function patchProductAccess() {{
    if (typeof getAllProducts !== 'function') return;
    const origAll = getAllProducts;
    getAllProducts = function () {{
        return origAll().filter(isProductListed);
    }};
    if (typeof getProductById === 'function') {{
        const origOne = getProductById;
        getProductById = function (id) {{
            if (OUT_OF_STOCK_IDS.has(id)) return undefined;
            return origOne(id);
        }};
    }}
}}

if (typeof getAllProducts === 'function') {{
    patchProductAccess();
}} else {{
    document.addEventListener('DOMContentLoaded', patchProductAccess);
}}
"""
    OUT_JS.write_text(js, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "source",
        nargs="?",
        type=Path,
        help="stock-status.json (mặc định: data/stock-status.json hoặc ~/Downloads/stock-status.json)",
    )
    args = parser.parse_args()

    src = args.source
    if src is None:
        dl = Path.home() / "Downloads" / "stock-status.json"
        src = dl if dl.is_file() else DATA_JSON
    if not src.is_file():
        raise SystemExit(f"Không thấy: {src}")

    stock, hidden = load_out_of_stock(src)
    DATA_JSON.parent.mkdir(parents=True, exist_ok=True)
    if src.resolve() != DATA_JSON.resolve():
        shutil.copy2(src, DATA_JSON)
    if SHOPEE_DIR.is_dir():
        shutil.copy2(src, SHOPEE_DIR / "stock-status.json")

    write_stock_js(hidden)
    listed = sum(1 for ok in stock.values() if ok)
    print(f"✅ {DATA_JSON} — {listed} còn hàng, {len(hidden)} ẩn")
    print(f"✅ {OUT_JS}")
    if hidden:
        print("   Ẩn:", ", ".join(hidden[:5]) + ("…" if len(hidden) > 5 else ""))


if __name__ == "__main__":
    main()
