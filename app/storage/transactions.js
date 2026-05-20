/**
 * HERP Transactions — إدارة المعاملات الذرية
 * 
 * يضمن:
 * - Atomicity: كل العمليات تنجح أو لا شيء
 * - Consistency: الحفاظ على سلامة البيانات
 * - Isolation: عزل المعاملات المتزامنة (بسيط)
 * - Durability: تأكيد الحفظ
 */

import { openDatabase } from './adapters/local.adapter.js';

let currentTransaction = null;

/**
 * بدء معاملة جديدة
 * @param {string[]} storeNames - أسماء المخازن المعنية
 * @param {string} mode - 'readonly' أو 'readwrite'
 * @returns {Promise<IDBTransaction>}
 */
export async function beginTransaction(storeNames, mode = 'readwrite') {
    if (currentTransaction) {
        throw new Error('معاملة أخرى قيد التنفيذ حالياً (غير مدعوم التداخل)');
    }
    const db = await openDatabase();
    const tx = db.transaction(storeNames, mode);
    currentTransaction = tx;
    
    tx.oncomplete = () => { currentTransaction = null; };
    tx.onerror = () => { currentTransaction = null; };
    tx.onabort = () => { currentTransaction = null; };
    
    return tx;
}

/**
 * تنفيذ عدة عمليات داخل معاملة واحدة
 * @param {Function} operations - async (tx) => void
 */
export async function runTransaction(operations) {
    const tx = await beginTransaction(['entities', 'settings', 'migrations'], 'readwrite');
    try {
        await operations(tx);
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    } catch (err) {
        tx.abort();
        throw err;
    }
}

/**
 * حفظ كيان داخل معاملة (أداة مساعدة)
 * @param {IDBTransaction} tx
 * @param {string} storeName
 * @param {string} id
 * @param {any} data
 */
export function saveInTransaction(tx, storeName, id, data) {
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.put({ id, ...data });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
