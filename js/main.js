document.addEventListener('DOMContentLoaded', function () {
    const catalogRoot = document.getElementById('product-catalog');
    if (catalogRoot) {
        initCatalogFilters();
    }

    const ctaZalo = document.getElementById('cta-zalo-main');
    if (ctaZalo) {
        ctaZalo.addEventListener('click', () => trackZaloClick(null));
    }

    const headerZalo = document.querySelector('.header-nav-zalo');
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

    if (!filtersEl || !grid || typeof getAllProducts !== 'function' || typeof displayProducts !== 'function') {
        return;
    }

    let activeTier = 'all';
    let activeType = 'all';

    function syncActivePills() {
        filtersEl.querySelectorAll('[data-filter-tier]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filterTier === activeTier);
        });
        filtersEl.querySelectorAll('[data-filter-type]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.filterType === activeType);
        });
    }

    function buildResultsLabel(list) {
        const parts = [];
        if (activeTier !== 'all' && typeof TIER_LABELS !== 'undefined') {
            parts.push(TIER_LABELS[activeTier]);
        }
        if (activeType !== 'all' && typeof BOX_CATEGORY_LABELS !== 'undefined') {
            parts.push(BOX_CATEGORY_LABELS[activeType]);
        }
        const filterText = parts.length ? parts.join(' · ') : 'Tất cả mẫu';
        return `${list.length} mẫu — ${filterText}`;
    }

    function applyFilters() {
        const list =
            typeof filterCatalogProducts === 'function'
                ? filterCatalogProducts({ tier: activeTier, boxType: activeType })
                : getAllProducts();

        grid.innerHTML = '';
        const hasFilter = activeTier !== 'all' || activeType !== 'all';

        if (resetBtn) {
            resetBtn.hidden = !hasFilter;
        }

        if (!list.length) {
            if (meta) meta.textContent = '0 mẫu — thử bộ lọc khác';
            if (empty) empty.hidden = false;
            return;
        }

        if (empty) empty.hidden = true;
        if (meta) meta.textContent = buildResultsLabel(list);
        displayProducts(grid, list, 0, { layout: 'cap-nhat' });
    }

    function resetFilters() {
        activeTier = 'all';
        activeType = 'all';
        syncActivePills();
        applyFilters();
    }

    filtersEl.addEventListener('click', (e) => {
        const tierBtn = e.target.closest('[data-filter-tier]');
        const typeBtn = e.target.closest('[data-filter-type]');

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
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    applyFilters();
}
