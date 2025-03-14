<template>
  <div class="winner-display" :class="animationClass">
    <div class="winner-overlay" @click="handleClose"></div>

    <div class="winner-card" style="width: 90%; max-width: 450px">
      <div class="winner-header">
        <h2 class="winner-title">恭喜抽中</h2>
        <n-button circle quaternary class="close-button" @click="handleClose">
          <template #icon>
            <n-icon><CloseOutline /></n-icon>
          </template>
        </n-button>
      </div>

      <div class="result-content">
        <div
          class="result-icon"
          :style="{ backgroundColor: result?.color || '#f27059' }"
        >
          <template v-if="result?.icon">
            <img :src="result.icon" :alt="result.name" class="prize-image" />
          </template>
          <template v-else>
            <n-icon size="40">
              <GiftOutline />
            </n-icon>
          </template>
        </div>

        <h1 class="prize-name">{{ result?.name || '未知奖项' }}</h1>

        <p class="prize-desc" v-if="result?.description">
          {{ result.description }}
        </p>
      </div>

      <div class="action-buttons">
        <n-button type="primary" size="large" @click="handleClose">
          确认
        </n-button>
      </div>
    </div>

    <component
      :is="currentEffect"
      v-if="currentEffect"
      :color="result?.color"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { CloseOutline, GiftOutline } from '@vicons/ionicons5'
import Confetti from './ParticleEffects/Confetti.vue'
import Fireworks from './ParticleEffects/Fireworks.vue'
import Stars from './ParticleEffects/Stars.vue'

// 组件属性
const props = defineProps({
  result: {
    type: Object,
    default: () => ({}),
  },
  config: {
    type: Object,
    default: () => ({}),
  },
})

// 组件事件
const emit = defineEmits(['close'])

// 组件状态
const animationClass = ref('animate-in')
const currentEffect = shallowRef(null)

// 效果映射
const effectComponents = {
  confetti: Confetti,
  fireworks: Fireworks,
  stars: Stars,
}

// 创建时设置粒子效果
onMounted(() => {
  const effectName = props.config.animation || 'confetti'
  currentEffect.value = effectComponents[effectName] || Confetti
})

// 销毁前移除粒子效果
onBeforeUnmount(() => {
  currentEffect.value = null
})

// 处理关闭结果
const handleClose = () => {
  animationClass.value = 'animate-out'

  setTimeout(() => {
    emit('close')
  }, 300)
}
</script>

<style lang="scss" scoped>
.winner-display {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  &.animate-in {
    .winner-overlay {
      animation: fadeIn 0.3s ease forwards;
    }

    .winner-card {
      animation: zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  }

  &.animate-out {
    .winner-overlay {
      animation: fadeOut 0.3s ease forwards;
    }

    .winner-card {
      animation: zoomOut 0.3s ease forwards;
    }
  }
}

.winner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
}

.winner-card {
  position: relative;
  width: 90%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  z-index: 10;

  .dark-mode & {
    background: $dark-bg-light;
    color: $dark-text-primary;
  }
}

.winner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.winner-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: bold;
  color: $primary-color;
}

.close-button {
  color: $text-secondary;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px 0 30px;
}

.result-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.prize-image {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.prize-name {
  font-size: 2rem;
  margin: 0 0 10px 0;
  text-align: center;
  font-weight: 700;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textShine 3s infinite linear;
}

.prize-desc {
  text-align: center;
  color: $text-secondary;
  margin: 0 0 20px 0;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes zoomOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes textShine {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
