import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { LandingIcon as Icon } from '../components/Icons';

const styles = `
.cs {
    --forest: #003b33; --deep: #062e29; --teal: #007f6d;
    --lime: #b1d760; --paper: #f7f8f0; --ink: #163f35; --muted: #5b6e62;
    background: var(--paper); color: var(--ink);
    font-family: Figtree, ui-sans-serif, system-ui, sans-serif; line-height: 1.6; overflow: clip;
}
.cs * { box-sizing: border-box; }
.cs a { color: inherit; text-decoration: none; }
.cs button { font: inherit; }
.cs svg { display: block; }
.cs h1, .cs h2, .cs h3, .cs p, .cs figure { margin: 0; }
.cs ::selection { background: var(--lime); color: var(--forest); }
.cs :focus-visible { outline: 3px solid var(--teal); outline-offset: 5px; }
.cs .cs-dark :focus-visible, .cs-nav :focus-visible { outline-color: var(--lime); }
.cs-wrap { width: min(1240px, calc(100% - 96px)); margin-inline: auto; }
.cs-serif { font-family: Georgia, 'Times New Roman', serif; font-weight: 400; letter-spacing: -.045em; }
.cs-section { padding-block: 85px; scroll-margin-top: 85px; }
.cs-section-title { font-size: clamp(34px, 3.5vw, 48px); line-height: 1.15; }
.cs-copy { color: var(--muted); font-size: 16px; line-height: 1.8; }
.cs-icon { width: 24px; height: 24px; flex: none; }
.cs-arrow { width: 18px; height: 18px; }
.cs-button { display: inline-flex; align-items: center; justify-content: center; gap: 18px; min-height: 48px; padding: 12px 22px; border-radius: 5px; font-size: 14px; font-weight: 600; transition: background .2s; }
.cs-button-primary { background: var(--lime); color: var(--forest) !important; }
.cs-button-primary:hover { background: #c6e789; }
.cs-text-link { display: inline-flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; text-underline-offset: 5px; }
.cs-text-link:hover { text-decoration: underline; }
.cs-skip { position: fixed; top: 8px; left: 12px; z-index: 100; padding: 12px 20px; background: var(--lime); transform: translateY(-160%); }
.cs-skip:focus { transform: none; }
.cs main { scroll-margin-top: 82px; }
.cs-nav { position: sticky; top: 0; z-index: 30; background: var(--deep); color: var(--paper); border-bottom: 1px solid #ffffff20; }
.cs-nav-inner { height: 82px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.cs-brand { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; font-size: 23px; font-weight: 600; letter-spacing: -.8px; }
.cs-brand-mark { width: 32px; height: 32px; flex: none; color: var(--lime); }
.cs-brand span span { font-weight: 400; }
.cs-nav-links { display: flex; align-items: center; gap: 30px; font-size: 13px; color: #d5dfd5; }
.cs-nav-links a:hover { color: var(--lime); }
.cs-nav-action { display: flex; align-items: center; gap: 12px; }
.cs-nav .cs-button { min-height: 44px; padding: 10px 20px; font-size: 13px; }
.cs-menu-toggle { display: none; width: 44px; height: 44px; border: 1px solid #ffffff40; border-radius: 5px; background: transparent; color: inherit; align-items: center; justify-content: center; }
.cs-mobile-nav, .cs-mobile-nav[hidden] { display: none; }
.cs-hero { background: linear-gradient(135deg, #009e8d 0%, #007e73 53%, #155c57 100%); color: var(--paper); overflow: hidden; }
.cs-hero-grid { display: grid; grid-template-columns: 1fr 1.04fr; align-items: center; gap: 35px; padding-block: 55px 72px; min-height: 675px; }
.cs-hero h1 { font-size: clamp(60px, 6.3vw, 84px); line-height: 1.08; margin-bottom: 28px; }
.cs-hero h1 em { color: #cae79a; font-weight: 400; }
.cs-hero-copy { max-width: 405px; color: #c1d0c6; font-size: 16px; line-height: 1.85; }
.cs-hero-actions { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; margin-top: 30px; }
.cs-hero-note { margin-top: 18px !important; color: #acbfb2; font-size: 12px; }
.cs-art { position: relative; min-width: 0; }
.cs-reservation-preview { position: relative; width: 100%; background: #fbfcfd; color: var(--ink); border: 1px solid #cbd8cc; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 35px #001d2429; }
.cs-preview-bar { padding: 10px 18px; background: #edf3e6; border-bottom: 1px solid #dce5d5; font-size: 10px; color: #52664e; }
.cs-preview-body { padding: 18px; }
.cs-preview-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 17px; }
.cs-preview-heading h2 { font-size: 17px; font-weight: 600; }
.cs-preview-heading p { font-size: 10px; color: var(--muted); margin-top: 2px; }
.cs-preview-create { display: inline-flex; align-items: center; min-height: 44px; flex: none; padding: 9px 10px; background: var(--teal); color: white !important; border-radius: 4px; font-size: 10px; font-weight: 600; }
.cs-preview-create:hover { background: var(--forest); }
.cs-preview-table { width: 100%; table-layout: fixed; border-collapse: collapse; text-align: left; }
.cs-preview-table th { padding: 9px 5px; background: #e9f2ea; font-size: 8px; font-weight: 600; line-height: 1.5; text-transform: uppercase; }
.cs-preview-table th:nth-last-child(-n+2) { width: 14%; }
.cs-preview-table td { padding: 22px 6px; color: #66756c; font-size: 11px; text-align: center; border-bottom: 1px solid #e1e8de; }
.cs-preview-link { display: inline-flex; align-items: center; min-height: 44px; gap: 8px; margin-top: 5px; font-size: 11px; color: var(--teal) !important; }
.cs-preview-link:hover { text-decoration: underline; }
.cs-preview-link svg { width: 13px; height: 13px; }
.cs-heading-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 60px; margin-bottom: 34px; }
.cs-heading-row .cs-copy { max-width: 400px; }
.cs-facilities { display: flex; flex-wrap: wrap; gap: 14px 25px; margin-bottom: 36px; }
.cs-facility { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #526b54; }
.cs-facility svg { width: 18px; height: 18px; }
.cs-feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.cs-feature { padding-top: 27px; border-top: 1px solid #b8cbb0; }
.cs-feature > .cs-icon { color: var(--teal); margin-bottom: 22px; }
.cs-feature h3 { font-size: 23px; font-weight: 600; letter-spacing: -.5px; margin-bottom: 12px; }
.cs-feature p { font-size: 15px; color: var(--muted); line-height: 1.8; max-width: 480px; }
.cs-journey { background: #e9eedf; border-block: 1px solid #d9e2ce; }
.cs-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 38px; padding: 0; list-style: none; }
.cs-step-number { display: inline-block; color: var(--teal); font-size: 13px; margin-bottom: 16px; }
.cs-step h3 { font-size: 19px; font-weight: 600; letter-spacing: -.3px; margin-bottom: 12px; }
.cs-step p { font-size: 14px; line-height: 1.8; color: var(--muted); }
.cs-roles { display: grid; grid-template-columns: .8fr 1.2fr; gap: 80px; }
.cs-role { display: grid; grid-template-columns: 185px 1fr; gap: 22px; padding-block: 23px; border-top: 1px solid #cbd7c2; }
.cs-role h3 { font-size: 15px; font-weight: 600; }
.cs-role p { color: var(--muted); font-size: 14px; line-height: 1.8; }
.cs-faq { border-top: 1px solid #dbe1d3; }
.cs-faq-grid { display: grid; grid-template-columns: .8fr 1.2fr; gap: 80px; }
.cs-faq-intro .cs-copy { max-width: 300px; margin-top: 20px; }
.cs-faq-list { border-top: 1px solid #cdd8c6; }
.cs-faq details { border-bottom: 1px solid #cdd8c6; }
.cs-faq summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 24px; cursor: pointer; padding: 22px 0; font-size: 14px; font-weight: 600; min-height: 66px; }
.cs-faq summary::-webkit-details-marker { display: none; }
.cs-faq summary:after { content: '+'; font-size: 23px; font-weight: 400; line-height: 1; color: #5b7950; }
.cs-faq details[open] summary:after { content: '−'; }
.cs-faq details p { font-size: 14px; line-height: 1.85; color: var(--muted); padding: 0 24px 24px 0; }
.cs-final { background: var(--deep); color: var(--paper); padding-block: 64px; }
.cs-final .cs-wrap { display: flex; justify-content: space-between; align-items: center; gap: 35px; }
.cs-final h2 { font-size: clamp(32px, 3.5vw, 44px); line-height: 1.2; margin-bottom: 13px; }
.cs-final p { font-size: 14px; color: #bdcec3; }
.cs-final .cs-button { flex: none; }
.cs-footer { background: var(--deep); color: #b0c2b4; }
.cs-footer-inner { padding-block: 28px; border-top: 1px solid #ffffff20; display: flex; justify-content: space-between; gap: 25px; align-items: center; }
.cs-footer .cs-brand { font-size: 19px; color: var(--paper); }
.cs-footer .cs-brand-mark { width: 26px; height: 26px; }
.cs-footer p { font-size: 12px; }
.cs-footer-links { display: flex; gap: 22px; font-size: 12px; }
.cs-footer-links a:hover { color: var(--lime); }
@media (max-width: 1050px) {
    .cs-wrap { width: calc(100% - 64px); }
    .cs-nav-links { gap: 20px; }
    .cs-hero-grid { gap: 28px; }
    .cs-hero h1 { font-size: 62px; }
    .cs-preview-heading { flex-wrap: wrap; }
    .cs-preview-body { padding: 14px; }
    .cs-heading-row { gap: 35px; }
    .cs-roles, .cs-faq-grid { gap: 45px; }
    .cs-role { grid-template-columns: 1fr; gap: 9px; }
}
@media (max-width: 760px) {
    .cs-wrap { width: calc(100% - 40px); }
    .cs-section { padding-block: 60px; }
    .cs-nav-inner { height: 70px; gap: 12px; }
    .cs-brand { font-size: 21px; }
    .cs-brand-mark { width: 29px; height: 29px; }
    .cs-nav-links { display: none; }
    .cs-nav .cs-button { padding: 10px 14px; }
    .cs-nav .cs-button svg { display: none; }
    .cs-menu-toggle { display: flex; }
    .cs-mobile-nav { display: flex; flex-direction: column; border-top: 1px solid #ffffff20; padding: 10px 20px 18px; }
    .cs-mobile-nav a { padding: 12px 0; font-size: 14px; }
    .cs-hero-grid { grid-template-columns: 1fr; padding-block: 48px 35px; gap: 28px; }
    .cs-hero h1 { font-size: clamp(49px, 11vw, 76px); }
    .cs-hero-copy { max-width: 480px; }
    .cs-hero-actions { gap: 20px; }
    .cs-art { width: min(490px, 100%); margin-inline: auto; }
    .cs-preview-heading { flex-wrap: nowrap; }
    .cs-preview-heading h2 { font-size: 16px; }
    .cs-preview-heading p { max-width: 165px; }
    .cs-preview-create { font-size: 10px; padding: 9px; }
    .cs-preview-table th { font-size: 8px; padding-inline: 4px; }
    .cs-heading-row { display: block; margin-bottom: 28px; }
    .cs-heading-row .cs-copy { margin-top: 20px; max-width: 480px; }
    .cs-feature-grid, .cs-steps, .cs-roles, .cs-faq-grid { grid-template-columns: 1fr; gap: 30px; }
    .cs-facilities { gap: 12px 20px; }
    .cs-facility { font-size: 12px; }
    .cs-steps { margin-top: 30px; }
    .cs-step { padding-left: 38px; position: relative; }
    .cs-step-number { position: absolute; top: 4px; left: 0; }
    .cs-role { grid-template-columns: 1fr; gap: 10px; }
    .cs-final .cs-wrap { align-items: flex-start; flex-direction: column; gap: 24px; }
    .cs-footer-inner { flex-wrap: wrap; }
    .cs-footer p { order: 3; width: 100%; }
    .cs-footer-links { gap: 17px; }
}
@media (max-width: 380px) {
    .cs-brand { font-size: 18px; gap: 6px; }
    .cs-brand-mark { width: 26px; }
    .cs-nav-action { gap: 7px; }
    .cs-nav .cs-button { padding-inline: 11px; font-size: 12px; }
    .cs-hero h1 { font-size: 46px; }
    .cs-hero-actions { align-items: flex-start; flex-direction: column; }
    .cs-preview-heading { flex-wrap: wrap; gap: 10px; }
    .cs-preview-heading p { max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
    .cs *, .cs *:before, .cs *:after { animation: none !important; transition: none !important; }
}
@media (forced-colors: active) {
    .cs-button, .cs-reservation-preview { border: 1px solid ButtonText; }
}
`;

function Brand() {
    // Heroicons 24/outline/academic-cap, from the installed heroicons package.
    return <><svg className="cs-brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg><span>Campu<span>Space</span></span></>;
}

// Mirrors the headings, actions, and empty state of user/my-reservations.blade.php.
function ReservationPreview({ reservationUrl, createReservationUrl }) {
    return (
        <figure className="cs-reservation-preview">
            <figcaption className="cs-preview-bar">Pratinjau halaman reservasi</figcaption>
            <div className="cs-preview-body">
                <div className="cs-preview-heading">
                    <div><h2>Reservasi Saya</h2><p>Lihat daftar fasilitas yang pernah kamu pinjam.</p></div>
                    <a className="cs-preview-create" href={createReservationUrl}>+ Tambah Reservasi</a>
                </div>
                <table className="cs-preview-table" aria-label="Pratinjau daftar reservasi tanpa data akun">
                    <thead><tr>
                        <th scope="col">Nama fasilitas</th>
                        <th scope="col">Tanggal & waktu</th>
                        <th scope="col">Tujuan penggunaan</th>
                        <th scope="col">Status</th>
                        <th scope="col">Aksi</th>
                    </tr></thead>
                    <tbody><tr><td colSpan={5}>Belum ada reservasi</td></tr></tbody>
                </table>
                <a className="cs-preview-link" href={reservationUrl}>Buka Reservasi Saya <Icon name="arrow" className="cs-arrow" /></a>
            </div>
        </figure>
    );
}

const facilities = [['room', 'Ruang kelas'], ['hall', 'Aula'], ['lab', 'Laboratorium'], ['tool', 'Peralatan'], ['field', 'Lapangan']];
const features = [
    { icon: 'calendar', title: 'Reservasi fasilitas', text: 'Pilih fasilitas dan tanggal, periksa jadwal yang tersedia, lalu ajukan peminjaman. Lihat status pengajuan dan tiket peminjaman di halaman Reservasi Saya.' },
    { icon: 'tool', title: 'Laporan kerusakan', text: 'Pilih fasilitas yang bermasalah dan jelaskan kondisinya. Laporan masuk ke petugas agar dapat diperiksa dan ditindaklanjuti.' },
];
const steps = [
    ['Pilih fasilitas dan jadwal', 'Masuk dengan akun kampus. Pada form reservasi, pilih ruangan dan tanggal untuk melihat ketersediaan waktu.'],
    ['Lengkapi pengajuan', 'Isi tujuan penggunaan dan pilih rentang waktu yang dibutuhkan, lalu kirim pengajuan.'],
    ['Periksa status reservasi', 'Buka Reservasi Saya untuk melihat hasil peninjauan. Jika disetujui, tiket peminjaman dapat dibuka dari daftar tersebut.'],
];
const roles = [
    ['Mahasiswa & dosen', 'Mengajukan peminjaman untuk kegiatan kampus dan melaporkan masalah pada fasilitas.'],
    ['Petugas', 'Meninjau pengajuan reservasi dan menindaklanjuti laporan fasilitas.'],
    ['Admin', 'Mengelola akses pengguna dan memantau layanan fasilitas kampus.'],
];
const faqs = [
    ['Bagaimana cara mendapatkan akun?', 'Gunakan akun yang diberikan pengelola kampus. Jika belum memiliki akun atau mengalami kendala saat masuk, hubungi petugas atau admin kampus.'],
    ['Fasilitas apa saja yang bisa dipinjam?', 'Fasilitas mengikuti daftar yang disediakan pengelola kampus. CampuSpace ditujukan untuk mengelola ruang kelas, aula, laboratorium, peralatan, dan lapangan.'],
    ['Apakah reservasi langsung disetujui?', 'Pengajuan perlu ditinjau oleh petugas atau admin. Periksa statusnya di Reservasi Saya dan pastikan sudah disetujui sebelum menggunakan fasilitas.'],
    ['Bisakah reservasi dibatalkan?', 'Reservasi yang masih berstatus Menunggu dapat dibatalkan melalui halaman Reservasi Saya. Untuk pengajuan yang sudah disetujui, hubungi petugas kampus.'],
    ['Bagaimana melaporkan fasilitas bermasalah?', 'Masuk ke akunmu dan buka layanan laporan. Pilih fasilitas yang bermasalah, lalu jelaskan kerusakan atau kendalanya agar petugas dapat menindaklanjuti.'],
];

export default function Landing({ loginUrl, reservationUrl, createReservationUrl }) {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const previousLanguage = document.documentElement.lang;
        document.documentElement.lang = 'id';
        return () => { document.documentElement.lang = previousLanguage; };
    }, []);

    function closeOnEscape(event) {
        if (event.key === 'Escape' && menuOpen) {
            setMenuOpen(false);
            document.getElementById('cs-menu-toggle')?.focus();
        }
    }

    const navigation = [['#fasilitas', 'Fasilitas'], ['#cara-kerja', 'Cara reservasi'], ['#faq', 'FAQ']];

    return (
        <>
            <Head title="CampuSpace — Your Campus. Your Space.">
                <meta name="description" content="Cek ketersediaan fasilitas kampus, ajukan reservasi, dan laporkan kerusakan melalui CampuSpace." />
                <meta name="theme-color" content="#062e29" />
                <meta property="og:title" content="CampuSpace — Your Campus. Your Space." />
                <meta property="og:description" content="Reservasi dan laporan fasilitas kampus untuk mahasiswa, dosen, dan pengelola." />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="id_ID" />
            </Head>
            <style>{styles}</style>
            <div className="cs" lang="id" id="atas">
                <a className="cs-skip" href="#konten">Langsung ke konten</a>
                <header className="cs-nav" onKeyDown={closeOnEscape}>
                    <div className="cs-wrap cs-nav-inner">
                        <a href="#atas" className="cs-brand" aria-label="CampuSpace, kembali ke atas"><Brand /></a>
                        <nav className="cs-nav-links" aria-label="Navigasi utama">
                            {navigation.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
                        </nav>
                        <div className="cs-nav-action">
                            <a className="cs-button cs-button-primary" href={loginUrl}>Masuk <Icon name="arrow" className="cs-arrow" /></a>
                            <button id="cs-menu-toggle" className="cs-menu-toggle" type="button" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} aria-controls="cs-mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
                                <Icon name={menuOpen ? 'close' : 'menu'} />
                            </button>
                        </div>
                    </div>
                    <nav id="cs-mobile-navigation" className="cs-mobile-nav" aria-label="Navigasi seluler" hidden={!menuOpen}>
                        {navigation.map(([href, label]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
                    </nav>
                </header>

                <main id="konten" tabIndex={-1}>
                    <section className="cs-hero cs-dark" aria-labelledby="hero-title">
                        <div className="cs-wrap cs-hero-grid">
                            <div>
                                <h1 id="hero-title" className="cs-serif" lang="en">Your Campus.<br /><em>Your Space.</em></h1>
                                <p className="cs-hero-copy">Cek ketersediaan fasilitas kampus, ajukan reservasi, dan laporkan kerusakan melalui CampuSpace.</p>
                                <div className="cs-hero-actions">
                                    <a href={createReservationUrl} className="cs-button cs-button-primary">Ajukan reservasi <Icon name="arrow" className="cs-arrow" /></a>
                                    <a href="#cara-kerja" className="cs-text-link">Cara reservasi</a>
                                </div>
                                <p className="cs-hero-note">Gunakan akun yang diberikan pengelola kampus.</p>
                            </div>
                            <div className="cs-art">
                                <ReservationPreview reservationUrl={reservationUrl} createReservationUrl={createReservationUrl} />
                            </div>
                        </div>
                    </section>

                    <section className="cs-section" id="fasilitas" aria-labelledby="features-title">
                        <div className="cs-wrap">
                            <div className="cs-heading-row">
                                <h2 id="features-title" className="cs-serif cs-section-title">Fasilitas kampus,<br />lebih mudah diurus.</h2>
                                <p className="cs-copy">Urus peminjaman dan sampaikan masalah fasilitas tanpa harus berpindah layanan.</p>
                            </div>
                            <div className="cs-facilities" aria-label="Jenis fasilitas">
                                {facilities.map(([icon, label]) => <span className="cs-facility" key={label}><Icon name={icon} />{label}</span>)}
                            </div>
                            <div className="cs-feature-grid">
                                {features.map(feature => <article className="cs-feature" key={feature.title}><Icon name={feature.icon} /><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
                            </div>
                        </div>
                    </section>

                    <section className="cs-section cs-journey" id="cara-kerja" aria-labelledby="steps-title">
                        <div className="cs-wrap">
                            <h2 id="steps-title" className="cs-serif cs-section-title">Cara mengajukan reservasi</h2>
                            <ol className="cs-steps">
                                {steps.map(([title, text], index) => <li className="cs-step" key={title}><span className="cs-step-number" aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}
                            </ol>
                        </div>
                    </section>

                    <section className="cs-section" aria-labelledby="roles-title">
                        <div className="cs-wrap cs-roles">
                            <h2 id="roles-title" className="cs-serif cs-section-title">Siapa yang<br />menggunakan CampuSpace?</h2>
                            <div>{roles.map(([title, text]) => <article className="cs-role" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
                        </div>
                    </section>

                    <section className="cs-section cs-faq" id="faq" aria-labelledby="faq-title">
                        <div className="cs-wrap cs-faq-grid">
                            <div className="cs-faq-intro"><h2 id="faq-title" className="cs-serif cs-section-title">Pertanyaan umum</h2><p className="cs-copy">Tentang akun, peminjaman, dan laporan fasilitas.</p></div>
                            <div className="cs-faq-list">
                                {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
                            </div>
                        </div>
                    </section>

                    <section className="cs-final cs-dark" aria-labelledby="final-title">
                        <div className="cs-wrap"><div><h2 id="final-title" className="cs-serif">Butuh fasilitas untuk kegiatanmu?</h2><p>Pilih fasilitas dan jadwal, lalu ajukan peminjaman.</p></div><a href={createReservationUrl} className="cs-button cs-button-primary">Ajukan reservasi <Icon name="arrow" className="cs-arrow" /></a></div>
                    </section>
                </main>

                <footer className="cs-footer cs-dark">
                    <div className="cs-wrap cs-footer-inner">
                        <a href="#atas" className="cs-brand" aria-label="CampuSpace, kembali ke atas"><Brand /></a>
                        <p>© {new Date().getFullYear()} CampuSpace</p>
                        <nav className="cs-footer-links" aria-label="Navigasi footer"><a href="#fasilitas">Fasilitas</a><a href="#cara-kerja">Cara reservasi</a><a href="#faq">FAQ</a></nav>
                    </div>
                </footer>
            </div>
        </>
    );
}
