<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import FilterPanel from '../components/FilterPanel.vue'
import LoadingState from '../components/LoadingState.vue'
import SearchBar from '../components/SearchBar.vue'
import TeacherCard from '../components/TeacherCard.vue'
import { getDepartments, getExpertiseOptions, getTeachers } from '../services/api.js'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const errorMessage = ref('')
const teachers = ref([])
const departments = ref([])
const expertiseOptions = ref([])
let requestSequence = 0

function queryValue(name) {
  const value = route.query[name]
  return typeof value === 'string' ? value.trim() : ''
}

const filters = computed(() => ({
  q: queryValue('q'),
  department: queryValue('department'),
  expertise: queryValue('expertise'),
}))

const activeFilters = computed(() => {
  const items = []
  if (filters.value.q) items.push({ name: 'q', label: `關鍵字：${filters.value.q}` })
  if (filters.value.department) {
    items.push({ name: 'department', label: filters.value.department })
  }
  if (filters.value.expertise) {
    items.push({ name: 'expertise', label: filters.value.expertise })
  }
  return items
})

async function loadPage() {
  const currentRequest = ++requestSequence
  loading.value = true
  errorMessage.value = ''
  teachers.value = []

  try {
    const [teacherResponse, departmentResponse, expertiseResponse] = await Promise.all([
      getTeachers(filters.value),
      getDepartments(),
      getExpertiseOptions(),
    ])

    if (currentRequest !== requestSequence) return
    teachers.value = teacherResponse.data
    departments.value = departmentResponse.data
    expertiseOptions.value = expertiseResponse.data
  } catch (error) {
    if (currentRequest !== requestSequence) return
    errorMessage.value = error.message
  } finally {
    if (currentRequest === requestSequence) loading.value = false
  }
}

function updateQuery(name, value) {
  const nextQuery = { ...route.query }

  if (value) nextQuery[name] = value
  else delete nextQuery[name]

  router.push({ name: 'teachers', query: nextQuery })
}

function clearFilters() {
  router.push({ name: 'teachers' })
}

watch(
  () => route.fullPath,
  () => loadPage(),
  { immediate: true },
)

onBeforeUnmount(() => {
  requestSequence += 1
})
</script>

<template>
  <div class="page page--teachers">
    <section class="page-hero page-hero--compact">
      <div class="container">
        <nav class="breadcrumbs" aria-label="麵包屑">
          <RouterLink to="/">首頁</RouterLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">探索教師</span>
        </nav>
        <div class="page-title-row">
          <div>
            <p class="eyebrow">教師探索</p>
            <h1>找到與你研究興趣相符的教師</h1>
            <p>搜尋教師姓名、研究專長、系所或授課課程。</p>
          </div>
          <div class="result-badge" aria-live="polite">
            <strong>{{ loading ? '—' : teachers.length }}</strong>
            <span>筆搜尋結果</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--results">
      <div class="container">
        <SearchBar
          :initial-value="filters.q"
          placeholder="例如：人工智慧、林映辰、資料庫系統"
          @search="updateQuery('q', $event)"
        />

        <FilterPanel
          :departments="departments"
          :expertise-options="expertiseOptions"
          :selected-department="filters.department"
          :selected-expertise="filters.expertise"
          @update:department="updateQuery('department', $event)"
          @update:expertise="updateQuery('expertise', $event)"
        />

        <div v-if="activeFilters.length" class="active-filters" aria-label="目前篩選條件">
          <span>目前條件</span>
          <button
            v-for="item in activeFilters"
            :key="item.name"
            class="filter-chip"
            type="button"
            :aria-label="`移除${item.label}`"
            @click="updateQuery(item.name, '')"
          >
            {{ item.label }} <span aria-hidden="true">×</span>
          </button>
          <button class="clear-button" type="button" @click="clearFilters">清除全部</button>
        </div>

        <div class="results-heading">
          <div>
            <h2>{{ activeFilters.length ? '符合條件的教師' : '全部教師' }}</h2>
            <p v-if="!loading && !errorMessage">共找到 {{ teachers.length }} 位教師</p>
          </div>
        </div>

        <LoadingState v-if="loading" cards />
        <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadPage" />
        <EmptyState v-else-if="teachers.length === 0" @action="clearFilters" />
        <div v-else class="teacher-grid">
          <TeacherCard
            v-for="teacher in teachers"
            :key="teacher.id"
            :teacher="teacher"
            :detail-query="filters"
          />
        </div>
      </div>
    </section>
  </div>
</template>
