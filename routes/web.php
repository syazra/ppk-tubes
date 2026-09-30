<?php

use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\OperatorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// 1. Route Publik & Guest
Route::get('/', function () {
    return Inertia::render('Landing', [
        'loginUrl' => route('login'),
        'reservationUrl' => route('reservations.index'),
        'createReservationUrl' => route('reservations.form'),
    ]);
});

Route::get('/guest/dashboard', function () {
    return view('guest.dashboard');
})->name('guest.dashboard');

require __DIR__.'/auth.php';

// 2. Route Utama (Wajib Login: Mahasiswa dan Dosen)
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

// 3. Route Khusus Operator
Route::middleware(['auth', 'verified'])->prefix('operator')->name('operator.')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        return Inertia::render('Operator/Dashboard', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'status' => $request->session()->get('status'),
            'csrfToken' => csrf_token(),
            'urls' => [
                'dashboard' => route('operator.dashboard'),
                'reservations' => route('operator.reservations'),
                'reports' => route('operator.reports'),
                'profile' => route('profile.edit'),
                'guest' => route('guest.dashboard'),
                'logout' => route('logout'),
            ],
        ]);
    })->name('dashboard');

    Route::get('/reservations', function (Request $request) {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:menunggu,disetujui,ditolak,dibatalkan'],
        ]);

        $summary = [
            'total' => \App\Models\Reservation::count(),
            'approved' => \App\Models\Reservation::where('status', 'disetujui')->count(),
            'pending' => \App\Models\Reservation::where('status', 'menunggu')->count(),
            'rejected' => \App\Models\Reservation::where('status', 'ditolak')->count(),
        ];

        $reservations = \App\Models\Reservation::with(['room', 'user'])
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->whereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('room', fn ($roomQuery) => $roomQuery->where('name', 'like', "%{$search}%"))
                        ->orWhere('desc', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (\App\Models\Reservation $reservation): array => [
                'id' => $reservation->id,
                'user' => [
                    'name' => $reservation->user?->name,
                    'email' => $reservation->user?->email,
                ],
                'room' => [
                    'name' => $reservation->room?->name,
                    'location' => $reservation->room?->location,
                ],
                'date_to_reserv' => $reservation->date_to_reserv,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'desc' => $reservation->desc,
                'status' => $reservation->status,
            ]);

        return Inertia::render('Operator/Reservations', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'status' => $request->session()->get('success'),
            'csrfToken' => csrf_token(),
            'reservations' => $reservations,
            'summary' => $summary,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
            ],
            'urls' => [
                'dashboard' => route('operator.dashboard'),
                'reservations' => route('operator.reservations'),
                'reports' => route('operator.reports'),
                'approve' => url('/operator/reservations'),
                'reject' => url('/operator/reservations'),
                'profile' => route('profile.edit'),
                'guest' => route('guest.dashboard'),
                'logout' => route('logout'),
            ],
        ]);
    })->name('reservations');

    Route::get('/reports', function (Request $request) {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:baru,diproses,selesai,ditolak,dibatalkan'],
        ]);

        $summary = [
            'total' => \App\Models\Report::count(),
            'new' => \App\Models\Report::where('status', 'baru')->count(),
            'processing' => \App\Models\Report::where('status', 'diproses')->count(),
            'completed' => \App\Models\Report::where('status', 'selesai')->count(),
        ];

        $reports = \App\Models\Report::with(['room', 'user'])
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->whereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('room', fn ($roomQuery) => $roomQuery->where('name', 'like', "%{$search}%"))
                        ->orWhere('desc', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (\App\Models\Report $report): array => [
                'id' => $report->id,
                'user' => [
                    'name' => $report->user?->name,
                    'email' => $report->user?->email,
                ],
                'room' => [
                    'name' => $report->room?->name,
                    'location' => $report->room?->location,
                ],
                'desc' => $report->desc,
                'image_url' => $report->image
                    ? \Illuminate\Support\Facades\Storage::disk('public')->url($report->image)
                    : null,
                'status' => $report->status,
                'created_at' => $report->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Operator/Reports', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'status' => $request->session()->get('status'),
            'csrfToken' => csrf_token(),
            'reports' => $reports,
            'summary' => $summary,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
            ],
            'urls' => [
                'dashboard' => route('operator.dashboard'),
                'reservations' => route('operator.reservations'),
                'reports' => route('operator.reports'),
                'profile' => route('profile.edit'),
                'guest' => route('guest.dashboard'),
                'logout' => route('logout'),
            ],
        ]);
    })->name('reports');

    Route::patch('/reservations/{id}/approve', [OperatorController::class, 'approve'])->name('reservations.approve');
    Route::patch('/reservations/{id}/reject', [OperatorController::class, 'reject'])->name('reservations.reject');
});

// 4. Route Khusus Admin
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $summary = [
            'students' => \App\Models\User::where('account_type', 'mahasiswa')->count(),
            'pending_reservations' => \App\Models\Reservation::where('status', 'menunggu')->count(),
            'monthly_reservations' => \App\Models\Reservation::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'active_rooms' => \App\Models\Room::where('is_avail', true)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'user' => request()->user()->only('name', 'email', 'role', 'account_type'),
            'admin' => request()->user()->only('name', 'email', 'role', 'account_type'),
            'status' => session('status'),
            'csrfToken' => csrf_token(),
            'summary' => $summary,
            'urls' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('guest.dashboard'),
                'logout' => route('logout'),
            ],
        ]);
    })->name('dashboard');

    Route::get('/registrations', [RegistrationController::class, 'index'])->name('registrations.index');
    Route::post('/registrations', [RegistrationController::class, 'store'])->name('registrations.store');
    Route::put('/registrations/{user}', [RegistrationController::class, 'update'])->name('registrations.update');
    Route::delete('/registrations/{user}', [RegistrationController::class, 'destroy'])->name('registrations.destroy');
});
