<!-- src/components/inputs/PhotoList.vue -->
<!-- formConfig `type: 'photoList'`: the Data Lampiran tab — many photos, each with
     its own small fields (Kategori, Catatan…). Photo-first: "Ambil foto" / "Dari
     galeri" put photos straight into the grid; details are filled in later by
     tapping a tile.
     Value: rows like an item list — [{ _key, photoId, kategori, catatan, … }].
     The photo itself is a compressed JPEG Blob in IndexedDB (db.js `photos`),
     referenced by photoId — never base64 in the form value, so autosave stays
     tiny however many photos there are. -->
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

        <!-- Sources: native camera app / native gallery (multi-select) -->
        <div v-if="canAdd" class="grid grid-cols-2 gap-2">
            <button type="button" @pointerdown="saveNow" @click="openCamera"
                class="min-h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-base font-semibold active:opacity-90">
                <CameraIcon class="w-5 h-5" /> Ambil foto
            </button>
            <button type="button" @click="galleryInputRef.click()"
                class="min-h-12 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-base font-semibold active:bg-slate-50">
                <ImageIcon class="w-5 h-5" /> Dari galeri
            </button>
        </div>
        <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" class="hidden"
            @change="onFilesPicked" />
        <input ref="galleryInputRef" type="file" accept="image/*" multiple class="hidden" @change="onFilesPicked" />

        <p v-if="items.length === 0 && pending.length === 0" :class="error ? 'border-red-400' : 'border-slate-300'"
            class="py-6 text-center text-sm text-slate-400 rounded-xl border-2 border-dashed">
            Belum ada {{ itemLabel.toLowerCase() }}
        </p>

        <!-- Grid of thumbnails; tap a tile to fill in its details -->
        <ul v-else class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <li v-for="(item, idx) in items" :key="item._key">
                <button type="button" @click="openEdit(idx)" :aria-label="`${itemLabel} ${idx + 1}: ${captionOf(item) || 'tanpa detail'}`"
                    :class="incompleteCount(item) ? 'ring-2 ring-amber-400' : 'ring-1 ring-slate-200'"
                    class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 active:opacity-80">
                    <img v-if="urls[item.photoId]" :src="urls[item.photoId]" alt="" loading="lazy" decoding="async"
                        class="w-full h-full object-cover" />
                    <span v-else-if="missingPhotoIds.has(item.photoId)"
                        class="absolute inset-0 flex items-center justify-center p-2 text-[11px] text-center text-red-600">
                        Foto tidak ditemukan di perangkat
                    </span>
                    <span class="absolute top-1.5 left-1.5 min-w-6 h-6 px-1.5 rounded-full bg-black/55 text-white text-[11px] font-bold flex items-center justify-center">
                        {{ idx + 1 }}
                    </span>
                    <span class="absolute inset-x-0 bottom-0 px-1.5 pt-4 pb-1 bg-gradient-to-t from-black/70 to-transparent text-left">
                        <span v-if="incompleteCount(item)" class="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-400 text-amber-950">
                            Lengkapi detail
                        </span>
                        <span v-else class="block text-[11px] font-semibold text-white truncate">{{ captionOf(item) }}</span>
                    </span>
                </button>
            </li>
            <!-- Photos still being compressed/saved -->
            <li v-for="job in pending" :key="job.key" role="status"
                class="aspect-square rounded-xl bg-slate-100 ring-1 ring-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-500">
                <RefreshIcon class="w-5 h-5 animate-spin" />
                <span class="text-[11px]">Memproses…</span>
            </li>
        </ul>

        <div v-if="lastRemoved" role="status"
            class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-800 text-white text-sm">
            <span>{{ itemLabel }} dihapus</span>
            <button type="button" @click="model = undo(items)" class="font-semibold text-blue-200 underline underline-offset-2 py-1">
                Urungkan
            </button>
        </div>

        <span v-if="error" class="text-xs text-red-500 font-semibold">{{ error }}</span>

        <ItemEditorSheet ref="editorRef" :fields="itemFields" :title="`${itemLabel} ${editingIndex + 1}`" deletable
            @save="onSave" @remove="onRemove">
            <template #preview="{ draft }">
                <img v-if="urls[draft.photoId]" :src="urls[draft.photoId]" alt=""
                    class="w-full max-h-[45dvh] object-contain rounded-xl bg-slate-100" />
            </template>
        </ItemEditorSheet>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, onUnmounted } from 'vue'
import CameraIcon from '@/icons/CameraIcon.vue'
import ImageIcon from '@/icons/ImageIcon.vue'
import RefreshIcon from '@/icons/RefreshIcon.vue'
import ItemEditorSheet from './ItemEditorSheet.vue'
import { createItem, missingRequiredFields, summarizeItem, newKey } from './itemList.js'
import { compressImage } from '@/domain/image.js'
import { savePhoto, getPhoto, deletePhoto } from '@/database/db.js'
import { useSaveBeforeCamera } from '@/composables/useSaveBeforeCamera.js'
import { useUndoableRemove } from '@/composables/useUndoableRemove.js'

// Form.vue v-binds the whole field object; don't spray type/name/section/… onto the DOM.
defineOptions({ inheritAttrs: false })

const props = defineProps({
    label: String,
    required: Boolean, // at least one photo
    error: String,
    itemFields: { type: Array, default: () => [] }, // per-photo fields, e.g. kategori, catatan
    itemLabel: { type: String, default: 'Foto' },
    maxItems: Number
})
const model = defineModel({ type: Array, default: () => [] })
const toast = inject('toast', null)
const { saveNow } = useSaveBeforeCamera()

const items = computed(() => (Array.isArray(model.value) ? model.value : []))
const canAdd = computed(() => !props.maxItems || items.value.length + pending.value.length < props.maxItems)
const incompleteCount = (item) => missingRequiredFields(item, props.itemFields).length
const captionOf = (item) => summarizeItem(item, props.itemFields).title

// --- Thumbnails: Blob → object URL, created once per photo, revoked on removal/unmount
const urls = reactive({})
const missingPhotoIds = reactive(new Set())
const loading = new Set()

const loadUrl = async (photoId) => {
    if (!photoId || urls[photoId] || loading.has(photoId)) return
    loading.add(photoId)
    try {
        const record = await getPhoto(photoId)
        if (record?.blob) urls[photoId] = URL.createObjectURL(record.blob)
        else missingPhotoIds.add(photoId) // e.g. storage cleared by the browser
    } finally {
        loading.delete(photoId)
    }
}
const revokeUrl = (photoId) => {
    if (urls[photoId]) URL.revokeObjectURL(urls[photoId])
    delete urls[photoId]
}
watch(items, rows => rows.forEach(row => loadUrl(row.photoId)), { immediate: true })
onUnmounted(() => Object.keys(urls).forEach(revokeUrl))

// --- Adding photos ---------------------------------------------------------
const cameraInputRef = ref(null)
const galleryInputRef = ref(null)
const pending = ref([]) // [{ key }] placeholders for photos still processing

// Save-before-camera: started on pointerdown (head start) and again here, without
// awaiting — .click() has to stay inside the tap or iOS won't open the camera.
const openCamera = () => {
    saveNow()
    cameraInputRef.value.click()
}

const onFilesPicked = async (event) => {
    const files = [...(event.target.files || [])].filter(file => file.type.startsWith('image/'))
    event.target.value = '' // so picking the same photo again still fires change
    if (!files.length) return

    const room = props.maxItems ? props.maxItems - items.value.length - pending.value.length : files.length
    const accepted = files.slice(0, Math.max(0, room))
    if (accepted.length < files.length) {
        toast?.error('Batas foto tercapai', `Maksimal ${props.maxItems} ${props.itemLabel.toLowerCase()}.`)
    }

    const jobs = accepted.map(file => ({ key: newKey(), file }))
    pending.value = [...pending.value, ...jobs.map(({ key }) => ({ key }))]

    // One at a time: a 20-photo gallery pick never holds 20 decoded images at once.
    for (const job of jobs) {
        try {
            const { blob, width, height } = await compressImage(job.file)
            const row = createItem(props.itemFields)
            row.photoId = row._key
            await savePhoto({ id: row.photoId, blob, width, height })
            urls[row.photoId] = URL.createObjectURL(blob)
            model.value = [...items.value, row]
            // Each finished photo is persisted at once — if the camera app gets this
            // page killed while taking the next one, nothing already taken is lost.
            saveNow()
        } catch (err) {
            console.error('Could not process photo:', err)
            toast?.error('Foto gagal diproses', 'Coba ambil atau pilih foto itu lagi.')
        } finally {
            pending.value = pending.value.filter(p => p.key !== job.key)
        }
    }
}

// --- Editing one photo's details (shared sheet with ItemList) --------------
const editorRef = ref(null)
const editingIndex = ref(0)
const openEdit = (index) => {
    editingIndex.value = index
    editorRef.value.open(items.value[index], { showMissing: incompleteCount(items.value[index]) > 0 })
}
const onSave = (row) => {
    const next = [...items.value]
    next.splice(editingIndex.value, 1, row)
    model.value = next
    editorRef.value.close()
}

// --- Delete with undo — the Blob is only deleted once the undo window has passed
const { lastRemoved, remove, undo } = useUndoableRemove({
    onExpire: (row) => {
        // Undo restored it, or another row still points at the same photo: keep it.
        if (items.value.some(r => r.photoId === row.photoId)) return
        revokeUrl(row.photoId)
        deletePhoto(row.photoId).catch(err => console.error('Could not delete photo blob:', err))
    }
})
const onRemove = () => {
    model.value = remove(items.value, editingIndex.value)
    editorRef.value.close()
}
</script>