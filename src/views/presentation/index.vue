<template>
  <div class="full-page-container presentation-page">
    <AppHeader
      title="演示模式"
      @toggle-menu="isSidebarCollapsed = !isSidebarCollapsed"
    >
      <template #actions>
        <n-button
          quaternary
          circle
          @click="toggleTurntableFullscreen()"
          :class="{ active: isFullscreen }"
        >
          <template #icon>
            <n-icon size="22"><ExpandOutline /></n-icon>
          </template>
        </n-button>
      </template>
    </AppHeader>

    <div class="content-container">
      <AppSidebar
        :collapsed="isSidebarCollapsed"
        @update:collapsed="isSidebarCollapsed = $event"
      />

      <div class="presentation-container">
        <div
          class="turntable-wrapper"
          ref="turntableWrapperRef"
          :style="turntableBackgroundStyle"
          :class="{ 'fullscreen-active': isFullscreen }"
        >
          <Turntable
            ref="turntableRef"
            :prizes="turntableStore.prizes"
            :config="{
              wheel: turntableStore.wheelConfig,
              pointer: turntableStore.pointerConfig,
              result: {
                ...turntableStore.resultConfig,
              },
              sound: turntableStore.soundConfig,
            }"
            @result="handleResult"
          />

          <!-- 添加全屏后的退出按钮 -->
          <n-button
            v-if="isFullscreen"
            quaternary
            circle
            class="exit-fullscreen-button"
            @click="toggleTurntableFullscreen"
          >
            <template #icon>
              <n-icon><ContractOutline /></n-icon>
            </template>
          </n-button>
        </div>

        <div class="prize-list-wrapper">
          <div class="prize-list-header">
            <h3 class="prize-list-title">奖项列表</h3>
            <n-button text @click="showSettingsDrawer = true">
              <template #icon>
                <n-icon><PencilOutline /></n-icon>
              </template>
              编辑奖项
            </n-button>
          </div>

          <n-scrollbar class="prize-list">
            <n-empty
              v-if="turntableStore.prizes.length === 0"
              description="没有设置奖项"
            >
              <template #extra>
                <n-button @click="showSettingsDrawer = true">添加奖项</n-button>
              </template>
            </n-empty>

            <div v-else class="prize-items">
              <div
                v-for="prize in turntableStore.prizes"
                :key="prize.id"
                class="prize-item"
              >
                <div
                  class="prize-color"
                  :style="{ backgroundColor: prize.color }"
                ></div>
                <div class="prize-info">
                  <h4 class="prize-name">{{ prize.name }}</h4>
                  <div class="prize-probability">
                    概率: {{ prize.probability }}%
                    <n-progress
                      type="line"
                      :percentage="prize.probability"
                      :color="prize.color"
                      :height="8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </n-scrollbar>
        </div>
      </div>

      <div v-if="lastResult" class="last-result-container">
        <h3 class="last-result-title">上次中奖</h3>
        <div class="last-result">
          <div
            class="last-result-icon"
            :style="{ backgroundColor: lastResult.color }"
          >
            <n-icon v-if="!lastResult.icon" size="24"><GiftOutline /></n-icon>
            <img v-else :src="lastResult.icon" alt="奖品图标" />
          </div>
          <div class="last-result-info">
            <p class="last-result-name">{{ lastResult.name }}</p>
            <p class="last-result-time">{{ formatTime(lastResultTime) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 奖项设置抽屉 -->
    <n-drawer v-model:show="showSettingsDrawer" :width="500" placement="right">
      <n-drawer-content title="奖项设置" closable>
        <PrizeEditor />
      </n-drawer-content>
    </n-drawer>

    <!-- 移除设置对话框 -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  NButton,
  NIcon,
  NScrollbar,
  NProgress,
  NEmpty,
  NDrawer,
  NDrawerContent,
  NTooltip,
} from 'naive-ui'
import {
  PencilOutline,
  GiftOutline,
  ExpandOutline,
  ContractOutline,
} from '@vicons/ionicons5'
import dayjs from 'dayjs'
import AppHeader from '@/components/common/layout/AppHeader.vue'
import AppSidebar from '@/components/common/layout/AppSidebar.vue'
import Turntable from '@/components/turntable/Turntable.vue'
import PrizeEditor from '@/components/config/PrizeEditor.vue'
import { useTurntableStore } from '@/store/modules/turntable'
import { useHistoryStore } from '@/store/modules/history'
import { useUiStore } from '@/store/modules/ui'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useFullscreen } from '@/hooks/useFullscreen'

// 获取Store
const turntableStore = useTurntableStore()
const historyStore = useHistoryStore()
const uiStore = useUiStore()

// 组件引用
const turntableRef = ref(null)
const turntableWrapperRef = ref(null)

// 全屏控制 - 使用增强的全屏钩子
const { toggleFullscreen, isFullscreen } = useFullscreen(turntableWrapperRef)

// 全屏转盘功能
const toggleTurntableFullscreen = () => {
  console.log('转盘容器元素:', turntableWrapperRef.value)
  toggleFullscreen()
}

// 组件状态
const isSidebarCollapsed = ref(uiStore.isMobile)
const showSettingsDrawer = ref(false)
const lastResult = ref(null)
const lastResultTime = ref(null)

// 转盘背景样式
const turntableBackgroundStyle = computed(() => {
  const bgConfig = turntableStore.presentationConfig?.background || {}

  if (bgConfig.imageUrl) {
    return {
      backgroundImage: `url(${bgConfig.imageUrl})`,
      backgroundSize: bgConfig.backgroundSize || 'cover',
      backgroundPosition: bgConfig.backgroundPosition || 'center',
      backgroundRepeat: 'no-repeat',
    }
  }

  return {}
})

// 处理抽奖结果
const handleResult = (result) => {
  // 添加历史记录
  const record = historyStore.addRecord(result)

  // 更新上次结果
  lastResult.value = result
  lastResultTime.value = record.timestamp
}

// 开始抽奖
const startSpin = () => {
  if (turntableRef.value) {
    turntableRef.value.startSpin()
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return dayjs(timestamp).format('HH:mm:ss')
}

// 切换暗色模式
const toggleDarkMode = () => {
  uiStore.toggleDarkMode()
}

// 键盘快捷键 - 修改全屏快捷键功能
useKeyboardShortcuts({
  onSpacebar: startSpin,
  onFullscreen: toggleTurntableFullscreen,
  onDarkMode: toggleDarkMode,
})

// 监测设备设置
onMounted(() => {
  uiStore.detectDeviceSettings()

  // 如果有历史记录，显示最近一条
  if (historyStore.recentRecords.length > 0) {
    const recent = historyStore.recentRecords[0]
    lastResult.value = recent.prize
    lastResultTime.value = recent.timestamp
  }
})
</script>

<style lang="scss" scoped>
.presentation-page {
  background-color: $bg-light;

  .dark-mode & {
    background-color: $dark-bg-base;
  }
}

.content-container {
  display: flex;
}

.presentation-container {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  padding: 20px;
  overflow-y: auto;

  @include desktop {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
}

.turntable-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  background-color: $bg-base;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible; // 修改为visible，允许转盘内容溢出
  min-height: 350px; // 确保最小高度

  /* 确保转盘组件居中 */
  & > * {
    margin: 0 auto;
  }

  &.fullscreen-active {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999;
    padding: 60px; // 增加内边距以容纳更大的转盘
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 0;
    overflow: visible; // 在全屏模式下也确保内容不被裁剪

    .dark-mode & {
      background-color: rgba(30, 30, 30, 0.95);
    }

    /* 确保全屏模式下转盘居中 */
    & > .turntable-container {
      margin: 0 auto;
      max-width: 100%;
      max-height: 100%;
    }
  }

  .dark-mode & {
    background-color: $dark-bg-light;
  }

  @include mobile {
    padding: 10px;
  }

  .exit-fullscreen-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background-color: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(4px);
    z-index: 100;

    &:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }

    .dark-mode & {
      background-color: rgba(0, 0, 0, 0.3);

      &:hover {
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }
}

.prize-list-wrapper {
  display: flex;
  flex-direction: column;
  background-color: $bg-base;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  height: 100%;

  .dark-mode & {
    background-color: $dark-bg-light;
  }
}

.prize-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border-color;

  .dark-mode & {
    border-bottom-color: $dark-border-color;
  }
}

.prize-list-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.prize-list {
  padding: 10px;
  flex: 1;
  overflow: auto;
}

.prize-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prize-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: $border-radius-md;
  background: $bg-light;
  transition: transform $transition-fast;

  &:hover {
    transform: translateX(5px);
  }

  .dark-mode & {
    background: $dark-bg-dark;
  }
}

.prize-color {
  width: 36px;
  height: 36px;
  border-radius: $border-radius-circle;
  margin-right: 12px;
  flex-shrink: 0;
}

.prize-info {
  flex: 1;
  min-width: 0;
}

.prize-name {
  margin: 0 0 5px;
  font-size: 1rem;
  font-weight: 500;
  @include text-truncate;
}

.prize-probability {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.last-result-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: $bg-base;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  padding: 16px;
  width: 220px;

  .dark-mode & {
    background-color: $dark-bg-light;
  }

  @include mobile {
    display: none;
  }
}

.last-result-title {
  margin: 0 0 10px;
  font-size: 1rem;
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.last-result {
  display: flex;
  align-items: center;
}

.last-result-icon {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;

  img {
    max-width: 60%;
    max-height: 60%;
  }
}

.last-result-info {
  flex: 1;
}

.last-result-name {
  margin: 0;
  font-weight: 500;
  @include text-truncate;
}

.last-result-time {
  margin: 5px 0 0;
  font-size: 0.8rem;
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}
</style>
