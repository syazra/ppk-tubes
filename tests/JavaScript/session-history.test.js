import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { prepareSessionHistory } from '../../resources/js/lib/sessionHistory.js';

function setup({ crypto, state = null } = {}) {
    const writes = [];
    const listeners = new Map();
    const handlers = [];
    const browser = {
        crypto,
        document: {
            documentElement: { style: { visibility: '' } },
            addEventListener(name, callback) { listeners.set(name, callback); },
        },
        location: { reloads: 0, reload() { this.reloads++; } },
        addEventListener(name, callback) { listeners.set(name, callback); },
        history: {
            state,
            pushState(data, title, url) {
                assert.equal(this, browser.history);
                this.state = structuredClone(data);
                writes.push({ method: 'push', data: this.state, title, url });
            },
            replaceState(data, title, url) {
                assert.equal(this, browser.history);
                this.state = structuredClone(data);
                writes.push({ method: 'replace', data: this.state, title, url });
            },
        },
    };
    const http = { onResponse(handler) { handlers.push(handler); } };

    return { browser, http, writes, handlers, listeners };
}

const privatePage = () => ({
    component: 'Admin/Dashboard',
    url: '/admin/dashboard',
    encryptHistory: true,
    props: { auth: { user: { id: 12, email: 'admin@example.com' } }, confidential: 'private report' },
});
const publicPage = () => ({ component: 'Landing', url: '/', props: { auth: { user: null } } });
const event = properties => ({ ...properties, stopped: false, stopImmediatePropagation() { this.stopped = true; } });

test('browsers with Web Crypto retain Inertia encryption and its native history behavior', () => {
    const environment = setup({ crypto: { subtle: {} } });
    const page = privatePage();
    const originalPush = environment.browser.history.pushState;
    const originalReplace = environment.browser.history.replaceState;

    assert.equal(prepareSessionHistory(page, environment), page);
    assert.equal(page.encryptHistory, true);
    assert.equal(environment.browser.history.pushState, originalPush);
    assert.equal(environment.browser.history.replaceState, originalReplace);
    assert.equal(environment.handlers.length, 0);
    assert.deepEqual([...environment.listeners.keys()], ['inertia:navigate', 'popstate', 'pageshow']);
});

test('HTTP origins can render private pages while history contains no private props', () => {
    const environment = setup({ crypto: {} });
    const originalPage = privatePage();
    const page = prepareSessionHistory(originalPage, environment);

    assert.equal(page.encryptHistory, false);
    assert.equal(originalPage.encryptHistory, true);
    assert.equal(page.props.confidential, 'private report');

    const state = { page, scrollRegions: [{ top: 80 }], documentScrollPosition: { top: 40 } };
    environment.browser.history.pushState(state, '', '/admin/dashboard');

    assert.deepEqual(environment.browser.history.state, {
        scrollRegions: [{ top: 80 }], documentScrollPosition: { top: 40 },
    });
    assert.equal(state.page, page);
    assert.equal(state.page.props.auth.user.email, 'admin@example.com');
    assert.equal(environment.writes[0].url, '/admin/dashboard');

    environment.browser.history.replaceState({ page, unrelated: 'metadata' }, '', '/admin/profile');
    assert.deepEqual(environment.browser.history.state, { unrelated: 'metadata' });
    assert.equal(environment.writes[1].url, '/admin/profile');
});

test('public, encrypted, null, and unrelated history states keep their existing data', () => {
    const environment = setup();
    prepareSessionHistory(publicPage(), environment);

    for (const state of [
        { page: publicPage(), scrollRegions: [] },
        { page: new ArrayBuffer(8) },
        { arbitrary: { data: true } },
        null,
    ]) {
        environment.browser.history.pushState(state, '', '/');
        assert.deepEqual(environment.browser.history.state, state);
    }
});

test('existing private state is scrubbed before Inertia initializes', () => {
    const page = privatePage();
    const environment = setup({ state: { page, scrollRegions: [{ top: 20 }] } });
    prepareSessionHistory(page, environment);

    assert.deepEqual(environment.browser.history.state, { scrollRegions: [{ top: 20 }] });
    assert.equal(environment.writes[0].method, 'replace');
    assert.equal(page.props.confidential, 'private report');
});

test('later Inertia JSON and object responses disable unsupported encryption without changing props', () => {
    const environment = setup();
    prepareSessionHistory(publicPage(), environment);
    const handler = environment.handlers[0];

    for (const data of [JSON.stringify(privatePage()), privatePage()]) {
        const response = { status: 200, headers: { 'x-inertia': 'true' }, data };
        const result = handler(response);
        assert.equal(result.data.encryptHistory, false);
        assert.equal(result.data.props.confidential, 'private report');
        assert.equal(result.status, 200);
        assert.equal(result.headers, response.headers);
        if (typeof data === 'object') assert.equal(data.encryptHistory, true);
        environment.browser.history.pushState({ page: result.data }, '', result.data.url);
        assert.deepEqual(environment.browser.history.state, {});
    }
});

test('redirects, malformed responses, and ordinary API responses are passed through', () => {
    const environment = setup();
    prepareSessionHistory(publicPage(), environment);
    const handler = environment.handlers[0];

    for (const response of [
        { status: 409, headers: { 'x-inertia-location': '/login' }, data: '' },
        { status: 200, headers: {}, data: JSON.stringify(privatePage()) },
        { status: 200, headers: { 'x-inertia': 'true' }, data: 'invalid JSON' },
        { status: 200, headers: { 'x-inertia': 'true' }, data: null },
        { status: 200, headers: { 'x-inertia': 'true' }, data: { count: 12 } },
    ]) assert.equal(handler(response), response);
});

test('a private bfcache restore is hidden and reloaded to check the current session', () => {
    const environment = setup();
    prepareSessionHistory(privatePage(), environment);
    const show = environment.listeners.get('pageshow');

    show(event({ persisted: false }));
    assert.equal(environment.browser.location.reloads, 0);
    show(event({ persisted: true }));
    assert.equal(environment.browser.document.documentElement.style.visibility, 'hidden');
    assert.equal(environment.browser.location.reloads, 1);
});

test('bfcache handling follows actual history commits after public/private navigation', () => {
    const environment = setup();
    prepareSessionHistory(publicPage(), environment);
    const show = environment.listeners.get('pageshow');

    show(event({ persisted: true }));
    assert.equal(environment.browser.location.reloads, 0);
    environment.browser.history.pushState({ page: privatePage() }, '', '/admin/dashboard');
    show(event({ persisted: true }));
    assert.equal(environment.browser.location.reloads, 1);
    environment.browser.history.replaceState({ page: publicPage() }, '', '/');
    show(event({ persisted: true }));
    assert.equal(environment.browser.location.reloads, 1);
});

test('encrypted Back/Forward state revalidates even when a stale secure tab retains its key', () => {
    const environment = setup({ crypto: { subtle: {} } });
    prepareSessionHistory(publicPage(), environment);
    const back = event({ state: { page: new ArrayBuffer(16) } });

    environment.listeners.get('popstate')(back);

    assert.equal(back.stopped, true);
    assert.equal(environment.browser.document.documentElement.style.visibility, 'hidden');
    assert.equal(environment.browser.location.reloads, 1);
});

test('Back/Forward revalidates old plaintext private entries while leaving public/redacted states alone', () => {
    const environment = setup({ crypto: { subtle: {} } });
    prepareSessionHistory(publicPage(), environment);
    const pop = environment.listeners.get('popstate');

    for (const state of [null, {}, { page: publicPage() }, { unrelated: true }]) {
        const back = event({ state });
        pop(back);
        assert.equal(back.stopped, false);
    }
    assert.equal(environment.browser.location.reloads, 0);

    const privateBack = event({ state: { page: privatePage() } });
    pop(privateBack);
    assert.equal(privateBack.stopped, true);
    assert.equal(environment.browser.location.reloads, 1);
});

test('secure bfcache restores revalidate the current private document after SPA navigation', () => {
    const environment = setup({ crypto: { subtle: {} } });
    prepareSessionHistory(publicPage(), environment);
    const show = environment.listeners.get('pageshow');
    const navigate = environment.listeners.get('inertia:navigate');

    show(event({ persisted: true }));
    assert.equal(environment.browser.location.reloads, 0);
    navigate({ detail: { page: privatePage() } });
    const restore = event({ persisted: true });
    show(restore);
    assert.equal(restore.stopped, true);
    assert.equal(environment.browser.document.documentElement.style.visibility, 'hidden');
    assert.equal(environment.browser.location.reloads, 1);
    navigate({ detail: { page: publicPage() } });
    show(event({ persisted: true }));
    assert.equal(environment.browser.location.reloads, 1);
});

test('installed Inertia renders redacted private history and refetches it on Back', () => {
    // Import Inertia in an isolated browser environment so its module-level browser
    // detection and actual Back handler run without affecting the other tests.
    const script = `
        import assert from 'node:assert/strict';
        import { prepareSessionHistory } from './resources/js/lib/sessionHistory.js';
        const events = new Map();
        function listen(name, callback) {
            const handlers = events.get(name) ?? [];
            handlers.push(callback);
            events.set(name, handlers);
        }
        const document = {
            documentElement: { style: {} },
            addEventListener: listen,
            dispatchEvent(event) {
                for (const handler of events.get(event.type) ?? []) handler(event);
                return !event.defaultPrevented;
            },
            querySelectorAll() { return []; },
            getElementById() { return null; },
        };
        const browser = {
            navigator: { userAgent: 'test' },
            document,
            location: new URL('http://campus.test/admin/dashboard'),
            performance: { getEntriesByType() { return []; } },
            requestAnimationFrame(callback) { callback(); },
            addEventListener: listen,
            history: {
                state: null,
                pushState(state) { this.state = structuredClone(state); },
                replaceState(state) { this.state = structuredClone(state); },
            },
        };
        globalThis.window = browser;
        globalThis.document = document;
        const { router, http, getInitialPageFromDOM } = await import('@inertiajs/core');
        const { http: reactHttp } = await import('@inertiajs/react');
        assert.equal(reactHttp, http);
        assert.equal(typeof getInitialPageFromDOM, 'function');
        const page = prepareSessionHistory({
            component: 'Private', url: browser.location.href, version: '', encryptHistory: true,
            props: { auth: { user: { id: 1 } }, secret: 'do not cache' },
        }, { http, browser });
        const renders = [];
        router.init({
            initialPage: page,
            resolveComponent: () => 'PrivateComponent',
            swapComponent: ({ page }) => { renders.push(page); return Promise.resolve(); },
        });
        await new Promise(setImmediate);
        assert.equal(renders.length, 1);
        assert.equal(renders[0].props.secret, 'do not cache');
        assert.equal(browser.history.state.page, undefined);
        const requests = [];
        router.visit = (url, options) => { requests.push({ url, options }); };
        for (const handler of events.get('popstate')) handler({ state: browser.history.state });
        assert.equal(requests.length, 1);
        assert.equal(requests[0].url, browser.location.href);
        assert.equal(renders.length, 1);
    `;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
        cwd: fileURLToPath(new URL('../../', import.meta.url)), encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
});
