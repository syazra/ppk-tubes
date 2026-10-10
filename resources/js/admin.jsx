import { getInitialPageFromDOM } from '@inertiajs/core';
import { createInertiaApp, http } from '@inertiajs/react';
import { prepareSessionHistory } from './lib/sessionHistory';
import IntroNavigation from './components/IntroNavigation';

createInertiaApp({
    page: prepareSessionHistory(getInitialPageFromDOM('app'), { http }),
    layout: () => IntroNavigation,
});
