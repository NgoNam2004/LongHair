/**
 * useAuth composable - shorthand access to auth store actions
 */
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const userName = computed(() => authStore.userName)

  async function logout() {
    await authStore.logout()
    router.push('/login')
  }

  return { isAuthenticated, user, userName, logout, authStore }
}
