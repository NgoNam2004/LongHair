/**
 * Invoice API - Mock CRUD + real HTTP structure
 */
import { delay } from './helpers'
import { mockInvoices } from '@/utils/mockData'
import { deepClone } from '@/utils/format'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

let _invoices = deepClone(mockInvoices)

export const invoiceApi = {
  async getAll(params = {}) {
    if (USE_MOCK) {
      await delay()
      let list = [..._invoices]
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter(i => i.customerName.toLowerCase().includes(q))
      }
      if (params.status) list = list.filter(i => i.status === params.status)
      return { data: list, total: list.length }
    }
    return http.get('/invoices', { params })
  },

  async getById(id) {
    if (USE_MOCK) {
      await delay(300)
      const item = _invoices.find(i => i.id === Number(id))
      if (!item) throw new Error('Không tìm thấy hóa đơn')
      return item
    }
    return http.get(`/invoices/${id}`)
  },

  async create(payload) {
    if (USE_MOCK) {
      await delay(600)
      const newItem = {
        ...payload,
        id: Date.now(),
        status: 'paid',
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      _invoices.unshift(newItem)
      return newItem
    }
    return http.post('/invoices', payload)
  },

  async getStats(params = {}) {
    if (USE_MOCK) {
      await delay(400)
      const totalRevenue = _invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
      return {
        totalRevenue,
        totalInvoices: _invoices.length,
        paidCount: _invoices.filter(i => i.status === 'paid').length,
        unpaidCount: _invoices.filter(i => i.status === 'unpaid').length,
      }
    }
    return http.get('/invoices/stats', { params })
  },
}
