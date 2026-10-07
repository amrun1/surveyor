import { ref } from 'vue'
import { useAuthStore } from '@/store/auth.js'
import { decodeJwtPayload } from '@/domain/jwt.js'
import { PARENT_ORIGINS } from './embedMode.js'

// postMessage contract with the embedding application — keep in sync with
// docs/embed-contract.md, which is what the parent app's team works from.
const CHILD_SOURCE = 'surveyor-mapper'
const PARENT_SOURCE = 'appraisal-host'
const PROTOCOL_VERSION = 1

const AUTH_TIMEOUT_MS = 10_000
// Ask the parent for a fresh token this long before the current one expires,
// so a request never has to fail first.
const REFRESH_BEFORE_EXPIRY_MS = 60_000

// 'waiting' — no usable session yet (or the last one expired)
// 'ready'   — a valid token from the parent is in the auth store
// 'error'   — no valid session arrived within AUTH_TIMEOUT_MS
export const bridgeState = ref('waiting')
// Stays true after the first session, so the page isn't torn down (losing
// unsaved edits) while a refreshed token is on its way.
export const hasBeenReady = ref(false)

let started = false
let parentOrigin = null // locked to the origin of the first accepted session
let timeoutId = null
let refreshTimerId = null

// Which allowed origin is actually embedding us. ancestorOrigins (Chromium/
// Safari) is exact; document.referrer is the fallback. If neither identifies an
// allowed origin, messages go to every allowed origin — postMessage only
// delivers to the one that matches the parent's real origin.
function detectParentOrigin() {
    const candidates = [location.ancestorOrigins?.[0]]
    try { candidates.push(new URL(document.referrer).origin) } catch { /* no referrer */ }
    return candidates.find(origin => PARENT_ORIGINS.includes(origin)) ?? null
}

// Always an explicit targetOrigin — never '*', which would hand the message to
// whatever page happens to be framing us.
function post(message) {
    const targets = parentOrigin ? [parentOrigin] : PARENT_ORIGINS
    for (const origin of targets) {
        window.parent.postMessage({ source: CHILD_SOURCE, version: PROTOCOL_VERSION, ...message }, origin)
    }
}

function waitForSession() {
    bridgeState.value = 'waiting'
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
        if (bridgeState.value !== 'ready') bridgeState.value = 'error'
    }, AUTH_TIMEOUT_MS)
}

async function acceptSession(rawToken, origin) {
    if (typeof rawToken !== 'string') return
    const token = rawToken.replace(/^Bearer\s+/i, '')
    const claims = decodeJwtPayload(token)

    // Only the token is trusted: who the user is comes from its own claims,
    // never from separate message fields that could disagree with it. The
    // backend still verifies the signature on every request.
    if (!claims?.exp || claims.exp * 1000 <= Date.now()) {
        console.warn('Embed bridge: rejected a missing, unreadable or expired token from the parent.')
        return
    }

    parentOrigin = origin
    await useAuthStore().setSession({
        token,
        userId: claims.sub ?? null,
        roles: Array.isArray(claims.roles) ? claims.roles : [],
        menus: []
    })

    clearTimeout(timeoutId)
    bridgeState.value = 'ready'
    hasBeenReady.value = true

    clearTimeout(refreshTimerId)
    refreshTimerId = setTimeout(requestTokenRefresh, Math.max(0, claims.exp * 1000 - Date.now() - REFRESH_BEFORE_EXPIRY_MS))
}

function handleMessage(event) {
    // Both checks: the origin must be allowlisted AND the sender must be our
    // actual parent window (not another frame on an allowed origin).
    if (event.source !== window.parent || !PARENT_ORIGINS.includes(event.origin)) return
    if (parentOrigin && event.origin !== parentOrigin) return

    const data = event.data
    if (!data || typeof data !== 'object' || data.source !== PARENT_SOURCE) return

    if (data.type === 'auth') acceptSession(data.token, event.origin)
}

export function startEmbedBridge() {
    if (started) return
    started = true
    parentOrigin = detectParentOrigin()
    window.addEventListener('message', handleMessage)
    requestSession()
}

/** Announce we're listening; the parent answers with an 'auth' message. Also the Retry action. */
export function requestSession() {
    if (PARENT_ORIGINS.length === 0) {
        console.error('Embed bridge: VITE_EMBED_PARENT_ORIGINS is not configured — no parent can send a session.')
        bridgeState.value = 'error'
        return
    }
    waitForSession()
    post({ type: 'ready' })
}

/** Proactive: the token is about to expire. The page keeps working on the current one meanwhile. */
function requestTokenRefresh() {
    post({ type: 'auth-expired' })
}

/** Reactive: the backend rejected the token (401). Drop it and wait for a fresh one. */
export function handleAuthExpired() {
    clearTimeout(refreshTimerId)
    useAuthStore().clearAuth() // memory-only in embedded mode (auth.js)
    waitForSession()
    post({ type: 'auth-expired' })
}
