/**
 * HERP Agent Scheduler — جدولة مهام الوكلاء
 */

const tasks = new Map(); // taskId → { agentId, cron, handler }

/**
 * إضافة مهمة مجدولة
 * @param {string} taskId
 * @param {string} agentId
 * @param {number} intervalMs
 * @param {Function} handler
 */
export function scheduleTask(taskId, agentId, intervalMs, handler) {
    if (tasks.has(taskId)) clearInterval(tasks.get(taskId).interval);
    const interval = setInterval(() => {
        handler().catch(err => console.error(`[Scheduler] خطأ في المهمة ${taskId}:`, err));
    }, intervalMs);
    tasks.set(taskId, { agentId, interval, handler });
}

/**
 * إلغاء مهمة مجدولة
 */
export function unscheduleTask(taskId) {
    const task = tasks.get(taskId);
    if (task) {
        clearInterval(task.interval);
        tasks.delete(taskId);
    }
}
