document.addEventListener('DOMContentLoaded', function () {
    const catalogRoot = document.getElementById('product-catalog');
    if (!catalogRoot) return;

    const sections = getCatalogSections();
    let globalIndex = 0;

    sections.forEach((section) => {
        const sectionEl = document.createElement('section');
        sectionEl.className = 'catalog-section';
        sectionEl.id = section.id;

        const subtitleHtml = section.subtitle
            ? `<p class="catalog-section-subtitle">${section.subtitle}</p>`
            : '';

        sectionEl.innerHTML = `
            <h2 class="catalog-section-title">${section.title}</h2>
            ${subtitleHtml}
            <div class="product-grid" role="list"></div>
        `;

        const grid = sectionEl.querySelector('.product-grid');
        displayProducts(grid, section.products, globalIndex);
        globalIndex += section.products.length;

        catalogRoot.appendChild(sectionEl);
    });

    const firstProduct = sections[0] && sections[0].products[0];
    if (firstProduct && firstProduct.thumbnail) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = getThumbUrl(firstProduct.thumbnail);
        document.head.appendChild(link);
    }

    setupTierNav();

    const ctaZalo = document.getElementById('cta-zalo-main');
    if (ctaZalo) {
        ctaZalo.addEventListener('click', () => trackZaloClick(null));
    }

    const headerZalo = document.querySelector('.header-nav-zalo');
    if (headerZalo) {
        headerZalo.addEventListener('click', () => trackZaloClick(null));
    }
});

function setupTierNav() {
    const nav = document.getElementById('catalog-nav');
    if (!nav) return;

    nav.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

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
                return `<img src="${thumbSrc}" alt="" width="50" height="50" loading="lazy" decoding="async" aria-hidden="true">`;
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
