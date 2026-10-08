// Pure helpers for ItemList.vue (formConfig `type: 'itemList'`) and for Form.vue's
// validation of it. An item list's value is an ARRAY OF PLAIN OBJECTS, one per row:
//   [{ _key: 'k3x…', merkKendaraan: 'Toyota', noPolisi: 'B 1234 XY', … }]
// `_key` is a client-only stable id for rendering/undo — mappers.js must strip it.
import { formatForDisplay } from '@/domain/numberMask.js'
import { normalizeOptions, toSelectionArray } from './normalizeOptions.js'

const ARRAY_TYPES = new Set(['checkboxes', 'itemList', 'photoList'])

/** The empty value for a field of this type: [] for array-valued types, '' otherwise. */
export const emptyValueFor = (field) => (ARRAY_TYPES.has(field.type) ? [] : '')

const isBlank = (value) =>
    value === null || value === undefined ||
    (Array.isArray(value) ? value.length === 0 : String(value).trim() === '')

// crypto.randomUUID only exists in secure contexts — the dev server is often
// opened over plain http on a LAN IP, so fall back to a random string.
export const newKey = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

/** A fresh row: every item field at its declared default (or empty). */
export function createItem(itemFields) {
    const item = { _key: newKey() }
    for (const field of itemFields) item[field.name] = field.value ?? emptyValueFor(field)
    return item
}

/** visibleIf inside a row is evaluated against that row's own values. */
export function isItemFieldVisible(field, item) {
    if (!field.visibleIf) return true
    return String(item?.[field.visibleIf.field] ?? '').trim() === String(field.visibleIf.value).trim()
}

/** Names of the visible required fields this row hasn't filled in. */
export function missingRequiredFields(item, itemFields) {
    return itemFields
        .filter(field => field.required && !field.computed && isItemFieldVisible(field, item) && isBlank(item?.[field.name]))
        .map(field => field.name)
}

export function countIncompleteItems(items, itemFields) {
    return (Array.isArray(items) ? items : []).filter(item => missingRequiredFields(item, itemFields).length > 0).length
}

function displayValue(field, value) {
    if (isBlank(value)) return ''
    if (field.type === 'number') return [field.prefix, formatForDisplay(String(value), field.mask), field.suffix].filter(Boolean).join(' ')
    if (field.type === 'checkboxes') {
        const labels = new Map(normalizeOptions(field.options).map(opt => [opt.value, opt.label]))
        return toSelectionArray(value).map(v => labels.get(v) ?? v).join(', ')
    }
    if (field.type === 'select' || field.type === 'radio') {
        const match = normalizeOptions(field.options).find(opt => opt.value === String(value))
        return match ? match.label : String(value)
    }
    if (field.type === 'attachment' || field.type === 'camera' || field.type === 'canvas') return '' // base64 — not summary material
    return String(value)
}

/**
 * The two text lines a row's card shows. `summary` = { title: [names], subtitle: [names] };
 * without it, the first two filled-in fields are used. Empty parts are skipped.
 */
export function summarizeItem(item, itemFields, summary) {
    const byName = new Map(itemFields.map(field => [field.name, field]))
    const join = (names) => names
        .map(name => (byName.has(name) ? displayValue(byName.get(name), item?.[name]) : ''))
        .filter(Boolean)
        .join(' · ')

    if (summary) return { title: join(summary.title || []), subtitle: join(summary.subtitle || []) }

    const filled = itemFields.filter(field => displayValue(field, item?.[field.name]))
    return {
        title: filled[0] ? displayValue(filled[0], item[filled[0].name]) : '',
        subtitle: filled[1] ? displayValue(filled[1], item[filled[1].name]) : ''
    }
}

/**
 * Plain, deep copy of a field value for IndexedDB. Arrays/objects held in the
 * form are reactive Proxies (structured clone throws DataCloneError on them),
 * and an item list's rows are objects inside the array, so a shallow [...v]
 * isn't enough. Values are JSON-safe by contract (strings, arrays, plain objects).
 */
export function toPlainValue(value) {
    return value !== null && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value
}
