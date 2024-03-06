/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            fontFamily: {
                'roboto': ["Roboto", 'sans-serif'],
            },
            minWidth: {
                4: '1rem',
                6: '1.5rem',
                8: '2rem',
            },
            maxWidth: {
                'page': '1400px',
            },
            width: {
                'page': '1400px',
                '4.5': '1.125rem',
                '12.5': '3.125rem',
            },
            height: {
                '12.5': '3.125rem',
                '4.5': '1.125rem',
            },
            colors: {
                // flowbite-svelte
                main: '#4d2be5',
                success: '#00C9A7',
                error: '#EB5757',
                primary: {
                    50: '#4d2be5',
                    100: '#4d2be5',
                    200: '#4d2be5',
                    300: '#4d2be5',
                    400: '#4d2be5',
                    500: '#4d2be5',
                    600: '#4d2be5',
                    700: '#4d2be5',
                    800: '#4d2be5',
                    900: '#4d2be5B'
                }
            }
        }
    },
    plugins: [require('flowbite/plugin')],
}

