import { Link } from '@inertiajs/react';
import { Children, cloneElement, Fragment, isValidElement, useEffect, useRef } from 'react';
import ExpandableDescription from './ExpandableDescription';

const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';

function paginationLabel(label) {
    const text = label.replace('&laquo; ', '').replace(' &raquo;', '').trim();
    return { Previous: 'Sebelumnya', Next: 'Berikutnya' }[text] ?? text;
}

function renderCells(row, columns, renderRow) {
    const renderedRow = renderRow(row);
    const cells = renderedRow?.type === Fragment ? renderedRow.props.children : renderedRow;

    return Children.map(cells, (cell, index) => {
        if (!isValidElement(cell) || cell.type !== 'td') return cell;

        const isDescription = columns[index]?.type === 'desc';
        const isAction = columns[index]?.type === 'act';

        let cellContent = cell.props.children;

        if (isDescription) {
            cellContent = (
                <div className="w-full min-w-[200px] break-words whitespace-normal">
                    <ExpandableDescription>
                        {cell.props.children}
                    </ExpandableDescription>
                </div>
            );
        } else if (isAction) {
            cellContent = (
                <div className="w-full max-w-[120px] break-words whitespace-normal">
                    {cell.props.children}
                </div>
            );
        }

        return cloneElement(cell, {
            className: `${cell.props.className || ''} align-top px-4 py-3`.trim(),
            children: cellContent,
        });
    });
}

export const DEFAULT_SORT_OPTIONS = [
    { value: 'created_near', label: 'Terbaru' },
    { value: 'created_far', label: 'Terlama' },
];

export default function FilterTable({
    title,
    description,
    filterForm,
    onSubmit,
    filterFields,
    categoryOptions,
    categoryName = 'status',
    categoryLabel = 'Filter kategori',
    categoryPlaceholder = 'Semua kategori',
    sortOptions = DEFAULT_SORT_OPTIONS,
    searchName = 'search',
    searchLabel = 'Cari',
    searchPlaceholder = 'Cari...',
    rows,
    columns,
    renderRow,
    emptyMessage,
    errorMessage,
    recordLabel,
    paginationLabel: navigationLabel,
}) {
    const submitTimeout = useRef(null);
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    useEffect(() => () => window.clearTimeout(submitTimeout.current), []);

    function updateFilter(fieldName, value) {
        filterForm.setData(fieldName, value);
        window.clearTimeout(submitTimeout.current);
        submitTimeout.current = window.setTimeout(() => {
            onSubmitRef.current({ preventDefault() {} });
        }, 350);
    }

    function submitImmediately(event) {
        event.preventDefault();
        window.clearTimeout(submitTimeout.current);
        onSubmit(event);
    }

    let fieldsToRender = [];

    if (filterFields && filterFields.length > 0) {
        fieldsToRender = filterFields;
    } else {
        fieldsToRender = [
            {
                name: searchName,
                id: `${searchName}-input`,
                label: searchLabel,
                placeholder: searchPlaceholder,
            },
        ];

        if (categoryOptions && categoryOptions.length > 0) {
            const formattedCategoryOptions = categoryOptions.map(opt =>
                typeof opt === 'object' && opt !== null && 'value' in opt ? opt : { value: opt, label: opt }
            );

            const hasEmpty = formattedCategoryOptions.some(opt => opt.value === '');
            const options = hasEmpty
                ? formattedCategoryOptions
                : [{ value: '', label: categoryPlaceholder }, ...formattedCategoryOptions];

            fieldsToRender.push({
                name: categoryName,
                id: `${categoryName}-select`,
                label: categoryLabel,
                type: 'select',
                options,
            });
        }

        if (sortOptions && sortOptions.length > 0) {
            fieldsToRender.push({
                name: 'sort',
                id: 'sort-select',
                label: 'Urutkan',
                type: 'select',
                options: sortOptions,
            });
        }
    }

    return (
        <section className="mb-8 max-w-full px-6 lg:px-8">
            <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm">
                {/* subjudul */}
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-teal-darker">{title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                </div>

                {/* filter */}
                <form onSubmit={submitImmediately} className="mb-5 grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
                    {fieldsToRender.map(field => (
                        <div key={field.name}>
                            <label htmlFor={field.id} className="sr-only">{field.label}</label>
                            {field.type === 'select' ? (
                                <select
                                    id={field.id}
                                    value={filterForm.data[field.name] ?? ''}
                                    onChange={event => updateFilter(field.name, event.target.value)}
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
                                    value={filterForm.data[field.name] ?? ''}
                                    onChange={event => updateFilter(field.name, event.target.value)}
                                    placeholder={field.placeholder}
                                    className={inputClass}
                                />
                            )}
                        </div>
                    ))}
                </form>

                {errorMessage && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

                {/* tabel */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full table-auto divide-y divide-gray-200 text-left text-sm">
                        {/* judul kolom */}
                        <thead className="bg-teal-light-01 text-xs uppercase tracking-wide text-teal-darker">
                            <tr>
                                {columns.map(column => (
                                    <th
                                        key={column.label}
                                        scope="col"
                                        className="whitespace-normal break-words px-4 py-3"
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* isi kolom */}
                        <tbody className="divide-y divide-gray-100">
                            {rows.data.map(row => <tr key={row.id}>{renderCells(row, columns, renderRow)}</tr>)}
                            {rows.data.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">{emptyMessage}</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* aksi bawah */}
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