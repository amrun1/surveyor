<!-- src/components/inputs/MapDisplay.vue -->
<template>
    <!-- HIDDEN PARAMETER SUPPORT -->
    <div v-if="!hidden"
        class="w-full flex flex-col gap-1.5 border border-slate-200 p-4 bg-slate-50/70 rounded-2xl shadow-xs">
        <!-- Header Text Panel -->
        <div class="flex justify-between items-center mb-1">
            <span class="text-slate-700 text-[15px] font-semibold">
                {{ label || 'Target Spatial Coordinates' }}
            </span>

            <!-- Coordinate Display Badge -->
            <span
                class="text-xs px-2.5 py-1 font-mono bg-white border border-slate-200 rounded-lg text-slate-600 shadow-2xs">
                {{ displayValue || 'Pending GPS Lock...' }}
            </span>
        </div>

        <!-- 1. MAP WORKSPACE ELEMENT CONTAINER -->
        <!-- Vue standard @click event link handles mobile and desktop intents smoothly -->
        <div @click="openNativeDeviceMap" title="Click to launch full device map navigation"
            class="w-full aspect-video rounded-xl border border-slate-300 shadow-sm overflow-hidden relative cursor-pointer group active:scale-[0.99] transition-all duration-150 z-10">
            <!-- The dedicated map viewport hook container container -->
            <div :id="`map-${instanceId}`" class="w-full h-full z-10"></div>

            <!-- Hover interaction badge display -->
            <div
                class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 flex items-center justify-center transition-all duration-200 z-20 pointer-events-none">
                <span
                    class="opacity-0 group-hover:opacity-100 bg-slate-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md transition-all duration-200 flex items-center gap-1.5 pointer-events-auto">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Open in Device Maps
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css' // Crucial: Imports standard map layer dimensions shapes

const props = defineProps({
    label: { type: String, default: '' },
    displayValue: { type: String, default: '' }, // e.g., "-6.283912, 106.755469"
    hidden: { type: Boolean, default: false }
})

const modelValue = defineModel({ type: String, default: '' })

// Generate a random unique integer token id key to prevent DOM collisions inside dynamic v-for loops
const instanceId = Math.floor(Math.random() * 10000)

// Helper function to extract numerical coordinates safely from strings layouts
const parsedCenterCoords = computed(() => {
    const target = props.displayValue || "-6.283912, 106.755469"
    const tokens = target.split(',')
    if (tokens.length === 2) {
        const lat = parseFloat(tokens[0].trim())
        const lng = parseFloat(tokens[1].trim())
        if (!isNaN(lat) && !isNaN(lng)) {
            return [lat, lng]
        }
    }
    return [-6.283912, 106.755469] // Baseline fallback default context parameter
})

const initWebMap = async () => {
    if (props.hidden) return
    await nextTick()

    const containerId = `map-${instanceId}`
    const center = parsedCenterCoords.value

    // Render the core Leaflet layer canvas engine
    const map = L.map(containerId, {
        zoomControl: true,       // the +/- zoom UI buttons
        attributionControl: false, // Hides the bottom leaflet link badge
        dragging: false,          // Disables desktop mouse dragging and mobile swipe panning ❌
        touchZoom: false,         // Disables pinch-to-zoom gestures on phone screens ❌
        doubleClickZoom: false,    // Disables double-click scaling shortcuts ❌
        scrollWheelZoom: false,    // Disables desktop mouse wheel scrolling ❌
        boxZoom: false,           // Disables marquee layout zooming selections ❌
        keyboard: false           // Disables keyboard arrows steering manipulations ❌
    }).setView(center, 14)

    // Use the high-performance open-source OpenStreetMap vector tiles link asset
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map)

    // Add a pinpoint location marker right in the center vector spot
    L.marker(center).addTo(map)
}

const openNativeDeviceMap = () => {
    const [lat, lng] = parsedCenterCoords.value
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    const mapUri = isAppleDevice
        ? `maps://?ll=${lat},${lng}&q=${lat},${lng}&z=16`
        : `https://google.com/maps?q=${lat},${lng}`

    window.open(mapUri, '_blank')
}

const captureRealTimeCoordinates = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords
            modelValue.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        },
        () => {
            if (!modelValue.value) modelValue.value = "-6.283912, 106.755469"
        },
        { enableHighAccuracy: true, timeout: 10000 }
    )
}

onMounted(() => {
    initWebMap()
    captureRealTimeCoordinates()
})
</script>
