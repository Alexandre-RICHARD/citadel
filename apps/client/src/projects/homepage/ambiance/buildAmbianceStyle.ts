import type { CssVariableName } from "@citadel/design-system/src/theme/cssVariableName.type";
import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";
import type { CSSProperties } from "react";

import type { AmbianceFonts } from "./ambianceFonts.type";

// Les variables --ambiance-* du Layout : couleurs et formes du thème (elles glissent en durationSeconds),
// polices déjà affichées (elles changent pendant le fondu)
export function buildAmbianceStyle(
	theme: ThemeType,
	fonts: AmbianceFonts,
	durationSeconds: number,
): CSSProperties {
	const variables: Record<CssVariableName, string> = {
		"--ambiance-background": theme.colorBackground,
		"--ambiance-surface": theme.colorSurface,
		"--ambiance-border": theme.colorBorder,
		"--ambiance-text": theme.colorText,
		"--ambiance-textMuted": theme.colorTextMuted,
		"--ambiance-accent": theme.colorPrimaryHue,
		"--ambiance-accentContent": theme.colorPrimaryContent,
		"--ambiance-decoration1": theme.colorDecoration1,
		"--ambiance-decoration2": theme.colorDecoration2,
		"--ambiance-decoration3": theme.colorDecoration3,
		"--ambiance-decoration4": theme.colorDecoration4,
		"--ambiance-radius": theme.radiusL,
		"--ambiance-cut": theme.cornerCut,
		"--ambiance-fontWeight": theme.fontWeightDisplay,
		// En em dans le thème, en nombre ici (ambianceProperties.scss)
		"--ambiance-letterSpacing": String(
			parseFloat(theme.letterSpacingDisplay) || 0,
		),
		"--ambiance-fontBody": fonts.fontFamilyPrimary,
		"--ambiance-fontDisplay": fonts.fontFamilySecondary,
		"--ambiance-textTransform": fonts.textTransformDisplay,
		"--ambiance-duration": `${durationSeconds}s`,
	};
	return variables;
}
