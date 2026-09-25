<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\Admin\StudentController;
use Illuminate\Support\Facades\Route;

// 1. Route Publik & Guest
Route::get('/', function () {
    return view('auth.login');
});

Route::get('/guest/dashboard', function () {
    return view('guest.dashboard');
})->name('guest.dashboard');

require __DIR__.'/auth.php';

// 2. Route Utama (Wajib Login: Mahasiswa, Dosen, Operator)
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

        // operator dashboard
        Route::get('/operator/dashboard', function () { return view('operator.dashboard'); })->name('operator.dashboard');
        Route::get('/operator/reservations', function () { 
            $reservations = \App\Models\Reservation::with('room')->latest()->get();
            return view('operator.reservations', compact('reservations')); 
        })->name('operator.reservations');
        Route::get('/operator/reports', function () { 
            $rooms = \App\Models\Room::all();
            return view('operator.reports', compact('rooms')); 
        })->name('operator.reports');
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
        Route::patch('/{reservation}/cancel', 'cancel')->name('cancel');
    });

    // -- User Reports --
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
        return view('admin.dashboard'); 
    })->name('dashboard');

    Route::post('/students', [StudentController::class, 'store'])->name('students.store');
    
});