import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";

import type { AmbianceFonts } from "./ambianceFonts.type";

export function pickAmbianceFonts({
	fontFamilyPrimary,
	fontFamilySecondary,
	textTransformDisplay,
}: ThemeType): AmbianceFonts {
	return { fontFamilyPrimary, fontFamilySecondary, textTransformDisplay };
}
