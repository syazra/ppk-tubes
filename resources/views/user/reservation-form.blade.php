<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('user.navbar')
    </x-slot>

    <x-title-bar title="Form Reservasi" subtitle="Ajukan peminjaman fasilitas sesuai kebutuhan kamu." />

    @include('user.partials.facility-browser')

    <x-white-card>
        <form id="reservation-form" action="{{ route('reservations.store') }}" method="POST">
            @csrf
            {{-- FASILITAS DIPILIH DARI KATALOG --}}
            @php($selectedRoom = $rooms->firstWhere('id', old('room_id')))
            <input type="hidden" name="room_id" id="room_id" value="{{ $selectedRoom?->id ?? '' }}">
            <div class="mb-5">
                <p id="selected-facility" class="text-sm font-semibold text-teal-700" tabindex="-1" role="status" aria-live="polite">{{ $selectedRoom ? 'Fasilitas dipilih: ' . $selectedRoom->name . ' · ' . $selectedRoom->location : 'Belum ada fasilitas dipilih. Pilih fasilitas dari daftar di atas.' }}</p>
                <x-input-error :messages="$errors->get('room_id')" class="mt-2" />
            </div>

            {{-- TANGGAL --}}
            <div class="mb-5">
                <x-input-label for="date_to_reserv" value="Hari / Tanggal" />
                <div class="relative mt-1">
                    <input id="date_to_reserv" class="block w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm cursor-pointer" type="date" name="date_to_reserv" min="{{ app(\App\Services\RoomAvailability::class)->earliestStart()->format('Y-m-d') }}" value="{{ is_string(old('date_to_reserv')) ? old('date_to_reserv') : '' }}" />
                </div>
                <x-input-error :messages="$errors->get('date_to_reserv')" class="mt-2" />
            </div>

            {{-- TUJUAN --}}
            <div class="mb-5">
                <x-input-label for="desc" value="Tujuan Penggunaan" />
                <textarea id="desc" name="desc" rows="4" class="block mt-1 w-full rounded-lg border-gray-300" placeholder="Masukkan tujuan penggunaan ruangan">{{ is_string(old('desc')) ? old('desc') : '' }}</textarea>
                <x-input-error :messages="$errors->get('desc')" class="mt-2" />
            </div>

            {{-- BOOKING TIME --}}
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <label class="block text-sm font-semibold">Ketersediaan Waktu</label>
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-white border inline-block"></span> Tersedia</span>
                        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-teal-600 inline-block"></span> Dipilih</span>
                        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-gray-400 inline-block"></span> Tidak tersedia</span>
                    </div>
                </div>

                <div class="border rounded-xl bg-gray-50 p-5">
                    <p id="time-grid-hint" class="text-sm text-gray-400 italic mb-3" role="status" aria-live="polite">Pilih fasilitas dari daftar di atas &amp; tanggal untuk melihat jadwal.</p>

                    <style>
                        .time-grid-layout { display: grid; grid-template-columns: 70px 1fr; gap: 0.75rem; }
                        .time-grid-layout.hidden { display: none; }
                    </style>

                    <div id="time-grid-wrapper" class="time-grid-layout hidden" role="group" aria-label="Ketersediaan Waktu">
                        <div id="time-labels" class="text-xs text-gray-500"></div>

                        <div id="time-grid-container" class="relative">
                            <div id="time-grid"></div>

                            <div id="no-reservation-message" 
                                class="hidden absolute inset-0 flex items-center justify-center text-gray-500">
                                Sudah tidak dapat reservasi hari ini
                            </div>
                        </div>
                    </div>

                    <p id= "slot-message" class="text-xs text-gray-400 mt-3">Klik slot awal, lalu klik slot akhir untuk memblok rentang waktu. Klik salah satu slot terpilih lagi untuk membatalkan pilihan.</p>
                </div>
                <p id="selected-range-text" class="text-sm text-teal-700 font-medium mt-2" role="status" aria-live="polite"></p>
                <x-input-error :messages="$errors->get('time')" class="mt-2" />
                <x-input-error :messages="$errors->get('start_time')" class="mt-2" />
                <x-input-error :messages="$errors->get('end_time')" class="mt-2" />
            </div>

            {{-- Hidden Time --}}
            <input type="hidden" name="start_time" id="start_time">
            <input type="hidden" name="end_time" id="end_time">
            <p id="booking-warning" class="text-sm text-red-600 mt-2 hidden">
                Sudah tidak dapat reservasi untuk waktu tersebut.
            </p>
            {{-- BUTTON --}}
            <div class="flex justify-end gap-3">
                <x-secondary-button>
                    <a href="{{ route('reservations.index') }}">Batal</a>
                </x-secondary-button>
                <x-primary-button>Kirim</x-primary-button>
            </div>
        </form>
    </x-white-card>

    <script>
        (function () {
            const roomInput = document.getElementById('room_id');
            const dateInput = document.getElementById('date_to_reserv');
            
            dateInput.addEventListener('click', function() {
                if (typeof this.showPicker === 'function') {
                    this.showPicker();
                }
            });
            
            const hint = document.getElementById('time-grid-hint');
            const wrapper = document.getElementById('time-grid-wrapper');
            const grid = document.getElementById('time-grid');
            const noReservationMessage = document.getElementById('no-reservation-message');
            const slotMessage = document.getElementById('slot-message');
            const labels = document.getElementById('time-labels');
            const startInput = document.getElementById('start_time');
            const endInput = document.getElementById('end_time');
            const rangeText = document.getElementById('selected-range-text');

            const OPEN_MINUTES = toMinutes(@js(\App\Services\RoomAvailability::OPEN_TIME));
            const CLOSE_MINUTES = toMinutes(@js(\App\Services\RoomAvailability::CLOSE_TIME));
            const STEP = @js(\App\Services\RoomAvailability::STEP_MINUTES);
            const AVAILABILITY_URL = "{{ route('reservations.slots') }}";
            const warning = document.getElementById('booking-warning');
            let bookedRanges = [];
            let anchorMinutes = null;
            let earliestStartLocal = '';
            let requestVersion = 0;
            let availabilityRequest;

            function toMinutes(time) {
                const [hour, minute, second = 0] = time.split(':').map(Number);
                return hour * 60 + minute + second / 60;
            }

            function toHHMM(minutes) {
                const hour = Math.floor(minutes / 60);
                const minute = minutes % 60;
                return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
            }

            function resetSelection() {
                anchorMinutes = null;
                startInput.value = '';
                endInput.value = '';
                rangeText.textContent = '';
            }

            function isBooked(minutes) {
                return bookedRanges.some(range => range.startMin < minutes + STEP && range.endMin > minutes);
            }

            function isUnavailable(minutes) {
                return isBooked(minutes) || `${dateInput.value} ${toHHMM(minutes)}:00.000000` < earliestStartLocal;
            }

            function buildGrid() {
                grid.innerHTML = '';
                labels.innerHTML = '';

                // Ambil tanggal hari ini dengan format YYYY-MM-DD
                const todayStr = new Date().toISOString().split('T')[0];
                const selectedDate = dateInput.value;
                
                // Hitung total menit saat ini (misal jam 16:30 -> 16 * 60 + 30 = 990 menit)
                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                let hasAvailableSlot = false;
                for (let m = OPEN_MINUTES; m < CLOSE_MINUTES; m += STEP) {
                    const value = toHHMM(m);
                    if (m % 60 === 0) {
                        labels.innerHTML += `<div class="h-10 flex items-start pt-1 text-xs text-gray-500">${value}</div>`;
                    } else {
                        labels.innerHTML += `<div class="h-10"></div>`;
                    }

                    const slot = document.createElement('div');
                    slot.dataset.minutes = m;
                    slot.className = `h-10 border-b border-gray-200 bg-white transition`;

                    const booking = isUnavailable(m);
                    slot.textContent = `${value} - ${toHHMM(m + STEP)} · ${booking ? 'Tidak tersedia' : 'Tersedia'}`;
                    slot.classList.add('flex', 'items-center', 'justify-center', 'text-xs');
                    slot.setAttribute('role', 'button');
                    slot.setAttribute('aria-disabled', String(booking));
                    slot.setAttribute('aria-pressed', 'false');

                    if (booking) {
                        slot.classList.remove('bg-white');
                        slot.classList.add('bg-gray-400', 'cursor-not-allowed');
                    } else {
                        hasAvailableSlot = true;
                        slot.classList.add('cursor-pointer');
                        slot.tabIndex = 0;
                        slot.addEventListener('keydown', function(event) {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSlotClick(m);
                            }
                        });
                        slot.addEventListener('mouseenter', function() {
                            if (!slot.classList.contains('bg-teal-600')) {
                                slot.classList.add('bg-teal-100');
                            }
                        });
                        slot.addEventListener('mouseleave', function() {
                            if (!slot.classList.contains('bg-teal-600')) {
                                slot.classList.remove('bg-teal-100');
                            }
                        });
                        slot.addEventListener('click', function() {
                            onSlotClick(m);
                        });
                    }
                    grid.appendChild(slot);
                }

                labels.innerHTML += `<div class="h-10 flex items-start pt-1 text-xs text-gray-500">20:00</div>`;
                if (!hasAvailableSlot) {
                    grid.classList.add('opacity-30');
                    noReservationMessage?.classList.remove('hidden');
                    slotMessage?.classList.add('hidden');
                } else {
                    grid.classList.remove('opacity-30');
                    noReservationMessage?.classList.add('hidden');
                }
                paintSelection();
            }

            function paintSelection() {
                [...grid.children].forEach(slot => {
                    const minutes = Number(slot.dataset.minutes);
                    const booked = isUnavailable(minutes);
                    const selected = startInput.value !== '' && minutes >= toMinutes(startInput.value) && minutes < toMinutes(endInput.value);
                    slot.setAttribute('aria-pressed', String(selected));

                    if (booked) {
                        slot.classList.remove('bg-teal-600', 'bg-teal-100', 'text-white');
                        slot.classList.add('bg-gray-400');
                        return;
                    }

                    if (selected) {
                        slot.classList.remove('bg-white', 'bg-teal-100');
                        slot.classList.add('bg-teal-600', 'text-white');
                    } else {
                        slot.classList.remove('bg-teal-600', 'text-white');
                        slot.classList.add('bg-white');
                    }
                });
            }

            function onSlotClick(minutes) {
                if (startInput.value !== '' && minutes >= toMinutes(startInput.value) && minutes < toMinutes(endInput.value)) {
                    resetSelection();
                    paintSelection();
                    return;
                }
                if (anchorMinutes === null) {
                    anchorMinutes = minutes;
                    startInput.value = toHHMM(minutes);
                    endInput.value = toHHMM(minutes + STEP);
                    paintSelection();
                    updateRangeText();
                    return;
                }

                const start = Math.min(anchorMinutes, minutes);
                const end = Math.max(anchorMinutes, minutes) + STEP;

                for (let m = start; m < end; m += STEP) {
                    if (isUnavailable(m)) {
                        alert('Waktu tersebut sudah dibooking');
                        resetSelection();
                        paintSelection();
                        return;
                    }
                }

                startInput.value = toHHMM(start);
                endInput.value = toHHMM(end);
                anchorMinutes = null;
                paintSelection();
                updateRangeText();
            }

            function updateRangeText() {
                if (startInput.value === '') {
                    rangeText.textContent = '';
                    return;
                }
                rangeText.textContent = `Waktu terpilih: ${startInput.value} - ${endInput.value}`;
            }

            async function loadAvailabilityAndBuildGrid() {
                const roomId = roomInput.value;
                const date = dateInput.value;
                const version = ++requestVersion;
                availabilityRequest?.abort();
                availabilityRequest = new AbortController();
                bookedRanges = [];
                resetSelection();
                wrapper.classList.add('hidden');
                hint.classList.remove('hidden');

                if (!roomId || !date) {
                    hint.textContent = 'Pilih fasilitas dari daftar di atas & tanggal untuk melihat jadwal.';
                    hint.classList.remove('hidden');
                    wrapper.classList.add('hidden');
                    return;
                }

                hint.textContent = 'Memuat jadwal…';
                try {
                    const url = `${AVAILABILITY_URL}?room_id=${roomId}&date=${date}`;
                    const response = await fetch(url, {headers: {Accept: 'application/json'}, signal: availabilityRequest.signal});
                    if (!response.ok) throw new Error('Jadwal tidak dapat dimuat');
                    const data = await response.json();
                    if (version !== requestVersion) return;
                    const cutoff = response.headers.get('X-Reservation-Earliest-Start');
                    if (!Array.isArray(data) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2}$/.test(cutoff ?? '')) throw new Error('Jadwal tidak valid');
                    const validTime = time => typeof time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time);
                    if (!data.every(item => item && validTime(item.start_time) && validTime(item.end_time)
                        && toMinutes(item.start_time) < toMinutes(item.end_time))) throw new Error('Jadwal tidak valid');
                    earliestStartLocal = cutoff.slice(0, 26).replace('T', ' ');

                    bookedRanges = data.map(item => ({
                        startMin: toMinutes(item.start_time),
                        endMin: toMinutes(item.end_time)
                    }));

                    hint.classList.add('hidden');
                    wrapper.classList.remove('hidden');
                    buildGrid();
                } catch (error) {
                    if (error.name === 'AbortError' || version !== requestVersion) return;
                    console.error(error);
                    hint.textContent = 'Gagal memuat jadwal, silakan coba lagi.';
                }
            }

            roomInput.addEventListener('change', loadAvailabilityAndBuildGrid);
            dateInput.addEventListener('change', loadAvailabilityAndBuildGrid);

            if (roomInput.value && dateInput.value) loadAvailabilityAndBuildGrid();

            document.getElementById('reservation-form').addEventListener('submit', function(e) {
                if (startInput.value === '' || endInput.value === '') {
                    e.preventDefault();
                    alert('Silakan pilih waktu reservasi terlebih dahulu');
                }
            });
        })();
    </script>
</x-app-layout>
