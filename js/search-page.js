document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('search-product-grid');
    const title = document.getElementById('search-results-title');
    const lead = document.getElementById('search-results-lead');
    const empty = document.getElementById('search-empty');
    if (!grid || typeof searchProducts !== 'function' || typeof displayProducts !== 'function') {
        return;
    }

    const query = getSearchQueryFromUrl().trim();
    if (!query) {
        title.textContent = 'Tìm mẫu hộp bánh Trung Thu';
        lead.textContent = 'Dùng ô tìm ở đầu trang — gõ tên mẫu, số bánh (4 bánh, 6 mini), hoặc từ khóa như hộp cứng, ép kim, thỏ đỏ.';
        empty.hidden = true;
        return;
    }

    const results = searchProducts(query);
    document.title = `Tìm "${query}" — hộp Trung Thu | Vân Thắng`;

    if (!results.length) {
        title.textContent = `Không có kết quả cho “${query}”`;
        lead.textContent = '';
        grid.innerHTML = '';
        empty.hidden = false;
        return;
    }

    title.textContent = `${results.length} mẫu cho “${query}”`;
    lead.textContent = 'Bấm ảnh xem chi tiết hoặc Mua Shopee / Zalo báo giá sỉ.';
    empty.hidden = true;
    displayProducts(grid, results, 0, { secondaryAction: 'shopee', showThumbnails: true });
});
