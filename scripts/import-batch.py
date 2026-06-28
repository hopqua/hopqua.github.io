#!/usr/bin/env python3
"""Import đợt sản phẩm từ data/batches/{batch}.csv → products.js + ảnh."""
from __future__ import annotations

import argparse
import csv
import re
import shutil
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "image"
PRODUCTS_JS = ROOT / "js" / "products.js"
BATCH_DIR_NAME = "11-06-2026"


def parse_products_js() -> tuple[str, list[dict]]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    ids = re.findall(r"id:\s*'([^']+)'", text)
    names = re.findall(r"name:\s*'([^']+)'", text)
    folders = re.findall(r"folder:\s*'([^']+)'", text)
    products = [{"id": i, "name": n, "folder": f} for i, n, f in zip(ids, names, folders)]
    return text, products


def format_price(price_min: int, price_max: int | None = None) -> str:
    def fmt(n: int) -> str:
        return f"{n:,}".replace(",", ".") + "đ"

    if price_max is None or price_max == price_min:
        return fmt(price_min)
    return f"{fmt(price_min)} - {fmt(price_max)}"


def title_case_name(slug: str) -> str:
    return slug.replace("-", " ").title()


def file_base_from_folder(folder: str) -> str:
    return folder.split("/")[-1]


def next_image_index(target_dir: Path, base: str) -> int:
    max_idx = 0
    for f in target_dir.iterdir():
        if not f.is_file():
            continue
        m = re.match(rf"{re.escape(base)}-(\d+)\.(jpe?g)$", f.name, re.I)
        if m:
            max_idx = max(max_idx, int(m.group(1)))
    return max_idx


def list_media(source_dir: Path) -> tuple[list[Path], list[Path]]:
    jpgs = sorted(
        p
        for p in source_dir.iterdir()
        if p.is_file() and p.suffix.lower() in (".jpg", ".jpeg") and "-thumb" not in p.stem
    )
    mp4s = sorted(p for p in source_dir.iterdir() if p.is_file() and p.suffix.lower() == ".mp4")
    return jpgs, mp4s


def merge_images(row: dict, existing: dict) -> list[str]:
    source_dir = IMAGE_DIR / BATCH_DIR_NAME / row["source_folder"]
    if not source_dir.is_dir():
        raise FileNotFoundError(f"Không thấy thư mục nguồn: {source_dir}")

    target_rel = existing["folder"]
    target_dir = IMAGE_DIR / target_rel.replace("/", "\\")
    if not target_dir.is_dir():
        target_dir = IMAGE_DIR / target_rel
    if not target_dir.is_dir():
        raise FileNotFoundError(f"Không thấy thư mục đích: {target_dir}")

    base = file_base_from_folder(existing["folder"])
    next_idx = next_image_index(target_dir, base) + 1
    jpgs, mp4s = list_media(source_dir)
    added_videos: list[str] = []

    for src in jpgs:
        dest = target_dir / f"{base}-{next_idx}{src.suffix.lower()}"
        shutil.copy2(src, dest)
        print(f"  + anh {dest.name}")
        next_idx += 1

    vid_idx = 1
    for src in mp4s:
        dest_name = f"{base}-video-{vid_idx}.mp4"
        dest = target_dir / dest_name
        while dest.exists():
            vid_idx += 1
            dest_name = f"{base}-video-{vid_idx}.mp4"
            dest = target_dir / dest_name
        shutil.copy2(src, dest)
        rel = dest.relative_to(ROOT).as_posix()
        added_videos.append(f"image/{rel.split('image/', 1)[-1]}" if "image/" not in rel else rel)
        if not rel.startswith("image/"):
            added_videos[-1] = f"image/{target_rel}/{dest_name}"
        else:
            added_videos[-1] = rel
        print(f"  + video {dest.name}")
        vid_idx += 1

    return [f"image/{target_rel}/{dest.name}" for dest in [target_dir / f"{base}-video-{i}.mp4" for i in range(1, vid_idx)]] if mp4s else []


def fix_merge_video_paths(target_dir: Path, target_rel: str, mp4_count: int, base: str) -> list[str]:
  paths = []
  for p in sorted(target_dir.glob(f"{base}-video-*.mp4")):
      paths.append(f"image/{target_rel}/{p.name}")
  return paths


def merge_images_fixed(row: dict, existing: dict) -> list[str]:
    source_dir = IMAGE_DIR / BATCH_DIR_NAME / row["source_folder"]
    target_rel = existing["folder"]
    target_dir = IMAGE_DIR / target_rel
    base = file_base_from_folder(existing["folder"])
    next_idx = next_image_index(target_dir, base) + 1
    jpgs, mp4s = list_media(source_dir)

    for src in jpgs:
        dest = target_dir / f"{base}-{next_idx}{src.suffix.lower()}"
        shutil.copy2(src, dest)
        print(f"  + anh {dest.name}")
        next_idx += 1

    added_videos: list[str] = []
    vid_idx = 1
    for src in mp4s:
        dest = target_dir / f"{base}-video-{vid_idx}.mp4"
        while dest.exists():
            vid_idx += 1
            dest = target_dir / f"{base}-video-{vid_idx}.mp4"
        shutil.copy2(src, dest)
        added_videos.append(f"image/{target_rel}/{dest.name}")
        print(f"  + video {dest.name}")
        vid_idx += 1

    return added_videos


def rename_batch_folder(source_dir: Path, slug: str) -> Path:
    target = source_dir.parent / slug
    if source_dir.resolve() == target.resolve():
        return target
    if target.exists():
        return target
    source_dir.rename(target)
    print(f"  doi ten folder -> {slug}")
    return target


def rename_videos_in_dir(folder: Path, slug: str) -> None:
    mp4s = sorted(p for p in folder.iterdir() if p.suffix.lower() == ".mp4" and re.match(r"^\d+\.mp4$", p.name))
    for i, src in enumerate(mp4s, 1):
        dest = folder / f"{slug}-video-{i}.mp4"
        if not dest.exists():
            src.rename(dest)
            print(f"  doi ten video -> {dest.name}")


def normalize_images_in_dir(folder: Path, slug: str) -> None:
    """Đổi ảnh PNG/JPG tùy ý → {slug}-1.jpg, {slug}-2.jpg, ..."""
    try:
        from PIL import Image
    except ImportError as exc:
        raise SystemExit("Cần Pillow: pip install Pillow") from exc

    pattern = re.compile(rf"^{re.escape(slug)}-\d+\.jpe?g$", re.I)
    candidates = sorted(
        p
        for p in folder.iterdir()
        if p.is_file()
        and p.suffix.lower() in (".jpg", ".jpeg", ".png")
        and "-thumb" not in p.stem
        and not pattern.match(p.name)
    )
    if not candidates:
        return

    temp_files: list[Path] = []
    for i, src in enumerate(candidates):
        tmp = folder / f"__import_tmp_{i}{src.suffix.lower()}"
        src.rename(tmp)
        temp_files.append(tmp)

    idx = next_image_index(folder, slug) + 1
    for tmp in temp_files:
        dest = folder / f"{slug}-{idx}.jpg"
        if tmp.suffix.lower() == ".png":
            with Image.open(tmp) as im:
                im.convert("RGB").save(dest, "JPEG", quality=88, optimize=True)
            tmp.unlink()
        elif tmp.suffix.lower() in (".jpg", ".jpeg"):
            if tmp.suffix.lower() != ".jpg":
                with Image.open(tmp) as im:
                    im.save(dest, "JPEG", quality=88, optimize=True)
                tmp.unlink()
            else:
                tmp.rename(dest)
        else:
            tmp.rename(dest)
        print(f"  doi ten anh -> {dest.name}")
        idx += 1


def build_product_block(row: dict) -> str:
    slug = row["slug"]
    name = row["name"] or title_case_name(slug)
    pmin = int(row["price_min"] or 0)
    pmax = int(row["price_max"] or pmin) if row.get("price_max") else pmin
    folder = f"{BATCH_DIR_NAME}/{slug}"
    thumb = f"image/{folder}/{slug}-1.jpg"
    price = format_price(pmin, pmax if pmax != pmin else None)
    desc = (
        f"Mẫu hộp bánh trung thu {name.lower()}, phù hợp cửa hàng bánh, đại lý và khách mua sỉ."
    )

    folder_path = IMAGE_DIR / folder
    videos: list[str] = []
    if folder_path.is_dir():
        for mp4 in sorted(folder_path.glob(f"{slug}-video-*.mp4")):
            videos.append(f"image/{folder}/{mp4.name}")
        for mp4 in sorted(folder_path.glob("*.mp4")):
            rel = f"image/{folder}/{mp4.name}"
            if rel not in videos:
                videos.append(rel)

    videos_js = ",\n            ".join(f"'{v}'" for v in videos)
    videos_block = f"[\n            {videos_js}\n        ]" if videos else "[]"

    return f"""    {{
        id: '{slug}',
        name: '{name.replace("'", "\\'")}',
        folder: '{folder}',
        thumbnail: '{thumb}',
        price: '{price}',
        description: '{desc.replace("'", "\\'")}',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: {videos_block}
    }}"""


def append_videos_to_product(js_text: str, product_id: str, new_videos: list[str]) -> str:
    if not new_videos:
        return js_text

    pattern = rf"(id:\s*'{re.escape(product_id)}'[\s\S]*?videos:\s*)\[([^\]]*)\]"
    match = re.search(pattern, js_text)
    if not match:
        print(f"  ! Không cập nhật được videos cho {product_id}")
        return js_text

    existing_raw = match.group(2)
    existing = re.findall(r"'([^']+)'", existing_raw)
    merged = existing[:]
    for v in new_videos:
        if v not in merged:
            merged.append(v)
    videos_js = ",\n            ".join(f"'{v}'" for v in merged)
    replacement = match.group(1) + f"[\n            {videos_js}\n        ]"
    return js_text[: match.start()] + replacement + js_text[match.end() :]


def append_new_products(js_text: str, blocks: list[str], batch: str) -> str:
    if not blocks:
        return js_text
    marker = "\n];\n\n// Hàm lấy sản phẩm theo ID"
    insert_at = js_text.find(marker)
    if insert_at == -1:
        raise RuntimeError("Không tìm thấy kết thúc mảng products trong products.js")
    chunk = ",\n    // Sản phẩm từ thư mục " + batch + "\n" + ",\n".join(blocks)
    return js_text[:insert_at] + chunk + js_text[insert_at:]


def load_csv(batch: str) -> list[dict]:
    path = ROOT / "data" / "batches" / f"{batch}.csv"
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", default=BATCH_DIR_NAME, help="Tên file CSV trong data/batches/")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    rows = load_csv(args.batch)
    js_text, catalog = parse_products_js()
    by_id = {p["id"]: p for p in catalog}

    new_blocks: list[str] = []
    merges = 0
    news = 0

    for row in rows:
        action = (row.get("action") or "new").strip().lower()
        slug = (row.get("slug") or "").strip()
        source = (row.get("source_folder") or "").strip()
        print(f"\n[{action}] {source} ({slug})")

        if action == "merge":
            merge_id = (row.get("merge_into_id") or "").strip()
            if merge_id not in by_id:
                raise SystemExit(f"Lỗi: merge_into_id không tồn tại: {merge_id}")
            if args.dry_run:
                print(f"  -> gop anh vao {merge_id} ({by_id[merge_id]['folder']})")
                merges += 1
                continue
            added_videos = merge_images_fixed(row, by_id[merge_id])
            js_text = append_videos_to_product(js_text, merge_id, added_videos)
            src_dir = IMAGE_DIR / BATCH_DIR_NAME / source
            if src_dir.is_dir():
                shutil.rmtree(src_dir)
            merges += 1
            continue

        if slug in by_id:
            print(f"  -> id da co, merge anh vao {slug}")
            if not args.dry_run:
                added_videos = merge_images_fixed(row, by_id[slug])
                js_text = append_videos_to_product(js_text, slug, added_videos)
                src_dir = IMAGE_DIR / BATCH_DIR_NAME / source
                if src_dir.is_dir():
                    shutil.rmtree(src_dir)
            merges += 1
            continue

        if args.dry_run:
            print(f"  -> tao SP moi: {slug}")
            news += 1
            continue

        src_dir = IMAGE_DIR / BATCH_DIR_NAME / source
        if not src_dir.is_dir():
            raise FileNotFoundError(f"Không thấy: {src_dir}")
        src_dir = rename_batch_folder(src_dir, slug)
        normalize_images_in_dir(src_dir, slug)
        rename_videos_in_dir(src_dir, slug)
        new_blocks.append(build_product_block(row))
        news += 1

    if not args.dry_run:
        js_text = append_new_products(js_text, new_blocks, args.batch)
        PRODUCTS_JS.write_text(js_text, encoding="utf-8")
        print(f"\nĐã ghi {PRODUCTS_JS}")
        catalog_script = Path(__file__).resolve().parent / "build-products-catalog.py"
        if catalog_script.is_file():
            subprocess.run([sys.executable, str(catalog_script)], check=False)

    print(f"\nTóm tắt: {news} sản phẩm mới, {merges} lần gộp ảnh.")


if __name__ == "__main__":
    main()
