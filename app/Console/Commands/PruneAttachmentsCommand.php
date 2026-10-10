<?php

namespace App\Console\Commands;

use App\Models\Report;
use App\Models\ReportImage;
use App\Models\Reservation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class PruneAttachmentsCommand extends Command
{
    protected $signature = 'attachments:prune {--days=30 : Minimum age of unreferenced files} {--dry-run : Count without deleting}';

    protected $description = 'Remove old private attachment files that have no remaining database reference';

    public function handle(): int
    {
        $days = filter_var($this->option('days'), FILTER_VALIDATE_INT);
        if ($days === false || $days < 1) {
            $this->error('The retention period must be at least one day.');

            return self::FAILURE;
        }
        $disk = Storage::disk('attachments');
        $cutoff = now()->subDays($days)->getTimestamp();
        $count = 0;
        foreach (['proposals', 'reports', 'report-images'] as $directory) {
            foreach ($disk->allFiles($directory) as $path) {
                if ($disk->lastModified($path) >= $cutoff
                    || Reservation::where('proposal_path', $path)->exists()
                    || ReportImage::where('image', $path)->exists()
                    || (Schema::hasColumn('reports', 'image') && Report::where('image', $path)->exists())) {
                    continue;
                }
                if ($this->option('dry-run') || $disk->delete($path)) {
                    $count++;
                }
            }
        }
        $this->info($count.' old unreferenced attachments '.($this->option('dry-run') ? 'eligible for removal.' : 'removed.'));

        return self::SUCCESS;
    }
}
