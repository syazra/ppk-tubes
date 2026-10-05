<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\SvgWriter;

// 1. Route Publik & Guest
Route::get('/', function () {
    return Inertia::render('Landing', [
        'loginUrl' => route('login'),
        'reservationUrl' => route('reservations.index'),
        'createReservationUrl' => route('reservations.form'),
    ]);
})->name('landing');

require __DIR__.'/auth.php';

// 2. Route Utama (Wajib Login: Mahasiswa dan Dosen)
Route::middleware(['auth'])->group(function () {
    // -- Dashboards --
    Route::middleware('verified')->group(function () {
        // guest dashboard
        Route::get('/dashboard', function () { return view('guest.dashboard'); })->name('dashboard');

        // user dashboard
        Route::get('/user/dashboard', function () { 
            $user = auth()->user();
            $recentReservations = \App\Models\Reservation::with('room')->where('user_id', $user->id)->latest()->take(3)->get();
            $recentReports = \App\Models\Report::with('room')->where('user_id', $user->id)->latest()->take(3)->get();
            return view('user.dashboard', compact('recentReservations', 'recentReports')); 
        })->name('user.dashboard');
    });

    // -- Profile --
    Route::controller(ProfileController::class)->prefix('profile')->name('profile.')->group(function () {
        Route::get('/', 'edit')->name('edit');
        Route::patch('/', 'update')->name('update');
        Route::delete('/', 'destroy')->name('destroy');
    });

    // -- User Reservations --
    Route::controller(ReservationController::class)->prefix('reservations')->name('reservations.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/form', 'create')->name('form');
        Route::get('/slots', 'availableSlots')->name('slots');
        Route::post('/', 'store')->name('store');
        
        Route::get('/{reservation}/ticket', 'ticket')->name('ticket');
        Route::get('/{reservation}/qrcode', 'qrcode')->name('qrcode');
        Route::patch('/{reservation}/cancel', 'cancel')->name('cancel');
    });

    Route::get('/qrcode/{id}', function ($id) {
            return QrCode::size(150)
                ->generate($id);
        });

    // -- User Reports --
    Route::controller(ReportController::class)->group(function () {
        Route::get('/my-reports', 'index')->name('reports.index');
        Route::get('/report/create', 'create')->name('reports.create');
        Route::post('/report/store', 'store')->name('reports.store');
        Route::patch('/reports/{report}/cancel', 'cancel')->name('reports.cancel');
    });
});
