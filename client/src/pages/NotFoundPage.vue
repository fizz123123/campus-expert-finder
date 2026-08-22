<template>
  <section class="section not-found-page">
    <div class="container">
      <div class="state-panel state-panel--not-found">
        <span class="state-code">404</span>
        <p class="eyebrow">Page not found</p>
        <h1>這個頁面不存在</h1>
        <p>網址可能輸入錯誤，或頁面已經移動到其他位置。</p>
        <div class="state-actions">
          <RouterLink class="button button--primary" to="/">返回首頁</RouterLink>
          <RouterLink class="button button--secondary" to="/teachers">探索教師</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
