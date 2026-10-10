import { waitForPageReady } from './pageReady.js';

export async function printTicket(markup, { browser = window, waitForReady = waitForPageReady } = {}) {
    const popup = browser.open('', '_blank');
    if (!popup) throw new Error('Izinkan popup untuk mencetak tiket.');
    try {
        popup.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Tiket reservasi</title><style>body{margin:0;background:#fff}#print-ticket{max-width:794px;margin:auto}@page{size:A4;margin:12mm}@media print{#print-ticket{max-width:none}dt{break-after:avoid}dd{break-before:avoid}dl>div{break-inside:avoid}}</style></head><body><main id="print-ticket">${markup}</main></body></html>`);
        popup.document.close();
        await waitForReady(popup.document.getElementById('print-ticket'), { browser: popup });
        popup.focus();
        popup.print();
    } catch (error) {
        popup.close();
        throw error;
    }
}
