# Xem website trên máy (localhost)

Dự án gồm **2 phần**:

| Phần | File | Xem local thế nào |
|------|------|-------------------|
| Trang chủ + chi tiết SP | `index.html`, `product.html` | Mở file hoặc server tĩnh |
| **Blog** | `_posts/*.md` | **Bắt buộc chạy Jekyll** (Markdown → HTML) |

Chỉ mở `index.html` bằng trình duyệt **không** hiển thị được bài blog trong `_posts/`.

---

## Cách 1 — Jekyll (đầy đủ: blog + trang chủ + SP)

### Cài Ruby trên Windows (một lần)

1. Tải [Ruby+Devkit](https://rubyinstaller.org/downloads/) (bản **3.3.x with Devkit**).
2. Cài xong, mở PowerShell trong thư mục dự án:

```powershell
cd D:\vanthang\hopqua.github.io
gem install bundler
bundle install
```

3. Chạy server local (có tự reload khi sửa file):

```powershell
bundle exec jekyll serve --livereload
```

4. Mở trình duyệt: **http://127.0.0.1:4000/**

- Trang chủ: http://127.0.0.1:4000/
- Blog: http://127.0.0.1:4000/blog/
- Một bài viết: http://127.0.0.1:4000/2026/06/02/chon-hop-4-banh-hay-6-banh-trung-thu.html
- Sản phẩm: http://127.0.0.1:4000/product.html?id=hoa-vien-do-4-banh-re

Dừng server: `Ctrl + C`.

### Chỉ build ra thư mục `_site/` (không chạy server)

```powershell
bundle exec jekyll build
```

Sau đó có thể dùng Cách 2 với thư mục `_site`.

---

## Cách 2 — Server tĩnh (nhanh, sau khi `jekyll build`)

```powershell
cd D:\vanthang\hopqua.github.io\_site
npx --yes serve -l 4000
```

Hoặc Python:

```powershell
cd D:\vanthang\hopqua.github.io\_site
python -m http.server 4000
```

Mở http://localhost:4000

---

## Cách 3 — Chỉ xem trang chủ / SP (không có blog)

```powershell
cd D:\vanthang\hopqua.github.io
python -m http.server 8080
```

- http://localhost:8080/index.html  
- http://localhost:8080/product.html?id=ten-san-pham  

**Blog sẽ không hoạt động** với cách này.

---

## Extension VS Code / Cursor

**Live Server** chỉ phục vụ file HTML tĩnh — **không** biên dịch `_posts`. Dùng Jekyll (`bundle exec jekyll serve`) khi sửa blog.

---

## So với GitHub Pages

Lệnh `jekyll serve` gần giống bản deploy trên `hopqua.github.io`. Nên preview blog bằng Jekyll trước khi push.
