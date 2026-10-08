import { forwardRef } from 'react';

const ButtonGray = forwardRef(function ButtonGray(
    { children, type = 'button', className = '', ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            type={type}
            className={[
                'inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white-01 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-60',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </button>
    );
});

export default ButtonGray;
