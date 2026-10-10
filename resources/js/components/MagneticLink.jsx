import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

export default function MagneticLink({ children, className, ...props }) {
    const reduced = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 240, damping: 20 });
    const springY = useSpring(y, { stiffness: 240, damping: 20 });
    const reset = () => { x.set(0); y.set(0); };

    return <motion.span className="public-magnetic" style={reduced ? undefined : { x: springX, y: springY }} onPointerMove={event => {
        if (reduced || event.pointerType !== 'mouse') return;
        const box = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - box.left - box.width / 2) * .12);
        y.set((event.clientY - box.top - box.height / 2) * .18);
    }} onPointerLeave={reset} onFocusCapture={reset}>
        <Link className={className} {...props}>{children}</Link>
    </motion.span>;
}
