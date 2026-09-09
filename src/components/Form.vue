<!-- src/components/Form.vue -->
<template>
    <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto my-6">
        <form @submit.prevent="handleSubmit" class="space-y-5">
            <div v-for="(field, index) in formConfig?.fields" :key="index" v-show="isFieldVisible(field)"
                class="flex flex-col">
                <component :is="componentMaps[field.type]" v-model="field.value" v-bind="field"
                    :error="fieldErrors[field.name]" />
            </div>
            <div class="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit"
                    class="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-xs active:scale-[0.98]">Submit
                    Assessment</button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import TextInput from '@/components/inputs/TextInput.vue'
import TextArea from '@/components/inputs/TextArea.vue'
import MapDisplay from '@/components/inputs/MapDisplay.vue'
import SelectInput from '@/components/inputs/SelectInput.vue'
import CameraCapture from '@/components/inputs/CameraCapture.vue'
import CanvasDraw from '@/components/inputs/canvasdraw/CanvasDraw.vue'

const emit = defineEmits(['onSubmit'])
const props = defineProps({ formConfig: { type: Object, default: () => ({ fields: [] }) } })
const fieldErrors = ref({})

const componentMaps = { text: TextInput, textarea: TextArea, canvas: CanvasDraw, map: MapDisplay, select: SelectInput, camera: CameraCapture }

const isFieldVisible = (field) => {
    if (!field.visibleIf) return true
    const target = props.formConfig.fields.find(f => f.name === field.visibleIf.field)
    return target ? String(target.value).trim() === String(field.visibleIf.value).trim() : true
}

const validateForm = () => {
    fieldErrors.value = {}
    let isValid = true

    for (const field of props.formConfig.fields) {
        if (!field.name || !isFieldVisible(field)) continue
        const value = field.value
        const labelName = field.label || field.name

        if (field.required) {
            const isBlank = !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')
            if (isBlank) {
                fieldErrors.value[field.name] = `"${labelName}" cannot be left empty.`
                isValid = false
                continue
            }
        }
    }
    return isValid
}

watch(() => props.formConfig.fields.map(f => f.value), () => { if (Object.keys(fieldErrors.value).length > 0) validateForm() }, { deep: true })

const handleSubmit = () => {
    if (!validateForm()) return
    const payload = {}
    props.formConfig.fields.forEach(f => { if (f.name) payload[f.name] = isFieldVisible(f) ? f.value : null })
    emit('onSubmit', payload)
}
</script>
