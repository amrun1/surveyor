// Photo compression for everything that stores user photos (PhotoList,
// AttachmentPicker). A phone photo is 3–8 MB; resized to a 1600px long edge at
// JPEG 0.8 it's ~200–400 KB — 10–20× less to hold, autosave, and upload, while
// still sharp enough for an appraisal report. Works fully offline (no network).

const DEFAULTS = { maxEdge: 1600, quality: 0.8 }

const supportsWorker = typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' && typeof createImageBitmap !== 'undefined'

let worker = null
let nextJobId = 0
const pendingJobs = new Map()

function getWorker() {
    if (!worker) {
        // Vite bundles this as its own chunk; the PWA precache includes it, so it works offline.
        worker = new Worker(new URL('./imageCompressWorker.js', import.meta.url), { type: 'module' })
        worker.onmessage = ({ data }) => {
            const job = pendingJobs.get(data.id)
            if (!job) return
            pendingJobs.delete(data.id)
            data.error ? job.reject(new Error(data.error)) : job.resolve(data)
        }
        worker.onerror = (event) => {
            // A worker that can't even start (e.g. OffscreenCanvas without 2D support)
            // fails every pending job; they fall back to the main thread below.
            for (const job of pendingJobs.values()) job.reject(new Error(event.message || 'worker failed'))
            pendingJobs.clear()
        }
    }
    return worker
}

// A worker that started but never answers must not leave a photo spinning forever.
const WORKER_TIMEOUT_MS = 20000

function compressInWorker(file, options) {
    return new Promise((resolve, reject) => {
        const id = ++nextJobId
        const timer = setTimeout(() => {
            pendingJobs.delete(id)
            reject(new Error('worker timed out'))
        }, WORKER_TIMEOUT_MS)
        pendingJobs.set(id, {
            resolve: (result) => { clearTimeout(timer); resolve(result) },
            reject: (err) => { clearTimeout(timer); reject(err) }
        })
        getWorker().postMessage({ id, file, ...options })
    })
}

// Fallback: same steps on the main thread. Drawing an <img> into a canvas
// applies EXIF orientation in current Safari/Chrome (image-orientation: from-image
// is the CSS default).
async function compressOnMainThread(file, { maxEdge, quality }) {
    const url = URL.createObjectURL(file)
    try {
        const img = new Image()
        img.src = url
        await img.decode()
        const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
        const width = Math.round(img.naturalWidth * scale)
        const height = Math.round(img.naturalHeight * scale)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        const blob = await new Promise((resolve, reject) =>
            canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', quality))
        return { blob, width, height }
    } finally {
        URL.revokeObjectURL(url)
    }
}

/**
 * Resize + re-encode an image file to JPEG. Non-images (e.g. PDFs) are returned
 * untouched. Never throws for a valid image: if the worker path fails, it retries
 * on the main thread.
 * @param {File|Blob} file
 * @returns {Promise<{ blob: Blob, width?: number, height?: number }>}
 */
export async function compressImage(file, options = {}) {
    if (!file?.type?.startsWith('image/')) return { blob: file }
    const opts = { ...DEFAULTS, ...options }
    if (supportsWorker) {
        try {
            return await compressInWorker(file, opts)
        } catch (err) {
            console.warn('Worker image compression failed, using main thread:', err)
        }
    }
    return compressOnMainThread(file, opts)
}

/** Blob → data: URL, for the places that still store a string value (AttachmentPicker). */
export function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
    })
}
