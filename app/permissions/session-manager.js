/**
 * HERP Session Manager — إدارة جلسات المستخدمين
 * 
 * يدعم:
 * - جلسات محلية (للمستخدم الفردي)
 * - جلسات مشتركة (للخادم المركزي لاحقاً)
 */

import { registerSession, terminateSession, updateActivity } from './guard.js';
import { ROLES } from './roles.js';
import { emit } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';

// الجلسة الحالية (للمستخدم الواحد في الوضع الفردي)
let currentSession = null;

/**
 * تسجيل دخول المستخدم
 * @param {string} userId
 * @param {string} role
 * @param {Object} extra
 */
export function login(userId, role = ROLES.MEMBER, extra = {}) {
    if (currentSession) {
        console.warn(`[Session] تسجيل خروج تلقائي للجلسة السابقة ${currentSession.userId}`);
        logout();
    }
    
    registerSession(userId, role, extra);
    currentSession = { userId, role, loginTime: Date.now(), ...extra };
    
    emit({
        name: EVENT_TYPES.IDENTITY_LOADED,
        payload: { userId, role, timestamp: Date.now() },
        source: `user:${userId}`
    }).catch(console.error);
    
    console.log(`[Session] مستخدم ${userId} مسجل الدخول بدور ${role}`);
}

/**
 * تسجيل خروج المستخدم
 */
export function logout() {
    if (!currentSession) return;
    
    const userId = currentSession.userId;
    terminateSession(userId);
    currentSession = null;
    
    emit({
        name: EVENT_TYPES.SYSTEM_SHUTDOWN,
        payload: { userId, timestamp: Date.now() },
        source: 'session-manager'
    }).catch(console.error);
    
    console.log(`[Session] مستخدم ${userId} سجل الخروج`);
}

/**
 * الحصول على الجلسة الحالية
 * @returns {Object|null}
 */
export function getCurrentSession() {
    return currentSession;
}

/**
 * التحقق من أن المستخدم الحالي لديه دور معين
 * @param {string} requiredRole
 * @returns {boolean}
 */
export function hasRole(requiredRole) {
    return currentSession?.role === requiredRole;
}

/**
 * تحديث آخر نشاط (يُستدعى عند كل حدث ناجح)
 */
export function touchSession() {
    if (currentSession) {
        updateActivity(currentSession.userId);
    }
}
