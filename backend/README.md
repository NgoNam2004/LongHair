# Barbershop Management Backend API

Đây là hệ thống Backend cho ứng dụng quản lý quán cắt tóc (Barbershop Management).

## Công nghệ sử dụng
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **JWT** (JSON Web Token) cho Authentication
- **express-validator** để validate dữ liệu
- **morgan** cho logging

## Cấu trúc thư mục
Được tổ chức theo chuẩn chuyên nghiệp, chia nhỏ theo các module (Controllers, Services, Routes, Models, Middlewares).

## Cài đặt & Khởi chạy

1. **Cài đặt thư viện**
   ```bash
   cd backend
   npm install
   ```

2. **Cấu hình biến môi trường**
   Copy file `.env.example` thành `.env` và cấu hình các thông số (đặc biệt là `MONGODB_URI` và `JWT_SECRET`).
   ```bash
   cp .env.example .env
   ```

3. **Chạy ứng dụng**
   ```bash
   # Môi trường dev (có nodemon)
   npm run dev

   # Môi trường production
   npm start
   ```

## Các module đã hoàn thiện
- **Auth**: Đăng nhập cơ bản để lấy JWT Token
- **Invoice**: Đầy đủ các API quản lý hóa đơn (CRUD, Pay, Cancel, Thống kê doanh thu)

*Lưu ý: Các module khác (Customer, Appointment, Service, Staff) hiện đã có Model để Invoice có thể Reference.*
