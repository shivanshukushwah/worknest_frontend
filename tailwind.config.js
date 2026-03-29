/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#8B5CF6",
        accent: "#FBBF24",
        success: "#10B981",
        danger: "#F43F5E",
        warning: "#F59E0B",
        info: "#3B82F6",
        background: "#F8FAFC",
        "slate-900": "#0F172A",
        "slate-800": "#1E293B",
        "slate-500": "#64748B",
        "slate-200": "#E2E8F0",
      },
    },
  },
  plugins: [],
};
