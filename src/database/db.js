// ============================================================================
// 1. DATABASE METADATA & CRYPTO CONSTANTS
// ============================================================================
const DB_NAME = 'SurveyorOfflineDB';
const DB_VERSION = 2;

// Secret corporate security passphrase seed (In production, derive this dynamically from user login session)
const SECRET_PASSPHRASE_SEED = 'Permata-Mortgage-Secure-Salt-2026';

// ============================================================================
// 2. HARDWARE-ACCELERATED ENCRYPTION KEY DERIVATION
// ============================================================================
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
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// ============================================================================
// 4. SECURE TRANSACTION UTILITIES (DATA AT REST ENCRYPTION)
// ============================================================================
export async function addRecord(storeName, envelopeData) {
    const db = await openDB();

    try {
        const key = await getCryptoKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();

        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            enc.encode(JSON.stringify(envelopeData.payload))
        );

        const securePackage = {
            timestamp: envelopeData.timestamp || Date.now(),
            status: envelopeData.status || 'pending',
            iv: Array.from(iv),
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