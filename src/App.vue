<template>
  <div :class="{ 'dark-mode': uiStore.isDarkMode }">
    <NMessageProvider>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </NMessageProvider>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import {
  NConfigProvider,
  NNotificationProvider,
  NMessageProvider,
  darkTheme,
  zhCN,
  dateZhCN,
} from 'naive-ui'
import { useUiStore } from '@/store/modules/ui'

const uiStore = useUiStore()
const theme = computed(() => (uiStore.isDarkMode ? darkTheme : null))

// 监听深色模式设置
watch(
  () => uiStore.isDarkMode,
  (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  },
  { immediate: true }
)

// 监听系统颜色方案变化
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  // 初始检测系统颜色方案
  if (mediaQuery.matches && !localStorage.getItem('turntable-ui-settings')) {
    uiStore.toggleDarkMode()
  }

  // 监听系统颜色方案变化
  const handleChange = (e) => {
    if (!localStorage.getItem('turntable-ui-settings')) {
      uiStore.setDarkMode(e.matches)
    }
  }

  mediaQuery.addEventListener('change', handleChange)
})
</script>

<style lang="scss">
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Noto Sans SC', sans-serif;
}
</style>
