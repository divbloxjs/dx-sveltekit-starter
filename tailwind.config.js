import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ["class"],
    content: ["./src/**/*.{html,js,svelte,ts}"],
    safelist: ["dark"],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px"
            }
        },
        extend: {
            colors: {
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
                background: "hsl(var(--background) / <alpha-value>)",
                "background-100": "hsl(var(--background-100) / <alpha-value>)",
                "background-200": "hsl(var(--background-200) / <alpha-value>)",
                "background-300": "hsl(var(--background-300) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                neutral: {
                    DEFAULT: "hsl(var(--neutral) / <alpha-value>)",
                    foreground: "hsl(var(--neutral-foreground) / <alpha-value>)"
                },
                primary: {
                    DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                    foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
                    foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
                },
                tertiary: {
                    DEFAULT: "hsl(var(--tertiary) / <alpha-value>)",
                    foreground: "hsl(var(--tertiary-foreground) / <alpha-value>)"
                },
                success: {
                    DEFAULT: "hsl(var(--success) / <alpha-value>)",
                    foreground: "hsl(var(--success-foreground) / <alpha-value>)"
                },
                warning: {
                    DEFAULT: "hsl(var(--warning) / <alpha-value>)",
                    foreground: "hsl(var(--warning-foreground) / <alpha-value>)"
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
                },
                muted: {
                    DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                    foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
                },
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
                },
                popover: {
                    DEFAULT: "hsl(var(--popover) / <alpha-value>)",
                    foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
                },
                card: {
                    DEFAULT: "hsl(var(--card) / <alpha-value>)",
                    foreground: "hsl(var(--card-foreground) / <alpha-value>)"
                }
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)"
            },
            fontFamily: {
                montserrat: ["Montserrat"]
            },
            animation: {
                shake: "shake 0.82s cubic-bezier(.36,.07,.19,.97) both"
            },
            keyframes: {
                shake: {
                    "10%, 90%": {
                        transform: "translate3d(-1px, 0, 0)"
                    },
                    "20%, 80%": {
                        transform: "translate3d(2px, 0, 0)"
                    },
                    "30%, 50%, 70%": {
                        transform: "translate3d(-4px, 0, 0)"
                    },
                    "40%, 60%": {
                        transform: "translate3d(4px, 0, 0)"
                    }
                }
            }
        }
    },
    plugins: [
        require("@tailwindcss/container-queries"),
        function ({ addVariant }) {
            addVariant("child", "& > *");
            addVariant("child-hover", "& > *:hover");
        }
    ]
};

export default config;
