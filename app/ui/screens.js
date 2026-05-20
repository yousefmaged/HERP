/**
 * HERP UI Screens — تعريف شاشات التطبيق
 */

import { registerRenderer, renderWelcomeScreen } from './renderer.js';
import { navigateTo } from './router.js';
import { getUIState, setUIState } from './state.js';
import { getKernel } from '../../core/kernel.js'; // يجب تصدير kernel من main.js

let kernel = null;

// دالة لتعيين النواة من main.js
export function setKernelInstance(kernelInstance) {
    kernel = kernelInstance;
}

// شاشة الترحيب
registerRenderer('/', (container, params) => {
    renderWelcomeScreen(container);
    setTimeout(() => {
        navigateTo('/dashboard');
    }, 1500);
});

// شاشة الهوية (تم تنفيذها سابقاً)
registerRenderer('/identity', async (container, params) => {
    container.innerHTML = `
        <div class="identity-screen">
            <div class="identity-card">
                <h2>إنشاء هوية سيادية</h2>
                <input type="text" id="entity-name" placeholder="اسم الكيان">
                <button id="create-identity">إنشاء</button>
            </div>
        </div>
    `;
    document.getElementById('create-identity')?.addEventListener('click', async () => {
        const name = document.getElementById('entity-name').value;
        if (name) {
            // حفظ الهوية (يتم عبر main.js)
            window.dispatchEvent(new CustomEvent('herp:create-identity', { detail: { entityName: name } }));
        }
    });
});

// شاشة لوحة التحكم (Dashboard)
registerRenderer('/dashboard', (container, params) => {
    if (!kernel) {
        container.innerHTML = '<div class="error">النواة غير جاهزة</div>';
        return;
    }
    
    const modules = kernel.getModules();
    
    if (modules.length === 0) {
        container.innerHTML = `
            <div class="dashboard-empty">
                <h2>مرحباً بك في HERP</h2>
                <p>لا توجد وحدات مثبتة بعد.</p>
                <button id="go-to-modules" class="btn-primary">تثبيت وحدات</button>
            </div>
        `;
        document.getElementById('go-to-modules')?.addEventListener('click', () => {
            navigateTo('/modules');
        });
        return;
    }
    
    container.innerHTML = `
        <div class="dashboard">
            <h2>لوحة التحكم</h2>
            <div class="modules-grid">
                ${modules.map(mod => `
                    <div class="module-card" data-id="${mod.id}">
                        <div class="module-icon">${mod.icon}</div>
                        <div class="module-name">${mod.name}</div>
                        <div class="module-desc">${mod.description}</div>
                        <button class="open-module-btn" data-id="${mod.id}">فتح</button>
                    </div>
                `).join('')}
            </div>
            <button id="add-modules-btn" class="btn-secondary">+ إضافة وحدات</button>
        </div>
    `;
    
    // مستمعي الأحداث لفتح الوحدات
    document.querySelectorAll('.open-module-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleId = btn.dataset.id;
            navigateTo(`/module/${moduleId}`);
        });
    });
    
    document.getElementById('add-modules-btn')?.addEventListener('click', () => {
        navigateTo('/modules');
    });
});

// شاشة عرض وحدة محددة (iframe)
registerRenderer('/module/:id', async (container, params) => {
    const moduleId = params.id;
    if (!kernel) {
        container.innerHTML = '<div>النواة غير جاهزة</div>';
        return;
    }
    
    // محاولة تحميل الوحدة من هيكلها إذا لم تكن مسجلة بالكامل
    const moduleInfo = kernel.getModules().find(m => m.id === moduleId);
    if (!moduleInfo) {
        container.innerHTML = '<div>الوحدة غير موجودة</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="module-view">
            <button id="back-dashboard" class="btn-ghost">← رجوع</button>
            <div id="module-container" style="height: calc(100vh - 60px);"></div>
        </div>
    `;
    
    document.getElementById('back-dashboard')?.addEventListener('click', () => {
        navigateTo('/dashboard');
    });
    
    // تحميل الوحدة في iframe (باستخدام entrypoint من manifest)
    const moduleContainer = document.getElementById('module-container');
    const iframe = document.createElement('iframe');
    iframe.src = `/modules/${moduleId}/ui/index.html`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    moduleContainer.appendChild(iframe);
});
