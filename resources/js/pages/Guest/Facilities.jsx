import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Icon from '../../components/Icons';
import PublicBrand from '../../components/PublicBrand';
import PublicNavbar from '../../components/PublicNavbar';
import FacilityCard from '../../components/FacilityCard';
import GuestFacilityFilters from '../../components/GuestFacilityFilters';
import '../../../css/guest-facilities.css';

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function dateLabel(date) {
    const [year, month, day] = date.split('-');
    return monthNames[Number(month) - 1] ? `${Number(day)} ${monthNames[Number(month) - 1]} ${year}` : date;
}

function paginationLabel(link, index, total) {
    if (index === 0) return 'Sebelumnya';
    if (index === total - 1) return 'Berikutnya';
    return /^\d+$/.test(link.label) ? link.label : '…';
}

export default function Facilities({ rooms, filters = {}, types = [], locations = [], today, urls, photoPlaceholderUrl, photoFallbackUrl }) {
    const { errors = {} } = usePage().props;
    const selectedDate = filters.date || today;
    const [query, setQuery] = useState({ search: filters.search || '', type: filters.type || '', location: filters.location || '', capacity: filters.capacity || '', date: selectedDate });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setQuery({ search: filters.search || '', type: filters.type || '', location: filters.location || '', capacity: filters.capacity || '', date: filters.date || today });
    }, [filters.search, filters.type, filters.location, filters.capacity, filters.date, today]);

    useEffect(() => {
        const previousLanguage = document.documentElement.lang;
        document.documentElement.lang = 'id';
        return () => { document.documentElement.lang = previousLanguage; };
    }, []);

    const updateField = event => setQuery(previous => ({ ...previous, [event.target.name]: event.target.value }));
    const visit = values => router.get(urls.facilities, values, { preserveState: true, preserveScroll: true, onStart: () => setProcessing(true), onFinish: () => setProcessing(false) });
    const submit = event => { event.preventDefault(); visit(query); };
    const reset = () => {
        const values = { search: '', type: '', location: '', capacity: '', date: query.date || selectedDate };
        setQuery(values);
        visit(values);
    };
    const roomList = rooms.data ?? [];
    const pagination = rooms.links ?? [];

    return (
        <div className="gf">
            <Head title="Fasilitas"><meta name="description" content="Cari fasilitas kampus berdasarkan tipe, lokasi, dan kapasitas. Lihat ketersediaan setiap slot waktu tanpa perlu masuk." /></Head>
            <a href="#daftar-fasilitas" className="gf-skip">Lewati ke daftar fasilitas</a>
            <PublicNavbar urls={urls} active="facilities" />
            <main>
                <section className="gf-intro" aria-labelledby="gf-heading">
                    <div className="gf-wrap gf-intro-grid">
                        <div>
                            <p className="gf-eyebrow">Fasilitas kampus</p>
                            <h1 id="gf-heading">Ruang untuk <em>kegiatanmu.</em></h1>
                            <p className="gf-intro-copy">Temukan fasilitas yang sesuai dan periksa jadwalnya sebelum merencanakan kegiatan kampus.</p>
                        </div>
                        <div className="gf-intro-note"><Icon name="calendar" className="gf-note-icon" /><div><p>Lihat jadwal, rencanakan kegiatan.</p><span>Ketersediaan per slot waktu dapat dilihat tanpa perlu masuk. Masuk untuk mengajukan reservasi.</span></div></div>
                    </div>
                </section>
                <div className="gf-wrap gf-content">
                    <GuestFacilityFilters values={query} types={types} locations={locations} errors={errors} processing={processing} onChange={updateField} onSubmit={submit} onReset={reset} />
                    <section id="daftar-fasilitas" className="gf-results" aria-labelledby="gf-results-heading" aria-busy={processing}>
                        <div className="gf-results-heading"><div><p className="gf-eyebrow">Temukan fasilitasmu</p><h2 id="gf-results-heading">Daftar fasilitas</h2></div><div className="gf-results-date"><Icon name="calendar" className="gf-icon" /><span>Ketersediaan <strong>{dateLabel(selectedDate)}</strong></span></div></div>
                        <div className="gf-results-meta"><p role="status">{rooms.total > 0 ? `Menampilkan ${rooms.from}–${rooms.to} dari ${rooms.total} fasilitas` : '0 fasilitas ditemukan'}</p><p>Buka slot waktu untuk melihat jadwal.</p></div>
                        {roomList.length > 0 ? <div className="gf-card-grid">{roomList.map(room => <FacilityCard key={room.id} facility={{ ...room, description: room.desc, is_available: room.is_avail }} slots={room.slots} date={selectedDate} photoPlaceholderUrl={photoPlaceholderUrl} photoFallbackUrl={photoFallbackUrl} />)}</div> : <div className="gf-empty"><span className="gf-empty-icon"><Icon name="room" className="gf-note-icon" /></span><h3>Belum ada fasilitas yang sesuai</h3><p>Coba ubah tipe, lokasi, atau kapasitas untuk menemukan fasilitas lainnya.</p><button className="gf-button gf-button-forest" type="button" onClick={reset} disabled={processing}>Reset filter<Icon name="landing-arrow" className="gf-icon" /></button></div>}
                        {rooms.last_page > 1 && <nav className="gf-pagination" aria-label="Halaman daftar fasilitas">{pagination.map((link, index) => {
                            const label = paginationLabel(link, index, pagination.length);
                            return link.active ? <span className="gf-page gf-page-active" key={index} aria-current="page" aria-label={`Halaman ${label}`}>{label}</span> : link.url ? <Link className="gf-page" href={link.url} key={index} preserveScroll preserveState aria-label={/^\d+$/.test(label) ? `Halaman ${label}` : label} onStart={() => setProcessing(true)} onFinish={() => setProcessing(false)}>{label}</Link> : <span className="gf-page gf-page-disabled" key={index} aria-disabled="true">{label}</span>;
                        })}</nav>}
                    </section>
                    <aside className="gf-reserve-note"><div><h2>Sudah menemukan fasilitas yang sesuai?</h2><p>Masuk dengan akun kampus untuk mengajukan reservasi.</p></div><a href={urls.login} className="gf-button gf-button-forest">Masuk <Icon name="landing-arrow" className="gf-icon" /></a></aside>
                </div>
            </main>
            <footer className="gf-footer"><div className="gf-wrap gf-footer-inner"><a href={urls.landing} className="cs-brand" aria-label="CampuSpace — Beranda"><PublicBrand /></a><p>Layanan fasilitas kampus.</p><nav aria-label="Navigasi footer"><a href={urls.landing}>Beranda</a><a href={urls.about}>Tentang</a></nav></div></footer>
        </div>
    );
}
