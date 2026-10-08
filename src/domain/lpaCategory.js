// Which LPA form a task needs, mirroring the legacy app's routing
// (app-valuer/view.jsp): the appraisal type wins first (RAB / RV / BV), then
// the asset category; anything else is Tanah & Bangunan.
//
// Works on the *mapped* task (domain/mappers.js mapTaskListResponse). The exact
// values the backend sends for jenisAppraisal / kategoriAktiva haven't been
// confirmed against real data yet — matching is keyword-based and
// case-insensitive, like the legacy `contains` checks.

export const LPA_CATEGORY = Object.freeze({
    TANAH_BANGUNAN: 'tanah-bangunan',
    KENDARAAN: 'kendaraan',
    MESIN: 'mesin',
    KAPAL: 'kapal',
    STOCK: 'stock',
    INSPEKSI: 'inspeksi',
    RAB: 'rab',
    RV: 'rv',
    BV: 'bv'
})

export const LPA_CATEGORY_LABEL = Object.freeze({
    [LPA_CATEGORY.TANAH_BANGUNAN]: 'Tanah & Bangunan',
    [LPA_CATEGORY.KENDARAAN]: 'Kendaraan',
    [LPA_CATEGORY.MESIN]: 'Mesin',
    [LPA_CATEGORY.KAPAL]: 'Kapal',
    [LPA_CATEGORY.STOCK]: 'Stock',
    [LPA_CATEGORY.INSPEKSI]: 'Inspeksi',
    [LPA_CATEGORY.RAB]: 'RAB',
    [LPA_CATEGORY.RV]: 'RV',
    [LPA_CATEGORY.BV]: 'BV'
})

const lower = (value) => String(value ?? '').toLowerCase()

/**
 * @param {Object} task - a mapped task row
 * @returns {{ category: string, isEksternal: boolean }}
 */
export function resolveLpaCategory(task) {
    const appraisalType = lower(task?.appraisalType)
    const assetText = `${lower(task?.assetCategory)} ${lower(task?.assetType)}`

    // Whole-word match for the short codes, so e.g. "rv" can't match inside another word.
    const appraisalCode = ['rab', 'rv', 'bv'].find(code => new RegExp(`\\b${code}\\b`).test(appraisalType))

    let category = LPA_CATEGORY.TANAH_BANGUNAN
    if (appraisalCode) category = appraisalCode
    else if (assetText.includes('kendaraan')) category = LPA_CATEGORY.KENDARAAN
    else if (assetText.includes('inspeksi')) category = LPA_CATEGORY.INSPEKSI
    else if (assetText.includes('stock')) category = LPA_CATEGORY.STOCK
    else if (assetText.includes('mesin')) category = LPA_CATEGORY.MESIN
    else if (assetText.includes('vessel') || assetText.includes('kapal')) category = LPA_CATEGORY.KAPAL

    // Legacy: fn:containsIgnoreCase(kategoriJenisAppraisal, 'eksternal').
    const isEksternal = lower(task?.appraisalCategory).includes('eksternal')

    return { category, isEksternal }
}
