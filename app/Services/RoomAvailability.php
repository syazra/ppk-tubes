<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Room;
use Carbon\CarbonImmutable;

class RoomAvailability
{
    public const OPEN_TIME = '07:00';

    public const CLOSE_TIME = '20:00';

    public const STEP_MINUTES = 30;

    public const LEAD_HOURS = 3;

    public const BLOCKING_STATUSES = ['menunggu', 'disetujui'];

    public function earliestStart(): CarbonImmutable
    {
        return CarbonImmutable::now(config('app.timezone'))->addHours(self::LEAD_HOURS);
    }

    /** @return list<array{start_time: string, end_time: string, status: string}> */
    public function slots(Room $room, string $date): array
    {
        $start = CarbonImmutable::createFromFormat('!Y-m-d H:i', $date.' '.self::OPEN_TIME, config('app.timezone'));
        $close = CarbonImmutable::createFromFormat('!Y-m-d H:i', $date.' '.self::CLOSE_TIME, config('app.timezone'));
        $earliest = $this->earliestStart();
        $reservations = $room->is_avail
            ? Reservation::query()->where('room_id', $room->id)->where('date_to_reserv', $date)
                ->whereIn('status', self::BLOCKING_STATUSES)->get(['start_time', 'end_time'])
            : collect();
        $slots = [];

        while ($start->lt($close)) {
            $end = $start->addMinutes(self::STEP_MINUTES);
            $overlap = $reservations->contains(function ($reservation) use ($start, $end) {
                return $this->seconds($reservation->start_time) < $this->seconds($end->format('H:i'))
                    && $this->seconds($reservation->end_time) > $this->seconds($start->format('H:i'));
            });
            $slots[] = [
                'start_time' => $start->format('H:i'),
                'end_time' => $end->format('H:i'),
                'status' => $room->is_avail && $start->gte($earliest) && ! $overlap ? 'available' : 'unavailable',
            ];
            $start = $end;
        }

        return $slots;
    }

    private function seconds(string $time): int
    {
        $parts = array_map('intval', explode(':', $time));

        return $parts[0] * 3600 + $parts[1] * 60 + ($parts[2] ?? 0);
    }
}
