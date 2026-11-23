/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0b1c30',
          container: '#131b2e',
          fixed: '#dae2fd',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#006a61',
          container: '#86f2e4',
          'on-container': '#005049',
          foreground: '#ffffff',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          container: {
            lowest: '#ffffff',
            low: '#eff4ff',
            DEFAULT: '#e5eeff',
            high: '#dce9ff',
            highest: '#d3e4fe',
          },
        },
        'on-surface': {
          DEFAULT: '#0b1c30',
          variant: '#45464d',
        },
        outline: {
          DEFAULT: '#76777d',
          variant: '#c6c6cd',
        },
        success: {
          DEFAULT: '#059669',
          container: '#d1fae5',
          foreground: '#065f46',
        },
        warning: {
          DEFAULT: '#d97706',
          container: '#fef3c7',
          foreground: '#92400e',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          foreground: '#93000a',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        ambient: '0px 4px 16px rgba(11, 28, 48, 0.05)',
        'ambient-hover': '0px 8px 24px rgba(11, 28, 48, 0.08)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
