import { useState } from 'react';
import { useScramble } from 'use-scramble';
import Icon from './Icons';
import '../../css/public-play.css';

const meanings = ['dunia', 'bumi', 'alam semesta', 'jagat raya'];

export default function NameDiscovery() {
    const [index, setIndex] = useState(0);
    const { ref, replay } = useScramble({ text: meanings[index], playOnMount: false, speed: .7, step: 2, scramble: 3, seed: 2, range: [97, 122], overdrive: false });

    return <div className="nd">
        <span className="nd-caption">Satu nama, banyak makna</span>
        <button className="nd-button" type="button" onClick={() => setIndex(value => (value + 1) % meanings.length)} onPointerEnter={() => replay()} aria-label={`Makna Buana: ${meanings[index]}. Klik untuk makna berikutnya.`}>
            <span className="nd-word" ref={ref} aria-hidden="true">{meanings[index]}</span><Icon name="arrow" className="nd-icon" />
        </button>
        <span className="nd-hint" aria-live="polite">0{index + 1} / 04 · {meanings[index]} · klik untuk berganti</span>
    </div>;
}
