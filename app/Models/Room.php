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
        'is_avail'
    ];


    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}