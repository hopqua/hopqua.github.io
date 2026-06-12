#!/usr/bin/env python3
import re, sys, time
from playwright.sync_api import sync_playwright

SHOP = 1307955653
iid = int(sys.argv[1])
GENERIC = "mua và bán trên ứng dụng"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="msedge")
    page = browser.new_page()
    page.goto("https://shopee.vn/longthibo958", timeout=60000)
    time.sleep(2)
    page.goto(f"https://shopee.vn/product/{SHOP}/{iid}", wait_until="networkidle", timeout=120000)
    time.sleep(6)
    name = ""
    for raw in (
        page.locator('meta[property="og:title"]').get_attribute("content"),
        page.title(),
    ):
        cleaned = re.sub(r"\s*\|\s*Shopee Việt Nam\s*$", "", raw or "").strip()
        if cleaned and GENERIC not in cleaned.lower() and "hot deals" not in cleaned.lower():
            name = cleaned
            break
    browser.close()
print(name)
