/**
 * Staff API - Mock CRUD + real HTTP structure
 */
import { delay } from './helpers'
import { mockStaff } from '@/utils/mockData'
import { deepClone } from '@/utils/format'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

let _staff = deepClone(mockStaff)

export const staffApi = {
  async getAll(params = {}) {
    if (USE_MOCK) {
      await delay()
      let list = [..._staff]
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.phone.includes(q)
        )
      }
      if (params.active !== undefined) list = list.filter(s => s.active === (params.active === 'true' || params.active === true))
      return { data: list, total: list.length }
    }
    return http.get('/staff', { params })
  },

  async getById(id) {
    if (USE_MOCK) {
      await delay(300)
      const item = _staff.find(s => s.id === Number(id))
      if (!item) throw new Error('Không tìm thấy thợ')
      return item
    }
    return http.get(`/staff/${id}`)
  },

  async create(payload) {
    if (USE_MOCK) {
      await delay(500)
      const newItem = { ...payload, id: Date.now(), totalServices: 0, rating: 5.0, joinDate: new Date().toISOString().slice(0, 10) }
      _staff.unshift(newItem)
      return newItem
    }
    return http.post('/staff', payload)
  },

  async update(id, payload) {
    if (USE_MOCK) {
      await delay(500)
      const idx = _staff.findIndex(s => s.id === Number(id))
      if (idx === -1) throw new Error('Không tìm thấy thợ')
      _staff[idx] = { ..._staff[idx], ...payload }
      return _staff[idx]
    }
    return http.put(`/staff/${id}`, payload)
  },

  async delete(id) {
    if (USE_MOCK) {
      await delay(400)
      _staff = _staff.filter(s => s.id !== Number(id))
      return { success: true }
    }
    return http.delete(`/staff/${id}`)
  },

  async getSchedule(id, params = {}) {
    if (USE_MOCK) {
      await delay(300)
      return { workDays: _staff.find(s => s.id === Number(id))?.workDays || [] }
    }
    return http.get(`/staff/${id}/schedule`, { params })
  },
}
