<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Pelaporan Fasilitas
        </h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow-sm rounded-xl p-6 sm:p-10 border border-gray-100">
                
                <div class="mb-6 border-b pb-4">
                    <h3 class="text-xl font-bold text-gray-800">Formulir Kerusakan Fasilitas</h3>
                    <p class="text-sm text-gray-500 mt-1">Silakan pilih ruangan dan lampirkan foto bukti kerusakan dengan jelas.</p>
                </div>

                {{-- Tambahkan atribut novalidate di sini --}}
                <form action="{{ route('reports.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6" novalidate>
                    @csrf

                    {{-- Pilihan Ruangan / Fasilitas --}}
                    <div>
                        <label for="room_id" class="block font-medium text-sm text-gray-700 mb-2">Pilih Fasilitas / Ruangan</label>
                        <select name="room_id" id="room_id" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm py-3 px-4 bg-gray-50/50">
                            <option value="">Pilih Ruangan / Fasilitas</option>
                            @foreach($rooms as $room)
                                <option value="{{ $room->id }}" {{ old('room_id') == $room->id ? 'selected' : '' }}>
                                    {{ $room->name }} — Lokasi: {{ $room->location }} ({{ ucfirst($room->type) }})
                                </option>
                            @endforeach
                        </select>
                        {{-- Pesan error manual jika room_id kosong --}}
                        @error('room_id')
                            <p class="text-red-500 text-xs mt-1 font-medium">Silakan pilih ruangan atau fasilitas terlebih dahulu.</p>
                        @enderror
                    </div>

                    {{-- Deskripsi Kerusakan --}}
                    <div>
                        <label for="desc" class="block font-medium text-sm text-gray-700 mb-2">Deskripsi Kerusakan</label>
                        <textarea class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm py-3 px-4 bg-gray-50/50" id="desc" name="desc" rows="6" placeholder="Jelaskan detail kerusakan fasilitas yang terjadi...">{{ old('desc') }}</textarea>
                        {{-- Pesan error manual jika deskripsi kosong --}}
                        @error('desc')
                            <p class="text-red-500 text-xs mt-1 font-medium">Deskripsi kerusakan wajib diisi dengan detail.</p>
                        @enderror
                    </div>

                    {{-- Upload Bukti Kerusakan --}}
                    <div>
                        <label for="image" class="block font-medium text-sm text-gray-700 mb-2">Bukti Kerusakan (Foto)</label>
                        <div class="mt-1 flex flex-col items-center justify-center px-6 pt-6 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors duration-200 bg-gray-50/50">
                            <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <input type="file" id="image" name="image" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer">
                            <p class="text-xs text-gray-400 mt-2">PNG, JPG, JPEG (Maks. 2MB)</p>
                        </div>
                        {{-- Pesan error manual jika foto tidak valid / wajib diisi --}}
                        @error('image')
                            <p class="text-red-500 text-xs mt-1 font-medium">Wajib melampirkan foto bukti berupa gambar (maks. 2MB).</p>
                        @enderror
                    </div>

                    {{-- Tombol Aksi --}}
                    <div class="flex justify-end gap-3 pt-4 border-t">
                        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 transform active:scale-95 text-sm">
                            Kirim Laporan
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </div>
</x-app-layout>