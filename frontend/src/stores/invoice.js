/**
 * Invoice Store
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoiceApi } from '@/api'
import { message } from 'ant-design-vue'

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref([])
  const loading = ref(false)
  const total = ref(0)
  const stats = ref(null)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await invoiceApi.getAll(params)
      invoices.value = res.data
      total.value = res.total
    } finally { loading.value = false }
  }

  async function fetchStats() {
    stats.value = await invoiceApi.getStats()
  }

  async function create(payload) {
    loading.value = true
    try {
      const res = await invoiceApi.create(payload)
      invoices.value.unshift(res)
      message.success('Tạo hóa đơn thành công!')
      return res
    } finally { loading.value = false }
  }

  return { invoices, loading, total, stats, fetchAll, fetchStats, create }
})
