/** Phân loại dòng sản phẩm (1 bánh, 4 bánh, …) để gợi ý cùng loại. */
const PRODUCT_LINE_LABELS = {
    '4-banh-re': 'Cùng dòng hộp 4 bánh rẻ',
    '4-banh': 'Cùng loại hộp 4 bánh',
    '4-6-banh': 'Cùng loại hộp 4–6 bánh',
    '6-banh': 'Cùng loại hộp 6 bánh',
    '6-banh-mini': 'Cùng loại hộp 6 bánh mini',
    '2-banh': 'Cùng loại hộp 2 bánh',
    '1-banh-to': 'Cùng loại hộp 1 bánh to',
    '1-banh': 'Cùng loại hộp 1 bánh',
    'phu-kien': 'Phụ kiện liên quan',
    other: 'Mẫu tương tự',
};

function normLineText(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function getProductLineType(product) {
    if (!product) return 'other';

    const text = normLineText(`${product.name} ${product.id}`);
    const desc = normLineText(product.description || '');

    if (/4 banh re|4b re|4-ban?h-re|250g \(4 banh re\)/.test(text + ' ' + desc)) {
        return '4-banh-re';
    }
    if (/2 banh|hop-2-banh|2-banh|20g \(2 banh/.test(text + ' ' + desc)) {
        return '2-banh';
    }
    if (/1 banh to|banh-to|300g|600g|180g \(1 banh to\)/.test(text + ' ' + desc)) {
        return '1-banh-to';
    }
    if (/6 banh mini|6b mini|6-banh-mini|6 mini/.test(text)) {
        return '6-banh-mini';
    }
    if (/4[\s-]*6 banh|4-6-banh|hop-lam-cuc/.test(text)) {
        return '4-6-banh';
    }
    if (/6 banh|6-banh|hop-cung-6|hop-6-banh/.test(text)) {
        return '6-banh';
    }
    if (/4 banh|4-banh|4b-/.test(text)) {
        return '4-banh';
    }
    if (/(^|[^0-9])1 banh|hop-1-banh|1-banh|cho be|50g \(1 banh\)/.test(text + ' ' + desc)) {
        return '1-banh';
    }
    if (product.category === 'phụ kiện') {
        return 'phu-kien';
    }
    return 'other';
}

function getProductLineLabel(lineType) {
    return PRODUCT_LINE_LABELS[lineType] || PRODUCT_LINE_LABELS.other;
}

function getVariantSiblingProducts(productId) {
    if (typeof getCapNhatVariantGroup !== 'function' || typeof getProductById !== 'function') {
        return [];
    }
    const group = getCapNhatVariantGroup(productId);
    if (!group) return [];
    return group.variants
        .map((v) => getProductById(v.id))
        .filter((p) => p && p.id !== productId);
}

function getRelatedProducts(product, limit = 6) {
    if (!product || typeof products === 'undefined') return [];

    const line = getProductLineType(product);
    const siblings = getVariantSiblingProducts(product.id);
    const pool =
        line === 'other'
            ? products.filter(
                  (p) =>
                      p.id !== product.id &&
                      p.category === product.category &&
                      p.season === product.season
              )
            : products.filter((p) => p.id !== product.id && getProductLineType(p) === line);

    const seen = new Set([product.id]);
    const out = [];

    function push(p) {
        if (!p || seen.has(p.id) || out.length >= limit) return;
        seen.add(p.id);
        out.push(p);
    }

    siblings.forEach(push);
    pool.forEach(push);
    return out;
}

function renderRelatedProductsSection(product) {
    const related = getRelatedProducts(product, 6);
    if (!related.length || typeof displayProducts !== 'function') return;

    const line = getProductLineType(product);
    const title = getProductLineLabel(line);
    const host = document.getElementById('product-related');
    const grid = document.getElementById('product-related-grid');
    if (!host || !grid) return;

    host.hidden = false;
    host.removeAttribute('aria-hidden');
    const titleEl = host.querySelector('.pd-related-title');
    if (titleEl) titleEl.textContent = title;

    displayProducts(grid, related, 0, { secondaryAction: 'shopee', showThumbnails: false });
}
