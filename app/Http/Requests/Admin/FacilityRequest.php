<?php

namespace App\Http\Requests\Admin;

use App\Models\Room;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class FacilityRequest extends FormRequest
{
    public const TYPES = ['Ruang Kelas', 'Aula', 'Laboratorium', 'Lapangan'];

    public const MAX_PHOTOS = 3;

    public const MAX_PHOTO_KB = 2048;

    public const MAX_CAPACITY = 100000;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        foreach (['name', 'location', 'desc'] as $field) {
            $value = $this->input($field);
            if (is_string($value)) {
                $this->merge([$field => trim($value)]);
            }
        }
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $room = $this->route('room');
        $roomId = $room instanceof Room ? $room->id : null;
        $location = $this->input('location');

        return [
            'name' => ['bail', 'required', 'string', 'min:2', 'max:100', 'not_regex:/[<>\x00-\x1F\x7F]/u', Rule::unique('rooms', 'name')->where('location', is_string($location) ? $location : '')->ignore($roomId)],
            'location' => ['bail', 'required', 'string', 'min:2', 'max:100', 'not_regex:/[<>\x00-\x1F\x7F]/u'],
            'type' => ['required', Rule::in(self::TYPES)],
            'capacity' => ['bail', 'required', 'integer', 'min:1', 'max:'.self::MAX_CAPACITY],
            'desc' => ['nullable', 'string', 'max:2000'],
            'images' => ['nullable', 'array', 'max:'.self::MAX_PHOTOS],
            'images.*' => ['bail', 'required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:'.self::MAX_PHOTO_KB, 'dimensions:max_width=6000,max_height=6000'],
            'removed_image_ids' => $roomId ? ['sometimes', 'array', 'max:'.self::MAX_PHOTOS] : ['prohibited'],
            'removed_image_ids.*' => ['bail', 'integer', 'distinct', Rule::exists('room_images', 'id')->where('room_id', $roomId)],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $room = $this->route('room');
            if ($validator->errors()->isNotEmpty() || ! $room instanceof Room) {
                return;
            }

            $remaining = $room->images()->count() - count($this->input('removed_image_ids', []));
            if ($remaining + count($this->file('images', [])) > self::MAX_PHOTOS) {
                $validator->errors()->add('images', 'Maksimal 3 foto per fasilitas. Hapus foto lama sebelum menambah foto baru.');
            }
        });
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'name.min' => 'Nama fasilitas minimal 2 karakter.',
            'name.max' => 'Nama fasilitas maksimal 100 karakter.',
            'name.unique' => 'Nama fasilitas sudah ada pada lokasi yang sama.',
            'name.not_regex' => 'Nama fasilitas tidak boleh mengandung tag atau karakter kontrol.',
            'location.min' => 'Lokasi minimal 2 karakter.',
            'location.max' => 'Lokasi maksimal 100 karakter.',
            'location.not_regex' => 'Lokasi tidak boleh mengandung tag atau karakter kontrol.',
            'type.in' => 'Pilih jenis fasilitas yang tersedia.',
            'capacity.integer' => 'Kapasitas harus berupa angka bulat, tanpa pecahan.',
            'capacity.min' => 'Kapasitas minimal 1 orang.',
            'capacity.max' => 'Kapasitas maksimal 100.000 orang.',
            'desc.max' => 'Deskripsi maksimal 2.000 karakter.',
            'images.array' => 'Foto harus berupa daftar file gambar.',
            'images.max' => 'Maksimal 3 foto per fasilitas.',
            'images.*.image' => 'File harus berupa gambar yang valid.',
            'images.*.mimes' => 'Foto harus berformat JPG, JPEG, PNG, atau WebP.',
            'images.*.max' => 'Setiap foto maksimal 2 MB.',
            'images.*.dimensions' => 'Lebar dan tinggi foto maksimal 6.000 piksel.',
            'removed_image_ids.*.exists' => 'Foto yang dihapus harus milik fasilitas ini.',
            'removed_image_ids.*.distinct' => 'Foto yang dihapus tidak boleh berulang.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['name' => 'Nama fasilitas', 'location' => 'Lokasi', 'type' => 'Jenis fasilitas', 'capacity' => 'Kapasitas', 'desc' => 'Deskripsi', 'images' => 'Foto'];
    }
}
