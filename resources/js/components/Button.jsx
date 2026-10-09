import { forwardRef } from 'react';

const variantClasses = {
    primary: 'bg-teal-dark-01 text-white-01 hover:bg-teal-dark-02',
    secondary: 'border border-gray-300 bg-white-01 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 text-white-01 hover:bg-red-700',
};

const Button = forwardRef(function Button(
    { children, as: Component = 'button', type = 'button', variant = 'primary', className = '', ...props },
    ref,
) {
    const isButtonElement = Component === 'button';

    return (
        <Component
            ref={ref}
            type={isButtonElement ? type : undefined}
            className={[
                'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-dark-01 focus:ring-offset-2 disabled:opacity-60',
                variantClasses[variant] ?? variantClasses.primary,
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </Component>
    );
});

export default Button;
