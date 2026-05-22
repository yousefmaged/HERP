/**
 * HERP Virtual File System – واجهة موحدة للتخزين
 */

class HERPVFS {
    constructor() {
        this.adapter = null;
    }
    
    setAdapter(adapter) {
        this.adapter = adapter;
    }
    
    async readFile(path) { return this.adapter.readFile(path); }
    async writeFile(path, data) { return this.adapter.writeFile(path, data); }
    async listFiles(path) { return this.adapter.listFiles(path); }
    async deleteFile(path) { return this.adapter.deleteFile(path); }
    async exists(path) {
        try { await this.readFile(path); return true; } catch { return false; }
    }
    async createDirectory(path) {
        if (this.adapter.createDirectory) return this.adapter.createDirectory(path);
    }
}

export default new HERPVFS();