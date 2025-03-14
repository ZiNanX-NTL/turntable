import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'

// 引入UnoCSS
import 'uno.css'

// 创建应用和状态管理
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)

// 全局错误处理
app.config.errorHandler = (err) => {
  console.error('全局错误:', err)
}

// 挂载应用
app.mount('#app')
