<template>
  <div ref="wheelContainer" class="wheel-konva-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import Konva from 'konva'
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
  targetPrize: {
    type: Object,
    default: null,
  },
  pointerPosition: {
    type: String,
    default: 'top',
    validator: (val) => ['top', 'right', 'bottom', 'left'].includes(val),
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
const stage = ref(null)
const wheelLayer = ref(null)
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

// 根据指针位置计算基准角度
const pointerPositionAngle = computed(() => {
  switch (props.pointerPosition) {
    case 'top':
      return 270 // 顶部位置
    case 'right':
      return 0 // 右侧位置
    case 'bottom':
      return 90 // 底部位置
    case 'left':
      return 180 // 左侧位置
    default:
      return 270 // 默认顶部位置
  }
})

// 生命周期钩子
onMounted(() => {
  initKonvaWheel()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (stage.value) {
    stage.value.destroy()
  }
  window.removeEventListener('resize', handleResize)
})

// 初始化Konva转盘
const initKonvaWheel = () => {
  if (!wheelContainer.value) return

  // 清理旧的实例
  if (stage.value) {
    stage.value.destroy()
  }

  // 获取容器尺寸
  const containerWidth = wheelContainer.value.clientWidth
  const containerHeight = wheelContainer.value.clientHeight

  // 确保舞台尺寸足够容纳转盘及其边框
  const requiredSize = wheelConfig.radius * 2 + wheelConfig.borderWidth * 2 + 20
  const stageWidth = Math.max(containerWidth, requiredSize)
  const stageHeight = Math.max(containerHeight, requiredSize)

  // 创建Konva舞台
  stage.value = new Konva.Stage({
    container: wheelContainer.value,
    width: stageWidth,
    height: stageHeight,
  })

  // 创建图层
  wheelLayer.value = new Konva.Layer()
  stage.value.add(wheelLayer.value)

  // 创建转盘组 - 确保组位于舞台中心
  wheelGroup.value = new Konva.Group({
    x: stageWidth / 2,
    y: stageHeight / 2,
    offset: {
      x: 0,
      y: 0,
    },
    rotation: currentRotation.value,
  })

  // 创建转盘扇区
  drawWheel()

  // 添加组到图层
  wheelLayer.value.add(wheelGroup.value)

  // 确保立即渲染
  wheelLayer.value.draw()
}

// 绘制转盘
const drawWheel = () => {
  if (!wheelGroup.value) return

  // 清空组
  wheelGroup.value.destroyChildren()

  // 计算角度区间
  const angleRanges = calculateAngleRanges(props.prizes)
  const radius = wheelConfig.radius

  // 添加外圆
  const outerCircle = new Konva.Circle({
    x: 0,
    y: 0,
    radius: radius,
    stroke: wheelConfig.borderColor,
    strokeWidth: wheelConfig.borderWidth,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowBlur: 10,
    shadowOffsetY: 3,
  })
  wheelGroup.value.add(outerCircle)

  // 创建内圆（背景）
  const innerCircle = new Konva.Circle({
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
    const wedge = new Konva.Wedge({
      x: 0,
      y: 0,
      radius: radius - wheelConfig.borderWidth,
      angle: angleDiff,
      rotation: startAngle,
      fill: color,
      opacity: 0.9,
      stroke: '#ffffff',
      strokeWidth: 1,
    })
    wheelGroup.value.add(wedge)

    // 计算文本位置（极坐标转笛卡尔坐标）
    const textAngle = (startAngle + angleDiff / 2) * (Math.PI / 180)
    const textDistance = radius * wheelConfig.textDistance
    const textX = Math.cos(textAngle) * textDistance
    const textY = Math.sin(textAngle) * textDistance

    // 创建奖品文本
    const textRotation = startAngle + angleDiff / 2 + 90
    const text = new Konva.Text({
      x: textX,
      y: textY,
      text: item.name,
      fontSize: wheelConfig.textSize,
      fontFamily: 'Noto Sans SC, sans-serif',
      fontStyle: 'bold',
      fill: '#ffffff',
      align: 'center',
      verticalAlign: 'middle',
      rotation: textRotation,
      offsetX: 0,
      offsetY: 0,
    })

    // 调整文本位置使其居中
    text.offsetX(text.width() / 2)
    text.offsetY(text.height() / 2)

    // 添加文本描边
    text.shadowColor('rgba(0, 0, 0, 0.5)')
    text.shadowBlur(2)
    text.shadowOffset({ x: 1, y: 1 })

    wheelGroup.value.add(text)
  })

  // 重新绘制图层
  wheelLayer.value.draw()
}

// 响应式调整
const handleResize = () => {
  if (!wheelContainer.value || !stage.value) return

  const containerWidth = wheelContainer.value.clientWidth
  const containerHeight = wheelContainer.value.clientHeight

  // 确保舞台尺寸足够容纳转盘
  const requiredSize = wheelConfig.radius * 2 + wheelConfig.borderWidth * 2 + 20
  const stageWidth = Math.max(containerWidth, requiredSize)
  const stageHeight = Math.max(containerHeight, requiredSize)

  // 更新舞台尺寸
  stage.value.width(stageWidth)
  stage.value.height(stageHeight)

  if (wheelGroup.value) {
    // 确保转盘始终位于舞台中心
    wheelGroup.value.x(stageWidth / 2)
    wheelGroup.value.y(stageHeight / 2)
  }

  // 重绘整个图层
  wheelLayer.value.batchDraw()
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
    if (value && props.targetPrize) {
      spinWheel(props.targetPrize)
    }
  }
)

// 执行旋转动画
const spinWheel = (targetPrize) => {
  if (!wheelGroup.value) return

  // 计算角度区间
  const angleRanges = calculateAngleRanges(props.prizes)

  // 找到目标奖品对应的角度范围
  let selectedRange = null
  if (targetPrize) {
    selectedRange = angleRanges.find(
      (range) =>
        range.item.id === targetPrize.id || range.item.name === targetPrize.name
    )
  }

  // 如果没有找到目标奖品，随机选择一个
  if (!selectedRange) {
    const randomIndex = Math.floor(Math.random() * angleRanges.length)
    selectedRange = angleRanges[randomIndex]
  }

  // 计算旋转角度 - 确保指针指向目标奖品
  const middleAngle = (selectedRange.startAngle + selectedRange.endAngle) / 2

  // 使用计算属性获取指针位置的基准角度
  const pointerPosition = pointerPositionAngle.value

  // 获取当前实际旋转角度 (不是取模后的值，而是完整的旋转角度)
  const currentAngle = wheelGroup.value.rotation()

  // 计算指针当前指向的角度（取模后的值，用于确定当前位置）
  const currentModAngle = currentAngle % 360

  // 计算从当前位置旋转到目标位置需要的角度
  // 目标位置：pointerPosition - middleAngle
  // 确保旋转方向是顺时针（角度增加）
  let angleToTarget = pointerPosition - middleAngle - currentModAngle

  // 确保是正向旋转（顺时针），如果计算结果为负，则加上360度
  if (angleToTarget < 0) {
    angleToTarget += 360
  }

  // 最小旋转圈数确保每次至少旋转8圈
  const minSpinsInDegrees = 8 * 360

  // 总旋转角度 = 当前角度 + 要转的角度 + 最小圈数
  const targetRotation = currentAngle + angleToTarget + minSpinsInDegrees

  // 在目标奖品区域内添加一点随机偏移，使结果不那么机械
  const angleDiff = selectedRange.endAngle - selectedRange.startAngle
  // 限制随机偏移范围在奖品区域的中间80%，避免太靠近边缘
  const randomOffset = (Math.random() * 0.8 - 0.4) * angleDiff * 0.5

  // 最终目标角度
  const finalTargetRotation = targetRotation + randomOffset

  // 使用GSAP执行动画
  gsap.to(wheelGroup.value, {
    rotation: finalTargetRotation,
    duration: wheelConfig.spinDuration / 1000,
    ease: wheelConfig.easing,
    onUpdate: () => {
      currentRotation.value = wheelGroup.value.rotation() % 360
      wheelLayer.value.batchDraw() // 更高效的批量重绘
    },
    onComplete: () => {
      currentRotation.value = wheelGroup.value.rotation() % 360
      emit('spinning-complete', selectedRange.item)
    },
  })
}
</script>

<style scoped>
.wheel-konva-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible; /* 允许内容溢出 */

  /* 确保内容居中 */
  & > div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
}

/* 确保Konva的画布正确定位 */
.konvajs-content {
  position: relative !important;
  margin: 0 auto;
}
</style>
