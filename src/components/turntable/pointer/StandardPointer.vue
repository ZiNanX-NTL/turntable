<template>
  <div
    class="pointer-container"
    :class="[
      `position-${position}`,
      `style-${pointerStyle}`,
      { 'is-animating': isAnimating },
    ]"
    :style="pointerStyles"
  >
    <svg
      v-if="pointerStyle === 'standard'"
      viewBox="0 0 60 60"
      class="pointer-svg"
    >
      <path
        d="M30 0 L60 30 L30 60 L0 30 Z"
        :fill="pointerColor"
        class="pointer-path"
      />
      <circle cx="30" cy="30" r="15" fill="#ffffff" />
      <circle cx="30" cy="30" r="10" :fill="color" />
    </svg>

    <svg
      v-else-if="pointerStyle === 'arrow'"
      viewBox="0 0 60 80"
      class="pointer-svg"
    >
      <path
        d="M30 0 L60 50 L40 50 L40 80 L20 80 L20 50 L0 50 Z"
        :fill="color"
        class="pointer-path"
      />
    </svg>

    <div
      v-else-if="pointerStyle === 'hand'"
      class="pointer-hand"
      :style="{ color: color }"
    >
      👆
    </div>

    <slot v-else></slot>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value),
  },
  pointerStyle: {
    type: String,
    default: 'standard',
    validator: (val) => ['standard', 'arrow', 'hand', 'custom'].includes(val),
  },
  color: {
    type: String,
    default: '#f27059',
  },
  size: {
    type: [Number, String],
    default: 40,
  },
  isAnimating: {
    type: Boolean,
    default: false,
  },
})

// 计算指针样式
const pointerStyles = computed(() => {
  const sizeValue =
    typeof props.size === 'number' ? `${props.size}px` : props.size

  return {
    width: sizeValue,
    height: sizeValue,
  }
})
</script>

<style lang="scss" scoped>
.pointer-container {
  position: absolute;
  z-index: 10;

  .pointer-svg,
  .pointer-hand {
    transform: rotate(180deg);
  }

  &.position-top {
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
  }

  &.position-right {
    top: 50%;
    right: -5px;
    transform: translateY(-50%) rotate(90deg);
  }

  &.position-bottom {
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%) rotate(180deg);
  }

  &.position-left {
    top: 50%;
    left: -5px;
    transform: translateY(-50%) rotate(-90deg);
  }

  &.is-animating {
    .pointer-svg,
    .pointer-hand {
      animation: pointer-pulse 1s infinite alternate ease-in-out;
    }
  }
}

.pointer-svg {
  width: 100%;
  height: 100%;
}

.pointer-hand {
  font-size: 2em;
  text-align: center;
  height: 100%;
}

@keyframes pointer-pulse {
  0% {
    transform: rotate(180deg) scale(1);
  }
  100% {
    transform: rotate(180deg) scale(1.2);
  }
}
</style>
