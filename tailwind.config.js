/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#0f0f10",
          lighter: "#161618",
          border: "#27272a",
        },
        primary: {
          DEFAULT: "#F39C12",
          hover: "#E67E22",
        },
        light: {
          DEFAULT: "#ECF0F1",
          dim: "#94a3b8",
        }
      },
      backgroundImage: {
        'callidon-gradient': 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
      },
      boxShadow: {
        'neon-orange': '0 0 15px rgba(243, 156, 18, 0.2)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};