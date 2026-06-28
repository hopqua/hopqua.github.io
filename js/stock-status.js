/** AUTO-GENERATED — scripts/apply-stock-status.py (2026-06-28) */
const STOCK_STATUS_META = {
  "generated": "2026-06-28",
  "hiddenCount": 36,
  "hidden": [
    "6b-mini-san-hn-3x",
    "ho-diep-29-35k",
    "hoa-vien-do-4-banh-re",
    "hoa-vien-re-do",
    "hong-nguyet-vien-cam",
    "hop-1-banh",
    "hop-6-banh-mini-tho-ngoc-do",
    "hop-6-banh-mini-tho-ngoc-vang",
    "hop-cong-tuoc-150-250g-28-33k",
    "hop-duat-van-14-17k",
    "hop-lam-cuc-4-6-banh",
    "hop-lan-vu-4-banh",
    "hop-lien-ngu-4-banh",
    "hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac",
    "hop-sen-phu-quy-4-banh-re",
    "hop-song-hac-6-banh",
    "hop-song-nguyet-4-6-banh",
    "khai-phuc-29-35k",
    "khay-6b-mini-khay-1-banh-lon-100d-5000d",
    "khay-tui-pet",
    "lan-vu-re-linh",
    "nam-su-hong-150-250g-23-29k",
    "ngoc-hoa-cam-4-banh",
    "nguyet-yen-1x",
    "phu-quy-29-35k",
    "song-nguyet-4-6-banh",
    "tho-xanh-duong-4-banh-29k-35k",
    "vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k",
    "vo-banh-trung-thu-sen-toa-4-banh-20-25k",
    "vo-hop-banh-trung-thu-hon-viet-4-banh-4-banh-tra-6-banh-26k-39k",
    "vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k",
    "vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k",
    "vo-hop-trung-thu-lan-vu-4-banh-re-16-20k",
    "vo-hop-trung-thu-mini-4-banh-6-banh-quai-da-13-18k",
    "vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k",
    "vo-hop-trung-thu-vong-hac-4-banh-26-33k"
  ]
};
const OUT_OF_STOCK_IDS = new Set(STOCK_STATUS_META.hidden);

function isProductListed(product) {
    if (!product || !product.id) return false;
    return !OUT_OF_STOCK_IDS.has(product.id);
}

function patchProductAccess() {
    if (typeof getAllProducts !== 'function') return;
    const origAll = getAllProducts;
    getAllProducts = function () {
        return origAll().filter(isProductListed);
    };
    if (typeof getProductById === 'function') {
        const origOne = getProductById;
        getProductById = function (id) {
            if (OUT_OF_STOCK_IDS.has(id)) return undefined;
            return origOne(id);
        };
    }
}

if (typeof getAllProducts === 'function') {
    patchProductAccess();
} else {
    document.addEventListener('DOMContentLoaded', patchProductAccess);
}
