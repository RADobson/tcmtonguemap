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
        'tcm-green-light': '#4a7c42',
        'tcm-green-dark': '#1a3d16',
        'tcm-brown': '#8b4513',
        'tcm-brown-light': '#a0522d',
        'tcm-brown-dark': '#5c2e0c',
        'tcm-cream': '#f5f5dc',
        'tcm-parchment': '#faf8f3',
        'tcm-gold': '#c9a227',
        'tcm-gold-light': '#e5c76b',
        'tcm-red': '#c41e3a',
        'tcm-ink': '#1a1a2e',
        'tcm-jade': '#00a86b',
        'tcm-clay': '#c4a484',
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'tcm-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
