document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('blog-product-grid');
    const idsEl = document.getElementById('blog-product-ids');
    if (!grid || !idsEl || typeof displayProducts !== 'function' || typeof getProductById !== 'function') {
        return;
    }

    let ids;
    try {
        ids = JSON.parse(idsEl.textContent);
    } catch (e) {
        return;
    }

    const products = ids.map((id) => getProductById(id)).filter(Boolean);
    displayProducts(grid, products, 0);
});
