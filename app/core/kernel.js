/**
 * HERP Kernel — النواة المصغرة للنظام (الإصدار الكامل)
 * المسؤوليات: إدارة الوحدات، توجيه الأحداث، ربط المكونات.
 */

import { emit, subscribe } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';
import { loadModules, saveModule } from '../storage/adapters/local.adapter.js';
import { loadModuleStructure } from '../sdk/module-sdk.js';

export class Kernel {
    constructor() {
        this.modules = new Map();      // moduleId → module info
        this.isReady = false;
    }

    /**
     * تهيئة النواة
     */
    async init() {
        console.log('[Kernel] تهيئة النواة...');
        // تحميل الوحدات المثبتة مسبقاً من قاعدة البيانات
        const installed = await loadModules();
        for (const mod of installed) {
            if (mod.enabled) {
                this.modules.set(mod.id, mod);
                console.log(`[Kernel] تم تحميل الوحدة المخزنة: ${mod.name}`);
            }
        }
        this.isReady = true;
        await emit({ name: EVENT_TYPES.SYSTEM_READY, payload: { version: '0.1.0' }, source: 'kernel' });
        console.log('[Kernel] النواة جاهزة');
        return true;
    }

    /**
     * تسجيل وحدة جديدة (بعد تثبيتها)
     * @param {string} moduleId 
     * @param {object} moduleInfo 
     */
    registerModule(moduleId, moduleInfo) {
        this.modules.set(moduleId, moduleInfo);
        console.log(`[Kernel] تم تسجيل الوحدة: ${moduleId}`);
        emit({ name: EVENT_TYPES.MODULE_INSTALLED, payload: moduleInfo, source: 'kernel' }).catch(console.error);
    }

    /**
     * تحميل هيكل وحدة من ملفاتها وتثبيتها
     * @param {string} moduleId 
     */
    async registerModuleFromStructure(moduleId) {
        try {
            const structure = await loadModuleStructure(moduleId);
            const { manifest, permissions, events, routes, commands, hooks } = structure;
            
            // حفظ الوحدة في قاعدة البيانات
            await saveModule({
                id: moduleId,
                name: manifest.name,
                version: manifest.version,
                enabled: true,
                installedAt: Date.now(),
                manifest,
                permissions,
                events,
                routes,
                commands,
                hooks
            });
            
            this.registerModule(moduleId, { name: manifest.name, icon: manifest.icon, description: manifest.description });
            
            // استدعاء hooks.onLoad إذا وجد
            if (hooks && hooks.onLoad) {
                // إنشاء SDK مبسط للوحدة (يمكن توسيعه لاحقاً)
                const sdk = {
                    emit: (name, payload) => emit({ name, payload, source: `module:${moduleId}` }),
                    on: (name, handler) => subscribe(name, handler)
                };
                await hooks.onLoad(sdk);
            }
            return true;
        } catch (err) {
            console.error(`[Kernel] فشل تسجيل الوحدة ${moduleId}:`, err);
            return false;
        }
    }

    /**
     * الحصول على قائمة الوحدات المسجلة (للواجهة)
     */
    getModules() {
        return Array.from(this.modules.entries()).map(([id, info]) => ({
            id,
            name: info.name,
            icon: info.icon || '📦',
            description: info.description || ''
        }));
    }
}
