<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use App\Services\RepairWorkflow;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OperatorController extends Controller
{
    public function approve(int $id): RedirectResponse
    {
        $candidate = Reservation::findOrFail($id);
        DB::transaction(function () use ($id, $candidate): void {
            $room = Room::query()->lockForUpdate()->findOrFail($candidate->room_id);
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($id);
            $start = CarbonImmutable::parse($reservation->date_to_reserv.' '.$reservation->start_time, config('app.timezone'));
            if ($reservation->status !== 'menunggu' || ! $room->is_avail || $room->is_admin_disabled
                || $room->reports()->where('status', 'diproses')->exists() || $start->lte(now())) {
                throw ValidationException::withMessages(['reservation' => 'Reservasi tidak dapat disetujui. Periksa status, waktu, dan ketersediaan fasilitas.']);
            }
            $overlaps = Reservation::where('room_id', $room->id)->where('date_to_reserv', $reservation->date_to_reserv)
                ->where('id', '!=', $id)->whereTime('start_time', '<', $reservation->end_time)
                ->whereTime('end_time', '>', $reservation->start_time);
            if ((clone $overlaps)->where('status', 'disetujui')->exists()) {
                throw ValidationException::withMessages(['reservation' => 'Waktu tersebut sudah digunakan oleh reservasi yang disetujui.']);
            }
            $reservation->status = 'disetujui';
            $reservation->rejection_reason = null;
            $reservation->save();
            $overlaps->where('status', 'menunggu')->update(['status' => 'ditolak', 'rejection_reason' => 'Fasilitas sudah dipinjam']);
        }, 3);

        return redirect()->route('operator.reservations')->with('success', 'Reservasi disetujui.');
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate(['rejection_reason' => ['nullable', 'string', 'max:1000']]);
        $candidate = Reservation::findOrFail($id);
        DB::transaction(function () use ($id, $candidate, $validated): void {
            Room::query()->lockForUpdate()->findOrFail($candidate->room_id);
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($id);
            if (! in_array($reservation->status, ['menunggu', 'disetujui'], true)) {
                throw ValidationException::withMessages(['reservation' => 'Reservasi telah diproses. Muat ulang halaman.']);
            }
            if ($reservation->status === 'disetujui' && empty($validated['rejection_reason'])) {
                throw ValidationException::withMessages(['rejection_reason' => 'Alasan pembatalan reservasi yang disetujui wajib diisi.']);
            }
            $reservation->status = 'ditolak';
            $reservation->rejection_reason = $validated['rejection_reason'] ?? 'Ditolak oleh operator';
            $reservation->save();
        }, 3);

        return redirect()->route('operator.reservations')->with('success', 'Reservasi ditolak.');
    }

    public function setProcess(Request $request, int $id, RepairWorkflow $workflow): RedirectResponse
    {
        $validated = $request->validate(['estimated_completion_at' => ['required', 'date', 'after:now']]);
        $workflow->process($id, $validated['estimated_completion_at']);

        return back()->with('success', 'Laporan diproses, estimasi disimpan, dan reservasi terkait otomatis ditolak.');
    }

    public function markAsCompleted(Request $request, int $id, RepairWorkflow $workflow): RedirectResponse
    {
        $validated = $request->validate(['resolution' => ['nullable', 'string', 'max:1000']]);
        $workflow->complete($id, ($validated['resolution'] ?? null) ?: 'Fasilitas sudah diperbaiki');

        return back()->with('success', 'Laporan diselesaikan. Fasilitas dibuka jika tidak ada perbaikan atau penonaktifan lain.');
    }

    public function extendEstimate(Request $request, int $id, RepairWorkflow $workflow): RedirectResponse
    {
        $validated = $request->validate(['estimated_completion_at' => ['required', 'date', 'after:now']]);
        $workflow->extend($id, $validated['estimated_completion_at']);

        return back()->with('success', 'Waktu estimasi perbaikan berhasil diperpanjang.');
    }

    public function rejectReport(Request $request, int $id, RepairWorkflow $workflow): RedirectResponse
    {
        $validated = $request->validate(['rejection_reason' => ['nullable', 'string', 'max:1000']]);
        $workflow->reject($id, ($validated['rejection_reason'] ?? null) ?: 'Laporan tidak valid / Deskripsi kerusakan kurang jelas');

        return back()->with('success', 'Report ditolak.');
    }
}
