import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import Icon from '../../components/Icons';
import PublicBrand from '../../components/PublicBrand';
import PublicNavbar from '../../components/PublicNavbar';
import MeaningLens from '../../components/MeaningLens';
import NameDiscovery from '../../components/NameDiscovery';
import '../../../css/guest-about.css';

const roles = [
    ['Mahasiswa & dosen', 'Mengajukan peminjaman untuk kegiatan kampus dan melaporkan masalah pada fasilitas.', 'people'],
    ['Petugas', 'Meninjau pengajuan reservasi dan menindaklanjuti laporan fasilitas.', 'landing-shield'],
    ['Admin', 'Mengelola akses pengguna dan memantau layanan fasilitas kampus.', 'grid'],
];

export default function About({ urls = {} }) {
    const safeUrls = urls || {};
    const landingUrl = safeUrls.landing || '/';
    const facilitiesUrl = safeUrls.facilities || '/fasilitas';

    useEffect(() => {
        const previousLanguage = document.documentElement.lang;
        document.documentElement.lang = 'id';
        return () => { document.documentElement.lang = previousLanguage; };
    }, []);

    return (
        <div className="ga" lang="id">
            <Head title="Tentang Buana">
                <meta name="description" content="Tentang Buana (bhuvanā, “dunia”), layanan fasilitas kampus untuk pengunjung, mahasiswa, dosen, petugas, dan admin." />
            </Head>
            <a href="#tentang-konten" className="ga-skip">Langsung ke konten</a>
            <PublicNavbar urls={safeUrls} active="about" />
            <main id="tentang-konten" tabIndex={-1}>
                <section className="ga-intro" aria-labelledby="about-title">
                    <div className="ga-wrap ga-intro-grid">
                        <div>
                            <p className="ga-eyebrow">Tentang Buana</p>
                            <h1 id="about-title">Satu dunia kampus,<br /><em>untuk kegiatanmu.</em></h1>
                        </div>
                        <p className="ga-copy">Buana membantu warga kampus menemukan fasilitas, melihat ketersediaan jadwal, mengajukan peminjaman, dan melaporkan kerusakan dalam satu layanan.</p>
                    </div>
                </section>
                <section className="ga-meaning" aria-labelledby="meaning-title">
                    <div className="ga-wrap ga-meaning-grid">
                        <div className="ga-meaning-heading">
                            <p className="ga-eyebrow">Makna nama</p>
                            <h2 id="meaning-title">Buana<span className="ga-meaning-origin"> / Bhuwana</span></h2>
                            <p className="ga-meaning-etymology">bhuvanā (Sanskerta)</p>
                            <NameDiscovery />
                        </div>
                        <div className="ga-story-content">
                            <p className="ga-copy">Buana berasal dari bahasa Sanskerta <em>bhuvanā</em>, yang berarti dunia, bumi, alam semesta, atau jagat raya. Dalam konteks lokal Nusantara, terutama Jawa dan Bali, kata ini dipakai untuk merujuk pada lingkup yang luas, terbentang, dan mencakup segalanya.</p>
                            <MeaningLens />
                            <p className="ga-copy">Nama ini mencerminkan tujuan kami: menghubungkan dunia kecil setiap pengguna dengan dunia besar fasilitas kampus, sehingga setiap ruang mudah ditemukan dan dikelola.</p>
                        </div>
                    </div>
                </section>
                <section className="ga-story" aria-labelledby="guest-title">
                    <div className="ga-wrap ga-story-grid">
                        <div className="ga-story-heading">
                            <span className="ga-feature-icon"><Icon name="landing-room" className="ga-icon" /></span>
                            <h2 id="guest-title">Jelajahi fasilitas tanpa akun</h2>
                        </div>
                        <div className="ga-story-content">
                            <p className="ga-copy">Pengunjung dapat mencari fasilitas berdasarkan tipe, lokasi, dan kapasitas serta melihat status setiap slot waktu. Informasi pemohon dan tujuan penggunaan tetap privat.</p>
                            <p className="ga-copy">Mahasiswa dan dosen menggunakan akun yang diberikan pengelola kampus untuk mengajukan reservasi dan laporan. Petugas meninjau pengajuan dan menangani laporan, sementara admin mengelola fasilitas serta akses pengguna.</p>
                            <Link href={facilitiesUrl} className="ga-link">Lihat fasilitas kampus <Icon name="landing-arrow" className="ga-icon" /></Link>
                        </div>
                    </div>
                </section>
                <section className="ga-roles" aria-labelledby="roles-title">
                    <div className="ga-wrap">
                        <p className="ga-eyebrow">Untuk warga kampus</p>
                        <h2 id="roles-title">Siapa yang<br />menggunakan Buana?</h2>
                        <div className="ga-role-grid">
                            {roles.map(([title, text, icon]) => (
                                <article className="ga-role" key={title}>
                                    <span className="ga-role-icon"><Icon name={icon} className="ga-icon" /></span>
                                    <h3>{title}</h3>
                                    <p className="ga-copy">{text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <footer className="ga-footer">
                <div className="ga-wrap ga-footer-inner">
                    <Link href={landingUrl} className="ga-brand" aria-label="Buana — Beranda"><PublicBrand /></Link>
                    <p>© {new Date().getFullYear()} Buana</p>
                    <nav aria-label="Navigasi footer"><Link href={landingUrl}>Beranda</Link><Link href={facilitiesUrl}>Fasilitas</Link></nav>
                </div>
            </footer>
        </div>
    );
}
