import { usePage } from '@inertiajs/react';
import { createContext, useState } from 'react';

export const IntroNavigationContext = createContext(true);

const publicPages = new Set(['Landing', 'Guest/Facilities', 'Guest/About']);

// This persistent Inertia layout tracks committed pages, including Back/Forward.
// A new document starts fresh, so refreshes and visits from another browser tab
// still get the intro without storing a permanent "already seen" preference.
export default function IntroNavigation({ children }) {
    const page = usePage();
    const [navigation, setNavigation] = useState({ page, previousComponent: null });

    if (navigation.page !== page) {
        setNavigation({ page, previousComponent: navigation.page.component });
    }

    const allowIntro = !(publicPages.has(navigation.previousComponent) && publicPages.has(page.component));

    return <IntroNavigationContext.Provider value={allowIntro}>{children}</IntroNavigationContext.Provider>;
}
