/** Tìm kiếm sản phẩm — dùng chung header & trang tim-kiem.html */
const SITE_SEARCH_PAGE = '/tim-kiem.html';

function normalizeSearchText(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getProductSearchHaystack(product) {
    return normalizeSearchText(
        [
            product.name,
            product.id,
            product.price,
            product.category,
            product.season,
            product.folder,
            (product.description || '').slice(0, 400),
        ].join(' ')
    );
}

function searchProducts(query, sourceList) {
    const list = sourceList || (typeof getAllProducts === 'function' ? getAllProducts() : []);
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
        return [];
    }
    const terms = normalizedQuery.split(' ').filter(Boolean);
    const scored = list
        .map((product) => {
            const hay = getProductSearchHaystack(product);
            const nameHay = normalizeSearchText(product.name + ' ' + product.id);
            let score = 0;
            terms.forEach((term) => {
                if (!hay.includes(term)) {
                    return;
                }
                score += 10;
                if (nameHay.includes(term)) {
                    score += 20;
                }
                if (normalizeSearchText(product.id).includes(term)) {
                    score += 15;
                }
            });
            const allMatch = terms.every((term) => hay.includes(term));
            return allMatch ? { product, score } : null;
        })
        .filter(Boolean);

    scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, 'vi'));
    return scored.map((item) => item.product);
}

function buildSearchResultsUrl(query) {
    const base =
        typeof window !== 'undefined' && window.location.pathname.includes('/blog/')
            ? '/tim-kiem.html'
            : SITE_SEARCH_PAGE;
    return `${base}?q=${encodeURIComponent(query.trim())}`;
}

function getSearchQueryFromUrl() {
    return new URLSearchParams(window.location.search).get('q') || '';
}
