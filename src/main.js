import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' 
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


createApp(App).use(router).use(pinia).use(ElementPlus).mount('#app')
