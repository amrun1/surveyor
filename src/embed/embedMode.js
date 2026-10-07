// Embedded mode: /surveyor-mapper loaded inside another application's iframe,
// which provides the session over postMessage (see bridge.js and
// docs/embed-contract.md). Decided once at load — it can't change for the life
// of the page.
//
// In embedded mode the app is a separate, memory-only runtime: it never reads
// or writes the shared IndexedDB session (a same-origin parent would otherwise
// overwrite or wipe the standalone app's session in other tabs), never runs
// the surveyor sync queue, and never navigates away from /surveyor-mapper.

const EMBED_PATH = `${import.meta.env.BASE_URL}surveyor-mapper`

export const isEmbedded = window.self !== window.top && location.pathname.startsWith(EMBED_PATH)

// Origins allowed to embed this page and send it a session. Build-time config
// (.env.development / .env.production), comma-separated, exact origins only —
// e.g. "https://appraisal.example.co.id,https://appraisal-uat.example.co.id".
export const PARENT_ORIGINS = (import.meta.env.VITE_EMBED_PARENT_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
