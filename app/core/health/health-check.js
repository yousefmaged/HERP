/**
 * HERP Health Check — فحص دوري لصحة النظام
 * 
 * يقيس:
 * - استخدام الذاكرة
 * - صحة قاعدة البيانات (IndexedDB)
 * - وجود المفتاح السيادي
 * - عدد الأحداث الفاشلة في DLQ
 */

import { openDatabase } from '../../storage/adapters/local.adapter.js';
import { hasMasterKey } from '../../crypto/key-manager.js';
import { getDeadLetterQueue } from '../../events/bus.js';

/**
 * إجراء فحص صحي كامل
 * @returns {Promise<Object>}
 */
export async function runHealthCheck() {
    const result = {
        status: 'healthy',
        timestamp: Date.now(),
        checks: {
            memory: { status: 'unknown', usage: null },
            indexedDB: { status: 'unknown' },
            masterKey: { status: 'unknown' },
            deadLetterQueue: { count: 0, status: 'ok' }
        }
    };
    
    // 1. فحص الذاكرة (إذا كان performance.memory متاحاً)
    if (performance.memory) {
        const usedMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        const limitMB = performance.memory.jsHeapSizeLimit / (1024 * 1024);
        result.checks.memory = {
            status: usedMB / limitMB < 0.9 ? 'healthy' : 'warning',
            usedMB: Math.round(usedMB),
            limitMB: Math.round(limitMB)
        };
    }
    
    // 2. فحص IndexedDB
    try {
        const db = await openDatabase();
        if (db) {
            result.checks.indexedDB = { status: 'healthy' };
        } else {
            result.checks.indexedDB = { status: 'error', message: 'فشل فتح قاعدة البيانات' };
            result.status = 'unhealthy';
        }
    } catch (err) {
        result.checks.indexedDB = { status: 'error', message: err.message };
        result.status = 'unhealthy';
    }
    
    // 3. فحص المفتاح السيادي
    if (hasMasterKey()) {
        result.checks.masterKey = { status: 'healthy' };
    } else {
        result.checks.masterKey = { status: 'warning', message: 'لا يوجد مفتاح سيادي (هوية غير مسجلة)' };
    }
    
    // 4. فحص DLQ
    const dlq = getDeadLetterQueue();
    result.checks.deadLetterQueue = {
        count: dlq.length,
        status: dlq.length > 10 ? 'warning' : 'ok'
    };
    if (dlq.length > 10) result.status = 'warning';
    
    return result;
}

/**
 * فحص سريع (خفيف) يُستخدم في middleware
 */
export async function quickHealthCheck() {
    const hasKey = hasMasterKey();
    return { ok: hasKey, timestamp: Date.now() };
}
