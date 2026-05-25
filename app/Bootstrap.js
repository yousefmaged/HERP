import { bootstrap } from './core/bootstrap.js';
import kernel from './core/kernel.js';
import { initRouter, navigateTo } from './ui/router.js';
import { renderScreen } from './ui/renderer.js';

// جعل النواة متاحة للوحدات عبر window
window.herpKernel = kernel;

// تسجيل المسارات
import { addRoute } from './ui/router.js';

addRoute('/', () => renderScreen('identity'));
addRoute('/modules', () => renderScreen('modules'));
addRoute('/dashboard', () => renderScreen('dashboard'));

// بدء الإقلاع
bootstrap().then(() => {
    initRouter();
    // التحقق من وجود هوية (مبسط)
    const hasIdentity = localStorage.getItem('herp_identity');
    if (hasIdentity) {
        navigateTo('/dashboard');
    } else {
        navigateTo('/');
    }
}).catch(err => {
    console.error('فشل الإقلاع', err);
    document.getElementById('boot-status').textContent = '⚠️ فشل الإقلاع';
});