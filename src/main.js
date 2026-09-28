import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/store/auth.js'
import App from './App.vue'
import router from './router'
import './assets/main.css'

async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted()
    if (!isPersisted) await navigator.storage.persist()
  }
}

const app = createApp(App)
app.use(createPinia())
await useAuthStore().hydrate()
app.use(router)
app.mount('#app')

requestPersistentStorage()