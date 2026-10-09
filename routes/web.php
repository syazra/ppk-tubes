<?php

use App\Http\Controllers\PublicFacilityController;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Route Publik & Guest
Route::get('/', function (Request $request) {
    $user = $request->user();
    $reservationRoute = match ($user?->role) {
        'admin' => 'admin.dashboard',
        'operator' => 'operator.reservations',
        default => 'reservations.index',
    };
    $createReservationRoute = $user && ! $user->isUser() ? $reservationRoute : 'reservations.form';
    $reportRoute = match ($user?->role) {
        'admin' => 'admin.dashboard',
        'operator' => 'operator.reports',
        'user', 'pengguna' => 'reports.create',
        default => 'login',
    };

    return Inertia::render('Landing', [
        'loginUrl' => route('login'),
        'reservationUrl' => route($reservationRoute),
        'createReservationUrl' => route($createReservationRoute),
        'canCreateReservation' => $user === null || $user->isUser(),
        'reservationActionLabel' => match ($user?->role) {
            'admin' => 'Kembali ke dasbor',
            'operator' => 'Kelola reservasi',
            default => 'Ajukan reservasi',
        },
        'reservationListLabel' => match ($user?->role) {
            'admin' => 'Kembali ke dasbor',
            'operator' => 'Lihat reservasi',
            default => 'Buka Reservasi Saya',
        },
        'reportUrl' => route($reportRoute),
        'reportActionLabel' => match ($user?->role) {
            'admin' => 'Kembali ke dasbor',
            'operator' => 'Kelola laporan',
            'user', 'pengguna' => 'Lapor kerusakan',
            default => 'Masuk untuk melapor',
        },
        'facilityUrl' => route('facilities.index'),
        'aboutUrl' => route('about'),
        'facilityTypes' => Room::query()->distinct()->orderBy('type')->pluck('type'),
        'facilityLocations' => Room::query()->distinct()->orderBy('location')->pluck('location'),
    ]);
})->name('landing');

Route::get('/fasilitas', [PublicFacilityController::class, 'index'])->name('facilities.index');

Route::get('/tentang', function () {
    return Inertia::render('Guest/About', [
        'urls' => [
            'landing' => route('landing'),
            'facilities' => route('facilities.index'),
            'about' => route('about'),
            'login' => route('login'),
        ],
    ]);
})->name('about');

require __DIR__.'/auth.php';
