/** Thẻ sản phẩm kiểu cap-nhat-2026 — dùng chung trang chủ & trang cập nhật. */
function escapeCatalogHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getCatalogThumbStripImages(product, max = 4) {
    const id = product.webId || product.id;
    let gallery = [];
    if (id && typeof getProductGalleryImages === 'function') {
        gallery = getProductGalleryImages(id) || [];
    }
    if (!gallery.length && product.images && product.images.length) {
        gallery = product.images.slice();
    }
    if (gallery.length >= 2) {
        return gallery.slice(0, max);
    }
    const main = (product.images && product.images[0]) || product.thumbnail;
    return main ? [main] : [];
}

function renderCatalogThumbStripHtml(product, max = 4) {
    const images = getCatalogThumbStripImages(product, max);
    if (images.length < 2) return '';

    const imgs = images
        .map((src) => {
            const thumb = typeof getThumbUrl === 'function' ? getThumbUrl(src) : src;
            const fallback =
                typeof toRootAssetUrl === 'function' ? toRootAssetUrl(src) : src;
            return `<img src="${escapeCatalogHtml(thumb)}" alt="" width="52" height="52" loading="lazy" decoding="async" aria-hidden="true" onerror="this.onerror=null;this.src='${escapeCatalogHtml(fallback)}';">`;
        })
        .join('');

    return `<div class="cap-nhat-card-thumbs" aria-hidden="true">${imgs}</div>`;
}

function catalogProductUrl(row) {
    const id = row.webId || row.id;
    return id ? `/product.html?id=${encodeURIComponent(id)}` : '#';
}

function parsePackWeightG(product) {
    if (product.packWeightG) return product.packWeightG;
    const desc = product.description || '';
    const m = desc.match(/Cân nặng đóng hàng:\s*(\d+)\s*g/i);
    if (m) return parseInt(m[1], 10);
    const text = `${product.id || ''} ${product.name || ''}`.toLowerCase();
    if (/4.?banh.?re|4b.?re/.test(text)) return 250;
    if (/6.?banh|6b-mini|6x/.test(text)) return 330;
    if (/1.?banh.*to|300.*600|180g/.test(text)) return 180;
    if (/1.?banh|cho.?be|khay/.test(text)) return 50;
    if (/4.?banh/.test(text)) return 330;
    return null;
}

function formatCatalogRetailLabel(product) {
    if (product.directRetailFmt && product.directRetailFmt !== '—') {
        return `Từ ${product.directRetailFmt}/cái`;
    }
    const price = (product.price || '').trim();
    if (!price || /liên hệ/i.test(price)) return 'Liên hệ báo giá';
    const numbers = (price.match(/\d[\d.]*/g) || [])
        .map((n) => parseInt(n.replace(/\./g, ''), 10))
        .filter((n) => n > 0);
    if (!numbers.length) return price;
    let max = Math.max(...numbers);
    const text = `${product.id || ''} ${product.name || ''} ${price}`.toLowerCase();
    if (max < 1000 && /k/.test(text)) max *= 1000;
    const fmt = `${max.toLocaleString('vi-VN')}đ`;
    return `Từ ${fmt}/cái`;
}

function renderCapNhatVariantChipHtml(v) {
    const img = v.images && v.images[0] ? v.images[0] : v.thumbnail || 'image/favicon.png';
    const thumb = typeof getThumbUrl === 'function' ? getThumbUrl(img) : img;
    const label = v.variantLabel || v.folder || v.name || '';
    const price = formatCatalogRetailLabel(v);
    return `
        <a href="${catalogProductUrl(v)}" class="cap-nhat-variant-chip" title="${escapeCatalogHtml(label)}">
            <img src="${escapeCatalogHtml(thumb)}" alt="${escapeCatalogHtml(label)}" loading="lazy" decoding="async"
                 onerror="this.onerror=null;this.src='image/favicon.png';">
            <span>${escapeCatalogHtml(label)}</span>
            <em>${escapeCatalogHtml(price)}</em>
        </a>`;
}

function renderCapNhatGroupCardHtml(group) {
    if (group.type === 'variants') {
        const firstImg = group.variants[0]?.images?.[0] || group.variants[0]?.thumbnail || 'image/favicon.png';
        const thumb = typeof getThumbUrl === 'function' ? getThumbUrl(firstImg) : firstImg;
        const chips = group.variants.map(renderCapNhatVariantChipHtml).join('');
        const thumbStrip = renderCatalogThumbStripHtml(group.variants[0] || group);
        return `
            <article class="cap-nhat-card cap-nhat-card--group" role="listitem">
                <figure class="cap-nhat-card-img">
                    <img src="${escapeCatalogHtml(thumb)}" alt="${escapeCatalogHtml(group.folder)}" loading="lazy" decoding="async"
                         onerror="this.onerror=null;this.src='image/favicon.png';">
                </figure>
                ${thumbStrip}
                <div class="cap-nhat-card-body">
                    <h3>${escapeCatalogHtml(group.folder)} <span class="cap-nhat-badge">${group.variantCount} màu</span></h3>
                        <p class="cap-nhat-group-meta">Cân đóng hàng: <strong>${group.packWeightG ? group.packWeightG + 'g' : '—'}</strong>${group.packSizeText ? ` · KT: ${escapeCatalogHtml(group.packSizeText)}` : ''} · ${escapeCatalogHtml(group.priceSummary)}/cái</p>
                    <div class="cap-nhat-variants" role="list">${chips}</div>
                </div>
            </article>`;
    }

    return renderCapNhatProductCardHtml(group);
}

function renderCapNhatProductCardHtml(product, options = {}) {
    const rawImg = (product.images && product.images[0]) || product.thumbnail || 'image/favicon.png';
    const img = typeof getThumbUrl === 'function' ? getThumbUrl(rawImg) : rawImg;
    const fallback =
        typeof toRootAssetUrl === 'function'
            ? toRootAssetUrl(product.thumbnail || rawImg || 'image/favicon.png')
            : product.thumbnail || rawImg || 'image/favicon.png';
    const detail = catalogProductUrl(product);
    const packG = parsePackWeightG(product);
    const sizeText = typeof getPackSizeText === 'function' ? getPackSizeText(product) : (product.packSizeText || '');
    const title = product.name || product.folder || '';
    const loading = options.priorityImage ? 'eager' : 'lazy';
    const fetchP = options.priorityImage ? ' fetchpriority="high"' : '';
    const priceLabel = formatCatalogRetailLabel(product);
    const thumbStrip = renderCatalogThumbStripHtml(product);

    return `
        <article class="cap-nhat-card" role="listitem">
            <a href="${detail}" class="cap-nhat-card-link">
                <figure class="cap-nhat-card-img">
                    <img src="${escapeCatalogHtml(img)}" alt="${escapeCatalogHtml(title)}" loading="${loading}" decoding="async"${fetchP}
                         onerror="this.onerror=null;this.src='${escapeCatalogHtml(fallback)}';">
                </figure>
            </a>
            ${thumbStrip}
            <div class="cap-nhat-card-body">
                <h3><a href="${detail}">${escapeCatalogHtml(title)}</a></h3>
                <dl class="cap-nhat-meta">
                    <div><dt>Cân đóng hàng</dt><dd>${packG ? packG + 'g' : '—'}</dd></div>
                    ${sizeText ? `<div><dt>Kích thước</dt><dd class="cap-nhat-size">${escapeCatalogHtml(sizeText)}</dd></div>` : ''}
                    <div><dt>Giá lẻ</dt><dd class="cap-nhat-price">${escapeCatalogHtml(priceLabel)}</dd></div>
                </dl>
                <a href="${detail}" class="cap-nhat-btn-detail">Xem chi tiết →</a>
            </div>
        </article>`;
}
