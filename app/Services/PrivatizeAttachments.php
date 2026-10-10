<?php

namespace App\Services;

use App\Models\Report;
use App\Models\ReportImage;
use App\Models\Reservation;
use App\Models\RoomImage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class PrivatizeAttachments
{
    public function migrate(): int
    {
        $public = Storage::disk('public');
        $private = Storage::disk('attachments');
        $paths = Reservation::whereNotNull('proposal_path')->pluck('proposal_path')
            ->merge(ReportImage::pluck('image'));
        if (Schema::hasColumn('reports', 'image')) {
            $paths = $paths->merge(Report::whereNotNull('image')->pluck('image'));
        }
        foreach (['proposals', 'reports', 'report-images'] as $directory) {
            $paths = $paths->merge($public->allFiles($directory));
        }
        $paths = $paths->filter()->unique()->values();
        // Preflight every path before any copy/removal; preserve public facility assets.
        foreach ($paths as $path) {
            if (preg_match('/[\\\\:\x00-\x1F\x7F]/', $path)
                || array_intersect(explode('/', $path), ['', '.', '..']) !== []
                || str_starts_with($path, 'facilities/') || RoomImage::where('path', $path)->exists()) {
                throw new RuntimeException('Attachment migration refused an unsafe or shared facility path.');
            }
        }

        $moved = 0;
        foreach ($paths as $path) {
            if (! $public->exists($path)) {
                continue;
            }
            if (! $private->exists($path)) {
                $stream = $public->readStream($path);
                if (! is_resource($stream)) {
                    throw new RuntimeException('Cannot read a public attachment.');
                }
                try {
                    $private->put($path, $stream);
                } finally {
                    fclose($stream);
                }
            }
            if ($public->size($path) !== $private->size($path)
                || $this->digest('public', $path) !== $this->digest('attachments', $path)) {
                throw new RuntimeException('Attachment verification failed; the public original has been preserved.');
            }
            if (! $public->delete($path)) {
                throw new RuntimeException('Cannot remove the verified public attachment copy.');
            }
            $moved++;
        }

        Reservation::whereNotNull('proposal_path')->each(function (Reservation $reservation) use ($private): void {
            $reservation->update(['attachment_bytes' => $private->exists($reservation->proposal_path) ? $private->size($reservation->proposal_path) : 0]);
        });
        Report::with('images')->each(function (Report $report) use ($private): void {
            $bytes = $report->images->sum(fn (ReportImage $image) => $private->exists($image->image) ? $private->size($image->image) : 0);
            $report->update(['attachment_bytes' => $bytes]);
        });

        return $moved;
    }

    private function digest(string $disk, string $path): string
    {
        $stream = Storage::disk($disk)->readStream($path);
        if (! is_resource($stream)) {
            throw new RuntimeException('Cannot verify attachment contents.');
        }
        try {
            $hash = hash_init('sha256');
            hash_update_stream($hash, $stream);

            return hash_final($hash);
        } finally {
            fclose($stream);
        }
    }
}
