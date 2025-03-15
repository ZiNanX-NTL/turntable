<template>
  <div class="turntable-container" :class="{ spinning: isSpinning }">
    <div class="wheel-container">
      <!-- <div class="wheel-outer-ring" aria-hidden="true"></div> -->

      <component
        :is="currentWheelComponent"
        ref="wheelRef"
        :prizes="prizes"
        :colors="wheelColors"
        :config="wheelConfig"
        :is-spinning="isSpinning"
        :target-prize="selectedPrize"
        :pointer-position="pointerConfig.position"
        @spinning-complete="handleSpinComplete"
      />

      <StandardPointer
        :pointer-style="pointerConfig.style"
        :position="pointerConfig.position"
        :color="pointerConfig.color"
        :size="pointerConfig.size"
        :is-animating="isSpinning"
      />

      <n-button
        v-if="showStartButton"
        type="primary"
        class="start-button"
        :disabled="isSpinning || prizes.length < 2"
        @click="startSpin"
        size="large"
        :loading="isSpinning"
      >
        {{ startButtonText }}
      </n-button>
    </div>

    <div class="result-container" v-if="showResult">
      <WinnerDisplay
        :result="currentResult"
        :config="resultConfig"
        @close="handleCloseResult"
      />
    </div>

    <audio ref="startSound" src="/sounds/start.mp3" preload="auto"></audio>
    <audio
      ref="spinningSound"
      src="/sounds/spinning.mp3"
      preload="auto"
      loop
    ></audio>
    <audio ref="resultSound" src="/sounds/result.mp3" preload="auto"></audio>
  </div>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted, watch, nextTick } from 'vue'
import { NButton } from 'naive-ui'
import { selectByProbability } from '@/utils/math/probability'
import { useSound } from '@/hooks/useSound'
import StandardPointer from './pointer/StandardPointer.vue'
import WinnerDisplay from '../results/display/WinnerDisplay.vue'
import WheelKonva from './wheel/WheelKonva.vue'
import { useVibration } from '@/hooks/feedback/useVibration'

// 组件接收的属性
const props = defineProps({
  prizes: {
    type: Array,
    required: true,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => ({}),
  },
  showStartButton: {
    type: Boolean,
    default: true,
  },
  autoPlaySound: {
    type: Boolean,
    default: true,
  },
})

// 组件事件
const emit = defineEmits(['spin-start', 'spin-end', 'result'])

// 组件状态
const isSpinning = ref(false)
const showResult = ref(false)
const currentResult = ref(null)
const wheelRef = ref(null)
const startSound = ref(null)
const spinningSound = ref(null)
const resultSound = ref(null)
const startButtonText = ref('开始抽奖')

// 新增状态变量用于存储选中的奖品
const selectedPrize = ref(null)

// 使用声音钩子
const { playSound, stopSound } = useSound()

// 震动反馈
const { vibrate } = useVibration()

// 默认配置与合并后的配置
const defaultConfig = {
  wheel: {
    type: 'leafer',
    spinDuration: 5000,
    easing: 'Power2.easeOut',
    textDistance: 0.75,
    textSize: 14,
    radius: 200,
    borderWidth: 5,
    borderColor: '#fff',
  },
  pointer: {
    style: 'standard',
    position: 'top',
    size: 40,
    color: '#f27059',
  },
  result: {
    showDuration: 3000,
    animation: 'confetti',
    autoClose: true,
  },
  sound: {
    enabled: true,
    volume: 0.7,
  },
}

// 合并配置
const wheelConfig = computed(() => ({
  ...defaultConfig.wheel,
  ...(props.config?.wheel || {}),
}))

const pointerConfig = computed(() => ({
  ...defaultConfig.pointer,
  ...(props.config?.pointer || {}),
}))

const resultConfig = computed(() => ({
  ...defaultConfig.result,
  ...(props.config?.result || {}),
}))

const soundConfig = computed(() => ({
  ...defaultConfig.sound,
  ...(props.config?.sound || {}),
}))

// 转盘组件选择
const currentWheelComponent = shallowRef(WheelKonva)

// 默认颜色列表
const wheelColors = [
  '#FF4747',
  '#FFAD47',
  '#4777FF',
  '#47FF83',
  '#9747FF',
  '#FF47D8',
  '#47C4FF',
  '#BEFF47',
  '#FF478B',
  '#47FFDB',
]

// 计算轮盘容器的尺寸
const wheelContainerSize = computed(() => {
  // 考虑轮盘半径、边框、指针等因素，添加额外的空间
  const radius = wheelConfig.value.radius || defaultConfig.wheel.radius
  const borderWidth =
    wheelConfig.value.borderWidth || defaultConfig.wheel.borderWidth
  const pointerSize = pointerConfig.value.size || defaultConfig.pointer.size

  // 计算所需的最小尺寸 = 直径 + 边框 + 指针 + 额外空间
  const minSize = radius * 2 + borderWidth * 2 + pointerSize + 40

  return {
    width: `${minSize}px`,
    height: `${minSize}px`,
  }
})

// 生命周期钩子
onMounted(() => {
  // 预加载音频
  if (props.autoPlaySound && soundConfig.value.enabled) {
    startSound.value.volume = soundConfig.value.volume
    spinningSound.value.volume = soundConfig.value.volume
    resultSound.value.volume = soundConfig.value.volume
  }
})

// 添加配置监听
watch(
  () => props.config,
  (newConfig) => {
    console.log('Turntable received config update:', newConfig)
  },
  { deep: true }
)

// 监听轮盘配置变化
watch(
  () => props.config?.wheel,
  (newWheelConfig) => {
    console.log('Wheel config updated:', newWheelConfig)
    // 这里不需要做什么，因为我们通过key重新渲染了整个组件
  },
  { deep: true, immediate: true }
)

// 监听指针配置变化
watch(
  () => props.config?.pointer,
  (newPointerConfig) => {
    console.log('Pointer config updated:', newPointerConfig)
    // 这里不需要做什么，因为我们通过key重新渲染了整个组件
  },
  { deep: true, immediate: true }
)

// 开始旋转
const startSpin = async () => {
  if (isSpinning.value || props.prizes.length < 2) return

  isSpinning.value = true
  showResult.value = false
  startButtonText.value = '抽奖中...'

  // 播放开始音效
  if (soundConfig.value.enabled) {
    startSound.value.play()

    // 延迟一点播放旋转音效
    setTimeout(() => {
      if (isSpinning.value) {
        spinningSound.value.play()
      }
    }, 500)
  }

  // 震动反馈
  vibrate(100)

  // 使用概率选择一个奖品
  selectedPrize.value = selectByProbability(props.prizes)

  // 通知父组件开始旋转
  emit('spin-start', selectedPrize.value)

  // 确保视图更新后再触发旋转
  await nextTick()
}

// 处理旋转完成
const handleSpinComplete = (prize) => {
  // 停止旋转音效
  if (soundConfig.value.enabled) {
    spinningSound.value.pause()
    spinningSound.value.currentTime = 0

    // 播放结果音效
    resultSound.value.play()
  }

  // 震动反馈
  vibrate([100, 50, 200])

  // 设置当前结果
  currentResult.value = prize

  // 显示结果
  showResult.value = true

  // 更新状态
  isSpinning.value = false
  startButtonText.value = '再抽一次'

  // 通知父组件旋转结束
  emit('spin-end', prize)
  emit('result', prize)

  // 如果设置了自动关闭结果，则在指定时间后隐藏结果
  if (resultConfig.value.autoClose) {
    setTimeout(() => {
      showResult.value = false
    }, resultConfig.value.showDuration)
  }
}

// 处理关闭结果
const handleCloseResult = () => {
  showResult.value = false
}
</script>

<style lang="scss" scoped>
.turntable-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 20px;
}

.wheel-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  min-width: 300px;
  min-height: 300px;
  width: v-bind('wheelContainerSize.width');
  height: v-bind('wheelContainerSize.height');
  max-width: 90vw;
  max-height: 90vw;
  box-sizing: content-box;

  /* 修改选择器 - 仅针对转盘组件应用居中样式 */
  & > *:not(.start-button):not([class*='pointer']) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
  }

  @include mobile {
    max-width: 95vw;
    max-height: 95vw;
    min-width: 250px;
    min-height: 250px;
  }
}

.wheel-outer-ring {
  position: absolute;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  z-index: 0;
}

.start-button {
  position: absolute;
  bottom: 0px; /* 修改:使用bottom而不是transform */
  left: 50%;
  transform: translateX(-50%); /* 只在X轴居中 */
  z-index: 20;
  font-weight: bold;
  padding: 8px 24px;
  border-radius: 30px;
  letter-spacing: 1px;
  background: linear-gradient(135deg, $secondary-color, $secondary-light);
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &:hover:not(:disabled) {
    transform: translateX(-50%) scale(1.05); /* 保持X轴居中 */
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
  }

  &:active:not(:disabled) {
    transform: translateX(-50%) scale(0.98); /* 保持X轴居中 */
  }

  @include mobile {
    font-size: 14px;
    padding: 6px 18px;
  }
}

.result-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
}

.spinning {
  .wheel-container {
    animation: subtle-bounce 1s infinite alternate ease-in-out;
  }
}

@keyframes subtle-bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-5px);
  }
}
</style>
