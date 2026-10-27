import type { ThemeDefinitionType } from "../themeDefinition.type";

// Backlog : indigo, titres ronds, grands arrondis. Ses variables (--bl-*, variables.scss du projet)
// reprennent ces couleurs, et ajoutent les nuances qui lui sont propres
export const backlogTheme: ThemeDefinitionType = {
	shared: {
		fontFamilyPrimary:
			'"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
		fontFamilySecondary: '"Nunito", system-ui, sans-serif',
		fontWeightDisplay: "900",
		letterSpacingDisplay: "0.01em",
		textTransformDisplay: "none",
		radiusL: "2.2rem",
		cornerCut: "0rem",
	},
	colors: {
		light: {
			colorBackground: "#f3f4f7",
			colorSurface: "#ffffff",
			colorSurfaceRaised: "#ffffff",
			colorSurfaceSunken: "#f8f9fb",
			colorOverlay: "rgb(16 24 40 / 42%)",
			colorBorder: "#d0d5dd",
			colorBorderSoft: "#e4e7ec",
			colorText: "#111827",
			colorTextMuted: "#4a5465",
			colorTextSubtle: "#667085",
			colorPrimaryHue: "#5b5bd6",
			colorPrimaryStrong: "#4d4cc9",
			colorPrimarySubtle: "#f0f0fe",
			colorPrimaryContent: "#ffffff",
			colorDestructiveHue: "#d92d20",
			colorDestructiveStrong: "#b42318",
			colorDestructiveSubtle: "#fef3f2",
			colorConstructiveHue: "#17b26a",
			colorConstructiveStrong: "#067647",
			colorConstructiveSubtle: "#ecfdf3",
			colorDecoration1: "#8b5cf6",
			colorDecoration2: "#2dd4bf",
			colorDecoration3: "#60a5fa",
			colorDecoration4: "#d946ef",
		},
		dark: {
			colorBackground: "#0b0d11",
			colorSurface: "#111419",
			colorSurfaceRaised: "#191d25",
			colorSurfaceSunken: "#161a21",
			colorOverlay: "rgb(3 5 9 / 68%)",
			colorBorder: "#323946",
			colorBorderSoft: "#242a34",
			colorText: "#eceef3",
			colorTextMuted: "#b4bac6",
			colorTextSubtle: "#8c94a3",
			colorPrimaryHue: "#6e6ae8",
			colorPrimaryStrong: "#7f7cf0",
			colorPrimarySubtle: "#1c1c38",
			colorPrimaryContent: "#ffffff",
			colorDestructiveHue: "#f04438",
			colorDestructiveStrong: "#f97066",
			colorDestructiveSubtle: "#2a1517",
			colorConstructiveHue: "#17b26a",
			colorConstructiveStrong: "#75e0a7",
			colorConstructiveSubtle: "#0f2219",
			colorDecoration1: "#6d28d9",
			colorDecoration2: "#14b8a6",
			colorDecoration3: "#3b82f6",
			colorDecoration4: "#c026d3",
		},
	},
	// Son ambiance : tout en Nunito, et un vert vif à la place de l'indigo
	ambiance: {
		shared: {
			fontFamilyPrimary: '"Nunito", system-ui, sans-serif',
		},
		colors: {
			light: {
				colorPrimaryHue: "#0f9d58",
				colorPrimaryContent: "#ffffff",
			},
			dark: {
				colorPrimaryHue: "#3ddc84",
				colorPrimaryContent: "#04210f",
			},
		},
	},
};
