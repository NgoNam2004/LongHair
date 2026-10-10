
import { delay } from './helpers'
import { getMockDashboardStats } from '@/utils/mockData'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DASHBOARD === 'true'

export const dashboardApi = {
  async getStats() {
    if (USE_MOCK) {
      await delay(500)
      return getMockDashboardStats()
    }
    const res = await http.get('/dashboard/stats')
    return res.data // BE bọc trong { success, message, data }
  },
}