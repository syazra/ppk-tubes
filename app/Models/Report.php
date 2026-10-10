<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    // Tentukan nama tabel jika tidak plural standar (opsional karena 'reports' sudah sesuai konvensi)
    protected $table = 'reports';

    // Kolom yang boleh diisi secara mass-assignment
    protected $fillable = [
        'user_id',
        'room_id',
        'desc',
        'status',
        'estimated_completion_at',
        'rejection_reason',
        'resolution',
        'attachment_bytes',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Room, $this> */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /** @return HasMany<ReportImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ReportImage::class);
    }
}
