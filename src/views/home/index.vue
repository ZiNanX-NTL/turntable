<template>
  <div class="full-page-container home-page">
    <!-- 保留并优化主页的装饰背景 -->
    <div
      class="blur-bg-decoration primary"
      style="
        width: 600px;
        height: 600px;
        top: -200px;
        left: -200px;
        opacity: 0.5;
        z-index: 0;
      "
    ></div>
    <div
      class="blur-bg-decoration secondary slow"
      style="
        width: 500px;
        height: 500px;
        bottom: -150px;
        right: -150px;
        opacity: 0.4;
        z-index: 0;
      "
    ></div>
    <div
      class="blur-bg-decoration accent fast"
      style="
        width: 300px;
        height: 300px;
        bottom: 20%;
        left: 15%;
        opacity: 0.3;
        z-index: 0;
      "
    ></div>

    <div class="content-container full-height">
      <div class="hero-section">
        <div class="logo-container animate-fadeIn">
          <img src="@/assets/images/logo.png" alt="幸运转盘" class="logo" />
          <h1 class="app-title">幸运转盘</h1>
        </div>

        <p class="app-description animate-fadeIn delay-200">
          高颜值、流畅的抽奖转盘工具
          <span class="highlight">适用于课堂互动、活动抽奖、团队选择</span>
        </p>

        <div class="actions animate-fadeIn delay-300">
          <n-button
            type="primary"
            size="large"
            @click="router.push({ name: 'Presentation' })"
            class="action-button primary-button"
          >
            <template #icon>
              <n-icon size="18"><PlayOutline /></n-icon>
            </template>
            开始抽奖
          </n-button>
          <n-button
            size="large"
            @click="router.push({ name: 'Config' })"
            class="action-button config-button"
            color="#8957e5"
          >
            <template #icon>
              <n-icon size="18"><SettingsOutline /></n-icon>
            </template>
            调整配置
          </n-button>
        </div>

        <div class="home-nav-links animate-fadeIn delay-400">
          <router-link to="/history" class="home-nav-link">
            <n-icon><TimeOutline /></n-icon>
            历史记录
          </router-link>
          <router-link to="/about" class="home-nav-link">
            <n-icon><InformationCircleOutline /></n-icon>
            关于项目
          </router-link>
          <n-button
            quaternary
            circle
            class="dark-toggle"
            @click="toggleDarkMode"
          >
            <n-icon size="18">
              <component
                :is="uiStore.isDarkMode ? 'SunnyOutline' : 'MoonOutline'"
              />
            </n-icon>
          </n-button>
        </div>
      </div>

      <div class="preview-container animate-float">
        <div class="preview-turntable animate-zoomIn">
          <div class="preview-glow"></div>
          <Turntable
            :prizes="turntableStore.prizes"
            :config="{
              wheel: turntableStore.wheelConfig,
              pointer: turntableStore.pointerConfig,
              result: turntableStore.resultConfig,
              sound: turntableStore.soundConfig,
            }"
          />
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="feature-card animate-slideInUp">
        <n-icon size="32" class="feature-icon">
          <SpeedometerOutline />
        </n-icon>
        <h3 class="feature-title">流畅动画</h3>
        <p class="feature-description">
          精心设计的动画效果，带来愉悦的抽奖体验
        </p>
      </div>

      <div class="feature-card animate-slideInUp delay-100">
        <n-icon size="32" class="feature-icon">
          <ColorPaletteOutline />
        </n-icon>
        <h3 class="feature-title">自定义外观</h3>
        <p class="feature-description">可自定义转盘颜色、指针样式和奖品设置</p>
      </div>

      <div class="feature-card animate-slideInUp delay-200">
        <n-icon size="32" class="feature-icon">
          <PhonePortraitOutline />
        </n-icon>
        <h3 class="feature-title">响应式设计</h3>
        <p class="feature-description">在任何设备上都能获得完美的使用体验</p>
      </div>
    </div>

    <footer class="home-footer">
      <p>© 2024 幸运转盘 | 一个开源的前端抽奖工具</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import {
  SpeedometerOutline,
  ColorPaletteOutline,
  PhonePortraitOutline,
  PlayOutline,
  SettingsOutline,
  TimeOutline,
  InformationCircleOutline,
} from '@vicons/ionicons5'
import Turntable from '@/components/turntable/Turntable.vue'
import { useTurntableStore } from '@/store/modules/turntable'
import { useUiStore } from '@/store/modules/ui'

// 路由对象
const router = useRouter()

// 获取转盘状态
const turntableStore = useTurntableStore()
const uiStore = useUiStore()

// 切换深色模式
const toggleDarkMode = () => {
  uiStore.toggleDarkMode()
}

// 监测设备设置
onMounted(() => {
  uiStore.detectDeviceSettings()

  // 添加页面进入动画
  document.body.classList.add('page-loaded')
})
</script>

<style lang="scss" scoped>
.home-page {
  background-color: $bg-light;
  position: relative;
  overflow-x: hidden;

  .dark-mode & {
    background-color: $dark-bg-base;
  }
}

// 改进背景装饰
.blur-bg-decoration {
  position: fixed; // 使用fixed而不是absolute
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;

  &.primary {
    background: linear-gradient(135deg, $primary-color, #8957e5);
  }

  &.secondary {
    background: linear-gradient(135deg, $secondary-color, #ff9190);
  }

  &.accent {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
}

.content-container {
  display: flex;
  padding: 0 20px;
  height: calc(100% - 280px);

  &.full-height {
    padding-top: 2vh;
    min-height: 70%;
  }

  @include desktop {
    align-items: center;
    justify-content: space-between;
    padding: 0 8%;
  }

  @include mobile {
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 40px;
  }
}

.hero-section {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  position: relative;
  z-index: 2;

  @include mobile {
    text-align: center;
    padding: 10px 0;
  }
}

.logo-container {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  @include mobile {
    justify-content: center;
  }
}

.logo {
  width: 64px;
  height: 64px;
  margin-right: 16px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));

  @include mobile {
    width: 50px;
    height: 50px;
  }
}

.app-title {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, $primary-color, #8957e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  margin: 0;
  letter-spacing: -1px;

  @include mobile {
    font-size: 2.5rem;
  }
}

.app-description {
  font-size: 1.25rem;
  color: $text-secondary;
  margin-bottom: 36px;
  line-height: 1.6;
  max-width: 440px;

  .highlight {
    display: block;
    color: $primary-color;
    font-weight: 500;
  }

  @include mobile {
    font-size: 1.1rem;
    margin: 0 auto 28px;
  }
}

.actions {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;

  @include mobile {
    justify-content: center;
    flex-wrap: wrap;
  }
}

.action-button {
  font-weight: 600;
  padding: 8px 24px;
  border-radius: 12px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &.primary-button {
    background: linear-gradient(135deg, $primary-color, #8957e5);
  }

  &.config-button {
    background: linear-gradient(135deg, #8957e5, #755bea);
  }
}

.home-nav-links {
  display: flex;
  align-items: center;
  gap: 24px;

  @include mobile {
    justify-content: center;
  }
}

.home-nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $text-secondary;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: $primary-color;
  }

  .dark-mode & {
    color: $dark-text-secondary;

    &:hover {
      // color: lighten($primary-color, 10%);
    }
  }
}

.dark-toggle {
  margin-left: 8px;
  color: $text-secondary;

  &:hover {
    color: $primary-color;
    background-color: rgba(0, 0, 0, 0.05);
  }

  .dark-mode & {
    color: $dark-text-secondary;

    &:hover {
      color: #ffcc4d;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.preview-container {
  width: 100%;
  max-width: 500px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;

  @include mobile {
    margin-top: 30px;
  }
}

.preview-turntable {
  width: 100%;
  max-width: 450px;
  position: relative;

  // 添加发光效果
  .preview-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(77, 84, 225, 0.2) 0%,
      rgba(77, 84, 225, 0) 70%
    );
    filter: blur(30px);
    z-index: -1;

    .dark-mode & {
      background: radial-gradient(
        circle,
        rgba(77, 84, 225, 0.3) 0%,
        rgba(77, 84, 225, 0) 70%
      );
    }
  }

  @include mobile {
    max-width: 320px;
  }
}

.features-section {
  display: flex;
  justify-content: center;
  padding: 12px 8%;
  gap: 24px;
  height: auto;
  background: linear-gradient(180deg, transparent, rgba(77, 84, 225, 0.05));

  .dark-mode & {
    background: linear-gradient(180deg, transparent, rgba(77, 84, 225, 0.1));
  }

  @include mobile {
    flex-direction: column;
    padding: 30px 16px;
    gap: 20px;
  }
}

.feature-card {
  background: white;
  border-radius: $border-radius-lg;
  padding: 28px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }

  .dark-mode & {
    background: $dark-bg-light;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  @include mobile {
    padding: 20px;
  }
}

.feature-icon {
  color: $primary-color;
  margin-bottom: 18px;
  background: rgba(77, 84, 225, 0.1);
  padding: 12px;
  border-radius: 50%;

  .dark-mode & {
    background: rgba(77, 84, 225, 0.2);
  }
}

.feature-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: $text-primary;

  .dark-mode & {
    color: $dark-text-primary;
  }
}

.feature-description {
  color: $text-secondary;
  font-size: 1rem;
  line-height: 1.6;

  .dark-mode & {
    color: $dark-text-secondary;
  }
}

.home-footer {
  text-align: center;
  padding: 20px;
  color: $text-secondary;
  font-size: 0.9rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  .dark-mode & {
    color: $dark-text-secondary;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
}

// 页面加载动画
.page-loaded {
  .home-page {
    animation: fadeIn 0.5s ease-out;
  }
}
</style>
