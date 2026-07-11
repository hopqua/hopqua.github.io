#!/usr/bin/env python3
"""Sinh p/<id>/index.html — OG/preview ảnh riêng từng SP (Zalo/Facebook đọc HTML tĩnh)."""
from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "product.html"
OUT_ROOT = ROOT / "p"
PRODUCTS_JS = ROOT / "js" / "products.js"
SEO_JSON = ROOT / "data" / "products-seo.json"
STOCK_JSON = ROOT / "data" / "stock-status.json"
OG_JS = ROOT / "js" / "product-og-map.js"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from product_urls import product_page_url  # noqa: E402


def parse_field(block: str, name: str) -> str:
    m = re.search(rf"{name}:\s*'((?:\\'|[^'])*)'", block, re.DOTALL)
    if not m:
        return ""
    return m.group(1).replace("\\'", "'").replace("\\n", "\n")


def product_intro(description: str) -> str:
    text = (description or "").strip()
    if not text:
        return ""
    first = text.split("\n\n")[0].replace("\n", " ").strip()
    return re.sub(r"\s+", " ", first)


def meta_description(name: str, description: str, price: str) -> str:
    intro = product_intro(description)
    desc = intro[:105] + ("…" if len(intro) > 105 else "")
    price_bit = f" Giá tham khảo: {price}." if price else ""
    return f"{desc}{price_bit} Mua Shopee hoặc Zalo báo giá sỉ."[:160]


def parse_products() -> list[dict]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    out: list[dict] = []
    for block in re.split(r"\n\s*\{", text)[1:]:
        pid = re.search(r"id:\s*'([^']+)'", block)
        if not pid:
            continue
        out.append(
            {
                "id": pid.group(1),
                "name": parse_field(block, "name"),
                "thumbnail": parse_field(block, "thumbnail"),
                "price": parse_field(block, "price"),
                "description": parse_field(block, "description"),
            }
        )
    return out


def load_seo_overrides() -> dict[str, dict[str, str]]:
    if not SEO_JSON.is_file():
        return {}
    try:
        data = json.loads(SEO_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    items = data.get("items") if isinstance(data, dict) else {}
    if not isinstance(items, dict):
        return {}
    return {str(k): v for k, v in items.items() if isinstance(v, dict)}


def load_hidden_ids() -> set[str]:
    if not STOCK_JSON.is_file():
        return set()
    try:
        data = json.loads(STOCK_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return set()
    return {k for k, v in data.items() if not k.startswith("_") and v is False}


def build_og_entry(product: dict, seo: dict[str, dict[str, str]]) -> dict[str, str]:
    thumb = (product.get("thumbnail") or "").lstrip("/")
    override = seo.get(product["id"], {})
    desc = (override.get("description") or "").strip() or meta_description(
        product["name"], product.get("description") or "", product.get("price") or ""
    )
    title = (override.get("title") or "").strip() or product["name"]
    kw = (override.get("keywords") or "").strip()
    entry = {
        "title": f"{title} | Hộp Bánh Trung Thu Vân Thắng",
        "description": desc,
        "image": f"https://hopqua.io.vn/{thumb}" if thumb else "",
        "keywords": kw or "hộp bánh trung thu, hộp quà trung thu, mua hộp bánh trung thu shopee",
    }
    return entry


def set_meta_content(page: str, selector: str, value: str) -> str:
    if not value:
        return page
    esc = html.escape(value, quote=True)
    if selector.startswith("#"):
        sid = selector[1:]
        return re.sub(
            rf'(<meta id="{re.escape(sid)}"[^>]*content=")[^"]*(")',
            rf"\g<1>{esc}\g<2>",
            page,
            count=1,
        )
    if 'property="' in selector:
        key = re.search(r'property="([^"]+)"', selector)
        if key:
            prop = key.group(1)
            return re.sub(
                rf'(<meta property="{re.escape(prop)}" content=")[^"]*(")',
                rf"\g<1>{esc}\g<2>",
                page,
                count=1,
            )
    if 'name="' in selector:
        key = re.search(r'name="([^"]+)"', selector)
        if key:
            name = key.group(1)
            return re.sub(
                rf'(<meta name="{re.escape(name)}" content=")[^"]*(")',
                rf"\g<1>{esc}\g<2>",
                page,
                count=1,
            )
    return page


def inject_runtime_base_and_id(page: str, product_id: str) -> str:
    """Base động: file:// và http:// đều load đúng css/js từ root site."""
    pid_js = json.dumps(product_id, ensure_ascii=False)
    block = (
        "    <script>\n"
        "(function(){var b=document.createElement('base');"
        "if(location.protocol==='file:'){"
        "b.href=location.href.replace(/\\/p\\/[^/]+\\/.*$/,'/');"
        "}else{"
        "b.href=location.origin+'/';"
        "}"
        "document.head.insertBefore(b,document.head.firstChild);"
        "window.PRODUCT_PAGE_ID=" + pid_js + ";})();\n"
        "    </script>\n"
    )
    page = re.sub(r"\n\s*<base href=\"/\">\n?", "\n", page)
    return page.replace("<head>", "<head>\n" + block, 1)


def render_product_page(template: str, product_id: str, og: dict[str, str]) -> str:
    page_url = product_page_url(product_id)
    page = inject_runtime_base_and_id(template, product_id)

    page = re.sub(r"<title>[^<]*</title>", f"<title>{html.escape(og['title'])}</title>", page, count=1)
    page = set_meta_content(page, '#meta-description', og["description"])
    page = set_meta_content(page, 'meta[name="keywords"]', og.get("keywords", ""))
    page = set_meta_content(page, 'meta[property="og:title"]', og["title"])
    page = set_meta_content(page, 'meta[property="og:description"]', og["description"])
    page = set_meta_content(page, 'meta[property="og:image"]', og["image"])
    page = set_meta_content(page, 'meta[property="og:url"]', page_url)
    page = set_meta_content(page, 'meta[name="twitter:title"]', og["title"])
    page = set_meta_content(page, 'meta[name="twitter:description"]', og["description"])
    page = set_meta_content(page, 'meta[name="twitter:image"]', og["image"])
    page = re.sub(
        r'(<link rel="canonical" href=")[^"]*(")',
        rf"\g<1>{html.escape(page_url, quote=True)}\g<2>",
        page,
        count=1,
    )

    page = re.sub(
        r"\n\s*<!-- OG theo \?id=.*?-->\n\s*<script src=\"js/product-og-map\.js\"></script>\n\s*<script src=\"js/product-og-head\.js\"></script>",
        "\n    <!-- OG baked — build-product-pages.py -->",
        page,
        count=1,
        flags=re.DOTALL,
    )

    marker = "<!-- Auto-generated by build-product-pages.py -->\n"
    if marker.strip() not in page:
        page = page.replace("<head>", f"<head>\n    {marker}", 1)

    return page


def cleanup_stale_pages(active_ids: set[str]) -> int:
    if not OUT_ROOT.is_dir():
        return 0
    removed = 0
    for child in OUT_ROOT.iterdir():
        if not child.is_dir():
            continue
        if child.name not in active_ids:
            shutil.rmtree(child)
            removed += 1
    return removed


def main() -> None:
    if not TEMPLATE.is_file():
        raise SystemExit(f"Thiếu template {TEMPLATE}")

    template = TEMPLATE.read_text(encoding="utf-8")
    products = parse_products()
    hidden = load_hidden_ids()
    seo = load_seo_overrides()
    active_ids = {p["id"] for p in products if p["id"] not in hidden}

    written = 0
    for product in products:
        pid = product["id"]
        if pid not in active_ids:
            continue
        og = build_og_entry(product, seo)
        if not og.get("image"):
            continue
        out_dir = OUT_ROOT / pid
        out_dir.mkdir(parents=True, exist_ok=True)
        out_dir.joinpath("index.html").write_text(
            render_product_page(template, pid, og),
            encoding="utf-8",
        )
        written += 1

    removed = cleanup_stale_pages(active_ids)
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"✅ p/*/index.html — {written} trang SP ({generated}), xóa {removed} thư mục cũ")

    og_script = ROOT / "scripts" / "build-product-og-map.py"
    if og_script.is_file():
        subprocess.run([sys.executable, str(og_script)], check=True)


if __name__ == "__main__":
    main()
