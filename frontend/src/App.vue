<template>
  <a-config-provider :locale="viVN" :theme="antTheme">
    <router-view />
  </a-config-provider>
</template>

<script setup>
import { reactive } from 'vue'
import viVN from 'ant-design-vue/es/locale/vi_VN'

// ─── Ant Design Theme Config ─────────────────────────────────────────────
const antTheme = reactive({
  token: {
    colorPrimary: '#e94560',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorBgContainer: '#ffffff',
    colorBorder: '#e8ecf0',
    colorTextBase: '#1a1a2e',
    boxShadow: '0 2px 12px rgba(26, 26, 46, 0.08)',
  },
  components: {
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'rgba(0,0,0,0.2)',
      darkItemSelectedBg: 'rgba(233, 69, 96, 0.15)',
    },
    Layout: {
      siderBg: '#1a1a2e',
      headerBg: '#ffffff',
    },
    Button: {
      primaryColor: '#ffffff',
    },
  },
})
</script>
