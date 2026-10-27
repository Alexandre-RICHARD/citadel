import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";

// Ce qui change pendant le fondu des polices (useReskin), plutôt qu'en glissant comme les couleurs
export type AmbianceFonts = Pick<
	ThemeType,
	"fontFamilyPrimary" | "fontFamilySecondary" | "textTransformDisplay"
>;
