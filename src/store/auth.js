import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { saveSession, getSession, clearSession } from '@/database/db.js'

// Reads the `exp` claim out of a JWT without verifying its signature — that's
// the server's job on every request; this is purely so the client can schedule
// a proactive refresh / show an expiry warning without a round-trip just to ask.
function decodeJwtExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return payload.exp ? payload.exp * 1000 : null // exp is seconds; JS wants ms
    } catch {
        return null // not a JWT, or unreadable — caller should fall back to a server-supplied expiresAt
    }
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref(null)
    const expiresAt = ref(null) // epoch ms
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
    const setSession = async ({ token: newToken, expiresAt: serverExpiresAt }) => {
        token.value = newToken
        expiresAt.value = serverExpiresAt ?? decodeJwtExpiry(newToken)
        needsReauthWhenOnline.value = false
        await saveSession({ token: token.value, expiresAt: expiresAt.value })
    }

    const clearAuth = async () => {
        token.value = null
        expiresAt.value = null
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
        }
        isHydrated.value = true
    }

    return {
        token, expiresAt, isHydrated, isTokenValid, needsReauthWhenOnline,
        setSession, clearAuth, hydrate,
        registerFlushHandler, unregisterFlushHandler, flushPendingSaves
    }
})