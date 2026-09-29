<?php

use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Route Publik & Guest
Route::get('/', function () {
    return Inertia::render('Landing', [
        'loginUrl' => route('login'),
        'reservationUrl' => route('reservations.index'),
        'createReservationUrl' => route('reservations.form'),
    ]);
});

Route::get('/guest/dashboard', function () {
    return view('guest.dashboard');
})->name('guest.dashboard');

require __DIR__.'/auth.php';

// 2. Route Utama (Wajib Login: Mahasiswa, Dosen, Operator)
Route::middleware(['auth'])->group(function () {
    
    // -- Dashboards --
    Route::middleware('verified')->group(function () {
        Route::get('/dashboard', function () { return view('guest.dashboard'); })->name('dashboard');
        Route::get('/user/dashboard', function () { 
            $user = auth()->user();
            $recentReservations = \App\Models\Reservation::with('room')->where('user_id', $user->id)->latest()->take(3)->get();
            $recentReports = \App\Models\Report::with('room')->where('user_id', $user->id)->latest()->take(3)->get();
            
            return view('user.dashboard', compact('recentReservations', 'recentReports')); 
        })->name('user.dashboard');
        Route::get('/operator/dashboard', function () { return view('operator.dashboard'); })->name('operator.dashboard');
    });

    // -- Profile --
    Route::controller(ProfileController::class)->prefix('profile')->name('profile.')->group(function () {
        Route::get('/', 'edit')->name('edit');
        Route::patch('/', 'update')->name('update');
        Route::delete('/', 'destroy')->name('destroy');
    });

    // -- Reservations --
    Route::controller(ReservationController::class)->prefix('reservations')->name('reservations.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/form', 'create')->name('form');
        Route::get('/slots', 'availableSlots')->name('slots');
        Route::post('/', 'store')->name('store');
        
        Route::get('/{reservation}/ticket', 'ticket')->name('ticket');
        Route::patch('/{reservation}/cancel', 'cancel')->name('cancel');
    });

    // -- Reports --
    Route::controller(ReportController::class)->group(function () {
        Route::get('/my-reports', 'index')->name('reports.index');
        Route::get('/report/create', 'create')->name('reports.create');
        Route::post('/report/store', 'store')->name('reports.store');
        Route::patch('/reports/{report}/cancel', 'cancel')->name('reports.cancel');
    });
});

// 3. Route Khusus Admin
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
