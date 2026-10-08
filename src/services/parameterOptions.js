// LPA form option lists from the parameter service, offline-first:
//   network → mapParameterOptions (domain/mappers.js) → IndexedDB `dropdownOptions`
//   → forms/options.js setRemoteOptions() → resolveOptions()
// The hardcoded snapshot in forms/options.js stays the fallback for anything
// this never managed to load (first offline run, endpoint missing, a group the
// backend doesn't send). Nothing here throws: options must never block a form.
import { cacheDropdownOptions, getCachedDropdownOptions } from '@/database/db.js'
import { mapParameterOptions } from '@/domain/mappers.js'
import { fetchParameterOptions } from '@/services/syncService.js'
import { setRemoteOptions } from '@/features/survey/forms/options.js'

const CACHE_KEY = 'parameterOptions'

let cacheLoad = null

/**
 * Loads the last cached lists into the form registry, once per app session.
 * SurveyForm awaits this before building a form, so offline surveyors get the
 * last-known service lists rather than the build-time snapshot.
 */
export function loadCachedParameterOptions() {
    cacheLoad ??= getCachedDropdownOptions(CACHE_KEY)
        .then(cached => { if (cached?.groups) setRemoteOptions(cached.groups) })
        .catch(error => console.warn('Cached parameter options unavailable:', error))
    return cacheLoad
}

/**
 * Fetches fresh lists, caches them, and makes them current. A form already open
 * keeps the options it was built with (stable mid-survey); the next one opened
 * uses these. Returns false on any failure — the previous cache stays in place.
 */
export async function refreshParameterOptions() {
    if (!navigator.onLine) return false
    try {
        const response = await fetchParameterOptions()
        if (!response.ok) return false
        const groups = mapParameterOptions(await response.json())
        if (!Object.keys(groups).length) return false
        await cacheDropdownOptions(CACHE_KEY, { groups, fetchedAt: Date.now() })
        // Don't let a slow cache read that resolves later overwrite fresher data.
        cacheLoad = Promise.resolve()
        setRemoteOptions(groups)
        return true
    } catch (error) {
        console.warn('Parameter options refresh failed:', error)
        return false
    }
}
