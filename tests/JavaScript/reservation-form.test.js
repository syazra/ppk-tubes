import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { domEnvironment, element, response, settle } from './helpers/dom-stub.js';

const view = readFileSync(new URL('../../resources/views/user/reservation-form.blade.php', import.meta.url), 'utf8');
const inlineScript = view.match(/<script>([\s\S]*?)<\/script>/)[1]
    .replaceAll('@js(\\App\\Services\\RoomAvailability::OPEN_TIME)', "'07:00'")
    .replaceAll('@js(\\App\\Services\\RoomAvailability::CLOSE_TIME)', "'20:00'")
    .replaceAll('@js(\\App\\Services\\RoomAvailability::STEP_MINUTES)', '30')
    .replaceAll("{{ route('reservations.slots') }}", '/reservations/slots');

function setup(oldInputs = {}) {
    const environment = domEnvironment();
    const ids = ['room_id', 'date_to_reserv', 'time-grid-hint', 'time-grid-wrapper', 'time-grid', 'time-labels', 'start_time', 'end_time', 'selected-range-text', 'desc'];
    const form = element('form', { id: 'reservation-form' });
    const nodes = Object.fromEntries(ids.map(id => [id, element('div', { id, value: oldInputs[id] ?? '' })]));
    form.append(...Object.values(nodes));
    environment.body.append(form);
    runInNewContext(inlineScript, environment.globals);
    return { ...environment, nodes, form, slot: time => nodes['time-grid'].children.find(node => node.textContent.startsWith(time)) };
}

const cutoff = '2026-10-05T09:00:00.000000+07:00';
const schedule = (ranges = [], earliest = cutoff) => response({ json: ranges, headers: { 'X-Reservation-Earliest-Start': earliest } });

async function load(context, ranges = [], date = '2026-10-06', earliest = cutoff) {
    context.nodes.room_id.value = '1';
    context.nodes.date_to_reserv.value = date;
    context.nodes.room_id.emit('change');
    context.requests.at(-1).resolve(schedule(ranges, earliest));
    await settle();
}

test('original form keeps all 26 half-hour intervals and adjacent booking boundaries available', async () => {
    const context = setup();
    await load(context, [{ start_time: '10:00:00', end_time: '11:00:00' }]);
    assert.equal(context.nodes['time-grid'].children.length, 26);
    assert.equal(context.slot('09:30').getAttribute('aria-disabled'), 'false');
    assert.equal(context.slot('10:00').getAttribute('aria-disabled'), 'true');
    assert.equal(context.slot('10:30').getAttribute('aria-disabled'), 'true');
    assert.equal(context.slot('11:00').getAttribute('aria-disabled'), 'false');
    assert.match(context.nodes['time-labels'].innerHTML, /20:00/);
});

test('historical bookings with seconds block every overlapping half-hour interval', async () => {
    const context = setup();
    await load(context, [{ start_time: '08:30:01', end_time: '09:00:01' }]);
    assert.equal(context.slot('08:00').getAttribute('aria-disabled'), 'false');
    assert.equal(context.slot('08:30').getAttribute('aria-disabled'), 'true');
    assert.equal(context.slot('09:00').getAttribute('aria-disabled'), 'true');
    assert.equal(context.slot('09:30').getAttribute('aria-disabled'), 'false');
});

test('server-local cutoff admits its exact boundary and rejects a boundary one microsecond early', async () => {
    const context = setup();
    await load(context, [], '2026-10-05');
    assert.equal(context.slot('08:30').getAttribute('aria-disabled'), 'true');
    assert.equal(context.slot('09:00').getAttribute('aria-disabled'), 'false');
    await load(context, [], '2026-10-05', '2026-10-05T09:00:00.000001+07:00');
    assert.equal(context.slot('09:00').getAttribute('aria-disabled'), 'true');
    assert.equal(context.slot('09:30').getAttribute('aria-disabled'), 'false');
});

test('keyboard selection, selected-slot cancellation, and rejection across a blocked interval reuse the form flow', async () => {
    const context = setup();
    context.nodes.desc.value = 'Tujuan yang sudah diketik';
    await load(context, [{ start_time: '09:30', end_time: '10:00' }]);
    context.slot('09:00').emit('keydown', { key: 'Enter' });
    assert.equal(context.nodes.start_time.value, '09:00');
    assert.equal(context.nodes.end_time.value, '09:30');
    assert.equal(context.slot('09:00').getAttribute('aria-pressed'), 'true');
    context.slot('09:00').emit('keydown', { key: ' ' });
    assert.equal(context.nodes.start_time.value, '');
    context.slot('09:00').emit('click');
    context.slot('10:00').emit('click');
    assert.equal(context.nodes.start_time.value, '');
    assert.equal(context.nodes.end_time.value, '');
    assert.equal(context.alerts.length, 1);
    assert.equal(context.nodes.desc.value, 'Tujuan yang sudah diketik');
});

test('late availability responses and late failures cannot replace the latest room schedule', async () => {
    const context = setup();
    context.nodes.date_to_reserv.value = '2026-10-06';
    context.nodes.room_id.value = '1';
    context.nodes.room_id.emit('change');
    context.nodes.room_id.value = '2';
    context.nodes.room_id.emit('change');
    assert.equal(context.requests[0].options.signal.aborted, true);
    context.requests[1].resolve(schedule([{ start_time: '10:00', end_time: '11:00' }]));
    await settle();
    context.requests[0].resolve(schedule());
    await settle();
    assert.equal(context.slot('10:00').getAttribute('aria-disabled'), 'true');

    context.nodes.room_id.value = '3';
    context.nodes.room_id.emit('change');
    context.nodes.room_id.value = '4';
    context.nodes.room_id.emit('change');
    context.requests[3].resolve(schedule());
    await settle();
    context.requests[2].reject(new Error('Old request failed'));
    await settle();
    assert.equal(context.nodes['time-grid-wrapper'].classList.contains('hidden'), false);
    assert.equal(context.nodes['time-grid-hint'].classList.contains('hidden'), true);
    assert.equal(context.consoleErrors.length, 0);
});

test('failed or malformed schedules clear selected times, hide the grid, and can recover', async () => {
    const context = setup();
    await load(context);
    context.slot('10:00').emit('click');
    context.nodes.room_id.emit('change');
    context.requests.at(-1).resolve(response({ status: 500 }));
    await settle();
    assert.equal(context.nodes.start_time.value, '');
    assert.equal(context.nodes.end_time.value, '');
    assert.equal(context.nodes['time-grid-wrapper'].classList.contains('hidden'), true);
    assert.match(context.nodes['time-grid-hint'].textContent, /Gagal memuat/);

    await load(context, [], '2026-10-06', 'invalid-cutoff');
    assert.equal(context.nodes['time-grid-wrapper'].classList.contains('hidden'), true);
    assert.match(context.nodes['time-grid-hint'].textContent, /Gagal memuat/);
    await load(context);
    assert.equal(context.nodes['time-grid-wrapper'].classList.contains('hidden'), false);
});

test('malformed booking ranges fail closed instead of rendering spurious available slots', async () => {
    const context = setup();
    for (const ranges of [
        [{ start_time: 'oops', end_time: '10:00' }],
        [{ start_time: '09:00', end_time: '09:00' }],
        [{ start_time: '10:00', end_time: '09:00' }],
        [{ start_time: '25:00', end_time: '26:00' }],
        [{ start_time: '09:60', end_time: '10:00' }],
        [{ start_time: '09:00:60', end_time: '10:00:00' }],
        [null],
    ]) {
        await load(context, ranges);
        assert.equal(context.nodes['time-grid-wrapper'].classList.contains('hidden'), true);
        assert.match(context.nodes['time-grid-hint'].textContent, /Gagal memuat/);
        assert.equal(context.nodes.start_time.value, '');
        assert.equal(context.nodes.end_time.value, '');
    }
    await load(context);
    assert.equal(context.nodes['time-grid-wrapper'].classList.contains('hidden'), false);
});

test('restored room/date automatically reload the schedule while preserving purpose', async () => {
    const context = setup({ room_id: '1', date_to_reserv: '2026-10-06', desc: 'Tujuan setelah validasi' });
    assert.equal(context.requests.length, 1);
    context.requests[0].resolve(schedule());
    await settle();
    assert.equal(context.nodes['time-grid'].children.length, 26);
    assert.equal(context.nodes.desc.value, 'Tujuan setelah validasi');
});
