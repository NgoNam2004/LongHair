# 💈 Barbershop Management Admin

Hệ thống quản lý quán cắt tóc toàn diện, xây dựng bằng **Vue 3 + Vite + Ant Design Vue**.

## 🛠️ Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Vue 3 | ^3.5 | Framework chính (Composition API) |
| Vite | ^6.0 | Build tool |
| Ant Design Vue | ^4.2 | UI Component Library |
| Vue Router | ^4.5 | Routing |
| Pinia | ^2.2 | State Management |
| Axios | ^1.7 | HTTP Client |
| Day.js | ^1.11 | Xử lý ngày tháng |

## 📁 Cấu trúc thư mục

```
src/
├── api/                    # API layer (Axios + mock)
│   ├── auth.js             # Auth API
│   ├── appointment.js      # Appointment API
│   ├── customer.js         # Customer API
│   ├── service.js          # Service API
│   ├── staff.js            # Staff API
│   ├── invoice.js          # Invoice API
│   ├── dashboard.js        # Dashboard API
│   ├── setting.js          # Settings API
│   ├── http.js             # Axios instance + interceptors
│   └── index.js            # Barrel exports
├── assets/                 # Static assets
├── layouts/
│   └── AdminLayout.vue     # Main admin layout (sidebar + header)
├── router/
│   ├── index.js            # Router với auth guard
│   └── routes.js           # Route definitions
├── stores/                 # Pinia stores
│   ├── auth.js
│   ├── appointment.js
│   ├── customer.js
│   ├── service.js
│   ├── staff.js
│   └── invoice.js
├── utils/
│   ├── format.js           # Utility functions (currency, date...)
│   └── mockData.js         # Mock data cho development
└── views/
    ├── auth/Login.vue
    ├── dashboard/Dashboard.vue
    ├── appointment/
    │   ├── AppointmentList.vue
    │   └── AppointmentForm.vue
    ├── customer/
    │   ├── CustomerList.vue
    │   └── CustomerDetail.vue
    ├── service/ServiceList.vue
    ├── staff/StaffList.vue
    ├── invoice/InvoiceList.vue
    ├── setting/Setting.vue
    └── NotFound.vue
```

## 🚀 Khởi chạy dự án

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Cài đặt

```bash
# Clone repository
git clone <repo-url>
cd barbershop-admin

# Cài đặt dependencies
npm install

# Copy file env
cp .env.example .env

# Chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

### Tài khoản demo
- **Username:** `admin`
- **Password:** `admin123`

## 📦 Build production

```bash
npm run build
npm run preview  # preview bản build
```

## 🔌 Kết nối Backend (NodeJS)

Khi backend sẵn sàng:

1. Sửa `.env`:
```env
VITE_API_BASE_URL=http://your-api-server/api
VITE_USE_MOCK_DATA=false
```

2. Tất cả API functions trong `src/api/` đã có sẵn cấu trúc HTTP request thực với Axios.

## ✨ Tính năng

- 🔐 **Đăng nhập** - JWT authentication
- 📊 **Dashboard** - Tổng quan, biểu đồ doanh thu 7 ngày, lịch hẹn hôm nay
- 📅 **Lịch hẹn** - CRUD đầy đủ, filter đa chiều, quản lý trạng thái
- 👥 **Khách hàng** - CRUD + lịch sử dịch vụ + thống kê chi tiêu
- ✂️ **Dịch vụ** - Card grid view, quản lý giá/thời gian/danh mục
- 👨‍💼 **Nhân viên** - Card view, đánh giá, lịch làm việc
- 💰 **Hóa đơn** - Tạo hóa đơn, xem chi tiết, thống kê doanh thu
- ⚙️ **Cài đặt** - Thông tin quán, giờ hoạt động

## 📝 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```
