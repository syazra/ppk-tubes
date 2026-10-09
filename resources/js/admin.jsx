import { getInitialPageFromDOM } from '@inertiajs/core';
import { createInertiaApp, http } from '@inertiajs/react';
import { prepareSessionHistory } from './lib/sessionHistory';

createInertiaApp({
    page: prepareSessionHistory(getInitialPageFromDOM('app'), { http }),
});
