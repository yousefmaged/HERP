/**
 * HERP Event Types — ثوابت أنواع الأحداث
 * 
 * تستخدم في جميع أنحاء النظام لتوحيد أسماء الأحداث.
 */

export const EVENT_TYPES = {
    // أحداث النظام
    SYSTEM_READY: 'system.ready',
    SYSTEM_ERROR: 'system.error',
    SYSTEM_SHUTDOWN: 'system.shutdown',
    
    // أحداث الهوية والصلاحيات
    IDENTITY_CREATED: 'identity.created',
    IDENTITY_LOADED: 'identity.loaded',
    PERMISSION_DENIED: 'permission.denied',
    PERMISSION_GRANTED: 'permission.granted',
    
    // أحداث الوحدات
    MODULE_INSTALLED: 'module.installed',
    MODULE_UNINSTALLED: 'module.uninstalled',
    MODULE_ACTIVATED: 'module.activated',
    MODULE_DEACTIVATED: 'module.deactivated',
    
    // أحداث التخزين
    STORAGE_WRITE: 'storage.write',
    STORAGE_READ: 'storage.read',
    STORAGE_DELETE: 'storage.delete',
    
    // أحداث التشفير
    CRYPTO_KEY_GENERATED: 'crypto.key.generated',
    CRYPTO_KEY_LOADED: 'crypto.key.loaded',
    
    // أحداث الوكلاء (للمستقبل)
    AGENT_ACTION: 'agent.action',
    AGENT_RESULT: 'agent.result',
    
    // أحداث وحدات المعرفة (Scribe)
    PAGE_CREATED: 'page.created',
    PAGE_UPDATED: 'page.updated',
    PAGE_DELETED: 'page.deleted'
};
