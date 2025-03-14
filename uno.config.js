import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  // UnoCSS 配置
  presets: [
    presetUno(), // 默认预设
    presetAttributify(), // 属性化模式支持
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }), // 图标支持
  ],
  transformers: [
    transformerDirectives(), // @apply 指令支持
  ],
  // 自定义规则
  rules: [
    // 自定义圆角规则
    [/^r-(\d+)$/, ([, d]) => ({ 'border-radius': `${d}px` })],
    // 自定义阴影规则
    ['shadow-sm', { 'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }],
    [
      'shadow',
      {
        'box-shadow':
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    ],
    [
      'shadow-md',
      {
        'box-shadow':
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    ],
    [
      'shadow-lg',
      {
        'box-shadow':
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    ],
  ],
  // 自定义快捷方式
  shortcuts: {
    btn: 'py-2 px-4 font-semibold rounded-lg shadow-md transition-colors',
    'btn-primary': 'bg-primary-light text-white hover:bg-primary-dark',
    'flex-center': 'flex justify-center items-center',
    card: 'bg-white rounded-lg shadow p-4',
  },
  // 主题变量
  theme: {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
})
