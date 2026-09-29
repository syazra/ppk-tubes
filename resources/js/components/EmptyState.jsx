import Icon from './Icons';

export default function EmptyState({title, children }) {
    return (
        <div className="app-empty-state">
            <h3 className="text-sm font-semibold text-teal-darker">{title}</h3>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-500">{children}</p>
        </div>
    );
}