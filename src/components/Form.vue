<!-- src/components/Form.vue -->
<template>
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto my-6">

        <!-- HEADER BRANDING BLOCK -->
        <div class="mb-6 border-b border-slate-100 pb-4">
            <h1 class="text-2xl font-bold text-slate-800">{{ formConfig?.title || 'Form Workspace' }}</h1>
            <p class="text-sm text-slate-500 mt-1">Please fulfill all requested layout fields before submission.</p>
        </div>

        <!-- MAIN DYNAMIC ELEMENT RENDER FORM -->
        <form @submit.prevent="handleSubmit" class="space-y-5">

            <!-- Native v-show handles smooth conditional entry transitions with 0ms overhead -->
            <div v-for="(field, index) in formConfig?.fields" :key="index" v-show="isFieldVisible(field)"
                class="flex flex-col">
                <component :is="componentMaps[field.type]" v-model="field.value" v-bind="field"
                    :error="fieldErrors[field.name]" />
            </div>

            <!-- FOOTER PROCESSING ACTIONS PANEL -->
            <div class="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit"
                    class="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-xs active:scale-[0.98] cursor-pointer">
                    Submit Form
                </button>
            </div>

        </form>
    </div>
</template>

<script setup>
// ============================================================================
// 1. SYSTEM IMPORTS & CONFIGURATION SCHEMAS
// ============================================================================
import { ref, shallowRef, watch } from 'vue'

// Custom Input Workspace Feature Components Import Paths
import TextInput from '@/components/inputs/TextInput.vue'
import TextArea from '@/components/inputs/TextArea.vue'
import CanvasDraw from '@/components/inputs/canvasdraw/CanvasDraw.vue'
import MapDisplay from '@/components/inputs/MapDisplay.vue'

// Component Direct Core Handlers Setup
const emit = defineEmits(['onSubmit'])
const props = defineProps({
    formConfig: {
        type: Object,
        default: () => ({ title: '', fields: [] })
    }
})

// High-Performance Token Object Registry Maps (Avoids reactive tracking bloat)
const componentMaps = {
    text: TextInput,
    textarea: TextArea,
    canvas: CanvasDraw,
    map: MapDisplay
}

// Global Validation Error State Dict: { fieldName: "Error String Banner" }
const fieldErrors = ref({})

// ============================================================================
// 2. LIVE REACTIVE CONDITIONS ENGINE (Visibility Evaluator)
// ============================================================================
/**
 * Resolves dynamic cross-field dependencies based on 'visibleIf' parameters.
 * @param {Object} field - The current target layout item field object.
 * @returns {Boolean} True if the field meets visibility conditions, false if hidden.
 */
const isFieldVisible = (field) => {
    // If no conditional statement exists, field defaults to open view layout
    if (!field.visibleIf) return true

    const targetField = props.formConfig.fields.find(f => f.name === field.visibleIf.field)
    if (!targetField) return true

    // Compares absolute values to trigger smooth visibility toggling states
    return String(targetField.value).trim() === String(field.visibleIf.value).trim()
}

// ============================================================================
// 3. ENTERPRISE VALIDATION AUDITOR LAYER
// ============================================================================
/**
 * Audits all currently visible layout fields against assignment rules.
 * @returns {Boolean} True if the entire form format is compliant, false if errors block it.
 */
const validateForm = () => {
    fieldErrors.value = {} // Erase historical tracing benchmarks
    let isValid = true

    for (const field of props.formConfig.fields) {
        if (!field.name) continue

        // Skip checking rules instantly if the field is currently hidden in the background!
        if (!isFieldVisible(field)) continue

        const value = field.value
        const labelName = field.label || field.name

        // RULE A: O(1) COMPLEXITY CRITICAL BLANK SPACE / DATA ENTRY CHECKS
        if (field.required) {
            const isBlank = !value ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === 'string' && value.trim() === '')

            if (isBlank) {
                fieldErrors.value[field.name] = `"${labelName}" cannot be left empty or filled with spaces.`
                isValid = false
                continue // Halt deep rules processing for this specific loop element row
            }
        }

        // RULE B: SCALABLE FUTURE HOOKS (Enforces length boundaries rules)
        if (typeof value === 'string' && value.trim() !== '') {
            if (field.minLength && value.length < field.minLength) {
                fieldErrors.value[field.name] = `"${labelName}" must contain at least ${field.minLength} characters.`
                isValid = false
            }
            if (field.maxLength && value.length > field.maxLength) {
                fieldErrors.value[field.name] = `"${labelName}" cannot exceed ${field.maxLength} characters.`
                isValid = false
            }
        }
    }

    return isValid
}

// ============================================================================
// 4. WATCHERS & CONTEXT DISPATCH SUBMISSION WORKFLOWS
// ============================================================================
/**
 * Reactive Listener: Clears matching validation errors in real-time as the user types.
 */
watch(
    () => props.formConfig.fields.map(f => f.value),
    () => {
        // Only triggers continuous live re-validation once a submission has been attempted
        if (Object.keys(fieldErrors.value).length > 0) {
            validateForm()
        }
    },
    { deep: true }
)

/**
 * Packs active data entries into clean dictionary objects on submit.
 */
const handleSubmit = () => {
    if (!validateForm()) return

    const payloadData = {}

    props.formConfig.fields.forEach(field => {
        if (!field.name) return

        // Sanitizes hidden fields before transmission to prevent database payload bloat
        if (isFieldVisible(field)) {
            payloadData[field.name] = field.value
        } else {
            payloadData[field.name] = null
        }
    })

    // Transmit clean data payload straight up to useSync handlers or local stores
    emit('onSubmit', payloadData)
}
</script>
