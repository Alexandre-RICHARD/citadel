import type { ThemeDefinitionType } from "../themeDefinition.type";

// Game Death Counter : noir et braise, or des Souls, titres gravés, aucun arrondi
export const gameDeathCounterTheme: ThemeDefinitionType = {
	// EB Garamond ne sert qu'à son ambiance : le navigateur ne télécharge une police que si elle s'affiche
	fontStylesheet:
		"https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=EB+Garamond:ital,wght@0,400..700;1,400..700&family=Inter:wght@400..700&family=JetBrains+Mono:wght@500;600&display=swap",
	shared: {
		fontFamilyPrimary: '"Inter", system-ui, sans-serif',
		fontFamilySecondary: '"Cinzel", serif',
		fontFamilyMono: '"JetBrains Mono", monospace',
		fontWeightDisplay: "700",
		letterSpacingDisplay: "0.1em",
		textTransformDisplay: "uppercase",
		radiusL: "0rem",
		cornerCut: "0rem",
	},
	colors: {
		// Un parchemin à la lueur de la braise
		light: {
			colorBackground: "#f2ebe0",
			colorSurface: "#fffaf3",
			colorSurfaceRaised: "#ffffff",
			colorSurfaceSunken: "#e9e0d2",
			colorBorder: "#d6c6b0",
			colorBorderSoft: "#e4d8c7",
			colorText: "#21160f",
			colorTextMuted: "#6e5a49",
			colorTextSubtle: "#8f7b69",
			colorPrimaryHue: "#8a6a12",
			colorPrimaryStrong: "#6b5108",
			colorPrimarySubtle: "#8a6a1226",
			colorPrimaryContent: "#fffaf0",
			colorAccentHue: "#c2410c",
			colorAccentStrong: "#9a3412",
			colorAccentSubtle: "#c2410c24",
			colorDestructiveHue: "#b4283b",
			colorDestructiveStrong: "#8f1d2e",
			colorDecoration1: "#f97316",
			colorDecoration2: "#fbbf24",
			colorDecoration3: "#dc2626",
			colorDecoration4: "#fdba74",
		},
		dark: {
			colorBackground: "#0b0b0e",
			colorSurface: "#17151a",
			colorSurfaceRaised: "#1e1b21",
			colorSurfaceSunken: "#121014",
			colorBorder: "#2c2830",
			colorBorderSoft: "#221f26",
			colorText: "#ece5d6",
			colorTextMuted: "#948d94",
			colorTextSubtle: "#6b656c",
			colorPrimaryHue: "#c9a227",
			colorPrimaryStrong: "#e6c34a",
			colorPrimarySubtle: "#c9a22724",
			colorPrimaryContent: "#1a1206",
			colorAccentHue: "#c1531f",
			colorAccentStrong: "#ff7a3d",
			colorAccentSubtle: "#c1531f29",
			colorDestructiveHue: "#9c3140",
			colorDestructiveStrong: "#c2495a",
			colorDecoration1: "#e8510a",
			colorDecoration2: "#f59e0b",
			colorDecoration3: "#9f1d0b",
			colorDecoration4: "#ffbe55",
		},
	},
	// Son ambiance : un texte en Garamond, et l'orange de la braise à la place de l'or
	ambiance: {
		shared: {
			fontFamilyPrimary: '"EB Garamond", serif',
		},
		colors: {
			light: {
				colorPrimaryHue: "#c2410c",
				colorPrimaryContent: "#ffffff",
			},
			dark: {
				colorPrimaryHue: "#ff7a1a",
				colorPrimaryContent: "#1a0b02",
			},
		},
	},
};
