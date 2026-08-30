/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- تم إضافة هذا السطر لتشغيل الـ Dark/Light mode
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Noto Kufi Arabic', 'sans-serif'],
        kufi: ['"Noto Kufi Arabic"', 'Cairo', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#eef3f8',
          100: '#d4e0ec',
          200: '#a9c1d9',
          300: '#6f93ba',
          400: '#3f6a93',
          500: '#234a6f',
          600: '#16324f',
          700: '#122a43',
          800: '#0e2236',
          900: '#0a1a2a',
        },
        ink: '#1c2430',
        rust: {
          50: '#fbf2ea',
          100: '#f3dfc8',
          200: '#e6bd96',
          300: '#d89863',
          400: '#c87642',
          500: '#c0602f',
          600: '#a44e24',
          700: '#833e1e',
          800: '#62321b',
          900: '#4a2817',
        },
        line: '#e3e7ec',
        line2: '#d9dee5',
        canvas: '#fafbfc',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,30,46,0.06), 0 1px 2px rgba(16,30,46,0.04)',
        cardlg: '0 4px 14px rgba(16,30,46,0.08), 0 2px 6px rgba(16,30,46,0.05)',
        pop: '0 12px 32px rgba(16,30,46,0.18), 0 4px 12px rgba(16,30,46,0.1)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};