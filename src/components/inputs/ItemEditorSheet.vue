<!-- src/components/inputs/ItemEditorSheet.vue -->
<!-- The add/edit sheet for one row of a repeatable field — shared by ItemList.vue
     and PhotoList.vue. Bottom sheet on phones, centered modal from md: up. Native
     <dialog> (same as SelectInput/AttachmentPicker): focus trap, Esc, and the top
     layer, so a select/attachment sheet opened inside it appears above it.
     Edits a working copy; the parent's list only changes on `save`. -->
<template>
    <dialog ref="sheetRef" @cancel.prevent="requestClose" @click.self="requestClose"
        class="m-0 mt-auto md:m-auto w-full max-w-full md:max-w-lg p-0 bg-transparent border-none outline-none backdrop:bg-slate-900/50">
        <div v-if="draft" class="flex flex-col bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92dvh] md:max-h-[85vh]">
            <div class="shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
                <button type="button" @click="requestClose" aria-label="Tutup"
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 active:bg-slate-100">
                    <XMarkIcon class="w-5 h-5" />
                </button>
                <h2 class="flex-1 text-base font-bold text-slate-800 truncate">{{ title }}</h2>
            </div>

            <!-- Discard confirmation: inline instead of a second dialog -->
            <div v-if="isConfirmingDiscard"
                class="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-900">
                <span>Buang perubahan yang belum disimpan?</span>
                <span class="flex gap-3 shrink-0">
                    <button type="button" @click="isConfirmingDiscard = false" class="font-semibold py-1">Lanjut edit</button>
                    <button type="button" @click="close" class="font-semibold text-red-700 py-1">Buang</button>
                </span>
            </div>

            <div ref="bodyRef" class="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
                <slot name="preview" :draft="draft" />
                <template v-for="(field, idx) in visibleFields" :key="field.name">
                    <h3 v-if="field.section && field.section !== visibleFields[idx - 1]?.section"
                        class="text-xs font-bold uppercase tracking-wide text-slate-400 pt-1 border-b border-slate-100 pb-2">
                        {{ field.section }}
                    </h3>
                    <div :id="`${sheetId}-${field.name}`" class="scroll-mt-4">
                        <component :is="resolveFieldComponent(field)" v-model="draft[field.name]" v-bind="field"
                            :error="showMissing && missing.includes(field.name) ? 'Wajib diisi' : ''" />
                    </div>
                </template>
            </div>

            <div class="shrink-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 space-y-2">
                <p v-if="showMissing && missing.length" class="text-xs text-amber-800">
                    {{ missing.length }} field wajib belum diisi. Tekan simpan lagi untuk menyimpan sebagai belum lengkap.
                </p>
                <div class="flex items-center gap-2">
                    <button v-if="deletable" type="button" @click="$emit('remove')"
                        class="min-h-11 px-3 rounded-lg text-sm font-semibold text-red-600 active:bg-red-50">
                        Hapus
                    </button>
                    <button v-else-if="canAddAnother" type="button" @click="save({ addAnother: true })"
                        class="min-h-11 px-3 rounded-lg text-sm font-semibold text-primary active:bg-blue-50">
                        Simpan &amp; tambah lagi
                    </button>
                    <button type="button" @click="save()"
                        class="ml-auto min-h-11 px-6 rounded-xl bg-primary text-white text-base font-semibold active:opacity-90">
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, useId, onUnmounted } from 'vue'
import XMarkIcon from '@/icons/XMarkIcon.vue'
import { resolveFieldComponent } from './fieldComponents.js'
import { isItemFieldVisible, missingRequiredFields, toPlainValue } from './itemList.js'

const props = defineProps({
    fields: { type: Array, default: () => [] }, // field configs for one row
    title: String,
    deletable: Boolean, // editing an existing row → show "Hapus"
    canAddAnother: Boolean // adding a row → show "Simpan & tambah lagi"
})
const emit = defineEmits(['save', 'remove', 'closed'])

const sheetId = useId()
const sheetRef = ref(null)
const bodyRef = ref(null)
const draft = ref(null) // working copy
let originalSnapshot = ''
const showMissing = ref(false)
const isConfirmingDiscard = ref(false)

const visibleFields = computed(() => props.fields.filter(field => isItemFieldVisible(field, draft.value)))
const missing = computed(() => (draft.value ? missingRequiredFields(draft.value, props.fields) : []))
const isDirty = () => draft.value && JSON.stringify(draft.value) !== originalSnapshot

/** Open (or re-open, e.g. after "Simpan & tambah lagi") on a copy of `item`. */
const open = async (item, { showMissing: showMissingNow = false } = {}) => {
    draft.value = toPlainValue(item)
    originalSnapshot = JSON.stringify(draft.value)
    showMissing.value = showMissingNow // reopening an incomplete row shows what's missing at once
    isConfirmingDiscard.value = false
    await nextTick()
    if (!sheetRef.value.open) sheetRef.value.showModal()
    document.body.style.overflow = 'hidden'
    bodyRef.value?.scrollTo({ top: 0 })
}

const close = () => {
    sheetRef.value?.close()
    document.body.style.overflow = ''
    draft.value = null
    isConfirmingDiscard.value = false
    emit('closed')
}

// Close button / Esc / backdrop: close at once if nothing changed, otherwise ask
// inline first — a stray tap shouldn't lose a half-filled row.
const requestClose = () => {
    if (isDirty() && !isConfirmingDiscard.value) isConfirmingDiscard.value = true
    else close()
}

// First Simpan with required fields missing: highlight + scroll to the first.
// A second Simpan saves anyway (row marked incomplete) — rows are often filled
// in stages on-site; the form's own next/submit is what blocks incomplete rows.
const save = async ({ addAnother = false } = {}) => {
    if (missing.value.length && !showMissing.value) {
        showMissing.value = true
        await nextTick()
        document.getElementById(`${sheetId}-${missing.value[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
    }
    emit('save', toPlainValue(draft.value), { addAnother })
}

// Errors shown while filling clear as soon as everything required is filled.
watch(missing, (names) => { if (!names.length) showMissing.value = false })

onUnmounted(() => { document.body.style.overflow = '' })

defineExpose({ open, close })
</script>
