/**
 * 反馈工具函数
 * 处理声音和震动反馈
 */

// 音效播放
export function playSound(soundName) {
  try {
    const audio = new Audio()
    audio.src = `/sounds/${soundName}.mp3`
    return audio.play()
  } catch (e) {
    console.log('音效播放失败:', e)
    return Promise.reject(e)
  }
}

// 震动反馈
export function vibrate(pattern) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch (e) {
      console.log('震动反馈失败:', e)
    }
  }
}

// 组合反馈
export function provideFeedback(type) {
  const settings = JSON.parse(localStorage.getItem('turntable-config') || '{}')
  const userSettings = settings.settings || {}

  if (userSettings.enableSound !== false) {
    playSound(type).catch(() => {})
  }

  if (userSettings.enableVibration !== false) {
    switch (type) {
      case 'spin':
        vibrate(100)
        break
      case 'win':
        vibrate([100, 50, 200])
        break
      default:
        vibrate(50)
    }
  }
}
