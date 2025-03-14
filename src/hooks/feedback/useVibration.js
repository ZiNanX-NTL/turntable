/**
 * 震动反馈钩子
 */
export function useVibration() {
  // 检查震动API是否可用
  const isVibrationSupported = () => {
    return 'vibrate' in navigator || 'mozVibrate' in navigator
  }

  /**
   * 触发震动
   * @param {number|number[]} pattern 震动模式，可以是单个时间（ms）或时间数组（开/关/开...）
   * @returns {boolean} 是否成功触发震动
   */
  const vibrate = (pattern) => {
    if (!isVibrationSupported()) return false

    try {
      navigator.vibrate =
        navigator.vibrate ||
        navigator.webkitVibrate ||
        navigator.mozVibrate ||
        navigator.msVibrate

      navigator.vibrate(pattern)
      return true
    } catch (error) {
      console.warn('震动触发失败:', error)
      return false
    }
  }

  /**
   * 停止震动
   */
  const stopVibration = () => {
    if (isVibrationSupported()) {
      navigator.vibrate(0)
    }
  }

  /**
   * 预定义模式
   */
  const patterns = {
    // 短震动
    short: 100,

    // 长震动
    long: 400,

    // 双震动
    double: [100, 100, 100],

    // 成功模式
    success: [100, 50, 200],

    // 错误模式
    error: [100, 50, 100, 50, 300],

    // 警告模式
    warning: [300, 100, 300],

    // 通知模式
    notification: [50, 50, 50, 50, 150],
  }

  /**
   * 使用预定义模式震动
   * @param {string} patternName 模式名称
   * @returns {boolean} 是否成功震动
   */
  const vibratePattern = (patternName) => {
    if (patterns[patternName]) {
      return vibrate(patterns[patternName])
    }
    return false
  }

  return {
    vibrate,
    stopVibration,
    vibratePattern,
    isVibrationSupported: isVibrationSupported(),
    patterns,
  }
}
