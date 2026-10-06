<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use App\Services\RoomAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\SvgWriter;
use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Menampilkan reservasi user
     */
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['menunggu', 'disetujui', 'ditolak', 'dibatalkan'])],
            'sort' => ['nullable', Rule::in(['reservation_near', 'reservation_far', 'created_near', 'created_far'])],
        ]);

        $sort = $filters['sort'] ?? 'created_near';
        $reservations = Reservation::with('room')
            ->where('user_id', $request->user()->id)
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->whereHas('room', function ($roomQuery) use ($search): void {
                        $roomQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('type', 'like', "%{$search}%");
                    })->orWhere('date_to_reserv', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($sort === 'reservation_near', fn ($query) => $query->orderBy('date_to_reserv')->orderBy('start_time'))
            ->when($sort === 'reservation_far', fn ($query) => $query->orderByDesc('date_to_reserv')->orderByDesc('start_time'))
            ->when($sort === 'created_near', fn ($query) => $query->orderByDesc('created_at'))
            ->when($sort === 'created_far', fn ($query) => $query->orderBy('created_at'))
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Reservation $reservation): array => [
                'id' => $reservation->id,
                'room' => [
                    'name' => $reservation->room?->name,
                    'type' => $reservation->room?->type,
                ],
                'date_to_reserv' => $reservation->date_to_reserv,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'desc' => $reservation->desc,
                'status' => $reservation->status,
                'can_cancel' => $reservation->status === 'menunggu' && $reservation->canStillBeProcessed(),
                'cancel_url' => route('reservations.cancel', $reservation),
                'ticket_url' => route('reservations.ticket', $reservation),
                'qr_url' => route('reservations.qrcode', $reservation),
            ]);

        return Inertia::render('User/MyReservations', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'csrfToken' => csrf_token(),
            'status' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
            'reservations' => $reservations,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'sort' => $sort,
            ],
            'urls' => [
                'dashboard' => route('user.dashboard'),
                'reports' => route('reports.index'),
                'reservations' => route('reservations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    /**
     * Form reservasi
     */
    public function create(Request $request): \Illuminate\View\View
    {
        $rooms = Room::where('is_avail', true)->get();
        return view('user.reservation-form', compact('rooms') + $this->facilityBrowserData($request));
    }

    /**
     * Detail tiket reservasi
     */
    public function ticket(Reservation $reservation)
    {
        abort_if(
            $reservation->user_id != Auth::id(),
            403
        );

        return Inertia::render('User/ReservationForm', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'csrfToken' => csrf_token(),
            'rooms' => $rooms,
            'urls' => [
                'dashboard' => route('user.dashboard'),
                'reports' => route('reports.index'),
                'reservations' => route('reservations.index'),
                'slots' => route('reservations.slots'),
                'store' => route('reservations.store'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
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
    public function availableSlots(Request $request, RoomAvailability $availability): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'room_id' => [
                'required',
                'integer',
                Rule::exists('rooms', 'id')->where('is_avail', true)
            ],

            'date' => [
                'required',
                'date_format:Y-m-d'
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
            ->whereIn('status', RoomAvailability::BLOCKING_STATUSES)

            ->get(['start_time', 'end_time']);

        return response()->json(
            $reservations->map(function($reservation){
                return [
                    'start_time' => $reservation->start_time,
                    'end_time' => $reservation->end_time
                ];
            })
        )->header('X-Reservation-Earliest-Start', $availability->earliestStart()->format('Y-m-d\TH:i:s.uP'))
            ->header('X-Reservation-Timezone', config('app.timezone'))
            ->header('Cache-Control', 'private, no-store');
    }

    public function facilities(Request $request): \Illuminate\View\View
    {
        return view('user.partials.facility-list', $this->facilityBrowserData($request));
    }

    public function facilitySlots(Request $request, Room $room, RoomAvailability $availability): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate(['date' => ['required', 'date_format:Y-m-d']]);

        return response()->json([
            'room_id' => $room->id,
            'date' => $validated['date'],
            'slots' => $availability->slots($room, $validated['date']),
        ])->header('Cache-Control', 'private, no-store');
    }

    /** @return array<string, mixed> */
    private function facilityBrowserData(Request $request): array
    {
        $types = ['Ruang Kelas', 'Aula', 'Laboratorium', 'Lapangan'];
        $validator = Validator::make($request->query(), [
            'type' => ['nullable', 'string', Rule::in($types)],
            'location' => ['nullable', 'string', 'max:100'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'page' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ]);
        if ($validator->fails()) {
            throw (new ValidationException($validator))->errorBag('facilityFilters')->redirectTo(route('reservations.form'));
        }
        $validated = $validator->validated();
        $filters = [
            'type' => $validated['type'] ?? '',
            'location' => $validated['location'] ?? '',
            'capacity' => $validated['capacity'] ?? '',
        ];
        $catalogDate = $validated['date'] ?? Carbon::now(config('app.timezone'))->format('Y-m-d');
        $query = Room::query()->with('images');
        if ($filters['type'] !== '') {
            $query->where('type', $filters['type']);
        }
        if ($filters['location'] !== '') {
            $location = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($filters['location']));
            $query->whereRaw("LOWER(location) LIKE ? ESCAPE '!'", ['%'.$location.'%']);
        }
        if ($filters['capacity'] !== '') {
            $query->where('capacity', '>=', $filters['capacity']);
        }
        $facilities = $query->orderBy('name')->orderBy('id')->paginate(6)
            ->withPath(route('reservations.form'))->appends($filters + ['date' => $catalogDate]);

        return compact('facilities', 'filters', 'types', 'catalogDate') + ['timezone' => config('app.timezone')];
    }

    /**
     * Simpan reservasi
     */
    public function store(Request $request, RoomAvailability $availability): \Illuminate\Http\RedirectResponse
    {

        $validated = $request->validate([
            'room_id' => [
                'required',
                'integer',
                Rule::exists('rooms', 'id')->where('is_avail', true)
            ],
            'desc' => [
                'required',
                'string'
            ],
            'date_to_reserv' => [
                'required',
                'date_format:Y-m-d'
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
            $validated['start_time'] < RoomAvailability::OPEN_TIME
            ||
            $validated['end_time'] > RoomAvailability::CLOSE_TIME
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
            (($end-$start)%(RoomAvailability::STEP_MINUTES * 60) !=0)
            || (int) substr($validated['start_time'], 3) % RoomAvailability::STEP_MINUTES != 0
            || (int) substr($validated['end_time'], 3) % RoomAvailability::STEP_MINUTES != 0
        ){
            return back()
                ->withErrors([
                    'time' => 'Durasi harus kelipatan 30 menit'
                ])
                ->withInput();
        }

        if (Carbon::parse($validated['date_to_reserv'].' '.$validated['start_time'], config('app.timezone'))->lt($availability->earliestStart())) {
            return back()->withErrors(['time' => 'Reservasi harus dimulai minimal tiga jam dari sekarang.'])->withInput();
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
            ->whereIn('status', RoomAvailability::BLOCKING_STATUSES)

            ->where(function($query) use ($validated){
                $query
                    ->whereTime(
                        'start_time',
                        '<',
                        $validated['end_time'].':00'
                    )
                    ->whereTime(
                        'end_time',
                        '>',
                        $validated['start_time'].':00'
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


        $result = Builder::create()
            ->writer(new SvgWriter())
            ->data($url)
            ->size(150)
            ->build();


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
