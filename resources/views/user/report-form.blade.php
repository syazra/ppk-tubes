<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @if(auth()->check() && auth()->user()->role == 'admin')
            @include('admin.navbar')
        @elseif(auth()->check() && auth()->user()->role == 'user')
            @include('user.navbar')
        @else
            @include('default.navbar')
        @endif
    </x-slot>

    <!-- Right main content: Menggunakan Title Bar Kustom -->
    <x-title-bar 
        title="Pelaporan Fasilitas" 
        subtitle="Silakan pilih ruangan dan lampirkan foto bukti kerusakan dengan jelas." 
    />

    <!-- Menggunakan White Card untuk membungkus form -->
    <x-white-card>
        <form action="{{ route('reports.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
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
                @error('room_id')
                    <p class="text-red-500 text-xs mt-1 font-medium">Silakan pilih ruangan atau fasilitas terlebih dahulu.</p>
                @enderror
            </div>

            {{-- Deskripsi Kerusakan --}}
            <div>
                <label for="desc" class="block font-medium text-sm text-gray-700 mb-2">Deskripsi Kerusakan</label>
                <textarea class="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm py-3 px-4 bg-gray-50/50" id="desc" name="desc" rows="6" placeholder="Jelaskan detail kerusakan fasilitas yang terjadi...">{{ old('desc') }}</textarea>
                @error('desc')
                    <p class="text-red-500 text-xs mt-1 font-medium">Deskripsi kerusakan wajib diisi dengan detail.</p>
                @enderror
            </div>

            {{-- Upload Bukti Kerusakan --}}
            <div>
                <label for="image" class="block font-medium text-sm text-gray-700 mb-2">Bukti Kerusakan (Foto)</label>
                <div class="mt-1 flex flex-col items-center justify-center px-6 pt-6 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors duration-200 bg-gray-50/50">
                    
                    {{-- Area Preview Gambar --}}
                    <div id="preview-container" class="mb-3 hidden flex flex-col items-center">
                        <img id="image-preview" src="#" alt="Preview Foto" class="h-28 w-auto object-cover rounded-lg shadow-sm border border-gray-200 mb-2">
                        <span id="file-name" class="text-xs font-medium text-gray-700 truncate max-w-xs"></span>
                    </div>

                    {{-- Ikon SVG Default --}}
                    <svg id="upload-icon" class="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    
                    {{-- Input asli disembunyikan --}}
                    <input type="file" id="image" name="image" accept="image/*" class="hidden">

                    {{-- Tombol Pilih File & Keterangan --}}
                    <div class="flex items-center justify-center gap-3 w-full my-2">
                        <label for="image" class="cursor-pointer py-2 px-4 rounded-md text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition shadow-sm shrink-0">
                            Pilih File
                        </label>
                        <span id="default-text" class="text-xs text-gray-500 truncate max-w-xs">Belum ada file yang dipilih</span>
                    </div>

                    <p class="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Maks. 2MB)</p>
                </div>

                @error('image')
                    <p class="text-red-500 text-xs mt-1 font-medium">Wajib melampirkan foto bukti berupa gambar (maks. 2MB).</p>
                @enderror
            </div>

            {{-- Script untuk menampilkan preview gambar secara instan --}}
            <script>
                document.getElementById('image').addEventListener('change', function(event) {
                    let file = event.target.files[0];
                    let previewContainer = document.getElementById('preview-container');
                    let imagePreview = document.getElementById('image-preview');
                    let fileNameSpan = document.getElementById('file-name');
                    let uploadIcon = document.getElementById('upload-icon');
                    let defaultText = document.getElementById('default-text');

                    if (file) {
                        let reader = new FileReader();
                        reader.onload = function(e) {
                            imagePreview.src = e.target.result;
                            previewContainer.classList.remove('hidden');
                            uploadIcon.classList.add('hidden');
                            defaultText.classList.add('hidden');
                            fileNameSpan.textContent = file.name;
                        }
                        reader.readAsDataURL(file);
                    }
                });
            </script>

            {{-- Tombol Aksi --}}
            <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 transform active:scale-95 text-sm">
                    Kirim Laporan
                </button>
            </div>
        </form>
    </x-white-card>
</x-app-layout>