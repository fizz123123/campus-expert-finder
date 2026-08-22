<script setup>
defineProps({
  departments: {
    type: Array,
    default: () => [],
  },
  expertiseOptions: {
    type: Array,
    default: () => [],
  },
  selectedDepartment: {
    type: String,
    default: '',
  },
  selectedExpertise: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:department', 'update:expertise'])
</script>

<template>
  <section class="filter-panel" aria-label="教師篩選條件">
    <div class="filter-heading">
      <span class="filter-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      </span>
      <strong>篩選條件</strong>
    </div>

    <div class="filter-fields">
      <label for="department-filter">
        <span>系所</span>
        <select
          id="department-filter"
          :value="selectedDepartment"
          @change="emit('update:department', $event.target.value)"
        >
          <option value="">全部系所</option>
          <option v-for="department in departments" :key="department.name" :value="department.name">
            {{ department.name }}（{{ department.teacherCount }}）
          </option>
        </select>
      </label>

      <label for="expertise-filter">
        <span>研究專長</span>
        <select
          id="expertise-filter"
          :value="selectedExpertise"
          @change="emit('update:expertise', $event.target.value)"
        >
          <option value="">全部專長</option>
          <option v-for="item in expertiseOptions" :key="item.name" :value="item.name">
            {{ item.name }}（{{ item.teacherCount }}）
          </option>
        </select>
      </label>
    </div>
  </section>
</template>
