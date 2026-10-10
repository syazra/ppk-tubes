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

        // Report evidence is private, including demo images.
        $path = 'report-images/bukti.jpg';
        $contents = file_get_contents($source);
        if ($contents === false) {
            throw new RuntimeException('Cannot read the demo report image.');
        }
        Storage::disk('attachments')->put($path, $contents);

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
