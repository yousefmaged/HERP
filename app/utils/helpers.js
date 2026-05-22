export function generateId(prefix = '') {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    return prefix ? `${prefix}_${id}` : id;
}

export function formatDate(ts, locale = 'ar-EG') {
    return new Date(ts).toLocaleDateString(locale);
}

export function formatCurrency(amount, currency = 'SAR') {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount);
}