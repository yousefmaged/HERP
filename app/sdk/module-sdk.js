/**
 * HERP Module SDK — واجهة تطوير الوحدات
 * 
 * تزود الوحدات بطرق آمنة للوصول إلى خدمات النواة:
 * - التخزين (قراءة/كتابة)
 * - الأحداث (بث/اشتراك)
 * - الصلاحيات (التحقق من الأذونات)
 * - التشفير
 */

import { emit, subscribe } from '../events/bus.js';
import { loadEntity, saveEntity, deleteEntity, loadEntitiesByType } from '../storage/adapters/local.adapter.js';
import { encrypt, decrypt } from '../crypto/encryption.js';
import { loadMasterKey } from '../crypto/key-manager.js';
import { hasPermission } from '../permissions/guard.js';

/**
 * إنشاء SDK لوحدة معينة
 * @param {string} moduleId
 * @param {string} sourceId (مثل 'user:123' أو 'agent:scribe')
 * @returns {Object}
 */
export async function createModuleSDK(moduleId, sourceId) {
    const masterKey = await loadMasterKey();
    
    return {
        // التخزين
        async save(key, data) {
            const encrypted = await encrypt(JSON.stringify(data), masterKey);
            await saveEntity(moduleId, key, encrypted);
        },
        
        async load(key) {
            const encrypted = await loadEntity(`${moduleId}_${key}`);
            if (!encrypted) return null;
            const decrypted = await decrypt(encrypted, masterKey);
            return JSON.parse(decrypted);
        },
        
        async delete(key) {
            await deleteEntity(`${moduleId}_${key}`);
        },
        
        async query(type) {
            const items = await loadEntitiesByType(moduleId);
            const results = [];
            for (const item of items) {
                const decrypted = await decrypt(item, masterKey);
                results.push(JSON.parse(decrypted));
            }
            return results;
        },
        
        // الأحداث
        emit(eventName, payload) {
            return emit({
                name: eventName,
                payload,
                source: `module:${moduleId}`
            });
        },
        
        on(eventName, handler) {
            subscribe(eventName, (event) => {
                if (event.source === `module:${moduleId}`) return;
                handler(event);
            });
        },
        /**
 * HERP Module SDK — دعم الهيكل المتكامل للوحدات
 */

export async function loadModuleStructure(moduleId) {
    const baseUrl = `/modules/${moduleId}/`;
    const manifest = await fetch(`${baseUrl}manifest.json`).then(r => r.json());
    const permissions = await fetch(`${baseUrl}permissions.json`).then(r => r.json());
    const events = await fetch(`${baseUrl}events.json`).then(r => r.json());
    const routes = await import(`${baseUrl}routes.js`).then(m => m.routes);
    const commands = await import(`${baseUrl}commands.js`).then(m => m.commands);
    const hooks = await import(`${baseUrl}hooks.js`).then(m => m.hooks);
    
    return { manifest, permissions, events, routes, commands, hooks };
}
        // الصلاحيات
        async can(permission) {
            return hasPermission(sourceId, permission);
        },
        
        // معلومات الوحدة
        getModuleId() {
            return moduleId;
        },
        
        getSourceId() {
            return sourceId;
        }
    };
}
        
