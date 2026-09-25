<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('user.navbar')
    </x-slot>

    <x-title-bar 
        title="Pelaporan Fasilitas" 
        subtitle="Silakan pilih ruangan dan lampirkan foto bukti kerusakan dengan jelas." 
    />

    <x-white-card>
        <form action="{{ route('reports.store') }}" method="POST" enctype="multipart/form-data">
            @csrf

            {{-- Pilihan Ruangan / Fasilitas --}}
            <div class="mb-5">
                <x-input-label for="room_id" value="Pilih Fasilitas / Ruangan" />

                <select 
                    name="room_id" 
                    id="room_id" 
                    class="block mt-1 w-full rounded-lg border-gray-300"
                >
                    <option value="">Pilih Ruangan / Fasilitas</option>
                    @foreach($rooms as $room)
                        <option value="{{ $room->id }}" {{ old('room_id') == $room->id ? 'selected' : '' }}>
                            {{ $room->name }} — Lokasi: {{ $room->location }} ({{ ucfirst($room->type) }})
                        </option>
                    @endforeach
                </select>

                <x-input-error :messages="$errors->get('room_id')" class="mt-2" />
            </div>

            {{-- Deskripsi Kerusakan --}}
            <div class="mb-5">
                <x-input-label for="desc" value="Deskripsi Kerusakan" />

                <textarea 
                    id="desc" 
                    name="desc" 
                    rows="6" 
                    class="block mt-1 w-full rounded-lg border-gray-300" 
                    placeholder="Jelaskan detail kerusakan fasilitas yang terjadi..."
                >{{ old('desc') }}</textarea>

                <x-input-error :messages="$errors->get('desc')" class="mt-2" />
            </div>

            {{-- Upload Bukti Kerusakan --}}
            <div class="mb-5">
                <x-input-label for="image" value="Bukti Kerusakan (Foto)" />
                
                <div class="mt-1 flex flex-col items-center justify-center px-6 pt-6 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-200">
                    
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
                        <label for="image" class="cursor-pointer py-2 px-4 rounded-md text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 uppercase tracking-widest transition shadow-sm shrink-0">
                            Pilih File
                        </label>
                        <span id="default-text" class="text-xs text-gray-500 truncate max-w-xs">Belum ada file yang dipilih</span>
                    </div>

                    <p class="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Maks. 2MB)</p>
                </div>

                <x-input-error :messages="$errors->get('image')" class="mt-2" />
            </div>

            {{-- Tombol Aksi --}}
            <div class="flex justify-end gap-3 mt-6">
                <x-secondary-button>
                    <a href="{{ route('reports.index') }}">
                        Batal
                    </a>
                </x-secondary-button>

                <x-primary-button>
                    Kirim Laporan
                </x-primary-button>
            </div>
        </form>

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
    </x-white-card>
</x-app-layout>