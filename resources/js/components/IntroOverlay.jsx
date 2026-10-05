import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

// Seconds before page content should start animating in (overlay is covering the page until then).
export const INTRO_DELAY = 1.3;

const BRAND_PATH = 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5';

// Decides once per mount whether the intro plays (skipped for reduced motion).
export function useIntro() {
    const [play] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    return play;
}

const panelStyle = { position: 'absolute', left: 0, right: 0, height: '50%', background: '#062e29', overflow: 'hidden' };

/**
 * Login intro: the logo emits water-like ripples, then a feathered circular iris
 * opens from the centre to reveal the page.
 */
function IrisIntro() {
    const [done, setDone] = useState(false);
    const radius = useMotionValue(0);
    const mask = useTransform(radius, value => `radial-gradient(circle at 50% 50%, transparent ${value}px, #000 ${value + 90}px)`);

    useEffect(() => {
        const max = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 120;
        const controls = animate(radius, max, { delay: INTRO_DELAY - 0.2, duration: 1, ease: [0.65, 0, 0.35, 1], onComplete: () => setDone(true) });
        return () => controls.stop();
    }, [radius]);

    if (done) return null;

    return (
        <motion.div
            aria-hidden="true"
            style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, #0d4a40, #062e29 70%)', WebkitMaskImage: mask, maskImage: mask, display: 'grid', placeItems: 'center', color: '#d3e9a6' }}
        >
            <motion.div style={{ position: 'relative', display: 'grid', placeItems: 'center' }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: INTRO_DELAY - 0.3, duration: 0.35 }}>
                {[0, 0.35, 0.7].map(delay => (
                    <motion.span key={delay} style={{ position: 'absolute', width: 84, height: 84, borderRadius: '50%', border: '1.5px solid #d3e9a6' }} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 4.2, opacity: [0, 0.5, 0] }} transition={{ delay, duration: 1.5, ease: 'easeOut', repeat: 0 }} />
                ))}
                <motion.div style={{ width: 84, height: 84, borderRadius: 24, background: '#003b33', display: 'grid', placeItems: 'center', boxShadow: '0 0 40px #d3e9a633' }} initial={{ scale: 0.4, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
                    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d={BRAND_PATH} /></svg>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

/**
 * Full-screen intro: the logo draws itself on a dark panel, then the panel splits
 * open top/bottom to reveal the page.
 */
export default function IntroOverlay({ variant = 'curtain' }) {
    if (variant === 'iris') return <IrisIntro />;
    return <CurtainIntro />;
}

function CurtainIntro() {
    const [done, setDone] = useState(false);
    if (done) return null;

    const ease = [0.76, 0, 0.24, 1];
    const reveal = { delay: INTRO_DELAY - 0.1, duration: 0.75, ease };

    return (
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none' }}>
            <motion.div style={{ ...panelStyle, top: 0 }} initial={{ y: 0 }} animate={{ y: '-100%' }} transition={reveal} onAnimationComplete={() => setDone(true)}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, #24594b80, transparent 70%)' }} />
            </motion.div>
            <motion.div style={{ ...panelStyle, bottom: 0 }} initial={{ y: 0 }} animate={{ y: '100%' }} transition={reveal}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #24594b80, transparent 70%)' }} />
            </motion.div>
            <motion.div
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, color: '#d3e9a6' }}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.08 }}
                transition={{ delay: INTRO_DELAY - 0.25, duration: 0.35, ease: 'easeIn' }}
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
                    Campu<span style={{ fontWeight: 400 }}>Space</span>
                </motion.div>
                <motion.div style={{ width: 120, height: 2, borderRadius: 2, background: '#ffffff20', overflow: 'hidden' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <motion.div style={{ height: '100%', background: '#d3e9a6', transformOrigin: 'left' }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: INTRO_DELAY - 0.45, ease: 'easeInOut' }} />
                </motion.div>
            </motion.div>
        </div>
    );
}
