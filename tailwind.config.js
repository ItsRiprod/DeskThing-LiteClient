/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '400px'
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        Wingding: ['Wingding', 'monospace'],
        geistMono: ['GeistMono', 'monospace'],
        THEBOLDFONT: ['THEBOLDFONT', 'sans-serif']
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0%, 10%)' },
          '50%': { transform: 'translate(10%, 0%)' },
          '100%': { transform: 'translate(0%, 10%)' }
        },
        drop: {
          '0%': { transform: 'translateY(-25%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' }
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        dropdelay: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' }
        },
        'pop-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.7)'
          },
          '80%': {
            opacity: '1',
            transform: 'scale(1.02)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      animation: {
        float: 'float 15s ease infinite;',
        drop: 'drop 0.5s ease forwards;',
        dropReverse: 'drop 0.5s ease reverse;',
        fade: 'fade 0.5s ease forwards;',
        dropDelay: 'dropdelay 1s ease forwards;',
        'pop-in': 'pop-in 0.2s ease-out forwards'
      }
    }
  },
  plugins: []
}
