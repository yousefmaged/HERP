/**
 * HERP Alerting — نظام التنبيهات
 * 
 * يراقب مؤشرات الصحة ويرسل إشعارات في حالة:
 * - تجاوز الذاكرة حداً معيناً
 * - زيادة مفرطة في الأحداث الفاشلة
 * - فقدان المفتاح السيادي
 * - حدوث أخطاء متكررة
 */

import { runHealthCheck } from './health-check.js';
import { emit } from '../../events/bus.js';
import { EVENT_TYPES } from '../../events/event-types.js';

let lastAlertState = {};

/**
 * فحص التنبيهات وإرسالها
 * يُستدعى بشكل دوري (مثلاً كل 5 دقائق)
 */
export async function checkAlerts() {
    const health = await runHealthCheck();
    const alerts = [];
    
    // 1. تحذير الذاكرة
    if (health.checks.memory.status === 'warning') {
        alerts.push({
            severity: 'warning',
            title: 'استخدام ذاكرة مرتفع',
            message: `استخدام الذاكرة: ${health.checks.memory.usedMB}MB من ${health.checks.memory.limitMB}MB`
        });
    }
    
    // 2. خطأ في قاعدة البيانات
    if (health.checks.indexedDB.status === 'error') {
        alerts.push({
            severity: 'critical',
            title: 'فشل الاتصال بقاعدة البيانات',
            message: health.checks.indexedDB.message
        });
    }
    
    // 3. تحذير DLQ
    if (health.checks.deadLetterQueue.status === 'warning') {
        alerts.push({
            severity: 'warning',
            title: 'تراكم الأحداث الفاشلة',
            message: `${health.checks.deadLetterQueue.count} حدث في قائمة الانتظار`
        });
    }
    
    // 4. فقدان المفتاح
    if (health.checks.masterKey.status === 'warning' && lastAlertState.masterKey !== 'missing') {
        alerts.push({
            severity: 'info',
            title: 'لا يوجد مفتاح سيادي',
            message: 'يجب إنشاء هوية جديدة أو استعادة المفتاح'
        });
    }
    
    // إرسال التنبيهات الجديدة فقط (ليست متكررة)
    for (const alert of alerts) {
        const key = `${alert.severity}_${alert.title}`;
        if (lastAlertState[key] !== alert.message) {
            await emit({
                name: 'security.alert',
                payload: alert,
                source: 'alerting'
            });
            
            // إشعار داخلي في وحدة التحكم
            console.warn(`[ALERT] [${alert.severity}] ${alert.title}: ${alert.message}`);
            
            // يمكن إضافة إشعار عبر واجهة المستخدم أو بريد إلكتروني لاحقاً
        }
        lastAlertState[key] = alert.message;
    }
    
    // تحديث حالة المفتاح
    lastAlertState.masterKey = health.checks.masterKey.status;
}

/**
 * بدء المراقبة الدورية (خادم صغير)
 * @param {number} intervalMs
 */
export function startAlertMonitoring(intervalMs = 300000) { // 5 دقائق
    setInterval(checkAlerts, intervalMs);
    console.log(`[Alerting] بدء المراقبة الدورية (كل ${intervalMs / 1000} ثانية)`);
}
