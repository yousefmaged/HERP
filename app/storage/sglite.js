/**
 * HERP SQLite Engine – تشغيل SQLite عبر WASM (sql.js)
 */

import vfs from './vfs.js';

let SQL = null;

export async function initSQLite() {
    if (SQL) return;
    // تحميل sql.js من CDN (يمكن حفظه محلياً لاحقاً)
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://sql.js.org/dist/sql-wasm.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    SQL = window.SQL;
    console.log('[SQLite] تم التحميل');
}

export async function openDatabase() {
    await initSQLite();
    try {
        const buffer = await vfs.readFile('database/company.db');
        return new SQL.Database(new Uint8Array(buffer));
    } catch {
        const db = new SQL.Database();
        await saveDatabase(db);
        return db;
    }
}

export async function saveDatabase(db) {
    const binary = db.export();
    await vfs.writeFile('database/company.db', binary);
}

export async function query(db, sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
}

export async function execute(db, sql, params = []) {
    db.run(sql, params);
    await saveDatabase(db);
}

export async function transaction(db, callback) {
    db.run('BEGIN TRANSACTION');
    try {
        await callback(db);
        db.run('COMMIT');
        await saveDatabase(db);
    } catch (e) {
        db.run('ROLLBACK');
        throw e;
    }
}