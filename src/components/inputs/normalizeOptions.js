// Shared by SelectInput.vue, RadioGroup.vue and CheckboxGroup.vue, so switching a
// formConfig field between `select`, `radio` and `checkboxes` never requires
// touching its options. Accepts plain strings, { value, label } objects, or the
// backend's { id, title } lookup shape. Values are always strings.
export function normalizeOptions(options) {
    return (options || []).map(opt => {
        if (typeof opt === 'object' && opt !== null) {
            return {
                value: String(opt.value !== undefined ? opt.value : opt.id || ''),
                label: String(opt.label !== undefined ? opt.label : opt.title || opt.name || ''),
                ...(opt.description ? { description: String(opt.description) } : {}),
                // checkboxes only: a "nothing applies" answer that excludes every other option
                ...(opt.exclusive ? { exclusive: true } : {})
            }
        }
        return { value: String(opt), label: String(opt) }
    })
}

// --- Multi-select (CheckboxGroup) ------------------------------------------

/**
 * A checkbox field's value as an array of strings. Tolerates '' (a field reset
 * by code that assumes string values) and a lone string (a value saved before
 * the field was multi-select).
 */
export function toSelectionArray(value) {
    if (Array.isArray(value)) return value.map(String)
    if (value === '' || value === null || value === undefined) return []
    return [String(value)]
}

/**
 * The new selection after ticking/unticking one option — always a NEW array
 * (Form.vue's change watcher is shallow). An `exclusive` option ("Tidak ada")
 * clears everything else when ticked, and is cleared when anything else is.
 * Result keeps the options' own order, never the order things were tapped.
 */
export function toggleSelection(selected, option, checked, options) {
    const current = toSelectionArray(selected)
    let next
    if (!checked) {
        next = current.filter(value => value !== option.value)
    } else if (option.exclusive) {
        next = [option.value]
    } else {
        const exclusiveValues = new Set(options.filter(opt => opt.exclusive).map(opt => opt.value))
        next = [...current.filter(value => !exclusiveValues.has(value)), option.value]
    }
    const order = new Map(options.map((opt, idx) => [opt.value, idx]))
    return [...new Set(next)].sort((a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity))
}
