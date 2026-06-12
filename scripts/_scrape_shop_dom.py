import json, re, time
from pathlib import Path
from playwright.sync_api import sync_playwright

SHOP = 1307955653
out = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="msedge")
    page = browser.new_page()
    page.goto("https://shopee.vn/longthibo958", wait_until="networkidle", timeout=120000)
    for _ in range(10):
        page.mouse.wheel(0, 2500)
        time.sleep(1.5)
    data = page.evaluate("""() => {
        const links = [...document.querySelectorAll('a[href*="-i."]')];
        return links.map(a => ({href: a.href, text: (a.innerText || a.textContent || '').trim()})).filter(x => x.href.includes('-i.'));
    }""")
    browser.close()

seen = set()
for row in data:
    m = re.search(r"-i\.(\d+)\.(\d+)", row["href"])
    if not m or int(m.group(1)) != SHOP:
        continue
    iid = int(m.group(2))
    if iid in seen:
        continue
    seen.add(iid)
    out.append({"itemid": iid, "name": row["text"][:200], "url": f"https://shopee.vn/product/{SHOP}/{iid}"})

path = Path(__file__).resolve().parent.parent / "data" / "shopee" / "shop_products.json"
path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print("count", len(out))
for it in out:
    print(it["itemid"], it["name"][:80])
