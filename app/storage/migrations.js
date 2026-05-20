/**
 * HERP Migrations — إدارة ترحيل قاعدة البيانات
 * 
 * يدعم:
 * - تسجيل المخططات والإصدارات
 * - تنفيذ الترقيات (up) والرجوع (down)
 * - تخزين حالة الترحيل في جدول خاص
 */

import { openDatabase, saveEntity, loadEntity } from './adapters/local.adapter.js';

const MIGRATIONS_STORE = 'migrations';
let currentVersion = 0;

/**
 * تعريف الترحيلات: كل ترحيل له رقم إصدار، دوال up و down
 */
const migrations = [
    {
        version: 1,
        name: 'init_schema',
        up: async (db) => {
            // إنشاء الجداول الأساسية (يتم عبر openDatabase)
            console.log('[Migration] تهيئة المخطط الأساسي (v1)');
            return true;
        },
        down: async (db) => {
            console.log('[Migration] الرجوع عن v1');
            return true;
        }
    },
    {
        version: 2,
        name: 'add_modules_store',
        up: async (db) => {
            // إضافة فهارس أو جداول إضافية
            console.log('[Migration] إضافة مخزن الوحدات المحسن (v2)');
            return true;
        },
        down: async (db) => {
            console.log('[Migration] الرجوع عن v2');
            return true;
        }
    }
];

/**
 * جلب رقم الإصدار الحالي من قاعدة البيانات
 * @returns {Promise<number>}
 */
async function getCurrentVersion() {
    try {
        const record = await loadEntity(MIGRATIONS_STORE, 'version');
        return record ? record.version : 0;
    } catch {
        return 0;
    }
}

/**
 * تحديث رقم الإصدار الحالي
 * @param {number} version
 */
async function setCurrentVersion(version) {
    await saveEntity(MIGRATIONS_STORE, 'version', { version, updatedAt: Date.now() });
}

/**
 * تنفيذ جميع الترحيلات المعلقة حتى الإصدار المستهدف
 * @param {number} targetVersion - الإصدار المطلوب الوصول إليه
 */
export async function migrateUp(targetVersion = null) {
    const db = await openDatabase();
    let current = await getCurrentVersion();
    const target = targetVersion || migrations.length;
    
    if (current >= target) {
        console.log(`[Migration] الإصدار الحالي ${current} مطابق أو أحدث من ${target}`);
        return;
    }
    
    for (let v = current + 1; v <= target; v++) {
        const migration = migrations.find(m => m.version === v);
        if (!migration) {
            throw new Error(`الترحيل رقم ${v} غير موجود`);
        }
        console.log(`[Migration] تطبيق الترحيل ${v}: ${migration.name}`);
        await migration.up(db);
        await setCurrentVersion(v);
        current = v;
    }
    console.log(`[Migration] اكتملت الترحيلات حتى الإصدار ${current}`);
}

/**
 * الرجوع إلى إصدار أقدم (rollback)
 * @param {number} targetVersion 
 */
export async function migrateDown(targetVersion = 0) {
    const db = await openDatabase();
    let current = await getCurrentVersion();
    
    if (current <= targetVersion) {
        console.log(`[Migration] الإصدار الحالي ${current} ليس أكبر من ${targetVersion}`);
        return;
    }
    
    for (let v = current; v > targetVersion; v--) {
        const migration = migrations.find(m => m.version === v);
        if (!migration) {
            throw new Error(`الترحيل رقم ${v} غير موجود للرجوع`);
        }
        console.log(`[Migration] الرجوع عن الترحيل ${v}: ${migration.name}`);
        await migration.down(db);
        await setCurrentVersion(v - 1);
        current = v - 1;
    }
    console.log(`[Migration] تم الرجوع إلى الإصدار ${current}`);
}
