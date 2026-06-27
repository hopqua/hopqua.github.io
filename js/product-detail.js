let currentImageIndex = 0;
let productImages = [];

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        showProductMissingId();
        if (typeof loadDeferredGtag === 'function') loadDeferredGtag();
        return;
    }

    const product = getProductById(productId);

    if (!product) {
        showProductNotFound();
        if (typeof loadDeferredGtag === 'function') loadDeferredGtag();
        return;
    }

    const breadcrumbName = document.getElementById('product-breadcrumb-name');
    if (breadcrumbName) breadcrumbName.textContent = product.name;
    document.title = product.name + ' | Hộp Bánh Trung Thu Vân Thắng';

    updateMetaTags(product);
    displayProductInfo(product);

    const imagesContainer = document.getElementById('product-images');
    loadProductImages(product, imagesContainer);

    renderRelatedProductsSection(product);

    const communityEl = document.getElementById('product-community');
    if (communityEl && typeof renderCommunityLinksBlock === 'function') {
        if (typeof runWhenIdle === 'function') {
            runWhenIdle(() => {
                communityEl.innerHTML = renderCommunityLinksBlock('full');
            });
        } else {
            communityEl.innerHTML = renderCommunityLinksBlock('full');
        }
    }

    setupGalleryNavigation();
    setupMobileBuyBar(product);
    attachZaloTracking(product);

    if (typeof loadDeferredGtag === 'function') {
        loadDeferredGtag();
    }
});

function showProductMissingId() {
    const root = document.getElementById('product-info');
    const breadcrumbName = document.getElementById('product-breadcrumb-name');
    if (breadcrumbName) breadcrumbName.textContent = 'Chọn sản phẩm';
    if (root) {
        root.innerHTML = `
            <div class="pd-not-found">
                <p>Chưa chọn sản phẩm. Vui lòng quay lại trang chủ và chọn một mẫu hộp.</p>
                <a href="index.html" class="pd-btn pd-btn-zalo" style="max-width:280px;margin:0 auto;">← Về danh sách sản phẩm</a>
            </div>
        `;
    }
}

function showProductNotFound() {
    const root = document.getElementById('product-info');
    const breadcrumbName = document.getElementById('product-breadcrumb-name');
    if (breadcrumbName) breadcrumbName.textContent = 'Không tìm thấy';
    if (root) {
        root.innerHTML = `
            <div class="pd-not-found">
                <p>Không tìm thấy sản phẩm.</p>
                <a href="index.html" class="pd-btn pd-btn-outline">← Về trang chủ</a>
            </div>
        `;
    }
}

function displayProductInfo(product) {
    const productInfoElement = document.getElementById('product-info');
    if (!productInfoElement) {
        return;
    }

    const badges = getProductBadges(product)
        .map((b) => `<span class="product-badge ${b.className}">${b.label}</span>`)
        .join('');
    const seasonBadge = product.season
        ? `<span class="season-badge season-${product.season.replace(/\s+/g, '-')}">${product.season === 'trung thu' ? 'Trung Thu' : 'Tết'}</span>`
        : '';
    const zaloUrl = buildZaloUrl(product);
    const postedMeta = renderProductPostedMeta(product);

    productInfoElement.innerHTML = `
        <div class="pd-gallery-col">
            <div class="pd-gallery-card">
                <div class="gallery-container pd-viewer">
                    <div class="product-images pd-viewer-stage" id="product-images"></div>
                    <div class="gallery-counter" id="gallery-counter">1 / 1</div>
                    <button type="button" class="gallery-nav prev-btn" id="gallery-prev" aria-label="Ảnh trước">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button type="button" class="gallery-nav next-btn" id="gallery-next" aria-label="Ảnh sau">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
                <p class="pd-gallery-hint">Chạm ảnh để phóng to · Vuốt thumbnail bên dưới</p>
                <div class="gallery-indicators pd-thumbs" id="gallery-indicators"></div>
            </div>
        </div>
        <aside class="pd-buy-col pd-sidebar">
            <div class="pd-buy-head">
                <h1 class="pd-title">${product.name}</h1>
                ${typeof renderCapNhatVariantPickerHtml === 'function' ? renderCapNhatVariantPickerHtml(product.id) : ''}
                ${postedMeta ? `<p class="pd-posted-meta">${postedMeta}</p>` : ''}
                ${badges || seasonBadge ? `<div class="pd-badges">${badges}${seasonBadge}</div>` : ''}
                <div class="pd-price-box">
                    <span class="pd-price-label">Giá tham khảo</span>
                    <p class="pd-price">${product.price}</p>
                </div>
            </div>
            <div class="pd-rfq-wrap" id="bao-gia">
                <div id="pd-rfq-mount"></div>
            </div>
            <div class="pd-buy-foot">
                <div class="pd-actions pd-actions--quick">
                    <a href="${getShopeeUrl(product)}" target="_blank" rel="noopener" class="pd-btn pd-btn-shopee">
                        Mua lẻ Shopee
                    </a>
                    <a href="${zaloUrl}" target="_blank" rel="noopener" class="pd-btn pd-btn-zalo pd-btn--outline" id="zalo-buy-btn">
                        Chat Zalo
                    </a>
                </div>
                ${renderProductTrustMini()}
                <a href="index.html" class="pd-btn pd-btn-outline pd-btn--back">← Xem thêm mẫu khác</a>
            </div>
        </aside>
        <section class="pd-details-section" aria-labelledby="pd-details-title">
            <h2 id="pd-details-title" class="pd-details-title">Chi tiết mẫu</h2>
            <div class="pd-desc-panel">
                <div class="pd-desc">${renderProductDescriptionHtml(product.description)}</div>
            </div>
        </section>
    `;

    if (typeof mountRfq === 'function') {
        mountRfq('pd-rfq-mount', {
            formId: 'pd-rfq-form',
            productId: product.id,
            productName: product.name,
            variant: 'product',
            title: 'Gọi lại báo giá mẫu này',
            lead: 'Để SĐT — shop gọi tư vấn giá sỉ & số lượng. Mua lẻ 1–10 cái: dùng Shopee bên trên.',
        });
    }
}

function attachZaloTracking(product) {
    document.querySelectorAll('#zalo-buy-btn').forEach((btn) => {
        btn.addEventListener('click', () => trackZaloClick(product));
    });
}

function setupMobileBuyBar(product) {
    const bar = document.getElementById('pd-mobile-bar');
    if (!bar) return;

    const zaloUrl = buildZaloUrl(product);
    bar.hidden = false;
    bar.removeAttribute('aria-hidden');
    bar.innerHTML = `
        <a href="#bao-gia" class="pd-mobile-btn pd-mobile-rfq">Để SĐT báo giá</a>
        <a href="${getShopeeUrl(product)}" target="_blank" rel="noopener" class="pd-mobile-btn pd-mobile-shopee">Shopee</a>
    `;
}

function updateMetaTags(product) {
    const metaDesc = buildProductMetaDescription(product);
    const canonicalProductUrl = getCanonicalProductUrl(product);
    const canonicalImageUrl = getAbsoluteUrl(product.thumbnail);
    const pageTitle = `${product.name} | Hộp Bánh Trung Thu Vân Thắng`;

    document.title = pageTitle;
    setMetaContent('#meta-description', metaDesc);
    setMetaContent('meta[property="og:title"]', pageTitle);
    setMetaContent('meta[property="og:description"]', metaDesc);
    setMetaContent('meta[property="og:image"]', canonicalImageUrl);
    setMetaContent('meta[property="og:url"]', canonicalProductUrl);
    setMetaContent('meta[name="twitter:title"]', pageTitle);
    setMetaContent('meta[name="twitter:description"]', metaDesc);
    setMetaContent('meta[name="twitter:image"]', canonicalImageUrl);

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.setAttribute('href', canonicalProductUrl);

    injectJsonLd(buildProductJsonLd(product), 'product-json-ld');
    injectJsonLd(buildProductBreadcrumbJsonLd(product), 'breadcrumb-json-ld');
}

function resolveGalleryPaths(product) {
    const paths = [];
    const seen = new Set();

    function add(path) {
        if (!path || seen.has(path)) return;
        seen.add(path);
        paths.push(path);
    }

    if (product.videos && product.videos.length) {
        product.videos.forEach(add);
    }

    const manifest = getProductGalleryImages(product.id);
    if (manifest.length) {
        manifest.forEach(add);
        return paths;
    }

    buildFallbackImagePaths(product).forEach(add);
    return paths;
}

function buildFallbackImagePaths(product) {
    const basePath = `image/${product.folder}`;
    const result = [];

    if (product.id === 'tui-dung-banh-trung-thu-sz-9-10-11') {
        [3, 4, 5, 6, 12, 13, 14, 15, 16, 17, 18].forEach((n) => {
            result.push(`${basePath}/tui-dung-banh-trung-thu-sz-91011-${n}.jpg`);
        });
        return result;
    }

    if (product.id === 'hoa-vien-do-4-banh-re') {
        [1, 2, 3, 4].forEach((n) => result.push(`${basePath}/hoa-vien-do-4-banh-re-${n}.jpg`));
        return result;
    }

    if (product.id === 'hop-lam-cuc-4-6-banh') {
        for (let i = 1; i <= 5; i++) result.push(`${basePath}/hop-lam-cuc-4-6-banh-${i}.jpg`);
        for (let i = 1; i <= 22; i++) {
            result.push(`${basePath}/vo-hop-trung-thu-lam-cuc-4-banh-tra-6-banh-them-anh-${i}.jpg`);
        }
        return result;
    }

    const folderParts = product.folder.split('/');
    const subFolder = folderParts[folderParts.length - 1];
    const max = product.folder.includes('18-06-2025') || product.folder.includes('26-5-2026') || product.folder.includes('11-06-2026') ? 15 : 12;

    for (let i = 1; i <= max; i++) {
        result.push(`${basePath}/${subFolder}-${i}.jpg`);
    }

    if (!product.folder.includes('/')) {
        for (let i = 1; i <= max; i++) {
            result.push(`${basePath}/${product.id}-${i}.jpg`);
        }
    }

    return result;
}

function loadProductImages(product, container) {
    productImages = resolveGalleryPaths(product);
    currentImageIndex = 0;

    if (!container) {
        return;
    }

    container.innerHTML = '';

    const indicatorsContainer = document.getElementById('gallery-indicators');
    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
    }

    if (productImages.length > 0) {
        displayImage(0);
    } else {
        container.innerHTML = '<p>Không tìm thấy ảnh sản phẩm.</p>';
    }

    createGalleryIndicators();
    updateGalleryNavVisibility();
}

function updateGalleryNavVisibility() {
    const hide = productImages.length <= 1;
    ['gallery-prev', 'gallery-next'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.hidden = hide;
    });
}

function displayImage(index) {
    if (index < 0 || index >= productImages.length) {
        return;
    }

    currentImageIndex = index;

    const counterElement = document.getElementById('gallery-counter');
    if (counterElement) {
        counterElement.textContent = `${index + 1} / ${productImages.length}`;
    }

    const imagesContainer = document.getElementById('product-images');
    if (!imagesContainer) {
        return;
    }

    const src = productImages[index];

    if (src.match(/\.(mp4|webm)$/i)) {
        renderGalleryVideo(imagesContainer, src, index);
    } else {
        renderGalleryImage(imagesContainer, src, index);
    }

    updateGalleryIndicators(index);
    scrollThumbnailIntoView(index, false);
}

function renderGalleryVideo(container, src, index) {
    container.innerHTML = '';
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.className = 'video-player';
    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);
    container.appendChild(video);
}

function renderGalleryImage(container, src, index) {
    if (container.querySelector('video')) {
        container.innerHTML = '';
    }

    let img = container.querySelector('img.pd-main-image');
    const fullSrc = new URL(src, window.location.href).href;

    if (!img) {
        container.innerHTML = '';
        img = document.createElement('img');
        img.className = 'product-image pd-main-image';
        img.width = 800;
        img.height = 600;
        img.decoding = 'async';
        img.addEventListener('click', function() {
            openLightbox(productImages[currentImageIndex], `Sản phẩm - Hình ${currentImageIndex + 1}`);
        });
        container.appendChild(img);
    }

    img.alt = `Sản phẩm - Hình ${index + 1}`;
    if (index === 0) {
        img.fetchPriority = 'high';
    }

    img.onerror = function handleBrokenImage() {
        productImages.splice(index, 1);
        updateGalleryNavVisibility();
        if (productImages.length > 0) {
            displayImage(Math.min(index, productImages.length - 1));
            createGalleryIndicators();
        } else {
            container.innerHTML = '<p class="pd-gallery-empty">Không có ảnh hiển thị.</p>';
        }
    };

    if (img.src === fullSrc) {
        img.classList.remove('is-loading');
        return;
    }

    img.classList.add('is-loading');
    img.onload = function() {
        img.classList.remove('is-loading');
    };
    img.src = src;
}

function scrollThumbnailIntoView(index, smoothScroll) {
    const indicatorsContainer = document.getElementById('gallery-indicators');
    const thumbnails = indicatorsContainer?.children;

    if (thumbnails && thumbnails[index]) {
        thumbnails[index].scrollIntoView({
            behavior: smoothScroll ? 'smooth' : 'auto',
            inline: 'center',
            block: 'nearest'
        });
    }
}

function createGalleryIndicators() {
    const indicatorsContainer = document.getElementById('gallery-indicators');
    if (!indicatorsContainer) return;

    indicatorsContainer.innerHTML = '';

    if (productImages.length <= 1) {
        indicatorsContainer.style.display = 'none';
        return;
    }

    indicatorsContainer.style.display = 'flex';

    productImages.forEach((src, index) => {
        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'thumb-container';

        if (src.match(/\.(mp4|webm)$/i)) {
            const badge = document.createElement('span');
            badge.className = 'thumb-video-badge';
            badge.textContent = '▶';
            badge.title = 'Video';
            thumbContainer.appendChild(badge);
            thumbContainer.addEventListener('click', () => {
                displayImage(index);
                scrollThumbnailIntoView(index, true);
            });
            indicatorsContainer.appendChild(thumbContainer);
            return;
        }

        const thumb = document.createElement('img');
        thumb.dataset.fullSrc = src;
        thumb.dataset.loaded = 'false';
        thumb.alt = `Thumbnail ${index + 1}`;
        thumb.title = `Xem ảnh ${index + 1}`;
        thumb.width = 80;
        thumb.height = 80;
        thumb.loading = 'lazy';
        thumb.decoding = 'async';

        if (index === currentImageIndex) {
            thumb.classList.add('active');
        }

        thumb.addEventListener('click', () => {
            displayImage(index);
            scrollThumbnailIntoView(index, true);
        });
        thumbContainer.appendChild(thumb);
        indicatorsContainer.appendChild(thumbContainer);
    });

    loadVisibleGalleryThumbs();
    setupGalleryThumbObserver();
}

let galleryThumbObserver = null;

function setupGalleryThumbObserver() {
    const indicatorsContainer = document.getElementById('gallery-indicators');
    if (!indicatorsContainer || galleryThumbObserver) {
        return;
    }

    galleryThumbObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadGalleryThumbImg(entry.target);
                }
            });
        },
        { root: indicatorsContainer, rootMargin: '80px' }
    );

    indicatorsContainer.querySelectorAll('img[data-full-src]').forEach((img) => {
        galleryThumbObserver.observe(img);
    });
}

function loadVisibleGalleryThumbs() {
    const indicatorsContainer = document.getElementById('gallery-indicators');
    if (!indicatorsContainer) return;

    indicatorsContainer.querySelectorAll('img[data-full-src]').forEach((img) => {
        const rect = img.getBoundingClientRect();
        const parentRect = indicatorsContainer.getBoundingClientRect();
        if (rect.right >= parentRect.left - 100 && rect.left <= parentRect.right + 100) {
            loadGalleryThumbImg(img);
        }
    });

    const active = indicatorsContainer.querySelector('img.active[data-full-src]');
    if (active) {
        loadGalleryThumbImg(active);
    }
}

function loadGalleryThumbImg(thumb) {
    if (thumb.dataset.loaded === 'true') {
        return;
    }
    thumb.dataset.loaded = 'true';
    thumb.src = getThumbUrl(thumb.dataset.fullSrc);
    thumb.onerror = function() {
        thumb.src = thumb.dataset.fullSrc;
    };
}

function updateGalleryIndicators(activeIndex) {
    const indicatorsContainer = document.getElementById('gallery-indicators');
    if (!indicatorsContainer) return;

    const thumbContainers = indicatorsContainer.children;

    for (let i = 0; i < thumbContainers.length; i++) {
        const thumb = thumbContainers[i].querySelector('img');
        if (thumb) {
            if (i === activeIndex) {
                thumb.classList.add('active');
                loadGalleryThumbImg(thumb);
            } else {
                thumb.classList.remove('active');
            }
        }
    }
}

function setupGalleryNavigation() {
    const prevButton = document.getElementById('gallery-prev');
    const nextButton = document.getElementById('gallery-next');

    if (prevButton) {
        prevButton.addEventListener('click', navigatePrevImage);
    }

    if (nextButton) {
        nextButton.addEventListener('click', navigateNextImage);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigatePrevImage();
        } else if (e.key === 'ArrowRight') {
            navigateNextImage();
        }
    });
}

function navigatePrevImage() {
    let newIndex = currentImageIndex - 1;
    if (newIndex < 0) {
        newIndex = productImages.length - 1;
    }
    displayImage(newIndex);
}

function navigateNextImage() {
    let newIndex = currentImageIndex + 1;
    if (newIndex >= productImages.length) {
        newIndex = 0;
    }
    displayImage(newIndex);
}

function openLightbox(imageSrc, imageAlt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';

    const content = document.createElement('div');
    content.className = 'lightbox-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-lightbox';
    closeBtn.innerHTML = '&times;';

    const img = document.createElement('img');
    img.alt = imageAlt;
    img.decoding = 'async';
    img.src = imageSrc;

    content.appendChild(closeBtn);
    content.appendChild(img);
    lightbox.appendChild(content);
    document.body.appendChild(lightbox);

    setTimeout(() => {
        lightbox.style.opacity = '1';
    }, 50);

    closeBtn.addEventListener('click', function() {
        lightbox.style.opacity = '0';
        setTimeout(() => lightbox.remove(), 300);
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.style.opacity = '0';
            setTimeout(() => lightbox.remove(), 300);
        }
    });
}
