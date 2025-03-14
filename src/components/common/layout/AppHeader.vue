<template>
  <header class="app-header" :class="{ shadow: withShadow }">
    <div class="left-section">
      <n-button
        quaternary
        circle
        @click="toggleMenu"
        v-if="showMenuButton"
        class="menu-button hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <template #icon>
          <n-icon size="22">
            <MenuOutline />
          </n-icon>
        </template>
      </n-button>

      <router-link to="/" class="logo-link" v-if="showLogo">
        <div class="logo-container">
          <img
            src="@/assets/images/logo.png"
            alt="幸运转盘"
            class="logo-image"
          />
          <h1 class="logo-text">幸运转盘</h1>
        </div>
      </router-link>
    </div>

    <h1 v-if="title" class="page-title">{{ title }}</h1>

    <div class="right-section">
      <slot name="actions"></slot>

      <n-button quaternary circle @click="toggleDarkMode" class="theme-toggle">
        <template #icon>
          <n-icon size="22">
            <SunnyOutline v-if="uiStore.isDarkMode" />
            <MoonOutline v-else />
          </n-icon>
        </template>
      </n-button>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { MenuOutline, MoonOutline, SunnyOutline } from '@vicons/ionicons5'
import { useUiStore } from '@/store/modules/ui'

// 组件属性
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
  showMenuButton: {
    type: Boolean,
    default: true,
  },
  withShadow: {
    type: Boolean,
    default: true,
  },
})

// 组件事件
const emit = defineEmits(['toggle-menu'])

// 获取UI存储
const uiStore = useUiStore()

// 切换菜单
const toggleMenu = () => {
  uiStore.toggleSidebar()
  emit('toggle-menu')
}

// 切换深色模式
const toggleDarkMode = () => {
  uiStore.toggleDarkMode()
}
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  height: 64px;
  transition: all $transition-normal;
  z-index: 100;

  .dark-mode & {
    background-color: rgba(18, 18, 18, 0.8);
  }

  &.shadow {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

    .dark-mode & {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
  }

  @include mobile {
    padding: 10px 16px;
    height: 56px;
  }
}

.left-section,
.right-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-image {
  width: 32px;
  height: 32px;
  object-fit: contain;

  @include mobile {
    width: 28px;
    height: 28px;
  }
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: $primary-color;

  @include mobile {
    font-size: 1rem;
  }
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;

  @include mobile {
    font-size: 1.1rem;
    position: relative;
    left: auto;
    transform: none;
  }
}
</style>
