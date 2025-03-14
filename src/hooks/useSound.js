import { ref } from 'vue'
import { Howl } from 'howler'

/**
 * 音效处理钩子
 */
export function useSound() {
  const sounds = ref(new Map())
  const isMuted = ref(false)
  const volume = ref(0.7)

  /**
   * 加载音效
   * @param {string} id 音效ID
   * @param {string} src 音效文件地址
   * @param {Object} options 配置选项
   */
  const loadSound = (id, src, options = {}) => {
    if (sounds.value.has(id)) {
      return sounds.value.get(id)
    }

    const defaultOptions = {
      src: [src],
      volume: volume.value,
      preload: true,
      html5: true // 使用HTML5 Audio
    }

    const sound = new Howl({
      ...defaultOptions,
      ...options
    })

    sounds.value.set(id, sound)
    return sound
  }

  /**
   * 播放音效
   * @param {string} id 音效ID
   * @returns {number} soundId
   */
  const playSound = (id) => {
    if (isMuted.value) return -1
    
    const sound = sounds.value.get(id)
    if (!sound) return -1
    
    return sound.play()
  }

  /**
   * 停止音效
   * @param {string} id 音效ID
   */
  const stopSound = (id) => {
    const sound = sounds.value.get(id)
    if (sound) {
      sound.stop()
    }
  }

  /**
   * 暂停音效
   * @param {string} id 音效ID
   * @param {number} soundId 可选，特定音效实例ID
   */
  const pauseSound = (id, soundId) => {
    const sound = sounds.value.get(id)
    if (sound) {
      if (soundId !== undefined) {
        sound.pause(soundId)
      } else {
        sound.pause()
      }
    }
  }

  /**
   * 设置全局音量
   * @param {number} value 音量值(0-1)
   */
  const setVolume = (value) => {
    volume.value = Math.max(0, Math.min(1, value))
    
    sounds.value.forEach(sound => {
      sound.volume(volume.value)
    })
  }

  /**
   * 静音切换
   * @param {boolean} value 是否静音
   */
  const toggleMute = (value = null) => {
    isMuted.value = value !== null ? value : !isMuted.value
    
    sounds.value.forEach(sound => {
      sound.mute(isMuted.value)
    })
  }

  /**
   * 清理所有音效
   */
  const unloadAllSounds = () => {
    sounds.value.forEach(sound => {
      sound.unload()
    })
    sounds.value.clear()
  }

  return {
    loadSound,
    playSound,
    stopSound,
    pauseSound,
    setVolume,
    toggleMute,
    unloadAllSounds,
    isMuted,
    volume
  }
}
