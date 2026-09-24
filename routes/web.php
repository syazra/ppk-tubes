<?php

use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return view('auth.login');
});

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();

    $destination = match (true) {
        $user->isAdmin() => 'admin.dashboard',
        $user->isOperator() => 'operator.dashboard',
        $user->isUser() => 'user.dashboard',
        default => 'guest.dashboard',
    };

    return redirect()->route($destination, $request->query());
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

Route::middleware('auth')->group(function () {
    Route::get('/reservations', [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservations/form', [ReservationController::class, 'create'])->name('reservations.form');

    // Mengambil slot waktu tersedia berdasarkan room dan tanggal
    Route::get('/reservations/slots', [ReservationController::class, 'availableSlots'])->name('reservations.slots');
    Route::post('/reservations', [ReservationController::class, 'store'])->name('reservations.store');
});

// Route untuk Admin
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard', [
            'admin' => request()->user()->only('name', 'email'),
            'status' => session('status'),
            'csrfToken' => csrf_token(),
            'urls' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('guest.dashboard'),
                'logout' => route('logout'),
            ],
        ]);
    })->name('dashboard');

    Route::get('/registrations', [RegistrationController::class, 'index'])->name('registrations.index');
    Route::post('/registrations', [RegistrationController::class, 'store'])->name('registrations.store');
    Route::put('/registrations/{user}', [RegistrationController::class, 'update'])->name('registrations.update');
    Route::delete('/registrations/{user}', [RegistrationController::class, 'destroy'])->name('registrations.destroy');
});

// Route untuk Operator
Route::get('/operator/dashboard', function () {
    return view('operator.dashboard');
})->middleware(['auth', 'verified'])->name('operator.dashboard');

// Route untuk Form Report
Route::get('/report/form', [ReportController::class, 'create'])->name('users.reports-form');

require __DIR__.'/auth.php';
