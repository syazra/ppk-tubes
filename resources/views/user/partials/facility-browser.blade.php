<section id="facility-browser"
    class="facility-browser"
    aria-labelledby="facility-browser-title"
    data-results-url="{{ route('reservations.facilities') }}"
    data-date="{{ $catalogDate }}"
    data-timezone="{{ $timezone }}">
    <div class="facility-browser-heading">
        <div>
            <h2 id="facility-browser-title">Cari fasilitas</h2>
            <p>Temukan fasilitas dan periksa slot waktu, lalu isi form reservasi di bawah.</p>
        </div>
        <a class="facility-text-link" href="#reservation-form">Ke form reservasi <span aria-hidden="true">↓</span></a>
    </div>

    <form id="facility-filters" class="facility-filters" action="{{ route('reservations.form') }}" method="GET">
        <div class="facility-field">
            <label for="facility-type">Tipe fasilitas</label>
            <select id="facility-type" name="type" aria-describedby="facility-error-type">
                <option value="">Semua tipe</option>
                @foreach ($types as $type)
                    <option value="{{ $type }}" @selected(($filters['type'] ?? '') === $type)>{{ $type }}</option>
                @endforeach
            </select>
            <p id="facility-error-type" class="facility-field-error" data-filter-error="type">{{ $errors->getBag('facilityFilters')->first('type') }}</p>
        </div>
        <div class="facility-field">
            <label for="facility-location">Lokasi</label>
            <input id="facility-location" name="location" type="search" value="{{ $filters['location'] ?? '' }}"
                maxlength="100" placeholder="Cari lokasi" aria-describedby="facility-error-location">
            <p id="facility-error-location" class="facility-field-error" data-filter-error="location">{{ $errors->getBag('facilityFilters')->first('location') }}</p>
        </div>
        <div class="facility-field">
            <label for="facility-capacity">Kapasitas minimum</label>
            <input id="facility-capacity" name="capacity" type="number" value="{{ $filters['capacity'] ?? '' }}"
                min="1" max="100000" step="1" placeholder="Jumlah orang" aria-describedby="facility-error-capacity">
            <p id="facility-error-capacity" class="facility-field-error" data-filter-error="capacity">{{ $errors->getBag('facilityFilters')->first('capacity') }}</p>
        </div>
        <div class="facility-field">
            <label for="facility-date">Tanggal ketersediaan</label>
            <input id="facility-date" name="date" type="date" value="{{ $catalogDate }}" required aria-describedby="facility-error-date">
            <p id="facility-error-date" class="facility-field-error" data-filter-error="date">{{ $errors->getBag('facilityFilters')->first('date') }}</p>
        </div>
        <div class="facility-filter-actions">
            <button class="facility-button" type="submit">Cari fasilitas</button>
            <a class="facility-text-link" data-filter-reset href="{{ route('reservations.form', ['date' => $catalogDate]) }}">Reset filter</a>
        </div>
    </form>

    <p class="facility-browser-note">Slot berlangsung 30 menit, pukul 07.00–20.00 ({{ $timezone }}). Status mengikuti batas pemesanan tiga jam dan reservasi yang berlaku.</p>
    <div class="facility-search-feedback" aria-live="polite" aria-atomic="true">
        <p data-search-status></p>
        <button type="button" class="facility-text-link" data-search-retry hidden>Coba lagi</button>
    </div>
    <div id="facility-results" aria-busy="false">
        @include('user.partials.facility-list')
    </div>
</section>

<style>
    #facility-browser { margin: 0 24px 24px; padding: 24px; border: 1px solid #d7e5df; border-radius: 12px; background: #fff; color: #183c35; }
    #facility-browser .facility-browser-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
    #facility-browser h2 { margin: 0 0 5px; color: #064e43; font-size: 20px; font-weight: 700; }
    #facility-browser .facility-browser-heading p, #facility-browser .facility-browser-note { color: #5b716a; font-size: 13px; line-height: 1.6; }
    #facility-browser .facility-filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: start; padding: 18px; border: 1px solid #e0eae5; border-radius: 10px; background: #f7faf8; }
    #facility-browser .facility-field { min-width: 0; }
    #facility-browser .facility-field label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; }
    #facility-browser .facility-field :is(input, select) { display: block; width: 100%; min-height: 42px; padding: 9px 10px; border: 1px solid #cddbd4; border-radius: 7px; background: #fff; color: #183c35; font-size: 13px; }
    #facility-browser .facility-field [aria-invalid="true"] { border-color: #b42318; }
    #facility-browser .facility-field-error { margin-top: 5px; color: #b42318; font-size: 12px; }
    #facility-browser .facility-field-error:empty { display: none; }
    #facility-browser .facility-filter-actions { display: flex; align-items: center; gap: 16px; grid-column: 1 / -1; }
    #facility-browser .facility-button { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 10px 16px; border: 1px solid #007f6d; border-radius: 7px; background: #007f6d; color: #fff; font-size: 13px; font-weight: 600; }
    #facility-browser .facility-button:hover { background: #006657; }
    #facility-browser .facility-text-link { color: #007363; font-size: 13px; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
    #facility-browser .facility-browser-note { margin: 14px 0; }
    #facility-browser .facility-search-feedback { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; color: #5b716a; font-size: 13px; }
    #facility-browser .facility-search-feedback:has(p:empty):has(button[hidden]) { display: none; }
    #facility-browser .facility-search-feedback.has-error { color: #b42318; }
    #facility-browser #facility-results[aria-busy="true"] { opacity: .6; pointer-events: none; }
    #facility-browser .facility-result-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px 16px; margin-bottom: 14px; color: #61746d; font-size: 12px; }
    #facility-browser .facility-result-heading strong { color: #183c35; font-weight: 600; }
    #facility-browser .facility-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
    #facility-browser .facility-card { min-width: 0; overflow: hidden; border: 1px solid #dce6e0; border-radius: 10px; background: #fff; }
    #facility-browser .facility-cover { position: relative; background: #eaf1ed; }
    #facility-browser .facility-cover img { display: block; width: 100%; height: 180px; object-fit: cover; }
    #facility-browser .facility-photo-note { position: absolute; right: 10px; bottom: 10px; padding: 3px 8px; border-radius: 5px; background: rgb(255 255 255 / 94%); color: #476358; font-size: 10px; }
    #facility-browser .facility-card-content { padding: 18px; }
    #facility-browser .facility-card-heading { display: flex; align-items: start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
    #facility-browser h3 { margin: 0; font-size: 16px; font-weight: 700; overflow-wrap: anywhere; }
    #facility-browser .facility-badge { flex-shrink: 0; padding: 3px 8px; border: 1px solid #c4dfd0; border-radius: 20px; background: #edf7ef; color: #276244; font-size: 10px; font-weight: 600; }
    #facility-browser .facility-badge.is-inactive { border-color: #dddfe0; background: #f3f4f4; color: #626b68; }
    #facility-browser .facility-metadata { display: grid; grid-template-columns: 66px minmax(0, 1fr); gap: 6px 12px; margin: 0; font-size: 12px; line-height: 1.5; }
    #facility-browser .facility-metadata dt { color: #6b7b73; }
    #facility-browser .facility-metadata dd { margin: 0; color: #23483d; overflow-wrap: anywhere; }
    #facility-browser .facility-description { margin: 12px 0 0; color: #607267; font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
    #facility-browser .facility-gallery, #facility-browser .facility-slot-disclosure { margin-top: 14px; }
    #facility-browser summary { cursor: pointer; color: #006e5e; font-size: 12px; font-weight: 600; }
    #facility-browser summary:hover { text-decoration: underline; }
    #facility-browser .facility-gallery-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    #facility-browser .facility-gallery img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 6px; background: #edf2ee; }
    #facility-browser .facility-gallery figcaption { margin-top: 4px; color: #61746d; font-size: 11px; overflow-wrap: anywhere; }
    #facility-browser .facility-slot-content { margin-top: 10px; }
    #facility-browser .facility-slot-note { margin-bottom: 9px; color: #61746d; font-size: 11px; line-height: 1.5; }
    #facility-browser .facility-slot-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; list-style: none; padding: 0; margin: 0; }
    #facility-browser .facility-slot-grid li { display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 7px 9px; border: 1px solid #e2e8e4; border-radius: 5px; background: #f7f9f7; font-size: 10px; }
    #facility-browser .facility-slot-grid .is-available { border-color: #cee5d9; background: #eff8f3; }
    #facility-browser .facility-slot-grid .facility-slot-status { color: #6b7470; font-weight: 600; }
    #facility-browser .facility-slot-grid .is-available .facility-slot-status { color: #196348; }
    #facility-browser .facility-slot-message { color: #61746d; font-size: 12px; }
    #facility-browser .facility-slot-message.has-error { color: #b42318; }
    #facility-browser .facility-slot-content .facility-text-link { display: inline-block; margin-top: 7px; font-size: 12px; }
    #facility-browser .facility-card-actions { margin-top: 16px; padding-top: 14px; border-top: 1px solid #edf1ee; }
    #facility-browser .facility-card-actions .facility-button { width: 100%; }
    #facility-browser .facility-inactive-note { color: #737f77; font-size: 12px; }
    #facility-browser .facility-empty { padding: 32px 16px; border: 1px dashed #cddbd3; border-radius: 10px; background: #f7faf8; text-align: center; }
    #facility-browser .facility-empty strong { display: block; margin-bottom: 6px; font-size: 14px; }
    #facility-browser .facility-empty p { margin-bottom: 12px; color: #61746d; font-size: 13px; }
    #facility-browser .facility-pagination { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px; margin-top: 20px; }
    #facility-browser .facility-pagination :is(a, span) { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; min-width: 36px; padding: 6px 10px; border: 1px solid #d8e5dd; border-radius: 6px; background: #fff; color: #426256; font-size: 12px; }
    #facility-browser .facility-pagination [aria-current="page"] { border-color: #007f6d; background: #007f6d; color: #fff; }
    #facility-browser .facility-pagination [aria-disabled="true"] { color: #9aa59f; background: #f8faf8; }
    #facility-browser :is(a, button, input, select, summary):focus-visible { outline: 3px solid #76b6a2; outline-offset: 3px; }
    #facility-browser [hidden] { display: none !important; }
    @media (min-width: 1024px) { #facility-browser .facility-list { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (min-width: 1280px) { #facility-browser { margin-inline: 32px; } }
    @media (max-width: 1023px) { #facility-browser .facility-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 767px) {
        body:has(#facility-browser) > .min-h-screen { flex-direction: column; }
        body:has(#facility-browser) > .min-h-screen > aside { position: static; width: 100%; height: auto; }
        body:has(#facility-browser) > .min-h-screen > aside nav { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; }
        body:has(#facility-browser) > .min-h-screen > aside nav a { margin: 0; padding: 10px; border-radius: 8px; }
        body:has(#facility-browser) > .min-h-screen > aside > div:last-child { display: flex; align-items: center; flex-wrap: wrap; justify-content: space-between; gap: 8px; padding: 8px 16px; }
        body:has(#facility-browser) > .min-h-screen > aside > div:last-child > div:first-child { margin: 0; padding: 0; }
        body:has(#facility-browser) > .min-h-screen > aside .space-y-1 { display: flex; align-items: center; }
        body:has(#facility-browser) > .min-h-screen > aside .space-y-1 > * { margin-top: 0; }
        body:has(#facility-browser) main > .max-w-7xl { padding-inline: 16px; }
        #reservation-form .mb-6 > .flex { flex-wrap: wrap; gap: 8px; }
        #facility-browser { margin-inline: 16px; padding: 18px; }
        #facility-browser .facility-browser-heading { align-items: start; flex-direction: column; gap: 8px; }
        #facility-browser .facility-list { grid-template-columns: minmax(0, 1fr); }
        #facility-browser .facility-cover img { height: 190px; }
    }
    @media (max-width: 420px) {
        #facility-browser .facility-filters { grid-template-columns: minmax(0, 1fr); padding: 14px; }
        #facility-browser .facility-card-content { padding: 14px; }
        #facility-browser .facility-card-heading { flex-wrap: wrap; }
        #facility-browser .facility-filter-actions { flex-wrap: wrap; }
    }
</style>

@vite('resources/js/user/facility-browser.js')
