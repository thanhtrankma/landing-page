# Cài đặt Cloudflare R2 cho ảnh & video người dùng tải lên

Ảnh/video trong các công cụ online (thiệp cưới…) được trình duyệt tải **thẳng lên R2** bằng URL ký sẵn
(`/api/uploads/sign`), không đi qua server Next.js. Khi chưa cấu hình R2, tệp được lưu vào `public/uploads`
(chỉ dùng khi phát triển).

Gói miễn phí của R2: 10 GB lưu trữ, băng thông tải ra miễn phí. Xem giá hiện hành tại
<https://developers.cloudflare.com/r2/pricing/>.

## Cách nhanh: Wrangler CLI

Thay cho bước 1–3 bên dưới (bước 4 tạo API token vẫn phải làm trên dashboard):

```sh
npx wrangler login
npx wrangler r2 bucket create superlanding-uploads
npx wrangler r2 bucket cors set superlanding-uploads --file docs/r2-cors.json
npx wrangler r2 bucket cors list superlanding-uploads
# Zone ID: Dashboard → chọn tên miền → Overview → cột phải "API"
npx wrangler r2 bucket domain add superlanding-uploads --domain cdn.superlanding.vn --zone-id <ZONE_ID> --min-tls 1.2
```

`docs/r2-cors.json` dùng định dạng của Wrangler (`rules` / `allowed`), khác với JSON dán trên dashboard ở bước 3.

## 1. Tạo bucket

Cloudflare Dashboard → **R2 Object Storage** → **Create bucket** → tên `superlanding-uploads`
(location: Automatic).

## 2. Gắn tên miền riêng (bắt buộc cho production)

Bucket → **Settings** → **Custom Domains** → **Connect Domain** → nhập `cdn.superlanding.vn`.
Tên miền chính phải đang dùng DNS của Cloudflare. Không dùng URL `*.r2.dev` cho production: Cloudflare
giới hạn tốc độ và không cache nó.

## 3. CORS

Bucket → **Settings** → **CORS Policy** → dán:

```json
[
  {
    "AllowedOrigins": ["https://superlanding.vn", "https://www.superlanding.vn", "http://localhost:3000", "http://localhost:3001"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Cache-Control"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 86400
  }
]
```

- `PUT` để trình duyệt tải lên bằng URL ký sẵn.
- `GET` để canvas đọc được ảnh khi xuất PNG/PDF (thiếu thì gặp lỗi "tainted canvas").
- Đổi tên miền nếu site chạy ở địa chỉ khác.

## 4. Tạo API token

R2 → **Manage R2 API Tokens** → **Create API token**:
- Permissions: **Object Read & Write**
- Specify bucket: chỉ `superlanding-uploads`

Lưu lại **Access Key ID** và **Secret Access Key** (chỉ hiện một lần). **Account ID** nằm ở trang tổng quan R2.

## 5. Biến môi trường

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=superlanding-uploads
R2_PUBLIC_URL=https://cdn.superlanding.vn
```

Đặt trên hosting (và `.env` nếu muốn thử R2 khi dev), rồi khởi động lại server.

## 6. (Khuyến nghị) Cache & dọn dẹp

- Mỗi tệp có tên ngẫu nhiên và được gắn `Cache-Control: public, max-age=31536000, immutable` khi tải lên,
  nên Cloudflare cache được lâu dài. Lượt xem lặp lại không tính vào hạn mức đọc của R2.
- Bucket → **Settings** → **Object lifecycle rules**: có thể đặt tự xoá các tệp trong `cards/` sau N ngày
  khi chưa có cơ chế dọn tệp mồ côi.

## Giới hạn hiện tại

Cấu hình ở `src/lib/upload-rules.ts`:

| | Định dạng | Tối đa |
|---|---|---|
| Ảnh | WebP / JPG / PNG (trình duyệt tự nén về cạnh dài 2560px) | 5MB sau nén, 30MB ảnh gốc |
| Video | MP4 / WebM / MOV | 50MB, 90 giây |

Rate limit theo IP: 40 ảnh / 10 phút, 6 video / giờ.

## Dùng trong code (client component)

```ts
import { uploadFile, UploadError } from "@/lib/upload-client";

const { url, width, height } = await uploadFile(file, "image", { onProgress: (r) => setProgress(r) });
const video = await uploadFile(file, "video"); // { url, duration, width, height }
```
