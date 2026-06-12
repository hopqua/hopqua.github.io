#!/usr/bin/env python3
"""Lấy danh sách SP từ shop Shopee → data/shopee/shop_products.json"""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

SHOP_ID = 1307955653
USERNAME = "longthibo958"
OUT = Path(__file__).resolve().parent.parent / "data" / "shopee" / "shop_products.json"
GENERIC = "mua và bán trên ứng dụng"


def clean_title(raw: str) -> str:
    return re.sub(r"\s*\|\s*Shopee Việt Nam\s*$", "", (raw or "").strip())


def is_real(title: str) -> bool:
    t = title.lower()
    return bool(title) and GENERIC not in t


def fetch_shop_items() -> list[dict]:
    items: list[dict] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="msedge")
        page = browser.new_page(locale="vi-VN")

        def on_response(response):
            if "shop_page_product_tab_main" not in response.url or response.status != 200:
                return
            try:
                body = response.text()
                if len(body) < 500:
                    return
                data = json.loads(body)
                for it in data["data"]["sections"][0]["data"]["item"]:
                    items.append(
                        {
                            "itemid": it["itemid"],
                            "shopid": it.get("shopid", SHOP_ID),
                            "name": it.get("name", ""),
                        }
                    )
            except Exception:
                pass

        page.on("response", on_response)
        page.goto(f"https://shopee.vn/{USERNAME}", wait_until="networkidle", timeout=120000)
        for _ in range(6):
            page.mouse.wheel(0, 2000)
            time.sleep(1.5)
        browser.close()

    seen: set[int] = set()
    out: list[dict] = []
    for it in items:
        if it["itemid"] in seen:
            continue
        seen.add(it["itemid"])
        it["url"] = f"https://shopee.vn/product/{SHOP_ID}/{it['itemid']}"
        out.append(it)
    return out


def main() -> None:
    items = fetch_shop_items()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved {len(items)} items -> {OUT}")
    for it in items:
        print(it["itemid"], it.get("name", "")[:80])


if __name__ == "__main__":
    main()
