/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f0f1a',
                accent: '#00c96b',
                card: '#1a1a2e',
            }
        },
    },
    plugins: [],
}
