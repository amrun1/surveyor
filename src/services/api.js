import { useAuthStore } from '@/store/auth.js'

const BASE_URL = `${import.meta.env.BASE_URL}api/`

export async function apiFetch(path, options = {}) {
    const auth = useAuthStore()
    const hadToken = !!auth.token

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