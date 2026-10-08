<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Report;

class OperatorController extends Controller
{
    /**
     * Menampilkan daftar reservasi user (kode lama tetap)
     */
    public function index()
    {
        $reservations = Reservation::with('room')
            ->latest()
            ->get();

        return view('operator.reservations', compact('reservations'));
    }

    public function approve($id)
{
    $reservation = Reservation::findOrFail($id);


    // Setujui reservasi yang dipilih
    $reservation->update([
        'status' => 'disetujui'
    ]);


    // Tolak reservasi lain yang bentrok
    Reservation::where('room_id', $reservation->room_id)
        ->where('date_to_reserv', $reservation->date_to_reserv)
        ->where('id', '!=', $reservation->id)
        ->where('status', 'menunggu')
        ->where(function($query) use ($reservation){

            $query->where(
                'start_time',
                '<',
                $reservation->end_time
            )
            ->where(
                'end_time',
                '>',
                $reservation->start_time
            );

        })
        ->update([
            'status' => 'ditolak'
        ]);


    return redirect()
        ->route('operator.reservations')
        ->with('success', 'Reservasi disetujui.');
}

    public function reject($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->status = 'ditolak';
        $reservation->save();

        return redirect()->route('operator.reservations')->with('success', 'Reservasi ditolak.');
    }

    /**
     * ==========================================
     * MANAJEMEN LAPORAN OLEH OPERATOR (DISESUAIKAN)
     * ==========================================
     */

    // 1. Operator menandai laporan "diproses" dan input estimasi waktu selesai
    public function setProcess(Request $request, $id)
    {
        $request->validate([
            'estimated_completion_at' => 'required|date|after:now',
        ], [
            'estimated_completion_at.required' => 'Waktu estimasi selesai wajib diisi.',
            'estimated_completion_at.after' => 'Waktu estimasi harus berada di masa depan.',
        ]);

        $report = Report::findOrFail($id);
        $report->status = 'diproses'; // Status berubah diproses
        $report->estimated_completion_at = $request->estimated_completion_at; // Masuk ke kolom database ini

        // Karena diproses, pastikan rejection_reason & resolution dibersihkan
        $report->rejection_reason = null;
        $report->resolution = null;
        $report->save();

        // Opsional: Ruangan jadi tidak tersedia sementara
        $report->room()->update(['is_avail' => false]);

        Reservation::where('room_id', $report->room_id)
            ->whereIn('status', ['menunggu', 'disetujui'])
            ->where('date_to_reserv', '<=', $request->estimated_completion_at)
            ->update(['status' => 'ditolak']);

        return back()->with('success', 'Laporan diproses, estimasi disimpan, dan reservasi terkait otomatis ditolak.');
    }

    // 2. Operator menandai laporan "selesai" (Fasilitas langsung dibuka kembali)
    public function markAsCompleted(Request $request, $id)
    {
        // Validasi wajib isi resolusi
        $request->validate([
            'resolution' => 'nullable|string|max:1000',
        ], [
            'resolution.max' => 'Resolusi/catatan perbaikan maksimal 1000 karakter.',
        ]);

        $report = Report::findOrFail($id);
        $resolutionText = $request->input('resolution') ?: 'Fasilitas sudah diperbaiki';
        $report->status = 'selesai';
        $report->resolution = $resolutionText;
        $report->rejection_reason = null;
        $report->save();

        // Buka kembali fasilitas secara otomatis
        $report->room()->update(['is_avail' => true]);

        return back()->with('success', 'Laporan diselesaikan dan fasilitas langsung dibuka kembali.');
    }

    // 3. Operator memperpanjang waktu estimasi jika perbaikan lebih lama dari perkiraan
    public function extendEstimate(Request $request, $id)
    {
        $request->validate([
            'estimated_completion_at' => 'required|date|after:now',
        ]);

        $report = Report::findOrFail($id);
        
        // Pastikan statusnya masih 'diproses'
        if ($report->status !== 'diproses') {
            return back()->with('error', 'Hanya laporan yang sedang diproses yang dapat diperpanjang estimasinya.');
        }

        $report->estimated_completion_at = $request->estimated_completion_at;
        $report->save();

        // Opsional: Jika waktu diperpanjang, tolak juga reservasi baru yang masuk pada rentang waktu perpanjangan tersebut
        Reservation::where('room_id', $report->room_id)
            ->whereIn('status', ['menunggu', 'disetujui'])
            ->where('date_to_reserv', '<=', $request->estimated_completion_at)
            ->update(['status' => 'ditolak']);

        return back()->with('success', 'Waktu estimasi perbaikan berhasil diperpanjang.');
    }

    public function rejectReport(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $report = Report::findOrFail($id);
        // Jika operator mengetik manual pakai input, ambil itu. Kalau kosong, pakai template default.
        $reason = $request->input('rejection_reason') ?: 'Laporan tidak valid / Deskripsi kerusakan kurang jelas';
        $report->status = 'ditolak';
        $report->rejection_reason = $reason; // Simpan alasan penolakan
        $report->resolution = null;          // Kosongkan resolusi (XOR)
        $report->save();

        return back()->with('success', 'Report ditolak.');
    }
}