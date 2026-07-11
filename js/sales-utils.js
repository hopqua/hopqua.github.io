const ZALO_PHONE = '0965671689';
const SHOPEE_SHOP_URL = 'https://shopee.vn/longthibo958';

function getShopeeUrl(product) {
    if (product && product.shopeeUrl) {
        return product.shopeeUrl;
    }
    if (typeof SHOPEE_PRODUCT_URLS !== 'undefined' && product && product.id) {
        const direct = SHOPEE_PRODUCT_URLS[product.id];
        if (direct) {
            return direct;
        }
    }
    return SHOPEE_SHOP_URL;
}
const SITE_ORIGIN = 'https://hopqua.io.vn';
const FACEBOOK_PAGE_URL = 'https://www.facebook.com/Torangesvn/';
const ZALO_GROUP_1_URL = 'https://zalo.me/g/vffwdx817';
const ZALO_GROUP_2_URL = 'https://zalo.me/g/qzfgvs076';

const BOX_CATEGORY_LABELS = {
    'hop-4-banh': 'Hộp 4 bánh',
    'hop-6-banh': 'Hộp 6 bánh',
    'hop-2-banh': 'Hộp 2 bánh',
    'hop-1-banh': 'Hộp 1 bánh',
    mini: 'Mini',
    'phu-kien-banh': 'Phụ kiện bánh',
};

const BOX_CATEGORY_SUBTITLES = {
    'hop-4-banh': 'Mẫu đựng 4 bánh — gồm cả 4 bánh rẻ và mẫu 4–6 bánh linh hoạt',
    'hop-6-banh': 'Mẫu đựng 6 bánh — khay lớn, phù hợp set quà',
    'hop-2-banh': 'Hộp 2 bánh rẻ & ép nhũ/kim — quà lẻ, set nhỏ',
    'hop-1-banh': 'Hộp 1 bánh — quà lẻ và set nhỏ',
    mini: 'Hộp 6 bánh mini — size nhỏ gọn',
    'phu-kien-banh': 'Khay túi, pét, gói hút ẩm, dao nĩa',
};

const BOX_MATERIAL_LABELS = {
    'hop-cung': 'Hộp cứng',
    'hop-giay-mem': 'Giấy mềm',
};

const PHU_KIEN_BANH_IDS = new Set([
    'khay-trong-sz-9-10-11',
    'tui-dung-banh-trung-thu-sz-9-10-11',
    'pet-dung-banh',
    'hut-am',
    'dao-nia-mau-trang-hong-xanh-duong',
]);

function normBoxText(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function getProductBoxCategory(product) {
    if (!product) return 'other';

    if (PHU_KIEN_BANH_IDS.has(product.id)) return 'phu-kien-banh';
    if (
        product.category === 'phụ kiện bánh' ||
        product.category === 'phụ kiện' ||
        product.category === 'Khay túi, pét đựng bánh'
    ) {
        return 'phu-kien-banh';
    }

    const text = normBoxText(`${product.name} ${product.id}`);
    const desc = normBoxText(product.description || '');
    const blob = `${text} ${desc}`;

    if (/6 banh mini|6b mini|6-banh-mini|6 mini|300g \(6 banh mini\)/.test(blob)) {
        return 'mini';
    }
    if (/2 banh|hop-2-banh|2-banh|20g \(2 banh|100g \(2 banh dat\)/.test(blob)) {
        return 'hop-2-banh';
    }
    if (/1 banh to|banh-to|300g|600g|180g \(1 banh to\)/.test(blob)) {
        return 'hop-1-banh';
    }
    if (/150-250g|150g|250g/.test(blob) && !/4 banh|6 banh|4b|6b/.test(blob)) {
        return 'hop-1-banh';
    }
    if (/(^|[^0-9])1 banh|hop-1-banh|1-banh|cho be|50g \(1 banh\)/.test(blob)) {
        return 'hop-1-banh';
    }
    if (/4[\s-]*6 banh|4-6-banh|hop-lam-cuc/.test(text)) {
        return 'hop-4-banh';
    }
    if (/6 banh|6-banh|hop-cung-6|hop-6-banh|330g \(6 banh\)/.test(blob)) {
        return 'hop-6-banh';
    }
    if (/4 banh re|4b re|4-ban?h-re|250g \(4 banh re\)/.test(blob)) {
        return 'hop-4-banh';
    }
    if (/4 banh|4-banh|4b-|330g \(4 banh\)/.test(blob)) {
        return 'hop-4-banh';
    }

    return 'hop-4-banh';
}

function getProductBoxCategoryLabel(product) {
    return BOX_CATEGORY_LABELS[getProductBoxCategory(product)] || '';
}

/** Hộp cứng — id/folder/tên/mô tả có hop-cung; loại trừ giấy mềm ghi rõ. */
function isProductHopCung(product) {
    if (!product) return false;
    if (getProductBoxCategory(product) === 'phu-kien-banh') return false;

    const text = normBoxText(`${product.name || ''} ${product.id || ''} ${product.folder || ''}`);
    const desc = normBoxText(product.description || '');
    const blob = `${text} ${desc}`;

    if (/hang giay mem|giay mem|hop giay mem/.test(blob)) {
        return false;
    }
    return /hop[\s-]*cung|hop cung/.test(blob);
}

function getProductBoxMaterial(product) {
    if (!product || getProductBoxCategory(product) === 'phu-kien-banh') {
        return null;
    }
    return isProductHopCung(product) ? 'hop-cung' : 'hop-giay-mem';
}

function getProductBoxMaterialLabel(product) {
    const material = getProductBoxMaterial(product);
    return material ? BOX_MATERIAL_LABELS[material] || '' : '';
}

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

/** Ngày đăng SP: ưu tiên postedAt, không thì suy từ folder (vd. 26-5-2026/, 18-06-2025/). */
function parsePostedDateFromFolder(folder) {
    if (!folder) return null;
    const match = folder.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\//);
    if (!match) return null;
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
}

function getProductPostedAt(product) {
    if (product.postedAt) return product.postedAt;
    return parsePostedDateFromFolder(product.folder);
}

function formatProductPostedDate(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

/** Nhãn thời gian kiểu timeline: Hôm nay, 3 ngày trước, hoặc 26/05/2026 */
function formatProductPostedLabel(isoDate) {
    if (!isoDate) return '';

    const posted = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(posted.getTime())) return formatProductPostedDate(isoDate);

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.floor((today - posted) / (24 * 60 * 60 * 1000));

    if (diffDays <= 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;

    return formatProductPostedDate(isoDate);
}

function renderProductPostedMeta(product) {
    const postedAt = getProductPostedAt(product);
    if (!postedAt) return '';

    const label = formatProductPostedLabel(postedAt);
    const fullDate = formatProductPostedDate(postedAt);
    const title = label === fullDate ? `Đăng ngày ${fullDate}` : `Đăng ngày ${fullDate} (${label})`;

    return `<time class="product-posted-date" datetime="${postedAt}" title="${title}">Đăng ${label}</time>`;
}

function compareProductsByPostedAt(a, b) {
    const aDate = getProductPostedAt(a);
    const bDate = getProductPostedAt(b);
    if (aDate && bDate) return bDate.localeCompare(aDate);
    if (aDate) return -1;
    if (bDate) return 1;
    return 0;
}

function isNew2026(product) {
    return product.folder && product.folder.startsWith('26-5-2026/');
}

function isRecentlyPosted(product, withinDays = 30) {
    const postedAt = getProductPostedAt(product);
    if (!postedAt) return isNew2026(product);

    const posted = new Date(`${postedAt}T12:00:00`);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.floor((today - posted) / (24 * 60 * 60 * 1000));
    return diffDays >= 0 && diffDays <= withinDays;
}

function getProductBadges(product) {
    const badges = [];
    if (product.thich) badges.push({ label: 'Ưu tiên', className: 'badge-featured' });
    if (isRecentlyPosted(product)) badges.push({ label: 'Mới', className: 'badge-new' });
    const text = `${product.name} ${product.id}`.toLowerCase();
    if (/4\s*banh|4-banh/.test(text)) badges.push({ label: '4 bánh', className: 'badge-4' });
    if (/6\s*banh|6-banh/.test(text)) badges.push({ label: '6 bánh', className: 'badge-6' });
    if (getProductBoxMaterial(product) === 'hop-cung') {
        badges.push({ label: 'Hộp cứng', className: 'badge-hard' });
    }
    return badges;
}

function buildProductPageUrl(product) {
    const id = typeof product === 'string' ? product : (product.id || product.webId);
    return `${SITE_ORIGIN}/p/${encodeURIComponent(id)}/`;
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
    const withDate = products
        .filter((p) => getProductPostedAt(p))
        .sort(compareProductsByPostedAt);

    if (withDate.length >= limit) return withDate.slice(0, limit);

    const seen = new Set(withDate.map((p) => p.id));
    const featured = getFeaturedProducts(limit).filter((p) => !seen.has(p.id));
    return [...withDate, ...featured].slice(0, limit);
}

function filterCatalogProducts({ tier = 'all', boxType = 'all', boxMaterial = 'all' } = {}) {
    let list = getAllProducts();

    if (tier && tier !== 'all') {
        list = list.filter((p) => getProductTier(p) === tier);
    }
    if (boxType && boxType !== 'all') {
        list = list.filter((p) => getProductBoxCategory(p) === boxType);
    }
    if (boxMaterial && boxMaterial !== 'all') {
        list = list.filter((p) => getProductBoxMaterial(p) === boxMaterial);
    }

    return list;
}

function getCatalogSections() {
    const hot = getHotProducts(12);
    const hotIds = new Set(hot.map((p) => p.id));
    const rest = getAllProducts().filter((p) => !hotIds.has(p.id));

    const sections = [
        {
            id: 'mau-hot',
            title: 'Mẫu mới & nổi bật 2026',
            subtitle: 'Ưu tiên đặt sớm mùa Trung Thu — tư vấn Zalo trong vài phút',
            products: hot,
        },
    ];

    const categoryOrder = ['hop-4-banh', 'hop-6-banh', 'hop-2-banh', 'hop-1-banh', 'mini', 'phu-kien-banh'];

    categoryOrder.forEach((catId) => {
        const catProducts = rest.filter((p) => getProductBoxCategory(p) === catId);
        if (catProducts.length) {
            sections.push({
                id: catId,
                title: BOX_CATEGORY_LABELS[catId],
                subtitle: BOX_CATEGORY_SUBTITLES[catId] || '',
                products: catProducts,
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
