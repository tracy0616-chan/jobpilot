/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 24px 80px rgba(15, 23, 42, 0.08)',
        soft: '0 18px 45px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}