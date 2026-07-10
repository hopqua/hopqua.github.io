document.addEventListener('DOMContentLoaded', function () {
    const catalogRoot = document.getElementById('product-catalog');
    if (catalogRoot) {
        initCatalogFilters();
    }

    const ctaZalo = document.getElementById('cta-zalo-main');
    if (ctaZalo) {
        ctaZalo.addEventListener('click', () => trackZaloClick(null));
    }

    const headerZalo = document.querySelector('.header-nav-zalo, .site-nav-zalo');
    if (headerZalo) {
        headerZalo.addEventListener('click', () => trackZaloClick(null));
    }

    const blogSection = document.querySelector('.home-blog-section');
    if (blogSection && typeof renderHomeBlogSection === 'function') {
        observeWhenNear(blogSection, renderHomeBlogSection, '200px 0px');
    }

    const communityEl = document.getElementById('community-section-home');
    if (communityEl && typeof renderCommunityLinksBlock === 'function') {
        runWhenIdle(() => {
            communityEl.innerHTML = renderCommunityLinksBlock('full');
        });
    }

    if (typeof loadDeferredGtag === 'function') {
        loadDeferredGtag();
    }
});

function initCatalogFilters() {
    const filtersEl = document.getElementById('catalog-filters');
    const grid = document.getElementById('catalog-grid');
    const meta = document.getElementById('catalog-results-meta');
    const empty = document.getElementById('catalog-empty');
    const resetBtn = document.getElementById('catalog-filter-reset');
    const loadMoreWrap = document.getElementById('catalog-load-more-wrap');
    const loadMoreBtn = document.getElementById('catalog-load-more');

    if (
        !filtersEl ||
        !grid ||
        typeof loadCatalogProducts !== 'function' ||
        typeof displayProducts !== 'function'
    ) {
        return;
    }

    let activeTier = 'all';
    let activeType = 'all';
    let activeMaterial = 'all';
    let filteredList = [];
    let visibleCount = 0;
    let catalogReady = false;

    function syncActivePills() {
        filtersEl.querySelectorAll('[data-filter-tier]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filterTier === activeTier);
        });
        filtersEl.querySelectorAll('[data-filter-type]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filterType === activeType);
        });
        filtersEl.querySelectorAll('[data-filter-material]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filterMaterial === activeMaterial);
        });
    }

    function buildResultsLabel(list, shown) {
        const parts = [];
        if (activeTier !== 'all' && typeof TIER_LABELS !== 'undefined') {
            parts.push(TIER_LABELS[activeTier]);
        }
        if (activeType !== 'all' && typeof BOX_CATEGORY_LABELS !== 'undefined') {
            parts.push(BOX_CATEGORY_LABELS[activeType]);
        }
        if (activeMaterial !== 'all' && typeof BOX_MATERIAL_LABELS !== 'undefined') {
            parts.push(BOX_MATERIAL_LABELS[activeMaterial]);
        }
        const filterText = parts.length ? parts.join(' · ') : 'Tất cả mẫu';
        if (shown < list.length) {
            return `Đang xem ${shown}/${list.length} mẫu — ${filterText}`;
        }
        return `${list.length} mẫu — ${filterText}`;
    }

    function updateLoadMoreUi() {
        const remaining = filteredList.length - visibleCount;
        if (!loadMoreWrap || !loadMoreBtn) return;

        if (remaining > 0) {
            loadMoreWrap.hidden = false;
            const next = Math.min(CATALOG_PAGE_SIZE, remaining);
            loadMoreBtn.textContent = `Xem thêm ${next} mẫu (${remaining} còn lại)`;
        } else {
            loadMoreWrap.hidden = true;
        }
    }

    function renderNextPage({ reset = false } = {}) {
        if (!filteredList.length) return;

        const start = reset ? 0 : visibleCount;
        const page = filteredList.slice(start, start + CATALOG_PAGE_SIZE);

        if (reset) {
            grid.innerHTML = '';
            visibleCount = 0;
        }

        displayProducts(grid, page, visibleCount, { layout: 'cap-nhat' });
        visibleCount += page.length;

        if (meta) meta.textContent = buildResultsLabel(filteredList, visibleCount);
        updateLoadMoreUi();
    }

    function applyFilters() {
        const hasFilter = activeTier !== 'all' || activeType !== 'all' || activeMaterial !== 'all';

        if (resetBtn) {
            resetBtn.hidden = !hasFilter;
        }

        if (!catalogReady) {
            if (meta) meta.textContent = 'Đang tải mẫu…';
            return;
        }

        filteredList =
            typeof filterHomeCatalog === 'function'
                ? filterHomeCatalog({
                      tier: activeTier,
                      boxType: activeType,
                      boxMaterial: activeMaterial,
                  })
                : getCatalogProducts();

        if (!filteredList.length) {
            grid.innerHTML = '';
            visibleCount = 0;
            if (meta) meta.textContent = '0 mẫu — thử bộ lọc khác';
            if (empty) empty.hidden = false;
            if (loadMoreWrap) loadMoreWrap.hidden = true;
            return;
        }

        if (empty) empty.hidden = true;
        renderNextPage({ reset: true });
    }

    function resetFilters() {
        activeTier = 'all';
        activeType = 'all';
        activeMaterial = 'all';
        syncActivePills();
        applyFilters();
    }

    filtersEl.addEventListener('click', (e) => {
        const tierBtn = e.target.closest('[data-filter-tier]');
        const typeBtn = e.target.closest('[data-filter-type]');
        const materialBtn = e.target.closest('[data-filter-material]');

        if (tierBtn) {
            activeTier = tierBtn.dataset.filterTier || 'all';
            syncActivePills();
            applyFilters();
            return;
        }

        if (typeBtn) {
            activeType = typeBtn.dataset.filterType || 'all';
            syncActivePills();
            applyFilters();
            return;
        }

        if (materialBtn) {
            activeMaterial = materialBtn.dataset.filterMaterial || 'all';
            syncActivePills();
            applyFilters();
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            renderNextPage({ reset: false });
            loadMoreBtn.blur();
        });
    }

    loadCatalogProducts()
        .then(() => {
            catalogReady = true;
            applyFilters();
        })
        .catch(() => {
            if (meta) meta.textContent = 'Không tải được danh mục — thử tải lại trang';
            if (empty) {
                empty.hidden = false;
                empty.textContent = 'Không tải được danh mục mẫu. Kiểm tra kết nối mạng rồi tải lại trang.';
            }
        });
}
