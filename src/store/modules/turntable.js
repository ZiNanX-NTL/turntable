import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useTurntableStore = defineStore('turntable', {
  state: () => ({
    prizes: [
      { id: '1', name: '一等奖', probability: 5, color: '#FF4747', icon: '' },
      { id: '2', name: '二等奖', probability: 10, color: '#FFAD47', icon: '' },
      { id: '3', name: '三等奖', probability: 15, color: '#4777FF', icon: '' },
      { id: '4', name: '四等奖', probability: 20, color: '#47FF83', icon: '' },
      { id: '5', name: '参与奖', probability: 50, color: '#9747FF', icon: '' },
    ],
    wheelConfig: {
      type: 'konva',
      spinDuration: 5000,
      easing: 'Power2.easeOut',
      radius: 200,
      textDistance: 0.75,
      textSize: 16,
      borderWidth: 5,
      borderColor: '#ffffff',
    },
    pointerConfig: {
      style: 'standard',
      position: 'top',
      size: 40,
      color: '#f27059',
    },
    resultConfig: {
      showDuration: 3000,
      animation: 'confetti',
      autoClose: true,
    },
    soundConfig: {
      enabled: true,
      volume: 0.7,
      startSound: '/sounds/start.mp3',
      spinningSound: '/sounds/spinning.mp3',
      resultSound: '/sounds/result.mp3',
    },
    // 新增演示模式配置
    presentationConfig: {
      background: {
        imageUrl: '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      },
    },
  }),

  getters: {
    // 获取奖品总数
    prizeCount: (state) => state.prizes.length,

    // 归一化后的概率 (确保所有概率和为100)
    normalizedPrizes: (state) => {
      const total = state.prizes.reduce(
        (sum, prize) => sum + prize.probability,
        0
      )
      if (total === 0) return state.prizes

      return state.prizes.map((prize) => ({
        ...prize,
        normalizedProbability: (prize.probability / total) * 100,
      }))
    },
  },

  actions: {
    // 添加奖品
    addPrize(prize) {
      const newPrize = {
        id: uuidv4(),
        name: prize.name || '未命名',
        probability: prize.probability || 10,
        color: prize.color || this.getRandomColor(),
        icon: prize.icon || '',
      }
      this.prizes.push(newPrize)
      return newPrize.id
    },

    // 删除奖品
    removePrize(id) {
      const index = this.prizes.findIndex((p) => p.id === id)
      if (index !== -1) {
        this.prizes.splice(index, 1)
        return true
      }
      return false
    },

    // 更新奖品
    updatePrize(id, updates) {
      const index = this.prizes.findIndex((p) => p.id === id)
      if (index !== -1) {
        this.prizes[index] = { ...this.prizes[index], ...updates }
        return true
      }
      return false
    },

    // 更新转盘配置 - 确保更新正确
    updateWheelConfig(config) {
      console.log('Store updating wheelConfig:', config)
      this.wheelConfig = { ...this.wheelConfig, ...config }
    },

    // 更新指针配置
    updatePointerConfig(config) {
      console.log('Store updating pointerConfig:', config)
      this.pointerConfig = { ...this.pointerConfig, ...config }
    },

    // 更新结果配置
    updateResultConfig(config) {
      console.log('Store updating resultConfig:', config)
      this.resultConfig = { ...this.resultConfig, ...config }
    },

    // 更新声音配置
    updateSoundConfig(config) {
      console.log('Store updating soundConfig:', config)
      this.soundConfig = { ...this.soundConfig, ...config }
    },

    // 更新演示模式配置
    updatePresentationConfig(config) {
      console.log('Store updating presentationConfig:', config)
      this.presentationConfig = { ...this.presentationConfig, ...config }
    },

    // 更新背景配置
    updateBackgroundConfig(config) {
      console.log('Store updating background config:', config)
      this.presentationConfig.background = {
        ...this.presentationConfig.background,
        ...config,
      }
    },

    // 生成随机颜色
    getRandomColor() {
      const colors = [
        '#FF4747',
        '#FF8147',
        '#FFB347',
        '#FFE247',
        '#A7FF47',
        '#47FF83',
        '#47FFC4',
        '#47D4FF',
        '#4777FF',
        '#8347FF',
        '#C447FF',
        '#FF47D8',
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    },

    // 导入配置 - 更新以包含新字段
    importConfig(config) {
      if (config.prizes) this.prizes = config.prizes
      if (config.wheelConfig) this.wheelConfig = config.wheelConfig
      if (config.pointerConfig) this.pointerConfig = config.pointerConfig
      if (config.resultConfig) this.resultConfig = config.resultConfig
      if (config.soundConfig) this.soundConfig = config.soundConfig
      // 确保演示模式配置（包括背景图片）被导入
      if (config.presentationConfig)
        this.presentationConfig = config.presentationConfig
    },
  },

  persist: {
    key: 'turntable-data',
    storage: localStorage,
  },
})
