<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\FilesystemException;

class RoomImage extends Model
{
    protected $fillable = [
        'room_id',
        'path',
        'alt_text',
        'display_order',
    ];

    protected function casts(): array
    {
        return ['display_order' => 'integer'];
    }

    /** @return BelongsTo<Room, $this> */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function publicUrl(): ?string
    {
        $path = $this->getAttribute('path');

        if (! is_string($path) || $path === '' || trim($path) !== $path
            || preg_match('/[\\\\:?#%\x00-\x1F\x7F]/', $path)) {
            return null;
        }

        $segments = explode('/', $path);

        if (array_intersect($segments, ['', '.', '..']) !== []) {
            return null;
        }

        try {
            $disk = Storage::disk('public');

            if (! $disk->fileExists($path)) {
                return null;
            }

            return $disk->url(implode('/', array_map('rawurlencode', $segments)));
        } catch (FilesystemException) {
            return null;
        }
    }
}
