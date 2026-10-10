<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $navigationUrls = match ($user->role) {
            'admin' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'facilities' => route('admin.facilities.index'),
                'recap' => route('admin.facilities.recap'),
            ],
            'operator' => [
                'dashboard' => route('operator.dashboard'),
                'reservations' => route('operator.reservations'),
                'reports' => route('operator.reports'),
            ],
            default => [
                'dashboard' => route('user.dashboard'),
                'reservations' => route('reservations.index'),
                'reports' => route('reports.index'),
            ],
        };

        return Inertia::render('Profile/Edit', [
            'user' => $user->only('name', 'email', 'role', 'account_type'),
            'status' => session('status'),
            'csrfToken' => csrf_token(),
            'urls' => $navigationUrls + [
                'profile' => route('profile.edit'),
                'profileUpdate' => route('profile.update'),
                'passwordUpdate' => route('password.update'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['bail', 'required', 'string', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
