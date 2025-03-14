import { onMounted, onUnmounted } from 'vue'
import { useUiStore } from '@/store/modules/ui'

/**
 * 键盘快捷键钩子
 */
export function useKeyboardShortcuts({
  onSpacebar = null,
  onFullscreen = null,
  onDarkMode = null,
  customShortcuts = {},
} = {}) {
  const uiStore = useUiStore()

  // 快捷键处理函数
  const handleKeyDown = (e) => {
    // 如果在输入框中，不触发快捷键
    if (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
    ) {
      return
    }

    // 空格键 - 开始抽奖
    if (e.key === ' ' && typeof onSpacebar === 'function') {
      e.preventDefault()
      onSpacebar()
    }

    // F或F11键 - 切换全屏
    if (
      (e.key === 'f' || e.key === 'F' || e.key === 'F11') &&
      typeof onFullscreen === 'function'
    ) {
      e.preventDefault()
      onFullscreen()
    }

    // Ctrl+D - 切换暗色模式
    if (
      e.ctrlKey &&
      (e.key === 'd' || e.key === 'D') &&
      typeof onDarkMode === 'function'
    ) {
      e.preventDefault()
      onDarkMode()
    } else if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault()
      uiStore.toggleDarkMode()
    }

    // 自定义快捷键
    Object.entries(customShortcuts).forEach(([key, handler]) => {
      if (e.key === key && typeof handler === 'function') {
        e.preventDefault()
        handler(e)
      }
    })
  }

  // 生命周期钩子
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown,
  }
}
