/**
 * Dashboard API
 */
import { delay } from './helpers'
import { getMockDashboardStats } from '@/utils/mockData'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const dashboardApi = {
  async getStats() {
    if (USE_MOCK) {
      await delay(500)
      return getMockDashboardStats()
    }
    return http.get('/dashboard/stats')
  },
}
