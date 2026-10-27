import type { ThemeColorsType } from "./themeColors.type";

// Base sombre des thèmes des projets (resolveTheme) : un projet n'y surcharge que ce qui fait son identité.
// En sombre, « Strong » est la version plus claire, celle qui ressort sur le fond
export const defaultDarkColors: ThemeColorsType = {
	// Fonds et surfaces
	colorBackground: "#0f1115",
	colorSurface: "#171a20",
	colorSurfaceRaised: "#1f232b",
	colorSurfaceSunken: "#0b0d10",
	colorOverlay: "#000000b3",
	// Bordures
	colorBorder: "#3a404b",
	colorBorderSoft: "#262b33",
	// Textes
	colorText: "#eef0f3",
	colorTextMuted: "#b3b9c4",
	colorTextSubtle: "#808896",
	// Intentions
	colorPrimaryHue: "#5b9cf0",
	colorPrimaryStrong: "#8dbbf6",
	colorPrimarySubtle: "#5b9cf02e",
	colorPrimaryContent: "#0b1626",
	colorSecondaryHue: "#8a919d",
	colorSecondaryStrong: "#d4d8de",
	colorSecondarySubtle: "#8a919d26",
	colorSecondaryContent: "#0f1115",
	colorAccentHue: "#5aa2ff",
	colorAccentStrong: "#a5ccff",
	colorAccentSubtle: "#5aa2ff2e",
	colorAccentContent: "#06152a",
	colorDestructiveHue: "#ff5a50",
	colorDestructiveStrong: "#ff8a82",
	colorDestructiveSubtle: "#ff5a5029",
	colorDestructiveContent: "#1f0705",
	colorConstructiveHue: "#7fd649",
	colorConstructiveStrong: "#b4ec8f",
	colorConstructiveSubtle: "#7fd64929",
	colorConstructiveContent: "#0d1f04",
	// Décoration
	colorDecoration1: "#5b9cf0",
	colorDecoration2: "#a77bf0",
	colorDecoration3: "#3cc7b4",
	colorDecoration4: "#f59a52",
};
