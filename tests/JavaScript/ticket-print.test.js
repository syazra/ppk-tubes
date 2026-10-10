import assert from 'node:assert/strict';
import test from 'node:test';
import { printTicket } from '../../resources/js/lib/ticketPrint.js';

test('printing creates a ticket-only document and waits for its resources before opening print', async () => {
    const calls = [];
    const ticketRoot = {};
    const popup = {
        document: {
            write: value => calls.push(['markup', value]),
            close: () => calls.push(['document-close']),
            getElementById: id => { assert.equal(id, 'print-ticket'); return ticketRoot; },
        },
        focus: () => calls.push(['focus']),
        print: () => calls.push(['print']),
        close: () => calls.push(['popup-close']),
    };
    let resolveReady;
    const pending = printTicket('<section>Tiket RSV-42 dan QR</section>', {
        browser: { open: (url, target) => { assert.equal(url, ''); assert.equal(target, '_blank'); return popup; } },
        waitForReady: (root, { browser }) => {
            assert.equal(root, ticketRoot);
            assert.equal(browser, popup);
            return new Promise(resolve => { resolveReady = resolve; });
        },
    });
    assert.match(calls[0][1], /<main id="print-ticket"><section>Tiket RSV-42 dan QR<\/section><\/main>/);
    assert.equal(calls.some(([call]) => call === 'print'), false);
    resolveReady(true);
    await pending;
    assert.deepEqual(calls.slice(1), [['document-close'], ['focus'], ['print']]);
});

test('a blocked popup produces an actionable error without printing the reservation page', async () => {
    await assert.rejects(printTicket('ticket', { browser: { open: () => null } }), /Izinkan popup/);
});

test('a failed print preparation closes its empty window and surfaces the failure', async () => {
    let closed = false;
    const popup = { document: { write() {}, close() {}, getElementById() { return {}; } }, close() { closed = true; } };
    await assert.rejects(printTicket('ticket', {
        browser: { open: () => popup }, waitForReady: async () => { throw new Error('Failed'); },
    }), /Failed/);
    assert.equal(closed, true);
});
