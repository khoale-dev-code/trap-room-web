<div align="center">

<img src="./public/trap-logo.png" alt="TRAP Room" width="132" />

# TRAP Room Web

### Website giới thiệu và quản trị nội dung cho TRAP Room

Coffee · Matcha · Homebaked · A colorful place to stay awhile.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=111)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4-111111?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

**Website:** https://trap-room-web.vercel.app  
**API:** https://trap-room-web-production.up.railway.app

</div>

---

## Giới thiệu

**TRAP Room Web** là hệ thống website full-stack dành cho TRAP Room, bao gồm:

- **Public Website** để khách hàng xem menu, không gian, bài viết, ưu đãi và gửi yêu cầu đặt bàn.
- **Admin Dashboard** để quản lý toàn bộ nội dung hiển thị trên website.
- **REST API** kết nối MongoDB, xử lý xác thực và upload media lên Cloudinary.

Website được xây dựng theo hướng responsive, ưu tiên trải nghiệm trên thiết bị di động và hoạt động ổn định trên Chrome, Safari cùng các trình duyệt hiện đại.

> Dự án chỉ hiển thị sản phẩm và thông tin cửa hàng, không tích hợp giỏ hàng hoặc thanh toán trực tuyến.

---

## Tính năng chính

### Public Website

- Trang chủ giới thiệu thương hiệu và không gian TRAP Room.
- Menu theo danh mục, tìm kiếm và lọc sản phẩm.
- Trang chi tiết sản phẩm với hình ảnh, mô tả, kích thước và topping.
- Gallery hình ảnh và video.
- Journal posts và nội dung thương hiệu.
- Promotions và các chương trình đang diễn ra.
- Form gửi yêu cầu đặt bàn.
- Địa chỉ, giờ mở cửa và liên kết Google Maps lấy từ dữ liệu cửa hàng.
- Giao diện responsive cho desktop, tablet và mobile.
- Metadata, logo và favicon được cấu hình từ Admin.

### Admin Dashboard

- Đăng nhập bằng phiên xác thực cookie.
- Phân quyền Owner và Staff.
- Quản lý danh mục menu.
- Quản lý sản phẩm, giá, kích thước, topping, tag và trạng thái hiển thị.
- Quản lý Gallery, Journal posts và Promotions.
- Theo dõi và cập nhật trạng thái đặt bàn.
- Quản lý nhân viên và lịch làm việc.
- Cập nhật thông tin cửa hàng, địa chỉ và liên kết mạng xã hội.
- Quản lý giờ mở cửa theo ngày thường và cuối tuần.
- Cấu hình Google Maps.
- Upload logo, ảnh bìa, hero media và nội dung trang chủ.
- Thay đổi mật khẩu tài khoản chủ cửa hàng.
- Giao diện Admin responsive và hỗ trợ tiếng Anh / tiếng Việt.

---

## Công nghệ sử dụng

### Frontend

- React 19
- React Router
- Vite 6
- Tailwind CSS 4
- Lucide React
- TAOS animation
- Responsive CSS cho Chrome và Safari

### Backend

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Zod validation
- Cookie-based authentication
- JSON Web Token
- Multer
- Cloudinary

### Triển khai

- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** MongoDB Atlas
- **Media storage:** Cloudinary

---

## Thiết kế thương hiệu

| Thành phần | Giá trị |
|---|---|
| Primary Blue | `#011EA0` |
| Accent Yellow | `#FFE53A` |
| Accent Orange | `#EF4D05` |
| Ink | `#07113F` |
| Paper | `#FFFAF0` |
| Cream | `#F7F2E6` |
| UI Font | Manrope |
| Display Font | Archivo Black |
| Editorial Font | Instrument Serif |

Phong cách giao diện hướng đến cảm giác vui tươi, nổi bật nhưng vẫn rõ ràng và dễ sử dụng.

---

## Cấu trúc dự án

```text
trap-room-web/
├── public/
│   ├── favicon.svg
│   ├── trap-logo.png
│   └── vendor/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── security/
│   ├── services/
│   ├── utils/
│   ├── index.js
│   └── seed.js
├── src/
│   ├── admin/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── AdminApp.jsx
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── i18n/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── scripts/
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Cài đặt dự án

### Yêu cầu

- Node.js `20.19` trở lên
- npm
- MongoDB Atlas
- Cloudinary account

### Clone repository

```bash
git clone https://github.com/khoale-dev-code/trap-room-web.git
cd trap-room-web
```

### Cài dependencies

```bash
npm install
```

### Cấu hình biến môi trường

Tạo file `.env` tại thư mục gốc và điền các giá trị phù hợp:

```env
PORT=4000
NODE_ENV=development

CLIENT_ORIGINS=http://localhost:5173

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/trap_room

ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_with_a_strong_password
ADMIN_JWT_SECRET=replace_with_a_long_random_secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=trap-room

VITE_API_URL=
```

Không commit `.env`, mật khẩu, secret hoặc thông tin kết nối thật lên GitHub.

---

## Chạy dự án

### Chạy frontend và backend cùng lúc

```bash
npm run dev
```

Mặc định:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:4000
Health:   http://localhost:4000/api/health
Admin:    http://localhost:5173/admin
```

### Chạy riêng frontend

```bash
npm run dev:web
```

### Chạy riêng backend

```bash
npm run dev:api
```

### Kiểm tra kết nối MongoDB

```bash
npm run check:db
```

### Tạo dữ liệu ban đầu

```bash
npm run seed
```

### Build frontend production

```bash
npm run build
```

### Xem thử bản build

```bash
npm run preview
```

### Chạy backend production

```bash
npm start
```

---

## Các lệnh npm

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy frontend và backend cùng lúc |
| `npm run dev:web` | Chạy Vite development server |
| `npm run dev:api` | Chạy Express API ở chế độ watch |
| `npm run build` | Build frontend production |
| `npm run preview` | Preview thư mục build |
| `npm start` | Chạy Express API |
| `npm run check:db` | Kiểm tra kết nối MongoDB |
| `npm run seed` | Tạo dữ liệu mẫu |
| `npm run seed:admin-demo` | Tạo dữ liệu Admin demo |
| `npm run clear:admin-demo` | Xóa dữ liệu Admin demo |

---

## API

Một số endpoint chính:

```text
GET    /api/health
GET    /api/public-store
GET    /api/shop
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/products
GET    /api/categories
GET    /api/gallery
GET    /api/posts
GET    /api/promotions
POST   /api/reservations
```

Các endpoint quản trị yêu cầu đăng nhập và quyền truy cập phù hợp.

---

## Dữ liệu và media

- Dữ liệu nội dung được lưu trong MongoDB Atlas.
- Ảnh và video được upload lên Cloudinary.
- Public Website đọc dữ liệu từ API thay vì sử dụng nội dung hard-code.
- Thông tin cửa hàng, giờ mở cửa, Google Maps, logo và homepage media được quản lý trong Admin.

---

## Xác thực và bảo mật

- Phiên đăng nhập Admin sử dụng cookie.
- Route quản trị được bảo vệ ở cả frontend và backend.
- Mật khẩu và secret chỉ được lưu trong biến môi trường hoặc bản ghi bảo mật trong database.
- Không đưa thông tin xác thực thật vào source code.
- Production chỉ cho phép các client origin đã cấu hình.
- File upload được xử lý và lưu trữ thông qua Cloudinary.

Sau khi triển khai lần đầu, nên thay ngay mật khẩu khởi tạo bằng một mật khẩu mạnh trong Admin.

---

## Triển khai

### Frontend — Vercel

```text
Build command: npm run build
Output directory: dist
```

Các request `/api/*` được chuyển tiếp đến Railway thông qua cấu hình rewrite.

### Backend — Railway

```text
Start command: npm start
```

Các biến môi trường production được cấu hình trực tiếp trong Railway.

---

## Nguyên tắc phát triển

- Không hard-code dữ liệu có thể quản lý từ Admin.
- Không chỉnh sửa trực tiếp DOM do React quản lý.
- Không lưu secret trong repository.
- Luôn kiểm tra responsive trên Chrome và Safari.
- Duy trì khả năng sử dụng bằng bàn phím và hỗ trợ reduced motion.
- Dùng Vite build để kiểm tra JSX và production bundle.
- Giữ API tương thích giữa Public Website và Admin Dashboard.

---

## Repository

GitHub: https://github.com/khoale-dev-code/trap-room-web

---

<div align="center">

Built for **TRAP Room**.

</div>