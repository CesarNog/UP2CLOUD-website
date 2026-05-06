/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './about/index.html',
    './privacy/index.html',
    './404.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0F172A',
          700: '#1E293B',
          600: '#334155',
        },
        sky: {
          brand: '#0369A1',
          light: '#0EA5E9',
          pale:  '#BAE6FD',
          ultra: '#F0F9FF',
        },
        cta: '#F97316',
        ai:  '#7C3AED',
      },
    },
  },
  plugins: [],
};
