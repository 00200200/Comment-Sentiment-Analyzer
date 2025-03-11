/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				main: '#f8fafc', 
				primary: '#3b82f6',
				secondary: '#1d4ed8',
				border: '#cbd5e1', 
			},
		},
	},
	plugins: [],
};
