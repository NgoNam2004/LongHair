/**
 * Route definitions for the Barbershop Admin
 */

/** Lazy-loaded views for better performance */
const Login          = () => import('@/views/auth/Login.vue')
const AdminLayout    = () => import('@/layouts/AdminLayout.vue')
const Dashboard      = () => import('@/views/dashboard/Dashboard.vue')
const AppointmentList = () => import('@/views/appointment/AppointmentList.vue')
const AppointmentForm = () => import('@/views/appointment/AppointmentForm.vue')
const CustomerList   = () => import('@/views/customer/CustomerList.vue')
const CustomerDetail = () => import('@/views/customer/CustomerDetail.vue')
const ServiceList    = () => import('@/views/service/ServiceList.vue')
const StaffList      = () => import('@/views/staff/StaffList.vue')
const InvoiceList    = () => import('@/views/invoice/InvoiceList.vue')
const Setting        = () => import('@/views/setting/Setting.vue')
const NotFound       = () => import('@/views/NotFound.vue')

export const routes = [
  // ─── Public routes ──────────────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, title: 'Đăng nhập' },
  },

  // ─── Protected routes (admin layout) ────────────────────────────────
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Tổng quan', icon: 'DashboardOutlined' },
      },
      {
        path: 'appointments',
        name: 'AppointmentList',
        component: AppointmentList,
        meta: { title: 'Lịch hẹn', icon: 'CalendarOutlined' },
      },
      {
        path: 'appointments/create',
        name: 'AppointmentCreate',
        component: AppointmentForm,
        meta: { title: 'Tạo lịch hẹn', parent: 'AppointmentList' },
      },
      {
        path: 'appointments/:id/edit',
        name: 'AppointmentEdit',
        component: AppointmentForm,
        meta: { title: 'Sửa lịch hẹn', parent: 'AppointmentList' },
      },
      {
        path: 'customers',
        name: 'CustomerList',
        component: CustomerList,
        meta: { title: 'Khách hàng', icon: 'TeamOutlined' },
      },
      {
        path: 'customers/:id',
        name: 'CustomerDetail',
        component: CustomerDetail,
        meta: { title: 'Chi tiết khách hàng', parent: 'CustomerList' },
      },
      {
        path: 'services',
        name: 'ServiceList',
        component: ServiceList,
        meta: { title: 'Dịch vụ', icon: 'ScissorOutlined' },
      },
      {
        path: 'staff',
        name: 'StaffList',
        component: StaffList,
        meta: { title: 'Nhân viên', icon: 'UserOutlined' },
      },
      {
        path: 'invoices',
        name: 'InvoiceList',
        component: InvoiceList,
        meta: { title: 'Hóa đơn', icon: 'FileTextOutlined' },
      },
      {
        path: 'settings',
        name: 'Setting',
        component: Setting,
        meta: { title: 'Cài đặt', icon: 'SettingOutlined' },
      },
    ],
  },

  // ─── Catch-all ────────────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]
