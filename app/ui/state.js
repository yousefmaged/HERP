let state = {
    currentScreen: 'identity',
    user: null,
    modules: []
};

const listeners = new Map();

export function getUIState() { return { ...state }; }

export function setUIState(newState) {
    const changed = [];
    for (const key in newState) {
        if (state[key] !== newState[key]) {
            state[key] = newState[key];
            changed.push(key);
        }
    }
    if (changed.length) notify(changed);
}

export function subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(callback);
}

function notify(keys) {
    keys.forEach(key => {
        (listeners.get(key) || []).forEach(cb => cb(state[key]));
    });
}