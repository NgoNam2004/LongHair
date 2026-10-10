/**
 * Auth Store - manages authentication state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { message } from 'ant-design-vue'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ────────────────────────────────────────────────────────────
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  // ─── Getters ──────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userAvatar = computed(() => user.value?.avatar || null)

  // ─── Helpers ──────────────────────────────────────────────────────────
  function saveSession(res) {
    token.value = res.token
    user.value = res.user
    localStorage.setItem('auth_token', res.token)
    localStorage.setItem('auth_user', JSON.stringify(res.user))
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  /** Khôi phục đăng nhập từ localStorage khi mở lại trang */
  function initAuth() {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  async function login(credentials) {
    loading.value = true
    try {
      const res = await authApi.login(credentials)
      saveSession(res)
      message.success(`Chào mừng trở lại, ${res.user.name}! 👋`)
      return true
    } catch (err) {
      if (!err?.handled) message.error(err?.response?.data?.message || 'Đăng nhập thất bại')
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    try {
      const res = await authApi.register(payload)
      saveSession(res)
      message.success('Đăng ký thành công!')
      return true
    } catch (err) {
      if (!err?.handled) message.error(err?.response?.data?.message || 'Đăng ký thất bại')
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (_) { /* silent */ }
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    userName,
    userAvatar,
    initAuth,
    login,
    register,
    logout,
  }
})