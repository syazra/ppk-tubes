import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import FacilitiesCatalog from '../../components/FacilitiesCatalog';
import GuestFacilityFilters from '../../components/GuestFacilityFilters';
import Button from '../../components/Button';
import Icon from '../../components/Icons';

function getCatalogParams(filters, date) {
	return {
		type: filters.type ?? '',
		location: filters.location ?? '',
		capacity: filters.capacity ?? '',
		date: filters.date ?? date,
	};
}

export default function Catalog({
	user,
	csrfToken,
	urls,
	facilities,
	filters = {},
	types = [],
	locations = [],
	catalogDate,
	timezone,
	photoPlaceholderUrl,
	photoFallbackUrl,
}) {
	const filterForm = useForm(getCatalogParams(filters, catalogDate));
	const [catalogProcessing, setCatalogProcessing] = useState(false);

	function updateFilter(event) {
		filterForm.setData(event.target.name, event.target.value);
	}

	function applyFilters(event) {
		event.preventDefault();
		filterForm.get(urls.catalog, { preserveState: true, preserveScroll: true, replace: true });
	}

	function resetFilters() {
		const reset = { type: '', location: '', capacity: '', date: catalogDate };
		filterForm.setData(reset);
		router.get(urls.catalog, reset, { preserveScroll: true, replace: true });
	}

	return (
		<AppLayout
			user={user}
			csrfToken={csrfToken}
			urls={urls}
			active="catalog"
			title="Katalog Fasilitas"
			subtitle="Cari fasilitas dan periksa ketersediaan sebelum mengajukan reservasi."
		>
			<Head title="Katalog Fasilitas" />
            {/* FILTER */}
			<GuestFacilityFilters
				values={filterForm.data}
				types={types}
				locations={locations}
				details={`07.00-20.00 ${timezone === 'Asia/Jakarta' ? 'WIB' : timezone} · Slot 30 menit`}
				className="gff-contained"
				errors={filterForm.errors}
				processing={filterForm.processing}
				onChange={updateFilter}
				onSubmit={applyFilters}
				onReset={resetFilters}
			/>

            {/* KATALOG */}
			<section className="py-6">
				<FacilitiesCatalog
					rooms={facilities}
					selectedDate={catalogDate}
					processing={filterForm.processing || catalogProcessing}
					timezone={timezone}
					showSchedule
					photoPlaceholderUrl={photoPlaceholderUrl}
					photoFallbackUrl={photoFallbackUrl}
					onReset={resetFilters}
					onProcessingChange={setCatalogProcessing}
				>
					<div className="flex flex-row gap-2">
						<Button as={Link} href="/report/create">
							Laporkan kerusakan
						</Button>
						<Button as={Link} href="/reservations/form">
							Ajukan reservasi
						</Button>
					</div>
				</FacilitiesCatalog>
			</section>
		</AppLayout>
	);
}