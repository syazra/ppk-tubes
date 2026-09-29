import { motion, useReducedMotion } from 'motion/react';
import Icon from './Icons';

export default function MetricCard({ label, detail, icon, index }) {
    const reducedMotion = useReducedMotion();

    return (
        <motion.article className="app-metric-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : index * 0.07 }} whileHover={reducedMotion ? undefined : { y: -4 }}>
            <div className="flex items-center justify-between gap-3">
                <span className="app-metric-icon"><Icon name={icon} /></span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Belum tersedia</span>
            </div>
            <p className="mt-5 text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-teal-darker" aria-label={`${label}: data belum tersedia`}>—</p>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">{detail}</p>
        </motion.article>
    );
}