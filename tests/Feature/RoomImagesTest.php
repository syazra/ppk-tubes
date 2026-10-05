<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\RoomImage;
use Illuminate\Database\MySqlConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use LogicException;
use Tests\TestCase;

class RoomImagesTest extends TestCase
{
    use RefreshDatabase;

    private function facility(): Room
    {
        return Room::create([
            'name' => 'Aula Utama',
            'location' => 'Gedung A',
            'type' => 'Aula',
            'capacity' => 100,
            'is_avail' => true,
        ]);
    }

    public function test_facility_can_have_zero_one_or_multiple_ordered_photos(): void
    {
        $room = $this->facility();
        $this->assertCount(0, $room->images);

        $first = $room->images()->create(['path' => 'facilities/first.jpg']);
        $this->assertCount(1, $room->fresh()->images);
        $this->assertSame($room->id, $first->room->id);
        $this->assertSame(0, $first->fresh()->display_order);
        $this->assertNull($first->alt_text);

        $later = $room->images()->create(['path' => 'facilities/later.jpg', 'display_order' => 2]);
        $second = $room->images()->create(['path' => 'facilities/second.jpg', 'display_order' => 1]);
        $third = $room->images()->create(['path' => 'facilities/third.jpg', 'display_order' => 1]);

        $loaded = Room::with('images')->findOrFail($room->id);
        $this->assertTrue($loaded->relationLoaded('images'));
        $this->assertSame([$first->id, $second->id, $third->id, $later->id], $loaded->images->modelKeys());
    }

    public function test_existing_photo_urls_come_from_the_public_disk(): void
    {
        Storage::fake('public');
        $disk = Storage::disk('public');
        $disk->put('facilities/main.jpg', 'photo');
        $disk->put('facilities/side view.jpg', 'photo');

        $this->assertSame($disk->url('facilities/main.jpg'), (new RoomImage(['path' => 'facilities/main.jpg']))->publicUrl());
        $this->assertSame($disk->url('facilities/side%20view.jpg'), (new RoomImage(['path' => 'facilities/side view.jpg']))->publicUrl());
    }

    public function test_missing_or_unsafe_paths_return_null_for_the_ui_fallback(): void
    {
        Storage::fake('public');
        Storage::disk('public')->makeDirectory('facilities/directory');

        foreach ([
            '',
            'facilities/missing.jpg',
            'facilities/directory',
            'https://example.test/photo.jpg',
            '//example.test/photo.jpg',
            '/facilities/photo.jpg',
            '../photo.jpg',
            'facilities/../photo.jpg',
            'facilities/./photo.jpg',
            'facilities//photo.jpg',
            'facilities\\photo.jpg',
            'C:\\photo.jpg',
            'facilities/%2e%2e/photo.jpg',
            'facilities/photo.jpg?download=1',
            'facilities/photo.jpg#fragment',
            "facilities/photo\0.jpg",
            "facilities/photo\n.jpg",
            ' facilities/photo.jpg',
        ] as $path) {
            $this->assertNull((new RoomImage(['path' => $path]))->publicUrl(), $path);
        }

        $this->assertNull((new RoomImage)->publicUrl());
    }

    public function test_deleting_facility_cascades_only_its_photo_metadata(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('facilities/main.jpg', 'photo');
        $room = $this->facility();
        $otherRoom = $this->facility();
        $image = $room->images()->create(['path' => 'facilities/main.jpg']);
        $otherImage = $otherRoom->images()->create(['path' => 'facilities/other.jpg']);

        $room->delete();

        $this->assertDatabaseMissing('room_images', ['id' => $image->id]);
        $this->assertDatabaseHas('room_images', ['id' => $otherImage->id]);
        Storage::disk('public')->assertExists('facilities/main.jpg');
    }

    public function test_photo_migration_can_be_rolled_back_and_reapplied_on_sqlite(): void
    {
        $room = $this->facility();
        $migration = require database_path('migrations/2026_10_05_000001_create_room_images_table.php');

        $migration->down();

        $this->assertFalse(Schema::hasTable('room_images'));
        $this->assertDatabaseHas('rooms', ['id' => $room->id]);

        $migration->up();

        $this->assertTrue(Schema::hasColumns('room_images', [
            'id', 'room_id', 'path', 'alt_text', 'display_order', 'created_at', 'updated_at',
        ]));
        $room->images()->create(['path' => 'facilities/main.jpg']);
        $this->assertDatabaseCount('room_images', 1);
    }

    public function test_photo_migration_compiles_mysql_schema_without_connecting(): void
    {
        $connection = new MySqlConnection(function () {
            throw new LogicException('Schema compilation must not connect to a database.');
        }, 'schema_validation', '', ['driver' => 'mysql', 'charset' => 'utf8mb4', 'collation' => 'utf8mb4_unicode_ci']);
        $connection->useDefaultSchemaGrammar();
        $originalSchema = Schema::getFacadeRoot();
        $migration = require database_path('migrations/2026_10_05_000001_create_room_images_table.php');

        try {
            Schema::swap($connection->getSchemaBuilder());
            $queries = $connection->pretend(function () use ($migration) {
                $migration->up();
                $migration->down();
            });
        } finally {
            Schema::swap($originalSchema);
        }

        $sql = implode("\n", array_column($queries, 'query'));
        $this->assertStringContainsString('create table `room_images`', $sql);
        $this->assertStringContainsString('foreign key (`room_id`) references `rooms` (`id`) on delete cascade', $sql);
        $this->assertStringContainsString('index `room_images_room_id_display_order_id_index`(`room_id`, `display_order`, `id`)', $sql);
        $this->assertStringContainsString('drop table if exists `room_images`', $sql);
    }
}
