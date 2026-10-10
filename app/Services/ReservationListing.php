<?php

namespace App\Services;

use App\Models\Reservation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReservationListing
{
    public static function filters(Request $request): array
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['menunggu', 'disetujui', 'ditolak', 'dibatalkan'])],
            'sort' => ['nullable', Rule::in(['reservation_near', 'reservation_far', 'created_near', 'created_far'])],
        ]);

        return [
            'search' => $validated['search'] ?? '',
            'status' => $validated['status'] ?? '',
            'sort' => $validated['sort'] ?? 'created_near',
        ];
    }

    public static function apply(Builder $query, array $filters): Builder
    {
        $query->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $search = '%'.$filters['search'].'%';
                $query->where(function ($query) use ($search): void {
                    $query->whereHas('user', fn ($user) => $user->where('name', 'like', $search)->orWhere('email', 'like', $search))
                        ->orWhereHas('room', fn ($room) => $room->where('name', 'like', $search)->orWhere('type', 'like', $search)->orWhere('location', 'like', $search))
                        ->orWhere('date_to_reserv', 'like', $search)
                        ->orWhere('institution', 'like', $search)
                        ->orWhere('activity_name', 'like', $search)
                        ->orWhere('desc', 'like', $search);
                });
            });

        return match ($filters['sort']) {
            'reservation_near' => $query->orderBy('date_to_reserv')->orderBy('start_time')->orderBy('id'),
            'reservation_far' => $query->orderByDesc('date_to_reserv')->orderByDesc('start_time')->orderByDesc('id'),
            'created_far' => $query->orderBy('created_at')->orderBy('id'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };
    }

    public static function data(Reservation $reservation): array
    {
        return [
            'id' => $reservation->id,
            'user' => $reservation->user?->only('name', 'email'),
            'room' => $reservation->room?->only('name', 'type', 'location'),
            'reservation_type' => $reservation->reservation_type,
            'institution' => $reservation->institution,
            'activity_name' => $reservation->activity_name,
            'participant_count' => $reservation->participant_count,
            'date_to_reserv' => $reservation->date_to_reserv,
            'start_time' => $reservation->start_time,
            'end_time' => $reservation->end_time,
            'desc' => $reservation->desc,
            'status' => $reservation->status,
            'rejection_reason' => $reservation->rejection_reason,
            'ticket_url' => route('reservations.ticket', $reservation),
            'qr_url' => route('reservations.qrcode', $reservation),
        ];
    }
}
