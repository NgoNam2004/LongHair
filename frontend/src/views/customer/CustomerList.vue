<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý Khách hàng</h1>
        <p class="page-subtitle">{{ store.total }} khách hàng trong hệ thống</p>
      </div>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined /> Thêm khách hàng
      </a-button>
    </div>

    <!-- Filters -->
    <a-card :body-style="{ padding: '16px' }" style="margin-bottom: 16px;">
      <a-row :gutter="[12, 12]">
        <a-col :xs="24" :md="10">
          <a-input-search
            v-model:value="searchText"
            placeholder="Tìm tên, số điện thoại, email..."
            @search="loadData"
            allow-clear
          />
        </a-col>
        <a-col :xs="24" :md="6">
          <a-select v-model:value="genderFilter" placeholder="Giới tính" allow-clear style="width: 100%" @change="loadData">
            <a-select-option value="male">Nam</a-select-option>
            <a-select-option value="female">Nữ</a-select-option>
            <a-select-option value="other">Khác</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="4">
          <a-button @click="resetFilter" block><ReloadOutlined /> Đặt lại</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- Customer Table -->
    <a-card :body-style="{ padding: 0 }">
      <a-table
        :columns="columns"
        :data-source="store.customers"
        :loading="store.loading"
        :pagination="{ pageSize: 10, showTotal: t => `Tổng ${t} khách hàng` }"
        row-key="id"
        :scroll="{ x: 800 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'customer'">
            <div class="cell-user">
              <a-avatar
                size="40"
                :style="{ background: getAvatarColor(record.id), color: '#fff', fontWeight: 600 }"
              >
                {{ getInitials(record.name) }}
              </a-avatar>
              <div>
                <div class="cell-name">{{ record.name }}</div>
                <div class="text-muted" style="font-size: 12px;">{{ record.email }}</div>
              </div>
            </div>
          </template>

          <template v-if="column.key === 'phone'">
            <a :href="`tel:${record.phone}`" class="phone-link">{{ record.phone }}</a>
          </template>

          <template v-if="column.key === 'gender'">
            <a-tag :color="record.gender === 'male' ? 'blue' : record.gender === 'female' ? 'pink' : 'default'">
              {{ getGenderLabel(record.gender) }}
            </a-tag>
          </template>

          <template v-if="column.key === 'visits'">
            <div>
              <div class="text-bold">{{ record.totalVisits }} lần</div>
              <div class="text-muted" style="font-size: 12px;">{{ formatCurrency(record.totalSpent) }}</div>
            </div>
          </template>

          <template v-if="column.key === 'lastVisit'">
            <span class="text-muted">{{ record.lastVisit ? formatDate(record.lastVisit) : '—' }}</span>
          </template>

          <template v-if="column.key === 'actions'">
            <a-space>
              <a-tooltip title="Xem chi tiết">
                <a-button size="small" type="text" @click="$router.push(`/customers/${record.id}`)">
                  <EyeOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="Sửa">
                <a-button size="small" type="text" @click="openModal(record)">
                  <EditOutlined />
                </a-button>
              </a-tooltip>
              <a-tooltip title="Xóa">
                <a-button size="small" type="text" danger @click="confirmDelete(record.id)">
                  <DeleteOutlined />
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingRecord ? 'Sửa khách hàng' : 'Thêm khách hàng mới'"
      :footer="null"
      width="600px"
      destroy-on-close
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="handleSave"
        style="margin-top: 16px;"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Họ và tên" name="name" required>
              <a-input v-model:value="form.name" placeholder="Nguyễn Văn A" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Số điện thoại" name="phone" required>
              <a-input v-model:value="form.phone" placeholder="0901234567" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Email" name="email">
              <a-input v-model:value="form.email" placeholder="email@gmail.com" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Giới tính" name="gender">
              <a-select v-model:value="form.gender" placeholder="Chọn giới tính">
                <a-select-option value="male">Nam</a-select-option>
                <a-select-option value="female">Nữ</a-select-option>
                <a-select-option value="other">Khác</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="Địa chỉ" name="address">
          <a-input v-model:value="form.address" placeholder="Địa chỉ..." />
        </a-form-item>
        <a-form-item label="Ghi chú" name="notes">
          <a-textarea v-model:value="form.notes" :rows="2" placeholder="Sở thích, đặc điểm nhận biết..." />
        </a-form-item>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <a-button @click="modalVisible = false">Hủy</a-button>
          <a-button type="primary" html-type="submit" :loading="store.loading">
            {{ editingRecord ? 'Lưu' : 'Thêm' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCustomerStore } from '@/stores/customer'
import { formatDate, formatCurrency, getInitials, getGenderLabel } from '@/utils/format'
import { Modal } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const store = useCustomerStore()
const searchText = ref('')
const genderFilter = ref(null)
const modalVisible = ref(false)
const editingRecord = ref(null)
const formRef = ref(null)

const form = reactive({ name: '', phone: '', email: '', gender: 'male', address: '', notes: '' })

const rules = {
  name: [{ required: true, message: 'Vui lòng nhập tên' }],
  phone: [{ required: true, message: 'Vui lòng nhập số điện thoại' }],
}

const avatarColors = ['#e94560', '#1890ff', '#52c41a', '#f5a623', '#722ed1', '#0f3460']
function getAvatarColor(id) { return avatarColors[id % avatarColors.length] }

const columns = [
  { title: 'Khách hàng', key: 'customer', fixed: 'left' },
  { title: 'Số điện thoại', key: 'phone', dataIndex: 'phone', width: 130 },
  { title: 'Giới tính', key: 'gender', width: 100 },
  { title: 'Lượt đến / Chi tiêu', key: 'visits', width: 160 },
  { title: 'Lần cuối đến', key: 'lastVisit', width: 130 },
  { title: 'Thao tác', key: 'actions', width: 110, fixed: 'right' },
]

async function loadData() {
  await store.fetchAll({ search: searchText.value, gender: genderFilter.value || undefined })
}

function resetFilter() {
  searchText.value = ''
  genderFilter.value = null
  loadData()
}

function openModal(record = null) {
  editingRecord.value = record
  if (record) {
    Object.assign(form, record)
  } else {
    Object.assign(form, { name: '', phone: '', email: '', gender: 'male', address: '', notes: '' })
  }
  modalVisible.value = true
}

async function handleSave() {
  if (editingRecord.value) {
    await store.update(editingRecord.value.id, { ...form })
  } else {
    await store.create({ ...form })
  }
  modalVisible.value = false
  loadData()
}

function confirmDelete(id) {
  Modal.confirm({
    title: 'Xóa khách hàng',
    content: 'Bạn có chắc muốn xóa khách hàng này? Lịch sử lịch hẹn sẽ không bị xóa.',
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: () => store.remove(id),
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.cell-user { display: flex; align-items: center; gap: 12px; }
.cell-name { font-weight: 600; }
.phone-link { color: var(--color-info); text-decoration: none; }
.phone-link:hover { text-decoration: underline; }
</style>
