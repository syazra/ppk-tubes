/**
 * Inertia encryption requires Web Crypto (HTTPS or a trusted local origin).
 * Elsewhere, keep private pages out of browser history and refetch them on Back.
 */
export function prepareSessionHistory(initialPage, { http, browser = window }) {
    let protectedDocument = Boolean(initialPage.props?.auth?.user);

    function revalidate() {
        browser.document.documentElement.style.visibility = 'hidden';
        browser.location.reload();
    }

    browser.document.addEventListener('inertia:navigate', event => {
        protectedDocument = Boolean(event.detail.page.props?.auth?.user);
    });

    browser.addEventListener('popstate', event => {
        const page = event.state?.page;
        if (page instanceof (browser.ArrayBuffer ?? ArrayBuffer) || page?.props?.auth?.user) {
            // A retained encryption key does not establish that the server session is valid.
            event.stopImmediatePropagation();
            revalidate();
        }
    });

    browser.addEventListener('pageshow', event => {
        if (event.persisted && protectedDocument) {
            event.stopImmediatePropagation();
            revalidate();
        }
    });

    if (browser.crypto?.subtle) return initialPage;

    for (const method of ['pushState', 'replaceState']) {
        const native = browser.history[method];
        browser.history[method] = function (data, ...args) {
            const page = data?.page;
            if (page?.props?.auth) protectedDocument = Boolean(page.props.auth.user);

            if (page?.props?.auth?.user) {
                // Preserve other history metadata without modifying Inertia's live page.
                const publicState = { ...data };
                delete publicState.page;
                return native.call(this, publicState, ...args);
            }

            return native.call(this, data, ...args);
        };
    }

    // Also remove a current plaintext entry left by an earlier application version.
    if (browser.history.state?.page?.props?.auth?.user) {
        browser.history.replaceState(browser.history.state, '');
    }

    http.onResponse(response => {
        if (!response.headers['x-inertia']) return response;

        let page = response.data;
        if (typeof page === 'string') {
            try { page = JSON.parse(page); } catch { return response; }
        }

        if (!page?.component || !page.props) return response;

        return { ...response, data: { ...page, encryptHistory: false } };
    });

    return { ...initialPage, encryptHistory: false };
}
