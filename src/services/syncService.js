import { apiFetch } from './api.js'

export async function checkHeartbeat() {
    if (!navigator.onLine) return false
    try {
        // 0-byte network footprint verification header call protects cellular usage
        const response = await apiFetch('lookup/facility-types', { method: 'HEAD', cache: 'no-store' })
        return response.ok
    } catch {
        return false
    }
}

export function submitSurvey(payload) {
    return apiFetch('survey/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export function fetchFacilityTypes() {
    return apiFetch('lookup/facility-types', { method: 'GET' })
}