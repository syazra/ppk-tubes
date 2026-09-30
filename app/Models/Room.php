<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
