const DB_NAME = 'SurveyorOfflineDB';
const DB_VERSION = 1;

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

export async function addRecord(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllRecords(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
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