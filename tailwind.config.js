/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tcm-green': '#2d5a27',
        'tcm-brown': '#8b4513',
        'tcm-cream': '#f5f5dc',
        'tcm-red': '#c41e3a',
      },
    },
  },
  plugins: [],
}
