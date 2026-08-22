<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ErrorState from '../components/ErrorState.vue'
import ExpertiseTag from '../components/ExpertiseTag.vue'
import LoadingState from '../components/LoadingState.vue'
import { ApiError, getTeacher } from '../services/api.js'

const route = useRoute()
const loading = ref(true)
const errorMessage = ref('')
const notFound = ref(false)
const teacher = ref(null)

async function loadTeacher() {
  loading.value = true
  errorMessage.value = ''
  notFound.value = false
  teacher.value = null

  try {
    const response = await getTeacher(route.params.id)
    teacher.value = response.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound.value = true
    else errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, loadTeacher, { immediate: true })
</script>

<template>
  <div class="page page--detail">
    <section class="page-hero page-hero--detail">
      <div class="container">
        <nav class="breadcrumbs" aria-label="麵包屑">
          <RouterLink to="/">首頁</RouterLink>
          <span aria-hidden="true">/</span>
          <RouterLink :to="{ name: 'teachers', query: route.query }">探索教師</RouterLink>
          <span aria-hidden="true">/</span>
          <span aria-current="page">教師資料</span>
        </nav>
      </div>
    </section>

    <section class="section detail-section">
      <div class="container">
        <LoadingState v-if="loading" label="正在載入教師詳細資料…" />
        <div v-else-if="notFound" class="state-panel state-panel--not-found">
          <span class="state-code">404</span>
          <h1>找不到這位教師</h1>
          <p>這筆教師資料可能不存在，或網址中的編號不正確。</p>
          <RouterLink class="button button--primary" :to="{ name: 'teachers', query: route.query }">
            返回教師列表
          </RouterLink>
        </div>
        <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadTeacher" />

        <template v-else-if="teacher">
          <RouterLink class="back-link" :to="{ name: 'teachers', query: route.query }">
            <span aria-hidden="true">←</span> 返回教師列表
          </RouterLink>

          <article class="profile-card">
            <div class="profile-header">
              <div
                class="teacher-avatar teacher-avatar--large"
                :style="{ '--avatar-color': teacher.avatarColor }"
                aria-hidden="true"
              >
                {{ teacher.name.slice(0, 1) }}
              </div>
              <div class="profile-identity">
                <p class="teacher-title">{{ teacher.title }}</p>
                <h1>{{ teacher.name }}</h1>
                <p class="teacher-department">{{ teacher.department }}</p>
              </div>
              <div class="profile-contact">
                <a :href="`mailto:${teacher.email}`">
                  <span aria-hidden="true">✉</span>
                  <span><small>模擬信箱</small>{{ teacher.email }}</span>
                </a>
                <p>
                  <span aria-hidden="true">⌖</span>
                  <span><small>研究室</small>{{ teacher.office }}</span>
                </p>
              </div>
            </div>

            <div class="profile-grid">
              <section class="profile-main">
                <div class="profile-section">
                  <p class="section-kicker">ABOUT</p>
                  <h2>教師簡介</h2>
                  <p class="profile-bio">{{ teacher.bio }}</p>
                </div>

                <div class="profile-section">
                  <p class="section-kicker">EXPERTISE</p>
                  <h2>研究專長</h2>
                  <div class="tag-list tag-list--large">
                    <ExpertiseTag v-for="item in teacher.expertise" :key="item" :label="item" />
                  </div>
                </div>
              </section>

              <aside class="courses-panel">
                <p class="section-kicker">COURSES</p>
                <h2>授課課程</h2>
                <ul>
                  <li v-for="(course, index) in teacher.courses" :key="course">
                    <span>{{ String(index + 1).padStart(2, '0') }}</span>
                    {{ course }}
                  </li>
                </ul>
              </aside>
            </div>

            <p class="profile-notice">
              <span aria-hidden="true">ⓘ</span>
              此頁為課程專題模擬資料，不代表任何真實教師或學校資訊。
            </p>
          </article>
        </template>
      </div>
    </section>
  </div>
</template>
