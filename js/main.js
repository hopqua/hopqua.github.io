// Phân trang cho sản phẩm nổi bật theo mùa
const productsPerPage = 12;
let currentPage = 1;
let featuredProducts = [];

function renderPage(page) {
    currentPage = page;
    const productListElement = document.getElementById('product-list');
    const paginationElement = document.getElementById('pagination');
    if (!featuredProducts.length) return;
    // Tính toán sản phẩm cho trang hiện tại
    const startIdx = (currentPage - 1) * productsPerPage;
    const endIdx = startIdx + productsPerPage;
    const productsToShow = featuredProducts.slice(startIdx, endIdx);
    // Xóa sản phẩm cũ
    productListElement.innerHTML = '';
    // Hiển thị sản phẩm mới
    displayProducts(productListElement, productsToShow);
    // Hiển thị pagination
    renderPagination(paginationElement, featuredProducts.length, currentPage, productsPerPage);
    
    // Cuộn lên phần sản phẩm nổi bật
    const featuredSection = document.querySelector('.featured-products');
    if (featuredSection) {
        featuredSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

function renderPagination(container, totalProducts, currentPage, productsPerPage) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn${i === currentPage ? ' active' : ''}" onclick="renderPage(${i})">${i}</button> `;
    }
    container.innerHTML = html;
}

// Gắn hàm vào window để gọi từ HTML onclick
window.renderPage = renderPage;

document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị danh sách sản phẩm trên trang chủ
    const productListElement = document.getElementById('product-list');
    
    // Kiểm tra nếu đang ở trang chủ
    if (productListElement) {
        featuredProducts = getFeaturedProducts(9999); // Lấy tất cả sản phẩm nổi bật theo mùa
        
        renderPage(1);
    }
});

// Hàm hiển thị danh sách sản phẩm
function displayProducts(container, productsToDisplay = null) {
    // Sử dụng sản phẩm được truyền vào hoặc tất cả sản phẩm
    const productsToShow = productsToDisplay || getAllProducts();
    
    productsToShow.forEach((product) => {
        // Dùng thumbnail chính để tránh request ảnh ngẫu nhiên không tồn tại.
        const randomImage = product.thumbnail;
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Thêm class theo mùa để styling
        if (product.season) {
            productCard.classList.add(`season-${product.season.replace(/\s+/g, '-')}`);
        }
        
        // Tạo thumbnails thông minh dựa trên loại sản phẩm
        const thumbnails = getProductThumbnailImages(product);
        const thumbnailsHtml = thumbnails
            .map((src) => `<img src="${src}" alt="${product.name}" loading="lazy" decoding="async">`)
            .join('');
        
        // Thêm badge theo mùa nếu có
        const seasonBadge = product.season ? `<span class="season-badge season-${product.season.replace(' ', '-')}">${product.season === 'trung thu' ? 'Trung Thu' : 'Tết'}</span>` : '';
        
        productCard.innerHTML = `
            <a href="product.html?id=${product.id}">
                <div class="product-image-container">
                    <img src="${randomImage}" alt="${product.name}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${product.thumbnail}';">
                    ${seasonBadge}
                </div>
                <div class="product-thumbnails" aria-label="Ảnh thu nhỏ">
                    ${thumbnailsHtml}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${product.price}</p>
                    <p class="product-short-desc">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>
                </div>
            </a>
        `;
        
        container.appendChild(productCard);
    });
}

function getProductThumbnailImages(product) {
    if (product.thumbnailImages && product.thumbnailImages.length) {
        return product.thumbnailImages.slice(0, 3);
    }

    return [product.thumbnail];
} 