import { router } from '@inertiajs/react';
import { AnimatePresence } from 'motion/react';
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RadialLoadingOverlay } from './IntroOverlay';
import { trackPageVisits, waitForPageReady } from '../lib/pageReady';

const PageReadyContext = createContext(true);
export const usePageReady = () => useContext(PageReadyContext);

export default function PageLoadingBoundary({ page, previousComponent, children }) {
    const appPage = /^(User|Admin)\//.test(page.component);
    const internalNavigation = appPage && /^(User|Admin)\//.test(previousComponent || '');
    const enabled = page.component === 'Login' || (appPage && !internalNavigation);
    const rootRef = useRef(null);
    const pageRef = useRef(page);
    const focusRef = useRef(null);
    const [pending, setPending] = useState(false);
    const [readyPage, setReadyPage] = useState(null);
    const ready = !enabled || (!pending && readyPage === page);

    useEffect(() => trackPageVisits(router, value => {
        if (value) setReadyPage(null);
        setPending(value);
    }, () => pageRef.current.component === 'Login'), []);

    useLayoutEffect(() => { pageRef.current = page; }, [page]);

    useLayoutEffect(() => {
        document.getElementById('page-loading-boot')?.remove();
    }, []);

    useEffect(() => {
        if (!enabled || pending) return;
        const controller = new AbortController();
        waitForPageReady(rootRef.current, { signal: controller.signal }).then(loaded => {
            if (loaded) setReadyPage(page);
        });
        return () => controller.abort();
    }, [page, enabled, pending]);

    useEffect(() => {
        if (ready) {
            const previous = focusRef.current;
            if (previous?.isConnected && rootRef.current.contains(previous)) previous.focus({ preventScroll: true });
            else if (page.component === 'Login') rootRef.current.querySelector('#email')?.focus({ preventScroll: true });
            return;
        }
        if (rootRef.current.contains(document.activeElement)) focusRef.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [ready, page.component]);

    return <PageReadyContext.Provider value={ready}>
        <div ref={rootRef} style={{ display: 'contents' }} data-page-ready={ready} inert={!ready || undefined} aria-busy={!ready || undefined}>{children}</div>
        <AnimatePresence>{!ready && <RadialLoadingOverlay key="page-loading" />}</AnimatePresence>
    </PageReadyContext.Provider>;
}
