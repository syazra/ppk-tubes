<?php

namespace Database\Seeders;

/**
 * Themed (Legendarium / Westeros / wizarding) text pools for demo reservations and reports.
 */
class DemoActivityPools
{
    public const GROUPS = [
        'Serikat Penjelajah Eriador', 'Himpunan Penjaga Gerbang Utara', 'Kelompok Studi Dewan Putih',
        'Perkumpulan Bard Rivendell', 'Klub Kesatria Rohan', 'Komunitas Pustakawan Gondor',
        'Paguyuban Peramu Eliksir', 'Persaudaraan Penjaga Malam', 'Lingkar Cendekia Citadel',
        'Unit Kegiatan Penunggang Griffin', 'Himpunan Pewaris Numenor', 'Kelompok Tani Shire',
    ];

    public const RESERVATIONS = [
        'Aula' => [
            'Sidang majelis para penjaga menara untuk menentukan pemegang kunci perpustakaan',
            'Latihan nyanyian bard menjelang Pesta Panen di bawah kubah senja',
            'Pementasan kisah naga terakhir dan pengembara malam',
            'Penyambutan anggota baru serikat sambil membacakan sumpah kesetiaan',
            'Wejangan sang arcanis tamu dari negeri seberang Laut Sempit',
            'Musyawarah bantuan bagi dusun di tepi Hutan Fangorn',
            'Perjamuan bulan purnama sekaligus pengumuman hasil turnamen',
            'Debat terbuka: layakkah Cincin dilebur atau disimpan di Menara?',
            'Pembacaan hikayat tiga malam tanpa jeda (membawa selimut sangat dianjurkan)',
            'Rapat darurat persiapan menghadapi musim dingin yang katanya akan datang',
        ],
        'Laboratorium' => [
            'Peracikan eliksir embun dan akar mandragora untuk ujian tengah semester',
            'Pengujian tongkat bertatah kristal aether sebelum sidang akhir',
            'Peragaan transmutasi tembaga menjadi perak (emas masih dalam tahap doa)',
            'Penyelarasan lingkaran rune dan bejana perak yang kemarin meledak pelan-pelan',
            'Telaah catatan penjelajahan reruntuhan kuno beserta peta bergambar kadal',
            'Pembacaan pertanda pada kristal scrying demi memprediksi nilai kuis',
            'Percobaan menumbuhkan lembas dari gandum dan sedikit sihir',
            'Pelatihan segel pelindung ruang ramuan agar uapnya tak keluar jendela',
            'Penempaan ulang cincin latihan oleh asisten pandai besi Celebrimbor',
            'Pemurnian wolfsbane untuk praktikum pertahanan terhadap kegelapan',
        ],
        'Lapangan' => [
            'Latihan ketangkasan para kesatria muda menjelang turnamen tombak',
            'Turnamen persahabatan antarserikat dengan taruhan sepiring kue lembas',
            'Latihan keseimbangan para pengelana fajar sambil membawa tas berat',
            'Latihan formasi penjaga gerbang utara dengan jubah hitam',
            'Uji ketangkasan calon penunggang griffin dan sapu terbang',
            'Perayaan permainan rakyat pada hari panen: lomba lari karung dan panahan',
            'Latihan kesiagaan para penjaga benteng saat kabut tebal',
            'Persiapan perlombaan sapu terbang antarasrama',
            'Pertandingan persahabatan hobbit melawan manusia (peraturan: boleh sarapan kedua)',
            'Latihan berkuda para Rohirrim menjelang upacara pelantikan',
        ],
        'Ruang Kelas' => [
            'Kajian aksara elf dan bahasa para leluhur dengan kamus Quenya setebal bata',
            'Pemaparan peta bintang kepada dewan magister',
            'Bimbingan pembacaan gulungan sihir bagi novis yang masih tersandung mantra',
            'Latihan menyusun mantra dan ukiran rune untuk tugas besar',
            'Pertemuan penjaga pustaka dan penutur hikayat',
            'Bimbingan penyusunan grimoire perjalanan setebal tiga ratus halaman',
            'Pelatihan pencatatan piagam dan sumpah serikat',
            'Persiapan adu kebijaksanaan para arcanis tingkat provinsi',
            'Diskusi silsilah tujuh kerajaan agar tak ada lagi yang salah menyebut keturunan',
            'Belajar kelompok menjelang ujian Ramuan Tingkat Lanjut sambil berbagi camilan',
        ],
    ];

    public const REPORTS = [
        'Aula' => [
            'Corong gema di sisi balairung berdengung dan menggetarkan gelas para tamu.',
            'Engsel gerbang kayu ek berderit nyaring seperti naga bangun tidur.',
            'Tirai beludru panggung tersangkut pada kait besi dan menolak terbuka.',
            'Lentera kristal di atas mimbar berkedip seakan Mata Sauron sedang mengintip.',
            'Karpet merah menuju mimbar bernoda anggur dan mulai terlepas dari lantai.',
            'Jendela kaca patri retak dan angin dingin dari Utara menyelinap masuk.',
        ],
        'Laboratorium' => [
            'Lingkaran rune pada meja alkimia retak dan gagal menyalurkan aether.',
            'Katup bejana ramuan masih menetes meski segelnya telah dirapatkan.',
            'Cerobong ruang ramuan mendesing dan menyisakan asap keunguan.',
            'Rak alembik miring dan kait peti bahan alkimia terlepas.',
            'Kuali besar di sudut ruangan tak mau mendidih walau api sudah dinyalakan.',
            'Tanaman mandragora di rak belakang menjerit sepanjang malam dan mengganggu petugas jaga.',
        ],
        'Lapangan' => [
            'Tanda batas arena dari kapur putih tersapu hujan malam.',
            'Parit di tepi arena tersumbat daun dari Hutan Fangorn.',
            'Tiang gawang goyah diterpa angin dari celah benteng.',
            'Obor biru di sisi arena padam meski batu pemantiknya telah diganti.',
            'Tribun kayu sebelah timur berderak keras ketika penonton bersorak.',
            'Genangan lumpur di tengah arena sedalam sepatu bot hobbit.',
        ],
        'Ruang Kelas' => [
            'Bangku kayu ek di baris belakang goyah saat kajian gulungan dimulai.',
            'Cermin penayang rune memantulkan bayangan terputus-putus.',
            'Kait jendela kaca patri sebelah kanan tidak dapat mengunci rapat.',
            'Lentera di atas papan mantra berkedip selama pengajaran arcanis.',
            'Pintu ruangan terkunci sendiri dan hanya terbuka jika diucapkan kata sandi Elf.',
            'Lukisan potret di dinding belakang mengomentari setiap presentasi mahasiswa.',
        ],
    ];

    public const REJECTIONS_RESERVATION = [
        'Gulungan permohonan belum dilengkapi segel serikat.',
        'Waktu pertemuan perlu diselaraskan dengan kalender dewan.',
        'Penjaga yang menjamin kegiatan belum menyatakan sumpahnya.',
        'Piagam kegiatan belum memenuhi ketentuan dewan penjaga.',
        'Ruangan sudah dipesan untuk perjamuan para bangsawan pada jam yang sama.',
    ];

    public const REJECTIONS_REPORT = [
        'Pemeriksaan kustodian menunjukkan perkakas masih bekerja sebagaimana mestinya.',
        'Keluhan serupa telah ditangani berdasarkan gulungan aduan terdahulu.',
        'Gangguan berasal dari jimat milik pelapor; pesona ruangan tetap utuh.',
        'Pemeriksaan kustodian menunjukkan pesona fasilitas masih utuh.',
    ];

    public const RESOLUTIONS = [
        'Kait yang longgar dikencangkan lalu diuji bersama penghuni menara.',
        'Bagian yang retak diganti oleh pandai besi; segel penjaga kembali utuh.',
        'Perkakas dibersihkan dan rune diselaraskan; ruangan siap digunakan kembali.',
        'Kustodian memperbaiki perkakas dan menguji kembali pesona ruangan.',
        'Seorang penyihir tamu membacakan mantra penyegar, lalu pandai kayu menambal sisanya.',
    ];
}
