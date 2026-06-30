/** Meta OG theo ?id= — cập nhật meta có sẵn (không document.write, an toàn khi thiếu map). */
(function () {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var map = window.PRODUCT_OG_MAP;
    if (!id || !map || !map[id]) {
        return;
    }

    var site = window.PRODUCT_OG_SITE || 'https://hopqua.io.vn';
    var p = map[id];

    function setMeta(selector, value) {
        if (!value) return;
        var el = document.querySelector(selector);
        if (el) el.setAttribute('content', value);
    }

    var pageTitle = p.n + ' | Hộp Bánh Trung Thu Vân Thắng';
    var productUrl = site + '/product.html?id=' + encodeURIComponent(id);
    var imageUrl = site + '/' + String(p.t).replace(/^\//, '');

    document.title = pageTitle;
    setMeta('#meta-description', p.d);
    setMeta('meta[property="og:title"]', pageTitle);
    setMeta('meta[property="og:description"]', p.d);
    setMeta('meta[property="og:image"]', imageUrl);
    setMeta('meta[property="og:url"]', productUrl);
    setMeta('meta[name="twitter:title"]', pageTitle);
    setMeta('meta[name="twitter:description"]', p.d);
    setMeta('meta[name="twitter:image"]', imageUrl);

    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', productUrl);
})();
