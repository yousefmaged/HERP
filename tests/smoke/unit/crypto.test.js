import { generateMasterKey, encrypt, decrypt, exportKey, importKey } from '../../app/crypto/encryption.js';
import { generateMasterKey as generateKey } from '../../app/crypto/key-manager.js';

async function testCrypto() {
    const key = await generateMasterKey();
    const plain = 'نص سري';
    const encrypted = await encrypt(plain, key);
    const decrypted = await decrypt(encrypted, key);
    if (decrypted !== plain) throw new Error('Encryption failed');
    console.log('✅ Crypto test passed');
}

testCrypto();
