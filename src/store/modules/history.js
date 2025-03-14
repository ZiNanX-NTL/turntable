import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    records: [],
    maxRecords: 100 // 最多保存的历史记录数
  }),

  getters: {
    recentRecords: (state) => {
      return [...state.records].reverse().slice(0, 10)
    },
    
    recordCount: (state) => state.records.length,
    
    // 按奖品分组统计
    prizeStatistics: (state) => {
      const stats = {}
      state.records.forEach(record => {
        const prizeName = record.prize.name
        if (!stats[prizeName]) {
          stats[prizeName] = {
            count: 0,
            color: record.prize.color,
            percentage: 0
          }
        }
        stats[prizeName].count++
      })
      
      // 计算百分比
      const total = state.records.length
      if (total > 0) {
        Object.keys(stats).forEach(key => {
          stats[key].percentage = (stats[key].count / total) * 100
        })
      }
      
      return stats
    }
  },

  actions: {
    // 添加新的抽奖记录
    addRecord(prize) {
      const newRecord = {
        id: uuidv4(),
        prize: { ...prize },
        timestamp: Date.now(),
        date: new Date().toISOString()
      }
      
      this.records.push(newRecord)
      
      // 如果记录超过最大数量，删除最老的记录
      if (this.records.length > this.maxRecords) {
        this.records.shift()
      }
      
      return newRecord
    },
    
    // 清空历史记录
    clearRecords() {
      this.records = []
    },
    
    // 导出历史记录
    exportRecords() {
      return JSON.stringify({
        records: this.records,
        exportDate: new Date().toISOString()
      })
    },
    
    // 导入历史记录
    importRecords(recordsJson) {
      try {
        const data = JSON.parse(recordsJson)
        if (Array.isArray(data.records)) {
          this.records = [...data.records]
          return true
        }
        return false
      } catch (error) {
        console.error('导入历史记录失败:', error)
        return false
      }
    },
    
    // 删除单条记录
    removeRecord(id) {
      const index = this.records.findIndex(r => r.id === id)
      if (index !== -1) {
        this.records.splice(index, 1)
        return true
      }
      return false
    }
  },

  persist: {
    key: 'turntable-history',
    storage: localStorage
  }
})
