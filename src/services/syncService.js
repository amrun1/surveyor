import { apiFetch } from './api.js'

// No Actuator/health endpoint exists in appraisal-backend, and the two
// confirmed real endpoints are both POST-only (Spring won't auto-handle a
// HEAD request against a @PostMapping the way it does for @GetMapping, so
// HEAD-ing /app-surveyor/find would likely just 405). Falling back to fetching
// the bare origin: a 404 Whitelabel page is still a real, non-thrown response,
// which is genuinely all a heartbeat needs — "the server answered" — so
// success here is "didn't throw," not response.ok.
export async function checkHeartbeat() {
    if (!navigator.onLine) return false
    try {
        await apiFetch('/', { method: 'GET', cache: 'no-store' })
        return true
    } catch {
        return false
    }
}

// Confirmed against appraisal-backend's AppSurveyorController.java: POST, not
// GET, with a PaginatedListRequest<DataCommonDto> body — `task` is optional
// (defaults server-side to the current logged-in surveyor's own queue).
// Response: ApiResponseTemplate wrapping a PaginatedListResponse<DataCommonTableDto>
// ({ dataList, pagingInfo, totalRowCount }).
export function fetchSurveyorTaskList({ pagingInfo, filters, task } = {}) {
    const query = task ? `?task=${encodeURIComponent(task)}` : ''
    return apiFetch(`/app-surveyor/find${query}`, {
        method: 'POST',
        body: JSON.stringify({
            wrapper: filters || {},
            pagingInfo: pagingInfo || { currentPage: 1, pageCount: 1, pageSize: 20, retrieveAll: false }
        })
    })
}

// --- Everything below is NOT confirmed against appraisal-backend -----------
// No claim/view/submit endpoints exist yet in AppSurveyorController.java (only
// `find` does), and there's no facility-types or menu-structure lookup
// controller at all in this repo. These are placeholders from before the
// backend was checked against — keep using them for now, but treat them as
// still-guessed until confirmed or built.

export function submitSurvey(payload) {
    return apiFetch('/survey/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export function fetchFacilityTypes() {
    return apiFetch('/lookup/facility-types', { method: 'GET' })
}