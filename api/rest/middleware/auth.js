/**
 * HERP REST Auth Middleware — مصادقة طلبات API
 */

import { hasPermission } from '../../../app/permissions/guard.js';

export async function authenticate(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Unauthorized');
    // التحقق من التوكن (مبسط)
    return { userId: 'owner', role: 'owner' };
}

export async function authorize(req, requiredPermission) {
    const user = await authenticate(req);
    const allowed = await hasPermission(user.userId, requiredPermission);
    if (!allowed) throw new Error('Forbidden');
    return user;
}
