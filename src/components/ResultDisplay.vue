<template>
  <div
    class="result-display"
    v-if="configStore.currentWinner"
    role="alert"
    aria-live="assertive"
  >
    <n-card>
      <template #header>
        <div class="result-header">
          <n-icon size="24" color="#f0ad4e">
            <trophy-icon />
          </n-icon>
          <span class="result-title">抽奖结果</span>
        </div>
      </template>
      <n-space vertical>
        <div class="winner-info">
          <div class="winner-name">{{ configStore.currentWinner.name }}</div>
          <div
            class="winner-color"
            :style="{ backgroundColor: configStore.currentWinner.color }"
            aria-hidden="true"
          ></div>
        </div>
        <div
          class="winner-description"
          v-if="configStore.currentWinner.description"
        >
          {{ configStore.currentWinner.description }}
        </div>
        <div class="winner-actions" v-if="configStore.settings.shareEnabled">
          <n-button size="small" @click="shareResult">
            <template #icon>
              <n-icon><share-icon /></n-icon>
            </template>
            分享结果
          </n-button>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { h } from 'vue'
import { NCard, NSpace, NIcon, NButton, useMessage } from 'naive-ui'
import { useConfigStore } from '../store/config'

const configStore = useConfigStore()
const message = useMessage()

// 奖杯图标
const TrophyIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M18 5h2a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3h-1v2h2v2H5v-2h2v-2H6a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1h2V3h12v2zm-2 0V5H8v1H5v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6h-3zm-8 8h6v2h-6v-2z',
    }),
  ])

// 分享图标
const ShareIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z',
    }),
  ])

// 分享结果
function shareResult() {
  const winner = configStore.currentWinner
  if (!winner) return

  const shareText = `我在抽奖中抽到了【${winner.name}】！${
    winner.description || ''
  }`

  if (navigator.share) {
    navigator
      .share({
        title: '抽奖结果',
        text: shareText,
      })
      .catch((err) => {
        console.log('分享失败:', err)
        fallbackShare(shareText)
      })
  } else {
    fallbackShare(shareText)
  }
}

// 备用分享方法 - 复制到剪贴板
function fallbackShare(text) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => message.success('已复制结果到剪贴板'))
      .catch(() => message.error('复制失败，请手动复制分享'))
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      document.execCommand('copy')
      message.success('已复制结果到剪贴板')
    } catch (err) {
      message.error('复制失败，请手动复制分享')
    }

    document.body.removeChild(textarea)
  }
}
</script>

<style scoped>
.result-display {
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-in-out;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
}

.winner-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
}

.winner-name {
  font-size: 24px;
  font-weight: bold;
}

.winner-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.winner-description {
  text-align: center;
  color: #666;
  margin-top: 10px;
  font-style: italic;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.winner-actions {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}
</style>
