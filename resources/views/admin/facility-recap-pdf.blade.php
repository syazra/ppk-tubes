<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #173c35; font-size: 9px; }
        h1 { font-size: 18px; margin: 0 0 5px; }
        h2 { font-size: 12px; margin: 20px 0 7px; }
        p { margin: 0 0 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 6px; border: 1px solid #cbd9d2; text-align: left; }
        th { background: #eaf3eb; }
        tr { page-break-inside: avoid; }
        .number { text-align: right; }
    </style>
</head>
<body>
    <h1>Rekap okupansi dan kerusakan fasilitas</h1>
    <p>Periode: {{ $filters['from'] }} s.d. {{ $filters['to'] }}</p>
    <p>Okupansi dihitung dari reservasi disetujui. Kerusakan dihitung dari laporan baru, diproses, dan selesai.</p>
    <h2>Per fasilitas</h2>
    <table>
        <thead><tr><th>Fasilitas</th><th>Lokasi</th><th>Jenis</th><th>Status</th><th class="number">Reservasi</th><th class="number">Jam terpakai</th><th class="number">Kerusakan</th></tr></thead>
        <tbody>
            @forelse ($data['facilities'] as $row)
                <tr><td>{{ $row['name'] }}</td><td>{{ $row['location'] }}</td><td>{{ $row['type'] }}</td><td>{{ $row['is_avail'] ? 'Aktif' : 'Nonaktif' }}</td><td class="number">{{ $row['reservations'] }}</td><td class="number">{{ $row['occupied_hours'] }}</td><td class="number">{{ $row['damage_reports'] }}</td></tr>
            @empty
                <tr><td colspan="7">Tidak ada fasilitas untuk filter ini.</td></tr>
            @endforelse
        </tbody>
    </table>
    <h2>Per lokasi</h2>
    <table>
        <thead><tr><th>Lokasi</th><th class="number">Fasilitas</th><th class="number">Reservasi</th><th class="number">Jam terpakai</th><th class="number">Kerusakan</th></tr></thead>
        <tbody>
            @forelse ($data['locations'] as $row)
                <tr><td>{{ $row['location'] }}</td><td class="number">{{ $row['facilities'] }}</td><td class="number">{{ $row['reservations'] }}</td><td class="number">{{ $row['occupied_hours'] }}</td><td class="number">{{ $row['damage_reports'] }}</td></tr>
            @empty
                <tr><td colspan="5">Tidak ada lokasi untuk filter ini.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
