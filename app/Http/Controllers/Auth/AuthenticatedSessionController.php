<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Login', [
            'status' => session('status'),
            'landingUrl' => route('landing'),
            'demoAccounts' => app()->environment('local') ? [
                ['label' => 'Mahasiswa', 'email' => 'ruthseptriana@students.kampus.ac.id'],
                ['label' => 'Dosen', 'email' => 'sandykurniawan@lecturer.kampus.ac.id'],
                ['label' => 'Staf', 'email' => 'benynugroho@staff.kampus.ac.id'],
                ['label' => 'Operator', 'email' => 'anangardiyanto@operator.kampus.ac.id'],
                ['label' => 'Admin', 'email' => 'arispujiw@admin.kampus.ac.id'],
            ] : [],
        ]);
    }

    /**
     * Redirect to the intended page; use a full page visit for Inertia requests
     * since dashboards may be Blade-rendered.
     */
    private function toDashboard(Request $request, string $default): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $redirect = redirect()->intended($default);

        return $request->header('X-Inertia') ? Inertia::location($redirect->getTargetUrl()) : $redirect;
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user(); 

        if ($user->isAdmin()) {
            return $this->toDashboard($request, route('admin.dashboard', absolute: false));
        }

        if ($user->isOperator()) {
            return $this->toDashboard($request, route('operator.dashboard', absolute: false));
        }

        if ($user->isUser()) {
            return $this->toDashboard($request, route('user.dashboard', absolute: false));
        }

        // Paksa logout dan kembalikan ke halaman login dengan pesan error!
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return back()->withErrors([
            'email' => 'Akun ini tidak memiliki peran yang diizinkan untuk mengakses sistem.',
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
