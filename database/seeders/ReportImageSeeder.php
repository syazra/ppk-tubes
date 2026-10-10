<?php

namespace Database\Seeders;

use App\Models\Report;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ReportImageSeeder extends Seeder
{
    public function run(): void
    {
        $source = database_path('seeders/photos/bukti.jpg');

        if (! file_exists($source)) {
            throw new RuntimeException("File tidak ditemukan: {$source}");
        }

        // Salin foto ke storage/app/public/report-images/
        $path = 'report-images/bukti.jpg';
        Storage::disk('public')->put($path, file_get_contents($source));

        $now = now(config('app.timezone'));

        Report::orderBy('id')->each(function (Report $report) use ($path, $now): void {
            // Aman dijalankan berulang: tidak membuat baris dobel
            $exists = DB::table('report_images')
                ->where('report_id', $report->id)
                ->where('image', $path)
                ->exists();

            if (! $exists) {
                DB::table('report_images')->insert([
                    'report_id' => $report->id,
                    'image' => $path,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });
    }
}