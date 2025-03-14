<template>
  <div ref="wheelContainer" class="wheel-leafer-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { App, Rect, Group, Ellipse, Text } from 'leafer-ui'
import gsap from 'gsap'
import { calculateAngleRanges } from '@/utils/math/probability'

// 定义props
const props = defineProps({
  prizes: {
    type: Array,
    required: true,
  },
  colors: {
    type: Array,
    default: () => [],
  },
  config: {
    type: Object,
    default: () => ({}),
  },
  isSpinning: {
    type: Boolean,
    default: false,
  },
})

// 定义事件
const emit = defineEmits(['spinning-complete'])

// 默认配置
const defaultConfig = {
  radius: 200,
  borderWidth: 5,
  borderColor: '#ffffff',
  textDistance: 0.75,
  textSize: 14,
  spinDuration: 5000,
  easing: 'Power2.easeOut',
}

// 合并配置
const wheelConfig = {
  ...defaultConfig,
  ...props.config,
}

// 引用和状态
const wheelContainer = ref(null)
const leaferApp = ref(null)
const wheelGroup = ref(null)
const currentRotation = ref(0)
const defaultColors = [
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

// 生命周期钩子
onMounted(() => {
  initLeaferWheel()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (leaferApp.value) {
    leaferApp.value.destroy()
  }
  window.removeEventListener('resize', handleResize)
})

// 初始化Leafer转盘
const initLeaferWheel = () => {
  if (!wheelContainer.value) return

  // 清理旧的实例
  if (leaferApp.value) {
    leaferApp.value.destroy()
  }

  // 获取容器尺寸
  const containerWidth = wheelContainer.value.clientWidth
  const containerHeight = wheelContainer.value.clientHeight

  // 创建Leafer应用
  leaferApp.value = new App({
    view: wheelContainer.value,
    width: containerWidth,
    height: containerHeight,
  })

  // 创建转盘组
  wheelGroup.value = new Group({
    x: containerWidth / 2,
    y: containerHeight / 2,
    originX: 0,
    originY: 0,
    rotation: currentRotation.value,
    width: wheelConfig.radius * 2,
    height: wheelConfig.radius * 2,
  })

  // 创建转盘扇区
  drawWheel()

  // 添加组到应用
  leaferApp.value.add(wheelGroup.value)
}

// 绘制转盘
const drawWheel = () => {
  if (!wheelGroup.value) return

  // 清空组
  wheelGroup.value.removeChildren()

  // 计算角度区间
  const angleRanges = calculateAngleRanges(props.prizes)
  const radius = wheelConfig.radius

  // 添加外圆
  const outerCircle = new Ellipse({
    x: 0,
    y: 0,
    radius: radius,
    fill: 'none',
    stroke: wheelConfig.borderColor,
    strokeWidth: wheelConfig.borderWidth,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowBlur: 10,
    shadowOffsetY: 3,
  })
  wheelGroup.value.add(outerCircle)

  // 创建内圆
  const innerCircle = new Ellipse({
    x: 0,
    y: 0,
    radius: radius - wheelConfig.borderWidth,
    fill: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowBlur: 4,
    shadowOffsetY: 2,
  })
  wheelGroup.value.add(innerCircle)

  // 绘制扇区
  angleRanges.forEach((range, index) => {
    const { item, startAngle, endAngle } = range
    const color =
      item.color ||
      props.colors[index % props.colors.length] ||
      defaultColors[index % defaultColors.length]
    const angleDiff = endAngle - startAngle

    // 创建扇区
    const sector = new Ellipse({
      x: 0,
      y: 0,
      radius: radius - wheelConfig.borderWidth,
      startAngle: startAngle,
      endAngle: endAngle,
      fill: color,
      opacity: 0.9,
      stroke: '#ffffff',
      strokeWidth: 1,
    })
    wheelGroup.value.add(sector)

    // 计算文本位置（极坐标转笛卡尔坐标）
    const textAngle = (startAngle + angleDiff / 2) * (Math.PI / 180)
    const textDistance = radius * wheelConfig.textDistance
    const textX = Math.cos(textAngle) * textDistance
    const textY = Math.sin(textAngle) * textDistance

    // 创建奖品文本
    const text = new Text({
      x: textX,
      y: textY,
      text: item.name,
      fill: '#ffffff',
      fontSize: wheelConfig.textSize,
      fontWeight: 'bold',
      textAlign: 'center',
      rotation: startAngle + angleDiff / 2 + 90,
      stroke: 'rgba(0, 0, 0, 0.5)',
      strokeWidth: 1,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowBlur: 2,
    })
    wheelGroup.value.add(text)
  })
}

// 响应式调整
const handleResize = () => {
  if (!wheelContainer.value || !leaferApp.value) return

  const containerWidth = wheelContainer.value.clientWidth
  const containerHeight = wheelContainer.value.clientHeight

  leaferApp.value.resize(containerWidth, containerHeight)

  if (wheelGroup.value) {
    wheelGroup.value.x = containerWidth / 2
    wheelGroup.value.y = containerHeight / 2
  }
}

// 监听prizes变化
watch(
  () => props.prizes,
  () => {
    drawWheel()
  },
  { deep: true }
)

// 监听spinning状态
watch(
  () => props.isSpinning,
  (value) => {
    if (value) {
      spinWheel()
    }
  }
)

// 执行旋转动画
const spinWheel = () => {
  if (!wheelGroup.value) return

  // 计算目标角度
  const selectedIndex = Math.floor(Math.random() * props.prizes.length)
  const angleRanges = calculateAngleRanges(props.prizes)
  const selectedRange = angleRanges[selectedIndex]

  // 计算旋转角度
  const middleAngle = (selectedRange.startAngle + selectedRange.endAngle) / 2
  const targetRotation = 360 * 5 + middleAngle

  // 使用GSAP执行动画
  gsap.to(wheelGroup.value, {
    rotation: currentRotation.value + targetRotation,
    duration: wheelConfig.spinDuration / 1000,
    ease: wheelConfig.easing,
    onUpdate: () => {
      currentRotation.value = wheelGroup.value.rotation % 360
    },
    onComplete: () => {
      currentRotation.value = wheelGroup.value.rotation % 360
      emit('spinning-complete', props.prizes[selectedIndex])
    },
  })
}
</script>

<style scoped>
.wheel-leafer-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
