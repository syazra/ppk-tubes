import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

// Execute the production hook with deterministic state/effect scheduling and fetch.
const source = readFileSync(new URL('../../resources/js/hooks/useRoomSlots.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/, '')
    .replace('export default function useRoomSlots', 'function useRoomSlots');

function setup() {
    const states = [];
    const effects = [];
    const requests = [];
    let stateIndex = 0;
    let effectIndex = 0;
    let pending = [];
    const globals = {
        AbortController, URL, window: { location: { origin: 'http://localhost' } },
        useState(initial) {
            const index = stateIndex++;
            if (!(index in states)) states[index] = initial;
            return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
        },
        useEffect(callback, deps) {
            const index = effectIndex++;
            const previous = effects[index];
            if (!previous || deps.some((value, position) => value !== previous.deps[position])) {
                previous?.cleanup?.();
                effects[index] = { deps };
                pending.push(() => { effects[index].cleanup = callback(); });
            }
        },
        fetch(url, options) {
            return new Promise((resolve, reject) => requests.push({ url, options, resolve, reject }));
        },
    };
    runInNewContext(`${source}\nglobalThis.hook = useRoomSlots;`, globals);
    return {
        requests,
        render(url = '/reservations/facilities/1/slots', date = '2026-10-12', enabled = true) {
            stateIndex = 0;
            effectIndex = 0;
            const result = globals.hook(url, date, enabled);
            const current = pending;
            pending = [];
            current.forEach(effect => effect());
            return result;
        },
        unmount() { effects.forEach(effect => effect.cleanup?.()); },
    };
}

const slots = Array.from({ length: 26 }, (_, index) => {
    const time = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return { start_time: time(420 + index * 30), end_time: time(450 + index * 30), status: index === 6 ? 'unavailable' : 'available' };
});
const response = (payload = { slots }, ok = true) => ({ ok, json: async () => payload });
const settle = () => new Promise(resolve => setImmediate(resolve));

test('React slot loading preserves the server schedule and selected date', async () => {
    const context = setup();
    assert.equal(context.render().loading, true);
    assert.equal(context.requests[0].url.searchParams.get('date'), '2026-10-12');
    assert.equal(context.requests[0].options.headers.Accept, 'application/json');
    context.requests[0].resolve(response());
    await settle();
    const result = context.render();
    assert.equal(result.loading, false);
    assert.equal(result.slots.length, 26);
    assert.equal(result.slots[6].status, 'unavailable');
    assert.equal(result.error, '');
    context.unmount();
});

test('changing facilities aborts the prior React request and ignores its late response', async () => {
    const context = setup();
    context.render();
    const nextUrl = '/reservations/facilities/2/slots';
    assert.equal(context.render(nextUrl).slots.length, 0);
    assert.equal(context.requests[0].options.signal.aborted, true);
    const nextSlots = slots.map(slot => ({ ...slot, status: 'available' }));
    context.requests[1].resolve(response({ slots: nextSlots }));
    await settle();
    context.requests[0].resolve(response());
    await settle();
    assert.equal(context.render(nextUrl).slots[6].status, 'available');
    context.unmount();
});

test('malformed and failed slot responses hide the schedule and retry can recover', async () => {
    for (const invalid of [{ slots: [] }, { slots: slots.slice(1) }, { slots: slots.map(() => null) }, { slots: slots.map(slot => ({ ...slot, status: 'unknown' })) }]) {
        const context = setup();
        context.render();
        context.requests[0].resolve(response(invalid));
        await settle();
        const failed = context.render();
        assert.equal(failed.slots.length, 0);
        assert.match(failed.error, /Gagal memuat/);
        failed.retry();
        context.render();
        context.requests[1].resolve(response());
        await settle();
        assert.equal(context.render().slots.length, 26);
        context.unmount();
    }
    const context = setup();
    context.render();
    context.requests[0].resolve(response({}, false));
    await settle();
    assert.match(context.render().error, /Gagal memuat/);
    context.unmount();
});

test('disabled React slot browsing makes no request and unmount aborts active fetches', () => {
    const context = setup();
    assert.equal(context.render('', '', false).loading, false);
    assert.equal(context.requests.length, 0);
    context.render();
    context.unmount();
    assert.equal(context.requests[0].options.signal.aborted, true);
});
