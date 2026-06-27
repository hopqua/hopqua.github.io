const HOT_18_PRODUCT_IDS = [
    'hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k',
    'thien-hoa-van-nguyet-4-banh-re-175k-24k',
    'thu-hoa-4-banh-do-29k-35k',
    'nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k',
    'bat-giac-tho-quy-toc',
    'hop-cung-4-banh-kem-hop-tra-xanh-la-65k-75k',
    'hop-cung-6-banh-mini-75-100g-36k-45k',
    'hop-cung-gap-gon-6x',
    'lien-nguyet-dinh-4-banh-kem-hop-tra-6-banh-33k-40k',
    'kim-lien-nguyet-xanh-la-4-banh-6-banh-29k-44k',
    'khuc-nguyet-vien-cuc-do-4-banh-29-35k',
    'lan-da-3x-nho',
    'tho-do-3x-nho',
    'hop-1-banh-to-tho-do-300-600g-23k-28k',
    '6-banh-mini-kim-son-cam-20k-26k',
    '6b-mini-san-hn-3x',
    '2-banh-re-5-mau',
    'hac-do-re',
];

const HOT_18_PAGE_URL = 'https://hopqua.io.vn/18-mau-hot-2026.html';

function injectHot18ItemListSchema(products) {
    if (!products.length) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: '18 mẫu hộp bánh Trung Thu hot nhất 2026',
        description:
            'Danh sách 18 mẫu hộp bánh Trung Thu bán chạy nhất 2026 — mua lẻ Shopee longthibo958, xem ảnh và giá tham khảo.',
        url: HOT_18_PAGE_URL,
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: product.name,
            url: `${HOT_18_PAGE_URL.split('/18-')[0]}/product.html?id=${encodeURIComponent(product.id)}`,
        })),
    });
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('hot-18-product-grid');
    if (!grid || typeof displayProducts !== 'function' || typeof getProductById !== 'function') {
        return;
    }

    const products = HOT_18_PRODUCT_IDS.map((id) => getProductById(id)).filter(Boolean);
    displayProducts(grid, products, 0, { secondaryAction: 'shopee', showThumbnails: true });
    injectHot18ItemListSchema(products);

    const ctaZalo = document.getElementById('hot-18-cta-zalo');
    if (ctaZalo) {
        ctaZalo.addEventListener('click', () => trackZaloClick(null));
    }

    if (typeof loadDeferredGtag === 'function') {
        loadDeferredGtag();
    }
});
