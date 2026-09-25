<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View|Response
    {
        if ($request->user()->isAdmin()) {
            $user = $request->user();

            return Inertia::render('Admin/Profile', [
                'admin' => $user->only('name', 'email'),
                'status' => session('status'),
                'csrfToken' => csrf_token(),
                'mustVerifyEmail' => $user instanceof MustVerifyEmail,
                'emailVerified' => $user->hasVerifiedEmail(),
                'urls' => [
                    'dashboard' => route('admin.dashboard'),
                    'registrations' => route('admin.registrations.index'),
                    'profile' => route('profile.edit'),
                    'profileUpdate' => route('profile.update'),
                    'profileDestroy' => route('profile.destroy'),
                    'passwordUpdate' => route('password.update'),
                    'verificationSend' => route('verification.send'),
                    'guest' => route('guest.dashboard'),
                    'logout' => route('logout'),
                ],
            ]);
        }

        return view('profile.edit', [
            'user' => $request->user(),
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
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
