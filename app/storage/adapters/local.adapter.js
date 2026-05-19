/**
 * HERP Local Storage Adapter
 * 
 * - IndexedDB للبيانات الهيكلية (كيانات، إعدادات)
 * - File System Access API للملفات الكبيرة (صور، وثائق)
 */

const DB_NAME = 'herp';
const DB_VERSION = 1;
const STORE_NAME = 'entities';

let dbInstance = null;

/**
 * فتح قاعدة البيانات
 * @returns {Promise<IDBDatabase>}
 */
export async function openDatabase() {
    if (dbInstance) return dbInstance;
    
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
        };
        
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };
        
        request.onerror = () => reject(request.error);
    });
}

/**
 * حفظ كيان
 * @param {string} type
 * @param {string} id
 * @param {any} data
 */
export async function saveEntity(type, id, data) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const record = {
        id,
        type,
        data,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    return new Promise((resolve, reject) => {
        const request = store.put(record);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * استرجاع كيان
 * @param {string} id
 * @returns {Promise<any|null>}
 */
export async function loadEntity(id) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * استرجاع جميع الكيانات من نوع معين
 * @param {string} type
 * @returns {Promise<Array>}
 */
export async function loadEntitiesByType(type) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('type');
    
    return new Promise((resolve, reject) => {
        const request = index.getAll(type);
        request.onsuccess = () => resolve(request.result.map(r => r.data));
        request.onerror = () => reject(request.error);
    });
}

/**
 * حذف كيان
 * @param {string} id
 */
export async function deleteEntity(id) {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * حفظ ملف (عبر File System Access API — اختياري)
 * @param {File} file
 * @returns {Promise<string>} مسار الملف المحلي
 */
export async function saveFile(file) {
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: file.name,
                types: [{
                    description: file.type,
                    accept: { [file.type]: ['.' + file.name.split('.').pop()] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(file);
            await writable.close();
            return handle.name;
        } catch (err) {
            console.warn('[Storage] فشل حفظ الملف عبر File API:', err);
        }
    }
    // fallback: تخزين في IndexedDB كـ Blob
    const blobId = `blob_${Date.now()}_${file.name}`;
    await saveEntity('blob', blobId, {
        name: file.name,
        type: file.type,
        blob: file
    });
    return blobId;
}
