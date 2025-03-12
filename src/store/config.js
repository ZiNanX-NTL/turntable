import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    items: [],
    history: [],
    currentWinner: null,
    settings: {
      enableSound: true,
      enableVibration: true,
      spinDuration: 5,
      turntableTheme: 'standard',
      animationQuality: 'high',
      allowRepeat: true,
      shareEnabled: true, // 启用分享功能
      highContrastMode: false, // 高对比度模式
      autoSave: true, // 自动保存设置
    },
    excluded: [], // 已经抽取过的项目ID (当不允许重复时使用)
    stats: {
      // 统计数据
      totalSpins: 0,
      lastSpin: null,
      itemStats: {}, // 各项目抽中次数统计
    },
  }),

  actions: {
    // 添加奖项
    addItem(item) {
      this.items.push(item)
      this.saveConfig()
    },

    // 更新奖项
    updateItem(updatedItem) {
      const index = this.items.findIndex((item) => item.id === updatedItem.id)
      if (index !== -1) {
        this.items.splice(index, 1, updatedItem)
        this.saveConfig()
      }
    },

    // 删除奖项
    removeItem(id) {
      const index = this.items.findIndex((item) => item.id === id)
      if (index !== -1) {
        this.items.splice(index, 1)
        this.saveConfig()
      }
    },

    // 设置当前获奖项
    setWinner(item) {
      this.currentWinner = item
    },

    // 添加历史记录
    addHistory(item) {
      // 如果不允许重复抽取，记录已抽取项
      if (!this.settings.allowRepeat) {
        this.excluded.push(item.id)
      }

      // 更新统计数据
      this.stats.totalSpins++
      this.stats.lastSpin = Date.now()

      if (!this.stats.itemStats[item.id]) {
        this.stats.itemStats[item.id] = 0
      }
      this.stats.itemStats[item.id]++

      this.history.unshift({
        item,
        time: Date.now(),
      })
      this.saveConfig()
    },

    // 清空历史
    clearHistory() {
      this.history = []
      this.excluded = []
      this.saveConfig()
    },

    // 保存配置到本地存储
    saveConfig() {
      if (!this.settings.autoSave) return

      try {
        localStorage.setItem(
          'turntable-config',
          JSON.stringify({
            items: this.items,
            history: this.history,
            settings: this.settings,
            excluded: this.excluded,
            stats: this.stats,
          })
        )
      } catch (e) {
        console.error('保存配置失败:', e)
      }
    },

    // 从本地存储加载配置
    loadConfig() {
      const config = localStorage.getItem('turntable-config')
      if (config) {
        try {
          const parsedConfig = JSON.parse(config)
          this.items = parsedConfig.items || []
          this.history = parsedConfig.history || []
          this.excluded = parsedConfig.excluded || []
          this.stats = parsedConfig.stats || {
            totalSpins: 0,
            lastSpin: null,
            itemStats: {},
          }
          this.settings = {
            enableSound: true,
            enableVibration: true,
            spinDuration: 5,
            turntableTheme: 'standard',
            animationQuality: 'high',
            allowRepeat: true,
            shareEnabled: true,
            highContrastMode: false,
            autoSave: true,
            ...parsedConfig.settings,
          }

          // 检查高对比度模式
          if (this.settings.highContrastMode) {
            this.settings.turntableTheme = 'highContrast'
          }
        } catch (e) {
          console.error('配置加载失败:', e)
          this.resetConfig()
        }
      } else {
        this.loadDefaultItems()
      }
    },

    // 加载默认奖项
    loadDefaultItems() {
      this.items = [
        {
          id: 'item-1',
          name: '一等奖',
          probability: 10,
          color: '#FF5252',
          description: '恭喜获得一等奖！',
        },
        {
          id: 'item-2',
          name: '二等奖',
          probability: 20,
          color: '#448AFF',
          description: '恭喜获得二等奖！',
        },
        {
          id: 'item-3',
          name: '三等奖',
          probability: 30,
          color: '#69F0AE',
          description: '恭喜获得三等奖！',
        },
        {
          id: 'item-4',
          name: '谢谢参与',
          probability: 40,
          color: '#FFD740',
          description: '感谢您的参与！',
        },
      ]
      this.saveConfig()
    },

    // 重置配置
    resetConfig() {
      this.items = []
      this.history = []
      this.excluded = []
      this.currentWinner = null
      this.stats = {
        totalSpins: 0,
        lastSpin: null,
        itemStats: {},
      }
      this.settings = {
        enableSound: true,
        enableVibration: true,
        spinDuration: 5,
        turntableTheme: 'standard',
        animationQuality: 'high',
        allowRepeat: true,
        shareEnabled: true,
        highContrastMode: false,
        autoSave: true,
      }
      this.loadDefaultItems()
    },

    // 获取导出数据
    getExportData() {
      return {
        items: this.items,
        history: this.history,
        settings: this.settings,
        excluded: this.excluded,
        stats: this.stats,
        exportTime: new Date().toISOString(),
        version: '1.0',
      }
    },

    // 导入配置
    importConfig(config) {
      if (config.items) {
        this.items = config.items
      }
      if (config.history) {
        this.history = config.history
      }
      if (config.excluded) {
        this.excluded = config.excluded
      }
      if (config.settings) {
        this.settings = {
          ...this.settings,
          ...config.settings,
        }
      }
      if (config.stats) {
        this.stats = config.stats
      }
      this.saveConfig()
    },

    // 重置排除列表
    resetExcluded() {
      this.excluded = []
      this.saveConfig()
    },

    // 获取统计信息
    getItemStats(itemId) {
      if (!itemId) return null
      return {
        count: this.stats.itemStats[itemId] || 0,
        percentage:
          this.stats.totalSpins > 0
            ? (
                ((this.stats.itemStats[itemId] || 0) / this.stats.totalSpins) *
                100
              ).toFixed(1)
            : 0,
      }
    },

    // 重置统计数据
    resetStats() {
      this.stats = {
        totalSpins: 0,
        lastSpin: null,
        itemStats: {},
      }
      this.saveConfig()
    },
  },
})
