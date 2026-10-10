/**
 * Customer Store
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerApi } from '@/api'
import { message } from 'ant-design-vue'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])
  const current = ref(null)
  const history = ref([])
  const loading = ref(false)
  const total = ref(0)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await customerApi.getAll(params)
      customers.value = res.data
      total.value = res.total
    } finally { loading.value = false }
  }

  async function fetchById(id) {
    loading.value = true
    try {
      current.value = await customerApi.getById(id)
    } finally { loading.value = false }
  }

  async function fetchHistory(id) {
    history.value = await customerApi.getHistory(id)
  }

  async function create(payload) {
    loading.value = true
    try {
      const res = await customerApi.create(payload)
      customers.value.unshift(res)
      message.success('Thêm khách hàng thành công!')
      return res
    } finally { loading.value = false }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const res = await customerApi.update(id, payload)
      const idx = customers.value.findIndex(c => c.id === Number(id))
      if (idx !== -1) customers.value[idx] = res
      message.success('Cập nhật khách hàng thành công!')
      return res
    } finally { loading.value = false }
  }

  async function remove(id) {
    loading.value = true
    try {
      await customerApi.delete(id)
      customers.value = customers.value.filter(c => c.id !== Number(id))
      message.success('Đã xóa khách hàng')
    } finally { loading.value = false }
  }

  return { customers, current, history, loading, total, fetchAll, fetchById, fetchHistory, create, update, remove }
})
