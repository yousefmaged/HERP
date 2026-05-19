/**
 * HERP Encryption — طبقة التشفير الأساسية
 * 
 * الخوارزمية: AES-GCM-256
 * - السرية + سلامة البيانات + التوثيق في حزمة واحدة.
 */

const ALGO = 'AES-GCM';
const KEY_LEN = 256;
const IV_LEN = 12;

/**
 * تحويل ArrayBuffer إلى Base64
 */
function bufToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * تحويل Base64 إلى ArrayBuffer
 */
function base64ToBuf(base64) {
    const bin = atob(base64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        buf[i] = bin.charCodeAt(i);
    }
    return buf.buffer;
}

/**
 * توليد مفتاح تشفير جديد
 * @returns {Promise<CryptoKey>}
 */
export async function generateEncryptionKey() {
    return crypto.subtle.generateKey(
        { name: ALGO, length: KEY_LEN },
        true,  // قابل للتصدير (للتخزين)
        ['encrypt', 'decrypt']
    );
}

/**
 * تصدير المفتاح إلى صيغة Base64
 * @param {CryptoKey} key
 * @returns {Promise<string>}
 */
export async function exportKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return bufToBase64(raw);
}

/**
 * استيراد مفتاح من Base64
 * @param {string} base64Key
 * @returns {Promise<CryptoKey>}
 */
export async function importKey(base64Key) {
    const raw = base64ToBuf(base64Key);
    return crypto.subtle.importKey(
        'raw',
        raw,
        { name: ALGO },
        false,  // غير قابل للتصدير مرة أخرى (أمان)
        ['encrypt', 'decrypt']
    );
}

/**
 * تشفير نص
 * @param {string} plaintext
 * @param {CryptoKey} key
 * @returns {Promise<string>} النص المشفر بصيغة Base64 (IV + ciphertext)
 */
export async function encrypt(plaintext, key) {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const encoded = new TextEncoder().encode(plaintext);
    
    const cipherBuffer = await crypto.subtle.encrypt(
        { name: ALGO, iv },
        key,
        encoded
    );
    
    // دمج IV مع النص المشفر
    const result = new Uint8Array(IV_LEN + cipherBuffer.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(cipherBuffer), IV_LEN);
    
    return bufToBase64(result.buffer);
}

/**
 * فك تشفير نص
 * @param {string} cipherBase64
 * @param {CryptoKey} key
 * @returns {Promise<string>}
 */
export async function decrypt(cipherBase64, key) {
    const full = new Uint8Array(base64ToBuf(cipherBase64));
    const iv = full.slice(0, IV_LEN);
    const cipher = full.slice(IV_LEN);
    
    const plainBuffer = await crypto.subtle.decrypt(
        { name: ALGO, iv },
        key,
        cipher
    );
    
    return new TextDecoder().decode(plainBuffer);
}
