/**
 * Service API - Mock CRUD + real HTTP structure
 */
import { delay } from './helpers'
import { mockServices } from '@/utils/mockData'
import { deepClone } from '@/utils/format'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

let _services = deepClone(mockServices)

export const serviceApi = {
  async getAll(params = {}) {
    if (USE_MOCK) {
      await delay()
      let list = [..._services]
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter(s => s.name.toLowerCase().includes(q))
      }
      if (params.category) list = list.filter(s => s.category === params.category)
      if (params.active !== undefined) list = list.filter(s => s.active === (params.active === 'true' || params.active === true))
      return { data: list, total: list.length }
    }
    return http.get('/services', { params })
  },

  async getById(id) {
    if (USE_MOCK) {
      await delay(300)
      const item = _services.find(s => s.id === Number(id))
      if (!item) throw new Error('Không tìm thấy dịch vụ')
      return item
    }
    return http.get(`/services/${id}`)
  },

  async create(payload) {
    if (USE_MOCK) {
      await delay(500)
      const newItem = { ...payload, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }
      _services.unshift(newItem)
      return newItem
    }
    return http.post('/services', payload)
  },

  async update(id, payload) {
    if (USE_MOCK) {
      await delay(500)
      const idx = _services.findIndex(s => s.id === Number(id))
      if (idx === -1) throw new Error('Không tìm thấy dịch vụ')
      _services[idx] = { ..._services[idx], ...payload }
      return _services[idx]
    }
    return http.put(`/services/${id}`, payload)
  },

  async delete(id) {
    if (USE_MOCK) {
      await delay(400)
      _services = _services.filter(s => s.id !== Number(id))
      return { success: true }
    }
    return http.delete(`/services/${id}`)
  },

  async toggleActive(id) {
    if (USE_MOCK) {
      await delay(300)
      const idx = _services.findIndex(s => s.id === Number(id))
      if (idx === -1) throw new Error('Không tìm thấy dịch vụ')
      _services[idx].active = !_services[idx].active
      return _services[idx]
    }
    return http.patch(`/services/${id}/toggle`)
  },
}
