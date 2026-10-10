/**
 * Axios HTTP client with interceptors
 */
import axios from 'axios'
import { message } from 'ant-design-vue'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response Interceptor ────────────────────────────────────────────────
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const msg = error.response?.data?.message || error.message

    if (status === 401) {
      // Sai mật khẩu lúc đăng nhập: không redirect, để store hiện thông báo
      if (error.config?.url?.includes('/auth/login')) return Promise.reject(error)

      // Token hết hạn → xóa và về trang login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 403) {
      message.error('Bạn không có quyền thực hiện thao tác này.')
    } else if (status === 404) {
      message.error('Không tìm thấy dữ liệu yêu cầu.')
    } else if (status >= 500) {
      message.error('Lỗi máy chủ. Vui lòng thử lại sau.')
    } else {
      message.error(msg || 'Đã xảy ra lỗi. Vui lòng thử lại.')
    }
    error.handled = true // đã báo lỗi rồi, store không báo lại nữa

    return Promise.reject(error)
  },
)

export default http