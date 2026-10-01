import { apiFetch } from './api.js'

// Confirmed against appraisal-backend's LoginController.java:
// - Request body key is `userId`, not `username` (JwtAuthenticationRequest.java)
// - Route has no leading '/api' — this service has no context-path configured
export function login(userId, password) {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ userId, password })
    })
}

// Was entirely missing before — there was no logout call anywhere in the app.
// This one matters beyond just clearing local state: the backend maintains a
// server-side JwtBlacklistService and actually revokes the token on logout,
// so skipping this call would leave the token technically still valid until
// its natural expiry even after the person "logged out" on this device.
export function logout() {
    return apiFetch('/auth/logout', { method: 'POST' })
}