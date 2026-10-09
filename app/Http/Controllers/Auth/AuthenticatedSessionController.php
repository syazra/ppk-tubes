<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\LoginRedirect;
use Illuminate\Auth\SessionGuard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use LogicException;

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
    private function toDashboard(Request $request): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $redirect = redirect(app(LoginRedirect::class)->destination($request));

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
        $guard = Auth::guard('web');

        if (! $guard instanceof SessionGuard) {
            throw new LogicException('Login requires the web session guard.');
        }

        // Record the password at login, before the next request can adopt a changed hash.
        $request->session()->put('password_hash_web', $guard->hashPasswordForCookie($user->getAuthPassword()));
        Inertia::clearHistory();

        if ($user->dashboardRouteName() !== null) {
            return $this->toDashboard($request);
        }

        // Paksa logout dan kembalikan ke halaman login dengan pesan error!
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Inertia::clearHistory();

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

        Inertia::clearHistory();

        return redirect('/');
    }
}
