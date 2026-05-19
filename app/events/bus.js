/**
 * HERP Event Bus — ناقل الأحداث المركزي
 * 
 * المبادئ:
 * 1. كل حدث يمر عبر هذا الناقل قبل التنفيذ.
 * 2. دعم الاشتراك المتعدد (multiple subscribers).
 * 3. دعم الوسائط (middleware) لفحص الأمان والتسجيل.
 * 4. تسجيل الأحداث الفاشلة في DLQ (Dead Letter Queue).
 */

import { EVENT_TYPES } from './event-types.js';

// المخازن الداخلية
const subscribers = new Map();      // eventName → Set of handlers
const middlewareFns = [];           // middleware chains
let isProcessing = false;
const eventHistory = [];            // للأحداث الأخيرة (debug)

// قائمة انتظار الأحداث الفاشلة (Dead Letter Queue)
const deadLetterQueue = [];

/**
 * إضافة دالة وسيطة (Middleware)
 * @param {Function} fn - (event, next) => void
 */
export function useMiddleware(fn) {
    middlewareFns.push(fn);
}

/**
 * الاشتراك في حدث
 * @param {string} eventName
 * @param {Function} handler
 */
export function subscribe(eventName, handler) {
    if (!subscribers.has(eventName)) {
        subscribers.set(eventName, new Set());
    }
    subscribers.get(eventName).add(handler);
}

/**
 * إلغاء الاشتراك
 * @param {string} eventName
 * @param {Function} handler
 */
export function unsubscribe(eventName, handler) {
    subscribers.get(eventName)?.delete(handler);
}

/**
 * تشغيل الوسائط (middleware chain)
 * @param {Object} event
 * @returns {Promise<Object>}
 */
async function runMiddleware(event) {
    let idx = 0;
    async function next(currentEvent) {
        if (idx < middlewareFns.length) {
            const fn = middlewareFns[idx++];
            return fn(currentEvent, next);
        }
        return currentEvent;
    }
    return next(event);
}

/**
 * بث حدث (emit)
 * @param {Object} event
 * @param {string} event.name
 * @param {any} event.payload
 * @param {string} event.source
 */
export async function emit(event) {
    const enrichedEvent = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        ...event
    };

    // تسجيل التاريخ (لـ debug)
    eventHistory.unshift(enrichedEvent);
    if (eventHistory.length > 100) eventHistory.pop();

    try {
        // تشغيل middleware (مثل guard.js)
        const processedEvent = await runMiddleware(enrichedEvent);
        
        const handlers = subscribers.get(processedEvent.name);
        if (!handlers || handlers.size === 0) return;

        const promises = [];
        for (const handler of handlers) {
            promises.push(
                Promise.resolve(handler(processedEvent)).catch(err => {
                    console.error(`[EventBus] خطأ في معالج الحدث "${processedEvent.name}":`, err);
                    // إضافة إلى DLQ
                    deadLetterQueue.push({
                        event: processedEvent,
                        error: err.message,
                        timestamp: Date.now()
                    });
                })
            );
        }
        await Promise.all(promises);
    } catch (err) {
        console.error(`[EventBus] فشل معالجة الحدث "${enrichedEvent.name}":`, err);
        deadLetterQueue.push({
            event: enrichedEvent,
            error: err.message,
            timestamp: Date.now()
        });
    }
}

/**
 * الحصول على سجل الأحداث الأخيرة (لـ diagnostic)
 */
export function getEventHistory() {
    return [...eventHistory];
}

/**
 * الحصول على قائمة انتظار الأحداث الفاشلة
 */
export function getDeadLetterQueue() {
    return [...deadLetterQueue];
}

/**
 * مسح قائمة الانتظار الفاشلة (بعد التصحيح)
 */
export function clearDeadLetterQueue() {
    deadLetterQueue.length = 0;
}
