<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\ReportImage;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OperatorReportImagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_operator_reports_page_includes_report_images_data(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $user = User::factory()->create(['role' => 'user']);
        $room = Room::create([
            'name' => 'Lab Komputer 1',
            'location' => 'Gedung A',
            'type' => 'Laboratorium',
            'capacity' => 30,
            'is_avail' => true,
        ]);

        $report = Report::create([
            'user_id' => $user->id,
            'room_id' => $room->id,
            'desc' => 'Laporan fasilitas rusak',
            'status' => 'baru',
        ]);

        ReportImage::create([
            'report_id' => $report->id,
            'image' => 'reports/foto1.jpg',
        ]);

        ReportImage::create([
            'report_id' => $report->id,
            'image' => 'reports/foto2.jpg',
        ]);

        $this->actingAs($operator)
            ->get(route('operator.reports'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Operator/Reports')
                ->has('reports.data', 1)
                ->has('reports.data.0.images', 2)
                ->where('reports.data.0.images.0.image', 'reports/foto1.jpg')
                ->where('reports.data.0.images.1.image', 'reports/foto2.jpg')
            );
    }
}
