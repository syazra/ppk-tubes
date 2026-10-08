<?php

use App\Http\Controllers\PublicFacilityController;
use App\Models\Room;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Route Publik & Guest
Route::get('/', function () {
    return Inertia::render('Landing', [
        'loginUrl' => route('login'),
        'reservationUrl' => route('reservations.index'),
        'createReservationUrl' => route('reservations.form'),
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
