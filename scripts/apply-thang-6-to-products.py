#!/usr/bin/env python3
"""Đồng bộ thang-6/ → products.js (ảnh + giá + quy cách đóng hàng)."""
from __future__ import annotations

import importlib.util
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = ROOT.parent
THANG6 = Path("/home/vananh/huong-dan/du-an/vo-anh/thang-6")
BATCH_FOLDER = "thang-6-2026"
IMAGE_ROOT = SITE / "image"
PRODUCTS_JS = SITE / "js" / "products.js"

# folder name → (web_id, giá lẻ min, giá lẻ max, tên hiển thị)
THANG6_ITEMS: list[tuple[str, str | None, int | None, int, str]] = [
    (
        "2 bánh Hạc valy hộp đôi kèm túi sách (9.5k -14k)",
        "2-banh-hac-valy-hop-doi-tui-xach",
        9_500,
        14_000,
        "2 bánh Hạc valy hộp đôi kèm túi xách",
    ),
    (
        "2 bánh Kim Nguyệt Vũ Long hộp đôi kèm túi sách ( 9.5 -14k)",
        "2-banh-kim-nguyet-vu-long-hop-doi-tui-xach",
        9_500,
        14_000,
        "2 bánh Kim Nguyệt Vũ Long hộp đôi kèm túi xách",
    ),
    (
        "Hạc nguyệt viên 4 bánh trà (34k-42k)",
        "hac-nguyet-vien-4-banh-tra-34k-42k",
        34_000,
        42_000,
        "Hạc nguyệt viên 4 bánh trà",
    ),
    (
        "Hạc vũ Nguyệt Ca 4 bánh trà 6 bánh (34k -42k)",
        "hac-vu-nguyet-ca-4-banh-6-banh",
        34_000,
        42_000,
        "Hạc vũ Nguyệt Ca 4 bánh trà 6 bánh",
    ),
    (
        "Nguyệt liên ca 4 bánh trà 6 bánh (150g - 220g) ( 34k -42k)",
        "nguyet-lien-ca-4-banh-tra-6-banh-34k-42k",
        34_000,
        42_000,
        "Nguyệt liên ca 4 bánh trà 6 bánh",
    ),
    (
        "Nguyệt liên hoa 4 bánh trà 6 bánh ( 150-220g) (36-44k)",
        "song-ngu-do-4-banh-tra-doc-36k-44k",
        36_000,
        44_000,
        "Nguyệt liên hoa 4 bánh trà 6 bánh",
    ),
]


def _load_cap_module():
    path = ROOT / "apply-cap-nhat-to-products.py"
    spec = importlib.util.spec_from_file_location("cap_nhat", path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod


def slugify(s: str) -> str:
    import unicodedata

    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:72]


def copy_media(src: Path, slug: str) -> tuple[list[str], list[str]]:
    dest_dir = IMAGE_ROOT / BATCH_FOLDER / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    images: list[str] = []
    videos: list[str] = []
    imgs = sorted(
        p for p in src.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    for i, src_file in enumerate(imgs, 1):
        dest = dest_dir / f"{slug}-{i}{src_file.suffix.lower()}"
        if not dest.exists() or dest.stat().st_size != src_file.stat().st_size:
            shutil.copy2(src_file, dest)
        images.append(f"image/{BATCH_FOLDER}/{slug}/{dest.name}")
    vids = sorted(p for p in src.iterdir() if p.suffix.lower() == ".mp4")
    for i, src_file in enumerate(vids, 1):
        dest = dest_dir / f"{slug}-video-{i}.mp4"
        if not dest.exists() or dest.stat().st_size != src_file.stat().st_size:
            shutil.copy2(src_file, dest)
        videos.append(f"image/{BATCH_FOLDER}/{slug}/{dest.name}")
    return images, videos


def fmt_vnd(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def build_price_label(price_min: int | None, price_max: int) -> str:
    if price_min and price_min < price_max:
        return f"Từ {fmt_vnd(price_min)} đến {fmt_vnd(price_max)}"
    return f"Từ {fmt_vnd(price_max)}/cái · SL 1–10"


def apply_price_range_to_desc(desc: str, price_min: int | None, price_max: int, platform: int) -> str:
    if price_min and price_min < price_max:
        desc = re.sub(
            r"•Giá lẻ \(1–10 cái\): [^\n]+",
            f"•Giá lẻ (1–10 cái): {fmt_vnd(price_min)} – {fmt_vnd(price_max)}/cái — mua trực tiếp, không qua sàn TMĐT",
            desc,
        )
        desc = re.sub(
            r"•Giá tham khảo mua qua Shopee: [^\n]+",
            f"•Giá tham khảo mua qua Shopee: {fmt_vnd(platform)}/cái (tính theo mức cao nhất)",
            desc,
        )
    return desc


def main() -> None:
    if not THANG6.is_dir():
        raise SystemExit(f"Không thấy: {THANG6}")

    cap = _load_cap_module()
    js_text, catalog = cap.parse_products_js()
    manifest_updates: dict[str, list[str]] = {}
    new_blocks: list[str] = []
    updated = created = 0

    for folder_name, web_id, price_min, price_max, display_name in THANG6_ITEMS:
        src_dir = THANG6 / folder_name
        if not src_dir.is_dir():
            print(f"⚠ Bỏ qua (không có thư mục): {folder_name}")
            continue

        slug = web_id or slugify(display_name)
        images, videos = copy_media(src_dir, slug)
        if not images:
            print(f"⚠ Bỏ qua (không ảnh): {folder_name}")
            continue

        direct = price_max
        platform = round(direct * 1.30)
        wg, wtype = cap.packing_weight(folder_name)
        folder = f"{BATCH_FOLDER}/{slug}"
        thumb = images[0]
        label = folder_name
        price = build_price_label(price_min, price_max)

        if web_id and web_id in catalog:
            old = catalog[web_id]
            desc = cap.build_description(label, None, old["description"], wg, wtype, direct, platform)
            desc = apply_price_range_to_desc(desc, price_min, price_max, platform)
            prod = {
                **old,
                "name": display_name,
                "folder": folder,
                "thumbnail": thumb,
                "price": price,
                "description": desc,
                "videos": videos or old.get("videos", "[]"),
            }
            block = cap.render_product_block(prod)
            js_text = cap.replace_product_block(js_text, web_id, block)
            manifest_updates[web_id] = images
            updated += 1
            print(f"✅ Cập nhật {web_id}")
        else:
            new_id = web_id or slug
            if new_id in catalog:
                new_id = f"{slug}-thang6"
            desc = cap.build_description(label, None, None, wg, wtype, direct, platform)
            desc = apply_price_range_to_desc(desc, price_min, price_max, platform)
            videos_js = videos if videos else []
            prod = {
                "id": new_id,
                "name": display_name,
                "folder": folder,
                "thumbnail": thumb,
                "price": price,
                "description": desc,
                "category": "hộp bánh trung thu",
                "season": "trung thu",
                "videos": videos_js,
            }
            new_blocks.append(cap.render_product_block(prod))
            manifest_updates[new_id] = images
            created += 1
            print(f"➕ Mới {new_id}")

    if new_blocks:
        js_text = cap.append_products(js_text, new_blocks)

    PRODUCTS_JS.write_text(js_text, encoding="utf-8")
    cap.update_manifest(manifest_updates)

    stock_path = SITE / "data" / "stock-status.json"
    if stock_path.is_file():
        stock = json.loads(stock_path.read_text(encoding="utf-8"))
    else:
        stock = {}
    for _, web_id, _, _, _ in THANG6_ITEMS:
        if web_id:
            stock[web_id] = True
    for pid in manifest_updates:
        stock.setdefault(pid, True)
    stock_path.write_text(json.dumps(stock, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = SITE / "data" / "thang-6-sync-report.json"
    report.write_text(
        json.dumps({"updated": updated, "created": created, "batch": BATCH_FOLDER}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"\n✅ products.js: {updated} cập nhật, {created} mới")

    for script in ("optimize-images.py", "build-products-catalog.py", "generate-sitemap.py"):
        p = ROOT / script
        if p.is_file():
            subprocess.run([sys.executable, str(p)], check=False, cwd=SITE)

    # Cập nhật stock-status.js sau khi đã ghi JSON (không gọi apply-stock-status — tránh ghi đè từ Downloads)
    stock_js = ROOT / "apply-stock-status.py"
    if stock_js.is_file():
        subprocess.run([sys.executable, str(stock_js), str(stock_path)], check=False, cwd=SITE)


if __name__ == "__main__":
    main()
