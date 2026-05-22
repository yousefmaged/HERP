/**
 * HERP Bootstrap – محرك الإقلاع
 * 
 * يطلب صلاحيات workspace، يهيئ VFS، SQLite، ثم يطلق النواة.
 */

import vfs from '../storage/vfs.js';
import LocalStorageAdapter from '../storage/adapters/local.adapter.js';
import { initSQLite, openDatabase } from '../storage/sqlite.js';
import kernel from './kernel.js';

const bootScreen = document.getElementById('boot-screen');
const bootBar = document.getElementById('boot-bar');
const bootStatus = document.getElementById('boot-status');

function updateProgress(percent, message) {
    if (bootBar) bootBar.style.width = `${percent}%`;
    if (bootStatus) bootStatus.textContent = message;
    console.log(`[Boot] ${percent}% – ${message}`);
}

export async function bootstrap() {
    updateProgress(10, 'طلب الوصول إلى مجلد workspace...');
    const adapter = new LocalStorageAdapter();
    await adapter.requestAccess();
    vfs.setAdapter(adapter);
    
    updateProgress(30, 'إنشاء هيكل المجلدات...');
    await vfs.createDirectory('database').catch(() => {});
    await vfs.createDirectory('files').catch(() => {});
    await vfs.createDirectory('keys').catch(() => {});
    await vfs.createDirectory('logs').catch(() => {});
    await vfs.createDirectory('config').catch(() => {});
    
    updateProgress(50, 'تهيئة قاعدة البيانات...');
    await initSQLite();
    const db = await openDatabase();
    kernel.setDatabase(db);
    
    updateProgress(70, 'تشغيل النواة...');
    await kernel.init();
    
    updateProgress(90, 'تحميل الوحدات...');
    // سيتم استدعاء الوحدات لاحقاً (من main.js)
    
    updateProgress(100, 'جاهز ✓');
    setTimeout(() => {
        if (bootScreen) bootScreen.classList.add('hidden');
    }, 500);
}