<template>
  <div class="turntable-wrapper" role="application" aria-label="转盘抽奖">
    <div class="turntable-outer">
      <!-- 添加固定的指针容器，使指针不随转盘旋转 -->
      <div class="pointer-container">
        <div class="turntable-pointer" aria-hidden="true"></div>
      </div>

      <div
        class="turntable-container"
        ref="turntableContainer"
        :class="`theme-${configStore.settings.turntableTheme || 'standard'}`"
      >
        <canvas
          ref="turntableCanvas"
          width="500"
          height="500"
          aria-hidden="true"
        ></canvas>
      </div>
    </div>

    <!-- 操作指引提示 -->
    <div class="turntable-guide" v-if="showGuide && !hasSpunOnce">
      <div class="guide-content">
        <n-icon size="24">
          <info-icon />
        </n-icon>
        <span>点击"开始抽奖"按钮开始</span>
        <n-button size="tiny" @click="showGuide = false">知道了</n-button>
      </div>
    </div>

    <div class="turntable-controls">
      <n-button
        type="primary"
        size="large"
        :disabled="isSpinning || !hasItems || allItemsExcluded"
        @click="startSpin"
        class="spin-button"
        role="button"
        aria-label="开始抽奖"
        :aria-disabled="isSpinning || !hasItems || allItemsExcluded"
        tabindex="0"
        @keydown.space.prevent="startSpin"
        @keydown.enter.prevent="startSpin"
      >
        {{ spinButtonText }}
      </n-button>

      <n-tooltip
        v-if="
          !configStore.settings.allowRepeat && configStore.excluded.length > 0
        "
      >
        <template #trigger>
          <n-button
            class="reset-button"
            @click="resetExcluded"
            role="button"
            aria-label="重置已抽项"
            tabindex="0"
          >
            重置已抽项
          </n-button>
        </template>
        已排除 {{ configStore.excluded.length }} 个项目
      </n-tooltip>
    </div>

    <!-- 无障碍说明 (仅供屏幕阅读器) -->
    <div class="sr-only" aria-live="polite" ref="srAnnouncer">
      {{ accessibilityAnnouncement }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, h, onUnmounted } from 'vue'
import { useMessage, NButton, NTooltip, NIcon } from 'naive-ui'
import { useConfigStore } from '../store/config'
import { calculateWinner } from '../utils/probability'
import { provideFeedback } from '../utils/feedback'
import gsap from 'gsap'

const configStore = useConfigStore()
const message = useMessage()

// 引用DOM元素
const turntableCanvas = ref(null)
const turntableContainer = ref(null)
const srAnnouncer = ref(null)
const accessibilityAnnouncement = ref('')

// 转盘状态
const isSpinning = ref(false)
const ctx = ref(null)
const centerX = ref(250)
const centerY = ref(250)
const radius = ref(240)
const showGuide = ref(true)
const hasSpunOnce = ref(false)

// 计算是否有可抽奖项目
const hasItems = computed(() => configStore.items.length > 0)

// 计算是否所有项目都被排除
const allItemsExcluded = computed(() => {
  if (configStore.settings.allowRepeat) return false
  return (
    configStore.items.length > 0 &&
    configStore.excluded.length >= configStore.items.length
  )
})

// 计算按钮文本
const spinButtonText = computed(() => {
  if (isSpinning.value) return '抽奖中...'
  if (allItemsExcluded.value) return '已抽完'
  if (!hasItems.value) return '请添加奖项'
  return '开始抽奖'
})

// 监听配置变化
watch(() => configStore.items, drawTurntable, { deep: true })
watch(() => configStore.settings.turntableTheme, drawTurntable)

// 信息图标
const InfoIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    }),
  ])

// 初始化
onMounted(() => {
  ctx.value = turntableCanvas.value.getContext('2d')
  drawTurntable()

  // 响应窗口大小变化
  window.addEventListener('resize', resizeTurntable)
  resizeTurntable()

  // 处理离线情况
  window.addEventListener('online', handleOnline)

  // 预加载音效
  if (configStore.settings.enableSound) {
    preloadSounds()
  }

  // 检查是否首次访问
  const hasVisited = localStorage.getItem('turntable-visited')
  if (hasVisited) {
    showGuide.value = false
  } else {
    localStorage.setItem('turntable-visited', 'true')
  }

  // 添加键盘控制
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeTurntable)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('online', handleOnline)
})

function handleOnline() {
  if (configStore.settings.enableSound) {
    preloadSounds()
  }
}

function handleKeydown(e) {
  // 空格键或回车键触发抽奖
  if (
    (e.key === ' ' || e.key === 'Enter') &&
    document.activeElement.tagName !== 'BUTTON'
  ) {
    if (!isSpinning.value && hasItems.value && !allItemsExcluded.value) {
      startSpin()
    }
  }
}

function preloadSounds() {
  // 预加载音效
  const sounds = ['spin', 'win']
  sounds.forEach((sound) => {
    const audio = new Audio()
    audio.src = `/sounds/${sound}.mp3`
    audio.preload = 'auto'
  })
}

// 重置已排除项
function resetExcluded() {
  configStore.resetExcluded()
  message.success('已重置排除列表，所有奖项可再次抽取')
}

// 调整转盘大小以适应屏幕
function resizeTurntable() {
  const container = turntableContainer.value
  const canvas = turntableCanvas.value

  if (!container || !canvas) return

  const size = Math.min(container.clientWidth, window.innerHeight * 0.6)

  // 设置容器大小
  container.style.width = `${size}px`
  container.style.height = `${size}px`

  // 保持画布分辨率
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`

  drawTurntable()
}

// 绘制转盘
function drawTurntable() {
  const canvas = turntableCanvas.value
  const context = ctx.value
  if (!canvas || !context) return

  const items = configStore.items
  if (items.length === 0) {
    drawEmptyTurntable()
    return
  }

  // 获取主题颜色配置
  const theme = configStore.settings.turntableTheme || 'standard'
  const themes = {
    standard: {
      borderColor: '#333',
      centerColor: '#fff',
      textColor: '#fff',
      lineColor: '#fff',
    },
    bright: {
      borderColor: '#FF5252',
      centerColor: '#ffeb3b',
      textColor: '#000',
      lineColor: '#fff',
    },
    soft: {
      borderColor: '#90caf9',
      centerColor: '#e1f5fe',
      textColor: '#fff',
      lineColor: 'rgba(255,255,255,0.7)',
    },
    highContrast: {
      borderColor: '#000',
      centerColor: '#fff',
      textColor: '#fff',
      lineColor: '#000',
    },
  }

  const themeConfig = themes[theme] || themes.standard

  // 清空画布
  context.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制外圈
  context.beginPath()
  context.arc(centerX.value, centerY.value, radius.value, 0, Math.PI * 2)
  context.strokeStyle = themeConfig.borderColor
  context.lineWidth = 2
  context.stroke()
  context.closePath()

  // 绘制分区
  const angleStep = (Math.PI * 2) / items.length

  items.forEach((item, index) => {
    const startAngle = index * angleStep
    const endAngle = (index + 1) * angleStep

    // 绘制扇形
    context.beginPath()
    context.moveTo(centerX.value, centerY.value)
    context.arc(
      centerX.value,
      centerY.value,
      radius.value,
      startAngle,
      endAngle
    )
    context.closePath()

    // 填充颜色
    let fillColor = item.color || getColorByIndex(index)

    // 如果项目已被排除且不允许重复，使用灰色
    if (
      !configStore.settings.allowRepeat &&
      configStore.excluded.includes(item.id)
    ) {
      fillColor = 'rgba(200,200,200,0.5)'
    }

    context.fillStyle = fillColor
    context.fill()

    // 绘制分隔线
    context.beginPath()
    context.moveTo(centerX.value, centerY.value)
    context.lineTo(
      centerX.value + Math.cos(startAngle) * radius.value,
      centerY.value + Math.sin(startAngle) * radius.value
    )
    context.strokeStyle = themeConfig.lineColor
    context.lineWidth = 2
    context.stroke()

    // 绘制文字
    const textAngle = startAngle + angleStep / 2
    const textRadius = radius.value * 0.75
    const textX = centerX.value + Math.cos(textAngle) * textRadius
    const textY = centerY.value + Math.sin(textAngle) * textRadius

    context.save()
    context.translate(textX, textY)
    context.rotate(textAngle + Math.PI / 2)
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // 如果项目已被排除且不允许重复
    const isExcluded =
      !configStore.settings.allowRepeat &&
      configStore.excluded.includes(item.id)
    context.fillStyle = isExcluded
      ? 'rgba(100,100,100,0.7)'
      : themeConfig.textColor
    context.font = isExcluded ? '14px Arial' : 'bold 16px Arial'

    // 文字换行处理
    const words = item.name.split('')
    const lineHeight = 20

    if (words.length <= 4) {
      context.fillText(item.name, 0, 0)
    } else {
      for (let i = 0; i < words.length; i += 4) {
        const chunk = words.slice(i, i + 4).join('')
        context.fillText(
          chunk,
          0,
          (i / 4) * lineHeight - (words.length > 8 ? 20 : 10)
        )
      }
    }

    context.restore()
  })

  // 绘制中心圆
  context.beginPath()
  context.arc(centerX.value, centerY.value, 20, 0, Math.PI * 2)
  context.fillStyle = themeConfig.centerColor
  context.fill()
  context.strokeStyle = themeConfig.borderColor
  context.lineWidth = 2
  context.stroke()
}

// 绘制空转盘
function drawEmptyTurntable() {
  const canvas = turntableCanvas.value
  const context = ctx.value

  // 清空画布
  context.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制外圈
  context.beginPath()
  context.arc(centerX.value, centerY.value, radius.value, 0, Math.PI * 2)
  context.strokeStyle = '#ccc'
  context.lineWidth = 2
  context.stroke()
  context.closePath()

  // 提示文字
  context.fillStyle = '#999'
  context.font = 'bold 24px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('请添加抽奖项目', centerX.value, centerY.value)
}

// 获取颜色
function getColorByIndex(index) {
  const colors = [
    '#FF5252',
    '#FF4081',
    '#E040FB',
    '#7C4DFF',
    '#536DFE',
    '#448AFF',
    '#40C4FF',
    '#18FFFF',
    '#64FFDA',
    '#69F0AE',
    '#B2FF59',
    '#EEFF41',
    '#FFFF00',
    '#FFD740',
    '#FFAB40',
    '#FF6E40',
  ]
  return colors[index % colors.length]
}

// 开始旋转
function startSpin() {
  if (isSpinning.value || !hasItems.value || allItemsExcluded.value) return

  isSpinning.value = true
  hasSpunOnce.value = true

  // 提供反馈
  provideFeedback('spin')

  // 确定获胜项，如果不允许重复，传入已排除的项
  const excludedIds = !configStore.settings.allowRepeat
    ? configStore.excluded
    : []
  const winner = calculateWinner(configStore.items, excludedIds)

  if (!winner) {
    message.error('无法确定获胜项')
    isSpinning.value = false
    return
  }

  // 计算旋转角度
  const items = configStore.items
  const winnerIndex = items.findIndex((item) => item.id === winner.id)
  const angleStep = 360 / items.length

  // 计算目标角度 (多旋转几圈再停在获胜项)
  const targetAngle = 3600 + (360 - (winnerIndex * angleStep + angleStep / 2))

  // 根据动画质量设置不同的配置
  const qualitySettings = {
    high: {
      duration: configStore.settings.spinDuration || 5,
      ease: 'power2.out',
    },
    medium: {
      duration: configStore.settings.spinDuration || 5,
      ease: 'power1.out',
    },
    low: { duration: configStore.settings.spinDuration || 5, ease: 'none' },
  }

  const animationQuality = configStore.settings.animationQuality || 'high'
  const { duration, ease } =
    qualitySettings[animationQuality] || qualitySettings.high

  // 使用requestAnimationFrame优化动画性能
  const startTime = performance.now()
  const totalDuration = duration * 1000
  const initialRotation = parseFloat(
    turntableContainer.value.style.transform?.match(/rotate\((.+)deg\)/)?.[1] ||
      0
  )
  const targetRotation = initialRotation + targetAngle

  // 如果设置为高质量，则使用GSAP实现平滑动画
  if (animationQuality === 'high') {
    // 创建动画
    gsap.to(turntableContainer.value, {
      duration,
      rotation: targetRotation,
      ease,
      onComplete: spinComplete,
    })
  } else {
    // 使用requestAnimationFrame手动实现动画
    function animate(currentTime) {
      const elapsedTime = currentTime - startTime

      if (elapsedTime < totalDuration) {
        let progress = elapsedTime / totalDuration

        // 简单的缓动函数
        if (animationQuality === 'medium') {
          progress = 1 - Math.pow(1 - progress, 2)
        }

        const currentRotation = initialRotation + progress * targetAngle
        turntableContainer.value.style.transform = `rotate(${currentRotation}deg)`

        requestAnimationFrame(animate)
      } else {
        // 动画结束
        turntableContainer.value.style.transform = `rotate(${targetRotation}deg)`
        spinComplete()
      }
    }

    requestAnimationFrame(animate)
  }

  function spinComplete() {
    isSpinning.value = false

    // 提供反馈
    provideFeedback('win')

    // 显示结果
    configStore.setWinner(winner)

    // 记录历史
    configStore.addHistory(winner)

    // 显示消息
    message.success(`恭喜抽中: ${winner.name}`)

    // 无障碍公告
    announceResult(winner)
  }
}

// 用于屏幕阅读器的结果公告
function announceResult(winner) {
  if (!winner) return

  accessibilityAnnouncement.value = `抽奖结果: ${winner.name}. ${
    winner.description || ''
  }`
}

// 播放音效
function playSpinSound() {
  try {
    const audio = new Audio()
    audio.src = '/sounds/spin.mp3'
    audio.play().catch((err) => console.log('音效播放失败:', err))
  } catch (e) {
    console.log('音效播放失败:', e)
  }
}

function playWinSound() {
  try {
    const audio = new Audio()
    audio.src = '/sounds/win.mp3'
    audio.play().catch((err) => console.log('音效播放失败:', err))
  } catch (e) {
    console.log('音效播放失败:', e)
  }
}
</script>

<style scoped>
.turntable-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.turntable-outer {
  position: relative;
  padding: 10px;
  width: 100%;
  max-width: 500px;
}

/* 指针容器，固定在转盘上方，不随转盘旋转 */
.pointer-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 20; /* 确保指针在转盘上方 */
  pointer-events: none; /* 允许点击穿透到下层转盘 */
}

.turntable-container {
  position: relative;
  width: 500px;
  height: 500px;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
  transform-origin: center;
  border-radius: 50%; /* 确保转盘是圆形的 */
  overflow: hidden; /* 防止内容溢出圆形 */
}

/* 指针样式修改，使其居中并指向转盘 */
.turntable-pointer {
  width: 20px;
  height: 30px;
  background-color: #f44336;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
  /* 移除了position: absolute相关的定位，由pointer-container负责定位 */
}

.turntable-controls {
  margin-top: 20px;
  text-align: center;
}

.spin-button {
  min-width: 120px;
}

/* 主题样式 */
.theme-standard {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.theme-bright {
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.3);
}

.theme-soft {
  box-shadow: 0 4px 15px rgba(144, 202, 249, 0.4);
}

.theme-highContrast {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: 3px solid #000;
}

.turntable-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 20px);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  z-index: 100;
  animation: pulse 2s infinite;
}

.guide-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-button {
  margin-left: 8px;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, 20px) scale(1);
  }
  50% {
    transform: translate(-50%, 20px) scale(1.05);
  }
  100% {
    transform: translate(-50%, 20px) scale(1);
  }
}

/* 无障碍样式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
