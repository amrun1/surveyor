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
 * expects. Confirmed against appraisal-backend's actual response shape —
 * every response is wrapped in ApiResponseTemplate ({status, message, object}),
 * and the JWT itself sits at object.token, not the response body's top level.
 * No expiresAt is ever sent back (JwtAuthenticationResponse has no such
 * field) — auth.setSession() already falls back to decoding the JWT's own
 * exp claim when this is undefined, so that's left unset here on purpose.
 * @param {Object} rawLoginResponse - Parsed JSON body from POST /auth/login.
 * @returns {{token: string, expiresAt: undefined, roles: string[], userId: string|null, menus: Array}}
 */
export function mapLoginResponseToSession(rawLoginResponse) {
    const data = rawLoginResponse.object || {}
    return {
        token: typeof data.token === 'string' ? data.token.replace(/^Bearer\s+/i, '') : data.token,
        expiresAt: undefined,
        roles: data.roles || [],
        userId: data.userId ?? null,
        menus: mapMenuTree(data.menus)
    }
}

/**
 * Maps object.menus from POST /auth/login into a clean, plain-object tree.
 * The backend currently repeats the same menu id 2–3 times at every level
 * (looks like a JOIN fan-out on their side) — only the first occurrence of
 * each id is kept, in original order. Plain objects only, so the result is
 * structured-clone safe for IndexedDB.
 * @param {Array} rawMenus - object.menus as sent by the backend.
 * @returns {Array<{id: number, name: string, uri: string, roles: string[], children: Array}>}
 */
export function mapMenuTree(rawMenus) {
    if (!Array.isArray(rawMenus)) return []

    const seen = new Set()
    const menus = []
    for (const raw of rawMenus) {
        if (!raw || seen.has(raw.id)) continue
        seen.add(raw.id)
        const uri = String(raw.uri ?? '').trim()
        menus.push({
            id: raw.id,
            name: String(raw.name ?? ''),
            uri: uri.startsWith('/') ? uri : `/${uri}`,
            roles: Array.isArray(raw.roles) ? raw.roles.map(String) : [],
            children: mapMenuTree(raw.children)
        })
    }
    return menus
}
// ============================================================================
// 4. SURVEYOR TASK LIST RESPONSE CONVERTER
// ============================================================================
/**
 * Maps POST /app-surveyor/find's ApiResponseTemplate<PaginatedListResponse<DataCommonTableDto>>
 * into plain task objects. Confirmed against a real response — field names are
 * the backend's Indonesian DTO keys; nothing past this function should see them.
 * Every value is a plain string/number/null, so the result is structured-clone
 * safe for IndexedDB as-is.
 * @param {Object} rawResponse - Parsed JSON body from POST /app-surveyor/find.
 * @returns {{tasks: Array, pageCount: number, totalRowCount: number}}
 */
export function mapTaskListResponse(rawResponse) {
    if (!rawResponse || rawResponse.status !== true) {
        throw new Error(rawResponse?.message || 'Task list request was not successful')
    }

    const data = rawResponse.object || {}
    const tasks = (Array.isArray(data.dataList) ? data.dataList : []).map(row => ({
        id: row.id,
        orderNo: row.noOrder ?? '',
        reportNo: row.noLaporan ?? '',
        debtorName: row.namaDebitur ?? '',
        assetType: row.jenisAktiva ?? '',
        assetCategory: row.kategoriAktiva ?? '',
        appraisalType: row.jenisAppraisal ?? '',
        appraisalCategory: row.kategoriAppraisal ?? '',
        reportType: row.jenisLaporan ?? '',
        location: row.lokasi ?? '',
        village: row.kelurahan ?? '',
        district: row.kecamatan ?? '',
        city: row.kota ?? '',
        province: row.propinsi ?? '',
        businessBranch: row.cabangBisnis ?? '',
        appraisalBranch: row.cabangAppraisal ?? '',
        marketingName: row.namaMarketing ?? '',
        phone: row.noHp ?? '',
        position: row.posisi ?? '',
        lastMessage: row.pesanTerakhir ?? '',
        assignedUserId: row.userId ?? null
    }))

    return {
        tasks,
        pageCount: data.pagingInfo?.pageCount ?? 1,
        totalRowCount: data.totalRowCount ?? tasks.length
    }
}

// ============================================================================
// 5. SURVEYOR MAPPER (surveyor ↔ postal code) CONVERTERS
// ============================================================================
/**
 * NOT confirmed — no such endpoint exists in appraisal-backend yet. Assumes the
 * same ApiResponseTemplate wrapper, a PaginatedListResponse-style dataList, and
 * Person-model keys (userId, name, email, hp) plus a guessed `kodePos` array.
 * Only this function should change once the real response shape is known.
 * @param {Object} rawResponse - Parsed JSON body from the surveyor list endpoint.
 * @returns {Array<{userId: string, name: string, email: string, phone: string, postalCodes: string[]}>}
 */
export function mapSurveyorListResponse(rawResponse) {
    if (!rawResponse || rawResponse.status !== true) {
        throw new Error(rawResponse?.message || 'Surveyor list request was not successful')
    }

    const data = rawResponse.object || {}
    const rows = Array.isArray(data.dataList) ? data.dataList : (Array.isArray(data) ? data : [])
    return rows.map(row => ({
        userId: row.userId ?? '',
        name: row.name ?? '',
        email: row.email ?? '',
        phone: row.hp ?? row.phone ?? '',
        postalCodes: (Array.isArray(row.kodePos) ? row.kodePos : []).map(String)
    }))
}

/**
 * Request body for saving a surveyor's full postal-code list. NOT confirmed.
 * @param {string} userId
 * @param {string[]} postalCodes
 * @returns {{userId: string, kodePos: string[]}}
 */
export function mapSurveyorPostalCodesToRequest(userId, postalCodes) {
    return { userId, kodePos: [...postalCodes] }
}
