/**
 * HERP Screens — تسجيل شاشات التطبيق
 */

import { registerRenderer, renderWelcomeScreen } from './renderer.js';
import { getUIState, setUIState } from './state.js';
import { navigateTo } from './router.js';

// شاشة الترحيب
registerRenderer('/', (container, params) => {
    renderWelcomeScreen(container);
    // بعد ثانية، الانتقال إلى الهوية إذا لم تكن مسجلة
    setTimeout(() => {
        // يمكن فحص الهوية هنا (سيتم في kernel)
        // navigateTo('/identity');
    }, 1500);
});

// شاشة إنشاء الهوية
registerRenderer('/identity', async (container, params) => {
    container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#080810;">
            <div style="background:#1e1e2e; padding:2rem; border-radius:24px; max-width:400px; text-align:center;">
                <h2 style="color:#f0f0f8;">إنشاء هوية سيادية</h2>
                <input type="text" id="entity-name" placeholder="اسم الكيان" style="width:100%; margin:1rem 0; padding:10px; border-radius:12px; border:none;">
                <button id="create-btn" class="btn-primary">إنشاء</button>
            </div>
        </div>
    `;
    document.getElementById('create-btn')?.addEventListener('click', async () => {
        const name = document.getElementById('entity-name').value.trim();
        if (!name) return;
        // حفظ الهوية عبر kernel (يجب تمريره من النواة)
        window.dispatchEvent(new CustomEvent('herp:create-identity', { detail: { name } }));
    });
});

// شاشة لوحة التحكم
registerRenderer('/dashboard', (container, params) => {
    container.innerHTML = `
        <div style="padding:20px;">
            <h1>لوحة التحكم</h1>
            <p>مرحباً بك في HERP</p>
            <button id="logout-btn">تسجيل خروج</button>
        </div>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        navigateTo('/');
    });
});
