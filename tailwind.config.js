import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                teal: {
                    'light-01': '#EBF8F6',
                    'light-02': '#D9F2EF',
                    'light-03': '#B0E4DD',
                    'normal-01': '#00A991',
                    'normal-02': '#009883',
                    'normal-03': '#008774',
                    'dark-01': '#007F6D',
                    'dark-02': '#006557',
                    'dark-03': '#004C41',
                    'darker': '#003B33',
                },
                green: {
                    'light-01': '#F7FBEF',
                    'light-02': '#F3F9E7',
                    'light-03': '#E7F3CE',
                    'normal-01': '#B1D760',
                    'normal-02': '#9FC256',
                    'normal-03': '#8EAC4D',
                    'dark-01': '#85A148',
                    'dark-02': '#6A813A',
                    'dark-03': '#50612B',
                    'darker': '#3E4B22',
                },
                white: {
                    '01': '#FFFFFF',
                    '02': '#FBFCFD',
                    '03': '#F2F4F7',
                    '04': '#FBFCFD',
                    'blue': '#C4D9DA',
                    'green': '#CCDAC4',
                },
                grad: {
                    'teal-01': 'linear-gradient(to bottom right, #00A991, #11695D)',
                },
            },
            backgroundImage: {
                'grad-teal-01': 'linear-gradient(-45deg, #00A991, #11695D, #00A991)',
                'grad-teal-02': 'linear-gradient(0deg, #11695D, #00A991)',
            },
            keyframes: {
                gradientMove: {
                '0%, 100%': { 'background-position': '0% 50%' },
                '50%': { 'background-position': '100% 50%' },
                },
            },
            animation: {
                'gradasi-loop': 'gradientMove 25s ease-in-out infinite',
            },
        },
    },

    plugins: [forms],
};
