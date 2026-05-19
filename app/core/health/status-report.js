/**
 * HERP Status Report — تقرير حالة النظام
 * 
 * يجمع معلومات عن:
 * - إصدار النظام
 * - الوحدات المثبتة
 * - الأحداث الأخيرة
 * - سجلات التدقيق (ملخصة)
 */

import { runHealthCheck } from './health-check.js';
import { loadModules } from '../../storage/adapters/local.adapter.js';
import { getEventHistory } from '../../events/bus.js';
import { getCurrentSession } from '../../permissions/session-manager.js';

/**
 * توليد تقرير الحالة الكامل
 * @returns {Promise<Object>}
 */
export async function generateStatusReport() {
    const health = await runHealthCheck();
    const modules = await loadModules();
    const recentEvents = getEventHistory().slice(0, 20);
    const session = getCurrentSession();
    
    return {
        generatedAt: Date.now(),
        version: '0.1.0',
        health,
        session: session ? {
            userId: session.userId,
            role: session.role,
            loginTime: session.loginTime
        } : null,
        modules: modules.map(m => ({
            id: m.id,
            name: m.name,
            installedAt: m.installedAt,
            enabled: m.enabled
        })),
        recentEvents: recentEvents.map(e => ({
            name: e.name,
            source: e.source,
            timestamp: e.timestamp
        })),
        summary: {
            totalModules: modules.length,
            activeSession: !!session,
            healthStatus: health.status
        }
    };
}

/**
 * تصدير التقرير كملف JSON (للمستخدم)
 */
export async function exportStatusReport() {
    const report = await generateStatusReport();
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `herp-status-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
