/**
 * Auth API
 * Mock: kiểm tra với mockUsers (khi VITE_USE_MOCK_AUTH=true)
 * Real: POST /auth/login, POST /auth/register, GET /auth/me
 */
import { delay } from './helpers'
import { mockUsers } from '@/utils/mockData'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

export const authApi = {
  async login(credentials) {
    if (USE_MOCK) {
      await delay(600)
      const user = mockUsers.find(
        (u) => u.username === credentials.username && u.password === credentials.password,
      )
      if (!user) {
        throw { response: { data: { message: 'Tên đăng nhập hoặc mật khẩu không đúng.' } } }
      }
      const { password: _, ...safeUser } = user
      const token = 'mock_token_' + Date.now()
      return { token, user: safeUser }
    }
    const res = await http.post('/auth/login', credentials)
    return res.data // { token, user }
  },

  async register(payload) {
    if (USE_MOCK) {
      await delay(600)
      throw { response: { data: { message: 'Chế độ mock không hỗ trợ đăng ký.' } } }
    }
    const res = await http.post('/auth/register', payload)
    return res.data // { token, user }
  },

  async logout() {
    if (USE_MOCK) await delay(200)
    return { success: true } // JWT: chỉ cần xóa token ở client
  },

  async getMe() {
    if (USE_MOCK) {
      await delay(300)
      const userData = localStorage.getItem('auth_user')
      if (!userData) throw new Error('Not authenticated')
      return JSON.parse(userData)
    }
    const res = await http.get('/auth/me')
    return res.data
  },

  async changePassword(payload) {
    if (USE_MOCK) {
      await delay(500)
      return { success: true }
    }
    return http.post('/auth/change-password', payload)
  },
}