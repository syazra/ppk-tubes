import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import Icon from '../../components/Icons';
import AppLayout from '../../components/AppLayout';

const metrics = [
    { label: 'Total Reservasi', detail: 'Jumlah total reservasi yang masuk', icon: 'calendar' },
    { label: 'Reservasi Disetujui', detail: 'Reservasi yang telah disetujui', icon: 'calendar' },
    { label: 'Reservasi Menunggu', detail: 'Reservasi yang menunggu persetujuan', icon: 'clock' },
    { label: 'Reservasi Ditolak', detail: 'Reservasi yang ditolak', icon: 'calendar' },
];

export default function Dashboard({ user, status, csrfToken, urls }) {
    const reducedMotion = useReducedMotion();
    const currentUser = user;

    return (
        <>
            {/* JUDUL */}
            <Head title="Dasbor Petugas" />
            <AppLayout user={currentUser} csrfToken={csrfToken} urls={urls} active="dashboard" title="Dasbor Petugas" subtitle="Ringkasan aktivitas reservasi CampuSpace.">

            </AppLayout>

        </>
    );
}