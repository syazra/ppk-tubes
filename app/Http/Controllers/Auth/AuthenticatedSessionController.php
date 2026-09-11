<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user(); 

        $email = $user->email;

        // Lakukan pengecekan domain email atau tentukan rolenya
        // mahasiswa atau dosen
        if (str_ends_with($email, '@students.kampus.ac.id') || str_ends_with($email, '@lecturer.kampus.ac.id')) {
            return redirect()->intended(route('user.dashboard', absolute: false));
        } 
        // admin
        if (str_ends_with($email, '@admin.kampus.ac.id')) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        } 
        // petugas
        if (str_ends_with($email, '@operator.kampus.ac.id')) {
            return redirect()->intended(route('operator.dashboard', absolute: false));
        }

        // kalau database sudah ada role (gausah $email = $user->email; langsung pakai kode di bawah)
        // if ($user->role === 'user') {
        //     return redirect()->intended(route('user.dashboard', absolute: false));
        // } elseif ($user->role === 'operator') {
        //     return redirect()->intended(route('operator.dashboard', absolute: false));
        // } elseif ($user->role === 'admin') {
        //     return redirect()->intended(route('admin.dashboard', absolute: false));
        // }

        // Paksa logout dan kembalikan ke halaman login dengan pesan error!
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return back()->withErrors([
            'email' => 'Domain email kamu tidak diizinkan untuk mengakses sistem ini.',
        ])->onlyInput('email');

        // Default redirect jika tidak masuk kriteria di atas (pengunjung pakai tombol)
        // return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
