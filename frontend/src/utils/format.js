import dayjs from 'dayjs'

/**
 * Format currency to Vietnamese Dong
 * @param {number} amount
 * @returns {string} e.g. "150.000 ₫"
 */
export function formatCurrency(amount) {
  if (amount == null) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format number with thousand separators
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num == null) return '0'
  return new Intl.NumberFormat('vi-VN').format(num)
}

/**
 * Format date to Vietnamese format
 * @param {string|Date} date
 * @param {string} format
 * @returns {string}
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '—'
  return dayjs(date).format(format)
}

/**
 * Format datetime
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '—'
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

/**
 * Format time only
 * @param {string|Date} date
 * @returns {string}
 */
export function formatTime(date) {
  if (!date) return '—'
  return dayjs(date).format('HH:mm')
}

/**
 * Format relative time (e.g. "2 giờ trước")
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '—'
  return dayjs(date).fromNow()
}

/**
 * Format duration in minutes to human readable
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!minutes) return '0 phút'
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`
}

/**
 * Get initials from full name (for avatar)
 * @param {string} name
 * @returns {string} e.g. "Nguyen Van A" → "NA"
 */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

/**
 * Generate a random ID (for mock data)
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Deep clone an object
 * @param {any} obj
 * @returns {any}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Get appointment status info
 * @param {string} status
 * @returns {{ label: string, color: string }}
 */
export function getAppointmentStatus(status) {
  const map = {
    pending:    { label: 'Chờ xác nhận', color: 'orange' },
    confirmed:  { label: 'Đã xác nhận',  color: 'blue'   },
    inprogress: { label: 'Đang thực hiện', color: 'purple' },
    completed:  { label: 'Hoàn thành',   color: 'green'  },
    cancelled:  { label: 'Đã hủy',       color: 'red'    },
  }
  return map[status] || { label: status, color: 'default' }
}

/**
 * Get invoice status info
 * @param {string} status
 * @returns {{ label: string, color: string }}
 */
export function getInvoiceStatus(status) {
  const map = {
    unpaid: { label: 'Chưa thanh toán', color: 'orange' },
    paid:   { label: 'Đã thanh toán',   color: 'green'  },
    refund: { label: 'Hoàn tiền',       color: 'red'    },
  }
  return map[status] || { label: status, color: 'default' }
}

/**
 * Get gender label
 * @param {string} gender
 * @returns {string}
 */
export function getGenderLabel(gender) {
  const map = { male: 'Nam', female: 'Nữ', other: 'Khác' }
  return map[gender] || gender
}
