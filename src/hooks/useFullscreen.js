import { ref, shallowRef, onMounted, onUnmounted } from 'vue'

/**
 * 增强的全屏控制钩子
 * @param {Ref<HTMLElement>|null} targetRef 目标元素的ref引用
 */
export function useFullscreen(targetRef = null) {
  const isFullscreen = ref(false)
  const targetElement = shallowRef(null)

  // 检查浏览器前缀支持
  const prefix = getBrowserFullscreenPrefix()

  // 检查是否支持全屏
  const isFullscreenSupported = prefix !== null

  // 获取进入全屏的方法名
  const requestFullscreenMethod =
    prefix === null
      ? null
      : prefix === ''
        ? 'requestFullscreen'
        : `${prefix}RequestFullscreen`

  // 获取退出全屏的方法名
  const exitFullscreenMethod =
    prefix === null
      ? null
      : prefix === ''
        ? 'exitFullscreen'
        : `${prefix}ExitFullscreen`

  // 获取全屏元素的属性名
  const fullscreenElementProp =
    prefix === null
      ? null
      : prefix === ''
        ? 'fullscreenElement'
        : `${prefix}FullscreenElement`

  // 进入全屏
  const enterFullscreen = async () => {
    if (!isFullscreenSupported) {
      console.error('当前浏览器不支持全屏API')
      return false
    }

    // 确定目标元素
    const element = targetRef?.value || document.documentElement
    if (!element) {
      console.error('找不到目标元素')
      return false
    }

    try {
      // 保存目标元素引用
      targetElement.value = element

      // 调用全屏方法
      if (element[requestFullscreenMethod]) {
        await element[requestFullscreenMethod]()
        return true
      } else {
        console.error('目标元素不支持全屏')
        return false
      }
    } catch (error) {
      console.error('进入全屏失败:', error)
      return false
    }
  }

  // 退出全屏
  const exitFullscreen = async () => {
    if (!isFullscreenSupported) return false

    try {
      if (document[fullscreenElementProp]) {
        // 调用对应的退出全屏API
        if (document[exitFullscreenMethod]) {
          await document[exitFullscreenMethod]()
          return true
        }
      } else {
        // 已经退出全屏
        return true
      }
    } catch (error) {
      console.error('退出全屏失败:', error)
      return false
    }

    return false
  }

  // 切换全屏状态
  const toggleFullscreen = async () => {
    console.log('切换全屏', targetRef?.value)
    if (isFullscreen.value) {
      return exitFullscreen()
    } else {
      return enterFullscreen()
    }
  }

  // 处理全屏变化事件
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document[fullscreenElementProp]
    console.log('全屏状态变化:', isFullscreen.value)
  }

  // 获取浏览器全屏API前缀
  function getBrowserFullscreenPrefix() {
    if (typeof document === 'undefined') return null

    if (document.fullscreenEnabled !== undefined) return ''
    if (document.webkitFullscreenEnabled !== undefined) return 'webkit'
    if (document.mozFullScreenEnabled !== undefined) return 'moz'
    if (document.msFullscreenEnabled !== undefined) return 'ms'

    return null // 不支持全屏API
  }

  // 添加事件监听
  onMounted(() => {
    const fullscreenChangeEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ]

    fullscreenChangeEvents.forEach((eventName) => {
      document.addEventListener(eventName, handleFullscreenChange)
    })
  })

  // 移除事件监听
  onUnmounted(() => {
    const fullscreenChangeEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ]

    fullscreenChangeEvents.forEach((eventName) => {
      document.removeEventListener(eventName, handleFullscreenChange)
    })
  })

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    isFullscreenSupported,
    targetElement,
  }
}
