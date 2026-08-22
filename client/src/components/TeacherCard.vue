<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ExpertiseTag from './ExpertiseTag.vue'

const props = defineProps({
  teacher: {
    type: Object,
    required: true,
  },
  detailQuery: {
    type: Object,
    default: () => ({}),
  },
})

const visibleExpertise = computed(() => props.teacher.expertise.slice(0, 3))
const remainingExpertise = computed(() => Math.max(props.teacher.expertise.length - 3, 0))
const visibleCourses = computed(() => props.teacher.courses.slice(0, 2))
const teacherInitial = computed(() => props.teacher.name.slice(0, 1))
</script>

<template>
  <article class="teacher-card">
    <div class="teacher-card__header">
      <div
        class="teacher-avatar"
        :style="{ '--avatar-color': teacher.avatarColor }"
        aria-hidden="true"
      >
        {{ teacherInitial }}
      </div>
      <div>
        <p class="teacher-title">{{ teacher.title }}</p>
        <h3>{{ teacher.name }}</h3>
        <p class="teacher-department">{{ teacher.department }}</p>
      </div>
    </div>

    <div class="teacher-card__section">
      <p class="card-label">研究專長</p>
      <div class="tag-list">
        <ExpertiseTag v-for="item in visibleExpertise" :key="item" :label="item" />
        <ExpertiseTag v-if="remainingExpertise" :label="`+${remainingExpertise}`" subtle />
      </div>
    </div>

    <div class="teacher-card__section teacher-card__courses">
      <p class="card-label">授課課程</p>
      <ul>
        <li v-for="course in visibleCourses" :key="course">
          <span aria-hidden="true">▹</span>
          {{ course }}
        </li>
      </ul>
    </div>

    <RouterLink
      class="teacher-card__link"
      :to="{ name: 'teacher-detail', params: { id: teacher.id }, query: detailQuery }"
      :aria-label="`查看 ${teacher.name} 的教師資料`"
    >
      查看教師資料
      <span aria-hidden="true">→</span>
    </RouterLink>
  </article>
</template>
