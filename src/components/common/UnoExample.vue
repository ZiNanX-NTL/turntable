<template>
  <div class="uno-example p-4 border rounded-lg">
    <h2 class="text-xl font-bold mb-4 text-primary">UnoCSS 示例</h2>

    <!-- 基础样式 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">基础样式</h3>
      <div class="flex gap-2 flex-wrap">
        <div class="p-2 bg-blue-500 text-white rounded">蓝色背景</div>
        <div class="p-2 bg-green-500 text-white rounded">绿色背景</div>
        <div class="p-2 bg-red-500 text-white rounded">红色背景</div>
      </div>
    </div>

    <!-- 响应式设计 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">响应式设计</h3>
      <div
        class="bg-yellow-200 p-2 sm:bg-blue-200 md:bg-green-200 lg:bg-purple-200 text-center"
      >
        调整窗口大小查看变化
      </div>
    </div>

    <!-- 使用自定义快捷方式 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">自定义快捷方式</h3>
      <div class="flex gap-2">
        <button class="btn btn-primary">主要按钮</button>
        <div class="card">卡片组件</div>
      </div>
    </div>

    <!-- 使用属性化模式 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">属性化模式</h3>
      <div
        bg="blue-100 hover:blue-200"
        text="center gray-800"
        p="4"
        border="rounded-lg"
        transition="all duration-300"
      >
        使用属性化模式的元素
      </div>
    </div>

    <!-- 图标支持 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">图标支持</h3>
      <div class="flex gap-4">
        <div class="i-carbon-sun text-2xl"></div>
        <div class="i-carbon-moon text-2xl"></div>
        <div class="i-carbon-settings text-2xl"></div>
      </div>
    </div>

    <!-- 自定义规则 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">自定义规则</h3>
      <div class="flex gap-2">
        <div class="bg-gray-100 p-3 r-8">r-8 圆角</div>
        <div class="bg-gray-100 p-3 shadow-sm">shadow-sm</div>
        <div class="bg-gray-100 p-3 shadow">shadow</div>
        <div class="bg-gray-100 p-3 shadow-md">shadow-md</div>
        <div class="bg-gray-100 p-3 shadow-lg">shadow-lg</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// UnoCSS示例组件
</script>
