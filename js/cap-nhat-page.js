(function () {
    const grid = document.getElementById('cap-nhat-grid');
    if (!grid) return;

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function productUrl(row) {
        const id = row.webId || row.id;
        return id ? `product.html?id=${encodeURIComponent(id)}` : '#';
    }

    function priceLabel(row) {
        if (row.directRetailFmt && row.directRetailFmt !== '—') {
            return `Từ ${row.directRetailFmt}/cái`;
        }
        return 'Liên hệ báo giá';
    }

    function renderVariantChip(v) {
        const img = v.images && v.images[0] ? v.images[0] : 'image/favicon.png';
        const label = v.variantLabel || v.folder.split('/').pop();
        return `
            <a href="${productUrl(v)}" class="cap-nhat-variant-chip" title="${escapeHtml(label)}">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async"
                     onerror="this.onerror=null;this.src='image/favicon.png';">
                <span>${escapeHtml(label)}</span>
                <em>${escapeHtml(priceLabel(v))}</em>
            </a>`;
    }

    function renderGroupCard(group) {
        if (group.type === 'variants') {
            const firstImg = group.variants[0]?.images?.[0] || 'image/favicon.png';
            const chips = group.variants.map(renderVariantChip).join('');
            return `
                <article class="cap-nhat-card cap-nhat-card--group" role="listitem">
                    <figure class="cap-nhat-card-img">
                        <img src="${escapeHtml(firstImg)}" alt="${escapeHtml(group.folder)}" loading="lazy" decoding="async"
                             onerror="this.onerror=null;this.src='image/favicon.png';">
                    </figure>
                    <div class="cap-nhat-card-body">
                        <h3>${escapeHtml(group.folder)} <span class="cap-nhat-badge">${group.variantCount} màu</span></h3>
                        <p class="cap-nhat-group-meta">Cân đóng hàng: <strong>${group.packWeightG ? group.packWeightG + 'g' : '—'}</strong> · ${escapeHtml(group.priceSummary)}/cái</p>
                        <div class="cap-nhat-variants" role="list">${chips}</div>
                    </div>
                </article>`;
        }

        const p = group;
        const img = p.images && p.images[0] ? p.images[0] : 'image/favicon.png';
        const detail = productUrl(p);
        return `
            <article class="cap-nhat-card" role="listitem">
                <a href="${detail}" class="cap-nhat-card-link">
                    <figure class="cap-nhat-card-img">
                        <img src="${escapeHtml(img)}" alt="${escapeHtml(p.folder)}" loading="lazy" decoding="async"
                             onerror="this.onerror=null;this.src='image/favicon.png';">
                    </figure>
                </a>
                <div class="cap-nhat-card-body">
                    <h3><a href="${detail}">${escapeHtml(p.folder)}</a></h3>
                    <dl class="cap-nhat-meta">
                        <div><dt>Cân đóng hàng</dt><dd>${p.packWeightG ? p.packWeightG + 'g' : '—'}</dd></div>
                        <div><dt>Giá lẻ</dt><dd class="cap-nhat-price">${escapeHtml(priceLabel(p))}</dd></div>
                    </dl>
                    <a href="${detail}" class="cap-nhat-btn-detail">Xem chi tiết →</a>
                </div>
            </article>`;
    }

    fetch('data/cap-nhat-catalog.json')
        .then((r) => {
            if (!r.ok) throw new Error('Không tải được danh sách mẫu');
            return r.json();
        })
        .then((data) => {
            const groups = (data.groups || []).slice();
            grid.innerHTML = groups.length
                ? groups.map(renderGroupCard).join('')
                : '<p class="cap-nhat-error">Chưa có mẫu để hiển thị.</p>';
        })
        .catch((err) => {
            grid.innerHTML = `<p class="cap-nhat-error">Lỗi tải dữ liệu: ${escapeHtml(err.message)}</p>`;
        });
})();
