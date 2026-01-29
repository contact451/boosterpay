/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          deepest: '#050810',
          DEFAULT: '#0a0f1a',
          elevated: '#0d1424',
          surface: '#111827',
        },
        electric: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
        },
        success: {
          light: '#4ADE80',
          DEFAULT: '#22C55E',
          dark: '#16A34A',
        },
        action: {
          light: '#FB923C',
          DEFAULT: '#F97316',
          dark: '#EA580C',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-orange': 'glow-orange 2s ease-in-out infinite alternate',
        'glow-green': 'glow-green 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
        },
        'glow-orange': {
          '0%': { boxShadow: '0 0 30px rgba(249, 115, 22, 0.4)' },
          '100%': { boxShadow: '0 0 50px rgba(249, 115, 22, 0.6)' },
        },
        'glow-green': {
          '0%': { boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' },
          '100%': { boxShadow: '0 0 50px rgba(34, 197, 94, 0.6)' },
        },
      },
      boxShadow: {
        'glow-blue': '0 0 60px rgba(59, 130, 246, 0.4)',
        'glow-cyan': '0 0 60px rgba(6, 182, 212, 0.4)',
        'glow-green': '0 0 60px rgba(34, 197, 94, 0.5)',
        'glow-orange': '0 0 60px rgba(249, 115, 22, 0.5)',
      },
    },
  },
  plugins: [],
}
