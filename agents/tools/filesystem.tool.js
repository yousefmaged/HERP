/**
 * HERP Tool: FileSystem — أداة للتعامل مع نظام الملفات
 * 
 * مسموحة فقط للوكلاء المصرح لهم.
 */

import { canExecute } from '../runtime/permissions-bridge.js';

export async function readFile(agentId, path) {
    if (!canExecute(agentId, 'filesystem:read')) throw new Error('غير مصرح');
    // محاكاة قراءة ملف (سيتم ربطه بـ OpenClaw لاحقاً)
    return `محاكاة قراءة ملف: ${path}`;
}

export async function writeFile(agentId, path, content) {
    if (!canExecute(agentId, 'filesystem:write')) throw new Error('غير مصرح');
    // محاكاة كتابة ملف
    console.log(`[Tool] كتابة ملف ${path}`);
}
