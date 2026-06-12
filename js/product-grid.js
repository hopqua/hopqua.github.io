function displayProducts(container, productsToDisplay, globalStartIndex = 0) {
    if (!container || !productsToDisplay.length) return;

    productsToDisplay.forEach((product, localIndex) => {
        const globalIndex = globalStartIndex + localIndex;
        const cardThumb = getThumbUrl(product.thumbnail);
        const isPriority = globalIndex < 4;
        const badges = getProductBadges(product);
        const zaloUrl = buildZaloUrl(product);
        const detailUrl = `product.html?id=${encodeURIComponent(product.id)}`;

        const productCard = document.createElement('article');
        productCard.className = 'product-card';
        productCard.setAttribute('role', 'listitem');

        if (product.season) {
            productCard.classList.add(`season-${product.season.replace(/\s+/g, '-')}`);
        }

        const thumbnails = getProductThumbnailImages(product);
        const thumbnailsHtml = thumbnails
            .map((src) => {
                const thumbSrc = getThumbUrl(src);
                return `<img src="${thumbSrc}" alt="" width="50" height="50" loading="lazy" decoding="async" aria-hidden="true" onerror="this.onerror=null; this.src='${src}';">`;
            })
            .join('');

        const seasonBadge = product.season
            ? `<span class="season-badge season-${product.season.replace(' ', '-')}">${product.season === 'trung thu' ? 'Trung Thu' : 'Tết'}</span>`
            : '';

        const badgesHtml = badges
            .map((b) => `<span class="product-badge ${b.className}">${b.label}</span>`)
            .join('');

        const loadingAttr = isPriority ? 'eager' : 'lazy';
        const fetchPriority = isPriority ? ' fetchpriority="high"' : '';
        const shortDesc =
            product.description.length > 72
                ? product.description.substring(0, 72) + '…'
                : product.description;
        const postedMeta = renderProductPostedMeta(product);

        productCard.innerHTML = `
            <a href="${detailUrl}" class="product-card-link">
                <div class="product-image-container">
                    <img src="${cardThumb}" alt="${product.name}" width="400" height="320" loading="${loadingAttr}" decoding="async"${fetchPriority} onerror="this.onerror=null; this.src='${product.thumbnail}';">
                    ${seasonBadge}
                    ${badgesHtml ? `<div class="product-badges">${badgesHtml}</div>` : ''}
                </div>
                <div class="product-thumbnails" aria-hidden="true">${thumbnailsHtml}</div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    ${postedMeta}
                    <p class="product-price">${product.price}</p>
                    <p class="product-short-desc">${shortDesc}</p>
                </div>
            </a>
            <div class="product-card-actions">
                <a href="${detailUrl}" class="btn-detail">Xem mẫu</a>
                <a href="${zaloUrl}" target="_blank" rel="noopener" class="btn-zalo-card" data-product-id="${product.id}">Zalo báo giá</a>
            </div>
        `;

        const zaloBtn = productCard.querySelector('.btn-zalo-card');
        zaloBtn.addEventListener('click', () => trackZaloClick(product));

        container.appendChild(productCard);
    });
}

function getProductThumbnailImages(product) {
    const gallery = getProductGalleryImages(product.id);
    if (gallery.length >= 2) {
        return gallery.slice(0, 3);
    }
    return [product.thumbnail];
}
