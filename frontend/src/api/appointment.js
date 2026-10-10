/**
 * Appointment API
 * Mock: in-memory CRUD on mockAppointments array
 * Real: REST /appointments
 */
import { delay } from './helpers'
import { mockAppointments } from '@/utils/mockData'
import { deepClone, generateId } from '@/utils/format'
import http from './http'
import dayjs from 'dayjs'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// Local mutable copy for mock CRUD
let _appointments = deepClone(mockAppointments)

export const appointmentApi = {
  async getAll(params = {}) {
    if (USE_MOCK) {
      await delay()
      let list = [..._appointments]
      if (params.date)   list = list.filter(a => a.date === params.date)
      if (params.staffId) list = list.filter(a => a.staffId === Number(params.staffId))
      if (params.status)  list = list.filter(a => a.status === params.status)
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter(a =>
          a.customerName.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q)
        )
      }
      return { data: list, total: list.length }
    }
    return http.get('/appointments', { params })
  },

  async getById(id) {
    if (USE_MOCK) {
      await delay(300)
      const item = _appointments.find(a => a.id === Number(id))
      if (!item) throw new Error('Không tìm thấy lịch hẹn')
      return item
    }
    return http.get(`/appointments/${id}`)
  },

  async create(payload) {
    if (USE_MOCK) {
      await delay(500)
      const newItem = {
        ...payload,
        id: Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      _appointments.unshift(newItem)
      return newItem
    }
    return http.post('/appointments', payload)
  },

  async update(id, payload) {
    if (USE_MOCK) {
      await delay(500)
      const idx = _appointments.findIndex(a => a.id === Number(id))
      if (idx === -1) throw new Error('Không tìm thấy lịch hẹn')
      _appointments[idx] = { ..._appointments[idx], ...payload }
      return _appointments[idx]
    }
    return http.put(`/appointments/${id}`, payload)
  },

  async updateStatus(id, status) {
    if (USE_MOCK) {
      await delay(300)
      const idx = _appointments.findIndex(a => a.id === Number(id))
      if (idx === -1) throw new Error('Không tìm thấy lịch hẹn')
      _appointments[idx].status = status
      return _appointments[idx]
    }
    return http.patch(`/appointments/${id}/status`, { status })
  },

  async delete(id) {
    if (USE_MOCK) {
      await delay(400)
      _appointments = _appointments.filter(a => a.id !== Number(id))
      return { success: true }
    }
    return http.delete(`/appointments/${id}`)
  },

  async getTodayAppointments() {
    if (USE_MOCK) {
      await delay(300)
      const today = dayjs().format('YYYY-MM-DD')
      return _appointments.filter(a => a.date === today)
    }
    return http.get('/appointments/today')
  },
}
