import { defaultTheme } from "@citadel/design-system/src/theme/defaultTheme";
import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";

// Les composants du design-system (confirmation, notifications) prennent les couleurs de
// la console : chaque valeur renvoie à une variable de styles/global.scss, qui change
// seule entre clair et sombre
export const adminTheme: ThemeType = {
	...defaultTheme,
	colorBackground: "var(--bg)",
	colorSurface: "var(--surface-2)",
	colorSurfaceRaised: "var(--surface)",
	colorSurfaceSunken: "var(--surface-2)",
	colorOverlay: "var(--overlay)",
	colorBorder: "var(--border-strong)",
	colorBorderSoft: "var(--border)",
	colorText: "var(--text)",
	colorTextMuted: "var(--text-muted)",
	colorTextSubtle: "var(--text-subtle)",
	colorPrimaryHue: "var(--accent)",
	colorPrimarySubtle: "var(--accent-subtle)",
	colorPrimaryContent: "#ffffff",
	colorDestructiveHue: "var(--danger)",
	colorDestructiveSubtle: "var(--danger-subtle)",
	colorDestructiveContent: "#ffffff",
	colorConstructiveHue: "var(--ok)",
	colorConstructiveSubtle: "var(--ok-subtle)",
	fontFamilyPrimary: "var(--font)",
	fontFamilySecondary: "var(--font)",
	fontFamilyMono: "var(--mono)",
};
