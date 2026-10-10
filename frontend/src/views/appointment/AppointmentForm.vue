<template>
  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? 'Sửa lịch hẹn' : 'Tạo lịch hẹn mới' }}</h1>
        <p class="page-subtitle">{{ isEdit ? `#${route.params.id}` : 'Điền thông tin để đặt lịch' }}</p>
      </div>
      <a-button @click="$router.back()">← Quay lại</a-button>
    </div>

    <a-row :gutter="[20, 20]">
      <a-col :xs="24" :lg="16">
        <a-card title="Thông tin lịch hẹn" :loading="initLoading">
          <a-form
            ref="formRef"
            :model="form"
            :rules="rules"
            layout="vertical"
            @finish="handleSubmit"
          >
            <!-- Customer & Staff -->
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Khách hàng" name="customerId" required>
                  <a-select
                    v-model:value="form.customerId"
                    placeholder="Chọn hoặc tìm khách hàng"
                    show-search
                    :filter-option="filterOption"
                    @change="onCustomerChange"
                  >
                    <a-select-option v-for="c in customers" :key="c.id" :value="c.id">
                      {{ c.name }} · {{ c.phone }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Thợ cắt tóc" name="staffId" required>
                  <a-select v-model:value="form.staffId" placeholder="Chọn thợ">
                    <a-select-option v-for="s in activeStaff" :key="s.id" :value="s.id">
                      {{ s.name }} · ⭐ {{ s.rating }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>

            <!-- Service -->
            <a-form-item label="Dịch vụ" name="serviceId" required>
              <a-select
                v-model:value="form.serviceId"
                placeholder="Chọn dịch vụ"
                @change="onServiceChange"
              >
                <a-select-option v-for="svc in activeServices" :key="svc.id" :value="svc.id">
                  {{ svc.name }} · {{ formatCurrency(svc.price) }} · {{ formatDuration(svc.duration) }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <!-- Date & Time -->
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="Ngày hẹn" name="date" required>
                  <a-date-picker
                    v-model:value="form.date"
                    style="width: 100%"
                    format="DD/MM/YYYY"
                    :disabled-date="disabledDate"
                    placeholder="Chọn ngày"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="Giờ hẹn" name="time" required>
                  <a-time-picker
                    v-model:value="form.time"
                    style="width: 100%"
                    format="HH:mm"
                    :minute-step="30"
                    placeholder="Chọn giờ"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <!-- Notes -->
            <a-form-item label="Ghi chú">
              <a-textarea
                v-model:value="form.notes"
                placeholder="Yêu cầu đặc biệt, kiểu tóc mong muốn..."
                :rows="3"
              />
            </a-form-item>

            <a-divider />

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <a-button @click="$router.back()">Hủy</a-button>
              <a-button type="primary" html-type="submit" :loading="store.loading">
                {{ isEdit ? 'Lưu thay đổi' : 'Tạo lịch hẹn' }}
              </a-button>
            </div>
          </a-form>
        </a-card>
      </a-col>

      <!-- Summary Sidebar -->
      <a-col :xs="24" :lg="8">
        <a-card title="Tóm tắt đặt lịch" class="summary-card">
          <div v-if="selectedService" class="summary-section">
            <div class="summary-label">Dịch vụ</div>
            <div class="summary-value">{{ selectedService.name }}</div>
            <div class="summary-sub">Thời gian: {{ formatDuration(selectedService.duration) }}</div>
          </div>
          <div v-if="selectedCustomer" class="summary-section">
            <div class="summary-label">Khách hàng</div>
            <div class="summary-value">{{ selectedCustomer.name }}</div>
            <div class="summary-sub">{{ selectedCustomer.phone }}</div>
            <a-tag color="purple" size="small" style="margin-top: 4px;">
              {{ selectedCustomer.totalVisits }} lần đến
            </a-tag>
          </div>
          <div v-if="form.date && form.time" class="summary-section">
            <div class="summary-label">Thời gian</div>
            <div class="summary-value">
              {{ dayjs(form.date).format('DD/MM/YYYY') }} lúc {{ dayjs(form.time).format('HH:mm') }}
            </div>
          </div>
          <a-divider />
          <div v-if="selectedService" class="summary-total">
            <span>Tổng tiền:</span>
            <span class="total-price">{{ formatCurrency(selectedService.price) }}</span>
          </div>
          <div v-else class="summary-empty">
            <p class="text-muted">Chọn dịch vụ để xem tóm tắt</p>
          </div>
        </a-card>

        <!-- Customer Notes -->
        <a-card v-if="selectedCustomer?.notes" title="Ghi chú khách hàng" style="margin-top: 12px;">
          <p class="text-muted" style="font-size: 13px;">{{ selectedCustomer.notes }}</p>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores/appointment'
import { customerApi, serviceApi, staffApi } from '@/api'
import { formatCurrency, formatDuration } from '@/utils/format'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const store = useAppointmentStore()

const isEdit = computed(() => !!route.params.id)
const initLoading = ref(false)

const customers = ref([])
const services = ref([])
const staff = ref([])
const formRef = ref(null)

const form = reactive({
  customerId: null,
  staffId: null,
  serviceId: null,
  date: null,
  time: null,
  notes: '',
})

const rules = {
  customerId: [{ required: true, message: 'Vui lòng chọn khách hàng' }],
  staffId: [{ required: true, message: 'Vui lòng chọn thợ' }],
  serviceId: [{ required: true, message: 'Vui lòng chọn dịch vụ' }],
  date: [{ required: true, message: 'Vui lòng chọn ngày' }],
  time: [{ required: true, message: 'Vui lòng chọn giờ' }],
}

const activeStaff = computed(() => staff.value.filter(s => s.active))
const activeServices = computed(() => services.value.filter(s => s.active))
const selectedService = computed(() => services.value.find(s => s.id === form.serviceId))
const selectedCustomer = computed(() => customers.value.find(c => c.id === form.customerId))

function disabledDate(d) {
  return d && d < dayjs().startOf('day')
}

function filterOption(input, option) {
  return option.children.toLowerCase().includes(input.toLowerCase())
}

function onServiceChange(id) {
  // Auto-fill duration info
}

function onCustomerChange(id) {
  // Could load customer history here
}

async function handleSubmit() {
  const payload = {
    customerId: form.customerId,
    customerName: selectedCustomer.value?.name,
    staffId: form.staffId,
    staffName: activeStaff.value.find(s => s.id === form.staffId)?.name,
    serviceId: form.serviceId,
    serviceName: selectedService.value?.name,
    servicePrice: selectedService.value?.price,
    duration: selectedService.value?.duration,
    date: dayjs(form.date).format('YYYY-MM-DD'),
    time: dayjs(form.time).format('HH:mm'),
    notes: form.notes,
  }

  if (isEdit.value) {
    await store.update(route.params.id, payload)
  } else {
    await store.create(payload)
  }
  router.push('/appointments')
}

onMounted(async () => {
  initLoading.value = true
  const [cRes, sRes, stRes] = await Promise.all([
    customerApi.getAll(),
    serviceApi.getAll(),
    staffApi.getAll(),
  ])
  customers.value = cRes.data
  services.value = sRes.data
  staff.value = stRes.data

  // If editing, load existing data
  if (isEdit.value) {
    await store.fetchById(route.params.id)
    const apt = store.current
    if (apt) {
      form.customerId = apt.customerId
      form.staffId = apt.staffId
      form.serviceId = apt.serviceId
      form.date = dayjs(apt.date)
      form.time = dayjs(`2000-01-01 ${apt.time}`)
      form.notes = apt.notes
    }
  }
  initLoading.value = false
})
</script>

<style scoped>
.summary-card { position: sticky; top: 80px; }

.summary-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.summary-section:last-child { border-bottom: none; }

.summary-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.summary-sub { font-size: 13px; color: var(--color-text-muted); }

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.total-price {
  font-size: 18px;
  color: var(--color-accent);
  font-weight: 700;
}

.summary-empty { text-align: center; padding: 12px 0; }
</style>
