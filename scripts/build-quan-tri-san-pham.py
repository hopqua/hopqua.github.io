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


OUT_DIR = _hop_qua_root() / "shopee-upload-2026"
OUT_HTML = OUT_DIR / "quan-tri-san-pham.html"
OUT_JSON = OUT_DIR / "quan-tri-san-pham.json"
OUT_CSV = OUT_DIR / "quan-tri-san-pham.csv"


@dataclass
class AdminProduct:
    sku: str
    ten: str
    mo_ta_ngan: str
    mo_ta_chi_tiet: str
    gia_le_vnd: int | None
    gia_shopee_vnd: int | None
    thumbnail: str
    images: list[str]
    con_hang: bool
    folder: str
    web_url: str


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


def load_gia_le() -> tuple[dict[str, int], dict[str, int]]:
    path = OUT_DIR / "gia-le-cap-nhat.json"
    if not path.is_file():
        return {}, {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}, {}
    prices = {str(k): int(v) for k, v in (data.get("prices") or {}).items() if v}
    shopee = {str(k): int(v) for k, v in (data.get("shopee_prices") or {}).items() if v}
    return prices, shopee


def parse_gia_le_from_desc(desc: str, price_label: str) -> int | None:
    m = re.search(r"Giá lẻ \(1[–-]10 cái\):\s*([\d.]+)\s*đ", desc, re.I)
    if m:
        return int(m.group(1).replace(".", ""))
    m = re.search(r"Từ\s+([\d.]+)\s*đ", price_label, re.I)
    if m:
        return int(m.group(1).replace(".", ""))
    return None


def collect_products() -> list[AdminProduct]:
    manifest = parse_manifest()
    thumbs = parse_thumbnail_map()
    stock = load_stock()
    gia_le, gia_shopee = load_gia_le()
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

        direct = gia_le.get(sku) or parse_gia_le_from_desc(desc, price_label)
        shopee = gia_shopee.get(sku)
        in_stock = stock.get(sku, True)

        rows.append(
            AdminProduct(
                sku=sku,
                ten=name,
                mo_ta_ngan=intro,
                mo_ta_chi_tiet=chi_tiet,
                gia_le_vnd=direct,
                gia_shopee_vnd=shopee,
                thumbnail=thumb,
                images=imgs,
                con_hang=in_stock,
                folder=folder,
                web_url=f"{SITE}/product.html?id={sku}",
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
                "gia_shopee_vnd": r.gia_shopee_vnd,
                "thumbnail": r.thumbnail,
                "images": r.images,
                "con_hang": r.con_hang,
                "folder": r.folder,
            }
            for r in rows
        ],
    }


def write_json_csv(rows: list[AdminProduct]) -> None:
    payload = rows_to_payload(rows)
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    import csv

    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(
            [
                "sku",
                "ten",
                "mo_ta_ngan",
                "gia_le_vnd",
                "gia_shopee_vnd",
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
                    r.gia_shopee_vnd or "",
                    r.thumbnail,
                    "|".join(r.images),
                    "true" if r.con_hang else "false",
                    r.mo_ta_chi_tiet,
                ]
            )


def write_html(rows: list[AdminProduct]) -> None:
    """HTML shell — dữ liệu SP nạp từ quan-tri-san-pham.json (assets/quan-tri-admin.js)."""
    count = len(rows)
    in_stock = sum(1 for r in rows if r.con_hang)

    doc = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quản trị sản phẩm — hopqua.io.vn</title>
  <link rel="stylesheet" href="assets/quan-tri-admin.css">
</head>
<body class="server-off">
  <h1>Quản trị sản phẩm — hopqua.io.vn</h1>
  <div class="meta">
    <p>Cập nhật: <strong id="meta-date">{date.today().isoformat()}</strong>
      · <span class="stat" id="stat-count">{count} sản phẩm</span>
      <span class="stat" id="stat-stock">{in_stock} hiện web</span>
      <span class="stat" id="stat-hidden">{count - in_stock} ẩn</span>
      <span class="stat stat-muted" id="stat-changed" style="display:none">0 đã sửa</span></p>
    <p>Sửa <strong>tên, giá, ảnh, mô tả, hiện/ẩn web</strong> → <strong>Lưu &amp; Apply</strong> cập nhật
      <code>website/source/</code> (products.js, ảnh, giá).</p>
    <p class="hint" id="server-hint">Đang kiểm tra server local…</p>
    <div class="toolbar">
      <input type="search" id="search" placeholder="Tìm tên hoặc SKU…" autocomplete="off">
      <label><input type="checkbox" id="only-stock"> Chỉ hiện web</label>
      <label><input type="checkbox" id="only-changed"> Chỉ đã sửa</label>
      <button type="button" class="btn btn-secondary" id="btn-calc-shopee">Tính Shopee (tất cả)</button>
      <button type="button" class="btn btn-secondary" id="btn-calc-empty">Tính Shopee (còn trống)</button>
      <button type="button" class="btn" id="btn-save">Lưu file</button>
      <button type="button" class="btn server-only" id="btn-apply">Lưu &amp; Apply</button>
      <button type="button" class="btn btn-secondary" id="btn-refresh">Tải lại</button>
      <button type="button" class="btn btn-secondary" id="btn-import">Nạp JSON…</button>
      <input type="file" id="import-file" accept=".json,application/json" hidden>
    </div>
    <div id="status" class="status"></div>
  </div>
  <div id="loading">Đang tải sản phẩm…</div>
  <div class="table-wrap">
    <table id="admin-table" style="display:none">
      <thead>
        <tr>
          <th>#</th>
          <th>Ảnh</th>
          <th>Hiện</th>
          <th>Tên SP</th>
          <th>Giá lẻ</th>
          <th>Shopee</th>
          <th>Thumbnail</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>
  </div>
  <script src="assets/quan-tri-admin.js"></script>
</body>
</html>"""
    OUT_HTML.write_text(doc, encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = collect_products()
    write_json_csv(rows)
    write_html(rows)
    print(f"✅ {OUT_HTML} — {len(rows)} sản phẩm")
    print(f"✅ {OUT_JSON}")
    print(f"✅ {OUT_CSV}")


if __name__ == "__main__":
    main()
