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
    ];

    protected function casts(): array
    {
        return ['is_avail' => 'boolean', 'capacity' => 'integer'];
    }

    /** @return HasMany<Reservation, $this> */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
