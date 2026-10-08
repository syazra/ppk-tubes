<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicFacilityController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:100'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $today = now('Asia/Jakarta')->toDateString();
        $filters = [
            'search' => $validated['search'] ?? '',
            'type' => $validated['type'] ?? '',
            'location' => $validated['location'] ?? '',
            'capacity' => (string) ($validated['capacity'] ?? ''),
            'date' => $validated['date'] ?? $today,
        ];

        $rooms = Room::query()
            ->select(['id', 'name', 'location', 'type', 'capacity', 'desc', 'is_avail'])
            ->when($filters['search'] !== '', fn ($query) => $query->where('name', 'like', '%'.$filters['search'].'%'))
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['location'] !== '', fn ($query) => $query->where('location', $filters['location']))
            ->when($filters['capacity'] !== '', fn ($query) => $query->where('capacity', '>=', (int) $filters['capacity']))
            ->with(['images', 'reservations' => fn ($query) => $query
                ->select(['room_id', 'start_time', 'end_time'])
                ->where('date_to_reserv', $filters['date'])
                ->where('status', 'disetujui')])
            ->orderBy('location')
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(6)
            ->withQueryString()
            ->through(fn (Room $room) => [
                'id' => $room->id,
                'name' => $room->name,
                'location' => $room->location,
                'type' => $room->type,
                'capacity' => $room->capacity,
                'desc' => $room->desc,
                'is_avail' => $room->is_avail,
                'images' => $room->images->map(function (RoomImage $image): ?array {
                    $url = $image->publicUrl();

                    return $url === null ? null : ['url' => $url, 'alt_text' => $image->alt_text];
                })->filter()->values()->all(),
                'slots' => $this->slots($room),
            ]);

        return Inertia::render('Guest/Facilities', [
            'rooms' => $rooms,
            'filters' => $filters,
            'types' => Room::query()->distinct()->orderBy('type')->pluck('type'),
            'locations' => Room::query()->distinct()->orderBy('location')->pluck('location'),
            'today' => $today,
            'photoPlaceholderUrl' => asset('images/facility-placeholder-photo.jpg'),
            'photoFallbackUrl' => asset('images/facility-placeholder.svg'),
            'urls' => [
                'landing' => route('landing'),
                'facilities' => route('facilities.index'),
                'about' => route('about'),
                'login' => route('login'),
            ],
        ]);
    }

    /** @return array<int, array{start_time: string, end_time: string, available: bool}> */
    private function slots(Room $room): array
    {
        $occupied = $room->reservations->map(fn ($reservation) => [
            'start' => $this->timeToSeconds($reservation->start_time),
            'end' => $this->timeToSeconds($reservation->end_time),
        ]);
        $slots = [];

        for ($start = 7 * 60; $start < 20 * 60; $start += 30) {
            $end = $start + 30;
            $blocked = $occupied->contains(fn ($range) => $range['start'] < $end * 60 && $range['end'] > $start * 60);

            $slots[] = [
                'start_time' => sprintf('%02d:%02d', intdiv($start, 60), $start % 60),
                'end_time' => sprintf('%02d:%02d', intdiv($end, 60), $end % 60),
                'available' => $room->is_avail && ! $blocked,
            ];
        }

        return $slots;
    }

    private function timeToSeconds(string $time): int
    {
        $parts = explode(':', $time);

        return (int) $parts[0] * 3600 + (int) $parts[1] * 60 + (int) ($parts[2] ?? 0);
    }
}
