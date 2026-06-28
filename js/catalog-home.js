/** Trang chủ — catalog nhẹ từ data/products-catalog.json (lazy load). */
const CATALOG_JSON_URL = 'data/products-catalog.json';
const CATALOG_PAGE_SIZE = 24;

let catalogProducts = null;
let catalogLoadPromise = null;

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
            catalogProducts = (data.products || []).map(expandCatalogProduct);
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
