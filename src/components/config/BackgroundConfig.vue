<template>
  <div class="background-config">
    <h3 class="config-title">演示背景设置</h3>

    <n-form
      label-placement="left"
      label-width="auto"
      :model="backgroundConfig"
      class="config-form"
    >
      <n-form-item label="背景图片 URL">
        <div class="image-input-container">
          <n-input
            v-model:value="backgroundConfig.imageUrl"
            placeholder="输入图片URL或选择上传"
            clearable
            @update:value="updateBackground('imageUrl', $event)"
          />

          <n-upload
            :custom-request="handleCustomUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <n-button size="small">
              <template #icon>
                <n-icon><ImageOutline /></n-icon>
              </template>
              选择图片
            </n-button>
          </n-upload>
        </div>
      </n-form-item>

      <n-form-item label="背景大小">
        <n-select
          v-model:value="backgroundConfig.backgroundSize"
          :options="bgSizeOptions"
          @update:value="updateBackground('backgroundSize', $event)"
        />
      </n-form-item>

      <n-form-item label="背景位置">
        <n-select
          v-model:value="backgroundConfig.backgroundPosition"
          :options="bgPositionOptions"
          @update:value="updateBackground('backgroundPosition', $event)"
        />
      </n-form-item>

      <n-form-item>
        <n-space>
          <n-button
            type="primary"
            @click="previewBackground"
            :disabled="!backgroundConfig.imageUrl"
          >
            预览背景
          </n-button>
          <n-button
            @click="clearBackground"
            :disabled="!backgroundConfig.imageUrl"
          >
            清除背景
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>

    <div
      class="background-preview"
      v-if="showPreview && backgroundConfig.imageUrl"
    >
      <div
        class="preview-image"
        :style="{
          backgroundImage: `url(${backgroundConfig.imageUrl})`,
          backgroundSize: backgroundConfig.backgroundSize,
          backgroundPosition: backgroundConfig.backgroundPosition,
        }"
      ></div>
      <div class="preview-overlay">
        <div class="preview-wheel"></div>
      </div>
    </div>

    <n-alert
      v-if="backgroundConfig.imageUrl"
      type="info"
      :show-icon="true"
      style="margin-top: 10px"
    >
      <template #header>图片已设置</template>
      背景图片将在演示模式中显示。请确保图片URL有效且可公开访问。
    </n-alert>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NUpload,
  NButton,
  NSpace,
  NIcon,
  NAlert,
} from 'naive-ui'
import { ImageOutline } from '@vicons/ionicons5'
import { useTurntableStore } from '@/store/modules/turntable'

// 获取转盘Store
const turntableStore = useTurntableStore()

// 背景配置
const backgroundConfig = reactive({
  imageUrl: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
})

// 预览控制
const showPreview = ref(false)

// 背景大小选项
const bgSizeOptions = [
  { label: '覆盖(cover)', value: 'cover' },
  { label: '包含(contain)', value: 'contain' },
  { label: '原始大小(auto)', value: 'auto' },
  { label: '100%宽度', value: '100% auto' },
  { label: '100%高度', value: 'auto 100%' },
]

// 背景位置选项
const bgPositionOptions = [
  { label: '居中', value: 'center' },
  { label: '顶部', value: 'top' },
  { label: '底部', value: 'bottom' },
  { label: '左侧', value: 'left' },
  { label: '右侧', value: 'right' },
  { label: '左上角', value: 'left top' },
  { label: '右上角', value: 'right top' },
  { label: '左下角', value: 'left bottom' },
  { label: '右下角', value: 'right bottom' },
]

// 初始化
onMounted(() => {
  // 从 store 加载现有配置
  const storeConfig = turntableStore.presentationConfig?.background || {}
  backgroundConfig.imageUrl = storeConfig.imageUrl || ''
  backgroundConfig.backgroundSize = storeConfig.backgroundSize || 'cover'
  backgroundConfig.backgroundPosition =
    storeConfig.backgroundPosition || 'center'
})

// 更新背景设置
const updateBackground = (key, value) => {
  backgroundConfig[key] = value

  // 更新到 store
  turntableStore.updateBackgroundConfig({
    [key]: value,
  })
}

// 修复自定义上传处理 - 正确获取文件对象并转换为 Base64
const handleCustomUpload = ({ file, onFinish, onError }) => {
  try {
    if (!file) {
      onError?.('No file provided')
      return
    }

    // 确保我们获取正确的文件对象
    const actualFile = file.file || file

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Url = e.target.result
      backgroundConfig.imageUrl = base64Url
      updateBackground('imageUrl', base64Url)
      showPreview.value = true
      onFinish?.() // 通知上传组件上传完成
    }

    reader.onerror = (error) => {
      console.error('FileReader error:', error)
      onError?.('Failed to read file')
    }

    reader.readAsDataURL(actualFile)
  } catch (error) {
    console.error('Upload error:', error)
    onError?.(error.message || 'Upload failed')
  }
}

// 预览背景
const previewBackground = () => {
  showPreview.value = !showPreview.value
}

// 清除背景
const clearBackground = () => {
  backgroundConfig.imageUrl = ''
  updateBackground('imageUrl', '')
  showPreview.value = false
}
</script>

<style lang="scss" scoped>
.background-config {
  padding: 10px 0;
}

.config-title {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: $primary-color;
  font-weight: 500;
}

.config-form {
  margin-bottom: 15px;
}

.image-input-container {
  display: flex;
  gap: 10px;
}

.background-preview {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin: 15px 0;
  border: 1px solid $border-color;

  .dark-mode & {
    border-color: $dark-border-color;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .preview-wheel {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: $primary-color;
    border: 5px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    opacity: 0.8;
  }
}
</style>
