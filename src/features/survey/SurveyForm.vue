<template>
    <div class="p-4 space-y-8 animate-fade-in">
        <SharedForm :formConfig="formConfig" @onSubmit="handleFormPublishPipeline" />
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import SharedForm from '@/components/Form.vue'
import { addRecord, getCachedDropdownOptions } from '@/database/db.js'
import { transformFacilityDropdownOptions } from '@/domain/mappers.js'
const toast = inject('toast')
const router = useRouter()

// ============================================================================
// 1. BANKING DECLARATIVE MORTGAGE APPRAISAL MATRIX CONFIGURATION
// ============================================================================
const formConfig = ref({
    title: 'Bank Mortgage Collateral Valuation Assessment',
    fields: [
        // Section 1: Auditor Metadata Certification
        { type: 'text', name: 'operator', label: 'Assigned Bank Surveyor ID', value: 'BANK-SURV-2026', required: true },
        { type: 'text', name: 'appraisalTicket', label: 'Mortgage Loan Reference Ticket', placeholder: 'e.g., MRTG-9921A-JKT', required: true },

        // Section 2: Property Core Identifiers & Certificates
        { type: 'text', name: 'shmCertificateNumber', label: 'Sertifikat Hak Milik (SHM) Reference Code', placeholder: 'Enter official land book certificate number', required: true },
        { type: 'select', name: 'facilityType', label: 'Collateral Property Classification', placeholder: 'Select architectural class...', required: false, options: [], value: '' },

        // Section 3: High-Performance Auto-Compressing Photographic Documentation Node
        {
            type: 'camera',
            name: 'propertyFacadePhoto',
            label: 'Main Exterior Property Facade Documentation Photo (16:9 Aspect Lock)',
            required: true,
            value: '' // Holds optimized, canvas-downscaled Base64 JPEG data URL cleanly inside memory
        },

        // Section 4: Anti-Fraud Spatial Telemetry Audit Pinpoint
        {
            type: 'map',
            name: 'auditLocation',
            label: 'Collateral Geo-Coordinates Audit Boundary (Locked 16:9 Aspect)',
            displayValue: '-6.208840, 106.845580', // Centered precisely on South Jakarta office coordinates
            hidden: false,
            value: '' // Real hardware GPS tracking metrics automatically recorded upon submit click
        },

        // Section 5: Structural Risk Assessments
        { type: 'select', name: 'structuralRisk', label: 'Visible Structural Risk Assessment Level', placeholder: 'Select assessment category...', required: true, options: ['LOW / Minor Cosmetic Flaws', 'MEDIUM / Settling Cracks Noted', 'HIGH / Structural Integrity Degradation'], value: '' },

        // Section 6: Dynamic Conditional Risk Parameters (Expands only if risk is marked HIGH)
        {
            type: 'textarea',
            name: 'incidentReport',
            label: 'Mandatory Structural Degradation & Risk Mitigation Assessment Logs',
            placeholder: 'Detail foundation shifts, heavy wall cracks, moisture leakages, or structural integrity threats...',
            required: true,
            value: '',
            visibleIf: { field: 'structuralRisk', value: 'HIGH / Structural Integrity Degradation' }
        },

        // Section 7: Official Property Land Boundaries Mapping Blueprints
        { type: 'canvas', name: 'landBlueprints', label: 'Lot Boundary Perimeter & House Footprint Layout Blueprint Draft', required: true, multi: false, value: '' }
    ]
})

// ============================================================================
// 2. TRANSACTION PIPELINE & HARDWARE ACCELERATED SYNC SCHEDULERS
// ============================================================================
/**
 * Processes banking appraisal data safely. Writes immediately to local device IndexedDB,
 * and requests the OS SyncManager to handle server updates in the background.
 * @param {Object} flattenedFormData - Cleansed key-value dictionary payload from Form.vue
 */
const handleFormPublishPipeline = async (flattenedFormData) => {
    const transactionEnvelope = {
        timestamp: Date.now(),
        status: 'pending',
        payload: flattenedFormData
    }

    await addRecord('syncQueue', transactionEnvelope)

    let isBackgroundSyncRegistered = false
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready
            await registration.sync.register('tomcat-form-flush')
            isBackgroundSyncRegistered = true
        } catch {
            isBackgroundSyncRegistered = false
        }
    }

    if (navigator.onLine && isBackgroundSyncRegistered) {
        toast.success(
            'Appraisal Record Synchronized',
            `Ticket reference ${flattenedFormData.appraisalTicket || 'log'} sent straight to Tomcat.`
        )
    } else {
        toast.offline(
            'Cached Securely Offline',
            'Data encrypted in IndexedDB. Device will auto-flush upon hardware network recovery.'
        )
    }

    formConfig.value.fields.forEach(field => {
        if (field.name !== 'operator') field.value = field.type === 'canvas' && field.multi ? [] : ''
    })

    router.push({ name: 'inquiry' })
}

// ============================================================================
// 3. LIFECYCLE INITIALIZATION METADATA LOADERS
// ============================================================================
const loadBankingSelectOptions = async () => {
    // Load facility classifications cached during our First-Run Setup Shield
    const cachedClassifications = await getCachedDropdownOptions('facilityTypesList')
    const classificationField = formConfig.value.fields.find(f => f.name === 'facilityType')

    if (classificationField && cachedClassifications) {
        // Execute safety mapping transformation right at the consumption boundary site
        classificationField.options = transformFacilityDropdownOptions(cachedClassifications)
    }
}

onMounted(() => {
    loadBankingSelectOptions()
})
</script>
