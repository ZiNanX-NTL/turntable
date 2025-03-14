<template>
  <div id="fireworks-container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { tsParticles } from '@tsparticles/engine'
import { loadFull } from 'tsparticles'
import { loadFireworksPreset } from '@tsparticles/preset-fireworks'

// 组件属性
const props = defineProps({
  color: {
    type: String,
    default: '#4777FF',
  },
})

// 保存实例ID
let particlesId = null

// 组件挂载时初始化粒子
onMounted(async () => {
  await loadFull(tsParticles)
  await loadFireworksPreset(tsParticles)

  // 提取颜色
  const mainColor = props.color || '#4777FF'
  const colorArray = [mainColor, '#ffffff', '#FF4747', '#FFD700', '#47FF83']

  // 初始化烟花效果
  particlesId = await tsParticles.load({
    id: 'fireworks-container',
    options: {
      preset: 'fireworks',
      background: {
        opacity: 0,
      },
      particles: {
        move: {
          trail: {
            fill: {
              color: 'non-transparent',
            },
          },
        },
        color: { value: colorArray },
      },
    },
  })
})

// 组件卸载前销毁粒子实例
onBeforeUnmount(() => {
  if (particlesId) {
    particlesId.destroy()
    particlesId = null
  }
})
</script>

<style scoped>
#fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
