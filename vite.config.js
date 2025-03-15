import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import UnoCSS from 'unocss/vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    UnoCSS(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@composables': path.resolve(__dirname, 'src/composables'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/index.scss" as *;`,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    sourcemap: false,
  },
})
