<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Room;
use App\Services\AttachmentQuota;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ReportController extends Controller
{
    public function create(): Response
    {
        $rooms = Room::where('is_avail', true)
            ->get(['id', 'name', 'location', 'type']);

        return Inertia::render('User/ReportForm', [
            'rooms' => $rooms,
            'csrfToken' => csrf_token(),
            'urls' => [
                'dashboard' => route('user.dashboard'),
                'catalog' => route('user.catalog'),
                'reports' => route('reports.index'),
                'reservations' => route('reservations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'desc' => 'required|string|max:5000',
            'images' => 'required|array|min:1|max:3',
            'images.*' => 'required|image|mimes:jpg,jpeg,png|max:2048|dimensions:max_width=6000,max_height=6000',
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
        $totalSize = collect($request->file('images', []))
            ->sum(fn ($image) => $image->getSize());

        if ($totalSize > 5 * 1024 * 1024) {
            return back()->withErrors([
                'images' => 'Total ukuran semua foto tidak boleh lebih dari 5 MB.',
            ])->withInput();
        }

        $stored = [];
        try {
            foreach ($request->file('images') as $image) {
                $stored[] = $image->store('reports', 'attachments');
            }
            DB::transaction(function () use ($request, $stored, $totalSize): void {
                app(AttachmentQuota::class)->check($request->user()->id, 'reports', $totalSize);
                Room::query()->lockForUpdate()->findOrFail($request->integer('room_id'));
                $report = Report::create([
                    'user_id' => Auth::id(), 'room_id' => $request->integer('room_id'),
                    'desc' => $request->string('desc')->toString(), 'status' => 'baru', 'attachment_bytes' => $totalSize,
                ]);
                foreach ($stored as $path) {
                    $report->images()->create(['image' => $path]);
                }
            }, 3);
        } catch (Throwable $exception) {
            Storage::disk('attachments')->delete($stored);
            throw $exception;
        }

        return redirect()
            ->route('reports.index')
            ->with('success', 'Laporan kerusakan berhasil dikirim dan masuk ke daftar riwayat.');
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['baru', 'diproses', 'selesai', 'ditolak', 'dibatalkan'])],
            'sort' => ['nullable', Rule::in(['created_near', 'created_far'])],
        ]);
        $reports = Report::with(['room', 'images'])
            ->where('user_id', Auth::id())
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($query) use ($search): void {
                $query->where('desc', 'like', '%'.$search.'%')
                    ->orWhereHas('room', fn ($room) => $room->where('name', 'like', '%'.$search.'%')->orWhere('location', 'like', '%'.$search.'%'));
            }))
            ->orderBy('created_at', ($filters['sort'] ?? '') === 'created_far' ? 'asc' : 'desc')
            ->orderByDesc('id')->paginate(10)->withQueryString();

        return Inertia::render('User/MyReports', [
            'reports' => $reports,
            'filters' => $filters,
            'csrfToken' => csrf_token(),
            'error' => session('error'),
            'urls' => [
                'dashboard' => route('user.dashboard'),
                'catalog' => route('user.catalog'),
                'reports' => route('reports.index'),
                'reservations' => route('reservations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function cancel(Report $report): RedirectResponse
    {
        // Validasi: pastikan milik user yang login dan statusnya masih 'baru'
        if ($report->user_id !== auth()->id() || $report->status !== 'baru') {
            return redirect()->route('reports.index')->with('error', 'Laporan tidak dapat dibatalkan.');
        }

        $cancelled = DB::transaction(function () use ($report): bool {
            Room::query()->lockForUpdate()->findOrFail($report->room_id);
            $locked = Report::query()->lockForUpdate()->findOrFail($report->id);
            if ($locked->user_id !== Auth::id() || $locked->status !== 'baru') {
                return false;
            }
            $locked->update(['status' => 'dibatalkan']);

            return true;
        }, 3);
        if (! $cancelled) {
            return back()->with('error', 'Status laporan telah berubah. Muat ulang halaman.');
        }

        return redirect()->route('reports.index')->with('success', 'Laporan berhasil dibatalkan.');
    }
}
