import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { domEnvironment, element, response, settle } from './helpers/dom-stub.js';

const script = readFileSync(new URL('../../resources/js/user/facility-browser.js', import.meta.url), 'utf8');

function facilityList(label, rooms = ['1']) {
    const list = element('div', { dataset: { facilityList: '' } });
    const heading = element('div', { className: 'facility-result-heading' });
    const count = element('strong');
    count.textContent = label;
    heading.append(count);
    list.append(heading);
    for (const id of rooms) {
        const card = element('article');
        const disclosure = element('details', {
            dataset: { roomSlots: '', roomId: id, slotsUrl: `/reservations/facilities/${id}/slots` },
        });
        const content = element('div', { dataset: { slotContent: '' } });
        const message = element('p');
        message.textContent = 'Buka untuk memuat status setiap slot.';
        content.append(message);
        disclosure.append(content);
        const label = id === '2' ? 'Aula · Gedung B' : 'Lab Komputer · Gedung A';
        card.append(disclosure, element('button', { dataset: { selectFacility: id, facilityLabel: label } }));
        list.append(card);
    }
    return list;
}

function setup(initialList = facilityList('Daftar awal')) {
    const context = domEnvironment();
    const browser = element('section', {
        id: 'facility-browser',
        dataset: { resultsUrl: '/reservations/facilities', date: '2026-10-06', timezone: 'Asia/Jakarta' },
    });
    const form = element('form', { id: 'facility-filters', action: 'http://localhost:8000/reservations/form' });
    const fields = new Map(['type', 'location', 'capacity', 'date'].map(name => [name, element('input', { value: name === 'date' ? '2026-10-06' : '' })]));
    form.fields = fields;
    form.elements = { namedItem: name => fields.get(name) };
    for (const [name, input] of fields) {
        const error = element('p', { dataset: { filterError: name } });
        form.append(input, error);
    }
    const results = element('div', { id: 'facility-results' });
    results.append(initialList);
    const feedback = element('div', { className: 'facility-search-feedback' });
    const status = element('p', { dataset: { searchStatus: '' } });
    const retry = element('button', { hidden: true, dataset: { searchRetry: '' } });
    feedback.append(status, retry);
    browser.append(form, feedback, results);

    const reservationForm = element('form', { id: 'reservation-form' });
    const room = element('input', { id: 'room_id', type: 'hidden', value: '1' });
    const selectedFacility = element('p', { id: 'selected-facility', tabIndex: -1 });
    selectedFacility.textContent = 'Fasilitas dipilih: Lab Komputer · Gedung A';
    const date = element('input', { id: 'date_to_reserv', value: '2026-10-09', min: '2026-10-05' });
    const purpose = element('textarea', { id: 'desc', value: 'Tujuan yang sudah diketik' });
    const start = element('input', { id: 'start_time', value: '10:00' });
    const end = element('input', { id: 'end_time', value: '11:00' });
    let roomChanges = 0;
    room.addEventListener('change', () => { roomChanges++; });
    reservationForm.append(room, selectedFacility, date, purpose, start, end);
    context.body.append(browser, reservationForm);
    runInNewContext(script, context.globals);
    return { ...context, browser, form, fields, results, status, retry, feedback, room, selectedFacility, date, purpose, start, end, reservationForm, get roomChanges() { return roomChanges; } };
}

function fragment(context, label, rooms = ['1']) {
    const list = facilityList(label, rooms);
    const html = `<fragment>${label}</fragment>`;
    context.htmlFragments.set(html, [list]);
    return { list, result: response({ html }) };
}

function slotPayload(date = '2026-10-06', available = true, room = '1') {
    const time = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return {
        room_id: Number(room), date,
        slots: Array.from({ length: 26 }, (_, index) => ({
            start_time: time(420 + index * 30), end_time: time(450 + index * 30),
            status: available ? 'available' : 'unavailable',
        })),
    };
}

function open(context, disclosure = context.results.querySelector('[data-room-slots]')) {
    disclosure.open = true;
    disclosure.emit('toggle', { bubbles: false });
    return disclosure;
}

function assertFormPreserved(context) {
    assert.equal(context.purpose.value, 'Tujuan yang sudah diketik');
    assert.equal(context.date.value, '2026-10-09');
    assert.equal(context.room.value, '1');
    assert.equal(context.selectedFacility.textContent, 'Fasilitas dipilih: Lab Komputer · Gedung A');
    assert.equal(context.start.value, '10:00');
    assert.equal(context.end.value, '11:00');
    assert.equal(context.roomChanges, 0);
}

test('rapid filter requests discard late responses and preserve every original reservation input', async () => {
    const context = setup();
    context.fields.get('location').value = 'Gedung A';
    context.form.emit('submit');
    context.fields.get('location').value = 'Gedung B';
    context.form.emit('submit');
    assert.equal(context.requests[0].options.signal.aborted, true);
    context.requests[1].resolve(fragment(context, 'Hasil Gedung B', ['2']).result);
    await settle();
    context.requests[0].resolve(fragment(context, 'Hasil Gedung A').result);
    await settle();
    assert.match(context.results.textContent, /Hasil Gedung B/);
    assert.doesNotMatch(context.results.textContent, /Hasil Gedung A/);
    assert.equal(new URL(context.history.changes.at(-1)).searchParams.get('location'), 'Gedung B');
    assert.equal(context.results.getAttribute('aria-busy'), 'false');
    assertFormPreserved(context);
});

test('date changes reload expanded cards and discard an earlier card slot response', async () => {
    const context = setup();
    const oldDisclosure = open(context);
    const oldContent = oldDisclosure.querySelector('[data-slot-content]');
    assert.equal(context.requests[0].url.searchParams.get('date'), '2026-10-06');
    context.fields.get('date').value = '2026-10-07';
    context.fields.get('date').emit('change');
    assert.equal(context.requests[0].options.signal.aborted, true);
    context.requests[1].resolve(fragment(context, 'Daftar tanggal terbaru').result);
    await settle();
    assert.equal(context.requests[2].url.searchParams.get('date'), '2026-10-07');
    context.requests[2].resolve(response({ json: slotPayload('2026-10-07', false) }));
    await settle();
    context.requests[0].resolve(response({ json: slotPayload('2026-10-06', true) }));
    await settle();
    const grid = context.results.querySelector('.facility-slot-grid');
    assert.equal(grid.children.length, 26);
    assert.ok(grid.children.every(slot => slot.textContent.endsWith('Tidak tersedia')));
    assert.equal(oldDisclosure.isConnected, false);
    assert.match(oldContent.textContent, /Memuat/);
    assertFormPreserved(context);
});

test('closing and reopening a disclosure guards the newer request even when the cancelled fetch resolves', async () => {
    const context = setup();
    const disclosure = open(context);
    disclosure.open = false;
    disclosure.emit('toggle', { bubbles: false });
    open(context, disclosure);
    assert.equal(context.requests.length, 2);
    assert.equal(context.requests[0].options.signal.aborted, true);
    context.requests[0].resolve(response({ json: slotPayload() }));
    await settle();
    disclosure.emit('toggle', { bubbles: false });
    assert.equal(context.requests.length, 2, 'Old finally must not delete the newer pending request.');
    context.requests[1].resolve(response({ json: slotPayload('2026-10-06', false) }));
    await settle();
    assert.ok(context.results.querySelector('.facility-slot-grid').children.every(slot => slot.textContent.endsWith('Tidak tersedia')));
});

test('invalid slot payloads fail visibly and the card retry loads textual statuses', async () => {
    const context = setup();
    open(context);
    const invalid = slotPayload();
    invalid.slots[0].status = 'unexpected';
    context.requests[0].resolve(response({ json: invalid }));
    await settle();
    assert.equal(context.results.querySelector('.facility-slot-grid'), null);
    assert.match(context.results.textContent, /Gagal memuat slot/);
    const retry = context.results.querySelector('[data-retry-slots]');
    retry.emit('click');
    context.requests[1].resolve(response({ json: slotPayload() }));
    await settle();
    const grid = context.results.querySelector('.facility-slot-grid');
    assert.equal(grid.children.length, 26);
    assert.ok(grid.children.every(slot => slot.textContent.endsWith('Tersedia')));
    assert.equal(grid.children[0].textContent, '07:00–07:30Tersedia');
    assert.equal(grid.children.at(-1).textContent, '19:30–20:00Tersedia');
});

test('failed searches retain the current list, expose retry, and leave the original form alone', async () => {
    const context = setup();
    context.form.emit('submit');
    context.requests[0].reject(new Error('Connection lost'));
    await settle();
    assert.match(context.results.textContent, /Daftar awal/);
    assert.match(context.status.textContent, /Gagal memperbarui/);
    assert.equal(context.retry.hidden, false);
    assertFormPreserved(context);
    context.retry.emit('click');
    context.requests[1].resolve(fragment(context, 'Hasil setelah coba lagi').result);
    await settle();
    assert.match(context.results.textContent, /Hasil setelah coba lagi/);
    assert.equal(context.retry.hidden, true);
});

test('validation errors use their field labels and a late success cannot erase the current error state', async () => {
    const context = setup();
    context.form.emit('submit');
    context.fields.get('capacity').value = '-1';
    context.form.emit('submit');
    context.requests[1].resolve(response({ status: 422, json: { errors: { capacity: ['Kapasitas minimal satu orang.'] } } }));
    await settle();
    context.requests[0].resolve(fragment(context, 'Hasil lama').result);
    await settle();
    assert.match(context.results.textContent, /Daftar awal/);
    assert.equal(context.fields.get('capacity').getAttribute('aria-invalid'), 'true');
    assert.equal(context.fields.get('capacity').focused, true);
    assert.match(context.form.querySelector('[data-filter-error="capacity"]').textContent, /minimal satu/);
    assertFormPreserved(context);
});

test('facility selection fills the hidden room input and readout through the existing room change listener', () => {
    const context = setup(facilityList('Daftar awal', ['2']));
    const choose = context.results.querySelector('[data-select-facility]');
    choose.dataset.selectFacility = 'invalid';
    choose.emit('click');
    assertFormPreserved(context);
    choose.dataset.selectFacility = '2';
    choose.dataset.facilityLabel = '';
    choose.emit('click');
    assertFormPreserved(context);
    choose.dataset.facilityLabel = 'Aula · Gedung B';
    choose.emit('click');
    assert.equal(context.room.value, '2');
    assert.equal(context.selectedFacility.textContent, 'Fasilitas dipilih: Aula · Gedung B');
    assert.equal(context.date.value, '2026-10-06');
    assert.equal(context.roomChanges, 1);
    assert.equal(context.purpose.value, 'Tujuan yang sudah diketik');
    assert.equal(context.reservationForm.scrolled, true);
    assert.equal(context.selectedFacility.focused, true);
    assert.equal(context.room.focused, undefined, 'Hidden fields must not receive keyboard focus.');
});

test('a past catalog date never overwrites the original reservation date', async () => {
    const context = setup();
    context.fields.get('date').value = '2026-10-04';
    context.fields.get('date').emit('change');
    context.requests[0].resolve(fragment(context, 'Tanggal lampau').result);
    await settle();
    context.results.querySelector('[data-select-facility]').emit('click');
    assert.equal(context.date.value, '2026-10-09');
    assert.equal(context.roomChanges, 1);
    assert.equal(context.purpose.value, 'Tujuan yang sudah diketik');
});

test('the preserved SVG fallback replaces broken photos once without an error loop', () => {
    const list = facilityList('Daftar awal');
    const cover = element('div', { className: 'facility-cover' });
    const image = element('img', { src: '/missing.jpg', complete: true, naturalWidth: 0, dataset: { imageFallback: '/images/facility-placeholder.svg' } });
    const note = element('span', { className: 'facility-photo-note' });
    note.textContent = 'Foto ilustrasi';
    cover.append(image, note);
    list.append(cover);
    setup(list);
    assert.equal(image.src, '/images/facility-placeholder.svg');
    assert.equal(image.alt, 'Tidak ada foto fasilitas');
    assert.equal(note.textContent, 'Belum ada foto');
    assert.equal(image.dataset.imageFallback, undefined);
    image.emit('error');
    assert.equal(image.src, '/images/facility-placeholder.svg');
});
