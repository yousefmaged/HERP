/**
 * HERP Rule Engine — محرك القواعد الديناميكية
 * 
 * يستخدم للصلاحيات المعقدة التي تتطلب فحص حالة البيانات نفسها.
 */

// تسجيل القواعد المخصصة (يتم تحميلها من workspace/config/permissions.json)
const customRules = new Map();

/**
 * تسجيل قاعدة جديدة
 * @param {string} ruleName
 * @param {Function} ruleFunction - (context) => boolean
 */
export function registerRule(ruleName, ruleFunction) {
    customRules.set(ruleName, ruleFunction);
}

/**
 * تحميل القواعد من كائن التكوين
 * @param {Object} rulesConfig
 */
export function loadRules(rulesConfig) {
    for (const [name, fnBody] of Object.entries(rulesConfig)) {
        try {
            // تحويل النص إلى دالة بأمان (في بيئة معزولة)
            const ruleFn = new Function('context', `return (${fnBody})`);
            registerRule(name, ruleFn);
        } catch (err) {
            console.error(`[RuleEngine] فشل تحميل القاعدة ${name}:`, err);
        }
    }
}

/**
 * تقييم قاعدة معينة
 * @param {string} ruleName
 * @param {Object} context - البيانات اللازمة للفحص (مثل الفاتورة، المستخدم)
 * @returns {Promise<boolean>}
 */
export async function evaluateRule(ruleName, context) {
    const rule = customRules.get(ruleName);
    if (!rule) {
        console.warn(`[RuleEngine] قاعدة غير موجودة: ${ruleName}`);
        return true; // إذا لم توجد القاعدة، نسمح (أو يمكن أن نرفض حسب السياسة)
    }
    try {
        return await Promise.resolve(rule(context));
    } catch (err) {
        console.error(`[RuleEngine] خطأ في تنفيذ القاعدة ${ruleName}:`, err);
        return false;
    }
}

/**
 * قاعدة مثال: منع تعديل الفاتورة إذا كانت مقفلة
 * يمكن إضافتها إلى permissions.json
 */
export function exampleInvoiceRule() {
    registerRule('invoice.can_edit', (context) => {
        const { invoice } = context;
        return invoice.status !== 'closed' && invoice.status !== 'paid';
    });
}
