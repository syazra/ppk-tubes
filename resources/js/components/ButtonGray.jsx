import { forwardRef } from 'react';

const ButtonGray = forwardRef(function ButtonGray(
    { children, as: Component = 'button', type = 'button', className = '', ...props },
    ref,
) {
    const isButtonElement = Component === 'button';

    return (
        <Component
            ref={ref}
            type={isButtonElement ? type : undefined}
            className={[
                'inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white-01 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-60',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </Component>
    );
});

export default ButtonGray;
