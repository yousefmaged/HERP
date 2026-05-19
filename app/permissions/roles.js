/**
 * HERP Roles — تعريف الأدوار وصلاحياتها الأساسية
 * 
 * الأدوار:
 * - owner: مالك الكيان (صلاحيات كاملة)
 * - admin: مدير النظام (يمكنه إدارة المستخدمين والوحدات)
 * - member: عضو عادي (صلاحيات محدودة حسب الوحدة)
 * - viewer: مشاهد فقط (قراءة فقط)
 * - agent: وكيل ذكي (صلاحيات مقيدة ومحددة)
 */

export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
    AGENT: 'agent'
};

/**
 * صلاحيات كل دور (مصفوفة أولية — يمكن توسيعها ديناميكياً)
 * كل صلاحية بصيغة "module:action" أو "system:action"
 */
export const DEFAULT_PERMISSIONS = {
    [ROLES.OWNER]: [
        'system:*',           // كل صلاحيات النظام
        'module:*',           // كل صلاحيات الوحدات
        'security:manage',    // إدارة المفاتيح والسياسات
        'backup:manage',      // إدارة النسخ الاحتياطي
        'users:manage'        // إدارة المستخدمين
    ],
    [ROLES.ADMIN]: [
        'system:configure',   // تكوين النظام
        'module:install',     // تثبيت وحدات جديدة
        'module:uninstall',   // إزالة وحدات
        'users:invite',       // دعوة مستخدمين جدد
        'users:remove',       // إزالة مستخدمين
        'backup:restore'      // استعادة نسخ احتياطية
    ],
    [ROLES.MEMBER]: [
        'finance:read',       // قراءة البيانات المالية
        'finance:write',      // إنشاء وتعديل القيود المالية
        'projects:read',      // قراءة المشاريع
        'projects:write',     // إنشاء وتعديل المشاريع
        'knowledge:read',     // قراءة المعرفة
        'knowledge:write',    // تعديل المعرفة
        'crm:read',           // قراءة العملاء
        'crm:write'           // إنشاء وتعديل العملاء
    ],
    [ROLES.VIEWER]: [
        'finance:read',
        'projects:read',
        'knowledge:read',
        'crm:read'
    ],
    [ROLES.AGENT]: [
        'ai:search',          // البحث في المعرفة
        'ai:summarize',       // تلخيص النصوص
        'automation:trigger', // تشغيل قواعد أتمتة
        'email:send',         // إرسال بريد (بإذن المستخدم)
        'notification:send'   // إرسال إشعارات
    ]
};

/**
 * التحقق من أن الدور صالح
 * @param {string} role
 * @returns {boolean}
 */
export function isValidRole(role) {
    return Object.values(ROLES).includes(role);
}

/**
 * الحصول على قائمة الصلاحيات لدور معين
 * @param {string} role
 * @returns {string[]}
 */
export function getPermissionsForRole(role) {
    return DEFAULT_PERMISSIONS[role] || [];
}
