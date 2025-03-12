// 服务工作线程，用于缓存资源和离线支持

const CACHE_NAME = 'turntable-cache-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/sounds/spin.mp3',
  '/sounds/win.mp3',
]

// 安装service worker并缓存基本资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
})

// 拦截请求并从缓存提供响应
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // 如果找到了匹配的响应，则返回缓存的值
        if (response) {
          return response
        }

        // 否则正常获取
        return fetch(event.request).then((response) => {
          // 如果状态不正确，或者不是基本的GET请求，不缓存
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic' ||
            event.request.method !== 'GET'
          ) {
            return response
          }

          // 复制响应，因为响应是stream，只能使用一次
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        // 如果离线且请求失败，返回一个基本的离线页面
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
      })
  )
})

// 清理旧版本缓存
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
