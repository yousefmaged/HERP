/**
 * HERP Smoke Test — اختبار سريع للمكونات الأساسية
 * 
 * يُشغّل في بيئة Node.js أو في المتصفح عبر HTML.
 */

import { openDatabase } from '../../app/storage/adapters/local.adapter.js';
import { generateMasterKey, hasMasterKey } from '../../app/crypto/key-manager.js';
import { encrypt, decrypt } from '../../app/crypto/encryption.js';

async function testStorage() {
    console.log('Testing storage...');
    const db = await openDatabase();
    if (!db) throw new Error('Failed to open database');
    console.log('✓ Storage OK');
}

async function testCrypto() {
    console.log('Testing crypto...');
    const key = await generateMasterKey();
    const plain = 'سرية';
    const encrypted = await encrypt(plain, key);
    const decrypted = await decrypt(encrypted, key);
    if (decrypted !== plain) throw new Error('Encryption/decryption mismatch');
    console.log('✓ Crypto OK');
}

async function runSmokeTests() {
    try {
        await testStorage();
        await testCrypto();
        console.log('✅ All smoke tests passed.');
    } catch (err) {
        console.error('❌ Smoke test failed:', err);
        process.exit(1);
    }
}

runSmokeTests();
