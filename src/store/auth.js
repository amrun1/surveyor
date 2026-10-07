import { ref, computed, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { saveSession, getSession, clearSession, clearTaskCache } from '@/database/db.js'
import { filterMenuByRole, collectLeaves, collectLeafUris } from '@/domain/menu.js'
import { decodeJwtExpiry } from '@/domain/jwt.js'
import { isEmbedded } from '@/embed/embedMode.js'

// Backend token lifetime as observed in real tokens (exp − iat = 3600s). Only
// used when the exp claim can't be read — the server still validates every request.
const FALLBACK_TOKEN_LIFETIME_MS = 60 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null)
    const expiresAt = ref(null) // epoch ms
    const roles = ref([]) // confirmed returned by /auth/login (JwtAuthenticationResponse.roles)
    const userId = ref(null) // confirmed returned by /auth/login (JwtAuthenticationResponse.userId)
    // For accounts with more than one role, the one currently selected in the
    // Header. Always one of `roles`; defaults to roles[0].
    const activeRole = ref(null)
    // Full menu tree from /auth/login (mapMenuTree), for every role the user has.
    const menus = ref([])
    // false = this session predates backend menus (never received any), as
    // opposed to the backend genuinely sending an empty list. The router guard
    // uses it to send such sessions back to /login once instead of locking them out.
    const hasMenuData = ref(false)
    const isHydrated = ref(false) // true once we've checked IndexedDB for a prior session

    // Set by the router guard specifically for the "offline + invalid token"
    // case: the person was let through to keep working locally, but the guard
    // couldn't actually verify them. Surfaced as a persistent banner (App.vue)
    // rather than staying silent, and cleared once a valid session is restored.
    const needsReauthWhenOnline = ref(false)

    // Registry of "save whatever's unsaved right now" callbacks. Components that
    // hold in-progress local state (SurveyForm.vue) register one on mount so the
    // router guard can force an immediate flush before redirecting to /login —
    // debounced autosave alone isn't guaranteed to have fired yet at that instant.
    const flushHandlers = new Set()
    const registerFlushHandler = (fn) => { flushHandlers.add(fn) }
    const unregisterFlushHandler = (fn) => { flushHandlers.delete(fn) }
    const flushPendingSaves = async () => {
        await Promise.all([...flushHandlers].map(fn => {
            try { return Promise.resolve(fn()) } catch { return Promise.resolve() }
        }))
    }

    const isTokenValid = computed(() => !!token.value && !!expiresAt.value && Date.now() < expiresAt.value)

    // What the sidebar shows and the router guard allows, for the active role only.
    const visibleMenus = computed(() => filterMenuByRole(menus.value, activeRole.value))
    const allowedUris = computed(() => collectLeafUris(visibleMenus.value))
    const firstAllowedUri = computed(() => collectLeaves(visibleMenus.value)[0]?.uri ?? null)

    // `expiresAt` takes precedence when the server sends one explicitly; otherwise
    // fall back to decoding the JWT itself.
    // Arrays must go through toRaw() — IndexedDB can't structured-clone a reactive Proxy.
    // menus is a nested tree and toRaw() only unwraps the top level, so it's
    // deep-copied to plain JSON instead.
    // Embedded mode (embed/embedMode.js) keeps the session in memory only — the
    // IndexedDB `session` store belongs to the standalone app.
    const persistSession = () => isEmbedded ? Promise.resolve() : saveSession({
        token: token.value,
        expiresAt: expiresAt.value,
        roles: toRaw(roles.value),
        userId: userId.value,
        activeRole: activeRole.value,
        menus: JSON.parse(JSON.stringify(menus.value))
    })

    const setSession = async ({ token: newToken, expiresAt: serverExpiresAt, roles: newRoles, userId: newUserId, menus: newMenus }) => {
        token.value = newToken
        expiresAt.value = serverExpiresAt ?? decodeJwtExpiry(newToken)
        if (newToken && !expiresAt.value) {
            console.warn('No usable exp claim on token — assuming the backend default 1h lifetime.')
            expiresAt.value = Date.now() + FALLBACK_TOKEN_LIFETIME_MS
        }
        roles.value = newRoles || []
        userId.value = newUserId ?? null
        activeRole.value = roles.value[0] ?? null
        menus.value = newMenus || []
        hasMenuData.value = true
        needsReauthWhenOnline.value = false
        await persistSession()
    }

    const setActiveRole = async (role) => {
        if (!roles.value.includes(role) || role === activeRole.value) return
        activeRole.value = role
        await persistSession()
    }

    const clearAuth = async () => {
        token.value = null
        expiresAt.value = null
        roles.value = []
        userId.value = null
        activeRole.value = null
        menus.value = []
        hasMenuData.value = false
        // Embedded mode must never touch the standalone app's stored session or
        // task cache — on a same-origin parent that would log out a surveyor
        // signed in to the standalone app in another tab.
        if (isEmbedded) return
        await clearSession()
        // Cached task rows carry debtor names/addresses — don't leave them on a
        // shared device for whoever signs in next.
        await clearTaskCache()
    }

    // Called once on app boot (see App.vue) so a reload/reopen doesn't force a
    // fresh login every time — restores whatever was last persisted, valid or not;
    // isTokenValid still correctly reports false for an expired one.
    const hydrate = async () => {
        const session = await getSession()
        if (session) {
            token.value = session.token
            expiresAt.value = session.expiresAt
            roles.value = session.roles || []
            userId.value = session.userId ?? null
            // Sessions persisted before activeRole existed won't have one.
            activeRole.value = roles.value.includes(session.activeRole) ? session.activeRole : (roles.value[0] ?? null)
            // Sessions persisted before menus existed won't have any — the router
            // guard sends those back to /login once to pick them up.
            hasMenuData.value = Array.isArray(session.menus)
            menus.value = session.menus || []
        }
        isHydrated.value = true
    }

    return {
        token, expiresAt, roles, userId, activeRole, isHydrated, isTokenValid, needsReauthWhenOnline,
        menus, hasMenuData, visibleMenus, allowedUris, firstAllowedUri,
        setSession, setActiveRole, clearAuth, hydrate,
        registerFlushHandler, unregisterFlushHandler, flushPendingSaves
    }
})