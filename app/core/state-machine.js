/**
 * HERP State Machine — آلة الحالات للنواة والوحدات
 * 
 * يدعم:
 * - تعريف الحالات والانتقالات المسموحة
 * - استدعاء hooks عند الدخول/الخروج من حالة
 * - تسجيل الأحداث المرتبطة بالانتقالات
 */

import { emit } from '../events/bus.js';
import { EVENT_TYPES } from '../events/event-types.js';

// تعريف الحالات المسموحة للنواة
const KERNEL_STATES = {
    BOOTING: 'booting',
    READY: 'ready',
    ERROR: 'error',
    SHUTDOWN: 'shutdown'
};

// الانتقالات المسموحة
const transitions = {
    [KERNEL_STATES.BOOTING]: [KERNEL_STATES.READY, KERNEL_STATES.ERROR],
    [KERNEL_STATES.READY]: [KERNEL_STATES.SHUTDOWN, KERNEL_STATES.ERROR],
    [KERNEL_STATES.ERROR]: [KERNEL_STATES.SHUTDOWN, KERNEL_STATES.BOOTING],
    [KERNEL_STATES.SHUTDOWN]: [KERNEL_STATES.BOOTING]
};

let currentState = KERNEL_STATES.BOOTING;
const stateHooks = new Map(); // state → { onEnter, onExit }

/**
 * تسجيل hooks لحالة معينة
 * @param {string} state
 * @param {Object} hooks
 */
export function registerStateHooks(state, hooks) {
    stateHooks.set(state, hooks);
}

/**
 * محاولة الانتقال إلى حالة جديدة
 * @param {string} newState
 * @param {any} context
 */
export async function transitionTo(newState, context = {}) {
    if (!transitions[currentState]?.includes(newState)) {
        throw new Error(`انتقال غير مسموح: ${currentState} → ${newState}`);
    }
    
    // استدعاء onExit للحالة الحالية
    const exitHook = stateHooks.get(currentState)?.onExit;
    if (exitHook) await exitHook(context);
    
    const oldState = currentState;
    currentState = newState;
    
    // استدعاء onEnter للحالة الجديدة
    const enterHook = stateHooks.get(newState)?.onEnter;
    if (enterHook) await enterHook(context);
    
    // إطلاق حدث تغيير الحالة
    await emit({
        name: EVENT_TYPES.SYSTEM_READY, // نستخدم حدث مناسب أو نضيف حدثاً جديداً
        payload: { oldState, newState, context },
        source: 'state-machine'
    });
    
    console.log(`[StateMachine] ${oldState} → ${newState}`);
}

export function getCurrentState() {
    return currentState;
}

export function isState(state) {
    return currentState === state;
}
