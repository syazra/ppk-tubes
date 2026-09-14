@echo off

echo === Menginstall module frontend...
call npm install

echo Menjalankan server frontend dan backend di terminal baru...
wt -d . cmd /k "php artisan serve" ; new-tab -d . cmd /k "npm run dev"