<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <div
        class="app-container"
        :class="{ 'high-contrast': configStore.settings.highContrastMode }"
      >
        <n-layout>
          <n-layout-header class="header">
            <div class="logo">转盘抽奖</div>
            <div class="header-actions">
              <n-space>
                <!-- 离线状态指示器 -->
                <n-badge
                  :dot="!isOnline"
                  :type="isOnline ? 'success' : 'error'"
                >
                  <n-tooltip :show="!isOnline" trigger="hover">
                    <template #trigger>
                      <n-icon size="20">
                        <signal-icon :class="{ offline: !isOnline }" />
                      </n-icon>
                    </template>
                    当前处于离线状态
                  </n-tooltip>
                </n-badge>

                <n-switch
                  v-model:value="isDarkTheme"
                  @update:value="toggleTheme"
                >
                  <template #checked>
                    <n-icon><MoonIcon /></n-icon>
                  </template>
                  <template #unchecked>
                    <n-icon><SunIcon /></n-icon>
                  </template>
                </n-switch>
              </n-space>
            </div>
          </n-layout-header>
          <n-layout has-sider class="main-content">
            <n-layout-sider
              collapse-mode="width"
              :collapsed-width="64"
              :width="260"
              :native-scrollbar="false"
              :collapsed="isMobile"
              class="config-sidebar"
              @update:collapsed="handleSidebarCollapse"
            >
              <config-panel />
            </n-layout-sider>
            <n-layout-content content-style="padding: 24px;">
              <div class="turntable-container">
                <turntable />
              </div>
              <result-display />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutSider,
  NSwitch,
  NIcon,
  NMessageProvider,
  NSpace,
  NBadge,
  NTooltip,
} from 'naive-ui'
import { darkTheme } from 'naive-ui'
import Turntable from './components/Turntable.vue'
import ConfigPanel from './components/ConfigPanel.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import { useConfigStore } from './store/config'

// 图标组件
const MoonIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7z',
    }),
  ])

const SunIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em' }, [
    h('circle', { cx: '12', cy: '12', r: '5', fill: 'currentColor' }),
    h('path', {
      fill: 'currentColor',
      d: 'M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
    }),
  ])

// 信号图标
const SignalIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
    }),
  ])

// 主题设置
const isDarkTheme = ref(localStorage.getItem('theme') === 'dark')
const theme = computed(() => (isDarkTheme.value ? darkTheme : null))

// 移动设备检测
const isMobile = ref(window.innerWidth < 768)
const isOnline = ref(navigator.onLine)

// 初始化配置
const configStore = useConfigStore()
configStore.loadConfig()

// 主题切换
function toggleTheme(value) {
  localStorage.setItem('theme', value ? 'dark' : 'light')
}

// 侧边栏折叠
function handleSidebarCollapse(collapsed) {
  // 在移动设备上添加滑动效果
  if (isMobile.value) {
    document.body.style.overflow = collapsed ? 'auto' : 'hidden'
  }
}

// 响应式处理
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

// 网络状态监听
const handleOnlineStatusChange = () => {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('online', handleOnlineStatusChange)
  window.addEventListener('offline', handleOnlineStatusChange)

  // 添加键盘快捷键支持
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('online', handleOnlineStatusChange)
  window.removeEventListener('offline', handleOnlineStatusChange)
  window.removeEventListener('keydown', handleKeydown)
})

// 键盘快捷键
function handleKeydown(e) {
  // Alt + H 显示帮助
  if (e.altKey && e.key === 'h') {
    document
      .querySelector('.config-panel button[aria-label="无障碍使用帮助"]')
      ?.click()
  }

  // Alt + S 切换主题
  if (e.altKey && e.key === 's') {
    toggleTheme(!isDarkTheme.value)
    isDarkTheme.value = !isDarkTheme.value
  }
}
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.app-container {
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.main-content {
  height: calc(100% - 64px);
}

.turntable-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.config-sidebar {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .config-sidebar {
    position: fixed;
    z-index: 100;
    height: 100%;
  }
}

/* 高对比度模式 */
.high-contrast {
  --high-contrast-bg: #ffffff;
  --high-contrast-text: #000000;
  --high-contrast-accent: #0000ff;
}

.high-contrast .header {
  background-color: var(--high-contrast-bg);
  color: var(--high-contrast-text);
  border-bottom: 2px solid var(--high-contrast-text);
}

.offline {
  color: #f44336;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
