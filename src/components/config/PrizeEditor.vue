<template>
  <div class="prize-editor">
    <div class="prize-editor-header">
      <p class="prize-count">共 {{ prizes.length }} 个奖项</p>

      <div class="prize-actions">
        <n-button @click="showAddForm = true" type="primary" size="small">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          添加奖项
        </n-button>

        <n-button @click="confirmResetPrizes" type="error" text size="small">
          <template #icon>
            <n-icon><RefreshOutline /></n-icon>
          </template>
          重置
        </n-button>
      </div>
    </div>

    <n-divider />

    <div class="empty-state" v-if="prizes.length === 0">
      <n-empty description="还没有添加任何奖项">
        <template #extra>
          <n-button @click="showAddForm = true" type="primary">
            添加第一个奖项
          </n-button>
        </template>
      </n-empty>
    </div>

    <n-scrollbar class="prize-list" v-else>
      <TransitionGroup name="list" tag="div" class="prize-items">
        <div v-for="prize in prizes" :key="prize.id" class="prize-item">
          <div class="prize-item-content">
            <div
              class="prize-color"
              :style="{ backgroundColor: prize.color }"
            ></div>

            <div class="prize-details">
              <h3 class="prize-name">{{ prize.name }}</h3>

              <div class="prize-probability">
                <span>概率: {{ prize.probability }}%</span>
                <n-slider
                  v-model:value="prize.probability"
                  :min="0"
                  :max="100"
                  :step="1"
                  :tooltip="false"
                  @update:value="updatePrize(prize.id, { probability: $event })"
                />
              </div>
            </div>

            <div class="prize-actions">
              <n-button
                quaternary
                circle
                size="small"
                @click="editPrize(prize)"
              >
                <template #icon>
                  <n-icon><PencilOutline /></n-icon>
                </template>
              </n-button>

              <n-button
                quaternary
                circle
                size="small"
                @click="confirmDeletePrize(prize.id)"
              >
                <template #icon>
                  <n-icon><TrashOutline /></n-icon>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </n-scrollbar>

    <!-- 添加/编辑奖品表单对话框 -->
    <n-modal
      v-model:show="showAddForm"
      preset="card"
      :title="isEditing ? '编辑奖项' : '添加奖项'"
      style="width: 90%; max-width: 500px"
    >
      <n-form
        ref="formRef"
        :model="prizeForm"
        :rules="formRules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="奖项名称" path="name">
          <n-input
            v-model:value="prizeForm.name"
            placeholder="请输入奖项名称"
          />
        </n-form-item>

        <n-form-item label="中奖概率" path="probability">
          <div class="probability-input">
            <n-slider
              v-model:value="prizeForm.probability"
              :min="0"
              :max="100"
              :step="1"
            />
            <n-input-number
              v-model:value="prizeForm.probability"
              :min="0"
              :max="100"
              :step="1"
              size="small"
              style="width: 100px; margin-left: 12px"
            />
          </div>
        </n-form-item>

        <n-form-item label="颜色" path="color">
          <n-color-picker
            v-model:value="prizeForm.color"
            :swatches="colorPresets"
            :show-alpha="false"
          />
        </n-form-item>

        <n-form-item label="图标" path="icon">
          <n-input
            v-model:value="prizeForm.icon"
            placeholder="图标URL（可选）"
          />
        </n-form-item>

        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="prizeForm.description"
            placeholder="奖项描述（可选）"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="showAddForm = false">取消</n-button>
          <n-button type="primary" @click="savePrize">保存</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 确认删除对话框 -->
    <n-modal
      v-model:show="showDeleteConfirm"
      preset="dialog"
      type="warning"
      title="确认删除"
      content="确定删除此奖项吗？此操作不可撤销。"
      positive-text="确认删除"
      negative-text="取消"
      @positive-click="deletePrize"
      style="width: 90%; max-width: 400px"
    />

    <!-- 确认重置对话框 -->
    <n-modal
      v-model:show="showResetConfirm"
      preset="dialog"
      type="warning"
      title="确认重置"
      content="确定重置所有奖项吗？此操作将恢复默认设置并不可撤销。"
      positive-text="确认重置"
      negative-text="取消"
      @positive-click="resetPrizes"
      style="width: 90%; max-width: 400px"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import {
  NButton,
  NIcon,
  NEmpty,
  NScrollbar,
  NSlider,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NColorPicker,
  NDivider,
} from 'naive-ui'
import {
  AddOutline,
  PencilOutline,
  TrashOutline,
  RefreshOutline,
} from '@vicons/ionicons5'
import { useTurntableStore } from '@/store/modules/turntable'

// 获取转盘Store
const turntableStore = useTurntableStore()

// 将prizes作为计算属性，方便模板中使用
const prizes = computed(() => turntableStore.prizes)
onMounted(() => {
  console.log(prizes.value)
})

// 表单状态
const showAddForm = ref(false)
const showDeleteConfirm = ref(false)
const showResetConfirm = ref(false)
const isEditing = ref(false)
const currentPrizeId = ref(null)
const formRef = ref(null)

// 奖品表单
const prizeForm = reactive({
  name: '',
  probability: 10,
  color: '#ff4747',
  icon: '',
  description: '',
})

// 表单验证规则
const formRules = {
  name: {
    required: true,
    message: '请输入奖项名称',
    trigger: 'blur',
  },
  probability: {
    type: 'number',
    required: true,
    message: '请设置概率值（0-100）',
    trigger: 'change',
  },
}

// 颜色预设
const colorPresets = [
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

// 重置表单
const resetForm = () => {
  prizeForm.name = ''
  prizeForm.probability = 10
  prizeForm.color = turntableStore.getRandomColor()
  prizeForm.icon = ''
  prizeForm.description = ''
  isEditing.value = false
  currentPrizeId.value = null
}

// 添加/保存奖品
const savePrize = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (isEditing.value && currentPrizeId.value) {
        // 更新奖品
        turntableStore.updatePrize(currentPrizeId.value, { ...prizeForm })
      } else {
        // 添加新奖品
        turntableStore.addPrize({ ...prizeForm })
      }

      // 关闭表单并重置
      showAddForm.value = false
      resetForm()
    }
  })
}

// 编辑奖品
const editPrize = (prize) => {
  currentPrizeId.value = prize.id
  isEditing.value = true
  prizeForm.name = prize.name
  prizeForm.probability = prize.probability
  prizeForm.color = prize.color
  prizeForm.icon = prize.icon || ''
  prizeForm.description = prize.description || ''
  showAddForm.value = true
}

// 准备删除奖品
const confirmDeletePrize = (id) => {
  currentPrizeId.value = id
  showDeleteConfirm.value = true
}

// 删除奖品
const deletePrize = () => {
  if (currentPrizeId.value) {
    turntableStore.removePrize(currentPrizeId.value)
    currentPrizeId.value = null
  }
}

// 更新奖品属性
const updatePrize = (id, updates) => {
  turntableStore.updatePrize(id, updates)
}

// 确认重置所有奖项
const confirmResetPrizes = () => {
  showResetConfirm.value = true
}

// 重置所有奖项
const resetPrizes = () => {
  turntableStore.$reset() // 使用Pinia的$reset方法恢复初始状态
}
</script>

<style lang="scss" scoped>
.prize-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.prize-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 8px;
}

.prize-count {
  margin: 0;
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.prize-actions {
  display: flex;
  gap: 8px;
}

.prize-list {
  flex: 1;
  overflow: auto;
}

.prize-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prize-item {
  background-color: $bg-light;
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition:
    transform $transition-normal,
    box-shadow $transition-normal;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  .dark-mode & {
    background-color: $dark-bg-dark;
  }
}

.prize-item-content {
  display: flex;
  align-items: center;
  padding: 12px;
}

.prize-color {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-circle;
  margin-right: 12px;
  flex-shrink: 0;
}

.prize-details {
  flex: 1;
  min-width: 0;
}

.prize-name {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 500;
  @include text-truncate;
}

.prize-probability {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.prize-actions {
  display: flex;
  gap: 4px;
}

.probability-input {
  display: flex;
  align-items: center;
}

// 列表动画
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
