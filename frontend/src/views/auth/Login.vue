<template>
  <div class="login-page">
    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <div class="login-container">
      <!-- Left Panel - Branding -->
      <div class="login-left">
        <div class="brand">
          <div class="brand-icon">✂️</div>
          <h1 class="brand-name">BarberShop</h1>
          <p class="brand-tagline">Premium Barbershop Management</p>
        </div>

        <div class="features-list">
          <div v-for="f in features" :key="f.text" class="feature-item">
            <span class="feature-icon">{{ f.icon }}</span>
            <span>{{ f.text }}</span>
          </div>
        </div>

        <div class="login-quote">
          <p>"Quản lý thông minh, phục vụ xuất sắc"</p>
        </div>
      </div>

      <!-- Right Panel - Form -->
      <div class="login-right">
        <div class="login-card">
          <div class="login-header">
            <h2>{{ isRegister ? 'Tạo tài khoản' : 'Đăng nhập' }}</h2>
            <p>
              {{ isRegister ? 'Điền thông tin để đăng ký' : 'Nhập thông tin để truy cập hệ thống quản lý' }}
            </p>
          </div>

          <!-- ───── Form đăng nhập ───── -->
          <a-form
            v-if="!isRegister"
            :model="form"
            :rules="rules"
            @finish="handleLogin"
            layout="vertical"
            class="login-form"
          >
            <a-form-item name="username" label="Tên đăng nhập">
              <a-input v-model:value="form.username" placeholder="Nhập tên đăng nhập" size="large">
                <template #prefix><UserOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" label="Mật khẩu">
              <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" size="large">
                <template #prefix><LockOutlined class="input-icon" /></template>
              </a-input-password>
            </a-form-item>

            <div class="form-options">
              <a-checkbox v-model:checked="remember">Ghi nhớ đăng nhập</a-checkbox>
            </div>

            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="authStore.loading"
              block
              class="login-btn"
            >
              <template v-if="!authStore.loading">
                Đăng nhập
                <ArrowRightOutlined />
              </template>
              <template v-else>Đang xác thực...</template>
            </a-button>
          </a-form>

          <!-- ───── Form đăng ký ───── -->
          <a-form
            v-else
            :model="regForm"
            :rules="regRules"
            @finish="handleRegister"
            layout="vertical"
            class="login-form"
          >
            <a-form-item name="name" label="Họ và tên">
              <a-input v-model:value="regForm.name" placeholder="Nguyễn Văn A" size="large">
                <template #prefix><IdcardOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="username" label="Tên đăng nhập">
              <a-input v-model:value="regForm.username" placeholder="Tên đăng nhập" size="large">
                <template #prefix><UserOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="email" label="Email">
              <a-input v-model:value="regForm.email" placeholder="email@example.com" size="large">
                <template #prefix><MailOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="phone" label="Số điện thoại">
              <a-input v-model:value="regForm.phone" placeholder="0901234567" size="large">
                <template #prefix><PhoneOutlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" label="Mật khẩu">
              <a-input-password v-model:value="regForm.password" placeholder="Tối thiểu 6 ký tự" size="large">
                <template #prefix><LockOutlined class="input-icon" /></template>
              </a-input-password>
            </a-form-item>

            <a-form-item name="confirm" label="Nhập lại mật khẩu">
              <a-input-password v-model:value="regForm.confirm" placeholder="Nhập lại mật khẩu" size="large">
                <template #prefix><LockOutlined class="input-icon" /></template>
              </a-input-password>
            </a-form-item>

            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="authStore.loading"
              block
              class="login-btn"
            >
              Đăng ký
            </a-button>
          </a-form>

          <!-- Chuyển qua lại giữa đăng nhập / đăng ký -->
          <div class="switch-mode">
            <template v-if="!isRegister">
              Chưa có tài khoản? <a @click="isRegister = true">Đăng ký</a>
            </template>
            <template v-else>
              Đã có tài khoản? <a @click="isRegister = false">Đăng nhập</a>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isRegister = ref(false)
const remember = ref(true)

// ─── Đăng nhập ──────────────────────────────────────────────────────────
const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu' }],
}

async function handleLogin() {
  const success = await authStore.login(form)
  if (success) router.push(route.query.redirect || '/dashboard')
}

// ─── Đăng ký ────────────────────────────────────────────────────────────
const regForm = reactive({ name: '', username: '', email: '', phone: '', password: '', confirm: '' })
const regRules = {
  name: [{ required: true, message: 'Vui lòng nhập họ tên' }],
  username: [
    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
    { min: 3, message: 'Tối thiểu 3 ký tự' },
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email' },
    { type: 'email', message: 'Email không hợp lệ' },
  ],
  phone: [{ pattern: /^0\d{9}$/, message: 'SĐT gồm 10 số, bắt đầu bằng 0' }],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu' },
    { min: 6, message: 'Tối thiểu 6 ký tự' },
  ],
  confirm: [
    { required: true, message: 'Vui lòng nhập lại mật khẩu' },
    {
      validator: async (_rule, value) => {
        if (value && value !== regForm.password) {
          return Promise.reject('Mật khẩu nhập lại không khớp')
        }
      },
    },
  ],
}

async function handleRegister() {
  const { confirm, ...payload } = regForm 
  const success = await authStore.register(payload)
  if (success) router.push(route.query.redirect || '/dashboard')
}

const features = [
  { icon: '📅', text: 'Quản lý lịch hẹn thông minh' },
  { icon: '👥', text: 'Hồ sơ khách hàng chi tiết' },
  { icon: '✂️', text: 'Quản lý thợ và dịch vụ' },
  { icon: '💰', text: 'Hóa đơn và báo cáo doanh thu' },
]
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Background circles */
.bg-decoration { position: absolute; inset: 0; pointer-events: none; }
.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(233, 69, 96, 0.08);
  animation: float 8s ease-in-out infinite;
}
.bg-circle-1 { width: 600px; height: 600px; top: -200px; left: -200px; animation-delay: 0s; }
.bg-circle-2 { width: 400px; height: 400px; bottom: -150px; right: -100px; animation-delay: 3s; background: rgba(245, 166, 35, 0.06); }
.bg-circle-3 { width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: 6s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 900px;
  width: 100%;
  gap: 0;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 1;
}

/* Left panel */
.login-left {
  background: linear-gradient(160deg, #e94560 0%, #c73652 100%);
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32px;
}

.brand { text-align: center; }
.brand-icon { font-size: 52px; margin-bottom: 12px; }
.brand-name {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 4px;
  letter-spacing: 1px;
}
.brand-tagline {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.features-list { display: flex; flex-direction: column; gap: 14px; }
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.9);
  font-size: 14px;
}
.feature-icon { font-size: 20px; flex-shrink: 0; }

.login-quote {
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 20px;
  color: rgba(255,255,255,0.65);
  font-style: italic;
  font-size: 14px;
  text-align: center;
}

/* Right panel */
.login-right {
  background: #ffffff;
  padding: 48px 40px;
  display: flex;
  align-items: center;
}

.login-card { width: 100%; }

.login-header {
  margin-bottom: 32px;
}
.login-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
}
.login-header p {
  color: var(--color-text-muted);
  font-size: 14px;
}

.login-form :deep(.ant-form-item-label label) {
  font-weight: 600;
  color: #374151;
}

.input-icon { color: #9ca3af; }

.form-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.login-btn {
  height: 48px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.demo-hint {
  margin-top: 20px;
}

.demo-hint code {
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: monospace;
}

/* Responsive */
@media (max-width: 640px) {
  .login-container {
    grid-template-columns: 1fr;
  }
  .login-left { display: none; }
  .login-right { padding: 40px 24px; }
}
</style>
