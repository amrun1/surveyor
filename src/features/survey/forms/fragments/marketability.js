// Marketability & Catatan — legacy lpa/form-market.jsp (and form-market-stock.jsp
// via `variant: 'stock'`). Real paths from fields-shared.md.

/**
 * @param {{ isEksternal?: boolean, variant?: 'standard' | 'stock', eksternalCatatan?: boolean, title?: string,
 *   marketabilityKey?: string, unmarketabilityKey?: string }} options
 *   marketabilityKey / unmarketabilityKey — the category's parameter groups (options.js);
 *                        defaults are T&B's, e.g. Mesin passes MESIN_FAKTOR_*.
 *   variant 'stock'    — form-market-stock.jsp: no Pembanding, no Eksternal catatan.
 *   eksternalCatatan   — include catatanKewajaranNil / catatanKesesuaian (Eksternal only).
 *                        Defaults to isEksternal; Kendaraan's inline tab passes false.
 */
export function marketabilityTab({
  isEksternal = false, variant = 'standard', eksternalCatatan = isEksternal, title = 'Marketability & Catatan',
  marketabilityKey = 'FAKTOR_MARKETABILITY', unmarketabilityKey = 'FAKTOR_UNMARKETABILITY'
} = {}) {
  const fields = [
    { type: 'radio', name: 'faktorMarketability', label: 'Faktor Marketability', optionsKey: marketabilityKey },
    { type: 'select', name: 'faktorMarketCatatan', label: 'Faktor Marketability (catatan)', placeholder: '-- Select --', optionsKey: unmarketabilityKey },
    { type: 'textarea', name: 'catatanPoint', label: 'Catatan yang Perlu Diperhatikan', placeholder: 'Maks. 750 karakter' },
    { type: 'textarea', name: 'positifPoint', label: 'Positive Point' }
  ]
  if (variant !== 'stock') {
    fields.push(
      { type: 'text', name: 'pembanding1', label: 'Data Pembanding 1', section: 'Data Pembanding' },
      { type: 'text', name: 'pembanding2', label: 'Data Pembanding 2', section: 'Data Pembanding' },
      { type: 'text', name: 'pembanding3', label: 'Data Pembanding 3', section: 'Data Pembanding' }
    )
    if (eksternalCatatan) {
      fields.push(
        { type: 'select', name: 'catatanKewajaranNil', label: 'Catatan Kewajaran Nilai', section: 'Catatan Eksternal', placeholder: '-- Select --', optionsKey: 'CATATAN_KEWAJARAN' },
        { type: 'select', name: 'catatanKesesuaian', label: 'Catatan Kesesuaian Laporan dengan dokumen dan Keterangan lainnya', section: 'Catatan Eksternal', placeholder: '-- Select --', optionsKey: 'CATATAN_KESESUAIAN' }
      )
    }
  }
  return { title, fields }
}
