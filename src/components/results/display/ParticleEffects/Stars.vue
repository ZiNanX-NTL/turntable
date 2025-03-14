<template>
  <div id="stars-container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { tsParticles } from '@tsparticles/engine'
import { loadFull } from 'tsparticles'

// 组件属性
const props = defineProps({
  color: {
    type: String,
    default: '#FFD700',
  },
})

// 保存实例ID
let particlesId = null

// 组件挂载时初始化粒子
onMounted(async () => {
  await loadFull(tsParticles)

  // 提取颜色
  const mainColor = props.color || '#FFD700'

  // 初始化星星效果
  particlesId = await tsParticles.load({
    id: 'stars-container',
    options: {
      fullScreen: {
        enable: false,
        zIndex: 1,
      },
      fpsLimit: 60,
      particles: {
        number: {
          value: 40,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: mainColor,
        },
        shape: {
          type: 'star',
          stroke: {
            width: 0,
            color: '#000000',
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.8,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 6,
          random: {
            enable: true,
            minimumValue: 3,
          },
          anim: {
            enable: true,
            speed: 5,
            size_min: 1,
            sync: false,
          },
        },
        line_linked: {
          enable: false,
        },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: false,
            mode: 'repulse',
          },
          onclick: {
            enable: false,
            mode: 'push',
          },
          resize: true,
        },
      },
      detectRetina: true,
      background: {
        color: 'transparent',
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
#stars-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
