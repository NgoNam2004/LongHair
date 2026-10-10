/**
 * Invoice API
 * - VITE_USE_MOCK_INVOICE=true  : dùng dữ liệu giả
 * - VITE_USE_MOCK_INVOICE=false : gọi backend thật (có chuyển đổi dạng dữ liệu BE <-> FE)
 */
import { delay } from './helpers'
import { mockInvoices } from '@/utils/mockData'
import { deepClone } from '@/utils/format'
import http from './http'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_INVOICE === 'true'

let _invoices = deepClone(mockInvoices)

// ─── Chuyển đổi trạng thái: FE (unpaid) <-> BE (pending) ─────────────────
const STATUS_FROM_API = { pending: 'unpaid', paid: 'paid', cancelled: 'cancelled' }
const STATUS_TO_API = { unpaid: 'pending', paid: 'paid', cancelled: 'cancelled' }

/** Hóa đơn từ BE -> dạng FE đang dùng trong giao diện */
function fromApi(inv) {
  return {
    id: inv._id,
    invoiceCode: inv.invoiceCode,
    customerName: inv.customerName,
    staffName: inv.staffName,
    services: (inv.services || []).map((s) => ({
      name: s.name,
      price: s.price,
      quantity: s.quantity,
    })),
    subtotal: inv.totalAmount,
    discount: inv.discount,
    total: inv.finalAmount,
    paymentMethod: inv.paymentMethod,
    status: STATUS_FROM_API[inv.paymentStatus] || inv.paymentStatus,
    paidAt: inv.paidAt,
    createdAt: inv.createdAt,
    note: inv.note,
  }
}

export const invoiceApi = {
  /**
   * Danh sách hóa đơn (phân trang phía server)
   * @param {{ search?: string, status?: string, page?: number, pageSize?: number }} params
   * @returns {{ data: object[], total: number }}
   */
  async getAll(params = {}) {
    if (USE_MOCK) {
      await delay()
      let list = [..._invoices]
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter((i) => i.customerName.toLowerCase().includes(q))
      }
      if (params.status) list = list.filter((i) => i.status === params.status)
      const total = list.length
      const page = params.page || 1
      const size = params.pageSize || 10
      return { data: list.slice((page - 1) * size, page * size), total }
    }

    const res = await http.get('/invoices', {
      params: {
        search: params.search,
        paymentStatus: STATUS_TO_API[params.status],
        page: params.page,
        limit: params.pageSize,
      },
    })
    return {
      data: res.data.map(fromApi),
      total: res.pagination?.total ?? res.data.length,
    }
  },

  async getById(id) {
    if (USE_MOCK) {
      await delay(300)
      const item = _invoices.find((i) => i.id === Number(id))
      if (!item) throw new Error('Không tìm thấy hóa đơn')
      return item
    }
    const res = await http.get(`/invoices/${id}`)
    return fromApi(res.data)
  },

  /**
   * Tạo hóa đơn
   * @param {{ customerName, staffName, services: {name, price, quantity?}[], discount, paymentMethod, status }} payload
   */
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

    // Chỉ gửi dữ liệu gốc, tổng tiền do server tự tính
    const res = await http.post('/invoices', {
      customerName: payload.customerName,
      staffName: payload.staffName,
      services: payload.services.map((s) => ({
        name: s.name,
        price: s.price,
        quantity: s.quantity || 1,
      })),
      discount: payload.discount || 0,
      paymentMethod: payload.paymentMethod,
      paymentStatus: STATUS_TO_API[payload.status] || 'pending',
    })
    return fromApi(res.data)
  },

  /** Thống kê doanh thu (BE: chỉ admin) */
  async getStats() {
    if (USE_MOCK) {
      await delay(400)
      const paid = _invoices.filter((i) => i.status === 'paid')
      return {
        totalRevenue: paid.reduce((sum, i) => sum + i.total, 0),
        totalInvoices: _invoices.length,
        paidCount: paid.length,
        unpaidCount: _invoices.filter((i) => i.status === 'unpaid').length,
      }
    }
    const res = await http.get('/invoices/statistics/revenue')
    return { ...res.data, unpaidCount: res.data.pendingCount }
  },
}