<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $role
 * @property string|null $account_type
 * @property string|null $identity_number
 * @property string $akun
 * @property string $account
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'role', 'account_type', 'identity_number', 'password', 'account', 'akun'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's initials
     */
    public function initials(): string
    {
        $initials = Str::initials($this->name, true);

        return Str::length($initials) > 1
            ? Str::substr($initials, 0, 1).Str::substr($initials, -1)
            : $initials;
    }

    /**
     * Accessor for akun (alias for email)
     */
    public function getAkunAttribute(): string
    {
        return $this->email;
    }

    /**
     * Mutator for akun (alias for email)
     */
    public function setAkunAttribute(string $value): void
    {
        $this->attributes['email'] = $value;
    }

    /**
     * Accessor for account (alias for email)
     */
    public function getAccountAttribute(): string
    {
        return $this->email;
    }

    /**
     * Mutator for account (alias for email)
     */
    public function setAccountAttribute(string $value): void
    {
        $this->attributes['email'] = $value;
    }

    /**
     * Check if user is an operator
     */
    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a regular user / pengguna
     */
    public function isUser(): bool
    {
        return in_array($this->role, ['user', 'pengguna']);
    }

    /**
     * Alias for isUser()
     */
    public function isPengguna(): bool
    {
        return $this->isUser();
    }
}
