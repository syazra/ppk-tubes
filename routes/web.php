<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
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

// Route untuk Admin
Route::get('/admin/dashboard', function () {
    return view('admin.dashboard');
})->middleware(['auth', 'verified'])->name('admin.dashboard');

// Route untuk Operator
Route::get('/operator/dashboard', function () {
    return view('operator.dashboard');
})->middleware(['auth', 'verified'])->name('operator.dashboard');

// Route untuk Form Report
Route::get('/report/form', [ReportController::class, 'create'])->name('users.reports-form');

require __DIR__.'/auth.php';
