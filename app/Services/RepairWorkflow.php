<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RepairWorkflow
{
    public function process(int $id, string $estimate): void
    {
        $this->withReport($id, function (Report $report, Room $room) use ($estimate): void {
            $this->requireStatus($report, 'baru');
            $report->update(['status' => 'diproses', 'estimated_completion_at' => $estimate,
                'resolution' => null, 'rejection_reason' => null]);
            $room->syncAvailability();
            $this->rejectDuringRepair($room->id, $estimate);
        });
    }

    public function complete(int $id, string $resolution): void
    {
        $this->withReport($id, function (Report $report, Room $room) use ($resolution): void {
            $this->requireStatus($report, 'diproses');
            $report->update(['status' => 'selesai', 'resolution' => $resolution, 'rejection_reason' => null]);
            $room->syncAvailability();
        });
    }

    public function reject(int $id, string $reason): void
    {
        $this->withReport($id, function (Report $report) use ($reason): void {
            $this->requireStatus($report, 'baru');
            $report->update(['status' => 'ditolak', 'rejection_reason' => $reason, 'resolution' => null]);
        });
    }

    public function extend(int $id, string $estimate): void
    {
        $this->withReport($id, function (Report $report, Room $room) use ($estimate): void {
            $this->requireStatus($report, 'diproses');
            if (CarbonImmutable::parse($estimate)->lte(CarbonImmutable::parse($report->estimated_completion_at))) {
                throw ValidationException::withMessages(['estimated_completion_at' => 'Estimasi baru harus setelah estimasi sebelumnya.']);
            }
            $report->update(['estimated_completion_at' => $estimate]);
            $this->rejectDuringRepair($room->id, $estimate);
        });
    }

    public function extendOverdue(): void
    {
        Report::where('status', 'diproses')->where('estimated_completion_at', '<=', now())
            ->chunkById(100, function ($reports): void {
                foreach ($reports as $candidate) {
                    $this->withReport($candidate->id, function (Report $report, Room $room): void {
                        if ($report->status !== 'diproses' || CarbonImmutable::parse($report->estimated_completion_at)->isFuture()) {
                            return;
                        }
                        $estimate = CarbonImmutable::parse($report->estimated_completion_at);
                        do {
                            $estimate = $estimate->addDay();
                        } while ($estimate->lte(now()));
                        $report->update(['estimated_completion_at' => $estimate]);
                        $room->syncAvailability();
                        $this->rejectDuringRepair($room->id, $estimate->toDateTimeString());
                    });
                }
            });
    }

    private function withReport(int $id, Closure $action): void
    {
        $candidate = Report::findOrFail($id);
        DB::transaction(function () use ($id, $candidate, $action): void {
            $room = Room::query()->lockForUpdate()->findOrFail($candidate->room_id);
            $report = Report::query()->lockForUpdate()->findOrFail($id);
            $action($report, $room);
        }, 3);
    }

    private function requireStatus(Report $report, string $status): void
    {
        if ($report->status !== $status) {
            throw ValidationException::withMessages(['report' => 'Status laporan telah berubah. Muat ulang halaman sebelum melanjutkan.']);
        }
    }

    // The caller holds the room lock shared with reservation creation/approval.
    private function rejectDuringRepair(int $roomId, string $estimate): void
    {
        $end = CarbonImmutable::parse($estimate, config('app.timezone'));
        $now = CarbonImmutable::now(config('app.timezone'));
        Reservation::where('room_id', $roomId)->whereIn('status', ['menunggu', 'disetujui'])
            ->where(function ($query) use ($end): void {
                $query->where('date_to_reserv', '<', $end->toDateString())
                    ->orWhere(fn ($query) => $query->where('date_to_reserv', $end->toDateString())->where('start_time', '<', $end->format('H:i:s')));
            })
            ->where(function ($query) use ($now): void {
                $query->where('date_to_reserv', '>', $now->toDateString())
                    ->orWhere(fn ($query) => $query->where('date_to_reserv', $now->toDateString())->where('end_time', '>', $now->format('H:i:s')));
            })
            ->update(['status' => 'ditolak', 'rejection_reason' => 'Fasilitas sedang dalam perbaikan']);
    }
}
