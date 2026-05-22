/**
 * HERP Event Bus – الجهاز العصبي المركزي
 * Pub/Sub نقي، Vanilla JS، بدون اعتماديات.
 */

class HERPEventBus {
    constructor() {
        this.listeners = new Map();
        this.middlewares = [];
        this.eventLog = [];
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
        return () => this.off(eventName, callback);
    }

    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
            if (this.listeners.get(eventName).size === 0) {
                this.listeners.delete(eventName);
            }
        }
    }

    onAny(callback) {
        return this.on('*', callback);
    }

    async emit(eventName, payload = {}, context = { source: 'unknown' }) {
        const event = {
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            name: eventName,
            payload,
            source: context.source || 'unknown',
            timestamp: Date.now()
        };
        
        this.eventLog.unshift(event);
        if (this.eventLog.length > 1000) this.eventLog.pop();
        
        try {
            for (const mw of this.middlewares) {
                await mw(event);
            }
        } catch (err) {
            console.error(`[EventBus] Middleware منع الحدث ${eventName}:`, err);
            return;
        }
        
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            for (const cb of callbacks) {
                try { await Promise.resolve(cb(event)); } catch(e) { console.error(e); }
            }
        }
        const anyCallbacks = this.listeners.get('*');
        if (anyCallbacks) {
            for (const cb of anyCallbacks) {
                try { await Promise.resolve(cb(event)); } catch(e) { console.error(e); }
            }
        }
    }
    
    getEventLog() { return [...this.eventLog]; }
}

export default new HERPEventBus();