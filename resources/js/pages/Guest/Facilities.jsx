import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Icon from '../../components/Icons';
import PublicBrand from '../../components/PublicBrand';
import PublicNavbar from '../../components/PublicNavbar';
import FacilitiesCatalog from '../../components/FacilitiesCatalog';
import GuestFacilityFilters from '../../components/GuestFacilityFilters';
import '../../../css/guest-facilities.css';

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function dateLabel(date) {
    const [year, month, day] = date.split('-');
    return monthNames[Number(month) - 1] ? `${Number(day)} ${monthNames[Number(month) - 1]} ${year}` : date;
}

export default function Facilities({ rooms, filters = {}, types = [], locations = [], today, urls, photoPlaceholderUrl, photoFallbackUrl }) {
    const { errors = {}, auth } = usePage().props;
    const accountUrl = auth?.user ? auth.dashboardUrl : urls.login;
    const accountLabel = auth?.user ? 'Kembali ke dasbor' : 'Masuk';
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
    return (
        <div className="gf">
            <Head title="Fasilitas"><meta name="description" content="Cari fasilitas kampus berdasarkan tipe, lokasi, dan kapasitas. Lihat ketersediaan setiap slot waktu tanpa perlu masuk." /></Head>
            <a href="#daftar-fasilitas" className="gf-skip">Lewati ke daftar fasilitas</a>
            <PublicNavbar urls={urls} active="facilities" />
            <main>
                {/* HEADER */}
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

                {/* FILTER KATALOG */}
                <div className="gf-wrap gf-content">
                    <GuestFacilityFilters values={query} types={types} locations={locations} errors={errors} processing={processing} onChange={updateField} onSubmit={submit} onReset={reset} />
                    
                    <section className="gf-results" aria-labelledby="gf-results-heading">
                        <div className="gf-results-heading">
                            <div>
                                <p className="gf-eyebrow">Temukan fasilitasmu</p>
                                <h2 id="gf-results-heading">Daftar fasilitas</h2>
                            </div>
                            <div className="gf-results-date">
                                <Icon name="calendar" className="gf-icon" />
                                <span>Ketersediaan <strong>{dateLabel(selectedDate)}</strong></span>
                            </div>
                        </div>
                        <FacilitiesCatalog
                            rooms={rooms}
                            selectedDate={selectedDate}
                            processing={processing}
                            photoPlaceholderUrl={photoPlaceholderUrl}
                            photoFallbackUrl={photoFallbackUrl}
                            onReset={reset}
                            onProcessingChange={setProcessing}
                            showSchedule={true}
                        />
                    </section>
                    
                    <aside className="gf-reserve-note"><div><h2>Sudah menemukan fasilitas yang sesuai?</h2><p>{auth?.user ? 'Kembali ke dasbor untuk melanjutkan aktivitas akun.' : 'Masuk dengan akun kampus untuk mengajukan reservasi.'}</p></div><a href={accountUrl} className="gf-button gf-button-forest">{accountLabel} <Icon name="landing-arrow" className="gf-icon" /></a></aside>
                </div>
            </main>
            <footer className="gf-footer"><div className="gf-wrap gf-footer-inner"><a href={urls.landing} className="cs-brand" aria-label="CampuSpace — Beranda"><PublicBrand /></a><p>Layanan fasilitas kampus.</p><nav aria-label="Navigasi footer"><a href={urls.landing}>Beranda</a><a href={urls.about}>Tentang</a></nav></div></footer>
        </div>
    );
}
