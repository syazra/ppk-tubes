const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';
const accountTypes = [
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'staf', label: 'Staf' },
    { value: 'petugas', label: 'Petugas' },
];

export default function AccountFields({ form, prefix = '', identityLengths }) {
    const length = identityLengths[form.data.account_type] ?? 14;
    const id = key => `${prefix}${key}`;
    const error = key => form.errors[key] && <p id={`${id(key)}-error`} role="alert" className="mt-2 text-sm text-red-600">{form.errors[key]}</p>;
    const accessibility = key => ({ 'aria-invalid': Boolean(form.errors[key]), 'aria-describedby': `${id(key)}-hint${form.errors[key] ? ` ${id(key)}-error` : ''}` });

    return <>
        <div>
            <label htmlFor={id('account_type')} className="block text-sm font-semibold text-teal-darker">Jenis akun</label>
            <select id={id('account_type')} value={form.data.account_type} onChange={event => { form.setData('account_type', event.target.value); form.clearErrors('identity_number', 'account_type'); }} className={inputClass} required aria-invalid={Boolean(form.errors.account_type)} aria-describedby={form.errors.account_type ? `${id('account_type')}-error` : undefined}>
                <option value="" disabled>Pilih jenis akun</option>
                {accountTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            {error('account_type')}
        </div>
        <div>
            <label htmlFor={id('name')} className="block text-sm font-semibold text-teal-darker">Nama lengkap</label>
            <input id={id('name')} name="name" type="text" value={form.data.name} onChange={event => form.setData('name', event.target.value)} required minLength={2} maxLength={255} autoComplete="name" className={inputClass} {...accessibility('name')} />
            <p id={`${id('name')}-hint`} className="mt-1 text-xs text-gray-500">2–255 karakter, gunakan nama lengkap.</p>
            {error('name')}
        </div>
        <div>
            <label htmlFor={id('identity_number')} className="block text-sm font-semibold text-teal-darker">{form.data.account_type === 'mahasiswa' ? 'Nomor Induk Mahasiswa (NIM)' : 'Nomor Induk Pegawai (NIP)'}</label>
            <input id={id('identity_number')} name="identity_number" type="text" inputMode="numeric" pattern={`[0-9]{${length}}`} minLength={length} maxLength={length} value={form.data.identity_number} onChange={event => form.setData('identity_number', event.target.value)} required autoComplete="off" className={inputClass} {...accessibility('identity_number')} />
            <p id={`${id('identity_number')}-hint`} className="mt-1 text-xs text-gray-500">{length} digit angka, harus unik dan tidak boleh seluruhnya nol.</p>
            {error('identity_number')}
        </div>
        <div>
            <label htmlFor={id('email')} className="block text-sm font-semibold text-teal-darker">Email</label>
            <input id={id('email')} name="email" type="email" maxLength={255} pattern={'[^@\\s]+@[^@\\s]+\\.[^@\\s]+'} value={form.data.email} onChange={event => form.setData('email', event.target.value)} required autoComplete="email" className={inputClass} {...accessibility('email')} />
            <p id={`${id('email')}-hint`} className="mt-1 text-xs text-gray-500">Contoh: nama@kampus.ac.id. Email harus unik.</p>
            {error('email')}
        </div>
    </>;
}
