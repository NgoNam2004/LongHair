<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="not-found-icon">✂️</div>
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">Trang không tìm thấy</h2>
      <p class="not-found-desc">Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.</p>
      <a-button type="primary" size="large" @click="$router.push('/dashboard')">
        ← Về trang chủ
      </a-button>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.not-found-icon { font-size: 64px; margin-bottom: 16px; }

.not-found-code {
  font-size: 96px;
  font-weight: 900;
  color: var(--color-accent);
  line-height: 1;
  margin: 0 0 8px;
}

.not-found-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-text-primary);
}

.not-found-desc {
  color: var(--color-text-muted);
  margin-bottom: 28px;
}
</style>
