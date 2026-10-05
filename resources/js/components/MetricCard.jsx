import { motion, useReducedMotion } from 'motion/react';
import Icon from './Icons';

export default function MetricCard({ label, icon, index, value }) {
    const reducedMotion = useReducedMotion();
    const hasValue = value !== undefined && value !== null;

    return (
        <motion.article className="app-metric-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : index * 0.07 }} whileHover={reducedMotion ? undefined : { y: -4 }}>
            <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <span className="app-metric-icon"><Icon name={icon} /></span>
            </div>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-teal-darker" aria-label={hasValue ? `${label}: ${value}` : `${label}: data belum tersedia`}>
                {hasValue ? value : '—'}
            </p>
        </motion.article>
    );
}