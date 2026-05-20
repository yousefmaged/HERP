/**
 * HERP WebSocket Server — خادم WebSocket للمزامنة اللحظية
 */

import { emit, subscribe } from '../../app/events/bus.js';

const clients = new Map(); // clientId → WebSocket

export function startWebSocketServer(server) {
    // في بيئة Node.js، نستخدم ws library. هنا نضع هيكلاً.
    console.log('[WebSocket] خادم WebSocket جاهز');
}

export function broadcast(eventName, payload) {
    clients.forEach((ws, id) => {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify({ event: eventName, payload }));
        }
    });
}
