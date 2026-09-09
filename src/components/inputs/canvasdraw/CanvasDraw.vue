<script setup>
import { ref } from 'vue'
import CanvasItem from './CanvasItem.vue'
import CanvasModal from './CanvasModal.vue'

const props = defineProps({
  label: { type: String, default: '' },
  multi: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

const modelValue = defineModel({ default: '' })

const canvasItems = ref([{ id: Date.now(), data: '', historyStack: [] }])
const itemRefs = ref([])

const modalState = ref({ open: false, index: null, data: '', history: [] })

const addSheet = () => {
  canvasItems.value.push({ id: Date.now(), data: '', historyStack: [] })
}

const updateModelData = () => {
  if (props.multi) {
    // Multi mode: modelValue becomes an array of non-empty base64 strings
    modelValue.value = canvasItems.value.map(c => c.data).filter(Boolean)
  } else {
    // Single mode: modelValue remains a single plain base64 string
    modelValue.value = canvasItems.value[0]?.data || ''
  }
}

const removeSheet = (index) => {
  canvasItems.value.splice(index, 1)
  updateModelData()
}

const onSheetUpdate = (index, base64Data) => {
  canvasItems.value[index].data = base64Data
  if (itemRefs.value[index]) {
    canvasItems.value[index].historyStack = [...itemRefs.value[index].historyStack]
  }
  updateModelData()
}

const openFullscreen = (index) => {
  const currentHistory = itemRefs.value[index]?.historyStack || canvasItems.value[index].historyStack
  modalState.value = {
    open: true,
    index,
    data: canvasItems.value[index].data,
    history: [...currentHistory]
  }
}

const handleRealtimeStream = ({ data, history }) => {
  const index = modalState.value.index

  canvasItems.value[index].data = data
  canvasItems.value[index].historyStack = [...history]

  if (itemRefs.value[index]) {
    itemRefs.value[index].historyStack = [...history]
    itemRefs.value[index].initCanvas()
  }

  updateModelData()
}
</script>


<template>
  <div class="w-full flex flex-col gap-3 border border-slate-200 p-4 bg-slate-50/70 rounded-2xl shadow-xs">
    <div class="flex justify-between items-center">
      <span class="text-slate-700 text-[15px] font-semibold">
        {{ label }} <span v-if="required" class="text-red-500 font-bold">*</span>
      </span>
      <button v-if="multi" type="button" @click="addSheet"
        class="text-xs font-semibold text-primary bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 shadow-2xs cursor-pointer">
        Add Another Sheet
      </button>
    </div>

    <div class="space-y-4">
      <CanvasItem v-for="(item, index) in canvasItems" :key="item.id" ref="itemRefs" :index="index"
        :initial-data="item.data" :show-remove="multi && canvasItems.length > 1"
        @update="data => onSheetUpdate(index, data)" @remove="removeSheet(index)" @expand="openFullscreen(index)" />
    </div>

    <span v-if="error" class="text-xs text-red-500 font-semibold mt-1 block">{{ error }}</span>

    <!-- Modal catches real-time data inputs stream and reflects it down onto background components instantly -->
    <CanvasModal :is-open="modalState.open" :initial-data="modalState.data" :initial-history="modalState.history"
      @close="modalState.open = false" @stream-update="handleRealtimeStream" />
  </div>
</template>
