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
SEO_JSON = ROOT / "data" / "products-seo.json"

FEE_PLATFORM = 0.30
FEE_RETURN = 0.04
ROUND_STEP = 500


def _hop_qua_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "shopee-upload-2026" / "quan-tri" / "data" / "quan-tri-san-pham.json"
        if candidate.is_file():
            return parent
        candidate = parent / "shopee-upload-2026" / "quan-tri-san-pham.json"
        if candidate.is_file():
            return parent
        candidate = parent / "hop-qua" / "shopee-upload-2026" / "quan-tri" / "data" / "quan-tri-san-pham.json"
        if candidate.is_file():
            return parent / "hop-qua"
    return Path("/home/vananh/huong-dan/du-an/vo-anh/hop-qua")


def _resolve_data_file(name: str) -> Path:
    root = _hop_qua_root()
    primary = root / "shopee-upload-2026" / "quan-tri" / "data" / name
    if primary.is_file():
        return primary
    legacy = root / "shopee-upload-2026" / name
    if legacy.is_file():
        return legacy
    return primary


DEFAULT_JSON = _resolve_data_file("quan-tri-san-pham.json")
DEFAULT_CSV = _resolve_data_file("quan-tri-san-pham.csv")
GIA_LE_JSON = _resolve_data_file("gia-le-cap-nhat.json")


def fmt_vnd(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def calc_shopee_ref(direct: int) -> int:
    raw = direct * (1 + FEE_PLATFORM) * (1 + FEE_RETURN)
    return int(__import__("math").ceil(raw / ROUND_STEP) * ROUND_STEP)


def _as_int(v) -> int | None:
    if v is None or v == "":
        return None
    try:
        n = int(v)
        return n if n > 0 else None
    except (TypeError, ValueError):
        return None


def normalize_price_fields(item: dict) -> tuple[int | None, int | None]:
    """Trả về (min, max). gia_le_vnd = min (tương thích cũ)."""
    price_min = _as_int(item.get("gia_le_min_vnd")) or _as_int(item.get("gia_le_vnd"))
    price_max = _as_int(item.get("gia_le_max_vnd"))
    if price_min and price_max and price_max <= price_min:
        price_max = None
    return price_min, price_max


def build_price_label(price_min: int | None, price_max: int | None) -> str:
    if price_min and price_max and price_max > price_min:
        return f"Từ {fmt_vnd(price_min)} đến {fmt_vnd(price_max)}"
    if price_max and price_max > 0:
        return f"Từ {fmt_vnd(price_max)}/cái · SL 1–10"
    if price_min and price_min > 0:
        return f"Từ {fmt_vnd(price_min)}/cái · SL 1–10"
    return ""


def build_description(
    intro: str,
    chi_tiet: str,
    price_min: int | None,
    price_max: int | None,
    shopee: int | None,
) -> str:
    parts: list[str] = []
    if intro.strip():
        parts.append(intro.strip())
    if chi_tiet.strip():
        if parts:
            parts.append("")
        parts.append(chi_tiet.strip())
    desc = "\n".join(parts)
    retail_base = price_max if price_max and price_max > (price_min or 0) else price_min
    if not retail_base or retail_base <= 0:
        return desc

    sp = shopee or calc_shopee_ref(retail_base)
    if price_min and price_max and price_max > price_min:
        line_retail = (
            f"•Giá lẻ (1–10 cái): {fmt_vnd(price_min)} – {fmt_vnd(price_max)}/cái "
            f"— mua trực tiếp, không qua sàn TMĐT"
        )
    else:
        line_retail = (
            f"•Giá lẻ (1–10 cái): {fmt_vnd(retail_base)}/cái — mua trực tiếp, không qua sàn TMĐT"
        )
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
            gia_le = row.get("gia_le_vnd") or row.get("gia_le_min_vnd") or ""
            gia_max = row.get("gia_le_max_vnd") or ""
            gia_sp = row.get("gia_shopee_vnd") or ""
            rows.append(
                {
                    "sku": sku,
                    "ten": (row.get("ten") or "").strip(),
                    "mo_ta_ngan": (row.get("mo_ta_ngan") or "").strip(),
                    "mo_ta_chi_tiet": (row.get("mo_ta_chi_tiet") or "").strip(),
                    "gia_le_vnd": int(gia_le) if str(gia_le).strip().isdigit() else None,
                    "gia_le_max_vnd": int(gia_max) if str(gia_max).strip().isdigit() else None,
                    "gia_shopee_vnd": int(gia_sp) if str(gia_sp).strip().isdigit() else None,
                    "thumbnail": (row.get("thumbnail") or "").strip(),
                    "images": images,
                    "con_hang": str(row.get("con_hang") or "true").lower() in ("1", "true", "yes", "có", "co"),
                    "seo_title": (row.get("seo_title") or "").strip(),
                    "seo_description": (row.get("seo_description") or "").strip(),
                    "seo_keywords": (row.get("seo_keywords") or "").strip(),
                    "xoa": str(row.get("xoa") or "").lower() in ("1", "true", "yes"),
                    "folder": (row.get("folder") or "").strip(),
                    "thich": str(row.get("thich") or "").lower() in ("1", "true", "yes", "có", "co"),
                    "ngay_dang": (row.get("ngay_dang") or "").strip()[:10],
                    "thu_tu": int(row["thu_tu"]) if str(row.get("thu_tu") or "").strip().isdigit() else None,
                }
            )
    return rows


def _escape_js_str(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")


def _product_block_span(text: str, sku: str) -> tuple[int, int] | None:
    m = re.search(rf"\{{\s*\n\s*id:\s*'{re.escape(sku)}'", text)
    if not m:
        return None
    start = m.start()
    depth = 0
    for i in range(m.start(), len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return start, i + 1
    return None


def patch_field(text: str, sku: str, field: str, value: str) -> str | None:
    span = _product_block_span(text, sku)
    if not span:
        return None
    start, end = span
    block = text[start:end]
    pattern = rf"({re.escape(field)}:\s*)'((?:\\'|[^'])*)'"
    m = re.search(pattern, block)
    if not m:
        return None
    new_block = block[: m.start(2)] + _escape_js_str(value) + block[m.end(2) :]
    return text[:start] + new_block + text[end:]


def insert_posted_at(text: str, sku: str, ngay: str) -> str | None:
    """Thêm postedAt khi SP cũ trong products.js chưa có field."""
    span = _product_block_span(text, sku)
    if not span:
        return None
    start, end = span
    block = text[start:end]
    if re.search(r"postedAt:\s*'", block):
        return None
    line = f"\n        postedAt: '{_escape_js_str(ngay)}',"
    for anchor in ("category:", "season:", "videos:"):
        m = re.search(rf"(\n\s+{re.escape(anchor)})", block)
        if m:
            new_block = block[: m.start(1)] + line + block[m.start(1) :]
            return text[:start] + new_block + text[end:]
    m = re.search(r"(description:\s*'((?:\\'|[^'])*)',)", block)
    if m:
        new_block = block[: m.end(1)] + line + block[m.end(1) :]
        return text[:start] + new_block + text[end:]
    return None


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


def remove_product_block(text: str, sku: str) -> str:
    m = re.search(rf"\n(\s*)\{{[^\{{]*?id:\s*'{re.escape(sku)}'", text)
    if not m:
        return text
    start = m.start()
    idx = text.find("{", start)
    depth = 0
    for i in range(idx, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                if end < len(text) and text[end] == ",":
                    end += 1
                return text[:start] + text[end:]
    return text


def remove_manifest_entry(manifest: str, sku: str) -> str:
    pattern = rf"\n    '{re.escape(sku)}':\s*\[[\s\S]*?\],?"
    return re.sub(pattern, "", manifest, count=1)


def render_new_product_block(item: dict, price_label: str, desc: str) -> str:
    sku = item["sku"]
    folder = (item.get("folder") or sku).strip()
    thumb = (item.get("thumbnail") or f"image/{folder}/{sku}-1.jpg").strip()
    name = (item.get("ten") or sku.replace("-", " ")).strip()
    ngay = (item.get("ngay_dang") or "").strip()[:10]
    posted_line = f"\n        postedAt: '{_escape_js_str(ngay)}'," if ngay else ""
    return f"""    {{
        id: '{_escape_js_str(sku)}',
        name: '{_escape_js_str(name)}',
        folder: '{_escape_js_str(folder)}',
        thumbnail: '{_escape_js_str(thumb)}',
        price: '{_escape_js_str(price_label)}',
        description: '{_escape_js_str(desc)}',{posted_line}
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    }}"""


def append_product_block(text: str, block: str) -> str:
    marker = "\n];\n\n// Hàm lấy sản phẩm theo ID"
    insert_at = text.find(marker)
    if insert_at == -1:
        raise RuntimeError("Không tìm thấy kết thúc mảng products trong products.js")
    chunk = ",\n    // Thêm từ quan-tri-san-pham\n" + block
    return text[:insert_at] + chunk + text[insert_at:]


def _write_seo_json(items: list[dict]) -> None:
    seo_items: dict[str, dict[str, str]] = {}
    for item in items:
        if item.get("xoa"):
            continue
        sku = item["sku"]
        title = (item.get("seo_title") or "").strip()
        desc = (item.get("seo_description") or "").strip()
        kw = (item.get("seo_keywords") or "").strip()
        if title or desc or kw:
            seo_items[sku] = {
                k: v
                for k, v in (
                    ("title", title),
                    ("description", desc),
                    ("keywords", kw),
                )
                if v
            }
    payload = {
        "updated": __import__("datetime").date.today().isoformat(),
        "note": "Sinh từ quan-tri-san-pham.json — override SEO trang SP",
        "items": seo_items,
    }
    SEO_JSON.parent.mkdir(parents=True, exist_ok=True)
    SEO_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def apply_products(items: list[dict], dry_run: bool = False) -> tuple[int, list[str], int, int]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    manifest = MANIFEST_JS.read_text(encoding="utf-8") if MANIFEST_JS.is_file() else ""
    stock: dict[str, bool] = {}
    updated = 0
    added = 0
    removed = 0
    missing: list[str] = []

    active_items = [i for i in items if not i.get("xoa")]
    delete_skus = [i["sku"] for i in items if i.get("xoa")]

    for sku in delete_skus:
        if re.search(rf"id:\s*'{re.escape(sku)}'", text):
            text = remove_product_block(text, sku)
            if manifest:
                manifest = remove_manifest_entry(manifest, sku)
            removed += 1

    for item in active_items:
        sku = item["sku"]
        if re.search(rf"id:\s*'{re.escape(sku)}'", text):
            continue
        price_min, price_max = normalize_price_fields(item)
        shopee = _as_int(item.get("gia_shopee_vnd"))
        price_label = build_price_label(price_min, price_max)
        intro = item.get("mo_ta_ngan") or ""
        chi_tiet = item.get("mo_ta_chi_tiet") or ""
        desc = build_description(intro, chi_tiet, price_min, price_max, shopee)
        if not price_label:
            price_label = "Liên hệ báo giá"
        if not desc.strip():
            desc = intro or f"Mẫu hộp bánh trung thu {item.get('ten') or sku}."
        block = render_new_product_block(item, price_label, desc)
        text = append_product_block(text, block)
        thumb = (item.get("thumbnail") or "").strip()
        images = item.get("images") or []
        if isinstance(images, str):
            images = [p.strip() for p in images.replace("|", "\n").splitlines() if p.strip()]
        if images and manifest:
            if thumb and thumb in images:
                images = [thumb] + [u for u in images if u != thumb]
            elif thumb:
                images = [thumb] + images
            manifest = patch_manifest(manifest, sku, images)
        added += 1

    for item in active_items:
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

        price_min, price_max = normalize_price_fields(item)
        shopee = _as_int(item.get("gia_shopee_vnd"))

        price_label = build_price_label(price_min, price_max)
        if price_label:
            patched = patch_field(text, sku, "price", price_label)
            if patched:
                text = patched

        intro = item.get("mo_ta_ngan") or ""
        chi_tiet = item.get("mo_ta_chi_tiet") or ""
        desc = build_description(intro, chi_tiet, price_min, price_max, shopee)
        if desc:
            patched = patch_field(text, sku, "description", desc)
            if patched:
                text = patched

        ngay = (item.get("ngay_dang") or "").strip()[:10]
        if ngay:
            patched = patch_field(text, sku, "postedAt", ngay)
            if patched:
                text = patched
            else:
                inserted = insert_posted_at(text, sku, ngay)
                if inserted:
                    text = inserted

        stock[sku] = bool(item.get("con_hang", True))
        updated += 1

    changed = updated + added + removed
    if not dry_run and changed:
        PRODUCTS_JS.write_text(text, encoding="utf-8")
        if manifest and MANIFEST_JS.is_file():
            MANIFEST_JS.write_text(manifest, encoding="utf-8")
        if stock:
            STOCK_JSON.parent.mkdir(parents=True, exist_ok=True)
            STOCK_JSON.write_text(json.dumps(stock, ensure_ascii=False, indent=2), encoding="utf-8")
            out_stock = _hop_qua_root() / "shopee-upload-2026" / "stock-status.json"
            out_stock.write_text(json.dumps(stock, ensure_ascii=False, indent=2), encoding="utf-8")
        _write_gia_le_from_items(active_items)
        _write_seo_json(active_items)
        _write_home_priority(items)

    return updated, missing, added, removed


def _write_home_priority(items: list[dict]) -> None:
    """Snapshot thích / thứ tự cho trang chủ."""
    active = [i for i in items if not i.get("xoa")]
    order: list[str] = []
    meta_items: dict[str, dict] = {}
    for item in active:
        sku = item["sku"]
        order.append(sku)
        entry: dict = {}
        if item.get("thich"):
            entry["thich"] = True
            try:
                entry["thuTu"] = int(item.get("thu_tu") or 9999)
            except (TypeError, ValueError):
                entry["thuTu"] = 9999
        ngay = (item.get("ngay_dang") or "").strip()[:10]
        if ngay:
            entry["postedAt"] = ngay
        if item.get("moi"):
            entry["isNew"] = True
        meta_items[sku] = entry
    payload = {
        "version": 1,
        "updated": __import__("datetime").date.today().isoformat(),
        "note": "Thích + thứ tự trang chủ — sinh từ quan-tri-san-pham.json",
        "order": order,
        "items": meta_items,
    }
    path = ROOT / "data" / "products-home-priority.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _write_gia_le_from_items(items: list[dict]) -> None:
    prices: dict[str, int] = {}
    price_mins: dict[str, int] = {}
    shopee: dict[str, int] = {}
    for item in items:
        sku = item["sku"]
        price_min, price_max = normalize_price_fields(item)
        listing = price_max or price_min
        s = _as_int(item.get("gia_shopee_vnd"))
        if price_min:
            price_mins[sku] = price_min
        if listing:
            prices[sku] = listing
        if s:
            shopee[sku] = s
        elif listing:
            shopee[sku] = calc_shopee_ref(listing)
    if not prices:
        return
    payload = {
        "updated": __import__("datetime").date.today().isoformat(),
        "note": "Sinh từ quan-tri-san-pham.json · prices=max (hoặc đơn), price_mins=min",
        "prices": prices,
        "price_mins": price_mins,
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

    updated, missing, added, removed = apply_products(items, dry_run=args.dry_run)
    parts = [f"{'[dry-run] ' if args.dry_run else ''}✅ Cập nhật {updated} SP"]
    if added:
        parts.append(f"thêm {added}")
    if removed:
        parts.append(f"xóa {removed}")
    print(" · ".join(parts) + f" từ {source.name}")
    if missing:
        print(f"⚠️  {len(missing)} SKU không patch được: {', '.join(missing[:6])}{'…' if len(missing) > 6 else ''}")

    if not args.dry_run and (updated + added + removed):
        for script in (
            "build-products-catalog.py",
            "generate-sitemap.py",
            "build-quan-tri-san-pham.py",
        ):
            path = ROOT / "scripts" / script
            if path.is_file():
                subprocess.run([sys.executable, str(path)], check=False)


if __name__ == "__main__":
    main()
