// Web Worker: resize + JPEG re-encode one image off the main thread, so a batch
// of gallery photos doesn't freeze scrolling. Spawned by domain/image.js, which
// falls back to the main thread where OffscreenCanvas isn't available (older iOS).
// imageOrientation 'from-image' applies the EXIF rotation, so portrait phone
// photos don't come out sideways.
self.onmessage = async ({ data }) => {
    const { id, file, maxEdge, quality } = data
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
        const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
        const width = Math.round(bitmap.width * scale)
        const height = Math.round(bitmap.height * scale)

        const canvas = new OffscreenCanvas(width, height)
        canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
        bitmap.close()

        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
        self.postMessage({ id, blob, width, height })
    } catch (err) {
        self.postMessage({ id, error: String(err?.message || err) })
    }
}
