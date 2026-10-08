// Negative List & Pertimbangan Khusus — legacy lpa/form-pertimbangan-dan-negative.jsp
// (Kendaraan has an identical inline copy — reuse this with its own title).
// Real paths from fields-shared.md: listNegative, listPertimbangan.
// Each category has its own pair of parameter groups (options.js); T&B's is the
// default. `exclusiveNone` makes the list's own "Tidak Ada" row clear the other
// ticks (forms/index.js) — the honest answer that satisfies the required check.

export function negativeListTab({
  title = 'Negative List & Pertimbangan Khusus',
  negativeKey = 'NEGATIVE_LIST',
  pertimbanganKey = 'PROPERTI_PERTIMBANGAN'
} = {}) {
  return {
    title,
    fields: [
      { type: 'checkboxes', name: 'listNegative', label: 'Negative List', required: true, optionsKey: negativeKey, exclusiveNone: true, value: [] },
      { type: 'checkboxes', name: 'listPertimbangan', label: 'Pertimbangan Khusus', optionsKey: pertimbanganKey, exclusiveNone: true, value: [] }
    ]
  }
}
