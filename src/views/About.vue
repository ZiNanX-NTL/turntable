<template>
  <div class="full-page-container about-page">
    <!-- 移除装饰背景 -->

    <AppHeader title="关于项目" @toggle-menu="handleToggleMenu" />

    <div class="content-container">
      <AppSidebar
        :collapsed="uiStore.isSidebarCollapsed"
        @update:collapsed="uiStore.setSidebarCollapsed($event)"
      />

      <div class="about-container">
        <n-card title="幸运转盘" class="about-card">
          <div class="logo-section">
            <img
              src="@/assets/images/logo.png"
              alt="幸运转盘"
              class="about-logo"
            />
            <h1 class="about-title">幸运转盘</h1>
          </div>

          <div class="version-info">
            <p>版本: 1.0.0</p>
          </div>

          <div class="about-content">
            <p>
              这是一个纯前端的转盘抽奖工具，适用于课堂互动、活动抽奖等场景。主要特点：
            </p>

            <ul class="feature-list">
              <li class="text-primary mb-2">高颜值、流畅的转盘动画效果</li>
              <li class="text-primary mb-2">可自定义奖品、概率和外观</li>
              <li class="text-primary mb-2">支持多种中奖特效</li>
              <li class="text-primary mb-2">可导出导入配置和历史记录</li>
              <li class="text-primary mb-2">响应式设计，支持多种设备使用</li>
            </ul>

            <div class="tech-stack">
              <h3>技术栈</h3>
              <p>Vue 3 + Vite + Naive UI + LeaferJS + GSAP + UnoCSS</p>
            </div>
          </div>
        </n-card>

        <!-- 使用UnoCSS示例展示 -->
        <!-- <div class="mt-6">
          <UnoExample />
        </div> -->

        <n-card title="使用方法" class="help-card mt-6">
          <n-collapse arrow-placement="right">
            <n-collapse-item title="基本使用" name="1">
              <ol class="help-list">
                <li>进入"配置转盘"页面，设置奖项和外观</li>
                <li>进入"演示模式"页面，点击中央按钮开始抽奖</li>
                <li>转盘停止后，会展示中奖结果</li>
                <li>在"历史记录"页面可以查看所有抽奖记录</li>
              </ol>
            </n-collapse-item>

            <n-collapse-item title="自定义设置" name="2">
              <p>在"配置转盘"页面，可以：</p>
              <ul class="help-list">
                <li>添加、编辑和删除奖项</li>
                <li>调整每个奖项的中奖概率</li>
                <li>更改转盘颜色、大小和动画效果</li>
                <li>导出或导入配置，便于备份和迁移</li>
              </ul>
            </n-collapse-item>

            <n-collapse-item title="快捷键" name="3">
              <table class="shortcut-table">
                <thead>
                  <tr>
                    <th>功能</th>
                    <th>快捷键</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>开始抽奖</td>
                    <td>空格键</td>
                  </tr>
                  <tr>
                    <td>全屏切换</td>
                    <td>F11 或 F</td>
                  </tr>
                  <tr>
                    <td>暗色模式切换</td>
                    <td>Ctrl + D</td>
                  </tr>
                </tbody>
              </table>
            </n-collapse-item>
          </n-collapse>
        </n-card>

        <div class="copyright">© 2023 幸运转盘 - 一个纯前端的转盘抽奖项目</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NCard, NCollapse, NCollapseItem } from 'naive-ui'
import AppHeader from '@/components/common/layout/AppHeader.vue'
import AppSidebar from '@/components/common/layout/AppSidebar.vue'
import UnoExample from '@/components/common/UnoExample.vue'
import { useUiStore } from '@/store/modules/ui'

// 获取UI状态
const uiStore = useUiStore()

// 处理菜单切换
const handleToggleMenu = () => {
  uiStore.toggleSidebar()
}

// 不再需要这个函数，直接在模板中调用 store 方法
// const updateSidebarState = (collapsed) => {
//   uiStore.setSidebarCollapsed(collapsed)
// }

// 生命周期
onMounted(() => {
  uiStore.detectDeviceSettings()
})
</script>

<!-- 保留原有SCSS样式 -->
<style lang="scss" scoped>
.about-page {
  background-color: $bg-light;

  .dark-mode & {
    background-color: $dark-bg-base;
  }
}

.about-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.about-card,
.help-card {
  animation: fadeIn 0.5s ease-out;
}

.help-card {
  animation-delay: 0.2s;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.about-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.about-title {
  font-size: 2rem;
  margin: 0;
  color: $primary-color;
}

.version-info {
  margin-bottom: 20px;
  color: $text-secondary;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.about-content {
  font-size: 1rem;
  line-height: 1.6;
}

.feature-list,
.help-list {
  padding-left: 20px;
  margin: 16px 0;

  li {
    margin-bottom: 8px;
  }
}

.tech-stack {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid $border-color;

  .dark-mode & {
    border-top-color: $dark-border-color;
  }

  h3 {
    margin: 0 0 8px 0;
  }

  p {
    color: $text-secondary;
    margin: 0;

    .dark-mode & {
      color: $dark-text-secondary;
    }
  }
}

.shortcut-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;

  th {
    text-align: left;
    padding: 8px;
    border-bottom: 2px solid $border-color;

    .dark-mode & {
      border-bottom-color: $dark-border-color;
    }
  }

  td {
    padding: 8px;
    border-bottom: 1px solid $border-color;

    .dark-mode & {
      border-bottom-color: $dark-border-color;
    }
  }
}

.copyright {
  text-align: center;
  margin-top: 20px;
  padding: 16px;
  color: $text-secondary;
  font-size: 0.9rem;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}
</style>
