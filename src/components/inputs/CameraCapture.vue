<template>
    <div class="w-full flex flex-col gap-3 border border-slate-200 p-4 bg-slate-50/70 rounded-2xl shadow-xs">
        <div class="flex justify-between items-center">
            <span class="text-slate-700 text-[15px] font-semibold">{{ label }}<span v-if="required"
                    class="text-red-500 font-bold ml-0.5">*</span></span>
            <div class="flex gap-2">
                <button v-if="!isStreamActive && !modelValue" type="button" @click="startCameraStream"
                    class="text-xs font-semibold text-primary bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 shadow-2xs">Use
                    Camera</button>
                <button v-if="!isStreamActive && !modelValue" type="button" @click="triggerFileBrowser"
                    class="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 shadow-2xs">Upload
                    File</button>
                <button v-if="isStreamActive" type="button" @click="stopCameraStream"
                    class="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 shadow-2xs">Cancel</button>
            </div>
        </div>
        <div
            class="w-full aspect-video bg-slate-900 rounded-xl border border-slate-300 shadow-inner overflow-hidden relative flex items-center justify-center">
            <video v-show="isStreamActive" ref="videoRef" autoplay playsinline
                class="w-full h-full object-cover"></video>
            <div v-if="modelValue && !isStreamActive" @click="isPreviewOpen = true"
                class="w-full h-full relative group cursor-zoom-in">
                <img :src="modelValue" alt="Property asset record" class="w-full h-full object-cover" />
                <div
                    class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 flex items-center justify-center transition-all">
                    <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-150"
                        fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604ZM10.5 7.5v6m3-3h-6" />
                    </svg>
                </div>
            </div>
            <div v-if="!isStreamActive && !modelValue" class="text-center p-6 text-slate-400 space-y-2">
                <span class="text-xs font-medium block">Capture using live camera stream or select an image file from
                    storage.</span>
            </div>
            <div v-if="isStreamActive" class="absolute bottom-4 left-0 right-0 flex justify-center z-20">
                <button type="button" @click="capturePhotoFrame"
                    class="w-14 h-14 bg-white border-4 border-slate-300 rounded-full flex items-center justify-center group">
                    <div class="w-10 h-10 bg-primary group-hover:bg-slate-800 rounded-full"></div>
                </button>
            </div>
            <button v-if="modelValue && !isStreamActive" type="button" @click="resetMediaInput"
                class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-md z-20">Change
                Image</button>
        </div>
        <div v-if="isPreviewOpen"
            class="fixed inset-0 bg-slate-900/90 z-50 flex flex-col justify-between p-4 backdrop-blur-xs animate-fade-in"
            @click.self="isPreviewOpen = false">
            <div class="w-full flex justify-between items-center text-white pb-2 max-w-5xl mx-auto">
                <div>
                    <h4 class="font-bold text-sm">High-Resolution Image Inspection</h4>
                    <p class="text-[11px] text-slate-400">Bank Mortgage Appraisal Valuation Asset Record Room</p>
                </div>
                <button type="button" @click="isPreviewOpen = false"
                    class="bg-white/10 text-white rounded-xl px-4 py-2 text-xs font-semibold">Exit View</button>
            </div>
            <div class="flex-1 flex items-center justify-center max-w-5xl mx-auto w-full overflow-hidden p-2"><img
                    :src="modelValue" alt="Expanded display view"
                    class="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl" /></div>
            <div class="text-center text-slate-500 text-[11px] pt-2">Click outside image frame boundary area to return
                to appraisal checklist sheet.</div>
        </div>
        <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileSelection" />
        <canvas ref="hiddenCanvasRef" class="hidden"></canvas>
        <span v-if="error" class="text-xs text-red-500 font-semibold mt-0.5 block">{{ error }}</span>
    </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
defineProps({ label: String, required: Boolean, error: String })
const modelValue = defineModel({ type: String, default: '' })
const videoRef = ref(null), hiddenCanvasRef = ref(null), fileInputRef = ref(null), isStreamActive = ref(false), isPreviewOpen = ref(false)
let localMediaStream = null
const MAX_WIDTH = 1280, MAX_HEIGHT = 720

const startCameraStream = async () => {
    try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', aspectRatio: 1.7777777778 }, audio: false })
        if (videoRef.value) { videoRef.value.srcObject = localMediaStream; isStreamActive.value = true }
    } catch { alert('Unable to capture camera thread permissions.') }
}
const capturePhotoFrame = () => {
    const canvas = hiddenCanvasRef.value, video = videoRef.value
    const ctx = canvas.getContext('2d'); canvas.width = video.videoWidth; canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); modelValue.value = canvas.toDataURL('image/jpeg', 0.85); stopCameraStream()
}
const triggerFileBrowser = () => { if (fileInputRef.value) fileInputRef.value.click() }
const handleFileSelection = (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader(); reader.readAsDataURL(file)
    reader.onload = (evt) => {
        const img = new Image(); img.src = evt.target?.result || ''
        img.onload = () => {
            const canvas = hiddenCanvasRef.value, ctx = canvas.getContext('2d')
            let w = img.width, h = img.height
            if (w > MAX_WIDTH) { h = Math.round((h * MAX_WIDTH) / w); w = MAX_WIDTH }
            if (h > MAX_HEIGHT) { w = Math.round((w * MAX_HEIGHT) / h); h = MAX_HEIGHT }
            canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h)
            modelValue.value = canvas.toDataURL('image/jpeg', 0.80); resetFileInput()
        }
    }
}
const stopCameraStream = () => { if (localMediaStream) localMediaStream.getTracks().forEach(track => track.stop()); isStreamActive.value = false }
const resetMediaInput = () => { modelValue.value = ''; resetFileInput() }
const resetFileInput = () => { if (fileInputRef.value) fileInputRef.value.value = '' }
onUnmounted(() => stopCameraStream())
</script>