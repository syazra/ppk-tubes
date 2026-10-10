<?php

namespace App\Services;

use App\Models\Room;
use App\Models\RoomImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class FacilityImages
{
    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<int, UploadedFile>  $uploads
     * @param  array<int, int|string>  $removedIds
     */
    public function save(Room $room, array $attributes, array $uploads, array $removedIds): void
    {
        $disk = Storage::disk('public');
        $stored = [];
        $removedPaths = [];

        try {
            DB::transaction(function () use ($room, $attributes, $uploads, $removedIds, $disk, &$stored, &$removedPaths): void {
                $room->fill($attributes)->save();
                $removedPaths = $room->images()->whereIn('id', $removedIds)->pluck('path')->all();
                $room->images()->whereIn('id', $removedIds)->delete();
                $order = (int) ($room->images()->max('display_order') ?? -1) + 1;

                foreach ($uploads as $upload) {
                    $path = $disk->putFile('facilities/uploads', $upload);
                    if (! is_string($path) || $path === '') {
                        throw ValidationException::withMessages(['images' => 'Foto fasilitas gagal disimpan. Silakan coba lagi.']);
                    }
                    $stored[] = $path;
                    $room->images()->create([
                        'path' => $path,
                        'alt_text' => 'Foto '.$room->name,
                        'display_order' => $order++,
                    ]);
                }
            });
        } catch (Throwable $exception) {
            $disk->delete($stored);
            throw $exception;
        }

        foreach ($removedPaths as $path) {
            // Seed assets can be shared by multiple facilities and must be retained.
            if (str_starts_with($path, 'facilities/uploads/') && ! RoomImage::where('path', $path)->exists()) {
                $disk->delete($path);
            }
        }
    }
}
