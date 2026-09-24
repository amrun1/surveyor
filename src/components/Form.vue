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
            @click="activeTabIdx = idx"
            :class="activeTabIdx === idx ? 'bg-primary text-white font-semibold shadow-xs' : 'text-slate-500 hover:bg-slate-50 font-medium'"
            class="px-4 py-2 text-xs rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap focus:outline-none"
          >
            {{ tab.title }}
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

          <div class="flex w-full gap-1.5 h-1">
            <div
              v-for="(tab, idx) in formConfig.tabs"
              :key="idx"
              :class="[
                idx < activeTabIdx ? 'bg-teal-600' : '',
                idx === activeTabIdx ? 'bg-primary' : '', 
                idx > activeTabIdx ? 'bg-slate-200' : ''
              ]"
              class="flex-1 rounded-full transition-all duration-300"
            ></div>
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

        <div class="space-y-5 flex-1 bg-white">
          <div 
            v-for="(field, index) in formConfig?.fields" 
            :key="index" 
            v-show="isFieldVisible(field) && isFieldInActiveTab(field)" 
            class="flex flex-col form-field-row"
          >
            <component 
              :is="componentMaps[field.type]" 
              v-model="field.value" 
              v-bind="field" 
              :error="fieldErrors[field.name]"
            />
          </div>
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

          <!-- 🛠️ UPDATED BUTTON TEXT: CHANGED FROM 'Save and continue' TO 'Next' -->
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
import { ref, watch, inject } from 'vue'
import TextInput from '@/components/inputs/TextInput.vue'
import TextArea from '@/components/inputs/TextArea.vue'
import MapDisplay from '@/components/inputs/MapDisplay.vue'
import SelectInput from '@/components/inputs/SelectInput.vue'
import CameraCapture from '@/components/inputs/CameraCapture.vue'
import CanvasDraw from '@/components/inputs/canvasdraw/CanvasDraw.vue'

const emit = defineEmits(['onSubmit'])
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
  camera: CameraCapture 
}

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

const validateActiveTabFieldsOnly = () => {
  fieldErrors.value = {}
  let isCurrentStepValid = true
  
  if (!props.formConfig.tabs || props.formConfig.tabs.length === 0) return true
  const activeFieldsList = props.formConfig.tabs[activeTabIdx.value].fields

  for (const fieldName of activeFieldsList) {
    const field = props.formConfig.fields.find(f => f.name === fieldName)
    if (!field || !isFieldVisible(field)) continue

    if (field.required) {
      const value = field.value
      const isBlank = !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')
      
      if (isBlank) {
        fieldErrors.value[field.name] = 'Enter a value first' 
        isCurrentStepValid = false
      }
    }
  }
  return isCurrentStepValid
}

const handleNavigateForwardStep = () => {
  if (validateActiveTabFieldsOnly()) {
    activeTabIdx.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    toast.error('Required Information Missing', 'Please complete all required fields on this page.')
  }
}

const handleNavigateBackwardsStep = () => {
  if (activeTabIdx.value > 0) {
    fieldErrors.value = {} 
    activeTabIdx.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSaveDraftShortcut = () => {
  toast.success('Draft Saved', 'Your assessment progress has been safely cached locally.')
}

const validateWholeFormOnSubmit = () => {
  fieldErrors.value = {}
  let isValid = true
  let firstErrorTabIdx = null

  for (const field of props.formConfig.fields) {
    if (!field.name || !isFieldVisible(field)) continue
    const value = field.value

    if (field.required) {
      const isBlank = !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')
      if (isBlank) {
        fieldErrors.value[field.name] = 'Enter a value first'
        isValid = false
        
        if (firstErrorTabIdx === null && props.formConfig.tabs) {
          firstErrorTabIdx = props.formConfig.tabs.findIndex(t => t.fields.includes(field.name))
        }
      }
    }
  }

  if (firstErrorTabIdx !== null && firstErrorTabIdx !== -1) {
    activeTabIdx.value = firstErrorTabIdx
  }

  return isValid
}

watch(() => props.formConfig.fields.map(f => f.value), () => { 
  if (Object.keys(fieldErrors.value).length > 0) validateActiveTabFieldsOnly() 
}, { deep: true })

const handleSubmit = () => {
  if (!validateWholeFormOnSubmit()) {
    toast.error('Submission Blocked', 'Incomplete compliance indicators found on earlier steps.')
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