<!-- src/components/inputs/CanvasModal.vue -->
<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
    isOpen: Boolean,
    initialData: String,
    initialHistory: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'stream-update'])

const dialogRef = ref(null)
const modalCanvasRef = ref(null)
const historyStack = ref([])
let ctx = null
let isDrawing = false
let blankSnapshot = ''

watch(() => props.isOpen, async (newVal) => {
    await nextTick()
    if (newVal) {
        dialogRef.value.showModal()
        setupModalCanvas()
    } else {
        dialogRef.value.close()
    }
})

const setupModalCanvas = () => {
    const canvas = modalCanvasRef.value
    ctx = canvas.getContext('2d')

    // Match the bitmap to physical bounding size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.strokeStyle = '#002850'
    ctx.lineWidth = 4 // Thicker strokes for easier large canvas drawing
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    blankSnapshot = canvas.toDataURL('image/png')

    if (props.initialHistory && props.initialHistory.length > 0) {
        historyStack.value = [...props.initialHistory]
    } else {
        historyStack.value = [blankSnapshot]
    }

    if (props.initialData) {
        const img = new Image()
        img.src = props.initialData
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            // Draws the incoming smaller preview image cleanly scaled to the 16:9 modal size
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
    }
}

const startDrawing = (e) => {
    isDrawing = true
    ctx.beginPath()
    ctx.moveTo(e.offsetX || e.touches[0].clientX - modalCanvasRef.value.getBoundingClientRect().left, e.offsetY || e.touches[0].clientY - modalCanvasRef.value.getBoundingClientRect().top)
}

const draw = (e) => {
    if (!isDrawing) return
    const x = e.offsetX || (e.touches && e.touches[0].clientX - modalCanvasRef.value.getBoundingClientRect().left)
    const y = e.offsetY || (e.touches && e.touches[0].clientY - modalCanvasRef.value.getBoundingClientRect().top)
    ctx.lineTo(x, y)
    ctx.stroke()
}

const stopDrawing = () => {
    if (!isDrawing) return
    isDrawing = false
    historyStack.value.push(modalCanvasRef.value.toDataURL('image/png'))
    streamCanvasUpdate()
}

const undo = () => {
    if (historyStack.value.length <= 1) return
    historyStack.value.pop()
    ctx.clearRect(0, 0, modalCanvasRef.value.width, modalCanvasRef.value.height)
    const img = new Image()
    img.src = historyStack.value[historyStack.value.length - 1]
    img.onload = () => {
        ctx.drawImage(img, 0, 0, modalCanvasRef.value.width, modalCanvasRef.value.height)
        streamCanvasUpdate()
    }
}

const streamCanvasUpdate = () => {
    emit('stream-update', {
        data: modalCanvasRef.value.toDataURL('image/png'),
        history: [...historyStack.value]
    })
}
</script>

<template>
    <Teleport to="body">
        <dialog ref="dialogRef"
            class="w-full h-full lg:m-auto max-w-5xl h-[90vh] lg:rounded-2xl border border-slate-200 p-0 backdrop:bg-slate-900/60 backdrop:backdrop-blur-xs outline-none">
            <div v-if="isOpen" class="w-full h-full flex flex-col bg-slate-50">

                <!-- Modal Header Bar -->
                <div class="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base">Fullscreen Drawing Mode</h3>
                    </div>
                    <div class="flex gap-4">
                        <button type="button" @click="undo" :disabled="historyStack.length <= 1"
                            class="text-sm font-semibold disabled:text-slate-300 text-primary cursor-pointer">Undo</button>
                        <button type="button" @click="emit('close')"
                            class="text-sm text-red-500 font-semibold cursor-pointer">Close</button>
                    </div>
                </div>

                <!-- CENTERED CONTAINER LOCKING CANVAS COMPONENT ASYMMETRIC PROPORTIONS ACCURATELY -->
                <div class="flex-1 p-6 flex items-center justify-center overflow-hidden">
                    <div
                        class="w-full max-w-4xl aspect-video bg-white rounded-xl border border-slate-300 shadow-lg overflow-hidden">
                        <canvas ref="modalCanvasRef" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing"
                            @mouseleave="stopDrawing" @touchstart.prevent="startDrawing" @touchmove.prevent="draw"
                            @touchend="stopDrawing" class="w-full h-full cursor-crosshair block touch-none"></canvas>
                    </div>
                </div>

            </div>
        </dialog>
    </Teleport>
</template>
