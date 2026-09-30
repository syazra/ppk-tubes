<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    private const TYPES = ['Ruang Kelas', 'Aula', 'Laboratorium', 'Lapangan'];

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'availability' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $rooms = Room::query()
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            }))
            ->when($filters['availability'] ?? null, fn ($query, $availability) => $query->where('is_avail', $availability === 'active'))
            ->orderBy('location')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Facilities', [
            'admin' => $request->user()->only('name', 'email'),
            'csrfToken' => csrf_token(),
            'status' => $request->session()->get('status'),
            'rooms' => $rooms,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'availability' => $filters['availability'] ?? '',
            ],
            'types' => self::TYPES,
            'urls' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'facilities' => route('admin.facilities.index'),
                'recap' => route('admin.facilities.recap'),
                'profile' => route('profile.edit'),
                'guest' => route('guest.dashboard'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Room::create($request->validate($this->rules()) + ['is_avail' => true]);

        return redirect()->route('admin.facilities.index')->with('status', 'Fasilitas berhasil ditambahkan.');
    }

    public function update(Request $request, Room $room): RedirectResponse
    {
        $room->update($request->validate($this->rules()));

        return back()->with('status', 'Fasilitas berhasil diperbarui.');
    }

    public function availability(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate(['is_avail' => ['required', 'boolean']]);
        $room->update(['is_avail' => $validated['is_avail']]);

        return back()->with('status', $room->is_avail ? 'Fasilitas diaktifkan.' : 'Fasilitas dinonaktifkan.');
    }

    /** @return array<string, array<int, mixed>> */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:100'],
            'type' => ['required', Rule::in(self::TYPES)],
            'capacity' => ['required', 'integer', 'min:1', 'max:100000'],
            'desc' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
