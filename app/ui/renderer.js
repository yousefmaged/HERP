import { navigateTo } from './router.js';
import { getUIState, setUIState } from './state.js';

let appRoot = null;
let currentScreen = null;

export function initRenderer() {
    appRoot = document.getElementById('app-root');
}

export async function renderScreen(screenName, params = {}) {
    if (!appRoot) initRenderer();
    setUIState({ currentScreen: screenName });
    
    if (screenName === 'identity') {
        appRoot.innerHTML = `
            <div class="screen active identity-screen">
                <div class="identity-card">
                    <div style="font-size:48px;">🏛️</div>
                    <h2>ما اسم كيانك؟</h2>
                    <input type="text" id="entity-name" class="identity-input" placeholder="مثال: شركة الريادة" />
                    <button id="create-identity" class="btn-primary">إنشاء الهوية</button>
                </div>
            </div>
        `;
        document.getElementById('create-identity')?.addEventListener('click', async () => {
            const name = document.getElementById('entity-name').value.trim();
            if (!name) return;
            // إطلاق حدث إنشاء الهوية (يستمع له kernel)
            window.dispatchEvent(new CustomEvent('herp:create-identity', { detail: { name } }));
        });
    } else if (screenName === 'modules') {
        // ستعرض لاحقاً قائمة الوحدات من registry (مبسط حالياً)
        appRoot.innerHTML = `
            <div class="screen active modules-screen">
                <div style="text-align:center; padding:40px;">
                    <h2>اختر وحداتك</h2>
                    <div class="modules-grid" id="modules-grid">
                        <div class="module-card" data-id="knowledge">
                            <div class="module-icon">📚</div>
                            <div class="module-name">المفكرة الذكية</div>
                            <div class="module-desc">تنظيم المعرفة والأفكار</div>
                        </div>
                        <div class="module-card" data-id="finance">
                            <div class="module-icon">💰</div>
                            <div class="module-name">المالية</div>
                            <div class="module-desc">فواتير وحسابات</div>
                        </div>
                    </div>
                    <button id="install-selected" class="btn-primary">تثبيت المحدد</button>
                    <button id="skip-install" class="btn-secondary">تخطى</button>
                </div>
            </div>
        `;
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', () => card.classList.toggle('selected'));
        });
        document.getElementById('install-selected')?.addEventListener('click', async () => {
            // محاكاة تثبيت الوحدات
            navigateTo('/dashboard');
        });
        document.getElementById('skip-install')?.addEventListener('click', () => {
            navigateTo('/dashboard');
        });
    } else if (screenName === 'dashboard') {
        appRoot.innerHTML = `
            <div class="workspace-container">
                <div class="sidebar">
                    <div class="sidebar-logo">HERP</div>
                    <div id="module-buttons"></div>
                </div>
                <div class="main-area">
                    <iframe id="module-frame" class="module-frame" style="width:100%;height:100%;border:none;"></iframe>
                </div>
            </div>
        `;
        // إضافة أزرار الوحدات المسجلة (سيتم ملؤها من kernel)
        const container = document.getElementById('module-buttons');
        if (window.herpKernel) {
            const modules = Array.from(window.herpKernel.modules.keys());
            modules.forEach(id => {
                const btn = document.createElement('button');
                btn.className = 'module-btn';
                btn.textContent = id === 'knowledge' ? '📚 المعرفة' : '💰 المالية';
                btn.onclick = () => {
                    document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const iframe = document.getElementById('module-frame');
                    iframe.src = `/modules/${id}/ui/dashboard.html`;
                    iframe.classList.add('active');
                };
                container.appendChild(btn);
            });
        }
    }
}