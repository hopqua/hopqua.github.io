#!/usr/bin/env python3
"""Generate sitemap.xml for pages, blog posts, and product URLs."""
from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://hopqua.github.io"
POSTS_DIR = ROOT / "_posts"
PRODUCTS_JS = ROOT / "js" / "products.js"
SITEMAP_XML = ROOT / "sitemap.xml"


def iso_date(date_str: str) -> str:
    return date_str.split(" ")[0]


def parse_post_date(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"^date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", text, re.MULTILINE)
    if match:
        return match.group(1)
    # fallback from filename: YYYY-MM-DD-slug.md
    return path.name[:10]


def parse_post_url(path: Path) -> str:
    slug = path.stem[11:]  # remove YYYY-MM-DD-
    yyyy, mm, dd = path.stem[:4], path.stem[5:7], path.stem[8:10]
    return f"/{yyyy}/{mm}/{dd}/{slug}.html"


def parse_product_ids() -> list[str]:
    text = PRODUCTS_JS.read_text(encoding="utf-8")
    return re.findall(r"\bid:\s*'([^']+)'", text)


def make_url_block(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return (
        "  <url>\n"
        f"    <loc>{loc}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>\n"
    )


def main() -> None:
    today = datetime.now().strftime("%Y-%m-%d")
    lines = ['<?xml version="1.0" encoding="UTF-8"?>\n', '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n']

    # Core pages
    lines.append(make_url_block(f"{BASE_URL}/", today, "daily", "1.0"))
    lines.append(make_url_block(f"{BASE_URL}/product.html", today, "daily", "0.9"))
    lines.append(make_url_block(f"{BASE_URL}/blog/", today, "daily", "0.9"))

    # Product canonical URLs (query-style)
    for pid in parse_product_ids():
        lines.append(
            make_url_block(
                f"{BASE_URL}/product.html?id={pid}",
                today,
                "weekly",
                "0.7",
            )
        )

    # Blog posts
    for post in sorted(POSTS_DIR.glob("*.md")):
        post_date = parse_post_date(post)
        post_url = parse_post_url(post)
        lines.append(make_url_block(f"{BASE_URL}{post_url}", iso_date(post_date), "monthly", "0.8"))

    lines.append("</urlset>\n")
    SITEMAP_XML.write_text("".join(lines), encoding="utf-8")
    print(f"Generated sitemap: {SITEMAP_XML}")


if __name__ == "__main__":
    main()
