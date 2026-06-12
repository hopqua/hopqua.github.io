/** Bài blog hiển thị trên trang chủ — cập nhật khi thêm bài mới trong _posts/ */
const homeBlogPosts = [
    {
        title: '18 mẫu hộp bánh Trung Thu hot 2026 — xem ảnh & mua Shopee',
        url: '/18-mau-hot-2026.html',
        date: '2026-06-12',
        image: 'image/11-06-2026/vo-ep-kim-thuc-noi/vo-ep-kim-thuc-noi-1.jpg'
    },
    {
        title: 'Mua hộp bánh Trung Thu sỉ: hướng dẫn cho tiệm bánh và đại lý',
        url: '/ban-si/huong-dan/2026/06/04/mua-hop-banh-trung-thu-si-huong-dan-dai-ly.html',
        date: '2026-06-04',
        image: 'image/26-5-2026/hop-cung-6-banh-mini-75-100g-36k-45k/hop-cung-6-banh-mini-75-100g-36k-45k-1.jpg'
    },
    {
        title: 'Bảng giá hộp bánh Trung Thu theo ngân sách (cập nhật 2026)',
        url: '/bang-gia/huong-dan/2026/06/03/bang-gia-hop-banh-trung-thu-theo-ngan-sach.html',
        date: '2026-06-03',
        image: 'image/phu-quy-29-35k/phu-quy-29-35k-1.jpg'
    },
    {
        title: 'Chọn hộp 4 bánh hay 6 bánh Trung Thu: gợi ý cho tiệm bánh và khách sỉ',
        url: '/huong-dan/chon-hop/2026/06/02/chon-hop-4-banh-hay-6-banh-trung-thu.html',
        date: '2026-06-02',
        image: 'image/song-nguyet-4-6-banh/song-nguyet-4-6-banh-1.jpg'
    },
    {
        title: 'Hộp cứng và hộp giấy mềm bánh Trung Thu: nên chọn loại nào?',
        url: '/huong-dan/chon-hop/2026/06/01/hop-cung-vs-hop-giay-mem-banh-trung-thu.html',
        date: '2026-06-01',
        image: 'image/26-5-2026/hop-cung-4-banh-kem-hop-tra-xanh-la-65k-75k/hop-cung-4-banh-kem-hop-tra-xanh-la-65k-75k-1.jpg'
    }
];

function formatBlogDate(isoDate) {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

function renderHomeBlogSection() {
    const grid = document.getElementById('home-blog-grid');
    if (!grid || !homeBlogPosts.length) return;

    grid.innerHTML = homeBlogPosts
        .map((post) => {
            const thumbSrc = getThumbUrl(post.image);
            const dateLabel = formatBlogDate(post.date);
            const mediaHtml = post.image
                ? `<a href="${post.url}" class="blog-card-media" aria-hidden="true" tabindex="-1">
                        <img src="${thumbSrc}" alt="" width="400" height="250" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${post.image}';">
                   </a>`
                : '';

            return `<article class="blog-card">
                ${mediaHtml}
                <time class="blog-card-date" datetime="${post.date}">${dateLabel}</time>
                <h3 class="blog-card-title"><a href="${post.url}">${post.title}</a></h3>
                <a href="${post.url}" class="blog-card-read">Đọc bài →</a>
            </article>`;
        })
        .join('');
}
