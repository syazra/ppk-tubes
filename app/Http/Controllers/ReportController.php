<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room; // Panggil model Room
use App\Models\Report; // Panggil model Report untuk menyimpan data
use Illuminate\Support\Facades\Auth; // Untuk mendeteksi user yang sedang login
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    public function create()
    {
        // Ambil semua data ruangan dari database[cite: 1]
        $rooms = Room::where('is_avail', true)->get();
        
        // Kirim data ruangan ke view
        return view('user.report-form', compact('rooms'));
    }

    public function store(Request $request)
    {
        // Validasi input dari form dengan pesan kustom bahasa Indonesia
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'desc'    => 'required|string',
            'image'   => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', 
        ], [
            // Pesan error kustom
            'room_id.required' => 'Silakan pilih fasilitas atau ruangan terlebih dahulu.',
            'room_id.exists'   => 'Fasilitas yang dipilih tidak valid.',
            'desc.required'    => 'Deskripsi kerusakan wajib diisi.',
            'desc.string'      => 'Deskripsi kerusakan harus berupa teks.',
            'image.required'   => 'Bukti kerusakan (foto) wajib dilampirkan.',
            'image.image'      => 'File yang diunggah harus berupa file gambar.',
            'image.mimes'      => 'Format foto harus berjenis jpeg, png, jpg, atau gif.',
            'image.max'        => 'Ukuran foto maksimal adalah 2MB.',
        ]);

        $imagePath = null;

        // Cek apakah user mengupload foto bukti kerusakan
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('reports', 'public');
        }

        // Simpan data laporan ke database
        Report::create([
            'user_id' => Auth::id(),             // Mengambil ID user yang sedang login
            'room_id' => $request->room_id,      // Pilihan ruangan dari form
            'desc'    => $request->desc,         // Deskripsi kerusakan
            'image'   => $imagePath,             // Path foto di storage (jika ada)
            'status'  => 'menunggu',             // Status awal laporan
        ]);

        // Redirect kembali ke halaman form dengan pesan sukses
        return redirect()->route('reports.index')->with('success', 'Laporan kerusakan berhasil dikirim dan masuk ke daftar riwayat.');
    }

    public function index()
    {
        $reports = Report::with('room')
                    ->where('user_id', Auth::id())
                    ->oldest()
                    ->get();

        return view('user.my-reports', compact('reports'));
    }

    public function cancel(Report $report)
    {
        // Validasi: pastikan milik user yang login dan statusnya masih 'menunggu'
        if ($report->user_id !== auth()->id() || $report->status !== 'menunggu') {
            return redirect()->route('reports.index')->with('error', 'Laporan tidak dapat dibatalkan.');
        }

        // Ubah status menjadi 'dibatalkan' tanpa menghapus data
        $report->update([
            'status' => 'dibatalkan'
        ]);

        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dibatalkan.');
    }
}
