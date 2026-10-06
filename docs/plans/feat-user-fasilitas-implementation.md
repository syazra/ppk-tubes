# Implementasi fasilitas pengguna, 5 Oktober 2026

Implementasi mengikuti `feat-user-fasilitas.md` dengan keputusan terbaru pengguna: katalog ditempatkan langsung di `/reservations/form`. Form reservasi yang ada diperluas, dengan struktur kartu, tanggal, tujuan penggunaan, grid waktu, algoritma dua klik, hidden input, serta proses POST dan redirect yang dipertahankan. Sesuai permintaan lanjutan, dropdown Ruangan dihapus; pilihan fasilitas berasal dari tombol kartu dan ditampilkan sebagai teks pada form. Tidak ada halaman katalog baru atau perubahan navigasi bersama.

## Perilaku

- Bagian **Cari fasilitas** berada di atas form lama. Tipe, lokasi (tidak peka kapital, karakter `%`/`_` diperlakukan sebagai teks), kapasitas minimum, tanggal, reset, dan pagination tersedia. Enam fasilitas per halaman diurutkan berdasarkan nama lalu ID.
- Pencarian dan pagination memperbarui bagian katalog saja melalui AJAX. Isian form reservasi tetap utuh. **Pilih fasilitas** mengisi hidden input `room_id`, ringkasan fasilitas yang dipilih, dan tanggal yang sah, lalu menggunakan listener dan grid reservasi lama. Fasilitas nonaktif tetap terlihat tanpa tombol pemilihan. Katalog menampilkan tiga kolom pada lebar mulai 1024px, dua kolom pada tablet, dan satu kolom pada ponsel.
- Disclosure **Lihat slot waktu** menampilkan 26 interval 30 menit, dari 07:00 sampai 20:00 dalam zona waktu aplikasi. Label teks adalah **Tersedia** atau **Tidak tersedia**. Request dibatalkan/diberi versi untuk mencegah respons lama menimpa pilihan terbaru; kegagalan mempunyai pesan dan opsi mencoba lagi.
- `RoomAvailability` menyediakan jam operasional, langkah waktu, batas tiga jam, status pemblokir, dan perhitungan slot. `menunggu`/`disetujui` memblokir overlap dengan batas interval terbuka di akhir; `ditolak`/`dibatalkan` membebaskan slot. Waktu historis dengan detik diperhitungkan.
- `ReservationController::store` tetap memakai blok validasi/simpan yang ada, dengan tambahan penegakan batas tiga jam dan keselarasan 30 menit. Query konflik menggunakan perbandingan waktu agar batas bersebelahan sama pada SQLite/MySQL.
- Endpoint lama `/reservations/slots` tetap mengembalikan array rentang booking `start_time`/`end_time`. Header `X-Reservation-Earliest-Start` dan `X-Reservation-Timezone` menyelaraskan grid lama dengan waktu server, termasuk detik/mikrodetik. Endpoint baru `/reservations/facilities/{room}/slots` hanya berisi `room_id`, `date`, dan `slots` dengan waktu/status. Detail pemohon, tujuan, dan nomor reservasi tidak disertakan.
- Route katalog/slot berada pada grup autentikasi reservasi yang sudah ada. Landing, route `/`, admin, operator, dan seeder tidak diubah.

## Foto dan instalasi

Migration aditif `2026_10_05_000001_create_room_images_table.php` menambahkan relasi satu fasilitas ke banyak foto. Metadata mempunyai `path`, `alt_text`, `display_order`, dan timestamps; urutan foto adalah `display_order` kemudian `id`. Foreign key menghapus metadata foto ketika fasilitas benar-benar dihapus; penghapusan berkas fisik tidak otomatis dilakukan.

Untuk checkout yang menggunakan database proyek:

```sh
php artisan migrate
php artisan storage:link
npm run build
```

Simpan berkas foto di disk `public`, misalnya `storage/app/public/facilities/aula.jpg`, lalu tambahkan metadata melalui `Room::images()->create(['path' => 'facilities/aula.jpg', 'alt_text' => 'Aula utama', 'display_order' => 0])`. URL dibuat dari disk publik, hanya untuk berkas yang ada dengan path relatif aman. Foto pertama menjadi sampul; fasilitas dengan beberapa foto mempunyai galeri disclosure dan tautan gambar ukuran penuh.

Satu foto ilustrasi lokal dari lampiran pengguna disimpan di `public/images/facility-placeholder-photo.jpg` dan dipakai bersama untuk fasilitas tanpa foto. Ini bukan foto aktual fasilitas dan diberi label **Foto ilustrasi**. Placeholder tanpa gambar `facility-placeholder.svg` tetap tersedia sebagai fallback saat gambar gagal dimuat. Tidak ada metadata foto palsu atau foto laporan kerusakan yang dipakai untuk katalog.

Pengujian menggunakan SQLite in-memory; pratinjau browser memakai SQLite terpisah di worktree, tanpa mengubah database checkout utama. Migration diuji naik/turun di SQLite dan SQL MySQL dikompilasi tanpa koneksi; eksekusi pada server MySQL belum diverifikasi.

## Verifikasi dan pekerjaan berikutnya

Pengujian fitur meliputi akses tamu, filter terpisah/gabungan/literal, validasi input, pagination, foto nol/satu/banyak dan urutan/path, payload privasi, 26 slot, semua status reservasi, overlap/batas waktu, tanggal lampau/nonaktif, batas tiga jam termasuk pergantian hari, serta penerimaan/penolakan POST lama dan pemulihan isian setelah kegagalan.

Pengujian JavaScript menjalankan sumber katalog dan script inline form yang sebenarnya dengan Node VM/DOM stub: request terlambat, pembatalan, gagal/invalid, reload tanggal, retry, pelestarian isian, propagasi ruangan/tanggal, fallback gambar, detik, cutoff mikrodetik, keyboard, dan pembatalan rentang. Jalankan:

```sh
php artisan test --do-not-cache-result --filter="UserFacilityBrowsingTest|RoomImagesTest|AdminFacilityTest"
node --test tests/JavaScript/*.test.js
npm run build
```

Browser diperiksa pada 1280×1000 dan 390×844: filter gabungan, 26 slot, tanggal, pemilihan fasilitas, isian/rentang tetap utuh saat pencarian, keyboard, pembatalan rentang, gambar termuat, penolakan konflik dan pemulihan form, serta tidak ada luapan horizontal pada ponsel.

Suite penuh memiliki kegagalan yang juga ditemukan pada baseline `d58a6ab`: tiga kasus registrasi (termasuk route `admin.students.store` yang hilang), redirect dashboard, view `operator.navbar` yang hilang, dan dua ketidaksesuaian seeder. PHPStan proyek juga memiliki temuan lama. Kode baru tidak menambah temuan PHPStan; metode/relasi lama yang tidak disentuh tetap perlu penanganan terpisah. Format diperiksa pada file PHP baru; controller lama tidak diformat ulang secara menyeluruh agar perubahan tetap terarah.

Hasil verifikasi implementasi awal: **30/30 tes PHP terarah, 353 assertions; 17/17 tes JavaScript; build asset, kompilasi Blade, dan Pint terarah lulus**. Suite penuh: **59 tes, 52 lulus, 6 gagal, 1 error, 455 assertions**; ketujuh kasus bermasalah sama dengan baseline (34 tes, 27 lulus). PHPStan keseluruhan: **46 temuan lama**, dibandingkan 49 pada baseline; pemeriksaan service/model foto baru bersih. `git diff --check` lulus. Bukti pratinjau berada di `storage/logs/facility-form-desktop.png` dan `storage/logs/facility-form-mobile.png` (diabaikan Git).

Setelah penyesuaian dropdown dan tiga kolom, tes regresi yang ada diperbarui: **19/19 tes UserFacilityBrowsingTest, 260 assertions; 17/17 tes JavaScript lulus**. Build, kompilasi Blade, Pint terarah, dan `git diff --check` lulus. Browser memverifikasi hidden `room_id`, nama fasilitas dipilih, tujuan tetap terjaga, 26 slot termuat, tiga kolom pada 1024px/1280px, satu kolom pada 390px, dan tidak ada luapan horizontal. Bukti terbaru: `storage/logs/facility-three-columns.png`.

Pekerjaan lanjutan: jalankan migration/storage link di lingkungan utama, verifikasi migration di MySQL sebenarnya, tambahkan foto asli fasilitas, dan kerjakan UI unggah/urut/hapus foto admin sebagai fitur terpisah. Katalog pengunjung tetap dikerjakan pengguna pada branch lain.

Mekanisme penyimpanan lama tetap melakukan cek konflik lalu insert. Perlindungan terhadap dua permintaan reservasi serentak melalui penguncian/transaksi belum ditambahkan pada perubahan ini.
