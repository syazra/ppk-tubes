export function validateFiles(files, { maxFiles, maxSizeBytes, allowedTypes } = {}) {
    if (maxFiles != null && files.length > maxFiles) return `Maksimal ${maxFiles} foto baru dapat dipilih. Hapus foto yang tidak diperlukan.`;
    for (const file of files) {
        if (allowedTypes && !allowedTypes.includes(file.type)) return `${file.name}: format foto harus JPG, JPEG, PNG, atau WebP.`;
        if (maxSizeBytes != null && file.size > maxSizeBytes) return `${file.name}: ukuran foto maksimal ${maxSizeBytes / 1024 / 1024} MB.`;
        if (file.size === 0) return `${file.name}: file kosong tidak dapat diunggah.`;
    }
    return null;
}
