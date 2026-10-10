/**
 * Appointment Store
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { appointmentApi } from '@/api'
import { message } from 'ant-design-vue'

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref([])
  const current = ref(null)
  const loading = ref(false)
  const total = ref(0)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await appointmentApi.getAll(params)
      appointments.value = res.data
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    try {
      current.value = await appointmentApi.getById(id)
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    loading.value = true
    try {
      const res = await appointmentApi.create(payload)
      appointments.value.unshift(res)
      message.success('Tạo lịch hẹn thành công!')
      return res
    } finally {
      loading.value = false
    }
  }

  async function update(id, payload) {
    loading.value = true
    try {
      const res = await appointmentApi.update(id, payload)
      const idx = appointments.value.findIndex(a => a.id === Number(id))
      if (idx !== -1) appointments.value[idx] = res
      message.success('Cập nhật lịch hẹn thành công!')
      return res
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await appointmentApi.updateStatus(id, status)
      const idx = appointments.value.findIndex(a => a.id === Number(id))
      if (idx !== -1) appointments.value[idx] = res
      const statusLabels = { confirmed: 'Đã xác nhận', inprogress: 'Đang thực hiện', completed: 'Hoàn thành', cancelled: 'Đã hủy' }
      message.success(`Cập nhật trạng thái: ${statusLabels[status] || status}`)
      return res
    } catch (err) {
      message.error('Cập nhật trạng thái thất bại')
    }
  }

  async function remove(id) {
    loading.value = true
    try {
      await appointmentApi.delete(id)
      appointments.value = appointments.value.filter(a => a.id !== Number(id))
      message.success('Đã xóa lịch hẹn')
    } finally {
      loading.value = false
    }
  }

  return { appointments, current, loading, total, fetchAll, fetchById, create, update, updateStatus, remove }
})
