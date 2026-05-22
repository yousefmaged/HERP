let routes = new Map();

export function addRoute(path, handler) {
    routes.set(path, handler);
}

export function navigateTo(path) {
    history.pushState({}, '', path);
    const handler = routes.get(path);
    if (handler) handler();
}

export function initRouter() {
    window.addEventListener('popstate', () => {
        const handler = routes.get(window.location.pathname);
        if (handler) handler();
    });
    const handler = routes.get(window.location.pathname);
    if (handler) handler();
}