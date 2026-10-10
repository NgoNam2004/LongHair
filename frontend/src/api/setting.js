/**
 * Settings API
 */
import { delay } from './helpers'
import { mockSettings } from '@/utils/mockData'
import { deepClone } from '@/utils/format'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

let _settings = deepClone(mockSettings)

export const settingApi = {
  async get() {
    if (USE_MOCK) {
      await delay(300)
      return { ..._settings }
    }
    return http.get('/settings')
  },

  async update(payload) {
    if (USE_MOCK) {
      await delay(500)
      _settings = { ..._settings, ...payload }
      return { ..._settings }
    }
    return http.put('/settings', payload)
  },
}
