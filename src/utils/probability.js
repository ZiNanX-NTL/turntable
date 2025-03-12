/**
 * 根据概率计算获胜项
 * @param {Array} items 奖项列表，每个奖项必须有probability属性
 * @param {Array} excludedIds 需要排除的项目ID列表
 * @returns {Object|null} 获胜的奖项或null
 */
export function calculateWinner(items, excludedIds = []) {
  if (!items || items.length === 0) {
    return null
  }

  // 过滤掉已排除的项目
  const availableItems =
    excludedIds.length > 0
      ? items.filter((item) => !excludedIds.includes(item.id))
      : items

  // 如果所有项目都被排除了，返回null
  if (availableItems.length === 0) {
    return null
  }

  // 计算总概率
  const totalProbability = availableItems.reduce(
    (sum, item) => sum + (parseFloat(item.probability) || 0),
    0
  )

  // 如果总概率为0，随机选择一项
  if (totalProbability <= 0) {
    return availableItems[Math.floor(Math.random() * availableItems.length)]
  }

  // 随机数，范围0到总概率
  const randomValue = Math.random() * totalProbability

  // 根据概率范围确定获胜项
  let currentSum = 0
  for (const item of availableItems) {
    currentSum += parseFloat(item.probability) || 0
    if (randomValue <= currentSum) {
      return item
    }
  }

  // 防止意外情况，默认返回最后一项
  return availableItems[availableItems.length - 1]
}
