<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;

class DemoActivityText
{
    public const RESERVATIONS = [
        'Aula' => [
            'Seminar kepemimpinan organisasi' => 'Sidang majelis para penjaga menara',
            'Latihan paduan suara' => 'Latihan nyanyian para bard di bawah kubah senja',
            'Lokakarya penulisan ilmiah' => 'Penyalinan manuskrip dan hikayat kerajaan',
            'Pentas seni kampus' => 'Pementasan kisah naga dan pengembara malam',
            'Orientasi komunitas mahasiswa' => 'Penyambutan anggota baru serikat penjelajah',
            'Kuliah tamu lintas fakultas' => 'Wejangan sang arcanis dari negeri seberang',
            'Forum pengabdian masyarakat' => 'Musyawarah bantuan bagi dusun di tepi hutan',
            'Rapat koordinasi kepanitiaan' => 'Persiapan perjamuan bulan purnama',
        ],
        'Laboratorium' => [
            'Praktikum pengenalan instrumen' => 'Pengenalan alembik dan timbangan alkimia',
            'Eksperimen kelompok penelitian' => 'Peracikan eliksir embun dan akar mandragora',
            'Pelatihan keselamatan laboratorium' => 'Pembelajaran segel pelindung ruang ramuan',
            'Pengujian prototipe tugas akhir' => 'Pengujian tongkat bertatah kristal aether',
            'Workshop analisis data' => 'Pembacaan pertanda pada kristal scrying',
            'Demonstrasi alkimia dasar' => 'Peragaan transmutasi tembaga oleh ahli alkimia',
            'Uji kalibrasi peralatan' => 'Penyelarasan lingkaran rune dan bejana perak',
            'Diskusi hasil penelitian' => 'Telaah catatan penjelajahan reruntuhan kuno',
        ],
        'Lapangan' => [
            'Latihan olahraga antarangkatan' => 'Latihan ketangkasan para kesatria muda',
            'Turnamen persahabatan' => 'Turnamen persahabatan antarserikat',
            'Senam bersama komunitas' => 'Latihan keseimbangan para pengelana fajar',
            'Latihan formasi tim' => 'Latihan formasi penjaga gerbang utara',
            'Seleksi anggota klub olahraga' => 'Uji ketangkasan calon penunggang griffin',
            'Festival permainan tradisional' => 'Perayaan permainan rakyat pada hari panen',
            'Pelatihan kebugaran staf' => 'Latihan kesiagaan para penjaga benteng',
            'Persiapan kompetisi kampus' => 'Persiapan perlombaan sapu terbang',
        ],
        'Ruang Kelas' => [
            'Diskusi kelompok mata kuliah' => 'Kajian aksara elf dan bahasa para leluhur',
            'Presentasi proyek semester' => 'Pemaparan peta bintang kepada dewan magister',
            'Kelas pendampingan akademik' => 'Bimbingan pembacaan gulungan sihir bagi novis',
            'Lokakarya pemrograman' => 'Latihan menyusun mantra dan ukiran rune',
            'Rapat komunitas literasi' => 'Pertemuan penjaga pustaka dan penutur hikayat',
            'Bimbingan tugas akhir' => 'Bimbingan penyusunan grimoire perjalanan',
            'Pelatihan administrasi organisasi' => 'Pelatihan pencatatan piagam dan sumpah serikat',
            'Persiapan lomba karya ilmiah' => 'Persiapan adu kebijaksanaan para arcanis',
        ],
    ];

    public const REPORTS = [
        'Aula' => [
            'Speaker sisi kiri mengeluarkan dengung saat mikrofon dinyalakan.' => 'Corong gema di sisi balairung berdengung saat nyanyian bard dimulai.',
            'Engsel pintu utama berbunyi dan sulit ditutup rapat.' => 'Engsel gerbang kayu ek berderit dan daun pintunya sulit dirapatkan.',
            'Tirai panggung macet pada rel bagian kanan.' => 'Tirai beludru panggung tersangkut pada kait besi sebelah kanan.',
            'Lampu sorot dekat panggung berkedip saat digunakan.' => 'Lentera kristal di atas mimbar meredup saat perjamuan berlangsung.',
        ],
        'Laboratorium' => [
            'Sambungan kabel alat praktikum longgar dan perlu diperiksa.' => 'Lingkaran rune pada meja alkimia retak dan gagal menyalurkan aether.',
            'Keran meja praktikum menetes setelah ditutup.' => 'Katup bejana ramuan masih menetes meski segelnya telah dirapatkan.',
            'Ventilasi ruang alat mengeluarkan bunyi tidak biasa.' => 'Cerobong ruang ramuan mendesing dan menyisakan asap keunguan.',
            'Rak penyimpanan instrumen miring dan penguncinya longgar.' => 'Rak alembik miring dan kait peti bahan alkimia terlepas.',
        ],
        'Lapangan' => [
            'Garis batas lapangan memudar setelah hujan.' => 'Tanda batas arena dari kapur putih tersapu hujan malam.',
            'Saluran drainase sisi lapangan tersumbat daun.' => 'Parit di tepi arena tersumbat daun dari Hutan Fangorn.',
            'Tiang jaring pembatas longgar saat terkena angin.' => 'Tiang jaring arena goyah diterpa angin dari celah benteng.',
            'Lampu penerangan sisi lapangan tidak menyala.' => 'Obor biru di sisi arena padam meski batu pemantiknya telah diganti.',
        ],
        'Ruang Kelas' => [
            'Kursi pada baris belakang goyah saat diduduki.' => 'Bangku kayu ek di baris belakang goyah saat kajian gulungan dimulai.',
            'Kabel proyektor tidak tersambung dengan stabil.' => 'Cermin penayang rune memantulkan bayangan terputus-putus.',
            'Pengunci jendela sisi kanan tidak berfungsi.' => 'Kait jendela kaca patri sebelah kanan tidak dapat mengunci rapat.',
            'Lampu dekat papan tulis berkedip saat pelajaran.' => 'Lentera di atas papan mantra berkedip selama pengajaran arcanis.',
        ],
    ];

    public const REPORT_EXAMPLES = [
        'Kristal komputasi tidak menyala dan jaringan rune terputus.' => 'Kristal aether meredup dan lingkaran rune kehilangan ikatan mantranya.',
        'Lampu dan proyektor ruang kelas perlu diperbaiki.' => 'Lentera ruang kajian padam dan cermin penayang rune retak.',
        'Pendingin aula tidak berfungsi dan kursi perlu diperbaiki.' => 'Rune penyejuk balairung memudar dan kursi dewan mengalami keretakan.',
        'Permukaan lapangan berlubang dan perlu diratakan.' => 'Tanah arena berlubang akibat jejak tunggangan dan perlu diratakan.',
        'Mikrofon aula mengeluarkan suara berisik saat digunakan.' => 'Corong gema balairung mengeluarkan lolongan saat syair dibacakan.',
        'Salah satu papan tulis sulit dibersihkan.' => 'Bekas tinta rune pada papan mantra tidak hilang setelah diseka.',
        'Keran wastafel laboratorium bocor.' => 'Katup bejana pencuci alkimia bocor dan membasahi lantai batu.',
        'Jaring pembatas lapangan robek.' => 'Jaring pembatas arena robek setelah latihan sapu terbang.',
        'Pendingin ruangan diduga tidak menyala.' => 'Mantra penyejuk ruang pustaka diduga kehilangan daya.',
        'Proyektor diduga mengalami kerusakan.' => 'Cermin penayang hikayat diduga kehilangan pesonanya.',
        'Stopkontak di dekat meja depan tidak berfungsi.' => 'Batu penyalur aether di dekat meja magister tidak memancarkan cahaya.',
        'Bangku taman terlihat longgar.' => 'Bangku taman di bawah pohon tua goyah dan tertutup lumut.',
    ];

    public const NOTES = [
        'rejection_reason' => [
            'Pengajuan belum memenuhi persyaratan kegiatan.' => 'Piagam kegiatan belum memenuhi ketentuan dewan penjaga.',
            'Dokumen kegiatan belum lengkap.' => 'Gulungan permohonan belum dilengkapi segel serikat.',
            'Kegiatan perlu dijadwalkan ulang sesuai agenda kampus.' => 'Waktu pertemuan perlu diselaraskan dengan kalender dewan.',
            'Penanggung jawab kegiatan belum dikonfirmasi.' => 'Penjaga yang menjamin kegiatan belum menyatakan sumpahnya.',
            'Hasil pemeriksaan menunjukkan fasilitas berfungsi normal.' => 'Pemeriksaan kustodian menunjukkan pesona fasilitas masih utuh.',
            'Peralatan berfungsi normal setelah pemeriksaan.' => 'Pemeriksaan kustodian menunjukkan perkakas masih bekerja sebagaimana mestinya.',
            'Keluhan sama sudah ditangani melalui laporan sebelumnya.' => 'Keluhan serupa telah ditangani berdasarkan gulungan aduan terdahulu.',
            'Kendala berasal dari perangkat pribadi, bukan fasilitas kampus.' => 'Gangguan berasal dari jimat milik pelapor; pesona ruangan tetap utuh.',
        ],
        'resolution' => [
            'Komponen diperbaiki dan fasilitas telah diuji kembali.' => 'Kustodian memperbaiki perkakas dan menguji kembali pesona ruangan.',
            'Komponen longgar dikencangkan dan diuji bersama pengguna.' => 'Kait yang longgar dikencangkan lalu diuji bersama penghuni menara.',
            'Bagian yang rusak diganti; pemeriksaan akhir menunjukkan fungsi normal.' => 'Bagian yang retak diganti oleh pandai besi; segel penjaga kembali utuh.',
            'Peralatan dibersihkan, disetel ulang, dan siap digunakan kembali.' => 'Perkakas dibersihkan dan rune diselaraskan; ruangan siap digunakan kembali.',
        ],
    ];

    /**
     * Upgrade only recognized sample text, preserving operator notes, identities and timestamps.
     *
     * @param  array<string, string>  $descriptions
     */
    public static function upgrade(string $table, int $roomId, array $descriptions): void
    {
        foreach (DB::table($table)->where('room_id', $roomId)->whereIn('desc', array_keys($descriptions))->get() as $row) {
            $changes = ['desc' => $descriptions[$row->desc]];
            foreach (self::NOTES as $field => $translations) {
                $value = $row->{$field} ?? null;
                if (is_string($value) && isset($translations[$value])) {
                    $changes[$field] = $translations[$value];
                }
            }
            DB::table($table)->where('id', $row->id)->update($changes);
        }
    }
}
