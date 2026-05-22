import { generateKey, exportKey, importKey } from './encryption.js';

const STORAGE_KEY = 'herp_master_key';

export async function generateMasterKey() {
    const key = await generateKey();
    const exported = await exportKey(key);
    localStorage.setItem(STORAGE_KEY, exported);
    return key;
}

export async function loadMasterKey() {
    const b64 = localStorage.getItem(STORAGE_KEY);
    if (!b64) return null;
    return importKey(b64);
}

export function hasMasterKey() {
    return !!localStorage.getItem(STORAGE_KEY);
}

export function clearMasterKey() {
    localStorage.removeItem(STORAGE_KEY);
}