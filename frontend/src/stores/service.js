/**
 * Service Store
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { serviceApi } from '@/api'
import { message } from 'ant-design-vue'

export const useServiceStore = defineStore('service', () => {
  const services = ref([])
  const loading = ref(false)
  const total = ref(0)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await serviceApi.getAll(params)
      services.value = res.data
      total.value = res.total
    } finally { loading.value = false }
  }

  async function create(payload) {
    loading.value = true
    try {
      const res = await serviceApi.create(payload)
      services.value.unshift(res)
      message.success('Thêm dịch vụ thành công!')
      return res
    } finally { loading.value = false }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const res = await serviceApi.update(id, payload)
      const idx = services.value.findIndex(s => s.id === Number(id))
      if (idx !== -1) services.value[idx] = res
      message.success('Cập nhật dịch vụ thành công!')
      return res
    } finally { loading.value = false }
  }

  async function remove(id) {
    loading.value = true
    try {
      await serviceApi.delete(id)
      services.value = services.value.filter(s => s.id !== Number(id))
      message.success('Đã xóa dịch vụ')
    } finally { loading.value = false }
  }

  async function toggle(id) {
    try {
      const res = await serviceApi.toggleActive(id)
      const idx = services.value.findIndex(s => s.id === Number(id))
      if (idx !== -1) services.value[idx] = res
    } catch (err) {
      message.error('Không thể thay đổi trạng thái')
    }
  }

  return { services, loading, total, fetchAll, create, update, remove, toggle }
})
