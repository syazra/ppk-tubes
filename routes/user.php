<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Models\Report;
use App\Models\Reservation;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::middleware('verified')->group(function () {
        Route::get('/dashboard', function () {
            return redirect()->route('landing');
        })->name('dashboard');

        Route::get('/user/dashboard', function () {
            $user = auth()->user();
            $recentReservations = Reservation::with('room')->where('user_id', $user->id)->latest()->take(3)->get();
            $recentReports = Report::with('room')->where('user_id', $user->id)->latest()->take(3)->get();

            return Inertia::render('User/Dashboard', [
                'user' => $user->only('name', 'email', 'role', 'account_type'),
                'csrfToken' => csrf_token(),
                'recentReservations' => $recentReservations,
                'recentReports' => $recentReports,
                'urls' => [
                    'dashboard' => route('user.dashboard'),
                    'reservations' => route('reservations.index'),
                    'reservationForm' => route('reservations.form'),
                    'reports' => route('reports.index'),
                    'reportCreate' => route('reports.create'),
                    'profile' => route('profile.edit'),
                    'guest' => route('landing'),
                    'logout' => route('logout'),
                ],
            ]);
        })->name('user.dashboard');
    });

    Route::controller(ProfileController::class)->prefix('profile')->name('profile.')->group(function () {
        Route::get('/', 'edit')->name('edit');
        Route::patch('/', 'update')->name('update');
        Route::delete('/', 'destroy')->name('destroy');
    });

    Route::controller(ReservationController::class)->prefix('reservations')->name('reservations.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/form', 'create')->name('form');
        Route::get('/slots', 'availableSlots')->name('slots');
        Route::post('/', 'store')->name('store');
        Route::get('/{reservation}/ticket', 'ticket')->name('ticket');
        Route::get('/{reservation}/qrcode', 'qrcode')->name('qrcode');
        Route::patch('/{reservation}/cancel', 'cancel')->name('cancel');
    });

    Route::get('/my-reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/report/create', [ReportController::class, 'create'])->name('reports.create');
    Route::post('/report/store', [ReportController::class, 'store'])->name('reports.store');
    Route::patch('/reports/{report}/cancel', [ReportController::class, 'cancel'])->name('reports.cancel');
});
