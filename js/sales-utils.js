const ZALO_PHONE = '0965671689';
const SHOPEE_SHOP_URL = 'https://shopee.vn/shop/169541002';
const SITE_ORIGIN = 'https://hopqua.github.io';
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/Torangesvn/';
const ZALO_GROUP_1_URL = 'https://zalo.me/g/vffwdx817';
const ZALO_GROUP_2_URL = 'https://zalo.me/g/qzfgvs076';

const TIER_LABELS = {
    budget: 'Giá tiết kiệm (dưới 25.000đ)',
    mid: 'Tầm trung (25.000đ – 50.000đ)',
    premium: 'Cao cấp (từ 50.000đ)'
};

function parsePriceMin(product) {
    const priceText = (product.price || '').toLowerCase();
    if (priceText.includes('liên hệ')) {
        return inferPriceFromSlug(product);
    }

    const numbers = [];
    const matches = (product.price || '').match(/\d[\d.]*/g) || [];
    matches.forEach((raw) => {
        const n = parseInt(raw.replace(/\./g, ''), 10);
        if (!isNaN(n) && n > 0) numbers.push(n);
    });

    if (numbers.length) {
        const min = Math.min(...numbers);
        const hasKSuffix =
            priceText.includes('k') ||
            /\d+\s*[-–]?\s*\d*\s*k/i.test(`${product.id} ${product.name}`);
        if (min < 1000 && hasKSuffix) return min * 1000;
        return min;
    }

    return inferPriceFromSlug(product);
}

function inferPriceFromSlug(product) {
    const text = `${product.id} ${product.name}`.toLowerCase();
    const kMatches = text.match(/(\d+)\s*[-–]?\s*(\d+)?\s*k/g);
    if (kMatches && kMatches.length) {
        const first = kMatches[0].match(/(\d+)/);
        if (first) return parseInt(first[1], 10) * 1000;
    }
    const plain = text.match(/(\d{2,3})\s*[-–]\s*(\d{2,3})k/);
    if (plain) return parseInt(plain[1], 10) * 1000;
    return 30000;
}

function getProductTier(product) {
    const min = parsePriceMin(product);
    if (min < 25000) return 'budget';
    if (min < 50000) return 'mid';
    return 'premium';
}

function isNew2026(product) {
    return product.folder && product.folder.startsWith('26-5-2026/');
}

function getProductBadges(product) {
    const badges = [];
    if (isNew2026(product)) badges.push({ label: 'Mới 2026', className: 'badge-new' });
    const text = `${product.name} ${product.id}`.toLowerCase();
    if (/4\s*banh|4-banh/.test(text)) badges.push({ label: '4 bánh', className: 'badge-4' });
    if (/6\s*banh|6-banh/.test(text)) badges.push({ label: '6 bánh', className: 'badge-6' });
    if (/hop\s*cung|cung\s*6|cung\s*4/.test(text)) badges.push({ label: 'Hộp cứng', className: 'badge-hard' });
    return badges;
}

function buildProductPageUrl(product) {
    return `${SITE_ORIGIN}/product.html?id=${encodeURIComponent(product.id)}`;
}

function buildZaloUrl(product) {
    const link = buildProductPageUrl(product);
    const message = `Xin chào Vân Thắng, em muốn hỏi giá mẫu: ${product.name}\nGiá web: ${product.price}\nLink: ${link}`;
    return `https://zalo.me/${ZALO_PHONE}?text=${encodeURIComponent(message)}`;
}

function trackZaloClick(product) {
    if (typeof gtag === 'function') {
        gtag('event', 'zalo_click', {
            event_category: 'conversion',
            event_label: product ? product.id : 'general'
        });
    }
}

function getHotProducts(limit = 12) {
    const newOnes = products.filter(isNew2026);
    if (newOnes.length >= limit) return newOnes.slice(0, limit);
    const featured = getFeaturedProducts(limit);
    const seen = new Set(newOnes.map((p) => p.id));
    const extra = featured.filter((p) => !seen.has(p.id));
    return [...newOnes, ...extra].slice(0, limit);
}

function getCatalogSections() {
    const hot = getHotProducts(12);
    const hotIds = new Set(hot.map((p) => p.id));
    const rest = getAllProducts().filter((p) => !hotIds.has(p.id));

    const sections = [
        { id: 'mau-hot', title: 'Mẫu mới & nổi bật 2026', subtitle: 'Ưu tiên đặt sớm mùa Trung Thu — tư vấn Zalo trong vài phút', products: hot }
    ];

    ['budget', 'mid', 'premium'].forEach((tier) => {
        const tierProducts = rest.filter((p) => getProductTier(p) === tier);
        if (tierProducts.length) {
            sections.push({
                id: `kho-${tier}`,
                title: TIER_LABELS[tier],
                subtitle: '',
                products: tierProducts
            });
        }
    });

    return sections;
}

function renderProductTrustBlock() {
    return `
        <ul class="product-trust-list">
            <li>Bán sỉ hộp bánh Trung Thu — nhiều mẫu 4 bánh, 6 bánh, hộp cứng</li>
            <li>Giá theo số lượng — nhắn Zalo để báo giá nhanh</li>
            <li>Mua lẻ trên Shopee hoặc đặt sỉ qua Zalo / điện thoại</li>
            <li>Ảnh & video thật từng mẫu — tư vấn chọn hộp phù hợp</li>
        </ul>
    `;
}

function renderProductTrustMini() {
    return `
        <ul class="pd-trust-mini">
            <li>Bán sỉ — nhiều mẫu 4 & 6 bánh</li>
            <li>Báo giá nhanh qua Zalo</li>
            <li>Mua lẻ trên Shopee</li>
        </ul>
    `;
}

function renderCommunityLinksBlock(variant = 'full') {
    const isCompact = variant === 'compact';
    const wrapClass = isCompact ? 'community-block community-block-compact' : 'community-block';
    const title = isCompact
        ? '<h3 class="community-title">Tham khảo thêm</h3>'
        : '<h2 class="community-title">Tham khảo & cộng đồng</h2>';
    const desc = isCompact
        ? '<p class="community-desc">Xem mẫu, ưu đãi và trao đổi trên fanpage & nhóm Zalo</p>'
        : '<p class="community-desc">Theo dõi fanpage và tham gia nhóm Zalo để xem mẫu mới, feedback khách và chương trình ưu đãi</p>';

    return `
        <section class="${wrapClass}" aria-label="Tham khảo cộng đồng">
            ${title}
            ${desc}
            <div class="community-links">
                <a href="${FACEBOOK_PAGE_URL}" target="_blank" rel="noopener noreferrer" class="community-card community-fb">
                    <span class="community-card-label">Facebook</span>
                    <span class="community-card-name">Fanpage Toranges</span>
                </a>
                <a href="${ZALO_GROUP_1_URL}" target="_blank" rel="noopener noreferrer" class="community-card community-zalo">
                    <span class="community-card-label">Zalo</span>
                    <span class="community-card-name">Nhóm Zalo 1</span>
                </a>
                <a href="${ZALO_GROUP_2_URL}" target="_blank" rel="noopener noreferrer" class="community-card community-zalo">
                    <span class="community-card-label">Zalo</span>
                    <span class="community-card-name">Nhóm Zalo 2</span>
                </a>
            </div>
        </section>
    `;
}
