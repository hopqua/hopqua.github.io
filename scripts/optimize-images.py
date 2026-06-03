#!/usr/bin/env python3
"""Nén ảnh JPG và tạo thumbnail cho trang chủ (400px)."""
from __future__ import annotations

import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "image"
PRODUCTS_JS = ROOT / "js" / "products.js"

THUMB_MAX_WIDTH = 400
DISPLAY_MAX_WIDTH = 1400
JPEG_QUALITY = 82
THUMB_QUALITY = 78
MIN_BYTES_TO_RECOMPRESS = 120_000


def parse_products() -> list[tuple[str, str]]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    blocks = re.findall(
        r"id:\s*'([^']+)'[\s\S]*?folder:\s*'([^']+)'",
        text,
    )
    return blocks


def thumb_path(jpg: Path) -> Path:
    return jpg.with_name(f"{jpg.stem}-thumb{jpg.suffix}")


def optimize_jpg(jpg: Path) -> None:
    try:
        with Image.open(jpg) as im:
            im = im.convert("RGB") if im.mode not in ("RGB", "L") else im
            w, h = im.size
            changed = False

            if w > DISPLAY_MAX_WIDTH:
                ratio = DISPLAY_MAX_WIDTH / w
                im = im.resize((DISPLAY_MAX_WIDTH, int(h * ratio)), Image.Resampling.LANCZOS)
                changed = True

            if jpg.stat().st_size >= MIN_BYTES_TO_RECOMPRESS or changed:
                im.save(jpg, "JPEG", quality=JPEG_QUALITY, optimize=True)

            thumb = thumb_path(jpg)
            tw = min(THUMB_MAX_WIDTH, im.size[0])
            ratio = tw / im.size[0]
            thumb_im = im.resize((tw, int(im.size[1] * ratio)), Image.Resampling.LANCZOS)
            thumb_im.save(thumb, "JPEG", quality=THUMB_QUALITY, optimize=True)
    except OSError as e:
        print(f"  skip {jpg}: {e}")


def build_manifest(products: list[tuple[str, str]]) -> str:
    lines = ["// Auto-generated — chạy: python scripts/optimize-images.py", "const productImageManifest = {"]
    for pid, folder in products:
        folder_path = IMAGE_DIR / folder.replace("/", "\\") if "\\" not in folder else IMAGE_DIR / folder
        if not folder_path.is_dir():
            folder_path = IMAGE_DIR / folder
        images: list[str] = []
        if folder_path.is_dir():
            for f in sorted(folder_path.iterdir()):
                if f.suffix.lower() in (".jpg", ".jpeg") and "-thumb" not in f.stem:
                    rel = f.relative_to(ROOT).as_posix()
                    images.append(rel)
        images_json = ",\n            ".join(f'"{p}"' for p in images)
        lines.append(f"    '{pid}': [\n            {images_json}\n    ]," if images else f"    '{pid}': [],")
    lines.append("};")
    lines.append("")
    lines.append("function getManifestImages(productId) {")
    lines.append("    return productImageManifest[productId] || [];")
    lines.append("}")
    return "\n".join(lines)


def main() -> None:
    products = parse_products()
    print(f"Products: {len(products)}")

    jpg_files = [
        p
        for p in IMAGE_DIR.rglob("*.jpg")
        if "-thumb" not in p.stem and p.is_file()
    ]
    jpg_files += [
        p
        for p in IMAGE_DIR.rglob("*.jpeg")
        if "-thumb" not in p.stem and p.is_file()
    ]
    print(f"Optimizing {len(jpg_files)} images...")
    for i, jpg in enumerate(jpg_files, 1):
        if i % 50 == 0:
            print(f"  {i}/{len(jpg_files)}")
        optimize_jpg(jpg)

    manifest = build_manifest(products)
    out = ROOT / "js" / "product-images-manifest.js"
    out.write_text(manifest, encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
