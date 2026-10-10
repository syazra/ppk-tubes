import { motion, useReducedMotion } from 'motion/react';
import { useContext, useRef, useState } from 'react';
import { IntroNavigationContext } from './IntroNavigation';

// Seconds before page content should start animating in (overlay is covering the page until then).
export const INTRO_DELAY = 1.3;

const BRAND_PATH = 'M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25';

// Decides once per mount; public-page transitions and reduced motion skip it.
export function useIntro() {
    const allowIntro = useContext(IntroNavigationContext);
    const [play] = useState(() => allowIntro && typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    return play;
}

const panelStyle = { position: 'absolute', left: 0, right: 0, height: '50%', background: '#062e29', overflow: 'hidden' };
const radialStyle = { position: 'fixed', inset: 0, zIndex: 1000, background: 'radial-gradient(circle at 50% 50%, #0d5a4c 0%, #0a3f36 45%, #062e29 100%)' };

export function RadialLoadingOverlay() {
    const reduced = useReducedMotion();
    return <motion.div role="status" aria-live="polite" data-page-loader style={{ ...radialStyle, display: 'grid', placeItems: 'center', color: '#f8f9f3', fontFamily: 'Figtree, sans-serif', fontSize: 14 }} initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : 1.15, pointerEvents: 'none' }} transition={{ duration: reduced ? 0 : .5, ease: [.4, 0, .2, 1] }}>Memuat halaman…</motion.div>;
}

// Tileable fractal-noise SVG tinted white, used as a fog texture.
export function fogImage(seed) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='640'><filter id='f' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.005 .011' numOctaves='4' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .92  0 0 0 0 1  0 0 0 0 .96  0 0 0 1.9 -.7'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Login intro: a plain green radial gradient covers the page, then fades
 * out while slowly expanding to reveal it.
 */
function RadialIntro() {
    const [done, setDone] = useState(false);
    if (done) return null;

    return (
        <motion.div
            aria-hidden="true"
            style={{ ...radialStyle, pointerEvents: 'none' }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.15 }}
            transition={{ delay: 0.3, duration: INTRO_DELAY, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => setDone(true)}
        />
    );
}
/**
 * Full-screen intro: the logo draws itself on a dark panel, then the panel splits
 * open top/bottom to reveal the page.
 */
export default function IntroOverlay({ variant = 'curtain', ready = true }) {
    if (variant === 'radial') return <RadialIntro />;
    return <CurtainIntro ready={ready} />;
}

function CurtainIntro({ ready }) {
    const [done, setDone] = useState(false);
    const startedAt = useRef(Date.now());
    if (done) return null;

    const ease = [0.76, 0, 0.24, 1];
    const remainingDelay = Math.max(0, INTRO_DELAY - 0.1 - (Date.now() - startedAt.current) / 1000);
    const reveal = { delay: ready ? remainingDelay : 0, duration: 0.75, ease };

    return (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none' }}>
            <motion.div style={{ ...panelStyle, top: 0 }} initial={{ y: 0 }} animate={{ y: ready ? '-100%' : 0 }} transition={reveal} onAnimationComplete={() => { if (ready) setDone(true); }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, #24594b80, transparent 70%)' }} />
            </motion.div>
            <motion.div style={{ ...panelStyle, bottom: 0 }} initial={{ y: 0 }} animate={{ y: ready ? '100%' : 0 }} transition={reveal}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #24594b80, transparent 70%)' }} />
            </motion.div>
            <motion.div
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, color: '#d3e9a6' }}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: ready ? 0 : 1, scale: ready ? 1.08 : 1 }}
                transition={{ delay: ready ? Math.max(0, remainingDelay - .15) : 0, duration: 0.35, ease: 'easeIn' }}
            >
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d={BRAND_PATH} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
                </svg>
                <motion.div
                    style={{ fontFamily: 'Figtree, ui-sans-serif, system-ui, sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-.8px', color: '#f8f9f3' }}
                    initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
                >
                    Buana
                </motion.div>
                <motion.div style={{ width: 120, height: 2, borderRadius: 2, background: '#ffffff20', overflow: 'hidden' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <motion.div style={{ height: '100%', background: '#d3e9a6', transformOrigin: 'left' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: INTRO_DELAY - 0.45, ease: 'easeInOut' }} />
                </motion.div>
            </motion.div>
        </div>
    );
}
