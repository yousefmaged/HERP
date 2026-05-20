// داخل kernel.js، أضف دالة registerModuleFromStructure
import { loadModuleStructure } from '../sdk/module-sdk.js';

async registerModuleFromStructure(moduleId) {
    const structure = await loadModuleStructure(moduleId);
    // التحقق من الصلاحيات المطلوبة
    // تسجيل الأحداث في event bus
    // تسجيل المسارات في router
    // تسجيل الأوامر في command palette
    // استدعاء hooks.onLoad
    console.log(`Module ${moduleId} registered with full structure`);
}
