#!/usr/bin/env python3
"""Upload ảnh/video từ quản trị → image/{folder}/, đặt tên SEO, nén ảnh + -thumb."""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "image"

try:
    from PIL import Image
except ImportError:
    Image = None  # type: ignore

THUMB_MAX_WIDTH = 400
DISPLAY_MAX_WIDTH = 1400
JPEG_QUALITY = 82
THUMB_QUALITY = 78
VIDEO_EXT = {".mp4", ".webm", ".mov"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
FOLDER_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9/_-]*$")


def slugify(text: str, max_len: int = 72) -> str:
    s = unicodedata.normalize("NFD", text or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "d")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:max_len] or "san-pham"


def normalize_folder(folder: str, sku: str) -> str:
    """Giữ folder lồng nhau (cap-nhat-2026/slug) — không slugify cả chuỗi."""
    raw = (folder or sku or "").strip().strip("/").replace("\\", "/")
    if not raw:
        raw = slugify(sku)
    if not FOLDER_RE.match(raw):
        raise ValueError(f"Folder không hợp lệ: {raw}")
    return raw


def file_base(folder: str, slug: str) -> str:
    return folder.split("/")[-1] if folder else slug


def next_image_index(target_dir: Path, base: str) -> int:
    max_idx = 0
    if not target_dir.is_dir():
        return 0
    for f in target_dir.iterdir():
        if not f.is_file():
            continue
        m = re.match(rf"{re.escape(base)}-(\d+)\.(jpe?g)$", f.name, re.I)
        if m:
            max_idx = max(max_idx, int(m.group(1)))
    return max_idx


def next_video_index(target_dir: Path, base: str) -> int:
    max_idx = 0
    if not target_dir.is_dir():
        return 0
    for f in target_dir.iterdir():
        if not f.is_file():
            continue
        m = re.match(rf"{re.escape(base)}-video-(\d+)\.(mp4|webm|mov)$", f.name, re.I)
        if m:
            max_idx = max(max_idx, int(m.group(1)))
    return max_idx


def thumb_path(jpg: Path) -> Path:
    return jpg.with_name(f"{jpg.stem}-thumb{jpg.suffix}")


def optimize_jpg(jpg: Path) -> None:
    if Image is None:
        return
    try:
        with Image.open(jpg) as im:
            im = im.convert("RGB") if im.mode not in ("RGB", "L") else im
            w, h = im.size
            if w > DISPLAY_MAX_WIDTH:
                ratio = DISPLAY_MAX_WIDTH / w
                im = im.resize((DISPLAY_MAX_WIDTH, int(h * ratio)), Image.Resampling.LANCZOS)
            im.save(jpg, "JPEG", quality=JPEG_QUALITY, optimize=True)
            tw = min(THUMB_MAX_WIDTH, im.size[0])
            ratio = tw / im.size[0]
            thumb_im = im.resize((tw, int(im.size[1] * ratio)), Image.Resampling.LANCZOS)
            thumb_im.save(thumb_path(jpg), "JPEG", quality=THUMB_QUALITY, optimize=True)
    except OSError as e:
        print(f"skip optimize {jpg}: {e}", file=sys.stderr)


def save_as_jpg(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if Image is not None and src.suffix.lower() in IMAGE_EXT:
        with Image.open(src) as im:
            im.convert("RGB").save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True)
        optimize_jpg(dest)
        return
    if src.suffix.lower() in {".jpg", ".jpeg"}:
        shutil.copy2(src, dest)
        optimize_jpg(dest)
        return
    raise ValueError(f"Định dạng ảnh không hỗ trợ: {src.suffix}")


def save_video(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def rel_path(path: Path) -> str:
    return path.relative_to(ROOT.resolve()).as_posix()


def upload_media(folder: str, sku: str, sources: list[Path]) -> dict:
    slug = slugify(sku or folder)
    folder = normalize_folder(folder, sku)
    target_dir = (IMAGE_DIR / folder).resolve()
    root_resolved = ROOT.resolve()
    if not str(target_dir).startswith(str(root_resolved / "image")):
        raise ValueError("Folder ngoài image/")
    target_dir.mkdir(parents=True, exist_ok=True)
    base = file_base(folder, slug)
    img_idx = next_image_index(target_dir, base)
    vid_idx = next_video_index(target_dir, base)
    added: list[str] = []
    videos: list[str] = []
    for src in sources:
        if not src.is_file():
            continue
        ext = src.suffix.lower()
        if ext in VIDEO_EXT:
            vid_idx += 1
            dest = target_dir / f"{base}-video-{vid_idx}{ext}"
            save_video(src, dest)
            rel = rel_path(dest)
            added.append(rel)
            videos.append(rel)
        elif ext in IMAGE_EXT or ext == "":
            img_idx += 1
            dest = target_dir / f"{base}-{img_idx}.jpg"
            save_as_jpg(src, dest)
            rel = rel_path(dest)
            added.append(rel)
        else:
            raise ValueError(f"File không hỗ trợ: {src.name}")
    thumb = next((p for p in added if p.lower().endswith(".jpg")), "")
    return {
        "ok": True,
        "slug": slug,
        "folder": folder,
        "paths": added,
        "videos": videos,
        "thumbnail": thumb,
        "targetDir": str(target_dir),
        "pillow": Image is not None,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--folder", required=True)
    ap.add_argument("--sku", required=True)
    ap.add_argument("files", nargs="+", type=Path)
    args = ap.parse_args()
    result = upload_media(args.folder, args.sku, args.files)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
