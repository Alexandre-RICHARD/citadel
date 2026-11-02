// Les couleurs du thème Citadel (design-system, projectThemes/citadelTheme.ts), figées ici : un mail n'a pas de
// variables CSS, et le serveur ne dépend pas du design system
export const MAIL_COLORS = {
	light: {
		page: "#f5f1ea",
		surface: "#ffffff",
		panel: "#faf7f2",
		track: "#ece6dc",
		border: "#e8e2ef",
		text: "#18142b",
		muted: "#5a5476",
		subtle: "#7d779a",
	},
	dark: {
		page: "#0b0915",
		surface: "#1d1933",
		panel: "#262042",
		track: "#2a2547",
		border: "#2a2547",
		text: "#f6f3ff",
		muted: "#b9b2d9",
		subtle: "#8a83ad",
	},
	// L'en-tête reste sombre dans les deux modes, comme la homepage
	hero: {
		background: "#100d1c",
		border: "rgba(255,255,255,0.18)",
		pill: "rgba(255,255,255,0.07)",
		text: "#ffffff",
		muted: "#c9c2e6",
		glowTopLeft: "#7b2ff7",
		glowBottomRight: "#00b8f0",
	},
	// Les quatre couleurs de décoration, du filet sous l'en-tête et du pied
	spectrum: ["#7b2ff7", "#f107a3", "#00b8f0", "#ffa06b"],
	// Le dégradé du badge « A », celui des décorations en clair
	badge: ["#9b6bff", "#ff4fb5", "#ffa06b"],
	constructive: {
		strong: "#2e5412",
		subtle: "#e3f6d5",
		dark: { strong: "#b4ec8f", subtle: "#24331f" },
	},
};
