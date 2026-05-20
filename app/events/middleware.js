/**
 * HERP Event Middleware — ربط الوسائط بناقل الأحداث
 * 
 * يقوم بتسجيل guard و audit middleware في event bus.
 */

import { useMiddleware } from './bus.js';
import { permissionMiddleware } from '../permissions/guard.js';
import { auditMiddleware } from '../permissions/audit-hooks.js';

/**
 * تهيئة جميع الوسائط المطلوبة للنظام
 */
export function initializeMiddleware() {
    // ترتيب التنفيذ مهم: guard أولاً (أمان)، ثم audit (تسجيل)
    useMiddleware(permissionMiddleware);
    useMiddleware(auditMiddleware);
    
    console.log('[Middleware] تم تهيئة وسائط الأمان والتدقيق');
}
