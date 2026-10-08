import { ref, onUnmounted } from 'vue'

// Delete-with-undo for repeatable fields (ItemList, PhotoList): removing a row
// shows an "Urungkan" bar for a few seconds instead of an "are you sure?" dialog.
// `onExpire(item)` runs once the undo window has passed — PhotoList uses it to
// delete the photo's Blob only when the removal is final.
export function useUndoableRemove({ undoMs = 6000, onExpire } = {}) {
    const lastRemoved = ref(null) // { item, index }
    let timer = null

    const finalize = () => {
        clearTimeout(timer)
        if (lastRemoved.value) onExpire?.(lastRemoved.value.item)
        lastRemoved.value = null
    }

    /** @returns the new array without `items[index]` */
    const remove = (items, index) => {
        finalize() // a second delete makes the previous one final
        lastRemoved.value = { item: items[index], index }
        timer = setTimeout(finalize, undoMs)
        return items.filter((_, idx) => idx !== index)
    }

    /** @returns the new array with the removed item back at its old position */
    const undo = (items) => {
        clearTimeout(timer)
        const { item, index } = lastRemoved.value
        lastRemoved.value = null
        const next = [...items]
        next.splice(Math.min(index, next.length), 0, item)
        return next
    }

    // Leaving the page makes a pending removal final.
    onUnmounted(finalize)

    return { lastRemoved, remove, undo }
}
