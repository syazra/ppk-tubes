# TUBES PPK/PBP

## Daftar Isi
- [Penjelasan Umum](#penjelasan-umum)
- [Panduan Menjalankan Proyek](#panduan-menjalankan-proyek)
- [Foto Fasilitas dari DBPhotos](#foto-fasilitas-dari-dbphotos)
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
