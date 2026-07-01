/** Đường dẫn thumbnail (-thumb.jpg) cho lưới sản phẩm. */
function toRootAssetUrl(path) {
    if (!path) return path;
    if (/^https?:\/\//i.test(path)) return path;
    return `/${String(path).replace(/^\.\//, '').replace(/^\//, '')}`;
}

/** Ảnh đại diện SP: thumbnail → gallery → manifest → đoán từ folder. */
function pickProductThumbnail(product) {
    if (!product) return '';
    const thumb = String(product.thumbnail || '').trim();
    if (thumb) return thumb;

    const fromList = (product.images || []).find((p) => /\.jpe?g$/i.test(p))
        || (product.images && product.images[0]);
    if (fromList) return fromList;

    const id = product.id || product.webId || product.sku;
    if (id && typeof getManifestImages === 'function') {
        const manifest = getManifestImages(id) || [];
        const fromManifest = manifest.find((p) => /\.jpe?g$/i.test(p)) || manifest[0];
        if (fromManifest) return fromManifest;
    }

    const folder = String(product.folder || id || '').replace(/\/$/, '');
    if (folder) {
        const leaf = folder.split('/').pop();
        return `image/${folder}/${leaf}-1.jpg`;
    }
    return '';
}

function getThumbUrl(imagePath) {
    if (!imagePath || /\.(mp4|webm)$/i.test(imagePath)) {
        return imagePath;
    }
    if (/-thumb\.(jpe?g)$/i.test(imagePath)) {
        return toRootAssetUrl(imagePath);
    }
    return toRootAssetUrl(imagePath.replace(/(\.jpe?g)$/i, '-thumb$1'));
}

/** Ảnh gallery từ manifest (không dò HTTP). */
function getProductGalleryImages(productId) {
    if (typeof getManifestImages === 'function') {
        return getManifestImages(productId) || [];
    }
    return [];
}
