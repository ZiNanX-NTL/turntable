/**
 * 概率计算工具
 */

/**
 * 归一化概率值，确保总和为100
 * @param {Array} items 包含概率的项目数组
 * @param {string} probabilityKey 概率属性的键名
 * @returns {Array} 归一化后的项目数组
 */
export function normalizeProbabilities(items, probabilityKey = 'probability') {
  if (!items || items.length === 0) return []

  const total = items.reduce((sum, item) => sum + (item[probabilityKey] || 0), 0)
  
  if (total === 0) {
    // 如果总概率为0，则平均分配
    const equalProbability = 100 / items.length
    return items.map(item => ({
      ...item,
      normalizedProbability: equalProbability
    }))
  }
  
  // 归一化计算
  return items.map(item => ({
    ...item,
    normalizedProbability: ((item[probabilityKey] || 0) / total) * 100
  }))
}

/**
 * 基于概率选择一个项目
 * @param {Array} items 项目数组
 * @param {string} probabilityKey 概率属性的键名
 * @returns {Object} 选中的项目
 */
export function selectByProbability(items, probabilityKey = 'probability') {
  if (!items || items.length === 0) return null
  
  const normalizedItems = normalizeProbabilities(items, probabilityKey)
  const random = Math.random() * 100
  
  let probabilitySum = 0
  
  for (const item of normalizedItems) {
    probabilitySum += item.normalizedProbability
    if (random <= probabilitySum) {
      return item
    }
  }
  
  // 如果由于浮点精度问题没有选中，则返回最后一个
  return normalizedItems[normalizedItems.length - 1]
}

/**
 * 计算角度区间
 * @param {Array} items 项目数组
 * @param {string} probabilityKey 概率属性的键名
 * @returns {Array} 角度区间数组 [{item, startAngle, endAngle}]
 */
export function calculateAngleRanges(items, probabilityKey = 'probability') {
  const normalizedItems = normalizeProbabilities(items, probabilityKey)
  
  const angleRanges = []
  let startAngle = 0
  
  for (const item of normalizedItems) {
    const angle = (item.normalizedProbability / 100) * 360
    const endAngle = startAngle + angle
    
    angleRanges.push({
      item,
      startAngle,
      endAngle
    })
    
    startAngle = endAngle
  }
  
  return angleRanges
}

/**
 * 使用概率工具的组合式函数
 */
export function useProbability() {
  return {
    normalizeProbabilities,
    selectByProbability,
    calculateAngleRanges
  }
}
