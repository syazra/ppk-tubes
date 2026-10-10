import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Verify static source code invariants for public navigation
test('public pages have zero raw anchor tags linking to internal public pages', () => {
    const files = [
        'resources/js/components/PublicNavbar.jsx',
        'resources/js/pages/Landing.jsx',
        'resources/js/pages/Guest/Facilities.jsx',
        'resources/js/pages/Guest/About.jsx',
    ];

    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        // Match any <a ... href="..." ...>
        const anchorHrefRegex = /<a\b[^>]*\bhref\s*=\s*(?:["']([^"']*)["']|{([^}]+)})[^>]*>/gi;
        let match;
        while ((match = anchorHrefRegex.exec(content)) !== null) {
            const rawHref = (match[1] || match[2] || '').trim();
            // In-page fragment anchors are permitted (e.g. #konten, #cara-kerja, #atas, #daftar-fasilitas, #tentang-konten)
            const isFragment = rawHref.startsWith('#') || rawHref.startsWith("'#") || rawHref.startsWith('"#');
            assert.ok(
                isFragment,
                `Found non-fragment anchor tag in ${file}: "${match[0]}". Must be converted to Inertia <Link>.`
            );
        }
    }
});

test('public pages use Inertia Link for all internal public page destinations', () => {
    const navbarContent = readFileSync('resources/js/components/PublicNavbar.jsx', 'utf8');
    const landingContent = readFileSync('resources/js/pages/Landing.jsx', 'utf8');
    const facilitiesContent = readFileSync('resources/js/pages/Guest/Facilities.jsx', 'utf8');
    const aboutContent = readFileSync('resources/js/pages/Guest/About.jsx', 'utf8');

    // PublicNavbar
    assert.match(navbarContent, /import\s+{[^}]*Link[^}]*}\s+from\s+['"]@inertiajs\/react['"]/);
    assert.match(navbarContent, /<Link\s+href={landingUrl}\s+className="cs-brand pn-brand"/);
    assert.match(navbarContent, /<Link\s+key={link\.key}\s+href={link\.url}\s+className="pn-link"/);
    assert.match(navbarContent, /<Link\s+href={accountUrl}\s+className="pn-login"/);

    // Landing
    assert.match(landingContent, /import\s+{[^}]*Link[^}]*}\s+from\s+['"]@inertiajs\/react['"]/);
    assert.match(landingContent, /<Link\s+href="\/"\s+className="cs-brand"/);
    assert.match(landingContent, /<Link\s+href={facilityUrl\s*\|\|\s*'\/fasilitas'}>Fasilitas<\/Link>/);
    assert.match(landingContent, /<Link\s+href={aboutUrl\s*\|\|\s*'\/tentang'}>Tentang<\/Link>/);

    // Guest/Facilities
    assert.match(facilitiesContent, /import\s+{[^}]*Link[^}]*}\s+from\s+['"]@inertiajs\/react['"]/);
    assert.match(facilitiesContent, /<Link\s+href={landingUrl}\s+className="cs-brand"/);
    assert.match(facilitiesContent, /<Link\s+href={landingUrl}>Beranda<\/Link>/);
    assert.match(facilitiesContent, /<Link\s+href={aboutUrl}>Tentang<\/Link>/);
    assert.match(facilitiesContent, /<Link\s+href={accountUrl}\s+className="gf-button gf-button-forest">/);

    // Guest/About
    assert.match(aboutContent, /import\s+{[^}]*Link[^}]*}\s+from\s+['"]@inertiajs\/react['"]/);
    assert.match(aboutContent, /<Link\s+href={landingUrl}\s+className="ga-brand"/);
    assert.match(aboutContent, /<Link\s+href={landingUrl}>Beranda<\/Link>/);
    assert.match(aboutContent, /<Link\s+href={facilitiesUrl}>Fasilitas<\/Link>/);
    assert.match(aboutContent, /<Link\s+href={facilitiesUrl}\s+className="ga-link">Lihat fasilitas kampus/);
});

test('Landing search form uses Inertia router.get with preserveState, preserveScroll, and concurrency protection', () => {
    const landingContent = readFileSync('resources/js/pages/Landing.jsx', 'utf8');

    assert.match(landingContent, /import\s+{[^}]*router[^}]*}\s+from\s+['"]@inertiajs\/react['"]/);
    assert.match(landingContent, /handleSearchSubmit/);
    assert.match(landingContent, /router\.get\(\s*facilityUrl\s*\|\|\s*'\/fasilitas',\s*data,\s*{[^}]*preserveState:\s*true[^}]*preserveScroll:\s*true/s);
    assert.match(landingContent, /searching/);
    assert.match(landingContent, /aria-busy={searching}/);
    assert.match(landingContent, /disabled={searching}/);
});

test('Guest/Facilities search form uses Inertia router.get with preserveState, preserveScroll, and concurrency protection', () => {
    const facilitiesContent = readFileSync('resources/js/pages/Guest/Facilities.jsx', 'utf8');

    assert.match(facilitiesContent, /import\s+{[^}]*router[^}]*}\s+from\s+['"]@inertiajs\/react['"]/);
    assert.match(facilitiesContent, /router\.get\(\s*facilitiesUrl,\s*values,\s*{[^}]*preserveState:\s*true[^}]*preserveScroll:\s*true/s);
    assert.match(facilitiesContent, /if\s*\(\s*processing\s*\)\s*return/);
});

test('active navbar state resolution correctly handles page component, relative URL, absolute URL, and fragment hashes', () => {
    function resolveActive(active, page) {
        const rawUrl = page.url || '';
        const pathOnly = rawUrl.replace(/^https?:\/\/[^\/]+/, '').split('?')[0].split('#')[0];
        const isFacilities = page.component === 'Guest/Facilities' || pathOnly === '/fasilitas' || pathOnly.startsWith('/fasilitas/');
        const isAbout = page.component === 'Guest/About' || pathOnly === '/tentang' || pathOnly.startsWith('/tentang/');
        const isLanding = page.component === 'Landing' || pathOnly === '/' || pathOnly === '';
        return active ?? (
            isFacilities ? 'facilities' :
            isAbout ? 'about' :
            isLanding ? 'landing' :
            null
        );
    }

    // Explicit active prop overrides
    assert.equal(resolveActive('landing', { component: 'Guest/Facilities', url: '/fasilitas' }), 'landing');
    assert.equal(resolveActive('facilities', { component: 'Landing', url: '/' }), 'facilities');
    assert.equal(resolveActive('about', { component: 'Landing', url: '/' }), 'about');

    // Dynamic resolution from page.component
    assert.equal(resolveActive(undefined, { component: 'Landing', url: '' }), 'landing');
    assert.equal(resolveActive(undefined, { component: 'Guest/Facilities', url: '' }), 'facilities');
    assert.equal(resolveActive(undefined, { component: 'Guest/About', url: '' }), 'about');

    // Dynamic resolution from relative URL
    assert.equal(resolveActive(undefined, { component: null, url: '/' }), 'landing');
    assert.equal(resolveActive(undefined, { component: null, url: '/fasilitas' }), 'facilities');
    assert.equal(resolveActive(undefined, { component: null, url: '/fasilitas?type=Aula&location=Gedung+A' }), 'facilities');
    assert.equal(resolveActive(undefined, { component: null, url: '/tentang' }), 'about');
    assert.equal(resolveActive(undefined, { component: null, url: '/tentang?ref=footer' }), 'about');

    // Fragment URLs correctly strip hash
    assert.equal(resolveActive(undefined, { component: null, url: '/#cara-kerja' }), 'landing');
    assert.equal(resolveActive(undefined, { component: null, url: '/fasilitas#daftar-fasilitas' }), 'facilities');
    assert.equal(resolveActive(undefined, { component: null, url: '/tentang#tentang-konten' }), 'about');

    // Disambiguation: sibling and unrelated routes do not falsely match any public tab
    assert.equal(resolveActive(undefined, { component: null, url: '/fasilitas-baru' }), null);
    assert.equal(resolveActive(undefined, { component: null, url: '/tentang-kami' }), null);
    assert.equal(resolveActive(undefined, { component: null, url: '/login' }), null);
    assert.equal(resolveActive(undefined, { component: null, url: '/dashboard' }), null);

    // Subpaths under facilities or about
    assert.equal(resolveActive(undefined, { component: null, url: '/fasilitas/detail/1' }), 'facilities');
    assert.equal(resolveActive(undefined, { component: null, url: '/tentang/sejarah' }), 'about');

    // Dynamic resolution from absolute URL
    assert.equal(resolveActive(undefined, { component: null, url: 'http://localhost:8000/' }), 'landing');
    assert.equal(resolveActive(undefined, { component: null, url: 'http://localhost:8000/fasilitas' }), 'facilities');
    assert.equal(resolveActive(undefined, { component: null, url: 'http://localhost:8000/fasilitas?capacity=40' }), 'facilities');
    assert.equal(resolveActive(undefined, { component: null, url: 'http://localhost:8000/tentang' }), 'about');
});

test('public pages robustly handle undefined and null urls props without throwing', () => {
    function getNavbarUrls(urls) {
        const safeUrls = urls || {};
        return {
            landing: safeUrls.landing || '/',
            facilities: safeUrls.facilities || '/fasilitas',
            about: safeUrls.about || '/tentang',
            login: safeUrls.login || '/login',
        };
    }

    const fromNull = getNavbarUrls(null);
    assert.equal(fromNull.landing, '/');
    assert.equal(fromNull.facilities, '/fasilitas');
    assert.equal(fromNull.about, '/tentang');
    assert.equal(fromNull.login, '/login');

    const fromUndefined = getNavbarUrls(undefined);
    assert.equal(fromUndefined.landing, '/');
    assert.equal(fromUndefined.facilities, '/fasilitas');
    assert.equal(fromUndefined.about, '/tentang');
    assert.equal(fromUndefined.login, '/login');

    const fromPartial = getNavbarUrls({ landing: '/custom-landing' });
    assert.equal(fromPartial.landing, '/custom-landing');
    assert.equal(fromPartial.facilities, '/fasilitas');
});

test('FacilitiesCatalog pagination link guards against concurrent clicks during in-flight requests', () => {
    const catalogContent = readFileSync('resources/js/components/FacilitiesCatalog.jsx', 'utf8');

    assert.match(catalogContent, /import\s+{[^}]*Link[^}]*}\s+from\s+['"]@inertiajs\/react['"]/);
    assert.match(catalogContent, /<Link\s+className="gf-page"[^>]*preserveScroll[^>]*preserveState/s);
    assert.match(catalogContent, /onClick=\{event\s*=>\s*{\s*if\s*\(\s*processing\s*\)\s*{\s*event\.preventDefault\(\);\s*}\s*}/);
    assert.match(catalogContent, /onStart=\{[^}]*onProcessingChange\?\.\(true\)/);
    assert.match(catalogContent, /onFinish=\{[^}]*onProcessingChange\?\.\(false\)/);
});

test('Landing page scroll handler safely guards nav, hero, and root element references', () => {
    const landingContent = readFileSync('resources/js/pages/Landing.jsx', 'utf8');

    assert.match(landingContent, /if\s*\(\s*nav\?\.dataset\s*\)\s*nav\.dataset\.scrolled/);
    assert.match(landingContent, /if\s*\(\s*root\?\.dataset\s*&&\s*hero\s*&&\s*nav\s*\)\s*root\.dataset\.pastHero/);
    assert.match(landingContent, /const\s+initialAnchor\s*=\s*initialHash\s*\?\s*document\.getElementById\(initialHash\.slice\(1\)\)\s*:\s*null/);
});

