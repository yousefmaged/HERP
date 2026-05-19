/**
 * HERP Guard — بوابة الأمن المركزية
 * 
 * تعترض كل حدث يتم بثه في Event Bus وتقرر:
 * - السماح (allow)
 * - الرفض (deny) مع تسجيل السبب
 * 
 * تعمل كـ middleware في event bus.
 */

import { ROLES, getPermissionsForRole } from './roles.js';
import { evaluateRule } from './rule-engine.js';
import { emit } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';

// ذاكرة مؤقتة للجلسات النشطة (userId -> session info)
const activeSessions = new Map();

// قائمة سوداء للمستخدمين الموقوفين مؤقتاً
const blacklist = new Set();

/**
 * تسجيل جلسة مستخدم جديدة
 * @param {string} userId
 * @param {string} role
 * @param {Object} metadata
 */
export function registerSession(userId, role, metadata = {}) {
    activeSessions.set(userId, {
        role,
        permissions: getPermissionsForRole(role),
        loginTime: Date.now(),
        lastActivity: Date.now(),
        ...metadata
    });
}

/**
 * تحديث آخر نشاط للمستخدم
 * @param {string} userId
 */
export function updateActivity(userId) {
    const session = activeSessions.get(userId);
    if (session) {
        session.lastActivity = Date.now();
    }
}

/**
 * إنهاء جلسة مستخدم
 * @param {string} userId
 */
export function terminateSession(userId) {
    activeSessions.delete(userId);
}

/**
 * إيقاف مستخدم مؤقتاً (إضافة إلى القائمة السوداء)
 * @param {string} userId
 * @param {number} durationMs
 */
export function suspendUser(userId, durationMs = 300000) { // 5 دقائق افتراضياً
    blacklist.add(userId);
    setTimeout(() => {
        blacklist.delete(userId);
        console.log(`[Guard] تم رفع الإيقاف عن المستخدم ${userId}`);
    }, durationMs);
}

/**
 * التحقق من أن المستخدم لديه صلاحية معينة
 * @param {string} userId
 * @param {string} requiredPermission (مثل 'finance:write')
 * @returns {Promise<boolean>}
 */
export async function hasPermission(userId, requiredPermission) {
    // 1. التحقق من القائمة السوداء
    if (blacklist.has(userId)) {
        console.warn(`[Guard] مستخدم ${userId} موقوف مؤقتاً`);
        return false;
    }
    
    // 2. التحقق من الجلسة النشطة
    const session = activeSessions.get(userId);
    if (!session) {
        console.warn(`[Guard] لا توجد جلسة نشطة للمستخدم ${userId}`);
        return false;
    }
    
    // 3. التحقق من الصلاحية
    const permissions = session.permissions;
    
    // صلاحية النظام الكامل (*) تمنح الوصول لكل شيء
    if (permissions.includes('system:*') || permissions.includes('*')) {
        return true;
    }
    
    // فحص مطابقة تامة
    if (permissions.includes(requiredPermission)) {
        return true;
    }
    
    // فحص wildcard مثل 'finance:*'
    const [module, action] = requiredPermission.split(':');
    if (permissions.includes(`${module}:*`)) {
        return true;
    }
    
    return false;
}

/**
 * Middleware مخصص لـ event bus — يفحص كل حدث قبل تمريره
 * @param {Object} event
 * @param {Function} next
 * @returns {Promise<Object>}
 */
export async function permissionMiddleware(event, next) {
    const { name, source, payload } = event;
    
    // تحديد المستخدم المرسل من source (يتوقع بصيغة 'user:123' أو 'agent:scribe')
    let userId = null;
    let isAgent = false;
    
    if (source && source.startsWith('user:')) {
        userId = source.substring(5);
    } else if (source && source.startsWith('agent:')) {
        userId = source.substring(6);
        isAgent = true;
    } else {
        // إذا لم نتعرف على المصدر، نسمح مؤقتاً (للتشغيل التجريبي)
        console.warn(`[Guard] مصدر غير معروف: ${source} — يتم السماح مؤقتاً`);
        return next(event);
    }
    
    // تحويل اسم الحدث إلى صلاحية مطلوبة (مثلاً 'module.install' → 'module:install')
    const requiredPermission = name.replace(/\./g, ':');
    
    const hasPerm = await hasPermission(userId, requiredPermission);
    
    if (!hasPerm) {
        console.warn(`[Guard] رفض الحدث ${name} من ${source} — صلاحية ${requiredPermission} غير متوفرة`);
        
        // إطلاق حدث رفض الصلاحية للتسجيل والإشعار
        await emit({
            name: EVENT_TYPES.PERMISSION_DENIED,
            payload: {
                userId,
                eventName: name,
                requiredPermission,
                timestamp: Date.now()
            },
            source: 'guard'
        });
        
        // لا نمرر الحدث الأصلي
        throw new Error(`غير مصرح: ${requiredPermission}`);
    }
    
    // تحديث آخر نشاط
    if (userId && !isAgent) {
        updateActivity(userId);
    }
    
    return next(event);
}
