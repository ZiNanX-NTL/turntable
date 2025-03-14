import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    isDarkMode: false,
    isSidebarCollapsed: false,
    activeTheme: 'default',
    isMobile: false,
    deviceOrientation: 'portrait',
    animations: {
      enabled: true,
      reduced: false,
    },
  }),

  getters: {
    currentTheme: (state) => state.activeTheme,
    sidebarState: (state) => !state.isSidebarCollapsed,
  },

  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode
    },

    // 新增直接设置深色模式状态的方法
    setDarkMode(value) {
      this.isDarkMode = value
    },

    toggleSidebar() {
      console.log('切换侧边栏，当前状态:', this.isSidebarCollapsed)
      this.isSidebarCollapsed = !this.isSidebarCollapsed
      console.log('切换侧边栏，新状态:', this.isSidebarCollapsed)
    },
    setSidebarCollapsed(value) {
      console.log('设置侧边栏状态为:', value)
      this.isSidebarCollapsed = value
    },
    setTheme(theme) {
      this.activeTheme = theme
    },
    setIsMobile(isMobile) {
      this.isMobile = isMobile
      // 在移动设备上，默认将侧边栏折叠
      if (isMobile) {
        this.isSidebarCollapsed = true
      }
    },
    setDeviceOrientation(orientation) {
      this.deviceOrientation = orientation
    },
    toggleAnimations() {
      this.animations.enabled = !this.animations.enabled
    },
    setReducedAnimations(reduced) {
      this.animations.reduced = reduced
    },
    detectDeviceSettings() {
      // 检测是否为移动设备
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768
      this.setIsMobile(isMobileDevice)

      // 检测设备方向
      const orientation =
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      this.setDeviceOrientation(orientation)

      // 检测是否需要降低动画效果（低性能设备）
      const isLowPerfDevice =
        navigator.hardwareConcurrency <= 2 ||
        (/iPhone|iPad|iPod/.test(navigator.userAgent) &&
          /(iPhone|iPad|iPod).*OS 11/.test(navigator.userAgent))

      this.setReducedAnimations(isLowPerfDevice)
    },
  },

  persist: {
    key: 'turntable-ui-settings',
    storage: localStorage,
    paths: [
      'isDarkMode',
      'activeTheme',
      'animations.enabled',
      'isSidebarCollapsed', // 确保状态被持久化
    ],
  },
})
