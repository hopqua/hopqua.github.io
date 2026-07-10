/** Landing trang chủ — layout kiểu shop (hopqua.com.vn) cho hộp Trung Thu. */
const LANDING_HOT_IDS = [
    'hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k',
    'thien-hoa-van-nguyet-4-banh-re-175k-24k',
    'hop-cung-gap-gon-6x',
    '6-banh-mini-kim-son-cam-20k-26k',
];

const LANDING_SECTIONS = [
    {
        gridId: 'landing-hop-4-grid',
        title: 'Hộp 4 bánh',
        subtitle: 'Vỏ hộp đựng 4 bánh — nhiều mẫu ép kim, hoa văn truyền thống',
        filter: { boxType: 'hop-4-banh' },
        viewAllLabel: 'Xem thêm hộp 4 bánh',
    },
    {
        gridId: 'landing-hop-6-grid',
        title: 'Hộp 6 bánh & mini',
        subtitle: 'Hộp 6 bánh, 6 mini — phù hợp set quà gia đình & tiệm bánh',
        filter: { boxType: ['hop-6-banh', 'mini'] },
        viewAllLabel: 'Xem thêm hộp 6 bánh',
    },
    {
        gridId: 'landing-hop-cung-grid',
        title: 'Hộp cứng cao cấp',
        subtitle: 'Hộp cứng gấp gọn, sang trọng — tặng đối tác & khách VIP',
        filter: { boxMaterial: 'hop-cung' },
        viewAllLabel: 'Xem thêm hộp cứng',
    },
    {
        gridId: 'landing-phu-kien-grid',
        title: 'Phụ kiện bánh Trung Thu',
        subtitle: 'Khay, túi, dao nĩa, hút ẩm — đủ bộ đóng hàng',
        filter: { boxType: 'phu-kien-banh' },
        viewAllLabel: 'Xem thêm phụ kiện',
    },
];

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
            : `/product.html?id=${encodeURIComponent(product.id)}`;
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
    return allProducts.filter((p) => matchLandingFilter(p, filter)).slice(0, limit);
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

    loadCatalogProducts()
        .then((products) => {
            let hotProducts = LANDING_HOT_IDS.map((id) =>
                products.find((p) => p.id === id)
            ).filter(Boolean);

            if (!hotProducts.length) {
                hotProducts = products.slice(0, 4);
            }

            renderLandingGrid('landing-hot-grid', hotProducts);

            LANDING_SECTIONS.forEach((section) => {
                const list = pickLandingProducts(products, section.filter, 4);
                renderLandingGrid(section.gridId, list);
            });
        })
        .catch(() => {
            ['landing-hot-grid', ...LANDING_SECTIONS.map((s) => s.gridId)].forEach((id) => {
                const grid = document.getElementById(id);
                if (grid) {
                    grid.innerHTML =
                        '<p class="landing-grid-empty">Không tải được mẫu — <a href="#danh-muc">xem danh mục</a>.</p>';
                }
            });
        });

    bindLandingViewAllButtons();
}

document.addEventListener('DOMContentLoaded', initHomeLanding);
