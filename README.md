# TUBES PPK/PBP - Buana (Sistem Manajemen Fasilitas & Reservasi Kampus)

## Daftar Isi
- [Tentang Buana & Asumsi Perancangan](#tentang-buana--asumsi-perancangan)
  - [Daftar User Story (US) & Asumsi](#daftar-user-story-us--asumsi)
  - [Asumsi Tambahan (AT)](#asumsi-tambahan-at)
- [Panduan Menjalankan Proyek](#panduan-menjalankan-proyek)
- [Akun Pengguna Siap Pakai](#akun-pengguna-siap-pakai)

---

## Tentang Buana & Asumsi Perancangan

**Buana** adalah aplikasi berbasis web yang dirancang untuk membantu warga kampus menemukan fasilitas, melihat ketersediaan jadwal, mengajukan peminjaman, dan melaporkan kerusakan dalam satu platform layanan terpadu. Aplikasi ini dikembangkan sebagai pemenuhan Tugas Besar mata kuliah Pengembangan Platform Khusus (PPK) / Pemrograman Berbasis Platform (PBP).

Dalam perancangan sistem ini, tim pengembang merumuskan beberapa *User Story* (US) beserta asumsi-asumsi teknis maupun fungsional untuk menyesuaikan dengan batasan dan kebutuhan studi kasus.

### Daftar User Story (US) & Asumsi

| US | User Story | Asumsi |
|:--:|---|---|
| **US 1** | Sebagai pengunjung/pengguna, saya bisa melihat daftar fasilitas beserta status ketersediaannya per slot waktu (tersedia/tidak tersedia), tanpa melihat detail pemohon atau tujuan penggunaan. | — |
| **US 2** | Sebagai pengunjung/pengguna, saya bisa mencari fasilitas berdasarkan tipe/lokasi/kapasitas. | — |
| **US 3** | Sebagai pengguna, saya bisa mengajukan reservasi pada rentang waktu tertentu dengan menyebutkan tujuan penggunaan. | Batas waktu pengajuan reservasi oleh user adalah **12 jam** sebelum *start-time* reservasi. |
| **US 4** | Sebagai pengguna, saya bisa membatalkan reservasi saya sendiri sebelum batas waktu tertentu. | Batas waktu pembatalan reservasi oleh user adalah **6 jam** sebelum *start-time* reservasi. |
| **US 5** | Sebagai pengguna, saya bisa melihat riwayat dan status reservasi saya, termasuk detail lengkap reservasi tersebut. | Mengimplementasikan QR reservasi (Lebih lengkap di AT 3). |
| **US 6** | Sebagai pengguna, saya bisa melaporkan kerusakan/masalah pada fasilitas tertentu (kategori, deskripsi, foto). | Kategori tidak diimplementasikan secara eksplisit, tetapi digabung ke dalam deskripsi kerusakan. |
| **US 7** | Sebagai pengguna, saya bisa melihat status laporan saya. | — |
| **US 8** | Sebagai petugas, saya bisa melihat dashboard/antrian reservasi dan laporan yang masih menunggu diproses, agar tidak ada yang terlewat. | — |
| **US 9** | Sebagai petugas, saya bisa menyetujui/menolak reservasi yang masuk secara manual; sistem mencegah persetujuan reservasi yang bentrok jadwal pada fasilitas yang sama. | — |
| **US 10** | Sebagai petugas, saya bisa membatalkan reservasi yang sudah disetujui dalam kondisi mendesak (mis. fasilitas mendadak tidak bisa dipakai), dengan mencantumkan alasan pembatalan. | Pembatalan reservasi dapat dilakukan secara otomatis oleh sistem jika fasilitas terkait sedang dalam perbaikan. |
| **US 11** | Sebagai petugas, saya bisa mengubah status laporan (baru/diproses/selesai/ditolak) beserta catatan resolusi saat laporan ditutup. | Resolusi dapat diketik manual maupun menggunakan pesan template yang disediakan. |
| **US 12** | Sebagai petugas, saya bisa menandai fasilitas berstatus 'dalam perbaikan' terkait laporan kerusakan yang sedang ditangani, dan mengembalikannya ke status aktif setelah selesai diperbaiki. | Petugas dapat menambahkan tanggal estimasi perbaikan fasilitas, semua reservasi yang berada di rentang waktu tersebut akan otomatis dibatalkan (Lebih lengkap di AT 1). |
| **US 13** | Sebagai admin, saya bisa mendaftarkan akun petugas secara langsung (petugas tidak melakukan registrasi mandiri dalam kondisi apa pun). | — |
| **US 14** | Sebagai admin, saya bisa mendaftarkan akun pengguna (mahasiswa/dosen/staf) secara langsung tanpa melalui form registrasi mandiri. | — |
| **US 15** | Sebagai admin, saya bisa memverifikasi atau menolak akun pengguna hasil registrasi mandiri (jika diimplementasikan) sebelum akun tersebut dapat digunakan untuk login. | Tidak diimplementasikan; seluruh registrasi akun dilakukan oleh Admin, pengguna kemudian dapat menyesuaikan passwordnya sendiri. |
| **US 16** | Asumsi admin, saya bisa mengelola data fasilitas (tambah/edit/nonaktifkan). | — |

### Asumsi Tambahan (AT)

Berikut adalah rincian asumsi tambahan sebagai elaborasi maupun di luar daftar *User Story*:

* **AT 1 (Terkait US 12):**
  1. Jika Petugas mengubah status laporan ke ‘sedang diproses’, maka status fasilitas terkait akan berubah ke ‘nonaktif’. Petugas wajib memasukkan waktu estimasi perbaikan selesai.
  2. Seluruh reservasi ke fasilitas terkait akan otomatis dibatalkan oleh sistem.
  3. Petugas dapat memperpanjang waktu estimasi, yang berimbas pada pembatalan otomatis reservasi baru di rentang waktu baru tersebut.
  4. Petugas dapat menandai status laporan ke ‘selesai’ sebelum waktu estimasi berakhir, yang otomatis mengembalikan status fasilitas ke ‘aktif’ (namun tidak mengembalikan status reservasi yang telanjur dibatalkan).
  5. Jika petugas belum mengubah status laporan ke ‘selesai’ saat waktu estimasi berakhir, sistem akan otomatis memperpanjang estimasi sebesar satu hari.

* **AT 2 (Terkait US 15):**
  1. Seluruh pendaftaran akun (nama, email, NIP/NIM) dilakukan oleh Admin. Password digenerate otomatis oleh sistem dan dapat disalin oleh Admin untuk dikirimkan ke user terkait.
  2. User dapat masuk ke website menggunakan akun dan password tersebut, kemudian mengubah password pilihannya sendiri melalui menu Profil.

* **AT 3 (Terkait US 5):**
  1. Detail lengkap reservasi ditampilkan dalam bentuk tiket yang berisi status reservasi, ID reservasi, nama peminjam, nama fasilitas, tanggal & waktu reservasi, tujuan penggunaan, dan *QR-code*.
  2. *QR-code* dapat dipindai untuk membuka halaman detail tiket reservasi (berjalan secara lokal).
  3. Tiket dapat diunduh dalam format PDF.
  4. Tiket dapat diakses oleh user terkait maupun petugas.

* **AT 4 (Terkait US 5, 9, 10, 11, 12):**
  * User dapat melihat alasan penolakan reservasi maupun pelaporan pada kolom ‘aksi’, baik karena ditolak secara manual oleh petugas maupun dibatalkan otomatis oleh sistem.

* **AT 5 (Terkait US 1, 2, 16):**
  1. Tamu dan user dapat melihat katalog fasilitas (nama, lokasi, kategori, kapasitas, beserta foto).
  2. User memiliki tombol pintasan (*shortcut*) cepat menuju menu reservasi dan pelaporan langsung dari halaman katalog.
  3. Admin memiliki hak akses penuh untuk menambah, mengubah, dan menghapus foto dari sebuah fasilitas.

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

| No | Email | Password Default | Role |
|---|---|---|---|
| 1 | `arispujiw@admin.kampus.ac.id` | `password` | Admin |
| 2 | `anangardiyanto@operator.kampus.ac.id` | `password` | Petugas |
| 3 | `ruthseptriana@students.kampus.ac.id` | `password` | Mahasiswa |
| 4 | `sandykurniawan@lecturer.kampus.ac.id` | `password` | Dosen |
| 5 | `benynugroho@staff.kampus.ac.id` | `password` | Staff |
| 6 |  *Tanpa Akun (Publik)* | — | Tamu |

---
