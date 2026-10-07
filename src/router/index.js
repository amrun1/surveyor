import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import { collectLeaves } from '@/domain/menu.js'
import { isEmbedded } from '@/embed/embedMode.js'

const ComingSoon = () => import('@/features/error/ComingSoon.vue')

// Route meta used by the guard below:
//   menuUri    — this page belongs to that menu entry (a sub-page with no menu item of its own)
//   menuExempt — not governed by the backend menu at all
//   embedOnly  — only ever shown inside the parent app's iframe; auth comes from
//                the parent (embed/bridge.js) and is handled by EmbedGate, not here
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/features/auth/Login.vue'), meta: { layout: 'fullscreen' } },
    { path: '/', name: 'tasklist', component: () => import('@/features/task/Tasklist.vue') },
    { path: '/survey/inquiry', name: 'inquiry', component: () => import('@/features/survey/Inquiry.vue') },
    // Opened from a Task List row, so it's allowed whenever Task List is.
    { path: '/survey/form', name: 'form', component: () => import('@/features/survey/SurveyForm.vue'), meta: { menuUri: '/' } },
    // Embedded in another application's iframe (see embed/embedMode.js) — by
    // design never part of the backend menu.
    { path: '/surveyor-mapper', name: 'surveyor-mapper', component: () => import('@/features/surveyorMapper/SurveyMapper.vue'), meta: { layout: 'fullscreen', embedOnly: true } },
    { path: '/no-access', name: 'no-access', component: () => import('@/features/error/NoAccess.vue') },
    // Must stay last: anything not matched above renders the 404 page.
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/features/error/NotFound.vue'), meta: { layout: 'fullscreen' } },
  ]
})

// Menu entries whose uri has no page yet get a ComingSoon route at that exact
// uri, so the link, the URL bar and a reload all behave like a real page.
// Static routes above always win — once e.g. /order-report gets a real route,
// it simply stops being registered here.
const menuRouteRemovers = []

export function syncMenuRoutes() {
  const auth = useAuthStore()
  watch(() => auth.menus, (menus) => {
    menuRouteRemovers.splice(0).forEach(remove => remove())
    const registered = new Set()
    for (const leaf of collectLeaves(menus)) {
      if (registered.has(leaf.uri) || router.resolve(leaf.uri).name !== 'not-found') continue
      registered.add(leaf.uri)
      menuRouteRemovers.push(router.addRoute({
        path: leaf.uri,
        name: `menu-${leaf.id}`,
        component: ComingSoon,
        meta: { title: leaf.name }
      }))
    }
  // sync: Login.vue navigates right after setSession() — the routes must exist by then.
  }, { immediate: true, flush: 'sync' })
}

// The backend menu decides which pages the active role may open. This only
// hides UI — the backend must still authorize every request itself.
// Returns true (allowed) or a redirect target. Exported for Header.vue: a role
// switch changes access without any navigation, so the guard wouldn't re-run.
export function checkMenuAccess(to, auth) {
  // Session from before menus existed: nothing to check against (handled by the caller).
  if (!auth.hasMenuData || to.meta.menuExempt) return true

  if (to.name === 'no-access') return auth.firstAllowedUri ?? true

  const uri = to.meta.menuUri ?? to.path
  if (auth.allowedUris.has(uri)) return true
  return auth.firstAllowedUri ?? { name: 'no-access' }
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Embedded pages: no /login redirect (that would render a login form inside
  // the parent app) and no menu check — EmbedGate waits for the parent's session.
  if (to.meta.embedOnly) return true
  // Inside the iframe, nothing else of this app may ever be shown.
  if (isEmbedded) return false

  // Unknown URL: show the 404 directly — bouncing through /login first would
  // only land the user on the same 404 after signing in.
  if (to.name === 'not-found') return true

  // Already-authenticated user landing on /login (e.g. a stale bookmark, or
  // tapping back) — send them on rather than showing the form again.
  if (to.name === 'login') {
    if (auth.isTokenValid && auth.hasMenuData) return { path: typeof to.query.redirect === 'string' ? to.query.redirect : '/' }
    return true
  }

  if (auth.isTokenValid) {
    // Valid token but the session predates backend menus — sign in once more
    // to receive them (online only; offline falls through below).
    if (!auth.hasMenuData && navigator.onLine) {
      await auth.flushPendingSaves()
      await auth.clearAuth()
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    return checkMenuAccess(to, auth)
  }

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
  // The menu still applies — it's cached locally with the session.
  auth.needsReauthWhenOnline = true
  return checkMenuAccess(to, auth)
})

export default router
