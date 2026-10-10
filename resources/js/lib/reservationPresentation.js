export const reservationStatusLabels = {
    menunggu: 'Menunggu',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
    dibatalkan: 'Dibatalkan',
};

export const reservationSortOptions = [
    { value: 'created_near', label: 'Pengajuan terbaru' },
    { value: 'created_far', label: 'Pengajuan terlama' },
    { value: 'reservation_near', label: 'Jadwal terdekat' },
    { value: 'reservation_far', label: 'Jadwal terjauh' },
];

export function formatReservationDate(value) {
    return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`)) : '—';
}

export function formatTime(value) {
    return value ? value.slice(0, 5) : '—';
}

export function reservationTicketFields(reservation) {
    const fields = [
        ['ID reservasi', `RSV-${reservation.id}`],
        ['Peminjam', reservation.user?.name],
        ['Email', reservation.user?.email],
        ['Jenis reservasi', reservation.reservation_type],
    ];
    if (reservation.reservation_type === 'Instansi') {
        fields.push(['Instansi', reservation.institution], ['Nama Kegiatan', reservation.activity_name], ['Deskripsi Kegiatan', reservation.desc]);
    } else {
        fields.push(['Tujuan Penggunaan', reservation.activity_name || reservation.desc]);
    }
    fields.push(
        ['Jumlah peserta', reservation.participant_count],
        ['Fasilitas', reservation.room?.name],
        ['Tipe fasilitas', reservation.room?.type],
        ['Lokasi', reservation.room?.location],
        ['Tanggal', formatReservationDate(reservation.date_to_reserv)],
        ['Waktu', `${formatTime(reservation.start_time)} – ${formatTime(reservation.end_time)}`],
    );
    return fields.map(([label, value]) => ({ label, value: value ?? '—' }));
}
