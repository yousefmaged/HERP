/**
 * HERP Main — نقطة الدخول الرئيسية
 */

import { Kernel } from './core/kernel.js';
import { startRenderer } from './ui/renderer.js';
import './ui/screens.js';  // تسجيل الشاشات
import { navigateTo } from './ui/router.js';
import { setUIState } from './ui/state.js';

// استدعاء من boot.js
export async function startHERP() {
    const kernel = new Kernel();
    await kernel.init();
    
    // بدء محرك التصيير
    startRenderer();
    
    // الاستماع لأحداث إنشاء الهوية
    window.addEventListener('herp:create-identity', async (e) => {
        const { name } = e.detail;
        // حفظ الهوية باستخدام kernel (يجب إضافة طريقة في kernel)
        // kernel.createIdentity(name);
        navigateTo('/dashboard');
    });
    
    console.log('[HERP] تم إطلاق النظام بالكامل');
}
