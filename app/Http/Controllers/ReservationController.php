<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\SvgWriter;

class ReservationController extends Controller
{
    /**
     * Menampilkan reservasi user
     */
    public function index()
    {
        $reservations = Reservation::with('room')
            ->where('user_id', Auth::id())

            // Pencarian
            ->when(request('search'), function ($query) {

                $search = request('search');

                $query->where(function ($q) use ($search) {

                    $q->whereHas('room', function ($room) use ($search) {
                        $room->where('name', 'like', "%$search%")
                            ->orWhere('type', 'like', "%$search%");
                    })
                    ->orWhere('date_to_reserv', 'like', "%$search%");

                });

            })


            // Filter status
            ->when(request('status'), function ($query) {

                $query->where(
                    'status',
                    request('status')
                );

            })


            // Sorting
            ->when(request('sort'), function ($query) {

                switch (request('sort')) {

                    // waktu reservasi terdekat
                    case 'reservation_near':
                        $query->orderBy('date_to_reserv', 'asc')
                            ->orderBy('start_time', 'asc');
                        break;


                    // waktu reservasi terjauh
                    case 'reservation_far':
                        $query->orderBy('date_to_reserv', 'desc')
                            ->orderBy('start_time', 'desc');
                        break;


                    // pengajuan terbaru
                    case 'created_near':
                        $query->orderBy('created_at', 'desc');
                        break;


                    // pengajuan terlama
                    case 'created_far':
                        $query->orderBy('created_at', 'asc');
                        break;


                    default:
                        $query->latest();
                }

            }, function ($query) {
                // default kalau tidak pilih filter
                $query->latest();
            })


            ->get();


        if(request()->ajax()) {

            return view(
                'user.partials.reservation-table',
                compact('reservations')
            )->render();

        }


        return view(
            'user.my-reservations',
            compact('reservations')
        );
    }

    /**
     * Form reservasi
     */
    public function create()
    {
        $rooms = Room::where('is_avail', true)->get();
        return view('user.reservation-form', compact('rooms'));
    }

    

    /**
     * Membatalkan reservasi
     */
    public function cancel(Reservation $reservation)
    {
        abort_if(
            $reservation->user_id != Auth::id(),
            403
        );

        if($reservation->status != 'menunggu'){
            return back()
                ->with(
                    'error',
                    'Reservasi tidak dapat dibatalkan'
                );
        }

        $reservation->update([
            'status' => 'dibatalkan'
        ]);

        return back()
            ->with(
                'success',
                'Reservasi berhasil dibatalkan'
            );
    }

    

    /**
     * Mengambil jadwal booking ruangan (Time Blocking)
     * Hanya status 'disetujui' dan 'menunggu' yang memblok slot waktu.
     * Status 'dibatalkan' dan 'ditolak' membebaskan slot waktu agar tersedia kembali.
     */
    public function availableSlots(Request $request)
    {
        $request->validate([
            'room_id' => [
                'required',
                'exists:rooms,id'
            ],

            'date' => [
                'required',
                'date'
            ]
        ]);

        $reservations = Reservation::where(
                'room_id',
                $request->room_id
            )
            ->where(
                'date_to_reserv',
                $request->date
            )

            // yang masih dianggap memakai ruangan
            ->where(
                'status',
                'disetujui'
                
            )

            ->get();

        return response()->json(
            $reservations->map(function($reservation){
                return [
                    'start_time' => $reservation->start_time,
                    'end_time' => $reservation->end_time
                ];
            })
        );
    }

    /**
     * Simpan reservasi
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'room_id' => [
                'required',
                'exists:rooms,id'
            ],
            'desc' => [
                'required',
                'string'
            ],
            'date_to_reserv' => [
                'required',
                'date'
            ],
            'start_time' => [
                'required',
                'date_format:H:i'
            ],
            'end_time' => [
                'required',
                'date_format:H:i'
            ]
        ]);

        $reservationStart = Carbon::parse(
            $validated['date_to_reserv'].' '.$validated['start_time']
        );

        if($reservationStart->isBefore(now()->addHours(12))){
            return back()
                ->withErrors([
                    'time' => 'Reservasi minimal dilakukan 12 jam sebelumnya.'
                ])
                ->withInput();
        }

        /*
         * Cek jam operasional
         */
        if(
            $validated['start_time'] < '07:00'
            ||
            $validated['end_time'] > '20:00'
        ){
            return back()
                ->withErrors([
                    'time' => 'Jam reservasi hanya 07.00 - 20.00'
                ])
                ->withInput();
        }

        /*
         * Cek durasi kelipatan 30 menit
         */
        $start = strtotime(
            $validated['start_time']
        );
        $end = strtotime(
            $validated['end_time']
        );

        if(
            ($end - $start) <= 0
            ||
            (($end-$start)%1800 !=0)
        ){
            return back()
                ->withErrors([
                    'time' => 'Durasi harus kelipatan 30 menit'
                ])
                ->withInput();
        }

        /*
         * Cek bentrok
         */
        $conflict = Reservation::where(
                'room_id',
                $validated['room_id']
            )
            ->where(
                'date_to_reserv',
                $validated['date_to_reserv']
            )
            ->where(
                'status',
                'disetujui'
            )

            ->where(function($query) use ($validated){
                $query
                    ->where(
                        'start_time',
                        '<',
                        $validated['end_time']
                    )
                    ->where(
                        'end_time',
                        '>',
                        $validated['start_time']
                    );
            })
            ->exists();

        if($conflict){
            return back()
                ->withErrors([
                    'time' => 'Waktu tersebut sudah digunakan'
                ])
                ->withInput();
        }

        /*
         * Simpan
         */
        Reservation::create([
            'user_id' => Auth::id(),
            'room_id' => $validated['room_id'],
            'desc' => $validated['desc'],
            'date_to_reserv' => $validated['date_to_reserv'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'menunggu'
        ]);

        return redirect()
            ->route('reservations.index')
            ->with(
                'success',
                'Reservasi berhasil dibuat'
            );
    }

    public function qrcode(Reservation $reservation)
    {
        abort_if(
            $reservation->user_id != Auth::id(),
            403
        );


        $url = route(
            'reservations.ticket',
            $reservation->id
        );


        $result = new Builder(
            writer: new SvgWriter(),
            data: $url,
            size: 150
        );

        $result = $result->build();


        return response($result->getString())
            ->header(
                'Content-Type',
                'image/svg+xml'
            );

        
    }

    public function ticket(Reservation $reservation)
    {
        abort_if(
            $reservation->user_id != Auth::id(),
            403
        );

        $reservation->load('room');

        return view(
            'user.ticket',
            compact('reservation')
        );
    }



}