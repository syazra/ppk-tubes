@echo off

:: koneksi database
echo === Menyalin .env...
copy .env.example .env
echo === Menambahkan konfigurasi tambahan ke .env...
echo.>> .env
echo DB_CONNECTION=mysql>> .env
echo DB_HOST=localhost>> .env
echo DB_PORT=3306>> .env
echo DB_DATABASE=ppk_db>> .env
echo DB_USERNAME=root>> .env
echo DB_PASSWORD= >> .env
echo === Konfigurasi .env selesai.

:: modul back-end
echo === Mengunduh vendor...
call composer install
echo === Membuat App Key...
php artisan key:generate
echo === Migrasi database...
php artisan migrate:fresh --seed
echo === Membersihkan semua cache...
php artisan optimize:clear

:: modul front-end
echo === Menginstall module frontend...
call npm install

:: menjalankan backend dan frontend...
echo === Selesai! Menjalankan server frontend dan backend di terminal baru...
wt -d . cmd /k "php artisan serve" ; new-tab -d . cmd /k "npm run dev"