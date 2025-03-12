import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 注册service worker (如果浏览器支持)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('Service worker 注册失败:', error)
    })
  })
}

// 创建Vue应用
const app = createApp(App)

// 使用Pinia进行状态管理
app.use(createPinia())

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info)
  // 可以在这里添加错误上报
}

// 挂载应用
app.mount('#app')
