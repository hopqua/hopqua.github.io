// Danh sách sản phẩm
const products = [
    {
        id: 'phu-quy-29-35k',
        name: 'Phú quý 29-35k',
        folder: 'phu-quy-29-35k',
        thumbnail: 'image/phu-quy-29-35k/phu-quy-29-35k-1.jpg',
        price: 'Từ 29.000đ đến 35.000đ',
        description: 'Bộ vỏ hộp Phú quý đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'nam-su-hong-150-250g-23-29k',
        name: 'Nam sư hồng 150-250g 23-29k',
        folder: 'nam-su-hong-150-250g-23-29k',
        thumbnail: 'image/nam-su-hong-150-250g-23-29k/nam-su-hong-150-250g-23-29k-1.jpg',
        price: 'Từ 23.000đ đến 29.000đ',
        description: 'Bộ vỏ hộp Nam sư hồng đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'khay-6b-mini-khay-1-banh-lon-100d-5000d',
        name: 'Khay 6 bánh mini 1 bánh lớn 100d-500d',
        folder: 'khay-6b-mini-khay-1-banh-lon-100d-5000d',
        thumbnail: 'image/khay-6b-mini-khay-1-banh-lon-100d-5000d/khay-6b-mini-khay-1-banh-lon-100d-5000d-1.jpg',
        price: 'Từ 100đ đến 5000đ',
        description: 'Bộ vỏ hộp Duật Vân đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'khai-phuc-29-35k',
        name: 'Hộp Khai Phúc 29-35k',
        folder: 'khai-phuc-29-35k',
        thumbnail: 'image/khai-phuc-29-35k/khai-phuc-29-35k-1.jpg',
        price: 'Từ 29.000đ đến 35.000đ',
        description: 'Bộ vỏ hộp Duật Vân đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-duat-van-14-17k',
        name: 'Hộp Duật Vân 14-17k',
        folder: 'hop-duat-van-14-17k',
        thumbnail: 'image/hop-duat-van-14-17k/hop-duat-van-14-17k-1.jpg',
        price: 'Từ 14.000đ đến 17.000đ',
        description: 'Bộ vỏ hộp Duật Vân đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-cong-tuoc-150-250g-28-33k',
        name: 'Hộp công tước 150-250g 28-33k',
        folder: 'hop-cong-tuoc-150-250g-28-33k',
        thumbnail: 'image/hop-cong-tuoc-150-250g-28-33k/hop-cong-tuoc-150-250g-28-33k-1.jpg',
        price: 'Từ 28.000đ đến 33.000đ',
        description: 'Bộ vỏ hộp công tước đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'ho-diep-29-35k',
        name: 'Hộp Hồ Điệp 29-35k',
        folder: 'ho-diep-29-35k',
        thumbnail: 'image/ho-diep-29-35k/ho-diep-29-35k-1.jpg',
        price: 'Từ 29.000đ đến 35.000đ',
        description: 'Bộ vỏ hộp Hồ Điệp đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'ngoc-hoa-cam-4-banh',
        name: 'Ngọc hoa cam 4 bánh',
        folder: 'ngoc-hoa-cam-4-banh',
        thumbnail: 'image/ngoc-hoa-cam-4-banh/ngoc-hoa-cam-4-banh-1.jpg',
        price: 'Từ 27.000đ đến 31.000đ',
        description: 'Bộ vỏ hộp ngọc hoa cam 4 bánh đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hoa-vien-do-4-banh-re',
        name: 'Hoa viên đỏ 4 bánh rẻ',
        folder: 'hoa-vien-do-4-banh-re',
        thumbnail: 'image/hoa-vien-do-4-banh-re/hoa-vien-do-4-banh-re-1.jpg"',
        price: 'Từ 16.000đ đến 20.000đ',
        description: 'Bộ vỏ hộp hoa viên đỏ đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/hoa-vien-do-4-banh-re/hoa-vien-do-4-banh-re-1.mp4'
        ]
    },
    {
        id: 'song-nguyet-4-6-banh',
        name: 'Song Nguyệt 4 bánh, 6 bánh',
        folder: 'song-nguyet-4-6-banh',
        thumbnail: 'image/song-nguyet-4-6-banh/song-nguyet-4-6-banh-1.jpg',
        price: 'Từ 25.000đ đến 33.000đ',
        description: 'Bộ vỏ hộp song nguyệt đẹp mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'dao-nia-mau-trang-hong-xanh-duong',
        name: 'Dao nĩa màu trắng, hồng, xanh dương',
        folder: 'dao-nia-mau-trang-hong-xanh-duong',
        thumbnail: 'image/dao-nia-mau-trang-hong-xanh-duong/dao-nia-mau-trang-hong-xanh-duong-1.jpg',
        price: '900đ - 1.500đ',
        description: 'Bộ dao nĩa nhựa cao cấp với nhiều màu sắc trang nhã, phù hợp để dùng kèm với bánh trung thu.',
        category: 'phụ kiện',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-1-banh',
        name: 'Hộp 1 bánh',
        folder: 'hop-1-banh',
        thumbnail: 'image/hop-1-banh/hop-1-banh-1.jpg',
        price: 'Từ 4.000đ đến 8.000đ',
        description: 'Hộp đựng 1 bánh trung thu đơn giản, sang trọng, phù hợp làm quà tặng hoặc sử dụng trong gia đình.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-2-banh-re',
        name: 'Hộp 2 bánh rẻ',
        folder: 'hop-2-banh-re',
        thumbnail: 'image/hop-2-banh-re/hop-2-banh-re-1.jpg',
        price: '3.500đ - 7.000đ',
        description: 'Hộp đựng 2 bánh trung thu giá rẻ nhưng vẫn đảm bảo chất lượng và tính thẩm mỹ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-6-banh-mini-tho-ngoc-do',
        name: 'Hộp 6 bánh mini thỏ ngọc đỏ',
        folder: 'hop-6-banh-mini-tho-ngoc-do',
        thumbnail: 'image/hop-6-banh-mini-tho-ngoc-do/hop-6-banh-mini-tho-ngoc-do-1.jpg',
        price: 'Từ 15.000đ đến 18.500đ',
        description: 'Hộp đựng 6 bánh mini với họa tiết thỏ ngọc màu đỏ sang trọng, phù hợp cho các dịp lễ tết.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-6-banh-mini-tho-ngoc-vang',
        name: 'Hộp 6 bánh mini thỏ ngọc vàng',
        folder: 'hop-6-banh-mini-tho-ngoc-vang',
        thumbnail: 'image/hop-6-banh-mini-tho-ngoc-vang/hop-6-banh-mini-tho-ngoc-vang-1.jpg',
        price: 'Từ 21.000đ đến 24.500đ',
        description: 'Hộp đựng 6 bánh mini với họa tiết thỏ ngọc màu vàng sang trọng, biểu tượng của sự may mắn và thịnh vượng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-lam-cuc-4-6-banh',
        name: 'Hộp lam cúc 4-6 bánh',
        folder: 'hop-lam-cuc-4-6-banh',
        thumbnail: 'image/hop-lam-cuc-4-6-banh/hop-lam-cuc-4-6-banh-1.jpg',
        price: 'Từ 35.000đ đến 38.000đ',
        description: 'Hộp bánh trung thu có họa tiết hoa cúc tinh tế, có thể đựng 4-6 bánh tùy kích thước.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/hop-lam-cuc-4-6-banh/698440359052842430136.mp4'
        ]
    },
    {
        id: 'hop-lan-vu-4-banh',
        name: 'Hộp lân vũ 4 bánh',
        folder: 'hop-lan-vu-4-banh',
        thumbnail: 'image/hop-lan-vu-4-banh/hop-lan-vu-4-banh-1.jpg',
        price: 'Từ 29.000đ đến 34.000đ',
        description: 'Hộp bánh trung thu với họa tiết lan vũ sang trọng, đựng được 4 bánh cỡ vừa.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-lien-ngu-4-banh',
        name: 'Hộp liên ngư 4 bánh',
        folder: 'hop-lien-ngu-4-banh',
        thumbnail: 'image/hop-lien-ngu-4-banh/hop-lien-ngu-4-banh-1.jpg',
        price: 'Từ 26.500đ đến 30.000đ',
        description: 'Hộp bánh liên ngũ đựng được 4 bánh, thiết kế sang trọng phù hợp biếu tặng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac',
        name: 'Hộp ngũ long nguyệt hội 4 bánh hình bát giác',
        folder: 'hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac',
        thumbnail: 'image/hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac/hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac-1.jpg',
        price: 'Từ 36.000đ đến 39.000đ',
        description: 'Hộp bánh hình bát giác độc đáo với họa tiết ngũ long nguyệt hội, đựng được 4 bánh cỡ lớn.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-qua-16-cho-be',
        name: 'Hộp quà 1.6 cho bé',
        folder: 'hop-qua-16-cho-be',
        thumbnail: 'image/hop-qua-16-cho-be/hop-qua-16-cho-be-1.jpg',
        price: 'Từ 4.000đ đến 6.000đ',
        description: 'Hộp quà trung thu đặc biệt thiết kế cho trẻ em, với họa tiết vui nhộn và màu sắc bắt mắt.',
        category: 'hộp quà trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-sen-phu-quy-4-banh-re',
        name: 'Hộp sen phú quý 4 bánh rẻ',
        folder: 'hop-sen-phu-quy-4-banh-re',
        thumbnail: 'image/hop-sen-phu-quy-4-banh-re/hop-sen-phu-quy-4-banh-re-1.jpg',
        price: 'Từ 15.000đ đến 18.000đ',
        description: 'Hộp bánh trung thu với họa tiết hoa sen - biểu tượng của sự phú quý, đựng được 4 bánh với giá thành hợp lý.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-song-hac-6-banh',
        name: 'Hộp song hạc 6 bánh',
        folder: 'hop-song-hac-6-banh',
        thumbnail: 'image/hop-song-hac-6-banh/hop-song-hac-6-banh-1.jpg',
        price: 'Từ 32.000đ đến 35.000đ',
        description: 'Hộp bánh trung thu với họa tiết song hạc - biểu tượng của sự trường thọ và may mắn, đựng được 6 bánh.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-song-nguyet-4-6-banh',
        name: 'Hộp song nguyệt 4-6 bánh',
        folder: 'hop-song-nguyet-4-6-banh',
        thumbnail: 'image/hop-song-nguyet-4-6-banh/hop-song-nguyet-4-6-banh-1.jpg',
        price: 'Từ 28.000đ đến 32.000đ',
        description: 'Hộp bánh trung thu với họa tiết song nguyệt tinh tế, có thể đựng 4-6 bánh tùy kích thước.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'khay-trong-sz-9-10-11',
        name: 'Khay trong sz 9, 10, 11',
        folder: 'khay-trong-sz-9-10-11',
        thumbnail: 'image/khay-trong-sz-9-10-11/khay-trong-sz-9-10-11-1.jpg',
        price: 'Từ 2.500đ đến 3.500đ',
        description: 'Khay trong đựng bánh trung thu với nhiều kích thước khác nhau, phù hợp cho mọi loại bánh.',
        category: 'phụ kiện',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'tui-dung-banh-trung-thu-sz-9-10-11',
        name: 'Túi đựng bánh trung thu sz 9, 10, 11',
        folder: 'tui-dung-banh-trung-thu-sz-9-10-11',
        thumbnail: 'image/tui-dung-banh-trung-thu-sz-9-10-11/tui-dung-banh-trung-thu-sz-9-10-11-1.jpg',
        price: 'Từ 1.500đ đến 2.500đ',
        description: 'Túi đựng bánh trung thu với nhiều kích thước, tiện lợi cho việc bảo quản và vận chuyển.',
        category: 'phụ kiện',
        season: 'trung thu',
        videos: []
    },
    // Sản phẩm từ thư mục vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k
    {
        id: '4b-re-do-xd',
        name: 'Vỏ hộp 4 bánh rẻ đỏ XD',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/4b-re-do-xd',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/4b-re-do-xd/4b-re-do-xd-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp 4 bánh màu đỏ thiết kế đơn giản, giá cả hợp lý.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: '4b-re-sen-phu-quy',
        name: 'Vỏ hộp 4 bánh rẻ sen phú quý',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/4b-re-sen-phu-quy',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/4b-re-sen-phu-quy/4b-re-sen-phu-quy-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp 4 bánh với họa tiết hoa sen phú quý, thiết kế sang trọng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/4b-re-sen-phu-quy/148066234525509351823.mp4'
        ]
    },
    {
        id: 'hac-do-re',
        name: 'Vỏ hộp hạc đỏ rẻ',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hac-do-re',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hac-do-re/hac-do-re-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp với họa tiết hạc đỏ sang trọng, giá cả phải chăng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hoa-vien-re-do',
        name: 'Vỏ hộp hoa viên rẻ đỏ',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hoa-vien-re-do',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hoa-vien-re-do/hoa-vien-re-do-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp hoa viên màu đỏ đẹp mắt, giá cả hợp lý.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hoa-vien-re-do/61047170187894862015.mp4'
        ]
    },
    {
        id: 'hong-nguyet-vien-cam',
        name: 'Vỏ hộp hồng nguyệt viên cam',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hong-nguyet-vien-cam',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hong-nguyet-vien-cam/hong-nguyet-vien-cam-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp hồng nguyệt viên màu cam tươi sáng, thiết kế bắt mắt.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hong-nguyet-vien-cam/1654015542572768075.mp4'
        ]
    },
    {
        id: 'lan-vu-re-linh',
        name: 'Vỏ hộp lan vũ rẻ linh',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/lan-vu-re-linh',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/lan-vu-re-linh/lan-vu-re-linh-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp lan vũ thiết kế tinh tế, giá cả phải chăng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/lan-vu-re-linh/389667241823861156218.mp4'
        ]
    },
    {
        id: 'nguyet-yen-1x',
        name: 'Vỏ hộp nguyệt yến 1x',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/nguyet-yen-1x',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/nguyet-yen-1x/nguyet-yen-1x-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp nguyệt yến thiết kế đơn giản, phù hợp nhiều dịp.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/nguyet-yen-1x/44832794307711501843.mp4'
        ]
    },
    // Sản phẩm từ thư mục 18-06-2025
    {
        id: 'vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k',
        name: 'Vỏ bánh trung thu Nguyệt thổ minh 4 bánh',
        folder: '18-06-2025/vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k',
        thumbnail: 'image/18-06-2025/vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k/vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k-1.jpg',
        price: '28.000đ - 35.000đ',
        description: 'Vỏ bánh trung thu Nguyệt thổ minh 4 bánh, thiết kế cổ điển trang nhã.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'vo-banh-trung-thu-sen-toa-4-banh-20-25k',
        name: 'Vỏ bánh trung thu sen tỏa 4 bánh',
        folder: '18-06-2025/vo-banh-trung-thu-sen-toa-4-banh-20-25k',
        thumbnail: 'image/18-06-2025/vo-banh-trung-thu-sen-toa-4-banh-20-25k/vo-banh-trung-thu-sen-toa-4-banh-20-25k-1.jpg',
        price: '20.000đ - 25.000đ',
        description: 'Vỏ bánh trung thu sen tỏa 4 bánh, với họa tiết hoa sen tỏa sáng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'vo-hop-banh-trung-thu-hon-viet-4-banh-4-banh-tra-6-banh-26k-39k',
        name: 'Vỏ hộp bánh trung thu hồn Việt 4 bánh, 4 bánh trà, 6 bánh',
        folder: '18-06-2025/vo-hop-banh-trung-thu-hon-viet-4-banh-4-banh-tra-6-banh-26k-39k',
        thumbnail: 'image/18-06-2025/vo-hop-banh-trung-thu-hon-viet-4-banh-4-banh-tra-6-banh-26k-39k/vo-hop-banh-trung-thu-hon-viet-4-banh-4-banh-tra-6-banh-26k-39k-1.jpg',
        price: '26.000đ - 39.000đ',
        description: 'Vỏ hộp bánh trung thu hồn Việt có thể đựng 4 bánh, 4 bánh trà, hoặc 6 bánh.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k',
        name: 'Vỏ hộp bánh trung thu nguyệt ánh 4 bánh trà',
        folder: '18-06-2025/vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k',
        thumbnail: 'image/18-06-2025/vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k/vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k-1.jpg',
        price: '32.000đ - 39.000đ',
        description: 'Vỏ hộp bánh trung thu nguyệt ánh 4 bánh trà, thiết kế sang trọng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'vo-hop-trung-thu-bach-lien-xanh-4-banh-26-33k',
        name: 'Vỏ hộp trung thu bạch liên xanh 4 bánh',
        folder: '18-06-2025/vo-hop-trung-thu-bach-lien-xanh-4-banh-26-33k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-bach-lien-xanh-4-banh-26-33k/vo-hop-trung-thu-bach-lien-xanh-4-banh-26-33k-1.jpg',
        price: '26.000đ - 33.000đ',
        description: 'Vỏ hộp trung thu bạch liên xanh 4 bánh, màu sắc tươi mát.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k',
        name: 'Vỏ hộp trung thu hồng nguyệt viên cam 4 bánh rẻ',
        folder: '18-06-2025/vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k/vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k-1.jpg',
        price: '16.000đ - 20.000đ',
        description: 'Vỏ hộp trung thu hồng nguyệt viên cam 4 bánh, giá cả phải chăng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/18-06-2025/vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k/1654015542572768075.mp4'
        ]
    },
    {
        id: 'vo-hop-trung-thu-lan-vu-4-banh-re-16-20k',
        name: 'Vỏ hộp trung thu lan vũ 4 bánh rẻ',
        folder: '18-06-2025/vo-hop-trung-thu-lan-vu-4-banh-re-16-20k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-lan-vu-4-banh-re-16-20k/vo-hop-trung-thu-lan-vu-4-banh-re-16-20k-1.jpg',
        price: '16.000đ - 20.000đ',
        description: 'Vỏ hộp trung thu lan vũ 4 bánh, thiết kế tinh tế với giá rẻ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/18-06-2025/vo-hop-trung-thu-lan-vu-4-banh-re-16-20k/389667241823861156218.mp4'
        ]
    },
    {
        id: 'vo-hop-trung-thu-mini-4-banh-6-banh-quai-da-13-18k',
        name: 'Vỏ hộp trung thu mini 4 bánh 6 bánh quai da',
        folder: '18-06-2025/vo-hop-trung-thu-mini-4-banh-6-banh-quai-da-13-18k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-mini-4-banh-6-banh-quai-da-13-18k/vo-hop-trung-thu-mini-4-banh-6-banh-quai-da-13-18k-1.jpg',
        price: '13.000đ - 18.000đ',
        description: 'Vỏ hộp trung thu mini có thể đựng 4 bánh hoặc 6 bánh, có quai da tiện lợi.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k',
        name: 'Vỏ hộp trung thu nguyệt yến 4 bánh rẻ',
        folder: '18-06-2025/vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k/vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k-1.jpg',
        price: '16.000đ - 20.000đ',
        description: 'Vỏ hộp trung thu nguyệt yến 4 bánh, giá cả phải chăng.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/18-06-2025/vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k/44832794307711501843.mp4'
        ]
    },
    {
        id: 'vo-hop-trung-thu-vong-hac-4-banh-26-33k',
        name: 'Vỏ hộp trung thu vọng hạc 4 bánh',
        folder: '18-06-2025/vo-hop-trung-thu-vong-hac-4-banh-26-33k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-vong-hac-4-banh-26-33k/vo-hop-trung-thu-vong-hac-4-banh-26-33k-1.jpg',
        price: '26.000đ - 33.000đ',
        description: 'Vỏ hộp trung thu vọng hạc 4 bánh, họa tiết hạc bay thanh thoát.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/18-06-2025/vo-hop-trung-thu-vong-hac-4-banh-26-33k/327286124422440436161.mp4'
        ]
    }
];

// Hàm lấy sản phẩm theo ID
function getProductById(productId) {
    return products.find(product => product.id === productId);
}

// Hàm tạo slug từ một chuỗi tiếng Việt có dấu
function createSlug(str) {
    // Chuyển chuỗi sang chữ thường và bỏ dấu
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    
    // Thay khoảng trắng bằng dấu gạch ngang
    str = str.replace(/\s+/g, "-");
    
    // Xóa các ký tự đặc biệt
    str = str.replace(/[^a-z0-9-]/g, "");
    
    return str;
}

// Hàm lấy một ảnh ngẫu nhiên từ thư mục sản phẩm
function getRandomProductImage(product) {
    // Số lượng ảnh tối đa (giả định là 20 ảnh để tăng khả năng phát hiện)
    const maxImages = 20;
    
    // Trường hợp đặc biệt cho tui-dung-banh-trung-thu-sz-9-10-11
    if (product.id === 'tui-dung-banh-trung-thu-sz-9-10-11') {
        // Chọn số ngẫu nhiên từ các ảnh có sẵn (3-6 là ảnh đẹp nhất)
        const validIndices = [3, 4, 5, 6];
        const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
        return `image/${product.folder}/tui-dung-banh-trung-thu-sz-91011-${randomIndex}.jpg`;
    }

    // Trường hợp đặc biệt cho hoa-vien-do-4-banh-re
    if (product.id === 'hoa-vien-do-4-banh-re') {
        // Chọn số ngẫu nhiên từ các ảnh có sẵn (3-6 là ảnh đẹp nhất)
        const validIndices = [1, 2, 3, 4];
        const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
        return `image/${product.folder}/hoa-vien-do-4-banh-re-${randomIndex}.jpg`;
    }
    
    // Trường hợp đặc biệt cho hop-lam-cuc-4-6-banh
    if (product.id === 'hop-lam-cuc-4-6-banh') {
        // Chọn ngẫu nhiên từ ảnh gốc hoặc ảnh mới
        const useOriginal = Math.random() < 0.3; // 30% cơ hội chọn ảnh gốc
        if (useOriginal) {
            const randomIndex = Math.floor(Math.random() * 5) + 1;
            return `image/${product.folder}/hop-lam-cuc-4-6-banh-${randomIndex}.jpg`;
        } else {
            const randomIndex = Math.floor(Math.random() * 22) + 1;
            return `image/${product.folder}/vo-hop-trung-thu-lam-cuc-4-banh-tra-6-banh-them-anh-${randomIndex}.jpg`;
        }
    }
    
    // Trường hợp đặc biệt cho các sản phẩm trong vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k
    if (product.folder && product.folder.includes('vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k')) {
        // Lấy tên thư mục con cuối cùng
        const folderParts = product.folder.split('/');
        const subFolder = folderParts[folderParts.length - 1];
        
        // Chọn số ngẫu nhiên từ 1 đến 10 (giả định có khoảng 10 ảnh mỗi sản phẩm)
        const randomIndex = Math.floor(Math.random() * 10) + 1;
        return `image/${product.folder}/${subFolder}-${randomIndex}.jpg`;
    }
    
    // Trường hợp đặc biệt cho các sản phẩm trong 18-06-2025
    if (product.folder && product.folder.includes('18-06-2025')) {
        // Lấy tên thư mục con cuối cùng
        const folderParts = product.folder.split('/');
        const subFolder = folderParts[folderParts.length - 1];
        
        // Chọn số ngẫu nhiên từ 1 đến 15 (giả định có khoảng 15 ảnh mỗi sản phẩm)
        const randomIndex = Math.floor(Math.random() * 15) + 1;
        return `image/${product.folder}/${subFolder}-${randomIndex}.jpg`;
    }
    
    // Xử lý cho các sản phẩm khác
    // Chọn một số ngẫu nhiên từ 1 đến maxImages
    const randomIndex = Math.floor(Math.random() * maxImages) + 1;
    // Tạo đường dẫn đến ảnh
    return `image/${product.folder}/${product.id}-${randomIndex}.jpg`;
}

// Hàm lấy sản phẩm theo mùa
function getProductsBySeason(season) {
    return products.filter(product => product.season === season);
}

// Hàm lấy sản phẩm theo danh mục
function getProductsByCategory(category) {
    return products.filter(product => product.category === category);
}

// Hàm lấy sản phẩm nổi bật (có thể tùy chỉnh logic)
function getFeaturedProducts(limit = 12) {
    // Ưu tiên sản phẩm theo mùa hiện tại
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    let prioritySeason = 'trung thu'; // Mặc định
    
    // Mùa Tết: Tháng 12, 1, 2
    if (currentMonth >= 12 || currentMonth <= 2) {
        prioritySeason = 'tet';
    }
    // Mùa Trung Thu: Tháng 8, 9
    else if (currentMonth >= 8 && currentMonth <= 9) {
        prioritySeason = 'trung thu';
    }
    
    // Lấy sản phẩm theo mùa ưu tiên trước
    const priorityProducts = getProductsBySeason(prioritySeason);
    const otherProducts = products.filter(product => product.season !== prioritySeason);
    
    // Kết hợp và giới hạn số lượng
    const featuredProducts = [...priorityProducts, ...otherProducts].slice(0, limit);
    
    return featuredProducts;
}

// Hàm lấy tất cả sản phẩm (giữ nguyên cho tương thích)
function getAllProducts() {
    return products;
} 