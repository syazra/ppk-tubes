<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Reservation;
use App\Models\Report;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduler untuk mengecek dan menambah 1 hari pada laporan yang melewati estimasi
Schedule::call(function () {
    Report::where('status', 'diproses')
        ->where('estimated_completion_at', '<', Carbon::now())
        ->chunkById(100, function ($reports) {
            foreach ($reports as $report) {
                // Otomatis tambah 1 hari jika lewat estimasi
                $newEstimate = Carbon::parse($report->estimated_completion_at)->addDay();
                $report->update(['estimated_completion_at' => $newEstimate]);

                Reservation::where('room_id', $report->room_id)
                    ->whereIn('status', ['menunggu', 'disetujui'])
                    ->where('date_to_reserv', '<=', $newEstimate)
                    ->update(['status' => 'ditolak']);
            }
        });
})->everyMinute();