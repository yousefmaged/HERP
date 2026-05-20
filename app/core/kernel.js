/**
 * HERP Kernel — النواة المصغرة (الإصدار النهائي المتكامل)
 */

import { emit, useMiddleware } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';
import { initializeMiddleware } from '../events/middleware.js';
import { loadMasterKey, hasMasterKey, generateMasterKey } from '../crypto/key-manager.js';
import { openDatabase, loadEntity, saveEntity } from '../storage/adapters/local.adapter.js';
import { registerService, getService, registerModule } from './registry.js';
import { login, getCurrentSession, logout } from '../permissions/session-manager.js';
import { startAlertMonitoring } from './health/index.js';
import { createModuleSDK } from '../sdk/module-sdk.js';
import { navigateTo } from '../ui/router.js';
import { setUIState } from '../ui/state.js';
import { scheduleBackup } from '../../scripts/backup.js';

export class Kernel {
    constructor() {
        this.isReady = false;
        this.modules = new Map();
    }
    
    async init() {
        console.log('[Kernel] بدء تهيئة النواة المتكاملة...');
        
        // 1. تهيئة قاعدة البيانات
        await openDatabase();
        
        // 2. تهيئة الوسائط (guard, audit)
        initializeMiddleware();
        
        // 3. المفتاح السيادي
        let masterKey = null;
        if (hasMasterKey()) {
            masterKey = await loadMasterKey();
            console.log('[Kernel] تم تحميل المفتاح السيادي');
        } else {
            masterKey = await generateMasterKey();
            console.log('[Kernel] تم توليد مفتاح سيادي جديد');
        }
        this.masterKey = masterKey;
        registerService('crypto', { masterKey });
        
        // 4. استرجاع الهوية
        const identity = await loadEntity('system_identity');
        if (identity) {
            login(identity.userId || 'owner', identity.role || 'owner', {
                entityName: identity.entityName
            });
            console.log(`[Kernel] مرحباً ${identity.entityName}`);
        } else {
            // في أول استخدام، نوجه لشاشة إنشاء الهوية
            navigateTo('/identity');
        }
        
        // 5. بدء مراقبة الصحة
        startAlertMonitoring();
        
        // 6. جدولة النسخ الاحتياطي (كل 6 ساعات)
        setInterval(() => {
            scheduleBackup().catch(err => console.error('[Backup] فشل النسخ الاحتياطي:', err));
        }, 6 * 60 * 60 * 1000);
        
        // 7. إطلاق حدث الجاهزية
        await emit({
            name: EVENT_TYPES.SYSTEM_READY,
            payload: { version: '0.1.0', timestamp: Date.now() },
            source: 'kernel'
        });
        
        this.isReady = true;
        setUIState({ isLoading: false });
        console.log('[Kernel] النواة جاهزة ومتكاملة');
    }
    
    async shutdown() {
        await emit({
            name: EVENT_TYPES.SYSTEM_SHUTDOWN,
            payload: {},
            source: 'kernel'
        });
        logout();
        this.isReady = false;
        console.log('[Kernel] تم إيقاف النظام');
    }
    
    async installModule(moduleId, moduleUrl, moduleInfo) {
        try {
            const response = await fetch(moduleUrl);
            const code = await response.text();
            // تخزين الوحدة (سيتم في storage adapter)
            await saveEntity('module', moduleId, {
                id: moduleId,
                name: moduleInfo.name,
                code,
                installedAt: Date.now(),
                enabled: true
            });
            registerModule(moduleId, moduleInfo);
            console.log(`[Kernel] تم تثبيت الوحدة: ${moduleId}`);
            await emit({
                name: EVENT_TYPES.MODULE_INSTALLED,
                payload: { moduleId, name: moduleInfo.name },
                source: 'kernel'
            });
        } catch (err) {
            console.error(`[Kernel] فشل تثبيت الوحدة ${moduleId}:`, err);
            throw err;
        }
    }
}
