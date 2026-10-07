<template>
  <div 
    class="w-full max-w-2xl mx-auto my-0 lg:my-6 transition-all duration-200 select-none
           bg-white text-slate-900 p-5 min-h-screen flex flex-col justify-between pb-[84px]
           lg:border lg:border-slate-200/80 lg:shadow-xs lg:min-h-0 lg:p-6 lg:rounded-2xl lg:pb-6"
  >
    <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col justify-between space-y-6">
      
      <div class="space-y-6">
        <div 
          v-if="formConfig.tabs && formConfig.tabs.length > 0" 
          class="hidden lg:flex border-b border-slate-100 pb-2 gap-1 overflow-x-auto no-scrollbar"
        >
          <button
            v-for="(tab, idx) in formConfig.tabs"
            :key="idx"
            type="button"
            @click="handleTabClick(idx)"
            :disabled="!isTabReachable(idx)"
            :class="[
              activeTabIdx === idx ? 'bg-primary text-white font-semibold shadow-xs' : 'text-slate-500 hover:bg-slate-50 font-medium',
              !isTabReachable(idx) ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'
            ]"
            class="px-4 py-2 text-xs rounded-xl transition-all duration-150 whitespace-nowrap focus:outline-none flex items-center gap-1.5"
          >
            <LockIcon v-if="!isTabReachable(idx)" width="11" height="11" stroke-width="2.5" />
            {{ tab.title }}
            <span v-if="isFreeNavigation && !isTabComplete(idx)" class="w-1.5 h-1.5 rounded-full bg-amber-500"
              title="Ada field wajib yang belum diisi" aria-label="ada field wajib kosong"></span>
          </button>
        </div>

        <div 
          v-if="formConfig.tabs && formConfig.tabs.length > 0" 
          class="block lg:hidden space-y-3 pt-2 pb-4 shrink-0 bg-white"
        >
          <div class="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Step {{ activeTabIdx + 1 }} of {{ formConfig.tabs.length }}</span>
            <button 
              type="button" 
              @click="handleSaveDraftShortcut" 
              class="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none edit-none outline-none"
            >
              Save draft
            </button>
          </div>

          <div class="flex w-full gap-1.5 h-2.5">
            <button
              v-for="(tab, idx) in formConfig.tabs"
              :key="idx"
              type="button"
              @click="handleTabClick(idx)"
              :disabled="!isTabReachable(idx)"
              :aria-label="`${tab.title}${!isTabReachable(idx) ? ' (locked)' : ''}`"
              :class="[
                mobileSegmentClass(idx),
                isTabReachable(idx) ? 'cursor-pointer' : 'cursor-not-allowed'
              ]"
              class="flex-1 rounded-full transition-all duration-300 focus:outline-none"
            ></button>
          </div>

          <div class="pt-3 animate-fade-in">
            <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">
              {{ formConfig.tabs[activeTabIdx].title.replace(/^\d+\.\s*/, '') }}
            </h2>
            <p v-if="formConfig.tabs[activeTabIdx].subtitle" class="text-xs text-slate-400 font-medium mt-0.5">
              {{ formConfig.tabs[activeTabIdx].subtitle }}
            </p>
          </div>
        </div>

        <CollapsedInfoCard :fields="activeTabAutoFilledFields" />

        <div class="space-y-5 flex-1 bg-white">
          <template v-for="(field, idx) in visibleTabFields" :key="field.name">
            <div v-if="field.section && field.section !== visibleTabFields[idx - 1]?.section"
              class="pt-1 first:pt-0">
              <button v-if="isSectionCollapsible(field.section)" type="button"
                @click="toggleSection(field.section)"
                class="w-full flex items-center justify-between mb-2 cursor-pointer bg-transparent border-none p-0 focus:outline-none">
                <h3 class="text-xs font-bold uppercase tracking-wide text-slate-400">{{ field.section }}</h3>
                <span class="flex items-center gap-1.5 text-slate-400">
                  <span v-if="isSectionCollapsed(field.section)"
                    class="text-[11px] font-semibold normal-case tracking-normal">
                    {{ sectionFieldCounts[field.section] }} fields
                  </span>
                  <ChevronDownIcon width="14" height="14" stroke-width="2.5" class="transition-transform duration-200"
                    :class="{ '-rotate-90': isSectionCollapsed(field.section) }" />
                </span>
              </button>
              <h3 v-else class="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">{{ field.section }}
              </h3>
              <div class="border-b border-slate-100 mb-4"></div>
            </div>

            <template v-if="!(isSectionCollapsible(field.section) && isSectionCollapsed(field.section))">
              <div v-if="field.layout === 'compass' && field.compassRole === 'north'" :id="`field-${field.name}`"
                class="scroll-mt-24">
                <CompassInput :group="compassGroups[field.compassGroup]" />
              </div>

              <div v-else-if="field.layout !== 'compass'" :id="`field-${field.name}`"
                class="flex flex-col form-field-row scroll-mt-24">
                <component 
                  :is="resolveFieldComponent(field)" 
                  v-model="field.value" 
                  v-bind="field" 
                  :error="fieldErrors[field.name]"
                />
              </div>
            </template>
          </template>
        </div>
      </div>

      <div 
        class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex items-center justify-between gap-3 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]
               lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:bg-transparent lg:border-t lg:border-slate-100 lg:p-0 lg:pt-4 lg:shadow-none lg:z-auto"
      >
        <button 
          v-if="!formConfig.tabs || formConfig.tabs.length === 0"
          type="submit" 
          class="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-xs active:scale-[0.98] w-full lg:w-auto cursor-pointer"
        >
          Submit Assessment
        </button>

        <template v-else>
          <button
            type="button"
            @click="handleNavigateBackwardsStep"
            :disabled="activeTabIdx === 0"
            :class="[
              activeTabIdx === 0 
                ? 'opacity-40 border-slate-200 text-slate-300 cursor-not-allowed' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-98'
            ]"
            class="flex-1 lg:flex-none border font-bold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer focus:outline-none text-center justify-center items-center flex max-w-[140px] h-[48px]"
          >
            &lt; Back
          </button>

          <button
            v-if="activeTabIdx < formConfig.tabs.length - 1"
            type="button"
            @click="handleNavigateForwardStep"
            class="flex-1 bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-slate-800 active:scale-98 transition-all cursor-pointer shadow-md text-center justify-center items-center flex h-[48px]"
          >
            Next
          </button>

          <button
            v-else
            type="submit"
            class="flex-1 bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-slate-800 active:scale-98 transition-all cursor-pointer shadow-md text-center justify-center items-center flex h-[48px]"
          >
            Submit Assessment
          </button>
        </template>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, inject } from 'vue'
import LockIcon from '@/icons/LockIcon.vue'
import ChevronDownIcon from '@/icons/ChevronDownIcon.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import TextArea from '@/components/inputs/TextArea.vue'
import MapDisplay from '@/components/inputs/MapDisplay.vue'
import SelectInput from '@/components/inputs/SelectInput.vue'
import CameraCapture from '@/components/inputs/CameraCapture.vue'
import CanvasDraw from '@/components/inputs/canvasdraw/CanvasDraw.vue'
import CollapsedInfoCard from '@/components/CollapsedInfoCard.vue'
import ReadOnlyField from '@/components/inputs/ReadOnlyField.vue'
import CompassInput from '@/components/inputs/CompassInput.vue'
import AttachmentPicker from '@/components/inputs/AttachmentPicker.vue'

const emit = defineEmits(['onSubmit', 'onDraftChange'])
const props = defineProps({ formConfig: { type: Object, default: () => ({ fields: [] }) } })
const fieldErrors = ref({})
const activeTabIdx = ref(0)
const toast = inject('toast')

const componentMaps = { 
  text: TextInput, 
  textarea: TextArea, 
  canvas: CanvasDraw, 
  map: MapDisplay, 
  select: SelectInput, 
  camera: CameraCapture,
  attachment: AttachmentPicker
}

// A field's `type` says what widget it WOULD be; `computed: true` overrides that with
// a read-only display instead, regardless of type — a computed select-type field (if
// one ever exists) gets the same plain info card as a computed text field.
const resolveFieldComponent = (field) => field.computed ? ReadOnlyField : componentMaps[field.type]

const isFieldInActiveTab = (field) => {
  if (!props.formConfig.tabs || props.formConfig.tabs.length === 0) return true
  const currentTab = props.formConfig.tabs[activeTabIdx.value]
  return currentTab ? currentTab.fields.includes(field.name) : true
}

const isFieldVisible = (field) => {
  if (!field.visibleIf) return true
  const target = props.formConfig.fields.find(f => f.name === field.visibleIf.field)
  return target ? String(target.value).trim() === String(field.visibleIf.value).trim() : true
}

// Only the autoFilled fields that belong to the tab currently open — so the card
// doesn't show order-level info while someone's on, say, Data Bangunan.
const activeTabAutoFilledFields = computed(() =>
  props.formConfig.fields.filter(f => f.autoFilled && isFieldInActiveTab(f))
)

// Fields actually rendered in the main editable flow, in formConfig order — used both
// for the v-for itself and to detect where one field's `section` differs from the
// previous one, so a header can be inserted between them.
const visibleTabFields = computed(() =>
  props.formConfig.fields.filter(f => !f.autoFilled && isFieldVisible(f) && isFieldInActiveTab(f))
)

// Fields with `layout: 'compass'` render together as one CompassInput grid instead of
// four separate rows. Grouped by `compassGroup` (a plain string shared across the four
// fields) rather than relying on array position, so they don't need to be adjacent in
// formConfig.fields to end up in the same grid.
const compassGroups = computed(() => {
  const groups = {}
  for (const f of visibleTabFields.value) {
    if (f.layout === 'compass' && f.compassGroup && f.compassRole) {
      groups[f.compassGroup] = groups[f.compassGroup] || {}
      groups[f.compassGroup][f.compassRole] = f
    }
  }
  return groups
})

// --- Collapsible sections -------------------------------------------------
// Only sections past a field-count threshold get a collapse toggle at all — a
// 3-field section is already quick to scan, and forcing a tap-to-expand on it
// would be friction with no real benefit. Applies at every viewport: the field
// layout inside a tab doesn't currently change by breakpoint, so the long-scroll
// problem this solves exists identically on desktop as on mobile.
const COLLAPSIBLE_SECTION_THRESHOLD = 8

const sectionFieldCounts = computed(() => {
  const counts = {}
  for (const f of visibleTabFields.value) {
    if (f.section) counts[f.section] = (counts[f.section] || 0) + 1
  }
  return counts
})

const isSectionCollapsible = (section) => (sectionFieldCounts.value[section] || 0) > COLLAPSIBLE_SECTION_THRESHOLD

// Keyed by tab + section (not section alone) so identical section names in
// different tabs, if that ever happens, don't share collapse state.
const collapsedSections = ref({})
const sectionKey = (section) => `${activeTabIdx.value}:${section}`
const isSectionCollapsed = (section) => !!collapsedSections.value[sectionKey(section)]
const toggleSection = (section) => {
  const key = sectionKey(section)
  collapsedSections.value[key] = !collapsedSections.value[key]
}

const isBlankValue = (value) =>
  !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')

// formConfig.navigation:
//   'sequential' (default) — tabs past the first incomplete one are locked and "Next"
//                            requires the current tab's required fields.
//   'free'                 — any tab, any order; required fields are only enforced on submit.
const isFreeNavigation = computed(() => props.formConfig.navigation === 'free')

// A tab counts as complete once every visible required field inside it has a value.
// Sequential mode uses it to decide how far ahead someone may jump; free mode only
// uses it for the "still missing something" indicators.
const isTabComplete = (idx) => {
  const tab = props.formConfig.tabs?.[idx]
  if (!tab) return true
  return tab.fields.every(fieldName => {
    const field = props.formConfig.fields.find(f => f.name === fieldName)
    if (!field || !field.required || !isFieldVisible(field)) return true
    return !isBlankValue(field.value)
  })
}

// Sequential: colored by position (done / current / ahead).
// Free: colored by completion, since "behind the current tab" no longer means "done".
const mobileSegmentClass = (idx) => {
  if (idx === activeTabIdx.value) return 'bg-primary'
  if (isFreeNavigation.value) return isTabComplete(idx) ? 'bg-teal-600' : 'bg-slate-200'
  return idx < activeTabIdx.value ? 'bg-teal-600' : 'bg-slate-200'
}

// The furthest tab reachable right now: every completed tab, plus the first
// incomplete one (so you can always continue where you left off). Anything
// past that is locked until earlier required fields are filled in.
const maxReachableTabIdx = computed(() => {
  const tabs = props.formConfig.tabs
  if (!tabs || tabs.length === 0) return 0
  for (let i = 0; i < tabs.length; i++) {
    if (!isTabComplete(i)) return i
  }
  return tabs.length - 1
})

const isTabReachable = (idx) => isFreeNavigation.value || idx <= maxReachableTabIdx.value

const handleTabClick = (idx) => {
  if (!isTabReachable(idx)) {
    toast.error('Complete earlier steps first', 'Finish the required fields on the current step before jumping ahead.')
    return
  }
  activeTabIdx.value = idx
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Scrolls to the first field currently marked invalid, so a validation failure on a
// long tab (e.g. Data Umum's 20 fields) doesn't leave the person hunting for what's wrong.
// If that field lives inside a collapsed section, expand it first — scrollIntoView on a
// v-if'd-out element is a silent no-op, so skipping this step would leave the person with
// just the "missing fields" toast and no visible indication of where to look.
const scrollToFirstError = async () => {
  await nextTick()
  const firstErrorName = Object.keys(fieldErrors.value)[0]
  if (!firstErrorName) return

  const field = props.formConfig.fields.find(f => f.name === firstErrorName)
  if (field?.section && isSectionCollapsible(field.section) && isSectionCollapsed(field.section)) {
    collapsedSections.value[sectionKey(field.section)] = false
    await nextTick()
  }

  document.getElementById(`field-${firstErrorName}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Real autosave: every field change is persisted (debounced), not just the explicit
// "Save draft" tap. Form.vue stays storage-agnostic — it just emits a snapshot; the
// parent (SurveyForm.vue) decides where/how to persist it (IndexedDB via db.js).
let autosaveTimer = null
const emitDraftChange = (immediate = false) => {
  clearTimeout(autosaveTimer)
  const fire = () => emit('onDraftChange', props.formConfig.fields.map(f => ({ name: f.name, value: f.value })))
  if (immediate) fire()
  else autosaveTimer = setTimeout(fire, 600)
}

// Note: no `{ deep: true }` here on purpose. The getter already reads each field's
// `.value` individually while mapping, so Vue tracks every one of those as a direct
// dependency — deep traversal would only matter if a field's value were itself a
// nested object/array, and every input type in this app (text, select, canvas, map,
// camera) stores a plain string. Deep would just walk primitives for no benefit.
// Once a submit has failed, errors are kept for the whole form (not just the active
// tab) so they're still visible when the surveyor navigates to another tab, and each
// one clears live as it's filled in.
const hasAttemptedSubmit = ref(false)

watch(() => props.formConfig.fields.map(f => f.value), () => {
  if (hasAttemptedSubmit.value) fieldErrors.value = collectRequiredErrors().errors
  else if (Object.keys(fieldErrors.value).length > 0) validateActiveTabFieldsOnly()
  emitDraftChange()
})

const validateActiveTabFieldsOnly = () => {
  fieldErrors.value = {}
  let isCurrentStepValid = true
  
  if (!props.formConfig.tabs || props.formConfig.tabs.length === 0) return true
  const activeFieldsList = props.formConfig.tabs[activeTabIdx.value].fields

  for (const fieldName of activeFieldsList) {
    const field = props.formConfig.fields.find(f => f.name === fieldName)
    if (!field || !isFieldVisible(field)) continue

    if (field.required && isBlankValue(field.value)) {
      fieldErrors.value[field.name] = 'Enter a value first'
      isCurrentStepValid = false
    }
  }
  return isCurrentStepValid
}

const handleNavigateForwardStep = () => {
  if (isFreeNavigation.value) {
    activeTabIdx.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (validateActiveTabFieldsOnly()) {
    activeTabIdx.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    toast.error('Required Information Missing', 'Please complete all required fields on this page.')
    scrollToFirstError()
  }
}

const handleNavigateBackwardsStep = () => {
  if (activeTabIdx.value > 0) {
    if (!hasAttemptedSubmit.value) fieldErrors.value = {}
    activeTabIdx.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSaveDraftShortcut = () => {
  emitDraftChange(true)
  toast.success('Draft Saved', 'Your assessment progress has been safely cached locally.')
}

// Pure: every visible required field that's blank, plus the first tab holding one.
const collectRequiredErrors = () => {
  const errors = {}
  let firstErrorTabIdx = null

  for (const field of props.formConfig.fields) {
    if (!field.name || !field.required || !isFieldVisible(field)) continue
    if (!isBlankValue(field.value)) continue

    errors[field.name] = 'Enter a value first'
    if (firstErrorTabIdx === null && props.formConfig.tabs) {
      const idx = props.formConfig.tabs.findIndex(t => t.fields.includes(field.name))
      if (idx !== -1) firstErrorTabIdx = idx
    }
  }
  return { errors, firstErrorTabIdx }
}

const stripTabNumber = (title) => title.replace(/^\d+\.\s*/, '')

const handleSubmit = () => {
  hasAttemptedSubmit.value = true
  const { errors, firstErrorTabIdx } = collectRequiredErrors()
  fieldErrors.value = errors

  const errorCount = Object.keys(errors).length
  if (errorCount > 0) {
    const tabsWithErrors = (props.formConfig.tabs || [])
      .filter(tab => tab.fields.some(name => errors[name]))
      .map(tab => stripTabNumber(tab.title))
    toast.error(
      'Submission Blocked',
      `${errorCount} field wajib belum diisi${tabsWithErrors.length ? ': ' + tabsWithErrors.join(', ') : ''}`
    )
    if (firstErrorTabIdx !== null) activeTabIdx.value = firstErrorTabIdx
    scrollToFirstError()
    return
  }
  const payload = {}
  props.formConfig.fields.forEach(f => { if (f.name) payload[f.name] = isFieldVisible(f) ? f.value : null })
  emit('onSubmit', payload)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>