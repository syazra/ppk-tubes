<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReportImagesCompatibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_photo_is_preserved_and_multiple_photo_uploads_work_after_upgrade(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('image');
        });
        $user = User::factory()->create();
        $room = $this->room();
        $reportId = DB::table('reports')->insertGetId([
            'user_id' => $user->id,
            'room_id' => $room->id,
            'desc' => 'Laporan lama',
            'status' => 'baru',
            'image' => 'reports/old.jpg',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('report_images')->insert([
            'report_id' => $reportId,
            'image' => 'reports/side.jpg',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $migration = require database_path('migrations/2026_10_09_003355_preserve_legacy_report_images.php');
        $migration->up();
        $migration->up();

        $this->assertSame('reports/old.jpg', DB::table('reports')->where('id', $reportId)->value('image'));
        $this->assertSame(2, Report::findOrFail($reportId)->images()->count());
        $this->assertDatabaseHas('report_images', ['report_id' => $reportId, 'image' => 'reports/old.jpg']);
        $this->assertDatabaseHas('report_images', ['report_id' => $reportId, 'image' => 'reports/side.jpg']);
        $this->uploadPhotos($user, $room);
        $this->assertNull(DB::table('reports')->where('desc', 'Laporan baru')->value('image'));
    }

    public function test_multiple_photo_uploads_work_on_a_fresh_database(): void
    {
        $this->assertFalse(Schema::hasColumn('reports', 'image'));
        $this->uploadPhotos(User::factory()->create(), $this->room());
    }

    private function uploadPhotos(User $user, Room $room): void
    {
        Storage::fake('public');
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==');
        $this->actingAs($user)->post(route('reports.store'), [
            'room_id' => $room->id,
            'desc' => 'Laporan baru',
            'images' => [
                UploadedFile::fake()->createWithContent('first.png', $png),
                UploadedFile::fake()->createWithContent('second.png', $png),
            ],
        ])->assertSessionHasNoErrors()->assertRedirect(route('reports.index'));

        $report = Report::where('desc', 'Laporan baru')->firstOrFail();
        $this->assertCount(2, $report->images);
        foreach ($report->images as $image) {
            Storage::disk('public')->assertExists($image->image);
        }
    }

    private function room(): Room
    {
        return Room::create([
            'name' => 'Ruang Uji',
            'location' => 'Gedung A',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true,
        ]);
    }
}
