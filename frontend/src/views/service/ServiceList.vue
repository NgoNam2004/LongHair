<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý Dịch vụ</h1>
        <p class="page-subtitle">{{ store.total }} dịch vụ</p>
      </div>
      <a-button type="primary" @click="openModal()">
        <PlusOutlined /> Thêm dịch vụ
      </a-button>
    </div>

    <!-- Filter & Search -->
    <a-card :body-style="{ padding: '16px' }" style="margin-bottom: 16px;">
      <a-row :gutter="[12, 12]">
        <a-col :xs="24" :md="10">
          <a-input-search v-model:value="searchText" placeholder="Tìm tên dịch vụ..." @search="loadData" allow-clear />
        </a-col>
        <a-col :xs="24" :md="6">
          <a-select v-model:value="categoryFilter" placeholder="Danh mục" allow-clear style="width:100%" @change="loadData">
            <a-select-option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="4">
          <a-select v-model:value="activeFilter" placeholder="Trạng thái" allow-clear style="width:100%" @change="loadData">
            <a-select-option :value="true">Đang hoạt động</a-select-option>
            <a-select-option :value="false">Tạm ngưng</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="4">
          <a-button @click="resetFilter" block><ReloadOutlined /> Đặt lại</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- Service Grid Cards -->
    <a-spin :spinning="store.loading">
      <a-row :gutter="[16, 16]">
        <a-col
          v-for="svc in store.services"
          :key="svc.id"
          :xs="24" :sm="12" :lg="8" :xl="6"
        >
          <div class="service-card" :class="{ inactive: !svc.active }">
            <div class="service-card-header">
              <div class="service-emoji">{{ getCategoryIcon(svc.category) }}</div>
              <a-dropdown :trigger="['click']">
                <a-button size="small" type="text" class="card-menu-btn">
                  <MoreOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item @click="openModal(svc)"><EditOutlined /> Sửa</a-menu-item>
                    <a-menu-item @click="store.toggle(svc.id)">
                      {{ svc.active ? '⏸️ Tạm ngưng' : '▶️ Kích hoạt' }}
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item @click="confirmDelete(svc.id)" danger>
                      <DeleteOutlined /> Xóa
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>

            <div class="service-card-body">
              <a-tag :color="getCategoryColor(svc.category)" style="margin-bottom: 8px;">
                {{ getCategoryLabel(svc.category) }}
              </a-tag>
              <h3 class="service-name">{{ svc.name }}</h3>
              <p class="service-desc">{{ svc.description }}</p>
            </div>

            <div class="service-card-footer">
              <div class="service-price">{{ formatCurrency(svc.price) }}</div>
              <div class="service-duration">
                <ClockCircleOutlined /> {{ formatDuration(svc.duration) }}
              </div>
              <a-badge
                :status="svc.active ? 'success' : 'default'"
                :text="svc.active ? 'Hoạt động' : 'Tạm ngưng'"
                class="service-status"
              />
            </div>
          </div>
        </a-col>
      </a-row>
    </a-spin>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingRecord ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'"
      :footer="null"
      width="560px"
      destroy-on-close
    >
      <a-form
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="handleSave"
        style="margin-top: 16px;"
      >
        <a-form-item label="Tên dịch vụ" name="name" required>
          <a-input v-model:value="form.name" placeholder="Cắt tóc cơ bản..." />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Giá (VNĐ)" name="price" required>
              <a-input-number
                v-model:value="form.price"
                :min="0"
                :step="10000"
                :formatter="v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                :parser="v => v.replace(/\./g, '')"
                style="width: 100%"
                placeholder="80000"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Thời gian (phút)" name="duration" required>
              <a-input-number v-model:value="form.duration" :min="5" :step="5" style="width:100%" placeholder="30" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Danh mục" name="category">
          <a-select v-model:value="form.category" placeholder="Chọn danh mục">
            <a-select-option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Mô tả">
          <a-textarea v-model:value="form.description" :rows="3" placeholder="Mô tả chi tiết..." />
        </a-form-item>

        <a-form-item label="Trạng thái">
          <a-switch v-model:checked="form.active" checked-children="Hoạt động" un-checked-children="Tạm ngưng" />
        </a-form-item>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <a-button @click="modalVisible = false">Hủy</a-button>
          <a-button type="primary" html-type="submit" :loading="store.loading">
            {{ editingRecord ? 'Lưu' : 'Thêm dịch vụ' }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useServiceStore } from '@/stores/service'
import { formatCurrency, formatDuration } from '@/utils/format'
import { Modal } from 'ant-design-vue'
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, MoreOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'

const store = useServiceStore()
const searchText = ref('')
const categoryFilter = ref(null)
const activeFilter = ref(null)
const modalVisible = ref(false)
const editingRecord = ref(null)

const form = reactive({ name: '', price: 80000, duration: 30, category: 'haircut', description: '', active: true })

const rules = {
  name: [{ required: true, message: 'Vui lòng nhập tên dịch vụ' }],
  price: [{ required: true, message: 'Vui lòng nhập giá' }],
  duration: [{ required: true, message: 'Vui lòng nhập thời gian' }],
}

const categories = [
  { value: 'haircut', label: '✂️ Cắt tóc' },
  { value: 'styling', label: '💈 Tạo kiểu' },
  { value: 'coloring', label: '🎨 Nhuộm' },
  { value: 'shaving', label: '🪒 Cạo râu' },
  { value: 'care', label: '💆 Chăm sóc' },
]

function getCategoryIcon(cat) {
  const map = { haircut: '✂️', styling: '💈', coloring: '🎨', shaving: '🪒', care: '💆' }
  return map[cat] || '💇'
}
function getCategoryLabel(cat) {
  return categories.find(c => c.value === cat)?.label.split(' ').slice(1).join(' ') || cat
}
function getCategoryColor(cat) {
  const map = { haircut: 'red', styling: 'purple', coloring: 'volcano', shaving: 'blue', care: 'green' }
  return map[cat] || 'default'
}

async function loadData() {
  await store.fetchAll({
    search: searchText.value || undefined,
    category: categoryFilter.value || undefined,
    active: activeFilter.value !== null ? activeFilter.value : undefined,
  })
}

function resetFilter() {
  searchText.value = ''
  categoryFilter.value = null
  activeFilter.value = null
  loadData()
}

function openModal(record = null) {
  editingRecord.value = record
  if (record) {
    Object.assign(form, record)
  } else {
    Object.assign(form, { name: '', price: 80000, duration: 30, category: 'haircut', description: '', active: true })
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
    title: 'Xóa dịch vụ',
    content: 'Bạn có chắc muốn xóa dịch vụ này?',
    okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
    onOk: () => store.remove(id),
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.service-card {
  background: #fff;
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.service-card.inactive {
  opacity: 0.65;
}

.service-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
}

.service-emoji { font-size: 32px; }

.card-menu-btn { color: var(--color-text-muted); }

.service-card-body {
  padding: 0 16px 12px;
  flex: 1;
}

.service-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--color-text-primary);
}

.service-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.service-card-footer {
  border-top: 1px solid #f0f2f5;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.service-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-accent);
}

.service-duration {
  font-size: 12px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.service-status {
  margin-left: auto;
}
</style>
