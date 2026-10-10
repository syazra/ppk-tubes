<?php

namespace App\Http\Controllers;

use App\Models\ReportImage;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    public function proposal(Request $request, Reservation $reservation): StreamedResponse
    {
        $this->authorizeOwner($request, $reservation->user_id);

        return $this->download($reservation->proposal_path, 'proposal-'.$reservation->id.'.pdf');
    }

    public function reportImage(Request $request, ReportImage $image): StreamedResponse
    {
        $this->authorizeOwner($request, $image->report->user_id);

        return $this->download($image->image, 'report-photo-'.$image->id.'.'.pathinfo($image->image, PATHINFO_EXTENSION));
    }

    private function authorizeOwner(Request $request, int $ownerId): void
    {
        abort_unless($request->user()->id === $ownerId || $request->user()->hasRole('admin', 'operator'), 403);
    }

    private function download(?string $path, string $name): StreamedResponse
    {
        // Legacy relative names are supported, but never absolute/traversal paths.
        abort_if($path === null || $path === '' || preg_match('/[\\\\:\x00-\x1F\x7F]/', $path)
            || array_intersect(explode('/', $path), ['', '.', '..']) !== [], 404);
        $disk = Storage::disk('attachments');
        abort_unless($disk->exists($path), 404);

        return $disk->download($path, $name, [
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
