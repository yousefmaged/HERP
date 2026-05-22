/**
 * HERP Encryption – AES-GCM-256 باستخدام Web Crypto API
 */

const ALGO = 'AES-GCM';
const IV_LEN = 12;

export async function generateKey() {
    return crypto.subtle.generateKey({ name: ALGO, length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function exportKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

export async function importKey(b64) {
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, { name: ALGO }, false, ['encrypt', 'decrypt']);
}

export async function encrypt(plaintext, key) {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const encoded = new TextEncoder().encode(plaintext);
    const cipher = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);
    const result = new Uint8Array(IV_LEN + cipher.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(cipher), IV_LEN);
    return btoa(String.fromCharCode(...result));
}

export async function decrypt(cipherB64, key) {
    const buf = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
    const iv = buf.slice(0, IV_LEN);
    const cipher = buf.slice(IV_LEN);
    const plain = await crypto.subtle.decrypt({ name: ALGO, iv }, key, cipher);
    return new TextDecoder().decode(plain);
}