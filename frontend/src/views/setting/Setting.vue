<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Cài đặt hệ thống</h1>
        <p class="page-subtitle">Quản lý thông tin quán và cấu hình hoạt động</p>
      </div>
    </div>

    <a-spin :spinning="loading">
      <a-row :gutter="[20, 20]">
        <!-- Shop Info -->
        <a-col :xs="24" :lg="14">
          <a-card title="🏪 Thông tin quán">
            <a-form
              :model="form"
              layout="vertical"
              @finish="handleSave"
            >
              <a-form-item label="Tên quán" name="shopName">
                <a-input v-model:value="form.shopName" size="large" placeholder="The Gentleman Barbershop" />
              </a-form-item>

              <a-form-item label="Địa chỉ" name="address">
                <a-input v-model:value="form.address" placeholder="123 Nguyễn Huệ, Q1, TP.HCM" />
              </a-form-item>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="Số điện thoại" name="phone">
                    <a-input v-model:value="form.phone" placeholder="028 1234 5678" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="Email" name="email">
                    <a-input v-model:value="form.email" placeholder="contact@barbershop.vn" />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-divider>⏰ Giờ hoạt động</a-divider>

              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="Giờ mở cửa">
                    <a-time-picker
                      v-model:value="openTimeVal"
                      format="HH:mm"
                      style="width:100%"
                      placeholder="08:00"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="Giờ đóng cửa">
                    <a-time-picker
                      v-model:value="closeTimeVal"
                      format="HH:mm"
                      style="width:100%"
                      placeholder="20:00"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item label="Ngày làm việc">
                <div class="workday-picker">
                  <label
                    v-for="(name, idx) in weekDays"
                    :key="idx"
                    class="workday-label"
                    :class="{ selected: form.workDays.includes(idx + 1) }"
                  >
                    <input type="checkbox" :value="idx + 1" v-model="form.workDays" style="display:none" />
                    {{ name }}
                  </label>
                </div>
              </a-form-item>

              <a-form-item label="Thời gian mỗi slot (phút)">
                <a-select v-model:value="form.slotDuration" style="width: 200px">
                  <a-select-option :value="15">15 phút</a-select-option>
                  <a-select-option :value="30">30 phút</a-select-option>
                  <a-select-option :value="45">45 phút</a-select-option>
                  <a-select-option :value="60">60 phút</a-select-option>
                </a-select>
              </a-form-item>

              <a-button type="primary" html-type="submit" :loading="saving" size="large">
                <SaveOutlined /> Lưu cài đặt
              </a-button>
            </a-form>
          </a-card>
        </a-col>

        <!-- Preview & Quick Info -->
        <a-col :xs="24" :lg="10">
          <a-card title="📋 Thông tin hiện tại" class="preview-card">
            <div class="preview-shop">
              <div class="preview-logo">✂️</div>
              <h3>{{ form.shopName }}</h3>
              <p class="text-muted">{{ form.address }}</p>
            </div>

            <a-divider />

            <div class="preview-info-list">
              <div class="preview-info-row">
                <PhoneOutlined class="pinfo-icon" />
                <span>{{ form.phone }}</span>
              </div>
              <div class="preview-info-row">
                <MailOutlined class="pinfo-icon" />
                <span>{{ form.email }}</span>
              </div>
              <div class="preview-info-row">
                <ClockCircleOutlined class="pinfo-icon" />
                <span>{{ form.openTime }} – {{ form.closeTime }}</span>
              </div>
              <div class="preview-info-row">
                <CalendarOutlined class="pinfo-icon" />
                <div class="workday-chips">
                  <span
                    v-for="(name, idx) in weekDays"
                    :key="idx"
                    class="wday-chip"
                    :class="{ active: form.workDays.includes(idx + 1) }"
                  >{{ name }}</span>
                </div>
              </div>
            </div>
          </a-card>

          <!-- System Info -->
          <a-card title="💻 Thông tin hệ thống" style="margin-top: 16px;">
            <div class="sys-info-list">
              <div class="sys-row">
                <span>Phiên bản</span>
                <a-tag color="blue">v1.0.0</a-tag>
              </div>
              <div class="sys-row">
                <span>Chế độ dữ liệu</span>
                <a-tag color="orange">Mock Data</a-tag>
              </div>
              <div class="sys-row">
                <span>Framework</span>
                <a-tag color="green">Vue 3 + Vite</a-tag>
              </div>
              <div class="sys-row">
                <span>UI Library</span>
                <a-tag color="purple">Ant Design Vue 4</a-tag>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { settingApi } from '@/api'
import { message } from 'ant-design-vue'
import {
  SaveOutlined, PhoneOutlined, MailOutlined,
  ClockCircleOutlined, CalendarOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const loading = ref(true)
const saving = ref(false)

const openTimeVal = ref(null)
const closeTimeVal = ref(null)

const form = reactive({
  shopName: '',
  address: '',
  phone: '',
  email: '',
  openTime: '08:00',
  closeTime: '20:00',
  workDays: [1,2,3,4,5,6],
  slotDuration: 30,
})

const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

async function loadData() {
  loading.value = true
  try {
    const data = await settingApi.get()
    Object.assign(form, data)
    openTimeVal.value = dayjs(`2000-01-01 ${data.openTime}`)
    closeTimeVal.value = dayjs(`2000-01-01 ${data.closeTime}`)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      ...form,
      openTime: openTimeVal.value ? dayjs(openTimeVal.value).format('HH:mm') : form.openTime,
      closeTime: closeTimeVal.value ? dayjs(closeTimeVal.value).format('HH:mm') : form.closeTime,
    }
    await settingApi.update(payload)
    Object.assign(form, payload)
    message.success('Cài đặt đã được lưu!')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.preview-card { position: sticky; top: 80px; }

.preview-shop { text-align: center; padding-bottom: 4px; }
.preview-logo { font-size: 40px; margin-bottom: 8px; }
.preview-shop h3 { font-size: 18px; font-weight: 700; margin: 0 0 4px; }

.preview-info-list { display: flex; flex-direction: column; gap: 12px; }
.preview-info-row { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; }
.pinfo-icon { color: var(--color-accent); flex-shrink: 0; margin-top: 2px; }

.workday-chips { display: flex; gap: 4px; flex-wrap: wrap; }
.wday-chip {
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 12px;
  background: #f0f2f5;
  color: var(--color-text-muted);
}
.wday-chip.active {
  background: var(--color-accent);
  color: #fff;
}

.sys-info-list { display: flex; flex-direction: column; gap: 12px; }
.sys-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }

/* Workday Picker (reused) */
.workday-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.workday-label {
  padding: 6px 14px;
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
