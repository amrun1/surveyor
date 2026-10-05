import { ref, computed, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { saveSession, getSession, clearSession } from '@/database/db.js'

// Reads the `exp` claim out of a JWT without verifying its signature — that's
// the server's job on every request; this is purely so the client can schedule
// a proactive refresh / show an expiry warning without a round-trip just to ask.
function decodeJwtExpiry(token) {
    try {
        // JWT segments are base64url with padding stripped; atob wants standard,
        // padded base64.
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(b64 + '='.repeat((4 - b64.length % 4) % 4)))
        return payload.exp ? payload.exp * 1000 : null // exp is seconds; JS wants ms
    } catch (err) {
        console.warn('Could not decode JWT exp claim:', err)
        return null // not a JWT, or unreadable — caller falls back
    }
}

// Confirmed backend token lifetime (app.jwt.expiration-ms=86400000). Only used
// when the exp claim can't be read — the server still validates every request.
const FALLBACK_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null)
    const expiresAt = ref(null) // epoch ms
    const roles = ref([]) // confirmed returned by /auth/login (JwtAuthenticationResponse.roles)
    const userId = ref(null) // confirmed returned by /auth/login (JwtAuthenticationResponse.userId)
    // For accounts with more than one role, the one currently selected in the
    // Header. Always one of `roles`; defaults to roles[0].
    const activeRole = ref(null)
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

    // `expiresAt` takes precedence when the server sends one explicitly; otherwise
    // fall back to decoding the JWT itself.
    // Arrays must go through toRaw() — IndexedDB can't structured-clone a reactive Proxy.
    const persistSession = () => saveSession({
        token: token.value,
        expiresAt: expiresAt.value,
        roles: toRaw(roles.value),
        userId: userId.value,
        activeRole: activeRole.value
    })

    const setSession = async ({ token: newToken, expiresAt: serverExpiresAt, roles: newRoles, userId: newUserId }) => {
        token.value = newToken
        expiresAt.value = serverExpiresAt ?? decodeJwtExpiry(newToken)
        if (newToken && !expiresAt.value) {
            console.warn('No usable exp claim on token — assuming the backend default 24h lifetime.')
            expiresAt.value = Date.now() + FALLBACK_TOKEN_LIFETIME_MS
        }
        roles.value = newRoles || []
        userId.value = newUserId ?? null
        activeRole.value = roles.value[0] ?? null
        needsReauthWhenOnline.value = false
        console.log('Auth session set:', { token: token.value, expiresAt: expiresAt.value, roles: roles.value })
        await persistSession()
        console.log('Auth session saved to IndexedDB.')
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
        await clearSession()
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
        }
        isHydrated.value = true
    }

    return {
        token, expiresAt, roles, userId, activeRole, isHydrated, isTokenValid, needsReauthWhenOnline,
        setSession, setActiveRole, clearAuth, hydrate,
        registerFlushHandler, unregisterFlushHandler, flushPendingSaves
    }
})