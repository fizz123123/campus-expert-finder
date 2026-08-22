<script setup>
defineProps({
  label: {
    type: String,
    default: '正在載入教師資料…',
  },
  cards: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div v-if="cards" class="skeleton-grid" role="status" :aria-label="label">
    <div v-for="number in 6" :key="number" class="skeleton-card" aria-hidden="true">
      <span class="skeleton skeleton--avatar"></span>
      <span class="skeleton skeleton--title"></span>
      <span class="skeleton skeleton--line"></span>
      <span class="skeleton skeleton--line-short"></span>
    </div>
    <span class="sr-only">{{ label }}</span>
  </div>
  <div v-else class="state-panel state-panel--loading" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <p>{{ label }}</p>
  </div>
</template>
