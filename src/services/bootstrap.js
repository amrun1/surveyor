import { refreshParameterOptions } from '@/services/parameterOptions.js'

/**
 * Lookup data refreshed once per app start (App.vue onMounted; skipped when
 * embedded). Each refresh caches to IndexedDB itself and never throws, so a
 * failure here just means the forms keep their last-cached / snapshot lists.
 * Login.vue also refreshes after sign-in, since the start-up call may have run
 * with an expired token.
 */
export async function runInitialServerSync() {
    return refreshParameterOptions()
}
