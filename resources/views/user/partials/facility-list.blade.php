<div data-facility-list>
    <div class="facility-result-heading">
        <strong>{{ $facilities->total() }} fasilitas ditemukan</strong>
        <span>Slot untuk {{ \Carbon\CarbonImmutable::parse($catalogDate)->locale('id')->translatedFormat('j F Y') }}</span>
    </div>

    @if ($facilities->isEmpty())
        <div class="facility-empty">
            <strong>Tidak ada fasilitas yang cocok</strong>
            <p>Coba ubah tipe, lokasi, atau kapasitas minimum.</p>
            <a class="facility-text-link" data-filter-reset href="{{ route('reservations.form', ['date' => $catalogDate]) }}">Reset filter</a>
        </div>
    @else
        <div class="facility-list">
            @foreach ($facilities as $facility)
                @php
                    $photos = $facility->images->filter(fn ($image) => $image->publicUrl() !== null)->values();
                    $cover = $photos->first();
                @endphp
                <article class="facility-card" aria-labelledby="facility-name-{{ $facility->id }}">
                    <div class="facility-cover">
                        <img src="{{ $cover?->publicUrl() ?? asset('images/facility-placeholder-photo.jpg') }}"
                            alt="{{ $cover?->alt_text ?: ($cover ? 'Foto ' . $facility->name : 'Foto ilustrasi fasilitas') }}"
                            data-image-fallback="{{ asset('images/facility-placeholder.svg') }}"
                            width="640" height="360" loading="lazy">
                        @unless ($cover)
                            <span class="facility-photo-note">Foto ilustrasi</span>
                        @endunless
                    </div>
                    <div class="facility-card-content">
                        <div class="facility-card-heading">
                            <h3 id="facility-name-{{ $facility->id }}">{{ $facility->name }}</h3>
                            <span class="facility-badge {{ $facility->is_avail ? '' : 'is-inactive' }}">{{ $facility->is_avail ? 'Aktif' : 'Nonaktif' }}</span>
                        </div>
                        <dl class="facility-metadata">
                            <dt>Tipe</dt><dd>{{ $facility->type }}</dd>
                            <dt>Lokasi</dt><dd>{{ $facility->location }}</dd>
                            <dt>Kapasitas</dt><dd>{{ $facility->capacity }} orang</dd>
                        </dl>
                        @if ($facility->desc)
                            <p class="facility-description">{{ \Illuminate\Support\Str::limit($facility->desc, 160) }}</p>
                        @endif

                        @if ($photos->count() > 1)
                            <details class="facility-gallery">
                                <summary>Lihat semua foto ({{ $photos->count() }})</summary>
                                <div class="facility-gallery-grid">
                                    @foreach ($photos as $photo)
                                        <figure>
                                            <a href="{{ $photo->publicUrl() }}" target="_blank" rel="noopener noreferrer" aria-label="Buka foto {{ $loop->iteration }} {{ $facility->name }} ukuran penuh (tab baru)">
                                                <img src="{{ $photo->publicUrl() }}" alt="{{ $photo->alt_text ?: 'Foto ' . $loop->iteration . ' ' . $facility->name }}"
                                                    data-image-fallback="{{ asset('images/facility-placeholder.svg') }}" loading="lazy" width="480" height="360">
                                            </a>
                                            <figcaption>{{ $photo->alt_text ?: 'Foto ' . $loop->iteration }}</figcaption>
                                        </figure>
                                    @endforeach
                                </div>
                            </details>
                        @endif

                        <details class="facility-slot-disclosure" data-room-slots data-room-id="{{ $facility->id }}"
                            data-slots-url="{{ route('reservations.facility-slots', ['room' => $facility->id]) }}">
                            <summary>Lihat slot waktu <span class="sr-only">{{ $facility->name }}</span></summary>
                            <div class="facility-slot-content" data-slot-content aria-live="polite" aria-atomic="true">
                                <p class="facility-slot-message">Buka untuk memuat status setiap slot.</p>
                            </div>
                            <noscript><p class="facility-slot-message">Aktifkan JavaScript untuk melihat status slot waktu.</p></noscript>
                        </details>

                        <div class="facility-card-actions">
                            @if ($facility->is_avail)
                                <button type="button" class="facility-button" data-select-facility="{{ $facility->id }}" data-facility-label="{{ $facility->name }} · {{ $facility->location }}">Pilih fasilitas <span class="sr-only">{{ $facility->name }}</span></button>
                                <noscript><p class="facility-slot-message">Aktifkan JavaScript untuk memilih fasilitas dan membuat reservasi.</p></noscript>
                            @else
                                <p class="facility-inactive-note">Fasilitas nonaktif. Semua slot tidak tersedia.</p>
                            @endif
                        </div>
                    </div>
                </article>
            @endforeach
        </div>
    @endif

    @if ($facilities->hasPages())
        <nav class="facility-pagination" aria-label="Halaman daftar fasilitas">
            @if ($facilities->onFirstPage())
                <span aria-disabled="true">Sebelumnya</span>
            @else
                <a href="{{ $facilities->previousPageUrl() }}" data-facility-page rel="prev">Sebelumnya</a>
            @endif
            @php($paginationPage = min($facilities->currentPage(), $facilities->lastPage()))
            @foreach (range(max(1, $paginationPage - 2), min($facilities->lastPage(), $paginationPage + 2)) as $page)
                @if ($page === $facilities->currentPage())
                    <span aria-current="page" aria-label="Halaman {{ $page }}">{{ $page }}</span>
                @else
                    <a href="{{ $facilities->url($page) }}" data-facility-page aria-label="Halaman {{ $page }}">{{ $page }}</a>
                @endif
            @endforeach
            @if ($facilities->hasMorePages())
                <a href="{{ $facilities->nextPageUrl() }}" data-facility-page rel="next">Berikutnya</a>
            @else
                <span aria-disabled="true">Berikutnya</span>
            @endif
        </nav>
    @endif
</div>
