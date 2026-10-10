<template>
  <a-layout class="admin-layout" :class="{ collapsed: collapsed }">
    <!-- ─── Sidebar ──────────────────────────────────────────────────────── -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="260"
      :collapsed-width="72"
      class="admin-sider"
    >
      <!-- Logo -->
      <div class="sider-logo" @click="$router.push('/dashboard')">
        <div class="logo-icon">✂️</div>
        <transition name="fade">
          <div v-if="!collapsed" class="logo-text">
            <span class="logo-name">BarberShop</span>
            <span class="logo-sub">Admin Panel</span>
          </div>
        </transition>
      </div>

      <!-- Navigation Menu -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        class="admin-menu"
        @click="onMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon><DashboardOutlined /></template>
          <span>Tổng quan</span>
        </a-menu-item>

        <a-menu-divider class="menu-divider" />

        <a-menu-item key="/appointments">
          <template #icon><CalendarOutlined /></template>
          <span>Lịch hẹn</span>
        </a-menu-item>

        <a-menu-item key="/customers">
          <template #icon><TeamOutlined /></template>
          <span>Khách hàng</span>
        </a-menu-item>

        <a-menu-item key="/services">
          <template #icon><ScissorOutlined /></template>
          <span>Dịch vụ</span>
        </a-menu-item>

        <a-menu-item key="/staff">
          <template #icon><UserOutlined /></template>
          <span>Nhân viên</span>
        </a-menu-item>

        <a-menu-divider class="menu-divider" />

        <a-menu-item key="/invoices">
          <template #icon><FileTextOutlined /></template>
          <span>Hóa đơn</span>
        </a-menu-item>

        <a-menu-item key="/settings">
          <template #icon><SettingOutlined /></template>
          <span>Cài đặt</span>
        </a-menu-item>
      </a-menu>

      <!-- Sider Footer -->
      <div class="sider-footer">
        <div v-if="!collapsed" class="sider-footer-info">
          <a-badge status="success" text="Hệ thống hoạt động" class="status-badge" />
        </div>
        <div v-else class="sider-footer-dot">
          <a-badge status="success" />
        </div>
      </div>
    </a-layout-sider>

    <!-- ─── Main Content Area ─────────────────────────────────────────────── -->
    <a-layout class="main-layout">
      <!-- Header -->
      <a-layout-header class="admin-header">
        <!-- Toggle Button -->
        <button class="collapse-btn" @click="collapsed = !collapsed">
          <MenuFoldOutlined v-if="!collapsed" />
          <MenuUnfoldOutlined v-else />
        </button>

        <!-- Breadcrumb -->
        <a-breadcrumb class="header-breadcrumb">
          <a-breadcrumb-item>
            <HomeOutlined />
          </a-breadcrumb-item>
          <a-breadcrumb-item v-if="currentRoute.meta?.parent">
            <router-link :to="{ name: currentRoute.meta.parent }">
              {{ parentTitle }}
            </router-link>
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ currentRoute.meta?.title }}</a-breadcrumb-item>
        </a-breadcrumb>

        <div class="header-spacer" />

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Quick add appointment button -->
          <a-button
            type="primary"
            size="small"
            @click="$router.push('/appointments/create')"
            class="quick-add-btn"
          >
            <PlusOutlined />
            <span>Đặt lịch</span>
          </a-button>

          <!-- Notifications -->
          <a-badge :count="3" class="notif-badge">
            <a-button shape="circle" class="icon-btn">
              <BellOutlined />
            </a-button>
          </a-badge>

          <!-- User Dropdown -->
          <a-dropdown placement="bottomRight">
            <div class="user-avatar-wrap">
              <a-avatar :style="{ backgroundColor: '#e94560', color: '#fff' }" size="small">
                {{ getInitials(authStore.userName) }}
              </a-avatar>
              <span v-if="!isMobile" class="user-name">{{ authStore.userName }}</span>
              <DownOutlined class="user-arrow" />
            </div>
            <template #overlay>
              <a-menu class="user-dropdown-menu">
                <a-menu-item key="profile">
                  <UserOutlined /> Hồ sơ cá nhân
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined /> <span class="text-accent">Đăng xuất</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- Page Content -->
      <a-layout-content class="admin-content">
        <router-view v-slot="{ Component, route }">
          <transition name="slide-up" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </a-layout-content>

      <!-- Footer -->
      <a-layout-footer class="admin-footer">
        <span>© {{ new Date().getFullYear() }} Barbershop Admin</span>
        <span class="footer-divider">·</span>
        <span class="text-muted">Version 1.0.0</span>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getInitials } from '@/utils/format'
import {
  DashboardOutlined, CalendarOutlined, TeamOutlined,
  ScissorOutlined, UserOutlined, FileTextOutlined,
  SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  HomeOutlined, BellOutlined, DownOutlined, PlusOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ─── Sidebar State ───────────────────────────────────────────────────────
const collapsed = ref(false)
const isMobile = ref(window.innerWidth < 768)

// ─── Menu Active Key ─────────────────────────────────────────────────────
const selectedKeys = ref([])
const openKeys = ref([])

const currentRoute = computed(() => route)

// Map route name to parent title
const parentTitleMap = {
  AppointmentList: 'Lịch hẹn',
  CustomerList: 'Khách hàng',
}
const parentTitle = computed(() => {
  const parent = currentRoute.value.meta?.parent
  return parentTitleMap[parent] || ''
})

// Sync menu selection with current route
watch(
  () => route.path,
  (path) => {
    // Match the first two segments, e.g. /appointments/create → /appointments
    const segment = '/' + path.split('/').filter(Boolean)[0]
    selectedKeys.value = [segment]
  },
  { immediate: true },
)

function onMenuClick({ key }) {
  router.push(key)
}

// ─── Logout ───────────────────────────────────────────────────────────────
async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ─── Layout ─────────────────────────────────────────────────────────────── */
.admin-layout {
  min-height: 100vh;
}

/* ─── Sider ─────────────────────────────────────────────────────────────── */
.admin-sider {
  background: var(--color-bg-sidebar) !important;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

/* Logo */
.sider-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 72px;
  transition: padding var(--transition-normal);
}

.logo-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.logo-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Menu */
.admin-menu {
  border-right: none !important;
  padding: 8px 0;
  flex: 1;
}

.admin-menu :deep(.ant-menu-item) {
  border-radius: 0 !important;
  margin: 2px 0 !important;
  padding-left: 20px !important;
  height: 46px;
  line-height: 46px;
  transition: all var(--transition-fast);
}

.admin-menu :deep(.ant-menu-item-selected) {
  background: rgba(233, 69, 96, 0.12) !important;
  border-right: 3px solid var(--color-accent) !important;
}

.admin-menu :deep(.ant-menu-item-selected .ant-menu-item-icon),
.admin-menu :deep(.ant-menu-item-selected span) {
  color: var(--color-accent) !important;
}

.admin-menu :deep(.ant-menu-item-icon) {
  font-size: 17px !important;
}

.menu-divider {
  background: rgba(255, 255, 255, 0.06) !important;
  margin: 6px 0 !important;
}

/* Sider Footer */
.sider-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.status-badge :deep(.ant-badge-status-text) {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

.sider-footer-dot {
  display: flex;
  justify-content: center;
}

/* ─── Header ─────────────────────────────────────────────────────────────── */
.admin-header {
  background: #ffffff !important;
  height: var(--header-height);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 99;
}

.collapse-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #f0f2f5;
  color: var(--color-accent);
}

.header-breadcrumb {
  font-size: 13px;
}

.header-spacer {
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-add-btn {
  border-radius: 20px !important;
  font-size: 13px !important;
}

.icon-btn {
  border: 1px solid #e8ecf0 !important;
  color: var(--color-text-secondary) !important;
}

.notif-badge :deep(.ant-badge-count) {
  background: var(--color-accent);
}

.user-avatar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--border-radius-sm);
  transition: background var(--transition-fast);
}

.user-avatar-wrap:hover {
  background: #f0f2f5;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-arrow {
  font-size: 11px;
  color: var(--color-text-muted);
}

.user-dropdown-menu {
  border-radius: var(--border-radius-md) !important;
  box-shadow: var(--shadow-lg) !important;
  min-width: 180px;
}

/* ─── Content ────────────────────────────────────────────────────────────── */
.admin-content {
  min-height: calc(100vh - var(--header-height) - 48px);
  overflow: auto;
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
.admin-footer {
  text-align: center;
  padding: 12px 24px;
  font-size: 13px;
  color: var(--color-text-muted);
  background: transparent;
}

.footer-divider {
  margin: 0 8px;
}

/* ─── Main Layout ────────────────────────────────────────────────────────── */
.main-layout {
  background: var(--color-bg-primary) !important;
  transition: margin-left var(--transition-normal);
}
</style>
