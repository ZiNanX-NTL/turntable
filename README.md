# 转盘抽奖项目

## 功能描述
这个项目是纯前端的一个老师上课使用的转盘抽奖的项目,能够配置抽奖内容,抽奖详情,中奖概率等,需要流畅的动画效果,同时需要界面好看,且具备响应式.

## 技术方案

### 技术栈选择

1. **前端框架**：Vue.js 3 + Vite
   - 理由：响应式设计容易实现，组件化开发，适合中小型项目

2. **UI框架**：Naive UI
   - 理由：美观的界面组件，响应式支持，适合快速开发，与 Vue 3 和 Vite 良好集成

3. **动画实现**：
   - CSS3 动画
   - GreenSock Animation Platform (GSAP)
   - LeaferJS 绘制转盘
     - 理由：LeaferJS是高性能的Web图形引擎，适用于复杂转盘绘制和动画，具有良好的性能和易用性
   - tsParticles
     - 理由：现代化的粒子动画库，性能优于particles.js，用于实现中奖庆祝效果

4. **状态管理**：Pinia
   - 理由：轻量级，Vue 3官方推荐，适合管理抽奖配置和状态

5. **数据存储**：LocalStorage
   - 理由：存储配置信息和历史记录

### 目录结构

```
turntable/
├── public/                    # 静态资源目录
│   ├── favicon.ico
│   ├── sounds/                # 抽奖音效资源
│   │   ├── start.mp3         # 开始抽奖音效
│   │   ├── spinning.mp3      # 转动过程音效
│   │   └── result.mp3        # 结果公布音效
│   └── templates/            # 预设模板数据
│       ├── default.json      # 默认模板
│       └── classroom.json    # 教室模板
├── src/
│   ├── api/                   # API接口封装
│   │   ├── storage/          # 存储相关API
│   │   │   ├── config.js     # 配置存储API
│   │   │   ├── history.js    # 历史记录存储API
│   │   │   └── index.js      # 统一导出
│   │   └── index.js          # API统一出口
│   ├── assets/                # 项目资源文件
│   │   ├── images/            # 图片资源
│   │   │   ├── icons/        # 图标资源
│   │   │   ├── backgrounds/  # 背景图片
│   │   │   └── prizes/       # 奖品图片
│   │   ├── styles/            # 全局样式
│   │   │   ├── variables.scss # 变量定义
│   │   │   ├── mixins.scss   # 混合器
│   │   │   ├── reset.scss    # 样式重置
│   │   │   ├── animations.scss # 动画样式
│   │   │   └── index.scss    # 样式主入口
│   │   └── fonts/            # 字体资源
│   │       ├── display/      # 展示字体
│   │       └── text/         # 正文字体
│   ├── components/
│   │   ├── common/           # 通用组件
│   │   │   ├── layout/       # 布局类组件
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppFooter.vue
│   │   │   │   └── AppSidebar.vue
│   │   │   ├── feedback/     # 反馈类组件
│   │   │   │   ├── LoadingSpinner.vue
│   │   │   │   ├── Notification.vue
│   │   │   │   └── ConfirmDialog.vue
│   │   │   ├── form/         # 表单类组件
│   │   │   │   ├── CustomButton.vue
│   │   │   │   ├── CustomInput.vue
│   │   │   │   └── CustomSelect.vue
│   │   │   └── display/      # 展示类组件
│   │   │       ├── Card.vue
│   │   │       ├── Badge.vue
│   │   │       └── Tooltip.vue
│   │   ├── turntable/        # 转盘相关组件
│   │   │   ├── wheel/        # 转盘轮盘组件
│   │   │   │   ├── WheelCanvas.vue    # Canvas实现
│   │   │   │   ├── WheelSVG.vue       # SVG实现
│   │   │   │   └── WheelLeafer.vue    # LeaferJS实现
│   │   │   ├── pointer/      # 指针组件
│   │   │   │   ├── StandardPointer.vue # 标准指针
│   │   │   │   └── CustomPointer.vue   # 自定义指针
│   │   │   ├── animation/    # 动画组件
│   │   │   │   ├── SpinAnimation.vue  # 旋转动画
│   │   │   │   └── ResultAnimation.vue # 结果动画
│   │   │   ├── Turntable.vue  # 转盘主组件
│   │   │   ├── Pointer.vue    # 指针组件
│   │   │   └── Controls.vue   # 控制按钮组件
│   │   ├── config/           # 配置相关组件
│   │   │   ├── basic/        # 基础配置组件
│   │   │   │   ├── TurntableBasicConfig.vue # 转盘基本配置
│   │   │   │   └── AnimationConfig.vue      # 动画配置
│   │   │   ├── prize/        # 奖品配置组件 
│   │   │   │   ├── PrizeForm.vue      # 奖品表单
│   │   │   │   ├── PrizeList.vue      # 奖品列表
│   │   │   │   └── PrizeImport.vue    # 奖品导入
│   │   │   ├── appearance/    # 外观配置组件
│   │   │   │   ├── ColorPicker.vue    # 颜色选择器
│   │   │   │   ├── FontSelector.vue   # 字体选择器
│   │   │   │   └── ThemeSelector.vue  # 主题选择器
│   │   │   ├── ConfigPanel.vue   # 配置面板
│   │   │   ├── PrizeEditor.vue   # 奖品编辑器
│   │   │   └── ProbabilitySlider.vue # 概率滑块
│   │   └── results/           # 结果相关组件
│   │       ├── display/       # 结果展示组件
│   │       │   ├── WinnerDisplay.vue  # 中奖者展示
│   │       │   ├── ParticleEffects/   # 粒子效果组件
│   │       │   │   ├── Confetti.vue   # 彩带效果
│   │       │   │   ├── Fireworks.vue  # 烟花效果
│   │       │   │   └── Stars.vue      # 星星效果
│   │       │   └── ShareResult.vue    # 分享结果
│   │       ├── history/       # 历史相关组件
│   │       │   ├── HistoryItem.vue    # 历史条目
│   │       │   ├── FilterControls.vue # 筛选控件
│   │       │   └── ExportHistory.vue  # 导出历史
│   │       ├── statistics/    # 统计相关组件
│   │       │   ├── PieChart.vue       # 饼图
│   │       │   ├── BarChart.vue       # 条形图
│   │       │   └── DataTable.vue      # 数据表格
│   │       ├── ResultDisplay.vue # 结果展示
│   │       ├── HistoryList.vue   # 历史记录列表
│   │       └── StatsChart.vue    # 统计图表
│   ├── composables/          # 可复用的组合式函数
│   │   ├── turntable/       # 转盘相关
│   │   │   ├── useWheelAnimation.js # 轮盘动画
│   │   │   ├── usePrizeSelection.js # 奖品选择
│   │   │   └── useWheelRendering.js # 轮盘渲染
│   │   ├── config/          # 配置相关
│   │   │   ├── usePrizeConfig.js  # 奖品配置
│   │   │   └── useThemeConfig.js  # 主题配置
│   │   ├── storage/         # 存储相关
│   │   │   ├── useLocalStorage.js # 本地存储
│   │   │   └── useExportImport.js # 导出导入
│   │   ├── useTurntable.js   # 转盘逻辑抽象
│   │   ├── useConfig.js      # 配置管理
│   │   └── useHistory.js     # 历史记录管理
│   ├── hooks/                # 自定义钩子
│   │   ├── feedback/        # 反馈相关钩子
│   │   │   ├── useSound.js       # 音效处理钩子
│   │   │   ├── useVibration.js   # 震动处理钩子
│   │   │   └── useNotification.js # 通知处理钩子
│   │   ├── animation/       # 动画相关钩子
│   │   │   ├── useGSAP.js        # GSAP钩子
│   │   │   └── useParticles.js   # 粒子动画钩子
│   │   ├── device/          # 设备相关钩子
│   │   │   ├── useResponsive.js  # 响应式钩子
│   │   │   └── useOrientation.js # 屏幕方向钩子
│   │   ├── useSound.js       # 音效处理钩子
│   │   └── useAnimation.js   # 动画效果钩子
│   ├── layouts/             # 布局组件
│   │   ├── DefaultLayout.vue
│   │   ├── ConfigLayout.vue  # 配置页面布局
│   │   ├── FullscreenLayout.vue
│   │   └── TeacherLayout.vue # 教师专用布局
│   ├── router/              # 路由配置
│   │   ├── routes/          # 路由定义
│   │   │   ├── home.js      # 主页路由
│   │   │   ├── config.js    # 配置页路由
│   │   │   └── history.js   # 历史记录路由
│   │   ├── guards/          # 路由守卫
│   │   │   └── auth.js      # 认证守卫
│   │   └── index.js         # 路由主文件
│   ├── store/               # Pinia状态管理
│   │   ├── modules/         # 状态模块
│   │   │   ├── turntable.js # 转盘状态
│   │   │   ├── config.js    # 配置状态
│   │   │   ├── history.js   # 历史状态
│   │   │   └── ui.js        # UI状态
│   │   ├── persistence/     # 持久化相关
│   │   │   └── plugins.js   # 持久化插件
│   │   └── index.js         # Store入口
│   ├── types/               # TypeScript类型定义
│   │   ├── turntable/       # 转盘相关类型
│   │   │   ├── wheel.ts     # 轮盘类型
│   │   │   └── pointer.ts   # 指针类型
│   │   ├── config/          # 配置相关类型
│   │   │   ├── appearance.ts # 外观配置类型
│   │   │   └── animation.ts  # 动画配置类型
│   │   ├── common.ts        # 通用类型
│   │   ├── prize.ts         # 奖品类型定义
│   │   └── config.ts        # 配置类型定义
│   ├── utils/               # 工具函数
│   │   ├── math/            # 数学相关工具
│   │   │   ├── random.js    # 随机数工具
│   │   │   ├── angle.js     # 角度计算工具
│   │   │   └── probability.js # 概率计算工具
│   │   ├── draw/            # 绘图相关工具
│   │   │   ├── canvas.js    # Canvas工具
│   │   │   ├── svg.js       # SVG工具
│   │   │   └── color.js     # 颜色处理工具
│   │   ├── storage/         # 存储相关工具
│   │   │   ├── local.js     # 本地存储工具
│   │   │   └── export.js    # 导出工具
│   │   ├── validation/      # 验证相关工具
│   │   │   ├── schema.js    # 数据模式验证
│   │   │   └── form.js      # 表单验证
│   │   ├── device/          # 设备相关工具
│   │   │   ├── browser.js   # 浏览器检测
│   │   │   └── screen.js    # 屏幕工具
│   │   ├── probability.js   # 概率计算工具
│   │   ├── animation.js     # 动画辅助函数
│   │   ├── canvas.js        # Canvas绘图工具
│   │   └── storage.js       # 存储工具
│   ├── views/               # 页面视图
│   │   ├── home/            # 主页相关视图
│   │   │   ├── components/  # 主页专用组件
│   │   │   │   ├── Welcome.vue      # 欢迎组件
│   │   │   │   └── QuickStart.vue   # 快速开始组件
│   │   │   └── index.vue    # 主页视图入口
│   │   ├── config/          # 配置相关视图
│   │   │   ├── components/  # 配置页专用组件
│   │   │   │   ├── ConfigTabs.vue   # 配置标签页
│   │   │   │   └── SaveButton.vue   # 保存按钮
│   │   │   ├── basic.vue    # 基本配置页
│   │   │   ├── advanced.vue # 高级配置页
│   │   │   └── index.vue    # 配置视图入口
│   │   ├── history/         # 历史相关视图
│   │   │   ├── components/  # 历史页专用组件
│   │   │   │   ├── TimelineFilter.vue # 时间线过滤器
│   │   │   │   └── ExportPanel.vue    # 导出面板
│   │   │   ├── records.vue  # 记录页
│   │   │   ├── analytics.vue # 分析页
│   │   │   └── index.vue    # 历史视图入口
│   │   ├── presentation/    # 演示模式视图
│   │   │   ├── components/  # 演示专用组件
│   │   │   │   └── FullscreenWheel.vue # 全屏转盘
│   │   │   └── index.vue    # 演示视图入口
│   │   ├── settings/        # 设置相关视图
│   │   │   ├── general.vue  # 常规设置
│   │   │   ├── appearance.vue # 外观设置
│   │   │   └── index.vue    # 设置视图入口
│   │   ├── Home.vue         # 主页
│   │   ├── Config.vue       # 配置页
│   │   └── History.vue      # 历史记录页
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   └── env.d.ts             # 环境变量类型声明
├── .vscode/                 # VSCode配置
│   ├── extensions.json      # 推荐扩展
│   └── settings.json        # 编辑器设置
├── scripts/                 # 脚本文件
│   ├── build.js             # 构建脚本
│   └── generate-icons.js    # 图标生成脚本
├── .eslintrc.js             # ESLint配置
├── .prettierrc              # Prettier配置
├── .gitignore               # Git忽略文件
├── .editorconfig            # 编辑器配置
├── vite.config.js           # Vite配置
├── tsconfig.json            # TypeScript配置
├── cypress.json             # Cypress配置
├── index.html               # HTML模板
├── package.json             # 包管理配置
├── yarn.lock                # Yarn锁文件
├── LICENSE                  # 许可证文件
└── README.md                # 项目文档
```

## 执行方案

### 1. 项目搭建
- 使用Vite创建Vue 3项目
- 配置开发环境
- 安装必要依赖

### 2. 界面设计
- 设计主页布局（响应式）
- 设计转盘组件
- 设计配置面板
- 设计结果展示页面

### 3. 功能实现
- **转盘组件开发**：
  - 使用LeaferJS绘制可配置的转盘
    - 利用LeaferJS的Canvas渲染能力创建高性能转盘
    - 实现扇区、文字、图像等元素的绘制
    - 使用LeaferJS的动画系统实现流畅的旋转效果
  - 添加流畅的旋转动画效果
    - 配置弹性缓动效果增强真实感
    - 实现转盘减速停止的物理效果
  - 支持自定义颜色和分区
    - 动态生成扇区配色方案
    - 支持自定义图片和文字样式

- **配置系统开发**：
  - 抽奖内容编辑
  - 中奖概率设置
  - 抽奖详情配置
  - 配置保存和读取功能

- **抽奖逻辑实现**：
  - 基于概率的随机算法
  - 动态角度计算
  - 结果展示和动画过渡
    - 使用tsParticles实现中奖庆祝效果
      - 彩带雨效果(Confetti)
      - 烟花爆炸效果(Fireworks)
      - 动态星星效果(Stars)
    - 配置不同奖项对应的不同庆祝效果
    - 实现粒子效果与结果展示的无缝衔接

### 4. 本地存储
- 设计数据结构
- 实现配置保存功能
- 历史记录管理

### 5. 文档编写
- 使用说明
- 开发文档

## 补充考虑因素

### 1. 用户体验优化
- **音效反馈**：添加抽奖开始、旋转中和结束音效，增强交互体验
- **震动反馈**：在移动设备上支持震动反馈
- **庆祝动效**：使用tsParticles实现多样化的中奖庆祝效果
  - 针对不同等级奖项显示不同密度和颜色的粒子效果
  - 支持自定义中奖动效风格，满足不同场景需求
  - 低配置设备自动降级处理，确保流畅体验
- **加载状态**：优化加载体验，考虑使用骨架屏或过渡动画
- **操作引导**：首次使用时提供简单教程或提示

### 2. 配置灵活性
- **转盘自定义**：支持自定义扇区数量、颜色、文字和图标
- **概率精确控制**：提供精确的概率设置接口，支持固定概率和动态概率
- **预设模板**：提供常用转盘配置模板，方便快速使用

### 3. 安全性考虑
- **防作弊机制**：确保前端概率计算不易被篡改
- **数据验证**：对用户输入进行验证，防止XSS攻击
- **配置备份**：提供配置导出/导入功能

### 4. 兼容性
- **浏览器兼容性**：测试主流浏览器兼容性
- **设备适配**：确保在不同尺寸的设备上都有良好表现
- **触摸支持**：优化触摸屏操作体验，支持手势控制

### 5. 功能扩展
- **历史记录**：详细的抽奖历史记录和统计
- **主题切换**：支持明暗主题或自定义主题
