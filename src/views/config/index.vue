<template>
  <div class="full-page-container config-page">
    <!-- 移除装饰背景 -->

    <AppHeader title="配置转盘" @toggle-menu="handleToggleMenu" />

    <div class="content-container">
      <AppSidebar
        :collapsed="isSidebarCollapsed"
        @update:collapsed="uiStore.setSidebarCollapsed($event)"
      />

      <div class="config-container">
        <div class="config-section">
          <div class="config-preview">
            <Turntable
              :key="configUpdateKey"
              :prizes="turntableStore.prizes"
              :config="{
                wheel: turntableStore.wheelConfig,
                pointer: turntableStore.pointerConfig,
                result: turntableStore.resultConfig,
                sound: turntableStore.soundConfig,
              }"
            />
          </div>

          <div class="config-panel">
            <n-tabs type="segment" size="large" animated>
              <n-tab-pane name="prizes" tab="奖项设置">
                <div class="tab-content">
                  <PrizeEditor />
                </div>
              </n-tab-pane>
              <n-tab-pane name="appearance" tab="外观设置">
                <div class="tab-content">
                  <ConfigPanel />
                </div>
              </n-tab-pane>
            </n-tabs>
          </div>
        </div>

        <n-card title="快速操作" class="quick-actions">
          <div class="actions-container">
            <n-button
              @click="router.push({ name: 'Presentation' })"
              type="primary"
              size="large"
            >
              <template #icon>
                <n-icon><PlayOutline /></n-icon>
              </template>
              开始抽奖
            </n-button>

            <n-button @click="exportConfig" size="large">
              <template #icon>
                <n-icon><CloudUploadOutline /></n-icon>
              </template>
              导出配置
            </n-button>

            <n-button @click="showImportModal = true" size="large">
              <template #icon>
                <n-icon><DownloadOutline /></n-icon>
              </template>
              导入配置
            </n-button>

            <n-button @click="resetToDefault" type="error" ghost size="large">
              <template #icon>
                <n-icon><RefreshOutline /></n-icon>
              </template>
              恢复默认
            </n-button>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 导入配置对话框 -->
    <n-modal
      v-model:show="showImportModal"
      preset="dialog"
      title="导入配置"
      :show-icon="false"
      style="width: 90%; max-width: 500px"
    >
      <template #default>
        <n-input
          v-model:value="importConfigText"
          type="textarea"
          placeholder="粘贴配置JSON数据"
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </template>
      <template #action>
        <n-button-group>
          <n-button @click="showImportModal = false">取消</n-button>
          <n-button type="primary" @click="importConfig">导入</n-button>
        </n-button-group>
      </template>
    </n-modal>

    <!-- 确认重置对话框 -->
    <n-modal
      v-model:show="showResetConfirm"
      preset="dialog"
      type="warning"
      title="确认重置"
      content="确定要恢复默认设置吗？所有自定义配置都将丢失。"
      positive-text="确认重置"
      negative-text="取消"
      @positive-click="doReset"
      style="width: 90%; max-width: 400px"
    />

    <n-message-provider placement="top-right">
      <span ref="messageProviderRef" style="display: none"></span>
    </n-message-provider>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NTabs,
  NTabPane,
  NButton,
  NIcon,
  NButtonGroup,
  NModal,
  NInput,
  NMessageProvider,
  useMessage,
} from 'naive-ui'
import {
  PlayOutline,
  DownloadOutline,
  RefreshOutline,
  CloudUploadOutline,
} from '@vicons/ionicons5'
import AppHeader from '@/components/common/layout/AppHeader.vue'
import AppSidebar from '@/components/common/layout/AppSidebar.vue'
import Turntable from '@/components/turntable/Turntable.vue'
import PrizeEditor from '@/components/config/PrizeEditor.vue'
import ConfigPanel from '@/components/config/ConfigPanel.vue'
import { useTurntableStore } from '@/store/modules/turntable'
import { useUiStore } from '@/store/modules/ui'

// 路由
const router = useRouter()

// Store
const turntableStore = useTurntableStore()
const uiStore = useUiStore()

// 消息
const messageProviderRef = ref(null)
const message = useMessage()

// 状态
const isSidebarCollapsed = ref(uiStore.isMobile)
const showImportModal = ref(false)
const showResetConfirm = ref(false)
const importConfigText = ref('')
const configUpdateKey = ref(0) // 添加用于强制更新转盘组件的key

// 导出配置
const exportConfig = () => {
  const config = {
    prizes: turntableStore.prizes,
    wheelConfig: turntableStore.wheelConfig,
    pointerConfig: turntableStore.pointerConfig,
    resultConfig: turntableStore.resultConfig,
    soundConfig: turntableStore.soundConfig,
    presentationConfig: turntableStore.presentationConfig, // 确保添加演示模式配置（包括背景）
    exportDate: new Date().toISOString(),
  }

  // 转为JSON字符串
  const configStr = JSON.stringify(config, null, 2)

  // 复制到剪贴板
  navigator.clipboard
    .writeText(configStr)
    .then(() => {
      message.success('配置已复制到剪贴板')
    })
    .catch(() => {
      // 如果剪贴板API不可用，提供下载
      downloadAsJson(configStr, 'turntable-config.json')
    })
}

// 导入配置
const importConfig = () => {
  try {
    const config = JSON.parse(importConfigText.value)
    // 确保所有配置都被导入，包括演示模式配置（背景图片）
    turntableStore.importConfig(config)

    message.success('配置导入成功')
    showImportModal.value = false
    importConfigText.value = ''
  } catch (error) {
    message.error('配置导入失败，请检查JSON格式是否正确')
  }
}

// 重置确认
const resetToDefault = () => {
  showResetConfirm.value = true
}

// 执行重置
const doReset = () => {
  turntableStore.$reset()
  message.success('已恢复默认设置')
}

// 下载为JSON文件
const downloadAsJson = (content, filename) => {
  const blob = new Blob([content], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

// 监听配置变化，强制更新转盘
watch(
  () => [
    turntableStore.wheelConfig,
    turntableStore.pointerConfig,
    turntableStore.resultConfig,
    turntableStore.soundConfig,
    turntableStore.prizes,
  ],
  () => {
    // 增加key值触发组件重新渲染
    configUpdateKey.value++
    console.log('配置已更新，重新渲染转盘')
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  uiStore.detectDeviceSettings()
})

// 处理菜单折叠
const handleToggleMenu = () => {
  uiStore.toggleSidebar()
}
</script>

<style lang="scss" scoped>
.config-page {
  background-color: $bg-light;

  .dark-mode & {
    background-color: $dark-bg-base;
  }
}

.config-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;

  @include desktop {
    grid-template-columns: minmax(0, 1fr) 1.5fr;
  }
}

.config-preview {
  background-color: $bg-base;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  padding: 20px;
  display: flex;
  justify-content: center;

  .dark-mode & {
    background-color: $dark-bg-light;
  }
}

.config-panel {
  background-color: $bg-base;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  padding: 20px;
  display: flex;
  flex-direction: column;

  .dark-mode & {
    background-color: $dark-bg-light;
  }
}

.tab-content {
  padding: 0; /* 移除顶部内边距，让标签页内容能更好地填充空间 */
  overflow: hidden; /* 改为hidden，让内部组件自己处理滚动 */

  @include mobile {
    height: auto;
    max-height: 550px;
  }
}

.quick-actions {
  margin-top: auto;
}

.actions-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
