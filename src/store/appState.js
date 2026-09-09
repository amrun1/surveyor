import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStateStore = defineStore('appState', () => {
    const isInitialized = ref(localStorage.getItem('pwa_initialized') === 'true')
    const setInitialized = (status) => {
        isInitialized.value = status
        localStorage.setItem('pwa_initialized', String(status))
    }
    return { isInitialized, setInitialized }
})