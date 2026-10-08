import { useAuthStore } from '@/store/auth.js'

// Save-before-camera: when the OS camera app takes over the screen, a low-memory
// phone may kill the backgrounded app (iOS home-screen PWAs, low-RAM Android), and
// it reloads when the surveyor comes back. The debounced 600ms autosave may not
// have fired yet, so whatever was typed just before tapping "camera" would be lost.
//
// This starts an immediate save of every in-progress form through the same flush
// registry the router guard uses before a forced /login redirect
// (auth.registerFlushHandler — SurveyForm.vue registers its draft save there).
//
// It deliberately does NOT await: the hidden file input's .click() must run inside
// the same user gesture, or iOS Safari refuses to open the camera. Call saveNow()
// on pointerdown (gets a head start) and again right before .click().
export function useSaveBeforeCamera() {
    const auth = useAuthStore()

    const saveNow = () => {
        auth.flushPendingSaves().catch(err => console.error('Save-before-camera failed:', err))
    }

    return { saveNow }
}
