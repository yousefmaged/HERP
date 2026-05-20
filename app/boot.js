/**
 * HERP Bootloader — إقلاع النظام
 */

import { startHERP } from './main.js';

let bootScreen, bootProgress, bootStatus;

function updateBootStatus(percent, message) {
    if (bootProgress) bootProgress.style.width = `${percent}%`;
    if (bootStatus) bootStatus.textContent = message;
    console.log(`[BOOT] ${percent}% — ${message}`);
}

async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('[SW] Service Worker مسجل');
    } catch (err) {
        console.warn('[SW] فشل التسجيل', err);
    }
}

async function boot() {
    bootScreen = document.getElementById('boot-screen');
    bootProgress = document.getElementById('boot-progress');
    bootStatus = document.getElementById('boot-status');
    
    updateBootStatus(10, 'تسجيل Service Worker...');
    await registerServiceWorker();
    
    updateBootStatus(30, 'تحميل النواة...');
    // startHERP ستقوم بتحميل باقي المكونات
    await startHERP();
    
    updateBootStatus(100, 'جاهز ✓');
    setTimeout(() => {
        if (bootScreen) bootScreen.style.display = 'none';
    }, 500);
}

boot().catch(err => {
    console.error('[BOOT] فشل الإقلاع:', err);
    if (bootStatus) bootStatus.textContent = '⚠ خطأ فادح — راجع وحدة التحكم';
});
