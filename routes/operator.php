<?php

use App\Http\Controllers\OperatorController;
use App\Models\Report;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::middleware(['auth', 'role:operator', 'verified'])->prefix('operator')->name('operator.')->group(function () {
    Route::get('/dashboard', function (Request $request) {
        $recentReservations = \App\Models\Reservation::with('room')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn (\App\Models\Reservation $reservation): array => [
                'id' => $reservation->id,
                'room' => [
                    'name' => $reservation->room?->name,
                    'type' => $reservation->room?->type,
                ],
                'date_to_reserv' => $reservation->date_to_reserv,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'status' => $reservation->status,
                'rejection_reason' => $reservation->rejection_reason,
            ]);

        $recentReports = \App\Models\Report::with('room')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn (\App\Models\Report $report): array => [
                'id' => $report->id,
                'room' => [
                    'name' => $report->room?->name,
                ],
                'desc' => $report->desc,
                'status' => $report->status,
                'created_at' => $report->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Operator/Dashboard', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'status' => $request->session()->get('status'),
            'csrfToken' => csrf_token(),
            'recentReservations' => $recentReservations,
            'recentReports' => $recentReports,
            'urls' => [
                'dashboard' => route('operator.dashboard'),
                'reservations' => route('operator.reservations'),
                'reports' => route('operator.reports'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
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
                'rejection_reason' => $reservation->rejection_reason,
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
                'guest' => route('landing'),
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
                'estimated_completion_at' => $report->estimated_completion_at,
                'rejection_reason' => $report->rejection_reason,
                'resolution' => $report->resolution,
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
                'processing' => url('/operator/reports'), // <-- TAMBAHKAN INI
                'complete' => url('/operator/reports'),   // <-- TAMBAHKAN INI
                'reject' => url('/operator/reports'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    })->name('reports');

    Route::patch('/reservations/{id}/approve', [OperatorController::class, 'approve'])->name('reservations.approve');
    Route::patch('/reservations/{id}/reject', [OperatorController::class, 'reject'])->name('reservations.reject');
    Route::patch('/reports/{id}/process', [OperatorController::class, 'setProcess'])->name('reports.process');
    Route::patch('/reports/{id}/complete', [OperatorController::class, 'markAsCompleted'])->name('reports.complete');
    Route::patch('/reports/{id}/reject', [OperatorController::class, 'rejectReport'])->name('reports.reject');
    Route::patch('/reports/{id}/extend', [OperatorController::class, 'extendEstimate'])->name('reports.extend');
});