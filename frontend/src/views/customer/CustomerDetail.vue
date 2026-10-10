<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <a-button type="text" @click="$router.back()" style="padding-left: 0;">← Quay lại</a-button>
        <h1 class="page-title">Chi tiết khách hàng</h1>
      </div>
      <a-button type="primary" ghost @click="$router.push('/appointments/create')">
        <CalendarOutlined /> Đặt lịch mới
      </a-button>
    </div>

    <a-spin :spinning="store.loading">
      <div v-if="customer">
        <a-row :gutter="[16, 16]">
          <!-- Profile Card -->
          <a-col :xs="24" :lg="8">
            <a-card class="profile-card">
              <div class="profile-header">
                <a-avatar
                  size="80"
                  :style="{ background: 'linear-gradient(135deg, #e94560, #c73652)', color: '#fff', fontSize: '28px', fontWeight: 700 }"
                >
                  {{ getInitials(customer.name) }}
                </a-avatar>
                <h2 class="profile-name">{{ customer.name }}</h2>
                <a-tag :color="customer.gender === 'male' ? 'blue' : 'pink'">
                  {{ getGenderLabel(customer.gender) }}
                </a-tag>
              </div>

              <a-divider />

              <div class="profile-info">
                <div class="info-row">
                  <PhoneOutlined class="info-icon" />
                  <a :href="`tel:${customer.phone}`">{{ customer.phone }}</a>
                </div>
                <div class="info-row" v-if="customer.email">
                  <MailOutlined class="info-icon" />
                  <span>{{ customer.email }}</span>
                </div>
                <div class="info-row" v-if="customer.address">
                  <EnvironmentOutlined class="info-icon" />
                  <span>{{ customer.address }}</span>
                </div>
                <div class="info-row">
                  <CalendarOutlined class="info-icon" />
                  <span>KH từ {{ formatDate(customer.createdAt) }}</span>
                </div>
              </div>

              <a-divider />

              <div class="profile-stats">
                <div class="pstat">
                  <div class="pstat-value">{{ customer.totalVisits }}</div>
                  <div class="pstat-label">Lượt đến</div>
                </div>
                <div class="pstat">
                  <div class="pstat-value text-accent">{{ formatCurrency(customer.totalSpent) }}</div>
                  <div class="pstat-label">Tổng chi tiêu</div>
                </div>
              </div>

              <div v-if="customer.notes" class="customer-notes">
                <div class="notes-label">📝 Ghi chú</div>
                <p>{{ customer.notes }}</p>
              </div>
            </a-card>
          </a-col>

          <!-- History Table -->
          <a-col :xs="24" :lg="16">
            <a-card title="Lịch sử dịch vụ">
              <a-table
                :columns="historyColumns"
                :data-source="store.history"
                :loading="histLoading"
                row-key="id"
                :pagination="{ pageSize: 8 }"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'datetime'">
                    <div>{{ formatDate(record.date) }} · {{ record.time }}</div>
                  </template>
                  <template v-if="column.key === 'price'">
                    <span class="text-bold text-accent">{{ formatCurrency(record.servicePrice) }}</span>
                  </template>
                  <template v-if="column.key === 'status'">
                    <a-tag :color="getAppointmentStatus(record.status).color">
                      {{ getAppointmentStatus(record.status).label }}
                    </a-tag>
                  </template>
                </template>
              </a-table>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomerStore } from '@/stores/customer'
import { formatDate, formatCurrency, getInitials, getGenderLabel, getAppointmentStatus } from '@/utils/format'
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const store = useCustomerStore()
const histLoading = ref(false)

const customer = computed(() => store.current)

const historyColumns = [
  { title: 'Ngày / Giờ', key: 'datetime', width: 140 },
  { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'service' },
  { title: 'Thợ', dataIndex: 'staffName', key: 'staff' },
  { title: 'Giá', key: 'price', width: 110 },
  { title: 'Trạng thái', key: 'status', width: 140 },
]

onMounted(async () => {
  await store.fetchById(route.params.id)
  histLoading.value = true
  await store.fetchHistory(route.params.id)
  histLoading.value = false
})
</script>

<style scoped>
.profile-card { text-align: center; }
.profile-header { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 4px; }
.profile-name { font-size: 20px; font-weight: 700; margin: 0; }

.profile-info { display: flex; flex-direction: column; gap: 10px; text-align: left; }
.info-row { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; }
.info-icon { color: var(--color-accent); margin-top: 2px; flex-shrink: 0; }

.profile-stats { display: flex; justify-content: space-around; }
.pstat { text-align: center; }
.pstat-value { font-size: 20px; font-weight: 700; }
.pstat-label { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }

.customer-notes {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: var(--border-radius-md);
  text-align: left;
}
.notes-label { font-weight: 600; margin-bottom: 4px; font-size: 13px; }
.customer-notes p { font-size: 13px; color: var(--color-text-secondary); margin: 0; }
</style>
