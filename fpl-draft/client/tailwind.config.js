/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fpl: {
          purple: '#37003c',
          'purple-light': '#4f0057',
          'purple-dark': '#240028',
          green: '#00ff87',
          'green-dark': '#00c968',
          pink: '#ff2882',
          cyan: '#00d2ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        pulse_slow: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
