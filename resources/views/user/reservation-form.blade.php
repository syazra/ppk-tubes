<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('user.navbar')
    </x-slot>

    <x-title-bar title="Form Reservasi" subtitle="Ajukan peminjaman fasilitas sesuai kebutuhan kamu." />

    <x-white-card>
        <form action="{{ route('reservations.store') }}" method="POST">
            @csrf
            {{-- RUANGAN --}}
            <div class="mb-5">
                <x-input-label for="room_id" value="Ruangan" />
                <select name="room_id" id="room_id" class="block mt-1 w-full rounded-lg border-gray-300">
                    <option value="">Pilih Ruangan</option>
                    @foreach($rooms as $room)
                        <option value="{{ $room->id }}" {{ old('room_id') == $room->id ? 'selected' : '' }}>
                            {{ $room->name }} - Lokasi: {{ $room->location }} ({{ ucfirst($room->type) }})
                        </option>
                    @endforeach
                </select>
                <x-input-error :messages="$errors->get('room_id')" class="mt-2" />
            </div>

            {{-- TANGGAL --}}
            <div class="mb-5">
                <x-input-label for="date_to_reserv" value="Hari / Tanggal" />
                <div class="relative mt-1">
                    <input id="date_to_reserv" class="block w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm cursor-pointer" type="date" name="date_to_reserv" min="{{ date('Y-m-d', strtotime('+3 hours')) }}" />
                </div>
                <x-input-error :messages="$errors->get('date_to_reserv')" class="mt-2" />
            </div>

            {{-- TUJUAN --}}
            <div class="mb-5">
                <x-input-label for="desc" value="Tujuan Penggunaan" />
                <textarea id="desc" name="desc" rows="4" class="block mt-1 w-full rounded-lg border-gray-300" placeholder="Masukkan tujuan penggunaan ruangan"></textarea>
                <x-input-error :messages="$errors->get('desc')" class="mt-2" />
            </div>

            {{-- BOOKING TIME --}}
            <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                    <label class="block text-sm font-semibold">Ketersediaan Waktu</label>
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-white border inline-block"></span> Kosong</span>
                        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-teal-600 inline-block"></span> Dipilih</span>
                        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-gray-400 inline-block"></span> Sudah dipesan</span>
                    </div>
                </div>

                <div class="border rounded-xl bg-gray-50 p-5">
                    <p id="time-grid-hint" class="text-sm text-gray-400 italic mb-3">Pilih ruangan &amp; tanggal terlebih dahulu untuk melihat jadwal.</p>

                    <style>
                        .time-grid-layout { display: grid; grid-template-columns: 70px 1fr; gap: 0.75rem; }
                        .time-grid-layout.hidden { display: none; }
                    </style>

                    <div id="time-grid-wrapper" class="time-grid-layout hidden">
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
                <p id="selected-range-text" class="text-sm text-teal-700 font-medium mt-2"></p>
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
            const roomSelect = document.getElementById('room_id');
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

            const OPEN_MINUTES = 7 * 60;
            const CLOSE_MINUTES = 20 * 60;
            const STEP = 30;
            const AVAILABILITY_URL = "{{ route('reservations.slots') }}";
            const warning = document.getElementById('booking-warning');
            let bookedRanges = [];
            let anchorMinutes = null;

            function toMinutes(time) {
                const [hour, minute] = time.split(':').map(Number);
                return hour * 60 + minute;
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
                return bookedRanges.find(range => minutes >= range.startMin && minutes < range.endMin);
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
                    // Cek apakah tanggal yang dipilih DAN jam slot sudah lewat dari waktu sekarang (+ buffer 3 jam jika ingin persis H-3 jam)
                    // Menggunakan currentMinutes + 720 (12 jam) agar slot dalam rentang 12 jam ke depan ikut terkunci
                    const booking = isBooked(m);
                    const slotDateTime = new Date(`${selectedDate}T${value}:00`);
                    const minimumBookingDateTime = new Date(Date.now() + 12 * 60 * 60 * 1000);

                    const isPassed = slotDateTime < minimumBookingDateTime;

                    if (isPassed) {
                        slot.classList.remove('bg-white');
                        slot.classList.add('bg-gray-400', 'cursor-not-allowed');
                        slot.style.pointerEvents = 'none';
                        
                    } else if (booking){
                        slot.classList.remove('bg-white');
                        slot.classList.add('bg-gray-400', 'cursor-not-allowed');
                        slot.style.pointerEvents = 'none';
                    }else {
                        hasAvailableSlot = true;
                        slot.classList.add('cursor-pointer');
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
                    noReservationMessage.classList.remove('hidden');
                    slotMessage.classList.add('hidden')
                } else {
                    grid.classList.remove('opacity-30');
                    noReservationMessage.classList.add('hidden');
                }
                paintSelection();
            }

            function paintSelection() {
                [...grid.children].forEach(slot => {
                    const minutes = Number(slot.dataset.minutes);
                    const booked = isBooked(minutes);
                    const selected = startInput.value !== '' && minutes >= toMinutes(startInput.value) && minutes < toMinutes(endInput.value);

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
                    if (isBooked(m)) {
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
                const roomId = roomSelect.value;
                const date = dateInput.value;
                bookedRanges = [];
                resetSelection();

                if (!roomId || !date) {
                    hint.classList.remove('hidden');
                    wrapper.classList.add('hidden');
                    return;
                }

                try {
                    const url = `${AVAILABILITY_URL}?room_id=${roomId}&date=${date}`;
                    const response = await fetch(url);
                    const data = await response.json();

                    bookedRanges = data.map(item => ({
                        startMin: toMinutes(item.start_time),
                        endMin: toMinutes(item.end_time)
                    }));

                    hint.classList.add('hidden');
                    wrapper.classList.remove('hidden');
                    buildGrid();
                } catch (error) {
                    console.error(error);
                    hint.textContent = 'Gagal memuat jadwal, silakan coba lagi.';
                }
            }

            roomSelect.addEventListener('change', loadAvailabilityAndBuildGrid);
            dateInput.addEventListener('change', loadAvailabilityAndBuildGrid);

            document.querySelector('form').addEventListener('submit', function(e) {
                if (startInput.value === '' || endInput.value === '') {
                    e.preventDefault();
                    alert('Silakan pilih waktu reservasi terlebih dahulu');
                }
            });
        })();
    </script>
</x-app-layout>