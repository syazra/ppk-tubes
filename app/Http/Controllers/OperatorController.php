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


    // Setujui reservasi yang dipilih
    $reservation->update([
        'status' => 'disetujui'
    ]);


    // Tolak reservasi lain yang bentrok
    Reservation::where('room_id', $reservation->room_id)
        ->where('date_to_reserv', $reservation->date_to_reserv)
        ->where('id', '!=', $reservation->id)
        ->where('status', 'menunggu')
        ->where(function($query) use ($reservation){

            $query->where(
                'start_time',
                '<',
                $reservation->end_time
            )
            ->where(
                'end_time',
                '>',
                $reservation->start_time
            );

        })
        ->update([
            'status' => 'ditolak'
        ]);


    return back()
        ->with(
            'success',
            'Reservasi disetujui.'
        );
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
