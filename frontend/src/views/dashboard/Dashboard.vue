<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Tổng quan</h1>
        <p class="page-subtitle">{{ todayStr }} · Xin chào, {{ authStore.userName }}! 👋</p>
      </div>
      <a-button type="primary" @click="$router.push('/appointments/create')">
        <PlusOutlined /> Đặt lịch mới
      </a-button>
    </div>

    <!-- Stats Cards -->
    <a-row :gutter="[16, 16]" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6" v-for="stat in statsCards" :key="stat.key">
        <div class="stat-card-wrap" :style="{ '--card-color': stat.color }">
          <div class="stat-card-inner">
            <div class="stat-icon-wrap">
              <span class="stat-emoji">{{ stat.icon }}</span>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
          <div class="stat-trend">
            <span :class="stat.trendUp ? 'trend-up' : 'trend-down'">
              {{ stat.trendUp ? '↑' : '↓' }} {{ stat.trend }}
            </span>
            <span class="trend-label"> so với hôm qua</span>
          </div>
          <div class="stat-card-bg"></div>
        </div>
      </a-col>
    </a-row>

    <!-- Charts + Today Appointments -->
    <a-row :gutter="[16, 16]" style="margin-top: 16px;">
      <!-- Revenue Chart (7 days) -->
      <a-col :xs="24" :lg="14">
        <a-card class="chart-card" title="Doanh thu 7 ngày qua">
          <template #extra>
            <a-tag color="blue">Tuần này</a-tag>
          </template>
          <a-spin :spinning="loading">
            <div v-if="stats" class="bar-chart">
              <div
                v-for="(d, i) in stats.revenueChart"
                :key="i"
                class="bar-group"
              >
                <div class="bar-label-top">{{ formatCurrency(d.revenue).replace(' ₫','') }}</div>
                <div
                  class="bar"
                  :style="{ height: getBarHeight(d.revenue) }"
                  :class="{ 'bar-today': i === stats.revenueChart.length - 1 }"
                >
                  <div class="bar-tooltip">{{ formatCurrency(d.revenue) }}</div>
                </div>
                <div class="bar-label">{{ d.date }}</div>
              </div>
            </div>
          </a-spin>
        </a-card>
      </a-col>

      <!-- Top Services -->
      <a-col :xs="24" :lg="10">
        <a-card class="chart-card" title="Dịch vụ phổ biến" style="height: 100%;">
          <a-spin :spinning="loading">
            <div v-if="stats" class="top-services">
              <div
                v-for="(svc, i) in stats.topServices"
                :key="svc.name"
                class="top-service-item"
              >
                <div class="service-rank" :class="`rank-${i + 1}`">{{ i + 1 }}</div>
                <div class="service-info">
                  <div class="service-name">{{ svc.name }}</div>
                  <div class="service-progress-wrap">
                    <div
                      class="service-progress"
                      :style="{ width: getServicePercent(svc.count) + '%', background: rankColors[i] }"
                    ></div>
                  </div>
                </div>
                <div class="service-count">{{ svc.count }} lần</div>
              </div>
            </div>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>

    <!-- Today's Appointments -->
    <a-row :gutter="[16, 16]" style="margin-top: 16px;">
      <a-col :xs="24">
        <a-card title="Lịch hẹn hôm nay" class="today-card">
          <template #extra>
            <router-link to="/appointments">
              <a-button type="link" size="small">Xem tất cả →</a-button>
            </router-link>
          </template>
          <a-spin :spinning="loading">
            <div v-if="todayAppointments.length === 0" class="empty-state">
              <div class="empty-icon">📅</div>
              <p>Chưa có lịch hẹn nào hôm nay</p>
              <a-button type="primary" @click="$router.push('/appointments/create')">
                Tạo lịch hẹn
              </a-button>
            </div>
            <div v-else class="appointment-timeline">
              <div
                v-for="apt in todayAppointments"
                :key="apt.id"
                class="timeline-item"
              >
                <div class="timeline-time">{{ apt.time }}</div>
                <div class="timeline-dot" :class="`dot-${apt.status}`"></div>
                <div class="timeline-content">
                  <div class="timeline-customer">
                    <a-avatar size="small" :style="{ background: '#e94560', color: '#fff', fontSize: '11px' }">
                      {{ getInitials(apt.customerName) }}
                    </a-avatar>
                    <strong>{{ apt.customerName }}</strong>
                  </div>
                  <div class="timeline-detail">
                    <a-tag size="small">{{ apt.serviceName }}</a-tag>
                    <span class="text-muted">với {{ apt.staffName }}</span>
                  </div>
                </div>
                <a-tag :color="getAppointmentStatus(apt.status).color" class="status-tag">
                  {{ getAppointmentStatus(apt.status).label }}
                </a-tag>
              </div>
            </div>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardApi } from '@/api'
import { appointmentApi } from '@/api'
import { formatCurrency, getInitials, getAppointmentStatus } from '@/utils/format'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const authStore = useAuthStore()

const stats = ref(null)
const todayAppointments = ref([])
const loading = ref(true)

const todayStr = computed(() => dayjs().format('dddd, DD/MM/YYYY'))

const rankColors = ['#e94560', '#f5a623', '#52c41a', '#1890ff', '#722ed1']

// Stats Cards
const statsCards = computed(() => {
  if (!stats.value) return []
  const t = stats.value.today
  return [
    { key: 'appointments', icon: '📅', label: 'Lịch hẹn hôm nay', value: t.appointments, trend: '+2', trendUp: true, color: '#e94560' },
    { key: 'completed', icon: '✅', label: 'Đã hoàn thành', value: t.completedAppointments, trend: '+1', trendUp: true, color: '#52c41a' },
    { key: 'revenue', icon: '💰', label: 'Doanh thu hôm nay', value: formatCurrency(t.revenue), trend: '+15%', trendUp: true, color: '#f5a623' },
    { key: 'customers', icon: '👤', label: 'Khách mới hôm nay', value: t.newCustomers, trend: '0', trendUp: true, color: '#1890ff' },
  ]
})

// Bar chart helpers
const maxRevenue = computed(() => {
  if (!stats.value) return 1
  return Math.max(...stats.value.revenueChart.map(d => d.revenue))
})

function getBarHeight(revenue) {
  const pct = (revenue / maxRevenue.value) * 160
  return Math.max(pct, 8) + 'px'
}

function getServicePercent(count) {
  if (!stats.value) return 0
  const max = Math.max(...stats.value.topServices.map(s => s.count))
  return Math.round((count / max) * 100)
}

onMounted(async () => {
  try {
    const [dashData, todayApts] = await Promise.all([
      dashboardApi.getStats(),
      appointmentApi.getTodayAppointments(),
    ])
    stats.value = dashData
    todayAppointments.value = todayApts
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ─── Stat Cards ─────────────────────────────────────────────────────────── */
.stats-row { margin-bottom: 8px; }

.stat-card-wrap {
  background: #fff;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: default;
}

.stat-card-wrap:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-card-bg {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--card-color);
  opacity: 0.08;
}

.stat-card-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--card-color) 12%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-emoji { font-size: 24px; }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stat-trend {
  font-size: 12px;
  color: var(--color-text-muted);
}

.trend-up { color: var(--color-success); font-weight: 600; }
.trend-down { color: var(--color-error); font-weight: 600; }
.trend-label { color: var(--color-text-muted); }

/* ─── Bar Chart ──────────────────────────────────────────────────────────── */
.chart-card { height: 100%; }

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 200px;
  padding: 12px 0 0;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.bar-label-top {
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.bar-group:hover .bar-label-top { opacity: 1; }

.bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, #c8d6f5 0%, #7da9f0 100%);
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  cursor: pointer;
  min-height: 8px;
}

.bar-today {
  background: linear-gradient(180deg, #f5a9b4 0%, #e94560 100%);
}

.bar:hover { filter: brightness(1.1); }

.bar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26,26,46,0.9);
  color: #fff;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
  margin-bottom: 4px;
}

.bar:hover .bar-tooltip { opacity: 1; }

.bar-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
}

/* ─── Top Services ───────────────────────────────────────────────────────── */
.top-services { display: flex; flex-direction: column; gap: 16px; }

.top-service-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-rank {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: #f0f2f5;
  color: var(--color-text-secondary);
}
.rank-1 { background: #fff3e0; color: #e65100; }
.rank-2 { background: #f3e5f5; color: #6a1b9a; }
.rank-3 { background: #e8f5e9; color: #2e7d32; }

.service-info { flex: 1; }
.service-name { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
.service-progress-wrap {
  height: 6px;
  background: #f0f2f5;
  border-radius: 100px;
  overflow: hidden;
}
.service-progress {
  height: 100%;
  border-radius: 100px;
  transition: width 0.8s ease;
}

.service-count {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* ─── Today Appointments ─────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-muted);
}
.empty-icon { font-size: 40px; margin-bottom: 8px; }

.appointment-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  background: #fafafa;
  border: 1px solid #f0f2f5;
  transition: border-color var(--transition-fast);
}

.timeline-item:hover { border-color: #dde3f0; }

.timeline-time {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  min-width: 50px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-pending    { background: #faad14; }
.dot-confirmed  { background: #1890ff; }
.dot-inprogress { background: #722ed1; }
.dot-completed  { background: #52c41a; }
.dot-cancelled  { background: #ff4d4f; }

.timeline-content { flex: 1; }
.timeline-customer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.timeline-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.status-tag { margin-left: auto; }
</style>
