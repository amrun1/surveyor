// Number masks for NumberInput.vue / ReadOnlyField.vue — the Vue equivalents of
// the legacy JSP `data-mask` values (web/js/main-app.js), shown in Indonesian
// format (1.250.000,50).
//
// Value contract: a field's value is always the CANONICAL string — no grouping,
// '.' as the decimal point, optional leading '-' for signed masks, '' when empty
// (e.g. '1250000.5'). Display formatting exists only on screen; drafts, required
// checks, the sync payload and mappers.js only ever see canonical values.
//
// Transient canonical states while typing: a trailing '.' ('1250.') right after
// the decimal key, and a lone '-' after the ± toggle. NumberInput cleans both up on blur.

const GROUP_SEP = '.'
const DECIMAL_SEP = ','

export const MASKS = Object.freeze({
    currency: { decimals: 0, grouping: true, min: 0, signed: false, inputmode: 'numeric' },
    'luas-tanah': { decimals: 2, grouping: true, min: 0, signed: false, inputmode: 'decimal' },
    numeric: { decimals: 2, grouping: false, min: 0, signed: false, inputmode: 'decimal' },
    integer: { decimals: 0, grouping: false, min: 0, signed: false, inputmode: 'numeric' },
    // Plain digits (years, counts typed as-is) — leading zeros are kept.
    number: { decimals: 0, grouping: false, signed: false, keepLeadingZeros: true, inputmode: 'numeric' },
    persen: { decimals: 2, grouping: false, min: 0, max: 100, signed: false, inputmode: 'decimal', suffix: '%' },
    devisiasi: { decimals: 2, grouping: false, signed: true, inputmode: 'decimal' }
})

export const DEFAULT_MASK = 'luas-tanah'

export const getMask = (name) => MASKS[name] ?? MASKS[DEFAULT_MASK]

/**
 * Text that is already in our display format (dots = grouping, comma = decimal)
 * → canonical-ish (may still need normalizeNumber).
 */
export function parseDisplay(text) {
    return String(text ?? '').replace(/[^\d,-]/g, '').replace(/,/g, '.')
}

/**
 * Text of unknown format — pasted, or a value saved before masking existed:
 * 'Rp 1.250.000', '1,250,000.50', '1.5', '12,5'. Where both separators appear the
 * last one is the decimal point; a separator that repeats is grouping; a single
 * comma is a decimal (Indonesian), a single dot is grouping only when exactly
 * three digits follow it ('1.250' = 1250, '1.5' = 1.5).
 */
export function parseLoose(text) {
    const t = String(text ?? '').replace(/[^\d.,-]/g, '')
    const lastDot = t.lastIndexOf('.')
    const lastComma = t.lastIndexOf(',')

    let decimalSep = null
    if (lastDot !== -1 && lastComma !== -1) {
        decimalSep = lastDot > lastComma ? '.' : ','
    } else if (lastComma !== -1) {
        decimalSep = t.split(',').length > 2 ? null : ','
    } else if (lastDot !== -1) {
        const parts = t.split('.')
        decimalSep = parts.length > 2 || parts[1].length === 3 ? null : '.'
    }

    if (decimalSep === null) return t.replace(/[.,]/g, '')
    const idx = t.lastIndexOf(decimalSep)
    return `${t.slice(0, idx).replace(/[.,]/g, '')}.${t.slice(idx + 1).replace(/[.,]/g, '')}`
}

/**
 * Canonical-ish string → canonical for this mask: one decimal point at most,
 * decimals truncated to the mask's limit (a 3rd decimal simply isn't accepted),
 * sign only for signed masks, leading zeros dropped (except `number`).
 */
export function normalizeNumber(text, mask, { maxDigits } = {}) {
    const str = String(text ?? '')
    const negative = mask.signed && str.includes('-')
    const digitsAndDot = str.replace(/[^\d.]/g, '')

    const dotIdx = digitsAndDot.indexOf('.')
    let int = dotIdx === -1 ? digitsAndDot : digitsAndDot.slice(0, dotIdx)
    let frac = dotIdx === -1 || !mask.decimals ? null : digitsAndDot.slice(dotIdx + 1).replace(/\./g, '').slice(0, mask.decimals)

    if (!mask.keepLeadingZeros) int = int.replace(/^0+(?=\d)/, '')
    if (maxDigits) int = int.slice(0, Number(maxDigits))
    if (int === '' && frac !== null) int = '0'
    if (int === '' && frac === null) return negative ? '-' : ''

    return `${negative ? '-' : ''}${int}${frac !== null ? `.${frac}` : ''}`
}

/** Any input (pasted, legacy, canonical) → canonical for the given mask name. */
export function sanitizeInput(text, maskName, options) {
    return normalizeNumber(parseLoose(text), getMask(maskName), options)
}

/** Canonical → what the user sees: '1250000.5' → '1.250.000,5' (grouping only if the mask groups). */
export function formatForDisplay(canonical, maskName) {
    if (!canonical) return ''
    const mask = getMask(maskName)
    const negative = canonical.startsWith('-')
    const [int = '', frac] = (negative ? canonical.slice(1) : canonical).split('.')
    const shownInt = mask.grouping ? int.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEP) : int
    return `${negative ? '-' : ''}${shownInt}${frac !== undefined ? DECIMAL_SEP + frac : ''}`
}

/** Bounds check (run on blur, never while typing). Returns a message or null. */
export function checkBounds(canonical, maskName) {
    if (!canonical || canonical === '-') return null
    const mask = getMask(maskName)
    const value = Number(canonical)
    if (Number.isNaN(value)) return null
    if (mask.min !== undefined && value < mask.min) return `Minimal ${formatForDisplay(String(mask.min), maskName)}`
    if (mask.max !== undefined && value > mask.max) return `Maksimal ${formatForDisplay(String(mask.max), maskName)}`
    return null
}

const MAGNITUDES = [
    [1e12, 'triliun'],
    [1e9, 'miliar'],
    [1e6, 'juta']
]
const magnitudeFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

/**
 * Spoken-style magnitude for big amounts — '1250000000' → '1,25 miliar' — so a
 * missing or extra zero is obvious at a glance. null below one million.
 */
export function describeMagnitude(canonical) {
    const value = Number(canonical)
    if (!canonical || Number.isNaN(value)) return null
    const abs = Math.abs(value)
    const match = MAGNITUDES.find(([unit]) => abs >= unit)
    if (!match) return null
    const [unit, name] = match
    return `${value < 0 ? '-' : ''}${magnitudeFormat.format(abs / unit)} ${name}`
}

/**
 * One edit of the field → new canonical value, display text and caret position.
 * Works by diffing the field's new text against what was last displayed:
 *   - untouched text is our own display format (dots = grouping, comma = decimal);
 *   - a single typed '.' or ',' is the decimal key — Indonesian-locale keyboards
 *     type ',', English-locale ones '.', both must work. It's ignored when the mask
 *     has no decimals or the number already has one (otherwise '12|50' + ',' on a
 *     currency field would drop everything after the caret as a "fraction");
 *   - a multi-character insert is a paste of unknown format → parseLoose.
 *
 * @param {{ prev: string, raw: string, caret: number, inputType?: string }} edit
 *   prev = text displayed before the edit, raw = the field's text now,
 *   caret = selectionStart now, inputType = InputEvent.inputType
 * @returns {{ canonical: string, display: string, caret: number }}
 */
export function applyEdit({ prev, raw, caret, inputType }, maskName, options) {
    const mask = getMask(maskName)

    let start = 0
    while (start < prev.length && start < raw.length && prev[start] === raw[start]) start++
    let endPrev = prev.length
    let endRaw = raw.length
    while (endPrev > start && endRaw > start && prev[endPrev - 1] === raw[endRaw - 1]) { endPrev--; endRaw-- }

    const inserted = raw.slice(start, endRaw)
    const removed = prev.slice(start, endPrev)
    let head = prev.slice(0, start)
    let tail = prev.slice(endPrev)
    let digitsBefore = (raw.slice(0, caret).match(/\d/g) || []).length

    // Deleting only a grouping dot would be undone by re-grouping (the key would
    // seem dead) — delete the neighbouring digit instead, like a native editor.
    if (!inserted && removed === GROUP_SEP) {
        if (inputType === 'deleteContentForward') {
            tail = tail.replace(/\d/, '')
        } else {
            head = head.replace(/\d(?=\D*$)/, '')
            digitsBefore = Math.max(0, digitsBefore - 1)
        }
    }

    const isDecimalKey = inserted.length === 1 && /[.,]/.test(inserted)
    const ignoreDecimalKey = isDecimalKey && (!mask.decimals || (head + tail).includes(DECIMAL_SEP))
    const insertedPart = ignoreDecimalKey ? ''
        : inserted.length > 1 ? parseLoose(inserted)
        : inserted.replace(',', '.')

    const canonical = normalizeNumber(parseDisplay(head) + insertedPart + parseDisplay(tail), mask, options)
    const display = formatForDisplay(canonical, maskName)

    // Caret goes back after the same number of digits it followed before the
    // reformat, so typing in the middle of '1.250.000' doesn't jump to the end.
    // If a keystroke was rejected (3rd decimal, digit past maxlength) there are
    // fewer digits than before — the caret then stays at the end.
    let pos = display.startsWith('-') ? 1 : 0
    if (digitsBefore > 0) {
        pos = display.length
        let seen = 0
        for (let i = 0; i < display.length; i++) {
            if (/\d/.test(display[i]) && ++seen === digitsBefore) { pos = i + 1; break }
        }
    }
    if (isDecimalKey && !ignoreDecimalKey && display[pos] === DECIMAL_SEP) pos++

    return { canonical, display, caret: pos }
}
