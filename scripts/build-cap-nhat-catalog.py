#!/usr/bin/env python3
"""Quét cap-nhat/, đối chiếu Excel Shopee, tính cân đóng hàng + giá lẻ + 30%."""
from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path

import openpyxl

from pack_spec_rules import classify_pack_type, pack_size_label, pack_size_text, packing_weight

ROOT = Path(__file__).resolve()
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
OUT_IMG = Path(__file__).resolve().parents[1] / "image" / "cap-nhat-2026"
OUT_JSON = Path(__file__).resolve().parents[1] / "data" / "cap-nhat-catalog.json"

WEIGHT_RULES = {
    "4_banh": 330,
    "4_banh_re": 250,
    "1_banh": 50,
    "1_banh_to": 180,
}

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
    "hộp cứng trung thu 4 bánh kèm vỏ trà xanh dương gấp gọn cánh mở 2 bên, kèm túi xách": "hop-cung-4-banh-tra-xanh-duong-gap-gon-tui-xach",
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

MANUAL_RAW: dict[str, str] = {
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
    "hộp cứng gấp gọn 4 bánh trà - 6 bánh": "Hộp cứng gấp gọn",
    "hộp cứng trung thu 4 bánh kèm vỏ trà xanh dương gấp gọn cánh mở 2 bên, kèm túi xách": "Hộp cứng trung thu 4 bánh trà xanh dương gấp gọn",
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


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", str(s).lower())
    s = re.sub(
        r"[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]",
        " ",
        s,
    )
    return re.sub(r"\s+", " ", s).strip()


MANUAL = {norm(k): v for k, v in MANUAL_RAW.items()}
WEB_ID_N = {norm(k.replace("/", " ")): v for k, v in WEB_ID_MAP.items()}


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")[:72]


def load_excel() -> list[dict]:
    wb = openpyxl.load_workbook(EXCEL, read_only=True, data_only=True)
    ws = wb["Bản đăng tải"]
    rows = list(ws.iter_rows(values_only=True))
    items: list[dict] = []
    for r in rows[6:]:
        if not r or not r[1]:
            continue
        name = str(r[1]).strip()
        if len(name) < 3 or name.startswith("Vui"):
            continue
        try:
            price = int(float(r[10]))
        except (TypeError, ValueError):
            price = None
        items.append({"name": name, "price": price, "norm": norm(name)})
    return items


def folder_manual_key(label: str) -> str:
    return norm(label.replace("/", " "))


def match_excel(folder_key: str, excel: list[dict]) -> dict | None:
    key = folder_manual_key(folder_key)
    if key in MANUAL:
        hint = norm(MANUAL[key])
        best: dict | None = None
        best_score = -1
        for e in excel:
            en = norm(e["name"])
            if en == hint:
                return e
            if hint in en or en in hint:
                score = len(en)
                if en in hint:
                    score -= 50  # tránh khớp nhầm "Hộp 1 bánh" vào tên dài hơn
                if score > best_score:
                    best_score = score
                    best = e
        if best:
            return best
    fk = set(key.split())
    best, score = None, 0
    for e in excel:
        inter = len(fk & set(e["norm"].split()))
        if inter > score:
            score = inter
            best = e
    return best if score >= 2 else None


VARIANT_PARENTS = {"4 Bánh rẻ": "4-banh-re"}


def iter_cap_structure() -> list[dict]:
    """25 dòng mẫu: thư mục đơn hoặc nhóm biến thể (vd. 4 Bánh rẻ → 5 màu)."""
    out: list[dict] = []
    for folder in sorted(CAP.iterdir()):
        if not folder.is_dir():
            continue
        parent_slug = VARIANT_PARENTS.get(folder.name)
        if parent_slug:
            subs = [s for s in sorted(folder.iterdir()) if s.is_dir()]
            out.append(
                {
                    "type": "variants",
                    "folder": folder.name,
                    "groupId": parent_slug,
                    "items": [(f"{folder.name}/{s.name}", s) for s in subs],
                }
            )
        else:
            out.append({"type": "single", "folder": folder.name, "items": [(folder.name, folder)]})
    return out


def iter_product_dirs() -> list[tuple[str, Path]]:
    out: list[tuple[str, Path]] = []
    for block in iter_cap_structure():
        out.extend(block["items"])
    return out


def copy_images(src_dir: Path, slug: str) -> list[str]:
    imgs = sorted(
        p
        for p in src_dir.rglob("*")
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    dest_dir = OUT_IMG / slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for i, src in enumerate(imgs[:4]):
        dest = dest_dir / f"{slug}-{i + 1}{src.suffix.lower()}"
        if not dest.exists() or dest.stat().st_size != src.stat().st_size:
            shutil.copy2(src, dest)
        urls.append(f"image/cap-nhat-2026/{slug}/{dest.name}")
    return urls, len(imgs)


def fmt_vnd(n: int | None) -> str:
    if n is None:
        return "—"
    return f"{n:,}".replace(",", ".") + "đ"


def product_row(label: str, path: Path, excel: list[dict]) -> dict | None:
    slug = slugify(label)
    fk = folder_manual_key(label)
    ex = match_excel(label, excel)
    w, wtype = packing_weight(label)
    pack_type = classify_pack_type(label)
    retail = ex["price"] if ex else None
    fee_add = round(retail * 0.30) if retail else None
    price_with_fee = retail + fee_add if retail else None
    platform = round(retail * 1.30) if retail else None
    images, img_count = copy_images(path, slug)
    if not images:
        return None
    variant_label = label.split("/")[-1].strip() if "/" in label else None
    return {
        "id": slug,
        "folder": label,
        "variantLabel": variant_label,
        "webId": WEB_ID_N.get(fk),
        "images": images,
        "excelMatch": ex["name"] if ex else None,
        "shopeeRetail": retail,
        "shopeeRetailFmt": fmt_vnd(retail),
        "directRetailFmt": fmt_vnd(retail),
        "platformRetailFmt": fmt_vnd(platform),
        "retailFee30Add": fee_add,
        "retailFee30AddFmt": fmt_vnd(fee_add),
        "priceWithFee": price_with_fee,
        "priceWithFeeFmt": fmt_vnd(price_with_fee),
        "packWeightG": w,
        "packWeightType": wtype,
        "packType": pack_type,
        "packTypeLabel": pack_size_label(pack_type) if pack_type else None,
        "packSizeText": pack_size_text(pack_type) if pack_type else None,
        "imageCount": img_count,
    }


def build() -> dict:
    excel = load_excel()
    products: list[dict] = []
    groups: list[dict] = []
    for block in iter_cap_structure():
        rows: list[dict] = []
        for label, path in block["items"]:
            row = product_row(label, path, excel)
            if row:
                products.append(row)
                rows.append(row)
        if not rows:
            continue
        if block["type"] == "variants":
            prices = [r["shopeeRetail"] for r in rows if r["shopeeRetail"]]
            price_summary = fmt_vnd(min(prices)) if prices else "—"
            if prices and min(prices) != max(prices):
                price_summary = f"{fmt_vnd(min(prices))} – {fmt_vnd(max(prices))}"
            groups.append(
                {
                    "type": "variants",
                    "folder": block["folder"],
                    "groupId": block["groupId"],
                    "variantCount": len(rows),
                    "priceSummary": price_summary,
                    "packWeightG": rows[0].get("packWeightG"),
                    "packWeightType": rows[0].get("packWeightType"),
                    "packType": rows[0].get("packType"),
                    "packSizeText": rows[0].get("packSizeText"),
                    "variants": rows,
                }
            )
        else:
            groups.append({"type": "single", **rows[0]})
    return {
        "updated": "2026-06-25",
        "draft": False,
        "folderCount": len(groups),
        "variantCount": len(products),
        "weightRules": WEIGHT_RULES,
        "dimensionRules": json.loads((Path(__file__).resolve().parents[1] / "data" / "pack-dimension-rules.json").read_text(encoding="utf-8")),
        "feeNote": "Giá lẻ 1–10 cái (mua trực tiếp). Giá Shopee tham khảo ≈ lẻ × 1,3.",
        "groups": groups,
        "products": products,
    }


def main() -> None:
    data = build()
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✅ {data['folderCount']} dòng mẫu, {data['variantCount']} biến thể → {OUT_JSON}")
    missing = [p["folder"] for p in data["products"] if not p["excelMatch"]]
    if missing:
        print("⚠ Chưa khớp Excel:", ", ".join(missing))


if __name__ == "__main__":
    main()
