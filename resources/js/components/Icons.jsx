export default function Icon({ name, className, variant }) {
    const paths = {
        campus: <path d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" />,
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
        down: <path d="M12 4v16m-5-5 5 5 5-5" />,
        check: <path d="m5 12 4 4L19 6" />,
        leaf: <path d="M20 3C9 1 2 6 4 14s17 7 16-11ZM4 21 16 8M9 16l-1-5m5 1 5-1" />,
        grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
        lab: <path d="M8 3h8m-6 0v7L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3M7 15h10" />,
        hall: <path d="m2 9 10-6 10 6H2Zm2 12h16M6 9v12m6-12v12m6-12v12" />,
        field: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M12 5v14M2 9h3v6H2m20-6h-3v6h3" /><circle cx="12" cy="12" r="3" /></>,
        tool: <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8m-4-4v4M7 9h4" /></>,
        people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 6" /></>,
        'landing-arrow': <path d="M5 12h14m-5-5 5 5-5 5" />,
        'landing-room': <path d="M4 21h16M6 21V4l12-2v19M10 21v-7h4v7M9 7h1m4-1h1M9 10h1m4-1h1" />,
        'landing-calendar': <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-13 5 3 3 5-5" /></>,
        'landing-shield': <><path d="m12 2 8 3v6c0 5-8 11-8 11S4 16 4 11V5l8-3Z" /><path d="m8 12 3 3 5-6" /></>,
        'landing-menu': <path d="M4 7h16M4 12h16M4 17h16" />,
        'landing-close': <path d="m6 6 12 12M6 18 18 6" />,
        'landing-chevron': <path d="m6 9 6 6 6-6" />,
    };

    const isLandingIcon = variant === 'landing' || name.startsWith('landing-');
    const iconClassName = className ?? (isLandingIcon ? 'cs-icon' : 'h-5 w-5');
    const iconPath = paths[name] ?? (isLandingIcon ? paths.leaf : null);

    return <svg aria-hidden="true" className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isLandingIcon ? '1.5' : '1.7'} strokeLinecap="round" strokeLinejoin="round">{iconPath}</svg>;
}

export function initials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'A';
}
