import assert from 'node:assert/strict';
import test from 'node:test';
import { trackPageVisits, waitForPageReady } from '../../resources/js/lib/pageReady.js';

const deferred = () => {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function environment({ loading = false, images = [], styles = [], background = 'none' } = {}) {
    const browser = new EventTarget();
    const frames = new Map();
    const backgroundImages = [];
    let frameId = 0;
    browser.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
    browser.cancelAnimationFrame = id => frames.delete(id);
    browser.matchMedia = () => ({ matches: true });
    browser.getComputedStyle = element => ({ backgroundImage: element.background || 'none' });
    browser.Image = class extends EventTarget {
        complete = false;
        constructor() { super(); backgroundImages.push(this); }
    };
    const font = deferred();
    const doc = { readyState: loading ? 'loading' : 'complete', fonts: { ready: font.promise }, querySelectorAll: () => styles };
    const root = { ownerDocument: doc, background, getClientRects: () => [1], querySelectorAll: selector => selector === 'img' ? images : [] };
    const paint = async () => {
        for (const [id, callback] of [...frames]) { frames.delete(id); callback(); }
        await flush();
    };
    return { browser, doc, root, font, paint, frames, backgroundImages };
}

test('the page remains loading until document, stylesheet, image decode, fonts and two paint frames finish', async () => {
    const image = Object.assign(new EventTarget(), { complete: false, naturalWidth: 100 });
    const decoded = deferred();
    image.decode = () => decoded.promise;
    const stylesheet = Object.assign(new EventTarget(), { sheet: null, media: '', href: '/page.css' });
    const env = environment({ loading: true, images: [image], styles: [stylesheet] });
    let finished = false;
    const ready = waitForPageReady(env.root, { browser: env.browser }).then(value => { finished = value; });
    env.font.resolve();
    await flush();
    assert.equal(finished, false);
    env.doc.readyState = 'complete';
    env.browser.dispatchEvent(new Event('load'));
    await flush();
    stylesheet.dispatchEvent(new Event('load'));
    image.complete = true;
    image.dispatchEvent(new Event('load'));
    await flush();
    assert.equal(env.frames.size, 0, 'an undecoded image still blocks readiness');
    decoded.resolve();
    await flush();
    await env.paint();
    assert.equal(finished, false, 'one frame is insufficient to reveal the page');
    await env.paint();
    await ready;
    assert.equal(finished, true);
});

test('CSS background photos load before the page reveals while data textures are skipped', async () => {
    const env = environment({ background: 'url("/hero.webp"), url("data:image/svg+xml,texture")' });
    env.font.resolve();
    const ready = waitForPageReady(env.root, { browser: env.browser });
    await flush();
    assert.equal(env.backgroundImages.length, 1);
    assert.equal(env.backgroundImages[0].src, '/hero.webp');
    assert.equal(env.frames.size, 0);
    env.backgroundImages[0].dispatchEvent(new Event('load'));
    await flush();
    await env.paint();
    await env.paint();
    assert.equal(await ready, true);
});

test('failed images, background photos and fonts settle without trapping the loading screen', async () => {
    const image = Object.assign(new EventTarget(), { complete: false, naturalWidth: 0 });
    const stylesheet = Object.assign(new EventTarget(), { sheet: null, media: '', href: '/missing.css' });
    const env = environment({ images: [image], styles: [stylesheet], background: 'url("/missing.webp")' });
    const ready = waitForPageReady(env.root, { browser: env.browser });
    env.font.reject(new Error('font unavailable'));
    image.complete = true;
    image.dispatchEvent(new Event('error'));
    stylesheet.dispatchEvent(new Event('error'));
    await flush();
    env.backgroundImages[0].dispatchEvent(new Event('error'));
    await flush();
    await env.paint();
    await env.paint();
    assert.equal(await ready, true);
});

test('already-failed stylesheets and lazy images do not wait for events that will never occur', async () => {
    const stylesheet = Object.assign(new EventTarget(), { sheet: null, media: '', href: '/missing.css' });
    const env = environment({ styles: [stylesheet], images: [{ loading: 'lazy', complete: false }] });
    env.browser.performance = { getEntriesByName: () => [{ responseEnd: 100 }] };
    env.font.resolve();
    const ready = waitForPageReady(env.root, { browser: env.browser });
    await flush();
    await env.paint();
    await env.paint();
    assert.equal(await ready, true);
});

test('preview iframe styles settle before detecting their background photos and newly introduced fonts', async () => {
    const stylesheet = Object.assign(new EventTarget(), { sheet: null, media: '', href: '/iframe.css' });
    const env = environment({ styles: [stylesheet] });
    env.font.resolve();
    const ready = waitForPageReady(env.root, { browser: env.browser });
    await flush();
    assert.equal(env.backgroundImages.length, 0);
    const iframeFont = deferred();
    env.doc.fonts.ready = iframeFont.promise;
    env.root.background = 'url("/dashboard-card.png")';
    stylesheet.dispatchEvent(new Event('load'));
    await flush();
    assert.equal(env.backgroundImages[0].src, '/dashboard-card.png');
    env.backgroundImages[0].dispatchEvent(new Event('load'));
    await flush();
    assert.equal(env.frames.size, 0, 'iframe fonts must also finish');
    iframeFont.resolve();
    await flush();
    await env.paint();
    await env.paint();
    assert.equal(await ready, true);
});

test('cancelling old readiness checks cannot reveal a newer page or leave paint callbacks behind', async () => {
    const env = environment();
    const controller = new AbortController();
    const old = waitForPageReady(env.root, { browser: env.browser, signal: controller.signal });
    controller.abort();
    assert.equal(await old, false);
    env.font.resolve();
    const nextController = new AbortController();
    const next = waitForPageReady(env.root, { browser: env.browser, signal: nextController.signal });
    await flush();
    assert.equal(env.frames.size, 1);
    nextController.abort();
    assert.equal(await next, false);
    assert.equal(env.frames.size, 0);
});

function visitEvents() {
    const handlers = new Map();
    return {
        on: (name, callback) => { handlers.set(name, callback); return () => handlers.delete(name); },
        emit: (name, visit = {}) => handlers.get(name)?.({ detail: { visit } }),
        handlers,
    };
}

test('foreground requests wait for their own finish and stale, async and prefetch events cannot dismiss them', () => {
    const router = visitEvents();
    const changes = [];
    const stop = trackPageVisits(router, value => changes.push(value));
    router.emit('start', { id: 'old' });
    router.emit('start', { id: 'new' });
    router.emit('finish', { id: 'old', cancelled: true });
    router.emit('start', { id: 'background', async: true });
    router.emit('finish', { id: 'background' });
    router.emit('start', { id: 'prefetch', prefetch: true });
    router.emit('start', { id: 'silent', showProgress: false });
    assert.deepEqual(changes, [true, true]);
    router.emit('finish', { id: 'new' });
    assert.deepEqual(changes, [true, true, false]);
    stop();
    assert.equal(router.handlers.size, 0);
});

test('login full-document redirect holds the loader after its POST finishes', () => {
    const router = visitEvents();
    const changes = [];
    trackPageVisits(router, value => changes.push(value));
    router.emit('start', { id: 'login' });
    router.emit('location');
    router.emit('finish', { id: 'login' });
    assert.deepEqual(changes, [true, true]);
});

test('failed and cancelled foreground visits release the previous page instead of freezing it', () => {
    const router = visitEvents();
    const changes = [];
    trackPageVisits(router, value => changes.push(value));
    router.emit('start', { id: 'failed' });
    router.emit('finish', { id: 'failed', completed: false });
    router.emit('start', { id: 'cancelled' });
    router.emit('finish', { id: 'cancelled', cancelled: true });
    assert.deepEqual(changes, [true, false, true, false]);
});

test('regular app menu requests keep AJAX navigation without opening the login loader', () => {
    const router = visitEvents();
    const changes = [];
    let component = 'User/Dashboard';
    trackPageVisits(router, value => changes.push(value), () => component === 'Login');
    router.emit('start', { id: 'catalog' });
    router.emit('finish', { id: 'catalog' });
    component = 'Admin/Dashboard';
    router.emit('start', { id: 'facilities' });
    router.emit('finish', { id: 'facilities' });
    assert.deepEqual(changes, []);
    component = 'Login';
    router.emit('start', { id: 'login' });
    router.emit('location');
    router.emit('finish', { id: 'login' });
    assert.deepEqual(changes, [true, true]);
});
