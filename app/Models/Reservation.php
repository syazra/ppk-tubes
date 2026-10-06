<?php

namespace App\Models;
use carbon\carbon;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'room_id',
        'desc',
        'date_to_reserv',
        'start_time',
        'end_time',
        'status'
    ];


    public function room()
    {
        return $this->belongsTo(Room::class);
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function getDeadlineTime()
    {
        return Carbon::parse(
            $this->date_to_reserv . ' ' . $this->start_time
        )->subHours(12);
    }


    public function canStillBeProcessed()
    {
        return now()->lt($this->getDeadlineTime());
    }
}