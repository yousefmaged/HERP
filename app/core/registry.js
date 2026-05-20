/**
 * HERP Registry — سجل الخدمات والوحدات
 * 
 * يدير:
 * - الوحدات المثبتة
 * - الخدمات الداخلية (مثل storage, crypto)
 * - تبعيات الوحدات
 */

const services = new Map();      // serviceName → serviceInstance
const modules = new Map();       // moduleId → moduleInfo

/**
 * تسجيل خدمة داخلية
 * @param {string} name
 * @param {Object} instance
 */
export function registerService(name, instance) {
    if (services.has(name)) {
        console.warn(`[Registry] استبدال الخدمة ${name}`);
    }
    services.set(name, instance);
}

/**
 * الحصول على خدمة مسجلة
 * @param {string} name
 * @returns {Object|null}
 */
export function getService(name) {
    return services.get(name) || null;
}

/**
 * تسجيل وحدة (بعد تثبيتها)
 * @param {string} moduleId
 * @param {Object} moduleInfo
 */
export function registerModule(moduleId, moduleInfo) {
    modules.set(moduleId, {
        ...moduleInfo,
        registeredAt: Date.now(),
        status: 'registered'
    });
    console.log(`[Registry] تم تسجيل الوحدة: ${moduleId}`);
}

/**
 * الحصول على معلومات وحدة
 * @param {string} moduleId
 * @returns {Object|null}
 */
export function getModule(moduleId) {
    return modules.get(moduleId) || null;
}

/**
 * الحصول على قائمة جميع الوحدات المسجلة
 * @returns {Array}
 */
export function listModules() {
    return Array.from(modules.entries()).map(([id, info]) => ({ id, ...info }));
}

/**
 * إلغاء تسجيل وحدة (عند إلغاء التثبيت)
 * @param {string} moduleId
 */
export function unregisterModule(moduleId) {
    modules.delete(moduleId);
    console.log(`[Registry] تم إلغاء تسجيل الوحدة: ${moduleId}`);
}
