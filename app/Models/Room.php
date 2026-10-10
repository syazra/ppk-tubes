<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'name',
        'location',
        'desc',
        'type',
        'capacity',
        'is_avail',
        'is_admin_disabled',
    ];

    protected function casts(): array
    {
        return ['is_avail' => 'boolean', 'is_admin_disabled' => 'boolean', 'capacity' => 'integer'];
    }

    /** @return HasMany<Reservation, $this> */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /** @return HasMany<RoomImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(RoomImage::class)
            ->orderBy('display_order')
            ->orderBy('id');
    }

    /** @return HasMany<Report, $this> */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    // Call only while holding this room's row lock in a transaction.
    public function syncAvailability(): void
    {
        $this->update(['is_avail' => ! $this->is_admin_disabled
            && ! $this->reports()->where('status', 'diproses')->exists()]);
    }
}
