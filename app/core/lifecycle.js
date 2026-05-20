/**
 * HERP Lifecycle — دورة حياة التطبيق
 * 
 * تدير:
 * - مراحل الإقلاع المتسلسلة
 * - إيقاف آمن للخدمات
 * - إعادة تشغيل النظام بعد الأخطاء الحرجة
 */

import { transitionTo, getCurrentState, registerStateHooks } from './state-machine.js';
import { emit } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';
import { generateStatusReport } from './health/status-report.js';

/**
 * تهيئة دورة الحياة (تسجيل hooks)
 */
export function setupLifecycle() {
    registerStateHooks('booting', {
        onEnter: async () => {
            console.log('[Lifecycle] النظام في طور الإقلاع...');
        },
        onExit: async () => {}
    });
    
    registerStateHooks('ready', {
        onEnter: async () => {
            console.log('[Lifecycle] النظام جاهز للتشغيل');
        },
        onExit: async () => {}
    });
    
    registerStateHooks('error', {
        onEnter: async (context) => {
            console.error('[Lifecycle] دخل النظام في حالة خطأ:', context);
            await generateStatusReport();
        },
        onExit: async () => {}
    });
    
    registerStateHooks('shutdown', {
        onEnter: async () => {
            console.log('[Lifecycle] إيقاف النظام...');
            await emit({ name: EVENT_TYPES.SYSTEM_SHUTDOWN, payload: {}, source: 'lifecycle' });
        },
        onExit: async () => {}
    });
}

/**
 * إعادة تشغيل النظام (محاولة استرداد)
 */
export async function restart() {
    if (getCurrentState() === 'shutdown') {
        console.log('[Lifecycle] محاولة إعادة التشغيل...');
        await transitionTo('booting');
        // هنا يمكن إعادة استدعاء boot logic
    } else {
        throw new Error('لا يمكن إعادة التشغيل إلا من حالة shutdown');
    }
}
