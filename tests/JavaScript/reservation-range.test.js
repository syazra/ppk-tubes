import test from 'node:test';
import assert from 'node:assert/strict';
import { selectReservationRange } from '../../resources/js/lib/reservationRange.js';

const slots = Array.from({ length: 26 }, (_, index) => {
    const time = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return { start_time: time(420 + index * 30), end_time: time(450 + index * 30), status: 'available' };
});

test('the second click on the same slot confirms a 30-minute reservation', () => {
    const first = selectReservationRange(slots, 4, null, '', '');
    assert.equal(first.anchor, 4);
    assert.deepEqual(selectReservationRange(slots, 4, first.anchor, first.startTime, first.endTime), {
        anchor: null, startTime: '09:00', endTime: '09:30', message: '',
    });
});
test('a reverse selection includes both endpoints', () => {
    assert.deepEqual(selectReservationRange(slots, 2, 5, '09:30', '10:00'), {
        anchor: null, startTime: '08:00', endTime: '10:00', message: '',
    });
});
test('clicking a confirmed range clears it; clicking outside begins another range', () => {
    assert.equal(selectReservationRange(slots, 4, null, '09:00', '10:00').startTime, '');
    assert.equal(selectReservationRange(slots, 8, null, '09:00', '10:00').anchor, 8);
});
test('selection cannot cross a blocked slot', () => {
    const blocked = slots.map((slot, index) => index === 3 ? { ...slot, status: 'unavailable' } : slot);
    assert.match(selectReservationRange(blocked, 5, 2, '08:00', '08:30').message, /tidak tersedia/);
    assert.equal(selectReservationRange(blocked, 3, null, '', ''), null);
});
test('three hours is allowed and a longer range clears the selection', () => {
    assert.equal(selectReservationRange(slots, 5, 0, '07:00', '07:30').endTime, '10:00');
    const tooLong = selectReservationRange(slots, 6, 0, '07:00', '07:30');
    assert.equal(tooLong.startTime, '');
    assert.match(tooLong.message, /maksimal 3 jam/);
});
