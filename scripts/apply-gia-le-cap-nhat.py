#!/usr/bin/env python3
"""Áp tên + giá lẻ từ gia-le-cap-nhat.csv / .json (báo cáo Shopee) → products.js."""
from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JS = ROOT / "js" / "products.js"


def _hop_qua_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "shopee-upload-2026" / "gia-le-cap-nhat.json"
        if candidate.is_file():
            return parent
        candidate = parent / "hop-qua" / "shopee-upload-2026" / "gia-le-cap-nhat.json"
        if candidate.is_file():
            return parent / "hop-qua"
    return Path("/home/vananh/huong-dan/du-an/vo-anh/hop-qua")


_HOP_QUA = _hop_qua_root()
DEFAULT_JSON = _HOP_QUA / "shopee-upload-2026" / "gia-le-cap-nhat.json"
DEFAULT_CSV = _HOP_QUA / "shopee-upload-2026" / "gia-le-cap-nhat.csv"

FEE_PLATFORM = 0.30
FEE_RETURN = 0.04
ROUND_STEP = 500


@dataclass
class GiaLeRow:
    sku: str
    ten: str
    gia_le: int
    gia_shopee: int | None = None


def fmt_vnd(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def calc_shopee_ref(direct: int) -> int:
    raw = direct * (1 + FEE_PLATFORM) * (1 + FEE_RETURN)
    return int(__import__("math").ceil(raw / ROUND_STEP) * ROUND_STEP)


def load_gia_le_rows(csv_path: Path, json_path: Path) -> list[GiaLeRow]:
    """Ưu tiên CSV (có cột ten + gia_le_vnd); Shopee lấy từ CSV hoặc JSON."""
    shopee_json: dict[str, int] = {}
    if json_path.is_file():
        try:
            data = json.loads(json_path.read_text(encoding="utf-8"))
            raw_sp = data.get("shopee_prices") if isinstance(data, dict) else None
            if isinstance(raw_sp, dict):
                shopee_json = {str(k): int(v) for k, v in raw_sp.items() if v}
        except (json.JSONDecodeError, TypeError, ValueError):
            pass

    if not csv_path.is_file():
        if not json_path.is_file():
            return []
        data = json.loads(json_path.read_text(encoding="utf-8"))
        prices = data.get("prices") or {}
        names = data.get("names") or {}
        return [
            GiaLeRow(
                sku=str(sku),
                ten=str(names.get(sku) or sku),
                gia_le=int(val),
                gia_shopee=shopee_json.get(str(sku)),
            )
            for sku, val in prices.items()
            if val
        ]

    rows: list[GiaLeRow] = []
    with csv_path.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            sku = (row.get("sku") or "").strip()
            ten = (row.get("ten") or sku).strip()
            raw = (row.get("gia_le_vnd") or "").strip().replace(".", "")
            if not sku or not raw:
                continue
            try:
                gia_le = int(raw)
            except ValueError:
                continue
            gia_shopee: int | None = None
            raw_sp = (row.get("gia_shopee_vnd") or "").strip().replace(".", "")
            if raw_sp:
                try:
                    gia_shopee = int(raw_sp)
                except ValueError:
                    gia_shopee = None
            if gia_shopee is None:
                gia_shopee = shopee_json.get(sku)
            rows.append(GiaLeRow(sku=sku, ten=ten, gia_le=gia_le, gia_shopee=gia_shopee))
    return rows


def patch_description(desc: str, direct: int, shopee_ref: int) -> str:
    line_retail = f"•Giá lẻ (1–10 cái): {fmt_vnd(direct)}/cái — mua trực tiếp, không qua sàn TMĐT"
    line_shopee = f"•Giá tham khảo mua qua Shopee: {fmt_vnd(shopee_ref)}/cái (tính theo mức cao nhất)"

    if re.search(r"Giá lẻ \(1[–-]10 cái\):", desc, re.I):
        desc = re.sub(
            r"•?Giá lẻ \(1[–-]10 cái\):[^\n]*",
            line_retail,
            desc,
            count=1,
            flags=re.I,
        )
    else:
        desc = desc.rstrip() + "\n\n" + line_retail

    if re.search(r"Giá tham khảo mua qua Shopee:", desc, re.I):
        desc = re.sub(
            r"•?Giá tham khảo mua qua Shopee:[^\n]*",
            line_shopee,
            desc,
            count=1,
            flags=re.I,
        )
    else:
        desc = desc.rstrip() + "\n" + line_shopee

    return desc


def _escape_js_str(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")


def patch_field(text: str, sku: str, field: str, value: str) -> str | None:
    pattern = (
        rf"(id:\s*'{re.escape(sku)}'[\s\S]*?"
        rf"{re.escape(field)}:\s*)'((?:\\'|[^'])*)'"
    )
    m = re.search(pattern, text)
    if not m:
        return None
    escaped = _escape_js_str(value)
    return text[: m.start(2)] + escaped + text[m.end(2) :]


def patch_products_js(rows: list[GiaLeRow], dry_run: bool = False) -> tuple[int, list[str]]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    updated = 0
    missing: list[str] = []

    for row in rows:
        if row.gia_le <= 0:
            continue
        shopee_ref = row.gia_shopee or calc_shopee_ref(row.gia_le)
        price_label = f"Từ {fmt_vnd(row.gia_le)}/cái · SL 1–10"

        probe = re.search(rf"id:\s*'{re.escape(row.sku)}'", text)
        if not probe:
            missing.append(row.sku)
            continue

        new_text = patch_field(text, row.sku, "name", row.ten)
        if new_text is None:
            missing.append(row.sku)
            continue
        text = new_text

        new_text = patch_field(text, row.sku, "price", price_label)
        if new_text is None:
            missing.append(row.sku)
            continue
        text = new_text

        desc_pattern = (
            rf"(id:\s*'{re.escape(row.sku)}'[\s\S]*?"
            rf"description:\s*)'((?:\\'|[^'])*)'"
        )
        dm = re.search(desc_pattern, text)
        if dm:
            old_desc = dm.group(2).replace("\\'", "'").replace("\\n", "\n")
            new_desc = patch_description(old_desc, row.gia_le, shopee_ref)
            text = text[: dm.start(2)] + _escape_js_str(new_desc) + text[dm.end(2) :]

        updated += 1

    if not dry_run and updated:
        PRODUCTS_JS.write_text(text, encoding="utf-8")

    return updated, missing


def main() -> None:
    parser = argparse.ArgumentParser(description="Cập nhật tên + giá lẻ products.js từ CSV/JSON báo cáo Shopee")
    parser.add_argument(
        "--from",
        dest="source",
        type=Path,
        help="gia-le-cap-nhat.csv hoặc .json (mặc định: CSV trong shopee-upload-2026/)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Chỉ in thống kê, không ghi file")
    args = parser.parse_args()

    csv_path = DEFAULT_CSV
    json_path = DEFAULT_JSON
    if args.source:
        if args.source.suffix.lower() == ".csv":
            csv_path = args.source
        else:
            json_path = args.source
            csv_path = args.source.with_suffix(".csv")

    if not csv_path.is_file() and not json_path.is_file():
        raise SystemExit(
            f"Không thấy {csv_path} hoặc {json_path}\n"
            "Bấm «Lưu giá» trên bao-cao-gia-shopee.html để tải gia-le-cap-nhat.csv"
        )

    rows = load_gia_le_rows(csv_path, json_path)
    if not rows:
        raise SystemExit("Không có dòng nào trong file nguồn")

    updated, missing = patch_products_js(rows, dry_run=args.dry_run)
    src = csv_path.name if csv_path.is_file() else json_path.name
    print(f"{'[dry-run] ' if args.dry_run else ''}✅ Cập nhật {updated} SP (tên + giá lẻ) trong products.js từ {src}")
    if missing:
        uniq = sorted(set(missing))
        print(f"⚠️  {len(uniq)} SKU không khớp products.js: {', '.join(uniq[:8])}{'…' if len(uniq) > 8 else ''}")

    if not args.dry_run and updated:
        for script in ("build-products-catalog.py", "build-cap-nhat-catalog.py"):
            path = ROOT / "scripts" / script
            if path.is_file():
                subprocess.run([sys.executable, str(path)], check=False)


if __name__ == "__main__":
    main()
