/** Quy cách kích thước đóng hàng — đồng bộ data/pack-dimension-rules.json */
const PACK_DIMENSION_RULES = {
    '6_banh_mini': { label: '6 bánh mini', sizeText: 'Khay 24×17 cm · Túi 25×19 cm' },
    '4_banh_re': { label: '4 bánh rẻ', sizeText: 'Đáy 25×24 cm · Túi 25,5×24,5 cm (chênh 0,5 cm)' },
    '4_banh_co_nap': { label: '4 bánh có nắp', sizeText: 'Đáy 26×26 cm · Túi 30×27,5 cm' },
    '4_banh_tra_6_banh': { label: '4 bánh trà – 6 bánh', sizeText: 'Đáy 27×35,5 cm · Túi 29×36,5 cm' },
    bat_giac: { label: 'Bát giác', sizeText: 'Đáy 37,7×37,5 cm · Túi 38×40 cm' },
    '2_banh_re': { label: '2 bánh rẻ', sizeText: '21,5×11 cm' },
    '2_banh_dat': { label: '2 bánh đắt (ép nhũ / ép kim)', sizeText: 'Hộp 21,5×11,5×5 cm · Túi 22,5×14×6 cm' },
};

function normPackLabel(s) {
    return String(s || '')
        .toLowerCase()
        .normalize('NFC')
        .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function classifyPackType(label) {
    const t = normPackLabel(label);
    if (/\bkhay\b/.test(t)) return '6_banh_mini';
    if (/2 bánh ép kim|2 banh ep kim|ép nhũ|ep nhu/.test(t)) return '2_banh_dat';
    if (/2 bánh rẻ|2 banh re/.test(t)) return '2_banh_re';
    if (/bát giác|bat giac/.test(t)) return 'bat_giac';
    if (/6 bánh mini|6 banh mini|6 mini/.test(t)) return '6_banh_mini';
    if (/4 bánh rẻ|4 banh re|4b re/.test(t)) return '4_banh_re';
    if (
        /4 bánh trà.*6|6 bánh.*trà|trà.*6 bánh|kem hộp tra.*6|liên nguyệt.*6|hoàng kim.*6|hạc vũ|gấp gọn|nguyệt liên|song ngư/.test(
            t
        )
    ) {
        return '4_banh_tra_6_banh';
    }
    if (/6 bánh|6 banh/.test(t)) return '4_banh_tra_6_banh';
    if (/4 bánh|4 banh/.test(t)) return '4_banh_co_nap';
    if (/hộp cứng|hop cung/.test(t) && /trà|tra/.test(t)) return '4_banh_tra_6_banh';
    if (/hạc vân|hac van|hộp cứng|hop cung/.test(t)) return '4_banh_co_nap';
    return null;
}

function getPackSizeText(product) {
    if (product.packSizeText) return product.packSizeText;
    const type = product.packType || classifyPackType(`${product.id || ''} ${product.name || ''} ${product.description || ''}`);
    const row = type && PACK_DIMENSION_RULES[type];
    return row ? row.sizeText : '';
}

function getPackTypeLabel(product) {
    const type = product.packType || classifyPackType(`${product.id || ''} ${product.name || ''}`);
    const row = type && PACK_DIMENSION_RULES[type];
    return row ? row.label : '';
}
