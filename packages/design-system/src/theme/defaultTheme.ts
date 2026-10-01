import type { ThemeType } from "./theme.type";

// Valeurs reprises du thème de la réserve (todo_folder/theme.scss). Tailles en rem : 1rem = 10px
export const defaultTheme: ThemeType = {
	// Fonds et surfaces
	colorBackground: "#fefefe",
	colorSurface: "#fefefe",
	colorSurfaceRaised: "#e3e3e3",
	colorSurfaceSunken: "#f2f2f2",
	colorOverlay: "#5a5a5ab3",
	// Bordures
	colorBorder: "#787878",
	colorBorderSoft: "#e3e3e3",
	// Textes
	colorText: "#0c0c0c",
	colorTextMuted: "#4d4d4d",
	colorTextSubtle: "#787878",
	// Intentions
	colorPrimaryHue: "#327fdc",
	colorPrimaryStrong: "#10325b",
	colorPrimarySubtle: "#d8e6f8",
	colorPrimaryContent: "#fefefe",
	colorSecondaryHue: "#787878",
	colorSecondaryStrong: "#262626",
	colorSecondarySubtle: "#e3e3e3",
	colorSecondaryContent: "#fefefe",
	colorAccentHue: "#388eff",
	colorAccentStrong: "#001b3d",
	colorAccentSubtle: "#d6e8ff",
	colorAccentContent: "#fefefe",
	colorDestructiveHue: "#ff4136",
	colorDestructiveStrong: "#ff554d",
	colorDestructiveSubtle: "#ffeceb",
	colorDestructiveContent: "#fefefe",
	colorConstructiveHue: "#72d12e",
	colorConstructiveStrong: "#2e5412",
	colorConstructiveSubtle: "#e3f6d5",
	colorConstructiveContent: "#fefefe",
	// Polices
	fontFamilyPrimary: '"Roboto", sans-serif',
	fontFamilySecondary: '"Roboto", sans-serif',
	fontFamilyMono: "monospace",
	// Tailles de police
	fontSizeXXS: "1rem",
	fontSizeXS: "1.2rem",
	fontSizeS: "1.4rem",
	fontSizeM: "1.6rem",
	fontSizeL: "2rem",
	fontSizeXL: "2.4rem",
	// Espacements
	spaceXXS: "0.2rem",
	spaceXS: "0.4rem",
	spaceS: "0.8rem",
	spaceM: "1.2rem",
	spaceL: "1.6rem",
	spaceXL: "2rem",
	spaceXXL: "2.4rem",
	// Arrondis
	radiusS: "0.4rem",
	radiusM: "0.8rem",
	radiusL: "1.2rem",
	radiusFull: "999px",
};
