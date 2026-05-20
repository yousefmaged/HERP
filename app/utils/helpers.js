/**
 * HERP Helpers — دوال مساعدة عامة
 */

export function formatDate(timestamp, locale = 'ar-EG') {
    return new Date(timestamp).toLocaleDateString(locale);
}

export function formatDateTime(timestamp, locale = 'ar-EG') {
    return new Date(timestamp).toLocaleString(locale);
}

export function generateId(prefix = '') {
    const random = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    return prefix ? `${prefix}_${random}` : random;
}

export function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}

export function debounce(fn, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

export function throttle(fn, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
