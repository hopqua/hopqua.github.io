"""URL trang sản phẩm hopqua.io.vn — dùng chung build/sitemap/quản trị."""
from __future__ import annotations

from urllib.parse import quote

SITE_ORIGIN = "https://hopqua.io.vn"


def product_page_path(product_id: str) -> str:
    return f"/p/{quote(product_id, safe='')}/"


def product_page_url(product_id: str) -> str:
    return f"{SITE_ORIGIN}{product_page_path(product_id)}"


def product_legacy_url(product_id: str) -> str:
    return f"{SITE_ORIGIN}/product.html?id={quote(product_id, safe='')}"
