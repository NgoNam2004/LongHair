<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý Lịch hẹn</h1>
        <p class="page-subtitle">Tổng cộng {{ total }} lịch hẹn</p>
      </div>
      <a-button type="primary" @click="$router.push('/appointments/create')">
        <PlusOutlined /> Đặt lịch mới
      </a-button>
    </div>

    <!-- Filters -->
    <a-card class="filter-card" :body-style="{ padding: '16px' }">
      <a-row :gutter="[12, 12]" align="middle">
        <a-col :xs="24" :sm="12" :md="6">
          <a-input-search
            v-model:value="filters.search"
            placeholder="Tìm theo tên, dịch vụ..."
            @search="onFilter"
            allow-clear
          />
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <a-date-picker
            v-model:value="filters.date"
            style="width: 100%"
            placeholder="Lọc theo ngày"
            format="DD/MM/YYYY"
            @change="onFilter"
          />
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <a-select
            v-model:value="filters.staffId"
            placeholder="Lọc theo thợ"
            style="width: 100%"
            allow-clear
            @change="onFilter"
          >
            <a-select-option v-for="s in staffOptions" :key="s.id" :value="s.id">
              {{ s.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <a-select
            v-model:value="filters.status"
            placeholder="Lọc trạng thái"
            style="width: 100%"
            allow-clear
            @change="onFilter"
          >
            <a-select-option value="pending">Chờ xác nhận</a-select-option>
            <a-select-option value="confirmed">Đã xác nhận</a-select-option>
            <a-select-option value="inprogress">Đang thực hiện</a-select-option>
            <a-select-option value="completed">Hoàn thành</a-select-option>
            <a-select-option value="cancelled">Đã hủy</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="3">
          <a-button @click="resetFilters" block>
            <ReloadOutlined /> Đặt lại
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- Table -->
    <a-card style="margin-top: 16px;" :body-style="{ padding: 0 }">
      <a-table
        :columns="columns"
        :data-source="store.appointments"
        :loading="store.loading"
        :pagination="{ pageSize: 10, showTotal: (t) => `Tổng ${t} bản ghi` }"
        row-key="id"
        :scroll="{ x: 900 }"
      >
        <!-- Customer -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'customer'">
            <div class="cell-user">
              <a-avatar size="small" :style="{ background: '#e94560', color: '#fff', fontSize: '11px' }">
                {{ getInitials(record.customerName) }}
              </a-avatar>
              <span class="cell-name">{{ record.customerName }}</span>
            </div>
          </template>

          <template v-if="column.key === 'datetime'">
            <div>
              <div class="cell-date">{{ formatDate(record.date) }}</div>
              <div class="cell-time text-muted">{{ record.time }}</div>
            </div>
          </template>

          <template v-if="column.key === 'service'">
            <div>
              <div class="cell-service">{{ record.serviceName }}</div>
              <div class="text-muted" style="font-size: 12px;">{{ formatDuration(record.duration) }}</div>
            </div>
          </template>

          <template v-if="column.key === 'price'">
            <span class="text-bold text-accent">{{ formatCurrency(record.servicePrice) }}</span>
          </template>

          <template v-if="column.key === 'status'">
            <a-tag :color="getAppointmentStatus(record.status).color">
              {{ getAppointmentStatus(record.status).label }}
            </a-tag>
          </template>

          <template v-if="column.key === 'actions'">
            <a-space>
              <a-tooltip title="Xem / Sửa">
                <a-button size="small" type="text" @click="$router.push(`/appointments/${record.id}/edit`)">
                  <EditOutlined />
                </a-button>
              </a-tooltip>
              <a-dropdown :trigger="['click']">
                <a-button size="small" type="text">
                  <MoreOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="record.status === 'pending'" @click="changeStatus(record.id, 'confirmed')">
                      ✅ Xác nhận
                    </a-menu-item>
                    <a-menu-item v-if="record.status === 'confirmed'" @click="changeStatus(record.id, 'inprogress')">
                      ▶️ Bắt đầu
                    </a-menu-item>
                    <a-menu-item v-if="record.status === 'inprogress'" @click="changeStatus(record.id, 'completed')">
                      🎉 Hoàn thành
                    </a-menu-item>
                    <a-menu-item v-if="!['completed','cancelled'].includes(record.status)" @click="changeStatus(record.id, 'cancelled')">
                      ❌ Hủy lịch
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="confirmDelete(record.id)" danger>
                      <DeleteOutlined /> Xóa
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAppointmentStore } from '@/stores/appointment'
import { useStaffStore } from '@/stores/staff'
import { formatDate, formatCurrency, formatDuration, getInitials, getAppointmentStatus } from '@/utils/format'
import { Modal } from 'ant-design-vue'
import {
  PlusOutlined, ReloadOutlined, EditOutlined,
  DeleteOutlined, MoreOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const store = useAppointmentStore()
const staffStore = useStaffStore()

const total = ref(0)
const staffOptions = ref([])

const filters = reactive({ search: '', date: null, staffId: null, status: null })

const columns = [
  { title: 'Khách hàng', key: 'customer', dataIndex: 'customerName' },
  { title: 'Ngày / Giờ', key: 'datetime', width: 130 },
  { title: 'Dịch vụ', key: 'service' },
  { title: 'Thợ', dataIndex: 'staffName', key: 'staff' },
  { title: 'Giá', key: 'price', width: 120 },
  { title: 'Trạng thái', key: 'status', width: 150 },
  { title: 'Thao tác', key: 'actions', width: 100, fixed: 'right' },
]

async function loadData() {
  const params = {
    search: filters.search || undefined,
    date: filters.date ? dayjs(filters.date).format('YYYY-MM-DD') : undefined,
    staffId: filters.staffId || undefined,
    status: filters.status || undefined,
  }
  await store.fetchAll(params)
  total.value = store.total
}

function onFilter() { loadData() }

function resetFilters() {
  filters.search = ''
  filters.date = null
  filters.staffId = null
  filters.status = null
  loadData()
}

async function changeStatus(id, status) {
  await store.updateStatus(id, status)
}

function confirmDelete(id) {
  Modal.confirm({
    title: 'Xác nhận xóa',
    content: 'Bạn có chắc muốn xóa lịch hẹn này không?',
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: () => store.remove(id),
  })
}

onMounted(async () => {
  await Promise.all([loadData(), staffStore.fetchAll()])
  staffOptions.value = staffStore.staff
})
</script>

<style scoped>
.filter-card { margin-bottom: 0; }

.cell-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cell-name { font-weight: 500; }
.cell-date { font-weight: 600; }
.cell-time { font-size: 12px; }
.cell-service { font-weight: 500; }
</style>
