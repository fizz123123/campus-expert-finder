<script setup>
defineProps({
  title: {
    type: String,
    default: '資料暫時無法載入',
  },
  message: {
    type: String,
    default: '請確認伺服器狀態，或稍後再試一次。',
  },
  actionLabel: {
    type: String,
    default: '重新載入',
  },
})

defineEmits(['retry'])
</script>

<template>
  <div class="state-panel state-panel--error" role="alert">
    <span class="state-icon" aria-hidden="true">!</span>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button class="button button--secondary" type="button" @click="$emit('retry')">
      {{ actionLabel }}
    </button>
  </div>
</template>
