(function () {
    const grid = document.getElementById('cap-nhat-grid');
    if (!grid || typeof renderCapNhatGroupCardHtml !== 'function') return;

    fetch('data/cap-nhat-catalog.json')
        .then((r) => {
            if (!r.ok) throw new Error('Không tải được danh sách mẫu');
            return r.json();
        })
        .then((data) => {
            const groups = (data.groups || []).slice();
            grid.innerHTML = groups.length
                ? groups.map(renderCapNhatGroupCardHtml).join('')
                : '<p class="cap-nhat-error">Chưa có mẫu để hiển thị.</p>';
        })
        .catch((err) => {
            const msg = typeof escapeCatalogHtml === 'function' ? escapeCatalogHtml(err.message) : err.message;
            grid.innerHTML = `<p class="cap-nhat-error">Lỗi tải dữ liệu: ${msg}</p>`;
        });
})();
