#!/usr/bin/env python3
"""Generate sitemap index + child sitemaps for GitHub Pages."""
from __future__ import annotations

import re
import xml.etree.ElementTree as ET
import xml.sax.saxutils
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://hopqua.github.io"
POSTS_DIR = ROOT / "_posts"
PRODUCTS_JS = ROOT / "js" / "products.js"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def iso_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_post_front_date(path: Path) -> tuple[str, str, str, str]:
    """Return (yyyy, mm, dd, iso_lastmod) from post front matter date (matches Jekyll permalink)."""
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^date:\s*([0-9]{4})-([0-9]{2})-([0-9]{2})", text, re.MULTILINE)
    if match:
        yyyy, mm, dd = match.group(1), match.group(2), match.group(3)
        return yyyy, mm, dd, f"{yyyy}-{mm}-{dd}T00:00:00Z"
    yyyy, mm, dd = path.stem[:4], path.stem[5:7], path.stem[8:10]
    return yyyy, mm, dd, f"{yyyy}-{mm}-{dd}T00:00:00Z"


def parse_post_date(path: Path) -> str:
    return parse_post_front_date(path)[3]


def parse_post_categories(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^categories:\s*(.+)$", text, re.MULTILINE)
    if not match:
        return []
    value = match.group(1).strip()
    if value.startswith("["):
        return re.findall(r"['\"]([^'\"]+)['\"]", value)
    return value.split()


def parse_post_url(path: Path) -> str:
    slug = path.stem[11:]
    yyyy, mm, dd, _ = parse_post_front_date(path)
    categories = parse_post_categories(path)
    if categories:
        category_path = "/".join(categories)
        return f"/{category_path}/{yyyy}/{mm}/{dd}/{slug}.html"
    return f"/{yyyy}/{mm}/{dd}/{slug}.html"


def parse_product_ids() -> list[str]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    return re.findall(r"\bid:\s*'([^']+)'", text)


def xml_text(value: str) -> str:
    return xml.sax.saxutils.escape(value, {"'": "&apos;", '"': "&quot;"})


def product_url(product_id: str) -> str:
    return f"{BASE_URL}/product.html?id={quote(product_id, safe='')}"


def make_url_block(loc: str, lastmod: str | None = None) -> str:
    lastmod_line = f"    <lastmod>{lastmod}</lastmod>\n" if lastmod else ""
    return (
        "  <url>\n"
        f"    <loc>{xml_text(loc)}</loc>\n"
        f"{lastmod_line}"
        "  </url>\n"
    )


def write_urlset(path: Path, blocks: list[str]) -> None:
    content = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<urlset xmlns="{SITEMAP_NS}">\n'
        + "".join(blocks)
        + "</urlset>\n"
    )
    path.write_text(content, encoding="utf-8", newline="\n")


def write_sitemap_index(path: Path, entries: list[tuple[str, str]]) -> None:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>\n',
        f'<sitemapindex xmlns="{SITEMAP_NS}">\n',
    ]
    for loc, lastmod in entries:
        lines.append("  <sitemap>\n")
        lines.append(f"    <loc>{xml_text(loc)}</loc>\n")
        lines.append(f"    <lastmod>{lastmod}</lastmod>\n")
        lines.append("  </sitemap>\n")
    lines.append("</sitemapindex>\n")
    path.write_text("".join(lines), encoding="utf-8", newline="\n")


def validate_xml(path: Path) -> None:
    ET.parse(path)


def main() -> None:
    now = iso_now()

    page_blocks = [
        make_url_block(f"{BASE_URL}/"),
        make_url_block(f"{BASE_URL}/18-mau-hot-2026.html"),
        make_url_block(f"{BASE_URL}/tim-kiem.html"),
        make_url_block(f"{BASE_URL}/cap-nhat-2026.html"),
        make_url_block(f"{BASE_URL}/product.html"),
        make_url_block(f"{BASE_URL}/blog/"),
    ]
    write_urlset(ROOT / "sitemap-pages.xml", page_blocks)

    post_blocks = []
    for post in sorted(POSTS_DIR.glob("*.md")):
        post_url = parse_post_url(post)
        post_blocks.append(make_url_block(f"{BASE_URL}{post_url}", parse_post_date(post)))
    write_urlset(ROOT / "sitemap-posts.xml", post_blocks)

    product_blocks = []
    for pid in parse_product_ids():
        product_blocks.append(make_url_block(product_url(pid), now))
    write_urlset(ROOT / "sitemap-products.xml", product_blocks)

    write_sitemap_index(
        ROOT / "sitemap.xml",
        [
            (f"{BASE_URL}/sitemap-pages.xml", now),
            (f"{BASE_URL}/sitemap-posts.xml", now),
            (f"{BASE_URL}/sitemap-products.xml", now),
        ],
    )

    for name in ("sitemap.xml", "sitemap-pages.xml", "sitemap-posts.xml", "sitemap-products.xml"):
        validate_xml(ROOT / name)

    print(
        "Generated sitemaps: "
        f"index + pages({len(page_blocks)}) + posts({len(post_blocks)}) + products({len(product_blocks)})"
    )


if __name__ == "__main__":
    main()
