import type { ThemeDefinitionType } from "../themeDefinition.type";

// Angers Irigo : la carte et les couleurs des lignes, titres de signalétique, formes en pastille
export const angersIrigoTheme: ThemeDefinitionType = {
	fontStylesheet:
		"https://fonts.googleapis.com/css2?family=Overpass:wght@300..900&display=swap",
	shared: {
		fontFamilyPrimary:
			'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
		fontFamilySecondary: '"Overpass", system-ui, sans-serif',
		fontWeightDisplay: "800",
		letterSpacingDisplay: "0em",
		textTransformDisplay: "none",
		radiusL: "999px",
		cornerCut: "0rem",
	},
	colors: {
		light: {
			colorBackground: "#e8ecef",
			colorSurface: "#ffffff",
			colorSurfaceRaised: "#ffffff",
			colorSurfaceSunken: "#f1f4f8",
			colorBorder: "#c3cad1",
			colorBorderSoft: "#0f172a1a",
			colorText: "#1f2933",
			colorTextMuted: "#616e7c",
			colorTextSubtle: "#8a96a3",
			colorPrimaryHue: "#2563eb",
			colorPrimaryStrong: "#1d4ed8",
			colorPrimarySubtle: "#2563eb1f",
			colorPrimaryContent: "#ffffff",
			colorDestructiveHue: "#dc2626",
			colorConstructiveHue: "#16a34a",
			colorDecoration1: "#e30613",
			colorDecoration2: "#009fe3",
			colorDecoration3: "#f39200",
			colorDecoration4: "#c3d600",
		},
		// Anthracite, comme les poteaux d'arrêt
		dark: {
			colorBackground: "#2b3034",
			colorSurface: "#383e43",
			colorSurfaceRaised: "#41484e",
			colorSurfaceSunken: "#24282c",
			colorBorder: "#525a61",
			colorBorderSoft: "#ffffff1f",
			colorText: "#ffffff",
			colorTextMuted: "#c4cacf",
			colorTextSubtle: "#939ca4",
			colorPrimaryHue: "#60a5fa",
			colorPrimaryStrong: "#93c5fd",
			colorPrimarySubtle: "#60a5fa2e",
			colorPrimaryContent: "#0b1a2e",
			colorDestructiveHue: "#f87171",
			colorConstructiveHue: "#22c55e",
			colorDecoration1: "#e30613",
			colorDecoration2: "#009fe3",
			colorDecoration3: "#f39200",
			colorDecoration4: "#94499a",
		},
	},
	// Son ambiance : tout en Overpass ; en sombre, le jaune vif à la place du bleu, en clair l'indigo de la ligne A
	ambiance: {
		shared: {
			fontFamilyPrimary: '"Overpass", system-ui, sans-serif',
		},
		colors: {
			light: {
				colorPrimaryHue: "#312783",
				colorPrimaryContent: "#ffffff",
			},
			dark: {
				colorPrimaryHue: "#ffe600",
				colorPrimaryContent: "#1d1d1b",
			},
		},
	},
};
