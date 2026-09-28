// ============================================================================
// 1. DROPDOWN COMPONENT ENVELOPE SEED DATA CONVERTER
// ============================================================================
/**
 * Maps raw backend choice lists arrays into structured { value, label } contracts.
 * Protects layout selectors elements from server schema key modifications.
 * @param {Array} rawApiResponseData - Raw server metadata blocks.
 * @returns {Array} Type-safe frontend component selection arrays options.
 */
export function transformFacilityDropdownOptions(rawApiResponseData) {
    if (!rawApiResponseData) return []

    if (Array.isArray(rawApiResponseData) && typeof rawApiResponseData === 'string') {
        return rawApiResponseData.map(item => ({ value: item, label: item }))
    }

    if (Array.isArray(rawApiResponseData) && typeof rawApiResponseData === 'object') {
        return rawApiResponseData.map(item => ({
            value: String(item.id || item.value || ''),
            label: String(item.title || item.label || '')
        }))
    }

    return []
}

// ============================================================================
// 2. REGISTRY LOGS TRANSMISSION GRID DATA CONVERTER
// ============================================================================
/**
 * Transforms raw database queue items into flat model arrays specifically for Table.vue.
 * @param {Array} rawLogRecordsArray - Cached objects extracted out of IndexedDB transactions.
 * @returns {Array} Chronologically sorted, table-ready grid item properties maps.
 */
export function transformSubmissionHistoryLogs(rawLogRecordsArray) {
    if (!Array.isArray(rawLogRecordsArray)) return []

    return rawLogRecordsArray.map(item => {
        const payload = item.payload || {}
        return {
            id: item.id || Math.random(),
            timestamp: item.timestamp || Date.now(),
            formattedTime: new Date(item.timestamp || Date.now()).toLocaleString('en-GB', { hour12: false }).replace(',', ''),
            operator: payload.operator || 'System Operator',
            facilityType: payload.facilityType || 'N/A',
            status: item.status || 'pending'
        }
    }).sort((a, b) => b.timestamp - a.timestamp)
}

// ============================================================================
// 3. AUTH SESSION RESPONSE CONVERTER
// ============================================================================
/**
 * Maps the raw login endpoint response into exactly what auth.setSession()
 * expects. If the backend ever renames a field, or changes expiresAt's units,
 * this is the one place that changes — not Login.vue, not the auth store.
 * @param {Object} rawLoginResponse - Parsed JSON body from POST auth/login.
 * @returns {{token: string, expiresAt: number|undefined}}
 */
export function mapLoginResponseToSession(rawLoginResponse) {
    return {
        token: rawLoginResponse.token,
        expiresAt: rawLoginResponse.expiresAt
    }
}