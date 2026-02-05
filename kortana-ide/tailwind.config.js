/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'loading-bar': 'loading-bar 1.5s ease-in-out infinite',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                'loading-bar': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            colors: {
                vscode: {
                    bg: '#1e1e1e',
                    sidebar: '#252526',
                    activity: '#333333',
                    accent: '#007acc',
                    border: '#3c3c3c',
                    text: '#d4d4d4',
                    muted: '#858585',
                    hover: '#2a2d2e',
                    activeItem: '#37373d',
                    error: '#f48771',
                    success: '#4ec9b0',
                    warning: '#dcdcaa',
                }
            },
            fontFamily: {
                mono: ['"Cascadia Code"', '"Fira Code"', 'monospace'],
                sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
