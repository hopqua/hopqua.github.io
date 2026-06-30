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
    default_data = json.dumps(rows_to_payload(rows), ensure_ascii=False)
    count = len(rows)
    in_stock = sum(1 for r in rows if r.con_hang)

    def tr(r: AdminProduct, i: int) -> str:
        sku = html.escape(r.sku, quote=True)
        thumb = r.thumbnail
        thumb_disp = thumb_preview_url(thumb)
        img_src = html.escape(thumb_disp, quote=True)
        full_local = html.escape(thumb_full_local(thumb), quote=True)
        thumb_live = html.escape(abs_url(thumb_rel_path(thumb)), quote=True)
        full_live = html.escape(abs_url(thumb), quote=True)
        checked = " checked" if r.con_hang else ""
        gia = r.gia_le_vnd or ""
        gia_sp = r.gia_shopee_vnd or ""
        name_attr = html.escape(r.ten, quote=True)
        thumb_val = html.escape(thumb, quote=True)
        imgs_val = html.escape("\n".join(r.images), quote=True)
        intro_val = html.escape(r.mo_ta_ngan, quote=True)
        chi_tiet_val = html.escape(r.mo_ta_chi_tiet, quote=True)

        return f"""<tr class="prod-row" data-sku="{sku}" data-name="{name_attr.lower()}">
          <td>{i}</td>
          <td class="img-cell">
            <a href="{r.web_url}" target="_blank" rel="noopener" title="Xem web">
              <img class="thumb-preview" src="{img_src}" alt="" width="72" height="72" loading="lazy"
                   data-full-local="{full_local}" data-thumb-live="{thumb_live}" data-full-live="{full_live}">
            </a>
            <code class="sku-mini">{sku[:24]}{'…' if len(r.sku)>24 else ''}</code>
          </td>
          <td class="stock-cell">
            <label class="stock-check" title="Tích ✓ = hiện web (còn hàng)">
              <input type="checkbox" class="stock-cb" data-field="con_hang"{checked}>
              <span class="stock-mark" aria-hidden="true">✓</span>
            </label>
          </td>
          <td><input type="text" class="field-input field-name" data-field="ten" value="{name_attr}" size="28"></td>
          <td class="num"><input type="number" class="field-input field-price" data-field="gia_le_vnd" value="{gia}" min="0" step="500"></td>
          <td class="num"><input type="number" class="field-input field-shopee" data-field="gia_shopee_vnd" value="{gia_sp}" min="0" step="500"></td>
          <td><input type="text" class="field-input field-thumb" data-field="thumbnail" value="{thumb_val}" size="36"></td>
          <td class="center">
            <button type="button" class="btn-expand" aria-expanded="false">Chi tiết ▾</button>
            <a href="{r.web_url}" target="_blank" rel="noopener" class="link-web">Web</a>
          </td>
        </tr>
        <tr class="detail-row hidden" data-sku="{sku}">
          <td colspan="8" class="detail-cell">
            <div class="detail-grid">
              <label>Mô tả ngắn (card / tìm kiếm)
                <textarea class="field-textarea" data-field="mo_ta_ngan" rows="2">{intro_val}</textarea>
              </label>
              <label>Ảnh gallery (mỗi dòng 1 đường dẫn, dòng đầu = ảnh chính nếu trùng thumbnail)
                <textarea class="field-textarea field-images" data-field="images" rows="4">{imgs_val}</textarea>
              </label>
              <label>Mô tả chi tiết (bullet giá, KT, cân nặng…)
                <textarea class="field-textarea" data-field="mo_ta_chi_tiet" rows="8">{chi_tiet_val}</textarea>
              </label>
            </div>
          </td>
        </tr>"""

    body_rows = "\n".join(tr(r, i) for i, r in enumerate(rows, start=1))

    doc = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quản trị sản phẩm — hopqua.io.vn</title>
  <style>
    :root {{ --bg:#f4f6fb; --text:#1e293b; --accent:#8b1528; --gold:#f0c14b; --border:#cbd5e1; }}
    body {{ font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; line-height: 1.45; }}
    h1 {{ color: var(--accent); font-size: 1.45rem; margin: 0 0 8px; }}
    .meta {{ background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; }}
    .toolbar {{ display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 12px 0; }}
    .btn {{ background: var(--accent); color: #fff; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.92rem; }}
    .btn:hover {{ filter: brightness(1.06); }}
    .btn-secondary {{ background: #fff; color: var(--accent); border: 2px solid var(--accent); }}
    .btn-expand {{ background: #e2e8f0; color: #334155; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }}
    .status {{ color: #166534; font-weight: 600; font-size: 0.9rem; }}
    .status.err {{ color: #991b1b; }}
    #search {{ padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; min-width: 220px; }}
    table {{ width: 100%; border-collapse: collapse; background: #fff; font-size: 0.86rem; box-shadow: 0 4px 16px rgba(15,23,42,.06); border-radius: 12px; overflow: hidden; }}
    th, td {{ border-bottom: 1px solid var(--border); padding: 8px; vertical-align: top; }}
    th {{ background: linear-gradient(135deg, #9b1c31, #6d1222); color: #fff; position: sticky; top: 0; z-index: 2; }}
    tr.out-stock {{ background: #fef2f2; }}
    tr.hidden {{ display: none; }}
    .detail-row.hidden {{ display: none; }}
    .detail-cell {{ background: #f8fafc; padding: 12px 16px !important; }}
    .detail-grid {{ display: grid; gap: 12px; }}
    .detail-grid label {{ display: block; font-weight: 600; font-size: 0.85rem; }}
    .field-input, .field-textarea {{ font: inherit; width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; margin-top: 4px; }}
    .field-price, .field-shopee {{ width: 6.5rem; text-align: right; }}
    .field-thumb {{ font-size: 0.78rem; }}
    .field-textarea {{ resize: vertical; min-height: 60px; }}
    .img-cell {{ width: 88px; text-align: center; }}
    .img-cell img {{ display: block; width: 72px; height: 72px; object-fit: cover; border-radius: 8px; margin: 0 auto 4px; border: 1px solid var(--border); }}
    .sku-mini {{ font-size: 0.65rem; color: #64748b; word-break: break-all; }}
    .stock-cell {{ width: 52px; text-align: center; }}
    .stock-check {{ display: inline-flex; width: 32px; height: 32px; cursor: pointer; position: relative; }}
    .stock-check input {{ position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }}
    .stock-mark {{ display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border: 2px solid #d1d5db; border-radius: 6px; color: transparent; font-weight: 700; }}
    .stock-check input:checked + .stock-mark {{ background: #dcfce7; border-color: #22c55e; color: #166534; }}
    .num {{ text-align: right; }}
    .center {{ text-align: center; white-space: nowrap; }}
    .link-web {{ font-size: 0.8rem; margin-left: 4px; }}
    .stat {{ display: inline-block; background: var(--gold); padding: 6px 12px; border-radius: 999px; font-weight: 600; font-size: 0.85rem; margin: 4px 6px 4px 0; }}
    code {{ background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.82rem; }}
  </style>
</head>
<body>
  <h1>Quản trị sản phẩm — hopqua.io.vn</h1>
  <div class="meta">
    <p>Ngày tạo: <strong>{date.today().isoformat()}</strong> · <span class="stat">{count} sản phẩm</span>
      <span class="stat">{in_stock} hiện web</span> <span class="stat">{count - in_stock} ẩn</span></p>
    <p>Sửa <strong>tên, giá, ảnh, mô tả</strong> trực tiếp → bấm <strong>Lưu &amp; tải file</strong> → gửi em file
      <code>quan-tri-san-pham.json</code> (hoặc CSV). Em chạy
      <code>python3 scripts/apply-quan-tri-san-pham.py</code> để cập nhật web.</p>
    <p>Ảnh: ưu tiên file local <code>../website/source/</code>; nếu chưa có thì lấy từ <code>hopqua.io.vn</code>.</p>
    <div class="toolbar">
      <input type="search" id="search" placeholder="Tìm tên hoặc SKU…" autocomplete="off">
      <label><input type="checkbox" id="only-stock"> Chỉ SP đang hiện web</label>
      <button type="button" class="btn" id="btn-save">Lưu &amp; tải file</button>
      <button type="button" class="btn btn-secondary" id="btn-import">Nạp từ JSON…</button>
      <input type="file" id="import-file" accept=".json,application/json" hidden>
      <span id="status" class="status"></span>
    </div>
  </div>
  <table id="admin-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Ảnh</th>
        <th>Hiện</th>
        <th>Tên SP</th>
        <th>Giá lẻ</th>
        <th>Shopee</th>
        <th>Thumbnail (đường dẫn)</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
{body_rows}
    </tbody>
  </table>
  <script>
    const IMAGE_BASE = '../website/source/';
    const LIVE_SITE = 'https://hopqua.io.vn/';
    const DEFAULT_DATA = {default_data};

    function thumbRelPath(path) {{
      if (!path) return '';
      if (path.startsWith('http')) return path;
      let p = path.replace(/^\\//, '');
      if (/\\.jpe?g$/i.test(p) && !/-thumb\\.jpe?g$/i.test(p)) {{
        p = p.replace(/(\\.jpe?g)$/i, '-thumb$1');
      }}
      return p;
    }}

    function liveUrl(path) {{
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return LIVE_SITE + path.replace(/^\\//, '');
    }}

    function imgUrl(path) {{
      return IMAGE_BASE + thumbRelPath(path).replace(/^\\//, '');
    }}

    function fullImgUrl(path) {{
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return IMAGE_BASE + path.replace(/^\\//, '');
    }}

    function wirePreview(img, thumbPath) {{
      if (!img || !thumbPath) return;
      img.dataset.fullLocal = fullImgUrl(thumbPath);
      img.dataset.thumbLive = liveUrl(thumbRelPath(thumbPath));
      img.dataset.fullLive = liveUrl(thumbPath);
      img.dataset.stage = 'thumb-local';
      img.onerror = function () {{
        const stage = img.dataset.stage || 'thumb-local';
        if (stage === 'thumb-local') {{
          img.dataset.stage = 'full-local';
          img.src = img.dataset.fullLocal || '';
          return;
        }}
        if (stage === 'full-local') {{
          img.dataset.stage = 'thumb-live';
          img.src = img.dataset.thumbLive || '';
          return;
        }}
        if (stage === 'thumb-live') {{
          img.dataset.stage = 'full-live';
          img.src = img.dataset.fullLive || '';
          return;
        }}
        img.onerror = null;
      }};
      img.dataset.stage = 'thumb-local';
      img.src = imgUrl(thumbPath);
    }}

    function parseImages(text) {{
      return (text || '').split(/\\n+/).map(s => s.trim()).filter(Boolean);
    }}

    function collectRow(sku) {{
      const main = document.querySelector('tr.prod-row[data-sku="' + sku + '"]');
      const detail = document.querySelector('tr.detail-row[data-sku="' + sku + '"]');
      if (!main) return null;
      const get = (sel) => {{
        const el = main.querySelector(sel) || (detail && detail.querySelector(sel));
        return el;
      }};
      const conHang = main.querySelector('.stock-cb').checked;
      const giaLe = parseInt(get('.field-price').value, 10) || null;
      const giaSp = parseInt(get('.field-shopee').value, 10) || null;
      const thumb = get('.field-thumb').value.trim();
      const images = parseImages(detail && detail.querySelector('[data-field="images"]').value);
      return {{
        sku: sku,
        ten: get('.field-name').value.trim(),
        mo_ta_ngan: detail ? detail.querySelector('[data-field="mo_ta_ngan"]').value.trim() : '',
        mo_ta_chi_tiet: detail ? detail.querySelector('[data-field="mo_ta_chi_tiet"]').value.trim() : '',
        gia_le_vnd: giaLe,
        gia_shopee_vnd: giaSp,
        thumbnail: thumb,
        images: images.length ? images : (thumb ? [thumb] : []),
        con_hang: conHang,
      }};
    }}

    function collectAll() {{
      const products = [];
      document.querySelectorAll('tr.prod-row').forEach(function (row) {{
        const item = collectRow(row.dataset.sku);
        if (item) products.push(item);
      }});
      return {{
        version: 1,
        updated: new Date().toISOString().slice(0, 10),
        note: 'Sửa trên quan-tri-san-pham.html · apply-quan-tri-san-pham.py',
        products: products,
      }};
    }}

    function downloadBlob(name, text, type) {{
      const blob = new Blob([text], {{ type: type }});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    }}

    function toCsv(payload) {{
      const esc = (v) => {{
        const s = String(v == null ? '' : v);
        return /[",\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }};
      const header = ['sku','ten','mo_ta_ngan','gia_le_vnd','gia_shopee_vnd','thumbnail','images','con_hang','mo_ta_chi_tiet'];
      const lines = [header.join(',')];
      payload.products.forEach(function (p) {{
        lines.push([
          esc(p.sku), esc(p.ten), esc(p.mo_ta_ngan), esc(p.gia_le_vnd || ''),
          esc(p.gia_shopee_vnd || ''), esc(p.thumbnail),
          esc((p.images || []).join('|')), esc(p.con_hang ? 'true' : 'false'),
          esc(p.mo_ta_chi_tiet),
        ].join(','));
      }});
      return lines.join('\\n');
    }}

    document.getElementById('btn-save').addEventListener('click', function () {{
      const payload = collectAll();
      const status = document.getElementById('status');
      try {{
        localStorage.setItem('quan-tri-san-pham', JSON.stringify(payload));
      }} catch (e) {{}}
      downloadBlob('quan-tri-san-pham.json', JSON.stringify(payload, null, 2), 'application/json');
      setTimeout(function () {{
        downloadBlob('quan-tri-san-pham.csv', toCsv(payload), 'text/csv;charset=utf-8');
      }}, 250);
      status.textContent = 'Đã tải quan-tri-san-pham.json + .csv';
      status.classList.remove('err');
    }});

    document.getElementById('btn-import').addEventListener('click', function () {{
      document.getElementById('import-file').click();
    }});

    document.getElementById('import-file').addEventListener('change', function (e) {{
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {{
        try {{
          const data = JSON.parse(reader.result);
          (data.products || []).forEach(applyProduct);
          document.getElementById('status').textContent = 'Đã nạp ' + (data.products || []).length + ' SP từ JSON';
        }} catch (err) {{
          document.getElementById('status').textContent = 'Lỗi JSON: ' + err.message;
          document.getElementById('status').classList.add('err');
        }}
      }};
      reader.readAsText(file, 'utf-8');
      e.target.value = '';
    }});

    function applyProduct(p) {{
      const main = document.querySelector('tr.prod-row[data-sku="' + p.sku + '"]');
      const detail = document.querySelector('tr.detail-row[data-sku="' + p.sku + '"]');
      if (!main) return;
      main.querySelector('.field-name').value = p.ten || '';
      main.querySelector('.field-price').value = p.gia_le_vnd || '';
      main.querySelector('.field-shopee').value = p.gia_shopee_vnd || '';
      main.querySelector('.field-thumb').value = p.thumbnail || '';
      main.querySelector('.stock-cb').checked = !!p.con_hang;
      styleStock(main, !!p.con_hang);
      if (detail) {{
        detail.querySelector('[data-field="mo_ta_ngan"]').value = p.mo_ta_ngan || '';
        detail.querySelector('[data-field="mo_ta_chi_tiet"]').value = p.mo_ta_chi_tiet || '';
        detail.querySelector('[data-field="images"]').value = (p.images || []).join('\\n');
      }}
      const img = main.querySelector('.thumb-preview');
      if (img && p.thumbnail) wirePreview(img, p.thumbnail);
    }}

    function styleStock(row, inStock) {{
      row.classList.toggle('out-stock', !inStock);
    }}

    document.querySelectorAll('tr.prod-row').forEach(function (row) {{
      styleStock(row, row.querySelector('.stock-cb').checked);
      const img = row.querySelector('.thumb-preview');
      const thumb = row.querySelector('.field-thumb').value.trim();
      if (img && thumb) wirePreview(img, thumb);
    }});

    document.getElementById('admin-table').addEventListener('change', function (e) {{
      if (e.target.classList.contains('stock-cb')) {{
        const row = e.target.closest('tr.prod-row');
        styleStock(row, e.target.checked);
        filterRows();
      }}
      if (e.target.classList.contains('field-thumb')) {{
        const row = e.target.closest('tr.prod-row');
        const img = row.querySelector('.thumb-preview');
        const v = e.target.value.trim();
        if (img && v) wirePreview(img, v);
      }}
    }});

    document.getElementById('admin-table').addEventListener('click', function (e) {{
      if (!e.target.classList.contains('btn-expand')) return;
      const sku = e.target.closest('tr').dataset.sku;
      const detail = document.querySelector('tr.detail-row[data-sku="' + sku + '"]');
      if (!detail) return;
      const open = detail.classList.toggle('hidden');
      e.target.setAttribute('aria-expanded', String(!open));
      e.target.textContent = open ? 'Chi tiết ▾' : 'Chi tiết ▴';
    }});

    function filterRows() {{
      const q = document.getElementById('search').value.trim().toLowerCase();
      const onlyStock = document.getElementById('only-stock').checked;
      document.querySelectorAll('tr.prod-row').forEach(function (row) {{
        const sku = row.dataset.sku;
        const name = row.dataset.name || '';
        const match = !q || sku.includes(q) || name.includes(q);
        const inStock = row.querySelector('.stock-cb').checked;
        const show = match && (!onlyStock || inStock);
        row.classList.toggle('hidden', !show);
        const detail = document.querySelector('tr.detail-row[data-sku="' + sku + '"]');
        if (detail && !show) detail.classList.add('hidden');
      }});
    }}

    document.getElementById('search').addEventListener('input', filterRows);
    document.getElementById('only-stock').addEventListener('change', filterRows);

    try {{
      const saved = localStorage.getItem('quan-tri-san-pham');
      if (saved) JSON.parse(saved).products.forEach(applyProduct);
    }} catch (_) {{}}
  </script>
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
