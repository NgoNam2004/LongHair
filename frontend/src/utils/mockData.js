import dayjs from 'dayjs'

/**
 * Centralized mock data for all modules
 * Replace API calls with real HTTP when backend is ready
 */

// ─── Mock Users ───────────────────────────────────────────────────────────
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Nguyễn Quản Trị',
    role: 'admin',
    avatar: null,
    email: 'admin@barbershop.vn',
    phone: '0901234567',
  },
]

// ─── Mock Services ─────────────────────────────────────────────────────────
export const mockServices = [
  { id: 1, name: 'Cắt tóc cơ bản', price: 80000, duration: 30, description: 'Cắt tóc nam cơ bản, gội đầu', category: 'haircut', active: true, createdAt: '2024-01-01' },
  { id: 2, name: 'Cắt + Uốn', price: 250000, duration: 90, description: 'Cắt và uốn tóc theo yêu cầu', category: 'styling', active: true, createdAt: '2024-01-01' },
  { id: 3, name: 'Nhuộm tóc', price: 350000, duration: 120, description: 'Nhuộm màu toàn bộ', category: 'coloring', active: true, createdAt: '2024-01-01' },
  { id: 4, name: 'Cạo râu + Dưỡng da', price: 120000, duration: 45, description: 'Cạo râu & chăm sóc da mặt', category: 'shaving', active: true, createdAt: '2024-01-01' },
  { id: 5, name: 'Gội đầu + Massage', price: 100000, duration: 40, description: 'Gội đầu dầu dưỡng & massage đầu', category: 'care', active: true, createdAt: '2024-01-05' },
  { id: 6, name: 'Highlight tóc', price: 450000, duration: 150, description: 'Highlight balayage hoặc foilyage', category: 'coloring', active: false, createdAt: '2024-01-10' },
  { id: 7, name: 'Duỗi tóc Keratin', price: 600000, duration: 180, description: 'Duỗi tóc bằng Keratin cao cấp', category: 'styling', active: true, createdAt: '2024-02-01' },
]

// ─── Mock Staff ────────────────────────────────────────────────────────────
export const mockStaff = [
  { id: 1, name: 'Trần Văn Minh', phone: '0912345678', email: 'minh@barbershop.vn', speciality: 'Cắt tóc nam, Nhuộm', rating: 4.8, totalServices: 523, salary: 8000000, active: true, workDays: [1,2,3,4,5], joinDate: '2022-03-01', avatar: null },
  { id: 2, name: 'Nguyễn Thị Lan', phone: '0923456789', email: 'lan@barbershop.vn', speciality: 'Tạo kiểu, Uốn, Duỗi', rating: 4.9, totalServices: 641, salary: 9000000, active: true, workDays: [1,2,4,5,6], joinDate: '2021-06-15', avatar: null },
  { id: 3, name: 'Lê Hoàng Nam', phone: '0934567890', email: 'nam@barbershop.vn', speciality: 'Cắt tóc, Cạo râu', rating: 4.7, totalServices: 387, salary: 7500000, active: true, workDays: [2,3,5,6,0], joinDate: '2023-01-10', avatar: null },
  { id: 4, name: 'Phạm Thu Hà', phone: '0945678901', email: 'ha@barbershop.vn', speciality: 'Nhuộm, Highlight', rating: 4.6, totalServices: 298, salary: 8500000, active: false, workDays: [1,3,4,6], joinDate: '2023-07-20', avatar: null },
]

// ─── Mock Customers ────────────────────────────────────────────────────────
export const mockCustomers = [
  { id: 1, name: 'Nguyễn Văn An', phone: '0901111111', email: 'an@gmail.com', gender: 'male', birthDate: '1990-05-15', address: '12 Lê Lợi, Q1, TP.HCM', totalVisits: 24, totalSpent: 1920000, lastVisit: '2024-12-28', notes: 'Thích cắt kiểu undercut', createdAt: '2023-01-15' },
  { id: 2, name: 'Trần Bình Dương', phone: '0902222222', email: 'duong@gmail.com', gender: 'male', birthDate: '1995-08-20', address: '45 Nguyễn Trãi, Q5, TP.HCM', totalVisits: 18, totalSpent: 2700000, lastVisit: '2024-12-30', notes: '', createdAt: '2023-03-20' },
  { id: 3, name: 'Lê Thị Cẩm Ly', phone: '0903333333', email: 'ly@gmail.com', gender: 'female', birthDate: '1998-12-01', address: '78 Cách Mạng Tháng 8, Q3', totalVisits: 31, totalSpent: 8680000, lastVisit: '2024-12-29', notes: 'Khách VIP, thích màu nâu caramel', createdAt: '2022-11-10' },
  { id: 4, name: 'Phạm Quốc Hùng', phone: '0904444444', email: 'hung@gmail.com', gender: 'male', birthDate: '1988-03-10', address: '23 Đinh Tiên Hoàng, Q1', totalVisits: 8, totalSpent: 640000, lastVisit: '2024-12-15', notes: '', createdAt: '2024-06-01' },
  { id: 5, name: 'Hoàng Minh Tuấn', phone: '0905555555', email: 'tuan@gmail.com', gender: 'male', birthDate: '1993-07-25', address: '56 Pasteur, Q1', totalVisits: 42, totalSpent: 3360000, lastVisit: '2025-01-02', notes: 'Đến đúng giờ, cắt undercut fade', createdAt: '2022-05-12' },
  { id: 6, name: 'Vũ Thị Mai', phone: '0906666666', email: 'mai@gmail.com', gender: 'female', birthDate: '2000-02-14', address: '89 Võ Văn Tần, Q3', totalVisits: 15, totalSpent: 5250000, lastVisit: '2024-12-27', notes: '', createdAt: '2023-08-05' },
]

// ─── Mock Appointments ─────────────────────────────────────────────────────
export const mockAppointments = [
  { id: 1,  customerId: 1, customerName: 'Nguyễn Văn An',    staffId: 1, staffName: 'Trần Văn Minh',    serviceId: 1, serviceName: 'Cắt tóc cơ bản', servicePrice: 80000,  date: dayjs().format('YYYY-MM-DD'), time: '09:00', duration: 30,  status: 'completed',  notes: '', createdAt: dayjs().subtract(1,'day').toISOString() },
  { id: 2,  customerId: 3, customerName: 'Lê Thị Cẩm Ly',   staffId: 2, staffName: 'Nguyễn Thị Lan',   serviceId: 3, serviceName: 'Nhuộm tóc',      servicePrice: 350000, date: dayjs().format('YYYY-MM-DD'), time: '10:00', duration: 120, status: 'inprogress', notes: 'Nhuộm màu caramel', createdAt: dayjs().subtract(2,'hour').toISOString() },
  { id: 3,  customerId: 2, customerName: 'Trần Bình Dương',  staffId: 3, staffName: 'Lê Hoàng Nam',     serviceId: 4, serviceName: 'Cạo râu + Dưỡng da', servicePrice: 120000, date: dayjs().format('YYYY-MM-DD'), time: '14:00', duration: 45,  status: 'confirmed',  notes: '', createdAt: dayjs().subtract(3,'hour').toISOString() },
  { id: 4,  customerId: 5, customerName: 'Hoàng Minh Tuấn', staffId: 1, staffName: 'Trần Văn Minh',    serviceId: 1, serviceName: 'Cắt tóc cơ bản', servicePrice: 80000,  date: dayjs().format('YYYY-MM-DD'), time: '15:30', duration: 30,  status: 'pending',    notes: '', createdAt: dayjs().subtract(30,'minute').toISOString() },
  { id: 5,  customerId: 6, customerName: 'Vũ Thị Mai',       staffId: 2, staffName: 'Nguyễn Thị Lan',   serviceId: 7, serviceName: 'Duỗi tóc Keratin', servicePrice: 600000, date: dayjs().add(1,'day').format('YYYY-MM-DD'), time: '09:30', duration: 180, status: 'confirmed', notes: '', createdAt: dayjs().subtract(1,'day').toISOString() },
  { id: 6,  customerId: 4, customerName: 'Phạm Quốc Hùng',  staffId: 3, staffName: 'Lê Hoàng Nam',     serviceId: 1, serviceName: 'Cắt tóc cơ bản', servicePrice: 80000,  date: dayjs().subtract(1,'day').format('YYYY-MM-DD'), time: '11:00', duration: 30, status: 'completed', notes: '', createdAt: dayjs().subtract(2,'day').toISOString() },
  { id: 7,  customerId: 1, customerName: 'Nguyễn Văn An',    staffId: 2, staffName: 'Nguyễn Thị Lan',   serviceId: 5, serviceName: 'Gội đầu + Massage', servicePrice: 100000, date: dayjs().subtract(2,'day').format('YYYY-MM-DD'), time: '16:00', duration: 40, status: 'cancelled', notes: 'Khách hủy vì bận', createdAt: dayjs().subtract(3,'day').toISOString() },
  { id: 8,  customerId: 3, customerName: 'Lê Thị Cẩm Ly',   staffId: 2, staffName: 'Nguyễn Thị Lan',   serviceId: 6, serviceName: 'Highlight tóc',   servicePrice: 450000, date: dayjs().subtract(3,'day').format('YYYY-MM-DD'), time: '10:00', duration: 150, status: 'completed', notes: '', createdAt: dayjs().subtract(4,'day').toISOString() },
]

// ─── Mock Invoices ──────────────────────────────────────────────────────────
export const mockInvoices = [
  { id: 1, appointmentId: 1, customerId: 1, customerName: 'Nguyễn Văn An', staffName: 'Trần Văn Minh', services: [{ name: 'Cắt tóc cơ bản', price: 80000 }], subtotal: 80000, discount: 0, total: 80000, paymentMethod: 'cash', status: 'paid', paidAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'), createdAt: dayjs().toISOString() },
  { id: 2, appointmentId: 6, customerId: 4, customerName: 'Phạm Quốc Hùng', staffName: 'Lê Hoàng Nam', services: [{ name: 'Cắt tóc cơ bản', price: 80000 }], subtotal: 80000, discount: 0, total: 80000, paymentMethod: 'transfer', status: 'paid', paidAt: dayjs().subtract(1,'day').format('YYYY-MM-DDTHH:mm:ss'), createdAt: dayjs().subtract(1,'day').toISOString() },
  { id: 3, appointmentId: 8, customerId: 3, customerName: 'Lê Thị Cẩm Ly', staffName: 'Nguyễn Thị Lan', services: [{ name: 'Highlight tóc', price: 450000 }], subtotal: 450000, discount: 50000, total: 400000, paymentMethod: 'cash', status: 'paid', paidAt: dayjs().subtract(3,'day').format('YYYY-MM-DDTHH:mm:ss'), createdAt: dayjs().subtract(3,'day').toISOString() },
]

// ─── Mock Dashboard Stats ───────────────────────────────────────────────────
export function getMockDashboardStats() {
  return {
    today: {
      appointments: 8,
      completedAppointments: 3,
      revenue: 560000,
      newCustomers: 2,
    },
    week: {
      appointments: 42,
      revenue: 3850000,
    },
    month: {
      appointments: 186,
      revenue: 16200000,
    },
    revenueChart: [
      { date: dayjs().subtract(6,'day').format('DD/MM'), revenue: 1200000 },
      { date: dayjs().subtract(5,'day').format('DD/MM'), revenue: 1800000 },
      { date: dayjs().subtract(4,'day').format('DD/MM'), revenue: 950000  },
      { date: dayjs().subtract(3,'day').format('DD/MM'), revenue: 2100000 },
      { date: dayjs().subtract(2,'day').format('DD/MM'), revenue: 1650000 },
      { date: dayjs().subtract(1,'day').format('DD/MM'), revenue: 2300000 },
      { date: dayjs().format('DD/MM'),                   revenue: 560000  },
    ],
    topServices: [
      { name: 'Cắt tóc cơ bản', count: 68, revenue: 5440000 },
      { name: 'Nhuộm tóc',       count: 24, revenue: 8400000 },
      { name: 'Cạo râu',         count: 31, revenue: 3720000 },
      { name: 'Highlight',        count: 12, revenue: 5400000 },
      { name: 'Duỗi Keratin',    count: 8,  revenue: 4800000 },
    ],
  }
}

// ─── Mock Settings ──────────────────────────────────────────────────────────
export const mockSettings = {
  shopName: 'The Gentleman Barbershop',
  address: '123 Nguyễn Huệ, Phường Bến Nghé, Q1, TP.HCM',
  phone: '028 1234 5678',
  email: 'contact@gentleman.vn',
  openTime: '08:00',
  closeTime: '20:00',
  workDays: [1, 2, 3, 4, 5, 6],
  slotDuration: 30,
  currency: 'VND',
  logo: null,
}
