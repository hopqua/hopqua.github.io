#!/usr/bin/env python3
"""Tạo data/products-catalog.json — catalog nhẹ cho trang chủ (lazy load)."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from pack_spec_rules import classify_pack_type, pack_size_text, packing_weight

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JS = ROOT / "js" / "products.js"
STOCK_JSON = ROOT / "data" / "stock-status.json"
IMAGE_DIR = ROOT / "image"
OUT_JSON = ROOT / "data" / "products-catalog.json"


def _hop_qua_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "shopee-upload-2026" / "quan-tri" / "data" / "gia-le-cap-nhat.json"
        if candidate.is_file():
            return parent
        candidate = parent / "shopee-upload-2026" / "gia-le-cap-nhat.json"
        if candidate.is_file():
            return parent
        candidate = parent / "hop-qua" / "shopee-upload-2026" / "quan-tri" / "data" / "gia-le-cap-nhat.json"
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


GIA_LE_JSON = _resolve_data_file("gia-le-cap-nhat.json")
ADMIN_JSON = _resolve_data_file("quan-tri-san-pham.json")
HOME_PRIORITY_JSON = ROOT / "data" / "products-home-priority.json"

PHU_KIEN_BANH_IDS = {
    "khay-trong-sz-9-10-11",
    "tui-dung-banh-trung-thu-sz-9-10-11",
    "pet-dung-banh",
    "hut-am",
    "dao-nia-mau-trang-hong-xanh-duong",
}


def norm_box_text(s: str) -> str:
    s = unicodedata.normalize("NFD", str(s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip()


def parse_field(block: str, name: str) -> str:
    m = re.search(rf"{name}:\s*'((?:\\'|[^'])*)'", block, re.DOTALL)
    if not m:
        return ""
    return m.group(1).replace("\\'", "'").replace("\\n", "\n")


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
                "folder": parse_field(block, "folder"),
                "thumbnail": parse_field(block, "thumbnail"),
                "price": parse_field(block, "price"),
                "description": parse_field(block, "description"),
                "category": parse_field(block, "category"),
                "season": parse_field(block, "season") or "trung thu",
            }
        )
    return out


def infer_price_from_slug(product: dict) -> int:
    text = f"{product['id']} {product['name']}".lower()
    k_matches = re.findall(r"(\d+)\s*[-–]?\s*(\d+)?\s*k", text)
    if k_matches:
        return int(k_matches[0][0]) * 1000
    plain = re.search(r"(\d{2,3})\s*[-–]\s*(\d{2,3})k", text)
    if plain:
        return int(plain.group(1)) * 1000
    return 30000


def fmt_vnd(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def load_gia_le_prices() -> dict[str, int]:
    """Giá lẻ chuẩn từ báo cáo Shopee (gia-le-cap-nhat.json)."""
    if not GIA_LE_JSON.is_file():
        return {}
    try:
        data = json.loads(GIA_LE_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    raw = data.get("prices") if isinstance(data, dict) else None
    if not isinstance(raw, dict):
        return {}
    out: dict[str, int] = {}
    for key, val in raw.items():
        if str(key).startswith("_"):
            continue
        try:
            n = int(val)
            if n > 0:
                out[str(key)] = n
        except (TypeError, ValueError):
            continue
    return out


def parse_price_min(product: dict) -> int:
    price_text = (product.get("price") or "").lower()
    if "liên hệ" in price_text:
        return infer_price_from_slug(product)

    single = re.search(r"Từ\s+([\d.]+)\s*đ", product.get("price") or "", re.I)
    if single:
        return int(single.group(1).replace(".", ""))

    desc = product.get("description") or ""
    desc_m = re.search(r"Giá lẻ \(1[–-]10 cái\):\s*([\d.]+)\s*đ", desc, re.I)
    if desc_m:
        return int(desc_m.group(1).replace(".", ""))

    numbers: list[int] = []
    for raw in re.findall(r"\d[\d.]*", product.get("price") or ""):
        n = int(raw.replace(".", ""))
        if n > 0:
            numbers.append(n)

    if numbers:
        min_n = min(numbers)
        has_k = "k" in price_text or bool(
            re.search(r"\d+\s*[-–]?\s*\d*\s*k", f"{product['id']} {product['name']}", re.I)
        )
        if min_n < 1000 and has_k:
            return min_n * 1000
        return min_n

    return infer_price_from_slug(product)


def get_product_tier(product: dict) -> str:
    min_p = parse_price_min(product)
    if min_p < 25000:
        return "budget"
    if min_p < 50000:
        return "mid"
    return "premium"


def get_product_box_category(product: dict) -> str:
    pid = product.get("id") or ""
    if pid in PHU_KIEN_BANH_IDS:
        return "phu-kien-banh"

    cat = product.get("category") or ""
    if cat in ("phụ kiện bánh", "phụ kiện", "Khay túi, pét đựng bánh"):
        return "phu-kien-banh"

    text = norm_box_text(f"{product.get('name', '')} {pid}")
    desc = norm_box_text(product.get("description") or "")
    blob = f"{text} {desc}"

    if re.search(r"6 banh mini|6b mini|6-banh-mini|6 mini|300g \(6 banh mini\)", blob):
        return "mini"
    if re.search(r"2 banh|hop-2-banh|2-banh|20g \(2 banh|100g \(2 banh dat\)", blob):
        return "hop-2-banh"
    if re.search(r"1 banh to|banh-to|300g|600g|180g \(1 banh to\)", blob):
        return "hop-1-banh"
    if re.search(r"150-250g|150g|250g", blob) and not re.search(r"4 banh|6 banh|4b|6b", blob):
        return "hop-1-banh"
    if re.search(r"(^|[^0-9])1 banh|hop-1-banh|1-banh|cho be|50g \(1 banh\)", blob):
        return "hop-1-banh"
    if re.search(r"4[\s-]*6 banh|4-6-banh|hop-lam-cuc", text):
        return "hop-4-banh"
    if re.search(r"6 banh|6-banh|hop-cung-6|hop-6-banh|330g \(6 banh\)", blob):
        return "hop-6-banh"
    if re.search(r"4 banh re|4b re|4-ban?h-re|250g \(4 banh re\)", blob):
        return "hop-4-banh"
    if re.search(r"4 banh|4-banh|4b-|330g \(4 banh\)", blob):
        return "hop-4-banh"

    return "hop-4-banh"


def is_product_hop_cung(product: dict) -> bool:
    if get_product_box_category(product) == "phu-kien-banh":
        return False

    text = norm_box_text(f"{product.get('name', '')} {product.get('id', '')} {product.get('folder', '')}")
    desc = norm_box_text(product.get("description") or "")
    blob = f"{text} {desc}"

    if re.search(r"hang giay mem|giay mem|hop giay mem", blob):
        return False
    return bool(re.search(r"hop[\s-]*cung|hop cung", blob))


def get_product_box_material(product: dict) -> str | None:
    if get_product_box_category(product) == "phu-kien-banh":
        return None
    return "hop-cung" if is_product_hop_cung(product) else "hop-giay-mem"


def parse_pack_weight_g(product: dict) -> int | None:
    desc = product.get("description") or ""
    m = re.search(r"Cân nặng đóng hàng:\s*(\d+)\s*g", desc, re.I)
    if m:
        return int(m.group(1))

    text = f"{product.get('id', '')} {product.get('name', '')}".lower()
    if re.search(r"4.?banh.?re|4b.?re", text):
        return 250
    if re.search(r"6.?banh|6b-mini|6x", text):
        return 330
    if re.search(r"1.?banh.*to|300.*600|180g", text):
        return 180
    if re.search(r"1.?banh|cho.?be|khay", text):
        return 50
    if re.search(r"4.?banh", text):
        return 330

    wg, _ = packing_weight(f"{product.get('id', '')} {product.get('name', '')}")
    return wg


def list_product_images(folder: str, max_images: int = 4) -> list[str]:
    folder_path = IMAGE_DIR / folder.replace("\\", "/")
    if not folder_path.is_dir():
        return []
    images: list[str] = []
    for f in sorted(folder_path.iterdir()):
        if f.suffix.lower() not in (".jpg", ".jpeg"):
            continue
        if "-thumb" in f.stem:
            continue
        images.append(f.relative_to(ROOT).as_posix())
        if len(images) >= max_images:
            break
    return images


def build_catalog_item(product: dict, gia_le: dict[str, int]) -> dict:
    label = f"{product['id']} {product['name']}"
    pack_type = classify_pack_type(label)
    pack_g = parse_pack_weight_g(product)
    pack_size = pack_size_text(pack_type)
    if not pack_size:
        m = re.search(r"Kích thước:\s*([^\n•]+)", product.get("description") or "")
        if m:
            pack_size = m.group(1).strip()

    images = list_product_images(product.get("folder") or product["id"])
    thumb = (product.get("thumbnail") or "").strip()
    if thumb:
        images = [thumb] + [u for u in images if u != thumb]
    desc = (product.get("description") or "")[:320]

    item = {
        "id": product["id"],
        "name": product["name"],
        "folder": product.get("folder") or product["id"],
        "thumbnail": product.get("thumbnail") or "",
        "price": product.get("price") or "",
        "category": product.get("category") or "",
        "season": product.get("season") or "trung thu",
        "description": desc,
        "boxType": get_product_box_category(product),
        "tier": get_product_tier(product),
    }
    box_material = get_product_box_material(product)
    if box_material:
        item["boxMaterial"] = box_material
    if pack_g:
        item["packWeightG"] = pack_g
    if pack_size:
        item["packSizeText"] = pack_size
    if len(images) >= 2:
        item["images"] = images
    pid = product["id"]
    if pid in gia_le:
        item["directRetailFmt"] = fmt_vnd(gia_le[pid])
    return item


def enrich_catalog_item(item: dict, meta: dict) -> dict:
    sku = item["id"]
    home = (meta.get("items") or {}).get(sku) or {}
    posted = home.get("postedAt") or parse_posted_from_folder(item.get("folder") or "")
    if home.get("thich"):
        item["thich"] = True
        item["thuTu"] = int(home.get("thuTu") or 9999)
    if posted:
        item["postedAt"] = posted
    if home.get("isNew") or _is_recent_posted(posted):
        item["isNew"] = True
    return item


def write_home_priority_snapshot(meta: dict) -> None:
    payload = {
        "version": 1,
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "note": "Thích + thứ tự trang chủ — sinh từ quan-tri-san-pham.json",
        "order": meta.get("order") or [],
        "items": meta.get("items") or {},
    }
    HOME_PRIORITY_JSON.parent.mkdir(parents=True, exist_ok=True)
    HOME_PRIORITY_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def parse_posted_from_folder(folder: str) -> str | None:
    if not folder:
        return None
    m = re.match(r"^(\d{1,2})-(\d{1,2})-(\d{4})/", folder.replace("\\", "/"))
    if not m:
        return None
    return f"{m.group(3)}-{m.group(2).zfill(2)}-{m.group(1).zfill(2)}"


def _posted_sort_key(iso: str | None) -> int:
    if not iso or len(iso) < 10:
        return 0
    try:
        return -int(iso.replace("-", ""))
    except ValueError:
        return 0


def _is_recent_posted(iso: str | None, within_days: int = 30) -> bool:
    if not iso or len(iso) < 10:
        return False
    try:
        posted = datetime.strptime(iso[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return False
    today = datetime.now(timezone.utc).replace(hour=12, minute=0, second=0, microsecond=0)
    diff = (today - posted).days
    return 0 <= diff <= within_days


def load_admin_home_meta() -> dict:
    """Thích / ngày đăng / thứ tự từ quan-tri-san-pham.json."""
    if not ADMIN_JSON.is_file():
        return {"order": [], "items": {}}
    try:
        data = json.loads(ADMIN_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"order": [], "items": {}}
    products = data.get("products") if isinstance(data, dict) else None
    if not isinstance(products, list):
        return {"order": [], "items": {}}
    order: list[str] = []
    items: dict[str, dict] = {}
    for p in products:
        if not isinstance(p, dict):
            continue
        sku = (p.get("sku") or "").strip()
        if not sku or p.get("xoa"):
            continue
        order.append(sku)
        entry: dict = {}
        if p.get("thich"):
            entry["thich"] = True
            try:
                entry["thuTu"] = int(p.get("thu_tu") or 9999)
            except (TypeError, ValueError):
                entry["thuTu"] = 9999
        ngay = (p.get("ngay_dang") or "").strip()
        if ngay:
            entry["postedAt"] = ngay[:10]
        if p.get("moi"):
            entry["isNew"] = True
        items[sku] = entry
    return {"order": order, "items": items}


def home_display_rank(product: dict, meta: dict) -> tuple:
    """★ thích trước; còn lại theo ngày đăng mới nhất (SP up sau lên đầu)."""
    sku = product["id"]
    item = (meta.get("items") or {}).get(sku) or {}
    thich = bool(item.get("thich"))
    thu_tu = int(item.get("thuTu") or 9999)
    posted = item.get("postedAt") or parse_posted_from_folder(product.get("folder") or "")
    order = meta.get("order") or []
    try:
        admin_idx = order.index(sku)
    except ValueError:
        admin_idx = 9999
    posted_key = _posted_sort_key(posted)
    if thich:
        return (0, thu_tu, posted_key, -admin_idx, sku)
    if posted_key:
        return (1, posted_key, -admin_idx, sku)
    return (1, 0, -admin_idx, sku)


def sort_products_for_home(products: list[dict], meta: dict) -> list[dict]:
    return sorted(products, key=lambda p: home_display_rank(p, meta))


def load_out_of_stock_ids() -> set[str]:
    if not STOCK_JSON.is_file():
        return set()
    data = json.loads(STOCK_JSON.read_text(encoding="utf-8"))
    return {k for k, v in data.items() if not k.startswith("_") and v is False}


def main() -> None:
    hidden = load_out_of_stock_ids()
    gia_le = load_gia_le_prices()
    home_meta = load_admin_home_meta()
    products = parse_products()
    if hidden:
        products = [p for p in products if p["id"] not in hidden]
    products = sort_products_for_home(products, home_meta)
    items = [enrich_catalog_item(build_catalog_item(p, gia_le), home_meta) for p in products]
    write_home_priority_snapshot(home_meta)
    payload = {
        "version": 1,
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "count": len(items),
        "products": items,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size_kb = OUT_JSON.stat().st_size / 1024
    print(f"✅ {OUT_JSON} — {len(items)} mẫu, {size_kb:.1f} KB")

    og_script = ROOT / "scripts" / "build-product-og-map.py"
    if og_script.is_file():
        subprocess.run([sys.executable, str(og_script)], check=True)
    else:
        print(f"⚠️ Bỏ qua OG map — chưa có {og_script.name}")


if __name__ == "__main__":
    main()
