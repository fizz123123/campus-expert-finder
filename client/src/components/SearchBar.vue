<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '搜尋教師姓名、研究專長或課程',
  },
  buttonLabel: {
    type: String,
    default: '搜尋教師',
  },
  large: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search'])
const query = ref(props.initialValue)

watch(
  () => props.initialValue,
  (value) => {
    query.value = value
  },
)

function submitSearch() {
  emit('search', query.value.trim())
}
</script>

<template>
  <form
    class="search-bar"
    :class="{ 'search-bar--large': large }"
    role="search"
    @submit.prevent="submitSearch"
  >
    <label class="sr-only" for="teacher-search">搜尋教師</label>
    <span class="search-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    </span>
    <input
      id="teacher-search"
      v-model="query"
      name="q"
      type="search"
      maxlength="100"
      autocomplete="off"
      :placeholder="placeholder"
    />
    <button class="button button--primary" type="submit">{{ buttonLabel }}</button>
  </form>
</template>
