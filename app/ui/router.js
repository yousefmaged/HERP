/**
 * HERP Router — توجيه عناوين URL
 * 
 * يدعم:
 * - التوجيه الداخلي (دون إعادة تحميل الصفحة)
 * - معالجة الروابط العميقة (deep linking)
 */

// خريطة المسارات: path → handler function
const routes = new Map();

/**
 * إضافة مسار جديد
 * @param {string} path
 * @param {Function} handler - (params) => void
 */
export function addRoute(path, handler) {
    routes.set(path, handler);
}

/**
 * معالجة تغيير URL (سواء من `popstate` أو يدوي)
 */
export function handleRoute() {
    const path = window.location.pathname;
    let matchedHandler = null;
    let params = {};
    
    // البحث عن تطابق تام أو باستخدام pattern بسيط
    for (const [routePath, handler] of routes.entries()) {
        if (routePath === path) {
            matchedHandler = handler;
            break;
        }
        // دعم مسارات ديناميكية مثل /module/:id
        const routeParts = routePath.split('/');
        const pathParts = path.split('/');
        if (routeParts.length === pathParts.length) {
            let match = true;
            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    params[routeParts[i].slice(1)] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                matchedHandler = handler;
                break;
            }
        }
    }
    
    if (matchedHandler) {
        matchedHandler(params);
    } else {
        console.warn(`[Router] لا يوجد مسار لـ ${path}`);
        // يمكن توجيه إلى الصفحة الافتراضية
        const defaultHandler = routes.get('/');
        if (defaultHandler) defaultHandler(params);
    }
}

/**
 * الانتقال إلى مسار معين (دون إعادة تحميل الصفحة)
 * @param {string} path
 * @param {Object} state
 */
export function navigateTo(path, state = {}) {
    window.history.pushState(state, '', path);
    handleRoute();
}

/**
 * بدء تشغيل الموجه (الاستماع لأزرار الرجوع/التقدم)
 */
export function startRouter() {
    window.addEventListener('popstate', () => handleRoute());
    handleRoute();
}
