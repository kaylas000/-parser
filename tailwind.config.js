/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './index-kolormarket.html'],
  theme: {
    extend: {
      colors: {
        coal: { DEFAULT: '#17181c', 2: '#1d1f24', 3: '#24262c' },
        steel: { DEFAULT: '#3a3d46', 2: '#4b505c' },
        fog: { DEFAULT: '#9d9f9a', 2: '#6b6e68' },
        concrete: '#e7e7e2',
        heat: { DEFAULT: '#ff6a2b', 2: '#ff8c5a' },
        ok: '#3ecf5c',
        amber: '#f7c500',
      },
      fontFamily: {
        display: ['Tektur', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
