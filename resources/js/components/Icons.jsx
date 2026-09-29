export default function Icon({ name, className = 'h-5 w-5' }) {
    const paths = {
        campus: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11v6c3 3 7 3 10 0v-6M21 9v7" /></>,
        home: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
        student: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M20 8v6m-3-3h6" /><circle cx="9" cy="7" r="4" /></>,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /><circle cx="9" cy="7" r="4" /></>,
        user: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
        menu: <path d="M4 6h16M4 12h16M4 18h16" />,
        close: <path d="m6 6 12 12M6 18 18 6" />,
        panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16m6-11-3 3 3 3" /></>,
        arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
        chevron: <path d="m9 5 7 7-7 7" />,
        logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" /></>,
        calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18m-10 5h2" /></>,
        clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
        room: <><path d="M3 21h18M5 21V3h14v18M9 7h6M9 11h6M9 21v-6h6v6" /></>,
        chart: <><path d="M3 3v18h18M7 14l4-4 4 3 6-8" /></>,
        activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
        shield: <><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    };

    return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function initials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'A';
}