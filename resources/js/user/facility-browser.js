const browser = document.getElementById('facility-browser');

if (browser) {
    const form = browser.querySelector('#facility-filters');
    const results = browser.querySelector('#facility-results');
    const dateInput = form.elements.namedItem('date');
    const feedback = browser.querySelector('.facility-search-feedback');
    const status = browser.querySelector('[data-search-status]');
    const retrySearch = browser.querySelector('[data-search-retry]');
    const slotRequests = new Map();
    let catalogDate = browser.dataset.date;
    let generation = 0;
    let searchController;
    let lastSearchUrl;

    function filterParameters() {
        return new URLSearchParams([...new FormData(form)].filter(([, value]) => value !== ''));
    }

    function clearFilterErrors() {
        browser.querySelectorAll('[data-filter-error]').forEach(element => {
            element.textContent = '';
            form.elements.namedItem(element.dataset.filterError)?.removeAttribute('aria-invalid');
        });
    }

    function showFilterErrors(errors) {
        browser.querySelectorAll('[data-filter-error]').forEach(element => {
            const messages = errors[element.dataset.filterError];
            if (messages?.length) {
                element.textContent = messages[0];
                form.elements.namedItem(element.dataset.filterError)?.setAttribute('aria-invalid', 'true');
            }
        });
        form.querySelector('[aria-invalid="true"]')?.focus();
    }

    function setFeedback(message, error = false) {
        status.textContent = message;
        feedback.classList.toggle('has-error', error);
        retrySearch.hidden = !error;
    }

    function imageFallback(image) {
        if (!(image instanceof HTMLImageElement) || !image.dataset.imageFallback) return;
        const fallback = image.dataset.imageFallback;
        delete image.dataset.imageFallback;
        image.src = fallback;
        image.alt = 'Tidak ada foto fasilitas';
        const note = image.closest('.facility-cover')?.querySelector('.facility-photo-note');
        if (note) note.textContent = 'Belum ada foto';
    }

    function checkImages() {
        results.querySelectorAll('img[data-image-fallback]').forEach(image => {
            if (image.complete && image.naturalWidth === 0) imageFallback(image);
        });
    }

    function abortSlotRequests() {
        slotRequests.forEach(controller => controller.abort());
        slotRequests.clear();
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' })
            .format(new Date(`${date}T00:00:00Z`));
    }

    function slotMessage(content, message, error = false) {
        const paragraph = document.createElement('p');
        paragraph.className = `facility-slot-message${error ? ' has-error' : ''}`;
        paragraph.textContent = message;
        content.replaceChildren(paragraph);
        if (error) {
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'facility-text-link';
            retry.dataset.retrySlots = '';
            retry.textContent = 'Coba lagi';
            content.append(retry);
        }
    }

    async function loadSlots(disclosure) {
        if (!disclosure.open || disclosure.dataset.loadedDate === catalogDate || slotRequests.has(disclosure)) return;
        const content = disclosure.querySelector('[data-slot-content]');
        const requestedDate = catalogDate;
        const requestedGeneration = generation;
        const controller = new AbortController();
        slotRequests.set(disclosure, controller);
        content.setAttribute('aria-busy', 'true');
        slotMessage(content, 'Memuat slot waktu…');
        const url = new URL(disclosure.dataset.slotsUrl, window.location.origin);
        url.searchParams.set('date', requestedDate);

        const isCurrent = () => requestedGeneration === generation
            && requestedDate === catalogDate && disclosure.isConnected && results.contains(disclosure)
            && disclosure.open && slotRequests.get(disclosure) === controller;

        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                signal: controller.signal,
            });
            if (!response.ok) throw new Error('Slot request failed');
            const data = await response.json();
            if (!isCurrent()) return;
            const validTime = time => typeof time === 'string' && /^\d{2}:\d{2}$/.test(time);
            if (String(data.room_id) !== disclosure.dataset.roomId || data.date !== requestedDate
                || !Array.isArray(data.slots) || data.slots.length !== 26
                || !data.slots.every(slot => validTime(slot.start_time) && validTime(slot.end_time)
                    && ['available', 'unavailable'].includes(slot.status))) {
                throw new Error('Unexpected slot response');
            }

            const note = document.createElement('p');
            note.className = 'facility-slot-note';
            note.textContent = `${formatDate(requestedDate)} · ${browser.dataset.timezone}`;
            const list = document.createElement('ul');
            list.className = 'facility-slot-grid';
            list.setAttribute('aria-label', `Status slot ${formatDate(requestedDate)}`);
            data.slots.forEach(slot => {
                const item = document.createElement('li');
                const available = slot.status === 'available';
                if (available) item.className = 'is-available';
                const time = document.createElement('span');
                time.textContent = `${slot.start_time}–${slot.end_time}`;
                const label = document.createElement('span');
                label.className = 'facility-slot-status';
                label.textContent = available ? 'Tersedia' : 'Tidak tersedia';
                item.append(time, label);
                list.append(item);
            });
            content.replaceChildren(note, list);
            disclosure.dataset.loadedDate = requestedDate;
        } catch (error) {
            if (error.name !== 'AbortError' && isCurrent()) {
                slotMessage(content, 'Gagal memuat slot waktu. Silakan coba lagi.', true);
            }
        } finally {
            if (slotRequests.get(disclosure) === controller) {
                slotRequests.delete(disclosure);
                content.setAttribute('aria-busy', 'false');
            }
        }
    }

    async function searchFacilities(parameters, moveFocus = false) {
        searchController?.abort();
        abortSlotRequests();
        const controller = new AbortController();
        searchController = controller;
        const requestedGeneration = ++generation;
        const openRooms = new Set([...results.querySelectorAll('[data-room-slots][open]')]
            .map(element => element.dataset.roomId));
        const url = new URL(browser.dataset.resultsUrl, window.location.origin);
        url.search = parameters.toString();
        lastSearchUrl = url;
        clearFilterErrors();
        setFeedback('Memuat fasilitas…');
        results.setAttribute('aria-busy', 'true');

        try {
            const response = await fetch(url, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                signal: controller.signal,
            });
            if (requestedGeneration !== generation) return;
            if (response.status === 422) {
                const data = await response.json();
                if (requestedGeneration !== generation) return;
                showFilterErrors(data.errors ?? {});
                setFeedback('Periksa filter yang ditandai. Daftar sebelumnya masih ditampilkan.', true);
                return;
            }
            if (!response.ok) throw new Error('Facility request failed');
            const html = await response.text();
            if (requestedGeneration !== generation) return;
            const template = document.createElement('template');
            template.innerHTML = html;
            const list = template.content.querySelector('[data-facility-list]');
            if (!list) throw new Error('Unexpected facility response');

            results.replaceChildren(list);
            catalogDate = parameters.get('date') || catalogDate;
            browser.dataset.date = catalogDate;
            results.querySelectorAll('[data-room-slots]').forEach(disclosure => {
                if (openRooms.has(disclosure.dataset.roomId)) disclosure.open = true;
            });
            const pageUrl = new URL(form.action, window.location.origin);
            pageUrl.search = parameters.toString();
            window.history.replaceState(window.history.state, '', pageUrl);
            setFeedback(`${results.querySelector('.facility-result-heading strong')?.textContent ?? 'Daftar diperbarui'}.`);
            checkImages();
            if (moveFocus) {
                results.tabIndex = -1;
                results.focus({ preventScroll: true });
                results.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        } catch (error) {
            if (error.name !== 'AbortError' && requestedGeneration === generation) {
                setFeedback('Gagal memperbarui daftar fasilitas. Daftar sebelumnya masih ditampilkan.', true);
            }
        } finally {
            if (requestedGeneration === generation) {
                results.setAttribute('aria-busy', 'false');
                results.querySelectorAll('[data-room-slots][open]').forEach(loadSlots);
            }
        }
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        searchFacilities(filterParameters());
    });

    dateInput.addEventListener('change', () => {
        if (form.reportValidity()) searchFacilities(filterParameters());
    });

    browser.addEventListener('toggle', event => {
        const disclosure = event.target;
        if (!disclosure.matches('[data-room-slots]')) return;
        if (disclosure.open) {
            loadSlots(disclosure);
        } else {
            slotRequests.get(disclosure)?.abort();
            slotRequests.delete(disclosure);
            disclosure.querySelector('[data-slot-content]').setAttribute('aria-busy', 'false');
        }
    }, true);

    browser.addEventListener('error', event => imageFallback(event.target), true);

    browser.addEventListener('click', event => {
        const reset = event.target.closest('[data-filter-reset]');
        if (reset) {
            event.preventDefault();
            ['type', 'location', 'capacity'].forEach(name => { form.elements.namedItem(name).value = ''; });
            if (form.reportValidity()) searchFacilities(filterParameters());
            return;
        }
        const page = event.target.closest('[data-facility-page]');
        if (page) {
            event.preventDefault();
            const parameters = new URL(page.href).searchParams;
            parameters.set('date', catalogDate);
            searchFacilities(parameters, true);
            return;
        }
        const retry = event.target.closest('[data-retry-slots]');
        if (retry) {
            loadSlots(retry.closest('[data-room-slots]'));
            return;
        }
        const choose = event.target.closest('[data-select-facility]');
        if (!choose) return;
        const roomInput = document.getElementById('room_id');
        const selectedFacility = document.getElementById('selected-facility');
        const reservationDate = document.getElementById('date_to_reserv');
        const reservationForm = document.getElementById('reservation-form');
        if (!roomInput || !reservationForm || !selectedFacility
            || !/^[1-9]\d*$/.test(choose.dataset.selectFacility ?? '') || !choose.dataset.facilityLabel) {
            setFeedback('Fasilitas ini belum dapat dipilih. Muat ulang halaman untuk memperbarui daftar ruangan.', true);
            return;
        }
        roomInput.value = choose.dataset.selectFacility;
        selectedFacility.textContent = `Fasilitas dipilih: ${choose.dataset.facilityLabel}`;
        if (reservationDate && (!reservationDate.min || catalogDate >= reservationDate.min)) {
            reservationDate.value = catalogDate;
        }
        // Reuse the existing reservation form's change listener and slot selection flow.
        roomInput.dispatchEvent(new Event('change', { bubbles: true }));
        reservationForm.scrollIntoView({ behavior: 'auto', block: 'start' });
        selectedFacility.focus({ preventScroll: true });
    });

    retrySearch.addEventListener('click', () => {
        if (lastSearchUrl) searchFacilities(lastSearchUrl.searchParams);
    });

    checkImages();
}
