/**
 * HERP Key Manager — إدارة المفاتيح السيادية
 * 
 * - تخزين المفتاح الرئيسي في localStorage (مشفر جزئياً — لاحقاً)
 * - توليد واسترداد مفاتيح الاسترداد (Recovery Keys)
 */

import { generateEncryptionKey, exportKey, importKey } from './encryption.js';

const MASTER_KEY_STORAGE = 'herp_master_key';
const RECOVERY_KEY_STORAGE = 'herp_recovery_key';

let cachedMasterKey = null;

/**
 * توليد مفتاح سيادي جديد وحفظه
 * @returns {Promise<CryptoKey>}
 */
export async function generateMasterKey() {
    const key = await generateEncryptionKey();
    const exported = await exportKey(key);
    localStorage.setItem(MASTER_KEY_STORAGE, exported);
    cachedMasterKey = key;
    return key;
}

/**
 * تحميل المفتاح السيادي المخزن
 * @returns {Promise<CryptoKey|null>}
 */
export async function loadMasterKey() {
    if (cachedMasterKey) return cachedMasterKey;
    
    const stored = localStorage.getItem(MASTER_KEY_STORAGE);
    if (!stored) return null;
    
    const key = await importKey(stored);
    cachedMasterKey = key;
    return key;
}

/**
 * هل يوجد مفتاح سيادي؟
 */
export function hasMasterKey() {
    return !!localStorage.getItem(MASTER_KEY_STORAGE);
}

/**
 * حذف المفتاح (تسجيل خروج كامل)
 */
export function clearMasterKey() {
    localStorage.removeItem(MASTER_KEY_STORAGE);
    localStorage.removeItem(RECOVERY_KEY_STORAGE);
    cachedMasterKey = null;
}

/**
 * توليد مفتاح استرداد (12 كلمة — BIP39-like)
 * في الإصدار المبسط: نص عشوائي طويل
 * @returns {string}
 */
export function generateRecoveryKey() {
    const randomPart = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
    const recovery = `HERP-RECOVERY-${randomPart}-${Date.now()}`;
    localStorage.setItem(RECOVERY_KEY_STORAGE, recovery);
    return recovery;
}

/**
 * التحقق من صحة مفتاح الاسترداد
 * @param {string} input
 * @returns {boolean}
 */
export function verifyRecoveryKey(input) {
    const stored = localStorage.getItem(RECOVERY_KEY_STORAGE);
    return stored === input;
}
