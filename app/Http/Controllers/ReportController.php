<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Room;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function create()
    {
        $rooms = Room::where('is_avail', true)
            ->get(['id', 'name', 'location', 'type']);

        return Inertia::render('User/ReportForm', [
            'rooms' => $rooms,
            'csrfToken' => csrf_token(),
            'urls' => [
                'dashboard' => route('user.dashboard'),
                'reports' => route('reports.index'),
                'reservations' => route('reservations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'desc' => 'required|string',
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpg,jpeg,png|max:2048',
        ], [
            'room_id.required' => 'Silakan pilih fasilitas atau ruangan terlebih dahulu.',
            'room_id.exists' => 'Fasilitas yang dipilih tidak valid.',
            'desc.required' => 'Deskripsi kerusakan wajib diisi.',
            'desc.string' => 'Deskripsi kerusakan harus berupa teks.',
            'images.required' => 'Bukti kerusakan (foto) wajib dilampirkan.',
            'images.*.image' => 'File yang diunggah harus berupa file gambar.',
            'images.*.mimes' => 'Format foto harus berjenis jpeg, png, atau jpg.',
            'images.*.max' => 'Ukuran setiap foto maksimal adalah 2MB.',
        ]);

        // Simpan laporan utama
        $report = Report::create([
            'user_id' => Auth::id(),
            'room_id' => $request->room_id,
            'desc' => $request->desc,
            'status' => 'baru',
        ]);

        // Simpan semua foto
        foreach ($request->file('images') as $image) {
            $imagePath = $image->store('reports', 'public');

            $report->images()->create([
                'image' => $imagePath,
            ]);
        }

        return redirect()
            ->route('reports.index')
            ->with('success', 'Laporan kerusakan berhasil dikirim dan masuk ke daftar riwayat.');
    }

    public function index()
    {
        $reports = Report::with(['room', 'images'])
                    ->where('user_id', Auth::id())
                    ->latest()
                    ->get();

        return Inertia::render('User/MyReports', [
            'reports' => $reports,
            'csrfToken' => csrf_token(),
            'error' => session('error'),
            'urls' => [
                'dashboard' => route('user.dashboard'),
                'reports' => route('reports.index'),
                'reservations' => route('reservations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function cancel(Report $report)
    {
        // Validasi: pastikan milik user yang login dan statusnya masih 'baru'
        if ($report->user_id !== auth()->id() || $report->status !== 'baru') {
            return redirect()->route('reports.index')->with('error', 'Laporan tidak dapat dibatalkan.');
        }

        // Ubah status menjadi 'dibatalkan' tanpa menghapus data
        $report->update([
            'status' => 'dibatalkan'
        ]);

        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dibatalkan.');
    }
}
