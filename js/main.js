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

    if (typeof renderHomeBlogSection === 'function') {
        renderHomeBlogSection();
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

