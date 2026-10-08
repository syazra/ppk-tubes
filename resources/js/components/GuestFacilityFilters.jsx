import { useId } from 'react';
import Icon from './Icons';
import '../../css/guest-facility-filters.css';

export default function GuestFacilityFilters({ values, types, locations, errors = {}, processing, onChange, onSubmit, onReset }) {
    const id = useId();
    const fieldId = name => `${id}-${name}`;
    const fieldProps = name => ({
        id: fieldId(name),
        name,
        value: values[name],
        onChange,
        'aria-invalid': Boolean(errors[name]),
        'aria-describedby': errors[name] ? `${fieldId(name)}-error` : undefined,
    });
    const error = name => errors[name] && <p id={`${fieldId(name)}-error`} className="gff-error" role="alert">{errors[name]}</p>;

    return (
        <section className="gff" aria-labelledby={`${id}-heading`}>
            <form onSubmit={onSubmit} aria-busy={processing}>
                <div className="gff-header">
                    <div className="gff-title"><h2 id={`${id}-heading`}>Cari fasilitas</h2><span>07.00–20.00 WIB · Slot 30 menit</span></div>
                    <div className="gff-name">
                        <label className="gff-sr-only" htmlFor={fieldId('search')}>Nama fasilitas</label>
                        <input {...fieldProps('search')} type="search" placeholder="Cari nama fasilitas" maxLength={100} />
                        {error('search')}
                    </div>
                </div>
                <div className="gff-fields">
                    <div className="gff-field">
                        <label htmlFor={fieldId('type')}>Tipe fasilitas</label>
                        <select {...fieldProps('type')}><option value="">Semua tipe</option>{types.map(type => <option key={type} value={type}>{type}</option>)}</select>
                        {error('type')}
                    </div>
                    <div className="gff-field">
                        <label htmlFor={fieldId('location')}>Lokasi</label>
                        <input {...fieldProps('location')} type="search" placeholder="Cari lokasi" maxLength={100} list={`${id}-locations`} />
                        <datalist id={`${id}-locations`}>{locations.map(location => <option key={location} value={location} />)}</datalist>
                        {error('location')}
                    </div>
                    <div className="gff-field">
                        <label htmlFor={fieldId('capacity')}>Kapasitas minimum</label>
                        <input {...fieldProps('capacity')} type="number" min="1" max="100000" step="1" placeholder="Jumlah orang" />
                        {error('capacity')}
                    </div>
                    <div className="gff-field">
                        <label htmlFor={fieldId('date')}>Tanggal ketersediaan</label>
                        <input {...fieldProps('date')} type="date" required />
                        {error('date')}
                    </div>
                </div>
                <div className="gff-actions">
                    <button type="submit" className="gff-submit" disabled={processing}>{processing ? 'Memuat…' : 'Cari fasilitas'}<Icon name="landing-arrow" className="gff-icon" /></button>
                    <button type="button" className="gff-reset" onClick={onReset} disabled={processing}>Reset filter</button>
                </div>
            </form>
        </section>
    );
}
