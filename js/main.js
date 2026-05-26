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
        
        // Debug log
        console.log('=== DEBUG SEASON SYSTEM ===');
        console.log(`Tổng số sản phẩm: ${products.length}`);
        console.log(`Sản phẩm trung thu: ${getProductsBySeason('trung thu').length}`);
        console.log(`Sản phẩm tết: ${getProductsBySeason('tet').length}`);
        console.log(`Sản phẩm nổi bật: ${featuredProducts.length}`);
        
        // Log chi tiết sản phẩm nổi bật
        featuredProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (${product.season})`);
        });
        
        renderPage(1);
    }
});

// Hàm hiển thị danh sách sản phẩm
function displayProducts(container, productsToDisplay = null) {
    // Sử dụng sản phẩm được truyền vào hoặc tất cả sản phẩm
    const productsToShow = productsToDisplay || getAllProducts();
    
    console.log('Bắt đầu hiển thị sản phẩm...');
    console.log(`Sẽ hiển thị ${productsToShow.length} sản phẩm`);
    
    productsToShow.forEach((product, index) => {
        console.log(`Hiển thị sản phẩm ${index + 1}: ${product.name} (${product.season})`);
        
        // Lấy ảnh ngẫu nhiên cho sản phẩm
        const randomImage = getRandomProductImage(product);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Thêm class theo mùa để styling
        if (product.season) {
            productCard.classList.add(`season-${product.season.replace(/\s+/g, '-')}`);
        }
        
        // Tạo thumbnails thông minh dựa trên loại sản phẩm
        let thumbnailsHtml = '';
        
        if (product.folder && product.folder.includes('vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k')) {
            // Cho sản phẩm trong thư mục vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k
            const folderParts = product.folder.split('/');
            const subFolder = folderParts[folderParts.length - 1];
            
            thumbnailsHtml = `
                <img src="image/${product.folder}/${subFolder}-1.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/${subFolder}-2.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/${subFolder}-3.jpg" alt="${product.name}" onerror="this.style.display='none'">
            `;
        } else if (product.folder && product.folder.includes('18-06-2025')) {
            // Cho sản phẩm trong thư mục 18-06-2025
            const folderParts = product.folder.split('/');
            const subFolder = folderParts[folderParts.length - 1];
            
            thumbnailsHtml = `
                <img src="image/${product.folder}/${subFolder}-1.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/${subFolder}-2.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/${subFolder}-3.jpg" alt="${product.name}" onerror="this.style.display='none'">
            `;
        } else if (product.id === 'hop-lam-cuc-4-6-banh') {
            // Cho sản phẩm hộp lam cúc - mix ảnh gốc và ảnh mới
            thumbnailsHtml = `
                <img src="image/${product.folder}/hop-lam-cuc-4-6-banh-1.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/vo-hop-trung-thu-lam-cuc-4-banh-tra-6-banh-them-anh-1.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/vo-hop-trung-thu-lam-cuc-4-banh-tra-6-banh-them-anh-5.jpg" alt="${product.name}" onerror="this.style.display='none'">
            `;
        } else {
            // Cho các sản phẩm khác (pattern mặc định)
            thumbnailsHtml = `
                <img src="image/${product.folder}/${product.id}-1.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/${product.id}-2.jpg" alt="${product.name}" onerror="this.style.display='none'">
                <img src="image/${product.folder}/${product.id}-3.jpg" alt="${product.name}" onerror="this.style.display='none'">
            `;
        }
        
        // Thêm badge theo mùa nếu có
        const seasonBadge = product.season ? `<span class="season-badge season-${product.season.replace(' ', '-')}">${product.season === 'trung thu' ? 'Trung Thu' : 'Tết'}</span>` : '';
        
        productCard.innerHTML = `
            <a href="product.html?id=${product.id}">
                <div class="product-image-container">
                    <img src="${randomImage}" alt="${product.name}" onerror="this.src='${product.thumbnail}'; console.log('Fallback to thumbnail for ${product.name}');">
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
    
    console.log(`Đã hiển thị ${productsToShow.length} sản phẩm`);
} 