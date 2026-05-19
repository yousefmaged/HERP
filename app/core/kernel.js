/**
 * HERP Kernel — النواة المصغرة للنظام
 * 
 * المهام:
 * 1. تحميل وتنسيق المكونات (events, crypto, storage)
 * 2. توفير واجهة موحدة للوحدات
 * 3. إدارة دورة حياة النظام (start, stop)
 */

import { emit, subscribe, useMiddleware } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';
import { loadMasterKey, hasMasterKey, generateMasterKey } from '../crypto/key-manager.js';
import { loadEntity, saveEntity } from '../storage/adapters/local.adapter.js';

export class Kernel {
    constructor() {
        this.isReady = false;
        this.modules = new Map();  // moduleId → module instance
        this.setupMiddleware();
    }
    
    /**
     * إعداد middleware للأمان والتسجيل
     */
    setupMiddleware() {
        useMiddleware(async (event, next) => {
            console.log(`[Kernel] حدث وارد: ${event.name} من ${event.source || 'unknown'}`);
            // هنا سيتم إضافة guard.js لفحص الصلاحيات
            return next(event);
        });
    }
    
    /**
     * تهيئة النواة
     */
    async init() {
        console.log('[Kernel] بدء تهيئة النواة...');
        
        // 1. التحقق من وجود المفتاح السيادي
        let masterKey = null;
        if (hasMasterKey()) {
            masterKey = await loadMasterKey();
            console.log('[Kernel] تم تحميل المفتاح السيادي');
        } else {
            masterKey = await generateMasterKey();
            console.log('[Kernel] تم توليد مفتاح سيادي جديد');
        }
        this.masterKey = masterKey;
        
        // 2. استرجاع الهوية (إن وجدت)
        const identity = await loadEntity('system_identity');
        if (identity) {
            console.log(`[Kernel] مرحباً بعودتك، ${identity.entityName}`);
        }
        
        // 3. إطلاق حدث جاهزية النظام
        await emit({
            name: EVENT_TYPES.SYSTEM_READY,
            payload: { version: '0.1.0', timestamp: Date.now() },
            source: 'kernel'
        });
        
        this.isReady = true;
        console.log('[Kernel] النواة جاهزة');
    }
    
    /**
     * تسجيل وحدة جديدة
     * @param {string} moduleId
     * @param {Object} moduleInstance
     */
    registerModule(moduleId, moduleInstance) {
        this.modules.set(moduleId, moduleInstance);
        console.log(`[Kernel] تم تسجيل الوحدة: ${moduleId}`);
    }
    
    /**
     * الحصول على وحدة مسجلة
     * @param {string} moduleId
     * @returns {Object|null}
     */
    getModule(moduleId) {
        return this.modules.get(moduleId) || null;
    }
    
    /**
     * إيقاف النواة (تنظيف)
     */
    async shutdown() {
        await emit({
            name: EVENT_TYPES.SYSTEM_SHUTDOWN,
            payload: {},
            source: 'kernel'
        });
        this.isReady = false;
        console.log('[Kernel] تم إيقاف النظام');
    }
}
