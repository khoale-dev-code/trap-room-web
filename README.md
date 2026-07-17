# TRAP Room Foundation

Nền tảng ban đầu cho website quán TRAP Room:

- React + Vite
- Tailwind CSS v4
- Express API
- MongoDB Atlas + Mongoose
- Cloudinary config ở backend
- Google Maps lấy từ dữ liệu `Shop`
- Instagram: `@trapart.room`

## Chạy bằng PowerShell

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npm run check:db
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000  
Health check: http://localhost:4000/api/health

## Logo

File `public/trap-logo.png` đã được đặt từ ảnh tham khảo. Có thể thay bằng
logo PNG/SVG bản gốc chất lượng cao hơn nhưng giữ nguyên tên file.
