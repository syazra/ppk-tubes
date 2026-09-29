<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;

class OperatorController extends Controller
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

    /**
     * Menolak reservasi user
     */
    public function reject($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->status = 'ditolak';
        $reservation->save();

        return back()->with('success', 'Reservasi ditolak.');
    }
}
