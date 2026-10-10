import assert from 'node:assert/strict';
import test from 'node:test';
import { reservationTicketFields, formatTime } from '../../resources/js/lib/reservationPresentation.js';

test('institution tickets retain all borrower, activity, participant, and facility details', () => {
    const fields = Object.fromEntries(reservationTicketFields({
        id: 42, reservation_type: 'Instansi', institution: 'Komunitas', activity_name: 'Seminar', desc: 'Dua sesi', participant_count: 0,
        user: { name: 'Nadia', email: 'nadia@example.test' }, room: { name: 'Aula', type: 'Aula', location: 'Timur' },
        date_to_reserv: '2026-10-20', start_time: '08:00:00', end_time: '10:30:00',
    }).map(({ label, value }) => [label, value]));
    assert.equal(fields.Peminjam, 'Nadia');
    assert.equal(fields.Email, 'nadia@example.test');
    assert.equal(fields.Instansi, 'Komunitas');
    assert.equal(fields['Nama Kegiatan'], 'Seminar');
    assert.equal(fields['Deskripsi Kegiatan'], 'Dua sesi');
    assert.equal(fields['Jumlah peserta'], 0);
    assert.equal(fields.Lokasi, 'Timur');
    assert.equal(fields.Tanggal, '20 Oktober 2026');
    assert.equal(fields.Waktu, '08:00 – 10:30');
    assert.equal(fields['Tujuan Penggunaan'], undefined);
});

test('individual tickets show the purpose and support older reservations with only a description', () => {
    const fields = reservationTicketFields({ id: 1, reservation_type: 'Individu', desc: 'Belajar mandiri' });
    assert.equal(fields.find(field => field.label === 'Tujuan Penggunaan').value, 'Belajar mandiri');
    assert.equal(fields.some(field => field.label === 'Instansi'), false);
    const current = reservationTicketFields({ id: 1, activity_name: 'Diskusi', desc: 'Catatan' });
    assert.equal(current.find(field => field.label === 'Tujuan Penggunaan').value, 'Diskusi');
});

test('missing optional relations and values render placeholders without crashing', () => {
    const fields = reservationTicketFields({ id: 1 });
    for (const label of ['Peminjam', 'Email', 'Fasilitas', 'Lokasi', 'Tanggal', 'Jumlah peserta']) {
        assert.equal(fields.find(field => field.label === label).value, '—');
    }
    assert.equal(formatTime(null), '—');
});
