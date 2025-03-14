<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面不存在</h2>
      <p class="error-message">您访问的页面可能已被移动、删除或暂时不可用。</p>
      <n-button type="primary" @click="router.push({ name: 'Home' })">
        返回首页
      </n-button>
    </div>
    <img
      src="@/assets/images/404-illustration.svg"
      class="illustration"
      alt="404 页面不存在"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

const router = useRouter()
</script>

<style lang="scss" scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: $bg-light;

  .dark-mode & {
    background-color: $dark-bg-base;
  }
}

.not-found-content {
  text-align: center;
  margin-right: 30px;

  @include mobile {
    margin-right: 0;
  }
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: $primary-color;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @include mobile {
    font-size: 4rem;
  }
}

.error-title {
  font-size: 2rem;
  margin: 16px 0;

  @include mobile {
    font-size: 1.5rem;
  }
}

.error-message {
  color: $text-secondary;
  margin-bottom: 24px;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.illustration {
  width: 30%;
  max-width: 400px;

  @include mobile {
    display: none;
  }
}
</style>
