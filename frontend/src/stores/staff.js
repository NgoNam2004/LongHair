/**
 * Staff Store
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { staffApi } from '@/api'
import { message } from 'ant-design-vue'

export const useStaffStore = defineStore('staff', () => {
  const staff = ref([])
  const current = ref(null)
  const loading = ref(false)
  const total = ref(0)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await staffApi.getAll(params)
      staff.value = res.data
      total.value = res.total
    } finally { loading.value = false }
  }

  async function fetchById(id) {
    loading.value = true
    try {
      current.value = await staffApi.getById(id)
    } finally { loading.value = false }
  }

  async function create(payload) {
    loading.value = true
    try {
      const res = await staffApi.create(payload)
      staff.value.unshift(res)
      message.success('Thêm thợ thành công!')
      return res
    } finally { loading.value = false }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const res = await staffApi.update(id, payload)
      const idx = staff.value.findIndex(s => s.id === Number(id))
      if (idx !== -1) staff.value[idx] = res
      message.success('Cập nhật thợ thành công!')
      return res
    } finally { loading.value = false }
  }

  async function remove(id) {
    loading.value = true
    try {
      await staffApi.delete(id)
      staff.value = staff.value.filter(s => s.id !== Number(id))
      message.success('Đã xóa thợ')
    } finally { loading.value = false }
  }

  return { staff, current, loading, total, fetchAll, fetchById, create, update, remove }
})
