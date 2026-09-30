import { Link } from '@inertiajs/react';

const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';

function paginationLabel(label) {
    const text = label.replace('&laquo; ', '').replace(' &raquo;', '').trim();
    return { Previous: 'Sebelumnya', Next: 'Berikutnya' }[text] ?? text;
}

export default function FilterTable({
    title,
    description,
    filterForm,
    onSubmit,
    filterFields,
    rows,
    columns,
    renderRow,
    emptyMessage,
    errorMessage,
    recordLabel,
    paginationLabel: navigationLabel,
}) {
    return (
        <section className="mb-8 max-w-7xl px-6 lg:px-8">
            <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-teal-darker">{title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                </div>

                <form onSubmit={onSubmit} className="mb-5 grid gap-3 md:grid-cols-[1fr_15rem_auto]">
                    {filterFields.map(field => (
                        <div key={field.name}>
                            <label htmlFor={field.id} className="sr-only">{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    id={field.id}
                                    value={filterForm.data[field.name]}
                                    onChange={event => filterForm.setData(field.name, event.target.value)}
                                    className={inputClass}
                                >
                                    {field.options.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id={field.id}
                                    type={field.type ?? 'search'}
                                    value={filterForm.data[field.name]}
                                    onChange={event => filterForm.setData(field.name, event.target.value)}
                                    placeholder={field.placeholder}
                                    className={inputClass}
                                />
                            )}
                        </div>
                    ))}
                    <button type="submit" disabled={filterForm.processing} className="rounded-xl border border-teal-dark-01 px-5 py-3 text-sm font-semibold text-teal-dark-01 hover:bg-teal-light-01 disabled:opacity-60">
                        Terapkan filter
                    </button>
                </form>

                {errorMessage && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                        <thead className="bg-teal-light-01 text-xs uppercase tracking-wide text-teal-darker">
                            <tr>
                                {columns.map(column => <th key={column.label} scope="col" className="px-4 py-3">{column.label}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.data.map(row => <tr key={row.id}>{renderRow(row)}</tr>)}
                            {rows.data.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">{emptyMessage}</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <p className="text-gray-600">Menampilkan {rows.from ?? 0}–{rows.to ?? 0} dari {rows.total} {recordLabel}</p>
                    <nav aria-label={navigationLabel} className="flex flex-wrap gap-1">
                        {rows.links.map((link, index) => link.url
                            ? <Link key={index} href={link.url} preserveState preserveScroll className={`rounded border px-3 py-1.5 ${link.active ? 'border-teal-dark-01 bg-teal-dark-01 text-white-01' : 'border-gray-300 text-teal-darker hover:bg-teal-light-01'}`}>{paginationLabel(link.label)}</Link>
                            : <span key={index} className="rounded border border-gray-200 px-3 py-1.5 text-gray-400">{paginationLabel(link.label)}</span>)}
                    </nav>
                </div>
            </div>
        </section>
    );
}