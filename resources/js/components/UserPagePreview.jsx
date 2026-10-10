import { Link } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import Dashboard from '../pages/User/Dashboard';
import Icon from './Icons';
import '../../css/user-page-preview.css';

const MyReservations = lazy(() => import('../pages/User/MyReservations'));
const views = [{ key: 'dashboard', label: 'Dasbor' }, { key: 'reservations', label: 'Reservasi Saya' }];
const exampleUser = { name: 'Pengguna Buana', email: 'pengguna@example.com', role: 'user', account_type: 'mahasiswa' };
const exampleUrls = { dashboard: '#', catalog: '#', reservations: '#', reports: '#', reservationForm: '#', reportCreate: '#', profile: '#', guest: '#', logout: '#' };
const exampleReservations = [
    { id: 'contoh-1', room: { name: 'Ruang Diskusi', type: 'Ruang Kelas' }, date_to_reserv: '2026-10-20', start_time: '09:00:00', end_time: '11:00:00', desc: 'Diskusi kelompok dan persiapan presentasi.', status: 'disetujui', can_cancel: false },
    { id: 'contoh-2', room: { name: 'Aula Kampus', type: 'Aula' }, date_to_reserv: '2026-10-22', start_time: '13:00:00', end_time: '15:00:00', desc: 'Seminar komunitas mahasiswa.', status: 'menunggu', can_cancel: true },
    { id: 'contoh-3', room: { name: 'Laboratorium', type: 'Laboratorium' }, date_to_reserv: '2026-10-23', start_time: '10:00:00', end_time: '12:00:00', desc: 'Persiapan praktikum.', status: 'ditolak', rejection_reason: 'Fasilitas sedang dalam perawatan.', can_cancel: false },
];
const exampleReports = [
    { id: 'laporan-contoh', room: { name: 'Ruang Diskusi' }, desc: 'Lampu proyektor perlu diperiksa.', status: 'diproses', created_at: '2026-10-15T09:00:00' },
];
const examplePagination = { data: exampleReservations, from: 1, to: 3, total: 3, links: [] };
const exampleFilters = { search: '', status: '', sort: 'created_near' };
const frameDocument = '<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pratinjau halaman pengguna Buana</title></head><body class="font-sans antialiased"><div id="preview-root"></div></body></html>';

// A portal preserves Inertia context while the iframe isolates CSS and viewport breakpoints.
// Both views render the production pages themselves; only their input data is a fixture.
function UserPageFrame({ view, expanded = false }) {
    const [frameDoc, setFrameDoc] = useState(null);
    const [scale, setScale] = useState(0);
    const viewportRef = useRef(null);

    useEffect(() => {
        if (expanded) return;
        const viewport = viewportRef.current;
        const observer = new ResizeObserver(() => setScale(viewport.clientWidth / 1120));
        setScale(viewport.clientWidth / 1120);
        observer.observe(viewport);
        return () => observer.disconnect();
    }, [expanded]);

    useEffect(() => {
        if (!frameDoc) return;
        const copiedStyles = new Map();
        const syncStyles = () => {
            const sources = new Set(document.head.querySelectorAll('link[rel="stylesheet"], style[data-vite-dev-id]'));
            for (const [source, clone] of copiedStyles) {
                if (!sources.has(source)) { clone.remove(); copiedStyles.delete(source); }
            }
            for (const source of sources) {
                let clone = copiedStyles.get(source);
                if (!clone) {
                    clone = source.cloneNode(true);
                    frameDoc.head.appendChild(clone);
                    copiedStyles.set(source, clone);
                } else if (source.tagName === 'STYLE') {
                    clone.textContent = source.textContent;
                }
            }
        };
        syncStyles();
        const observer = new MutationObserver(syncStyles);
        observer.observe(document.head, { childList: true, subtree: true, characterData: true });
        frameDoc.documentElement.style.overflow = expanded ? 'auto' : 'hidden';
        frameDoc.body.style.margin = '0';
        return () => { observer.disconnect(); copiedStyles.forEach(clone => clone.remove()); };
    }, [frameDoc, expanded]);

    const commonProps = { preview: true, user: exampleUser, urls: exampleUrls };
    const root = frameDoc?.getElementById('preview-root');

    return <div ref={viewportRef} className={`up-viewport${expanded ? ' up-viewport-expanded' : ''}`}>
        <iframe title={`Pratinjau halaman pengguna: ${views.find(item => item.key === view).label}`} srcDoc={frameDocument} sandbox="allow-same-origin" tabIndex={-1} onLoad={event => setFrameDoc(event.currentTarget.contentDocument)} style={expanded ? undefined : { transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }} />
        {root && createPortal(<div inert>
            <Suspense fallback={<p style={{ padding: 32, color: '#163f35' }}>Memuat pratinjau…</p>}>
                {view === 'dashboard'
                    ? <Dashboard {...commonProps} recentReservations={exampleReservations.slice(0, 2)} recentReports={exampleReports} />
                    : <MyReservations {...commonProps} reservations={examplePagination} filters={exampleFilters} />}
            </Suspense>
        </div>, root)}
    </div>;
}

function ViewPicker({ view, onChange }) {
    return <div className="up-view-picker" role="group" aria-label="Pilih halaman pratinjau">
        {views.map(item => <button key={item.key} type="button" aria-pressed={view === item.key} onClick={() => onChange(item.key)}>{item.label}</button>)}
    </div>;
}

export default function UserPagePreview({ createReservationUrl, reservationActionLabel }) {
    const [view, setView] = useState('dashboard');
    const [expanded, setExpanded] = useState(false);
    const dialogRef = useRef(null);
    const dialogTitleId = useId();

    useEffect(() => {
        if (!expanded) return;
        dialogRef.current.showModal();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [expanded]);

    return <figure className="up cs-reservation-preview">
        <div className="up-toolbar"><span className="up-label">Pratinjau halaman pengguna</span><button className="up-expand" type="button" aria-haspopup="dialog" onClick={() => setExpanded(true)}><Icon name="panel" className="up-icon" /><span>Perbesar</span></button></div>
        <ViewPicker view={view} onChange={setView} />
        <UserPageFrame view={view} />
        <figcaption className="up-caption"><p>Tampilan Buana dengan data contoh.</p><Link href={createReservationUrl}>{reservationActionLabel}<Icon name="arrow" className="up-icon" /></Link></figcaption>
        <dialog ref={dialogRef} className="up-dialog" aria-labelledby={dialogTitleId} onClose={() => setExpanded(false)} onClick={event => { if (event.target === event.currentTarget) dialogRef.current.close(); }}>
            {expanded && <div className="up-dialog-content">
                <div className="up-dialog-heading"><div><h2 id={dialogTitleId}>Halaman pengguna Buana</h2><p>Pratinjau dengan data contoh.</p></div><button type="button" className="up-close" aria-label="Tutup pratinjau" onClick={() => dialogRef.current.close()}><Icon name="close" className="up-icon" /></button></div>
                <ViewPicker view={view} onChange={setView} />
                <UserPageFrame view={view} expanded />
            </div>}
        </dialog>
    </figure>;
}
