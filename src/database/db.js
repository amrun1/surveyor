// ============================================================================
// 1. DATABASE METADATA & CRYPTO CONSTANTS
// ============================================================================
const DB_NAME = 'SurveyorOfflineDB';
const DB_VERSION = 1;

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
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
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
