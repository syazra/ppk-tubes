function settled(target, events, signal) {
    return new Promise(resolve => {
        if (!target) return;
        const finish = () => {
            events.forEach(event => target.removeEventListener(event, finish));
            signal?.removeEventListener('abort', finish);
            resolve();
        };
        if (signal?.aborted) return resolve();
        events.forEach(event => target.addEventListener(event, finish, { once: true }));
        signal?.addEventListener('abort', finish, { once: true });
    });
}

function painted(browser, signal) {
    return new Promise(resolve => {
        let frame;
        const finish = () => {
            browser.cancelAnimationFrame(frame);
            signal?.removeEventListener('abort', finish);
            resolve();
        };
        if (signal?.aborted) return resolve();
        signal?.addEventListener('abort', finish, { once: true });
        frame = browser.requestAnimationFrame(() => {
            frame = browser.requestAnimationFrame(finish);
        });
    });
}

// Wait for real resources and a paint opportunity, rather than a fixed delay.
// Failed assets settle too, so a missing image cannot trap the user in loading.
export async function waitForPageReady(root, { browser = window, signal } = {}) {
    const doc = root.ownerDocument;
    if (doc.readyState !== 'complete') await settled(browser, ['load'], signal);
    if (signal?.aborted) return false;

    const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')]
        .filter(link => !link.disabled && !link.sheet && !browser.performance?.getEntriesByName(link.href).some(entry => entry.responseEnd > 0) && (!link.media || browser.matchMedia(link.media).matches))
        .map(link => settled(link, ['load', 'error'], signal));
    await Promise.race([Promise.all(styles), settled(signal, ['abort'], signal)]);
    if (signal?.aborted) return false;

    // Styles can introduce new background images and fonts (especially in the
    // landing preview iframe), so inspect those only after CSS has settled.
    const images = [...root.querySelectorAll('img')]
        .filter(image => image.loading !== 'lazy')
        .map(async image => {
            if (!image.complete) await settled(image, ['load', 'error'], signal);
            if (!signal?.aborted && image.naturalWidth && image.decode) {
                await Promise.race([image.decode().catch(() => {}), settled(signal, ['abort'], signal)]);
            }
        });
    const backgrounds = new Set();
    for (const element of [root, ...root.querySelectorAll('*')]) {
        if (!element.getClientRects().length) continue;
        const value = browser.getComputedStyle(element).backgroundImage;
        for (const match of value.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g)) {
            const url = (match[1] || match[2] || match[3]).trim();
            if (url && !url.startsWith('data:')) backgrounds.add(url);
        }
    }
    const backgroundImages = [...backgrounds].map(url => {
        const image = new browser.Image();
        const loaded = settled(image, ['load', 'error'], signal);
        image.src = url;
        return image.complete ? Promise.resolve() : loaded;
    });
    const fonts = doc.fonts?.ready?.catch(() => {});
    await Promise.race([
        Promise.all([...images, ...backgroundImages, fonts]),
        settled(signal, ['abort'], signal),
    ]);
    if (signal?.aborted) return false;
    await painted(browser, signal);
    return !signal?.aborted;
}

// Only opted-in foreground visits own the screen; regular app navigation keeps
// its AJAX progress indicator, and stale requests cannot release a newer one.
export function trackPageVisits(router, onPendingChange, shouldTrack = () => true) {
    let activeId = null;
    let leavingDocument = false;
    const removeStart = router.on('start', ({ detail: { visit } }) => {
        if (!shouldTrack(visit) || visit.async || visit.prefetch || visit.showProgress === false) return;
        activeId = visit.id;
        onPendingChange(true);
    });
    const removeFinish = router.on('finish', ({ detail: { visit } }) => {
        if (leavingDocument || activeId === null || visit.id !== activeId) return;
        activeId = null;
        onPendingChange(false);
    });
    const removeLocation = router.on('location', () => {
        if (!shouldTrack()) return;
        // Login deliberately redirects via Inertia::location. Its POST finishing
        // does not mean the destination document has downloaded yet.
        leavingDocument = true;
        onPendingChange(true);
    });
    return () => { removeStart(); removeFinish(); removeLocation(); };
}
