<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\LoginRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect(app(LoginRedirect::class)->destination($request))
                    : Inertia::render('Auth/VerifyEmail', [
                        'status' => $request->session()->get('status'),
                        'sendUrl' => route('verification.send'),
                        'logoutUrl' => route('logout'),
                    ]);
    }
}
