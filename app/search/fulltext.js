/**
 * HERP Full-Text Search — بحث نصي كامل
 * 
 * يدعم:
 * - فهرسة النصوص
 * - بحث بكلمات مفتاحية (AND, OR)
 */

const index = new Map(); // word → Set of document IDs

/**
 * إضافة مستند إلى الفهرس
 * @param {string} docId
 * @param {string} text
 */
export function indexDocument(docId, text) {
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
        if (!index.has(word)) index.set(word, new Set());
        index.get(word).add(docId);
    }
}

/**
 * البحث عن كلمة
 * @param {string} query
 * @returns {string[]} مصفوفة من المعرفات
 */
export function search(query) {
    const terms = query.toLowerCase().split(/\s+/);
    if (terms.length === 0) return [];
    
    let resultSet = null;
    for (const term of terms) {
        const docs = index.get(term) || new Set();
        if (resultSet === null) {
            resultSet = new Set(docs);
        } else {
            // دعم AND (تقاطع)
            resultSet = new Set([...resultSet].filter(x => docs.has(x)));
        }
    }
    return [...(resultSet || [])];
}

/**
 * إزالة مستند من الفهرس
 * @param {string} docId
 */
export function removeFromIndex(docId) {
    for (const [word, set] of index.entries()) {
        set.delete(docId);
        if (set.size === 0) index.delete(word);
    }
}
