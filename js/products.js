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
        thumbnail: 'image/hoa-vien-do-4-banh-re/hoa-vien-do-4-banh-re-1.jpg',
        price: 'Từ 16.000đ đến 20.000đ',
        description: 'Bộ vỏ hộp hoa viên đỏ đẹp mắt.\n\n•KT: 25*26CM\n•Bao gồm: túi, đáy, thanh chia, hộp con\n•Ép kim full túi \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/hoa-vien-do-4-banh-re/hoa-vien-do-4-banh-re-1.mp4'
        ]
    },
    {
        id: 'song-nguyet-4-6-banh',
        name: 'Song Nguyệt   4 bánh, 6 bánh',
        folder: 'song-nguyet-4-6-banh',
        thumbnail: 'image/song-nguyet-4-6-banh/song-nguyet-4-6-banh-1.jpg',
        price: 'Từ 25.000đ đến 33.000đ',
        description: 'Bộ vỏ hộp song Nguyệt   đẹp mắt.',
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
        description: 'Hộp đựng 6 bánh mini với họa tiết thỏ ngọc màu đỏ sang trọng, phù hợp cho các dịp lễ tết.\n\n•KT: 19.5*25.5 (RC)\n•Bao gồm: đáy, nắp, túi, thanh chia \n•Ép kim mặt hộp, in 2 mặt \n•Chất liệu giấy ivr350',
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
        description: 'Hộp đựng 6 bánh mini với họa tiết thỏ ngọc màu vàng sang trọng, biểu tượng của sự may mắn và thịnh vượng.\n\n•KT: 19.5*25.5 (RC)\n•Bao gồm: đáy, nắp, túi, thanh chia \n•Ép kim mặt hộp, in 2 mặt \n•Chất liệu giấy ivr350',
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
        description: 'Hộp bánh trung thu có họa tiết hoa cúc tinh tế, có thể đựng 4-6 bánh tùy kích thước.\n\n• KT: 36*28*6.5cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
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
        description: 'Hộp bánh trung thu với họa tiết lan vũ sang trọng, đựng được 4 bánh cỡ vừa.\n\n•KT: 25.5*24CM\n•Bao gồm: túi, đáy, thanh chia, hộp con\n•Ép kim full túi \n•Chất liệu giấy ivr350',
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
        description: 'Hộp bánh liên ngũ đựng được 4 bánh, thiết kế sang trọng phù hợp biếu tặng.\n\n•KT: Túi: 28.5*28.5cm, đáy: 27*27cm\n•Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac',
        name: 'Hộp ngũ long Nguyệt   hội 4 bánh hình bát giác',
        folder: 'hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac',
        thumbnail: 'image/hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac/hop-ngu-long-nguyet-hoi-4-banh-hinh-bat-giac-1.jpg',
        price: 'Từ 36.000đ đến 39.000đ',
        description: 'Hộp bánh hình bát giác độc đáo với họa tiết ngũ long Nguyệt   hội, đựng được 4 bánh cỡ lớn.\n\n•KT: Túi: 39*40cm, đáy: 38*39cm (R-C)\n•Bao gồm: đáy, nắp, vách chia, túi, hộp con \n•Ép kim nắp hộp, hộp con \n•Vách chia bồi sóng \n•Chất liệu giấy ivr350',
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
        description: 'Hộp bánh trung thu với họa tiết hoa sen - biểu tượng của sự phú quý, đựng được 4 bánh với giá thành hợp lý.\n\n•KT: 25.5*24CM\n•Bao gồm: túi, đáy, thanh chia, hộp con\n•Ép kim full túi \n•Chất liệu giấy ivr350',
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
        name: 'Hộp song Nguyệt   4-6 bánh',
        folder: 'hop-song-nguyet-4-6-banh',
        thumbnail: 'image/hop-song-nguyet-4-6-banh/hop-song-nguyet-4-6-banh-1.jpg',
        price: 'Từ 28.000đ đến 32.000đ',
        description: 'Hộp bánh trung thu với họa tiết song Nguyệt   tinh tế, có thể đựng 4-6 bánh tùy kích thước.\n\n• KT: 36*28*6.5cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
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
        thumbnail: 'image/tui-dung-banh-trung-thu-sz-9-10-11/tui-dung-banh-trung-thu-sz-91011-1.jpg',
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
        description: 'Vỏ hộp 4 bánh với họa tiết hoa sen phú quý, thiết kế sang trọng.\n\n•KT: 25.5*24CM\n•Bao gồm: túi, đáy, thanh chia, hộp con\n•Ép kim full túi \n•Chất liệu giấy ivr350',
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
        description: 'Vỏ hộp hoa viên màu đỏ đẹp mắt, giá cả hợp lý.\n\n•KT: 25*26CM\n•Bao gồm: túi, đáy, thanh chia, hộp con\n•Ép kim full túi \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hoa-vien-re-do/61047170187894862015.mp4'
        ]
    },
    {
        id: 'hong-nguyet-vien-cam',
        name: 'Vỏ hộp hồng Nguyệt   viên cam',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hong-nguyet-vien-cam',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/hong-nguyet-vien-cam/hong-nguyet-vien-cam-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp hồng Nguyệt   viên màu cam tươi sáng, thiết kế bắt mắt.',
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
        description: 'Vỏ hộp lan vũ thiết kế tinh tế, giá cả phải chăng.\n\n•KT: 25.5*24CM\n•Bao gồm: túi, đáy, thanh chia, hộp con\n•Ép kim full túi \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/lan-vu-re-linh/389667241823861156218.mp4'
        ]
    },
    {
        id: 'nguyet-yen-1x',
        name: 'Vỏ hộp Nguyệt   yến 1x',
        folder: 'vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/nguyet-yen-1x',
        thumbnail: 'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/nguyet-yen-1x/nguyet-yen-1x-1.jpg',
        price: '5.000đ - 7.000đ',
        description: 'Vỏ hộp Nguyệt   yến thiết kế đơn giản, phù hợp nhiều dịp.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/vo-hop-banh-trung-thu-1-banh-lan-djo-tho-trang-3-5-7k/nguyet-yen-1x/44832794307711501843.mp4'
        ]
    },
    // Sản phẩm từ thư mục 18-06-2025
    {
        id: 'vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k',
        name: 'Vỏ bánh trung thu Nguyệt   thổ minh 4 bánh',
        folder: '18-06-2025/vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k',
        thumbnail: 'image/18-06-2025/vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k/vo-banh-trung-thu-nguyet-tho-minh-4-banh-28-35k-1.jpg',
        price: '28.000đ - 35.000đ',
        description: 'Vỏ bánh trung thu Nguyệt   thổ minh 4 bánh, thiết kế cổ điển trang nhã.',
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
        name: 'Vỏ hộp bánh trung thu Nguyệt   ánh 4 bánh trà',
        folder: '18-06-2025/vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k',
        thumbnail: 'image/18-06-2025/vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k/vo-hop-banh-trung-thu-nguyet-anh-4-banh-tra-32-39k-1.jpg',
        price: '32.000đ - 39.000đ',
        description: 'Vỏ hộp bánh trung thu Nguyệt   ánh 4 bánh trà, thiết kế sang trọng.',
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
        name: 'Vỏ hộp trung thu hồng Nguyệt   viên cam 4 bánh rẻ',
        folder: '18-06-2025/vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k/vo-hop-trung-thu-hong-nguyet-vien-cam-4-banh-re-16k-20k-1.jpg',
        price: '16.000đ - 20.000đ',
        description: 'Vỏ hộp trung thu hồng Nguyệt   viên cam 4 bánh, giá cả phải chăng.',
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
        description: 'Vỏ hộp trung thu lan vũ 4 bánh, thiết kế tinh tế với giá rẻ.\n\n•KT: 25.5*24CM\n•Bao gồm: túi, đáy, thanh chia, hộp con\n•Ép kim full túi \n•Chất liệu giấy ivr350',
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
        name: 'Vỏ hộp trung thu Nguyệt   yến 4 bánh rẻ',
        folder: '18-06-2025/vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k',
        thumbnail: 'image/18-06-2025/vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k/vo-hop-trung-thu-nguyet-yen-4-banh-re-16-20k-1.jpg',
        price: '16.000đ - 20.000đ',
        description: 'Vỏ hộp trung thu Nguyệt   yến 4 bánh, giá cả phải chăng.',
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
    },
    // Sản phẩm từ thư mục 26-5-2026
    {
        id: '6-banh-mini-kim-son-cam-20k-26k',
        name: '6 Bánh Mini Kim Sơn Cam 20k 26k',
        folder: '26-5-2026/6-banh-mini-kim-son-cam-20k-26k',
        thumbnail: 'image/26-5-2026/6-banh-mini-kim-son-cam-20k-26k/6-banh-mini-kim-son-cam-20k-26k-1.jpg',
        price: '20.000đ - 26.000đ',
        description: 'Mẫu hộp bánh trung thu 6 bánh mini kim sơn cam 20k 26k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: 19.5*25.5 (RC)\n•Bao gồm: đáy, nắp, túi, thanh chia \n•Ép kim mặt hộp, in 2 mặt \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'bat-giac-hao-quang-anh-trang-36k-44k',
        name: 'Bát Giác Hào Quang Ánh Trăng 36k 44k',
        folder: '26-5-2026/bat-giac-hao-quang-anh-trang-36k-44k',
        thumbnail: 'image/26-5-2026/bat-giac-hao-quang-anh-trang-36k-44k/bat-giac-hao-quang-anh-trang-36k-44k-1.jpg',
        price: '36.000đ - 44.000đ',
        description: 'Mẫu hộp bánh trung thu bát giác hào quang ánh trăng 36k 44k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: Túi: 39*40cm, đáy: 38*39cm (R-C)\n•Bao gồm: đáy, nắp, vách chia, túi, hộp con \n•Ép kim nắp hộp, hộp con \n•Vách chia bồi sóng \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/26-5-2026/bat-giac-hao-quang-anh-trang-36k-44k/7864726098354.mp4'
        ]
    },
    {
        id: 'cuc-nguyet-dinh-4-banh-kem-hop-tra-do-36k-44k',
        name: 'Cúc Nguyệt  Đỉnh 4 Bánh Kem Hộp Tra Đỏ 36k 44k',
        folder: '26-5-2026/cuc-nguyet-dinh-4-banh-kem-hop-tra-do-36k-44k',
        thumbnail: 'image/26-5-2026/cuc-nguyet-dinh-4-banh-kem-hop-tra-do-36k-44k/cuc-nguyet-dinh-4-banh-kem-hop-tra-do-36k-44k-1.jpg',
        price: '36.000đ - 44.000đ',
        description: 'Mẫu hộp bánh trung thu cúc Nguyệt  đỉnh 4 bánh kem hộp tra đỏ 36k 44k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n• KT: 36*28*6.5cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k',
        name: 'Hoàng Kim Hàng Giấy Mềm Cao Cấp Màu Gold 4 Bánh 6 Bánh 61k 70k',
        folder: '26-5-2026/hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k',
        thumbnail: 'image/26-5-2026/hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k/hoang-kim-hang-giay-mem-cao-cap-mau-gold-4-banh-6-banh-61k-70k-1.jpg',
        price: '61.000đ - 70.000đ',
        description: 'Mẫu hộp bánh trung thu hoàng kim hàng giấy mềm cao cấp màu gold 4 bánh 6 bánh 61k 70k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n【4 bánh】\n• KT: 36*28*6.5cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con, cài trang trí\n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350 CAO CẤP\n\n【6 bánh】\n• KT: 36*28*6.5cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con, cài trang trí\n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350 CAO CẤP',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-1-banh-to-tho-do-300-600g-23k-28k',
        name: 'Hộp 1 Bánh To Thỏ Đỏ 300 600g 23k 28k',
        folder: '26-5-2026/hop-1-banh-to-tho-do-300-600g-23k-28k',
        thumbnail: 'image/26-5-2026/hop-1-banh-to-tho-do-300-600g-23k-28k/hop-1-banh-to-tho-do-300-600g-23k-28k-1.jpg',
        price: '23.000đ - 28.000đ',
        description: 'Mẫu hộp bánh trung thu hộp 1 bánh to thỏ đỏ 300 600g 23k 28k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-cung-4-banh-kem-hop-tra-xanh-la-65k-75k',
        name: 'Hộp Cứng 4 Bánh Kem Hộp Tra Xanh Lá 65k 75k',
        folder: '26-5-2026/hop-cung-4-banh-kem-hop-tra-xanh-la-65k-75k',
        thumbnail: 'image/26-5-2026/hop-cung-4-banh-kem-hop-tra-xanh-la-65k-75k/hop-cung-4-banh-kem-hop-tra-xanh-la-65k-75k-1.jpg',
        price: '65.000đ - 75.000đ',
        description: 'Mẫu hộp bánh trung thu hộp cứng 4 bánh kem hộp tra xanh lá 65k 75k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: khay đáy 36*28*6.6cm, hộp con 10,2*10,2*6cm, \nHộp trà 6*6*22cm, Túi 38*31*8cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con, hộp trà, quai trúc\n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350 CAO CẤP',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-cung-6-banh-mini-75-100g-36k-45k',
        name: 'Hộp Cứng 6 Bánh Mini 75 100g 36k 45k',
        folder: '26-5-2026/hop-cung-6-banh-mini-75-100g-36k-45k',
        thumbnail: 'image/26-5-2026/hop-cung-6-banh-mini-75-100g-36k-45k/hop-cung-6-banh-mini-75-100g-36k-45k-1.jpg',
        price: '36.000đ - 45.000đ',
        description: 'Mẫu hộp bánh trung thu hộp cứng 6 bánh mini 75 100g 36k 45k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: 19.5*25.5 (RC)\n•Bao gồm: đáy, nắp, túi, thanh chia \n•Ép kim mặt hộp, in 2 mặt \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-cung-quai-truc-xanh-duong-4-banh-kem-tra-80-90k',
        name: 'Hộp Cứng Quai Trúc Xanh Dương 4 Bánh Kem Tra 80 90k',
        folder: '26-5-2026/hop-cung-quai-truc-xanh-duong-4-banh-kem-tra-80-90k',
        thumbnail: 'image/26-5-2026/hop-cung-quai-truc-xanh-duong-4-banh-kem-tra-80-90k/hop-cung-quai-truc-xanh-duong-4-banh-kem-tra-80-90k-1.jpg',
        price: 'Từ 80.000đ – 90.000đ',
        description: 'Hộp cứng quai trúc xanh dương, 4 bánh kem trà — mẫu cao cấp, phù hợp quà tặng và bán lẻ.\n\n•KT: khay đáy 36*28*6.6cm, hộp con 10,2*10,2*6cm, \nHộp trà 6*6*22cm, Túi 38*31*8cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con, hộp trà, quai trúc\n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350 CAO CẤP',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'khuc-nguyet-vien-cuc-do-4-banh-29-35k',
        name: 'Khúc Nguyệt  Viên Cúc Đỏ 4 Bánh 29 35k',
        folder: '26-5-2026/khuc-nguyet-vien-cuc-do-4-banh-29-35k',
        thumbnail: 'image/26-5-2026/khuc-nguyet-vien-cuc-do-4-banh-29-35k/khuc-nguyet-vien-cuc-do-4-banh-29-35k-1.jpg',
        price: 'Từ 29.000đ – 35.000đ',
        description: 'Khúc Nguyệt viên cúc đỏ, 4 bánh — thiết kế truyền thống, giá hợp lý cho đại lý và quà gia đình.\n\n•KT: Túi: 28.5*28.5cm, đáy: 27*27cm\n•Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/26-5-2026/khuc-nguyet-vien-cuc-do-4-banh-29-35k/khuc-nguyet-vien-cuc-do-4-banh-29-35k-video-1.mp4'
        ]
    },
    {
        id: 'kim-lien-nguyet-xanh-la-4-banh-6-banh-29k-44k',
        name: 'Kim Liên Nguyệt  Xanh Lá 4 Bánh 6 Bánh 29k 44k',
        folder: '26-5-2026/kim-lien-nguyet-xanh-la-4-banh-6-banh-29k-44k',
        thumbnail: 'image/26-5-2026/kim-lien-nguyet-xanh-la-4-banh-6-banh-29k-44k/kim-lien-nguyet-xanh-la-4-banh-6-banh-29k-44k-1.jpg',
        price: '29.000đ - 44.000đ',
        description: 'Mẫu hộp bánh trung thu kim liên Nguyệt  xanh lá 4 bánh 6 bánh 29k 44k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n【4 bánh】\n•KT: Túi: 28.5*28.5cm, đáy: 27*27cm\n•Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350\n\n【6 bánh】\n•KT: Túi: 28.5*28.5cm, đáy: 27*27cm\n•Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'lien-nguyet-dinh-4-banh-kem-hop-tra-6-banh-33k-40k',
        name: 'Liên Nguyệt  Đỉnh 4 Bánh Kem Hộp Tra 6 Bánh 33k 40k',
        folder: '26-5-2026/lien-nguyet-dinh-4-banh-kem-hop-tra-6-banh-33k-40k',
        thumbnail: 'image/26-5-2026/lien-nguyet-dinh-4-banh-kem-hop-tra-6-banh-33k-40k/lien-nguyet-dinh-4-banh-kem-hop-tra-6-banh-33k-40k-1.jpg',
        price: '33.000đ - 40.000đ',
        description: 'Mẫu hộp bánh trung thu liên Nguyệt  đỉnh 4 bánh kem hộp tra 6 bánh 33k 40k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: Túi: 28.5*28.5cm, đáy: 27*27cm\n•Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k',
        name: 'Nguyệt  Hoa Viên Doxanh Duong 4 Bánh Rẻ 185k 25k',
        folder: '26-5-2026/nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k',
        thumbnail: 'image/26-5-2026/nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k/nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k-1.jpg',
        price: '18.500đ - 25.000đ',
        description: 'Mẫu hộp bánh trung thu Nguyệt  hoa viên doxanh duong 4 bánh rẻ 185k 25k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: 25.5*24CM\n•Bao gồm: túi, đáy, thanh chia, hộp con ép kim\n•Ép kim full túi \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/26-5-2026/nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k/7867186421098.mp4',
            'image/26-5-2026/nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k/nguyet-hoa-vien-doxanh-duong-4-banh-re-185k-25k-video-1.mp4'
        ]
    },
    {
        id: 'nguyet-lien-ngu-4-banh-tra-6-banh-37k-44k',
        name: 'Nguyệt  Liên Ngư 4 Bánh Tra 6 Bánh 37k 44k',
        folder: '26-5-2026/nguyet-lien-ngu-4-banh-tra-6-banh-37k-44k',
        thumbnail: 'image/26-5-2026/nguyet-lien-ngu-4-banh-tra-6-banh-37k-44k/nguyet-lien-ngu-4-banh-tra-6-banh-37k-44k-1.jpg',
        price: '37.000đ - 44.000đ',
        description: 'Mẫu hộp bánh trung thu Nguyệt  liên ngư 4 bánh tra 6 bánh 37k 44k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n• KT: 36*28*6.5cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'song-ngu-do-4-banh-tra-doc-36k-44k',
        name: 'Song Ngư Đỏ 4 Bánh Tra Dọc 36k 44k',
        folder: '26-5-2026/song-ngu-do-4-banh-tra-doc-36k-44k',
        thumbnail: 'image/26-5-2026/song-ngu-do-4-banh-tra-doc-36k-44k/song-ngu-do-4-banh-tra-doc-36k-44k-1.jpg',
        price: '36.000đ - 44.000đ',
        description: 'Mẫu hộp bánh trung thu song ngư đỏ 4 bánh tra dọc 36k 44k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: Túi: 39*40cm, đáy: 38*39cm (R-C)\n•Bao gồm: đáy, nắp, vách chia, túi, hộp con \n•Ép kim nắp hộp, hộp con \n•Vách chia bồi sóng \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'thien-hoa-van-nguyet-4-banh-re-175k-24k',
        name: 'Thiên Hoa Vân Nguyệt  4 Bánh Rẻ 175k 24k',
        folder: '26-5-2026/thien-hoa-van-nguyet-4-banh-re-175k-24k',
        thumbnail: 'image/26-5-2026/thien-hoa-van-nguyet-4-banh-re-175k-24k/thien-hoa-van-nguyet-4-banh-re-175k-24k-1.jpg',
        price: '17.500đ - 24.000đ',
        description: 'Mẫu hộp bánh trung thu thiên hoa vân Nguyệt  4 bánh rẻ 175k 24k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: 25.5*24CM\n•Bao gồm: túi, đáy, thanh chia, hộp con ép kim\n•Ép kim full túi \n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'tho-xanh-duong-4-banh-29k-35k',
        name: 'Thỏ Xanh Dương 4 Bánh 29k 35k',
        folder: '26-5-2026/tho-xanh-duong-4-banh-29k-35k',
        thumbnail: 'image/26-5-2026/tho-xanh-duong-4-banh-29k-35k/tho-xanh-duong-4-banh-29k-35k-1.jpg',
        price: '29.000đ - 35.000đ',
        description: 'Mẫu hộp bánh trung thu thỏ xanh dương 4 bánh 29k 35k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n• KT: 36*28*6.5cm\n• Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'thu-hoa-4-banh-do-29k-35k',
        name: 'Thu Hoa 4 Bánh Đỏ 29k 35k',
        folder: '26-5-2026/thu-hoa-4-banh-do-29k-35k',
        thumbnail: 'image/26-5-2026/thu-hoa-4-banh-do-29k-35k/thu-hoa-4-banh-do-29k-35k-1.jpg',
        price: '29.000đ - 35.000đ',
        description: 'Mẫu hộp bánh trung thu thu hoa 4 bánh đỏ 29k 35k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.\n\n•KT: Túi: 28.5*28.5cm, đáy: 27*27cm\n•Bao gồm: nắp, túi, đáy, vách chia, hộp con \n•Ép kim mặt hộp, hộp con\n•Chất liệu giấy ivr350',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    // Sản phẩm từ thư mục 11-06-2026
    {
        id: '1b-mini-sll-3k',
        name: 'Hộp 1 bánh mini sỉ 3k',
        folder: '11-06-2026/1b-mini-sll-3k',
        thumbnail: 'image/11-06-2026/1b-mini-sll-3k/1b-mini-sll-3k-1.jpg',
        price: '3.000đ',
        description: 'Mẫu hộp bánh trung thu hộp 1 bánh mini sỉ 3k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: '2-banh-re-5-mau',
        name: '2 bánh rẻ 5 màu',
        folder: '11-06-2026/2-banh-re-5-mau',
        thumbnail: 'image/11-06-2026/2-banh-re-5-mau/2-banh-re-5-mau-1.jpg',
        price: '14.000đ - 20.000đ',
        description: 'Mẫu hộp bánh trung thu 2 bánh rẻ 5 màu, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: '6-banh-mini-mem-san-2-ma-sll-19k',
        name: '6 bánh mini mềm sẵn 2 mã sỉ 19k',
        folder: '11-06-2026/6-banh-mini-mem-san-2-ma-sll-19k',
        thumbnail: 'image/11-06-2026/6-banh-mini-mem-san-2-ma-sll-19k/6-banh-mini-mem-san-2-ma-sll-19k-1.jpg',
        price: '19.000đ - 26.000đ',
        description: 'Mẫu hộp bánh trung thu 6 bánh mini mềm sẵn 2 mã sỉ 19k, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/11-06-2026/6-banh-mini-mem-san-2-ma-sll-19k/6-banh-mini-mem-san-2-ma-sll-19k-video-1.mp4',
            'image/11-06-2026/6-banh-mini-mem-san-2-ma-sll-19k/6-banh-mini-mem-san-2-ma-sll-19k-video-2.mp4'
        ]
    },
    {
        id: '6b-mini-san-hn-3x',
        name: '6 bánh mini sẵn HN 3x',
        folder: '11-06-2026/6b-mini-san-hn-3x',
        thumbnail: 'image/11-06-2026/6b-mini-san-hn-3x/6b-mini-san-hn-3x-1.jpg',
        price: '19.000đ - 26.000đ',
        description: 'Mẫu hộp bánh trung thu 6 bánh mini sẵn HN 3x, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'bat-giac-tho-quy-toc',
        name: 'Bát giác thỏ quý tộc',
        folder: '11-06-2026/bat-giac-tho-quy-toc',
        thumbnail: 'image/11-06-2026/bat-giac-tho-quy-toc/bat-giac-tho-quy-toc-1.jpg',
        price: '36.000đ - 44.000đ',
        description: 'Mẫu hộp bánh trung thu bát giác thỏ quý tộc, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/11-06-2026/bat-giac-tho-quy-toc/bat-giac-tho-quy-toc-video-1.mp4'
        ]
    },
    {
        id: 'hut-am',
        name: 'Gói hút ẩm bánh Trung Thu',
        folder: '11-06-2026/hut-am',
        thumbnail: 'image/11-06-2026/hut-am/hut-am-1.jpg',
        price: '5.000đ - 15.000đ',
        description: 'Mẫu phụ kiện gói hút ẩm bánh Trung Thu, phù hợp cửa hàng bánh và đại lý.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hac-van-nguyet-3x',
        name: 'Hạc vân nguyệt 3x',
        folder: '11-06-2026/hac-van-nguyet-3x',
        thumbnail: 'image/11-06-2026/hac-van-nguyet-3x/hac-van-nguyet-3x-1.jpg',
        price: '29.000đ - 35.000đ',
        description: 'Mẫu hộp bánh trung thu hạc vân nguyệt 3x, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hac-vu-nguyet-ca-4-banh-6-banh',
        name: 'Hạc vũ nguyệt ca 4 bánh 6 bánh',
        folder: '11-06-2026/hac-vu-nguyet-ca-4-banh-6-banh',
        thumbnail: 'image/11-06-2026/hac-vu-nguyet-ca-4-banh-6-banh/hac-vu-nguyet-ca-4-banh-6-banh-1.jpg',
        price: '50.000đ - 70.000đ',
        description: 'Mẫu hộp bánh trung thu hạc vũ nguyệt ca 4 bánh 6 bánh, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'hop-cung-gap-gon-6x',
        name: 'Hộp cứng gấp gọn 6x',
        folder: '11-06-2026/hop-cung-gap-gon-6x',
        thumbnail: 'image/11-06-2026/hop-cung-gap-gon-6x/hop-cung-gap-gon-6x-1.jpg',
        price: '36.000đ - 45.000đ',
        description: 'Mẫu hộp bánh trung thu hộp cứng gấp gọn 6x, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: [
            'image/11-06-2026/hop-cung-gap-gon-6x/hop-cung-gap-gon-6x-video-1.mp4',
            'image/11-06-2026/hop-cung-gap-gon-6x/hop-cung-gap-gon-6x-video-2.mp4',
            'image/11-06-2026/hop-cung-gap-gon-6x/hop-cung-gap-gon-6x-video-3.mp4'
        ]
    },
    {
        id: 'khay-tui-pet',
        name: 'Khay túi pet đựng bánh',
        folder: '11-06-2026/khay-tui-pet',
        thumbnail: 'image/11-06-2026/khay-tui-pet/khay-tui-pet-1.jpg',
        price: '5.000đ - 15.000đ',
        description: 'Mẫu phụ kiện khay túi pet đựng bánh, phù hợp cửa hàng bánh và đại lý.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'lan-da-3x-nho',
        name: 'Lan dạ 3x nhỏ',
        folder: '11-06-2026/lan-da-3x-nho',
        thumbnail: 'image/11-06-2026/lan-da-3x-nho/lan-da-3x-nho-1.jpg',
        price: '16.000đ - 20.000đ',
        description: 'Mẫu hộp bánh trung thu lan dạ 3x nhỏ, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'tho-do-3x-nho',
        name: 'Thỏ đỏ 3x nhỏ',
        folder: '11-06-2026/tho-do-3x-nho',
        thumbnail: 'image/11-06-2026/tho-do-3x-nho/tho-do-3x-nho-1.jpg',
        price: '23.000đ - 28.000đ',
        description: 'Mẫu hộp bánh trung thu thỏ đỏ 3x nhỏ, phù hợp cửa hàng bánh, đại lý và khách mua sỉ.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
    },
    {
        id: 'vo-ep-kim-thuc-noi',
        name: 'Vỏ ép kim thúc nổi',
        folder: '11-06-2026/vo-ep-kim-thuc-noi',
        thumbnail: 'image/11-06-2026/vo-ep-kim-thuc-noi/vo-ep-kim-thuc-noi-1.jpg',
        price: 'Từ 29.000đ – 45.000đ',
        description: 'Vỏ hộp bánh trung thu ép kim thúc nổi — họa tiết nổi bật, sang trọng, phù hợp set quà cao cấp và bán lẻ trên Shopee.',
        category: 'hộp bánh trung thu',
        season: 'trung thu',
        videos: []
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
    
    // Kết hợp và giới hạn số lượng; ưu tiên mẫu mới 2026 lên đầu trang chủ
    const featuredProducts = [...priorityProducts, ...otherProducts].sort((a, b) => {
        const aIsNew2026 = a.folder && a.folder.startsWith('26-5-2026/');
        const bIsNew2026 = b.folder && b.folder.startsWith('26-5-2026/');
        if (aIsNew2026 !== bIsNew2026) return aIsNew2026 ? -1 : 1;
        return 0;
    }).slice(0, limit);
    
    return featuredProducts;
}

// Hàm lấy tất cả sản phẩm (giữ nguyên cho tương thích)
function getAllProducts() {
    return products;
} 