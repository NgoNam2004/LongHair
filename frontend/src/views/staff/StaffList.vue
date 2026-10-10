<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý Nhân viên</h1>
        <p class="page-subtitle">{{ store.total }} thợ cắt tóc</p>
      </div>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined /> Thêm nhân viên
      </a-button>
    </div>

    <!-- Filters -->
    <a-card :body-style="{ padding: '16px' }" style="margin-bottom: 16px;">
      <a-row :gutter="[12, 12]">
        <a-col :xs="24" :md="12">
          <a-input-search v-model:value="searchText" placeholder="Tìm tên, số điện thoại..." @search="loadData" allow-clear />
        </a-col>
        <a-col :xs="24" :md="6">
          <a-select v-model:value="activeFilter" placeholder="Trạng thái" allow-clear style="width:100%" @change="loadData">
            <a-select-option :value="true">Đang làm việc</a-select-option>
            <a-select-option :value="false">Tạm nghỉ</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="6">
          <a-button @click="resetFilter" block><ReloadOutlined /> Đặt lại</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- Staff Grid -->
    <a-spin :spinning="store.loading">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="member in store.staff"
          :key="member.id"
          :xs="24" :sm="12" :lg="8" :xl="6"
        >
          <div class="staff-card" :class="{ inactive: !member.active }">
            <!-- Card Header -->
            <div class="staff-card-top">
              <a-avatar
                size="64"
                :style="{ background: getAvatarBg(member.id), color: '#fff', fontWeight: 700, fontSize: '22px' }"
              >
                {{ getInitials(member.name) }}
              </a-avatar>
              <div class="staff-menu">
                <a-dropdown :trigger="['click']">
                  <a-button size="small" type="text"><MoreOutlined /></a-button>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item @click="openModal(member)"><EditOutlined /> Sửa thông tin</a-menu-item>
                      <a-menu-divider />
                      <a-menu-item @click="confirmDelete(member.id)" danger>
                        <DeleteOutlined /> Xóa
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>

            <div class="staff-info">
              <h3 class="staff-name">{{ member.name }}</h3>
              <p class="staff-speciality">{{ member.speciality }}</p>

              <!-- Rating -->
              <div class="staff-rating">
                <a-rate :value="member.rating" allow-half disabled :count="5" />
                <span class="rating-value">{{ member.rating }}</span>
              </div>

              <div class="staff-meta">
                <div class="meta-item">
                  <ScissorOutlined /> {{ member.totalServices }} dịch vụ
                </div>
                <div class="meta-item">
                  <PhoneOutlined /> {{ member.phone }}
                </div>
              </div>

              <!-- Work Days -->
              <div class="work-days">
                <span
                  v-for="d in 7"
                  :key="d"
                  class="day-chip"
                  :class="{ active: member.workDays.includes(d % 7) }"
                >
                  {{ dayNames[d - 1] }}
                </span>
              </div>
            </div>

            <div class="staff-footer">
              <a-badge
                :status="member.active ? 'success' : 'default'"
                :text="member.active ? 'Đang làm việc' : 'Tạm nghỉ'"
              />
              <span class="staff-since">Từ {{ formatDate(member.joinDate) }}</span>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-spin>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingRecord ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'"
      :footer="null"
      width="600px"
      destroy-on-close
    >
      <a-form
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="handleSave"
        style="margin-top: 16px;"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Họ và tên" name="name" required>
              <a-input v-model:value="form.name" placeholder="Trần Văn A" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Số điện thoại" name="phone" required>
              <a-input v-model:value="form.phone" placeholder="0901234567" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Email" name="email">
          <a-input v-model:value="form.email" placeholder="email@barbershop.vn" />
        </a-form-item>

        <a-form-item label="Chuyên môn" name="speciality">
          <a-input v-model:value="form.speciality" placeholder="Cắt tóc nam, Nhuộm..." />
        </a-form-item>

        <a-form-item label="Lương (VNĐ/tháng)" name="salary">
          <a-input-number
            v-model:value="form.salary"
            :formatter="v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
            :parser="v => v.replace(/\./g, '')"
            style="width:100%"
            :min="0"
          />
        </a-form-item>

        <a-form-item label="Ngày làm việc trong tuần">
          <div class="workday-picker">
            <label
              v-for="(name, idx) in fullDayNames"
              :key="idx"
              class="workday-label"
              :class="{ selected: form.workDays.includes(idx) }"
            >
              <input type="checkbox" :value="idx" v-model="form.workDays" style="display:none" />
              {{ name }}
            </label>
          </div>
        </a-form-item>

        <a-form-item label="Trạng thái">
          <a-switch v-model:checked="form.active" checked-children="Đang làm" un-checked-children="Tạm nghỉ" />
        </a-form-item>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <a-button @click="modalVisible = false">Hủy</a-button>
          <a-button type="primary" html-type="submit" :loading="store.loading">
            {{ editingRecord ? 'Lưu' : 'Thêm nhân viên' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useStaffStore } from '@/stores/staff'
import { getInitials, formatDate } from '@/utils/format'
import { Modal } from 'ant-design-vue'
import {
  PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined,
  MoreOutlined, ScissorOutlined, PhoneOutlined,
} from '@ant-design/icons-vue'

const store = useStaffStore()
const searchText = ref('')
const activeFilter = ref(null)
const modalVisible = ref(false)
const editingRecord = ref(null)

const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const fullDayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

const form = reactive({
  name: '', phone: '', email: '', speciality: '',
  salary: 7000000, workDays: [1,2,3,4,5], active: true,
})

const rules = {
  name: [{ required: true, message: 'Vui lòng nhập tên' }],
  phone: [{ required: true, message: 'Vui lòng nhập số điện thoại' }],
}

const avatarBgs = ['#e94560', '#1890ff', '#52c41a', '#f5a623', '#722ed1', '#0f3460']
function getAvatarBg(id) { return avatarBgs[id % avatarBgs.length] }

async function loadData() {
  await store.fetchAll({ search: searchText.value || undefined, active: activeFilter.value !== null ? activeFilter.value : undefined })
}

function resetFilter() {
  searchText.value = ''
  activeFilter.value = null
  loadData()
}

function openModal(record = null) {
  editingRecord.value = record
  if (record) {
    Object.assign(form, { ...record, workDays: [...record.workDays] })
  } else {
    Object.assign(form, { name: '', phone: '', email: '', speciality: '', salary: 7000000, workDays: [1,2,3,4,5], active: true })
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
}

function confirmDelete(id) {
  Modal.confirm({
    title: 'Xóa nhân viên',
    content: 'Bạn có chắc muốn xóa nhân viên này?',
    okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
    onOk: () => store.remove(id),
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.staff-card {
  background: #fff;
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.staff-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.staff-card.inactive { opacity: 0.65; }

.staff-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 16px 0;
}

.staff-info {
  padding: 12px 16px;
  flex: 1;
}

.staff-name { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
.staff-speciality { font-size: 12px; color: var(--color-text-muted); margin: 0 0 10px; }

.staff-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.staff-rating :deep(.ant-rate) { font-size: 13px; }
.rating-value { font-weight: 700; font-size: 14px; color: #faad14; }

.staff-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.meta-item {
  font-size: 12px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.work-days {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.day-chip {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  background: #f0f2f5;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.day-chip.active {
  background: var(--color-accent);
  color: #fff;
}

.staff-footer {
  border-top: 1px solid #f0f2f5;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.staff-since { font-size: 12px; color: var(--color-text-muted); }

/* Workday Picker */
.workday-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.workday-label {
  padding: 6px 12px;
  border-radius: 100px;
  border: 1px solid #e8ecf0;
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}
.workday-label.selected {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}
</style>
