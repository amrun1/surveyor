<template>
    <h1>Form</h1>
    <SharedForm :formConfig="formConfig" @onSubmit="handleFormSubmit" />
</template>

<script setup>
import SharedForm from '@/components/Form.vue'
import { ref } from 'vue'

const formConfig = ref({
    title: 'Sample Form',
    fields: [
        {
            type: 'text', name: 'firstName', label: 'First Name', value: '', placeholder: 'Enter your first name', required: true
        },
        {
            type: 'text', name: 'lastName', label: 'Last Name', value: '', placeholder: 'Enter your last name',
            visibleIf: {
                field: 'firstName',
                value: 'amrun'
            }
        },
        { type: 'textarea', name: 'comments', label: 'Comments', value: '', placeholder: 'Enter your comments' },

        // CASE A: Standard single canvas (e.g. Signature confirmation section)
        { type: 'canvas', name: 'signature', label: 'Operator Verification Signature', multi: false, value: '', required: true },

        {
            type: 'map',
            name: 'auditLocation',
            label: 'Target Audit Facility Location',
            displayValue: '-6.208840, 106.845580', // Displayed text/backdrop anchor name
            hidden: false,
            value: '' // Will be overwritten by live GPS data e.g. "-6.2891, 106.7124"
        },

        // CASE B: Multi-drawing module enabled (e.g. Damage attachment reports capture)
        { type: 'canvas', name: 'siteSketches', label: 'Structural Defect Photos/Sketches', multi: true, value: [] }
    ]
})

const handleFormSubmit = (data) => {
    console.log('Form submitted with data:', data)
}
</script>