# TUBES PPK/PBP

## Daftar Isi
- [Penjelasan Umum](#penjelasan-umum)
- [Panduan Menjalankan Proyek](#panduan-menjalankan-proyek)
- [Akun Pengguna Siap Pakai](#akun-pengguna-siap-pakai)

---

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

## Akun Pengguna Siap Pakai

Berikut adalah daftar akun siap pakai untuk kebutuhan pengujian (*testing*) dan demonstrasi sistem berdasarkan peran (*role*) masing-masing:

| No | Nama | Email | Role | Password Default |
|---|---|---|---|---|
| 1 | **Admin Kampus** | `admin@admin.kampus.ac.id` | `admin` | `password` |
| 2 | **Operator Kampus** | `operator@operator.kampus.ac.id` | `operator` | `password` |
| 3 | **Mahasiswa Kampus** | `student@students.kampus.ac.id` | `user` | `password` | 
| 4 | **Dosen Kampus** | `lecturer@lecturer.kampus.ac.id` | `user` | `password` |
| 5 | **Pengunjung (Guest)** | *Tanpa Akun (Publik)* | `guest` | — |

---