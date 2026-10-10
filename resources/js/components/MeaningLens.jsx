import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import Icon from './Icons';
import '../../css/public-play.css';

const perspectives = [
    { name: 'Bhuana Alit', subtitle: 'Dunia kecil', word: 'Kamu.', intro: 'Segala kegiatan bermula dari seseorang.', text: 'Manusia dengan kegiatannya sehari-hari: mahasiswa, dosen, petugas, dan admin.', chips: ['Mahasiswa', 'Dosen', 'Petugas', 'Admin'], icon: 'people', note: 'Satu ide. Satu kelompok. Satu kegiatan.' },
    { name: 'Bhuana Agung', subtitle: 'Dunia besar', word: 'Kampus.', intro: 'Setiap kegiatan membutuhkan ruang.', text: 'Dunia fasilitas kampus yang terhubung dalam satu layanan. Tempat ide kecil bertemu kemungkinan yang lebih besar.', chips: ['Ruang kelas', 'Aula', 'Laboratorium', 'Lapangan'], icon: 'campus', note: 'Banyak ruang. Banyak cerita. Satu Buana.' },
];

export default function MeaningLens() {
    const [active, setActive] = useState(0);
    const reduced = useReducedMotion();
    const current = perspectives[active];

    return <div className="ml">
        <div className="ml-switch" role="group" aria-label="Pilih perspektif Buana">
            {perspectives.map((item, index) => <button key={item.name} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
                {active === index && <motion.span className="ml-highlight" layoutId="meaning-lens" transition={{ duration: reduced ? 0 : .3 }} />}
                <span>{item.name}<small>{item.subtitle}</small></span>
            </button>)}
        </div>
        <div className="ml-stage" data-world={active}>
            <div className="ml-meta"><span>0{active + 1} / 02</span><Icon name={current.icon} className="ml-icon" /></div>
            <div className="ml-word-window" aria-hidden="true"><AnimatePresence initial={false} mode="wait"><motion.span key={current.word} initial={reduced ? false : { y: '100%', rotate: 5 }} animate={{ y: '0%', rotate: 0 }} exit={{ y: reduced ? '0%' : '-100%', opacity: 0 }} transition={{ duration: reduced ? 0 : .35, ease: [.22, 1, .36, 1] }}>{current.word}</motion.span></AnimatePresence></div>
            <div className="ml-description" aria-live="polite" aria-atomic="true"><h3>{current.intro}</h3><p>{current.text}</p></div>
            <div className="ml-chips">{current.chips.map((chip, index) => <motion.span key={chip} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : index * .06, duration: reduced ? 0 : .25 }}>{chip}</motion.span>)}</div>
            <p className="ml-note">{current.note}</p>
        </div>
        <p className="ml-hint">Ganti perspektif. Temukan hubungan keduanya.</p>
    </div>;
}
