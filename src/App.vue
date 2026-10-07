<script setup>
import { ref, provide, onUnmounted, onMounted } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useUiStore } from '@/store/ui.js'
import { useAuthStore } from '@/store/auth.js'
import { APP_COLORS } from '@/constants/colors.js'
import Header from './components/Header.vue'
import Menu from './components/Menu.vue'
import AppToast from '@/components/Toast.vue'

import { runInitialServerSync } from '@/services/bootstrap.js'
import { useSync } from '@/composables/useSync.js'
import { isEmbedded } from '@/embed/embedMode.js'

const { flushPendingSyncQueue, setupSyncListeners, cleanupSyncListeners } = useSync()

const ui = useUiStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const globalToastComponentRef = ref(null)

onMounted(() => {
  // Embedded (iframe) mode carries the parent app's user — the surveyor's
  // offline sync queue must never be flushed under that identity.
  if (isEmbedded) return
  runInitialServerSync()
  setupSyncListeners()
  flushPendingSyncQueue()
})

onUnmounted(() => {
  cleanupSyncListeners()
})

provide('toast', {
  success: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'success'),
  offline: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'offline'),
  error: (title, msg) => globalToastComponentRef.value?.show(title, msg, 'error')
})

// The router guard let someone through offline with an invalid token so they
// could keep working locally — this is what makes that state visible instead
// of silent. The moment connectivity actually returns (not just a flag flip,
// the real browser event), send them to sign in properly.
window.addEventListener('online', () => {
  if (!isEmbedded && auth.needsReauthWhenOnline && !auth.isTokenValid) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
  }
})
</script>

<template>
  <div :style="{
    '--color-primary': APP_COLORS.primary,
    '--color-secondary': APP_COLORS.secondary,
    '--color-accent': APP_COLORS.accent,
    '--color-danger': APP_COLORS.danger,
    '--color-background': APP_COLORS.background
  }" class="h-screen overflow-hidden flex flex-col antialiased">

    <template v-if="route.meta.layout === 'fullscreen' || isEmbedded">
      <RouterView />
    </template>

    <template v-else>
      <div v-if="auth.needsReauthWhenOnline"
        class="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold text-center py-2 px-4">
        Working offline on a saved session — you'll need to sign in again once you're back online.
      </div>

      <Header />

      <div class="flex flex-1 pt-16 overflow-hidden">
        <Menu />

        <div v-if="ui.isMenuOpen" @click="ui.closeMenu" class="fixed inset-0 bg-slate-900/40 z-30 md:hidden"></div>

        <main class="flex-1 bg-sky overflow-y-auto p-4 md:p-8">
          <div class="max-w-5xl">
            <RouterView />
          </div>
        </main>
      </div>
    </template>

    <AppToast ref="globalToastComponentRef" />
  </div>
</template>