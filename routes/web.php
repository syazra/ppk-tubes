<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Route Publik & Guest
Route::get('/', function () {
    return Inertia::render('Landing', [
        'loginUrl' => route('login'),
        'reservationUrl' => route('reservations.index'),
        'createReservationUrl' => route('reservations.form'),
    ]);
})->name('landing');

require __DIR__.'/auth.php';
