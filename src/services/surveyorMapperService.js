import { apiFetch } from './api.js'
import { mapSurveyorListResponse, mapSurveyorPostalCodesToRequest } from '@/domain/mappers.js'

// --- NOT confirmed against appraisal-backend ---------------------------------
// There is no surveyor-list or surveyor↔postal-code endpoint in the backend yet
// (only /auth/*, /app-surveyor/find, /inquiry/find exist). Both paths below are
// guesses modelled on the existing `find` convention — update them (and
// mapSurveyorListResponse) once the real controller exists.

// DEV-only mock, enabled with VITE_MOCK_SURVEYOR_MAPPER=true in .env.local.
// import.meta.env.DEV is a compile-time constant, so this branch and its seed
// data are dead-code eliminated from production builds.
const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK_SURVEYOR_MAPPER === 'true'

let mockSurveyors = null
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 400))
const getMockSurveyors = () => {
    mockSurveyors ??= [
        { userId: '43903-00', name: 'Budi Santoso', email: 'budi.santoso@permatabank.co.id', phone: '081234567801', postalCodes: ['12190', '12920'] },
        { userId: '43904-00', name: 'Siti Rahmawati', email: 'siti.rahmawati@permatabank.co.id', phone: '081234567802', postalCodes: ['40115'] },
        { userId: '43905-00', name: 'Agus Wijaya', email: 'agus.wijaya@permatabank.co.id', phone: '081234567803', postalCodes: [] },
        { userId: '43906-00', name: 'Dewi Lestari', email: 'dewi.lestari@permatabank.co.id', phone: '081234567804', postalCodes: ['60271', '60272', '60273', '60274'] },
        { userId: '43907-00', name: 'Rizky Pratama', email: 'rizky.pratama@permatabank.co.id', phone: '081234567805', postalCodes: ['50132'] },
        { userId: '43908-00', name: 'Andi Saputra', email: 'andi.saputra@permatabank.co.id', phone: '081234567806', postalCodes: [] },
        { userId: '43909-00', name: 'Maya Anggraini', email: 'maya.anggraini@permatabank.co.id', phone: '081234567807', postalCodes: ['80361', '80362'] },
        { userId: '43910-00', name: 'Hendra Gunawan', email: 'hendra.gunawan@permatabank.co.id', phone: '081234567808', postalCodes: ['20112'] }
    ]
    return mockSurveyors
}

// Returns [{ userId, name, email, phone, postalCodes }]. Throws on network
// failure / non-ok / status:false, with err.status set for HTTP errors.
export async function fetchSurveyors() {
    if (USE_MOCK) {
        await mockDelay()
        return getMockSurveyors().map(s => ({ ...s, postalCodes: [...s.postalCodes] }))
    }

    const response = await apiFetch('/surveyor-mapper/find', {
        method: 'POST',
        body: JSON.stringify({
            wrapper: {},
            pagingInfo: { currentPage: 1, pageCount: 0, pageSize: 1000, retrieveAll: true }
        })
    })
    if (!response.ok) {
        const error = new Error(`Surveyor list request failed (${response.status})`)
        error.status = response.status
        throw error
    }
    return mapSurveyorListResponse(await response.json())
}

// Replaces the surveyor's full postal-code list. Throws like fetchSurveyors().
export async function saveSurveyorPostalCodes(userId, postalCodes) {
    if (USE_MOCK) {
        await mockDelay()
        const surveyor = getMockSurveyors().find(s => s.userId === userId)
        if (surveyor) surveyor.postalCodes = [...postalCodes]
        return
    }

    const response = await apiFetch('/surveyor-mapper/save', {
        method: 'POST',
        body: JSON.stringify(mapSurveyorPostalCodesToRequest(userId, postalCodes))
    })
    if (!response.ok) {
        const error = new Error(`Save failed (${response.status})`)
        error.status = response.status
        throw error
    }
    const body = await response.json().catch(() => null)
    if (body && body.status === false) throw new Error(body.message || 'Save was not successful')
}
