<?php

use App\Http\Controllers\Admin\FacilityController;
use App\Http\Controllers\Admin\FacilityRecapController;
use App\Http\Controllers\Admin\RegistrationController;
use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $summary = [
            'students' => User::where('account_type', 'mahasiswa')->count(),
            // 'pending_reservations' => Reservation::where('status', 'menunggu')->count(),
            'monthly_reservations' => Reservation::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'monthly_reports' => Report::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'active_rooms' => Room::where('is_avail', true)->count(),
        ];

        $recentReservations = Reservation::with('room')
            ->latest()
            ->take(5)
            ->get();

        $recentReports = Report::with('room')
            // ->whereIn('status', ['diproses', 'selesai'])
            ->latest('updated_at')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'user' => request()->user()->only('name', 'email', 'role', 'account_type'),
            'admin' => request()->user()->only('name', 'email', 'role', 'account_type'),
            'status' => session('status'),
            'csrfToken' => csrf_token(),
            'summary' => $summary,
            'recentReservations' => $recentReservations,
            'recentReports' => $recentReports,
            'urls' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'facilities' => route('admin.facilities.index'),
                'recap' => route('admin.facilities.recap'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    })->name('dashboard');

    Route::get('/registrations', [RegistrationController::class, 'index'])->name('registrations.index');
    Route::post('/registrations', [RegistrationController::class, 'store'])->name('registrations.store');
    Route::put('/registrations/{user}', [RegistrationController::class, 'update'])->name('registrations.update');
    Route::delete('/registrations/{user}', [RegistrationController::class, 'destroy'])->name('registrations.destroy');

    Route::get('/facilities', [FacilityController::class, 'index'])->name('facilities.index');
    Route::post('/facilities', [FacilityController::class, 'store'])->name('facilities.store');
    Route::put('/facilities/{room}', [FacilityController::class, 'update'])->name('facilities.update');
    Route::patch('/facilities/{room}/availability', [FacilityController::class, 'availability'])->name('facilities.availability');
    Route::get('/facilities/recap', [FacilityRecapController::class, 'index'])->name('facilities.recap');
    Route::get('/facilities/recap/export/{format}', [FacilityRecapController::class, 'export'])->name('facilities.recap.export');
});
