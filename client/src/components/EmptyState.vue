<script setup>
defineProps({
  title: {
    type: String,
    default: '找不到符合條件的教師',
  },
  message: {
    type: String,
    default: '試著縮短關鍵字，或清除部分篩選條件。',
  },
  actionLabel: {
    type: String,
    default: '清除全部條件',
  },
})

defineEmits(['action'])
</script>

<template>
  <div class="state-panel">
    <span class="state-icon" aria-hidden="true">⌕</span>
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button class="button button--secondary" type="button" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>
