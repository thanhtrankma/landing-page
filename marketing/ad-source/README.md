# Video quảng cáo SuperLanding (9:16, 25 giây)

Kịch bản dựng bằng HTML (`ad.html`), mỗi khung hình được tính theo thời gian nên xuất ra luôn giống nhau.

1. Chạy website (`npm run dev`), rồi chụp ảnh các trang dùng trong video:
   `node capture.mjs shots home=/ pricing=/bang-gia aurelia=/demos/aurelia-residences/index.html ielts=/demos/gd-ielts-elevate/index.html ritual=/demos/ritual-coffee/index.html vitalis=/demos/duoc-vitalis-health/index.html banh=/demos/tp-banh-ngot-atelier/index.html spa=/demos/4men-spa/index.html`
2. Chép `public/images/logo.png` và `public/images/zalo-icon.png` vào thư mục này.
3. Xuất khung hình: `node render.mjs "$PWD/ad.html" frames 30`
4. Ghép video: `ffmpeg -framerate 30 -i frames/f%05d.jpg -f lavfi -i anullsrc=r=48000:cl=stereo -shortest -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -movflags +faststart ../superlanding-ad-9x16.mp4`

Xem thử trực tiếp trong trình duyệt: mở `ad.html#play`.

# Video "12 mẫu website" (9:16, 32 giây) — `showcase.html`

1. Chụp ảnh máy tính và điện thoại của các demo (cần `npm run dev`), chạy trong thư mục này:
   `DESK=1 node capture2.mjs desk aurelia=/demos/aurelia-residences/index.html ...` rồi `node capture2.mjs mob aurelia=/demos/aurelia-residences/index.html ...`
   (danh sách mẫu nằm trong `DEMOS` và `GRID` ở đầu phần script của `showcase.html`: tên ảnh = tên trước dấu `=`)
2. Xuất khung hình: `node render.mjs "$PWD/showcase.html" frames2 30`
3. Ghép video: `ffmpeg -framerate 30 -i frames2/f%05d.jpg -f lavfi -i anullsrc=r=48000:cl=stereo -shortest -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -movflags +faststart ../superlanding-mau-website-9x16.mp4`

Đổi tên, ngành hoặc mô tả của từng mẫu: sửa mảng `DEMOS` trong `showcase.html`.

# Ảnh đăng bài (1080×1350) — `posts.html`

7 ảnh `p1`…`p7` nằm trong một file; ảnh demo lấy từ thư mục `desk/` và `mob/` (chụp bằng `capture2.mjs` như trên, thêm `home=/` cho ảnh 7).
Xuất ảnh: `node shoot.mjs "$PWD/posts.html" out p1 p2 p3 p4 p5 p6 p7` (ra bản 2160×2700), rồi thu nhỏ:
`ffmpeg -i out/p1@2x.png -vf scale=1080:1350:flags=lanczos ../posts/01-uu-dai.png`
