<template>
  <div class="config-panel">
    <n-tabs type="line" animated>
      <n-tab-pane name="items" tab="奖项设置">
        <n-space vertical>
          <div class="panel-header">
            <n-button @click="addNewItem" type="primary"> 添加奖项 </n-button>
            <n-button @click="importConfig" text> 导入 </n-button>
            <n-button @click="exportConfig" text> 导出 </n-button>
          </div>

          <!-- 奖项列表 -->
          <n-empty v-if="configStore.items.length === 0" description="暂无奖项">
            <template #extra>
              <n-button @click="addNewItem" type="primary"> 添加奖项 </n-button>
            </template>
          </n-empty>

          <div v-else class="items-list">
            <n-card
              v-for="(item, index) in configStore.items"
              :key="item.id"
              class="item-card"
              :bordered="false"
              size="small"
            >
              <template #header>
                <div class="item-header">
                  <div
                    class="item-color"
                    :style="{
                      backgroundColor: item.color || getColorByIndex(index),
                    }"
                  ></div>
                  <div class="item-name">{{ item.name }}</div>
                </div>
              </template>

              <n-space justify="space-between">
                <div class="item-probability">
                  概率: {{ formatProbability(item.probability) }}%
                </div>
                <n-space>
                  <n-button size="small" @click="editItem(item)">编辑</n-button>
                  <n-button size="small" type="error" @click="removeItem(item)"
                    >删除</n-button
                  >
                </n-space>
              </n-space>
            </n-card>
          </div>
        </n-space>
      </n-tab-pane>

      <n-tab-pane name="history" tab="历史记录">
        <n-space vertical>
          <div class="panel-header">
            <n-button
              @click="configStore.clearHistory()"
              type="error"
              :disabled="configStore.history.length === 0"
            >
              清空记录
            </n-button>
          </div>

          <!-- 历史记录列表 -->
          <n-empty
            v-if="configStore.history.length === 0"
            description="暂无记录"
          />

          <div v-else class="history-list">
            <n-timeline>
              <n-timeline-item
                v-for="(record, index) in configStore.history"
                :key="index"
                :type="getTimelineType(index)"
                :title="record.item.name"
              >
                <template #content>
                  <div class="history-content">
                    <span class="history-time">{{
                      formatTime(record.time)
                    }}</span>
                  </div>
                </template>
              </n-timeline-item>
            </n-timeline>
          </div>
        </n-space>
      </n-tab-pane>

      <n-tab-pane name="stats" tab="统计信息">
        <n-space vertical>
          <div class="panel-header">
            <n-button
              @click="configStore.resetStats()"
              type="warning"
              :disabled="configStore.stats.totalSpins === 0"
            >
              重置统计
            </n-button>
          </div>

          <!-- 统计信息 -->
          <n-empty
            v-if="configStore.stats.totalSpins === 0"
            description="暂无统计数据"
          />

          <div v-else class="stats-container">
            <div class="stats-summary">
              <n-statistic label="总抽奖次数">
                <template #value>{{ configStore.stats.totalSpins }}</template>
              </n-statistic>
              <n-statistic label="最后抽奖时间">
                <template #value>{{
                  formatTime(configStore.stats.lastSpin)
                }}</template>
              </n-statistic>
            </div>

            <n-divider>各奖项统计</n-divider>

            <n-data-table
              :columns="statsColumns"
              :data="statsData"
              :pagination="{ pageSize: 10 }"
            />
          </div>
        </n-space>
      </n-tab-pane>

      <n-tab-pane name="settings" tab="设置">
        <n-space vertical>
          <!-- 音效设置 -->
          <n-divider title-placement="left">反馈设置</n-divider>
          <n-form-item label="启用音效">
            <n-switch v-model:value="configStore.settings.enableSound" />
          </n-form-item>
          <n-form-item label="启用震动">
            <n-switch v-model:value="configStore.settings.enableVibration" />
          </n-form-item>

          <!-- 转盘设置 -->
          <n-divider title-placement="left">转盘设置</n-divider>
          <n-form-item label="旋转时间 (秒)">
            <n-slider
              v-model:value="configStore.settings.spinDuration"
              :min="2"
              :max="10"
              :step="0.5"
              :tooltip="true"
            />
          </n-form-item>
          <n-form-item label="转盘主题">
            <n-select
              v-model:value="configStore.settings.turntableTheme"
              :options="themeOptions"
            />
          </n-form-item>

          <!-- 外观设置 -->
          <n-divider title-placement="left">外观设置</n-divider>
          <n-form-item label="动画流畅度">
            <n-select
              v-model:value="configStore.settings.animationQuality"
              :options="qualityOptions"
            />
          </n-form-item>
          <n-form-item label="高对比度模式">
            <n-switch
              v-model:value="configStore.settings.highContrastMode"
              @update:value="updateContrastMode"
            />
          </n-form-item>

          <!-- 高级设置 -->
          <n-divider title-placement="left">高级设置</n-divider>
          <n-form-item label="允许重复抽取">
            <n-switch v-model:value="configStore.settings.allowRepeat" />
          </n-form-item>
          <n-form-item label="启用分享功能">
            <n-switch v-model:value="configStore.settings.shareEnabled" />
          </n-form-item>
          <n-form-item label="自动保存设置">
            <n-switch v-model:value="configStore.settings.autoSave" />
          </n-form-item>
          <n-form-item label="持久化数据">
            <n-space vertical>
              <n-button @click="exportConfig" size="small"
                >导出所有数据</n-button
              >
              <n-button @click="importConfig" size="small">导入数据</n-button>
              <n-button @click="clearCache" size="small" type="warning"
                >清除本地缓存</n-button
              >
            </n-space>
          </n-form-item>

          <!-- 访问性设置 -->
          <n-divider title-placement="left">无障碍设置</n-divider>
          <n-form-item>
            <n-button block @click="openAccessibilityHelp"
              >无障碍使用帮助</n-button
            >
          </n-form-item>

          <!-- 其他设置 -->
          <n-divider title-placement="left">其他设置</n-divider>
          <n-form-item>
            <n-button @click="resetConfig" type="warning" block
              >恢复默认设置</n-button
            >
          </n-form-item>
        </n-space>
      </n-tab-pane>
    </n-tabs>

    <!-- 添加/编辑奖项弹窗 -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      title="奖项设置"
      style="width: 500px; max-width: 90vw"
    >
      <n-form
        ref="formRef"
        :model="currentItem"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="奖项名称" path="name">
          <n-input
            v-model:value="currentItem.name"
            placeholder="输入奖项名称"
          />
        </n-form-item>
        <n-form-item label="中奖概率" path="probability">
          <n-input-number
            v-model:value="currentItem.probability"
            :min="0"
            :max="100"
            :precision="1"
          >
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="奖项颜色">
          <n-color-picker v-model:value="currentItem.color" />
        </n-form-item>
        <n-form-item label="奖项描述">
          <n-input
            v-model:value="currentItem.description"
            type="textarea"
            placeholder="输入奖项描述（可选）"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="saveItem">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 导入导出设置 -->
    <n-modal
      v-model:show="showImportModal"
      preset="card"
      title="导入配置"
      style="width: 600px; max-width: 90vw"
    >
      <n-input
        v-model:value="importText"
        type="textarea"
        placeholder="请粘贴JSON配置数据"
        :autosize="{ minRows: 5, maxRows: 15 }"
      />
      <template #footer>
        <n-space justify="end">
          <n-button @click="showImportModal = false">取消</n-button>
          <n-button type="primary" @click="confirmImport">导入</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 无障碍帮助弹窗 -->
    <n-modal
      v-model:show="showAccessibilityModal"
      preset="card"
      title="无障碍使用帮助"
      style="width: 600px; max-width: 90vw"
    >
      <n-space vertical>
        <h3>键盘操作</h3>
        <ul>
          <li>使用 Tab 键在页面上的各元素之间导航</li>
          <li>在抽奖按钮上按 Enter 或空格键开始抽奖</li>
          <li>使用箭头键在设置菜单中导航</li>
        </ul>

        <h3>屏幕阅读器支持</h3>
        <p>本应用支持屏幕阅读器，会自动朗读抽奖结果和重要通知。</p>

        <h3>高对比度模式</h3>
        <p>在设置中开启高对比度模式可提高视觉可识别性。</p>
      </n-space>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAccessibilityModal = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import {
  NSpace,
  NButton,
  NCard,
  NTabs,
  NTabPane,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NColorPicker,
  NEmpty,
  NDivider,
  NSwitch,
  NSlider,
  NTimeline,
  NTimelineItem,
  useMessage,
  NSelect,
  NStatistic,
  NDataTable,
} from 'naive-ui'
import { useConfigStore } from '../store/config'

const configStore = useConfigStore()
const message = useMessage()
const formRef = ref(null)

// 模态框控制
const showAddModal = ref(false)
const showImportModal = ref(false)

// 导入数据
const importText = ref('')

// 当前编辑的项目
const currentItem = reactive({
  id: '',
  name: '',
  probability: 10,
  color: '',
  description: '',
  isNew: true,
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入奖项名称', trigger: 'blur' }],
  probability: [
    {
      required: true,
      type: 'number',
      message: '请设置中奖概率',
      trigger: ['blur', 'change'],
    },
    {
      type: 'number',
      min: 0,
      max: 100,
      message: '概率范围 0-100',
      trigger: ['blur', 'change'],
    },
  ],
}

// 添加/编辑奖项
function addNewItem() {
  Object.assign(currentItem, {
    id: generateUUID(),
    name: '',
    probability: 10,
    color: getColorByIndex(configStore.items.length),
    description: '',
    isNew: true,
  })
  showAddModal.value = true
}

function editItem(item) {
  Object.assign(currentItem, {
    ...JSON.parse(JSON.stringify(item)),
    isNew: false,
  })
  showAddModal.value = true
}

function saveItem() {
  formRef.value?.validate((errors) => {
    if (errors) return

    if (currentItem.isNew) {
      configStore.addItem({
        id: currentItem.id,
        name: currentItem.name,
        probability: currentItem.probability,
        color: currentItem.color,
        description: currentItem.description,
      })
      message.success('奖项添加成功')
    } else {
      configStore.updateItem({
        id: currentItem.id,
        name: currentItem.name,
        probability: currentItem.probability,
        color: currentItem.color,
        description: currentItem.description,
      })
      message.success('奖项更新成功')
    }

    showAddModal.value = false
  })
}

function removeItem(item) {
  configStore.removeItem(item.id)
  message.success('奖项已删除')
}

// 导入导出配置
function exportConfig() {
  const config = configStore.getExportData()
  const dataStr = JSON.stringify(config, null, 2)

  // 创建下载链接
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr)
  )
  element.setAttribute(
    'download',
    `turntable-config-${new Date().toISOString().split('T')[0]}.json`
  )
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

  message.success('配置已导出')
}

function importConfig() {
  importText.value = ''
  showImportModal.value = true
}

function confirmImport() {
  try {
    const config = JSON.parse(importText.value)
    configStore.importConfig(config)
    showImportModal.value = false
    message.success('配置导入成功')
  } catch (e) {
    message.error('配置格式错误，请确保是有效的JSON数据')
  }
}

// 重置配置
function resetConfig() {
  configStore.resetConfig()
  message.success('已恢复默认设置')
}

// 清除缓存
function clearCache() {
  if (confirm('确定要清除本地缓存数据吗？这将删除所有设置和历史记录。')) {
    localStorage.removeItem('turntable-config')
    message.success('缓存已清除，刷新页面后将重置为默认设置')
  }
}

// 无障碍帮助
const showAccessibilityModal = ref(false)

function openAccessibilityHelp() {
  showAccessibilityModal.value = true
}

// 更新高对比度模式
function updateContrastMode(value) {
  if (value) {
    configStore.settings.turntableTheme = 'highContrast'
  }
  configStore.saveConfig()
}

// 统计表格
const statsColumns = [
  {
    title: '奖项名称',
    key: 'name',
    sorter: 'default',
  },
  {
    title: '抽中次数',
    key: 'count',
    sorter: (a, b) => a.count - b.count,
  },
  {
    title: '抽中概率',
    key: 'percentage',
    render: (row) => {
      return `${row.percentage}%`
    },
    sorter: (a, b) => a.percentage - b.percentage,
  },
]

const statsData = computed(() => {
  return configStore.items.map((item) => {
    const stats = configStore.getItemStats(item.id)
    return {
      name: item.name,
      count: stats.count,
      percentage: stats.percentage,
    }
  })
})

// 辅助函数
function formatProbability(value) {
  return Number(value).toFixed(1)
}

function getColorByIndex(index) {
  const colors = [
    '#FF5252',
    '#FF4081',
    '#E040FB',
    '#7C4DFF',
    '#536DFE',
    '#448AFF',
    '#40C4FF',
    '#18FFFF',
    '#64FFDA',
    '#69F0AE',
    '#B2FF59',
    '#EEFF41',
    '#FFFF00',
    '#FFD740',
    '#FFAB40',
    '#FF6E40',
  ]
  return colors[index % colors.length]
}

function getTimelineType(index) {
  const types = ['success', 'info', 'warning', 'error']
  return types[index % types.length]
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 选项定义
const themeOptions = [
  { label: '标准', value: 'standard' },
  { label: '明亮', value: 'bright' },
  { label: '柔和', value: 'soft' },
  { label: '高对比度', value: 'highContrast' },
]

const qualityOptions = [
  { label: '高 (流畅动画)', value: 'high' },
  { label: '中 (平衡)', value: 'medium' },
  { label: '低 (节省资源)', value: 'low' },
]
</script>

<style scoped>
.config-panel {
  height: 100%;
  padding: 16px;
  overflow: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-card {
  transition: all 0.3s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.item-name {
  font-weight: bold;
}

.history-list {
  margin-top: 16px;
}

.history-content {
  display: flex;
  justify-content: space-between;
}

.history-time {
  font-size: 0.85rem;
  color: #999;
}
</style>
