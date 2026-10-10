<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AttachmentQuota
{
    // The user lock serializes uploads across rooms and both resource types.
    public function check(int $userId, string $resource, int $bytes): void
    {
        User::query()->lockForUpdate()->findOrFail($userId);
        $reservations = Reservation::where('user_id', $userId);
        $reports = Report::where('user_id', $userId);
        $count = $resource === 'reservations' ? $reservations->count() : $reports->count();
        $usedBytes = (int) $reservations->sum('attachment_bytes') + (int) $reports->sum('attachment_bytes');

        if ($count >= config('attachments.max_'.$resource) || $usedBytes + $bytes > config('attachments.max_user_bytes')) {
            throw ValidationException::withMessages([
                'quota' => 'Batas penyimpanan akun tercapai. Hubungi administrator untuk pengarsipan data.',
            ]);
        }
    }
}
