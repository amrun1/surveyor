<!-- src/components/inputs/AttachmentPicker.vue -->
<template>
    <div class="w-full flex flex-col gap-1">
        <span class="text-slate-700 text-sm font-medium mb-1 block">
            {{ label }}
            <span v-if="required" class="text-red-500 font-bold ml-0.5">*</span>
        </span>

        <!-- Trigger row: a thumbnail once something's attached, an empty dashed state otherwise -->
        <button type="button" @click="openSheet" :class="error ? 'border-red-500' : 'border-slate-300'"
            class="border rounded-xl p-3 w-full flex items-center gap-3 bg-white text-left shadow-xs focus:outline-none cursor-pointer">
            <div v-if="isImageValue" class="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                <img :src="modelValue" class="w-full h-full object-cover" alt="" />
            </div>
            <div v-else
                class="w-11 h-11 rounded-lg border-2 border-dashed border-slate-300 shrink-0 flex items-center justify-center text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                </svg>
            </div>
            <span class="flex-1 text-sm" :class="modelValue ? 'text-slate-900 font-medium' : 'text-slate-400'">
                {{ modelValue ? (isImageValue ? 'Lampiran terpasang — ketuk untuk ganti' : (fileName || 'Dokumen terpasang')) : 'Tambah lampiran' }}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6" />
            </svg>
        </button>

        <span v-if="error" class="text-xs text-red-500 font-semibold mt-1 block">{{ error }}</span>

        <!-- Hidden native inputs: one per source, always mounted so .click() works regardless of
             sheet visibility. `capture="environment"` is what hands off to the native camera app
             rather than a page-embedded live preview. -->
        <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" class="hidden"
            @change="handleFileSelected" />
        <input ref="galleryInputRef" type="file" accept="image/*" class="hidden" @change="handleFileSelected" />
        <input ref="documentInputRef" type="file" accept="image/*,application/pdf" class="hidden"
            @change="handleFileSelected" />

        <!-- Bottom sheet source picker: same native <dialog> + backdrop technique as SelectInput.vue,
             so it looks and behaves identically to the rest of the app's sheets. -->
        <dialog ref="sheetRef" :class="isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
            class="w-full max-w-full m-0 mt-auto bg-transparent border-none p-0 outline-none fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.32,0.94,0.6,1)]"
            @click.self="closeSheet">
            <div :class="isOpen ? 'translate-y-0' : 'translate-y-full'"
                class="w-full bg-white rounded-t-3xl border-t border-slate-200/60 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.94,0.6,1)] shadow-2xl overflow-hidden pb-6">

                <div class="w-full flex justify-center py-3 bg-white shrink-0">
                    <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>

                <div class="px-5 pb-4">
                    <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Adding attachment
                        for</p>
                    <p class="text-[15px] font-bold text-slate-900">{{ label }}</p>
                </div>

                <div class="px-5 flex gap-2.5">
                    <button type="button" @click="chooseSource('camera')"
                        class="flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border border-slate-200 bg-white active:bg-slate-50 cursor-pointer">
                        <span class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </span>
                        <span class="text-xs font-semibold text-slate-700">Kamera</span>
                    </button>

                    <button type="button" @click="chooseSource('gallery')"
                        class="flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border border-slate-200 bg-white active:bg-slate-50 cursor-pointer">
                        <span class="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                            </svg>
                        </span>
                        <span class="text-xs font-semibold text-slate-700">Galeri</span>
                    </button>

                    <button type="button" @click="chooseSource('document')"
                        class="flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border border-slate-200 bg-white active:bg-slate-50 cursor-pointer">
                        <span class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                            </svg>
                        </span>
                        <span class="text-xs font-semibold text-slate-700">Dokumen</span>
                    </button>
                </div>

                <div class="px-5 pt-4">
                    <button type="button" @click="closeSheet"
                        class="w-full py-3 rounded-xl bg-slate-50 text-slate-500 text-sm font-semibold cursor-pointer">
                        Batal
                    </button>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

defineProps({
    label: { type: String, default: '' },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' }
})

// modelValue holds a data: URL, the same plain-string convention every other
// input in this form already uses (CameraCapture, MapDisplay, CanvasDraw) —
// so Form.vue's validation, autosave, and submit payload logic need no changes
// to support this field type.
const modelValue = defineModel({ type: String, default: '' })

const isOpen = ref(false)
const sheetRef = ref(null)
const cameraInputRef = ref(null)
const galleryInputRef = ref(null)
const documentInputRef = ref(null)
const fileName = ref('')

const isImageValue = computed(() => modelValue.value?.startsWith('data:image'))

const openSheet = () => { isOpen.value = true }
const closeSheet = () => { isOpen.value = false }

watch(isOpen, (open) => {
    if (!sheetRef.value) return
    if (open) {
        sheetRef.value.showModal()
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
        setTimeout(() => {
            if (!isOpen.value && sheetRef.value?.open) sheetRef.value.close()
        }, 300)
    }
})

onUnmounted(() => { document.body.style.overflow = '' })

// Closes the sheet, then hands off to the matching hidden native input. The sheet
// closes first so it's out of the way before the OS camera app / photo picker /
// file browser takes over the screen.
const chooseSource = (source) => {
    closeSheet()
    if (source === 'camera') cameraInputRef.value.click()
    else if (source === 'gallery') galleryInputRef.value.click()
    else documentInputRef.value.click()
}

const handleFileSelected = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // reset so picking the same file again still fires @change
    if (!file) return

    fileName.value = file.name
    const reader = new FileReader()
    reader.onload = () => { modelValue.value = reader.result }
    reader.readAsDataURL(file)
}
</script>

<style scoped>
dialog::backdrop {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}
</style>