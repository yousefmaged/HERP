/**
 * HERP Backup Engine — النسخ الاحتياطي الذكي
 * 
 * يدعم:
 * - نسخ كاملة (full)
 * - نسخ تفاضلية (incremental)
 * - جدول زمني: كل ساعة لآخر يوم، كل يوم لآخر أسبوع، كل أسبوع لآخر شهر
 */

import { openDatabase, loadEntitiesByType } from '../app/storage/adapters/local.adapter.js';
import { encrypt } from '../app/crypto/encryption.js';
import { loadMasterKey } from '../app/crypto/key-manager.js';
import { saveEntity } from '../app/storage/adapters/local.adapter.js';

const BACKUP_PREFIX = 'backup_';

/**
 * توليد اسم ملف النسخ الاحتياطي
 * @param {string} type 'full' | 'incremental'
 * @returns {string}
 */
function generateBackupName(type) {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    return `${BACKUP_PREFIX}${type}_${date}`;
}

/**
 * إنشاء نسخة احتياطية كاملة (full backup)
 */
export async function createFullBackup() {
    const masterKey = await loadMasterKey();
    if (!masterKey) throw new Error('لا يمكن عمل نسخ احتياطي بدون مفتاح سيادي');
    
    // جمع كل الكيانات من IndexedDB
    const allEntities = await loadEntitiesByType(''); // ستحتاج دالة تجلب كل شيء
    const backupData = {
        type: 'full',
        timestamp: Date.now(),
        version: '0.1.0',
        data: allEntities
    };
    
    const json = JSON.stringify(backupData);
    const encrypted = await encrypt(json, masterKey);
    const backupId = generateBackupName('full');
    
    await saveEntity('backup', backupId, {
        encrypted,
        timestamp: Date.now(),
        type: 'full'
    });
    
    console.log(`[Backup] تم إنشاء نسخة كاملة: ${backupId}`);
    return backupId;
}

/**
 * إنشاء نسخة تفاضلية (incremental — التغييرات فقط)
 * @param {Array} changes - قائمة بالتغييرات منذ آخر نسخة
 */
export async function createIncrementalBackup(changes) {
    const masterKey = await loadMasterKey();
    if (!masterKey) throw new Error('لا يمكن عمل نسخ احتياطي بدون مفتاح سيادي');
    
    const backupData = {
        type: 'incremental',
        timestamp: Date.now(),
        changes
    };
    
    const json = JSON.stringify(backupData);
    const encrypted = await encrypt(json, masterKey);
    const backupId = generateBackupName('incremental');
    
    await saveEntity('backup', backupId, {
        encrypted,
        timestamp: Date.now(),
        type: 'incremental',
        changesCount: changes.length
    });
    
    console.log(`[Backup] تم إنشاء نسخة تفاضلية: ${backupId} (${changes.length} تغيير)`);
    return backupId;
}

/**
 * جدولة النسخ الاحتياطي بناءً على الوقت الحالي
 * منطق ذكي: كل ساعة لآخر يوم، كل يوم لآخر أسبوع، كل أسبوع لآخر شهر
 */
export async function scheduleBackup() {
    const backups = await loadEntitiesByType('backup');
    const now = Date.now();
    
    // تصنيف النسخ حسب قدمها
    const hourly = backups.filter(b => (now - b.timestamp) < 24 * 60 * 60 * 1000);
    const daily = backups.filter(b => (now - b.timestamp) < 7 * 24 * 60 * 60 * 1000);
    const weekly = backups.filter(b => (now - b.timestamp) < 30 * 24 * 60 * 60 * 1000);
    
    // إذا كان هناك نسخة كاملة خلال آخر ساعة، لا نضيف
    const lastFull = backups.find(b => b.type === 'full' && (now - b.timestamp) < 60 * 60 * 1000);
    if (!lastFull) {
        await createFullBackup();
    } else {
        // هنا يمكن جمع التغييرات من سجل الأحداث (events) لعمل نسخة تفاضلية
        // في الإصدار المبسط، نكتفي بالنسخ الكاملة كل ساعة
        console.log('[Backup] تم تخطي النسخ، لوجود نسخة قريبة');
    }
}
