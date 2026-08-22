<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  subtle: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <span class="expertise-tag" :class="{ 'expertise-tag--subtle': subtle }">{{ label }}</span>
</template>
