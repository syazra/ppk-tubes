<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminFacilityImagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['role' => 'admin']));
    }

    private function payload(array $overrides = []): array
    {
        return $overrides + ['name' => 'Aula Baru', 'location' => 'Benteng Senja', 'type' => 'Aula', 'capacity' => '120', 'desc' => 'Tempat kegiatan'];
    }

    private function facility(array $overrides = []): Room
    {
        return Room::create($this->payload($overrides) + ['is_avail' => true]);
    }

    private function photo(string $name = 'photo.jpg'): UploadedFile
    {
        // Use real image bytes so tests work without the optional GD extension.
        $source = str_ends_with($name, '.png') ? '08.png' : '01.jpg';

        return UploadedFile::fake()->createWithContent($name, file_get_contents(database_path('seeders/photos/Aula/'.$source)));
    }

    private function widePhoto(): UploadedFile
    {
        $chunk = fn (string $type, string $data): string => pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
        $png = "\x89PNG\r\n\x1a\n"
            .$chunk('IHDR', pack('NNCCCCC', 6001, 1, 8, 2, 0, 0, 0))
            .$chunk('IDAT', gzcompress("\0".str_repeat("\0", 6001 * 3)))
            .$chunk('IEND', '');

        return UploadedFile::fake()->createWithContent('wide.png', $png);
    }

    public function test_create_uploads_public_ordered_photos_and_admin_can_see_them(): void
    {
        $this->post(route('admin.facilities.store'), $this->payload([
            'name' => '  Aula Baru  ', 'location' => ' Benteng Senja ',
            'images' => [$this->photo('front.jpg'), $this->photo('side.png')],
        ]))->assertSessionHasNoErrors();
        $room = Room::with('images')->sole();
        $this->assertSame('Aula Baru', $room->name);
        $this->assertSame('Benteng Senja', $room->location);
        $this->assertSame(120, $room->capacity);
        $this->assertCount(2, $room->images);
        $this->assertSame([0, 1], $room->images->pluck('display_order')->all());
        foreach ($room->images as $image) {
            $this->assertStringStartsWith('facilities/uploads/', $image->path);
            Storage::disk('public')->assertExists($image->path);
            $this->assertNotNull($image->publicUrl());
        }
        $this->get(route('admin.facilities.index'))->assertInertia(fn (Assert $page) => $page
            ->has('rooms.data.0.images', 2)->where('rooms.data.0.images.0.url', $room->images[0]->publicUrl())
            ->missing('rooms.data.0.images.0.path')->where('photoLimits.count', 3));
    }

    public function test_multipart_update_can_remove_and_append_without_losing_other_photos_or_availability(): void
    {
        $room = $this->facility(['is_avail' => false]);
        $disk = Storage::disk('public');
        $disk->put('facilities/uploads/remove.jpg', 'photo');
        $disk->put('facilities/uploads/keep.jpg', 'photo');
        $remove = $room->images()->create(['path' => 'facilities/uploads/remove.jpg', 'display_order' => 0]);
        $keep = $room->images()->create(['path' => 'facilities/uploads/keep.jpg', 'display_order' => 1]);
        $this->post(route('admin.facilities.update', $room), $this->payload([
            '_method' => 'put', 'name' => 'Aula Senja', 'removed_image_ids' => [$remove->id],
            'images' => [$this->photo('new.jpg')],
        ]))->assertSessionHasNoErrors();
        $this->assertFalse($room->fresh()->is_avail);
        $this->assertSame('Aula Senja', $room->fresh()->name);
        $this->assertDatabaseMissing('room_images', ['id' => $remove->id]);
        $this->assertDatabaseHas('room_images', ['id' => $keep->id]);
        $disk->assertMissing('facilities/uploads/remove.jpg');
        $disk->assertExists('facilities/uploads/keep.jpg');
        $this->assertSame([1, 2], $room->images()->pluck('display_order')->all());
    }

    #[DataProvider('invalidFacilities')]
    public function test_invalid_facility_fields_cannot_write_database_or_files(array $overrides, string $field): void
    {
        $this->post(route('admin.facilities.store'), $this->payload($overrides))->assertSessionHasErrors($field);
        $room = $this->facility();
        $before = $room->fresh()->getAttributes();
        $this->put(route('admin.facilities.update', $room), $this->payload($overrides))->assertSessionHasErrors($field);
        $this->assertSame($before, $room->fresh()->getAttributes());
        $this->assertDatabaseCount('rooms', 1);
        $this->assertDatabaseCount('room_images', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public static function invalidFacilities(): array
    {
        return [
            'capacity text' => [['capacity' => 'banyak'], 'capacity'],
            'capacity decimal' => [['capacity' => '12.5'], 'capacity'],
            'capacity exponent' => [['capacity' => '1e3'], 'capacity'],
            'capacity negative' => [['capacity' => -1], 'capacity'],
            'capacity zero' => [['capacity' => 0], 'capacity'],
            'capacity too large' => [['capacity' => 100001], 'capacity'],
            'capacity array' => [['capacity' => [40]], 'capacity'],
            'blank name' => [['name' => '   '], 'name'],
            'long name' => [['name' => str_repeat('a', 101)], 'name'],
            'markup name' => [['name' => '<b>Aula</b>'], 'name'],
            'blank location' => [['location' => '   '], 'location'],
            'invalid type' => [['type' => 'Unknown'], 'type'],
            'long description' => [['desc' => str_repeat('a', 2001)], 'desc'],
            'images text' => [['images' => 'not a list'], 'images'],
        ];
    }

    public function test_forged_oversized_or_excessive_images_are_rejected(): void
    {
        foreach ([
            [UploadedFile::fake()->create('forged.jpg', 1, 'text/plain')],
            [$this->photo('large.jpg')->size(2049)],
            [$this->widePhoto()],
        ] as $images) {
            $this->post(route('admin.facilities.store'), $this->payload(['images' => $images]))->assertSessionHasErrors('images.0');
        }
        $images = array_map(fn ($index) => $this->photo($index.'.jpg'), range(1, 4));
        $this->post(route('admin.facilities.store'), $this->payload(['images' => $images]))->assertSessionHasErrors('images');
        $this->assertDatabaseCount('rooms', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_foreign_photo_ids_and_total_photo_limit_are_rejected(): void
    {
        $room = $this->facility();
        $other = $this->facility(['name' => 'Aula Lain']);
        $foreign = $other->images()->create(['path' => 'facilities/other.jpg']);
        $this->put(route('admin.facilities.update', $room), $this->payload(['removed_image_ids' => [$foreign->id]]))->assertSessionHasErrors('removed_image_ids.0');
        foreach (range(1, 3) as $index) {
            $room->images()->create(['path' => 'facilities/'.$index.'.jpg']);
        }
        $this->post(route('admin.facilities.update', $room), $this->payload(['_method' => 'put', 'images' => [$this->photo('new.jpg')]]))->assertSessionHasErrors('images');
        $this->assertDatabaseCount('room_images', 4);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_shared_seed_photos_are_retained_when_their_metadata_is_removed(): void
    {
        $room = $this->facility();
        $other = $this->facility(['name' => 'Aula Lain']);
        $path = 'facilities/db-photos/Aula/01.jpg';
        Storage::disk('public')->put($path, 'shared');
        $remove = $room->images()->create(['path' => $path]);
        $other->images()->create(['path' => $path]);
        $this->put(route('admin.facilities.update', $room), $this->payload(['removed_image_ids' => [$remove->id]]))->assertSessionHasNoErrors();
        Storage::disk('public')->assertExists($path);
        $this->assertDatabaseCount('room_images', 1);
    }

    public function test_duplicates_at_same_location_are_rejected_but_self_updates_and_other_locations_are_allowed(): void
    {
        $room = $this->facility();
        $this->post(route('admin.facilities.store'), $this->payload(['name' => ' Aula Baru ', 'location' => ' Benteng Senja ']))->assertSessionHasErrors('name');
        $this->put(route('admin.facilities.update', $room), $this->payload())->assertSessionHasNoErrors();
        $this->post(route('admin.facilities.store'), $this->payload(['location' => 'Menara Lain']))->assertSessionHasNoErrors();
        $this->assertDatabaseCount('rooms', 2);
    }

    public function test_storage_failure_rolls_back_metadata_and_cleans_up_partial_uploads(): void
    {
        $room = $this->facility();
        $disk = Storage::disk('public');
        $mock = Mockery::mock($disk);
        $calls = 0;
        $mock->shouldReceive('putFile')->twice()->andReturnUsing(function ($folder, $file) use ($disk, &$calls) {
            return ++$calls === 1 ? $disk->putFile($folder, $file) : false;
        });
        Storage::shouldReceive('disk')->with('public')->andReturn($mock);
        $this->post(route('admin.facilities.update', $room), $this->payload([
            '_method' => 'put', 'name' => 'Nama Tidak Boleh Tersimpan',
            'images' => [$this->photo('one.jpg'), $this->photo('two.jpg')],
        ]))->assertSessionHasErrors('images');
        $this->assertSame('Aula Baru', $room->fresh()->name);
        $this->assertDatabaseCount('room_images', 0);
        $this->assertSame([], $disk->allFiles());
    }

    public function test_non_admin_cannot_upload_photos(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'user']))
            ->post(route('admin.facilities.store'), $this->payload(['images' => [$this->photo()]]))->assertForbidden();
        $this->assertDatabaseCount('rooms', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }
}
