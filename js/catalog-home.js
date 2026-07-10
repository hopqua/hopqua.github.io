/** Trang chủ — catalog nhẹ từ data/products-catalog.json (lazy load). */
const CATALOG_JSON_URL = 'data/products-catalog.json';
const CATALOG_PAGE_SIZE = 24;

let catalogProducts = null;
let catalogLoadPromise = null;

function parsePostedFromFolder(folder) {
    if (!folder) return '';
    const m = String(folder).match(/^(\d{1,2})-(\d{1,2})-(\d{4})\//);
    if (!m) return '';
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function catalogPostedAt(product) {
    return product.postedAt || parsePostedFromFolder(product.folder) || '';
}

function isCatalogRecent(product) {
    if (product.isNew) return true;
    const posted = catalogPostedAt(product);
    if (!posted) return false;
    const d = new Date(`${posted}T12:00:00`);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.floor((today - d) / (24 * 60 * 60 * 1000));
    return diffDays >= 0 && diffDays <= 30;
}

function sortCatalogForHome(list) {
    return list.slice().sort((a, b) => {
        const aFav = !!a.thich;
        const bFav = !!b.thich;
        if (aFav !== bFav) return aFav ? -1 : 1;
        if (aFav && bFav && (a.thuTu || 9999) !== (b.thuTu || 9999)) {
            return (a.thuTu || 9999) - (b.thuTu || 9999);
        }
        const aNew = isCatalogRecent(a);
        const bNew = isCatalogRecent(b);
        if (aNew !== bNew) return aNew ? -1 : 1;
        const ap = catalogPostedAt(a);
        const bp = catalogPostedAt(b);
        if (ap !== bp) return bp.localeCompare(ap);
        return (a.name || a.id || '').localeCompare(b.name || b.id || '', 'vi');
    });
}

function expandCatalogProduct(item) {
    if (!item) return item;
    return {
        id: item.id,
        name: item.name,
        folder: item.folder,
        thumbnail: item.thumbnail,
        price: item.price,
        category: item.category,
        season: item.season,
        description: item.description || '',
        boxType: item.boxType,
        tier: item.tier,
        boxMaterial: item.boxMaterial,
        packWeightG: item.packWeightG,
        packSizeText: item.packSizeText,
        images: item.images,
        thich: !!item.thich,
        thuTu: item.thuTu,
        postedAt: item.postedAt || '',
        isNew: !!item.isNew,
    };
}

function loadCatalogProducts() {
    if (catalogProducts) {
        return Promise.resolve(catalogProducts);
    }
    if (catalogLoadPromise) {
        return catalogLoadPromise;
    }

    catalogLoadPromise = fetch(CATALOG_JSON_URL)
        .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then((data) => {
            catalogProducts = sortCatalogForHome((data.products || []).map(expandCatalogProduct));
            return catalogProducts;
        })
        .catch((err) => {
            catalogLoadPromise = null;
            throw err;
        });

    return catalogLoadPromise;
}

function getCatalogProducts() {
    return catalogProducts || [];
}

function filterHomeCatalog({ tier = 'all', boxType = 'all', boxMaterial = 'all' } = {}) {
    let list = getCatalogProducts();

    if (tier && tier !== 'all') {
        list = list.filter((p) => p.tier === tier);
    }
    if (boxType && boxType !== 'all') {
        list = list.filter((p) => p.boxType === boxType);
    }
    if (boxMaterial && boxMaterial !== 'all') {
        list = list.filter((p) => p.boxMaterial === boxMaterial);
    }

    return list;
}
