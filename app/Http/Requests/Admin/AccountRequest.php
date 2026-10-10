<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AccountRequest extends FormRequest
{
    public const IDENTITY_LENGTHS = ['mahasiswa' => 14, 'dosen' => 18, 'staf' => 18, 'petugas' => 18];

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'email', 'identity_number'] as $field) {
            $value = $this->input($field);
            if (is_string($value)) {
                $this->merge([$field => $field === 'email' ? mb_strtolower(trim($value)) : trim($value)]);
            }
        }
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $user = $this->route('user');
        $userId = $user instanceof User ? $user->id : null;
        $type = $this->input('account_type');
        $length = is_string($type) ? (self::IDENTITY_LENGTHS[$type] ?? 14) : 14;

        return [
            'name' => ['bail', 'required', 'string', 'min:2', 'max:255', 'regex:/\p{L}/u', 'not_regex:/[<>\x00-\x1F\x7F]/u'],
            'identity_number' => ['bail', 'required', 'string', 'regex:/^[0-9]{'.$length.'}$/D', 'not_regex:/^0+$/D', Rule::unique('users', 'identity_number')->ignore($userId)],
            'email' => [
                'bail', 'required', 'string', 'max:255', 'email:rfc', 'regex:/^[^@\s]+@[^@\s]+\.[^@\s]+$/u',
                function (string $attribute, mixed $value, Closure $fail) use ($userId): void {
                    if (User::whereRaw('LOWER(email) = ?', [$value])->when($userId, fn ($query) => $query->where('id', '!=', $userId))->exists()) {
                        $fail('Email sudah digunakan oleh akun lain.');
                    }
                },
            ],
            'account_type' => ['required', Rule::in(array_keys(self::IDENTITY_LENGTHS))],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'name.min' => 'Nama lengkap minimal 2 karakter.',
            'name.max' => 'Nama lengkap maksimal 255 karakter.',
            'name.regex' => 'Nama lengkap harus mengandung huruf.',
            'name.not_regex' => 'Nama lengkap tidak boleh mengandung tag atau karakter kontrol.',
            'identity_number.regex' => 'NIM harus terdiri dari 14 digit angka; NIP harus terdiri dari 18 digit angka.',
            'identity_number.not_regex' => 'Nomor induk tidak boleh seluruhnya nol.',
            'identity_number.unique' => 'Nomor induk sudah digunakan oleh akun lain.',
            'email.email' => 'Masukkan alamat email yang valid, misalnya nama@kampus.ac.id.',
            'email.regex' => 'Email harus memiliki domain yang valid, misalnya nama@kampus.ac.id.',
            'email.max' => 'Email maksimal 255 karakter.',
            'account_type.in' => 'Pilih jenis akun yang tersedia.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['name' => 'Nama lengkap', 'email' => 'Email', 'identity_number' => 'Nomor induk', 'account_type' => 'Jenis akun'];
    }
}
