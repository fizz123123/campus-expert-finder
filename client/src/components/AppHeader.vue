<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="site-header">
    <div class="container header-inner">
      <RouterLink class="brand" to="/" aria-label="Campus Expert Finder 首頁">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m3 9 9-5 9 5-9 5-9-5Z" />
            <path d="M7 12v5c3 2.3 7 2.3 10 0v-5" />
          </svg>
        </span>
        <span>
          <strong>Campus Expert Finder</strong>
          <small>校園教師專長搜尋平台</small>
        </span>
      </RouterLink>

      <nav class="main-nav" aria-label="主要導覽">
        <RouterLink to="/">首頁</RouterLink>
        <RouterLink to="/teachers">探索教師</RouterLink>
      </nav>
    </div>
  </header>
</template>
