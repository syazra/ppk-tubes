<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FacilityRequest;
use App\Models\Room;
use App\Models\RoomImage;
use App\Services\FacilityImages;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FacilityController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'availability' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $rooms = Room::query()
            ->with('images')
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            }))
            ->when($filters['availability'] ?? null, fn ($query, $availability) => $query->where('is_avail', $availability === 'active'))
            ->orderBy('location')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Room $room): array => [
                ...$room->only(['id', 'name', 'location', 'type', 'capacity', 'desc', 'is_avail']),
                'images' => $room->images->map(fn (RoomImage $image): array => [
                    'id' => $image->id,
                    'url' => $image->publicUrl(),
                    'alt_text' => $image->alt_text ?? 'Foto '.$room->name,
                ])->all(),
            ]);

        return Inertia::render('Admin/Facilities', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'csrfToken' => csrf_token(),
            'status' => $request->session()->get('status'),
            'rooms' => $rooms,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'availability' => $filters['availability'] ?? '',
            ],
            'types' => FacilityRequest::TYPES,
            'photoLimits' => ['count' => FacilityRequest::MAX_PHOTOS, 'sizeBytes' => FacilityRequest::MAX_PHOTO_KB * 1024],
            'capacityMax' => FacilityRequest::MAX_CAPACITY,
            'urls' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'facilities' => route('admin.facilities.index'),
                'recap' => route('admin.facilities.recap'),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function store(FacilityRequest $request, FacilityImages $images): RedirectResponse
    {
        $images->save(new Room, $request->safe()->except(['images', 'removed_image_ids']) + ['is_avail' => true], $request->file('images', []), []);

        return redirect()->route('admin.facilities.index')->with('status', 'Fasilitas berhasil ditambahkan.');
    }

    public function update(FacilityRequest $request, Room $room, FacilityImages $images): RedirectResponse
    {
        $images->save($room, $request->safe()->except(['images', 'removed_image_ids']), $request->file('images', []), $request->validated('removed_image_ids', []));

        return back()->with('status', 'Fasilitas berhasil diperbarui.');
    }

    public function availability(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate(['is_avail' => ['required', 'boolean']]);
        $room->update(['is_avail' => $validated['is_avail']]);

        return back()->with('status', $room->is_avail ? 'Fasilitas diaktifkan.' : 'Fasilitas dinonaktifkan.');
    }
}
