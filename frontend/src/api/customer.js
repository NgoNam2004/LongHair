/**
 * Customer API - Mock CRUD + real HTTP structure
 */
import { delay } from './helpers'
import { mockCustomers, mockAppointments } from '@/utils/mockData'
import { deepClone } from '@/utils/format'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

let _customers = deepClone(mockCustomers)

export const customerApi = {
  async getAll(params = {}) {
    if (USE_MOCK) {
      await delay()
      let list = [..._customers]
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email || '').toLowerCase().includes(q)
        )
      }
      if (params.gender) list = list.filter(c => c.gender === params.gender)
      return { data: list, total: list.length }
    }
    return http.get('/customers', { params })
  },

  async getById(id) {
    if (USE_MOCK) {
      await delay(300)
      const item = _customers.find(c => c.id === Number(id))
      if (!item) throw new Error('Không tìm thấy khách hàng')
      return item
    }
    return http.get(`/customers/${id}`)
  },

  async create(payload) {
    if (USE_MOCK) {
      await delay(500)
      const newItem = { ...payload, id: Date.now(), totalVisits: 0, totalSpent: 0, lastVisit: null, createdAt: new Date().toISOString().slice(0, 10) }
      _customers.unshift(newItem)
      return newItem
    }
    return http.post('/customers', payload)
  },

  async update(id, payload) {
    if (USE_MOCK) {
      await delay(500)
      const idx = _customers.findIndex(c => c.id === Number(id))
      if (idx === -1) throw new Error('Không tìm thấy khách hàng')
      _customers[idx] = { ..._customers[idx], ...payload }
      return _customers[idx]
    }
    return http.put(`/customers/${id}`, payload)
  },

  async delete(id) {
    if (USE_MOCK) {
      await delay(400)
      _customers = _customers.filter(c => c.id !== Number(id))
      return { success: true }
    }
    return http.delete(`/customers/${id}`)
  },

  async getHistory(id) {
    if (USE_MOCK) {
      await delay(400)
      return mockAppointments.filter(a => a.customerId === Number(id))
    }
    return http.get(`/customers/${id}/history`)
  },
}
