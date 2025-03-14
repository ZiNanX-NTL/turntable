<template>
  <div id="confetti-container"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { tsParticles } from '@tsparticles/engine'
import { loadFull } from 'tsparticles'

// 组件属性
const props = defineProps({
  color: {
    type: String,
    default: '#f27059',
  },
})

// 保存实例ID
let particlesId = null

// 组件挂载时初始化粒子
onMounted(async () => {
  await loadFull(tsParticles)

  // 提取颜色
  const mainColor = props.color || '#f27059'
  const colorArray = [mainColor, '#ffffff', '#4777FF', '#FFD700', '#47D4FF']

  // 初始化彩带效果
  particlesId = await tsParticles.load({
    id: 'confetti-container',
    options: {
      fullScreen: {
        enable: false,
        zIndex: 1,
      },
      fpsLimit: 60,
      particles: {
        number: {
          value: 0,
        },
        color: {
          value: colorArray,
        },
        shape: {
          type: ['square', 'circle', 'triangle', 'star'],
        },
        opacity: {
          value: { min: 0.3, max: 0.8 },
        },
        size: {
          value: { min: 2, max: 8 },
        },
        move: {
          enable: true,
          gravity: {
            enable: true,
            acceleration: 9.8,
          },
          speed: { min: 10, max: 25 },
          direction: 'none',
          random: true,
          straight: false,
          outMode: 'destroy',
        },
        rotate: {
          value: {
            min: 0,
            max: 360,
          },
          animation: {
            enable: true,
            speed: 10,
          },
        },
        tilt: {
          value: {
            min: 0,
            max: 360,
          },
          animation: {
            enable: true,
            speed: 10,
          },
        },
        roll: {
          darken: {
            enable: true,
            value: 25,
          },
          enable: true,
          speed: {
            min: 15,
            max: 25,
          },
        },
        wobble: {
          distance: 30,
          enable: true,
          speed: {
            min: -15,
            max: 15,
          },
        },
      },
      detectRetina: true,
      emitters: [
        {
          position: {
            x: 0,
            y: 30,
          },
          rate: {
            delay: 0.1,
            quantity: 5,
          },
          size: {
            width: 0,
            height: 0,
          },
          particles: {
            move: {
              angle: {
                offset: -55,
                value: 90,
              },
            },
          },
        },
        {
          position: {
            x: 100,
            y: 30,
          },
          rate: {
            delay: 0.1,
            quantity: 5,
          },
          size: {
            width: 0,
            height: 0,
          },
          particles: {
            move: {
              angle: {
                offset: 55,
                value: 90,
              },
            },
          },
        },
      ],
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
#confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>
