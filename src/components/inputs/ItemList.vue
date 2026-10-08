<!-- src/components/inputs/ItemList.vue -->
<!-- formConfig `type: 'itemList'`: a repeatable list of rows (the legacy "popup item
     forms" — vehicles, machines, inspeksi items). Each row is a card; adding or
     editing opens a sheet with a small form built from `itemFields`, using the same
     input components as the main form (inputs/fieldComponents.js).
     Value: array of plain objects — see inputs/itemList.js. -->
<template>
    <div class="w-full flex flex-col gap-2">
        <div class="flex items-baseline justify-between gap-3">
            <span class="text-slate-700 text-sm font-medium">
                {{ label }}<span v-if="required" class="text-red-500 font-bold ml-0.5">*</span>
            </span>
            <span v-if="items.length" class="shrink-0 text-xs font-semibold text-slate-500">
                {{ items.length }} {{ itemLabel.toLowerCase() }}
            </span>
        </div>

        <!-- Empty state: one obvious action -->
        <button v-if="items.length === 0" type="button" @click="openNew"
            :class="error ? 'border-red-400' : 'border-slate-300'"
            class="w-full flex flex-col items-center gap-2 py-8 px-4 rounded-2xl border-2 border-dashed bg-white text-slate-500 active:bg-slate-50">
            <span class="w-11 h-11 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                <PlusIcon class="w-6 h-6" />
            </span>
            <span class="text-sm">Belum ada {{ itemLabel.toLowerCase() }}</span>
            <span class="text-base font-semibold text-primary">Tambah {{ itemLabel }}</span>
        </button>

        <!-- Rows: whole card is the tap target to edit -->
        <ul v-else class="flex flex-col gap-2">
            <li v-for="(item, idx) in items" :key="item._key">
                <button type="button" @click="openEdit(idx)"
                    :class="incompleteCount(item) ? 'border-amber-300' : 'border-slate-200'"
                    class="w-full min-h-14 flex items-center gap-3 px-3.5 py-3 rounded-xl border bg-white shadow-xs text-left active:bg-slate-50">
                    <span class="w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {{ idx + 1 }}
                    </span>
                    <span class="flex-1 min-w-0">
                        <span class="block text-base font-semibold text-slate-800 truncate">
                            {{ summaryOf(item).title || `${itemLabel} ${idx + 1}` }}
                        </span>
                        <span v-if="summaryOf(item).subtitle" class="block text-xs text-slate-500 truncate mt-0.5">
                            {{ summaryOf(item).subtitle }}
                        </span>
                        <span v-if="incompleteCount(item)" class="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            Belum lengkap · {{ incompleteCount(item) }} field wajib
                        </span>
                    </span>
                    <ChevronRightIcon class="w-4 h-4 shrink-0 text-slate-400" />
                </button>
            </li>
        </ul>

        <!-- Undo instead of an "are you sure?" dialog -->
        <div v-if="lastRemoved" role="status"
            class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-800 text-white text-sm">
            <span>{{ itemLabel }} dihapus</span>
            <button type="button" @click="model = undo(items)" class="font-semibold text-blue-200 underline underline-offset-2 py-1">
                Urungkan
            </button>
        </div>

        <button v-if="items.length > 0 && canAdd" type="button" @click="openNew"
            class="w-full min-h-11 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 text-primary text-base font-semibold active:bg-slate-50">
            <PlusIcon class="w-5 h-5" /> Tambah {{ itemLabel }}
        </button>

        <span v-if="error" class="text-xs text-red-500 font-semibold">{{ error }}</span>

        <ItemEditorSheet ref="editorRef" :fields="itemFields" :title="editorTitle"
            :deletable="editingIndex !== null" :can-add-another="editingIndex === null && canAddAfterThis"
            @save="onSave" @remove="onRemove" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PlusIcon from '@/icons/PlusIcon.vue'
import ChevronRightIcon from '@/icons/ChevronRightIcon.vue'
import ItemEditorSheet from './ItemEditorSheet.vue'
import { createItem, missingRequiredFields, summarizeItem } from './itemList.js'
import { useUndoableRemove } from '@/composables/useUndoableRemove.js'

// Form.vue v-binds the whole field object; don't spray type/name/section/… onto the DOM.
defineOptions({ inheritAttrs: false })

const props = defineProps({
    label: String,
    required: Boolean,
    error: String,
    itemFields: { type: Array, default: () => [] }, // field configs for ONE row (same shape as formConfig fields)
    itemLabel: { type: String, default: 'Item' }, // singular, e.g. 'Kendaraan'
    summary: Object, // { title: [fieldNames], subtitle: [fieldNames] } for the row cards
    maxItems: Number
})
// Array of plain row objects. Always replaced, never mutated in place.
const model = defineModel({ type: Array, default: () => [] })

const items = computed(() => (Array.isArray(model.value) ? model.value : []))
const canAdd = computed(() => !props.maxItems || items.value.length < props.maxItems)
const canAddAfterThis = computed(() => !props.maxItems || items.value.length + 1 < props.maxItems)

const summaryOf = (item) => summarizeItem(item, props.itemFields, props.summary)
const incompleteCount = (item) => missingRequiredFields(item, props.itemFields).length

// --- Editor sheet (shared with PhotoList: ItemEditorSheet.vue) ------------
const editorRef = ref(null)
const editingIndex = ref(null) // null = adding a new row
const editorTitle = computed(() =>
    editingIndex.value === null ? `Tambah ${props.itemLabel}` : `${props.itemLabel} ${editingIndex.value + 1}`)

const openNew = () => {
    editingIndex.value = null
    editorRef.value.open(createItem(props.itemFields))
}
const openEdit = (index) => {
    editingIndex.value = index
    editorRef.value.open(items.value[index], { showMissing: incompleteCount(items.value[index]) > 0 })
}

const onSave = (row, { addAnother }) => {
    const next = [...items.value]
    if (editingIndex.value === null) next.push(row)
    else next.splice(editingIndex.value, 1, row)
    model.value = next
    if (addAnother) openNew()
    else editorRef.value.close()
}

// --- Delete with undo ----------------------------------------------------
const { lastRemoved, remove, undo } = useUndoableRemove()
const onRemove = () => {
    model.value = remove(items.value, editingIndex.value)
    editorRef.value.close()
}
</script>
