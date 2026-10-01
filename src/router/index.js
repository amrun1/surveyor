import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/features/auth/Login.vue'), meta: { layout: 'fullscreen' } },
    { path: '/', name: 'tasklist', component: () => import('@/features/tasklist/tasklist.vue') },
    { path: '/survey/inquiry', name: 'inquiry', component: () => import('@/features/survey/Inquiry.vue') },
    { path: '/survey/form', name: 'form', component: () => import('@/features/survey/SurveyForm.vue') }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Already-authenticated user landing on /login (e.g. a stale bookmark, or
  // tapping back) — send them on rather than showing the form again.
  if (to.name === 'login') {
    if (auth.isTokenValid) return { path: typeof to.query.redirect === 'string' ? to.query.redirect : '/' }
    return true
  }

  if (auth.isTokenValid) return true

  // From here: token missing or expired. This is the three-way split.
  if (navigator.onLine) {
    // Online + invalid: save whatever's currently unsaved before navigating away —
    // debounced autosave may not have fired yet at this exact instant, and a forced
    // redirect shouldn't be the reason a few seconds of typing gets lost.
    await auth.flushPendingSaves()
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Offline + invalid: let them through. Every route here works from local
  // IndexedDB (drafts, cached dropdown options, the sync queue) — auth gates
  // server calls, which already fail/queue safely on their own regardless of
  // this guard. Blocking navigation would only lock someone out of their own
  // local data for no real benefit. Flagged so the UI can show it, not stay silent.
  auth.needsReauthWhenOnline = true
  return true
})

export default router