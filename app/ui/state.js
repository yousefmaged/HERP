/**
 * HERP UI State — إدارة حالة الواجهة
 * 
 * تستخدم Proxy لمراقبة التغييرات وإعادة تصيير المكونات المتأثرة.
 */

// الحالة الحالية
let uiState = {
    currentScreen: 'welcome',
    sidebarOpen: true,
    activeModuleId: null,
    notifications: [],
    isLoading: false
};

// المستمعون للتغييرات
const listeners = new Map();

/**
 * الحصول على الحالة الحالية
 * @returns {Object}
 */
export function getUIState() {
    return { ...uiState };
}

/**
 * تحديث جزء من الحالة
 * @param {Object} newState
 */
export function setUIState(newState) {
    const changed = [];
    for (const key in newState) {
        if (uiState[key] !== newState[key]) {
            uiState[key] = newState[key];
            changed.push(key);
        }
    }
    if (changed.length > 0) {
        notifyListeners(changed);
    }
}

/**
 * الاشتراك في تغييرات الحالة
 * @param {string} key
 * @param {Function} callback
 */
export function subscribeToState(key, callback) {
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(callback);
}

/**
 * إخطار المستمعين بتغيير مفاتيح محددة
 * @param {string[]} keys
 */
function notifyListeners(keys) {
    for (const key of keys) {
        const callbacks = listeners.get(key);
        if (callbacks) {
            const value = uiState[key];
            callbacks.forEach(cb => cb(value));
        }
    }
}
