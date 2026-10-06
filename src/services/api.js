import { useAuthStore } from '@/store/auth.js'

const BASE_URL = '/appraisal-backend'

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