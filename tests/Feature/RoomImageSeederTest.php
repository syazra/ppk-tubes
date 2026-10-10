<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\RoomImage;
use Database\Seeders\RoomImageSeeder;
use Database\Seeders\RoomSeeder;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class RoomImageSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_facilities_receive_real_public_photos_from_their_class_pool(): void
    {
        Storage::fake('public');
        $this->seed(RoomSeeder::class);
        $before = Room::all()->toArray();

        $this->seed(RoomImageSeeder::class);

        $folders = [
            'Aula' => 'Aula',
            'Lapangan' => 'Lapangan',
            'Ruang Kelas' => 'RuangKelas',
            'Laboratorium' => 'Laboratorium',
        ];
        $this->assertDatabaseCount('room_images', 37);
        $this->assertSame($before, Room::all()->toArray());

        foreach (Room::with('images')->get() as $room) {
            $this->assertCount(1, $room->images);
            $photo = $room->images->first();
            $this->assertStringStartsWith('facilities/db-photos/'.$folders[$room->type].'/', $photo->path);
            $this->assertSame('Foto '.$room->name, $photo->alt_text);
            $this->assertSame(0, $photo->display_order);
            Storage::disk('public')->assertExists($photo->path);
            $this->assertNotNull(getimagesize(Storage::disk('public')->path($photo->path)) ?: null);
            $this->assertSame(Storage::disk('public')->url($photo->path), $photo->publicUrl());
        }

        // Exhaust each pool before reusing photos for facilities in that class.
        foreach ($folders as $type => $folder) {
            $pool = collect(glob(database_path('seeders/photos/'.$folder.'/*.*')))
                ->filter(fn ($file) => in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), ['jpg', 'png', 'webp', 'avif'], true))
                ->count();
            $rooms = Room::with('images')->where('type', $type)->get();
            $paths = $rooms->map(fn (Room $room) => $room->images->first()->path);
            $this->assertCount(min($rooms->count(), $pool), $paths->unique());
        }
    }

    public function test_rerunning_preserves_assignments_and_existing_custom_photos(): void
    {
        Storage::fake('public');
        $this->seed(RoomSeeder::class);
        $room = Room::where('type', 'Aula')->firstOrFail();
        Storage::disk('public')->put('facilities/custom.jpg', 'existing photo');
        $room->images()->create(['path' => 'facilities/custom.jpg', 'display_order' => 2]);

        $this->seed(RoomImageSeeder::class);
        $before = RoomImage::orderBy('id')->get()->toArray();
        $this->seed(RoomImageSeeder::class);

        $this->assertSame($before, RoomImage::orderBy('id')->get()->toArray());
        $this->assertSame('facilities/custom.jpg', $room->images()->sole()->path);
        $this->assertSame('existing photo', Storage::disk('public')->get('facilities/custom.jpg'));
    }

    public function test_failed_storage_write_rolls_back_all_photo_metadata(): void
    {
        $this->seed(RoomSeeder::class);
        $disk = Mockery::mock(FilesystemAdapter::class);
        $disk->shouldReceive('put')->twice()->andReturn(true, false);
        Storage::shouldReceive('disk')->once()->with('public')->andReturn($disk);

        try {
            $this->seed(RoomImageSeeder::class);
            $this->fail('A failed storage write must stop the import.');
        } catch (RuntimeException $exception) {
            $this->assertStringStartsWith('Could not store facility photo ', $exception->getMessage());
        }

        $this->assertDatabaseCount('rooms', 37);
        $this->assertDatabaseCount('room_images', 0);
    }

    public function test_temporary_lab_photos_are_replaced_without_touching_custom_or_classroom_photos(): void
    {
        Storage::fake('public');
        $this->seed(RoomSeeder::class);
        $labs = Room::where('type', 'Laboratorium')->orderBy('id')->get();
        $temporary = $labs[0]->images()->create(['path' => 'facilities/db-photos/RuangKelas/01.jpg']);
        $custom = $labs[1]->images()->create(['path' => 'facilities/custom-lab.jpg']);
        $classroom = Room::where('type', 'Ruang Kelas')->firstOrFail()
            ->images()->create(['path' => 'facilities/db-photos/RuangKelas/01.jpg']);

        $this->seed(RoomImageSeeder::class);

        $this->assertStringStartsWith('facilities/db-photos/Laboratorium/', $temporary->fresh()->path);
        $this->assertSame('facilities/custom-lab.jpg', $custom->fresh()->path);
        $this->assertSame('facilities/db-photos/RuangKelas/01.jpg', $classroom->fresh()->path);
        $this->assertDatabaseCount('room_images', 37);
        $before = RoomImage::orderBy('id')->get()->toArray();

        $this->seed(RoomImageSeeder::class);

        $this->assertSame($before, RoomImage::orderBy('id')->get()->toArray());
    }
}
