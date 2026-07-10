#!/usr/bin/env python3
"""Sinh quan-tri-san-pham.html + JSON/CSV — bảng quản trị SP cho hopqua.io.vn."""
from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JS = ROOT / "js" / "products.js"
MANIFEST_JS = ROOT / "js" / "product-images-manifest.js"
SITE = "https://hopqua.io.vn"


def _hop_qua_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "shopee-upload-2026"
        if candidate.is_dir():
            return parent
        candidate = parent / "hop-qua" / "shopee-upload-2026"
        if candidate.is_dir():
            return parent / "hop-qua"
    return Path("/home/vananh/huong-dan/du-an/vo-anh/hop-qua")


OUT_DIR = _hop_qua_root() / "shopee-upload-2026" / "quan-tri"
OUT_HTML = OUT_DIR / "app" / "quan-tri-san-pham.html"
OUT_JSON = OUT_DIR / "data" / "quan-tri-san-pham.json"
OUT_CSV = OUT_DIR / "data" / "quan-tri-san-pham.csv"


@dataclass
class AdminProduct:
    sku: str
    ten: str
    mo_ta_ngan: str
    mo_ta_chi_tiet: str
    gia_le_vnd: int | None
    gia_le_max_vnd: int | None
    gia_shopee_vnd: int | None
    seo_title: str
    seo_description: str
    seo_keywords: str
    thumbnail: str
    images: list[str]
    con_hang: bool
    folder: str
    web_url: str
    ngay_dang: str = ""
    thich: bool = False
    thu_tu: int | None = None
    status: str = ""
    shopee_item_id: str = ""


def parse_field(block: str, name: str) -> str:
    m = re.search(rf"{name}:\s*'((?:\\'|[^'])*)'", block, re.DOTALL)
    if not m:
        return ""
    return m.group(1).replace("\\'", "'").replace("\\n", "\n")


def split_description(desc: str) -> tuple[str, str]:
    desc = desc.strip()
    if "\n\n•" in desc:
        parts = desc.split("\n\n", 1)
        return parts[0].strip(), parts[1].strip()
    if "\n\n【" in desc:
        parts = desc.split("\n\n", 1)
        return parts[0].strip(), parts[1].strip()
    lines = desc.split("\n")
    if len(lines) <= 1:
        return desc, ""
    return lines[0].strip(), "\n".join(lines[1:]).strip()


def parse_manifest() -> dict[str, list[str]]:
    if not MANIFEST_JS.is_file():
        return {}
    text = MANIFEST_JS.read_text(encoding="utf-8")
    out: dict[str, list[str]] = {}
    for pid, body in re.findall(r"'([^']+)':\s*\[([\s\S]*?)\]", text):
        imgs = re.findall(r'"([^"]+)"', body)
        if imgs:
            out[pid] = imgs
    return out


def parse_thumbnail_map() -> dict[str, str]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    out: dict[str, str] = {}
    for block in re.split(r"\n\s*\{", text)[1:]:
        pid = re.search(r"id:\s*'([^']+)'", block)
        if not pid:
            continue
        thumb = parse_field(block, "thumbnail")
        if thumb:
            out[pid.group(1)] = thumb
    return out


def load_stock() -> dict[str, bool]:
    for path in (
        ROOT / "data" / "stock-status.json",
        OUT_DIR / "stock-status.json",
    ):
        if not path.is_file():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict):
            return {
                str(k): bool(v)
                for k, v in data.items()
                if not str(k).startswith("_")
            }
    return {}


def load_gia_le() -> tuple[dict[str, int], dict[str, int], dict[str, int]]:
    path = None
    for p in (
        OUT_DIR / "data" / "gia-le-cap-nhat.json",
        OUT_DIR / "gia-le-cap-nhat.json",
        _hop_qua_root() / "shopee-upload-2026" / "gia-le-cap-nhat.json",
    ):
        if p.is_file():
            path = p
            break
    if not path:
        return {}, {}, {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}, {}, {}
    prices = {str(k): int(v) for k, v in (data.get("prices") or {}).items() if v}
    shopee = {str(k): int(v) for k, v in (data.get("shopee_prices") or {}).items() if v}
    mins = {str(k): int(v) for k, v in (data.get("price_mins") or {}).items() if v}
    return prices, shopee, mins


def _parse_vnd_num(s: str) -> int | None:
    if not s:
        return None
    n = int(s.replace(".", ""))
    return n if n > 0 else None


def parse_gia_le_range(desc: str, price_label: str) -> tuple[int | None, int | None]:
    """Đọc khoảng giá từ price label hoặc bullet mô tả."""
    m = re.search(
        r"Giá lẻ \(1[–-]10 cái\):\s*([\d.]+)\s*đ\s*[–-]\s*([\d.]+)\s*đ",
        desc,
        re.I,
    )
    if m:
        lo = _parse_vnd_num(m.group(1))
        hi = _parse_vnd_num(m.group(2))
        if lo and hi and hi > lo:
            return lo, hi

    m = re.search(
        r"Từ\s+([\d.]+)\s*đ\s*(?:đến|–|-)\s*([\d.]+)\s*đ",
        price_label,
        re.I,
    )
    if m:
        lo = _parse_vnd_num(m.group(1))
        hi = _parse_vnd_num(m.group(2))
        if lo and hi and hi > lo:
            return lo, hi

    single = parse_gia_le_from_desc(desc, price_label)
    return single, None


def load_seo_overrides() -> dict[str, dict[str, str]]:
    path = ROOT / "data" / "products-seo.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    items = data.get("items") if isinstance(data, dict) else {}
    return {str(k): v for k, v in (items or {}).items() if isinstance(v, dict)}


def parse_gia_le_from_desc(desc: str, price_label: str) -> int | None:
    m = re.search(r"Giá lẻ \(1[–-]10 cái\):\s*([\d.]+)\s*đ", desc, re.I)
    if m:
        return int(m.group(1).replace(".", ""))
    m = re.search(r"Từ\s+([\d.]+)\s*đ", price_label, re.I)
    if m:
        return int(m.group(1).replace(".", ""))
    return None


def infer_range_from_slug(sku: str, name: str = "") -> tuple[int | None, int | None]:
    """Gợi ý khoảng từ SKU/tên, vd. phu-quy-29-35k → 29k–35k."""
    text = f"{sku} {name}".lower()
    m = re.search(r"(\d{1,3})\s*[-–]\s*(\d{1,3})\s*k\b", text)
    if m:
        lo = int(m.group(1)) * 1000
        hi = int(m.group(2)) * 1000
        if hi > lo:
            return lo, hi
    return None, None


def load_existing_admin_meta() -> dict[str, dict]:
    """Giữ ngay_dang, thích… khi rebuild JSON từ products.js."""
    if not OUT_JSON.is_file():
        return {}
    try:
        data = json.loads(OUT_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    out: dict[str, dict] = {}
    for p in data.get("products") or []:
        sku = str(p.get("sku") or "").strip()
        if not sku:
            continue
        out[sku] = {
            k: p[k]
            for k in (
                "ngay_dang",
                "thich",
                "thu_tu",
                "status",
                "shopee_item_id",
                "shopee_url",
                "tags",
                "seo_title",
                "seo_description",
                "seo_keywords",
            )
            if p.get(k) not in (None, "", [])
        }
    return out


def load_home_priority_meta() -> dict[str, dict]:
    path = ROOT / "data" / "products-home-priority.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    items = data.get("items") if isinstance(data, dict) else {}
    return {str(k): v for k, v in (items or {}).items() if isinstance(v, dict)}


def collect_products() -> list[AdminProduct]:
    manifest = parse_manifest()
    thumbs = parse_thumbnail_map()
    stock = load_stock()
    gia_le, gia_shopee, gia_mins = load_gia_le()
    seo_map = load_seo_overrides()
    admin_meta = load_existing_admin_meta()
    home_meta = load_home_priority_meta()
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    rows: list[AdminProduct] = []

    for block in re.split(r"\n\s*\{", text)[1:]:
        pid_m = re.search(r"id:\s*'([^']+)'", block)
        if not pid_m:
            continue
        sku = pid_m.group(1)
        name = parse_field(block, "name")
        folder = parse_field(block, "folder") or sku
        price_label = parse_field(block, "price")
        desc = parse_field(block, "description")
        intro, chi_tiet = split_description(desc)
        thumb = thumbs.get(sku) or parse_field(block, "thumbnail")
        imgs = manifest.get(sku, [])
        if thumb and thumb not in imgs:
            imgs = [thumb] + [u for u in imgs if u != thumb]
        elif not thumb and imgs:
            thumb = imgs[0]

        price_min, price_max = parse_gia_le_range(desc, price_label)
        if sku in gia_mins:
            price_min = gia_mins[sku]
        listing = gia_le.get(sku)
        if listing:
            if price_min and listing > price_min:
                price_max = price_max or listing
            elif not price_min:
                price_min = listing
        if not price_max:
            slug_lo, slug_hi = infer_range_from_slug(sku, name)
            if slug_lo and slug_hi and slug_hi > slug_lo:
                if not price_min or price_min >= slug_hi:
                    price_min, price_max = slug_lo, slug_hi
                elif price_min <= slug_lo:
                    price_min, price_max = slug_lo, slug_hi
                else:
                    price_max = slug_hi
        shopee = gia_shopee.get(sku)
        in_stock = stock.get(sku, True)
        seo = seo_map.get(sku, {})
        posted = parse_field(block, "postedAt")
        meta = admin_meta.get(sku, {})
        home = home_meta.get(sku, {})
        ngay = (posted or meta.get("ngay_dang") or home.get("postedAt") or "").strip()[:10]
        thich = bool(meta.get("thich") or home.get("thich"))
        thu_tu = meta.get("thu_tu")
        if thu_tu is None and home.get("thuTu") is not None:
            try:
                thu_tu = int(home["thuTu"])
            except (TypeError, ValueError):
                thu_tu = None

        seo_title = (seo.get("title") or meta.get("seo_title") or "").strip()
        seo_description = (seo.get("description") or meta.get("seo_description") or "").strip()
        seo_keywords = (seo.get("keywords") or meta.get("seo_keywords") or "").strip()
        status = (meta.get("status") or "").strip()
        shopee_item_id = str(meta.get("shopee_item_id") or "").strip()

        rows.append(
            AdminProduct(
                sku=sku,
                ten=name,
                mo_ta_ngan=intro,
                mo_ta_chi_tiet=chi_tiet,
                gia_le_vnd=price_min,
                gia_le_max_vnd=price_max,
                gia_shopee_vnd=shopee,
                seo_title=seo_title,
                seo_description=seo_description,
                seo_keywords=seo_keywords,
                thumbnail=thumb,
                images=imgs,
                con_hang=in_stock,
                folder=folder,
                web_url=f"{SITE}/product.html?id={sku}",
                ngay_dang=ngay,
                thich=thich,
                thu_tu=thu_tu,
                status=status,
                shopee_item_id=shopee_item_id,
            )
        )

    rows.sort(key=lambda r: r.ten.lower())
    return rows


LOCAL_IMG_BASE = "../website/source/"


def abs_url(path: str) -> str:
    if not path:
        return ""
    if path.startswith("http"):
        return path
    return f"{SITE}/{path.lstrip('/')}"


def thumb_rel_path(path: str) -> str:
    """Đường dẫn tương đối website/source — file -thumb.jpg."""
    if not path:
        return ""
    if path.startswith("http"):
        return path
    if re.search(r"-thumb\.jpe?g$", path, re.I):
        return path.lstrip("/")
    if re.search(r"\.jpe?g$", path, re.I):
        return re.sub(r"(\.jpe?g)$", r"-thumb\1", path, flags=re.I).lstrip("/")
    return path.lstrip("/")


def thumb_preview_url(path: str) -> str:
    """URL xem local (Live Server từ shopee-upload-2026/)."""
    rel = thumb_rel_path(path)
    if not rel or rel.startswith("http"):
        return rel
    return LOCAL_IMG_BASE + rel


def thumb_full_local(path: str) -> str:
    if not path or path.startswith("http"):
        return path
    return LOCAL_IMG_BASE + path.lstrip("/")


def rows_to_payload(rows: list[AdminProduct]) -> dict:
    return {
        "version": 1,
        "updated": date.today().isoformat(),
        "note": "Gửi file này cho agent · chạy: python3 scripts/apply-quan-tri-san-pham.py",
        "products": [
            {
                "sku": r.sku,
                "ten": r.ten,
                "mo_ta_ngan": r.mo_ta_ngan,
                "mo_ta_chi_tiet": r.mo_ta_chi_tiet,
                "gia_le_vnd": r.gia_le_vnd,
                "gia_le_max_vnd": r.gia_le_max_vnd,
                "gia_shopee_vnd": r.gia_shopee_vnd,
                "seo_title": r.seo_title,
                "seo_description": r.seo_description,
                "seo_keywords": r.seo_keywords,
                "thumbnail": r.thumbnail,
                "images": r.images,
                "con_hang": r.con_hang,
                "folder": r.folder,
                "thich": r.thich,
                "ngay_dang": r.ngay_dang,
                "thu_tu": r.thu_tu,
                "status": r.status,
                "shopee_item_id": r.shopee_item_id,
            }
            for r in rows
        ],
    }


def write_json_csv(rows: list[AdminProduct]) -> None:
    payload = rows_to_payload(rows)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    import csv

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(
            [
                "sku",
                "ten",
                "mo_ta_ngan",
                "gia_le_vnd",
                "gia_le_max_vnd",
                "gia_shopee_vnd",
                "seo_title",
                "seo_description",
                "seo_keywords",
                "thumbnail",
                "images",
                "con_hang",
                "mo_ta_chi_tiet",
            ]
        )
        for r in rows:
            w.writerow(
                [
                    r.sku,
                    r.ten,
                    r.mo_ta_ngan,
                    r.gia_le_vnd or "",
                    r.gia_le_max_vnd or "",
                    r.gia_shopee_vnd or "",
                    r.seo_title,
                    r.seo_description,
                    r.seo_keywords,
                    r.thumbnail,
                    "|".join(r.images),
                    "true" if r.con_hang else "false",
                    r.mo_ta_chi_tiet,
                ]
            )


def write_html(rows: list[AdminProduct]) -> None:
    """Chỉ cập nhật số liệu trên HTML shell — không ghi đè layout (assets/quan-tri-admin.js)."""
    count = len(rows)
    in_stock = sum(1 for r in rows if r.con_hang)
    if not OUT_HTML.is_file():
        return
    text = OUT_HTML.read_text(encoding="utf-8")
    text = re.sub(
        r'(<span class="stat" id="stat-count">)[^<]*(</span>)',
        rf"\g<1>{count} sản phẩm\g<2>",
        text,
        count=1,
    )
    text = re.sub(
        r'(<span class="stat" id="stat-stock">)[^<]*(</span>)',
        rf"\g<1>{in_stock} hiện web\g<2>",
        text,
        count=1,
    )
    text = re.sub(
        r'(<span class="stat" id="stat-hidden">)[^<]*(</span>)',
        rf"\g<1>{count - in_stock} ẩn\g<2>",
        text,
        count=1,
    )
    OUT_HTML.write_text(text, encoding="utf-8")

def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_HTML.parent.mkdir(parents=True, exist_ok=True)
    rows = collect_products()
    write_json_csv(rows)
    write_html(rows)
    print(f"✅ {OUT_HTML} — {len(rows)} sản phẩm")
    print(f"✅ {OUT_JSON}")
    print(f"✅ {OUT_CSV}")


if __name__ == "__main__":
    main()
