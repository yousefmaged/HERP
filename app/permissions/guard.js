/**
 * HERP Guard – حارس البوابة (Middleware لـ Event Bus)
 */

import { hasMasterKey } from '../crypto/key-manager.js';

export async function guardMiddleware(event) {
    // التحقق الأساسي من وجود مفتاح سيادي (للحماية)
    if (!hasMasterKey() && event.name !== 'identity.created') {
        throw new Error('لم يتم إنشاء الهوية السيادية بعد');
    }
    // يمكن إضافة المزيد من الفحوصات لاحقاً (RBAC, ABAC)
    return true;
}
