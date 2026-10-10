import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFiles } from '../../resources/js/lib/fileValidation.js';

const limits = { maxFiles: 3, maxSizeBytes: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] };
const photo = overrides => ({ name: 'photo.jpg', type: 'image/jpeg', size: 1024, ...overrides });

test('JPEG, PNG and WebP files at the size limit can be selected together', () => {
    assert.equal(validateFiles(limits.allowedTypes.map(type => photo({ type, size: limits.maxSizeBytes })), limits), null);
});
test('SVG and executable uploads are rejected before submission', () => {
    assert.match(validateFiles([photo({ name: 'bad.svg', type: 'image/svg+xml' })], limits), /format foto/);
    assert.match(validateFiles([photo({ name: 'bad.exe', type: 'application/octet-stream' })], limits), /bad.exe/);
});
test('empty and oversized files are rejected with actionable errors', () => {
    assert.match(validateFiles([photo({ size: 0 })], limits), /file kosong/);
    assert.match(validateFiles([photo({ size: limits.maxSizeBytes + 1 })], limits), /2 MB/);
});
test('retained photos reduce available upload slots and an excessive batch is rejected', () => {
    assert.match(validateFiles([photo(), photo()], { ...limits, maxFiles: 1 }), /Maksimal 1/);
    assert.match(validateFiles([photo()], { ...limits, maxFiles: 0 }), /Maksimal 0/);
    assert.equal(validateFiles([], { ...limits, maxFiles: 0 }), null);
});
