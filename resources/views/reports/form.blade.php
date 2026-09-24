<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            Pelaporan Fasilitas
        </h2>
    </x-slot>

    {{-- Dibuat full tanpa pembatas max-w di card, menggunakan max-w-none --}}
    <div class="py-6">
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white shadow-sm rounded-xl p-6 sm:p-10 border border-gray-100">
                
                <div class="mb-6 border-b pb-4">
                    <h3 class="text-xl font-bold text-gray-800">Formulir Kerusakan Fasilitas</h3>
                    <p class="text-sm text-gray-500 mt-1">Silakan pilih ruangan dan lampirkan foto bukti kerusakan dengan jelas.</p>
                </div>

                <form action="#" method="POST" enctype="multipart/form-data" class="space-y-6">
                    @csrf

                    {{-- Pilihan Ruangan / Fasilitas --}}
                    <div>
                        <label for="room_id" class="block font-medium text-sm text-gray-700 mb-2">Pilih Fasilitas / Ruangan</label>
                        <select name="room_id" id="room_id" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm py-3 px-4 bg-gray-50/50" required>
                            <option value="">-- Pilih Ruangan / Fasilitas --</option>
                            @foreach($rooms as $room)
                                <option value="{{ $room->id }}">
                                    {{ $room->name }} — Lokasi: {{ $room->location }} ({{ ucfirst($room->type) }})
                                </option>
                            @endforeach
                        </select>
                    </div>

                    {{-- Deskripsi Kerusakan --}}
                    <div>
                        <label for="desc" class="block font-medium text-sm text-gray-700 mb-2">Deskripsi Kerusakan</label>
                        <textarea class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm py-3 px-4 bg-gray-50/50" id="desc" name="desc" rows="6" placeholder="Jelaskan detail kerusakan fasilitas yang terjadi..." required></textarea>
                    </div>

                    {{-- Upload Bukti Kerusakan --}}
                    <div>
                        <label for="image" class="block font-medium text-sm text-gray-700 mb-2">Bukti Kerusakan (Foto)</label>
                        <div class="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors duration-200 bg-gray-50/50">
                            <div class="space-y-2 text-center">
                                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="flex text-sm text-gray-600 justify-center">
                                    <label for="image" class="relative cursor-pointer bg-white px-3 py-1.5 rounded-md font-medium text-indigo-600 hover:text-indigo-500 border border-gray-300 shadow-sm focus-within:outline-none">
                                        <span>Unggah file foto</span>
                                        <input id="image" name="image" type="file" class="sr-only" accept="image/*">
                                    </label>
                                    <p class="pl-2 pt-1 text-gray-500">atau seret ke sini</p>
                                </div>
                                <p class="text-xs text-gray-400">PNG, JPG, JPEG (Maks. 2MB)</p>
                            </div>
                        </div>
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