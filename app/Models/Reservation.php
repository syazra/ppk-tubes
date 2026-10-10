<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'room_id',
        'reservation_type',
        'institution',
        'activity_name',
        'proposal_path',
        'participant_count',
        'desc',
        'date_to_reserv',
        'start_time',
        'end_time',
        'status',
        'attachment_bytes',
    ];

    /** @return BelongsTo<Room, $this> */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getDeadlineTime(): CarbonImmutable
    {
        return CarbonImmutable::parse(
            $this->date_to_reserv.' '.$this->start_time
        )->subHours(12);
    }

    public function canStillBeProcessed(): bool
    {
        return now()->lt($this->getDeadlineTime());
    }

    public function canBeCancelled(): bool
    {
        $cutoff = CarbonImmutable::parse($this->date_to_reserv.' '.$this->start_time, config('app.timezone'))->subHours(6);

        return $this->status === 'menunggu' && CarbonImmutable::now(config('app.timezone'))->lte($cutoff);
    }
}
