<!-- src/features/surveyorMapper/SurveyMapper.vue -->
<template>
    <!-- Fullscreen layout sits inside App's h-screen overflow-hidden shell, so this page scrolls itself. -->
    <div class="h-full overflow-y-auto bg-background">
        <div class="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <h1 class="text-xl font-bold text-slate-800">Surveyor Mapper</h1>
                        <p class="text-xs text-slate-500 mt-1">
                            Atur kode pos yang ditangani setiap surveyor
                            <span v-if="surveyors.length"> · {{ surveyors.length }} surveyor</span>
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span v-if="!isOnline"
                            class="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                            Offline
                        </span>
                        <span v-else-if="loadError" :title="loadError"
                            class="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                            Gagal memuat
                        </span>
                        <button type="button" @click="load" :disabled="isLoading || !isOnline"
                            class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                            aria-label="Muat ulang">
                            <RefreshIcon :class="{ 'animate-spin': isLoading }" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <p v-if="loadError" class="text-xs text-red-600">{{ loadError }}</p>

                <input v-model="search" type="search" placeholder="Cari nama, user ID, atau kode pos..."
                    class="w-full text-base px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary" />
            </div>

            <div v-if="isLoading && !surveyors.length" class="text-center text-sm text-slate-400 py-10">Memuat...</div>

            <template v-else>
                <!-- Below md: tappable cards -->
                <div class="space-y-3 md:hidden">
                    <p v-if="filteredSurveyors.length === 0"
                        class="text-center text-sm text-slate-400 py-10 bg-white rounded-xl border border-slate-200">
                        {{ emptyMessage }}
                    </p>
                    <button v-for="surveyor in mobileSurveyors" :key="surveyor.userId" type="button"
                        @click="openEditor(surveyor)"
                        class="w-full text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs active:bg-slate-50">
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-mono text-xs text-slate-500">{{ surveyor.userId }}</span>
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                                :class="surveyor.postalCodes.length ? 'bg-blue-50 text-primary border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'">
                                {{ surveyor.postalCodes.length }} kode pos
                            </span>
                        </div>
                        <p class="font-semibold text-slate-800 mt-1">{{ surveyor.name }}</p>
                        <p v-if="surveyor.postalCodes.length" class="text-xs text-slate-500 mt-1 font-mono">
                            {{ previewCodes(surveyor) }}
                        </p>
                    </button>

                    <button v-if="remainingCount > 0" type="button" @click="visibleCount += PAGE_SIZE"
                        class="w-full py-3 text-sm font-semibold text-primary bg-white rounded-xl border border-slate-200 active:bg-slate-50">
                        Tampilkan lebih banyak ({{ remainingCount }} lagi)
                    </button>
                </div>

                <!-- md and up: table -->
                <div class="hidden md:block">
                    <GlobalTable :headers="tableHeaders" :rows="pagedSurveyors" :emptyMessage="emptyMessage">
                        <template #cell(userId)="{ value }">
                            <span class="font-mono text-xs text-slate-600">{{ value }}</span>
                        </template>
                        <template #cell(postalCodes)="{ value }">
                            <div class="flex flex-wrap items-center gap-1">
                                <span v-if="value.length === 0" class="text-xs text-slate-400">—</span>
                                <span v-for="code in value.slice(0, PREVIEW_COUNT)" :key="code"
                                    class="font-mono text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                                    {{ code }}
                                </span>
                                <span v-if="value.length > PREVIEW_COUNT" class="text-xs text-slate-500">
                                    +{{ value.length - PREVIEW_COUNT }}
                                </span>
                            </div>
                        </template>
                        <template #cell(action)="{ row }">
                            <button type="button" @click="openEditor(row)"
                                class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90">
                                Kelola
                            </button>
                        </template>
                        <template v-if="filteredSurveyors.length > PAGE_SIZE" #footer>
                            <Pagination v-model:page="page" :pageSize="PAGE_SIZE" :total="filteredSurveyors.length" />
                        </template>
                    </GlobalTable>
                </div>
            </template>
        </div>

        <!-- Editor: bottom sheet below md, centered modal from md up -->
        <Transition enter-from-class="opacity-0" leave-to-class="opacity-0"
            enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-200">
            <div v-if="editing" class="fixed inset-0 z-50 bg-slate-900/40 flex items-end md:items-center justify-center md:p-6"
                @click.self="closeEditor">
                <div role="dialog" aria-modal="true" aria-labelledby="editor-title"
                    class="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                    <div class="w-full flex justify-center py-3 md:hidden">
                        <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>

                    <div class="px-5 pb-4 md:pt-5 border-b border-slate-100">
                        <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Kode pos untuk</p>
                        <p id="editor-title" class="text-[15px] font-bold text-slate-900">{{ editing.name }}</p>
                        <p class="font-mono text-xs text-slate-500">{{ editing.userId }}</p>
                    </div>

                    <div class="px-5 py-4 space-y-2">
                        <form class="flex gap-2" @submit.prevent="addCode">
                            <input ref="codeInputRef" v-model="newCode" type="text" inputmode="numeric" maxlength="5"
                                placeholder="Kode pos (5 digit)" aria-label="Kode pos"
                                :class="codeError ? 'border-red-500' : 'border-slate-200'"
                                class="flex-1 min-w-0 text-base font-mono px-3 py-2 rounded-lg border focus:outline-none focus:border-primary"
                                @input="codeError = ''" />
                            <button type="submit"
                                class="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90">
                                Tambah
                            </button>
                        </form>
                        <p v-if="codeError" class="text-xs text-red-500 font-semibold">{{ codeError }}</p>
                    </div>

                    <div class="px-5 pb-4 flex-1 overflow-y-auto">
                        <p v-if="workingCodes.length === 0" class="text-center text-sm text-slate-400 py-6">
                            Belum ada kode pos.
                        </p>
                        <ul v-else class="divide-y divide-slate-100 border border-slate-200 rounded-xl">
                            <li v-for="code in workingCodes" :key="code" class="flex items-center justify-between px-4 py-2.5">
                                <span class="font-mono text-sm text-slate-800">{{ code }}</span>
                                <button type="button" @click="removeCode(code)" :aria-label="`Hapus ${code}`"
                                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                                    <XMarkIcon class="w-4 h-4" />
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div class="px-5 py-4 border-t border-slate-100 space-y-2">
                        <p v-if="!isOnline" class="text-xs text-amber-700">Offline — hubungkan ke internet untuk menyimpan.</p>
                        <div class="flex gap-2">
                            <button type="button" @click="closeEditor" :disabled="isSaving"
                                class="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                                Batal
                            </button>
                            <button type="button" @click="save" :disabled="!canSave"
                                class="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-40">
                                {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, inject, nextTick, onMounted } from 'vue'
import GlobalTable from '@/components/Table.vue'
import Pagination from '@/components/Pagination.vue'
import { useSync } from '@/composables/useSync.js'
import { fetchSurveyors, saveSurveyorPostalCodes } from '@/services/surveyorMapperService.js'
import RefreshIcon from '@/icons/RefreshIcon.vue'
import XMarkIcon from '@/icons/XMarkIcon.vue'

const toast = inject('toast')
const { isOnline } = useSync()

const surveyors = ref([])
const isLoading = ref(false)
const loadError = ref('')
const search = ref('')

const PAGE_SIZE = 10
const PREVIEW_COUNT = 3

const tableHeaders = [
    { key: 'userId', label: 'User ID' },
    { key: 'name', label: 'Nama' },
    { key: 'postalCodes', label: 'Kode Pos' },
    { key: 'action', label: '' }
]

const filteredSurveyors = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return surveyors.value
    return surveyors.value.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.userId.toLowerCase().includes(q) ||
        s.postalCodes.some(code => code.includes(q))
    )
})

// md and up: numbered pages.
const page = ref(1)
const pagedSurveyors = computed(() => filteredSurveyors.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// Below md: one growing list.
const visibleCount = ref(PAGE_SIZE)
const mobileSurveyors = computed(() => filteredSurveyors.value.slice(0, visibleCount.value))
const remainingCount = computed(() => Math.max(0, filteredSurveyors.value.length - visibleCount.value))

watch(search, () => {
    page.value = 1
    visibleCount.value = PAGE_SIZE
})

const emptyMessage = computed(() => {
    if (search.value.trim()) return 'Tidak ada surveyor yang cocok.'
    if (!isOnline.value) return 'Offline — hubungkan ke internet untuk memuat surveyor.'
    return 'Tidak ada surveyor.'
})

const previewCodes = (surveyor) => {
    const shown = surveyor.postalCodes.slice(0, PREVIEW_COUNT).join(', ')
    const extra = surveyor.postalCodes.length - PREVIEW_COUNT
    return extra > 0 ? `${shown} +${extra}` : shown
}

const errorMessage = (err, fallback) =>
    err.status === 401 ? 'Sesi berakhir — silakan login ulang.' : `${fallback}: ${err.message}`

const load = async () => {
    if (isLoading.value || !navigator.onLine) return
    isLoading.value = true
    try {
        surveyors.value = await fetchSurveyors()
        loadError.value = ''
    } catch (err) {
        console.warn('Surveyor list load failed:', err)
        loadError.value = errorMessage(err, 'Gagal memuat surveyor')
    } finally {
        isLoading.value = false
    }
}

// --- Editor ---------------------------------------------------------------
// Edits go to a working copy, so Batal never touches the list.
const editing = ref(null)
const workingCodes = ref([])
const newCode = ref('')
const codeError = ref('')
const isSaving = ref(false)
const codeInputRef = ref(null)

const POSTAL_CODE_PATTERN = /^\d{5}$/

const isDirty = computed(() => {
    if (!editing.value) return false
    const original = [...editing.value.postalCodes].sort()
    return original.length !== workingCodes.value.length ||
        original.some((code, i) => code !== workingCodes.value[i])
})
const canSave = computed(() => isDirty.value && !isSaving.value && isOnline.value)

const openEditor = async (surveyor) => {
    editing.value = surveyor
    workingCodes.value = [...surveyor.postalCodes].sort()
    newCode.value = ''
    codeError.value = ''
    await nextTick()
    codeInputRef.value?.focus()
}

const closeEditor = () => {
    if (isSaving.value) return
    editing.value = null
}

const addCode = () => {
    const code = newCode.value.trim()
    if (!POSTAL_CODE_PATTERN.test(code)) {
        codeError.value = 'Kode pos harus 5 digit angka.'
        return
    }
    if (workingCodes.value.includes(code)) {
        codeError.value = 'Kode pos sudah ada.'
        return
    }
    workingCodes.value = [...workingCodes.value, code].sort()
    newCode.value = ''
    codeError.value = ''
}

const removeCode = (code) => {
    workingCodes.value = workingCodes.value.filter(c => c !== code)
}

const save = async () => {
    if (!canSave.value) return
    isSaving.value = true
    const target = editing.value
    const codes = [...workingCodes.value]
    try {
        await saveSurveyorPostalCodes(target.userId, codes)
        target.postalCodes = codes
        toast?.success('Tersimpan', `Kode pos ${target.name} diperbarui.`)
        isSaving.value = false
        closeEditor()
    } catch (err) {
        console.warn('Saving postal codes failed:', err)
        toast?.error('Gagal menyimpan', errorMessage(err, 'Kode pos tidak tersimpan'))
    } finally {
        isSaving.value = false
    }
}

onMounted(load)
</script>
