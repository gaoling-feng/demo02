import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // <-- ① 导入 Node.js 的 path 模块

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: { // <-- ② 添加 resolve 配置项
    alias: { // <-- ③ 添加 alias 别名配置
      '@': path.resolve(__dirname, './src'), // <-- ④ 定义 @ 指向项目根目录下的 src 文件夹
    },
  },
})