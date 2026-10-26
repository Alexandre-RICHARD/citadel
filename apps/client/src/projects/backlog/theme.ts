import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";

/**
 * Thème du design system pour le backlog (toasts, erreurs de zone, squelettes) : ses couleurs reprennent les variables
 * du backlog, posées sur <html>, et suivent donc le thème clair ou sombre du système
 */
export const backlogTheme: Partial<ThemeType> = {
	colorBackground: "var(--bl-bg)",
	colorSurface: "var(--bl-surface)",
	colorSurfaceRaised: "var(--bl-surface-raised)",
	colorSurfaceSunken: "var(--bl-surface-2)",
	colorOverlay: "var(--bl-overlay)",
	colorBorder: "var(--bl-border-strong)",
	colorBorderSoft: "var(--bl-border)",
	colorText: "var(--bl-text)",
	colorTextMuted: "var(--bl-text-muted)",
	colorTextSubtle: "var(--bl-text-subtle)",
	colorPrimaryHue: "var(--bl-accent)",
	colorPrimaryStrong: "var(--bl-accent-hover)",
	colorPrimarySubtle: "var(--bl-accent-subtle)",
	colorPrimaryContent: "var(--bl-accent-contrast)",
	colorDestructiveHue: "var(--bl-danger)",
	colorDestructiveStrong: "var(--bl-danger-hover)",
	colorDestructiveSubtle: "var(--bl-danger-subtle)",
	colorConstructiveHue: "var(--bl-success)",
	colorConstructiveStrong: "var(--bl-success-text)",
	colorConstructiveSubtle: "var(--bl-success-subtle)",
	fontFamilyPrimary:
		'"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
};
