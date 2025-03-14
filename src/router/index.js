import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页 - 幸运转盘' },
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('@/views/config/index.vue'),
    meta: { title: '配置 - 幸运转盘' },
  },
  {
    path: '/presentation',
    name: 'Presentation',
    component: () => import('@/views/presentation/index.vue'),
    meta: { title: '演示模式 - 幸运转盘' },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/history/index.vue'),
    meta: { title: '历史记录 - 幸运转盘' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于 - 幸运转盘' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到 - 幸运转盘' },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title || '幸运转盘 - 高颜值抽奖工具'
  next()
})

export default router
