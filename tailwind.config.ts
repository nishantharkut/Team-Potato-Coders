import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	container: {
		center: true,
		padding: "15px",
	},
	screens: {
	sm: "640px",
	md: "768px",
	lg: "960px",
	xl: "1200px",
	},

  	extend: {
  		colors: {
  			// Using CSS variables for theme support
  			background: 'var(--color-bg-start)',
  			foreground: 'var(--color-text)',
  			surface: 'var(--color-surface)',
  			'surface-hover': 'var(--color-surface-hover)',
  			'surface-elevated': 'var(--color-surface-elevated)',
  			accent: 'var(--color-accent)',
  			'accent-hover': 'var(--color-accent-hover)',
  			'accent-light': 'var(--color-accent-light)',
  			'accent-dark': 'var(--color-accent-dark)',
  			secondary: 'var(--color-secondary)',
  			'secondary-hover': 'var(--color-secondary-hover)',
  			tertiary: 'var(--color-tertiary)',
  			border: 'var(--color-border)',
  			'border-hover': 'var(--color-border-hover)',
  			'text-secondary': 'var(--color-text-secondary)',
  			'text-muted': 'var(--color-text-muted)',
  			'button-text': 'var(--color-button-text)',
  			// Keep specific color names for easy reference
  			'tanjiro-green': '#1a4d2e',
  			'demon-red': '#c1121f',
  			'earthy-orange': '#f77f00',
  			'zenitsu-yellow': '#fcbf49',
  			'nezuko-pink': '#ffb3c1',
  			'charcoal': '#1b1b1b',
  			'cream': '#faf9f6',
  		},
  		borderRadius: {
  			lg: '1rem',
  			md: '0.75rem',
  			sm: '0.5rem',
  			xl: '1.5rem'
  		},
  		borderWidth: {
  			'3': '3px',
  		},
  		fontFamily: {
  			'bangers': ['Bangers', 'cursive'],
  			'roboto': ['Roboto', 'sans-serif']
  		},
		boxShadow: {
			'neu': '4px 4px 0px 0px var(--shadow-neubrutalism)',
			'neu-sm': '2px 2px 0px 0px var(--shadow-neubrutalism-small)',
			'neu-lg': '6px 6px 0px 0px var(--shadow-neubrutalism)',
			'neu-hover': '2px 2px 0px 0px var(--shadow-neubrutalism-hover)',
			'neu-inset': 'inset 2px 2px 0px 0px var(--shadow-neubrutalism-hover)'
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
