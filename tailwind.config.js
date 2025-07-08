/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        // custom animations
      },
    },
  },
  darkMode: 'class', // Important for shadcn/ui dark mode support
  plugins: [tailwindcssAnimate],
};
