#!/usr/bin/env python3
"""Generate sitemap.xml for pages, blog posts, and product URLs."""
from __future__ import annotations

import re
import xml.sax.saxutils
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://hopqua.github.io"
POSTS_DIR = ROOT / "_posts"
PRODUCTS_JS = ROOT / "js" / "products.js"
SITEMAP_XML = ROOT / "sitemap.xml"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def iso_date(date_str: str) -> str:
    return date_str.split(" ")[0]


def parse_post_date(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", text, re.MULTILINE)
    if match:
        return match.group(1)
    return path.name[:10]


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
    yyyy, mm, dd = path.stem[:4], path.stem[5:7], path.stem[8:10]
    categories = parse_post_categories(path)
    if categories:
        category_path = "/".join(categories)
        return f"/{category_path}/{yyyy}/{mm}/{dd}/{slug}.html"
    return f"/{yyyy}/{mm}/{dd}/{slug}.html"


def parse_product_ids() -> list[str]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    return re.findall(r"\bid:\s*'([^']+)'", text)


def xml_loc(url: str) -> str:
    return xml.sax.saxutils.escape(url, {"'": "&apos;", '"': "&quot;"})


def make_url_block(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return (
        "  <url>\n"
        f"    <loc>{xml_loc(loc)}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>\n"
    )


def main() -> None:
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>\n',
        f'<urlset xmlns="{SITEMAP_NS}">\n',
    ]

    lines.append(make_url_block(f"{BASE_URL}/", today, "daily", "1.0"))
    lines.append(make_url_block(f"{BASE_URL}/18-mau-hot-2026.html", today, "weekly", "0.95"))
    lines.append(make_url_block(f"{BASE_URL}/product.html", today, "daily", "0.9"))
    lines.append(make_url_block(f"{BASE_URL}/blog/", today, "daily", "0.9"))

    for pid in parse_product_ids():
        lines.append(
            make_url_block(
                f"{BASE_URL}/product.html?id={pid}",
                today,
                "weekly",
                "0.7",
            )
        )

    for post in sorted(POSTS_DIR.glob("*.md")):
        post_date = parse_post_date(post)
        post_url = parse_post_url(post)
        lines.append(make_url_block(f"{BASE_URL}{post_url}", iso_date(post_date), "monthly", "0.8"))

    lines.append("</urlset>\n")
    SITEMAP_XML.write_text("".join(lines), encoding="utf-8")
    print(f"Generated sitemap: {SITEMAP_XML} ({len(lines) - 2} URLs)")


if __name__ == "__main__":
    main()
