function displayProducts(container, productsToDisplay, globalStartIndex = 0, options = {}) {
    if (!container || !productsToDisplay.length) return;

    if (options.layout === 'cap-nhat' && typeof renderCapNhatProductCardHtml === 'function') {
        productsToDisplay.forEach((product, localIndex) => {
            const globalIndex = globalStartIndex + localIndex;
            container.insertAdjacentHTML(
                'beforeend',
                renderCapNhatProductCardHtml(product, { priorityImage: globalIndex < 2 })
            );
        });
        return;
    }

    const useShopee = options.secondaryAction === 'shopee' && typeof getShopeeUrl === 'function';
    const showThumbnails = options.showThumbnails === true;

    productsToDisplay.forEach((product, localIndex) => {
        const globalIndex = globalStartIndex + localIndex;
        const fullThumb = toRootAssetUrl(pickProductThumbnail(product));
        const cardThumb = getThumbUrl(pickProductThumbnail(product));
        const isPriority = globalIndex < 2;
        const badges = getProductBadges(product);
        const zaloUrl = buildZaloUrl(product);
        const detailUrl =
            typeof buildProductPageUrl === 'function'
                ? buildProductPageUrl(product).replace(/^https?:\/\/[^/]+/, '')
                : `/p/${encodeURIComponent(product.id)}/`;
        const secondaryBtnHtml = useShopee
            ? `<a href="${getShopeeUrl(product)}" target="_blank" rel="noopener sponsored" class="btn-shopee-card">Mua Shopee</a>`
            : `<a href="${zaloUrl}" target="_blank" rel="noopener" class="btn-zalo-card" data-product-id="${product.id}">Zalo báo giá</a>`;

        const productCard = document.createElement('article');
        productCard.className = 'product-card';
        productCard.setAttribute('role', 'listitem');

        if (product.season) {
            productCard.classList.add(`season-${product.season.replace(/\s+/g, '-')}`);
        }

        const thumbnails = showThumbnails ? getProductThumbnailImages(product) : [];
        const thumbnailsHtml = thumbnails
            .map((src) => {
                const thumbSrc = getThumbUrl(src);
                return `<img src="${thumbSrc}" alt="" width="50" height="50" loading="lazy" decoding="async" aria-hidden="true" onerror="this.onerror=null; this.src='${toRootAssetUrl(src)}';">`;
            })
            .join('');
        const thumbnailsBlock = thumbnailsHtml
            ? `<div class="product-thumbnails" aria-hidden="true">${thumbnailsHtml}</div>`
            : '';

        const seasonBadge = product.season
            ? `<span class="season-badge season-${product.season.replace(' ', '-')}">${product.season === 'trung thu' ? 'Trung Thu' : 'Tết'}</span>`
            : '';

        const badgesHtml = badges
            .map((b) => `<span class="product-badge ${b.className}">${b.label}</span>`)
            .join('');

        const loadingAttr = isPriority ? 'eager' : 'lazy';
        const fetchPriority = isPriority ? ' fetchpriority="high"' : '';
        const intro = typeof getProductIntro === 'function'
            ? getProductIntro(product.description)
            : product.description;
        const shortDesc =
            intro.length > 72 ? intro.substring(0, 72) + '…' : intro;
        const postedMeta = renderProductPostedMeta(product);
        const priceLabel =
            typeof formatCatalogRetailLabel === 'function'
                ? formatCatalogRetailLabel(product)
                : product.price;

        productCard.innerHTML = `
            <a href="${detailUrl}" class="product-card-link">
                <div class="product-image-container">
                    <img src="${cardThumb}" alt="${product.name}" width="400" height="320" loading="${loadingAttr}" decoding="async"${fetchPriority} onerror="this.onerror=null; this.src='${fullThumb}';">
                    ${seasonBadge}
                    ${badgesHtml ? `<div class="product-badges">${badgesHtml}</div>` : ''}
                </div>
                ${thumbnailsBlock}
                <div class="product-info">
                    <h3>${product.name}</h3>
                    ${postedMeta}
                    <p class="product-price">${priceLabel}</p>
                    <p class="product-short-desc">${shortDesc}</p>
                </div>
            </a>
            <div class="product-card-actions">
                <a href="${detailUrl}" class="btn-detail">Xem mẫu</a>
                ${secondaryBtnHtml}
            </div>
        `;

        const zaloBtn = productCard.querySelector('.btn-zalo-card');
        if (zaloBtn) {
            zaloBtn.addEventListener('click', () => trackZaloClick(product));
        }

        container.appendChild(productCard);
    });
}

function getProductThumbnailImages(product) {
    const hero = pickProductThumbnail(product);
    const gallery = getProductGalleryImages(product.id);
    if (gallery.length >= 2) {
        const list = hero && !gallery.includes(hero) ? [hero, ...gallery] : gallery.slice();
        return list.slice(0, 3);
    }
    return hero ? [hero] : [];
}
