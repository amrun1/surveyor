// Builds the survey formConfig for an LPA category.
//
// Each category (categories/*.js) is a list of tabs; shared tabs (Data Umum,
// Marketability, Negative List, …) live in fragments/*.js and are reused across
// categories. A tab is `{ title, fields: [fieldObjects] }` — the builder derives
// formConfig.tabs (numbered titles + field-name lists) and the flat
// formConfig.fields from that, so a field is declared exactly once and can't
// end up missing from its tab.
//
// To add a category: create categories/<category>.js (use the lpa-forms skill
// for its tabs and fields) and register it below.
import { LPA_CATEGORY } from '@/domain/lpaCategory.js'
import { emptyValueFor } from '@/components/inputs/itemList.js'
import { resolveOptions } from './options.js'
import { normalizeOptions } from '@/components/inputs/normalizeOptions.js'
import tanahBangunan from './categories/tanahBangunan.js'
import kendaraan from './categories/kendaraan.js'
import mesin from './categories/mesin.js'
import kapal from './categories/kapal.js'
import stock from './categories/stock.js'
import inspeksi from './categories/inspeksi.js'
import rab from './categories/rab.js'
import rv from './categories/rv.js'
import bv from './categories/bv.js'

const CATEGORY_DEFINITIONS = {
    [LPA_CATEGORY.TANAH_BANGUNAN]: tanahBangunan,
    [LPA_CATEGORY.KENDARAAN]: kendaraan,
    [LPA_CATEGORY.MESIN]: mesin,
    [LPA_CATEGORY.KAPAL]: kapal,
    [LPA_CATEGORY.STOCK]: stock,
    [LPA_CATEGORY.INSPEKSI]: inspeksi,
    [LPA_CATEGORY.RAB]: rab,
    [LPA_CATEGORY.RV]: rv,
    [LPA_CATEGORY.BV]: bv
}

export const isCategorySupported = (category) => category in CATEGORY_DEFINITIONS

/**
 * @param {string} category - an LPA_CATEGORY value
 * @param {{ isEksternal?: boolean }} options
 * @returns {Object|null} a fresh formConfig, or null if the category isn't built yet
 */
export function buildFormConfig(category, { isEksternal = false } = {}) {
    const definition = CATEGORY_DEFINITIONS[category]
    if (!definition) return null

    // Fresh objects on every call: Form.vue mutates field.value in place.
    const tabs = definition.tabs({ isEksternal }).filter(Boolean)

    const config = {
        category,
        isEksternal,
        // Surveyor LPA forms are sequential: a tab unlocks once the previous
        // tabs' required fields are filled (Form.vue isTabReachable).
        navigation: 'sequential',
        tabs: tabs.map((tab, idx) => ({
            title: `${idx + 1}. ${tab.title}`,
            fields: tab.fields.map(field => field.name)
        })),
        // Every input's v-model is a string, except the array-valued types
        // (`checkboxes`, `itemList`) — normalise any field declared without a value.
        fields: tabs.flatMap(tab => tab.fields.map(field => {
            const resolved = withOptions(field)
            return { ...resolved, value: resolved.value ?? emptyValueFor(resolved) }
        }))
    }

    if (import.meta.env.DEV) assertUniqueFieldNames(config)
    return config
}

// Fields name their option list (`optionsKey`) instead of carrying it, so every
// list lives in options.js. Resolved here, recursively for item/photo list rows.
// Form.vue and the inputs only ever see `options`.
function withOptions(field) {
    const { optionsKey, exclusiveNone, ...rest } = field
    const resolved = optionsKey ? { ...rest, options: resolveOptions(optionsKey) } : rest
    if (exclusiveNone) resolved.options = withExclusiveNone(resolved.options)
    if (resolved.itemFields) resolved.itemFields = resolved.itemFields.map(withOptions)
    return resolved
}

// `exclusiveNone` (checkbox lists): the honest "nothing applies" answer must
// clear the other ticks. Most DB negative/pertimbangan groups already have a
// "Tidak Ada" row — reuse it (its value is what legacy stores) and mark it
// exclusive; otherwise append one. Moved to the end either way: the DB sorts it
// first in some groups and mid-list in NEGATIVE_LIST, and it reads best last.
const NONE_LABEL = /^tidak ada$/i
function withExclusiveNone(options) {
    const normalized = normalizeOptions(options)
    const own = normalized.find(opt => NONE_LABEL.test(opt.label.trim()))
    const rest = normalized.filter(opt => opt !== own)
    return [...rest, { ...(own || { value: 'TIDAK_ADA', label: 'Tidak ada' }), exclusive: true }]
}

// Field names are the lookup key for tabs, visibleIf, drafts and error
// scrolling — a duplicate silently breaks all of them, so fail loudly in dev.
function assertUniqueFieldNames(config) {
    const seen = new Set()
    for (const { name } of config.fields) {
        if (seen.has(name)) throw new Error(`formConfig for "${config.category}" declares field "${name}" more than once`)
        seen.add(name)
    }
}
