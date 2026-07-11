/** Nhóm biến thể cap-nhat — đồng bộ với thư mục cap-nhat/ (vd. 4 Bánh rẻ → 5 màu). */
const CAP_NHAT_VARIANT_GROUPS = {
    '4-banh-re': {
        title: '4 Bánh rẻ',
        hint: 'Cùng dòng hộp 4 bánh rẻ — chọn màu / kiểu:',
        variants: [
            { id: 'hac-do-re', label: 'Hạc đỏ' },
            { id: 'nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k', label: 'Nguyệt hoa Viên' },
            { id: '4b-re-sen-phu-quy', label: 'Sen đỏ' },
            { id: 'thien-hoa-van-nguyet-4-banh-re-175k-24k', label: 'Thiên hoa vân' },
            { id: '4b-re-do-xd', label: 'Xanh lá' },
        ],
    },
};

function getCapNhatVariantGroup(productId) {
    if (!productId) return null;
    for (const group of Object.values(CAP_NHAT_VARIANT_GROUPS)) {
        if (group.variants.some((v) => v.id === productId)) {
            return group;
        }
    }
    return null;
}

function renderCapNhatVariantPickerHtml(productId) {
    const group = getCapNhatVariantGroup(productId);
    if (!group || group.variants.length < 2) return '';

    const chips = group.variants
        .map((v) => {
            const active = v.id === productId ? ' pd-variant-chip--active' : '';
            const thumb =
                typeof getProductById === 'function'
                    ? getProductById(v.id)?.thumbnail
                    : null;
            const img = thumb
                ? `<img src="${thumb}" alt="" width="48" height="48" loading="lazy" decoding="async">`
                : '';
            return `<a href="/p/${encodeURIComponent(v.id)}/" class="pd-variant-chip${active}" title="${v.label}">${img}<span>${v.label}</span></a>`;
        })
        .join('');

    return `
        <div class="pd-variant-picker" role="navigation" aria-label="Chọn màu ${group.title}">
            <p class="pd-variant-picker-label">${group.hint}</p>
            <div class="pd-variant-chips">${chips}</div>
        </div>`;
}
