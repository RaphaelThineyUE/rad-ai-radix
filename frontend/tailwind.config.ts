/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'birads-benign': '#10b981',
        'birads-probably-benign': '#fbbf24',
        'birads-suspicious': '#f97316',
        'birads-malignant': '#ef4444',
      }
    },
  },
  plugins: [],
}
