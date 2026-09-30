<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class FacilityRecap
{
    /**
     * @param  array{from: string, to: string, location: string, room_id: int|string}  $filters
     * @return array{
     *     facilities: array<int, array{id: int, name: string, location: string, type: string, is_avail: bool, reservations: int, occupied_hours: float, damage_reports: int}>,
     *     locations: array<int, array{location: string, facilities: int, reservations: int, occupied_hours: float, damage_reports: int}>,
     *     totals: array{facilities: int, reservations: int, occupied_hours: float, damage_reports: int}
     * }
     */
    public function build(array $filters): array
    {
        $from = CarbonImmutable::parse($filters['from']);
        $to = CarbonImmutable::parse($filters['to']);
        $rooms = Room::query()
            ->when($filters['room_id'] ?: null, fn ($query, $id) => $query->whereKey($id))
            ->when($filters['location'] ?: null, fn ($query, $location) => $query->where('location', $location))
            ->orderBy('location')->orderBy('name')->get();

        $ids = $rooms->modelKeys();
        $occupancy = [];
        Reservation::query()->whereIn('room_id', $ids)
            ->where('status', 'disetujui')
            ->whereBetween('date_to_reserv', [$from->toDateString(), $to->toDateString()])
            ->select(['room_id', 'start_time', 'end_time'])
            ->chunk(500, function ($reservations) use (&$occupancy): void {
                foreach ($reservations as $reservation) {
                    $roomId = $reservation->room_id;
                    $occupancy[$roomId] ??= ['reservations' => 0, 'minutes' => 0];
                    $occupancy[$roomId]['reservations']++;
                    $start = CarbonImmutable::parse($reservation->start_time);
                    $end = CarbonImmutable::parse($reservation->end_time);
                    $occupancy[$roomId]['minutes'] += max(0, $start->diffInMinutes($end, false));
                }
            });

        $damages = Report::query()->whereIn('room_id', $ids)
            ->whereIn('status', ['baru', 'diproses', 'selesai'])
            ->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])
            ->selectRaw('room_id, COUNT(*) as total')
            ->groupBy('room_id')->pluck('total', 'room_id');

        $facilities = $rooms->map(function (Room $room) use ($occupancy, $damages): array {
            $minutes = $occupancy[$room->id]['minutes'] ?? 0;

            return [
                'id' => $room->id,
                'name' => $room->name,
                'location' => $room->location,
                'type' => $room->type,
                'is_avail' => $room->is_avail,
                'reservations' => $occupancy[$room->id]['reservations'] ?? 0,
                'occupied_hours' => round($minutes / 60, 2),
                'damage_reports' => (int) ($damages[$room->id] ?? 0),
            ];
        });

        $locations = $facilities->groupBy('location')->map(function (Collection $rows, string|int $location): array {
            return [
                'location' => (string) $location,
                'facilities' => $rows->count(),
                'reservations' => (int) $rows->sum('reservations'),
                'occupied_hours' => round($rows->sum('occupied_hours'), 2),
                'damage_reports' => (int) $rows->sum('damage_reports'),
            ];
        })->values();

        return [
            'facilities' => $facilities->values()->all(),
            'locations' => $locations->all(),
            'totals' => [
                'facilities' => $facilities->count(),
                'reservations' => (int) $facilities->sum('reservations'),
                'occupied_hours' => round($facilities->sum('occupied_hours'), 2),
                'damage_reports' => (int) $facilities->sum('damage_reports'),
            ],
        ];
    }
}
