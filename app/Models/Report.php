<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    // Tentukan nama tabel jika tidak plural standar (opsional karena 'reports' sudah sesuai konvensi)
    protected $table = 'reports';

    // Kolom yang boleh diisi secara mass-assignment
    protected $fillable = [
        'user_id',
        'room_id',
        'desc',
        'image',
        'status',
    ];

    /**
        * Relasi ke tabel users (Pelapor)
        */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
        * Relasi ke tabel rooms (Fasilitas/Ruangan yang dilaporkan)
        */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}