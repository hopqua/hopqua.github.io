#!/usr/bin/env python3
"""Áp quan-tri-san-pham.json / .csv → products.js, manifest, stock, giá, catalog."""
from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JS = ROOT / "js" / "products.js"
MANIFEST_JS = ROOT / "js" / "product-images-manifest.js"
STOCK_JSON = ROOT / "data" / "stock-status.json"

FEE_PLATFORM = 0.30
FEE_RETURN = 0.04
ROUND_STEP = 500


def _hop_qua_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "shopee-upload-2026" / "quan-tri-san-pham.json"
        if candidate.is_file():
            return parent
        candidate = parent / "hop-qua" / "shopee-upload-2026" / "quan-tri-san-pham.json"
        if candidate.is_file():
            return parent / "hop-qua"
    return Path("/home/vananh/huong-dan/du-an/vo-anh/hop-qua")


DEFAULT_JSON = _hop_qua_root() / "shopee-upload-2026" / "quan-tri-san-pham.json"
DEFAULT_CSV = _hop_qua_root() / "shopee-upload-2026" / "quan-tri-san-pham.csv"
GIA_LE_JSON = _hop_qua_root() / "shopee-upload-2026" / "gia-le-cap-nhat.json"


def fmt_vnd(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def calc_shopee_ref(direct: int) -> int:
    raw = direct * (1 + FEE_PLATFORM) * (1 + FEE_RETURN)
    return int(__import__("math").ceil(raw / ROUND_STEP) * ROUND_STEP)


def load_json(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    products = data.get("products") if isinstance(data, dict) else data
    if not isinstance(products, list):
        raise SystemExit("JSON phải có key 'products': [ ... ]")
    return products


def load_csv(path: Path) -> list[dict]:
    rows: list[dict] = []
    with path.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            sku = (row.get("sku") or "").strip()
            if not sku:
                continue
            images_raw = (row.get("images") or "").strip()
            images = [p.strip() for p in images_raw.replace("|", "\n").splitlines() if p.strip()]
            gia_le = row.get("gia_le_vnd") or ""
            gia_sp = row.get("gia_shopee_vnd") or ""
            rows.append(
                {
                    "sku": sku,
                    "ten": (row.get("ten") or "").strip(),
                    "mo_ta_ngan": (row.get("mo_ta_ngan") or "").strip(),
                    "mo_ta_chi_tiet": (row.get("mo_ta_chi_tiet") or "").strip(),
                    "gia_le_vnd": int(gia_le) if str(gia_le).strip().isdigit() else None,
                    "gia_shopee_vnd": int(gia_sp) if str(gia_sp).strip().isdigit() else None,
                    "thumbnail": (row.get("thumbnail") or "").strip(),
                    "images": images,
                    "con_hang": str(row.get("con_hang") or "true").lower() in ("1", "true", "yes", "có", "co"),
                }
            )
    return rows


def build_description(intro: str, chi_tiet: str, direct: int | None, shopee: int | None) -> str:
    parts: list[str] = []
    if intro.strip():
        parts.append(intro.strip())
    if chi_tiet.strip():
        if parts:
            parts.append("")
        parts.append(chi_tiet.strip())
    desc = "\n".join(parts)
    if direct and direct > 0:
        sp = shopee or calc_shopee_ref(direct)
        line_retail = f"•Giá lẻ (1–10 cái): {fmt_vnd(direct)}/cái — mua trực tiếp, không qua sàn TMĐT"
        line_shopee = f"•Giá tham khảo mua qua Shopee: {fmt_vnd(sp)}/cái (tính theo mức cao nhất)"
        if re.search(r"Giá lẻ \(1[–-]10 cái\):", desc, re.I):
            desc = re.sub(r"•?Giá lẻ \(1[–-]10 cái\):[^\n]*", line_retail, desc, count=1, flags=re.I)
        else:
            desc = desc.rstrip() + ("\n\n" if desc else "") + line_retail
        if re.search(r"Giá tham khảo mua qua Shopee:", desc, re.I):
            desc = re.sub(r"•?Giá tham khảo mua qua Shopee:[^\n]*", line_shopee, desc, count=1, flags=re.I)
        else:
            desc = desc.rstrip() + "\n" + line_shopee
    return desc


def _escape_js_str(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")


def patch_field(text: str, sku: str, field: str, value: str) -> str | None:
    pattern = (
        rf"(id:\s*'{re.escape(sku)}'[\s\S]*?"
        rf"{re.escape(field)}:\s*)'((?:\\'|[^'])*)'"
    )
    m = re.search(pattern, text)
    if not m:
        return None
    return text[: m.start(2)] + _escape_js_str(value) + text[m.end(2) :]


def patch_manifest(manifest_text: str, sku: str, images: list[str]) -> str:
    if not images:
        return manifest_text
    lines = ",\n".join(f'            "{img}"' for img in images)
    block = f"    '{sku}': [\n{lines}\n    ]"
    pattern = rf"    '{re.escape(sku)}':\s*\[[\s\S]*?\]"
    if re.search(pattern, manifest_text):
        return re.sub(pattern, block, manifest_text, count=1)
    insert_at = manifest_text.rfind("};")
    if insert_at < 0:
        return manifest_text
    prefix = manifest_text[:insert_at].rstrip()
    if not prefix.endswith(","):
        prefix += ","
    return prefix + "\n" + block + ",\n" + manifest_text[insert_at:]


def apply_products(items: list[dict], dry_run: bool = False) -> tuple[int, list[str]]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    manifest = MANIFEST_JS.read_text(encoding="utf-8") if MANIFEST_JS.is_file() else ""
    stock: dict[str, bool] = {}
    updated = 0
    missing: list[str] = []

    for item in items:
        sku = item["sku"]
        if not re.search(rf"id:\s*'{re.escape(sku)}'", text):
            missing.append(sku)
            continue

        ten = item.get("ten") or ""
        if ten:
            patched = patch_field(text, sku, "name", ten)
            if patched:
                text = patched

        thumb = (item.get("thumbnail") or "").strip()
        images = item.get("images") or []
        if isinstance(images, str):
            images = [p.strip() for p in images.replace("|", "\n").splitlines() if p.strip()]
        if thumb:
            patched = patch_field(text, sku, "thumbnail", thumb)
            if patched:
                text = patched
        if images:
            if thumb and thumb in images:
                images = [thumb] + [u for u in images if u != thumb]
            elif thumb:
                images = [thumb] + images
            manifest = patch_manifest(manifest, sku, images)

        direct = item.get("gia_le_vnd")
        shopee = item.get("gia_shopee_vnd")
        if direct:
            try:
                direct = int(direct)
            except (TypeError, ValueError):
                direct = None
        if shopee:
            try:
                shopee = int(shopee)
            except (TypeError, ValueError):
                shopee = None

        if direct and direct > 0:
            price_label = f"Từ {fmt_vnd(direct)}/cái · SL 1–10"
            patched = patch_field(text, sku, "price", price_label)
            if patched:
                text = patched

        intro = item.get("mo_ta_ngan") or ""
        chi_tiet = item.get("mo_ta_chi_tiet") or ""
        desc = build_description(intro, chi_tiet, direct, shopee)
        if desc:
            patched = patch_field(text, sku, "description", desc)
            if patched:
                text = patched

        stock[sku] = bool(item.get("con_hang", True))
        updated += 1

    if not dry_run and updated:
        PRODUCTS_JS.write_text(text, encoding="utf-8")
        if manifest and MANIFEST_JS.is_file():
            MANIFEST_JS.write_text(manifest, encoding="utf-8")
        if stock:
            STOCK_JSON.parent.mkdir(parents=True, exist_ok=True)
            STOCK_JSON.write_text(json.dumps(stock, ensure_ascii=False, indent=2), encoding="utf-8")
            out_stock = _hop_qua_root() / "shopee-upload-2026" / "stock-status.json"
            out_stock.write_text(json.dumps(stock, ensure_ascii=False, indent=2), encoding="utf-8")
        _write_gia_le_from_items(items)

    return updated, missing


def _write_gia_le_from_items(items: list[dict]) -> None:
    prices: dict[str, int] = {}
    shopee: dict[str, int] = {}
    for item in items:
        sku = item["sku"]
        d = item.get("gia_le_vnd")
        s = item.get("gia_shopee_vnd")
        if d:
            try:
                prices[sku] = int(d)
            except (TypeError, ValueError):
                pass
        if s:
            try:
                shopee[sku] = int(s)
            except (TypeError, ValueError):
                pass
        elif sku in prices:
            shopee[sku] = calc_shopee_ref(prices[sku])
    if not prices:
        return
    payload = {
        "updated": __import__("datetime").date.today().isoformat(),
        "note": "Sinh từ quan-tri-san-pham.json",
        "prices": prices,
        "shopee_prices": shopee,
    }
    GIA_LE_JSON.parent.mkdir(parents=True, exist_ok=True)
    GIA_LE_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Áp file quản trị SP lên hopqua.io.vn")
    parser.add_argument("--from", dest="source", type=Path, help="quan-tri-san-pham.json hoặc .csv")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    source = args.source or (DEFAULT_JSON if DEFAULT_JSON.is_file() else DEFAULT_CSV)
    if not source.is_file():
        raise SystemExit(
            f"Không thấy {source}\n"
            "Mở quan-tri-san-pham.html → Lưu & tải file → đặt vào shopee-upload-2026/"
        )

    items = load_csv(source) if source.suffix.lower() == ".csv" else load_json(source)
    if not items:
        raise SystemExit("Không có sản phẩm trong file")

    updated, missing = apply_products(items, dry_run=args.dry_run)
    print(f"{'[dry-run] ' if args.dry_run else ''}✅ Cập nhật {updated} SP từ {source.name}")
    if missing:
        print(f"⚠️  {len(missing)} SKU không có trong products.js: {', '.join(missing[:6])}{'…' if len(missing) > 6 else ''}")

    if not args.dry_run and updated:
        for script in ("build-products-catalog.py", "build-quan-tri-san-pham.py"):
            path = ROOT / "scripts" / script
            if path.is_file():
                subprocess.run([sys.executable, str(path)], check=False)


if __name__ == "__main__":
    main()
