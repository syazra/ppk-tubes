import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import heroBackground from '../../images/landing-botanical.webp';
import oggRegular from '../../fonts/ogg-regular.otf';
import oggItalic from '../../fonts/ogg-regular-italic.otf';
import Icon from '../components/Icons';
import IntroOverlay, { INTRO_DELAY, fogImage, useIntro } from '../components/IntroOverlay';

const styles = `
@font-face { font-family: 'CampuSpace Ogg'; src: url('${oggRegular}') format('opentype'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'CampuSpace Ogg'; src: url('${oggItalic}') format('opentype'); font-weight: 400; font-style: italic; font-display: swap; }
.lg {
    --forest: #003b33; --deep: #062e29; --teal: #007f6d; --lime: #d3e9a6; --paper: #f8f9f3; --ink: #163f35; --muted: #5b6e62;
    position: relative; min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; padding: 32px 20px; overflow: hidden;
    background: linear-gradient(135deg, #073c35e6, #073c3590 60%, #062e29d0), url('${heroBackground}') center / cover no-repeat;
    color: var(--ink); font-family: Figtree, ui-sans-serif, system-ui, sans-serif; line-height: 1.6;
}
.lg * { box-sizing: border-box; }
.lg h1, .lg p { margin: 0; }
.lg ::selection { background: var(--lime); color: var(--forest); }
.lg :focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }
.lg-orb { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; opacity: .5; }
.lg-orb-1 { width: 420px; height: 420px; top: -120px; left: -100px; background: #d3e9a6; animation: lg-float 14s ease-in-out infinite; }
.lg-orb-2 { width: 480px; height: 480px; bottom: -180px; right: -120px; background: #00a991; animation: lg-float 18s ease-in-out infinite reverse; }
.lg-orb-3 { width: 220px; height: 220px; top: 55%; left: 12%; background: #7fd6c2; opacity: .3; animation: lg-float 11s ease-in-out infinite; }
.lg-frost { position: absolute; inset: 0; pointer-events: none; -webkit-backdrop-filter: blur(1px); backdrop-filter: blur(1px); }
.lg-fog { position: absolute; left: 0; right: 0; pointer-events: none; background-repeat: repeat-x; background-size: 1000px 100%; -webkit-mask-image: linear-gradient(transparent, #000 35%, #000 65%, transparent); mask-image: linear-gradient(transparent, #000 35%, #000 65%, transparent); }
.lg-fog-1 { top: 10%; height: 60%; opacity: .1; animation: lg-drift 90s linear infinite; }
.lg-fog-2 { bottom: 0; height: 55%; opacity: .08; background-size: 1400px 100%; animation: lg-drift-b 140s linear infinite; }
.lg-mist { position: absolute; inset: auto 0 0; height: 45%; pointer-events: none; background: linear-gradient(transparent, #cfeee51a); }
.lg-spark { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 6px #d3e9a6aa; pointer-events: none; opacity: 0; animation: lg-rise linear infinite; }
.lg-drop { position: absolute; z-index: 0; pointer-events: none; border-radius: 50% 50% 50% 50% / 58% 58% 42% 42%; background: radial-gradient(circle at 32% 26%, #ffffffd0 0 9%, #ffffff10 32%, #04302a22 72%, #ffffff40 100%); box-shadow: 0 1px 2px #00201c26, inset 0 -1px 2px #ffffff30; }
.lg-drop.slide { animation: lg-drip linear infinite; }
.lg-drop.slide:before { content: ''; position: absolute; left: 50%; bottom: 80%; width: 38%; height: var(--drip); transform: translateX(-50%); border-radius: 99px; background: linear-gradient(transparent, #ffffff33); }
.lg-back-wrap { position: absolute; top: 24px; left: 28px; z-index: 2; }
.lg-back { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: #e3eae1; font-size: 13px; text-decoration: none; transition: color .2s; }
.lg-back:hover { color: var(--lime); }
.lg-back svg { width: 16px; height: 16px; transform: rotate(180deg); transition: transform .2s; }
.lg-back:hover svg { transform: rotate(180deg) translateX(3px); }
.lg-stage { position: relative; z-index: 1; width: min(460px, 100%); perspective: 1200px; }
.lg-card { position: relative; padding: 44px 40px 36px; background: linear-gradient(145deg, #f9fcf4e6, #f1f9e8d9); border: 1px solid #ffffffa0; border-radius: 24px; box-shadow: 0 30px 80px #00221d66, 0 2px 0 #ffffffb0 inset, 0 -1px 0 #ffffff40 inset; transform-style: preserve-3d; overflow: hidden; }
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { .lg-card { -webkit-backdrop-filter: blur(14px) saturate(120%); backdrop-filter: blur(14px) saturate(120%); } }
.lg-card:before { content: ''; position: absolute; inset: 0 0 auto; height: 4px; background: linear-gradient(90deg, #00a991, var(--lime), #00a991); background-size: 200% 100%; animation: lg-shimmer 4s linear infinite; }
.lg-shine { position: absolute; inset: 0; pointer-events: none; border-radius: inherit; }
.lg-brand { display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--forest); font-size: 24px; font-weight: 600; letter-spacing: -.8px; }
.lg-brand span span { font-weight: 400; }
.lg-brand-mark { width: 34px; height: 34px; padding: 6px; border-radius: 10px; background: var(--forest); color: var(--lime); animation: lg-bob 4s ease-in-out infinite; }
.lg-title { margin-top: 26px !important; text-align: center; font-family: 'CampuSpace Ogg', Georgia, serif; font-size: 38px; line-height: 1.15; letter-spacing: -.035em; color: var(--forest); font-weight: 400; }
.lg-title em { color: var(--teal); }
.lg-sub { margin-top: 10px !important; text-align: center; font-size: 14px; color: var(--muted); }
.lg-form { margin-top: 28px; display: grid; gap: 18px; }
.lg-label { display: block; margin-bottom: 7px; font-size: 13px; font-weight: 600; color: var(--forest); }
.lg-field { position: relative; }
.lg-field > svg { position: absolute; left: 14px; top: 50%; width: 18px; height: 18px; margin-top: -9px; color: #8aa095; transition: color .2s; pointer-events: none; }
.lg-field:focus-within > svg { color: var(--teal); }
.lg-input { width: 100%; min-height: 48px; padding: 12px 14px 12px 42px; border: 1px solid #cfdcc8; border-radius: 12px; background: #fff; font: inherit; font-size: 14px; color: var(--forest); transition: border-color .2s, box-shadow .2s; }
.lg-input::placeholder { color: #9aaba0; }
.lg-input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 4px #00a99125; }
.lg-input[aria-invalid="true"] { border-color: #d6455d; box-shadow: 0 0 0 4px #d6455d18; }
.lg-input.has-toggle { padding-right: 48px; }
.lg-toggle { position: absolute; right: 6px; top: 50%; width: 38px; height: 38px; margin-top: -19px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: #6f877b; cursor: pointer; transition: background .2s, color .2s; }
.lg-toggle:hover { background: #eaf1e3; color: var(--teal); }
.lg-toggle svg { width: 18px; height: 18px; }
.lg-error { margin-top: 7px; font-size: 12.5px; color: #c0324a; display: flex; gap: 6px; align-items: flex-start; }
.lg-hint { margin-top: 7px; font-size: 12.5px; color: #8a6a12; display: flex; gap: 6px; align-items: center; }
.lg-alert { padding: 12px 14px; border-radius: 12px; font-size: 13px; background: #eaf5dc; border: 1px solid #c4dca4; color: var(--forest); }
.lg-row { display: flex; align-items: center; justify-content: space-between; }
.lg-check { display: inline-flex; align-items: center; gap: 10px; min-height: 28px; cursor: pointer; font-size: 13px; color: var(--muted); user-select: none; }
.lg-check input { position: absolute; opacity: 0; width: 0; height: 0; }
.lg-box { width: 20px; height: 20px; display: grid; place-items: center; border: 1.5px solid #b5c7ad; border-radius: 6px; background: #fff; color: #fff; transition: background .2s, border-color .2s; }
.lg-box svg { width: 13px; height: 13px; stroke-width: 3; stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset .25s ease; }
.lg-check input:checked + .lg-box { background: var(--teal); border-color: var(--teal); }
.lg-check input:checked + .lg-box svg { stroke-dashoffset: 0; }
.lg-check input:focus-visible + .lg-box { outline: 3px solid var(--teal); outline-offset: 2px; }
.lg-submit { position: relative; display: flex; align-items: center; justify-content: center; gap: 14px; width: 100%; min-height: 52px; border: 0; border-radius: 12px; background: linear-gradient(90deg, #00a991, #11695d); color: #fff; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; overflow: hidden; box-shadow: 0 10px 24px #00695d40; }
.lg-submit:before { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, #ffffff40 50%, transparent 70%); transform: translateX(-120%); transition: transform .7s ease; }
.lg-submit:hover:not(:disabled):before { transform: translateX(120%); }
.lg-submit:disabled { cursor: progress; opacity: .92; }
.lg-submit svg { width: 18px; height: 18px; transition: transform .2s; }
.lg-submit:hover:not(:disabled) svg { transform: translateX(4px); }
.lg-spinner { width: 20px; height: 20px; border: 2.5px solid #ffffff55; border-top-color: #fff; border-radius: 50%; animation: lg-spin .7s linear infinite; }
.lg-foot { margin-top: 26px; padding-top: 20px; border-top: 1px solid #dce5d5; text-align: center; font-size: 13px; }
.lg-foot a { color: var(--muted); text-decoration: none; transition: color .2s; }
.lg-foot a:hover { color: var(--teal); text-decoration: underline; text-underline-offset: 4px; }
.lg-demo { margin-top: 16px; text-align: left; }
.lg-demo summary { cursor: pointer; text-align: center; font-size: 12px; font-weight: 500; color: var(--muted); list-style: none; min-height: 32px; }
.lg-demo summary::-webkit-details-marker { display: none; }
.lg-demo summary:hover { color: var(--teal); }
.lg-demo p { margin-top: 8px; font-size: 12px; color: var(--muted); text-align: center; }
.lg-chips { margin-top: 12px; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.lg-chip { min-height: 34px; padding: 6px 14px; border: 1px solid #cfdcc8; border-radius: 999px; background: #fff; font: inherit; font-size: 12px; color: var(--forest); cursor: pointer; transition: background .2s, border-color .2s, transform .2s; }
.lg-chip:hover { background: #eaf1e3; border-color: var(--teal); transform: translateY(-2px); }
.lg-chip[aria-pressed="true"] { background: var(--teal); border-color: var(--teal); color: #fff; }
@keyframes lg-float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, 30px) scale(1.12); } }
@keyframes lg-drift { to { background-position-x: 1000px; } }
@keyframes lg-drift-b { to { background-position-x: -1400px; } }
@keyframes lg-rise { 0% { transform: translateY(0) scale(.6); opacity: 0; } 15% { opacity: .7; } 100% { transform: translateY(-110vh) scale(1.1); opacity: 0; } }
@keyframes lg-drip { 0%, 55% { transform: translateY(0); } 100% { transform: translateY(var(--drip)); } }
@keyframes lg-shimmer { to { background-position: -200% 0; } }
@keyframes lg-bob { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg) translateY(-2px); } }
@keyframes lg-spin { to { transform: rotate(360deg); } }
@media (max-width: 520px) { .lg { padding-top: 76px; } .lg-card { padding: 36px 24px 28px; } .lg-title { font-size: 32px; } .lg-back-wrap { left: 16px; top: 14px; } }
@media (prefers-reduced-motion: reduce) { .lg *, .lg *:before, .lg *:after { animation: none !important; transition: none !important; } .lg-drop.slide { animation: none; } .lg-spark { display: none; } .lg-back:hover svg { transform: rotate(180deg); } .lg-submit:hover:not(:disabled) svg, .lg-chip:hover { transform: none; } .lg-submit:hover:not(:disabled):before { transform: translateX(-120%); } }
@media (forced-colors: active) { .lg-card { border: 1px solid CanvasText; background: Canvas; } }
`;

function Brand() {
    return <><svg className="lg-brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg><span>Campu<span>Space</span></span></>;
}

// Deterministic pseudo-random so droplets stay put between renders.
const random = seed => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
const droplets = Array.from({ length: 14 }, (_, i) => {
    const size = 4 + random(i + 1) * 9;
    const slide = false;
    return { slide, style: { left: `${random(i + 50) * 100}%`, top: `${random(i + 90) * 100}%`, width: size, height: size * (slide ? 1.25 : 1.1), opacity: 0.2 + random(i + 7) * 0.25, ...(slide ? { animationDuration: `${14 + random(i) * 12}s`, animationDelay: `${-random(i + 3) * 14}s`, '--drip': `${70 + random(i + 5) * 140}px` } : {}) } };
});

const sparks = Array.from({ length: 16 }, (_, i) => ({ left: `${(i * 7 + 5) % 100}%`, bottom: `-${(i % 4) * 20 + 10}px`, duration: `${10 + (i % 5) * 3}s`, delay: `${-(i * 1.9)}s` }));
const animatedItem = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } } };

function FieldError({ id, message }) {
    const reduced = useReducedMotion();
    return (
        <AnimatePresence initial={false}>
            {message && (
                <motion.p id={id} role="alert" className="lg-error" initial={reduced ? false : { opacity: 0, height: 0, y: -4 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} transition={reduced ? { duration: 0 } : undefined}>
                    <span>{message}</span>
                </motion.p>
            )}
        </AnimatePresence>
    );
}

export default function Login({ status, landingUrl = '/', demoAccounts = [] }) {
    const reduced = useReducedMotion();
    const intro = useIntro();
    const introDelay = intro && !reduced ? INTRO_DELAY : 0;
    const container = { hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: reduced ? 0 : 0.15 + introDelay } } };
    const item = reduced ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0, transition: { duration: 0 } } } : animatedItem;
    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({ email: '', password: '', remember: false });
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [activeDemo, setActiveDemo] = useState(null);
    const [shakeKey, setShakeKey] = useState(0);

    // Subtle 3D tilt + moving glare that follows the pointer.
    const mx = useMotionValue(0.5);
    const my = useMotionValue(0.5);
    const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 150, damping: 20 });
    const glare = useTransform([mx, my], ([x, y]) => `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, #ffffff55, transparent 60%)`);

    useEffect(() => {
        const previous = document.documentElement.lang;
        document.documentElement.lang = 'id';
        return () => { document.documentElement.lang = previous; };
    }, []);

    useEffect(() => {
        if (Object.keys(errors).length) setShakeKey(key => key + 1);
    }, [errors]);

    function onPointerMove(event) {
        if (reduced || event.pointerType === 'touch') return;
        const box = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - box.left) / box.width);
        my.set((event.clientY - box.top) / box.height);
    }

    function onPointerLeave() {
        mx.set(0.5);
        my.set(0.5);
    }

    function fillDemo(email) {
        setData(current => ({ ...current, email, password: 'password' }));
        setActiveDemo(email);
        clearErrors();
        document.getElementById('password')?.focus();
    }

    function submit(event) {
        event.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    }

    const cardAnimation = reduced || !shakeKey ? {} : { x: [0, -10, 10, -8, 8, -4, 0] };

    return (
        <>
            <Head title="Masuk — CampuSpace">
                <meta name="theme-color" content="#062e29" />
                <link rel="preload" href={oggRegular} as="font" type="font/otf" crossOrigin="anonymous" />
            </Head>
            <style>{styles}</style>
            {intro && <IntroOverlay variant="radial" />}
            <div className="lg" lang="id">
                <div className="lg-orb lg-orb-1" aria-hidden="true" />
                <div className="lg-orb lg-orb-2" aria-hidden="true" />
                <div className="lg-orb lg-orb-3" aria-hidden="true" />
                <div className="lg-frost" aria-hidden="true" />
                <div className="lg-fog lg-fog-1" aria-hidden="true" style={{ backgroundImage: fogImage(7) }} />
                <div className="lg-fog lg-fog-2" aria-hidden="true" style={{ backgroundImage: fogImage(23) }} />
                <div className="lg-mist" aria-hidden="true" />
                {sparks.map((spark, index) => <i className="lg-spark" aria-hidden="true" key={index} style={{ left: spark.left, bottom: spark.bottom, animationDuration: spark.duration, animationDelay: spark.delay }} />)}
                {droplets.map((drop, index) => <i className={`lg-drop${drop.slide ? ' slide' : ''}`} aria-hidden="true" key={index} style={drop.style} />)}

                <motion.div className="lg-back-wrap" initial={reduced ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={reduced ? { duration: 0 } : { delay: 0.4 + introDelay }}>
                    <Link href={landingUrl} className="lg-back"><Icon name="landing-arrow" variant="landing" className="" />Kembali ke beranda</Link>
                </motion.div>

                <div className="lg-stage" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
                    <motion.div initial={reduced ? false : { opacity: 0, y: 40, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 18, delay: introDelay }}>
                        <motion.div key={shakeKey} animate={cardAnimation} transition={{ duration: reduced ? 0 : 0.45 }}>
                            <motion.main className="lg-card" style={reduced ? undefined : { rotateX, rotateY }}>
                                <motion.div className="lg-shine" style={{ background: reduced ? 'radial-gradient(420px circle at 50% 50%, #ffffff55, transparent 60%)' : glare }} aria-hidden="true" />
                                <motion.div variants={container} initial={reduced ? false : 'hidden'} animate="show" style={{ position: 'relative' }}>
                                    <motion.header variants={item}>
                                        <div className="lg-brand"><Brand /></div>
                                        <h1 className="lg-title">Selamat datang <em>kembali</em></h1>
                                        <p className="lg-sub">Masuk untuk mengelola peminjaman fasilitas kampus.</p>
                                    </motion.header>

                                    {status && <motion.p variants={item} className="lg-alert" role="status" style={{ marginTop: 20 }}>{status}</motion.p>}

                                    <form className="lg-form" onSubmit={submit} noValidate={false}>
                                        <motion.div variants={item}>
                                            <label className="lg-label" htmlFor="email">Email kampus</label>
                                            <div className="lg-field">
                                                <Icon name="user" className="" />
                                                <input id="email" name="email" type="email" className="lg-input" value={data.email} onChange={event => { setData('email', event.target.value); setActiveDemo(null); }} required autoFocus autoComplete="username" placeholder="nama@students.kampus.ac.id" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
                                            </div>
                                            <FieldError id="email-error" message={errors.email} />
                                        </motion.div>

                                        <motion.div variants={item}>
                                            <label className="lg-label" htmlFor="password">Kata sandi</label>
                                            <div className="lg-field">
                                                <Icon name="shield" className="" />
                                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="lg-input has-toggle" value={data.password} onChange={event => setData('password', event.target.value)} onKeyUp={event => setCapsLock(event.getModifierState?.('CapsLock') ?? false)} onBlur={() => setCapsLock(false)} required autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
                                                <button type="button" className="lg-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword}>
                                                    <AnimatePresence mode="wait" initial={false}>
                                                        <motion.span key={showPassword ? 'hide' : 'show'} initial={reduced ? false : { opacity: 0, scale: 0.6, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.6, rotate: 30 }} transition={{ duration: reduced ? 0 : 0.15 }} style={{ display: 'grid' }}>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                                {showPassword
                                                                    ? <><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4 10 7a11 11 0 0 1-3 4.2M6.5 6.6C4.4 8 2.9 10 2 12c1 3 5 7 10 7a9.700 9.700 0 0 0 4-.9" /></>
                                                                    : <><path d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7S3 15 2 12Z" /><circle cx="12" cy="12" r="3" /></>}
                                                            </svg>
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </button>
                                            </div>
                                            <AnimatePresence initial={false}>
                                                {capsLock && <motion.p className="lg-hint" role="status" initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={reduced ? { duration: 0 } : undefined}>Caps Lock sedang aktif.</motion.p>}
                                            </AnimatePresence>
                                            <FieldError id="password-error" message={errors.password} />
                                        </motion.div>

                                        <motion.div variants={item} className="lg-row">
                                            <label className="lg-check" htmlFor="remember_me">
                                                <input id="remember_me" name="remember" type="checkbox" checked={data.remember} onChange={event => setData('remember', event.target.checked)} />
                                                <span className="lg-box" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg></span>
                                                Ingat saya
                                            </label>
                                        </motion.div>

                                        <motion.div variants={item}>
                                            <motion.button type="submit" className="lg-submit" disabled={processing} whileHover={reduced || processing ? undefined : { y: -2 }} whileTap={reduced || processing ? undefined : { scale: 0.98 }}>
                                                <AnimatePresence mode="wait" initial={false}>
                                                    {processing
                                                        ? <motion.span key="load" className="lg-spinner" initial={reduced ? false : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : undefined} aria-hidden="true" />
                                                        : <motion.span key="idle" style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : undefined}>Masuk <Icon name="landing-arrow" variant="landing" className="" /></motion.span>}
                                                </AnimatePresence>
                                                {processing && <span>Memproses…</span>}
                                            </motion.button>
                                        </motion.div>
                                    </form>

                                    <motion.div variants={item} className="lg-foot">
                                        <Link href={landingUrl}>Jelajahi sebagai pengunjung</Link>
                                        {demoAccounts.length > 0 && (
                                            <details className="lg-demo">
                                                <summary>Gunakan akun demo</summary>
                                                <p>Pilih peran untuk mengisi formulir. Kata sandi demo: <strong>password</strong>.</p>
                                                <div className="lg-chips">
                                                    {demoAccounts.map(account => <button type="button" key={account.email} className="lg-chip" aria-pressed={activeDemo === account.email} onClick={() => fillDemo(account.email)}>{account.label}</button>)}
                                                </div>
                                            </details>
                                        )}
                                    </motion.div>
                                </motion.div>
                            </motion.main>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
