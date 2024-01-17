/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                // flowbite-svelte
                main: '#4d2be5',
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

