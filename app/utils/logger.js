/**
 * HERP Logger — نظام تسجيل مركزي
 */

let logLevel = 'info';

export function setLogLevel(level) {
    logLevel = level;
}

function shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(logLevel);
}

function formatMessage(level, message, meta = {}) {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
    });
}

export function debug(msg, meta) {
    if (shouldLog('debug')) console.debug(formatMessage('debug', msg, meta));
}

export function info(msg, meta) {
    if (shouldLog('info')) console.info(formatMessage('info', msg, meta));
}

export function warn(msg, meta) {
    if (shouldLog('warn')) console.warn(formatMessage('warn', msg, meta));
}

export function error(msg, meta) {
    if (shouldLog('error')) console.error(formatMessage('error', msg, meta));
}
