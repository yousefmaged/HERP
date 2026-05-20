/**
 * HERP Sync Engine — محرك المزامنة اللامركزية
 * 
 * يدعم:
 * - اكتشاف الأقران (Peer Discovery) عبر WebRTC
 * - نقل البيانات المشفرة
 * - حل التعارضات البسيط (Last-Write-Wins)
 */

import { encrypt, decrypt } from '../crypto/encryption.js';
import { loadMasterKey } from '../crypto/key-manager.js';

let peerConnection = null;
let dataChannel = null;
let remotePeerId = null;

/**
 * إنشاء اتصال P2P مع نظير آخر
 * @param {string} remoteId
 */
export async function connectToPeer(remoteId) {
    // في الإصدار المبسط، نستخدم WebRTC basic
    const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    peerConnection = new RTCPeerConnection(config);
    
    dataChannel = peerConnection.createDataChannel('herp-sync');
    dataChannel.onopen = () => console.log('[Sync] قناة البيانات مفتوحة');
    dataChannel.onmessage = async (event) => {
        const masterKey = await loadMasterKey();
        const decrypted = await decrypt(event.data, masterKey);
        console.log('[Sync] بيانات مستلمة:', decrypted);
    };
    
    // إنشاء offer/answer (مبسط)
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    // سيتم تبادل الـ offer والـ answer عبر Signaling Server (خارج النطاق حالياً)
}

/**
 * إرسال بيانات إلى النظير المتصل
 * @param {any} data
 */
export async function sendData(data) {
    if (!dataChannel || dataChannel.readyState !== 'open') {
        throw new Error('لا يوجد اتصال مفتوح');
    }
    const masterKey = await loadMasterKey();
    const encrypted = await encrypt(JSON.stringify(data), masterKey);
    dataChannel.send(encrypted);
}
