<template>
  <div class="sidebar-wrapper" :class="{ collapsed: !isExpanded }">
    <div
      class="sidebar-overlay"
      v-if="isExpanded && isMobile"
      @click="handleClose"
    ></div>

    <aside
      class="sidebar transition-all duration-300 ease-in-out"
      :class="{
        'w-60': isExpanded,
        'w-16': !isExpanded,
      }"
      :style="{
        width: isExpanded ? '240px' : '64px',
      }"
    >
      <n-menu
        :value="activeKey"
        :collapsed="!isExpanded"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :render-label="renderMenuLabel"
        :render-icon="renderMenuIcon"
        @update:value="handleMenuUpdate"
      />
    </aside>
  </div>
</template>

<script setup>
import { h, computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NMenu, NButton, NIcon } from 'naive-ui'
import {
  HomeOutline,
  SettingsOutline,
  TimeOutline,
  EyeOutline,
  CloseOutline,
  InformationCircleOutline,
} from '@vicons/ionicons5'
import { useUiStore } from '@/store/modules/ui'

// 组件属性
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

// 组件事件
const emit = defineEmits(['update:collapsed', 'close'])

// 获取路由和UI存储
const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()
const isMobile = ref(uiStore.isMobile)

// 计算侧边栏是否展开
const isExpanded = computed(() => !props.collapsed)

// 当前激活的菜单项
const activeKey = computed(() => route.name)

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 菜单选项
const menuOptions = [
  {
    label: '主页',
    key: 'Home',
    icon: renderIcon(HomeOutline),
  },
  {
    label: '配置转盘',
    key: 'Config',
    icon: renderIcon(SettingsOutline),
  },
  {
    label: '演示模式',
    key: 'Presentation',
    icon: renderIcon(EyeOutline),
  },
  {
    label: '历史记录',
    key: 'History',
    icon: renderIcon(TimeOutline),
  },
  {
    label: '关于',
    key: 'About',
    icon: renderIcon(InformationCircleOutline),
  },
]

// 渲染菜单图标
const renderMenuIcon = (option) => {
  return h(NIcon, null, {
    default: () => h(option.icon),
  })
}

// 渲染菜单标签
const renderMenuLabel = (option) => {
  return h('span', null, option.label)
}

// 处理菜单项更新
const handleMenuUpdate = (key) => {
  router.push({ name: key })

  if (uiStore.isMobile) {
    handleClose()
  }
}

// 处理关闭侧边栏
const handleClose = () => {
  emit('update:collapsed', true)
  emit('close')
}

// 监听设备变化
watch(
  () => uiStore.isMobile,
  (newValue) => {
    isMobile.value = newValue
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.sidebar-wrapper {
  position: relative;
  height: 100%;
  z-index: 100; /* 增加一个较高的z-index值 */

  @include mobile {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
  }

  &.collapsed {
    @include mobile {
      transform: translateX(-100%);
    }
  }
}

.sidebar-overlay {
  display: none;

  @include mobile {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}

.sidebar {
  height: 100%;
  background-color: $bg-base;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  padding-top: 12px; /* 添加顶部内边距，取代原来header的空间 */

  .dark-mode & {
    background-color: $dark-bg-light;
    border-right-color: $dark-border-color;
  }

  @include mobile {
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

    .dark-mode & {
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    }
  }
}

/* 移除 sidebar-header 相关样式 */

/* 保留其他样式 */
</style>
