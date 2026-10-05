const colorClasses = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    teal: 'bg-teal-100 text-teal-800',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-700',
};

const statusColors = {
    baru: 'yellow',
    menunggu: 'yellow',
    diproses: 'blue',
    selesai: 'teal',
    disetujui: 'teal',
    ditolak: 'red',
    dibatalkan: 'gray',
};

export function getStatusColor(status) {
    return statusColors[status] ?? 'gray';
}

export default function StatusBadge({ color = 'gray', children }) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colorClasses[color] ?? colorClasses.gray}`}>
            {children}
        </span>
    );
}