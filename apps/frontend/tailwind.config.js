import { fontFamily } from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        border: {
          DEFAULT: "var(--color-border-default)",
          light: "var(--color-border-light)",
          focus: "var(--color-border-focus)",
          hover: "var(--color-border-hover)",
        },
        button: {
          disabled: "var(--color-button-disabled)",
          "disabled-text": "var(--color-button-disabled-text)",
        },
        // Shadcn UI colors (keep for compatibility)
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Design token colors from style.css
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      spacing: {
        // Design token spacing
        0.5: "var(--spacing-0-5)",
        1.5: "var(--spacing-1-5)",
        2.5: "var(--spacing-2-5)",
        3.5: "var(--spacing-3-5)",
      },
      borderRadius: {
        // Design token border radius
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      fontSize: {
        // Design token font sizes
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)",
        "3xl": "var(--font-size-3xl)",
        "4xl": "var(--font-size-4xl)",
      },
      fontWeight: {
        // Design token font weights
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
      },
      fontFamily: {
        sans: ["var(--font-family-base)", ...fontFamily.sans],
        heading: ["var(--font-family-heading)", ...fontFamily.sans],
        mono: ["var(--font-family-mono)", ...fontFamily.mono],
      },
      boxShadow: {
        // Design token shadows
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        normal: "300ms",
        slow: "500ms",
      },
      transitionTimingFunction: {
        ease: "ease",
      },
      zIndex: {
        base: "var(--z-base)",
        above: "var(--z-above)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
