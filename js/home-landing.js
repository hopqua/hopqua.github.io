/** Landing trang chủ — khối sản phẩm từ data/home-landing.json (quản trị). */
const HOME_LANDING_JSON_URL = 'data/home-landing.json';

const HOME_LANDING_DEFAULTS = {
    sections: [
        {
            key: 'mau-hot',
            anchorId: 'mau-hot',
            gridId: 'landing-hot-grid',
            eyebrow: '– Món quà được đề cử –',
            title: 'Chào đón Trung Thu 2026',
            subtitle:
                'Sản phẩm hot cho mùa Trung Thu — Hoàng Kim, hộp cứng, 6 mini bán chạy nhất.',
            productIds: [
                'hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k',
                'thien-hoa-van-nguyet-4-banh-re-175k-24k',
                'hop-cung-gap-gon-6x',
                '6-banh-mini-kim-son-cam-20k-26k',
            ],
            fallbackFilter: null,
            limit: 4,
        },
        {
            key: 'hop-4-banh',
            anchorId: 'hop-4-banh',
            gridId: 'landing-hop-4-grid',
            eyebrow: '– Hộp quà Trung Thu –',
            title: 'Hộp 4 bánh',
            subtitle:
                'Vỏ hộp đựng 4 bánh truyền thống — ép kim, hoa văn nguyệt hoa, thỏ quý tộc…',
            productIds: [],
            fallbackFilter: { boxType: 'hop-4-banh' },
            limit: 4,
        },
        {
            key: 'hop-6-banh',
            anchorId: 'hop-6-banh',
            gridId: 'landing-hop-6-grid',
            eyebrow: '– Set quà gia đình –',
            title: 'Hộp 6 bánh & mini',
            subtitle:
                'Hộp 6 bánh và 6 mini — phù hợp set quà gia đình, tiệm bánh và đại lý.',
            productIds: [],
            fallbackFilter: { boxType: ['hop-6-banh', 'mini'] },
            limit: 4,
        },
        {
            key: 'hop-cung',
            anchorId: 'hop-cung',
            gridId: 'landing-hop-cung-grid',
            eyebrow: '– Hộp quà cao cấp –',
            title: 'Hộp cứng cao cấp',
            subtitle: 'Hộp cứng gấp gọn, sang trọng — tặng đối tác, doanh nghiệp và khách VIP.',
            productIds: [],
            fallbackFilter: { boxMaterial: 'hop-cung' },
            limit: 4,
        },
        {
            key: 'phu-kien',
            anchorId: 'phu-kien',
            gridId: 'landing-phu-kien-grid',
            eyebrow: '– Đủ bộ đóng hàng –',
            title: 'Phụ kiện bánh Trung Thu',
            subtitle: 'Khay, túi, dao nĩa, hút ẩm — phụ kiện đi kèm hộp bánh mùa Trung Thu.',
            productIds: [],
            fallbackFilter: { boxType: 'phu-kien-banh' },
            limit: 4,
        },
    ],
};

function normalizeHomeLandingConfig(raw) {
    const defaults = HOME_LANDING_DEFAULTS.sections;
    const byKey = {};
    defaults.forEach((section) => {
        byKey[section.key] = { ...section };
    });

    (raw && raw.sections ? raw.sections : []).forEach((section) => {
        const key = section.key;
        if (!key || !byKey[key]) return;
        byKey[key] = {
            ...byKey[key],
            ...section,
            productIds: Array.isArray(section.productIds)
                ? section.productIds.filter(Boolean)
                : byKey[key].productIds,
        };
    });

    return { sections: defaults.map((section) => byKey[section.key]) };
}

function loadHomeLandingConfig() {
    return fetch(HOME_LANDING_JSON_URL)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
        .then((data) => normalizeHomeLandingConfig(data));
}

function renderShopTileHtml(product, options = {}) {
    if (!product || typeof escapeCatalogHtml !== 'function') return '';

    const rawImg =
        (typeof pickProductThumbnail === 'function' && pickProductThumbnail(product)) ||
        product.thumbnail ||
        'image/favicon.png';
    const img = typeof getThumbUrl === 'function' ? getThumbUrl(rawImg) : rawImg;
    const fallback =
        typeof toRootAssetUrl === 'function' ? toRootAssetUrl(rawImg) : rawImg;
    const detail =
        typeof catalogProductUrl === 'function'
            ? catalogProductUrl(product)
            : `/p/${encodeURIComponent(product.id)}/`;
    const title = product.name || product.id || '';
    const price =
        typeof formatCatalogRetailLabel === 'function'
            ? formatCatalogRetailLabel(product)
            : product.price || 'Liên hệ';
    const loading = options.priorityImage ? 'eager' : 'lazy';
    const fetchP = options.priorityImage ? ' fetchpriority="high"' : '';

    let badge = '';
    if (product.isNew || (typeof isCatalogRecent === 'function' && isCatalogRecent(product))) {
        badge = '<span class="shop-tile-badge shop-tile-badge--new">Mới</span>';
    } else if (product.thich) {
        badge = '<span class="shop-tile-badge shop-tile-badge--hot">Hot</span>';
    }

    return `
        <article class="shop-tile" role="listitem">
            <a href="${detail}" class="shop-tile-link">
                <figure class="shop-tile-img">
                    ${badge}
                    <img src="${escapeCatalogHtml(img)}" alt="${escapeCatalogHtml(title)}" width="320" height="320" loading="${loading}" decoding="async"${fetchP}
                         onerror="this.onerror=null;this.src='${escapeCatalogHtml(fallback)}';">
                </figure>
                <h3 class="shop-tile-title">${escapeCatalogHtml(title)}</h3>
                <p class="shop-tile-price">${escapeCatalogHtml(price)}</p>
            </a>
        </article>`;
}

function matchLandingFilter(product, filter) {
    if (!filter) return true;

    if (filter.boxType) {
        const types = Array.isArray(filter.boxType) ? filter.boxType : [filter.boxType];
        if (!types.includes(product.boxType)) return false;
    }

    if (filter.boxMaterial && product.boxMaterial !== filter.boxMaterial) {
        return false;
    }

    if (filter.tier && product.tier !== filter.tier) {
        return false;
    }

    return true;
}

function pickLandingProducts(allProducts, filter, limit = 4) {
    let list = allProducts.filter((p) => matchLandingFilter(p, filter));
    if (typeof sortCatalogForHome === 'function') {
        list = sortCatalogForHome(list);
    }
    return list.slice(0, limit);
}

function resolveLandingProducts(allProducts, section) {
    const limit = section.limit || 4;
    const ids = section.productIds || [];
    const byId = new Map(allProducts.map((p) => [p.id, p]));

    if (ids.length) {
        const picked = ids.map((id) => byId.get(id)).filter(Boolean);
        if (picked.length >= limit) {
            return picked.slice(0, limit);
        }
        if (picked.length && !section.fallbackFilter) {
            return picked;
        }
        if (picked.length && section.fallbackFilter) {
            const seen = new Set(picked.map((p) => p.id));
            const extra = pickLandingProducts(allProducts, section.fallbackFilter, limit).filter(
                (p) => !seen.has(p.id)
            );
            return picked.concat(extra).slice(0, limit);
        }
    }

    if (section.fallbackFilter) {
        return pickLandingProducts(allProducts, section.fallbackFilter, limit);
    }

    return allProducts.slice(0, limit);
}

function applyLandingSectionCopy(section) {
    const root = document.getElementById(section.anchorId);
    if (!root) return;

    const eyebrow = root.querySelector('.landing-section-eyebrow');
    const title = root.querySelector('.landing-section-title');
    const subtitle = root.querySelector('.landing-section-sub');

    if (eyebrow && section.eyebrow) eyebrow.textContent = section.eyebrow;
    if (title && section.title) title.textContent = section.title;
    if (subtitle && section.subtitle) subtitle.textContent = section.subtitle;

    const viewAll = section.viewAll;
    if (!viewAll || !viewAll.label) return;

    const actions = root.querySelector('.landing-section-actions');
    if (!actions) return;

    if (viewAll.type === 'link' && viewAll.href) {
        actions.innerHTML = `<a href="${viewAll.href}" class="landing-view-all">${escapeCatalogHtml(viewAll.label)}</a>`;
        return;
    }

    if (viewAll.type === 'filter' && viewAll.filter) {
        const filterJson = JSON.stringify(viewAll.filter).replace(/'/g, '&#39;');
        actions.innerHTML = `<button type="button" class="landing-view-all" data-landing-filter='${filterJson}'>${escapeCatalogHtml(viewAll.label)}</button>`;
    }
}

function renderLandingGrid(gridId, products) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    if (!products.length) {
        grid.innerHTML =
            '<p class="landing-grid-empty">Đang cập nhật mẫu — xem <a href="#danh-muc">toàn bộ danh mục</a>.</p>';
        return;
    }

    grid.innerHTML = products
        .map((product, index) => renderShopTileHtml(product, { priorityImage: index === 0 }))
        .join('');
}

function applyCatalogFilterFromLanding(filter) {
    const filtersEl = document.getElementById('catalog-filters');
    if (!filtersEl) return;

    if (filter.boxType) {
        const type = Array.isArray(filter.boxType) ? filter.boxType[0] : filter.boxType;
        const btn = filtersEl.querySelector(`[data-filter-type="${type}"]`);
        if (btn) btn.click();
    }

    if (filter.boxMaterial) {
        const btn = filtersEl.querySelector(`[data-filter-material="${filter.boxMaterial}"]`);
        if (btn) btn.click();
    }

    if (filter.tier) {
        const btn = filtersEl.querySelector(`[data-filter-tier="${filter.tier}"]`);
        if (btn) btn.click();
    }
}

function scrollToCatalogWithFilter(filter) {
    const target = document.getElementById('danh-muc');
    if (!target) return;

    const tryApply = () => {
        if (typeof getCatalogProducts === 'function' && getCatalogProducts().length) {
            applyCatalogFilterFromLanding(filter);
        }
    };

    tryApply();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(tryApply, 400);
    window.setTimeout(tryApply, 1200);
}

function bindLandingViewAllButtons() {
    document.querySelectorAll('[data-landing-filter]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            let filter = {};
            try {
                filter = JSON.parse(btn.dataset.landingFilter || '{}');
            } catch (_err) {
                filter = {};
            }
            scrollToCatalogWithFilter(filter);
        });
    });
}

function initHomeLanding() {
    if (typeof loadCatalogProducts !== 'function') return;

    Promise.all([loadCatalogProducts(), loadHomeLandingConfig()])
        .then(([products, config]) => {
            config.sections.forEach((section) => {
                applyLandingSectionCopy(section);
                const list = resolveLandingProducts(products, section);
                renderLandingGrid(section.gridId, list);
            });
            bindLandingViewAllButtons();
        })
        .catch(() => {
            const gridIds = HOME_LANDING_DEFAULTS.sections.map((s) => s.gridId);
            gridIds.forEach((id) => {
                const grid = document.getElementById(id);
                if (grid) {
                    grid.innerHTML =
                        '<p class="landing-grid-empty">Không tải được mẫu — <a href="#danh-muc">xem danh mục</a>.</p>';
                }
            });
            bindLandingViewAllButtons();
        });
}

document.addEventListener('DOMContentLoaded', initHomeLanding);
