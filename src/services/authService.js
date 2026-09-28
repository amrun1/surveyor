import { apiFetch } from './api.js'

export function login(username, password) {
    return apiFetch('auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    })
}