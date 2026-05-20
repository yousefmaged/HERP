/**
 * HERP Renderer — محرك تصيير الواجهة
 * 
 * يستدعي دوال التصيير المسجلة لكل مسار.
 */

import { addRoute, navigateTo, startRouter } from './router.js';
import { getUIState, setUIState } from './state.js';

// دوال تصيير الشاشات (يتم تسجيلها من main)
const renderers = new Map();

/**
 * تسجيل دالة تصيير لمسار معين
 * @param {string} path
 * @param {Function} renderer - (container, params) => void
 */
export function registerRenderer(path, renderer) {
    renderers.set(path, renderer);
    addRoute(path, (params) => {
        const container = document.getElementById('app-root');
        if (container) {
            renderer(container, params);
            setUIState({ currentScreen: path });
        }
    });
}

/**
 * بدء تشغيل محرك التصيير
 */
export function startRenderer() {
    startRouter();
}

/**
 * عرض شاشة الترحيب المؤقتة (حتى يتم تسجيل الشاشات الحقيقية)
 * @param {HTMLElement} container
 */
export function renderWelcomeScreen(container) {
    container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#080810;">
            <div style="text-align:center;">
                <div style="font-size:64px;">🧭</div>
                <h1 style="color:#f0f0f8;">HERP</h1>
                <p style="color:#8888aa;">جاري تحميل النواة...</p>
            </div>
        </div>
    `;
}
