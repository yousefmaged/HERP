/**
 * HERP Bootloader
 * المسؤولية: تهيئة البيئة، تحميل النواة، إخفاء شاشة الإقلاع
 */

// عناصر DOM
const bootScreen = document.getElementById('boot-screen');
const bootProgress = document.getElementById('boot-progress');
const bootStatus = document.getElementById('boot-status');

// تحديث حالة الإقلاع
function updateBootStatus(percent, message) {
    if (bootProgress) bootProgress.style.width = `${percent}%`;
    if (bootStatus) bootStatus.textContent = message;
    console.log(`[BOOT] ${percent}% — ${message}`);
}

// تسجيل Service Worker (لـ PWA والتخزين المؤقت)
async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('[BOOT] Service Worker غير مدعوم في هذا المتصفح');
        return;
    }
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[BOOT] Service Worker مسجل بنجاح:', registration.scope);
    } catch (error) {
        console.error('[BOOT] فشل تسجيل Service Worker:', error);
    }
}

// دالة الإقلاع الرئيسية
async function boot() {
    updateBootStatus(10, 'تسجيل Service Worker...');
    await registerServiceWorker();

    updateBootStatus(30, 'تحميل ناقل الأحداث...');
    await import('./events/bus.js');
    await import('./events/event-types.js');

    updateBootStatus(50, 'تحميل طبقة التشفير...');
    await import('./crypto/encryption.js');
    await import('./crypto/key-manager.js');

    updateBootStatus(70, 'تحميل طبقة التخزين...');
    await import('./storage/adapters/local.adapter.js');

    updateBootStatus(90, 'تشغيل النواة...');
    const { Kernel } = await import('./core/kernel.js');
    const kernel = new Kernel();
    await kernel.init();

    updateBootStatus(100, 'جاهز ✓');
    setTimeout(() => {
        if (bootScreen) bootScreen.classList.add('hidden');
    }, 500);
}

// بدء الإقلاع
boot().catch(error => {
    console.error('[BOOT] فشل الإقلاع:', error);
    if (bootStatus) bootStatus.textContent = '⚠ خطأ فادح — راجع وحدة التحكم';
});
