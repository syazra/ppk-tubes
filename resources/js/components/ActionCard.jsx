import { Link } from '@inertiajs/react';
import EmptyState from './EmptyState';
import Icon from './Icons';

export default function ActionCard({ title, href, children, className = '', emptyTitle, emptyMessage }) {
    const content = children ?? (emptyTitle ? <EmptyState title={emptyTitle}>{emptyMessage}</EmptyState> : null);

    return (
        <article className={`app-panel flex min-h-[340px] flex-col ${className}`.trim()}>
            <div className="flex items-center justify-between gap-3 pb-6 ">
                <h2 className="text-lg font-bold text-teal-darker">{title}</h2>
                <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-teal-normal-01 hover:text-teal-normal-02 hover:underline">
                    <p>Lihat lainnya</p>
                    <Icon name="arrow" className="ml-1 inline h-4 w-4 " />
                </Link>
            </div>
            {content}
        </article>
    );
}
