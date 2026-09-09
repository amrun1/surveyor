import { cacheDropdownOptions } from '@/database/db.js'
import { transformFacilityDropdownOptions } from '@/domain/mappers.js'

/**
 * Service Communication Layer: Downloads, filters, and maps raw server structures 
 * directly at the network edge to prevent corrupted objects from hitting UI templates.
 */
export async function runInitialServerSync() {
    const baseUrl = `${import.meta.env.BASE_URL}api/`
    try {
        const response = await fetch(`${baseUrl}lookup/facility-types`, { method: 'GET' })
        if (!response.ok) throw new Error()

        const rawData = await response.json()
        const sanitizedDomainOptions = transformFacilityDropdownOptions(rawData)

        await cacheDropdownOptions('facilityTypesList', sanitizedDomainOptions)
        return true
    } catch (error) {
        return false
    }
}
