/**
 * HERP Dependency Manager — إدارة التبعيات
 * 
 * يحلل ويحل تبعيات الخدمات قبل تحميلها.
 */

const dependencies = new Map(); // serviceName → [dependencies]
const loaded = new Set();

/**
 * تسجيل تبعيات خدمة
 * @param {string} serviceName
 * @param {string[]} deps
 */
export function registerDependencies(serviceName, deps) {
    dependencies.set(serviceName, deps);
}

/**
 * ترتيب التحميل حسب التبعيات (خوارزمية الفرز الطوبولوجي)
 * @returns {string[]}
 */
export function resolveOrder() {
    const visited = new Set();
    const recursionStack = new Set();
    const order = [];
    
    function dfs(name) {
        if (recursionStack.has(name)) {
            throw new Error(`تبعية دائرية detected: ${name}`);
        }
        if (visited.has(name)) return;
        
        recursionStack.add(name);
        const deps = dependencies.get(name) || [];
        for (const dep of deps) {
            dfs(dep);
        }
        recursionStack.delete(name);
        visited.add(name);
        order.push(name);
    }
    
    for (const [name] of dependencies) {
        dfs(name);
    }
    return order;
}

/**
 * تحميل الخدمات بالترتيب الصحيح
 * @param {Map} servicesMap - اسم الخدمة → دالة تعيد الـ instance
 */
export async function loadInOrder(servicesMap) {
    const order = resolveOrder();
    for (const name of order) {
        if (!loaded.has(name) && servicesMap.has(name)) {
            const factory = servicesMap.get(name);
            const instance = await factory();
            loaded.add(name);
            console.log(`[Dependency] تم تحميل ${name}`);
        }
    }
}
