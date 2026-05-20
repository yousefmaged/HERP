/**
 * HERP Main — نقطة الدخول الرئيسية للنظام
 */

import { Kernel } from './core/kernel.js';
import { startRenderer } from './ui/renderer.js';
import './ui/screens.js';
import { navigateTo } from './ui/router.js';
import { setUIState } from './ui/state.js';
import { emit } from './events/bus.js';
import { EVENT_TYPES } from './events/event-types.js';
import { login } from './permissions/session-manager.js';
import { loadEntity, saveEntity } from './storage/adapters/local.adapter.js';
import { generateMasterKey, hasMasterKey, loadMasterKey } from './crypto/key-manager.js';

let kernel = null;

export async function startHERP() {
    kernel = new Kernel();
    await kernel.init();
    
    startRenderer();
    
    // استقبال حدث إنشاء الهوية من واجهة المستخدم
    window.addEventListener('herp:create-identity', async (e) => {
        const { entityName } = e.detail;
        if (!entityName) return;
        
        // إنشاء مفتاح سيادي إذا لم يكن موجوداً
        if (!hasMasterKey()) {
            await generateMasterKey();
        }
        // حفظ الهوية
        await saveEntity('system_identity', 'singleton', {
            entityName,
            userId: 'owner',
            role: 'owner',
            createdAt: Date.now()
        });
        // تسجيل الدخول
        login('owner', 'owner', { entityName });
        // تحديث واجهة المستخدم
        setUIState({ isLoading: false });
        navigateTo('/dashboard');
        await emit({
            name: EVENT_TYPES.IDENTITY_CREATED,
            payload: { entityName },
            source: 'main'
        });
    });
    
    // التحقق من الهوية الموجودة مسبقاً
    const existingIdentity = await loadEntity('system_identity');
    if (existingIdentity) {
        login(existingIdentity.userId || 'owner', existingIdentity.role || 'owner', {
            entityName: existingIdentity.entityName
        });
        navigateTo('/dashboard');
    } else {
        navigateTo('/identity');
    }
}

// للتصحيح العالمي (اختياري)
window.herp = { kernel, startHERP };
