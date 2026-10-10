import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import heroBackground from '../../images/landing-botanical.webp';
import oggRegular from '../../fonts/ogg-regular.otf';
import oggItalic from '../../fonts/ogg-regular-italic.otf';
import Icon from '../components/Icons';
import PublicBrand from '../components/PublicBrand';
import PublicNavbar from '../components/PublicNavbar';
import IntroOverlay, { INTRO_DELAY, useIntro } from '../components/IntroOverlay';
import UserPagePreview from '../components/UserPagePreview';
import MagneticLink from '../components/MagneticLink';

const styles = `
@font-face { font-family: 'Buana Ogg'; src: url('${oggRegular}') format('opentype'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Buana Ogg'; src: url('${oggItalic}') format('opentype'); font-weight: 400; font-style: italic; font-display: swap; }
.cs {
    --forest: #003b33; --deep: #062e29; --teal: #007f6d;
    --lime: #d3e9a6; --paper: #f8f9f3; --ink: #163f35; --muted: #5b6e62;
    background: var(--paper); color: var(--ink);
    font-family: Figtree, ui-sans-serif, system-ui, sans-serif; line-height: 1.6; overflow: clip;
}
.cs * { box-sizing: border-box; }
.cs a { color: inherit; text-decoration: none; }
.cs button { font: inherit; }
.cs svg { display: block; }
.cs h1, .cs h2, .cs h3, .cs p, .cs figure { margin: 0; }
.cs ::selection { background: var(--lime); color: var(--forest); }
.cs :focus-visible { outline: 3px solid var(--teal); outline-offset: 5px; }
.cs .cs-dark :focus-visible { outline-color: var(--lime); }
.cs .cs-reservation-preview :focus-visible { outline-color: var(--teal); }
.cs-wrap { width: min(1240px, calc(100% - 96px)); margin-inline: auto; }
.cs-serif { font-family: 'Buana Ogg', Georgia, 'Times New Roman', serif; font-weight: 400; letter-spacing: -.035em; }
.cs-section { padding-block: 100px; scroll-margin-top: 104px; }
.cs-section-title { font-size: clamp(36px, 3.8vw, 52px); line-height: 1.2; }
.cs-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 20px !important; color: var(--teal); font-size: 11px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; }
.cs-eyebrow:before { content: ''; width: 24px; height: 1px; background: currentColor; }
.cs-reveal { transition: opacity .65s ease, translate .65s cubic-bezier(.22, 1, .36, 1); transition-delay: var(--reveal-delay, 0ms); }
.cs-reveal[data-reveal="pending"] { opacity: 0; translate: 0 20px; transition: none; }
.cs-reveal[data-reveal="visible"] { opacity: 1; translate: 0 0; transition-delay: var(--reveal-delay, 0ms); }
.cs-copy { color: var(--muted); font-size: 16px; line-height: 1.8; }
.cs-icon { width: 24px; height: 24px; flex: none; }
.cs-arrow { width: 18px; height: 18px; }
.public-magnetic { display: inline-flex; max-width: 100%; }
.cs-button { display: inline-flex; align-items: center; justify-content: center; gap: 20px; min-height: 50px; padding: 13px 24px; border: 1px solid transparent; border-radius: 8px; font-size: 14px; font-weight: 600; transition: background .2s, box-shadow .2s, transform .2s; }
.cs-button-primary { background: var(--lime); color: var(--forest) !important; }
.cs-button-primary:hover { background: #e2f2c1; box-shadow: 0 5px 18px #001e231a; transform: translateY(-2px); }
.cs-button-secondary { background: #ffffff05; border-color: #ffffff35; color: var(--paper); }
.cs-button-secondary:hover { background: #ffffff12; border-color: #ffffff60; }
.cs-button .cs-arrow, .cs-feature-link .cs-arrow { transition: transform .2s ease; }
.cs-button:hover .cs-arrow, .cs-feature-link:hover .cs-arrow { transform: translateX(3px); }
.cs-button-secondary:hover .cs-arrow { transform: translateY(3px); }
.cs-button:active { transform: translateY(0); }
.cs-skip { position: fixed; top: 8px; left: 12px; z-index: 100; padding: 12px 20px; background: var(--lime); transform: translateY(-160%); }
.cs-skip:focus { transform: none; }
.cs main { scroll-margin-top: 82px; }
.cs .pn { animation: cs-nav-in .7s calc(var(--intro, 0s) + .05s) cubic-bezier(.22, 1, .36, 1) both; }
.cs-reading-progress { position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--lime); transform: scaleX(0); transform-origin: left; pointer-events: none; }
.cs-brand { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; font-size: 23px; font-weight: 600; letter-spacing: -.8px; }
.cs-brand-mark { width: 32px; height: 32px; flex: none; color: var(--lime); }
.cs-brand span span { font-weight: 400; }
.cs-brand-mark { transition: transform .25s ease; }
.cs-brand:hover .cs-brand-mark { transform: rotate(-6deg); }
.cs-hero { position: relative; background: linear-gradient(90deg, #073c3594, #073c3538 70%), url('${heroBackground}') center / cover no-repeat; color: var(--paper); overflow: hidden; }
.cs-hero:before { content: ''; position: absolute; inset: 0; background: linear-gradient(120deg, #ffffff0d, #d8ece306 55%, #073c3514); pointer-events: none; }
.cs-hero:after { content: ''; position: absolute; inset: auto 0 0; height: 120px; background: linear-gradient(transparent, #073c3538); pointer-events: none; }
.cs-hero-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1.04fr; align-items: center; gap: 64px; padding-block: 130px 72px; min-height: 100vh; min-height: 100svh; }
.cs-hero .cs-eyebrow { color: #e3efcf; margin-bottom: 27px !important; }
.cs-hero-content > * { animation: cs-arrive .75s cubic-bezier(.22, 1, .36, 1) both; animation-delay: var(--intro, 0s); }
.cs-hero-content > :nth-child(2) { animation-delay: calc(var(--intro, 0s) + .06s); }
.cs-hero-content > :nth-child(3) { animation-delay: calc(var(--intro, 0s) + .12s); }
.cs-hero-content > :nth-child(4) { animation-delay: calc(var(--intro, 0s) + .18s); }
.cs-hero-content > :nth-child(5) { animation-delay: calc(var(--intro, 0s) + .24s); }
.cs-hero h1 { font-size: clamp(60px, 6.3vw, 86px); line-height: 1.08; margin-bottom: 28px; text-shadow: 0 2px 24px #00362d20; }
.cs-hero h1 em { color: #d6ebb4; font-weight: 400; }
.cs-hero-copy { max-width: 405px; color: #edf2e8; font-size: 16px; line-height: 1.85; }
.cs-hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
.cs-hero-note { display: flex; align-items: center; gap: 7px; margin-top: 22px !important; color: #e0e9dc; font-size: 12px; }
.cs-hero-note svg { width: 14px; height: 14px; }
.cs-art { position: relative; min-width: 0; animation: cs-arrive .9s calc(var(--intro, 0s) + .18s) cubic-bezier(.22, 1, .36, 1) both; }
.cs[data-intro="skip"] .pn, .cs[data-intro="skip"] .cs-hero-content > *, .cs[data-intro="skip"] .cs-art { animation: none; }
.cs-reservation-preview { position: relative; width: 100%; background: #f7fbef; color: var(--ink); border: 1px solid #d5e1cc; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 64px #002c3045; }
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .cs-hero:before { -webkit-backdrop-filter: blur(6px) saturate(115%); backdrop-filter: blur(6px) saturate(115%); }
}
.cs-heading-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 60px; margin-bottom: 32px; }
.cs-heading-row .cs-copy { max-width: 400px; }
.cs-facilities { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
.cs-facility { display: flex; align-items: center; gap: 9px; padding: 9px 15px; background: #edf1e5; border: 1px solid #dde5d6; border-radius: 30px; font-size: 12px; color: #47604c; transition: background .2s, border-color .2s; }
.cs-facility svg { width: 18px; height: 18px; }
.cs-facility-search { display: grid; grid-template-columns: 1fr 1fr .8fr auto; gap: 16px; align-items: end; padding: 24px; margin-bottom: 32px; background: #edf1e5; border: 1px solid #dde5d6; border-radius: 16px; }
.cs-facility-search label { display: grid; gap: 8px; font-size: 13px; font-weight: 600; }
.cs-facility-search input, .cs-facility-search select { width: 100%; min-width: 0; min-height: 50px; border: 1px solid #bccdb4; border-radius: 8px; background: white; color: var(--ink); padding: 10px 12px; font: inherit; font-weight: 400; }
.cs-facility-search .cs-button { background: var(--teal); color: white !important; cursor: pointer; }
.cs-facility-search .cs-button:hover { background: var(--forest); }
.cs-feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.cs-feature { display: flex; flex-direction: column; align-items: flex-start; padding: 32px; background: #ffffff90; border: 1px solid #dfe6d8; border-radius: 16px; transition: opacity .65s ease, translate .65s cubic-bezier(.22, 1, .36, 1), transform .25s ease, border-color .25s, box-shadow .25s; }
.cs-feature > .cs-icon { box-sizing: content-box; padding: 12px; color: var(--teal); background: #eaf1e3; border-radius: 12px; margin-bottom: 24px; transition: transform .25s ease, background .25s; }
.cs-feature h3 { font-size: 23px; font-weight: 600; letter-spacing: -.5px; margin-bottom: 12px; }
.cs-feature p { font-size: 15px; color: var(--muted); line-height: 1.8; max-width: 480px; }
.cs-feature-link { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; margin-top: auto; padding-top: 22px; color: var(--teal) !important; font-size: 13px; font-weight: 600; text-underline-offset: 4px; }
.cs-feature-link:hover { text-decoration: underline; }
.cs-journey { background: #edf1e6; border-block: 1px solid #dfe6d7; }
.cs-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 38px; padding: 0; list-style: none; }
.cs-step { padding-top: 24px; border-top: 1px solid #bccdb4; transition: opacity .65s ease, translate .65s cubic-bezier(.22, 1, .36, 1), border-color .25s; }
.cs-step-number { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border: 1px solid #c4d2bb; border-radius: 50%; color: var(--teal); font-size: 12px; margin-bottom: 22px; transition: background .25s, border-color .25s; }
.cs-step h3 { font-size: 19px; font-weight: 600; letter-spacing: -.3px; margin-bottom: 12px; }
.cs-step p { font-size: 14px; line-height: 1.8; color: var(--muted); }
.cs-final { background: radial-gradient(ellipse at 85% 100%, #24594b70, transparent 65%), var(--deep); color: var(--paper); padding-block: 80px; }
.cs-final .cs-wrap { display: flex; justify-content: space-between; align-items: center; gap: 35px; }
.cs-final h2 { font-size: clamp(34px, 3.7vw, 48px); line-height: 1.2; margin-bottom: 16px; max-width: 670px; }
.cs-final p { font-size: 14px; color: #bdcec3; }
.cs-final .cs-button { flex: none; }
.cs-footer { background: var(--deep); color: #b0c2b4; }
.cs-footer-inner { padding-block: 28px; border-top: 1px solid #ffffff20; display: flex; justify-content: space-between; gap: 25px; align-items: center; }
.cs-footer .cs-brand { font-size: 19px; color: var(--paper); }
.cs-footer .cs-brand-mark { width: 26px; height: 26px; }
.cs-footer p { font-size: 12px; }
.cs-footer-links { display: flex; gap: 22px; font-size: 12px; }
.cs-footer-links a:hover { color: var(--lime); }
.cs-back-top { position: fixed; right: 24px; bottom: 24px; z-index: 20; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid #ffffff26; border-radius: 50%; background: var(--forest); color: var(--lime) !important; box-shadow: 0 5px 20px #003b3326; opacity: 0; visibility: hidden; pointer-events: none; transform: translateY(12px); transition: opacity .2s, visibility .2s, transform .2s, background .2s; }
.cs[data-past-hero="true"] .cs-back-top { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); }
.cs-back-top:hover { background: var(--teal); }
.cs-back-top .cs-arrow { transform: rotate(180deg); }
@keyframes cs-nav-in { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
@keyframes cs-arrive { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@media (hover: hover) and (pointer: fine) {
    .cs-feature:hover, .cs-feature:focus-within { transform: translateY(-4px); border-color: #a7c7b2; box-shadow: 0 12px 32px #163f350b; }
    .cs-feature:hover > .cs-icon, .cs-feature:focus-within > .cs-icon { transform: rotate(-5deg); background: #e0eed3; }
    .cs-facility:hover { background: #e4edda; border-color: #c4d5b8; }
    .cs-step:hover { border-top-color: var(--teal); }
    .cs-step:hover .cs-step-number { background: #e0eed3; border-color: #adc59b; }
}
@media (max-width: 1050px) {
    .cs-wrap { width: calc(100% - 64px); }
    .cs-hero-grid { gap: 32px; }
    .cs-hero h1 { font-size: 62px; }
    .cs-heading-row { gap: 35px; }
}
@media (max-width: 900px) {
    .cs-wrap { width: calc(100% - 40px); }
    .cs-section { padding-block: 64px; scroll-margin-top: 92px; }
    .cs-brand { font-size: 21px; }
    .cs-brand-mark { width: 29px; height: 29px; }
    .cs-hero { background-position: center, 45% center; }
    .cs-hero-grid { grid-template-columns: 1fr; padding-block: 124px 56px; gap: 42px; }
    .cs-hero .cs-eyebrow { margin-bottom: 22px !important; }
    .cs-hero h1 { font-size: clamp(49px, 10.5vw, 76px); margin-bottom: 24px; }
    .cs-hero-copy { max-width: 480px; }
    .cs-hero-actions { gap: 10px; }
    .cs-hero-actions .cs-button { padding-inline: 18px; gap: 12px; font-size: 13px; }
    .cs-art { width: min(490px, 100%); margin-inline: auto; }
    .cs-heading-row { display: block; margin-bottom: 28px; }
    .cs-heading-row .cs-copy { margin-top: 20px; max-width: 480px; }
    .cs-feature-grid, .cs-steps { grid-template-columns: 1fr; gap: 28px; }
    .cs-facility-search { grid-template-columns: 1fr; padding: 20px; }
    .cs-feature { padding: 26px; }
    .cs-facilities { gap: 8px; }
    .cs-facility { font-size: 12px; }
    .cs-steps { margin-top: 30px; }
    .cs-step { padding: 24px 0 0 54px; position: relative; }
    .cs-step-number { position: absolute; top: 24px; left: 0; }
    .cs-final .cs-wrap { align-items: flex-start; flex-direction: column; gap: 24px; }
    .cs-footer-inner { flex-wrap: wrap; }
    .cs-footer p { order: 3; width: 100%; }
    .cs-footer-links { gap: 17px; }
    .cs-back-top { right: 16px; bottom: 18px; }
}
@media (max-width: 380px) {
    .cs-brand { font-size: 18px; gap: 6px; }
    .cs-brand-mark { width: 26px; }
    .cs-hero h1 { font-size: clamp(40px, 13vw, 47px); }
    .cs-hero-actions .cs-button { padding-inline: 14px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
    .cs *, .cs *:before, .cs *:after { animation: none !important; transition: none !important; }
    .cs-reveal[data-reveal="pending"] { opacity: 1; translate: none; }
    .cs-feature:hover, .cs-feature:focus-within, .cs-feature:hover > .cs-icon, .cs-feature:focus-within > .cs-icon, .cs-button:hover, .cs-button:hover .cs-arrow, .cs-feature-link:hover .cs-arrow, .cs-brand:hover .cs-brand-mark { transform: none; }
}
@media (forced-colors: active) {
    .cs-button, .cs-reservation-preview, .cs-facility, .cs-feature { border: 1px solid ButtonText; }
    .cs-reservation-preview { background: Canvas; color: CanvasText; }
    .cs-hero { background: Canvas; color: CanvasText; }
}
`;

const facilities = [['landing-room', 'Ruang kelas'], ['hall', 'Aula'], ['lab', 'Laboratorium'], ['field', 'Lapangan']];
const features = [
    { icon: 'landing-calendar', title: 'Reservasi fasilitas', text: 'Pilih fasilitas dan tanggal, periksa jadwal yang tersedia, lalu ajukan peminjaman. Lihat status pengajuan dan tiket peminjaman di halaman Reservasi Saya.', action: 'reservation', actionLabel: 'Ajukan reservasi' },
    { icon: 'tool', title: 'Laporan kerusakan', text: 'Pilih fasilitas yang bermasalah dan jelaskan kondisinya. Laporan masuk ke petugas agar dapat diperiksa dan ditindaklanjuti.', action: 'login', actionLabel: 'Masuk untuk melapor' },
];
const steps = [
    ['Pilih fasilitas dan jadwal', 'Masuk dengan akun kampus. Pada form reservasi, pilih ruangan dan tanggal untuk melihat ketersediaan waktu.'],
    ['Lengkapi pengajuan', 'Isi tujuan penggunaan dan pilih rentang waktu yang dibutuhkan, lalu kirim pengajuan.'],
    ['Periksa status reservasi', 'Buka Reservasi Saya untuk melihat hasil peninjauan. Jika disetujui, tiket peminjaman dapat dibuka dari daftar tersebut.'],
];
export default function Landing({ loginUrl, createReservationUrl, reservationActionLabel, reportUrl, reportActionLabel, facilityUrl, aboutUrl, facilityTypes = [], facilityLocations = [] }) {
    const intro = useIntro();
    const [searching, setSearching] = useState(false);
    const rootRef = useRef(null);
    const navRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        const previousLanguage = document.documentElement.lang;
        document.documentElement.lang = 'id';
        return () => { document.documentElement.lang = previousLanguage; };
    }, []);

    useEffect(() => {
        const root = rootRef.current;
        const nav = navRef.current;
        const hero = root.querySelector('.cs-hero');
        const revealElements = [...root.querySelectorAll('.cs-reveal')];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        let observer;
        let frame = null;
        let anchorFrame = null;

        const showElement = element => {
            element.dataset.reveal = 'visible';
            observer?.unobserve(element);
        };
        const updateMotionPreference = () => {
            document.documentElement.style.scrollBehavior = reducedMotion.matches ? 'auto' : 'smooth';
            if (reducedMotion.matches) {
                revealElements.forEach(showElement);
                observer?.disconnect();
            }
        };
        updateMotionPreference();

        if (!reducedMotion.matches && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(entries => {
                entries.forEach(entry => { if (entry.isIntersecting) showElement(entry.target); });
            }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
            revealElements.forEach(element => {
                // Keep initially visible content readable, including direct section links.
                if (element.getBoundingClientRect().top < window.innerHeight - 48) {
                    showElement(element);
                } else {
                    element.dataset.reveal = 'pending';
                    observer.observe(element);
                }
            });
        }

        const revealFocusedContent = event => {
            const element = event.target.closest('.cs-reveal');
            if (element) showElement(element);
        };
        const updateScroll = () => {
            frame = null;
            const distance = document.documentElement.scrollHeight - window.innerHeight;
            const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
            progressRef.current?.style.setProperty('transform', `scaleX(${progress})`);
            if (nav?.dataset) nav.dataset.scrolled = String(window.scrollY > 16);
            if (root?.dataset && hero && nav) root.dataset.pastHero = String(hero.getBoundingClientRect().bottom < nav.offsetHeight + 40);
        };
        const scheduleScrollUpdate = () => {
            if (frame === null) frame = window.requestAnimationFrame(updateScroll);
        };

        // Apply the URL fragment after Inertia restores its saved scroll position.
        const initialHash = window.location.hash;
        const initialAnchor = initialHash ? document.getElementById(initialHash.slice(1)) : null;
        if (initialAnchor && root?.contains(initialAnchor)) {
            anchorFrame = window.requestAnimationFrame(() => {
                anchorFrame = window.requestAnimationFrame(() => {
                    anchorFrame = null;
                    if (window.location.hash !== initialHash) return;
                    document.documentElement.style.scrollBehavior = 'auto';
                    initialAnchor.scrollIntoView({ behavior: 'auto', block: 'start' });
                    updateMotionPreference();
                    scheduleScrollUpdate();
                });
            });
        }
        updateScroll();
        root.addEventListener('focusin', revealFocusedContent);
        root.addEventListener('toggle', scheduleScrollUpdate, true);
        window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
        window.addEventListener('resize', scheduleScrollUpdate);
        reducedMotion.addEventListener('change', updateMotionPreference);

        return () => {
            observer?.disconnect();
            if (frame !== null) window.cancelAnimationFrame(frame);
            if (anchorFrame !== null) window.cancelAnimationFrame(anchorFrame);
            root.removeEventListener('focusin', revealFocusedContent);
            root.removeEventListener('toggle', scheduleScrollUpdate, true);
            window.removeEventListener('scroll', scheduleScrollUpdate);
            window.removeEventListener('resize', scheduleScrollUpdate);
            reducedMotion.removeEventListener('change', updateMotionPreference);
            document.documentElement.style.scrollBehavior = previousScrollBehavior;
        };
    }, []);

    const handleSearchSubmit = event => {
        event.preventDefault();
        if (searching) return;
        const formData = new FormData(event.currentTarget);
        const data = {};
        for (const [key, value] of formData.entries()) {
            const trimmed = typeof value === 'string' ? value.trim() : value;
            if (trimmed !== '') {
                data[key] = trimmed;
            }
        }
        router.get(facilityUrl || '/fasilitas', data, {
            preserveState: true,
            preserveScroll: true,
            onStart: () => setSearching(true),
            onFinish: () => setSearching(false),
        });
    };

    return (
        <>
            <Head title="Buana — Seluruh Kampus, Satu Buana">
                <meta name="description" content="Buana (bhuvanā, “dunia”) — satu layanan untuk mengecek ketersediaan fasilitas kampus, mengajukan reservasi, dan melaporkan kerusakan." />
                <meta name="theme-color" content="#062e29" />
                <meta property="og:title" content="Buana — Seluruh Kampus, Satu Buana" />
                <meta property="og:description" content="Buana: dunia kampusmu dalam satu layanan. Reservasi dan laporan fasilitas untuk mahasiswa, dosen, dan pengelola." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="id_ID" />
                <link rel="preload" href={oggRegular} as="font" type="font/otf" crossOrigin="anonymous" />
                <link rel="preload" href={heroBackground} as="image" />
            </Head>
            <style>{styles}</style>
            <div className="cs" lang="id" id="atas" ref={rootRef} data-intro={intro ? 'play' : 'skip'} style={intro ? { '--intro': `${INTRO_DELAY}s` } : undefined}>
                {intro && <IntroOverlay />}
                <a className="cs-skip" href="#konten">Langsung ke konten</a>
                <PublicNavbar urls={{ landing: '/', facilities: facilityUrl || '/fasilitas', about: aboutUrl || '/tentang', login: loginUrl || '/login' }} active="landing" headerRef={navRef}>
                    <div className="cs-reading-progress" ref={progressRef} aria-hidden="true" />
                </PublicNavbar>

                <main id="konten" tabIndex={-1}>
                    <section className="cs-hero cs-dark" aria-labelledby="hero-title">
                        <div className="cs-wrap cs-hero-grid">
                            <div className="cs-hero-content">
                                <p className="cs-eyebrow">Bhuwana · dunia kampusmu</p>
                                <h1 id="hero-title" className="cs-serif">Seluruh Kampus,<br /><em>Satu Buana.</em></h1>
                                <p className="cs-hero-copy">Buana mengumpulkan seluruh fasilitas kampus dalam satu layanan: cek ketersediaan, ajukan reservasi, dan laporkan kerusakan.</p>
                                <div className="cs-hero-actions">
                                    <MagneticLink href={createReservationUrl || '/reservasi/form'} className="cs-button cs-button-primary">{reservationActionLabel} <Icon name="landing-arrow" className="cs-arrow" variant="landing" /></MagneticLink>
                                    <a href="#cara-kerja" className="cs-button cs-button-secondary">Cara reservasi <Icon name="down" className="cs-arrow" variant="landing" /></a>
                                </div>
                                <p className="cs-hero-note"><Icon name="landing-shield" variant="landing" />Gunakan akun yang diberikan pengelola kampus.</p>
                            </div>
                            <div className="cs-art">
                                <UserPagePreview createReservationUrl={createReservationUrl || '/reservasi/form'} reservationActionLabel={reservationActionLabel} />
                            </div>
                        </div>
                    </section>

                    <section className="cs-section" id="fasilitas" aria-labelledby="features-title">
                        <div className="cs-wrap">
                            <div className="cs-heading-row cs-reveal">
                                <div><p className="cs-eyebrow">Layanan kampus</p><h2 id="features-title" className="cs-serif cs-section-title">Fasilitas kampus,<br />lebih mudah diurus.</h2></div>
                                <p className="cs-copy">Urus peminjaman dan sampaikan masalah fasilitas tanpa harus berpindah layanan.</p>
                            </div>
                            <div className="cs-facilities cs-reveal" aria-label="Jenis fasilitas">
                                {facilities.map(([icon, label]) => <span className="cs-facility" key={label}><Icon name={icon} variant="landing" />{label}</span>)}
                            </div>
                            <form onSubmit={handleSearchSubmit} action={facilityUrl || '/fasilitas'} method="get" className="cs-facility-search cs-reveal" aria-label="Cari fasilitas kampus" aria-busy={searching}>
                                <label>Tipe fasilitas<select name="type" defaultValue=""><option value="">Semua tipe</option>{facilityTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></label>
                                <label>Lokasi<select name="location" defaultValue=""><option value="">Semua lokasi</option>{facilityLocations.map(location => <option key={location} value={location}>{location}</option>)}</select></label>
                                <label>Kapasitas minimum<input name="capacity" type="number" min="1" max="100000" placeholder="Jumlah orang" /></label>
                                <button type="submit" className="cs-button" disabled={searching}>{searching ? 'Mencari…' : 'Cari fasilitas'} <Icon name="landing-arrow" className="cs-arrow" variant="landing" /></button>
                            </form>
                            <div className="cs-feature-grid">
                                {features.map((feature, index) => <article className="cs-feature cs-reveal" key={feature.title} style={{ '--reveal-delay': `${index * 90}ms` }}><Icon name={feature.icon} variant="landing" /><h3>{feature.title}</h3><p>{feature.text}</p><Link className="cs-feature-link" href={feature.action === 'reservation' ? (createReservationUrl || '/reservasi/form') : (reportUrl || '/lapor')}>{feature.action === 'reservation' ? reservationActionLabel : reportActionLabel}<Icon name="landing-arrow" className="cs-arrow" variant="landing" /></Link></article>)}
                            </div>
                        </div>
                    </section>

                    <section className="cs-section cs-journey" id="cara-kerja" aria-labelledby="steps-title">
                        <div className="cs-wrap">
                            <div className="cs-reveal"><p className="cs-eyebrow">Tiga langkah sederhana</p><h2 id="steps-title" className="cs-serif cs-section-title">Cara mengajukan reservasi</h2></div>
                            <ol className="cs-steps">
                                {steps.map(([title, text], index) => <li className="cs-step cs-reveal" key={title} style={{ '--reveal-delay': `${index * 90}ms` }}><span className="cs-step-number" aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
                            </ol>
                        </div>
                    </section>

                    <section className="cs-final cs-dark" aria-labelledby="final-title">
                        <div className="cs-wrap cs-reveal"><div><h2 id="final-title" className="cs-serif">Butuh ruang untuk kegiatanmu?</h2><p>Temukan fasilitas yang tepat di Buana, pilih jadwal, lalu ajukan peminjaman.</p></div><MagneticLink href={createReservationUrl || '/reservasi/form'} className="cs-button cs-button-primary">{reservationActionLabel} <Icon name="landing-arrow" className="cs-arrow" variant="landing" /></MagneticLink></div>
                    </section>
                </main>

                <footer className="cs-footer cs-dark">
                    <div className="cs-wrap cs-footer-inner">
                        <Link href="/" className="cs-brand" aria-label="Buana — Beranda"><PublicBrand /></Link>
                        <p>© {new Date().getFullYear()} Buana</p>
                        <nav className="cs-footer-links" aria-label="Navigasi footer"><Link href={facilityUrl || '/fasilitas'}>Fasilitas</Link><a href="#cara-kerja">Cara reservasi</a><Link href={aboutUrl || '/tentang'}>Tentang</Link></nav>
                    </div>
                </footer>
                <a href="#atas" className="cs-back-top" aria-label="Kembali ke atas"><Icon name="down" className="cs-arrow" variant="landing" /></a>
            </div>
        </>
    );
}
