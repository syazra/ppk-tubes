import { useEffect, useId, useRef, useState } from 'react';
import { validateFiles } from '../lib/fileValidation';

const getFileType = (fileName = '') => {
    const extension = fileName.split('.').pop().toLowerCase();

    if (
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)
    ) {
        return 'image';
    }

    if (extension === 'pdf') return 'pdf';

    if (
        ['doc', 'docx', 'txt', 'odt'].includes(extension)
    ) {
        return 'document';
    }

    if (
        ['xls', 'xlsx', 'csv', 'ods'].includes(extension)
    ) {
        return 'spreadsheet';
    }

    if (
        ['ppt', 'pptx', 'odp'].includes(extension)
    ) {
        return 'presentation';
    }

    return 'file';
};

function FileIcon({ type, size = 24 }) {
    const commonProps = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
    };

    const paths = {
        image: (
            <>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
            </>
        ),
        pdf: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h6" />
            </>
        ),
        document: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h8" />
            </>
        ),
        spreadsheet: (
            <>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18M15 3v18M3 15h18" />
            </>
        ),
        presentation: (
            <>
                <rect x="3" y="3" width="18" height="14" rx="2" />
                <path d="M12 17v4M8 21h8M8 10l3 3 5-5" />
            </>
        ),
        file: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
            </>
        ),
    };

    return (
        <svg {...commonProps}>
            {paths[type] ?? paths.file}
        </svg>
    );
}

function UploadIcon({ className = '' }) {
    return (
    <svg
    className={`mb-2 h-12 w-12 text-gray-400 ${className}`}
    stroke="currentColor"
    fill="none"
    viewBox="0 0 48 48"
    aria-hidden="true"
    > <path
                d="M28 8H12a4 4 0 0 0-4 4v20m32-12v8m0 0v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-4m32-4-3.172-3.172a4 4 0 0 0-5.656 0L28 28M8 32l9.172-9.172a4 4 0 0 1 5.656 0L28 28m0 0 4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            /> </svg>
    );
}


export default function UploadFile({
    label = 'Upload file',
    name = 'files',
    accept = '*/*',
    multiple = false,
    value = [],
    onChange,
    error,
    helperText,
    className = '',
    maxFiles,
    maxSizeBytes,
    allowedTypes,
    disabled = false,
}) {
    const generatedId = useId();
    const inputId = `upload-${generatedId}`;
    const inputRef = useRef(null);
    const [selectionError, setSelectionError] = useState(null);
    const files = Array.isArray(value)
        ? value
        : value
            ? [value]
            : [];

    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const nextPreviews = files.map((file) => ({
            file,
            url: file.type?.startsWith('image/')
                ? URL.createObjectURL(file)
                : null,
        }));

        setPreviews(nextPreviews);

        return () => {
            nextPreviews.forEach(({ url }) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [value]);

    const handleChange = (event) => {
        const selectedFiles = Array.from(
            event.target.files ?? []
        );

        if (selectedFiles.length === 0) return;

        const nextFiles = multiple
            ? [...files, ...selectedFiles]
            : [selectedFiles[0]];

        const validationError = validateFiles(nextFiles, { maxFiles, maxSizeBytes, allowedTypes });
        setSelectionError(validationError);
        if (!validationError) onChange?.(nextFiles);

        // Memungkinkan file yang sama dipilih kembali.
        event.target.value = '';
    };

    const handleRemove = (index) => {
        setSelectionError(null);
        const nextFiles = files.filter(
            (_, fileIndex) => fileIndex !== index
        );

        onChange?.(nextFiles);
    };

    return (
        <div className={className}>
            <label
                htmlFor={inputId}
                className="block text-sm font-semibold text-teal-darker"
            >
                {label}
            </label>

            <div className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-6 transition-colors duration-200 hover:border-gray-400">
                {previews.length > 0 ? (
                    <div className="mb-3 flex w-full flex-wrap justify-center gap-3">
                        {previews.map((preview, index) => {
                            const type = getFileType(
                                preview.file.name
                            );

                            return (
                                <div
                                    key={`${preview.file.name}-${index}`}
                                    className="relative flex max-w-[140px] flex-col items-center"
                                >
                                    {type === 'image' && preview.url ? (
                                        <img
                                            src={preview.url}
                                            alt={`Pratinjau ${preview.file.name}`}
                                            className="h-28 w-28 rounded-lg border border-gray-200 object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                                            <FileIcon
                                                type={type}
                                                size={44}
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleRemove(index)}
                                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/80 text-gray-700 shadow-sm transition-colors hover:bg-transparent hover:text-gray-900"
                                        aria-label={`Hapus ${preview.file.name}`}
                                    >
                                        ×
                                    </button>

                                    <span className="mt-1 w-full truncate text-center text-xs font-medium text-gray-700">
                                        {preview.file.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <UploadIcon
                    />
                )}

                <input
                    id={inputId}
                    ref={inputRef}
                    name={multiple ? `${name}[]` : name}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    aria-invalid={Boolean(error || selectionError)}
                    aria-describedby={`${inputId}-hint ${inputId}-error`}
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="my-2 flex w-full items-center justify-center gap-3">
                    <button
                        type="button"
                        disabled={disabled || maxFiles === 0}
                        onClick={() => inputRef.current?.click()}
                        className="shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        {files.length > 0
                            ? '+ Tambah File'
                            : 'Pilih File'}
                    </button>

                    {files.length === 0 && (
                        <span className="max-w-xs truncate text-xs text-gray-500">
                            Belum ada file yang dipilih
                        </span>
                    )}
                </div>

                {helperText && (
                    <p id={`${inputId}-hint`} className="mt-1 text-xs text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>

            {(error || selectionError) && (
                <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-red-700">
                    {selectionError || error}
                </p>
            )}
        </div>
    );
}

