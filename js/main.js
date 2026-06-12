document.addEventListener('DOMContentLoaded', function () {
    const catalogRoot = document.getElementById('product-catalog');
    if (!catalogRoot) return;

    initLazyCatalog(catalogRoot);
    setupTierNav();

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

function initLazyCatalog(catalogRoot) {
    const sections = getCatalogSections();
    const sectionEntries = [];
    let globalIndex = 0;

    sections.forEach((section, index) => {
        const sectionEl = document.createElement('section');
        sectionEl.className = 'catalog-section';
        sectionEl.id = section.id;
        sectionEl.dataset.catalogIndex = String(index);
        catalogRoot.appendChild(sectionEl);

        sectionEntries.push({
            sectionEl,
            section,
            startIndex: globalIndex,
        });
        globalIndex += section.products.length;
    });

    window.__catalogSections = sectionEntries;

    if (!sectionEntries.length) return;

    renderCatalogSection(sectionEntries[0].sectionEl, sectionEntries[0].section, sectionEntries[0].startIndex);
    sectionEntries[0].sectionEl.dataset.catalogLoaded = 'true';

    sectionEntries.slice(1).forEach((entry) => {
        renderCatalogPlaceholder(entry.sectionEl, entry.section);
        observeWhenNear(entry.sectionEl, () => {
            ensureCatalogSectionLoaded(entry.sectionEl);
        });
    });
}

function ensureCatalogSectionLoaded(sectionEl) {
    if (!sectionEl || sectionEl.dataset.catalogLoaded === 'true') return;

    const index = Number(sectionEl.dataset.catalogIndex);
    const entries = window.__catalogSections;
    if (!entries || Number.isNaN(index) || !entries[index]) return;

    sectionEl.dataset.catalogLoaded = 'true';
    const { section, startIndex } = entries[index];
    renderCatalogSection(sectionEl, section, startIndex);
}

function renderCatalogPlaceholder(sectionEl, section) {
    const subtitleHtml = section.subtitle
        ? `<p class="catalog-section-subtitle">${section.subtitle}</p>`
        : '';

    sectionEl.innerHTML = `
        <h2 class="catalog-section-title">${section.title}</h2>
        ${subtitleHtml}
        <div class="catalog-section-skeleton" aria-busy="true" aria-label="Đang tải danh sách mẫu"></div>
    `;
}

function renderCatalogSection(sectionEl, section, globalStartIndex) {
    const subtitleHtml = section.subtitle
        ? `<p class="catalog-section-subtitle">${section.subtitle}</p>`
        : '';

    sectionEl.innerHTML = `
        <h2 class="catalog-section-title">${section.title}</h2>
        ${subtitleHtml}
        <div class="product-grid" role="list"></div>
    `;

    const grid = sectionEl.querySelector('.product-grid');
    displayProducts(grid, section.products, globalStartIndex, { showThumbnails: false });
}

function setupTierNav() {
    const nav = document.getElementById('catalog-nav');
    if (!nav) return;

    nav.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                if (typeof ensureCatalogSectionLoaded === 'function') {
                    ensureCatalogSectionLoaded(target);
                }
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
