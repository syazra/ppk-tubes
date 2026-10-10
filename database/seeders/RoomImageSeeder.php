<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class RoomImageSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            'Aula' => 'Aula',
            'Lapangan' => 'Lapangan',
            'Ruang Kelas' => 'RuangKelas',
            'Laboratorium' => 'Laboratorium',
        ];
        $disk = Storage::disk('public');
        $pools = [];

        foreach (array_unique($classes) as $folder) {
            $files = collect(File::files(database_path('seeders/photos/'.$folder)))
                ->filter(fn ($file) => in_array(strtolower($file->getExtension()), ['jpg', 'png', 'webp', 'avif'], true))
                ->values();

            if ($files->isEmpty()) {
                throw new RuntimeException('No facility photos found for '.$folder.'.');
            }

            $pools[$folder] = $files;
        }

        DB::transaction(function () use ($classes, $pools, $disk): void {
            $roomsByType = Room::query()
                ->with('images')
                ->whereIn('type', array_keys($classes))
                ->orderBy('id')
                ->get()
                ->filter(fn (Room $room) => $room->images->isEmpty() || $this->hasTemporaryLaboratoryPhoto($room))
                ->groupBy('type');

            foreach ($roomsByType as $type => $rooms) {
                $folder = $classes[$type];
                $files = ($pools[$folder] ?? throw new RuntimeException('Missing facility photo pool for '.$folder.'.'))->shuffle();

                foreach ($rooms as $index => $room) {
                    // Reuse the shuffled pool when there are more facilities than photos.
                    $file = $files[$index % $files->count()];
                    $path = 'facilities/db-photos/'.$folder.'/'.$file->getFilename();

                    if (! $disk->put($path, File::get($file->getPathname()))) {
                        throw new RuntimeException('Could not store facility photo '.$path.'.');
                    }

                    $attributes = [
                        'path' => $path,
                        'alt_text' => 'Foto '.$room->name,
                        'display_order' => 0,
                    ];

                    if ($this->hasTemporaryLaboratoryPhoto($room)) {
                        $room->images->sole()->update($attributes);
                    } else {
                        $room->images()->create($attributes);
                    }
                }
            }
        });
    }

    private function hasTemporaryLaboratoryPhoto(Room $room): bool
    {
        return $room->type === 'Laboratorium'
            && $room->images->count() === 1
            && in_array($room->images->sole()->path, [
                'facilities/db-photos/RuangKelas/01.jpg',
                'facilities/db-photos/RuangKelas/02.jpg',
            ], true);
    }
}
