<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Report;
use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', Rule::in(['mahasiswa', 'dosen', 'staf', 'petugas'])],
        ]);

        $accounts = User::query()
            ->whereIn('role', ['user', 'operator'])
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('account_type', $type))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('identity_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'identity_number' => $user->identity_number,
                'email' => $user->email,
                'account_type' => $user->account_type,
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Registrations', [
            'admin' => $request->user()->only('name', 'email'),
            'csrfToken' => csrf_token(),
            'createdAccount' => $request->session()->pull('createdAccount'),
            'status' => $request->session()->get('status'),
            'accounts' => $accounts,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'type' => $filters['type'] ?? '',
            ],
            'urls' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'registrationStore' => route('admin.registrations.store'),
                'accounts' => route('admin.registrations.index'),
                'profile' => route('profile.edit'),
                'guest' => route('guest.dashboard'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:50', 'unique:users,identity_number'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'account_type' => ['required', Rule::in(['mahasiswa', 'dosen', 'staf', 'petugas'])],
        ]);

        $password = Str::password(16, symbols: false);
        $role = $validated['account_type'] === 'petugas' ? 'operator' : 'user';

        $user = User::create([
            ...$validated,
            'role' => $role,
            'password' => $password,
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        return redirect()->route('admin.registrations.index')->with('createdAccount', [
            'name' => $user->name,
            'identity_number' => $user->identity_number,
            'email' => $user->email,
            'account_type' => $user->account_type,
            'password' => $password,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->ensureManagedAccount($user);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:50', Rule::unique('users', 'identity_number')->ignore($user->id)],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'account_type' => ['required', Rule::in(['mahasiswa', 'dosen', 'staf', 'petugas'])],
        ]);

        $user->fill([
            ...$validated,
            'role' => $validated['account_type'] === 'petugas' ? 'operator' : 'user',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        return back()->with('status', 'Data akun berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->ensureManagedAccount($user);

        $hasReservations = Schema::hasTable('reservations') && Reservation::where('user_id', $user->id)->exists();
        $hasReports = Schema::hasTable('reports') && Report::where('user_id', $user->id)->exists();

        if ($hasReservations || $hasReports) {
            return back()->withErrors([
                'delete' => 'Akun memiliki data reservasi atau laporan. Hapus atau pindahkan data tersebut sebelum menghapus akun.',
            ]);
        }

        $user->delete();

        return back()->with('status', 'Akun berhasil dihapus.');
    }

    private function ensureManagedAccount(User $user): void
    {
        abort_unless(in_array($user->role, ['user', 'operator'], true), 404);
    }

}
