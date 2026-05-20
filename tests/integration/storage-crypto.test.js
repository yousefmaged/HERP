import { openDatabase, saveEntity, loadEntity } from '../../app/storage/adapters/local.adapter.js';
import { generateMasterKey, encrypt, decrypt } from '../../app/crypto/encryption.js';

async function testStorageCrypto() {
  // 1. فتح قاعدة البيانات
  const db = await openDatabase();
  if (!db) throw new Error('Cannot open db');

  // 2. توليد مفتاح
  const key = await generateMasterKey();

  // 3. تشفير نص
  const original = 'بيانات حساسة جداً';
  const encrypted = await encrypt(original, key);
  const decrypted = await decrypt(encrypted, key);
  if (decrypted !== original) throw new Error('Encryption mismatch');

  // 4. تخزين الكيان المشفر
  await saveEntity('test', 'secret', { cipher: encrypted });
  const loaded = await loadEntity('test', 'secret');
  const decryptedLoaded = await decrypt(loaded.cipher, key);
  if (decryptedLoaded !== original) throw new Error('Storage-crypto integration failed');

  console.log('✅ Storage-crypto integration test passed');
}

testStorageCrypto();
