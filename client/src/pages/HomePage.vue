<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'
import SearchBar from '../components/SearchBar.vue'
import TeacherCard from '../components/TeacherCard.vue'
import { getDepartments, getExpertiseOptions, getTeachers } from '../services/api.js'

const router = useRouter()
const loading = ref(true)
const errorMessage = ref('')
const teachers = ref([])
const departments = ref([])
const expertiseOptions = ref([])

const featuredTeachers = computed(() => teachers.value.slice(0, 3))
const popularExpertise = computed(() => expertiseOptions.value.slice(0, 8))

async function loadHomeContent() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [teacherResponse, departmentResponse, expertiseResponse] = await Promise.all([
      getTeachers(),
      getDepartments(),
      getExpertiseOptions(),
    ])
    teachers.value = teacherResponse.data
    departments.value = departmentResponse.data
    expertiseOptions.value = expertiseResponse.data
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

function goToSearch(query = '') {
  router.push({
    name: 'teachers',
    query: query ? { q: query } : {},
  })
}

onMounted(loadHomeContent)
</script>

<template>
  <div>
    <section class="hero-section">
      <div class="container hero-grid">
        <div class="hero-content">
          <p class="eyebrow"><span></span> 校園知識導航</p>
          <h1>從研究興趣出發，<br /><em>找到對的教師。</em></h1>
          <p class="hero-description">
            不必逐頁翻找系所網站。輸入一個關鍵字，就能探索教師專長、研究方向與授課課程。
          </p>
          <SearchBar large @search="goToSearch" />
          <p class="search-hint">可以試試：人工智慧、資料庫、資訊安全、教師姓名</p>
        </div>

        <div class="hero-visual" aria-label="平台資料摘要">
          <div class="visual-orbit visual-orbit--one"></div>
          <div class="visual-orbit visual-orbit--two"></div>
          <div class="visual-card visual-card--main">
            <span class="visual-card__icon" aria-hidden="true">⌕</span>
            <div>
              <small>快速探索</small>
              <strong>研究專長</strong>
            </div>
          </div>
          <div class="visual-card visual-card--stat visual-card--teachers">
            <strong>{{ teachers.length || '24' }}</strong>
            <span>位模擬教師</span>
          </div>
          <div class="visual-card visual-card--stat visual-card--departments">
            <strong>{{ departments.length || '4' }}</strong>
            <span>個系所領域</span>
          </div>
          <div class="visual-topic visual-topic--ai">AI</div>
          <div class="visual-topic visual-topic--data">DB</div>
          <div class="visual-topic visual-topic--ux">UX</div>
        </div>
      </div>
    </section>

    <section class="section section--topics">
      <div class="container">
        <div class="section-heading section-heading--inline">
          <div>
            <p class="eyebrow">熱門領域</p>
            <h2>從你感興趣的主題開始</h2>
          </div>
          <RouterLink class="text-link" to="/teachers">查看所有教師 <span>→</span></RouterLink>
        </div>

        <LoadingState v-if="loading" label="正在載入熱門研究領域…" />
        <div v-else-if="popularExpertise.length" class="topic-grid">
          <button
            v-for="(item, index) in popularExpertise"
            :key="item.name"
            class="topic-button"
            type="button"
            @click="goToSearch(item.name)"
          >
            <span class="topic-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ item.name }}</strong>
            <small>{{ item.teacherCount }} 位教師</small>
            <span class="topic-arrow" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </section>

    <section class="section section--steps">
      <div class="container">
        <div class="section-heading section-heading--center">
          <p class="eyebrow">使用方式</p>
          <h2>三個步驟，找到適合請益的教師</h2>
          <p>把零散的教師資訊，變成清楚而有方向的探索流程。</p>
        </div>
        <div class="steps-grid">
          <article>
            <span class="step-index">01</span>
            <div class="step-icon" aria-hidden="true">⌕</div>
            <h3>搜尋領域</h3>
            <p>輸入研究主題、教師姓名、系所或課程關鍵字。</p>
          </article>
          <article>
            <span class="step-index">02</span>
            <div class="step-icon" aria-hidden="true">≡</div>
            <h3>篩選比較</h3>
            <p>依系所與專長縮小範圍，快速比較搜尋結果。</p>
          </article>
          <article>
            <span class="step-index">03</span>
            <div class="step-icon" aria-hidden="true">◎</div>
            <h3>查看資料</h3>
            <p>了解教師簡介、研究專長、課程與聯絡資訊。</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--featured">
      <div class="container">
        <div class="section-heading section-heading--inline">
          <div>
            <p class="eyebrow">教師探索</p>
            <h2>認識不同領域的教師</h2>
          </div>
          <RouterLink class="button button--secondary" to="/teachers">探索全部教師</RouterLink>
        </div>

        <LoadingState v-if="loading" cards label="正在載入精選教師…" />
        <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadHomeContent" />
        <div v-else class="teacher-grid teacher-grid--featured">
          <TeacherCard v-for="teacher in featuredTeachers" :key="teacher.id" :teacher="teacher" />
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container cta-inner">
        <div>
          <p class="eyebrow eyebrow--light">開始探索</p>
          <h2>下一個專題方向，也許就從一次搜尋開始。</h2>
        </div>
        <button class="button button--light" type="button" @click="goToSearch()">
          尋找教師 <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  </div>
</template>
