#!/usr/bin/env python3
"""Đồng bộ cap-nhat/ + Excel → products.js (giá trực tiếp 1–10, mô tả có giá sàn +30%)."""
from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

import openpyxl

from pack_spec_rules import classify_pack_type, dimension_bullet, packing_weight, upsert_spec_bullets

ROOT = Path(__file__).resolve()
SITE = ROOT.parents[1]  # website/source
PRODUCTS_JS = SITE / "js" / "products.js"
MANIFEST_JS = SITE / "js" / "product-images-manifest.js"
IMAGE_ROOT = SITE / "image"
BATCH_FOLDER = "cap-nhat-2026"

for parent in ROOT.parents:
    cap = parent / "cap-nhat"
    xlsx = parent / "hop-qua" / "Shopee_mass_upload_71sp.xlsx"
    if cap.is_dir() and xlsx.is_file():
        CAP = cap
        EXCEL = xlsx
        break
else:
    CAP = Path("/home/vananh/huong-dan/du-an/vo-anh/cap-nhat")
    EXCEL = Path("/home/vananh/huong-dan/du-an/vo-anh/hop-qua/Shopee_mass_upload_71sp.xlsx")

WEIGHT_RULES = {
    "4_banh": 330,
    "4_banh_re": 250,
    "1_banh": 50,
    "1_banh_to": 180,
    "2_banh_ep_kim": 50,
    "2_banh_re": 20,
}

MANUAL_EXCEL: dict[str, str] = {
    "1 bánh cho bé": "Hộp quà 1.6 cho bé",
    "1 bánh to 300g-600g sơn hà": "Hộp 1 Bánh To Thỏ Đỏ 300 600g",
    "1 bánh to thỏ đỏ": "Hộp 1 Bánh To Thỏ Đỏ 300 600g",
    "2 bánh rẻ": "Hộp 2 bánh rẻ",
    "2 bánh ép kim": "2 bánh rẻ 5 màu",
    "bạch uyển 4 bánh": "Bạch Uyển 4 Bánh",
    "bát giác thỏ quý tộc 4 bánh": "Bát giác thỏ quý tộc",
    "cúc nguyệt đình 4 bánh trà": "Cúc Nguyệt Đỉnh 4 Bánh Kem Hộp Tra Đỏ",
    "hạc nguyệt viên đỏ 4 bánh trà": "Hạc Nguyệt Viên Đỏ 4 Bánh Kem Hộp Tra",
    "hạc vũ nguyệt ca 4 bánh trà - 6 bánh": "Hạc vũ nguyệt ca 4 bánh 6 bánh",
    "hoàng kim 4 bánh - 6 bánh": "Hoàng Kim Hàng Giấy Mềm Cao Cấp Màu Gold 4 Bánh 6 Bánh",
    "hộp cứng 6 bánh mini đỏ": "Hộp Cứng 6 Bánh Mini 75 100g",
    "hộp cứng gấp gọn 4 bánh trà - 6 bánh": "Hộp cứng gấp gọn 6x",
    "hộp cứng hạc vân nguyệt": "Hạc vân nguyệt 3x",
    "khúc nguyệt viên 4 bánh": "Khúc Nguyệt Viên Cúc Đỏ 4 Bánh",
    "kim nguyệt xanh lá 4 bánh": "Kim Liên Nguyệt Xanh Lá 4 Bánh 6 Bánh",
    "lam dạ 4 bánh": "Lan Dạ 4 Bánh",
    "liên nguyệt đình 4 bánh trà - 6 bánh": "Liên Nguyệt Đỉnh 4 Bánh Kem Hộp Tra 6 Bánh",
    "nguyệt liên hoa 4 bánh trà- 6 bánh": "Nguyệt Liên Hoa 4 Bánh Kem Hộp Tra 6 Bánh",
    "nguyệt liên ngư 4 bánh trà - 6 bánh": "Hộp liên ngư 4 bánh",
    "thỏ đỏ 4 bánh": "Thỏ đỏ 3x nhỏ",
    "thu hoa 4 bánh": "Thu Hoa 4 Bánh Đỏ",
    "6 bánh mini cam": "6 Bánh Mini Kim Sơn Cam",
    "6 bánh mini xanh lá": "6 bánh mini sẵn HN 3x",
    "4 bánh rẻ hạc đỏ": "Vỏ hộp 4 bánh rẻ đỏ XD",
    "4 bánh rẻ nguyệt hoa viên": "Nguyệt hoa viên sll 19k",
    "4 bánh rẻ sen đỏ": "Vỏ hộp 4 bánh rẻ sen phú quý",
    "4 bánh rẻ thiên hoa vân nguyệt đỏ xanh lá": "Hoa viên đỏ 4 bánh rẻ",
    "4 bánh rẻ xanh lá": "Vỏ hộp 4 bánh rẻ đỏ XD",
}

# cap-nhat folder key → products.js id (đồng bộ web hiện có)
WEB_ID_MAP: dict[str, str] = {
    "1 bánh cho bé": "hop-qua-16-cho-be",
    "1 bánh to 300g-600g sơn hà": "hop-1-banh-to-tho-do-300-600g-23k-28k",
    "1 bánh to thỏ đỏ": "hop-1-banh-to-tho-do-300-600g-23k-28k",
    "2 bánh rẻ": "hop-2-banh-re",
    "2 bánh ép kim": "2-banh-re-5-mau",
    "bạch uyển 4 bánh": "vo-hop-trung-thu-bach-lien-xanh-4-banh-26-33k",
    "bát giác thỏ quý tộc 4 bánh": "bat-giac-tho-quy-toc",
    "cúc nguyệt đình 4 bánh trà": "cuc-nguyet-dinh-4-banh-kem-hop-tra-do-36k-44k",
    "hạc nguyệt viên đỏ 4 bánh trà": "khuc-nguyet-vien-cuc-do-4-banh-29-35k",
    "hạc vũ nguyệt ca 4 bánh trà - 6 bánh": "hac-vu-nguyet-ca-4-banh-6-banh",
    "hoàng kim 4 bánh - 6 bánh": "hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k",
    "hộp cứng 6 bánh mini đỏ": "hop-cung-6-banh-mini-75-100g-36k-45k",
    "hộp cứng gấp gọn 4 bánh trà - 6 bánh": "hop-cung-gap-gon-6x",
    "hộp cứng hạc vân nguyệt": "hac-van-nguyet-3x",
    "khúc nguyệt viên 4 bánh": "khuc-nguyet-vien-cuc-do-4-banh-29-35k",
    "kim nguyệt xanh lá 4 bánh": "kim-lien-nguyet-xanh-la-4-banh-6-banh-29k-44k",
    "lam dạ 4 bánh": "lan-da-3x-nho",
    "liên nguyệt đình 4 bánh trà - 6 bánh": "lien-nguyet-dinh-4-banh-kem-hop-tra-6-banh-33k-40k",
    "nguyệt liên hoa 4 bánh trà- 6 bánh": "song-ngu-do-4-banh-tra-doc-36k-44k",
    "nguyệt liên ngư 4 bánh trà - 6 bánh": "nguyet-lien-ngu-4-banh-tra-6-banh-37k-44k",
    "thỏ đỏ 4 bánh": "tho-do-3x-nho",
    "thu hoa 4 bánh": "thu-hoa-4-banh-do-29k-35k",
    "6 bánh mini cam": "6-banh-mini-kim-son-cam-20k-26k",
    "6 bánh mini xanh lá": "6b-mini-san-hn-3x",
    "4 bánh rẻ hạc đỏ": "hac-do-re",
    "4 bánh rẻ nguyệt hoa viên": "nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k",
    "4 bánh rẻ sen đỏ": "4b-re-sen-phu-quy",
    "4 bánh rẻ thiên hoa vân nguyệt đỏ xanh lá": "thien-hoa-van-nguyet-4-banh-re-175k-24k",
    "4 bánh rẻ xanh lá": "4b-re-do-xd",
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", str(s).lower())
    s = re.sub(
        r"[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]",
        " ",
        s,
    )
    return re.sub(r"\s+", " ", s).strip()


MANUAL_EXCEL_N = {norm(k): v for k, v in MANUAL_EXCEL.items()}
WEB_ID_N = {norm(k.replace("/", " ")): v for k, v in WEB_ID_MAP.items()}


def folder_key(label: str) -> str:
    return norm(label.replace("/", " "))


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:72]


def fmt_vnd(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def load_excel() -> dict[str, dict]:
    wb = openpyxl.load_workbook(EXCEL, read_only=True, data_only=True)
    ws = wb["Bản đăng tải"]
    by_norm: dict[str, dict] = {}
    for r in list(ws.iter_rows(values_only=True))[6:]:
        if not r or not r[1]:
            continue
        name = str(r[1]).strip()
        if len(name) < 3 or name.startswith("Vui"):
            continue
        try:
            price = int(float(r[10]))
        except (TypeError, ValueError):
            price = None
        desc = str(r[2] or "").strip()
        by_norm[norm(name)] = {"name": name, "price": price, "description": desc}
    return by_norm


def match_excel(label: str, excel: dict[str, dict]) -> dict | None:
    key = folder_key(label)
    if key in MANUAL_EXCEL_N:
        hint = norm(MANUAL_EXCEL_N[key])
        if hint in excel:
            return excel[hint]
        best, score = None, 0
        for en, row in excel.items():
            if hint in en or en in hint:
                sc = len(en)
                if en in hint:
                    sc -= 50
                if sc > score:
                    score = sc
                    best = row
        if best:
            return best
    fk = set(key.split())
    best, score = None, 0
    for en, row in excel.items():
        inter = len(fk & set(en.split()))
        if inter > score:
            score = inter
            best = row
    return best if score >= 2 else None


def packing_weight_local(label: str) -> tuple[int | None, str]:
    return packing_weight(label)


def iter_cap_dirs() -> list[tuple[str, Path]]:
    out: list[tuple[str, Path]] = []
    for folder in sorted(CAP.iterdir()):
        if not folder.is_dir():
            continue
        if folder.name == "4 Bánh rẻ":
            for sub in sorted(folder.iterdir()):
                if sub.is_dir():
                    out.append((f"4 Bánh rẻ/{sub.name}", sub))
            continue
        out.append((folder.name, folder))
    return out


def copy_all_images(src: Path, slug: str) -> list[str]:
    imgs = sorted(
        p for p in src.rglob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    dest_dir = IMAGE_ROOT / BATCH_FOLDER / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    paths: list[str] = []
    for i, src_file in enumerate(imgs, 1):
        dest = dest_dir / f"{slug}-{i}{src_file.suffix.lower()}"
        if not dest.exists() or dest.stat().st_size != src_file.stat().st_size:
            shutil.copy2(src_file, dest)
        paths.append(f"image/{BATCH_FOLDER}/{slug}/{dest.name}")
    return paths


def parse_products_js() -> tuple[str, dict[str, dict]]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    products: dict[str, dict] = {}
    for m in re.finditer(
        r"\{\s*id:\s*'([^']+)'[\s\S]*?name:\s*'((?:\\'|[^'])*)'[\s\S]*?"
        r"folder:\s*'([^']*)'[\s\S]*?thumbnail:\s*'([^']*)'[\s\S]*?"
        r"price:\s*'((?:\\'|[^'])*)'[\s\S]*?"
        r"description:\s*'((?:\\'|[^'])*)'[\s\S]*?"
        r"category:\s*'([^']*)'[\s\S]*?"
        r"season:\s*'([^']*)'[\s\S]*?"
        r"videos:\s*(\[[^\]]*\])",
        text,
    ):
        pid = m.group(1)
        products[pid] = {
            "id": pid,
            "name": m.group(2).replace("\\'", "'"),
            "folder": m.group(3),
            "thumbnail": m.group(4),
            "price": m.group(5).replace("\\'", "'"),
            "description": m.group(6).replace("\\'", "'").replace("\\n", "\n"),
            "category": m.group(7),
            "season": m.group(8),
            "videos": m.group(9),
            "span": (m.start(), m.end()),
        }
    return text, products


def extract_intro_and_bullets(desc: str) -> tuple[str, list[str]]:
    desc = desc.strip()
    bullets: list[str] = []
    intro = desc
    if "\n\n" in desc:
        parts = desc.split("\n\n")
        intro = parts[0].strip()
        for part in parts[1:]:
            for line in part.split("\n"):
                line = line.strip()
                if line.startswith("•"):
                    bullets.append(line)
    for b in list(bullets):
        if any(
            x in b.lower()
            for x in (
                "cân nặng đóng hàng",
                "kích thước",
                "giá lẻ",
                "giá mua trực tiếp",
                "giá tham khảo trên shopee",
                "giá tham khảo mua qua shopee",
                "mức giá tham khảo",
                "liên hệ zalo",
                "sl 11",
                "sl 100",
                "từ 100",
            )
        ):
            bullets.remove(b)
    return intro, bullets


def excel_intro(excel_desc: str) -> str:
    if not excel_desc:
        return ""
    cut = re.split(r"\n\nMức giá tham khảo|\nPhụ kiện hộp", excel_desc, maxsplit=1)[0]
    return cut.strip().split("\n\n")[0].strip()


def build_description(
    label: str,
    excel_row: dict | None,
    existing_desc: str | None,
    weight_g: int | None,
    weight_type: str,
    direct: int | None,
    platform: int | None,
) -> str:
    web_intro, bullets = extract_intro_and_bullets(existing_desc or "")
    ex_intro = excel_intro(excel_row["description"] if excel_row else "")
    intro = web_intro or ex_intro or f"Vỏ hộp bánh trung thu {label} — hàng có sẵn, phù hợp tiệm bánh và đại lý."
    if intro and not intro.endswith("."):
        intro += "."

    kept = [b for b in bullets if not re.match(r"^•\s*kt\b", b, re.I)]
    pack_type = classify_pack_type(label)
    spec_bullets = upsert_spec_bullets(kept, pack_type, weight_g, weight_type)

    if direct:
        spec_bullets.append(f"•Giá lẻ (1–10 cái): {fmt_vnd(direct)}/cái — mua trực tiếp, không qua sàn TMĐT")
    if platform:
        spec_bullets.append(f"•Giá tham khảo mua qua Shopee: {fmt_vnd(platform)}/cái")
    spec_bullets.append("•SL 11–99: inbox shop Shopee hoặc nhắn Zalo — giá giảm theo số lượng")
    spec_bullets.append("•SL 100–1.000 cái: nhắn Zalo 0965671689 báo giá sỉ (nhiều mức giá theo ngưỡng)")
    spec_bullets.append("•Trên 1.000 cái: liên hệ Zalo để chốt giá tốt nhất")

    body = intro
    if spec_bullets:
        body += "\n\n" + "\n".join(spec_bullets)
    return body


def build_price_display(direct: int | None, existing_price: str) -> str:
    if direct:
        return f"Từ {fmt_vnd(direct)}/cái · SL 1–10"
    return existing_price or "Liên hệ báo giá"


def js_str(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")


def render_product_block(p: dict) -> str:
    videos = p.get("videos", "[]")
    if isinstance(videos, list):
        if videos:
            videos_js = "[\n            " + ",\n            ".join(f"'{v}'" for v in videos) + "\n        ]"
        else:
            videos_js = "[]"
    else:
        videos_js = videos
    return f"""    {{
        id: '{p["id"]}',
        name: '{js_str(p["name"])}',
        folder: '{p["folder"]}',
        thumbnail: '{p["thumbnail"]}',
        price: '{js_str(p["price"])}',
        description: '{js_str(p["description"])}',
        category: '{p.get("category", "hộp bánh trung thu")}',
        season: '{p.get("season", "trung thu")}',
        videos: {videos_js}
    }}"""


def replace_product_block(js_text: str, pid: str, block: str) -> str:
    pattern = rf"\{{\s*id:\s*'{re.escape(pid)}'[\s\S]*?videos:\s*\[[^\]]*\]\s*\}}"
    match = re.search(pattern, js_text)
    if not match:
        raise KeyError(f"Không tìm thấy product id={pid}")
    return js_text[: match.start()] + block + js_text[match.end() :]


def append_products(js_text: str, blocks: list[str]) -> str:
    marker = "\n];\n\n// Hàm lấy sản phẩm theo ID"
    pos = js_text.find(marker)
    if pos == -1:
        raise RuntimeError("Không tìm thấy kết thúc mảng products")
    chunk = ",\n    // cap-nhat 2026-06-25\n" + ",\n".join(blocks)
    return js_text[:pos] + chunk + js_text[pos:]


def update_manifest(manifest_paths: dict[str, list[str]]) -> None:
    if not MANIFEST_JS.is_file():
        return
    text = MANIFEST_JS.read_text(encoding="utf-8")
    for pid, paths in manifest_paths.items():
        entry = ",\n".join(f'            "{p}"' for p in paths)
        block = f"    '{pid}': [\n{entry}\n    ]"
        pat = rf"    '{re.escape(pid)}': \[[\s\S]*?\]"
        if re.search(pat, text):
            text = re.sub(pat, block, text, count=1)
        else:
            insert = text.find("const productImageManifest = {") + len("const productImageManifest = {\n")
            text = text[:insert] + block + ",\n" + text[insert:]
    MANIFEST_JS.write_text(text, encoding="utf-8")


def main() -> None:
    excel = load_excel()
    js_text, catalog = parse_products_js()
    manifest_updates: dict[str, list[str]] = {}
    new_blocks: list[str] = []
    updated = 0
    created = 0

    for label, src_dir in iter_cap_dirs():
        fk = folder_key(label)
        ex = match_excel(label, excel)
        direct = ex["price"] if ex else None
        platform = round(direct * 1.30) if direct else None
        wg, wtype = packing_weight(label)
        slug = slugify(label)
        images = copy_all_images(src_dir, slug)
        if not images:
            print(f"⚠ Bỏ qua (không ảnh): {label}")
            continue

        web_id = WEB_ID_N.get(fk)
        folder = f"{BATCH_FOLDER}/{slug}"
        thumb = images[0]
        display_name = label.split("/")[-1].strip() if "/" in label else label

        if web_id and web_id in catalog:
            old = catalog[web_id]
            desc = build_description(label, ex, old["description"], wg, wtype, direct, platform)
            price = build_price_display(direct, old["price"])
            prod = {
                **old,
                "name": old["name"] if len(old["name"]) > 3 else display_name,
                "folder": folder,
                "thumbnail": thumb,
                "price": price,
                "description": desc,
            }
            block = render_product_block(prod)
            js_text = replace_product_block(js_text, web_id, block)
            manifest_updates[web_id] = images
            updated += 1
            print(f"✅ Cập nhật {web_id} ← {label}")
        else:
            new_id = slug
            if new_id in catalog:
                new_id = f"{slug}-cap-nhat"
            desc = build_description(label, ex, None, wg, wtype, direct, platform)
            price = build_price_display(direct, "")
            prod = {
                "id": new_id,
                "name": display_name,
                "folder": folder,
                "thumbnail": thumb,
                "price": price,
                "description": desc,
                "category": "hộp bánh trung thu",
                "season": "trung thu",
                "videos": [],
            }
            new_blocks.append(render_product_block(prod))
            manifest_updates[new_id] = images
            created += 1
            print(f"➕ Mới {new_id} ← {label}")

    if new_blocks:
        js_text = append_products(js_text, new_blocks)

    PRODUCTS_JS.write_text(js_text, encoding="utf-8")
    update_manifest(manifest_updates)

    report = SITE / "data" / "cap-nhat-sync-report.json"
    report.write_text(
        json.dumps(
            {"updated": updated, "created": created, "manifest": len(manifest_updates)},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"\n✅ products.js: {updated} cập nhật, {created} mới")


if __name__ == "__main__":
    main()
