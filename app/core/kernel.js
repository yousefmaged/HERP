/**
 * HERP Kernel – النواة المصغرة للنظام
 * 
 * إدارة دورة الحياة، تسجيل الوحدات، توفير وصول آمن للتخزين والأحداث.
 */

import eventBus from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';
import vfs from '../storage/vfs.js';
import { openDatabase, query, execute, transaction } from '../storage/sqlite.js';

class HERPKernel {
    constructor() {
        this.status = 'initializing';
        this.modules = new Map();
        this.db = null;
    }

    setDatabase(db) {
        this.db = db;
    }

    async init() {
        console.log('[Kernel] بدء التهيئة...');
        try {
            // تحقق من إعدادات workspace
            const hasSettings = await vfs.exists('config/system.json');
            if (!hasSettings) {
                const defaultSettings = JSON.stringify({ version: '0.1', theme: 'dark', created: Date.now() });
                await vfs.writeFile('config/system.json', defaultSettings);
            }
            
            this.status = 'ready';
            await eventBus.emit(EVENT_TYPES.SYSTEM_READY, { status: 'ready' }, { source: 'kernel' });
            console.log('[Kernel] جاهز');
        } catch (err) {
            this.status = 'error';
            await eventBus.emit(EVENT_TYPES.SYSTEM_ERROR, { error: err.message }, { source: 'kernel' });
            throw err;
        }
    }

    registerModule(moduleId, api) {
        if (this.modules.has(moduleId)) {
            console.warn(`[Kernel] الوحدة ${moduleId} مسجلة مسبقاً، سيتم استبدالها.`);
        }
        this.modules.set(moduleId, api);
        console.log(`[Kernel] تم تسجيل الوحدة: ${moduleId}`);
        eventBus.emit(EVENT_TYPES.MODULE_INSTALLED, { moduleId }, { source: 'kernel' });
    }

    getModule(moduleId) {
        return this.modules.get(moduleId) || null;
    }

    async query(sql, params = []) {
        if (this.status !== 'ready') throw new Error('النظام غير جاهز');
        return query(this.db, sql, params);
    }

    async execute(sql, params = []) {
        if (this.status !== 'ready') throw new Error('النظام غير جاهز');
        return execute(this.db, sql, params);
    }

    async transaction(callback) {
        if (this.status !== 'ready') throw new Error('النظام غير جاهز');
        return transaction(this.db, callback);
    }

    async shutdown() {
        this.status = 'shutdown';
        await eventBus.emit(EVENT_TYPES.SYSTEM_SHUTDOWN, {}, { source: 'kernel' });
        this.modules.clear();
        console.log('[Kernel] تم الإيقاف');
    }
}

export default new HERPKernel();