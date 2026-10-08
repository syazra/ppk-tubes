import { useEffect, useState } from 'react';

export default function useRoomSlots(slotsUrl, date, enabled) {
	const [slots, setSlots] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [retry, setRetry] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		setSlots([]);
		setError('');
		if (!enabled || !date || !slotsUrl) {
			setLoading(false);
			return () => controller.abort();
		}

		setLoading(true);
		const url = new URL(slotsUrl, window.location.origin);
		url.searchParams.set('date', date);
		fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
			.then(response => {
				if (!response.ok) throw new Error('Slot request failed');
				return response.json();
			})
			.then(payload => {
				if (controller.signal.aborted) return;
				if (!Array.isArray(payload.slots) || payload.slots.length !== 26
					|| !payload.slots.every(slot => slot && typeof slot.start_time === 'string'
						&& typeof slot.end_time === 'string'
						&& ['available', 'unavailable'].includes(slot.status))) {
					throw new Error('Invalid slot response');
				}
				setSlots(payload.slots);
			})
			.catch(requestError => {
				if (!controller.signal.aborted && requestError.name !== 'AbortError') setError('Gagal memuat slot waktu. Silakan coba lagi.');
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});

		return () => controller.abort();
	}, [slotsUrl, date, enabled, retry]);

	return { slots, loading, error, retry: () => setRetry(value => value + 1) };
}
