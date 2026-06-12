from playwright.sync_api import sync_playwright
import time

SHOP = 1307955653
iid = 40031646973

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="msedge")
    page = browser.new_page()
    page.goto("https://shopee.vn/longthibo958", timeout=60000)
    time.sleep(3)
    page.goto(f"https://shopee.vn/product/{SHOP}/{iid}", wait_until="networkidle", timeout=120000)
    time.sleep(8)
    selectors = [
        'meta[property="og:title"]',
        '[data-testid="product-name"]',
        'h1',
        'span.AHkR2P',
    ]
    for sel in selectors:
        try:
            if sel.startswith("meta"):
                v = page.locator(sel).get_attribute("content")
            else:
                v = page.locator(sel).first.inner_text(timeout=3000)
            print(sel, "=>", (v or "")[:120])
        except Exception as e:
            print(sel, "ERR", e)
    print("title", page.title())
    browser.close()
