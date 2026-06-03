/** Đường dẫn thumbnail (-thumb.jpg) cho lưới sản phẩm. */
function getThumbUrl(imagePath) {
    if (!imagePath || /\.(mp4|webm)$/i.test(imagePath)) {
        return imagePath;
    }
    if (/-thumb\.(jpe?g)$/i.test(imagePath)) {
        return imagePath;
    }
    return imagePath.replace(/(\.jpe?g)$/i, '-thumb$1');
}

/** Ảnh gallery từ manifest (không dò HTTP). */
function getProductGalleryImages(productId) {
    if (typeof getManifestImages === 'function') {
        return getManifestImages(productId) || [];
    }
    return [];
}
