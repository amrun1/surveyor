<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
    index: { type: Number, required: true },
    initialData: { type: String, default: '' },
    showRemove: { type: Boolean, default: false }
})

const emit = defineEmits(['update', 'remove', 'expand'])

const canvasRef = ref(null)
const historyStack = ref([])
let ctx = null
let isDrawing = false
let blankSnapshot = ''

const initCanvas = async () => {
    await nextTick()
    const canvas = canvasRef.value
    if (!canvas) return

    ctx = canvas.getContext('2d')

    // Explicitly tie internal bitmap pixels matching physical bounds
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.strokeStyle = '#002850'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    blankSnapshot = canvas.toDataURL('image/png')
    if (historyStack.value.length === 0) {
        historyStack.value.push(blankSnapshot)
    }

    if (props.initialData) {
        const img = new Image()
        img.src = props.initialData
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            // Draws the incoming image exactly fitting the current 16:9 canvas dimensions
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
    }
}

const startDrawing = (e) => {
    isDrawing = true
    ctx.beginPath()
    ctx.moveTo(e.offsetX || e.touches[0].clientX - canvasRef.value.getBoundingClientRect().left, e.offsetY || e.touches[0].clientY - canvasRef.value.getBoundingClientRect().top)
}

const draw = (e) => {
    if (!isDrawing) return
    const clientX = e.offsetX || (e.touches && e.touches[0].clientX - canvasRef.value.getBoundingClientRect().left)
    const clientY = e.offsetY || (e.touches && e.touches[0].clientY - canvasRef.value.getBoundingClientRect().top)
    ctx.lineTo(clientX, clientY)
    ctx.stroke()
}

const stopDrawing = () => {
    if (!isDrawing) return
    isDrawing = false
    const snapshot = canvasRef.value.toDataURL('image/png')
    historyStack.value.push(snapshot)
    emit('update', snapshot)
}

const undo = () => {
    if (historyStack.value.length <= 1) return
    historyStack.value.pop()
    const previousState = historyStack.value[historyStack.value.length - 1]

    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    const img = new Image()
    img.src = previousState
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasRef.value.width, canvasRef.value.height)
        emit('update', previousState === blankSnapshot ? '' : previousState)
    }
}

const clear = () => {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    historyStack.value = [blankSnapshot]
    emit('update', '')
}

defineExpose({ undo, clear, initCanvas, historyStack })

onMounted(() => {
    initCanvas()
    window.addEventListener('resize', initCanvas)
})
onUnmounted(() => window.removeEventListener('resize', initCanvas))
</script>

<template>
    <div class="bg-white rounded-xl border border-slate-300 shadow-inner p-3 space-y-2">
        <div class="flex justify-between items-center text-xs font-medium">
            <span class="text-slate-500">Sheet #{{ index + 1 }}</span>
            <div class="flex gap-3 items-center">
                <button type="button" @click="emit('expand')"
                    class="text-primary cursor-pointer font-semibold">Fullscreen</button>
                <button type="button" @click="undo" :disabled="historyStack.length <= 1"
                    :class="historyStack.length > 1 ? 'text-primary' : 'text-slate-300 cursor-not-allowed'">Undo</button>
                <button type="button" @click="clear" class="text-slate-500 cursor-pointer">Clear</button>
                <button v-if="showRemove" type="button" @click="emit('remove')"
                    class="text-red-500 cursor-pointer">Remove</button>
            </div>
        </div>

        <!-- LOCKED ASYMMETRIC ASPECT RATIO FRAME TO 16:9 VIEW -->
        <div class="w-full aspect-video bg-white border border-slate-100 rounded-lg overflow-hidden">
            <canvas ref="canvasRef" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing"
                @mouseleave="stopDrawing" @touchstart.prevent="startDrawing" @touchmove.prevent="draw"
                @touchend="stopDrawing" class="w-full h-full cursor-crosshair block touch-none"></canvas>
        </div>
    </div>
</template>