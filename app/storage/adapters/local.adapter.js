/**
 * Local Storage Adapter – استخدام File System Access API أو IndexedDB
 */

class LocalStorageAdapter {
    constructor() {
        this.rootHandle = null;
        this.useIndexedDB = false;
    }
    
    async requestAccess() {
        if ('showDirectoryPicker' in window) {
            try {
                this.rootHandle = await window.showDirectoryPicker();
                this.useIndexedDB = false;
                return true;
            } catch (e) {
                this.useIndexedDB = true;
                return false;
            }
        } else {
            this.useIndexedDB = true;
            return false;
        }
    }
    
    async readFile(path) {
        if (this.useIndexedDB) return this._readIndexedDB(path);
        const handle = await this.rootHandle.getFileHandle(path, { create: false });
        const file = await handle.getFile();
        return await file.arrayBuffer();
    }
    
    async writeFile(path, data) {
        if (this.useIndexedDB) return this._writeIndexedDB(path, data);
        const handle = await this.rootHandle.getFileHandle(path, { create: true });
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
    }
    
    async listFiles(path) {
        if (this.useIndexedDB) return this._listIndexedDB(path);
        const dir = await this.rootHandle.getDirectoryHandle(path, { create: false });
        const files = [];
        for await (const entry of dir.values()) {
            if (entry.kind === 'file') files.push(entry.name);
        }
        return files;
    }
    
    async deleteFile(path) {
        if (this.useIndexedDB) return this._deleteIndexedDB(path);
        await this.rootHandle.removeEntry(path);
    }
    
    async createDirectory(path) {
        if (this.useIndexedDB) return;
        await this.rootHandle.getDirectoryHandle(path, { create: true });
    }
    
    // IndexedDB fallback (مبسط)
    async _getDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('HERP_Workspace', 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('files')) db.createObjectStore('files');
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    
    async _readIndexedDB(path) {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('files', 'readonly');
            const store = tx.objectStore('files');
            const req = store.get(path);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }
    
    async _writeIndexedDB(path, data) {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            const req = store.put(data, path);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
    
    async _listIndexedDB(path) {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('files', 'readonly');
            const store = tx.objectStore('files');
            const req = store.getAllKeys();
            req.onsuccess = () => resolve(req.result.filter(k => k.startsWith(path)));
            req.onerror = () => reject(req.error);
        });
    }
    
    async _deleteIndexedDB(path) {
        const db = await this._getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            const req = store.delete(path);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
}

export default LocalStorageAdapter;