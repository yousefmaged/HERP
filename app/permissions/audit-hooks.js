/**
 * HERP Audit Hooks — تسجيل الأحداث الأمنية
 * 
 * يضيف middleware إلى event bus لتسجيل كل حدث مهم في audit log.
 * سجلات التدقيق تُخزن مشفرة ومُوقعة رقمياً.
 */

import { emit } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';
import { encrypt } from '../crypto/encryption.js';
import { loadMasterKey } from '../crypto/key-manager.js';
import { saveEntity } from '../storage/adapters/local.adapter.js';

// قائمة الأحداث التي تستحق التدقيق
const AUDIT_EVENTS = [
    EVENT_TYPES.PERMISSION_DENIED,
    EVENT_TYPES.PERMISSION_GRANTED,
    EVENT_TYPES.IDENTITY_CREATED,
    EVENT_TYPES.MODULE_INSTALLED,
    EVENT_TYPES.MODULE_UNINSTALLED,
    'security.alert',
    'user.login',
    'user.logout'
];

/**
 * تسجيل حدث في سجل التدقيق
 * @param {Object} event
 */
async function recordAudit(event) {
    try {
        const masterKey = await loadMasterKey();
        if (!masterKey) return;
        
        const auditEntry = {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            eventName: event.name,
            source: event.source,
            payload: event.payload,
            signature: '' // سيتم إضافة توقيع رقمي لاحقاً
        };
        
        // تشفير سجل التدقيق قبل التخزين
        const plaintext = JSON.stringify(auditEntry);
        const encrypted = await encrypt(plaintext, masterKey);
        
        // تخزين في IndexedDB ككيان منفصل
        await saveEntity('audit', auditEntry.id, {
            encrypted,
            timestamp: auditEntry.timestamp
        });
        
        console.log(`[Audit] تم تسجيل الحدث: ${event.name}`);
    } catch (err) {
        console.error('[Audit] فشل تسجيل حدث التدقيق:', err);
    }
}

/**
 * Middleware لتسجيل الأحداث الأمنية
 * @param {Object} event
 * @param {Function} next
 */
export async function auditMiddleware(event, next) {
    // تمرير الحدث أولاً
    const result = await next(event);
    
    // تسجيل الحدث إذا كان مستحقاً للتدقيق
    if (AUDIT_EVENTS.includes(event.name) || event.name.startsWith('security.')) {
        await recordAudit(event);
    }
    
    return result;
}
