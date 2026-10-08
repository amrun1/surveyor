// ============================================================================
// 1. DATABASE METADATA & CRYPTO CONSTANTS
// ============================================================================
const DB_NAME = 'SurveyorOfflineDB';
const DB_VERSION = 5; // v5: `photos` store (PhotoList Blobs)

// Secret corporate security passphrase seed (In production, derive this dynamically from user login session)
const SECRET_PASSPHRASE_SEED = 'Permata-Mortgage-Secure-Salt-2026';

// ============================================================================
// 2. HARDWARE-ACCELERATED ENCRYPTION KEY DERIVATION
// ============================================================================
/**
 * Derives a type-safe cryptographic key from a static passphrase seed token using PBKDF2
 * @returns {Promise<CryptoKey>}
 */
async function getCryptoKey() {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(SECRET_PASSPHRASE_SEED),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: enc.encode('MortgageSalt123!'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// ============================================================================
// 3. CORE DATABASE INITIALIZATION ENGINE
// ============================================================================
export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('dropdownOptions')) {
                db.createObjectStore('dropdownOptions', { keyPath: 'storeKey' });
            }
            if (!db.objectStoreNames.contains('drafts')) {
                db.createObjectStore('drafts', { keyPath: 'draftKey' });
            }
            if (!db.objectStoreNames.contains('session')) {
                db.createObjectStore('session', { keyPath: 'sessionKey' });
            }
            if (!db.objectStoreNames.contains('tasks')) {
                db.createObjectStore('tasks', { keyPath: 'cacheKey' });
            }
            if (!db.objectStoreNames.contains('photos')) {
                db.createObjectStore('photos', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            // Every openDB() call leaves its connection open. Without this, a
            // DB_VERSION bump (new deploy in another tab, or HMR in dev) is blocked
            // by those old connections and the upgrade waits forever.
            db.onversionchange = () => db.close();
            resolve(db);
        };
        request.onerror = (event) => reject(event.target.error);
        request.onblocked = () => console.warn(`${DB_NAME} upgrade to v${DB_VERSION} blocked by an open connection — close other tabs of this app.`);
    });
}

// ============================================================================
// 4. SECURE TRANSACTION UTILITIES (DATA AT REST ENCRYPTION)
// ============================================================================
/**
 * Encrypts mortgage appraisal payload data using AES-GCM before caching into IndexedDB.
 * @param {string} storeName - Target table name.
 * @param {Object} envelopeData - Object containing the payload and initial metadata states.
 */
export async function addRecord(storeName, envelopeData) {
    const db = await openDB();

    try {
        const key = await getCryptoKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Generate secure unique IV initialization vector
        const enc = new TextEncoder();

        // Stringify and encrypt raw technical data dictionary values (text, maps, base64 drawings)
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            enc.encode(JSON.stringify(envelopeData.payload))
        );

        // Pack encrypted parameters safely into storage structures matching corporate security logs policies
        const securePackage = {
            timestamp: envelopeData.timestamp || Date.now(),
            status: envelopeData.status || 'pending',
            iv: Array.from(iv), // Convert to standard array structure to allow serialization
            ciphertext: Array.from(new Uint8Array(encryptedBuffer))
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(securePackage);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Cryptographic write serialization pipeline failed:', err);
        throw err;
    }
}

/**
 * Retrieves records from database and automatically decrypts them back into transparent JSON objects.
 * @param {string} storeName - Target table name.
 * @returns {Promise<Array>} Decrypted records array ready for application consumption.
 */
export async function getAllRecords(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = async () => {
            try {
                const rawRows = request.result;
                const key = await getCryptoKey();
                const dec = new TextDecoder();

                const decryptedRows = [];
                for (const row of rawRows) {
                    // Fallback check: If row lacks encrypted properties parameters, treat as unencrypted legacy row
                    if (!row.ciphertext) {
                        decryptedRows.push(row);
                        continue;
                    }

                    const iv = new Uint8Array(row.iv);
                    const ciphertext = new Uint8Array(row.ciphertext);

                    const decryptedBuffer = await window.crypto.subtle.decrypt(
                        { name: 'AES-GCM', iv: iv },
                        key,
                        ciphertext
                    );

                    decryptedRows.push({
                        id: row.id,
                        timestamp: row.timestamp,
                        status: row.status,
                        payload: JSON.parse(dec.decode(decryptedBuffer))
                    });
                }
                resolve(decryptedRows);
            } catch (decErr) {
                console.error('Cryptographic read decipher pipeline failed:', decErr);
                reject(decErr);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Wipes out a structural data record row matching primary incremented IDs pointers keys.
 */
export async function deleteRecord(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ============================================================================
// 5. SERVICE OPTIONS CACHE MANAGEMENT LAYER
// ============================================================================
export async function cacheDropdownOptions(storeKey, optionsArray) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('dropdownOptions', 'readwrite');
        const store = transaction.objectStore('dropdownOptions');
        const request = store.put({ storeKey, data: optionsArray });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getCachedDropdownOptions(storeKey) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('dropdownOptions', 'readonly');
        const store = transaction.objectStore('dropdownOptions');
        const request = store.get(storeKey);
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => reject(request.error);
    });
}

// ============================================================================
// 6. IN-PROGRESS FORM DRAFTS (real autosave, not just a "Save draft" toast)
// ============================================================================
/**
 * Persists an in-progress form's field values, overwriting any previous draft
 * under the same key. Not encrypted like a submitted record — this is transient,
 * user-editable data, not a finalized appraisal payload.
 */
export async function saveDraft(draftKey, fieldsSnapshot) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('drafts', 'readwrite');
        const store = transaction.objectStore('drafts');
        const request = store.put({ draftKey, fieldsSnapshot, savedAt: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getDraft(draftKey) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('drafts', 'readonly');
        const store = transaction.objectStore('drafts');
        const request = store.get(draftKey);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteDraft(draftKey) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('drafts', 'readwrite');
        const store = transaction.objectStore('drafts');
        const request = store.delete(draftKey);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ============================================================================
// 7. AUTH SESSION (not localStorage — same reasoning as elsewhere in this file:
// a token in localStorage is readable by any injected script with no expiry
// enforcement; IndexedDB isn't safe from XSS either, but keeps the session
// alongside everything else this app already treats as sensitive, and lets a
// service worker read it directly for background-sync scenarios later.)
// ============================================================================
const SESSION_KEY = 'current';

export async function saveSession(session) {
    // session: { token, expiresAt, refreshToken? }
    console.log('Saving session to IndexedDB:', session)
    const db = await openDB();
    console.log('DB opened for session save:', db)
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('session', 'readwrite');
        const store = transaction.objectStore('session');
        const request = store.put({ sessionKey: SESSION_KEY, ...session });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getSession() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('session', 'readonly');
        const store = transaction.objectStore('session');
        const request = store.get(SESSION_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function clearSession() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('session', 'readwrite');
        const store = transaction.objectStore('session');
        const request = store.delete(SESSION_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ============================================================================
// 8. SURVEYOR TASK LIST CACHE (offline copy of POST /app-surveyor/find)
// ============================================================================
// The find endpoint is a POST, which the Cache API (and so Workbox runtime
// caching) can't store — the offline copy lives here instead. One row per
// userId so a shared device never shows another surveyor's queue, and the whole
// store is wiped on clearAuth(). Not encrypted, same reasoning as drafts: it's
// re-derivable from the server and replaced on every successful refresh.
export async function saveTaskCache(userId, tasks) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('tasks', 'readwrite');
        const store = transaction.objectStore('tasks');
        const request = store.put({ cacheKey: userId, tasks, fetchedAt: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getTaskCache(userId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('tasks', 'readonly');
        const store = transaction.objectStore('tasks');
        const request = store.get(userId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function clearTaskCache() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('tasks', 'readwrite');
        const store = transaction.objectStore('tasks');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ============================================================================
// 9. PHOTOS (PhotoList — stored as Blobs, referenced from form values by id)
// ============================================================================
// Photos live here as compressed JPEG Blobs, NOT inside the form value as base64:
// the form value only holds { photoId }, so the 600ms draft autosave stays tiny
// no matter how many photos a form has, and no huge strings are ever copied.
// Like drafts, these aren't encrypted (see §7 of CLAUDE.md for that trade-off).
// A submitted survey's syncQueue record references its photos by id — they must
// stay here until that record has been uploaded.

/** @param {{ id: string, blob: Blob, width?: number, height?: number }} photo */
export async function savePhoto(photo) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('photos', 'readwrite');
        const request = transaction.objectStore('photos').put({ ...photo, savedAt: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/** @returns {Promise<{ id, blob, width, height, savedAt } | undefined>} */
export async function getPhoto(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('photos', 'readonly');
        const request = transaction.objectStore('photos').get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function deletePhoto(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('photos', 'readwrite');
        const request = transaction.objectStore('photos').delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
