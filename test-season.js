// Test script để kiểm tra logic hiển thị sản phẩm theo mùa
console.log('=== TEST SEASON LOGIC ===');

// Import products (giả lập)
const products = [
    {
        id: 'test-1',
        name: 'Hộp bánh trung thu test 1',
        category: 'hộp bánh trung thu',
        season: 'trung thu'
    },
    {
        id: 'test-2', 
        name: 'Hộp quà tết test 2',
        category: 'hộp quà tết',
        season: 'tết'
    }
];

// Test hàm getProductsBySeason
function getProductsBySeason(season) {
    return products.filter(product => product.season === season);
}

// Test hàm getFeaturedProducts
function getFeaturedProducts(limit = 12) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    console.log(`Current month: ${currentMonth}`);
    
    let prioritySeason = 'trung thu'; // Mặc định
    
    // Mùa Tết: Tháng 12, 1, 2
    if (currentMonth >= 12 || currentMonth <= 2) {
        prioritySeason = 'tết';
    }
    // Mùa Trung Thu: Tháng 8, 9
    else if (currentMonth >= 8 && currentMonth <= 9) {
        prioritySeason = 'trung thu';
    }
    
    console.log(`Priority season: ${prioritySeason}`);
    
    // Lấy sản phẩm theo mùa ưu tiên trước
    const priorityProducts = getProductsBySeason(prioritySeason);
    const otherProducts = products.filter(product => product.season !== prioritySeason);
    
    console.log(`Priority products: ${priorityProducts.length}`);
    console.log(`Other products: ${otherProducts.length}`);
    
    // Kết hợp và giới hạn số lượng
    const featuredProducts = [...priorityProducts, ...otherProducts].slice(0, limit);
    
    return featuredProducts;
}

// Chạy test
console.log('Testing getProductsBySeason...');
console.log('Trung thu products:', getProductsBySeason('trung thu'));
console.log('Tết products:', getProductsBySeason('tết'));

console.log('Testing getFeaturedProducts...');
const featured = getFeaturedProducts(5);
console.log('Featured products:', featured);

console.log('=== TEST COMPLETE ==='); 