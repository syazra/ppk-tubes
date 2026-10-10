# TUBES PPK/PBP

## Daftar Isi
- [Penjelasan Umum](#penjelasan-umum)
- [Panduan Menjalankan Proyek](#panduan-menjalankan-proyek)
- [Foto Fasilitas dari DBPhotos](#foto-fasilitas-dari-dbphotos)
- [Data Contoh Laporan dan Reservasi](#data-contoh-laporan-dan-reservasi)
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
Foto dikelompokkan berdasarkan jenis: `Aula`, `Lapangan`, dan `Ruang Kelas`.
Untuk sementara, `Laboratorium` memakai kumpulan foto `RuangKelas` sampai tersedia pack tersendiri.
Setiap kumpulan diacak dan dipakai bergiliran, lalu diulang bila jumlah fasilitas melebihi jumlah foto.

Untuk memperbarui database yang sudah berisi fasilitas tanpa membuat ulang data:

```bash
php artisan db:seed --class=RoomImageSeeder
php artisan storage:link
```

Foto sumber disimpan di `database/seeders/photos` dan disalin ke disk public pada
`facilities/db-photos`. Seeder tidak mengubah data fasilitas atau foto yang sudah ada;
menjalankannya ulang tidak menggandakan atau mengacak ulang foto sebelumnya.

## Data Contoh Laporan dan Reservasi

Seeder utama menyediakan 12 laporan dalam seluruh status (`baru`, `diproses`,
`selesai`, `ditolak`, dan `dibatalkan`). Empat laporan yang sedang diproses membuat
Lab Komputer 1, Ruang Rune Kuno, Ruang Dewan Putih, dan Lapangan Pelennor nonaktif.
Laporan diproses dilengkapi estimasi perbaikan; laporan selesai dan ditolak memiliki
catatan penyelesaian atau alasan penolakan.

Setiap fasilitas memperoleh dua reservasi contoh: satu riwayat yang disetujui dan
satu pengajuan mendatang dalam berbagai status, sehingga 37 fasilitas menghasilkan
74 reservasi. Pengajuan mendatang untuk fasilitas nonaktif berstatus ditolak.
Tanggal mengikuti waktu seeding dan pemohon berasal dari akun mahasiswa, dosen, dan staf.

Untuk menambah contoh ke database yang sudah memiliki akun demo dan fasilitas:

```bash
php artisan db:seed --class=ReportSeeder
php artisan db:seed --class=ReservationSeeder
```

Jalankan laporan sebelum reservasi agar status fasilitas diperhitungkan.
Kedua seeder ini dapat dijalankan ulang tanpa menggandakan contoh atau menimpa
keputusan operator. Data lama tetap tersimpan. Untuk database baru, cukup jalankan
`php artisan db:seed` setelah migrasi; jangan menjalankan ulang seeder utama pada
database yang sudah berisi fasilitas karena `RoomSeeder` membuat fasilitas baru.

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
