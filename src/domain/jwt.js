// Reads a JWT's payload without verifying its signature — that's the server's
// job on every request. Client-side this is only for scheduling (exp) and for
// knowing who the token says the user is (sub, roles).

/** @returns {Object|null} the decoded claims, or null if not a readable JWT */
export function decodeJwtPayload(token) {
    try {
        // JWT segments are base64url with padding stripped; atob wants standard,
        // padded base64.
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(b64 + '='.repeat((4 - b64.length % 4) % 4)))
    } catch {
        return null
    }
}

/** @returns {number|null} the exp claim in epoch ms (exp itself is seconds) */
export function decodeJwtExpiry(token) {
    const payload = decodeJwtPayload(token)
    return payload?.exp ? payload.exp * 1000 : null
}
