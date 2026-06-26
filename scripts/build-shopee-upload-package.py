#!/usr/bin/env python3
"""Tạo Excel Shopee sẵn đăng + báo cáo HTML giá (lẻ 1–10 × 1,30 phí sàn × 1,04 hoàn hàng)."""
from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_JS = ROOT / "js" / "products.js"
MANIFEST_JS = ROOT / "js" / "product-images-manifest.js"
def _hop_qua_root() -> Path:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "Shopee_mass_upload_71sp.xlsx"
        if candidate.is_file():
            return parent
        candidate = parent / "hop-qua" / "Shopee_mass_upload_71sp.xlsx"
        if candidate.is_file():
            return parent / "hop-qua"
    return Path("/home/vananh/huong-dan/du-an/vo-anh/hop-qua")


HOP_QUA = _hop_qua_root()
DEFAULT_TEMPLATE = HOP_QUA / "Shopee_mass_upload_71sp.xlsx"
DEFAULT_OUT_DIR = HOP_QUA / "shopee-upload-2026"

SITE = "https://hopqua.github.io"
SHOP_ID = 1307955653
SHEET = "Bản đăng tải"
DATA_START_ROW = 7

COL_CAT = 1
COL_NAME = 2
COL_DESC = 3
COL_SKU = 4
COL_VAR_CODE = 5
COL_VAR_GROUP = 6
COL_VAR_OPT = 7
COL_VAR_IMG = 8
COL_PRICE = 11
COL_STOCK = 12
COL_VAR_SKU = 13
COL_COVER = 17
COL_IMG_START = 18

FEE_PLATFORM = 0.30
FEE_RETURN = 0.04

FOOTER = (
    "Phụ kiện hộp / khay đựng bánh Trung Thu, hàng có sẵn.\n"
    "Inbox shop để được giá tốt theo số lượng.\n"
    "Xem thêm ảnh: hopqua.github.io — Zalo 0965671689 báo giá sỉ."
)


@dataclass
class Product:
    id: str
    name: str
    folder: str
    price_label: str
    description: str
    images: list[str] = field(default_factory=list)

    @property
    def intro(self) -> str:
        desc = self.description
        if "\n\n•" in desc:
            return desc.split("\n\n", 1)[0].strip()
        if "\n\n【" in desc:
            return desc.split("\n\n", 1)[0].strip()
        return desc.split("\n")[0].strip()

    @property
    def specs(self) -> str:
        desc = self.description
        if "\n\n•" in desc:
            return desc.split("\n\n", 1)[1].strip()
        if "\n\n【" in desc:
            return desc.split("\n\n", 1)[1].strip()
        return ""


def parse_products_js() -> dict[str, Product]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    products: dict[str, Product] = {}
    for block in re.split(r"\n\s*\{", text)[1:]:
        pid = re.search(r"id:\s*'([^']+)'", block)
        if not pid:
            continue
        name = re.search(r"name:\s*'((?:\\'|[^'])*)'", block)
        folder = re.search(r"folder:\s*'([^']*)'", block)
        price = re.search(r"price:\s*'([^']*)'", block)
        desc = re.search(r"description:\s*'((?:\\'|[^'])*)'", block)
        products[pid.group(1)] = Product(
            id=pid.group(1),
            name=(name.group(1) if name else "").replace("\\'", "'"),
            folder=(folder.group(1) if folder else ""),
            price_label=(price.group(1) if price else ""),
            description=(desc.group(1) if desc else "").replace("\\'", "'").replace("\\n", "\n"),
        )
    return products


def parse_manifest() -> dict[str, list[str]]:
    text = MANIFEST_JS.read_text(encoding="utf-8")
    out: dict[str, list[str]] = {}
    for pid, body in re.findall(r"'([^']+)':\s*\[([\s\S]*?)\]", text):
        imgs = re.findall(r'"([^"]+)"', body)
        if imgs:
            out[pid] = imgs
    return out


def parse_direct_retail_vnd(product: Product) -> int | None:
    m = re.search(r"Giá lẻ \(1[–-]10 cái\):\s*([\d.]+)\s*đ", product.description, re.I)
    if m:
        return int(m.group(1).replace(".", ""))
    m = re.search(r"Từ\s*([\d.]+)\s*đ/cái", product.price_label, re.I)
    if m:
        return int(m.group(1).replace(".", ""))
    nums = [int(x.replace(".", "")) for x in re.findall(r"([\d.]+)\s*đ", product.price_label)]
    if nums:
        return min(nums)
    nums = [int(x.replace(".", "")) for x in re.findall(r"(\d{2,3})\s*k", product.id + " " + product.name, re.I)]
    if nums:
        return min(nums) * 1000
    return None


def calc_shopee_price(direct: int) -> tuple[int, int, int, int]:
    fee30 = round(direct * FEE_PLATFORM)
    fee04 = round(direct * FEE_RETURN)
    # Giá listing = lẻ × (1 + 30%) × (1 + 4% hoàn hàng dự phòng)
    final = round(direct * (1 + FEE_PLATFORM) * (1 + FEE_RETURN))
    return final, fee30, fee04, final - direct


def fmt_vnd(n: int | None) -> str:
    if n is None:
        return "—"
    return f"{n:,}".replace(",", ".") + "đ"


def abs_url(path: str) -> str:
    if path.startswith("http"):
        return path
    return f"{SITE}/{path.lstrip('/')}"


def build_shopee_title(old_name: str, product: Product | None) -> str:
    name = (product.name if product else old_name).strip()
    if product and product.folder.startswith("cap-nhat-2026/"):
        prefix = "[Mẫu 2026]"
        if not name.lower().startswith("[mẫu"):
            short = name[:90]
            return f"{prefix} Vỏ hộp trung thu {short}"[:120]
    return (old_name or name)[:120]


def build_shopee_description(product: Product, shopee_price: int) -> str:
    intro = product.intro
    if intro and not intro.endswith("."):
        intro += "."
    specs = product.specs
    # Bỏ dòng giá cũ trong specs (web/Zalo)
    spec_lines = []
    for line in specs.splitlines():
        if re.search(r"Giá lẻ|Giá tham khảo|SL 11|SL 100|Trên 1\.000", line):
            continue
        spec_lines.append(line)
    specs_clean = "\n".join(spec_lines).strip()

    parts: list[str] = []
    if intro:
        parts.append(intro)
    if specs_clean:
        parts.extend(["", specs_clean])
    parts.extend(
        [
            "",
            f"Giá listing Shopee (lẻ 1–10 cái): {fmt_vnd(shopee_price)}.",
            f"Xem ảnh & mô tả đầy đủ: {SITE}/product.html?id={product.id}",
            FOOTER,
        ]
    )
    desc = "\n".join(parts)
    if len(desc) < 100:
        desc += "\nZalo 0965671689 — tư vấn chọn mẫu và báo giá sỉ theo số lượng."
    return desc[:3000]


def enrich_images(products: dict[str, Product], manifest: dict[str, list[str]]) -> None:
    js = PRODUCTS_JS.read_text(encoding="utf-8")
    for pid, p in products.items():
        imgs = manifest.get(pid, [])
        if not imgs:
            m = re.search(
                rf"id:\s*'{re.escape(pid)}'[\s\S]*?thumbnail:\s*'([^']+)'",
                js,
            )
            if m:
                imgs = [m.group(1)]
        p.images = imgs


@dataclass
class RowReport:
    row: int
    sku: str
    name: str
    direct: int | None
    fee30: int
    fee04: int
    shopee_price: int | None
    old_price: int | None
    delta: int | None
    has_product: bool
    has_images: bool
    note: str = ""


def write_html_report(rows: list[RowReport], out_path: Path, formula_note: str) -> None:
    updated = sum(1 for r in rows if r.has_product and r.direct)
    missing = [r for r in rows if not r.has_product]
    no_price = [r for r in rows if r.has_product and not r.direct]

    def tr(r: RowReport) -> str:
        cls = ""
        if not r.has_product:
            cls = "warn"
        elif r.delta and abs(r.delta) > 500:
            cls = "delta"
        return f"""<tr class="{cls}">
          <td>{r.row}</td>
          <td><code>{r.sku}</code></td>
          <td>{r.name}</td>
          <td class="num">{fmt_vnd(r.direct) if r.direct else '—'}</td>
          <td class="num">{fmt_vnd(r.fee30) if r.direct else '—'}</td>
          <td class="num">{fmt_vnd(r.fee04) if r.direct else '—'}</td>
          <td class="num"><strong>{fmt_vnd(r.shopee_price) if r.shopee_price else '—'}</strong></td>
          <td class="num">{fmt_vnd(r.old_price) if r.old_price else '—'}</td>
          <td class="num">{fmt_vnd(r.delta) if r.delta is not None else '—'}</td>
          <td>{'✓' if r.has_images else '✗'}</td>
          <td>{r.note}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo cáo giá Shopee 2026 — Vân Thắng</title>
  <style>
    :root {{ --bg:#fff8f0; --text:#2d1810; --accent:#8b1528; --gold:#f0c14b; --border:#e8d5c0; }}
    body {{ font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 24px; line-height: 1.5; }}
    h1 {{ color: var(--accent); font-size: 1.5rem; }}
    .meta {{ background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }}
    .meta strong {{ color: var(--accent); }}
    table {{ width: 100%; border-collapse: collapse; background: #fff; font-size: 0.88rem; box-shadow: 0 4px 16px rgba(45,24,16,.08); border-radius: 12px; overflow: hidden; }}
    th, td {{ border-bottom: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }}
    th {{ background: linear-gradient(135deg, #9b1c31, #6d1222); color: #fff; position: sticky; top: 0; }}
    tr.warn {{ background: #fff5f5; }}
    tr.delta {{ background: #fffbeb; }}
    .num {{ text-align: right; white-space: nowrap; }}
    code {{ font-size: 0.8rem; }}
    .stats {{ display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0; }}
    .stat {{ background: var(--gold); color: var(--text); padding: 8px 14px; border-radius: 999px; font-weight: 600; font-size: 0.9rem; }}
    a {{ color: var(--accent); }}
  </style>
</head>
<body>
  <h1>Báo cáo giá listing Shopee — mùa Trung Thu 2026</h1>
  <div class="meta">
    <p>Ngày tạo: <strong>{date.today().isoformat()}</strong></p>
    <p>Công thức: <strong>{formula_note}</strong></p>
    <p>File Excel sẵn đăng: <strong>Shopee_mass_upload_71sp_READY.xlsx</strong> (sheet «Bản đăng tải»)</p>
    <p>Sau khi đăng Shopee, điền <code>shopee_item_id</code> vào <strong>shopee-item-ids.csv</strong> rồi chạy:<br>
    <code>python3 website/source/scripts/apply-shopee-item-ids.py</code> → cập nhật link Shopee trên website.</p>
    <div class="stats">
      <span class="stat">{len(rows)} dòng Excel</span>
      <span class="stat">{updated} đã tính giá mới</span>
      <span class="stat">{len(missing)} SKU chưa có trong products.js</span>
      <span class="stat">{len(no_price)} thiếu giá lẻ 1–10</span>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>SKU</th><th>Tên</th>
        <th>Giá lẻ 1–10</th><th>+30% sàn</th><th>+4% hoàn</th>
        <th>Giá Shopee</th><th>Giá Excel cũ</th><th>Chênh</th><th>Ảnh</th><th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      {''.join(tr(r) for r in rows)}
    </tbody>
  </table>
</body>
</html>"""
    out_path.write_text(html, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", type=Path, default=DEFAULT_TEMPLATE)
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    args = parser.parse_args()

    if not args.template.is_file():
        raise SystemExit(f"Không thấy template: {args.template}")

    args.out_dir.mkdir(parents=True, exist_ok=True)
    out_xlsx = args.out_dir / "Shopee_mass_upload_71sp_READY.xlsx"
    shutil.copy2(args.template, out_xlsx)

    products = parse_products_js()
    manifest = parse_manifest()
    enrich_images(products, manifest)

    wb = openpyxl.load_workbook(out_xlsx)
    ws = wb[SHEET]
    reports: list[RowReport] = []
    csv_rows: list[dict] = []

    formula_note = (
        "Giá Shopee = Giá lẻ (1–10 cái) × 1,30 (phí sàn) × 1,04 (dự phòng hoàn hàng) "
        f"≈ × {(1 + FEE_PLATFORM) * (1 + FEE_RETURN):.4f}"
    )

    for row in range(DATA_START_ROW, ws.max_row + 1):
        sku_val = ws.cell(row=row, column=COL_SKU).value
        if not sku_val:
            continue
        sku = str(sku_val).strip()
        old_name = str(ws.cell(row=row, column=COL_NAME).value or "")
        try:
            old_price = int(float(ws.cell(row=row, column=COL_PRICE).value or 0))
        except (TypeError, ValueError):
            old_price = None

        prod = products.get(sku)
        direct = parse_direct_retail_vnd(prod) if prod else None
        shopee_price = fee30 = fee04 = None
        note = ""

        if prod and direct:
            shopee_price, fee30, fee04, _ = calc_shopee_price(direct)
            ws.cell(row=row, column=COL_NAME).value = build_shopee_title(old_name, prod)
            ws.cell(row=row, column=COL_DESC).value = build_shopee_description(prod, shopee_price)
            ws.cell(row=row, column=COL_PRICE).value = str(shopee_price)

            imgs = prod.images[:8]
            if imgs:
                cover = abs_url(imgs[0])
                ws.cell(row=row, column=COL_COVER).value = cover
                if imgs:
                    ws.cell(row=row, column=COL_VAR_IMG).value = cover
                for i, img in enumerate(imgs):
                    ws.cell(row=row, column=COL_IMG_START + i).value = abs_url(img)
        elif prod:
            note = "Chưa parse được giá lẻ 1–10 — giữ giá Excel cũ"
            shopee_price = old_price
        else:
            note = "Không có trong products.js"

        delta = (shopee_price - old_price) if shopee_price is not None and old_price else None
        reports.append(
            RowReport(
                row=row,
                sku=sku,
                name=old_name,
                direct=direct,
                fee30=fee30 or 0,
                fee04=fee04 or 0,
                shopee_price=shopee_price,
                old_price=old_price,
                delta=delta,
                has_product=bool(prod),
                has_images=bool(prod and prod.images),
                note=note,
            )
        )
        csv_rows.append(
            {
                "web_id": sku,
                "sku": sku,
                "ten_shopee": ws.cell(row=row, column=COL_NAME).value or old_name,
                "gia_le_1_10": direct or "",
                "gia_shopee": shopee_price or old_price or "",
                "shopee_item_id": "",
                "shopee_url": "",
                "link_web": f"{SITE}/product.html?id={sku}",
            }
        )

    wb.save(out_xlsx)

    html_path = args.out_dir / "bao-cao-gia-shopee.html"
    write_html_report(reports, html_path, formula_note)

    csv_path = args.out_dir / "shopee-item-ids.csv"
    existing_links: dict[str, tuple[str, str]] = {}
    shopee_js = ROOT / "js" / "shopee-links.js"
    if shopee_js.is_file():
        for m in re.finditer(
            r"'([^']+)':\s*'(https://shopee\.vn/product/\d+/(\d+))'", shopee_js.read_text(encoding="utf-8")
        ):
            existing_links[m.group(1)] = (m.group(2), m.group(3))

    for row in csv_rows:
        sku = row["sku"]
        if sku in existing_links:
            row["shopee_url"], row["shopee_item_id"] = existing_links[sku]

    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "web_id",
                "sku",
                "ten_shopee",
                "gia_le_1_10",
                "gia_shopee",
                "shopee_item_id",
                "shopee_url",
                "link_web",
            ],
        )
        w.writeheader()
        w.writerows(csv_rows)

    summary = {
        "generated": date.today().isoformat(),
        "formula": formula_note,
        "excel": str(out_xlsx),
        "html": str(html_path),
        "csv": str(csv_path),
        "rows": len(reports),
        "priced": sum(1 for r in reports if r.direct),
    }
    (args.out_dir / "manifest.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(f"✅ Excel → {out_xlsx}")
    print(f"✅ Báo cáo HTML → {html_path}")
    print(f"✅ CSV item IDs → {csv_path}")
    print(f"   {summary['priced']}/{summary['rows']} sản phẩm có giá Shopee mới")


if __name__ == "__main__":
    main()
