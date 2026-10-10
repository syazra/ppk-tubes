import { useId, useRef } from 'react';
import Icon from './Icons';
import '../../css/guest-facility-filters.css';
import Button from './Button';
import ButtonGray from './ButtonGray';  

export default function GuestFacilityFilters({ values, types, locations = [], details = '07.00-20.00 WIB · Slot 30 menit', className = '', errors = {}, processing, onChange, onSubmit, onReset }) {
    const id = useId();
    const dateInputRef = useRef(null);
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
    const openDatePickerFromField = event => {
        if (event.target !== event.currentTarget) return;

        const input = dateInputRef.current;
        if (!input) return;

        if (typeof input.showPicker === 'function') {
            input.showPicker();
        } else {
            input.focus();
            input.click();
        }
    };

    return (
        <section className={`gff ${className}`.trim()} aria-labelledby={`${id}-heading`}>
            <form onSubmit={onSubmit} aria-busy={processing}>
                {/* HEADER */}
                <div className="gff-header">
                    <div className="gff-title">
                        <h2 id={`${id}-heading`}>Cari fasilitas</h2>
                        <span>{details}</span>
                    </div>
                </div>

                {/* FILTERS */}
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
                    <div className="gff-field" onClick={openDatePickerFromField}>
                        <label htmlFor={fieldId('date')}>Tanggal ketersediaan</label>
                        <input
                            {...fieldProps('date')}
                            ref={dateInputRef}
                            type="date"
                            onClick={event => {
                                if (typeof event.currentTarget.showPicker === 'function') {
                                    event.currentTarget.showPicker();
                                }
                            }}
                            required
                        />
                        {error('date')}
                    </div>
                </div>
                <div className="gff-actions">
                    <Button type="submit" className="gff-submit" disabled={processing}>{processing ? 'Memuat…' : 'Cari fasilitas'}<Icon name="landing-arrow" className="gff-icon" /></Button>
                    <ButtonGray type="button" className="gff-reset" onClick={onReset} disabled={processing}>Reset filter</ButtonGray>
                </div>
            </form>
        </section>
    );
}
