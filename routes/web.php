<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\Admin\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('auth.login');
});

Route::get('/dashboard', function () {
    return view('guest.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Route untuk Guest
Route::get('/guest/dashboard', function () {
    return view('guest.dashboard');
})->name('guest.dashboard');

// Route untuk User (Mahasiswa/Dosen)
Route::get('/user/dashboard', function () {
    return view('user.dashboard');
})->middleware(['auth', 'verified'])->name('user.dashboard');

// Route::get('/reservations', [ReservationController::class, 'index'])
//     ->name('reservations.index');

// Route::post('/reservations', [ReservationController::class, 'store'])
//     ->name('reservations.store');
Route::middleware('auth')->group(function () {

    Route::get('/reservations', 
        [ReservationController::class, 'index']
    )->name('reservations.index');

    Route::get('/reservations/form',
    [ReservationController::class, 'create']
    )->name('reservations.form');
    
    // Mengambil slot waktu tersedia berdasarkan room dan tanggal
    Route::get('/reservations/slots',
        [ReservationController::class, 'availableSlots']
    )->name('reservations.slots');
    
    Route::post('/reservations',
        [ReservationController::class, 'store']
    )->name('reservations.store');

});

// Route untuk Admin
Route::get('/admin/dashboard', function () {
    return view('admin.dashboard');
})->middleware(['auth', 'verified', 'admin'])->name('admin.dashboard');

Route::post('/admin/students', [StudentController::class, 'store'])
    ->middleware(['auth', 'verified', 'admin'])
    ->name('admin.students.store');

// Route untuk Operator
Route::get('/operator/dashboard', function () {
    return view('operator.dashboard');
})->middleware(['auth', 'verified'])->name('operator.dashboard');

// Bungkus route pelaporan ke dalam group middleware auth
Route::middleware(['auth'])->group(function () {
    // Form pelaporan
    Route::get('/report/create', [ReportController::class, 'create'])->name('reports.create');
    Route::post('/report/store', [ReportController::class, 'store'])->name('reports.store');
    
    // Riwayat laporan
    Route::get('/my-reports', [ReportController::class, 'index'])->name('reports.index');
    
    // Pembatalan laporan
    Route::patch('/reports/{report}/cancel', [ReportController::class, 'cancel'])->name('reports.cancel');
});

require __DIR__.'/auth.php';
