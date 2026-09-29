<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class ReservationController extends Controller
{
    /**
     * Menampilkan reservasi user
     */
    public function index()
    {
        $reservations = Reservation::with('room')
            ->latest()
            ->get();

        return view(
            'operator.reservations',
            compact('reservations')
        );
    }

    /**
     * Menyetujui reservasi user
     */
    public function approve($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->status = 'disetujui';
        $reservation->save();

        return back()->with('success', 'Reservasi disetujui.');
    }
}