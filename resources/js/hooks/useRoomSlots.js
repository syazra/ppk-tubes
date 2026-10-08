import { useEffect, useState } from 'react';

export default function useRoomSlots(slotsUrl, date, enabled) {
    const key = String(slotsUrl ?? '') + '|' + String(date ?? '');
    const [result, setResult] = useState({ key: '', slots: [], loading: false, error: '' });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        if (!enabled || !date || !slotsUrl) {
            setResult(previous => ({ ...previous, loading: false }));
            return () => controller.abort();
        }
        setResult({ key, slots: [], loading: true, error: '' });
        async function requestSlots() {
            try {
                const url = new URL(slotsUrl, window.location.origin);
                url.searchParams.set('date', date);
                const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
                if (!response.ok) throw new Error('Slot request failed');
                const payload = await response.json();
                if (controller.signal.aborted) return;
                if (!Array.isArray(payload.slots) || payload.slots.length !== 26
                    || !payload.slots.every(slot => slot && typeof slot.start_time === 'string'
                        && typeof slot.end_time === 'string'
                        && ['available', 'unavailable'].includes(slot.status))) throw new Error('Invalid slot response');
                setResult({ key, slots: payload.slots, loading: false, error: '' });
            } catch (error) {
                if (!controller.signal.aborted) setResult({ key, slots: [], loading: false, error: 'Gagal memuat slot waktu. Silakan coba lagi.' });
            }
        }
        requestSlots();
        return () => controller.abort();
    }, [slotsUrl, date, enabled, attempt, key]);

    const current = result.key === key;
    return {
        slots: current ? result.slots : [],
        loading: Boolean(enabled && date && slotsUrl && (!current || result.loading)),
        error: current ? result.error : '',
        retry: () => setAttempt(value => value + 1),
    };
}
