import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/store/auth.js'
import App from './App.vue'
import router, { syncMenuRoutes } from './router'
import { isEmbedded } from '@/embed/embedMode.js'
import { startEmbedBridge } from '@/embed/bridge.js'
import './assets/main.css'

async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted()
    if (!isPersisted) await navigator.storage.persist()
  }
}

const app = createApp(App)
app.use(createPinia())
if (isEmbedded) {
  // Session comes from the parent window over postMessage, memory-only —
  // the stored standalone session is deliberately never read.
  startEmbedBridge()
} else {
  await useAuthStore().hydrate()
  syncMenuRoutes() // before the first navigation, so a deep link to a menu-only route resolves
}
app.use(router)
app.mount('#app')

if (!isEmbedded) requestPersistentStorage()
