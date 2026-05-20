/**
 * HERP Main — نقطة الدخول الرئيسية (محدثة)
 */

import { Kernel } from './core/kernel.js';
import { startRenderer } from './ui/renderer.js';
import { setKernelInstance } from './ui/screens.js';
import { navigateTo } from './ui/router.js';
import { saveEntity } from './storage/adapters/local.adapter.js';
import { generateMasterKey } from './crypto/key-manager.js';

let kernel = null;

export async function startHERP() {
    kernel = new Kernel();
    setKernelInstance(kernel);
    await kernel.init();
    
    startRenderer();
    
    // التحقق من وجود هوية
    const identity = await loadEntity('system_identity', 'singleton');
    if (identity) {
        navigateTo('/dashboard');
    } else {
        navigateTo('/identity');
    }
    
    // تثبيت الوحدات التجريبية (للتطوير)
    // يمكنك إلغاء تعليق السطور التالية لتثبيت وحدات افتراضياً
    // await kernel.registerModuleFromStructure('knowledge');
    // await kernel.registerModuleFromStructure('finance');
}

// استقبال حدث إنشاء الهوية
window.addEventListener('herp:create-identity', async (e) => {
    const { entityName } = e.detail;
    if (!entityName) return;
    
    if (!hasMasterKey()) {
        await generateMasterKey();
    }
    await saveEntity('system_identity', 'singleton', {
        entityName,
        userId: 'owner',
        role: 'owner',
        createdAt: Date.now()
    });
    navigateTo('/dashboard');
});

// تصدير النواة للاستخدام الخارجي (اختياري)
export function getKernel() {
    return kernel;
}
