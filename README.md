# TUBES PPK/PBP

## Daftar Isi
- [Penjelasan Umum](#penjelasan-umum)
- [Panduan Menjalankan Proyek](#panduan-menjalankan-proyek)
- [Foto Fasilitas dari DBPhotos](#foto-fasilitas-dari-dbphotos)
- [Data Contoh Laporan dan Reservasi](#data-contoh-laporan-dan-reservasi)
- [Validasi dan Foto pada Form Admin](#validasi-dan-foto-pada-form-admin)
- [Akun Pengguna Siap Pakai](#akun-pengguna-siap-pakai)

---

## Penjelasan Umum

## Panduan Menjalankan Proyek

### 1. Clone Repository & Masuk ke Direktori
Clone repo ini dan masuk ke dalam direktorinya.
```bash
git clone https://github.com/syazra/ppk-tubes.git
cd ppk-tubes
```

### 2. Aktifkan Laragon & Database
- Buka aplikasi **Laragon** lalu klik **Start All** untuk menyalakan server Apache/Nginx dan MySQL. 
- Pastikan sudah ada database kosong dengan nama `ppk_db` (misal: HeidiSQL atau phpMyAdmin).

### 3. Konfigurasi Environment (.env)
Duplikat file .env bawaan kemudian buka Code Editor.
```bash
copy .env.example .env
code .
```
Cari dan buka file `.env`, lalu ubah bagian konfigurasi database:
```env
DB_CONNECTION=mysql         # jangan ubah
DB_HOST=<host-koneksi-anda>
DB_PORT=<port-koneksi-anda>
DB_DATABASE=ppk_db          # jangan ubah
DB_USERNAME=<uname-koneksi-anda>
DB_PASSWORD=<pw-koneksi-anda>
```

### 4. Jalankan Setup
Setelah `.env` diatur, jalankan script setup untuk menginstal semua dependency, generate key, migrasi database, dan menyalakan server.
```bash
./setup.bat
```

### 5. Buka Aplikasi
Setelah proses selesai, akan muncul terminal baru. **Buka link** tersebut untuk menjalankan web secara local.

Jika sudah pernah menjalankan `./setup.bat` satu kali, berikutnya cukup jalankan perintah berikut.
```bash
./run-serve.bat
```

## Foto Fasilitas dari DBPhotos

Seeder utama memasang satu foto acak untuk setiap fasilitas yang belum memiliki foto.
Foto dikelompokkan berdasarkan jenis: `Aula`, `Lapangan`, `Ruang Kelas`, dan `Laboratorium`.
Laboratorium memakai delapan foto interior museum alkimia bernuansa gothic dari
Wikimedia Commons, karya Edelmauswaldgeist dengan lisensi
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Sumber, pembuat, dan lisensi setiap foto tercatat di
[`sources.json`](database/seeders/photos/Laboratorium/sources.json).
Setiap kumpulan diacak dan dipakai bergiliran, lalu diulang bila jumlah fasilitas melebihi jumlah foto.

Untuk memperbarui database yang sudah berisi fasilitas tanpa membuat ulang data:

```bash
php artisan db:seed --class=FacilityThemeSeeder
php artisan db:seed --class=RoomImageSeeder
php artisan storage:link
```

Foto sumber disimpan di `database/seeders/photos` dan disalin ke disk public pada
`facilities/db-photos`. Foto yang sudah ada tetap dipertahankan, kecuali foto sementara
Laboratorium dari pool `RuangKelas` yang diganti dengan pack alkimia baru. Foto custom
tetap dipertahankan; penjalanan ulang tidak menggandakan atau mengacak ulang foto.

`FacilityThemeSeeder` mengganti nama Lab Komputer 1 menjadi Laboratorium Teknomansi
Aether dan lokasi kampus menjadi Menara Ravenclaw, Citadel Gondor, Biara Obsidian,
serta kawasan fantasy lainnya. Seeder ini memperbarui fasilitas yang sudah ada tanpa
mengubah ID, status aktif, atau hubungan laporan dan reservasi. `RoomSeeder` otomatis
menjalankannya untuk database baru.

## Data Contoh Laporan dan Reservasi

Seeder utama menyediakan 160 laporan dalam seluruh status (`baru`, `diproses`,
`selesai`, `ditolak`, dan `dibatalkan`): 12 contoh awal ditambah empat keluhan untuk
setiap fasilitas. Keluhan disesuaikan dengan jenis fasilitas, mencakup peralatan,
penerangan, pintu, ventilasi, kursi, drainase, serta perlengkapan olahraga. Empat
fasilitas dengan laporan yang sedang diproses membuat
Laboratorium Teknomansi Aether, Ruang Rune Kuno, Ruang Dewan Putih, dan Lapangan Pelennor nonaktif.
Laporan diproses dilengkapi estimasi perbaikan; laporan selesai dan ditolak memiliki
catatan penyelesaian atau alasan penolakan.

Setiap fasilitas memperoleh sepuluh reservasi contoh: lima riwayat dan lima
pengajuan mendatang, sehingga 37 fasilitas menghasilkan 370 reservasi. Kegiatan
meliputi sidang serikat, peracikan eliksir, latihan kesatria, kajian rune, nyanyian bard,
dan musyawarah penjaga menara,
sesuai jenis fasilitas. Jam mulai dan durasi bervariasi; tanggal mencakup hampir tiga
bulan ke belakang dan dua bulan ke depan dari waktu seeding. Seluruh status reservasi
terwakili; pengajuan mendatang untuk fasilitas nonaktif berstatus ditolak.

Kedua seeder memakai seluruh akun berperan `user` dengan jenis mahasiswa, dosen,
atau staf, termasuk 27 akun dalam pack demo. Setiap akun demo mempunyai minimal
sepuluh reservasi dan lima laporan. Setiap fasilitas memiliki setidaknya delapan
pemohon reservasi dan empat pelapor berbeda. Waktu pengajuan, alasan penolakan,
estimasi, dan catatan perbaikan juga bervariasi.

Untuk menambah contoh ke database yang sudah memiliki akun demo dan fasilitas:

```bash
php artisan db:seed --class=ReportSeeder
php artisan db:seed --class=ReservationSeeder
```

Jalankan laporan sebelum reservasi agar status fasilitas diperhitungkan.
Kedua seeder ini dapat dijalankan ulang tanpa menggandakan contoh atau menimpa
keputusan operator, tanggal, atau pemohon/pelapor, termasuk ketika akun baru ditambahkan.
Data lama tetap tersimpan, sehingga jumlah pada database lama bisa lebih besar dari
jumlah contoh di atas. Untuk database baru, cukup jalankan
`php artisan db:seed` setelah migrasi; jangan menjalankan ulang seeder utama pada
database yang sudah berisi fasilitas karena `RoomSeeder` membuat fasilitas baru.

Deskripsi kegiatan, keluhan, alasan penolakan, dan catatan perbaikan memakai tema
fantasy/gothic: grimoire, kristal aether, alkimia, lentera, serta perkakas benteng.
Saat kedua seeder dijalankan pada database lama, teks contoh modern yang dikenali
diganti dengan versi bertema tanpa membuat baris baru atau mengubah ID, pemohon,
pelapor, tanggal, status, maupun waktu pembaruan. Catatan khusus operator dan teks
buatan pengguna tetap dipertahankan.

## Validasi dan Foto pada Form Admin

Aturan berikut berlaku saat admin membuat maupun mengubah data. Browser memberi
petunjuk format, sedangkan server memeriksa ulang sebelum menulis ke database.

| Data | Aturan |
|---|---|
| Nama akun | 2–255 karakter, mengandung huruf, tanpa tag atau karakter kontrol |
| NIM mahasiswa | Tepat 14 digit angka, unik, tidak seluruhnya nol |
| Identitas dosen, staf, petugas | Tepat 18 digit angka, unik, tidak seluruhnya nol |
| Email | Format email dengan domain bertitik, maksimal 255 karakter, unik tanpa membedakan kapital |
| Nama dan lokasi fasilitas | Masing-masing 2–100 karakter, tanpa tag atau karakter kontrol; pasangan nama/lokasi tidak boleh duplikat |
| Kapasitas | Angka bulat 1–100.000 orang |
| Deskripsi fasilitas | Opsional, maksimal 2.000 karakter |
| Foto fasilitas | Opsional, total maksimal 3 foto; JPG/JPEG, PNG, WebP; masing-masing maksimal 2 MB dan 6.000 × 6.000 piksel |

NIM dan identitas pegawai disimpan sebagai teks agar angka nol di depan tetap utuh.
Nama, lokasi, dan email dibersihkan dari spasi di awal/akhir; email disimpan dalam
huruf kecil. Admin dapat menambah foto saat membuat fasilitas, serta menambah atau
menghapus foto melalui **Ubah**. Penghapusan baru diterapkan saat perubahan disimpan.

Unggahan memakai tabel `room_images` yang sudah ada dan disk public pada
`facilities/uploads`. Pastikan `php artisan storage:link` sudah dijalankan supaya
foto tampil di website. Penyimpanan fasilitas dan metadata foto menggunakan
transaksi; unggahan baru dibersihkan jika penyimpanan gagal. Foto seeder yang
dipakai bersama fasilitas lain tetap tersedia. Tidak diperlukan migrasi tambahan
untuk fitur ini.

## Akun Pengguna Siap Pakai

Berikut adalah daftar akun siap pakai untuk kebutuhan pengujian (*testing*) dan demonstrasi sistem berdasarkan peran (*role*) masing-masing:

| No | Email | Password Default | Role |
|---|---|---|---|
| 1 | `arispujiw@admin.kampus.ac.id` | `password` | Admin |
| 2 | `anangardiyanto@operator.kampus.ac.id` | `password` | Petugas |
| 3 | `ruthseptriana@students.kampus.ac.id` | `password` | Mahasiswa |
| 4 | `sandykurniawan@lecturer.kampus.ac.id` | `password` | Dosen |
| 5 | `benynugroho@staff.kampus.ac.id` | `password` | Staff |
| 6 |  *Tanpa Akun (Publik)* | — | Tamu |

---
