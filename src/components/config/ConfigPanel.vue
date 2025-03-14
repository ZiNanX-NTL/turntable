<template>
  <div class="config-panel">
    <n-tabs type="line" animated v-model:value="activeTab">
      <n-tab-pane name="basic" tab="基本设置">
        <n-form
          label-placement="left"
          label-width="auto"
          :model="wheelConfig"
          class="config-form"
        >
          <n-form-item label="转盘半径">
            <n-slider
              v-model:value="wheelConfig.radius"
              :min="150"
              :max="300"
              :step="10"
              :tooltip="true"
              @update:value="updateWheelConfig('radius', $event)"
            />
          </n-form-item>

          <n-form-item label="文字大小">
            <n-slider
              v-model:value="wheelConfig.textSize"
              :min="10"
              :max="24"
              :step="1"
              :tooltip="true"
              @update:value="updateWheelConfig('textSize', $event)"
            />
          </n-form-item>

          <n-form-item label="文字位置">
            <n-slider
              v-model:value="wheelConfig.textDistance"
              :min="0.5"
              :max="0.9"
              :step="0.05"
              :tooltip="true"
              format-tooltip="v => `${Math.round(v * 100)}%`"
              @update:value="updateWheelConfig('textDistance', $event)"
            />
          </n-form-item>

          <n-form-item label="边框宽度">
            <n-slider
              v-model:value="wheelConfig.borderWidth"
              :min="0"
              :max="10"
              :step="1"
              :tooltip="true"
              @update:value="updateWheelConfig('borderWidth', $event)"
            />
          </n-form-item>

          <n-form-item label="边框颜色">
            <n-color-picker
              v-model:value="wheelConfig.borderColor"
              @update:value="updateWheelConfig('borderColor', $event)"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="animation" tab="动画设置">
        <n-form
          label-placement="left"
          label-width="auto"
          :model="wheelConfig"
          class="config-form"
        >
          <n-form-item label="旋转时间(ms)">
            <n-slider
              v-model:value="wheelConfig.spinDuration"
              :min="2000"
              :max="8000"
              :step="100"
              :tooltip="true"
              @update:value="updateWheelConfig('spinDuration', $event)"
            />
          </n-form-item>

          <n-form-item label="缓动效果">
            <n-select
              v-model:value="wheelConfig.easing"
              :options="easingOptions"
              @update:value="updateWheelConfig('easing', $event)"
            />
          </n-form-item>
        </n-form>

        <n-divider />

        <n-form
          label-placement="left"
          label-width="auto"
          :model="resultConfig"
          class="config-form"
        >
          <n-form-item label="结果动画">
            <n-select
              v-model:value="resultConfig.animation"
              :options="animationOptions"
              @update:value="updateResultConfig('animation', $event)"
            />
          </n-form-item>

          <n-form-item label="结果显示时间(ms)">
            <n-slider
              v-model:value="resultConfig.showDuration"
              :min="1000"
              :max="6000"
              :step="100"
              :tooltip="true"
              @update:value="updateResultConfig('showDuration', $event)"
            />
          </n-form-item>

          <n-form-item>
            <n-checkbox
              v-model:checked="resultConfig.autoClose"
              @update:checked="updateResultConfig('autoClose', $event)"
            >
              自动关闭结果
            </n-checkbox>
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="pointer" tab="指针设置">
        <n-form
          label-placement="left"
          label-width="auto"
          :model="pointerConfig"
          class="config-form"
        >
          <n-form-item label="指针样式">
            <n-select
              v-model:value="pointerConfig.style"
              :options="pointerStyleOptions"
              @update:value="updatePointerConfig('style', $event)"
            />
          </n-form-item>

          <n-form-item label="指针位置">
            <n-select
              v-model:value="pointerConfig.position"
              :options="pointerPositionOptions"
              @update:value="updatePointerConfig('position', $event)"
            />
          </n-form-item>

          <n-form-item label="指针大小">
            <n-slider
              v-model:value="pointerConfig.size"
              :min="20"
              :max="60"
              :step="2"
              :tooltip="true"
              @update:value="updatePointerConfig('size', $event)"
            />
          </n-form-item>

          <n-form-item label="指针颜色">
            <n-color-picker
              v-model:value="pointerConfig.color"
              @update:value="updatePointerConfig('color', $event)"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="sound" tab="声音设置">
        <n-form
          label-placement="left"
          label-width="auto"
          :model="soundConfig"
          class="config-form"
        >
          <n-form-item>
            <n-checkbox
              v-model:checked="soundConfig.enabled"
              @update:checked="updateSoundConfig('enabled', $event)"
            >
              启用音效
            </n-checkbox>
          </n-form-item>

          <n-form-item label="音量">
            <n-slider
              v-model:value="soundConfig.volume"
              :min="0"
              :max="1"
              :step="0.1"
              :tooltip="true"
              format-tooltip="v => `${Math.round(v * 100)}%`"
              :disabled="!soundConfig.enabled"
              @update:value="updateSoundConfig('volume', $event)"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- 新增背景设置标签页 -->
      <n-tab-pane name="background" tab="背景设置">
        <BackgroundConfig />
      </n-tab-pane>

      <n-tab-pane name="export" tab="导入/导出">
        <div class="export-section">
          <n-button @click="exportConfig" type="primary">
            <template #icon>
              <n-icon><CloudUploadOutline /></n-icon>
            </template>
            导出配置
          </n-button>

          <n-button @click="importInput = true">
            <template #icon>
              <n-icon><DownloadOutline /></n-icon>
            </template>
            导入配置
          </n-button>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 导入配置对话框 -->
    <n-modal
      v-model:show="importInput"
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
          <n-button @click="importInput = false">取消</n-button>
          <n-button type="primary" @click="importConfig">导入</n-button>
        </n-button-group>
      </template>
    </n-modal>

    <!-- 全局消息通知 -->
    <n-message-provider placement="top-right">
      <ConfigMessageReceiver ref="messageReceiverRef" />
    </n-message-provider>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, defineComponent, watch } from 'vue'
import {
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NSlider,
  NColorPicker,
  NSelect,
  NButton,
  NCheckbox,
  NDivider,
  NIcon,
  NModal,
  NInput,
  NButtonGroup,
  NMessageProvider,
  useMessage,
} from 'naive-ui'
import { DownloadOutline, CloudUploadOutline } from '@vicons/ionicons5'
import { useTurntableStore } from '@/store/modules/turntable'
import BackgroundConfig from './BackgroundConfig.vue' // 导入新组件

// 创建一个配置消息接收器组件
const ConfigMessageReceiver = defineComponent({
  setup() {
    window.$message = useMessage()
    return () => null
  },
})

// 获取转盘Store
const turntableStore = useTurntableStore()
const messageReceiverRef = ref(null)
const activeTab = ref('basic')

// 转盘配置
const wheelConfig = reactive({ ...turntableStore.wheelConfig })
// 指针配置
const pointerConfig = reactive({ ...turntableStore.pointerConfig })
// 结果配置
const resultConfig = reactive({ ...turntableStore.resultConfig })
// 声音配置
const soundConfig = reactive({ ...turntableStore.soundConfig })

// 导入配置相关
const importInput = ref(false)
const importConfigText = ref('')

// 更新轮盘配置 - 修复此函数
const updateWheelConfig = (key, value) => {
  console.log(`Updating wheel config: ${key} = ${value}`)
  wheelConfig[key] = value

  // 创建一个新对象发送给store，确保变更被检测到
  const updatedConfig = { ...wheelConfig }
  turntableStore.updateWheelConfig(updatedConfig)
}

// 更新指针配置
const updatePointerConfig = (key, value) => {
  pointerConfig[key] = value
  turntableStore.updatePointerConfig({ ...pointerConfig })
}

// 更新结果配置
const updateResultConfig = (key, value) => {
  resultConfig[key] = value
  turntableStore.updateResultConfig({ ...resultConfig })
}

// 更新声音配置
const updateSoundConfig = (key, value) => {
  soundConfig[key] = value
  turntableStore.updateSoundConfig({ ...soundConfig })
}

// 监听store中配置的变化
watch(
  () => turntableStore.wheelConfig,
  (newVal) => {
    Object.assign(wheelConfig, newVal)
  },
  { deep: true }
)

watch(
  () => turntableStore.pointerConfig,
  (newVal) => {
    Object.assign(pointerConfig, newVal)
  },
  { deep: true }
)

watch(
  () => turntableStore.resultConfig,
  (newVal) => {
    Object.assign(resultConfig, newVal)
  },
  { deep: true }
)

watch(
  () => turntableStore.soundConfig,
  (newVal) => {
    Object.assign(soundConfig, newVal)
  },
  { deep: true }
)

// 缓动效果选项
const easingOptions = [
  { label: '线性', value: 'none' },
  { label: '缓入', value: 'Power1.easeIn' },
  { label: '缓出', value: 'Power1.easeOut' },
  { label: '缓入缓出', value: 'Power1.easeInOut' },
  { label: '弹性缓出', value: 'Power2.easeOut' },
  { label: '弹跳缓出', value: 'Bounce.easeOut' },
  { label: '回弹', value: 'Back.easeOut' },
  { label: '弹性', value: 'Elastic.easeOut' },
]

// 动画效果选项
const animationOptions = [
  { label: '彩带', value: 'confetti' },
  { label: '烟花', value: 'fireworks' },
  { label: '星星', value: 'stars' },
]

// 指针样式选项
const pointerStyleOptions = [
  { label: '标准', value: 'standard' },
  { label: '箭头', value: 'arrow' },
  { label: '手指', value: 'hand' },
]

// 指针位置选项
const pointerPositionOptions = [
  { label: '上方', value: 'top' },
  { label: '右侧', value: 'right' },
  { label: '下方', value: 'bottom' },
  { label: '左侧', value: 'left' },
]

// 导出配置 - 更新以包含新字段
const exportConfig = () => {
  const config = {
    prizes: turntableStore.prizes,
    wheelConfig: turntableStore.wheelConfig,
    pointerConfig: turntableStore.pointerConfig,
    resultConfig: turntableStore.resultConfig,
    soundConfig: turntableStore.soundConfig,
    presentationConfig: turntableStore.presentationConfig, // 添加演示模式配置
    exportDate: new Date().toISOString(),
  }

  // 转为JSON字符串
  const configStr = JSON.stringify(config, null, 2)

  // 复制到剪贴板
  navigator.clipboard
    .writeText(configStr)
    .then(() => {
      window.$message.success('配置已复制到剪贴板')
    })
    .catch(() => {
      // 如果剪贴板API不可用，提供下载
      downloadAsJson(configStr, 'turntable-config.json')
      window.$message.success('配置已下载')
    })
}

// 导入配置
const importConfig = () => {
  try {
    const config = JSON.parse(importConfigText.value)
    turntableStore.importConfig(config)

    // 更新本地响应式对象
    Object.assign(wheelConfig, turntableStore.wheelConfig)
    Object.assign(pointerConfig, turntableStore.pointerConfig)
    Object.assign(resultConfig, turntableStore.resultConfig)
    Object.assign(soundConfig, turntableStore.soundConfig)

    window.$message.success('配置导入成功')
    importInput.value = false
    importConfigText.value = ''
  } catch (error) {
    window.$message.error('配置导入失败，请检查JSON格式是否正确')
    console.error('导入失败:', error)
  }
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
</script>

<style lang="scss" scoped>
.config-panel {
  width: 100%;
  height: 100%;
  min-height: 550px; /* 确保有足够高度 */
  display: flex;
  flex-direction: column;
}

.config-form {
  padding: 10px 0;
  height: 100%;
  overflow-y: auto; /* 允许内容滚动 */
}

.n-form-item {
  margin-bottom: 16px;
}

.export-section {
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

:deep(.n-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.n-tab-pane) {
  padding-top: 15px;
  height: 100%; /* 修改为100%以填充可用空间 */
  max-height: 470px; /* 添加最大高度，防止内容溢出 */
  overflow-y: auto; /* 确保标签内容可以滚动 */
}

:deep(.n-tabs-nav) {
  flex-shrink: 0; /* 确保标签头不会压缩 */
}

:deep(.n-tabs-content) {
  flex: 1;
  overflow: hidden;
  height: calc(100% - 40px); /* 减去tabs头部的高度 */
  display: flex; /* 添加flex布局 */
  flex-direction: column; /* 垂直排列 */
}

:deep(.n-tab-pane-wrapper) {
  flex: 1; /* 允许标签内容填充剩余空间 */
  height: 100%; /* 确保标签内容占满高度 */
}

:deep(.n-form-item-feedback-wrapper) {
  min-height: 8px;
}
</style>
