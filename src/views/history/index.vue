<template>
  <div class="full-page-container history-page">
    <!-- 移除装饰背景 -->

    <AppHeader
      title="历史记录"
      @toggle-menu="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <div class="content-container">
      <AppSidebar
        :collapsed="isSidebarCollapsed"
        @update:collapsed="isSidebarCollapsed = $event"
      />

      <div class="history-container">
        <n-tabs
          type="segment"
          size="large"
          animated
          v-model:value="activeTab"
          @update:value="handleTabChange"
        >
          <n-tab-pane name="records" tab="抽奖记录">
            <div class="tab-panel">
              <div class="filter-bar">
                <n-space align="center">
                  <n-input
                    v-model:value="searchQuery"
                    placeholder="搜索奖项名称"
                    clearable
                    style="width: 200px"
                  >
                    <template #prefix>
                      <n-icon><SearchOutline /></n-icon>
                    </template>
                  </n-input>

                  <n-button
                    @click="exportHistory"
                    quaternary
                    :disabled="!historyStore.records.length"
                  >
                    <template #icon>
                      <n-icon><DownloadOutline /></n-icon>
                    </template>
                    导出
                  </n-button>

                  <n-button
                    @click="confirmClearHistory"
                    quaternary
                    type="error"
                    :disabled="!historyStore.records.length"
                  >
                    <template #icon>
                      <n-icon><TrashOutline /></n-icon>
                    </template>
                    清空
                  </n-button>
                </n-space>

                <n-space>
                  <n-dropdown
                    trigger="click"
                    :options="sortOptions"
                    @select="handleSortChange"
                    :render-label="renderDropdownLabel"
                  >
                    <n-button quaternary>
                      <n-space align="center">
                        <span>{{ getSortLabel }}</span>
                        <n-icon><ChevronDownOutline /></n-icon>
                      </n-space>
                    </n-button>
                  </n-dropdown>
                </n-space>
              </div>

              <div v-if="!historyStore.records.length" class="empty-state">
                <n-empty description="暂无历史记录">
                  <template #extra>
                    <n-button @click="router.push({ name: 'Presentation' })">
                      开始抽奖
                    </n-button>
                  </template>
                </n-empty>
              </div>

              <template v-else>
                <n-scrollbar class="history-list">
                  <div v-if="filteredRecords.length === 0" class="no-results">
                    <n-empty description="未找到匹配记录" />
                  </div>

                  <div v-else class="records-wrapper">
                    <TransitionGroup name="list" tag="div" class="records-grid">
                      <div
                        v-for="record in paginatedRecords"
                        :key="record.id"
                        class="history-record"
                      >
                        <div
                          class="record-color"
                          :style="{ backgroundColor: record.prize.color }"
                        ></div>

                        <div class="record-content">
                          <div class="record-header">
                            <h3 class="record-name">{{ record.prize.name }}</h3>
                            <n-button
                              circle
                              quaternary
                              size="tiny"
                              @click="confirmDeleteRecord(record.id)"
                            >
                              <template #icon>
                                <n-icon><CloseOutline /></n-icon>
                              </template>
                            </n-button>
                          </div>

                          <p class="record-date">
                            {{ formatDate(record.timestamp) }}
                          </p>
                        </div>
                      </div>
                    </TransitionGroup>
                  </div>
                </n-scrollbar>

                <div class="pagination-container">
                  <n-pagination
                    v-model:page="currentPage"
                    :item-count="filteredRecords.length"
                    :page-size="pageSize"
                    show-quick-jumper
                    show-size-picker
                    :page-sizes="[10, 20, 50]"
                    @update:page-size="onPageSizeChange"
                  />
                </div>
              </template>
            </div>
          </n-tab-pane>

          <n-tab-pane name="statistics" tab="数据统计">
            <div class="tab-panel">
              <n-card title="奖项分布" class="stats-card">
                <div class="chart-container">
                  <div id="pie-chart" class="chart"></div>
                </div>
              </n-card>

              <n-card title="抽奖统计" class="stats-card">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-number">
                      {{ historyStore.records.length }}
                    </div>
                    <div class="stat-label">总抽奖次数</div>
                  </div>

                  <div class="stat-item">
                    <div class="stat-number">
                      {{ Object.keys(prizeStats).length }}
                    </div>
                    <div class="stat-label">奖项种类</div>
                  </div>

                  <div class="stat-item">
                    <div class="stat-number">{{ mostFrequentPrize }}</div>
                    <div class="stat-label">最常见奖项</div>
                  </div>

                  <div class="stat-item">
                    <div class="stat-number">
                      {{
                        historyStore.records.length
                          ? formatDate(
                              historyStore.records[
                                historyStore.records.length - 1
                              ].timestamp,
                              'date'
                            )
                          : '-'
                      }}
                    </div>
                    <div class="stat-label">首次抽奖</div>
                  </div>
                </div>
              </n-card>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>

    <!-- 确认清空对话框 -->
    <n-modal
      v-model:show="showClearConfirm"
      preset="dialog"
      type="warning"
      title="确认清空"
      content="确定清空所有历史记录吗？此操作不可撤销。"
      positive-text="确认清空"
      negative-text="取消"
      @positive-click="clearHistory"
      style="width: 90%; max-width: 400px"
    />

    <!-- 确认删除对话框 -->
    <n-modal
      v-model:show="showDeleteConfirm"
      preset="dialog"
      type="warning"
      title="确认删除"
      content="确定删除此记录吗？"
      positive-text="确认删除"
      negative-text="取消"
      @positive-click="deleteRecord"
      style="width: 90%; max-width: 400px"
    />

    <n-message-provider placement="top-right">
      <span ref="messageProviderRef" style="display: none"></span>
    </n-message-provider>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import {
  NTabs,
  NTabPane,
  NInput,
  NButton,
  NIcon,
  NSpace,
  NEmpty,
  NPagination,
  NScrollbar,
  NCard,
  NDropdown,
  NModal,
  NMessageProvider,
  useMessage,
} from 'naive-ui'
import dayjs from 'dayjs'
import {
  SearchOutline,
  DownloadOutline,
  TrashOutline,
  CloseOutline,
  ChevronDownOutline,
} from '@vicons/ionicons5'
import AppHeader from '@/components/common/layout/AppHeader.vue'
import AppSidebar from '@/components/common/layout/AppSidebar.vue'
import { useHistoryStore } from '@/store/modules/history'
import { useUiStore } from '@/store/modules/ui'

// 注册echarts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
])

// 路由
const router = useRouter()

// Store
const historyStore = useHistoryStore()
const uiStore = useUiStore()

// 消息
const messageProviderRef = ref(null)
const message = useMessage()

// 状态
const isSidebarCollapsed = ref(uiStore.isMobile)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const showClearConfirm = ref(false)
const showDeleteConfirm = ref(false)
const currentDeleteId = ref(null)
const sortType = ref('newest')
const activeTab = ref('records') // 添加活动标签页状态
const chartInstance = ref(null) // 添加图表实例引用

// 排序选项
const sortOptions = [
  {
    label: '最新优先',
    key: 'newest',
  },
  {
    label: '最早优先',
    key: 'oldest',
  },
]

// 渲染下拉菜单标签
const renderDropdownLabel = (option) => {
  return h('div', {}, [h('span', {}, option.label)])
}

// 获取当前排序标签
const getSortLabel = computed(() => {
  const option = sortOptions.find((opt) => opt.key === sortType.value)
  return option ? option.label : '最新优先'
})

// 处理排序变更
const handleSortChange = (key) => {
  sortType.value = key
}

// 筛选记录
const filteredRecords = computed(() => {
  let result = [...historyStore.records]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((record) =>
      record.prize.name.toLowerCase().includes(query)
    )
  }

  // 排序
  if (sortType.value === 'newest') {
    result.sort((a, b) => b.timestamp - a.timestamp)
  } else {
    result.sort((a, b) => a.timestamp - b.timestamp)
  }

  return result
})

// 分页记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

// 奖品统计
const prizeStats = computed(() => {
  return historyStore.prizeStatistics
})

// 最常见的奖品
const mostFrequentPrize = computed(() => {
  let maxCount = 0
  let prizeName = '-'

  Object.entries(prizeStats.value).forEach(([name, stats]) => {
    if (stats.count > maxCount) {
      maxCount = stats.count
      prizeName = name
    }
  })

  return prizeName
})

// 格式化日期
const formatDate = (timestamp, type = 'full') => {
  if (!timestamp) return '-'

  if (type === 'full') {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  } else {
    return dayjs(timestamp).format('YYYY-MM-DD')
  }
}

// 分页大小变化
const onPageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 确认清空历史
const confirmClearHistory = () => {
  showClearConfirm.value = true
}

// 清空历史
const clearHistory = () => {
  historyStore.clearRecords()
  message.success('历史记录已清空')
}

// 导出历史
const exportHistory = () => {
  const historyJson = historyStore.exportRecords()
  const blob = new Blob([historyJson], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `turntable-history-${dayjs().format('YYYYMMDD')}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  message.success('历史记录已导出')
}

// 确认删除记录
const confirmDeleteRecord = (id) => {
  currentDeleteId.value = id
  showDeleteConfirm.value = true
}

// 删除记录
const deleteRecord = () => {
  if (currentDeleteId.value) {
    historyStore.removeRecord(currentDeleteId.value)
    message.success('记录已删除')

    // 检查是否需要调整页码
    if (paginatedRecords.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

// 处理标签页切换
const handleTabChange = (value) => {
  activeTab.value = value

  // 切换到统计标签页时初始化或更新图表
  if (value === 'statistics') {
    nextTick(() => {
      initPieChart()
    })
  }
}

// 修复初始化饼图函数
const initPieChart = () => {
  if (!historyStore.records.length) return

  const chartDom = document.getElementById('pie-chart')
  if (!chartDom) return

  // 如果图表实例已存在，先销毁它
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  // 创建新的图表实例
  chartInstance.value = echarts.init(chartDom)

  // 更新图表数据
  updatePieChart()

  // 响应窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 添加图表数据更新函数
const updatePieChart = () => {
  if (!chartInstance.value) return

  const stats = historyStore.prizeStatistics
  const data = Object.entries(stats).map(([name, stat]) => ({
    name,
    value: stat.count,
    itemStyle: { color: stat.color },
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      type: 'scroll',
      textStyle: {
        color: uiStore.isDarkMode ? '#ddd' : '#333',
      },
    },
    series: [
      {
        name: '抽奖结果',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: uiStore.isDarkMode ? '#121212' : '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data,
      },
    ],
  }

  chartInstance.value.setOption(option)
}

// 添加窗口大小变化处理函数
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// 监听暗色模式变化
watch(
  () => uiStore.isDarkMode,
  () => {
    if (chartInstance.value) {
      chartInstance.value.setOption({
        legend: { textStyle: { color: uiStore.isDarkMode ? '#ddd' : '#333' } },
        series: [
          {
            itemStyle: { borderColor: uiStore.isDarkMode ? '#121212' : '#fff' },
          },
        ],
      })
    }
  }
)

// 监听历史记录变化
watch(
  () => historyStore.records,
  () => {
    if (activeTab.value === 'statistics' && chartInstance.value) {
      updatePieChart()
    }
  },
  { deep: true }
)

// 生命周期
onMounted(() => {
  uiStore.detectDeviceSettings()

  // 如果初始标签页是统计，则初始化图表
  nextTick(() => {
    if (activeTab.value === 'statistics') {
      initPieChart()
    }
  })
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
})
</script>

<style lang="scss" scoped>
.history-page {
  background-color: $bg-light;

  .dark-mode & {
    background-color: $dark-bg-base;
  }
}

.history-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.tab-panel {
  padding: 20px 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.history-list {
  height: calc(100vh - 300px);
  min-height: 300px;
}

.records-wrapper {
  padding: 4px;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.history-record {
  background-color: $bg-base;
  border-radius: $border-radius-lg;
  overflow: hidden;
  display: flex;
  transition:
    transform $transition-fast,
    box-shadow $transition-fast;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  .dark-mode & {
    background-color: $dark-bg-light;
  }
}

.record-color {
  width: 6px;
  flex-shrink: 0;
}

.record-content {
  flex: 1;
  padding: 12px 16px;
  min-width: 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.record-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.record-date {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.no-results {
  padding: 40px 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.stats-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;

  .chart {
    height: 100%;
    width: 100%;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 30px 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 8px;
}

.stat-label {
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

// 列表动画
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
