import { useAuthStore } from '@/store/auth.js'

// Frontend (/surveyor) and backend both deploy as separate WARs on the SAME
// Tomcat instance, at different context-paths — same scheme+host+port, so
// they're same-origin in production by definition. No proxy/rewrite is needed
// there at all; a plain relative path like '/appraisal-api/auth/login' just
// works, served directly by Tomcat.
//
// The one place a proxy still matters is LOCAL DEV: Vite's dev server and the
// backend's local dev instance run on different ports, which genuinely are
// different origins until deployed. vite.config.js's dev-only proxy bridges
// that gap using this exact same path, so one code path works in both places —
// only the *target it forwards to* differs between environments, not this URL.
//
// TODO: replace with the backend's real Tomcat context-path once confirmed.
const BASE_URL = '/appraisal-api'

// `skipAuth: true` sends the request without the bearer token, and a 401 from
// it is never treated as session invalidation (e.g. the heartbeat ping).
export async function apiFetch(path, { skipAuth = false, ...options } = {}) {
    const auth = useAuthStore()
    const hadToken = !skipAuth && !!auth.token

    const headers = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
        ...(hadToken ? { Authorization: `Bearer ${auth.token}` } : {})
    }

    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    if (hadToken && response.status === 401) {
        await auth.clearAuth()
    }

    return response
}