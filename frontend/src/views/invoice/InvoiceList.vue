<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Hóa đơn & Doanh thu</h1>
        <p class="page-subtitle">Quản lý thanh toán và theo dõi doanh thu</p>
      </div>
      <a-button type="primary" @click="showCreateModal = true">
        <PlusOutlined /> Tạo hóa đơn
      </a-button>
    </div>

    <!-- Revenue Stats -->
    <a-row
      v-if="authStore.isAdmin"
      :gutter="[16, 16]"
      style="margin-bottom: 16px"
    >
      <a-col :xs="24" :sm="8">
        <a-card class="revenue-stat-card" :body-style="{ padding: '20px' }">
          <div class="revenue-stat">
            <div
              class="revenue-icon"
              style="background: linear-gradient(135deg, #e94560, #c73652)"
            >
              💰
            </div>
            <div>
              <div class="revenue-value">
                {{ formatCurrency(totalRevenue) }}
              </div>
              <div class="revenue-label">Tổng doanh thu</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="revenue-stat-card" :body-style="{ padding: '20px' }">
          <div class="revenue-stat">
            <div
              class="revenue-icon"
              style="background: linear-gradient(135deg, #52c41a, #389e0d)"
            >
              📋
            </div>
            <div>
              <div class="revenue-value">{{ store.stats?.paidCount ?? 0 }}</div>
              <div class="revenue-label">Hóa đơn đã thanh toán</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card class="revenue-stat-card" :body-style="{ padding: '20px' }">
          <div class="revenue-stat">
            <div
              class="revenue-icon"
              style="background: linear-gradient(135deg, #faad14, #d48806)"
            >
              ⏳
            </div>
            <div>
              <div class="revenue-value">
                {{ store.stats?.unpaidCount ?? 0 }}
              </div>
              <div class="revenue-label">Chưa thanh toán</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Filters -->
    <a-card :body-style="{ padding: '16px' }" style="margin-bottom: 16px">
      <a-row :gutter="[12, 12]">
        <a-col :xs="24" :md="12">
          <a-input-search
            v-model:value="searchText"
            placeholder="Tìm tên khách hàng..."
            @search="onFilter"
            allow-clear
          />
        </a-col>
        <a-col :xs="24" :md="6">
          <a-select
            v-model:value="statusFilter"
            placeholder="Trạng thái"
            allow-clear
            style="width: 100%"
            @change="onFilter"
          >
            <a-select-option value="paid">Đã thanh toán</a-select-option>
            <a-select-option value="unpaid">Chưa thanh toán</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="6">
          <a-button @click="resetFilter" block
            ><ReloadOutlined /> Đặt lại</a-button
          >
        </a-col>
      </a-row>
    </a-card>

    <!-- Invoice Table -->
    <a-card :body-style="{ padding: 0 }">
      <a-table
        :columns="columns"
        :data-source="store.invoices"
        :loading="store.loading"
        :pagination="{
          current: page,
          pageSize,
          total: store.total,
          showTotal: (t) => `Tổng ${t} hóa đơn`,
        }"
        row-key="id"
        @change="onTableChange"
        :scroll="{ x: 800 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'id'">
            <span class="invoice-id">#{{ invoiceCode(record) }}</span>
          </template>
          <template v-if="column.key === 'customer'">
            <div class="cell-user">
              <a-avatar
                size="small"
                :style="{
                  background: '#e94560',
                  color: '#fff',
                  fontSize: '11px',
                }"
              >
                {{ getInitials(record.customerName) }}
              </a-avatar>
              <span class="cell-name">{{ record.customerName }}</span>
            </div>
          </template>
          <template v-if="column.key === 'services'">
            <div v-for="svc in record.services" :key="svc.name">
              <a-tag size="small">{{ svc.name }}</a-tag>
            </div>
          </template>
          <template v-if="column.key === 'total'">
            <div>
              <div v-if="record.discount" class="invoice-subtotal">
                {{ formatCurrency(record.subtotal) }}
              </div>
              <div class="invoice-total">
                {{ formatCurrency(record.total) }}
              </div>
              <div v-if="record.discount" class="invoice-discount">
                -{{ formatCurrency(record.discount) }}
              </div>
            </div>
          </template>
          <template v-if="column.key === 'payment'">
            <a-tag :color="record.paymentMethod === 'cash' ? 'green' : 'blue'">
              {{
                record.paymentMethod === "cash"
                  ? "💵 Tiền mặt"
                  : "💳 Chuyển khoản"
              }}
            </a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'paid' ? 'green' : 'orange'">
              {{ record.status === "paid" ? "✅ Đã thanh toán" : "⏳ Chưa TT" }}
            </a-tag>
          </template>
          <template v-if="column.key === 'paidAt'">
            <span class="text-muted">{{ formatDateTime(record.paidAt || record.createdAt) }}</span>
          </template>
          <template v-if="column.key === 'actions'">
            <a-button size="small" type="text" @click="viewInvoice(record)">
              <EyeOutlined />
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Create Invoice Modal -->
    <a-modal
      v-model:open="showCreateModal"
      title="Tạo hóa đơn mới"
      :footer="null"
      width="560px"
      destroy-on-close
    >
      <a-form
        :model="invoiceForm"
        layout="vertical"
        @finish="handleCreateInvoice"
        style="margin-top: 16px"
      >
        <a-form-item label="Khách hàng" name="customerName" required>
          <a-input
            v-model:value="invoiceForm.customerName"
            placeholder="Tên khách hàng"
          />
        </a-form-item>
        <a-form-item label="Nhân viên phục vụ" name="staffName">
          <a-input
            v-model:value="invoiceForm.staffName"
            placeholder="Tên thợ"
          />
        </a-form-item>
        <a-form-item label="Dịch vụ (nhập giá)">
          <a-row :gutter="8">
            <a-col :span="14">
              <a-input
                v-model:value="invoiceForm.serviceName"
                placeholder="Tên dịch vụ"
              />
            </a-col>
            <a-col :span="10">
              <a-input-number
                v-model:value="invoiceForm.servicePrice"
                :formatter="(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                :parser="(v) => v.replace(/\./g, '')"
                :min="0"
                style="width: 100%"
                placeholder="Giá"
              />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="Giảm giá (VNĐ)">
          <a-input-number
            v-model:value="invoiceForm.discount"
            :formatter="(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
            :parser="(v) => v.replace(/\./g, '')"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="Phương thức thanh toán" name="paymentMethod">
          <a-radio-group v-model:value="invoiceForm.paymentMethod">
            <a-radio value="cash">💵 Tiền mặt</a-radio>
            <a-radio value="transfer">💳 Chuyển khoản</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-divider />
        <div class="invoice-summary">
          <div class="isummary-row">
            <span>Tạm tính:</span>
            <span>{{ formatCurrency(invoiceForm.servicePrice) }}</span>
          </div>
          <div class="isummary-row" v-if="invoiceForm.discount">
            <span>Giảm giá:</span>
            <span class="text-success"
              >-{{ formatCurrency(invoiceForm.discount) }}</span
            >
          </div>
          <div class="isummary-row total">
            <span>Tổng cộng:</span>
            <span class="total-amount">{{
              formatCurrency(invoiceForm.servicePrice - invoiceForm.discount)
            }}</span>
          </div>
        </div>
        <div
          style="
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 16px;
          "
        >
          <a-button @click="showCreateModal = false">Hủy</a-button>
          <a-button type="primary" html-type="submit" :loading="store.loading"
            >Tạo hóa đơn</a-button
          >
        </div>
      </a-form>
    </a-modal>

    <!-- View Invoice Modal -->
    <a-modal
      v-model:open="viewModalVisible"
      :title="`Hóa đơn #${viewingInvoice ? invoiceCode(viewingInvoice) : ''}`"
      :footer="null"
      width="480px"
    >
      <div v-if="viewingInvoice" class="invoice-view">
        <div class="invoice-view-header">
          <div class="shop-logo">✂️</div>
          <h3>The Gentleman Barbershop</h3>
          <p class="text-muted">123 Nguyễn Huệ, Q1, TP.HCM</p>
        </div>
        <a-divider />
        <div class="invoice-detail-row">
          <span>Khách hàng:</span
          ><strong>{{ viewingInvoice.customerName }}</strong>
        </div>
        <div class="invoice-detail-row">
          <span>Nhân viên:</span><strong>{{ viewingInvoice.staffName }}</strong>
        </div>
        <div class="invoice-detail-row">
          <span>Ngày TT:</span
          ><strong>{{ formatDateTime(viewingInvoice.paidAt || viewingInvoice.createdAt) }}</strong>
        </div>
        <a-divider />
        <div
          v-for="svc in viewingInvoice.services"
          :key="svc.name"
          class="invoice-detail-row"
        >
          <span>{{ svc.name }}</span
          ><span>{{ formatCurrency(svc.price) }}</span>
        </div>
        <div
          v-if="viewingInvoice.discount"
          class="invoice-detail-row text-success"
        >
          <span>Giảm giá</span
          ><span>-{{ formatCurrency(viewingInvoice.discount) }}</span>
        </div>
        <a-divider />
        <div class="invoice-detail-row total">
          <strong>Tổng cộng</strong
          ><strong class="total-amount">{{
            formatCurrency(viewingInvoice.total)
          }}</strong>
        </div>
        <div class="invoice-detail-row">
          <span>Phương thức</span>
          <a-tag
            :color="viewingInvoice.paymentMethod === 'cash' ? 'green' : 'blue'"
          >
            {{
              viewingInvoice.paymentMethod === "cash"
                ? "💵 Tiền mặt"
                : "💳 Chuyển khoản"
            }}
          </a-tag>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useInvoiceStore } from '@/stores/invoice'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import { formatCurrency, formatDateTime, getInitials } from '@/utils/format'
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons-vue'

const store = useInvoiceStore()
const authStore = useAuthStore()
const page = ref(1)
const pageSize = ref(10)
const searchText = ref('')
const statusFilter = ref(null)
const showCreateModal = ref(false)
const viewModalVisible = ref(false)
const viewingInvoice = ref(null)

const invoiceForm = reactive({
  customerName: '',
  staffName: '',
  serviceName: '',
  servicePrice: 0,
  discount: 0,
  paymentMethod: 'cash',
})

const totalRevenue = computed(() => store.stats?.totalRevenue ?? 0)

/** Mã hiển thị: invoiceCode từ BE, nếu không có (mock) thì dùng id */
function invoiceCode(record) {
  return record.invoiceCode || String(record.id).padStart(4, '0')
}

const columns = [
  { title: 'Mã HĐ', key: 'id', width: 150 },
  { title: 'Khách hàng', key: 'customer' },
  { title: 'Dịch vụ', key: 'services' },
  { title: 'Nhân viên', dataIndex: 'staffName', key: 'staff' },
  { title: 'Tổng tiền', key: 'total', width: 130 },
  { title: 'Thanh toán', key: 'payment', width: 150 },
  { title: 'Trạng thái', key: 'status', width: 140 },
  { title: 'Thời gian', key: 'paidAt', width: 150 },
  { title: '', key: 'actions', width: 60 },
]

async function loadData() {
  await Promise.all([
    store.fetchAll({
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      page: page.value,
      pageSize: pageSize.value,
    }),
    authStore.isAdmin ? store.fetchStats() : null, // API thống kê chỉ dành cho admin
  ])
}

/** Đổi bộ lọc / tìm kiếm -> về trang 1 */
function onFilter() {
  page.value = 1
  loadData()
}

function onTableChange(pagination) {
  page.value = pagination.current
  pageSize.value = pagination.pageSize
  loadData()
}

function resetFilter() {
  searchText.value = ''
  statusFilter.value = null
  page.value = 1
  loadData()
}

function viewInvoice(record) {
  viewingInvoice.value = record
  viewModalVisible.value = true
}

async function handleCreateInvoice() {
  const customerName = (invoiceForm.customerName || '').trim()
  const serviceName = (invoiceForm.serviceName || '').trim()
  const price = Number(invoiceForm.servicePrice) || 0
  const discount = Number(invoiceForm.discount) || 0

  if (!customerName) return message.warning('Vui lòng nhập tên khách hàng')
  if (!serviceName) return message.warning('Vui lòng nhập tên dịch vụ')
  if (price <= 0) return message.warning('Vui lòng nhập giá dịch vụ')
  if (discount > price) return message.warning('Giảm giá không được lớn hơn tổng tiền')

  const payload = {
    customerName,
    staffName: (invoiceForm.staffName || '').trim(),
    services: [{ name: serviceName, price, quantity: 1 }],
    subtotal: price,
    discount,
    total: price - discount,
    paymentMethod: invoiceForm.paymentMethod,
    status: 'paid', // tạo xong là đã thanh toán (khách trả tại quầy)
  }

  try {
    await store.create(payload)
  } catch (_) {
    return // lỗi đã được http interceptor báo, giữ nguyên form để sửa
  }

  showCreateModal.value = false
  Object.assign(invoiceForm, { customerName: '', staffName: '', serviceName: '', servicePrice: 0, discount: 0, paymentMethod: 'cash' })
  page.value = 1
  await loadData() // tải lại danh sách + thống kê từ server
}

onMounted(() => loadData())
</script>

<style scoped>
.revenue-stat-card {
  border-radius: var(--border-radius-lg) !important;
}
.revenue-stat {
  display: flex;
  align-items: center;
  gap: 16px;
}
.revenue-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.revenue-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.revenue-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.invoice-id {
  font-weight: 700;
  color: var(--color-accent);
}
.cell-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cell-name {
  font-weight: 500;
}
.invoice-subtotal {
  font-size: 11px;
  text-decoration: line-through;
  color: var(--color-text-muted);
}
.invoice-total {
  font-weight: 700;
  color: var(--color-accent);
}
.invoice-discount {
  font-size: 11px;
  color: var(--color-success);
}

.invoice-summary {
  background: #fafafa;
  border-radius: var(--border-radius-md);
  padding: 16px;
}
.isummary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
.isummary-row.total {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 0;
}
.total-amount {
  color: var(--color-accent);
  font-size: 18px;
}

/* Invoice View Modal */
.invoice-view-header {
  text-align: center;
  margin-bottom: 4px;
}
.shop-logo {
  font-size: 36px;
  margin-bottom: 4px;
}
.invoice-view-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.invoice-detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}
.invoice-detail-row.total {
  font-size: 16px;
  font-weight: 700;
}
</style>
