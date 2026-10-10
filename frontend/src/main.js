import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import relativeTime from 'dayjs/plugin/relativeTime'
import isBetween from 'dayjs/plugin/isBetween'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import './style.css'

// ─── Day.js Setup ───────────────────────────────────────────────────────────
dayjs.extend(relativeTime)
dayjs.extend(isBetween)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.locale('vi')

// ─── App Initialization ─────────────────────────────────────────────────────
const app = createApp(App)

app.use(createPinia())
useAuthStore().initAuth() // khôi phục đăng nhập sau khi F5
app.use(router)
app.use(Antd)

app.mount('#app')