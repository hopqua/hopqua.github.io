const SEO_BRAND = 'Vân Thắng — Hộp Bánh Trung Thu';
const SEO_DEFAULT_KEYWORDS =
    'hộp bánh trung thu, hộp quà trung thu, hộp bánh trung thu cao cấp, hộp quà tết, hộp đựng bánh trung thu, mua hộp bánh trung thu shopee, hộp bánh trung thu 2026';

function getAbsoluteUrl(path) {
    if (!path) return SITE_ORIGIN;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SITE_ORIGIN}/${path.replace(/^\.\//, '').replace(/^\//, '')}`;
}

function getCanonicalProductUrl(product) {
    return `${SITE_ORIGIN}/product.html?id=${encodeURIComponent(product.id)}`;
}

function buildProductMetaDescription(product) {
    const desc = (product.description || '').replace(/\s+/g, ' ').trim();
    const price = product.price ? ` Giá tham khảo: ${product.price}.` : '';
    const base = desc.length > 105 ? `${desc.substring(0, 105)}…` : desc;
    return `${base}${price} Mua Shopee hoặc Zalo báo giá sỉ.`.substring(0, 160);
}

function setMetaContent(selector, value) {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute('content', value);
}

function injectJsonLd(data, scriptId) {
    let el = scriptId ? document.getElementById(scriptId) : null;
    if (!el) {
        el = document.createElement('script');
        el.type = 'application/ld+json';
        if (scriptId) el.id = scriptId;
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data, null, 2);
}

function buildProductJsonLd(product) {
    const productUrl = getCanonicalProductUrl(product);
    const imageUrl = getAbsoluteUrl(product.thumbnail);
    const shopeeUrl = typeof getShopeeUrl === 'function' ? getShopeeUrl(product) : SHOPEE_SHOP_URL;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: [imageUrl],
        url: productUrl,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: 'Vân Thắng',
        },
        offers: {
            '@type': 'Offer',
            url: shopeeUrl,
            priceCurrency: 'VND',
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: 'Vân Thắng — Shopee longthibo958',
            },
        },
    };
}

function buildProductBreadcrumbJsonLd(product) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Trang chủ',
                item: `${SITE_ORIGIN}/`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: product.name,
                item: getCanonicalProductUrl(product),
            },
        ],
    };
}
