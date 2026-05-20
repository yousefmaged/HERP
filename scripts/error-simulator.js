/**
 * HERP Error Simulator — محاكاة الأخطاء
 * 
 * يستخدم في بيئة الاختبار فقط (ليتم تضمينه في tests/chaos/)
 */

/**
 * محاكاة انقطاع القرص الصلب (بإبطاء العمليات بشكل كبير)
 * @param {number} durationMs
 */
export async function simulateDiskFailure(durationMs = 5000) {
    console.warn(`[Chaos] محاكاة فشل القرص لمدة ${durationMs}ms`);
    const originalSave = localStorage.setItem;
    localStorage.setItem = () => {
        throw new Error('Disk write error (simulated)');
    };
    setTimeout(() => {
        localStorage.setItem = originalSave;
        console.log('[Chaos] انتهت محاكاة فشل القرص');
    }, durationMs);
}

/**
 * محاكاة تلف قاعدة البيانات (محو جزء من IndexedDB)
 */
export async function simulateDatabaseCorruption() {
    console.warn('[Chaos] محاكاة تلف قاعدة البيانات');
    try {
        const request = indexedDB.deleteDatabase('herp');
        request.onsuccess = () => console.log('[Chaos] تم حذف قاعدة البيانات (محاكاة)');
        request.onerror = (err) => console.error('[Chaos] فشل حذف قاعدة البيانات', err);
    } catch (err) {
        console.error('[Chaos] خطأ في محاكاة التلف', err);
    }
}

/**
 * محاكاة فقدان المفتاح السيادي
 */
export function simulateKeyLoss() {
    console.warn('[Chaos] محاكاة فقدان المفتاح السيادي');
    localStorage.removeItem('herp_master_key');
}

/**
 * محاكاة ارتفاع مفاجئ في الذاكرة (إضافة كائنات ضخمة)
 * @param {number} sizeMB
 */
export function simulateMemoryPressure(sizeMB = 100) {
    console.warn(`[Chaos] محاكاة ضغط ذاكرة ${sizeMB}MB`);
    const arr = [];
    const bytes = sizeMB * 1024 * 1024;
    const chunkSize = 1024 * 1024; // 1MB
    const chunks = bytes / chunkSize;
    for (let i = 0; i < chunks; i++) {
        arr.push(new Uint8Array(chunkSize));
    }
    console.log(`[Chaos] تم تخصيص ${arr.length} كتلة ذاكرة. لإزالتها: arr.length = 0`);
    return arr; // ارجع المصفوفة ليمكن تنظيفها
}
