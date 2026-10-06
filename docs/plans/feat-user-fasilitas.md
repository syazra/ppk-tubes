# Rencana implementasi: katalog fasilitas pengguna

## Instruksi untuk chat Codex berikutnya

Implementasikan rencana ini di branch `feat/user/fasilitas`. Mulai dengan membaca ulang kondisi repository, `AGENTS.md` jika ada, serta file yang disebut di bawah. Kerjakan fitur sampai siap diuji dan laporkan perubahan serta hasil verifikasinya. Rencana ini disusun pada 5 Oktober 2026 dari `origin/main` commit `d58a6ab`; sesuaikan detail teknis bila kode sudah berubah, sambil mempertahankan ruang lingkup dan kriteria penerimaan berikut.

## Tujuan dan batas pekerjaan

Cerita pengguna yang dikerjakan sekarang:

1. Sebagai **pengguna yang masuk**, saya bisa melihat daftar fasilitas dan status ketersediaan setiap slot waktu: `Tersedia` atau `Tidak tersedia`.
2. Sebagai **pengguna yang masuk**, saya bisa mencari fasilitas berdasarkan tipe, lokasi, dan kapasitas.
3. Database dapat menyimpan **nol, satu, atau beberapa foto** per fasilitas; halaman pengguna dapat menampilkan satu atau beberapa foto yang tersedia.

Pengunjung tanpa akun akan mendapat fitur daftar fasilitas di **landing page** yang dikerjakan pengguna secara terpisah. **Jangan mengedit landing page**, termasuk `resources/js/pages/Landing*`, `resources/views/welcome.blade.php`, dan route `/` di `routes/web.php`. Jangan mengerjakan ulang pengelolaan fasilitas admin, rekap admin, atau halaman operator. Tidak ada alur unggah foto melalui admin dalam lingkup ini.

`feat/user/fasilitas` sudah ada di checkout dan, saat rencana ditulis, menunjuk commit yang sama dengan `origin/main` (`d58a6ab`). Sebelum mulai, periksa status Git dan pertahankan perubahan milik pengguna. Jangan membuat chat baru. Implementasi fitur dimulai hanya setelah pengguna menggunakan rencana ini pada chat berikutnya.

## Kondisi kode saat ini

- Fasilitas memakai model `App\Models\Room` dan tabel `rooms`, dengan `name`, `location`, `desc`, `type`, `capacity`, dan boolean `is_avail`. Tipe yang tersedia: `Ruang Kelas`, `Aula`, `Laboratorium`, `Lapangan`.
- `RoomSeeder` sudah mengisi contoh fasilitas. Form reservasi dan laporan kerusakan hanya menampilkan room aktif. Admin dapat mengaktifkan atau menonaktifkan room tanpa menghapus riwayat.
- Route pengguna ada di `routes/user.php`; halaman pengguna memakai Blade dan `resources/views/user/navbar.blade.php`. Landing dan sebagian admin memakai Inertia/React, tetapi halaman katalog pengguna sebaiknya mengikuti pola Blade pengguna yang ada.
- Reservasi berada di `ReservationController`, `Reservation`, dan tabel `reservations`. Kolom waktu: `date_to_reserv`, `start_time`, `end_time`; status `menunggu`, `disetujui`, `ditolak`, `dibatalkan`.
- `reservations.slots` sekarang mengirim rentang waktu reservasi yang memblokir, tanpa detail pemohon. Form reservasi memakai jam 07.00–20.00 dalam langkah 30 menit dan menandai tiga jam terdekat sebagai tidak dapat dipilih di browser. Validasi `store` belum menegakkan batas tiga jam di server. Ini perlu diselaraskan agar tampilan katalog sesuai dengan reservasi yang benar-benar dapat dibuat.
- Foto laporan kerusakan disimpan pada disk `public`, tetapi belum ada foto yang terhubung ke fasilitas. Foto laporan **bukan** foto katalog fasilitas.

## Perilaku produk yang disepakati

### Daftar dan pencarian

- Tambahkan halaman katalog di area pengguna, misalnya `GET /user/facilities`, dan tautan di navigasi pengguna. Tamu diarahkan ke login menurut pola route yang ada.
- Tampilkan nama, tipe, lokasi, kapasitas, deskripsi singkat bila ada, status aktif fasilitas, dan foto. Room tanpa foto memakai placeholder lokal yang layak, tanpa gambar rusak.
- Sediakan filter tipe (nilai enum yang sah), lokasi (pencarian teks, tidak peka huruf besar/kecil), dan kapasitas minimum (`capacity >= input`). Filter dapat dipakai sendiri-sendiri atau digabung. Validasi dan batasi input; tampilkan state kosong dan tombol reset filter. Gunakan urutan stabil serta pagination yang mempertahankan query filter.
- Fasilitas `is_avail = false` tetap dapat terlihat sebagai `Nonaktif`, namun semua slotnya `Tidak tersedia` dan tidak ada ajakan reservasi untuk fasilitas itu. Dengan begitu pengguna tidak keliru menganggap fasilitas hilang dari katalog.
- UI harus bekerja di layar kecil, memiliki label formulir yang jelas, alt text foto, serta status slot yang dapat dipahami tanpa hanya mengandalkan warna.

### Ketersediaan per slot

- Pengguna memilih tanggal pada fasilitas. Untuk setiap tanggal, tampilkan interval 30 menit `[07:00,07:30)` hingga `[19:30,20:00)` dalam waktu lokal aplikasi yang konsisten; label akhir adalah 20.00.
- Slot `Tidak tersedia` jika room nonaktif, waktu sudah lewat / kurang dari batas pemesanan tiga jam, atau ada reservasi `menunggu` maupun `disetujui` yang tumpang tindih. Reservasi `ditolak` dan `dibatalkan` tidak memblokir slot. Gunakan pemeriksaan overlap `reservation.start_time < slot_end` dan `reservation.end_time > slot_start`, sehingga batas yang tepat bersinggungan tetap tersedia.
- Untuk tanggal lampau, seluruh slot `Tidak tersedia`. Validasi tanggal pada endpoint; tangani respons gagal dengan pesan yang jelas. Saat pengguna mengubah tanggal atau filter dengan cepat, hindari hasil lama menimpa pilihan terbaru.
- Endpoint ketersediaan, misalnya `GET /user/facilities/{room}/slots?date=YYYY-MM-DD`, hanya mengirim identitas fasilitas/tanggal dan daftar waktu dengan status `available`/`unavailable` (atau boolean setara). Jangan mengirim `user_id`, nama/email pemohon, `desc`/tujuan penggunaan, nomor reservasi, atau model `Reservation` mentah, termasuk dalam props HTML/JSON.
- Gunakan satu aturan ketersediaan bersama untuk katalog dan proses reservasi: status pemblokir, jam operasional, langkah 30 menit, batas tiga jam, dan room aktif. Integrasikan seperlunya dengan `ReservationController::store` serta endpoint slot form yang sudah ada agar server menolak permintaan yang ditandai tidak tersedia di katalog. Pertahankan bentuk respons endpoint lama jika dipakai form reservasi; ubah form hanya sejauh perlu untuk menjaga konsistensi.
- Jika ada tombol `Reservasi`, arahkan ke alur reservasi pengguna yang sudah ada. Jangan membangun alur pemesanan baru di halaman katalog.

### Banyak foto per fasilitas

- Buat migration aditif `room_images` dengan `id`, `room_id` foreign key ke `rooms` (hapus foto metadata ketika room benar-benar dihapus), `path` untuk path relatif pada disk `public`, `alt_text` opsional, `display_order` integer default `0`, dan timestamps. Tambahkan indeks yang membantu urutan foto per room. Jangan mengubah foto laporan kerusakan.
- Tambahkan model `RoomImage` dan relasi `Room::images()` satu-ke-banyak yang diurutkan oleh `display_order` lalu `id`. Room tanpa foto tetap valid. Ambil foto secara eager load agar daftar tidak membuat query per fasilitas.
- Bentuk URL publik dari path tersimpan melalui filesystem `public`; jangan percaya URL arbitrer dari request. Dokumentasikan kebutuhan `php artisan storage:link` untuk instalasi lokal. Foto contoh boleh ditambahkan hanya bila file aset benar-benar ada dan hak pakainya jelas; jangan menyimpan path contoh yang menghasilkan gambar rusak.
- Tampilkan gambar pertama sebagai sampul dan sediakan cara melihat semua gambar pada room yang mempunyai lebih dari satu, tanpa mengorbankan aksesibilitas atau performa. Definisikan ukuran tampilan/aspect ratio yang stabil.
- Ruang lingkup ini mencakup skema dan penayangan foto. Pengunggahan, pengurutan, dan penghapusan foto lewat UI admin dapat menjadi pekerjaan terpisah.

## Urutan implementasi yang disarankan

1. **Audit awal.** Periksa `git status`, branch, route, model, migration, seeder, controller, Blade pengguna, serta kebijakan timezone aplikasi. Pastikan rencana masih cocok dengan kode terkini dan jangan mengubah file landing.
2. **Skema foto.** Tambahkan migration, model, relasi, dan helper/presenter URL yang aman. Pastikan migration berjalan pada SQLite pengujian dan MySQL yang dipakai proyek.
3. **Aturan slot.** Ekstrak perhitungan slot dan konflik ke service kecil yang dapat diuji. Pakai zona waktu aplikasi yang eksplisit dan konsisten di PHP dan browser. Selaraskan validasi simpan reservasi dengan hasil ketersediaan; jangan mengubah riwayat reservasi yang sudah ada.
4. **Route dan controller pengguna.** Implementasikan pencarian, pagination, data foto, endpoint slot dengan validasi tanggal, serta payload minimal yang tidak mengungkap pemohon/tujuan penggunaan. Ikuti kebijakan otorisasi area pengguna yang berlaku.
5. **Antarmuka Blade.** Tambahkan halaman katalog dan link navigasi pengguna. Tampilkan filter, kartu/daftar fasilitas, galeri sederhana, pemilih tanggal, status seluruh slot, state kosong/loading/error, dan tautan menuju form reservasi jika fasilitas aktif.
6. **Verifikasi.** Jalankan migration dan tes terarah; periksa visual desktop dan mobile bila browser/preview tersedia. Jalankan pemeriksaan format/build yang relevan; perbaiki kegagalan yang berasal dari perubahan ini.
7. **Serah terima.** Laporkan file utama, keputusan yang diambil, hasil tes, dan hal yang masih perlu dikerjakan (misalnya UI admin untuk mengunggah foto). Jangan mengedit landing selama penyelesaian fitur ini.

## Pengujian dan kriteria penerimaan

- Tamu tidak dapat membuka halaman/endpoint pengguna; pengguna yang masuk dapat melihat katalog. Akses mengikuti aturan role yang sudah digunakan proyek.
- Filter tipe, lokasi, dan kapasitas minimum masing-masing bekerja, juga saat digabung; input tidak valid ditangani, halaman kosong jelas, dan pagination tidak membuang filter.
- Fasilitas dengan nol, satu, dan beberapa foto dirender dengan benar dan dalam urutan yang ditetapkan. URL berasal dari disk publik. Migration dapat di-rollback.
- Untuk satu tanggal contoh: reservasi `menunggu` dan `disetujui` menutup semua slot yang overlap; `ditolak` dan `dibatalkan` tidak. Slot tepat sebelum/sesudah interval yang tidak overlap tetap tersedia.
- Fasilitas nonaktif, tanggal lampau, dan slot dalam batas tiga jam tampil `Tidak tersedia`. Server menolak penyimpanan reservasi yang melanggar aturan yang sama.
- Respons endpoint dan HTML/props katalog tidak memuat nama/email pemohon, user ID, tujuan penggunaan, atau detail reservasi lain. Periksa dengan tes respons, bukan hanya dengan melihat UI.
- Katalog tidak mengubah output landing, route `/`, admin, atau operator. Jalankan tes fitur relevan dan build asset yang diperlukan; catat keterbatasan lingkungan jika ada perintah yang tak bisa dijalankan.

## Berkas awal yang perlu dibaca

- `app/Models/Room.php`, `app/Models/Reservation.php`
- `database/migrations/2026_09_14_092259_create_rooms_table.php`, `database/migrations/2026_09_14_093250_create_reservation_table.php`, `database/seeders/RoomSeeder.php`
- `routes/user.php`, `bootstrap/app.php`
- `app/Http/Controllers/ReservationController.php`, `resources/views/user/reservation-form.blade.php`, `resources/views/user/navbar.blade.php`
- `config/filesystems.php`, `tests/Feature/AdminFacilityTest.php`

## Prompt singkat untuk memulai chat berikutnya

> Implementasikan `docs/plans/feat-user-fasilitas.md` di branch `feat/user/fasilitas`. Saya mengerjakan daftar fasilitas pengunjung di landing page secara terpisah, jadi jangan edit landing. Fokus pada katalog pengguna yang masuk, filter tipe/lokasi/kapasitas, status tiap slot tanpa data pemohon atau tujuan, dan relasi satu-ke-banyak foto fasilitas. Selesaikan implementasi dan pengujian, lalu laporkan hasilnya.
